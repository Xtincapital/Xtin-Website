// Price Alerts & Notifications API — Node/TS port of `api/endpoints/alerts.py`.
//
// Auth: `req.user.authId` is the FundaKaMental user id for every query here.
// No separate validator file for this module (the input surface is tiny —
// ticker/condition/target_price — and is checked inline, mirroring the
// Python source's own manual `if alert.condition not in (...)` check).
import { HTTP_STATUS, REGEX } from "../../constants/constants.js";
import {
    findStockByTicker,
    insertPriceAlert,
    getPriceAlertsForUser,
    getPriceAlertsForTicker,
    getPriceAlertOwner,
    deletePriceAlertById,
    getPriceAlertStatus,
    setPriceAlertActive,
    getNotifications as getNotificationsRepo,
    getNotificationOwner,
    markNotificationRead as markNotificationReadRepo,
    markAllNotificationsRead as markAllNotificationsReadRepo,
    deleteNotificationById,
    getUnreadNotificationCount,
} from "./alerts.repository.js";
import { checkUserAlertsIfDue } from "./priceAlertChecker.js";
import { findDirectoryEntry } from "./companyDirectory.js";
import { getQuote } from "./stockDataService.js";

function isValidUuid(value: string): boolean {
    return REGEX.UUID.test(value);
}

/* POST /api/fundakamental/alerts */
export const createPriceAlert = async (req, res) => {
    const { ticker, condition, target_price: targetPrice } = req.body || {};

    if (!ticker || typeof ticker !== "string") {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "ticker is required" });
    }
    if (condition !== "above" && condition !== "below") {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Condition must be 'above' or 'below'" });
    }
    const targetPriceNum = Number(targetPrice);
    if (!Number.isFinite(targetPriceNum) || targetPriceNum <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "target_price must be greater than 0" });
    }

    const tickerUpper = ticker.toUpperCase();

    try {
        // Any NSE/US listing (or anything with a live price), not just the
        // ~110 stocks the scanner stores.
        const { data: stockRows, error: stockError } = await findStockByTicker(tickerUpper);
        if (stockError) throw stockError;
        const known = (stockRows && stockRows.length > 0) || findDirectoryEntry(tickerUpper) || (await getQuote(tickerUpper).catch(() => null));
        if (!known) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                error: `We couldn't find "${tickerUpper}". Indian stocks end in .NS (e.g. RELIANCE.NS), US stocks as-is (e.g. AAPL).`,
            });
        }

        const { data, error } = await insertPriceAlert({
            user_id: req.user.authId,
            ticker: tickerUpper,
            condition,
            target_price: targetPriceNum,
            is_active: true,
        });

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to create alert" });
        }

        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        const message = (err as Error)?.message || String(err);
        if (message.toLowerCase().includes("duplicate key")) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Alert already exists for this price and condition" });
        }
        console.error("[Fundakamental] create price alert failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: message });
    }
};

/* GET /api/fundakamental/alerts?is_active= */
export const getPriceAlerts = async (req, res) => {
    let isActive: boolean | null = null;
    if (req.query.is_active === "true") isActive = true;
    else if (req.query.is_active === "false") isActive = false;

    try {
        const { data, error } = await getPriceAlertsForUser(req.user.authId, isActive);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch price alerts failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* GET /api/fundakamental/alerts/:ticker */
export const getAlertsForTicker = async (req, res) => {
    const ticker = String(req.params.ticker).toUpperCase();
    try {
        const { data, error } = await getPriceAlertsForTicker(req.user.authId, ticker);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch alerts for ticker failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* DELETE /api/fundakamental/alerts/:alertId */
export const deletePriceAlert = async (req, res) => {
    const { alertId } = req.params;
    if (!isValidUuid(alertId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid alert id" });
    }

    try {
        const { data, error } = await getPriceAlertOwner(alertId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Alert not found" });
        }
        if (data[0].user_id !== req.user.authId) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Not authorized" });
        }

        const { error: deleteError } = await deletePriceAlertById(alertId);
        if (deleteError) throw deleteError;

        return res.status(HTTP_STATUS.OK).json({ message: "Alert deleted successfully" });
    } catch (err) {
        console.error("[Fundakamental] delete price alert failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* PATCH /api/fundakamental/alerts/:alertId/toggle */
export const toggleAlert = async (req, res) => {
    const { alertId } = req.params;
    if (!isValidUuid(alertId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid alert id" });
    }

    try {
        const { data, error } = await getPriceAlertStatus(alertId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Alert not found" });
        }
        if (data[0].user_id !== req.user.authId) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Not authorized" });
        }

        const newStatus = !data[0].is_active;
        const { error: updateError } = await setPriceAlertActive(alertId, newStatus);
        if (updateError) throw updateError;

        return res.status(HTTP_STATUS.OK).json({ is_active: newStatus });
    } catch (err) {
        console.error("[Fundakamental] toggle price alert failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* GET /api/fundakamental/notifications?unread_only=&limit= */
export const getNotifications = async (req, res) => {
    const unreadOnly = req.query.unread_only === "true";
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

    try {
        const { data, error } = await getNotificationsRepo(req.user.authId, unreadOnly, limit);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch notifications failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* PATCH /api/fundakamental/notifications/:notificationId/read */
export const markNotificationRead = async (req, res) => {
    const { notificationId } = req.params;
    if (!isValidUuid(notificationId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid notification id" });
    }

    try {
        const { data, error } = await getNotificationOwner(notificationId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Notification not found" });
        }
        if (data[0].user_id !== req.user.authId) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Not authorized" });
        }

        const { error: updateError } = await markNotificationReadRepo(notificationId);
        if (updateError) throw updateError;

        return res.status(HTTP_STATUS.OK).json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("[Fundakamental] mark notification read failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* POST /api/fundakamental/notifications/read-all */
export const markAllNotificationsRead = async (req, res) => {
    try {
        const { error } = await markAllNotificationsReadRepo(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("[Fundakamental] mark all notifications read failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* DELETE /api/fundakamental/notifications/:notificationId */
export const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    if (!isValidUuid(notificationId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid notification id" });
    }

    try {
        const { data, error } = await getNotificationOwner(notificationId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Notification not found" });
        }
        if (data[0].user_id !== req.user.authId) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Not authorized" });
        }

        const { error: deleteError } = await deleteNotificationById(notificationId);
        if (deleteError) throw deleteError;

        return res.status(HTTP_STATUS.OK).json({ message: "Notification deleted" });
    } catch (err) {
        console.error("[Fundakamental] delete notification failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};

/* GET /api/fundakamental/notifications/unread-count */
export const getUnreadCount = async (req, res) => {
    try {
        // Check this user's price targets first (throttled), so a hit shows up
        // as soon as they open the dashboard even if the server was asleep.
        await Promise.race([checkUserAlertsIfDue(req.user.authId), new Promise((r) => setTimeout(r, 4000))]);
        const { count, error } = await getUnreadNotificationCount(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json({ count: count || 0 });
    } catch (err) {
        console.error("[Fundakamental] unread notification count failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: (err as Error)?.message || String(err) });
    }
};
