// Subscription & Bundle Plans — Server-authoritative Razorpay payment flow & database storage
import { getActiveUserSubscriptions, upsertUserSubscription } from "./subscriptionPlan.repository.js";
import { getActiveAlgorithmSubscriptionsForUser, upsertAlgorithmSubscription } from "../algos/algorithm.repository.js";
import { getLearnPlansForUser, upsertLearnPlan } from "../academy/learnPlan.repository.js";
import { getNewsletterPlansForUser, upsertNewsletterPlan } from "../newsletter/newsletterPlan.repository.js";
import { upsertEntitlement } from "../auth/entitlement.repository.js";
import { razorpayConfigured, requireValidRazorpaySignature, RazorpaySignatureError } from "../../utils/razorpay.js";
import { BUNDLE_PRODUCT, buyerNotes, fulfillRazorpayOrder, FulfillmentError, registerFulfiller, requireCatalogAmount, sendFulfillmentError, type Fulfiller } from "../payments/fulfillment.js";
import { priceBundle, type PricedPlan } from "./bundleCatalog.js";

/**
 * POST /api/subscriptions/order
 * Create a Razorpay order for any bundle or product plan from Dashboard.
 * The price comes from bundleCatalog.ts; the browser's `amount` is only
 * checked against it so a stale page gets a clear error instead of a
 * surprise charge.
 */
export const createSubscriptionOrder = async (req, res) => {
    try {
        const { plan_id, products = [], billing_cycle = 'monthly', amount } = req.body || {};

        const priced = priceBundle(String(plan_id || ""), String(billing_cycle), Array.isArray(products) ? products : []);
        if (!priced) {
            return res.status(400).json({ error: "Invalid plan specified" });
        }
        if (amount !== undefined && Number(amount) !== priced.amount) {
            return res.status(409).json({
                error: "This price is out of date — please refresh the page and try again",
                code: "PRICE_CHANGED",
                amount: priced.amount,
            });
        }

        const amountPaise = priced.amount * 100;

        if (!razorpayConfigured()) {
            // Development fallback when Razorpay credentials are not yet set
            const devOrder = {
                id: `order_dev_${Date.now()}`,
                entity: "order",
                amount: amountPaise,
                amount_paid: 0,
                amount_due: amountPaise,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
                status: "created",
                created_at: Math.floor(Date.now() / 1000),
            };
            return res.status(200).json({
                message: "Dev order created (Set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET for production)",
                data: {
                    order: devOrder,
                    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dev",
                    devMode: true,
                },
            });
        }

        const authHeader = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64");

        const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: amountPaise,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
                notes: {
                    product: BUNDLE_PRODUCT,
                    plan_id: priced.planId,
                    plan_name: priced.planName.slice(0, 200),
                    billing_cycle: priced.billingCycle,
                    products: priced.customProductIds.join(","),
                    user_id: String(req.user?.userId || req.user?.id || ""),
                    user_email: req.user?.email || "",
                    phone_number: String(req.body?.phone_number || req.user?.phone_number || "").slice(0, 20),
                    ...buyerNotes(req.user || {}),
                },
            }),
        });

        const order: any = await rpRes.json();
        if (!rpRes.ok) {
            return res.status(500).json({
                error: order?.error?.description || "Unable to create Razorpay order",
            });
        }

        return res.status(200).json({
            message: "Order created successfully",
            data: {
                order,
                keyId: process.env.RAZORPAY_KEY_ID,
                devMode: false,
            },
        });
    } catch (err) {
        console.error("[SubscriptionPlan] createOrder error:", err);
        return res.status(500).json({ error: "Failed to create payment order" });
    }
};

