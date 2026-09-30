// FundaKaMental Pro subscription — Node/TS port of
// `api/endpoints/razorpay_payments.py`.
//
// Flow:
//   1. POST /fundakamental/razorpay/order  -> create a Razorpay order for a
//      plan+currency
//   2. Razorpay Checkout (client)          -> user pays
//   3. POST /fundakamental/razorpay/verify -> verify signature, then
//      (server-side, using the Supabase service-role client) upgrade
//      funda_users.plan = 'premium' and record the payment in
//      funda_pro_plans. The client is NEVER trusted to grant Pro.
//   4. GET  /fundakamental/razorpay/plan   -> authoritative current plan for
//      the user, with expiry auto-downgrade back to free.
//
// Amounts are stored in the smallest currency unit (paise / cents).
//
// Security model (identical to this codebase's other Razorpay flows —
// algorithm.controller.ts, newsletterPlan.controller.ts): the ONLY code path
// that grants Pro is `verifyPayment`, and only after the Razorpay HMAC
// signature checks out. Amounts come from THIS server-side catalogue — the
// client never sends a price. Follows this codebase's established
// per-module Razorpay pattern (Buffer basic-auth + `fetch` to
// `https://api.razorpay.com/v1/orders`) rather than a shared client, reusing
// the existing `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env vars.
//
// Deviation from the Python source: `req.user.authId` (populated by
// `authenticate`) is the FundaKaMental user id here, matching every other
// controller in this module (see analysis.controller.ts's header comment) —
// the Python source's `current_user["id"]` is the same `auth.users.id`.
import { verifyRazorpaySignature } from "../../utils/razorpay.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import { getUserPlan, grantPro, downgradeToFree, insertProPayment } from "./razorpay.repository.js";
import { buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";

// Plan catalogue. Amounts in smallest unit: INR paise, USD/GBP/EUR cents.
const PRO_PLANS: Record<
    string,
    { label: string; billing: string; durationDays: number; amounts: Record<string, number> }
> = {
    pro_monthly: {
        label: "FundaKaMental Pro — Monthly",
        billing: "monthly",
        durationDays: 31,
        amounts: { INR: 49900, USD: 900, GBP: 700, EUR: 800 },
    },
    pro_yearly: {
        label: "FundaKaMental Pro — Yearly",
        billing: "yearly",
        durationDays: 366,
        amounts: { INR: 399900, USD: 5900, GBP: 4900, EUR: 5500 },
    },
};
const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR"];

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/* POST /fundakamental/razorpay/order — create a Razorpay order for a Pro plan. */
export const createOrder = async (req, res) => {
    try {
        const { plan_id: planId, currency: reqCurrency } = req.body || {};
        const plan = PRO_PLANS[planId];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid plan" });
        }
        if (!razorpayConfigured()) {
            return res.status(500).json({ error: "Payment service not configured" });
        }

        let currency = String(reqCurrency || "INR").toUpperCase();
        if (!SUPPORTED_CURRENCIES.includes(currency)) currency = "INR";
        const amount = plan.amounts[currency];
        if (amount === undefined) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Currency not available for this plan" });
        }

        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount,
                currency,
                receipt: `fk_${planId}_${Date.now()}`,
                notes: {
                    product: "fundakamental_pro",
                    plan_id: planId,
                    user_id: String(req.user.authId || ""),
                    user_email: String(req.user.email || "").slice(0, 254),
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
            plan: { id: planId, label: plan.label, currency, amount },
        });
    } catch (err) {
        console.error("[FundaKaMental Razorpay] order error:", err);
        return res.status(500).json({ error: `Payment error: ${(err as Error)?.message || err}` });
    }
};

/* Grants FundaKaMental Pro for a paid order. The plan comes from the
 * order's notes, never from the request body. Called by
 * modules/payments/fulfillment.ts from the verify endpoint and the webhook. */
export const fulfillFundakamentalPro: Fulfiller = async ({ order, payment, notes, user, extras }) => {
    const planId = notes.plan_id;
    const plan = PRO_PLANS[planId];
    if (!plan) throw new FulfillmentError(`Unknown FundaKaMental plan "${planId}"`, "invalid_order");
    const currency = String(order.currency || "INR").toUpperCase();
    requireCatalogAmount(order, plan.amounts[currency]);

    const userId = user.authId;
    if (!userId) throw new FulfillmentError("Buyer has no auth id", "no_buyer");

    const now = new Date();
    const validUntil = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const { error: userError } = await grantPro(userId, validUntil.toISOString());
    if (userError) throw userError;
    const { error: paymentError } = await insertProPayment({
        user_id: userId,
        plan_id: planId,
        billing: plan.billing,
        currency,
        region: String(notes.region || extras.region || "").toUpperCase() || null,
        amount: Number(order.amount) / 100.0,
        payment_id: payment.id,
        order_id: order.id,
        activated_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
    });
    if (paymentError) console.error("[FundaKaMental Razorpay] payment audit insert failed:", paymentError.message);

    return { plan: "premium", valid_until: validUntil.toISOString(), cloud_saved: true };
};
registerFulfiller("fundakamental_pro", fulfillFundakamentalPro);

/* POST /fundakamental/razorpay/verify — HMAC-verify, then grant via the
 * shared fulfilment path (idempotent with the Razorpay webhook). */
export const verifyPayment = async (req, res) => {
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

        const { result } = await fulfillRazorpayOrder({
            orderId,
            paymentId,
            source: "verify",
            expectedProducts: ["fundakamental_pro"],
            requestUser: req.user,
            extras: { region },
        });
        return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (err) {
        if (sendFulfillmentError(res, err, "FundaKaMental Razorpay")) return;
        console.error("[FundaKaMental Razorpay] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};

/* GET /fundakamental/razorpay/plan — authoritative plan, with expiry auto-downgrade. */
export const getPlan = async (req, res) => {
    const userId = req.user.authId;
    let plan = "free";
    let validUntil: string | null = null;

    try {
        const { data, error } = await getUserPlan(userId);
        if (error) throw error;
        const row: { plan?: string; plan_valid_until?: string | null } = data || {};
        plan = row.plan || plan;
        validUntil = row.plan_valid_until || null;

        // Expire a lapsed paid plan back to free.
        if ((plan === "premium" || plan === "enterprise") && validUntil) {
            const exp = new Date(validUntil);
            if (exp.getTime() < Date.now()) {
                const { error: downgradeError } = await downgradeToFree(userId);
                if (downgradeError) console.error("[FundaKaMental Razorpay] downgrade failed:", downgradeError.message);
                plan = "free";
                validUntil = null;
            }
        }
    } catch (err) {
        console.error("[FundaKaMental Razorpay] plan read failed:", (err as Error)?.message || err);
    }

    return res.status(HTTP_STATUS.OK).json({
        plan,
        is_pro: plan === "premium" || plan === "enterprise",
        valid_until: validUntil,
    });
};
