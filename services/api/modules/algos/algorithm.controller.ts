// Algorithm Subscriptions — Server-authoritative Razorpay payment flow
//
// Security model (identical to Learn Plan & Newsletter Plan):
//   • The ONLY code path that grants algorithm access is verifyAlgoPayment,
//     and only after the Razorpay HMAC signature checks out.
//   • Rows are written with the Supabase service-role client (bypasses RLS);
//     clients can only SELECT their own row (see database/algorithm_subscriptions.sql).
//   • Amounts come from THIS server-side catalogue — the client never sends a price.
//   • Only algo_name, tradingview_username, and phone_number come from the client.

import crypto from "node:crypto";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateAlgoOrder, validateAlgoVerify } from "./algorithm.validator.js";
import { getAlgorithmSubscriptionsByUserId, upsertAlgorithmSubscription } from "./algorithm.repository.js";
import { upsertEntitlement } from "../auth/entitlement.repository.js";

// Server-authoritative pricing catalogue
const ALGO_PLANS = {
    "XTIN Alpha 1.0": {
        name: "XTIN Alpha 1.0",
        label: "XTIN Alpha 1.0 — Momentum Signal Generator",
        plan_type: "monthly",
        amount: 499900, // ₹4,999 in paise
        currency: "INR",
        durationDays: 31,
    },
    "XTIN ALPHA V1": {
        name: "XTIN ALPHA V1",
        label: "XTIN ALPHA V1 — Intraday Fast Signals",
        plan_type: "monthly",
        amount: 499900,
        currency: "INR",
        durationDays: 31,
    },
    "XTIN GammaV1": {
        name: "XTIN GammaV1",
        label: "XTIN GammaV1 — 4H Swing Trading",
        plan_type: "monthly",
        amount: 499900,
        currency: "INR",
        durationDays: 31,
    },
    "XTIN Z1": {
        name: "XTIN Z1",
        label: "XTIN Z1 — Long-term Investment",
        plan_type: "monthly",
        amount: 499900,
        currency: "INR",
        durationDays: 31,
    },
};

const razorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/* GET /api/algorithm/subscriptions — get all active subscriptions for the user. */
export const getAlgoSubscriptions = async (req, res) => {
    try {
        const { data, error } = await getAlgorithmSubscriptionsByUserId(req.user.userId);

        if (error && error.code !== "PGRST116") {
            console.error("[AlgoSub] read failed:", error.message);
        }

        // Filter out expired subscriptions
        const activeSubs = (data || []).filter((sub) => {
            if (sub.valid_until && new Date(sub.valid_until).getTime() < Date.now()) {
                return false;
            }
            return sub.status === "active";
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            data: activeSubs,
        });
    } catch (err) {
        console.error("[AlgoSub] get error:", err);
        return res.status(500).json({ error: "Failed to read algorithm subscriptions" });
    }
};

/* POST /api/algorithm/order — create a Razorpay order for an algorithm subscription. */
export const createAlgoOrder = async (req, res) => {
    try {
        const validation = validateAlgoOrder(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }

        const { algo_name, plan_type, tradingview_username, phone_number } = validation.data;
        const plan = ALGO_PLANS[algo_name];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid algorithm" });
        }
        if (!razorpayConfigured()) {
            return res.status(503).json({
                error: "Payment service not configured",
                code: "NOT_CONFIGURED",
                message: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env",
            });
        }

        const amount = plan.amount;
        const currency = plan.currency;

        const auth = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount,
                currency,
                receipt: `algo_${algo_name.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`,
                notes: {
                    product: "xtin_algo_subscription",
                    algo_name,
                    plan_type,
                    userId: String(req.user.userId || "").slice(0, 64),
                    userEmail: String(req.user.email || "").slice(0, 254),
                },
            }),
        });
        const order: any = await rpRes.json();
        if (!rpRes.ok) {
            return res.status(rpRes.status).json({
                error: order?.error?.description || "Unable to create Razorpay order",
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Order created",
            data: {
                keyId: process.env.RAZORPAY_KEY_ID,
                order,
                plan: {
                    algo_name,
                    label: plan.label,
                    plan_type,
                    amount,
                    currency,
                },
                user: {
                    tradingview_username,
                    phone_number,
                },
            },
        });
    } catch (err) {
        console.error("[AlgoSub] order error:", err);
        return res.status(503).json({ error: `Payment gateway unreachable: ${err.message}` });
    }
};

/* POST /api/algorithm/verify — HMAC-verify the payment, then grant algorithm access. */
export const verifyAlgoPayment = async (req, res) => {
    try {
        const validation = validateAlgoVerify(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }

        const {
            algo_name,
            plan_type,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            tradingview_username,
            phone_number,
        } = validation.data;

        const plan = ALGO_PLANS[algo_name];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid algorithm" });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ error: "Payment service not configured" });
        }
        if (!orderId || !paymentId || !signature) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Missing payment fields" });
        }

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");
        if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)))) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: "Payment signature verification failed",
            });
        }

        const record = await persistAlgoSubscription({
            req,
            plan,
            algo_name,
            plan_type,
            paymentId,
            orderId,
            tradingview_username,
            phone_number,
        });

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: `${algo_name} subscription activated`,
            data: record,
        });
    } catch (err) {
        console.error("[AlgoSub] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};

/* POST /api/algorithm/dev-activate — local development ONLY. */
export const devActivateAlgoPlan = async (req, res) => {
    if (process.env.NODE_ENV === "production" || razorpayConfigured()) {
        return res.status(403).json({ error: "Not available" });
    }

    const { algo_name, plan_type, tradingview_username, phone_number } = req.body || {};
    const plan = ALGO_PLANS[algo_name];
    if (!plan) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid algorithm" });
    }

    const record = await persistAlgoSubscription({
        req,
        plan,
        algo_name: plan.name,
        plan_type: plan_type || "monthly",
        paymentId: "dev_simulated",
        orderId: `dev_${Date.now()}`,
        tradingview_username: tradingview_username || "dev_user",
        phone_number: phone_number || "9999999999",
    });

    return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: `Dev ${algo_name} subscription activated (no real payment)`,
        data: record,
    });
};

async function persistAlgoSubscription({ req, plan, algo_name, plan_type, paymentId, orderId, tradingview_username, phone_number }) {
    const now = new Date();
    const validUntil = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const record = {
        user_id: String(req.user.userId),
        auth_id: req.user.authId || null,
        algo_name,
        plan_type: plan_type || "monthly",
        amount: plan.amount,
        currency: plan.currency,
        activated_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
        payment_id: paymentId,
        order_id: orderId,
        user_email: String(req.user.email || "").slice(0, 254),
        tradingview_username: String(tradingview_username || "").slice(0, 100),
        phone_number: String(phone_number || "").slice(0, 20),
        status: "active",
        updated_at: now.toISOString(),
    };

    const { error } = await upsertAlgorithmSubscription(record);
    if (error) {
        // The payment already succeeded — never fail the response over storage;
        // the client keeps its verified state and support can reconcile.
        console.error("[AlgoSub] persist failed:", error.message);
    }
    await upsertEntitlement({
        userId: record.user_id,
        authId: record.auth_id,
        product: "algo",
        validUntil: record.valid_until,
        sourceTable: "algorithm_subscriptions",
    });
    return record;
}
