import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    createSubscriptionOrder,
    verifySubscriptionPayment,
    getUserSubscriptionPlans,
    devActivateSubscription,
} from "./subscriptionPlan.controller.js";

const router = Router();

router.post("/subscriptions/order", authenticate, createSubscriptionOrder);
router.post("/subscriptions/verify", authenticate, verifySubscriptionPayment);
router.get("/subscriptions/user-active-plans", authenticate, getUserSubscriptionPlans);
router.post("/subscriptions/dev-activate", authenticate, devActivateSubscription);

export default router;
