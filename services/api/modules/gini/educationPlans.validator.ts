import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_education_plans` exactly (see
// database/migrations/0006_gini_normalized_schema.sql) — this module has
// no legacy API contract to preserve, so request/response fields use the
// same snake_case names as the DB columns 1:1. Mirrors the original's
// education-plan `save()` handler (features-incoming/gini/app.js, ~line
// 5764).
//
// `child_id` is required (NOT NULL FK on gini_education_plans); ownership
// against the authenticated user is checked separately in the controller
// via educationPlans.repository.ts's `getFamilyMemberOwnership` since the
// FK itself doesn't scope by user_id.
const educationPlanCreateSchema = z.object({
    child_id: z.string().uuid("child_id must be a valid UUID"),
    milestone: z.string().optional().nullable(),
    target_year: z.number().int("Target year must be a whole number").optional().nullable(),
    cost: z.number().nonnegative("Cost cannot be negative").optional().nullable(),
    saved: z.number().nonnegative("Amount saved cannot be negative").optional().nullable(),
    ppf_account: z.string().optional().nullable(),
});

export const validateEducationPlanCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = educationPlanCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// On update, child_id may still be changed (re-pointed to a different
// family member) — still validated for UUID shape and, in the controller,
// re-checked for ownership whenever it's present in the payload.
const educationPlanUpdateSchema = educationPlanCreateSchema.partial();

export const validateEducationPlanUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = educationPlanUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
