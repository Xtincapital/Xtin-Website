// AI token wallet API — Node/TS port of `api/endpoints/tokens.py`: balance,
// top-up packs (Razorpay), and the pack catalogue.
//
// Buying Pro raises the monthly allowance (see razorpay.controller.ts); when
// a Pro user still runs out they can buy one-off top-up packs here. All
// grants happen server-side after a verified payment.
//
// Follows this codebase's established per-module Razorpay pattern (Buffer
// basic-auth + `fetch` to `https://api.razorpay.com/v1/orders`), reusing the
// existing `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env vars — same as
// razorpay.controller.ts.
import { verifyRazorpaySignature } from "../../utils/razorpay.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import { getWallet, addTopup, TOKEN_PACKS, MONTHLY_GRANT } from "./tokenWallet.js";
import { insertTokenPackPurchase, getUserTier } from "./tokens.repository.js";
import { buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";

const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR"];

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/** `req.user` has no `plan` field — look it up from funda_users, defaulting
 * to "free" on a missing row or read failure (same fail-soft posture as the
 * rest of this endpoint). */
async function resolveTier(userId: string): Promise<string> {
    try {
        const { data, error } = await getUserTier(userId);
        if (error) throw error;
        return data?.plan || "free";
    } catch (err) {
        console.error("[FundaKaMental Tokens] tier lookup failed:", (err as Error)?.message || err);
        return "free";
    }
}

/* GET /fundakamental/tokens/wallet */
export const getWalletBalance = async (req, res) => {
    const tier = await resolveTier(req.user.authId);
    const w = await getWallet(req.user.authId, tier);
    return res.status(HTTP_STATUS.OK).json({
        balance: w.balance,
        monthly_balance: w.monthly_balance,
        monthly_grant: w.monthly_grant,
        topup_balance: w.topup_balance,
        tier,
        grants: MONTHLY_GRANT,
    });
};

/* GET /fundakamental/tokens/packs */
export const getPacks = async (_req, res) => {
    return res.status(HTTP_STATUS.OK).json({ packs: TOKEN_PACKS });
};

/* POST /fundakamental/tokens/order — create a Razorpay order for a top-up pack. */
export const createPackOrder = async (req, res) => {
    try {
        const { pack_id: packId, currency: reqCurrency } = req.body || {};
        const pack = TOKEN_PACKS[packId];
        if (!pack) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid pack" });
        }
        let currency = String(reqCurrency || "INR").toUpperCase();
        if (!SUPPORTED_CURRENCIES.includes(currency)) currency = "INR";
        const amount = pack.amounts[currency];
        if (amount === undefined) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Currency not available" });
        }
        if (!razorpayConfigured()) {
            return res.status(500).json({ error: "Payment service not configured" });
        }

        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount,
                currency,
                receipt: `fk_tok_${packId}_${Date.now()}`,
                notes: {
                    product: "fundakamental_tokens",
                    pack_id: packId,
                    tokens: String(pack.tokens),
                    user_id: String(req.user.authId || ""),
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
            pack: { id: packId, tokens: pack.tokens, label: pack.label, currency, amount },
        });
    } catch (err) {
        console.error("[FundaKaMental Tokens] order error:", err);
        return res.status(500).json({ error: `Payment error: ${(err as Error)?.message || err}` });
    }
};

/* Credits a FundaKaMental token pack for a paid order. The pack comes from
 * the order's notes, never from the request body. addTopup does not dedupe,
 * so this must only ever run under the shared payment_fulfillments claim —
 * before that existed, replaying one valid verify request credited the pack
 * again every time. */
export const fulfillFundakamentalTokens: Fulfiller = async ({ order, payment, notes, user, extras }) => {
    const packId = notes.pack_id;
    const pack = TOKEN_PACKS[packId];
    if (!pack) throw new FulfillmentError(`Unknown token pack "${packId}"`, "invalid_order");
    const currency = String(order.currency || "INR").toUpperCase();
    requireCatalogAmount(order, pack.amounts[currency]);

    const userId = user.authId;
    if (!userId) throw new FulfillmentError("Buyer has no auth id", "no_buyer");

    const tier = await resolveTier(userId);
    const w = await addTopup(userId, pack.tokens, tier);

    try {
        const { error } = await insertTokenPackPurchase({
            user_id: userId,
            pack_id: packId,
            tokens: pack.tokens,
            currency,
            region: String(notes.region || extras.region || "").toUpperCase() || null,
            amount: Number(order.amount) / 100.0,
            payment_id: payment.id,
            order_id: order.id,
            created_at: new Date().toISOString(),
        });
        if (error) throw error;
    } catch (err) {
        console.error("[FundaKaMental Tokens] purchase audit failed:", (err as Error)?.message || err);
    }

    return { tokens_added: pack.tokens, balance: w.balance };
};
registerFulfiller("fundakamental_tokens", fulfillFundakamentalTokens);

/* POST /fundakamental/tokens/verify — HMAC-verify, then credit via the
 * shared fulfilment path (idempotent with the Razorpay webhook). */
export const verifyPackPurchase = async (req, res) => {
    try {
        const {
            region,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
        } = req.body || {};

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ error: "Payment service not configured" });
        }
        if (!orderId || !paymentId || !signature) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Missing payment fields" });
        }

        if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Payment signature verification failed" });
        }

        const { result, alreadyFulfilled } = await fulfillRazorpayOrder({
            orderId,
            paymentId,
            source: "verify",
            expectedProducts: ["fundakamental_tokens"],
            requestUser: req.user,
            extras: { region },
        });
        if (alreadyFulfilled) {
            const w = await getWallet(req.user.authId, await resolveTier(req.user.authId));
            return res.status(HTTP_STATUS.OK).json({ success: true, ...result, balance: w.balance });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (err) {
        if (sendFulfillmentError(res, err, "FundaKaMental Tokens")) return;
        console.error("[FundaKaMental Tokens] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};
