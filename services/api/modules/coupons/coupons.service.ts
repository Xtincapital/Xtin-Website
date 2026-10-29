// Coupon rules — the only place a coupon turns into a price.
//
// Checkout: each product's order endpoint calls applyCheckoutCoupon() with
// the catalogue amount it was about to charge. It returns the discounted
// amount plus order notes (coupon_code / coupon_id / coupon_list_amount) that
// fulfilment later checks the payment against (requireCatalogAmount). A code
// that takes the price to zero grants the product straight away, no payment.
//
// Free access: redeemFreeAccess() grants a free_access coupon's plan.
//
// Limits are checked when the order is created; a redemption is recorded
// when the order is actually paid (or the free grant happens).
import { FulfillmentError, grantWithoutPayment } from "../payments/fulfillment.js";
import { countRedemptions, countUserRedemptions, findCouponByCode, hasPaidPurchase, type CouponRow } from "./coupons.repository.js";
import { COUPON_PRODUCTS, findFreeAccessPlan } from "./coupons.catalog.js";

export class CouponError extends Error {
    status: number;
    code: string;
    constructor(message: string, code: string, status = 400) {
        super(message);
        this.name = "CouponError";
        this.code = code;
        this.status = status;
    }
}

/** Razorpay's smallest charge is 1.00 of the currency (100 paise / cents). */
export const MIN_CHARGE = 100;

export const normalizeCode = (raw: unknown) =>
    String(raw ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");

export type CouponUser = { userId?: string; authId?: string; email?: string };

const productLabel = (key: string) => COUPON_PRODUCTS.find((p) => p.key === key)?.label || key;

const formatMinor = (amount: number, currency: string) => `${currency === "INR" ? "₹" : `${currency} `}${(amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Loads a code and checks everything except product fit. Throws CouponError with a buyer-friendly message. */
export async function loadUsableCoupon(rawCode: unknown, user: CouponUser, now = new Date()): Promise<CouponRow> {
    const code = normalizeCode(rawCode);
    if (!code) throw new CouponError("Enter a coupon code", "empty");
    const coupon = await findCouponByCode(code);
    if (!coupon || !coupon.active) throw new CouponError(`"${code}" isn't a valid code`, "not_found", 404);
    if (coupon.starts_at && new Date(coupon.starts_at) > now) throw new CouponError(`"${code}" isn't active yet`, "not_started");
    if (coupon.expires_at && new Date(coupon.expires_at) <= now) throw new CouponError(`"${code}" has expired`, "expired");

    if (coupon.max_redemptions && (await countRedemptions(coupon.id)) >= coupon.max_redemptions) {
        throw new CouponError(`"${code}" has been fully used`, "used_up");
    }
    if ((await countUserRedemptions(coupon.id, user)) >= coupon.per_user_limit) {
        throw new CouponError(coupon.per_user_limit === 1 ? `You've already used "${code}"` : `You've used "${code}" the maximum number of times`, "already_used");
    }
    if (coupon.audience !== "everyone") {
        const isMember = await hasPaidPurchase(user);
        if (coupon.audience === "new_customers" && isMember) throw new CouponError(`"${code}" is for first-time customers only`, "new_customers_only");
        if (coupon.audience === "members" && !isMember) throw new CouponError(`"${code}" is for existing members only`, "members_only");
    }
    return coupon;
}

/** Pure: the amount a discount coupon leaves to pay (smallest unit). 0 means free. */
export function discountedAmount(coupon: Pick<CouponRow, "code" | "percent_off" | "amount_off_paise">, listAmount: number, currency: string): number {
    let amount = listAmount;
    if (coupon.percent_off) {
        amount = listAmount - Math.round((listAmount * coupon.percent_off) / 100);
    } else if (coupon.amount_off_paise) {
        if (currency !== "INR") throw new CouponError(`"${coupon.code}" works on payments in ₹ only`, "inr_only");
        amount = listAmount - coupon.amount_off_paise;
    }
    if (amount <= 0) return 0;
    // A sliver left over (e.g. 99% off a ₹50 pack) still has to clear Razorpay's minimum.
    return Math.max(amount, Math.min(MIN_CHARGE, listAmount));
}

const assertFitsProduct = (coupon: CouponRow, product: string) => {
    if (coupon.kind === "free_access") {
        throw new CouponError(`"${coupon.code}" unlocks ${findFreeAccessPlan(coupon.free_product, coupon.free_plan)?.label || "a free plan"} — use Activate instead of paying`, "free_access_code");
    }
    if (coupon.products.length && !coupon.products.includes(product)) {
        throw new CouponError(`"${coupon.code}" doesn't apply to ${productLabel(product)}`, "wrong_product");
    }
};

export type CheckoutPricing =
    | { free: false; amount: number; notes: Record<string, string>; discount: number; code: string | null }
    | { free: true; orderId: string; result: Record<string, unknown>; code: string };

/**
 * Prices a checkout. Without a code it changes nothing. With one, returns the
 * discounted amount and the notes to put on the Razorpay order — or, when the
 * code makes it free, grants the product right here and says so.
 */
