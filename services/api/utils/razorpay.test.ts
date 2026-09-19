// Regression coverage for utils/razorpay.ts — written directly against the
// real vulnerability found while auditing for Phase 13 test coverage (see
// that file's header comment for the full story): an authenticated caller
// could omit `razorpay_signature` from a verify-payment request body and
// have the check silently skip, granting a free subscription. The most
// important test here is `requireValidRazorpaySignature` rejecting a
// missing signature — every other case is secondary to that one.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyRazorpaySignature, requireValidRazorpaySignature, razorpayConfigured, RazorpaySignatureError } from "./razorpay.js";
import crypto from "node:crypto";

const SECRET = "test_secret_key_for_hmac";

function realSignatureFor(orderId: string, paymentId: string, secret = SECRET) {
    return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

describe("razorpayConfigured", () => {
    const originalId = process.env.RAZORPAY_KEY_ID;
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;

    afterEach(() => {
        process.env.RAZORPAY_KEY_ID = originalId;
        process.env.RAZORPAY_KEY_SECRET = originalSecret;
    });

    it("is false when either key is missing", () => {
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        expect(razorpayConfigured()).toBe(false);

        process.env.RAZORPAY_KEY_ID = "id";
        delete process.env.RAZORPAY_KEY_SECRET;
        expect(razorpayConfigured()).toBe(false);
    });

    it("is true when both keys are set", () => {
        process.env.RAZORPAY_KEY_ID = "id";
        process.env.RAZORPAY_KEY_SECRET = "secret";
        expect(razorpayConfigured()).toBe(true);
    });
});

describe("verifyRazorpaySignature", () => {
    it("accepts a correctly-signed order/payment pair", () => {
        const orderId = "order_abc123";
        const paymentId = "pay_xyz789";
        const signature = realSignatureFor(orderId, paymentId);
        expect(verifyRazorpaySignature(orderId, paymentId, signature, SECRET)).toBe(true);
    });

    it("rejects a wrong signature", () => {
        const orderId = "order_abc123";
        const paymentId = "pay_xyz789";
        expect(verifyRazorpaySignature(orderId, paymentId, "not_the_real_signature", SECRET)).toBe(false);
    });

    it("rejects a signature computed for a different order/payment pair", () => {
        const forgedSignature = realSignatureFor("order_other", "pay_other");
        expect(verifyRazorpaySignature("order_abc123", "pay_xyz789", forgedSignature, SECRET)).toBe(false);
    });

    it("rejects when the signature is missing/empty", () => {
        expect(verifyRazorpaySignature("order_abc123", "pay_xyz789", "", SECRET)).toBe(false);
        expect(verifyRazorpaySignature("order_abc123", "pay_xyz789", undefined as any, SECRET)).toBe(false);
    });

    it("rejects when orderId or paymentId is missing", () => {
        const signature = realSignatureFor("order_abc123", "pay_xyz789");
        expect(verifyRazorpaySignature("", "pay_xyz789", signature, SECRET)).toBe(false);
        expect(verifyRazorpaySignature("order_abc123", "", signature, SECRET)).toBe(false);
    });

    it("does not throw on a truncated/malformed signature (length mismatch)", () => {
        expect(() => verifyRazorpaySignature("order_abc123", "pay_xyz789", "short", SECRET)).not.toThrow();
        expect(verifyRazorpaySignature("order_abc123", "pay_xyz789", "short", SECRET)).toBe(false);
    });
});

describe("requireValidRazorpaySignature", () => {
    const originalId = process.env.RAZORPAY_KEY_ID;
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;

    beforeEach(() => {
        process.env.RAZORPAY_KEY_ID = "test_key_id";
        process.env.RAZORPAY_KEY_SECRET = SECRET;
    });

    afterEach(() => {
        process.env.RAZORPAY_KEY_ID = originalId;
        process.env.RAZORPAY_KEY_SECRET = originalSecret;
    });

    it("REGRESSION: throws when the signature is omitted entirely and Razorpay is configured — the exact bug found in subscriptionPlan.controller.ts's original `if (razorpayConfigured() && signature)` check, which silently skipped verification (and granted a free subscription) whenever `signature` was falsy", () => {
        expect(() => requireValidRazorpaySignature("order_abc123", "pay_xyz789", undefined as any)).toThrow(RazorpaySignatureError);
        expect(() => requireValidRazorpaySignature("order_abc123", "pay_xyz789", "")).toThrow(RazorpaySignatureError);
    });

    it("throws on a wrong signature", () => {
        expect(() => requireValidRazorpaySignature("order_abc123", "pay_xyz789", "wrong")).toThrow(RazorpaySignatureError);
    });

    it("does not throw on a correct signature", () => {
        const signature = realSignatureFor("order_abc123", "pay_xyz789");
        expect(() => requireValidRazorpaySignature("order_abc123", "pay_xyz789", signature)).not.toThrow();
    });

    it("does not throw when Razorpay is not configured at all — the legitimate local-dev bypass, distinct from the bug above (no keys configured, vs. keys configured but signature omitted)", () => {
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        expect(() => requireValidRazorpaySignature("order_abc123", "pay_xyz789", undefined as any)).not.toThrow();
    });
});
