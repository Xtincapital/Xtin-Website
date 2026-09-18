import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createFamilyMember, listFamilyMembers, getFamilyMember, updateFamilyMember, deleteFamilyMember } from "./familyMembers.controller.js";

const router = Router();

// All family member routes require authentication.
router.post("/gini/family-members", authenticate, createFamilyMember);
router.get("/gini/family-members", authenticate, listFamilyMembers);
router.get("/gini/family-members/:memberId", authenticate, getFamilyMember);
router.patch("/gini/family-members/:memberId", authenticate, updateFamilyMember);
router.delete("/gini/family-members/:memberId", authenticate, deleteFamilyMember);

export default router;
