import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const lessonProgressSchema = z.object({
	module_slug: z.string().min(1, "Module slug is required"),
	lesson_slug: z.string().min(1, "Lesson slug is required"),
});

const validateLessonProgress = (input) => {
	const trimmed = trimStrings(input);
	const result = lessonProgressSchema.safeParse(trimmed);
	if (!result.success) {
		const errors = result.error.issues.map((i) => i.message);
		return { errors, message: "Validation failed" };
	}
	return { data: result.data, message: "Validation successful" };
};

export { validateLessonProgress };