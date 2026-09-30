import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth.js";
import { importHoldings } from "./import.controller.js";

// Memory storage — parsed in-process, never persisted (mirrors journal/import.routes.ts).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
router.post("/gini/import-holdings", authenticate, upload.single("file"), importHoldings);

export default router;
