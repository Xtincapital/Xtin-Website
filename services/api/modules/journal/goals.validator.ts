import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `journal_goals` (see database/migrations/0005) and
// app.js's `handleGoalForm` (title, metric, timeframe, targetValue).
const goalCreateSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
    metric: z.string().min(1, "Metric is required"),
    timeframe: z.string().min(1, "Timeframe is required"),
    target_value: z.number().positive("Target value must be greater than 0"),
});

export const validateGoalCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = goalCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const goalUpdateSchema = goalCreateSchema.partial();

export const validateGoalUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = goalUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
