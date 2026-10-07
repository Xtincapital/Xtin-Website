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

/** Throws unless the paid order amount is exactly the catalogue price (smallest currency unit). */
export const requireCatalogAmount = (order: RazorpayOrder, expectedAmount: number | undefined) => {
    if (!Number.isFinite(expectedAmount) || Number(order.amount) !== expectedAmount) {
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
                await issueReceipt({ order, payment, product, notes, user });
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
        await issueReceipt({ order, payment, product, notes, user });
        return { result, alreadyFulfilled: false, product };
    } catch (err) {
        if (claimed) await releaseFulfillment(order.id);
        if (err instanceof FulfillmentError) throw err;
        throw new FulfillmentError(`Granting ${product} failed: ${(err as Error)?.message || err}`, "grant_failed", 500, true);
    }
}

/** Shared error response for verify endpoints. Returns true when it handled `err`. */
export const sendFulfillmentError = (res, err: unknown, tag: string) => {
    if (!(err instanceof FulfillmentError)) return false;
    console.error(`[${tag}] fulfilment failed (${err.code}):`, err.message);
    res.status(err.status).json({ error: err.message, code: err.code });
    return true;
};
