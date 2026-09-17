// Journal Pro plan purchase API — Node/TS port of
// `features-incoming/journal/main.py`'s `POST /api/v2/plan/razorpay/order`,
// `POST /api/v2/plan/razorpay/verify`, `GET /api/v2/plan` (Phase 9c).
//
// Follows this codebase's established per-module Razorpay pattern (Buffer
// basic-auth + `fetch` to `https://api.razorpay.com/v1/orders`), same as
// aiWallet.controller.ts / fundakamental/razorpay.controller.ts, reusing the
// existing `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` env vars.
//
// Auth: every route requires `authenticate` (see proPlan.routes.ts).
// `req.user.authId`/`req.user.email` are the trusted user id/email — unlike
// the Python source (whose `PlanOrderRequest`/`PlanVerifyRequest` models
// trusted client-supplied `user_id`/`user_email` fields), request bodies
// here never carry either.
//
// Two side effects on a verified purchase, both ported from main.py's
// `plan_razorpay_verify`:
//   1. persist the plan to `journal_pro_plans` (upsert by user_id — one row
//      per user, matches the table's primary key).
//   2. grant a 100,000 AI-token bonus via aiWallet.repository.ts's
//      `addAiTokens` ("pro_included" source, matches the Python source
//      exactly) — idempotency-guarded the same way aiWallet.controller.ts
//      guards token-pack purchases, via journal_ai_wallet_purchases (see
//      aiWalletPurchases.repository.ts's header comment: `addAiTokens`
//      itself does not dedupe on payment_id, so callers must check first).
// Also invalidates planTier.ts's 60s cache so the tier upgrade is visible
// immediately (port of main.py's `PLAN_TIER_CACHE.pop(request.user_id, None)`).
import crypto from "node:crypto";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateProPlanOrder, validateProPlanVerify } from "./proPlan.validator.js";
import { getProPlanByUser, upsertProPlan } from "./proPlan.repository.js";
import { addAiTokens } from "./aiWallet.repository.js";
import { findPurchaseByPaymentId, insertAiWalletPurchase } from "./aiWalletPurchases.repository.js";
import { invalidatePlanTierCache } from "./planTier.js";

// Port of main.py's PRO_PLANS. Amounts are whole units per currency
// (multiplied by 100 for paise/cents only at Razorpay order-creation time,
// matching the source's `create_plan_order_in_currency`).
const PRO_PLANS: Record<
    string,
    { id: string; label: string; billing: string; durationDays: number; amounts: Record<string, number> }
> = {
    journal_pro_monthly: {
        id: "journal_pro_monthly",
        label: "Journal Pro — Monthly",
        billing: "monthly",
        durationDays: 31,
        amounts: { INR: 299, USD: 5, GBP: 4, EUR: 5 },
    },
    journal_pro_yearly: {
        id: "journal_pro_yearly",
        label: "Journal Pro — Yearly",
        billing: "yearly",
        durationDays: 366,
        amounts: { INR: 2399, USD: 39, GBP: 29, EUR: 39 },
    },
};
const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR"];
const PRO_INCLUDED_AI_TOKENS = 100_000;

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/* POST /journal/plan/razorpay/order — create a Razorpay order for a Pro plan
 * in the buyer's currency. Port of main.py's `plan_razorpay_order` /
 * `create_plan_order_in_currency`. */
export const createPlanOrder = async (req, res) => {
    try {
        const validation = validateProPlanOrder(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }
        const plan = PRO_PLANS[validation.data.plan_id];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid plan" });
        }
        if (!razorpayConfigured()) {
            return res.status(500).json({ error: "Payment service not configured" });
        }

        let currency = String(validation.data.currency || "INR").toUpperCase();
        if (!SUPPORTED_CURRENCIES.includes(currency)) currency = "INR";
        let amountWhole = plan.amounts[currency];
        if (amountWhole === undefined) {
            currency = "INR";
            amountWhole = plan.amounts.INR;
        }

        const userId = req.user.authId;
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: Math.round(amountWhole * 100),
                currency,
                receipt: `journal_pro_${String(userId || "").slice(-8)}_${Date.now()}`,
                notes: { product: "journal_pro_plan", plan_id: plan.id, user_id: String(userId || "") },
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
            plan: { id: plan.id, label: plan.label, billing: plan.billing, currency, amount: amountWhole },
        });
    } catch (err) {
        console.error("[Journal Pro Plan] order error:", err);
        return res.status(500).json({ error: `Payment error: ${(err as Error)?.message || err}` });
    }
};

