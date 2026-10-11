import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_goals` exactly (see
// database/migrations/0006_gini_normalized_schema.sql) — this module has no
// legacy API contract to preserve (the original app synced a client-side
// JSON blob straight to Supabase, see that migration's header comment and
// features-incoming/gini/app.js's goal-form `save()` handler, ~lines
// 3789-3860), so request/response fields use the same snake_case names as
// the DB columns 1:1.
//
// Numeric bounds below (current_cost > 0, target_year > current year,
// saved >= 0 and <= current_cost, inflation/return_rate 0-100) mirror the
// original's own client-side validation in that same handler.
//
// `funding_split` is `jsonb` in the schema (kept flexible per the migration
// comment) even though the original only ever stored a single 1-100
// percentage number there — accept any JSON-compatible value rather than
// pinning it to a number.
const jsonValueSchema = z.union([z.number(), z.string(), z.boolean(), z.record(z.string(), z.unknown()), z.array(z.unknown())]);

const goalCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    category: z.string().optional().nullable(),
    current_cost: z.number().positive("Current cost must be a positive number"),
    target_year: z
        .number()
        .int()
        .refine((year) => year > new Date().getFullYear(), { message: `Target year must be after ${new Date().getFullYear()}` })
        .optional()
        .nullable(),
    priority: z.string().optional().nullable(),
    inflation: z.number().min(0, "Inflation must be between 0 and 100 percent").max(100, "Inflation must be between 0 and 100 percent").optional().nullable(),
    saved: z.number().min(0, "Amount saved cannot be negative").optional().nullable(),
    return_rate: z
        .number()
        .min(0, "Expected return must be between 0 and 100 percent")
        .max(100, "Expected return must be between 0 and 100 percent")
        .optional()
        .nullable(),
    assigned_to: z.string().uuid("assigned_to must be a valid UUID").optional().nullable(),
    funded_by: z.string().optional().nullable(),
    funding_split: jsonValueSchema.optional().nullable(),
    // Answers to the category-specific questions (see migration 0018).
    details: z
        .object({
            mode: z.enum(["guided", "manual"]),
            answers: z
                .record(z.string().max(40), z.string().max(200))
                .refine((a) => Object.keys(a).length <= 30, { message: "Too many goal details" })
                .optional(),
        })
        .optional()
        .nullable(),
});

export const validateGoalCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = goalCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    if (result.data.saved != null && result.data.saved > result.data.current_cost) {
        return { errors: ["Amount saved cannot exceed current cost"], message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};

const goalUpdateSchema = goalCreateSchema.partial();

export const validateGoalUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = goalUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    if (result.data.saved != null && result.data.current_cost != null && result.data.saved > result.data.current_cost) {
        return { errors: ["Amount saved cannot exceed current cost"], message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};
