import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_elder_care` exactly (see
// database/migrations/0006_gini_normalized_schema.sql) — this module has
// no legacy API contract to preserve, so request/response fields use the
// same snake_case names as the DB columns 1:1. Mirrors the original's
// elder-care `save()` handler (features-incoming/gini/app.js, ~line 5658).
//
// `member_id` is required (NOT NULL FK on gini_elder_care); ownership
// against the authenticated user is checked separately in the controller
// via elderCare.repository.ts's `getFamilyMemberOwnership` since the FK
// itself doesn't scope by user_id.
const elderCareCreateSchema = z.object({
    member_id: z.string().uuid("member_id must be a valid UUID"),
    monthly_support: z.number().nonnegative("Monthly support cannot be negative").optional().nullable(),
    medical_reserve: z.number().nonnegative("Medical reserve cannot be negative").optional().nullable(),
    life_expectancy: z.number().int().positive("Life expectancy must be a positive number").optional().nullable(),
});

export const validateElderCareCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = elderCareCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// On update, member_id may still be changed (re-pointed to a different
// family member) — still validated for UUID shape and, in the controller,
// re-checked for ownership whenever it's present in the payload.
const elderCareUpdateSchema = elderCareCreateSchema.partial();

export const validateElderCareUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = elderCareUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
