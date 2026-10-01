import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const createSchema = z.object({
    applicant_name: z.string().min(1, "Name is required").max(120),
    applicant_email: z.string().email("Enter a valid email address").max(200),
    algo_name: z.string().min(1, "Algorithm name is required").max(150),
    strategy_type: z.string().min(1, "Strategy type is required").max(60),
    asset_class: z.string().min(1, "Asset class is required").max(60),
    expected_price: z.number().min(100, "Expected price must be at least ₹100").max(10_000_000),
    backtest_summary: z.string().min(1, "Backtesting results are required").max(4000),
    description: z.string().min(1, "Description is required").max(6000),
    experience: z.string().min(1, "Trading experience is required").max(30),
});

export const validateApplicationCreate = (input: unknown) => {
    const result = createSchema.safeParse(trimStrings((input || {}) as Record<string, unknown>));
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const reviewSchema = z.object({
    status: z.enum(["pending", "under_review", "approved", "rejected"]),
    review_note: z.string().max(2000).optional().nullable(),
});

export const validateApplicationReview = (input: unknown) => {
    const result = reviewSchema.safeParse(trimStrings((input || {}) as Record<string, unknown>));
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
