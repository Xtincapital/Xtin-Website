// Single place every paid Razorpay order is turned into a granted product.
//
// Two callers reach it:
//   • each product's POST .../verify endpoint, right after the browser's
//     checkout handler reports success, and
//   • POST /api/payments/razorpay/webhook, which Razorpay calls itself when an
//     order is paid — so a buyer whose browser closed, lost network or locked
//     mid-checkout still gets what they paid for.
//
// Security model: WHAT gets granted, to WHOM, is decided only by the order as
// Razorpay stores it (its `notes`, set server-side at order creation, and the
// amount actually paid) — never by the verify request body. The body's HMAC
// signature only proves the caller really completed that checkout. Earlier
// verify handlers trusted body fields like `plan_id` / `package_id` /
// `amount`, which let a buyer pay for the cheapest item and claim the most
// expensive one.
//
// Idempotency: payment_fulfillments is claimed per order before anything is
// granted, so verify + webhook (or any replay of either) grant exactly once.
import { randomUUID } from "node:crypto";
import {
    claimFulfillment,
    completeFulfillment,
    releaseFulfillment,
    getFulfillment,
    findUserByAuthId,
    findUserById,
    FulfillmentTableMissingError,
} from "./fulfillment.repository.js";
import { issueReceipt } from "./receipts.js";
import { recordRedemption } from "../coupons/coupons.repository.js";

export type RazorpayOrder = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    notes?: Record<string, string> | unknown[];
};

export type RazorpayPayment = {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    email?: string;
    contact?: string;
    /** Unix seconds. */
    created_at?: number;
};

export type PaymentUser = { userId: string; authId: string | null; email: string };

export type FulfillContext = {
    order: RazorpayOrder;
    payment: RazorpayPayment;
    notes: Record<string, string>;
    user: PaymentUser;
    /** Non-price hints from the verify request body (e.g. TradingView username, newsletter markets). Never used to decide what is granted. */
    extras: Record<string, unknown>;
};

export type Fulfiller = (ctx: FulfillContext) => Promise<Record<string, unknown>>;

export class FulfillmentError extends Error {
    status: number;
    code: string;
    retryable: boolean;
    constructor(message: string, code: string, status = 400, retryable = false) {
        super(message);
        this.name = "FulfillmentError";
        this.code = code;
        this.status = status;
        this.retryable = retryable;
    }
}

const fulfillers = new Map<string, Fulfiller>();

/** Called once at module load by each product controller for the `notes.product` value its orders carry. */
export const registerFulfiller = (product: string, fn: Fulfiller) => {
    fulfillers.set(product, fn);
};

// Products whose legacy orders stored the Supabase auth id in notes.user_id.
// Every other product stored the app's users.id (notes.userId / notes.user_id).
const AUTH_ID_PRODUCTS = new Set([
    "journal_pro_plan",
    "journal_ai_tokens",
    "gini_pro_plan",
    "gini_ai_tokens",
    "fundakamental_pro",
    "fundakamental_tokens",
]);

export const BUNDLE_PRODUCT = "xtin_bundle";

export const normalizeNotes = (notes: RazorpayOrder["notes"]): Record<string, string> => {
    if (!notes || Array.isArray(notes)) return {}; // Razorpay sends [] for "no notes"
    return Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, String(v ?? "")]));
};

/** Bundle orders created before `product` was added to their notes only carried plan_id + billing_cycle. */
export const productOf = (notes: Record<string, string>) =>
    notes.product || (notes.plan_id && notes.billing_cycle ? BUNDLE_PRODUCT : "");

/**
 * Every order-creation endpoint puts these in the order notes so a webhook
 * (which has no logged-in user) knows exactly who bought it.
 */
export const buyerNotes = (user: { userId?: string; authId?: string; email?: string }) => ({
    auth_id: String(user.authId || "").slice(0, 64),
    app_user_id: String(user.userId || "").slice(0, 64),
    email: String(user.email || "").slice(0, 254),
});

/** Order ids of free-access grants (coupons); Razorpay's own ids always start with "order_". */
export const FREE_ORDER_PREFIX = "coupon_";

/**
 * Throws unless the paid order amount is exactly the catalogue price (smallest
 * currency unit) — or, for an order the server created with a coupon, the
 * coupon was taken off that same catalogue price. Coupon notes can be trusted
 * like every other note: only this server, with the Razorpay secret, creates
 * orders, and free-access orders never leave the server at all.
 */
export const requireCatalogAmount = (order: RazorpayOrder, expectedAmount: number | undefined) => {
    const notes = normalizeNotes(order.notes);
    const paid = Number(order.amount);
    if (notes.coupon_code && Number.isFinite(expectedAmount)) {
        if (String(order.id).startsWith(FREE_ORDER_PREFIX) && paid === 0) return;
        if (Number(notes.coupon_list_amount) === expectedAmount && paid > 0 && paid <= (expectedAmount as number)) return;
    }
    if (!Number.isFinite(expectedAmount) || paid !== expectedAmount) {
        throw new FulfillmentError(
            `Order ${order.id} amount ${order.amount} ${order.currency} does not match the catalogue price ${expectedAmount}`,
            "amount_mismatch"
        );
    }
};