/** Grants a bundle / Dashboard plan. Everything granted comes from `priced`, which the caller derives from the order. */
async function grantBundle({ priced, user, paymentId, orderId, phoneNumber, strict }: {
    priced: PricedPlan;
    user: { userId: string; authId?: string | null; email?: string };
    paymentId: string;
    orderId: string;
    phoneNumber?: unknown;
    strict: boolean;
}) {
    const validUntil = new Date();
    if (priced.billingCycle === 'annual') {
        validUntil.setFullYear(validUntil.getFullYear() + 1);
    } else {
        validUntil.setMonth(validUntil.getMonth() + 1);
    }

    const common = {
        userId: String(user.userId),
        authId: user.authId || null,
        planId: priced.planId,
        products: priced.products,
        billingCycle: priced.billingCycle,
        amount: priced.amount,
        validUntil,
        paymentId,
        orderId,
        userEmail: user.email || "",
        phoneNumber: String(phoneNumber || "").slice(0, 20),
    };

    const subRecord = await persistUserSubscription({ ...common, planName: priced.planName, currency: 'INR', strict });
    await syncSubProductsToDatabase(common);
    return subRecord;
}

/* Called by modules/payments/fulfillment.ts from the verify endpoint and the webhook. */
export const fulfillBundle: Fulfiller = async ({ order, payment, notes, user, extras }) => {
    const priced = priceBundle(notes.plan_id, notes.billing_cycle, (notes.products || "").split(",").filter(Boolean));
    if (!priced) throw new FulfillmentError(`Order ${order.id} is not a known plan (${notes.plan_id})`, "invalid_order");
    if (order.currency !== "INR") throw new FulfillmentError("Bundles are INR-only", "amount_mismatch");
    // Also rejects orders created before prices were server-side, if their amount was tampered with.
    requireCatalogAmount(order, priced.amount * 100);

    return grantBundle({
        priced,
        user,
        paymentId: payment.id,
        orderId: order.id,
        phoneNumber: extras.phone_number || notes.phone_number || payment.contact,
        strict: true,
    });
};
registerFulfiller(BUNDLE_PRODUCT, fulfillBundle);

/**
 * POST /api/subscriptions/verify
 * HMAC SHA256 signature verification, then grant via the shared fulfilment
 * path (idempotent with the Razorpay webhook). The plan, products and price
 * come from the Razorpay order — body fields like plan_id/products/amount
 * are ignored, since trusting them let a buyer pay for one plan and claim
 * another.
 */
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            phone_number: phoneNumber,
        } = req.body || {};

        if (!razorpayConfigured()) {
            // Local development without Razorpay keys: grant straight from the catalogue.
            const priced = priceBundle(String(req.body?.plan_id || ""), String(req.body?.billing_cycle || "monthly"), req.body?.products || []);
            if (!priced) return res.status(400).json({ error: "Invalid plan specified" });
            const subRecord = await grantBundle({
                priced,
                user: {
                    userId: String(req.user?.userId || req.user?.id || ""),
                    authId: req.user?.authId || null,
                    email: req.user?.email || "",
                },
                paymentId: paymentId || `pay_dev_${Date.now()}`,
                orderId: orderId || `order_dev_${Date.now()}`,
                phoneNumber,
                strict: false,
            });
            return res.status(200).json({ message: "Subscription activated & saved successfully", data: subRecord });
        }

        // SECURITY (Phase 13): verification is mandatory whenever Razorpay is
        // configured — a missing or wrong signature always rejects.
        try {
            requireValidRazorpaySignature(orderId, paymentId, signature);
        } catch (err) {
            if (err instanceof RazorpaySignatureError) {
                return res.status(400).json({ error: "Invalid Razorpay payment signature" });
            }
            throw err;
        }

        const { result } = await fulfillRazorpayOrder({
            orderId,
            paymentId,
            source: "verify",
            expectedProducts: [BUNDLE_PRODUCT],
            requestUser: req.user,
            extras: { phone_number: phoneNumber },
        });

        return res.status(200).json({
            message: "Subscription activated & saved successfully",
            data: result,
        });
    } catch (err) {
        if (sendFulfillmentError(res, err, "SubscriptionPlan")) return;
        console.error("[SubscriptionPlan] verifyPayment error:", err);
        return res.status(500).json({ error: "Failed to verify and activate subscription" });
    }
};

/**
 * GET /api/subscriptions/user-active-plans
 * Reads authoritative active subscriptions from PostgreSQL for the logged-in user.
 */
