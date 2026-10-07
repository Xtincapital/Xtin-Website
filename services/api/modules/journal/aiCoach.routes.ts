// Route mounting for the Journal AI Coach endpoints (see aiCoach.controller.ts
// header for the full port mapping). NOT wired into app.ts/index.ts here —
// a later sub-phase mounts this router alongside the rest of modules/journal.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { analyzeTrades, getBehavioralAlerts, chatCoach, weeklyReview, preTradeCheck } from "./aiCoach.controller.js";
import { chatHistoryRouter } from "../ai/chatHistory.js";
import { getPlanTier } from "./planTier.js";

const router = Router();

// All AI coach routes require authentication.
router.post("/journal/analyze", authenticate, analyzeTrades);
router.get("/journal/behavioral-alerts", authenticate, getBehavioralAlerts);
router.post("/journal/chat", authenticate, chatCoach);
router.post("/journal/weekly-review", authenticate, weeklyReview);
router.post("/journal/pre-trade-check", authenticate, preTradeCheck);
// Saved coach chats — a Journal Pro perk (server-side tier only, never the client's).
router.use(chatHistoryRouter("journal", async (authId) => (await getPlanTier(authId)) === "pro"));

export default router;
