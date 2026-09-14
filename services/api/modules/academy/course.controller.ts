import {
	availableCourses,
	purchasedCourses,
	purchasedCourseById,
	purchaseCourseById,
} from "./course.repository.js";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validatePurchaseCourse } from "./course.validator.js";

const getAvailableCourses = async (req, res) => {
	const courses = await availableCourses();
	return res.status(HTTP_STATUS.OK).json({
		status: HTTP_STATUS.OK,
		message: "Available courses retrieved successfully",
		data: courses,
	});
};

const getPurchasedCourses = async (req, res) => {
	const courses = await purchasedCourses(req.user.id);
	console.log(req.user);
	return res.status(HTTP_STATUS.OK).json({
		status: HTTP_STATUS.OK,
		message: "Purchased courses retrieved successfully",
		data: courses,
	});
};

const getCourseById = async (req, res) => {
	const course = await purchasedCourseById(req.user.id, req.params.courseId);
	return res.status(HTTP_STATUS.OK).json({
		status: HTTP_STATUS.OK,
		message: "Course retrieved successfully",
		data: course,
	});
};

const purchaseCourse = async (req, res) => {
	const { courseId } = req.params;
	const validation = validatePurchaseCourse({ courseId, ...req.body });
	if (validation.errors) {
		return res.status(HTTP_STATUS.BAD_REQUEST).json({
			errors: validation.errors,
			message: validation.message,
		});
	}

	const { transactionId, pricePaid, paymentMethod } = validation.data;
	const purchasedAt = new Date();
	const course = await purchaseCourseById(
		req.user.id,
		courseId,
		transactionId,
		pricePaid,
		paymentMethod,
		purchasedAt
	);
	return res.status(HTTP_STATUS.OK).json({
		status: HTTP_STATUS.OK,
		message: "Course purchased successfully",
		data: course,
	});
};

export {
	getAvailableCourses,
	getPurchasedCourses,
	getCourseById,
	purchaseCourse,
};
