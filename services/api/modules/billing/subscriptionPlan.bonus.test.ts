// Bundles that include Gini or Journal grant the same 100,000 AI-token bonus
// as buying that product's Pro on its own (decided 2026-10-05; before that,
// bundles skipped it). The bonus is keyed on the auth id and payment id.
import { describe, it, expect, vi, beforeEach } from "vitest";

const ok = () => vi.fn(async () => ({ data: null, error: null }));
const grantGiniProTokens = vi.fn(async () => {});
const grantJournalProTokens = vi.fn(async () => {});

// Nothing here may touch a real database: CI has no Supabase env vars.
vi.mock("../../supabase/index.js", () => ({ default: {} }));
vi.mock("./subscriptionPlan.repository.js", () => ({
    getActiveUserSubscriptions: ok(),
    getUserSubscriptionByPlan: ok(),
    upsertUserSubscription: vi.fn(async (row) => ({ data: row, error: null })),
}));
vi.mock("../algos/algorithm.repository.js", () => ({
    getActiveAlgorithmSubscriptionsForUser: ok(),
    getAlgorithmSubscriptionsByUserId: ok(),
    upsertAlgorithmSubscription: ok(),
}));
vi.mock("../academy/learnPlan.repository.js", () => ({ getLearnPlanByUserId: ok(), getLearnPlansForUser: ok(), upsertLearnPlan: ok() }));
vi.mock("../newsletter/newsletterPlan.repository.js", () => ({ getNewsletterPlanByUserId: ok(), getNewsletterPlansForUser: ok(), upsertNewsletterPlan: ok() }));
vi.mock("../auth/entitlement.repository.js", () => ({ upsertEntitlement: vi.fn(async () => {}) }));
vi.mock("../gini/proPlan.repository.js", () => ({ getProPlanByUser: ok(), upsertProPlan: ok() }));
vi.mock("../gini/planTier.js", () => ({ invalidateGiniPlanTierCache: vi.fn() }));
vi.mock("../gini/proPlan.controller.js", () => ({ grantProIncludedTokens: grantGiniProTokens }));
vi.mock("../journal/proPlan.repository.js", () => ({ getProPlanByUser: ok(), upsertProPlan: ok() }));
vi.mock("../journal/planTier.js", () => ({ invalidatePlanTierCache: vi.fn() }));
vi.mock("../journal/proPlan.controller.js", () => ({ grantProIncludedTokens: grantJournalProTokens }));
vi.mock("../fundakamental/razorpay.repository.js", () => ({ getUserPlan: ok(), grantPro: ok() }));

const { fulfillBundle } = await import("./subscriptionPlan.controller.js");
const { PRESET_BUNDLES } = await import("./bundleCatalog.js");

const buy = (planId: string, products = "") =>
    fulfillBundle({
        order: { id: "order_1", amount: PRESET_BUNDLES[planId].monthly * 100, currency: "INR", notes: {} },
        payment: { id: "pay_1" },
        notes: { plan_id: planId, billing_cycle: "monthly", products },
        user: { userId: "user-1", authId: "auth-1", email: "a@b.c" },
        extras: {},
    } as any);

describe("bundle AI-token bonus", () => {
    beforeEach(() => vi.clearAllMocks());

    it("Ultimate pass grants both the Gini and Journal bonus", async () => {
        await buy("ultimate-pass");
        expect(grantGiniProTokens).toHaveBeenCalledWith("auth-1", "pay_1", "order_1");
        expect(grantJournalProTokens).toHaveBeenCalledWith("auth-1", "pay_1", "order_1");
    });

    it("a bundle with only Gini grants only the Gini bonus", async () => {
        await buy("ai-investor");
        expect(grantGiniProTokens).toHaveBeenCalledTimes(1);
        expect(grantJournalProTokens).not.toHaveBeenCalled();
    });

    it("a bundle with only Journal grants only the Journal bonus", async () => {
        await buy("quant-pack");
        expect(grantJournalProTokens).toHaveBeenCalledTimes(1);
        expect(grantGiniProTokens).not.toHaveBeenCalled();
    });
});

describe("3-month Ultimate (free-access coupon only)", () => {
    const quarterly = { plan_id: "ultimate-pass", plan_name: "Xtin Ultimate All-Access Pass", billing_cycle: "quarterly" };
    const grant = (order: { id: string; amount: number }, notes: Record<string, string>) =>
        fulfillBundle({
            order: { ...order, currency: "INR", notes },
            payment: { id: order.id },
            notes,
            user: { userId: "user-1", authId: "auth-1", email: "a@b.c" },
            extras: {},
        } as any);

    beforeEach(() => vi.clearAllMocks());

    it("grants everything for 3 months on a free coupon order", async () => {
        const before = Date.now();
        const sub: any = await grant({ id: "coupon_abc", amount: 0 }, { ...quarterly, coupon_code: "ALL3M" });
        expect(sub).toMatchObject({ plan_id: "ultimate-pass", billing_cycle: "quarterly", amount: 0 });
        const months = (new Date(sub.valid_until).getTime() - before) / (30 * 24 * 60 * 60 * 1000);
        expect(months).toBeGreaterThan(2.9);
        expect(months).toBeLessThan(3.1);
        expect(grantGiniProTokens).toHaveBeenCalledWith("auth-1", "coupon_abc", "coupon_abc");
        expect(grantJournalProTokens).toHaveBeenCalledWith("auth-1", "coupon_abc", "coupon_abc");
    });

    it("can't be bought: a Razorpay order for it is rejected", async () => {
        await expect(grant({ id: "order_1", amount: 100 }, { ...quarterly, coupon_code: "ALL3M" })).rejects.toMatchObject({ code: "invalid_order" });
        await expect(grant({ id: "order_1", amount: 0 }, quarterly)).rejects.toMatchObject({ code: "invalid_order" });
    });

    it("needs a coupon on the free order", async () => {
        await expect(grant({ id: "coupon_abc", amount: 0 }, quarterly)).rejects.toMatchObject({ code: "invalid_order" });
    });
});
