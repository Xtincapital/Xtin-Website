import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createEducationPlan, listEducationPlans, getEducationPlan, updateEducationPlan, deleteEducationPlan } from "./educationPlans.controller.js";

const router = Router();

// All education plan routes require authentication.
router.post("/gini/education-plans", authenticate, createEducationPlan);
router.get("/gini/education-plans", authenticate, listEducationPlans);
router.get("/gini/education-plans/:planId", authenticate, getEducationPlan);
router.patch("/gini/education-plans/:planId", authenticate, updateEducationPlan);
router.delete("/gini/education-plans/:planId", authenticate, deleteEducationPlan);

export default router;
