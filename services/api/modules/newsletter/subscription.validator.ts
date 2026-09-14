import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const subscriptionSchema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(1, "Name is required").optional(),
	// Comma-separated market preferences (IN,US,GLOBAL). Free subscribers get
	// the India wrap regardless; Pro subscribers get every market they list.
	markets: z.string().max(40).optional(),
});

const validateSubscription = (input) => {
	const trimmed = trimStrings(input);
	const result = subscriptionSchema.safeParse(trimmed);
	if (!result.success) {
		const errors = result.error.issues.map((i) => i.message);
		return { errors, message: "Validation failed" };
	}
	return { data: result.data, message: "Validation successful" };
};

export { validateSubscription };