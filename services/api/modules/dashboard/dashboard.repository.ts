// Reads and writes behind the account dashboard's money API. Reads reuse the
// Gini and Academy repositories; the rest are small read-only queries (trade
// P&L for the month, AI token balances) plus the one place the dashboard
// writes: `gini_user_data.app_state`.
//
// Token balances are read straight from the wallet tables on purpose: the
// wallet repositories' `getOrCreateWallet` creates a wallet and grants the
// free tokens, which a page view must never do.

import supabase from "../../supabase/index.js";
import { getFamilyMembersByUser } from "../gini/familyMembers.repository.js";
import { getAssetsByUser } from "../gini/assets.repository.js";
import { getLiabilitiesByUser } from "../gini/liabilities.repository.js";
import { getGoalsByUser } from "../gini/goals.repository.js";
import { getAllProgressForUser } from "../academy/progress.repository.js";

type Row = Record<string, unknown>;

async function rows(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<Row[]> {
    const { data, error } = await query;
    if (error) throw error;
    return (data as Row[]) || [];
}

/** Every Gini list the dashboard needs, keyed by `auth.users.id`. */
export async function readGini(authId: string) {
    const [members, assets, liabilities, goals] = await Promise.all([
        rows(getFamilyMembersByUser(authId)),
        rows(getAssetsByUser(authId)),
        rows(getLiabilitiesByUser(authId)),
        rows(getGoalsByUser(authId)),
    ]);
    return { members, assets, liabilities, goals };
}

/** `gini_user_data.app_state` for the user, `{}` when they have no row yet. */
export async function readAppState(authId: string): Promise<Row> {
    const { data, error } = await supabase.from("gini_user_data").select("app_state").eq("user_id", authId).maybeSingle();
    if (error) throw error;
    const state = data?.app_state;
    return state && typeof state === "object" && !Array.isArray(state) ? (state as Row) : {};
}

/** Saves app_state only; the row's other columns (ai_profile, …) are left as they are. */
export async function writeAppState(authId: string, appState: Row): Promise<void> {
    const { error } = await supabase
        .from("gini_user_data")
        .upsert({ user_id: authId, app_state: appState, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
}

/** Date and P&L of the user's trades dated on or after `from` (YYYY-MM-DD), newest first. */
export async function readTradesSince(authId: string, from: string) {
    return rows(
        supabase
            .from("journal_trades")
            .select("id, date, pnl")
            .eq("user_id", authId)
            .gte("date", from)
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(500),
    );
}

/** Lessons completed per Learn course. Progress is keyed by the legacy `userId`. */
export async function readLearnProgress(userId: string) {
    const list = await rows(getAllProgressForUser(userId));
    const byModule = new Map<string, { module_slug: string; completed: number; last_completed_at: string | null }>();
    for (const r of list) {
        const slug = String(r.module_slug);
        const entry = byModule.get(slug) ?? { module_slug: slug, completed: 0, last_completed_at: null };
        entry.completed += 1;
        const at = (r.completed_at as string) || null;
        if (at && (!entry.last_completed_at || at > entry.last_completed_at)) entry.last_completed_at = at;
        byModule.set(slug, entry);
    }
    return [...byModule.values()];
}

/** The balance of an AI wallet, or null when the user has never opened one. Never creates one. */
export async function readTokenBalance(table: "gini_ai_wallets" | "journal_ai_wallets", authId: string): Promise<number | null> {
    const { data, error } = await supabase.from(table).select("token_balance").eq("user_id", authId).maybeSingle();
    if (error) throw error;
    return data ? Number(data.token_balance) || 0 : null;
}
