import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth.js";
import { importTrades } from "./import.controller.js";

// Memory storage: the uploaded file is parsed in-process and never persisted
// anywhere (unlike fundakamental/analysis.routes.ts's upload, which also
// stores the original in Supabase Storage) — this endpoint is pure parsing.
// 50MB cap matches that same file's convention.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

// Requires authentication like every other Journal endpoint, even though the
// parser itself never touches the database — no reason to let unauthenticated
// users hit a file-upload/parsing endpoint.
router.post("/journal/import-trades", authenticate, upload.single("file"), importTrades);

export default router;