async function resolveUser(product: string, notes: Record<string, string>, payment: RazorpayPayment): Promise<PaymentUser> {
    let authId = notes.auth_id || (AUTH_ID_PRODUCTS.has(product) ? notes.user_id : "") || "";
    let userId = notes.app_user_id || (!AUTH_ID_PRODUCTS.has(product) ? notes.userId || notes.user_id : "") || "";
    let email = notes.email || notes.user_email || notes.userEmail || "";

    if (authId && !userId) {
        const row = await findUserByAuthId(authId);
        // The auth middleware falls back to the auth id when no users row exists.
        userId = row?.id || authId;
        email = email || row?.email || "";
    } else if (userId && !authId) {
        const row = (await findUserById(userId)) || (await findUserByAuthId(userId));
        authId = row?.auth_id || null;
        if (row) userId = row.id;
        email = email || row?.email || "";
    }

    if (!userId) throw new FulfillmentError(`Order has no buyer in its notes (product ${product})`, "no_buyer");
    return { userId, authId: authId || null, email: email || payment.email || "" };
}

const RAZORPAY_API = "https://api.razorpay.com/v1";

async function fetchRazorpay<T>(path: string): Promise<T> {
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    let res: Response;
    try {
        res = await fetch(`${RAZORPAY_API}/${path}`, { headers: { Authorization: `Basic ${auth}` } });
    } catch (err) {
        throw new FulfillmentError(`Payment gateway unreachable: ${(err as Error).message}`, "gateway_unreachable", 503, true);
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new FulfillmentError(
            (body as { error?: { description?: string } })?.error?.description || `Razorpay ${path} failed`,
            "gateway_error",
            res.status >= 500 ? 503 : 400,
            res.status >= 500
        );
    }
    return body as T;
}

