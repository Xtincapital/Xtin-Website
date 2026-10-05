// Gini AI token-pack purchase API — Node/TS port of
// `features-incoming/gini/api/razorpay-order.js`'s `AI_TOKEN_PACKS` +
// `api/razorpay-verify.js` (Phase 10c).
//
// Follows this codebase's established per-module Razorpay pattern (Buffer
// basic-auth + `fetch` to `https://api.razorpay.com/v1/orders`), same as
// journal/aiWallet.controller.ts and fundakamental/razorpay.controller.ts,
// reusing the existing `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env vars.
//
// Auth: every route requires `authenticate` (see aiWallet.routes.ts).
// `req.user.authId` is the trusted user id — unlike the original (a
// stateless Vercel function that never saw a user id at all; the client
// tracked its own wallet in localStorage), request bodies here never carry
// a user id.
//
// Idempotency: the original had NO server-side wallet at all (see
// gini/aiWallet.repository.ts's header — `chat.controller.ts` is the first
// place this migration introduced real server-side token accounting for
// Gini). `addTokens` (aiWallet.repository.ts, Phase 10b) does not itself
// dedupe on payment_id, so `verifyAiPurchase` below checks
// `findPurchaseByPaymentId` (gini_ai_wallet_purchases) before crediting, so
// a duplicate verify call (retry, webhook replay) is a no-op instead of a
// double-credit.
import { verifyRazorpaySignature } from "../../utils/razorpay.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateAiOrderRequest, validateAiVerifyRequest } from "./aiWallet.validator.js";
import { getOrCreateWallet, addTokens } from "./aiWallet.repository.js";
import { findPurchaseByPaymentId, insertAiWalletPurchase } from "./aiWalletPurchases.repository.js";
import { buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";

// Port of features-incoming/gini/api/razorpay-order.js's AI_TOKEN_PACKS.
// Amounts are whole INR rupees (multiplied by 100 for paise only at
// Razorpay order-creation time) — AI packs are INR-only in the source.
export const AI_PACKAGES: Record<string, { id: string; amount_inr: number; tokens: number; label: string }> = {
    ai_500: { id: "ai_500", amount_inr: 500, tokens: 300_000, label: "Starter AI Pack" },
    ai_1000: { id: "ai_1000", amount_inr: 1000, tokens: 700_000, label: "Growth AI Pack" },
    ai_2000: { id: "ai_2000", amount_inr: 2000, tokens: 1_600_000, label: "Power AI Pack" },
};

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/* GET /gini/ai/plans — static catalogue. */
export const getAiPlans = async (_req, res) => {
    return res.status(HTTP_STATUS.OK).json({ plans: Object.values(AI_PACKAGES), currency: "INR" });
};

/* GET /gini/ai/wallet — reuses Phase 10b's `getOrCreateWallet` directly
 * rather than duplicating wallet-fetch logic. */
export const getAiWallet = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.authId);
        return res.status(HTTP_STATUS.OK).json({ wallet, plans: Object.values(AI_PACKAGES) });
    } catch (err) {
        console.error("[Gini AI Wallet] wallet fetch failed:", (err as Error)?.message || err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching wallet: ${(err as Error)?.message || err}` });
    }
};

/* POST /gini/ai/razorpay/order — create a Razorpay order for an AI token pack. */
export const createAiOrder = async (req, res) => {
    try {
        const validation = validateAiOrderRequest(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }
        const pkg = AI_PACKAGES[validation.data.package_id];
        if (!pkg) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid AI package" });
        }
        if (!razorpayConfigured()) {
            return res.status(500).json({ error: "Payment service not configured" });
        }

        const userId = req.user.authId;
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: pkg.amount_inr * 100,
                currency: "INR",
                receipt: `gini_ai_${String(userId || "").slice(-8)}_${Date.now()}`,
                notes: {
                    product: "gini_ai_tokens",
                    package_id: pkg.id,
                    tokens: String(pkg.tokens),
                    user_id: String(userId || ""),
                    ...buyerNotes(req.user),
                },
            }),
        });
        const order: any = await rpRes.json();
        if (!rpRes.ok) {
            return res.status(rpRes.status).json({ error: order?.error?.description || "Unable to create order" });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID,
            order,
            package: pkg,
        });
    } catch (err) {
        console.error("[Gini AI Wallet] order error:", err);
        return res.status(500).json({ error: `Payment error: ${(err as Error)?.message || err}` });
    }
};

/* Credits an AI token pack for a paid order. The pack comes from the
 * order's notes, never from the request body. Idempotency: the shared
 * payment_fulfillments claim, plus the gini_ai_wallet_purchases check kept
 * below for orders paid before that table existed. Called by
 * modules/payments/fulfillment.ts from the verify endpoint and the webhook. */
export const fulfillGiniAiTokens: Fulfiller = async ({ order, payment, notes, user }) => {
    const pkg = AI_PACKAGES[notes.package_id];
    if (!pkg) throw new FulfillmentError(`Unknown AI package "${notes.package_id}"`, "invalid_order");
    if (order.currency !== "INR") throw new FulfillmentError(`AI packs are INR-only, got ${order.currency}`, "amount_mismatch");
    requireCatalogAmount(order, pkg.amount_inr * 100);

    const userId = user.authId;
    if (!userId) throw new FulfillmentError("Buyer has no auth id", "no_buyer");

    const { data: existing, error: lookupError } = await findPurchaseByPaymentId(payment.id);
    if (lookupError) console.error("[Gini AI Wallet] purchase lookup failed:", lookupError.message);

    let wallet;
    if (existing) {
        wallet = await getOrCreateWallet(userId);
    } else {
        wallet = await addTokens(userId, pkg.tokens, "razorpay", pkg.amount_inr, payment.id);
        try {
            const { error } = await insertAiWalletPurchase({
                user_id: userId,
                package_id: pkg.id,
                tokens: pkg.tokens,
                amount_inr: pkg.amount_inr,
                payment_id: payment.id,
                order_id: order.id,
            });
            if (error) throw error;
        } catch (err) {
            console.error("[Gini AI Wallet] purchase audit insert failed:", (err as Error)?.message || err);
        }
    }

    return { wallet, package: pkg, message: "AI tokens added" };
};
registerFulfiller("gini_ai_tokens", fulfillGiniAiTokens);

/* POST /gini/ai/razorpay/verify — HMAC-verify, then credit via the shared
 * fulfilment path (idempotent with the Razorpay webhook). */
export const verifyAiPurchase = async (req, res) => {
    try {
        const validation = validateAiVerifyRequest(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ error: "Payment service not configured" });
        }

        if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Payment signature verification failed" });
        }

        const { result, alreadyFulfilled } = await fulfillRazorpayOrder({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            source: "verify",
            expectedProducts: ["gini_ai_tokens"],
            requestUser: req.user,
        });
        // A stored result's wallet snapshot may be stale by now.
        const wallet = alreadyFulfilled ? await getOrCreateWallet(req.user.authId) : result.wallet;
        return res.status(HTTP_STATUS.OK).json({ success: true, ...result, wallet });
    } catch (err) {
        if (sendFulfillmentError(res, err, "Gini AI Wallet")) return;
        console.error("[Gini AI Wallet] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};
