// Newsletter Pro plan — Razorpay checkout + server-authoritative plan storage.
//
// Security model (identical to the Learn plan):
//   • The ONLY code path that grants Pro is verifyNewsletterPayment, and only
//     after the Razorpay HMAC signature checks out.
//   • Rows are written with the Supabase service-role client (bypasses RLS);
//     clients can only SELECT their own row (see database/newsletter_pro_plans.sql).
//   • Amounts come from THIS server-side catalogue — the client never sends a price.
//
// Activating Pro also upgrades the subscriber's market preferences so the
// twice-daily generator immediately sends them the editions they paid for.
import { verifyRazorpaySignature } from "../../utils/razorpay.js";
import { addDays, stackValidUntil } from "../../utils/planExpiry.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import {
    updateSubscriberMarkets,
    getSubscriberByEmail,
    createSubscriber,
} from "./subscription.repository.js";
import {
    getNewsletterPlanByUserId,
    updateNewsletterPlanMarkets,
    upsertNewsletterPlan,
} from "./newsletterPlan.repository.js";
import { upsertEntitlement } from "../auth/entitlement.repository.js";
import { buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";

// Regional charm price points in the smallest unit (paise / cents).
// Kept in sync with Client/src/lib/newsletterPlan.js NEWSLETTER_PRICING.
const NEWSLETTER_PLANS = {
    newsletter_pro_monthly: {
        id: "newsletter_pro_monthly",
        label: "Xtin Market Brief Pro — Monthly",
        billing: "monthly",
        durationDays: 31,
        amounts: { INR: 14900, USD: 399, GBP: 349, EUR: 399 },
    },
    newsletter_pro_yearly: {
        id: "newsletter_pro_yearly",
        label: "Xtin Market Brief Pro — Yearly",
        billing: "yearly",
        durationDays: 366,
        amounts: { INR: 99900, USD: 2999, GBP: 2499, EUR: 2999 },
    },
};
const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR"];
const VALID_MARKETS = ["IN", "US", "GLOBAL"];

const razorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

function sanitizeMarkets(raw) {
    const parts = String(raw || "")
        .split(",")
        .map((p) => p.trim().toUpperCase())
        .filter((p) => VALID_MARKETS.includes(p));
    return parts.length ? Array.from(new Set(parts)).join(",") : "IN";
}

/* GET /api/newsletter/plan — authoritative plan for the logged-in user. */
export const getNewsletterPlan = async (req, res) => {
    try {
        const { data, error } = await getNewsletterPlanByUserId(req.user.userId);

        if (error && error.code !== "PGRST116") {
            console.error("[NewsletterPlan] read failed:", error.message);
        }

        let plan = data || null;
        if (plan?.valid_until && new Date(plan.valid_until).getTime() < Date.now()) {
            plan = null; // expired reads as free
        }

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Newsletter plan retrieved",
            data: plan,
        });
    } catch (err) {
        console.error("[NewsletterPlan] get error:", err);
        return res.status(500).json({ error: "Failed to read newsletter plan" });
    }
};

/* POST /api/newsletter/order — create a Razorpay order in the buyer's currency. */
export const createNewsletterOrder = async (req, res) => {
    try {
        const { plan_id: planId, currency: reqCurrency, region } = req.body || {};
        const plan = NEWSLETTER_PLANS[planId];
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
                receipt: `nl_${planId}_${Date.now()}`,
                notes: {
                    product: "xtin_newsletter_pro",
                    planId,
                    region: String(region || "").toUpperCase().slice(0, 10),
                    userId: String(req.user.userId || "").slice(0, 64),
                    userEmail: String(req.user.email || "").slice(0, 254),
                    ...buyerNotes(req.user),
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
        console.error("[NewsletterPlan] order error:", err);
        return res.status(503).json({ error: `Payment gateway unreachable: ${err.message}` });
    }
};

/* Grants Market Brief Pro for a paid order. The plan comes from the order's
 * notes, never from the request body; `markets` is only a delivery
 * preference, so it may come from the verify body. Called by
 * modules/payments/fulfillment.ts from the verify endpoint and the webhook. */
export const fulfillNewsletterPro: Fulfiller = async ({ order, payment, notes, user, extras }) => {
    const planId = notes.planId;
    const plan = NEWSLETTER_PLANS[planId];
    if (!plan) throw new FulfillmentError(`Unknown Newsletter plan "${planId}"`, "invalid_order");
    const currency = String(order.currency || "INR").toUpperCase();
    requireCatalogAmount(order, plan.amounts[currency]);

    return persistNewsletterPlan({
        user,
        plan,
        planId,
        paymentId: payment.id,
        orderId: order.id,
        currency,
        region: notes.region || extras.region,
        markets: extras.markets || notes.markets,
        strict: true,
    });
};
registerFulfiller("xtin_newsletter_pro", fulfillNewsletterPro);

/* POST /api/newsletter/verify — HMAC-verify, then grant Pro + set markets via
 * the shared fulfilment path (idempotent with the Razorpay webhook). */
export const verifyNewsletterPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            region,
            markets,
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
            expectedProducts: ["xtin_newsletter_pro"],
            requestUser: req.user,
            extras: { region, markets },
        });
        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Market Brief Pro activated",
            data: result,
        });
    } catch (err) {
        if (sendFulfillmentError(res, err, "NewsletterPlan")) return;
        console.error("[NewsletterPlan] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};

/*
 * PUT /api/newsletter/markets — update which markets the (Pro) subscriber
 * receives. Free users can set a preference too; it only takes effect for the
 * markets their tier is entitled to at send time.
 */
export const updateNewsletterMarkets = async (req, res) => {
    try {
        const email = req.user.email;
        if (!email) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No email on account" });
        const markets = sanitizeMarkets(req.body?.markets);

        let existing = null;
        try { existing = await getSubscriberByEmail(email); } catch { /* column/table may not exist */ }

        if (existing) {
            await updateSubscriberMarkets(email, markets).catch((e) => {
                if (!/column|schema/i.test(e.message || "")) throw e;
            });
        } else {
            // Not subscribed yet — create the subscription with the preference.
            await createSubscriber({
                email,
                name: [req.user.first_name, req.user.last_name].filter(Boolean).join(" ") || undefined,
                markets,
            }).catch(() => {});
        }

        // Mirror onto the plan row too (used by the generator + client display).
        await updateNewsletterPlanMarkets(req.user.userId, markets);

        return res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            message: "Market preferences updated",
            data: { markets },
        });
    } catch (err) {
        console.error("[NewsletterPlan] markets error:", err);
        return res.status(500).json({ error: "Failed to update market preferences" });
    }
};

