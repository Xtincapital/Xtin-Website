import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const contactFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
	subject: z.string().min(5, "Subject must be at least 5 characters"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

const validateContactForm = (input) => {
	const trimmed = trimStrings(input);
	const result = contactFormSchema.safeParse(trimmed);
	if (!result.success) {
		const errors = result.error.issues.map((i) => i.message);
		return { errors, message: "Validation failed" };
	}
	return { data: result.data, message: "Validation successful" };
};

export { validateContactForm };