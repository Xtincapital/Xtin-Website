// End to end: the "Ultimate (everything) — 3 months" free-access code, from
// the admin creating it to a member's plans being written — and the ways
// someone might try to get more out of it than the code allows. Everything
// real except the database, which is an in-memory stand-in with a little
// latency so requests sent at the same moment really do overlap.
import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
    coupons: new Map<string, any>(),
    redemptions: [] as any[],
    fulfillments: new Map<string, any>(),
    bundles: new Map<string, any>(),
}));
const lag = () => new Promise((r) => setTimeout(r, 5));

vi.mock("../../supabase/index.js", () => ({ default: {} }));
vi.mock("../../middlewares/auth.js", () => ({ authenticate: vi.fn(), requireAdmin: vi.fn() }));
vi.mock("./coupons.repository.js", () => ({
    findCouponByCode: vi.fn(async (code: string) => (await lag(), db.coupons.get(code) || null)),
    countRedemptions: vi.fn(async (id: string) => (await lag(), db.redemptions.filter((r) => r.coupon_id === id).length)),
    countUserRedemptions: vi.fn(async (id: string, u: { userId?: string; authId?: string }) => {
        await lag();
        return db.redemptions.filter((r) => r.coupon_id === id && (r.user_id === u.userId || r.auth_id === u.authId)).length;
    }),
    hasPaidPurchase: vi.fn(async () => false),
    recordRedemption: vi.fn(async (row) => {
        await lag();
        db.redemptions.push(row);
    }),
}));
vi.mock("../payments/fulfillment.repository.js", () => ({
    FulfillmentTableMissingError: class extends Error {},
    claimFulfillment: vi.fn(async (row) => {
        if (db.fulfillments.has(row.order_id)) return { claimed: false, existing: db.fulfillments.get(row.order_id) };
        db.fulfillments.set(row.order_id, { ...row, status: "processing" });
        return { claimed: true };
    }),
    completeFulfillment: vi.fn(async (id: string) => void (db.fulfillments.get(id).status = "fulfilled")),
    releaseFulfillment: vi.fn(async (id: string) => void db.fulfillments.delete(id)),
    getFulfillment: vi.fn(async (id: string) => db.fulfillments.get(id) || null),
    findUserByAuthId: vi.fn(async () => null),
    findUserById: vi.fn(async () => null),
}));
const issueReceipt = vi.hoisted(() => vi.fn(async () => null));
vi.mock("../payments/receipts.js", () => ({ issueReceipt }));

const ok = () => vi.fn(async () => ({ data: null, error: null }));
const plans = vi.hoisted(() => ({
    gini: vi.fn(async () => ({ data: null, error: null })),
    journal: vi.fn(async () => ({ data: null, error: null })),
    algo: vi.fn(async () => ({ data: null, error: null })),
    learn: vi.fn(async () => ({ data: null, error: null })),
    newsletter: vi.fn(async () => ({ data: null, error: null })),
    funda: vi.fn(async () => ({ data: null, error: null })),
}));
vi.mock("../billing/subscriptionPlan.repository.js", () => ({
    getActiveUserSubscriptions: vi.fn(async () => ({ data: [], error: null })),
    getUserSubscriptionByPlan: vi.fn(async (userId: string, planId: string) => ({ data: db.bundles.get(`${userId}|${planId}`) || null, error: null })),
    upsertUserSubscription: vi.fn(async (row) => {
        await lag();
        db.bundles.set(`${row.user_id}|${row.plan_id}`, row);
        return { data: row, error: null };
    }),
}));
vi.mock("../algos/algorithm.repository.js", () => ({
    getActiveAlgorithmSubscriptionsForUser: ok(),
    getAlgorithmSubscriptionsByUserId: ok(),
    upsertAlgorithmSubscription: plans.algo,
}));
vi.mock("../academy/learnPlan.repository.js", () => ({ getLearnPlanByUserId: ok(), getLearnPlansForUser: ok(), upsertLearnPlan: plans.learn }));
vi.mock("../newsletter/newsletterPlan.repository.js", () => ({ getNewsletterPlanByUserId: ok(), getNewsletterPlansForUser: ok(), upsertNewsletterPlan: plans.newsletter }));
vi.mock("../auth/entitlement.repository.js", () => ({ upsertEntitlement: vi.fn(async () => {}) }));
vi.mock("../gini/proPlan.repository.js", () => ({ getProPlanByUser: ok(), upsertProPlan: plans.gini }));
vi.mock("../gini/planTier.js", () => ({ invalidateGiniPlanTierCache: vi.fn() }));
vi.mock("../gini/proPlan.controller.js", () => ({ grantProIncludedTokens: vi.fn(async () => {}) }));
vi.mock("../journal/proPlan.repository.js", () => ({ getProPlanByUser: ok(), upsertProPlan: plans.journal }));
vi.mock("../journal/planTier.js", () => ({ invalidatePlanTierCache: vi.fn() }));
vi.mock("../journal/proPlan.controller.js", () => ({ grantProIncludedTokens: vi.fn(async () => {}) }));
vi.mock("../fundakamental/razorpay.repository.js", () => ({ getUserPlan: ok(), grantPro: plans.funda }));

