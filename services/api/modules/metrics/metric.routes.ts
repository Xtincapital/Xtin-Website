import { Router } from "express";
import {
	readMetricController,
	createMetricController,
	updateMetricController,
} from "./metric.controller.js";
import { authenticate } from "../../middlewares/auth.js";
const router = Router();
router.get("/metrics", readMetricController);
router.post("/metrics", authenticate, createMetricController);
router.patch("/metrics", authenticate, updateMetricController);

export default router;
