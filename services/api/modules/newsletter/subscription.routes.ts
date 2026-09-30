import {
	createSubscriberController,
	deleteSubscriberController,
	readSubscribersController,
	unsubscribeSubscriberController,
} from "./subscription.controller.js";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import { Router } from "express";
const router = Router();
router.get("/subscribers", authenticate, requireAdmin, readSubscribersController);
router.get("/subscribers/unsubscribe", unsubscribeSubscriberController);
router.post("/subscribers", createSubscriberController);
router.delete("/subscribers", authenticate, deleteSubscriberController);
export default router;
