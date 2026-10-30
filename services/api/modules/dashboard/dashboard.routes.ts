import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { getMoneySummary, updateMoneyProfile } from "./dashboard.controller.js";

const router = Router();

// The account dashboard's money sections (apps/web features/dashboard).
router.get("/dashboard/money", authenticate, getMoneySummary);
router.put("/dashboard/money/profile", authenticate, updateMoneyProfile);

export default router;
