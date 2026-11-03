import { Router } from "express";
import multer from "multer";
import { authenticate, requireAdmin } from "../../../middlewares/auth.js";
import { requireJournalPro } from "../planTier.js";
import { createLink, getStatus, reconsent, removeLink, requireBrokerSync, syncNow, triggerBrokerSync } from "./broker.controller.js";
import { approveLink, backfillLink, checkLink, compareStatement, diagnose, listLinks, listRuns, outboundIp, readiness, rejectLink, startSync } from "./broker.admin.controller.js";

const router = Router();

// A tradebook is a modest file; held in memory, read, and never stored.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const uploadFile = (req, res, next) =>
    upload.single("file")(req, res, (err) => {
        if (!err) return next();
        const tooBig = (err as { code?: string }).code === "LIMIT_FILE_SIZE";
        return res.status(400).json({ error: tooBig ? "That file is too large (20 MB at most)." : "Couldn't read the upload." });
    });

// Status and disconnect stay open to any signed-in customer: they must keep working
// when sync is switched off, or when a Pro plan lapses while a broker is linked.
router.get("/journal/broker/status", authenticate, getStatus);
router.delete("/journal/broker/link", authenticate, removeLink);
// Re-confirming new consent wording is open too, so a lapsed plan can't leave someone unable to answer.
router.post("/journal/broker/consent", authenticate, reconsent);

// Linking and syncing are a Journal Pro feature and need sync to be switched on.
router.post("/journal/broker/link", authenticate, requireJournalPro, requireBrokerSync, createLink);
router.post("/journal/broker/sync", authenticate, requireJournalPro, requireBrokerSync, syncNow);

// Admins confirm that a client code belongs to the customer who asked for it. Nothing is read until they do.
router.get("/admin/broker/links", authenticate, requireAdmin, listLinks);
router.get("/admin/broker/links/:id/check", authenticate, requireAdmin, checkLink);
router.post("/admin/broker/links/:id/approve", authenticate, requireAdmin, approveLink);
router.post("/admin/broker/links/:id/reject", authenticate, requireAdmin, rejectLink);
// Operating the sync: the last runs, a run on demand, and a read-only test of the broker connection.
router.get("/admin/broker/runs", authenticate, requireAdmin, listRuns);
router.post("/admin/broker/sync", authenticate, requireAdmin, startSync);
router.post("/admin/broker/diagnose", authenticate, requireAdmin, diagnose);
router.get("/admin/broker/outbound-ip", authenticate, requireAdmin, outboundIp);
// Earlier executions for a linked customer, from a broker file. Previews unless ?apply=true.
router.post("/admin/broker/links/:id/backfill", authenticate, requireAdmin, uploadFile, backfillLink);
// The trial: is it ready to go live, and does the journal agree with the customer's own statement?
router.get("/admin/broker/readiness", authenticate, requireAdmin, readiness);
router.post("/admin/broker/links/:id/compare", authenticate, requireAdmin, uploadFile, compareStatement);

// Token-protected (CRON_SECRET_TOKEN), not user-authenticated: called by an external scheduler.
router.post("/trigger-broker-sync", triggerBrokerSync);

export default router;
