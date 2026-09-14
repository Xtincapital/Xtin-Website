import express from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    getLearnPlan,
    createLearnOrder,
    verifyLearnPayment,
    devActivateLearnPlan,
} from "./learnPlan.controller.js";

const router = express.Router();

/* 🎓 LEARN PRO PLAN ROUTES (all authenticated) */
router.get("/learn/plan", authenticate, getLearnPlan);
router.post("/learn/order", authenticate, createLearnOrder);
router.post("/learn/verify", authenticate, verifyLearnPayment);
// Local development only — controller refuses in production / when Razorpay is configured.
router.post("/learn/dev-activate", authenticate, devActivateLearnPlan);

export default router;
