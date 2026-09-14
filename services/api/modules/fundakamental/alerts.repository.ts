// Thin Supabase-query wrappers for price alerts and notifications —
// Node/TS port of `api/endpoints/alerts.py`'s table access.
//
// Table mapping: price_alerts -> funda_price_alerts, notifications ->
// funda_notifications, stocks -> funda_stocks (see
// database/migrations/0001_gini_journal_fundakamental.sql).
import supabase from "../../supabase/index.js";

/* funda_stocks (existence check only, matches alerts.py's own lookup) ------- */

const findStockByTicker = (ticker: string) => supabase.from("funda_stocks").select("ticker").eq("ticker", ticker);

/* funda_price_alerts --------------------------------------------------------- */

const insertPriceAlert = (record: Record<string, unknown>) => supabase.from("funda_price_alerts").insert(record).select();

const getPriceAlertsForUser = (userId: string, isActive: boolean | null) => {
    let query = supabase.from("funda_price_alerts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (isActive !== null) query = query.eq("is_active", isActive);
    return query;
};

const getPriceAlertsForTicker = (userId: string, ticker: string) =>
    supabase.from("funda_price_alerts").select("*").eq("user_id", userId).eq("ticker", ticker).order("created_at", { ascending: false });

const getPriceAlertOwner = (alertId: string) => supabase.from("funda_price_alerts").select("user_id").eq("id", alertId);

const deletePriceAlertById = (alertId: string) => supabase.from("funda_price_alerts").delete().eq("id", alertId);

const getPriceAlertStatus = (alertId: string) => supabase.from("funda_price_alerts").select("is_active, user_id").eq("id", alertId);

const setPriceAlertActive = (alertId: string, isActive: boolean) => supabase.from("funda_price_alerts").update({ is_active: isActive }).eq("id", alertId);

/* funda_notifications --------------------------------------------------------- */

const getNotifications = (userId: string, unreadOnly: boolean, limit: number) => {
    let query = supabase.from("funda_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
    if (unreadOnly) query = query.eq("is_read", false);
    return query;
};

const getNotificationOwner = (notificationId: string) => supabase.from("funda_notifications").select("user_id").eq("id", notificationId);

const markNotificationRead = (notificationId: string) => supabase.from("funda_notifications").update({ is_read: true }).eq("id", notificationId);

const markAllNotificationsRead = (userId: string) =>
    supabase.from("funda_notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);

const deleteNotificationById = (notificationId: string) => supabase.from("funda_notifications").delete().eq("id", notificationId);

const getUnreadNotificationCount = (userId: string) =>
    supabase.from("funda_notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false);

export {
    findStockByTicker,
    insertPriceAlert,
    getPriceAlertsForUser,
    getPriceAlertsForTicker,
    getPriceAlertOwner,
    deletePriceAlertById,
    getPriceAlertStatus,
    setPriceAlertActive,
    getNotifications,
    getNotificationOwner,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotificationById,
    getUnreadNotificationCount,
};
