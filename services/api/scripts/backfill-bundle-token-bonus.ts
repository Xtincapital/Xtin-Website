// One-time backfill (2026-10-05): bundles bought before bundles granted the
// 100,000 AI-token Pro bonus get it now — per Gini/Journal product in the
// bundle, once per Razorpay payment. Uses the same grantProIncludedTokens as
// live purchases, which records the payment id, so re-running is a no-op.
//
//   npx tsx scripts/backfill-bundle-token-bonus.ts           # dry run
//   npx tsx scripts/backfill-bundle-token-bonus.ts --apply   # grant

// Wallet code sizes the free grant by NODE_ENV; this runs against the live DB.
process.env.NODE_ENV = "production";

const apply = process.argv.includes("--apply");

const { default: supabase } = await import("../supabase/index.js");
const { normalizeProducts } = await import("../modules/billing/bundleCatalog.js");
const { findUserById } = await import("../modules/payments/fulfillment.repository.js");
const gini = await import("../modules/gini/proPlan.controller.js");
const journal = await import("../modules/journal/proPlan.controller.js");
const { findPurchaseByPaymentId: findGiniBonus } = await import("../modules/gini/aiWalletPurchases.repository.js");
const { findPurchaseByPaymentId: findJournalBonus } = await import("../modules/journal/aiWalletPurchases.repository.js");

type Payment = { paymentId: string; orderId: string; userId: string; authId: string | null; planId: string; products: string[] };
const payments = new Map<string, Payment>();

const add = (row: any) => {
    const paymentId = String(row?.payment_id || "");
    if (!paymentId.startsWith("pay_") || paymentId.startsWith("pay_dev_") || payments.has(paymentId)) return;
    payments.set(paymentId, {
        paymentId,
        orderId: String(row.order_id || ""),
        userId: String(row.user_id || ""),
        authId: row.auth_id || null,
        planId: String(row.plan_id || ""),
        products: normalizeProducts(row.products),
    });
};

// Every bundle payment since payment_fulfillments existed; `result` is the user_subscriptions row it wrote.
const { data: fulfilled, error: fErr } = await supabase
    .from("payment_fulfillments")
    .select("order_id, payment_id, result")
    .eq("product", "xtin_bundle")
    .eq("status", "fulfilled");
if (fErr) throw fErr;
for (const f of fulfilled || []) add({ ...(f.result || {}), payment_id: f.payment_id, order_id: f.order_id });

// Plus the latest payment of each bundle, which covers ones bought before that table.
const { data: subs, error: sErr } = await supabase.from("user_subscriptions").select("user_id, auth_id, plan_id, products, payment_id, order_id");
if (sErr) throw sErr;
for (const s of subs || []) add(s);

let giniGrants = 0;
let journalGrants = 0;
for (const p of payments.values()) {
    const text = JSON.stringify(p.products).toLowerCase();
    const ultimate = p.planId === "ultimate-pass";
    const wantsGini = ultimate || text.includes("gini");
    const wantsJournal = ultimate || text.includes("journal");
    if (!wantsGini && !wantsJournal) continue;

    const authId = p.authId || (await findUserById(p.userId))?.auth_id || null;
    if (!authId) {
        console.warn(`skip ${p.paymentId} (${p.planId}): no auth id for user ${p.userId}`);
        continue;
    }

    const needGini = wantsGini && !(await findGiniBonus(p.paymentId)).data;
    const needJournal = wantsJournal && !(await findJournalBonus(p.paymentId)).data;
    if (!needGini && !needJournal) continue;

    console.log(`${apply ? "grant" : "would grant"} ${p.paymentId} ${p.planId} → ${[needGini && "Gini", needJournal && "Journal"].filter(Boolean).join(" + ")} (auth ${authId.slice(0, 8)}…)`);
    if (needGini) {
        giniGrants++;
        if (apply) await gini.grantProIncludedTokens(authId, p.paymentId, p.orderId);
    }
    if (needJournal) {
        journalGrants++;
        if (apply) await journal.grantProIncludedTokens(authId, p.paymentId, p.orderId);
    }
}

console.log(`\n${apply ? "Granted" : "Dry run — would grant"}: ${giniGrants} Gini bonus(es), ${journalGrants} Journal bonus(es), 100,000 tokens each. Bundle payments scanned: ${payments.size}.`);
process.exit(0);
