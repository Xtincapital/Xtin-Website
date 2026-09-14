// Analysis routes — Node/TS port of `api/endpoints/analysis.py`'s router.
//
// File uploads: mirrors the multer pattern used elsewhere in this codebase
// (memory storage — the extraction step needs the raw buffer, and the file
// is immediately forwarded to Supabase Storage, never written to local
// disk). The 50MB cap matches `FileProcessor.MAX_FILE_SIZE` in
// fileProcessor.ts; `validateFile` still re-checks extension + size inside
// the controller for a friendlier error body than multer's default reject.
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth.js";
import { uploadFile, startAnalysis, getAnalysisStatus } from "./analysis.controller.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB, matches fileProcessor.ts's MAX_FILE_SIZE
});

const router = Router();

// All analysis routes require authentication.
router.post("/fundakamental/analysis/upload", authenticate, upload.single("file"), uploadFile);
router.post("/fundakamental/analysis/analyze", authenticate, startAnalysis);
router.get("/fundakamental/analysis/status/:reportId", authenticate, getAnalysisStatus);

export default router;
