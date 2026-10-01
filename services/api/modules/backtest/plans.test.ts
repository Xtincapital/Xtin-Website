import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const repo = vi.hoisted(() => ({
    getAccountCreatedAt: vi.fn(),
    getProPlan: vi.fn(),
    getUsage: vi.fn(),
    consumeUsage: vi.fn(),
}));
vi.mock("./repository.js", () => repo);

import { _resetAnon, anonConsume, consumeAllowance, invalidateEntitlementCache, limits, paywallReply, planStatus, usageFor } from "./plans.js";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

beforeEach(() => {
    vi.clearAllMocks();
    _resetAnon();
    invalidateEntitlementCache("u1");
    repo.getProPlan.mockResolvedValue(null);
    repo.getAccountCreatedAt.mockResolvedValue(hoursAgo(1000));
    repo.getUsage.mockResolvedValue(0);
});
afterEach(() => {
    delete process.env.BACKTEST_ANON_PER_DAY;
    delete process.env.BACKTEST_ANON_GLOBAL_PER_DAY;
    delete process.env.BACKTEST_FREE_PER_MONTH;
    delete process.env.BACKTEST_TRIAL_HOURS;
});

describe("limits", () => {
    it("defaults to 5/day anon, 25/month free, 24h trial and honours env overrides", () => {
        expect(limits()).toMatchObject({ anonPerDay: 5, freePerMonth: 25, trialHours: 24 });
        process.env.BACKTEST_FREE_PER_MONTH = "40";
        process.env.BACKTEST_TRIAL_HOURS = "0";
        expect(limits()).toMatchObject({ freePerMonth: 40, trialHours: 0 });
    });
});

describe("anonymous allowance", () => {
    it("is counted per IP and runs out at the daily limit", async () => {
        for (let i = 0; i < 5; i++) {
            const u = await usageFor(null, "1.1.1.1");
            expect(u).toMatchObject({ tier: "anon", remaining: 5 - i, limit: 5, window: "day" });
            await consumeAllowance(null, "1.1.1.1", u);
        }
        expect((await usageFor(null, "1.1.1.1")).remaining).toBe(0);
        expect((await usageFor(null, "2.2.2.2")).remaining).toBe(5); // other visitors unaffected
    });

    it("also stops at the global anonymous ceiling, whatever the per-IP count", async () => {
        process.env.BACKTEST_ANON_GLOBAL_PER_DAY = "3";
        anonConsume("a");
        anonConsume("b");
        anonConsume("c");
        expect((await usageFor(null, "fresh-ip")).remaining).toBe(0);
    });
});

describe("signed-in tiers", () => {
    it("free users get a monthly allowance from the persistent counter", async () => {
        repo.getAccountCreatedAt.mockResolvedValue(hoursAgo(1000));
        repo.getUsage.mockResolvedValue(20);
        expect(await usageFor("u1", "ip")).toEqual({ tier: "free", remaining: 5, limit: 25, window: "month" });

        repo.consumeUsage.mockResolvedValue(21);
        const after = await consumeAllowance("u1", "ip", await usageFor("u1", "ip"));
        expect(after.remaining).toBe(4);
        expect(repo.consumeUsage).toHaveBeenCalledWith("user:u1", expect.stringMatching(/^\d{4}-\d{2}$/), "chat_backtest");
    });

    it("never goes negative", async () => {
        repo.getUsage.mockResolvedValue(99);
        expect((await usageFor("u1", "ip")).remaining).toBe(0);
    });

    it("an unexpired pass is unlimited", async () => {
        repo.getProPlan.mockResolvedValue({ user_id: "u1", pass_id: "monthly", valid_until: daysAhead(3) });
        expect(await usageFor("u1", "ip")).toEqual({ tier: "pro", remaining: null, limit: null, window: null });
        expect(repo.consumeUsage).not.toHaveBeenCalled();
        const after = await consumeAllowance("u1", "ip", await usageFor("u1", "ip"));
        expect(after.tier).toBe("pro");
        expect(repo.consumeUsage).not.toHaveBeenCalled();
    });

    it("an expired pass falls back to free", async () => {
        repo.getProPlan.mockResolvedValue({ user_id: "u1", pass_id: "event", valid_until: daysAhead(-1) });
        expect((await usageFor("u1", "ip")).tier).toBe("free");
    });

    it("a brand-new account is Pro for the trial window, then free", async () => {
        repo.getAccountCreatedAt.mockResolvedValue(hoursAgo(2));
        expect((await usageFor("u1", "ip")).tier).toBe("pro");
        expect(await planStatus("u1", "ip")).toMatchObject({ tier: "pro", trial: true });

        invalidateEntitlementCache("u1");
        repo.getAccountCreatedAt.mockResolvedValue(hoursAgo(30));
        expect((await usageFor("u1", "ip")).tier).toBe("free");
    });

    it("a trial of 0 hours disables the trial without looking the account up", async () => {
        process.env.BACKTEST_TRIAL_HOURS = "0";
        repo.getAccountCreatedAt.mockResolvedValue(hoursAgo(1));
        expect((await usageFor("u1", "ip")).tier).toBe("free");
        expect(repo.getAccountCreatedAt).not.toHaveBeenCalled();
    });

    it("an unknown account age means no trial rather than a free pass", async () => {
        repo.getAccountCreatedAt.mockResolvedValue(null);
        expect((await usageFor("u1", "ip")).tier).toBe("free");
    });
});

describe("paywallReply", () => {
    it("pitches sign-up to anonymous visitors and a pass to free users", () => {
        expect(paywallReply({ tier: "anon", remaining: 0, limit: 5, window: "day" })).toMatch(/free account/);
        expect(paywallReply({ tier: "free", remaining: 0, limit: 25, window: "month" })).toMatch(/Pro pass/);
    });
});
