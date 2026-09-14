import express from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    markLessonCompleted,
    getUserProgress,
    getModuleProgress,
    checkLessonCompleted,
    getLearnCompletionSummary,
} from "./progress.controller.js";

const router = express.Router();

/* 📚 PROGRESS ROUTES */
router.post("/progress/complete", authenticate, markLessonCompleted);
router.get("/progress/user", authenticate, getUserProgress);
router.get("/progress/learn-summary", authenticate, getLearnCompletionSummary);
router.get("/progress/module/:module_slug", authenticate, getModuleProgress);
router.get("/progress/check/:module_slug/:lesson_slug", authenticate, checkLessonCompleted);

export default router;