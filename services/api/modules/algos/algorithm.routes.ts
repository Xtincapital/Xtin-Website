import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    createAlgoOrder,
    verifyAlgoPayment,
    getAlgoSubscriptions,
    devActivateAlgoPlan,
} from "./algorithm.controller.js";

const router = Router();

// All algo routes require authentication
router.get("/algorithm/subscriptions", authenticate, getAlgoSubscriptions);
router.post("/algorithm/order", authenticate, createAlgoOrder);
router.post("/algorithm/verify", authenticate, verifyAlgoPayment);
router.post("/algorithm/dev-activate", authenticate, devActivateAlgoPlan);

export default router;
