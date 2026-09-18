// Gini AI token-pack purchase routes — Node/TS port of
// `features-incoming/gini/api/razorpay-order.js` + `api/razorpay-verify.js`
// (Phase 10c). NOT wired into app.ts/index.ts here — a later step mounts
// this router alongside the rest of modules/gini.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { getAiPlans, getAiWallet, createAiOrder, verifyAiPurchase } from "./aiWallet.controller.js";

const router = Router();

// All AI wallet routes require authentication.
router.get("/gini/ai/plans", authenticate, getAiPlans);
router.get("/gini/ai/wallet", authenticate, getAiWallet);
router.post("/gini/ai/razorpay/order", authenticate, createAiOrder);
router.post("/gini/ai/razorpay/verify", authenticate, verifyAiPurchase);

export default router;
