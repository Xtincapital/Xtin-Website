import { describe, it, expect, vi, beforeEach } from "vitest";

const repo = vi.hoisted(() => ({
    findCouponByCode: vi.fn(),
    countRedemptions: vi.fn(),
    countUserRedemptions: vi.fn(),
    hasPaidPurchase: vi.fn(),
}));
vi.mock("./coupons.repository.js", () => repo);

const grantWithoutPayment = vi.hoisted(() => vi.fn());
vi.mock("../payments/fulfillment.js", () => ({
    grantWithoutPayment,
    FulfillmentError: class FulfillmentError extends Error {},
}));

import { applyCheckoutCoupon, discountedAmount, loadUsableCoupon, normalizeCode, previewCoupon, redeemFreeAccess, CouponError } from "./coupons.service.js";

const user = { userId: "user-1", authId: "auth-1", email: "a@b.c" };

const coupon = (over: Record<string, unknown> = {}) => ({
    id: "c-1",
    code: "XTIN10",
    description: null,
    kind: "discount",
    percent_off: 10,
    amount_off_paise: null,
    free_product: null,
    free_plan: null,
    products: [],
    audience: "everyone",
    max_redemptions: null,
    per_user_limit: 1,
    starts_at: null,
    expires_at: null,
    active: true,
    ...over,
});

beforeEach(() => {
    vi.clearAllMocks();
    repo.findCouponByCode.mockResolvedValue(coupon());
    repo.countRedemptions.mockResolvedValue(0);
    repo.countUserRedemptions.mockResolvedValue(0);
    repo.hasPaidPurchase.mockResolvedValue(false);
});

describe("discountedAmount", () => {
    it("takes a percentage off, rounded to the paisa", () => {
        expect(discountedAmount(coupon({ percent_off: 10 }), 49900, "INR")).toBe(44910);
        expect(discountedAmount(coupon({ percent_off: 33 }), 14900, "INR")).toBe(9983);
    });

    it("takes a fixed ₹ amount off INR orders only", () => {
        expect(discountedAmount(coupon({ percent_off: null, amount_off_paise: 5000 }), 14900, "INR")).toBe(9900);
        expect(() => discountedAmount(coupon({ percent_off: null, amount_off_paise: 5000 }), 399, "USD")).toThrow(CouponError);
    });

    it("is free at 100% off or when the ₹ off covers the price", () => {
        expect(discountedAmount(coupon({ percent_off: 100 }), 49900, "INR")).toBe(0);
        expect(discountedAmount(coupon({ percent_off: null, amount_off_paise: 100000 }), 49900, "INR")).toBe(0);
    });

    it("never leaves less than Razorpay's ₹1 minimum when something is still owed", () => {
        expect(discountedAmount(coupon({ percent_off: 99 }), 5000, "INR")).toBe(100);
    });
});

describe("loadUsableCoupon", () => {
    it("normalises what people type", async () => {
        expect(normalizeCode("  xtin 10 ")).toBe("XTIN10");
        await loadUsableCoupon(" xtin10", user);
        expect(repo.findCouponByCode).toHaveBeenCalledWith("XTIN10");
    });

    it("refuses unknown, switched-off, future and expired codes", async () => {
        repo.findCouponByCode.mockResolvedValueOnce(null);
        await expect(loadUsableCoupon("NOPE", user)).rejects.toMatchObject({ code: "not_found", status: 404 });
        repo.findCouponByCode.mockResolvedValueOnce(coupon({ active: false }));
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "not_found" });
        repo.findCouponByCode.mockResolvedValueOnce(coupon({ starts_at: "2999-01-01T00:00:00Z" }));
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "not_started" });
        repo.findCouponByCode.mockResolvedValueOnce(coupon({ expires_at: "2000-01-01T00:00:00Z" }));
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "expired" });
    });

    it("enforces the total and per-person limits", async () => {
        repo.findCouponByCode.mockResolvedValue(coupon({ max_redemptions: 50 }));
        repo.countRedemptions.mockResolvedValueOnce(50);
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "used_up" });
        repo.countUserRedemptions.mockResolvedValueOnce(1);
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "already_used" });
    });

    it("checks who the code is for", async () => {
        repo.findCouponByCode.mockResolvedValue(coupon({ audience: "new_customers" }));
        repo.hasPaidPurchase.mockResolvedValueOnce(true);
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "new_customers_only" });

        repo.findCouponByCode.mockResolvedValue(coupon({ audience: "members" }));
        repo.hasPaidPurchase.mockResolvedValueOnce(false);
        await expect(loadUsableCoupon("XTIN10", user)).rejects.toMatchObject({ code: "members_only" });
        repo.hasPaidPurchase.mockResolvedValueOnce(true);
        await expect(loadUsableCoupon("XTIN10", user)).resolves.toMatchObject({ code: "XTIN10" });
    });
});

