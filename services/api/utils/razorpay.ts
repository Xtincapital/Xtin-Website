// Shared Razorpay order-signature verification. Phase 13: extracted from
// 10 independent copy-pasted implementations across modules/{journal,
// fundakamental,gini,algos,academy,newsletter,billing}/*.controller.ts —
// found while auditing for test coverage. Consolidating them surfaced two
// real, live bugs, both fixed here rather than just documented:
//
//   1. modules/billing/subscriptionPlan.controller.ts's verifySubscriptionPayment
//      used `if (razorpayConfigured() && signature)` to decide whether to
//      verify at all — an authenticated user could omit `razorpay_signature`
//      from the request body entirely and skip verification outright,
//      granting themselves a free active subscription (propagated to every
//      product via syncSubProductsToDatabase, including full "bundle"
//      access). Fixed by making verification unconditional whenever
//      Razorpay is configured: `requireValidRazorpaySignature` below always
//      throws if the signature is missing OR wrong, never silently skips.
//   2. The same file compared signatures with `expectedSig !== signature`
//      (not constant-time) instead of the `crypto.timingSafeEqual` every
//      other one of the 10 sites used — a real, if narrow, timing-attack
//      surface. `verifyRazorpaySignature` below always uses
//      `timingSafeEqual`.
//
// All 10 call sites now route through one of the two functions below
// instead of their own copy of this logic.
import crypto from "node:crypto";

export const razorpayConfigured = (): boolean =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/**
 * Verifies a Razorpay order-payment HMAC signature against
 * RAZORPAY_KEY_SECRET. Returns a boolean — never throws on a bad
 * signature (only on missing input), so callers can choose their own
 * response shape. Always constant-time (`crypto.timingSafeEqual`).
 */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret = process.env.RAZORPAY_KEY_SECRET): boolean {
    if (!orderId || !paymentId || !signature || !secret) return false;

    const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(String(signature));

    // timingSafeEqual throws on length mismatch rather than returning
    // false — a forged/truncated signature is exactly the input this
    // needs to handle without throwing.
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export class RazorpaySignatureError extends Error {
    constructor(message = "Payment signature verification failed") {
        super(message);
        this.name = "RazorpaySignatureError";
    }
}

/**
 * The strict form every verify-payment controller should use: throws
 * `RazorpaySignatureError` if Razorpay is configured and the signature is
 * either missing or wrong. Never silently skips verification just because
 * a field was omitted from the request body — that was bug #1 above.
 * Callers not using Razorpay at all in local dev (`!razorpayConfigured()`)
 * should branch on that themselves before calling this, same as every
 * site's existing dev-fallback-order pattern already does for order
 * creation.
 */
export function requireValidRazorpaySignature(orderId: string, paymentId: string, signature: string): void {
    if (!razorpayConfigured()) return;
    if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
        throw new RazorpaySignatureError();
    }
}
