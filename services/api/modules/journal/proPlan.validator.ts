import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Request bodies never carry a user id or user_email here (unlike main.py's
// PlanOrderRequest/PlanVerifyRequest) — req.user.authId/req.user.email
// (from `authenticate`) are the only trusted values, same convention as
// aiWallet.validator.ts / aiCoach.validator.ts.
const planOrderSchema = z.object({
    plan_id: z.string().min(1, "plan_id is required"),
    currency: z.string().trim().optional().default("INR"),
});

export const validateProPlanOrder = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = planOrderSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const planVerifySchema = z.object({
    plan_id: z.string().min(1, "plan_id is required"),
    currency: z.string().trim().optional().default("INR"),
    region: z.string().trim().optional().nullable(),
    razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
    razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
    razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

export const validateProPlanVerify = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = planVerifySchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
