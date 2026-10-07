// Backtest Pro passes — one-time Razorpay purchases (no auto-renew).
//
// Uses the shared fulfilment path (modules/payments/fulfillment.ts) exactly like
// Journal/Gini/FundaKaMental, so a pass is granted once whether the browser's
// /verify call or Razorpay's webhook gets there first. What is granted — which
// pass, to whom, for how long — comes only from the order Razorpay stores (its
// server-set `notes` and the amount actually paid), never from the request body.
//
// Renewals stack: buying again while a pass is running adds the new period on
// top of the remaining days; a retry of the same payment never adds twice.
import { HTTP_STATUS } from "../../constants/constants.js";
import { verifyRazorpaySignature, razorpayConfigured } from "../../utils/razorpay.js";
import { addDays, stackValidUntil } from "../../utils/planExpiry.js";
import { buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";
import { invalidateEntitlementCache, PASSES } from "./plans.js";
import { getProPlan, upsertProPlan } from "./repository.js";
import { validatePassOrder, validatePassVerify } from "./validator.js";
import { priceOrderOrRespond } from "../coupons/coupons.service.js";

export const BACKTEST_PRODUCT = "backtest_pro_pass";

/* GET /backtest/passes — public catalogue (amounts in paise, INR). */
export const listPasses = (_req, res) =>
    res.status(HTTP_STATUS.OK).json({
        currency: "INR",
        passes: Object.values(PASSES).map((p) => ({ id: p.id, label: p.label, days: p.days, amount_paise: p.amountPaise, tag: p.tag })),
    });

/* POST /backtest/razorpay/order — create a Razorpay order for a pass. */
export const createPassOrder = async (req, res) => {
    try {
        const validation = validatePassOrder(req.body);
        if (validation.errors) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        const pass = PASSES[validation.data.pass_id];
        if (!pass) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid pass" });
        if (!razorpayConfigured()) return res.status(500).json({ error: "Payment service not configured" });

        const userId = req.user.authId;
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
        const priced = await priceOrderOrRespond(req, res, {
            product: BACKTEST_PRODUCT,
            amount: pass.amountPaise,
            currency: "INR",
            notes: { product: BACKTEST_PRODUCT, pass_id: pass.id, user_id: String(userId || ""), ...buyerNotes(req.user) },
        });
        if (!priced) return; // invalid code (400 sent) or made free and already granted
        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: priced.amount,
                currency: "INR",
                receipt: `bt_${pass.id}_${String(userId || "").slice(-8)}_${Date.now()}`.slice(0, 40),
                notes: priced.notes,
            }),
        });
        const order: any = await rpRes.json();
        if (!rpRes.ok) return res.status(rpRes.status).json({ error: order?.error?.description || "Unable to create order" });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID,
            order,
            pass: { id: pass.id, label: pass.label, days: pass.days, currency: "INR", amount_paise: pass.amountPaise },
        });
    } catch (err) {
        console.error("[Backtest Pass] order error:", err);
        return res.status(500).json({ error: `Payment error: ${(err as Error)?.message || err}` });
    }
};

/* Grants the pass for a paid order. Called by fulfillment.ts from both the verify endpoint and the webhook. */
export const fulfillBacktestPass: Fulfiller = async ({ order, payment, notes, user }) => {
    const pass = PASSES[notes.pass_id];
    if (!pass) throw new FulfillmentError(`Unknown Backtest pass "${notes.pass_id}"`, "invalid_order");
    if (String(order.currency || "").toUpperCase() !== "INR") throw new FulfillmentError(`Backtest passes are INR only (order is ${order.currency})`, "amount_mismatch");
    requireCatalogAmount(order, pass.amountPaise);

    const userId = user.authId;
    if (!userId) throw new FulfillmentError("Buyer has no auth id", "no_buyer");

    const now = new Date();
    const existing = await getProPlan(userId);
    const validUntil = stackValidUntil({
        existingValidUntil: existing?.valid_until,
        existingPaymentId: existing?.payment_id,
        paymentId: payment.id,
        extend: addDays(pass.days),
        now,
    });

    // Server-side, service-role write. This is the ONLY place a pass is granted.
    await upsertProPlan({
        user_id: userId,
        pass_id: pass.id,
        valid_until: validUntil.toISOString(),
        payment_id: payment.id,
        order_id: order.id,
        amount_paise: Number(order.amount),
        currency: "INR",
    });

    invalidateEntitlementCache(userId);
    return { pass, payment_id: payment.id, order_id: order.id, valid_until: validUntil.toISOString() };
};
registerFulfiller(BACKTEST_PRODUCT, fulfillBacktestPass);

/* POST /backtest/razorpay/verify — HMAC-verify, then grant via the shared fulfilment path. */
export const verifyPassPurchase = async (req, res) => {
    try {
        const validation = validatePassVerify(req.body);
        if (validation.errors) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: "Payment service not configured" });
        if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Payment signature verification failed" });
        }

        const { result } = await fulfillRazorpayOrder({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            source: "verify",
            expectedProducts: [BACKTEST_PRODUCT],
            requestUser: req.user,
        });
        return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (err) {
        if (sendFulfillmentError(res, err, "Backtest Pass")) return;
        console.error("[Backtest Pass] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};