/* POST /api/newsletter/dev-activate — local development ONLY. */
export const devActivateNewsletterPlan = async (req, res) => {
    if (process.env.NODE_ENV === "production" || razorpayConfigured()) {
        return res.status(403).json({ error: "Not available" });
    }
    const planId =
        req.body?.plan_id === "newsletter_pro_monthly" ? "newsletter_pro_monthly" : "newsletter_pro_yearly";
    const plan = NEWSLETTER_PLANS[planId];
    const record = await persistNewsletterPlan({
        user: req.user,
        plan,
        planId,
        paymentId: "dev_simulated",
        orderId: `dev_${Date.now()}`,
        currency: req.body?.currency,
        region: req.body?.region,
        markets: req.body?.markets,
    });
    return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: "Dev plan activated (no real payment)",
        data: record,
    });
};

async function persistNewsletterPlan({ user, plan, planId, paymentId, orderId, currency, region, markets, strict = false }: {
    user: { userId: string; authId?: string | null; email?: string };
    plan: (typeof NEWSLETTER_PLANS)[keyof typeof NEWSLETTER_PLANS];
    planId: string;
    paymentId: string;
    orderId: string;
    currency?: unknown;
    region?: unknown;
    markets?: unknown;
    /** Throw on a failed write so the webhook retries (real payments); dev activation stays best-effort. */
    strict?: boolean;
}) {
    const now = new Date();
    const { data: existingPlan } = await getNewsletterPlanByUserId(user.userId);
    const validUntil = stackValidUntil({ existingValidUntil: existingPlan?.valid_until, existingPaymentId: existingPlan?.payment_id, paymentId, extend: addDays(plan.durationDays), now });
    const marketsCsv = sanitizeMarkets(markets);
    const record = {
        user_id: String(user.userId),
        auth_id: user.authId || null,
        plan_id: planId,
        billing: plan.billing,
        currency: String(currency || "INR").toUpperCase(),
        region: (String(region || "").toUpperCase() || null),
        markets: marketsCsv,
        activated_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
        payment_id: paymentId,
        order_id: orderId,
        user_email: String(user.email || "").slice(0, 254),
        updated_at: now.toISOString(),
    };

    const { error } = await upsertNewsletterPlan(record);
    if (error && strict) throw error;
    if (error) {
        console.error("[NewsletterPlan] persist failed:", error.message);
    }
    await upsertEntitlement({
        userId: record.user_id,
        authId: record.auth_id,
        product: "newsletter",
        validUntil: record.valid_until,
        sourceTable: "newsletter_pro_plans",
    });

    // Make sure the subscriber list reflects their paid market choices so the
    // very next edition reaches them. Best-effort — never fail the response.
    if (user.email) {
        try {
            const existing = await getSubscriberByEmail(user.email);
            if (existing) await updateSubscriberMarkets(user.email, marketsCsv);
            else await createSubscriber({ email: user.email, markets: marketsCsv });
        } catch (e) {
            console.warn("[NewsletterPlan] subscriber sync skipped:", e.message);
        }
    }

    return record;
}