// Importing the controller registers the bundle fulfiller, as the app does at start-up.
const { createSubscriptionOrder, verifySubscriptionPayment } = await import("../billing/subscriptionPlan.controller.js");
const { parseNewCoupon } = await import("./coupons.routes.js");
const { FREE_ACCESS_PLANS } = await import("./coupons.catalog.js");
const { applyCheckoutCoupon, redeemFreeAccess } = await import("./coupons.service.js");

const member = (n = 1) => ({ userId: `user-${n}`, authId: `auth-${n}`, email: `m${n}@x.com` });
const DAY = 24 * 60 * 60 * 1000;

/** Saves a code the way POST /api/admin/coupons does (with the total-uses limit and end date it must have). */
const createCode = (body: Record<string, unknown> = {}) => {
    const row = parseNewCoupon(
        { code: "ALL3M", kind: "free_access", free_product: "xtin_bundle", free_plan: "ultimate_pass_quarterly", max_redemptions: "100", expires_at: new Date(Date.now() + 30 * DAY).toISOString(), ...body },
        "admin@x.com"
    );
    db.coupons.set(row.code!, { id: `c-${row.code}`, ...row });
    return db.coupons.get(row.code!);
};

const mockRes = () => {
    const res: any = { statusCode: 200, body: null };
    res.status = (s: number) => ((res.statusCode = s), res);
    res.json = (b: unknown) => ((res.body = b), res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
    db.coupons.clear();
    db.redemptions.length = 0;
    db.fulfillments.clear();
    db.bundles.clear();
});

describe("3-month Ultimate code — works", () => {
    it("is offered to admins and saves as a free-access code", () => {
        expect(FREE_ACCESS_PLANS.find((p) => p.plan === "ultimate_pass_quarterly")?.label).toMatch(/everything.*3 months/);
        expect(createCode({ max_redemptions: "50" })).toMatchObject({ kind: "free_access", free_product: "xtin_bundle", free_plan: "ultimate_pass_quarterly", max_redemptions: 50, per_user_limit: 1 });
    });

    it("can't be created without a total-uses limit and an end date", () => {
        expect(() => createCode({ max_redemptions: "" })).toThrow(/Total uses limit and an end date/);
        expect(() => createCode({ expires_at: "" })).toThrow(/Total uses limit and an end date/);
        expect(() => createCode({ max_redemptions: "", expires_at: "" })).toThrow(/Total uses limit and an end date/);
    });

    it("gives a member every product for 3 months, with a ₹0 receipt and a usage record", async () => {
        createCode();
        const before = Date.now();
        const redeemed = await redeemFreeAccess(" all3m ", member());

        expect(redeemed).toMatchObject({ product: "xtin_bundle", label: expect.stringMatching(/3 months/) });
        expect(redeemed.orderId).toMatch(/^coupon_/);

        const sub = db.bundles.get("user-1|ultimate-pass");
        expect(sub).toMatchObject({ plan_id: "ultimate-pass", billing_cycle: "quarterly", amount: 0, products: expect.arrayContaining(["Algo Trading Pro", "Gini AI Advisor Pro", "Fundakamental Pro", "Trade Journal Pro", "Learn Hub All-Access", "Market Newsletter Pro"]) });
        const days = (new Date(sub.valid_until).getTime() - before) / DAY;
        expect(days).toBeGreaterThanOrEqual(89);
        expect(days).toBeLessThanOrEqual(93);

        for (const write of Object.values(plans)) expect(write).toHaveBeenCalledTimes(1);
        expect(issueReceipt).toHaveBeenCalledWith(expect.objectContaining({ order: expect.objectContaining({ amount: 0 }), product: "xtin_bundle" }));
        expect(db.redemptions).toEqual([expect.objectContaining({ code: "ALL3M", user_id: "user-1", paid_amount: 0 })]);
    });

    it("adds 3 months on top of an Ultimate the member already has", async () => {
        createCode();
        const existing = new Date(Date.now() + 10 * DAY);
        db.bundles.set("user-1|ultimate-pass", { plan_id: "ultimate-pass", valid_until: existing.toISOString(), payment_id: "pay_old" });
        await redeemFreeAccess("ALL3M", member());
        const expected = new Date(existing);
        expected.setMonth(expected.getMonth() + 3);
        expect(db.bundles.get("user-1|ultimate-pass").valid_until).toBe(expected.toISOString());
    });
});

