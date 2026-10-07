// The Dashboard's plan list must include Pro plans bought on a product's own
// pricing page or granted by a coupon (each lives in its own table), not only
// bundles — otherwise a paid Gini/Journal/FundaKaMental/Backtest plan is invisible.
import { describe, it, expect, vi } from "vitest";

const row = (data: unknown) => vi.fn(async () => ({ data, error: null }));
const future = new Date(Date.now() + 30 * 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

vi.mock("../../supabase/index.js", () => ({ default: {} }));
vi.mock("../gini/proPlan.repository.js", () => ({ getProPlanByUser: row({ plan_id: "pro_yearly", valid_until: future }), upsertProPlan: vi.fn() }));
vi.mock("../journal/proPlan.repository.js", () => ({ getProPlanByUser: row({ plan_id: "journal_pro_monthly", valid_until: past }), upsertProPlan: vi.fn() }));
vi.mock("../fundakamental/razorpay.repository.js", () => ({ getUserPlan: row({ plan: "premium", plan_valid_until: future }), grantPro: vi.fn() }));
vi.mock("../backtest/repository.js", () => ({
    getProPlan: vi.fn(async () => {
        throw new Error("relation does not exist");
    }),
}));
vi.mock("../gini/planTier.js", () => ({ invalidateGiniPlanTierCache: vi.fn() }));
vi.mock("../gini/proPlan.controller.js", () => ({ grantProIncludedTokens: vi.fn() }));
vi.mock("../journal/planTier.js", () => ({ invalidatePlanTierCache: vi.fn() }));
vi.mock("../journal/proPlan.controller.js", () => ({ grantProIncludedTokens: vi.fn() }));

const { getActiveProductPlans } = await import("./subscriptionPlan.controller.js");

describe("getActiveProductPlans", () => {
    it("lists active per-product Pro plans, drops expired ones, and survives an unreadable table", async () => {
        const plans = await getActiveProductPlans("auth-1");
        expect(plans.map((p) => [p.product, p.plan_name])).toEqual([
            ["gini", "Gini Pro (yearly)"],
            ["fundakamental", "FundaKaMental Pro"],
        ]);
    });

    it("returns nothing without an auth id", async () => {
        expect(await getActiveProductPlans(null)).toEqual([]);
    });
});
