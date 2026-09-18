import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_family_members` exactly (see
// database/migrations/0006_gini_normalized_schema.sql) — this module has
// no legacy API contract to preserve (the original app synced a client-side
// JSON blob straight to Supabase, see that migration's header comment and
// features-incoming/gini/app.js's `familySettings.saveMember`/`editMember`/
// `deleteMember`, ~lines 3097-3160), so request/response fields use the
// same snake_case names as the DB columns 1:1.
const familyMemberCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    relationship: z.string().optional().nullable(),
    age: z.number().int().nonnegative().optional().nullable(),
    income: z.number().nonnegative().optional().nullable(),
    is_earner: z.boolean().optional().nullable(),
    is_dependent: z.boolean().optional().nullable(),
    retirement_age: z.number().int().nonnegative().optional().nullable(),
    life_expectancy: z.number().int().nonnegative().optional().nullable(),
});

export const validateFamilyMemberCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = familyMemberCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const familyMemberUpdateSchema = familyMemberCreateSchema.partial();

export const validateFamilyMemberUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = familyMemberUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
