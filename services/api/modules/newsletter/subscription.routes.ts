import {
	createSubscriberController,
	deleteSubscriberController,
	readSubscribersController,
	unsubscribeSubscriberController,
} from "./subscription.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { Router } from "express";
const router = Router();
router.get("/subscribers", authenticate, readSubscribersController);
router.get("/subscribers/unsubscribe", unsubscribeSubscriberController);
router.post("/subscribers", createSubscriberController);
router.delete("/subscribers", authenticate, deleteSubscriberController);
export default router;
