// Journal AI token-pack purchase routes — Node/TS port of
// `features-incoming/journal/main.py`'s `/api/v2/ai/*` router (Phase 9c).
// NOT wired into app.ts/index.ts here — a later sub-phase mounts this
// router alongside the rest of modules/journal.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { getAiPlans, getAiWallet, createAiOrder, verifyAiPurchase } from "./aiWallet.controller.js";

const router = Router();

// All AI wallet routes require authentication.
router.get("/journal/ai/plans", authenticate, getAiPlans);
router.get("/journal/ai/wallet", authenticate, getAiWallet);
router.post("/journal/ai/razorpay/order", authenticate, createAiOrder);
router.post("/journal/ai/razorpay/verify", authenticate, verifyAiPurchase);

export default router;
