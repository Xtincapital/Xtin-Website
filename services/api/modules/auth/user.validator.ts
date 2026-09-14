import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";
import { REGEX } from "../../constants/constants.js";

const UserSignupSchema = z.object({
	first_name: z
		.string()
		.min(2, "Name must be at least 2 characters long")
		.max(100, "Name cant be more than 100 characters long"),
	last_name: z
		.string()
		.min(2, "Name must be at least 2 characters long")
		.max(100, "Name cant be more than 100 characters long"),
	email: z.email().transform((val) => val.toLowerCase()),
	phone_number: z
		.string()
		.optional()
		.refine(
			(val) => !val || REGEX.PHONE.test(val),
			"Phone number must be 10 digits and cannot start with 0"
		),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.regex(
			REGEX.PASSWORD,
			"Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long"
		),
});

const userLoginSchema = z.object({
	email: z.email().transform((val) => val.toLowerCase()),
	password: z
		.string()
		.min(1, "Password is required"),
});

const validateUserSignup = (user) => {
	const trimmedUser = trimStrings(user);
	const result = UserSignupSchema.safeParse(trimmedUser);
	if (!result.success) {
		const errorsMessages = result.error.issues.map(
			(issue) => issue.message
		);
		return {
			errors: errorsMessages,
			message: "User validation failed",
		};
	}
	return {
		data: result.data,
		message: "User validated successfully",
	};
};

const validateUserLogin = (user) => {
	const trimmedUser = trimStrings(user);

	if (!trimmedUser.email) {
		return {
			errors: ["Email is required"],
			message: "Validation failed: Email is required",
		};
	}

	const result = userLoginSchema.safeParse(trimmedUser);
	if (!result.success) {
		const errorsMessages = result.error.issues.map(
			(issue) => issue.message
		);
		return {
			errors: errorsMessages,
			message: "User validation failed",
		};
	}
	return {
		data: result.data,
		message: "User validated successfully",
	};
};

export { validateUserSignup, validateUserLogin };
