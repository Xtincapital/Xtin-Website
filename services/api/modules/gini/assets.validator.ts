import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_assets` exactly (see
// database/migrations/0006_gini_normalized_schema.sql) — this module has
// no legacy API contract to preserve, so request/response fields use the
// same snake_case names as the DB columns 1:1. `return_rate` is the
// original's `return` field (see features-incoming/gini/app.js's
// `networth.saveAsset`, ~line 3384) renamed to avoid the reserved word.
// `owner` is a nullable FK to `gini_family_members.id` — unlike the
// original, which defaulted an unset owner to a hardcoded client-side id
// of `1`, we leave it nullable so an unowned/unassigned asset is
// representable without a fabricated family-member reference.
const assetCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    category: z.string().optional().nullable(),
    value: z.number().nonnegative("Value must be a non-negative number"),
    return_rate: z.number().min(0, "Return rate must be between 0 and 100").max(100, "Return rate must be between 0 and 100").optional().nullable(),
    ownership_type: z.enum(["Individual", "Joint", "Trust"]).optional().nullable(),
    owner: z.string().uuid("Invalid owner id").optional().nullable(),
    joint_share: z.number().gt(0, "Joint share must be between 1 and 100").max(100, "Joint share must be between 1 and 100").optional().nullable(),
});

export const validateAssetCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = assetCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const assetUpdateSchema = assetCreateSchema.partial();

export const validateAssetUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = assetUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
