import express from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    getLearnPlan,
    createLearnOrder,
    verifyLearnPayment,
    devActivateLearnPlan,
    getVideoModuleAvailability,
    getPaidLessonVideo,
} from "./learnPlan.controller.js";

const router = express.Router();

/* 🎓 LEARN PRO PLAN ROUTES (all authenticated) */
router.get("/learn/plan", authenticate, getLearnPlan);
router.post("/learn/order", authenticate, createLearnOrder);
router.post("/learn/verify", authenticate, verifyLearnPayment);
// Local development only — controller refuses in production / when Razorpay is configured.
router.post("/learn/dev-activate", authenticate, devActivateLearnPlan);

/* 🎬 PREMIUM VIDEO MODULES — availability is public, paid IDs are Pro-only */
router.get("/learn/videos/:slug", getVideoModuleAvailability);
router.get("/learn/videos/:slug/:lesson", authenticate, getPaidLessonVideo);

export default router;
