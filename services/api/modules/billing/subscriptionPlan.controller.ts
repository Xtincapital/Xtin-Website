// Subscription & Bundle Plans — Server-authoritative Razorpay payment flow & database storage
import { getActiveUserSubscriptions, upsertUserSubscription } from "./subscriptionPlan.repository.js";
import { getActiveAlgorithmSubscriptionsForUser, upsertAlgorithmSubscription } from "../algos/algorithm.repository.js";
import { getLearnPlansForUser, upsertLearnPlan } from "../academy/learnPlan.repository.js";
import { getNewsletterPlansForUser, upsertNewsletterPlan } from "../newsletter/newsletterPlan.repository.js";
import { upsertEntitlement } from "../auth/entitlement.repository.js";
import { razorpayConfigured, requireValidRazorpaySignature, RazorpaySignatureError } from "../../utils/razorpay.js";

/**
 * POST /api/subscriptions/order
 * Create a Razorpay order for any bundle or product plan from Dashboard.
 */
export const createSubscriptionOrder = async (req, res) => {
    try {
        const { plan_id, plan_name, products = [], billing_cycle = 'monthly', amount } = req.body;

        if (!plan_id || !amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid plan or amount specified" });
        }

        const amountPaise = Math.round(Number(amount) * 100);

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
                    plan_id,
                    plan_name: plan_name || plan_id,
                    billing_cycle,
                    user_id: String(req.user?.userId || req.user?.id || ""),
                    user_email: req.user?.email || "",
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

/**
 * POST /api/subscriptions/verify
 * HMAC SHA256 signature verification & PostgreSQL DB persistence.
 */
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            plan_id: planId,
            plan_name: planName,
            products = [],
            billing_cycle: billingCycle = 'monthly',
            amount,
            phone_number: phoneNumber,
        } = req.body;

        const userId = String(req.user?.userId || req.user?.id || "");
        const authId = req.user?.authId || req.user?.auth_id || req.user?.id || null;
        const userEmail = req.user?.email || "";

        if (!planId) {
            return res.status(400).json({ error: "Missing required plan_id" });
        }

        // Verify Razorpay HMAC signature. SECURITY (Phase 13): this used to be
        // `if (razorpayConfigured() && signature)` — an authenticated caller
        // could omit `razorpay_signature` from the request body entirely and
        // skip verification outright, since a falsy `signature` short-circuited
        // the whole check, landing straight at an unconditional grant of an
        // active subscription (propagated to every product via
        // syncSubProductsToDatabase below, including full "bundle" access via
        // isBundleActive's products.length >= 5 check). Whenever Razorpay is
        // actually configured, verification is now mandatory — a missing or
        // wrong signature always rejects. `devActivateSubscription` below is
        // the only legitimate way to grant a subscription without a real
        // signature, and it's already correctly gated to non-production
        // environments with no Razorpay keys configured.
        try {
            requireValidRazorpaySignature(orderId, paymentId, signature);
        } catch (err) {
            if (err instanceof RazorpaySignatureError) {
                return res.status(400).json({ error: "Invalid Razorpay payment signature" });
            }
            throw err;
        }

        const effectivePaymentId = paymentId || `pay_dev_${Date.now()}`;
        const effectiveOrderId = orderId || `order_dev_${Date.now()}`;

        // Calculate expiration date
        const validUntil = new Date();
        if (billingCycle === 'annual') {
            validUntil.setFullYear(validUntil.getFullYear() + 1);
        } else {
            validUntil.setMonth(validUntil.getMonth() + 1);
        }

        // Persist to user_subscriptions table
        const subRecord = await persistUserSubscription({
            userId,
            authId,
            planId,
            planName: planName || planId,
            products,
            billingCycle,
            amount: Number(amount || 0),
            currency: 'INR',
            validUntil,
            paymentId: effectivePaymentId,
            orderId: effectiveOrderId,
            userEmail,
            phoneNumber,
        });

        // Sync with specific product tables where appropriate
        await syncSubProductsToDatabase({
            userId,
            authId,
            products,
            planId,
            billingCycle,
            amount: Number(amount || 0),
            validUntil,
            paymentId: effectivePaymentId,
            orderId: effectiveOrderId,
            userEmail,
            phoneNumber,
        });

        return res.status(200).json({
            message: "Subscription activated & saved successfully",
            data: subRecord,
        });
    } catch (err) {
        console.error("[SubscriptionPlan] verifyPayment error:", err);
        return res.status(500).json({ error: err.message || "Failed to verify and activate subscription" });
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
    const isUltimate = planId === 'ultimate-pass' || productStr.includes('all-access');

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
