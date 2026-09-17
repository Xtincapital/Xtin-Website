import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createGoal, listGoals, getGoal, updateGoal, deleteGoal } from "./goals.controller.js";

const router = Router();

// All goal routes require authentication.
router.post("/journal/goals", authenticate, createGoal);
router.get("/journal/goals", authenticate, listGoals);
router.get("/journal/goals/:goalId", authenticate, getGoal);
router.patch("/journal/goals/:goalId", authenticate, updateGoal);
router.delete("/journal/goals/:goalId", authenticate, deleteGoal);

export default router;
