// Purchase receipts — one per paid Razorpay order (payment_receipts,
// database/migrations/0015_payment_receipts.sql).
//
//   • issueReceipt() runs inside fulfillRazorpayOrder right after an order is
//     granted (verify or webhook, whichever wins). It never throws: a receipt
//     hiccup must not turn a successful payment into an error for the buyer.
//   • GET /api/billing/receipts                 — the signed-in user's receipts (Billing page)
//   • GET /api/billing/receipts/order/:orderId  — one receipt, polled by the post-checkout animation
//
// The PDF itself is drawn in the browser from these rows (apps/web/src/features/billing/lib/receiptPdf.ts).
import { Router } from "express";
import supabase from "../../supabase/index.js";
import { authenticate } from "../../middlewares/auth.js";

export type ReceiptRow = {
    receipt_no: string;
    order_id: string;
    payment_id: string;
    product: string;
    description: string;
    user_id: string | null;
    auth_id: string | null;
    buyer_email: string | null;
    amount: number;
    currency: string;
    status: "paid" | "refunded";
    paid_at: string;
    source: "live" | "backfill";
    created_at: string;
};

const PUBLIC_COLUMNS = "receipt_no, order_id, payment_id, description, buyer_email, amount, currency, status, paid_at";

const PRODUCT_LABELS: Record<string, string> = {
    journal_pro_plan: "Xtin Journal Pro",
    journal_ai_tokens: "Xtin Journal AI Pack",
    gini_pro_plan: "Gini Pro",
    gini_ai_tokens: "Gini AI Pack",
    fundakamental_pro: "FundaKaMental Pro",
    fundakamental_tokens: "FundaKaMental Token Pack",
    xtin_algo_subscription: "Algo Subscription",
    xtin_learn_pro: "Learn Pro",
    xtin_newsletter_pro: "Market Brief Pro",
    xtin_bundle: "Xtin Bundle",
    backtest_pro_pass: "Backtest Pro",
};

const periodOf = (value = "") => {
    const v = value.toLowerCase();
    if (/year|annual/.test(v)) return "Yearly";
    if (/quarter/.test(v)) return "Quarterly";
    if (/month/.test(v)) return "Monthly";
    return "";
};

const titleCase = (value: string) =>
    value
        .replace(/[_-]+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());

const tokensLabel = (raw = "") => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M tokens`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K tokens`;
    return `${n} tokens`;
};

const joinParts = (...parts: string[]) => parts.filter(Boolean).join(" — ");

/** "Gini Pro — Monthly (coupon XTIN10, saved INR 15.00)" — the line item plus any coupon taken off it. */
export const receiptLine = (product: string, notes: Record<string, string>, paidAmount: number, currency: string) => {
    const line = describePurchase(product, notes);
    if (!notes.coupon_code) return line;
    const saved = Number(notes.coupon_list_amount) - paidAmount;
    const savedText = Number.isFinite(saved) && saved > 0 ? `, saved ${currency} ${(saved / 100).toFixed(2)}` : "";
    return `${line} (coupon ${notes.coupon_code}${savedText})`;
};

/** The line item printed on the receipt, built from the order's own notes. */
export const describePurchase = (product: string, notes: Record<string, string>): string => {
    const label = PRODUCT_LABELS[product] || titleCase(product || "Xtin Capital purchase");
    switch (product) {
        case "journal_pro_plan":
        case "gini_pro_plan":
        case "fundakamental_pro":
        case "xtin_learn_pro":
        case "xtin_newsletter_pro":
            return joinParts(label, periodOf(notes.plan_id || notes.planId));
        case "journal_ai_tokens":
        case "gini_ai_tokens":
        case "fundakamental_tokens":
            return joinParts(label, tokensLabel(notes.tokens));
        case "xtin_algo_subscription":
            return joinParts(label, notes.algo_name || "", periodOf(notes.plan_type || "monthly"));
        case "xtin_bundle":
            return joinParts(notes.plan_name || label, periodOf(notes.billing_cycle));
        case "backtest_pro_pass":
            return joinParts(label, notes.pass_id ? `${titleCase(notes.pass_id)} Pass` : "");
        default:
            return label;
    }
};

const MISSING_TABLE = /does not exist|Could not find the (table|function)|schema cache/i;

export type IssueReceiptInput = {
    order: { id: string; amount: number; currency: string };
    payment: { id: string; created_at?: number };
    product: string;
    notes: Record<string, string>;
    user: { userId: string; authId: string | null; email: string };
    source?: "live" | "backfill";
};

