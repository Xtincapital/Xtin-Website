import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    createPriceAlert,
    getPriceAlerts,
    getAlertsForTicker,
    deletePriceAlert,
    toggleAlert,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    getUnreadCount,
} from "./alerts.controller.js";

const router = Router();

// All alert/notification routes require authentication.
router.post("/fundakamental/alerts", authenticate, createPriceAlert);
router.get("/fundakamental/alerts", authenticate, getPriceAlerts);
router.get("/fundakamental/alerts/:ticker", authenticate, getAlertsForTicker);
router.delete("/fundakamental/alerts/:alertId", authenticate, deletePriceAlert);
router.patch("/fundakamental/alerts/:alertId/toggle", authenticate, toggleAlert);

router.get("/fundakamental/notifications", authenticate, getNotifications);
router.get("/fundakamental/notifications/unread-count", authenticate, getUnreadCount);
router.patch("/fundakamental/notifications/:notificationId/read", authenticate, markNotificationRead);
router.post("/fundakamental/notifications/read-all", authenticate, markAllNotificationsRead);
router.delete("/fundakamental/notifications/:notificationId", authenticate, deleteNotification);

export default router;
