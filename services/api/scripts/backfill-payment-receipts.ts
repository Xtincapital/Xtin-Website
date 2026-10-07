// One-time backfill (2026-10-07): issues receipts for orders paid before
// payment_receipts existed — every fulfilled row in payment_fulfillments that
// has no receipt yet, oldest first so receipt numbers follow payment order.
// The line item and paid date come from the Razorpay order/payment
// themselves, exactly as a live receipt would. Re-running is a no-op
// (issue_payment_receipt is idempotent per order).
//
//   npx tsx scripts/backfill-payment-receipts.ts           # dry run
//   npx tsx scripts/backfill-payment-receipts.ts --apply   # issue

const apply = process.argv.includes("--apply");

const { default: supabase } = await import("../supabase/index.js");
const { normalizeNotes, productOf } = await import("../modules/payments/fulfillment.js");
const { describePurchase, issueReceipt } = await import("../modules/payments/receipts.js");
const { findUserById, findUserByAuthId } = await import("../modules/payments/fulfillment.repository.js");
type RazorpayOrder = import("../modules/payments/fulfillment.js").RazorpayOrder;
type RazorpayPayment = import("../modules/payments/fulfillment.js").RazorpayPayment;

const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const razorpay = async <T>(path: string): Promise<T> => {
    await sleep(400); // stay well inside Razorpay's rate limit
    const res = await fetch(`https://api.razorpay.com/v1/${path}`, { headers: { Authorization: `Basic ${auth}` } });
    if (!res.ok) throw new Error(`Razorpay ${path}: ${res.status}`);
    return (await res.json()) as T;
};

const { data: fulfilled, error } = await supabase
    .from("payment_fulfillments")
    .select("order_id, payment_id, product, user_id, amount, currency, claimed_at")
    .eq("status", "fulfilled")
    .order("claimed_at", { ascending: true });
if (error) throw error;

const { data: existing, error: rErr } = await supabase.from("payment_receipts").select("order_id");
if (rErr) throw rErr;
const issued = new Set((existing || []).map((r) => r.order_id));

let count = 0;
for (const f of fulfilled || []) {
    if (issued.has(f.order_id) || String(f.payment_id).startsWith("pay_dev_")) continue;

    const order = await razorpay<RazorpayOrder>(`orders/${encodeURIComponent(f.order_id)}`);
    const payment = await razorpay<RazorpayPayment>(`payments/${encodeURIComponent(f.payment_id)}`);
    const notes = normalizeNotes(order.notes);
    const product = f.product || productOf(notes);
    const row = (await findUserById(f.user_id)) || (await findUserByAuthId(f.user_id));
    const user = {
        userId: row?.id || f.user_id,
        authId: row?.auth_id || notes.auth_id || null,
        email: notes.email || notes.user_email || notes.userEmail || row?.email || payment.email || "",
    };

    count++;
    const paidOn = new Date(Number(payment.created_at) * 1000).toISOString().slice(0, 10);
    console.log(`${apply ? "issue" : "would issue"} ${f.order_id} ${paidOn} ${order.amount / 100} ${order.currency} — ${describePurchase(product, notes)} (${user.email || user.userId})`);
    if (apply) {
        const receipt = await issueReceipt({ order, payment, product, notes, user, source: "backfill" });
        if (!receipt) throw new Error(`Stopping: receipt for ${f.order_id} was not issued (see error above)`);
        console.log(`  → ${receipt.receipt_no}`);
    }
}

console.log(`\n${count} receipt(s) ${apply ? "issued" : "to issue — re-run with --apply"}.`);
process.exit(0);
