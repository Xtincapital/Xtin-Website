import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createLiability, listLiabilities, getLiability, updateLiability, deleteLiability } from "./liabilities.controller.js";

const router = Router();

// All liability routes require authentication.
router.post("/gini/liabilities", authenticate, createLiability);
router.get("/gini/liabilities", authenticate, listLiabilities);
router.get("/gini/liabilities/:liabilityId", authenticate, getLiability);
router.patch("/gini/liabilities/:liabilityId", authenticate, updateLiability);
router.delete("/gini/liabilities/:liabilityId", authenticate, deleteLiability);

export default router;
