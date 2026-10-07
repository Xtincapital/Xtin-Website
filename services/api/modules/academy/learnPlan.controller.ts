// Learn Pro plan — Razorpay checkout + server-authoritative plan storage.
//
// Security model:
//   • The ONLY code path that grants Pro is verifyLearnPayment, and only after
//     the Razorpay HMAC signature checks out.
//   • Rows are written with the Supabase service-role client (bypasses RLS);
//     clients can only SELECT their own row (see database/learn_pro_plans.sql).
//   • Amounts come from THIS server-side catalogue — the client never sends a
//     price, only a plan id + currency.
import { verifyRazorpaySignature } from "../../utils/razorpay.js";
import { addDays, stackValidUntil } from "../../utils/planExpiry.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import { PREMIUM_VIDEO_IDS } from "../../data/premiumVideoIds.js";
import { getLearnPlanByUserId, upsertLearnPlan } from "./learnPlan.repository.js";
import { upsertEntitlement } from "../auth/entitlement.repository.js";
import { buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";
import { priceOrderOrRespond } from "../coupons/coupons.service.js";

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

        const priced = await priceOrderOrRespond(req, res, {
            product: "xtin_learn_pro",
            amount: amount,
            currency,
            notes: {
                    product: "xtin_learn_pro",
                    planId,
                    region: String(region || "").toUpperCase().slice(0, 10),
                    userId: String(req.user.userId || "").slice(0, 64),
                    userEmail: String(req.user.email || "").slice(0, 254),
                    ...buyerNotes(req.user),
                },
        });
        if (!priced) return; // invalid code (400 sent) or made free and already granted
        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: priced.amount,
                currency,
                receipt: `learn_${planId}_${Date.now()}`,
                notes: priced.notes,
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

/* Grants Xtin Academy Pro for a paid order. The plan comes from the order's
 * notes, never from the request body. Called by modules/payments/fulfillment.ts
 * from the verify endpoint and the webhook. */
export const fulfillLearnPro: Fulfiller = async ({ order, payment, notes, user, extras }) => {
    const planId = notes.planId;
    const plan = LEARN_PLANS[planId];
    if (!plan) throw new FulfillmentError(`Unknown Learn plan "${planId}"`, "invalid_order");
    const currency = String(order.currency || "INR").toUpperCase();
    requireCatalogAmount(order, plan.amounts[currency]);

    return persistLearnPlan({
        user,
        plan,
        planId,
        paymentId: payment.id,
        orderId: order.id,
        currency,
        region: notes.region || extras.region,
        strict: true,
    });
};
registerFulfiller("xtin_learn_pro", fulfillLearnPro);

/* POST /api/learn/verify — HMAC-verify the payment, then grant Pro via the
 * shared fulfilment path (idempotent with the Razorpay webhook). */
export const verifyLearnPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            region,
        } = req.body || {};

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ error: "Payment service not configured" });
        }
        if (!orderId || !paymentId || !signature) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Missing payment fields" });
        }

        if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: "Payment signature verification failed",
            });
        }

        const { result } = await fulfillRazorpayOrder({
            orderId,
            paymentId,
            source: "verify",
            expectedProducts: ["xtin_learn_pro"],
            requestUser: req.user,
            extras: { region },
        });
        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Xtin Academy Pro activated",
            data: result,
        });
    } catch (err) {
        if (sendFulfillmentError(res, err, "LearnPlan")) return;
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
        user: req.user,
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

async function persistLearnPlan({ user, plan, planId, paymentId, orderId, currency, region, strict = false }: {
    user: { userId: string; authId?: string | null; email?: string };
    plan: (typeof LEARN_PLANS)[keyof typeof LEARN_PLANS];
    planId: string;
    paymentId: string;
    orderId: string;
    currency?: unknown;
    region?: unknown;
    /** Throw on a failed write so the webhook retries (real payments); dev activation stays best-effort. */
    strict?: boolean;
}) {
    const now = new Date();
    // Renewals stack on the days left.
    const { data: existingPlan } = await getLearnPlanByUserId(user.userId);
    const validUntil = stackValidUntil({ existingValidUntil: existingPlan?.valid_until, existingPaymentId: existingPlan?.payment_id, paymentId, extend: addDays(plan.durationDays), now });
    const record = {
        user_id: String(user.userId),
        auth_id: user.authId || null,
        plan_id: planId,
        billing: plan.billing,
        currency: String(currency || "INR").toUpperCase(),
        region: (String(region || "").toUpperCase() || null),
        activated_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
        payment_id: paymentId,
        order_id: orderId,
        user_email: String(user.email || "").slice(0, 254),
        updated_at: now.toISOString(),
    };

    const { error } = await upsertLearnPlan(record);
    if (error && strict) throw error;
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

/* ---------- premium video modules ---------- */

/** GET /api/learn/videos/:slug — public. Which paid lessons have a video yet (numbers only, never IDs). */
export const getVideoModuleAvailability = (req, res) => {
    const ids = PREMIUM_VIDEO_IDS[req.params.slug];
    if (!ids) return res.status(404).json({ error: "Unknown module" });
    const available = Object.entries(ids)
        .filter(([, id]) => Boolean(id))
        .map(([n]) => Number(n))
        .sort((a, b) => a - b);
    return res.status(HTTP_STATUS.OK).json({ status: HTTP_STATUS.OK, data: { available } });
};

/** GET /api/learn/videos/:slug/:lesson — Academy Pro only; returns the YouTube ID. */
export const getPaidLessonVideo = async (req, res) => {
    try {
        const ids = PREMIUM_VIDEO_IDS[req.params.slug];
        const lesson = Number(req.params.lesson);
        if (!ids || !Number.isInteger(lesson) || lesson < 2) {
            return res.status(404).json({ error: "Unknown lesson" });
        }

        const { data: plan, error } = await getLearnPlanByUserId(req.user.userId);
        if (error && error.code !== "PGRST116") {
            console.error("[LearnPlan] video plan read failed:", error.message);
            return res.status(500).json({ error: "Failed to verify plan" });
        }
        const isPro = Boolean(plan) && !(plan.valid_until && new Date(plan.valid_until).getTime() < Date.now());
        if (!isPro) {
            return res.status(403).json({ error: "Academy Pro required", code: "PRO_REQUIRED" });
        }

        const videoId = ids[lesson];
        if (!videoId) return res.status(404).json({ error: "Video coming soon", code: "NOT_PUBLISHED" });
        return res.status(HTTP_STATUS.OK).json({ status: HTTP_STATUS.OK, data: { videoId } });
    } catch (err) {
        console.error("[LearnPlan] video error:", err);
        return res.status(500).json({ error: "Failed to load video" });
    }
};
