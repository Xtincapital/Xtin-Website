import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({
    readGini: vi.fn(),
    readAppState: vi.fn(),
    writeAppState: vi.fn(),
    readTradesSince: vi.fn(),
    readLearnProgress: vi.fn(),
    readTokenBalance: vi.fn(),
}));
vi.mock("./dashboard.repository.js", () => repo);

import { getMoneySummary, updateMoneyProfile } from "./dashboard.controller.js";
import { asHistory, asProfile, MAX_HISTORY, mergeProfile, todayInIndia, validateMoneyProfilePatch, withSnapshot } from "./moneyProfile.js";

function fakeRes() {
    const res: { statusCode: number; body: unknown; status: (c: number) => typeof res; json: (b: unknown) => typeof res } = {
        statusCode: 0,
        body: undefined,
        status(c) {
            this.statusCode = c;
            return this;
        },
        json(b) {
            this.body = b;
            return this;
        },
    };
    return res;
}

const req = (body?: unknown) => ({ user: { authId: "auth-1", userId: "legacy-1" }, body });

describe("money profile", () => {
    it("accepts amounts, ₹0 and clearing a field", () => {
        expect(validateMoneyProfilePatch({ monthlyInvesting: 0, termCover: 20000000, healthCover: null, stepUp: 0.05 }).data).toEqual({
            monthlyInvesting: 0,
            termCover: 20000000,
            healthCover: null,
            stepUp: 0.05,
        });
    });

    it("rejects negatives, strings, other step-ups and unknown fields", () => {
        for (const bad of [{ monthlyInvesting: -1 }, { monthlyExpenses: "5000" }, { stepUp: 0.07 }, { netWorth: 5 }]) {
            expect(validateMoneyProfilePatch(bad).errors).toBeTruthy();
        }
    });

    it("merges only the fields sent", () => {
        const first = mergeProfile(null, { monthlyInvesting: 40000 }, new Date("2026-10-01T00:00:00Z"));
        const second = mergeProfile(first, { termCover: 10000000 }, new Date("2026-10-02T00:00:00Z"));
        expect(second).toEqual({
            monthlyInvesting: 40000,
            stepUp: 0,
            monthlyExpenses: null,
            termCover: 10000000,
            healthCover: null,
            updatedAt: "2026-10-02T00:00:00.000Z",
        });
    });

    it("reads stored junk safely", () => {
        expect(asProfile(undefined)).toBeNull();
        expect(asProfile({ monthlyInvesting: "lots", stepUp: 3 })).toMatchObject({ monthlyInvesting: null, stepUp: 0 });
    });
});

describe("net worth history", () => {
    it("keeps one point per month, latest wins, oldest first", () => {
        const h1 = withSnapshot([], { month: "2026-10", assets: 100, liabilities: 10 });
        expect(h1.changed).toBe(true);
        const h2 = withSnapshot(h1.history, { month: "2026-10", assets: 100, liabilities: 10 });
        expect(h2.changed).toBe(false);
        const h3 = withSnapshot(h2.history, { month: "2026-10", assets: 120, liabilities: 10 });
        expect(h3.history).toEqual([{ month: "2026-10", assets: 120, liabilities: 10 }]);
        const h4 = withSnapshot(asHistory([{ month: "2026-11", assets: 1, liabilities: 0 }, { month: "bad" }]), { month: "2026-09", assets: 2, liabilities: 0 });
        expect(h4.history.map((p) => p.month)).toEqual(["2026-09", "2026-11"]);
    });

    it("caps the history length", () => {
        let history = [] as ReturnType<typeof asHistory>;
        for (let i = 0; i < MAX_HISTORY + 5; i++) {
            const month = `${2000 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
            history = withSnapshot(history, { month, assets: i, liabilities: 0 }).history;
        }
        expect(history).toHaveLength(MAX_HISTORY);
        expect(history[0].assets).toBe(5);
    });

    it("uses the Indian date", () => {
        expect(todayInIndia(new Date("2026-10-31T20:00:00Z"))).toBe("2026-11-01");
    });
});

describe("GET /dashboard/money", () => {
    beforeEach(() => {
        for (const fn of Object.values(repo)) fn.mockReset();
        repo.readGini.mockResolvedValue({ members: [], assets: [{ value: 500 }], liabilities: [{ amount: 100 }], goals: [] });
        repo.readAppState.mockResolvedValue({ money: { monthlyInvesting: 25000 }, other: "kept" });
        repo.readTradesSince.mockResolvedValue([{ id: "t", date: "2026-10-02", pnl: 50 }]);
        repo.readLearnProgress.mockResolvedValue([{ module_slug: "personal-finance", completed: 3, last_completed_at: null }]);
        repo.readTokenBalance.mockImplementation(async (table: string) => (table === "gini_ai_wallets" ? 84000 : null));
        repo.writeAppState.mockResolvedValue(undefined);
    });

    it("returns every part and records this month's net worth without touching other app state", async () => {
        const res = fakeRes();
        await getMoneySummary(req(), res);
        expect(res.statusCode).toBe(200);
        const body = res.body as Record<string, unknown>;
        expect(body.profile).toMatchObject({ monthlyInvesting: 25000 });
        expect(body.tokens).toEqual({ gini: 84000, journal: null });
        expect(body.netWorthHistory).toEqual([{ month: todayInIndia().slice(0, 7), assets: 500, liabilities: 100 }]);
        expect(repo.readLearnProgress).toHaveBeenCalledWith("legacy-1");
        expect(repo.writeAppState).toHaveBeenCalledWith("auth-1", expect.objectContaining({ other: "kept", money: { monthlyInvesting: 25000 } }));
    });

    it("returns the rest when one part fails, and never writes app state it couldn't read", async () => {
        repo.readAppState.mockRejectedValue(new Error("down"));
        repo.readTradesSince.mockRejectedValue(new Error("down"));
        const res = fakeRes();
        await getMoneySummary(req(), res);
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ profile: null, trades: null, netWorthHistory: [] });
        expect(repo.writeAppState).not.toHaveBeenCalled();
    });
});

describe("PUT /dashboard/money/profile", () => {
    beforeEach(() => {
        for (const fn of Object.values(repo)) fn.mockReset();
        repo.readAppState.mockResolvedValue({ netWorthHistory: [{ month: "2026-10", assets: 1, liabilities: 0 }] });
        repo.writeAppState.mockResolvedValue(undefined);
    });

    it("saves a valid patch next to the history", async () => {
        const res = fakeRes();
        await updateMoneyProfile(req({ monthlyExpenses: 60000 }), res);
        expect(res.statusCode).toBe(200);
        expect(repo.writeAppState).toHaveBeenCalledWith(
            "auth-1",
            expect.objectContaining({ netWorthHistory: [{ month: "2026-10", assets: 1, liabilities: 0 }], money: expect.objectContaining({ monthlyExpenses: 60000 }) }),
        );
    });

    it("refuses a bad patch without writing", async () => {
        const res = fakeRes();
        await updateMoneyProfile(req({ monthlyExpenses: -5 }), res);
        expect(res.statusCode).toBe(400);
        expect(repo.writeAppState).not.toHaveBeenCalled();
    });
});