/* POST /journal/plan/razorpay/verify — HMAC-verify, persist the plan, grant
 * the AI-token bonus, invalidate the plan-tier cache. Port of main.py's
 * `plan_razorpay_verify`. */
export const verifyPlanPurchase = async (req, res) => {
    try {
        const validation = validateProPlanVerify(req.body);
        if (validation.errors) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
        }
        const { plan_id, currency: reqCurrency, region, razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        const plan = PRO_PLANS[plan_id];
        if (!plan) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid plan" });
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

        let currency = String(reqCurrency || "INR").toUpperCase();
        if (!SUPPORTED_CURRENCIES.includes(currency)) currency = "INR";

        const now = new Date();
        const validUntil = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

        // Server-side, service-role write. This is the ONLY place Pro is granted.
        let cloudSaved = false;
        try {
            const { error } = await upsertProPlan({
                user_id: userId,
                plan_id: plan.id,
                billing: plan.billing,
                currency,
                region: String(region || "").toUpperCase() || null,
                activated_at: now.toISOString(),
                valid_until: validUntil.toISOString(),
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                user_email: String(req.user.email || "").slice(0, 254),
                updated_at: now.toISOString(),
            });
            if (error) throw error;
            cloudSaved = true;
        } catch (err) {
            console.error("[Journal Pro Plan] verify write failed:", (err as Error)?.message || err);
        }

        // Pro purchase also grants a 100,000 AI-token bonus (port of
        // main.py's `add_ai_tokens(request.user_id, 100_000, "pro_included",
        // 0, payment_id=request.razorpay_payment_id)`). Guard against replay
        // the same way aiWallet.controller.ts does, since addAiTokens itself
        // does not dedupe on payment_id.
        try {
            const { data: existingBonus, error: lookupError } = await findPurchaseByPaymentId(razorpay_payment_id);
            if (lookupError) console.error("[Journal Pro Plan] bonus lookup failed:", lookupError.message);
            if (!existingBonus) {
                await addAiTokens(userId, PRO_INCLUDED_AI_TOKENS, "pro_included", 0, razorpay_payment_id);
                const { error: purchaseError } = await insertAiWalletPurchase({
                    user_id: userId,
                    package_id: "pro_included",
                    tokens: PRO_INCLUDED_AI_TOKENS,
                    amount_inr: 0,
                    payment_id: razorpay_payment_id,
                    order_id: razorpay_order_id,
                });
                if (purchaseError) throw purchaseError;
            }
        } catch (err) {
            console.error("[Journal Pro Plan] AI bonus grant failed:", (err as Error)?.message || err);
        }

        // Fresh tier takes effect immediately for chat depth (port of
        // main.py's `PLAN_TIER_CACHE.pop(request.user_id, None)`).
        invalidatePlanTierCache(userId);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            plan,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            valid_until: validUntil.toISOString(),
            cloud_saved: cloudSaved,
        });
    } catch (err) {
        console.error("[Journal Pro Plan] verify error:", err);
        return res.status(500).json({ error: "Payment verification failed" });
    }
};

/* GET /journal/plan — authoritative current plan for the user, reading
 * `journal_pro_plans` directly. Port of main.py's `get_pro_plan`. */
export const getPlan = async (req, res) => {
    const userId = req.user.authId;
    try {
        const { data, error } = await getProPlanByUser(userId);
        if (error) throw error;
        if (!data) {
            return res.status(HTTP_STATUS.OK).json({ user_id: userId, plan: null, is_pro: false });
        }
        const validUntil = data.valid_until ? new Date(data.valid_until as string) : null;
        const isPro = Boolean(validUntil && validUntil.getTime() > Date.now());
        return res.status(HTTP_STATUS.OK).json({
            user_id: userId,
            plan: {
                plan_id: data.plan_id,
                billing: data.billing,
                currency: data.currency,
                region: data.region,
                activated_at: data.activated_at,
                valid_until: data.valid_until,
                payment_id: data.payment_id,
            },
            is_pro: isPro,
        });
    } catch (err) {
        console.error("[Journal Pro Plan] plan read failed:", (err as Error)?.message || err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching plan: ${(err as Error)?.message || err}` });
    }
};
