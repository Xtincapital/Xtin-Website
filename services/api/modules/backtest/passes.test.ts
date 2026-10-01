import { describe, it, expect, vi, beforeEach } from "vitest";

const repo = vi.hoisted(() => ({ getProPlan: vi.fn(), upsertProPlan: vi.fn() }));
vi.mock("./repository.js", () => ({ ...repo, getAccountCreatedAt: vi.fn(), getUsage: vi.fn(), consumeUsage: vi.fn() }));
vi.mock("../payments/fulfillment.repository.js", () => {
    class FulfillmentTableMissingError extends Error {}
    return { claimFulfillment: vi.fn(), completeFulfillment: vi.fn(), releaseFulfillment: vi.fn(), getFulfillment: vi.fn(), findUserByAuthId: vi.fn(), findUserById: vi.fn(), FulfillmentTableMissingError };
});

import { fulfillBacktestPass, BACKTEST_PRODUCT } from "./passes.controller.js";
import { PASSES } from "./plans.js";
import { FulfillmentError } from "../payments/fulfillment.js";

const DAY = 86_400_000;
const ctx = (passId: string, over: { amount?: number; currency?: string; paymentId?: string; authId?: string | null } = {}) => ({
    order: { id: "order_1", amount: over.amount ?? PASSES[passId]?.amountPaise ?? 1, currency: over.currency ?? "INR", status: "paid" },
    payment: { id: over.paymentId ?? "pay_1", order_id: "order_1", amount: over.amount ?? PASSES[passId]?.amountPaise ?? 1, currency: over.currency ?? "INR", status: "captured" },
    notes: { product: BACKTEST_PRODUCT, pass_id: passId },
    user: { userId: "app-1", authId: over.authId === undefined ? "auth-1" : over.authId, email: "a@b.c" },
    extras: {},
});

beforeEach(() => {
    vi.clearAllMocks();
    repo.getProPlan.mockResolvedValue(null);
    repo.upsertProPlan.mockResolvedValue(undefined);
});

describe("pass catalogue", () => {
    it("matches the published pricing", () => {
        expect(Object.values(PASSES).map((p) => [p.id, p.days, p.amountPaise])).toEqual([
            ["event", 2, 39900],
            ["weekly", 7, 119900],
            ["mini", 15, 199900],
            ["monthly", 30, 329900],
            ["quarter", 90, 799900],
        ]);
    });
});

describe("fulfillBacktestPass", () => {
    it("grants the pass for its length, keyed by the buyer's auth id", async () => {
        const before = Date.now();
        const result = await fulfillBacktestPass(ctx("weekly"));
        const saved = repo.upsertProPlan.mock.calls[0][0];
        expect(saved).toMatchObject({ user_id: "auth-1", pass_id: "weekly", payment_id: "pay_1", order_id: "order_1", amount_paise: 119900, currency: "INR" });
        const until = new Date(saved.valid_until).getTime();
        expect(until).toBeGreaterThanOrEqual(before + 7 * DAY - 1000);
        expect(until).toBeLessThanOrEqual(Date.now() + 7 * DAY + 1000);
        expect(result).toMatchObject({ payment_id: "pay_1", valid_until: saved.valid_until });
    });

    it("stacks a renewal on top of the days still remaining", async () => {
        const existingEnd = new Date(Date.now() + 10 * DAY);
        repo.getProPlan.mockResolvedValue({ user_id: "auth-1", pass_id: "monthly", valid_until: existingEnd.toISOString(), payment_id: "pay_old" });
        await fulfillBacktestPass(ctx("event"));
        expect(new Date(repo.upsertProPlan.mock.calls[0][0].valid_until).getTime()).toBe(existingEnd.getTime() + 2 * DAY);
    });

    it("starts from today when the previous pass has already expired", async () => {
        repo.getProPlan.mockResolvedValue({ user_id: "auth-1", pass_id: "event", valid_until: new Date(Date.now() - 5 * DAY).toISOString(), payment_id: "pay_old" });
        await fulfillBacktestPass(ctx("event"));
        const until = new Date(repo.upsertProPlan.mock.calls[0][0].valid_until).getTime();
        expect(until).toBeGreaterThan(Date.now() + 2 * DAY - 5000);
        expect(until).toBeLessThan(Date.now() + 2 * DAY + 5000);
    });

    it("never adds days twice for a retry of the same payment", async () => {
        const end = new Date(Date.now() + 30 * DAY);
        repo.getProPlan.mockResolvedValue({ user_id: "auth-1", pass_id: "monthly", valid_until: end.toISOString(), payment_id: "pay_1" });
        await fulfillBacktestPass(ctx("monthly", { paymentId: "pay_1" }));
        expect(new Date(repo.upsertProPlan.mock.calls[0][0].valid_until).getTime()).toBe(end.getTime());
    });

    it("rejects a paid amount that doesn't match the catalogue (cheap order, expensive pass)", async () => {
        await expect(fulfillBacktestPass(ctx("quarter", { amount: PASSES.event.amountPaise }))).rejects.toMatchObject({ code: "amount_mismatch" });
        expect(repo.upsertProPlan).not.toHaveBeenCalled();
    });

    it("rejects non-INR orders and unknown passes", async () => {
        await expect(fulfillBacktestPass(ctx("weekly", { currency: "USD" }))).rejects.toMatchObject({ code: "amount_mismatch" });
        await expect(fulfillBacktestPass(ctx("lifetime"))).rejects.toMatchObject({ code: "invalid_order" });
        expect(repo.upsertProPlan).not.toHaveBeenCalled();
    });

    it("refuses a buyer with no auth id", async () => {
        await expect(fulfillBacktestPass(ctx("weekly", { authId: null }))).rejects.toBeInstanceOf(FulfillmentError);
        expect(repo.upsertProPlan).not.toHaveBeenCalled();
    });
});
