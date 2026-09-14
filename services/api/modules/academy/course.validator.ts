import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const purchaseCourseSchema = z.object({
	courseId: z.string().uuid("Invalid course ID"),
	transactionId: z.string().min(1, "Transaction ID is required"),
	pricePaid: z.number().min(0, "Price must be non-negative"),
	paymentMethod: z.enum(["razorpay", "stripe", "paypal", "bank_transfer"], {
		error: "Invalid payment method"
	}),
});

const validatePurchaseCourse = (input) => {
	const trimmed = trimStrings(input);
	const result = purchaseCourseSchema.safeParse(trimmed);
	if (!result.success) {
		const errors = result.error.issues.map((i) => i.message);
		return { errors, message: "Validation failed" };
	}
	return { data: result.data, message: "Validation successful" };
};

export { validatePurchaseCourse };