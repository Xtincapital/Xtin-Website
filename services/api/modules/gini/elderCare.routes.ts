import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { requireGiniPro } from "./planTier.js";
import { createElderCarePlan, listElderCarePlans, getElderCarePlan, updateElderCarePlan, deleteElderCarePlan } from "./elderCare.controller.js";

const router = Router();

// All elder care routes require authentication.
router.post("/gini/elder-care", authenticate, requireGiniPro, createElderCarePlan);
router.get("/gini/elder-care", authenticate, requireGiniPro, listElderCarePlans);
router.get("/gini/elder-care/:planId", authenticate, requireGiniPro, getElderCarePlan);
router.patch("/gini/elder-care/:planId", authenticate, requireGiniPro, updateElderCarePlan);
router.delete("/gini/elder-care/:planId", authenticate, requireGiniPro, deleteElderCarePlan);

export default router;
