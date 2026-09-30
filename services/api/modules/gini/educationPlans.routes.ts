import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { requireGiniPro } from "./planTier.js";
import { createEducationPlan, listEducationPlans, getEducationPlan, updateEducationPlan, deleteEducationPlan } from "./educationPlans.controller.js";

const router = Router();

// All education plan routes require authentication.
router.post("/gini/education-plans", authenticate, requireGiniPro, createEducationPlan);
router.get("/gini/education-plans", authenticate, requireGiniPro, listEducationPlans);
router.get("/gini/education-plans/:planId", authenticate, requireGiniPro, getEducationPlan);
router.patch("/gini/education-plans/:planId", authenticate, requireGiniPro, updateEducationPlan);
router.delete("/gini/education-plans/:planId", authenticate, requireGiniPro, deleteEducationPlan);

export default router;
