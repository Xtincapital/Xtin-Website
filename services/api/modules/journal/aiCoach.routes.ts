// Route mounting for the Journal AI Coach endpoints (see aiCoach.controller.ts
// header for the full port mapping). NOT wired into app.ts/index.ts here —
// a later sub-phase mounts this router alongside the rest of modules/journal.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { analyzeTrades, getBehavioralAlerts, chatCoach, weeklyReview, preTradeCheck } from "./aiCoach.controller.js";

const router = Router();

// All AI coach routes require authentication.
router.post("/journal/analyze", authenticate, analyzeTrades);
router.get("/journal/behavioral-alerts", authenticate, getBehavioralAlerts);
router.post("/journal/chat", authenticate, chatCoach);
router.post("/journal/weekly-review", authenticate, weeklyReview);
router.post("/journal/pre-trade-check", authenticate, preTradeCheck);

export default router;
