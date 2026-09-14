import express from "express";
import {
	getAvailableCourses,
	getPurchasedCourses,
	getCourseById,
	purchaseCourse,
} from "./course.controller.js";
import { authenticate } from "../../middlewares/auth.js";
const router = express.Router();

router.get("/courses/available", getAvailableCourses);
router.get("/courses/purchased", authenticate, getPurchasedCourses);
router.get("/courses/:courseId", authenticate, getCourseById);
router.post("/courses/:courseId/purchase", authenticate, purchaseCourse);

export default router;
