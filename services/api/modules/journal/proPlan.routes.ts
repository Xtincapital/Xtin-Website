// Journal Pro plan purchase routes — Node/TS port of
// `features-incoming/journal/main.py`'s `/api/v2/plan*` router (Phase 9c).
// NOT wired into app.ts/index.ts here — a later sub-phase mounts this
// router alongside the rest of modules/journal.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createPlanOrder, verifyPlanPurchase, getPlan } from "./proPlan.controller.js";

const router = Router();

// All Pro plan routes require authentication.
router.post("/journal/plan/razorpay/order", authenticate, createPlanOrder);
router.post("/journal/plan/razorpay/verify", authenticate, verifyPlanPurchase);
router.get("/journal/plan", authenticate, getPlan);

export default router;
