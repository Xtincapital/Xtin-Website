// Journal AI token-pack purchase API — Node/TS port of
// `features-incoming/journal/main.py`'s `GET /api/v2/ai/plans`,
// `GET /api/v2/ai/wallet`, `POST /api/v2/ai/razorpay/order`,
// `POST /api/v2/ai/razorpay/verify` (Phase 9c).
//
// Follows this codebase's established per-module Razorpay pattern (Buffer
// basic-auth + `fetch` to `https://api.razorpay.com/v1/orders`), same as
// fundakamental/razorpay.controller.ts and fundakamental/tokens.controller.ts,
// reusing the existing `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env vars.
//
// Auth: every route requires `authenticate` (see aiWallet.routes.ts, and
// every other journal route file). `req.user.authId` is the trusted user
// id — unlike the Python source (whose `AiOrderRequest`/
// `AiPaymentVerifyRequest` models trusted a client-supplied `user_id`
// field), request bodies here never carry a user id.
//
// Idempotency / AI_ORDER_STORE replacement: the Python source's
// `AI_ORDER_STORE` (in-memory, resets on restart) weakly checked that a
// verify call's order belonged to the claimed user/package. Razorpay's HMAC
// signature is the real security boundary (already enforced below), so
// that check isn't reproduced. What IS reproduced, persistently, is
// payment-credit idempotency: `addAiTokens` (aiWallet.repository.ts, Phase
// 9b) does not itself dedupe on payment_id — it always adds `tokens` on
// every call. `verifyAiPurchase` below checks
// `findPurchaseByPaymentId` (journal_ai_wallet_purchases) before crediting,
// so a duplicate verify call (retry, webhook replay) is a no-op instead of
// a double-credit — a real, persistent guard where the source had a
// fragile in-memory one.
import crypto from "node:crypto";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateAiOrderRequest, validateAiVerifyRequest } from "./aiWallet.validator.js";
import { getOrCreateWallet, addAiTokens } from "./aiWallet.repository.js";
import { findPurchaseByPaymentId, insertAiWalletPurchase } from "./aiWalletPurchases.repository.js";

// Port of main.py's AI_PACKAGES. Amounts are whole INR rupees (multiplied
// by 100 for paise only at Razorpay order-creation time) — AI packs are
// INR-only in the source, unlike the multi-currency Pro plans.
export const AI_PACKAGES: Record<string, { id: string; amount_inr: number; tokens: number; label: string }> = {
    ai_500: { id: "ai_500", amount_inr: 500, tokens: 300_000, label: "Starter AI Pack" },
    ai_1000: { id: "ai_1000", amount_inr: 1000, tokens: 700_000, label: "Growth AI Pack" },
    ai_2000: { id: "ai_2000", amount_inr: 2000, tokens: 1_600_000, label: "Power AI Pack" },
};

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/* GET /journal/ai/plans — static catalogue. Port of main.py's `ai_plans`. */
export const getAiPlans = async (_req, res) => {
    return res.status(HTTP_STATUS.OK).json({ plans: Object.values(AI_PACKAGES), currency: "INR" });
};

/* GET /journal/ai/wallet — port of main.py's `ai_wallet` (reuses Phase 9b's
 * `getOrCreateWallet` directly rather than duplicating wallet-fetch logic). */
export const getAiWallet = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.authId);
        return res.status(HTTP_STATUS.OK).json({ wallet, plans: Object.values(AI_PACKAGES) });
    } catch (err) {
        console.error("[Journal AI Wallet] wallet fetch failed:", (err as Error)?.message || err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching wallet: ${(err as Error)?.message || err}` });
    }
};

/* POST /journal/ai/razorpay/order — create a Razorpay order for an AI token pack. */
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
                receipt: `journal_ai_${String(userId || "").slice(-8)}_${Date.now()}`,
                notes: {
                    product: "journal_ai_tokens",
                    package_id: pkg.id,
                    tokens: String(pkg.tokens),
                    user_id: String(userId || ""),
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
        console.error("[Journal AI Wallet] order error:", err);
        return res.status(500).json({ error: `Payment error: ${(err as Error)?.message || err}` });
    }
};

/* POST /journal/ai/razorpay/verify — HMAC-verify, then credit tokens
 * (idempotency-guarded via journal_ai_wallet_purchases — see header
 * comment). Port of main.py's `ai_razorpay_verify`. */
export const verifyAiPurchase = async (req, res) => {
    try {
        const validation = validateAiVerifyRequest(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }
        const { package_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        const pkg = AI_PACKAGES[package_id];
        if (!pkg) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid AI package" });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ error: "Payment service not configured" });
        }

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(razorpay_signature)))) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Payment signature verification failed" });
        }

        const userId = req.user.authId;
        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Not authenticated" });
        }

        // Idempotency guard: addAiTokens itself always adds `tokens` with no
        // dedupe, so check the persistent audit table before crediting.
        const { data: existing, error: lookupError } = await findPurchaseByPaymentId(razorpay_payment_id);
        if (lookupError) console.error("[Journal AI Wallet] purchase lookup failed:", lookupError.message);

        let wallet;
        if (existing) {
            wallet = await getOrCreateWallet(userId);
        } else {
            wallet = await addAiTokens(userId, pkg.tokens, "razorpay", pkg.amount_inr, razorpay_payment_id);
            try {
                const { error } = await insertAiWalletPurchase({
                    user_id: userId,
                    package_id: pkg.id,
                    tokens: pkg.tokens,
                    amount_inr: pkg.amount_inr,
                    payment_id: razorpay_payment_id,
                    order_id: razorpay_order_id,
                });
                if (error) throw error;
            } catch (err) {
                console.error("[Journal AI Wallet] purchase audit insert failed:", (err as Error)?.message || err);
            }
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, wallet, package: pkg, message: "AI tokens added" });
    } catch (err) {
        console.error("[Journal AI Wallet] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};
