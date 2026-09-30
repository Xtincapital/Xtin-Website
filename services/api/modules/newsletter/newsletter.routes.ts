import express from "express";
import {
	getAllNewsletters,
	getNewsletter,
	generateNewsletter,
	getAllIndianFinanceNewsletters,
	getIndianFinanceNewsletter,
	getIndianFinanceNewsletterHTML,
	sendTestNewsletterEmail,
	sendNewsletterToAllSubscribers,
	getCronStatus,
	triggerNewsletterGeneration,
	adminRunNewsletter,
	adminNewsletterStatus,
} from "./newsletter.controller.js";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";

const router = express.Router();

// Get all newsletters
router.get("/newsletters", getAllNewsletters);

// Get specific newsletter by ID
router.get("/newsletters/:id", getNewsletter);

// Generate new newsletter manually
router.post("/generate-newsletter", authenticate, requireAdmin, generateNewsletter);

// Get all Indian Finance newsletters
router.get("/indian-finance-newsletters", getAllIndianFinanceNewsletters);

// Get specific Indian Finance newsletter by ID
router.get("/indian-finance-newsletters/:id", getIndianFinanceNewsletter);

// Get Indian Finance newsletter HTML for email
router.get("/indian-finance-newsletters/:id/html", getIndianFinanceNewsletterHTML);

// Send test newsletter email
router.post("/indian-finance-newsletters/send-test", authenticate, requireAdmin, sendTestNewsletterEmail);

// Send newsletter to all subscribers
router.post("/indian-finance-newsletters/send-to-all", authenticate, requireAdmin, sendNewsletterToAllSubscribers);

// Get cron status (check if cron jobs are running)
router.get("/cron-status", authenticate, requireAdmin, getCronStatus);

// Trigger newsletter generation and distribution (for external cron services)
// Add CRON_SECRET_TOKEN to .env for security
router.post("/trigger-newsletter", triggerNewsletterGeneration);

// Admin: send an edition manually (the admin newsletter page)
router.post("/admin/newsletter/run", authenticate, requireAdmin, adminRunNewsletter);
router.get("/admin/newsletter/status", authenticate, requireAdmin, adminNewsletterStatus);

export default router;