describe("applyCheckoutCoupon", () => {
    const base = { product: "gini_pro_plan", amount: 49900, currency: "INR", notes: { product: "gini_pro_plan", plan_id: "pro_monthly" }, user };

    it("changes nothing without a code", async () => {
        const res = await applyCheckoutCoupon({ ...base, rawCode: "" });
        expect(res).toEqual({ free: false, amount: 49900, notes: base.notes, discount: 0, code: null });
        expect(repo.findCouponByCode).not.toHaveBeenCalled();
    });

    it("discounts and stamps the order notes that fulfilment checks against", async () => {
        const res = await applyCheckoutCoupon({ ...base, rawCode: "xtin10" });
        expect(res).toMatchObject({
            free: false,
            amount: 44910,
            discount: 4990,
            notes: { product: "gini_pro_plan", plan_id: "pro_monthly", coupon_code: "XTIN10", coupon_id: "c-1", coupon_list_amount: "49900" },
        });
    });

    it("refuses codes made for other products, and free-access codes", async () => {
        repo.findCouponByCode.mockResolvedValueOnce(coupon({ products: ["xtin_newsletter_pro"] }));
        await expect(applyCheckoutCoupon({ ...base, rawCode: "XTIN10" })).rejects.toMatchObject({ code: "wrong_product" });
        repo.findCouponByCode.mockResolvedValueOnce(coupon({ kind: "free_access", percent_off: null, free_product: "xtin_newsletter_pro", free_plan: "newsletter_pro_monthly" }));
        await expect(applyCheckoutCoupon({ ...base, rawCode: "XTIN10" })).rejects.toMatchObject({ code: "free_access_code" });
    });

    it("grants straight away, with no Razorpay order, when the code makes it free", async () => {
        repo.findCouponByCode.mockResolvedValueOnce(coupon({ percent_off: 100 }));
        grantWithoutPayment.mockResolvedValueOnce({ orderId: "coupon_abc", result: { ok: true } });
        const res = await applyCheckoutCoupon({ ...base, rawCode: "XTIN10" });
        expect(res).toEqual({ free: true, orderId: "coupon_abc", result: { ok: true }, code: "XTIN10" });
        expect(grantWithoutPayment).toHaveBeenCalledWith(
            expect.objectContaining({ product: "gini_pro_plan", notes: expect.objectContaining({ plan_id: "pro_monthly", coupon_code: "XTIN10" }) })
        );
    });
});

describe("redeemFreeAccess", () => {
    it("grants the coupon's plan with that product's own notes", async () => {
        repo.findCouponByCode.mockResolvedValue(coupon({ code: "FREEGOODIES", kind: "free_access", percent_off: null, free_product: "xtin_newsletter_pro", free_plan: "newsletter_pro_monthly" }));
        grantWithoutPayment.mockResolvedValueOnce({ orderId: "coupon_xyz", result: {} });
        const res = await redeemFreeAccess("freegoodies", user);
        expect(res).toMatchObject({ orderId: "coupon_xyz", label: "Market Brief Pro — 1 month" });
        expect(grantWithoutPayment).toHaveBeenCalledWith({
            product: "xtin_newsletter_pro",
            notes: { planId: "newsletter_pro_monthly", coupon_code: "FREEGOODIES", coupon_id: "c-1" },
            user,
        });
    });

    it("sends discount codes back to checkout", async () => {
        await expect(redeemFreeAccess("XTIN10", user)).rejects.toMatchObject({ code: "discount_code" });
        expect(grantWithoutPayment).not.toHaveBeenCalled();
    });

    it("blocks a double-click from redeeming twice at once", async () => {
        repo.findCouponByCode.mockResolvedValue(coupon({ code: "FREEGOODIES", kind: "free_access", percent_off: null, free_product: "xtin_newsletter_pro", free_plan: "newsletter_pro_monthly" }));
        let release: (v: unknown) => void = () => {};
        grantWithoutPayment.mockReturnValueOnce(new Promise((r) => (release = r)));
        const first = redeemFreeAccess("FREEGOODIES", user);
        await expect(redeemFreeAccess("FREEGOODIES", user)).rejects.toMatchObject({ code: "in_progress" });
        release({ orderId: "coupon_1", result: {} });
        await expect(first).resolves.toMatchObject({ orderId: "coupon_1" });
    });
});

describe("previewCoupon", () => {
    it("shows the new price without granting anything", async () => {
        const res = await previewCoupon({ rawCode: "XTIN10", product: "gini_pro_plan", amount: 49900, currency: "INR", user });
        expect(res).toMatchObject({ kind: "discount", label: "10% off", amount: 44910, discount: 4990 });
        expect(grantWithoutPayment).not.toHaveBeenCalled();
    });
});