const PAID_PAYMENT_STATUSES = new Set(["captured", "authorized"]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type FulfillOptions = {
    orderId: string;
    paymentId: string;
    source: "verify" | "webhook";
    /** Supplied by the webhook (already signed by Razorpay); fetched from Razorpay otherwise. */
    order?: RazorpayOrder;
    payment?: RazorpayPayment;
    /** Verify endpoints: reject orders belonging to another product's checkout. */
    expectedProducts?: string[];
    /** Verify endpoints: the logged-in user, who must be the buyer. */
    requestUser?: { userId?: string; authId?: string; email?: string };
    extras?: Record<string, unknown>;
};

export async function fulfillRazorpayOrder(opts: FulfillOptions): Promise<{ result: Record<string, unknown>; alreadyFulfilled: boolean; product: string }> {
    const { orderId, paymentId, source } = opts;
    const order = opts.order || (await fetchRazorpay<RazorpayOrder>(`orders/${encodeURIComponent(orderId)}`));
    const payment = opts.payment || (await fetchRazorpay<RazorpayPayment>(`payments/${encodeURIComponent(paymentId)}`));

    if (order.id !== orderId || payment.id !== paymentId || payment.order_id !== order.id) {
        throw new FulfillmentError("Payment does not belong to this order", "order_mismatch");
    }
    if (!PAID_PAYMENT_STATUSES.has(payment.status)) {
        throw new FulfillmentError(`Payment is ${payment.status}, not paid`, "not_paid", 402);
    }
    if (Number(payment.amount) !== Number(order.amount) || payment.currency !== order.currency) {
        throw new FulfillmentError("Paid amount does not match the order", "amount_mismatch");
    }

    const notes = normalizeNotes(order.notes);
    const product = productOf(notes);
    const fulfiller = fulfillers.get(product);
    if (!fulfiller) throw new FulfillmentError(`No fulfiller for product "${product}"`, "unknown_product");
    if (opts.expectedProducts && !opts.expectedProducts.includes(product)) {
        throw new FulfillmentError("This payment is for a different product", "product_mismatch");
    }

    const user = await resolveUser(product, notes, payment);
    if (opts.requestUser) {
        const sameUser =
            (user.authId && user.authId === opts.requestUser.authId) || (user.userId && user.userId === opts.requestUser.userId);
        if (!sameUser) throw new FulfillmentError("This payment belongs to a different account", "wrong_user", 403);
        user.email = user.email || String(opts.requestUser.email || "");
    }

    let claimed = true;
    try {
        const claim = await claimFulfillment({
            order_id: order.id,
            payment_id: payment.id,
            product,
            user_id: user.userId,
            amount: Number(order.amount),
            currency: order.currency,
            source,
        });
        if ("existing" in claim) {
            claimed = false;
            let existing = claim.existing;
            // Another request is granting right now (typically verify racing the webhook). Give it a moment.
            for (let i = 0; existing?.status === "processing" && source === "verify" && i < 16; i++) {
                await sleep(500);
                existing = (await getFulfillment(order.id)) || existing;
            }
            if (existing?.status === "fulfilled") {
                // Idempotent — heals a receipt that failed to issue the first time.
                await afterFulfilled({ order, product, notes, user, payment });
                return { result: existing.result || {}, alreadyFulfilled: true, product };
            }
            throw new FulfillmentError("Payment is still being processed — please refresh in a minute", "in_progress", 503, true);
        }
    } catch (err) {
        if (!(err instanceof FulfillmentTableMissingError)) throw err;
        // Migration not applied yet. The webhook waits (Razorpay retries for 24h);
        // the verify endpoint carries on unguarded, as it did before this module existed.
        if (source === "webhook") throw new FulfillmentError(err.message, "not_migrated", 503, true);
        console.error(`[Payments] ${err.message}`);
        claimed = false;
    }

    try {
        const result = await fulfiller({ order, payment, notes, user, extras: opts.extras || {} });
        if (claimed) await completeFulfillment(order.id, result);
        console.log(`[Payments] ${product} fulfilled for order ${order.id} via ${source}`);
        await afterFulfilled({ order, product, notes, user, payment });
        return { result, alreadyFulfilled: false, product };
    } catch (err) {
        if (claimed) await releaseFulfillment(order.id);
        if (err instanceof FulfillmentError) throw err;
        throw new FulfillmentError(`Granting ${product} failed: ${(err as Error)?.message || err}`, "grant_failed", 500, true);
    }
}

/** Receipt + coupon bookkeeping for a granted order. Both are idempotent per order and never throw. */
async function afterFulfilled({ order, payment, product, notes, user }: { order: RazorpayOrder; payment: RazorpayPayment; product: string; notes: Record<string, string>; user: PaymentUser }) {
    await issueReceipt({ order, payment, product, notes, user });
    if (notes.coupon_code && notes.coupon_id) {
        await recordRedemption({
            coupon_id: notes.coupon_id,
            code: notes.coupon_code,
            order_id: order.id,
            user_id: user.userId || null,
            auth_id: user.authId || null,
            buyer_email: user.email || null,
            product,
            list_amount: Number(notes.coupon_list_amount) || null,
            paid_amount: Number(order.amount),
            currency: order.currency,
        });
    }
}

/**
 * Grants a product with no payment — a free-access coupon, or a discount
 * coupon that took the price to zero. Runs the product's own fulfiller with a
 * server-made order (id "coupon_…", amount 0), through the same
 * payment_fulfillments claim, receipt and coupon bookkeeping as a paid order.
 */
export async function grantWithoutPayment(opts: {
    product: string;
    notes: Record<string, string>;
    user: { userId?: string; authId?: string; email?: string };
    currency?: string;
}): Promise<{ orderId: string; result: Record<string, unknown> }> {
    const fulfiller = fulfillers.get(opts.product);
    if (!fulfiller) throw new FulfillmentError(`No fulfiller for product "${opts.product}"`, "unknown_product");
    if (!opts.notes.coupon_code) throw new FulfillmentError("Free grants need a coupon", "no_coupon");

    const orderId = `${FREE_ORDER_PREFIX}${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const notes: Record<string, string> = { ...opts.notes, product: opts.product };
    const order: RazorpayOrder = { id: orderId, amount: 0, currency: opts.currency || "INR", status: "paid", notes };
    const payment: RazorpayPayment = { id: orderId, order_id: orderId, amount: 0, currency: order.currency, status: "captured", created_at: Math.floor(Date.now() / 1000) };
    const user: PaymentUser = { userId: String(opts.user.userId || opts.user.authId || ""), authId: opts.user.authId || null, email: String(opts.user.email || "") };
    if (!user.userId) throw new FulfillmentError("Sign in to redeem a code", "no_buyer", 401);

    await claimFulfillment({ order_id: orderId, payment_id: orderId, product: opts.product, user_id: user.userId, amount: 0, currency: order.currency, source: "coupon" });
    try {
        const result = await fulfiller({ order, payment, notes, user, extras: {} });
        await completeFulfillment(orderId, result);
        console.log(`[Payments] ${opts.product} granted free with coupon ${notes.coupon_code} (${orderId})`);
        await afterFulfilled({ order, payment, product: opts.product, notes, user });
        return { orderId, result };
    } catch (err) {
        await releaseFulfillment(orderId);
        if (err instanceof FulfillmentError) throw err;
        throw new FulfillmentError(`Granting ${opts.product} failed: ${(err as Error)?.message || err}`, "grant_failed", 500, true);
    }
}

/** Shared error response for verify endpoints. Returns true when it handled `err`. */
export const sendFulfillmentError = (res, err: unknown, tag: string) => {
    if (!(err instanceof FulfillmentError)) return false;
    console.error(`[${tag}] fulfilment failed (${err.code}):`, err.message);
    res.status(err.status).json({ error: err.message, code: err.code });
    return true;
};
