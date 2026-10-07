// Permanent account deletion: every per-user row across the platform, the
// user's uploaded files, and finally the Supabase auth user itself.
//
// Kept on purpose: `payment_fulfillments` (order id, payment id, product,
// amount — the internal payment ledger, no contact details) so refunds,
// disputes and tax records can still be reconciled with Razorpay — and
// `payment_receipts`, unlinked from the account (user_id / auth_id cleared).
//
// Data goes first and the auth user last: if anything fails part-way the
// account still exists, so the user (or support) can simply retry.
import supabase from "../../supabase/index.js";
import { unlinkReceipts } from "../payments/receipts.js";

const FUNDA_BUCKET = "funda-documents";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tables whose `user_id` holds the user's id (auth id, or the legacy
// public.users id on the older tables). Children first where a table is
// referenced by another one in this list.
const USER_ID_TABLES = [
    // Fundakamental
    "funda_chat_messages",
    "funda_document_chunks",
    "funda_reports",
    "funda_source_documents",
    "funda_notifications",
    "funda_price_alerts",
    "funda_signal_alerts",
    "funda_saved_screens",
    "funda_watchlists", // items cascade
    "funda_portfolios", // holdings, transactions, snapshots cascade
    "funda_ai_wallets",
    "funda_token_pack_purchases",
    "funda_pro_plans",
    // Journal
    "journal_trades",
    "journal_goals",
    "journal_strategies",
    "journal_user_state",
    "journal_ai_wallet_purchases",
    "journal_ai_wallets",
    "journal_pro_plans",
    // Gini
    "gini_assets",
    "gini_liabilities",
    "gini_goals",
    "gini_family_members",
    "gini_elder_care",
    "gini_education_plans",
    "gini_tax_optimization",
    "gini_user_data",
    "gini_ai_wallet_purchases",
    "gini_ai_wallets",
    "gini_pro_plans",
    // Backtest, algos, learning
    "backtest_runs",
    "backtest_strategies",
    "backtest_pro_plans",
    "algo_publisher_applications",
    "user_lesson_progress",
    "purchases",
];

// Legacy dual-ID tables: scoped by `auth_id` (their `user_id` is unreliable).
const AUTH_ID_TABLES = ["user_entitlements", "user_subscriptions", "algorithm_subscriptions", "learn_pro_plans", "newsletter_pro_plans"];

// Rows keyed only by email address.
const EMAIL_TABLES = ["newsletter_subscribers", "support_tickets"];

export interface DeletionResult {
    ok: boolean;
    failures: string[];
}

const missingTable = (message: string) => /does not exist|Could not find the table|schema cache/i.test(message);

async function removeStorageFolder(bucket: string, folder: string, failures: string[]) {
    // Uploads live under "<auth id>/<file>"; list in pages until empty.
    for (let page = 0; page < 50; page++) {
        const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 100 });
        if (error) {
            if (!/not found/i.test(error.message)) failures.push(`storage ${bucket}: ${error.message}`);
            return;
        }
        if (!data || data.length === 0) return;
        const { error: removeError } = await supabase.storage.from(bucket).remove(data.map((f) => `${folder}/${f.name}`));
        if (removeError) {
            failures.push(`storage ${bucket}: ${removeError.message}`);
            return;
        }
    }
}

/** Delete everything that belongs to one account. */
export async function deleteAccountData(user: { authId: string; userId?: string | null; email?: string | null }): Promise<DeletionResult> {
    const failures: string[] = [];
    if (!UUID.test(user.authId || "")) return { ok: false, failures: ["invalid account id"] };
    const ids = Array.from(new Set([user.authId, user.userId].filter(Boolean))) as string[];

    // The legacy profile row may carry a different id than req.user.userId.
    const { data: legacy } = await supabase.from("users").select("id").eq("auth_id", user.authId);
    for (const row of legacy || []) if (row.id && !ids.includes(row.id)) ids.push(row.id);

    await removeStorageFolder(FUNDA_BUCKET, user.authId, failures);

    for (const table of USER_ID_TABLES) {
        const { error } = await supabase.from(table).delete().in("user_id", ids);
        if (error && !missingTable(error.message)) failures.push(`${table}: ${error.message}`);
    }
    for (const table of AUTH_ID_TABLES) {
        const { error } = await supabase.from(table).delete().eq("auth_id", user.authId);
        if (error && !missingTable(error.message)) failures.push(`${table}: ${error.message}`);
    }
    const email = (user.email || "").trim().toLowerCase();
    if (email) {
        for (const table of EMAIL_TABLES) {
            // Case-insensitive exact match: escape ilike's wildcards so "a_b@x.com"
            // can never match someone else's address.
            const { error } = await supabase.from(table).delete().ilike("email", email.replace(/[\\%_]/g, (c) => `\\${c}`));
            if (error && !missingTable(error.message)) failures.push(`${table}: ${error.message}`);
        }
    }

    const unlinkError = await unlinkReceipts(user.authId, ids);
    if (unlinkError) failures.push(`payment_receipts: ${unlinkError}`);

    if (failures.length) return { ok: false, failures };

    // Profiles, then the login itself.
    const { error: fundaError } = await supabase.from("funda_users").delete().eq("id", user.authId);
    if (fundaError && !missingTable(fundaError.message)) failures.push(`funda_users: ${fundaError.message}`);
    const { error: usersError } = await supabase.from("users").delete().eq("auth_id", user.authId);
    if (usersError) failures.push(`users: ${usersError.message}`);
    if (failures.length) return { ok: false, failures };

    const { error: authError } = await supabase.auth.admin.deleteUser(user.authId);
    if (authError && !/not found/i.test(authError.message)) failures.push(`auth user: ${authError.message}`);

    return { ok: failures.length === 0, failures };
}
