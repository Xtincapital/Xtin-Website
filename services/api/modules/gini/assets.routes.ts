import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createAsset, listAssets, getAsset, updateAsset, deleteAsset } from "./assets.controller.js";

const router = Router();

// All asset routes require authentication.
router.post("/gini/assets", authenticate, createAsset);
router.get("/gini/assets", authenticate, listAssets);
router.get("/gini/assets/:assetId", authenticate, getAsset);
router.patch("/gini/assets/:assetId", authenticate, updateAsset);
router.delete("/gini/assets/:assetId", authenticate, deleteAsset);

export default router;