describe("3-month Ultimate code — can't be misused", () => {
    it("one member can't redeem it twice", async () => {
        createCode();
        await redeemFreeAccess("ALL3M", member());
        await expect(redeemFreeAccess("ALL3M", member())).rejects.toMatchObject({ code: "already_used" });
        expect(db.redemptions).toHaveLength(1);
    });

    it("a double-click redeems once", async () => {
        createCode();
        const results = await Promise.allSettled([redeemFreeAccess("ALL3M", member()), redeemFreeAccess("ALL3M", member())]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect(db.redemptions).toHaveLength(1);
    });

    it("people redeeming at the same moment can't go past the total uses", async () => {
        createCode({ max_redemptions: "2" });
        const results = await Promise.allSettled([1, 2, 3, 4, 5].map((n) => redeemFreeAccess("ALL3M", member(n))));
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(2);
        expect(results.filter((r) => r.status === "rejected").map((r: any) => r.reason.code)).toEqual(["used_up", "used_up", "used_up"]);
        expect(db.redemptions).toHaveLength(2);
    });

    it("stops working once expired or switched off", async () => {
        createCode({ code: "OLD3M", expires_at: new Date(Date.now() - DAY).toISOString(), starts_at: new Date(Date.now() - 2 * DAY).toISOString() });
        await expect(redeemFreeAccess("OLD3M", member())).rejects.toMatchObject({ code: "expired" });
        createCode({ code: "OFF3M", active: false });
        await expect(redeemFreeAccess("OFF3M", member())).rejects.toMatchObject({ code: "not_found" });
        expect(db.bundles.size).toBe(0);
    });

    it("can't be used as a discount at a paid checkout", async () => {
        createCode();
        await expect(
            applyCheckoutCoupon({ rawCode: "ALL3M", product: "xtin_bundle", amount: 458000, currency: "INR", notes: { plan_id: "ultimate-pass", billing_cycle: "monthly" }, user: member() })
        ).rejects.toMatchObject({ code: "free_access_code" });
        expect(db.bundles.size).toBe(0);
    });

    it("the 3-month length can't be ordered and paid for", async () => {
        const res = mockRes();
        await createSubscriptionOrder({ body: { plan_id: "ultimate-pass", billing_cycle: "quarterly" }, user: member() }, res);
        expect(res.statusCode).toBe(400);
    });

    it("a forged 'payment' for a coupon order is rejected", async () => {
        process.env.RAZORPAY_KEY_ID = "rzp_test_x";
        process.env.RAZORPAY_KEY_SECRET = "secret";
        try {
            const res = mockRes();
            await verifySubscriptionPayment({ body: { razorpay_order_id: "coupon_abc", razorpay_payment_id: "coupon_abc", razorpay_signature: "made-up" }, user: member() }, res);
            expect(res.statusCode).toBe(400);
            expect(db.bundles.size).toBe(0);
        } finally {
            delete process.env.RAZORPAY_KEY_ID;
            delete process.env.RAZORPAY_KEY_SECRET;
        }
    });
});

describe("100%-off codes at checkout", () => {
    it("two checkouts sent at once get it free only once", async () => {
        db.coupons.set("FREEALL", { id: "c-free", code: "FREEALL", kind: "discount", percent_off: 100, amount_off_paise: null, products: [], audience: "everyone", max_redemptions: null, per_user_limit: 1, starts_at: null, expires_at: null, active: true });
        const checkout = () =>
            applyCheckoutCoupon({
                rawCode: "FREEALL",
                product: "xtin_bundle",
                amount: 458000,
                currency: "INR",
                notes: { product: "xtin_bundle", plan_id: "ultimate-pass", plan_name: "Xtin Ultimate All-Access Pass", billing_cycle: "monthly", products: "" },
                user: member(),
            });
        const results = await Promise.allSettled([checkout(), checkout()]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect((results.find((r) => r.status === "rejected") as any).reason.code).toBe("already_used");
        expect(db.redemptions).toHaveLength(1);
    });
});
