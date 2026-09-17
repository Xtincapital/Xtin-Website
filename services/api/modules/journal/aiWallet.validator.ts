import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Request bodies never carry a user id here (unlike main.py's
// AiOrderRequest/AiPaymentVerifyRequest) — req.user.authId (from
// `authenticate`) is the only trusted user id, same convention as
// aiCoach.validator.ts.
const aiOrderSchema = z.object({
    package_id: z.string().min(1, "package_id is required"),
});

export const validateAiOrderRequest = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = aiOrderSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const aiVerifySchema = z.object({
    package_id: z.string().min(1, "package_id is required"),
    razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
    razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
    razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

export const validateAiVerifyRequest = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = aiVerifySchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