export const getUserSubscriptionPlans = async (req, res) => {
    try {
        const userId = String(req.user?.userId || req.user?.id || "");
        const authId = req.user?.authId || req.user?.auth_id || req.user?.id || null;

        if (!userId && !authId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Fetch from user_subscriptions table
        const { data: userSubs = [], error: subErr } = await getActiveUserSubscriptions(userId, authId);
        if (subErr && subErr.code !== '42P01') { // Ignore relation doesn't exist error if not yet migrated
            console.warn("[SubscriptionPlan] error fetching user_subscriptions:", subErr);
        }

        // Filter valid non-expired subscriptions
        const now = new Date();
        const activeBundles = (userSubs || []).filter((s) => new Date(s.valid_until) > now);

        // 2. Fetch from algorithm_subscriptions table
        const { data: algoSubs = [] } = await getActiveAlgorithmSubscriptionsForUser(userId, authId);
        const activeAlgos = (algoSubs || []).filter((s) => new Date(s.valid_until) > now);

        // 3. Fetch from learn_pro_plans table
        const { data: learnSubs = [] } = await getLearnPlansForUser(userId, authId);
        const activeLearn = (learnSubs || []).filter((s) => new Date(s.valid_until) > now);

        // 4. Fetch from newsletter_pro_plans table
        const { data: newsSubs = [] } = await getNewsletterPlansForUser(userId, authId);
        const activeNews = (newsSubs || []).filter((s) => new Date(s.valid_until) > now);

        // Compute aggregate subscription flags
        const isBundleActive = activeBundles.some(b => b.plan_id === 'ultimate-pass' || b.products?.length >= 5);
        const hasAlgo = isBundleActive || activeAlgos.length > 0 || activeBundles.some(b => b.products?.some(p => String(p).toLowerCase().includes('algo')));
        const hasGini = isBundleActive || activeBundles.some(b => b.products?.some(p => String(p).toLowerCase().includes('gini')));
        const hasFunda = isBundleActive || activeBundles.some(b => b.products?.some(p => String(p).toLowerCase().includes('funda')));
        const hasJournal = isBundleActive || activeBundles.some(b => b.products?.some(p => String(p).toLowerCase().includes('journal')));
        const hasLearn = isBundleActive || activeLearn.length > 0 || activeBundles.some(b => b.products?.some(p => String(p).toLowerCase().includes('learn')));
        const hasNews = isBundleActive || activeNews.length > 0 || activeBundles.some(b => b.products?.some(p => String(p).toLowerCase().includes('news')));

        const userSubscriptions = {
            algos: hasAlgo,
            gini: hasGini,
            fundakamental: hasFunda,
            journal: hasJournal,
            learn: hasLearn,
            newsletter: hasNews,
            bundle: isBundleActive,
        };

        return res.status(200).json({
            status: 200,
            data: {
                userSubscriptions,
                activeBundles,
                activeAlgos,
                activeLearn,
                activeNews,
            },
        });
    } catch (err) {
        console.error("[SubscriptionPlan] getUserSubscriptionPlans error:", err);
        return res.status(500).json({ error: "Failed to fetch user subscriptions" });
    }
};

/**
 * POST /api/subscriptions/dev-activate
 * Dev endpoint for instant testing activation without Razorpay keys
 */
export const devActivateSubscription = async (req, res) => {
    if (process.env.NODE_ENV === "production" && razorpayConfigured()) {
        return res.status(403).json({ error: "Dev activation disabled in production with configured Razorpay" });
    }
    return verifySubscriptionPayment(req, res);
};

/* Helper function to insert into user_subscriptions */
async function persistUserSubscription({
    userId,
    authId,
    planId,
    planName,
    products,
    billingCycle,
    amount,
    currency,
    validUntil,
    paymentId,
    orderId,
    userEmail,
    phoneNumber,
    strict = false,
}: {
    userId: string;
    authId: string | null;
    planId: string;
    planName: string;
    products: string[];
    billingCycle: string;
    amount: number;
    currency: string;
    validUntil: Date;
    paymentId: string;
    orderId: string;
    userEmail: string;
    phoneNumber: string;
    strict?: boolean;
}) {
    const payload = {
        user_id: userId,
        auth_id: authId,
        plan_id: planId,
        plan_name: planName,
        products: JSON.stringify(products),
        billing_cycle: billingCycle,
        amount,
        currency,
        activated_at: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
        payment_id: paymentId,
        order_id: orderId,
        user_email: userEmail,
        phone_number: phoneNumber,
        status: "active",
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await upsertUserSubscription(payload);

    if (error && error.code !== '42P01') {
        console.error("[SubscriptionPlan] Error inserting user_subscription:", error);
        if (strict) throw new Error(error.message || "user_subscriptions write failed");
    }
    await upsertEntitlement({
        userId,
        authId,
        product: "bundle",
        validUntil: payload.valid_until,
        sourceTable: "user_subscriptions",
    });
    return data || payload;
}

/* Helper function to sync individual products to sub-tables */
async function syncSubProductsToDatabase({
    userId,
    authId,
    products,
    planId,
    billingCycle,
    amount,
    validUntil,
    paymentId,
    orderId,
    userEmail,
    phoneNumber,
}) {
    const productStr = JSON.stringify(products).toLowerCase();
    // Only the real Ultimate pass. This used to also match any product list
    // containing "all-access" — which "Learn Hub All-Access" does, so buying
    // Learn alone (₹99) also granted Algo and Newsletter.
    const isUltimate = planId === 'ultimate-pass';

    // 1. Sync Algo Subscriptions if algos is included
    if (isUltimate || productStr.includes('algo')) {
        try {
            await upsertAlgorithmSubscription({
                user_id: userId,
                auth_id: authId,
                algo_name: "Xtin Algo Engine All-Access",
                plan_type: billingCycle,
                amount,
                currency: "INR",
                activated_at: new Date().toISOString(),
                valid_until: validUntil.toISOString(),
                payment_id: paymentId,
                order_id: orderId,
                user_email: userEmail,
                phone_number: phoneNumber,
                status: "active",
                updated_at: new Date().toISOString(),
            });
            await upsertEntitlement({ userId, authId, product: "algo", validUntil: validUntil.toISOString(), sourceTable: "algorithm_subscriptions" });
        } catch (e) {
            console.warn("Could not sync algorithm_subscriptions:", e);
        }
    }

    // 2. Sync Learn Pro Plans if learn is included
    if (isUltimate || productStr.includes('learn')) {
        try {
            await upsertLearnPlan({
                user_id: userId,
                auth_id: authId,
                plan_id: billingCycle === 'annual' ? 'learn_pro_yearly' : 'learn_pro_monthly',
                billing: billingCycle,
                currency: "INR",
                region: "IN",
                activated_at: new Date().toISOString(),
                valid_until: validUntil.toISOString(),
                payment_id: paymentId,
                order_id: orderId,
                user_email: userEmail,
                updated_at: new Date().toISOString(),
            });
            await upsertEntitlement({ userId, authId, product: "learn", validUntil: validUntil.toISOString(), sourceTable: "learn_pro_plans" });
        } catch (e) {
            console.warn("Could not sync learn_pro_plans:", e);
        }
    }

    // 3. Sync Newsletter Pro Plans if newsletter is included
    if (isUltimate || productStr.includes('news')) {
        try {
            await upsertNewsletterPlan({
                user_id: userId,
                auth_id: authId,
                plan_id: billingCycle === 'annual' ? 'newsletter_pro_yearly' : 'newsletter_pro_monthly',
                billing: billingCycle,
                currency: "INR",
                region: "IN",
                markets: "IN,US,GLOBAL",
                activated_at: new Date().toISOString(),
                valid_until: validUntil.toISOString(),
                payment_id: paymentId,
                order_id: orderId,
                user_email: userEmail,
                updated_at: new Date().toISOString(),
            });
            await upsertEntitlement({ userId, authId, product: "newsletter", validUntil: validUntil.toISOString(), sourceTable: "newsletter_pro_plans" });
        } catch (e) {
            console.warn("Could not sync newsletter_pro_plans:", e);
        }
    }
}
