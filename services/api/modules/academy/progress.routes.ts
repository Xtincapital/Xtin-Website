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
router.post("/complete", authenticate, markLessonCompleted);
router.get("/user", authenticate, getUserProgress);
router.get("/learn-summary", authenticate, getLearnCompletionSummary);
router.get("/module/:module_slug", authenticate, getModuleProgress);
router.get("/check/:module_slug/:lesson_slug", authenticate, checkLessonCompleted);

export default router;