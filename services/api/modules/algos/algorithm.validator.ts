import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const algoOrderSchema = z.object({
    // Must match the current keys of ALGO_PLANS in algorithm.controller.ts.
    algo_name: z.enum(["AurumV", "Bird Eye", "Gamma", "Z1"], { error: "Invalid algorithm name" }),
    plan_type: z.enum(["monthly"], { error: "Invalid plan type" }).default("monthly"),
    tradingview_username: z.string().min(1, "TradingView username is required"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
});

const algoVerifySchema = z.object({
    algo_name: z.string().min(1, "Algorithm name is required"),
    plan_type: z.string().default("monthly"),
    razorpay_order_id: z.string().min(1, "Order ID is required"),
    razorpay_payment_id: z.string().min(1, "Payment ID is required"),
    razorpay_signature: z.string().min(1, "Signature is required"),
    tradingview_username: z.string().optional(),
    phone_number: z.string().optional(),
});

export const validateAlgoOrder = (input) => {
    const trimmed = trimStrings(input);
    const result = algoOrderSchema.safeParse(trimmed);
    if (!result.success) {
        const errors = result.error.issues.map((i) => i.message);
        return { errors, message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};

export const validateAlgoVerify = (input) => {
    const trimmed = trimStrings(input);
    const result = algoVerifySchema.safeParse(trimmed);
    if (!result.success) {
        const errors = result.error.issues.map((i) => i.message);
        return { errors, message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};
