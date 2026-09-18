import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { getTaxOptimization, updateTaxOptimization } from "./taxOptimization.controller.js";

const router = Router();

// Get-or-create-style pair (not list CRUD) — always exactly one row per
// authenticated user.
router.get("/gini/tax-optimization", authenticate, getTaxOptimization);
router.put("/gini/tax-optimization", authenticate, updateTaxOptimization);

export default router;
