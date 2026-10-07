import { describe, it, expect, vi } from "vitest";

vi.mock("../../middlewares/auth.js", () => ({ authenticate: vi.fn(), requireAdmin: vi.fn() }));
vi.mock("./coupons.repository.js", () => ({}));
vi.mock("./coupons.service.js", () => ({ normalizeCode: (v: unknown) => String(v ?? "").trim().toUpperCase().replace(/\s+/g, "") }));
vi.mock("../payments/fulfillment.js", () => ({ FulfillmentError: class extends Error {} }));

import { parseCouponPatch, parseNewCoupon } from "./coupons.routes.js";

describe("parseNewCoupon", () => {
    it("builds a % discount limited to chosen products", () => {
        const row = parseNewCoupon({ code: " xtin 10", kind: "discount", percent_off: "10", products: ["gini_pro_plan", "gini_pro_plan"], max_redemptions: "100" }, "admin@x.com");
        expect(row).toMatchObject({ code: "XTIN10", kind: "discount", percent_off: 10, amount_off_paise: null, products: ["gini_pro_plan"], max_redemptions: 100, per_user_limit: 1, audience: "everyone", active: true, created_by: "admin@x.com" });
    });

    it("stores ₹ off in paise", () => {
        expect(parseNewCoupon({ code: "FLAT50", kind: "discount", amount_off: "50" }, "a")).toMatchObject({ amount_off_paise: 5000, percent_off: null });
    });

    it("builds a free-access code from the catalogue", () => {
        expect(parseNewCoupon({ code: "FREEGOODIES", kind: "free_access", free_product: "xtin_newsletter_pro", free_plan: "newsletter_pro_monthly" }, "a")).toMatchObject({
            kind: "free_access",
            free_product: "xtin_newsletter_pro",
            free_plan: "newsletter_pro_monthly",
            percent_off: null,
        });
    });

    it("explains what's wrong instead of saving a bad code", () => {
        const bad: Array<[Record<string, unknown>, RegExp]> = [
            [{ code: "x", kind: "discount", percent_off: 10 }, /3–32/],
            [{ code: "OK10", kind: "discount" }, /either a % off or a ₹ amount/],
            [{ code: "OK10", kind: "discount", percent_off: 10, amount_off: 5 }, /either a % off or a ₹ amount/],
            [{ code: "OK10", kind: "discount", percent_off: 150 }, /1 to 100/],
            [{ code: "OK10", kind: "discount", percent_off: 10, products: ["made_up"] }, /Unknown product/],
            [{ code: "OK10", kind: "free_access", free_product: "xtin_algo_subscription", free_plan: "monthly" }, /what the free code unlocks/],
            [{ code: "OK10", kind: "discount", percent_off: 10, starts_at: "2026-11-01", expires_at: "2026-10-01" }, /after the start/],
            [{ code: "OK10", kind: "discount", percent_off: 10, max_redemptions: "0" }, /1 or more/],
        ];
        for (const [body, message] of bad) expect(() => parseNewCoupon(body, "a")).toThrow(message);
    });
});

describe("parseCouponPatch", () => {
    it("only lets limits, dates, notes and the on/off switch change", () => {
        expect(parseCouponPatch({ active: false, percent_off: 90, code: "HACK" })).toEqual({ active: false });
        expect(parseCouponPatch({ max_redemptions: "", expires_at: "" })).toEqual({ max_redemptions: null, expires_at: null });
        expect(() => parseCouponPatch({ percent_off: 90 })).toThrow(/Nothing to update/);
    });
});
