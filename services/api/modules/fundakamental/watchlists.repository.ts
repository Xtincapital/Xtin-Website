// Thin Supabase-query wrappers for the watchlist manager (v2 schema) —
// Node/TS port of `api/endpoints/watchlists.py`'s table access.
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql,
// "Watchlist manager, v2" section): watchlists -> funda_watchlists,
// watchlist_items -> funda_watchlist_items, watchlist_snapshots ->
// funda_watchlist_snapshots, watchlist_summary (view) -> funda_watchlist_summary.
// The older singular `funda_watchlist` table is unrelated and unused here.
import supabase from "../../supabase/index.js";

/* funda_watchlists --------------------------------------------------------- */

const getMaxSortOrder = (userId: string) =>
    supabase.from("funda_watchlists").select("sort_order").eq("user_id", userId).order("sort_order", { ascending: false }).limit(1);

const insertWatchlist = (record: Record<string, unknown>) => supabase.from("funda_watchlists").insert(record).select();

const getWatchlistSummaries = (userId: string) =>
    supabase.from("funda_watchlist_summary").select("*").eq("user_id", userId).order("sort_order", { ascending: true });

const getWatchlistSummaryById = (watchlistId: string, userId: string) =>
    supabase.from("funda_watchlist_summary").select("*").eq("id", watchlistId).eq("user_id", userId);

// Ownership check used by every nested endpoint (items, summary, snapshots).
const getWatchlistOwnership = (watchlistId: string, userId: string) =>
    supabase.from("funda_watchlists").select("id").eq("id", watchlistId).eq("user_id", userId);

const getWatchlistById = (watchlistId: string, userId: string) =>
    supabase.from("funda_watchlists").select("*").eq("id", watchlistId).eq("user_id", userId);

const getWatchlistDefaultFlag = (watchlistId: string, userId: string) =>
    supabase.from("funda_watchlists").select("is_default").eq("id", watchlistId).eq("user_id", userId);

const updateWatchlist = (watchlistId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("funda_watchlists").update(updateData).eq("id", watchlistId).eq("user_id", userId).select();

const deleteWatchlist = (watchlistId: string, userId: string) =>
    supabase.from("funda_watchlists").delete().eq("id", watchlistId).eq("user_id", userId).select();

/* funda_watchlist_items ----------------------------------------------------- */

const getWatchlistItemCount = (watchlistId: string) =>
    supabase.from("funda_watchlist_items").select("id", { count: "exact", head: true }).eq("watchlist_id", watchlistId);

const insertWatchlistItem = (record: Record<string, unknown>) => supabase.from("funda_watchlist_items").insert(record).select();

const getWatchlistItems = (watchlistId: string) =>
    supabase.from("funda_watchlist_items").select("*").eq("watchlist_id", watchlistId).order("added_at", { ascending: false });

const getWatchlistItemById = (watchlistId: string, itemId: string) =>
    supabase.from("funda_watchlist_items").select("*").eq("id", itemId).eq("watchlist_id", watchlistId);

const updateWatchlistItem = (watchlistId: string, itemId: string, updateData: Record<string, unknown>) =>
    supabase.from("funda_watchlist_items").update(updateData).eq("id", itemId).eq("watchlist_id", watchlistId).select();

const getWatchlistItemForDelete = (watchlistId: string, itemId: string) =>
    supabase.from("funda_watchlist_items").select("ticker, target_price, target_price_type").eq("id", itemId).eq("watchlist_id", watchlistId);

const deleteWatchlistItem = (watchlistId: string, itemId: string) =>
    supabase.from("funda_watchlist_items").delete().eq("id", itemId).eq("watchlist_id", watchlistId).select();

const bulkInsertWatchlistItems = (records: Record<string, unknown>[]) => supabase.from("funda_watchlist_items").insert(records).select();

const bulkDeleteWatchlistItems = (watchlistId: string, tickersUpper: string[]) =>
    supabase.from("funda_watchlist_items").delete().eq("watchlist_id", watchlistId).in("ticker", tickersUpper).select();

/* funda_watchlist_snapshots -------------------------------------------------- */

const upsertWatchlistSnapshot = (record: Record<string, unknown>) =>
    supabase.from("funda_watchlist_snapshots").upsert(record, { onConflict: "watchlist_id,snapshot_date" }).select();

const getWatchlistSnapshots = (watchlistId: string, cutoffDateIso: string) =>
    supabase
        .from("funda_watchlist_snapshots")
        .select("*")
        .eq("watchlist_id", watchlistId)
        .gte("snapshot_date", cutoffDateIso)
        .order("snapshot_date", { ascending: false });

/* funda_price_alerts -------------------------------------------------------- */
// Mirrors watchlists.py's own direct `supabase.table("price_alerts")` calls
// inside `_create_alert_for_target` / `_update_alert_for_target` /
// `_remove_alert_for_ticker` — kept local to this module rather than
// importing from alerts.repository.ts, matching the Python source's
// structure (no cross-module import there either).

const findExactPriceAlert = (userId: string, ticker: string, targetPrice: number, condition: string) =>
    supabase.from("funda_price_alerts").select("id").eq("user_id", userId).eq("ticker", ticker).eq("target_price", targetPrice).eq("condition", condition);

const findActivePriceAlertsForTicker = (userId: string, ticker: string) =>
    supabase.from("funda_price_alerts").select("*").eq("user_id", userId).eq("ticker", ticker).eq("is_active", true);

const insertPriceAlert = (record: Record<string, unknown>) => supabase.from("funda_price_alerts").insert(record);

const updatePriceAlertById = (alertId: string, updateData: Record<string, unknown>) =>
    supabase.from("funda_price_alerts").update(updateData).eq("id", alertId);

const deleteExactPriceAlert = (userId: string, ticker: string, targetPrice: number, condition: string) =>
    supabase.from("funda_price_alerts").delete().eq("user_id", userId).eq("ticker", ticker).eq("target_price", targetPrice).eq("condition", condition);

export {
    getMaxSortOrder,
    insertWatchlist,
    getWatchlistSummaries,
    getWatchlistSummaryById,
    getWatchlistOwnership,
    getWatchlistById,
    getWatchlistDefaultFlag,
    updateWatchlist,
    deleteWatchlist,
    getWatchlistItemCount,
    insertWatchlistItem,
    getWatchlistItems,
    getWatchlistItemById,
    updateWatchlistItem,
    getWatchlistItemForDelete,
    deleteWatchlistItem,
    bulkInsertWatchlistItems,
    bulkDeleteWatchlistItems,
    upsertWatchlistSnapshot,
    getWatchlistSnapshots,
    findExactPriceAlert,
    findActivePriceAlertsForTicker,
    insertPriceAlert,
    updatePriceAlertById,
    deleteExactPriceAlert,
};
