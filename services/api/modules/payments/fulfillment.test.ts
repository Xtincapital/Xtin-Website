import { describe, it, expect, vi, beforeEach } from "vitest";

const repo = vi.hoisted(() => ({
    claimFulfillment: vi.fn(),
    completeFulfillment: vi.fn(),
    releaseFulfillment: vi.fn(),
    getFulfillment: vi.fn(),
    findUserByAuthId: vi.fn(),
    findUserById: vi.fn(),
}));

vi.mock("./fulfillment.repository.js", async () => {
    class FulfillmentTableMissingError extends Error {}
    return { ...repo, FulfillmentTableMissingError };
});

import { fulfillRazorpayOrder, registerFulfiller, FulfillmentError, productOf, normalizeNotes } from "./fulfillment.js";
import { FulfillmentTableMissingError } from "./fulfillment.repository.js";

const order = (notes: Record<string, string>, amount = 29900) => ({ id: "order_1", amount, currency: "INR", status: "paid", notes });
const payment = (overrides = {}) => ({ id: "pay_1", order_id: "order_1", amount: 29900, currency: "INR", status: "captured", ...overrides });

const cheapGrant = vi.fn(async (_ctx: unknown) => ({ granted: "cheap" }));
const priceyGrant = vi.fn(async (_ctx: unknown) => ({ granted: "pricey" }));
registerFulfiller("test_cheap", cheapGrant);
registerFulfiller("test_pricey", priceyGrant);

const buyer = { auth_id: "auth-1", app_user_id: "user-1", email: "a@b.c" };

beforeEach(() => {
    vi.clearAllMocks();
    repo.claimFulfillment.mockResolvedValue({ claimed: true });
});

