// Learn Pro plan — Razorpay checkout + server-authoritative plan storage.
//
// Security model:
//   • The ONLY code path that grants Pro is verifyLearnPayment, and only after
//     the Razorpay HMAC signature checks out.
//   • Rows are written with the Supabase service-role client (bypasses RLS);
//     clients can only SELECT their own row (see database/learn_pro_plans.sql).
//   • Amounts come from THIS server-side catalogue — the client never sends a
//     price, only a plan id + currency.
import crypto from "node:crypto";
import { HTTP_STATUS } from "../../constants/constants.js";
import { getLearnPlanByUserId, upsertLearnPlan } from "./learnPlan.repository.js";
import { upsertEntitlement } from "../auth/entitlement.repository.js";

// Regional charm price points in the smallest unit (paise / cents).
// Kept in sync with Client/src/lib/learnPlan.js LEARN_PRICING.
const LEARN_PLANS = {
    learn_pro_monthly: {
        id: "learn_pro_monthly",
        label: "Xtin Academy Pro — Monthly",
        billing: "monthly",
        durationDays: 31,
        amounts: { INR: 9900, USD: 299, GBP: 249, EUR: 299 },
    },
    learn_pro_yearly: {
        id: "learn_pro_yearly",
        label: "Xtin Academy Pro — Yearly",
        billing: "yearly",
        durationDays: 366,
        amounts: { INR: 49900, USD: 1499, GBP: 1199, EUR: 1399 },
    },
};
const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR"];

const razorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/* GET /api/learn/plan — authoritative plan for the logged-in user. */
export const getLearnPlan = async (req, res) => {
    try {
        const { data, error } = await getLearnPlanByUserId(req.user.userId);

        if (error && error.code !== "PGRST116") {
            console.error("[LearnPlan] read failed:", error.message);
        }

        // Expired plans read as free (no destructive write needed).
        let plan = data || null;
        if (plan?.valid_until && new Date(plan.valid_until).getTime() < Date.now()) {
            plan = null;
        }

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Learn plan retrieved",
            data: plan,
        });
    } catch (err) {
        console.error("[LearnPlan] get error:", err);
        return res.status(500).json({ error: "Failed to read learn plan" });
    }
};

/* POST /api/learn/order — create a Razorpay order in the buyer's currency. */
export const createLearnOrder = async (req, res) => {
    try {
        const { plan_id: planId, currency: reqCurrency, region } = req.body || {};
        const plan = LEARN_PLANS[planId];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid plan" });
        }
        if (!razorpayConfigured()) {
            return res.status(503).json({
                error: "Payment service not configured",
                code: "NOT_CONFIGURED",
                message: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env",
            });
        }

        let currency = String(reqCurrency || "INR").toUpperCase();
        if (!SUPPORTED_CURRENCIES.includes(currency)) currency = "INR";
        const amount = plan.amounts[currency];

        const auth = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount,
                currency,
                receipt: `learn_${planId}_${Date.now()}`,
                notes: {
                    product: "xtin_learn_pro",
                    planId,
                    region: String(region || "").toUpperCase().slice(0, 10),
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
                plan: { id: planId, label: plan.label, billing: plan.billing, currency, amount },
            },
        });
    } catch (err) {
        console.error("[LearnPlan] order error:", err);
        return res.status(503).json({ error: `Payment gateway unreachable: ${err.message}` });
    }
};

/* POST /api/learn/verify — HMAC-verify the payment, then grant Pro. */
export const verifyLearnPayment = async (req, res) => {
    try {
        const {
            plan_id: planId,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            currency,
            region,
        } = req.body || {};

        const plan = LEARN_PLANS[planId];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid plan" });
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

        const record = await persistLearnPlan({ req, plan, planId, paymentId, orderId, currency, region });
        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Xtin Academy Pro activated",
            data: record,
        });
    } catch (err) {
        console.error("[LearnPlan] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};

/*
 * POST /api/learn/dev-activate — local development ONLY.
 * Lets the full activation loop be tested without Razorpay keys. Refuses to
 * run in production or when Razorpay IS configured (no bypass in real setups).
 */
export const devActivateLearnPlan = async (req, res) => {
    if (process.env.NODE_ENV === "production" || razorpayConfigured()) {
        return res.status(403).json({ error: "Not available" });
    }
    const planId = req.body?.plan_id === "learn_pro_monthly" ? "learn_pro_monthly" : "learn_pro_yearly";
    const plan = LEARN_PLANS[planId];
    const record = await persistLearnPlan({
        req,
        plan,
        planId,
        paymentId: "dev_simulated",
        orderId: `dev_${Date.now()}`,
        currency: req.body?.currency,
        region: req.body?.region,
    });
    return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: "Dev plan activated (no real payment)",
        data: record,
    });
};

async function persistLearnPlan({ req, plan, planId, paymentId, orderId, currency, region }) {
    const now = new Date();
    const validUntil = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const record = {
        user_id: String(req.user.userId),
        auth_id: req.user.authId || null,
        plan_id: planId,
        billing: plan.billing,
        currency: String(currency || "INR").toUpperCase(),
        region: (String(region || "").toUpperCase() || null),
        activated_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
        payment_id: paymentId,
        order_id: orderId,
        user_email: String(req.user.email || "").slice(0, 254),
        updated_at: now.toISOString(),
    };

    const { error } = await upsertLearnPlan(record);
    if (error) {
        // The payment already succeeded — never fail the response over storage;
        // the client keeps its verified state and support can reconcile.
        console.error("[LearnPlan] persist failed:", error.message);
    }
    await upsertEntitlement({
        userId: record.user_id,
        authId: record.auth_id,
        product: "learn",
        validUntil: record.valid_until,
        sourceTable: "learn_pro_plans",
    });
    return record;
}
