import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { listStrategies, createStrategy, deleteStrategy } from "./strategies.controller.js";

const router = Router();

// All strategy routes require authentication.
router.get("/journal/strategies", authenticate, listStrategies);
router.post("/journal/strategies", authenticate, createStrategy);
router.delete("/journal/strategies/:strategyId", authenticate, deleteStrategy);

export default router;