describe("fulfillRazorpayOrder", () => {
    it("grants whatever the ORDER says was bought — there is no way for a request to pick the product", async () => {
        const res = await fulfillRazorpayOrder({
            orderId: "order_1",
            paymentId: "pay_1",
            order: order({ product: "test_cheap", ...buyer }),
            payment: payment(),
            source: "webhook",
            extras: { product: "test_pricey", plan_id: "anything" },
        });
        expect(res.result).toEqual({ granted: "cheap" });
        expect(priceyGrant).not.toHaveBeenCalled();
        expect(repo.completeFulfillment).toHaveBeenCalledWith("order_1", { granted: "cheap" });
    });

    it("rejects a verify call made against another product's checkout", async () => {
        await expect(
            fulfillRazorpayOrder({
                orderId: "order_1",
                paymentId: "pay_1",
                order: order({ product: "test_cheap", ...buyer }),
                payment: payment(),
                source: "verify",
                expectedProducts: ["test_pricey"],
            })
        ).rejects.toMatchObject({ code: "product_mismatch" });
        expect(cheapGrant).not.toHaveBeenCalled();
    });

    it("refuses to grant to a logged-in user who is not the buyer", async () => {
        await expect(
            fulfillRazorpayOrder({
                orderId: "order_1",
                paymentId: "pay_1",
                order: order({ product: "test_cheap", ...buyer }),
                payment: payment(),
                source: "verify",
                requestUser: { authId: "someone-else", userId: "user-2" },
            })
        ).rejects.toMatchObject({ code: "wrong_user", status: 403 });
        expect(cheapGrant).not.toHaveBeenCalled();
    });

    it("grants exactly once: a second call replays the stored result without granting again", async () => {
        repo.claimFulfillment.mockResolvedValue({ claimed: false, existing: { status: "fulfilled", result: { granted: "cheap" } } });
        const res = await fulfillRazorpayOrder({
            orderId: "order_1",
            paymentId: "pay_1",
            order: order({ product: "test_cheap", ...buyer }),
            payment: payment(),
            source: "verify",
        });
        expect(res).toMatchObject({ alreadyFulfilled: true, result: { granted: "cheap" } });
        expect(cheapGrant).not.toHaveBeenCalled();
    });

    it("tells the webhook to retry while another request is still granting", async () => {
        repo.claimFulfillment.mockResolvedValue({ claimed: false, existing: { status: "processing" } });
        await expect(
            fulfillRazorpayOrder({ orderId: "order_1", paymentId: "pay_1", order: order({ product: "test_cheap", ...buyer }), payment: payment(), source: "webhook" })
        ).rejects.toMatchObject({ code: "in_progress", retryable: true });
    });

    it("releases the claim when the grant fails, so a retry can succeed", async () => {
        cheapGrant.mockRejectedValueOnce(new Error("db down"));
        await expect(
            fulfillRazorpayOrder({ orderId: "order_1", paymentId: "pay_1", order: order({ product: "test_cheap", ...buyer }), payment: payment(), source: "webhook" })
        ).rejects.toMatchObject({ code: "grant_failed", retryable: true });
        expect(repo.releaseFulfillment).toHaveBeenCalledWith("order_1");
        expect(repo.completeFulfillment).not.toHaveBeenCalled();
    });

    it("rejects payments that are not paid, belong to another order, or paid a different amount", async () => {
        const base = { orderId: "order_1", paymentId: "pay_1", order: order({ product: "test_cheap", ...buyer }), source: "webhook" as const };
        await expect(fulfillRazorpayOrder({ ...base, payment: payment({ status: "failed" }) })).rejects.toMatchObject({ code: "not_paid" });
        await expect(fulfillRazorpayOrder({ ...base, payment: payment({ order_id: "order_2" }) })).rejects.toMatchObject({ code: "order_mismatch" });
        await expect(fulfillRazorpayOrder({ ...base, payment: payment({ amount: 100 }) })).rejects.toMatchObject({ code: "amount_mismatch" });
        expect(cheapGrant).not.toHaveBeenCalled();
    });

    it("rejects orders for products nobody fulfils", async () => {
        await expect(
            fulfillRazorpayOrder({ orderId: "order_1", paymentId: "pay_1", order: order({ product: "mystery", ...buyer }), payment: payment(), source: "webhook" })
        ).rejects.toMatchObject({ code: "unknown_product", retryable: false });
    });

    it("resolves the buyer of a legacy order from the users table", async () => {
        repo.findUserById.mockResolvedValue({ id: "user-9", auth_id: "auth-9", email: "old@x.y" });
        await fulfillRazorpayOrder({
            orderId: "order_1",
            paymentId: "pay_1",
            order: order({ product: "test_cheap", userId: "user-9" }),
            payment: payment(),
            source: "webhook",
        });
        expect(cheapGrant.mock.calls[0][0]).toMatchObject({ user: { userId: "user-9", authId: "auth-9", email: "old@x.y" } });
    });

    it("before the migration is applied: webhook waits for a retry, verify carries on unguarded", async () => {
        repo.claimFulfillment.mockRejectedValue(new FulfillmentTableMissingError());
        const args = { orderId: "order_1", paymentId: "pay_1", order: order({ product: "test_cheap", ...buyer }), payment: payment() };
        await expect(fulfillRazorpayOrder({ ...args, source: "webhook" })).rejects.toMatchObject({ code: "not_migrated", retryable: true });
        await expect(fulfillRazorpayOrder({ ...args, source: "verify" })).resolves.toMatchObject({ result: { granted: "cheap" } });
    });
});

describe("notes helpers", () => {
    it("treats Razorpay's empty-notes array as no notes", () => {
        expect(normalizeNotes([])).toEqual({});
    });

    it("recognises bundle orders created before they carried a product note", () => {
        expect(productOf({ plan_id: "ultimate-pass", billing_cycle: "monthly" })).toBe("xtin_bundle");
        expect(productOf({ product: "journal_pro_plan" })).toBe("journal_pro_plan");
        expect(productOf({})).toBe("");
    });

    it("FulfillmentError defaults to a non-retryable 400", () => {
        expect(new FulfillmentError("x", "y")).toMatchObject({ status: 400, retryable: false });
    });
});