export async function applyCheckoutCoupon(opts: {
    rawCode: unknown;
    product: string;
    amount: number;
    currency: string;
    notes: Record<string, string>;
    user: CouponUser;
}): Promise<CheckoutPricing> {
    if (!normalizeCode(opts.rawCode)) return { free: false, amount: opts.amount, notes: opts.notes, discount: 0, code: null };

    const coupon = await loadUsableCoupon(opts.rawCode, opts.user);
    assertFitsProduct(coupon, opts.product);
    const amount = discountedAmount(coupon, opts.amount, opts.currency);
    const notes = { ...opts.notes, coupon_code: coupon.code, coupon_id: coupon.id, coupon_list_amount: String(opts.amount) };

    if (amount === 0) {
        // Limits are re-checked in the code's queue, so two checkouts sent at once can't both get it free.
        return oneAtATime<CheckoutPricing>(coupon.code, async () => {
            await loadUsableCoupon(coupon.code, opts.user);
            const granted = await grantWithoutPayment({ product: opts.product, notes, user: opts.user, currency: opts.currency });
            return { free: true, orderId: granted.orderId, result: granted.result, code: coupon.code };
        });
    }
    return { free: false, amount, notes, discount: opts.amount - amount, code: coupon.code };
}

// Free grants of one code run one at a time, each checking the limits after
// the one before it was recorded — so people redeeming at the same moment
// can't take more than the code's total uses (the API runs as a single instance).
const codeQueues = new Map<string, Promise<void>>();

function oneAtATime<T>(code: string, fn: () => Promise<T>): Promise<T> {
    const run = (codeQueues.get(code) || Promise.resolve()).then(fn);
    const settled = run.then(
        () => {},
        () => {}
    );
    codeQueues.set(code, settled);
    void settled.then(() => {
        if (codeQueues.get(code) === settled) codeQueues.delete(code);
    });
    return run;
}

// One redemption per user per code at a time, so a double-click gets a quick
// "one moment" instead of waiting in the code's queue.
const redeeming = new Set<string>();

/** Grants a free_access coupon's plan to the signed-in user. */
export async function redeemFreeAccess(rawCode: unknown, user: CouponUser) {
    const key = `${normalizeCode(rawCode)}:${user.authId || user.userId}`;
    if (redeeming.has(key)) throw new CouponError("Already redeeming this code — one moment", "in_progress", 409);
    redeeming.add(key);
    try {
        return await oneAtATime(normalizeCode(rawCode), () => redeemFreeAccessUnlocked(rawCode, user));
    } finally {
        redeeming.delete(key);
    }
}

async function redeemFreeAccessUnlocked(rawCode: unknown, user: CouponUser) {
    const coupon = await loadUsableCoupon(rawCode, user);
    if (coupon.kind !== "free_access") {
        throw new CouponError(`"${coupon.code}" is a discount code — enter it at checkout`, "discount_code");
    }
    const plan = findFreeAccessPlan(coupon.free_product, coupon.free_plan);
    if (!plan) throw new CouponError(`"${coupon.code}" can't be redeemed right now — contact support`, "bad_plan", 500);
    const granted = await grantWithoutPayment({
        product: plan.product,
        notes: { ...plan.notes, coupon_code: coupon.code, coupon_id: coupon.id },
        user,
    });
    return { orderId: granted.orderId, label: plan.label, product: plan.product, result: granted.result };
}

/**
 * Checkout preview: what the code would do to this price. Informational only —
 * the order endpoint re-prices from the catalogue and re-checks everything.
 */
export async function previewCoupon(opts: { rawCode: unknown; product: string; amount: number; currency: string; user: CouponUser }) {
    const coupon = await loadUsableCoupon(opts.rawCode, opts.user);
    if (coupon.kind === "free_access") {
        const plan = findFreeAccessPlan(coupon.free_product, coupon.free_plan);
        return { code: coupon.code, kind: "free_access" as const, label: plan?.label || "Free access", product: plan?.product || null };
    }
    assertFitsProduct(coupon, opts.product);
    const listAmount = Math.max(0, Math.round(Number(opts.amount) || 0));
    const amount = discountedAmount(coupon, listAmount, opts.currency);
    const off = coupon.percent_off ? `${coupon.percent_off}% off` : `${formatMinor(Number(coupon.amount_off_paise), "INR")} off`;
    return { code: coupon.code, kind: "discount" as const, label: off, list_amount: listAmount, amount, discount: listAmount - amount, currency: opts.currency };
}

/** Shared error response for coupon failures. Returns true when it handled `err`. */
export const sendCouponError = (res, err: unknown) => {
    if (err instanceof CouponError) {
        res.status(err.status).json({ error: err.message, code: err.code, coupon_error: true });
        return true;
    }
    return false;
};

/**
 * For order endpoints: prices the checkout with the request's coupon_code. If
 * the code made it free, it has already been granted and the response sent —
 * the caller just returns. Otherwise returns the amount and notes to order with.
 */
export async function priceOrderOrRespond(
    req,
    res,
    opts: { product: string; amount: number; currency: string; notes: Record<string, string> }
): Promise<{ amount: number; notes: Record<string, string> } | null> {
    try {
        const priced = await applyCheckoutCoupon({ rawCode: req.body?.coupon_code, user: req.user, ...opts });
        if (priced.free === true) {
            res.status(200).json({ success: true, free: true, order_id: priced.orderId, coupon_code: priced.code, data: priced.result });
            return null;
        }
        const paid = priced as Extract<CheckoutPricing, { free: false }>;
        return { amount: paid.amount, notes: paid.notes };
    } catch (err) {
        if (sendCouponError(res, err)) return null;
        if (err instanceof FulfillmentError) {
            res.status(err.status).json({ error: err.message, code: err.code });
            return null;
        }
        throw err;
    }
}
