// Gini Pro plan purchase routes — Node/TS port of
// `features-incoming/gini/api/razorpay-plan-order.js` +
// `api/razorpay-plan-verify.js` (Phase 10c). NOT wired into app.ts/index.ts
// here — a later step mounts this router alongside the rest of modules/gini.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createPlanOrder, verifyPlanPurchase, getPlan } from "./proPlan.controller.js";

const router = Router();

// All Pro plan routes require authentication.
router.post("/gini/plan/razorpay/order", authenticate, createPlanOrder);
router.post("/gini/plan/razorpay/verify", authenticate, verifyPlanPurchase);
router.get("/gini/plan", authenticate, getPlan);

export default router;
