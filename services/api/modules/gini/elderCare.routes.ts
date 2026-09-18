import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createElderCarePlan, listElderCarePlans, getElderCarePlan, updateElderCarePlan, deleteElderCarePlan } from "./elderCare.controller.js";

const router = Router();

// All elder care routes require authentication.
router.post("/gini/elder-care", authenticate, createElderCarePlan);
router.get("/gini/elder-care", authenticate, listElderCarePlans);
router.get("/gini/elder-care/:planId", authenticate, getElderCarePlan);
router.patch("/gini/elder-care/:planId", authenticate, updateElderCarePlan);
router.delete("/gini/elder-care/:planId", authenticate, deleteElderCarePlan);

export default router;
