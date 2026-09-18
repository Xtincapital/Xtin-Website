import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createGoal, listGoals, getGoal, updateGoal, deleteGoal } from "./goals.controller.js";

const router = Router();

// All goal routes require authentication.
router.post("/gini/goals", authenticate, createGoal);
router.get("/gini/goals", authenticate, listGoals);
router.get("/gini/goals/:goalId", authenticate, getGoal);
router.patch("/gini/goals/:goalId", authenticate, updateGoal);
router.delete("/gini/goals/:goalId", authenticate, deleteGoal);

export default router;
