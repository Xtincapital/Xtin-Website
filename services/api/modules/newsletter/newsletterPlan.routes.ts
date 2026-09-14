import express from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    getNewsletterPlan,
    createNewsletterOrder,
    verifyNewsletterPayment,
    updateNewsletterMarkets,
    devActivateNewsletterPlan,
} from "./newsletterPlan.controller.js";

const router = express.Router();

/* 📰 NEWSLETTER PRO PLAN ROUTES (all authenticated) */
router.get("/newsletter/plan", authenticate, getNewsletterPlan);
router.post("/newsletter/order", authenticate, createNewsletterOrder);
router.post("/newsletter/verify", authenticate, verifyNewsletterPayment);
router.put("/newsletter/markets", authenticate, updateNewsletterMarkets);
// Local development only — controller refuses in production / when Razorpay is configured.
router.post("/newsletter/dev-activate", authenticate, devActivateNewsletterPlan);

export default router;
