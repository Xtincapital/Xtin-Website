import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import crypto from "node:crypto";

const { fulfill, markRefunded, FulfillmentError } = vi.hoisted(() => ({
    fulfill: vi.fn(),
    markRefunded: vi.fn(),
    FulfillmentError: class FulfillmentError extends Error {
        code: string;
        status: number;
        retryable: boolean;
        constructor(message: string, code: string, status = 400, retryable = false) {
            super(message);
            this.name = "FulfillmentError";
            this.code = code;
            this.status = status;
            this.retryable = retryable;
        }
    },
}));
vi.mock("./fulfillment.js", () => ({
    fulfillRazorpayOrder: fulfill,
    FulfillmentError,
}));

vi.mock("./receipts.js", () => ({ markReceiptRefunded: markRefunded }));

import { handleRazorpayWebhook } from "./webhook.controller.js";

const SECRET = "whsec_test";
const originalSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

function delivery(body: object, { signed = true } = {}) {
    const raw = Buffer.from(JSON.stringify(body));
    const signature = signed ? crypto.createHmac("sha256", SECRET).update(raw).digest("hex") : "bad";
    return { rawBody: raw, body, get: (h: string) => (h.toLowerCase() === "x-razorpay-signature" ? signature : undefined) };
}

function response() {
    const res = { statusCode: 0, payload: null as unknown, status(c: number) { res.statusCode = c; return res; }, json(p: unknown) { res.payload = p; return res; } };
    return res;
}

const paid = {
    event: "order.paid",
    payload: { order: { entity: { id: "order_1", amount: 100, currency: "INR", notes: {} } }, payment: { entity: { id: "pay_1", order_id: "order_1" } } },
};

beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
    fulfill.mockReset();
    markRefunded.mockReset();
});
afterAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = originalSecret;
});

describe("handleRazorpayWebhook", () => {
    it("rejects deliveries with a bad signature without fulfilling anything", async () => {
        const res = response();
        await handleRazorpayWebhook(delivery(paid, { signed: false }), res);
        expect(res.statusCode).toBe(400);
        expect(fulfill).not.toHaveBeenCalled();
    });

    it("refuses everything when no webhook secret is configured", async () => {
        delete process.env.RAZORPAY_WEBHOOK_SECRET;
        const res = response();
        await handleRazorpayWebhook(delivery(paid), res);
        expect(res.statusCode).toBe(503);
        expect(fulfill).not.toHaveBeenCalled();
    });

    it("fulfils order.paid using the signed order and payment entities", async () => {
        fulfill.mockResolvedValue({ alreadyFulfilled: false, product: "journal_pro_plan", result: {} });
        const res = response();
        await handleRazorpayWebhook(delivery(paid), res);
        expect(res.statusCode).toBe(200);
        expect(fulfill).toHaveBeenCalledWith(expect.objectContaining({ orderId: "order_1", paymentId: "pay_1", source: "webhook" }));
    });

    it("acknowledges other events without acting on them", async () => {
        const res = response();
        await handleRazorpayWebhook(delivery({ event: "payment.failed", payload: {} }), res);
        expect(res.statusCode).toBe(200);
        expect(fulfill).not.toHaveBeenCalled();
    });

    it("marks the receipt refunded only when the whole payment was refunded", async () => {
        const refund = (amountRefunded: number) => ({
            event: "refund.processed",
            payload: { payment: { entity: { id: "pay_1", amount: 29900, amount_refunded: amountRefunded } } },
        });
        let res = response();
        await handleRazorpayWebhook(delivery(refund(10000)), res);
        expect(res.statusCode).toBe(200);
        expect(markRefunded).not.toHaveBeenCalled();

        res = response();
        await handleRazorpayWebhook(delivery(refund(29900)), res);
        expect(res.statusCode).toBe(200);
        expect(markRefunded).toHaveBeenCalledWith("pay_1");
        expect(fulfill).not.toHaveBeenCalled();
    });

    it("returns 500 on transient failures so Razorpay redelivers", async () => {
        fulfill.mockRejectedValue(new FulfillmentError("db down", "grant_failed", 500, true));
        const res = response();
        await handleRazorpayWebhook(delivery(paid), res);
        expect(res.statusCode).toBe(500);
    });

    it("returns 200 on permanent failures so Razorpay stops redelivering (logged for manual review)", async () => {
        fulfill.mockRejectedValue(new FulfillmentError("wrong amount", "amount_mismatch"));
        const res = response();
        await handleRazorpayWebhook(delivery(paid), res);
        expect(res.statusCode).toBe(200);
        expect(res.payload).toMatchObject({ ok: false, code: "amount_mismatch" });
    });
});