/** Issues (or returns the already-issued) receipt for a paid order. Logs and returns null on failure — never throws. */
export async function issueReceipt(input: IssueReceiptInput): Promise<ReceiptRow | null> {
    const { order, payment, product, notes, user } = input;
    try {
        const paidAt = payment.created_at ? new Date(payment.created_at * 1000) : new Date();
        const { data, error } = await supabase.rpc("issue_payment_receipt", {
            p_order_id: order.id,
            p_payment_id: payment.id,
            p_product: product,
            p_description: receiptLine(product, notes, Number(order.amount), order.currency),
            p_user_id: user.userId || null,
            p_auth_id: user.authId || null,
            p_buyer_email: user.email || null,
            p_amount: Number(order.amount),
            p_currency: order.currency,
            p_paid_at: paidAt.toISOString(),
            p_source: input.source || "live",
        });
        if (error) throw error;
        return (data as ReceiptRow) || null;
    } catch (err) {
        const message = (err as Error)?.message || String(err);
        if (MISSING_TABLE.test(message)) {
            console.error("[Receipts] payment_receipts is missing — run database/migrations/0015_payment_receipts.sql");
        } else {
            console.error(`[Receipts] issuing receipt for order ${order.id} failed:`, message);
        }
        return null;
    }
}

/** Full refunds flip the receipt to "refunded"; partial refunds leave it as paid. */
export async function markReceiptRefunded(paymentId: string) {
    const { error } = await supabase.from("payment_receipts").update({ status: "refunded" }).eq("payment_id", paymentId);
    if (error && !MISSING_TABLE.test(error.message)) throw error;
}

/** Account deletion keeps receipts (tax/dispute records) but unlinks them from the account. */
export async function unlinkReceipts(authId: string, userIds: string[]): Promise<string | null> {
    const ids = Array.from(new Set([authId, ...userIds].filter(Boolean)));
    const byUser = await supabase.from("payment_receipts").update({ user_id: null, auth_id: null }).in("user_id", ids);
    if (byUser.error && !MISSING_TABLE.test(byUser.error.message)) return byUser.error.message;
    const byAuth = await supabase.from("payment_receipts").update({ user_id: null, auth_id: null }).eq("auth_id", authId);
    if (byAuth.error && !MISSING_TABLE.test(byAuth.error.message)) return byAuth.error.message;
    return null;
}

// Ids come from the verified session (auth uuid / users.id), but they are
// interpolated into a PostgREST `or` filter, so allow only id characters.
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

const ownerFilter = (user: { userId?: string; authId?: string }) => {
    const parts: string[] = [];
    if (user.authId && SAFE_ID.test(user.authId)) parts.push(`auth_id.eq.${user.authId}`);
    if (user.userId && SAFE_ID.test(user.userId)) parts.push(`user_id.eq.${user.userId}`);
    return parts.join(",");
};

export const listMyReceipts = async (req, res) => {
    const filter = ownerFilter(req.user || {});
    if (!filter) return res.status(401).json({ error: "Not signed in" });
    const { data, error } = await supabase
        .from("payment_receipts")
        .select(PUBLIC_COLUMNS)
        .or(filter)
        .order("paid_at", { ascending: false })
        .limit(500);
    if (error) {
        if (MISSING_TABLE.test(error.message)) return res.json({ receipts: [] });
        console.error("[Receipts] list failed:", error.message);
        return res.status(500).json({ error: "Could not load your receipts" });
    }
    return res.json({ receipts: data || [] });
};

export const getMyReceiptByOrder = async (req, res) => {
    const orderId = String(req.params.orderId || "");
    const filter = ownerFilter(req.user || {});
    if (!filter) return res.status(401).json({ error: "Not signed in" });
    if (!/^(order|coupon)_[A-Za-z0-9]{6,40}$/.test(orderId)) return res.status(400).json({ error: "Invalid order id" });
    const { data, error } = await supabase
        .from("payment_receipts")
        .select(PUBLIC_COLUMNS)
        .eq("order_id", orderId)
        .or(filter)
        .maybeSingle();
    if (error) {
        if (MISSING_TABLE.test(error.message)) return res.status(404).json({ error: "Receipt not found" });
        console.error("[Receipts] get failed:", error.message);
        return res.status(500).json({ error: "Could not load the receipt" });
    }
    if (!data) return res.status(404).json({ error: "Receipt not found" });
    return res.json({ receipt: data });
};

const router = Router();
router.get("/billing/receipts", authenticate, listMyReceipts);
router.get("/billing/receipts/order/:orderId", authenticate, getMyReceiptByOrder);

export default router;
