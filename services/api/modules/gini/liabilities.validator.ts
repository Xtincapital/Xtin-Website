import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_liabilities` exactly (see
// database/migrations/0006_gini_normalized_schema.sql) — this module has
// no legacy API contract to preserve, so request/response fields use the
// same snake_case names as the DB columns 1:1. Validation ranges (rate
// 0-50%, positive amount, non-negative emi/tenure) mirror the original's
// `networth.saveLiability` (see features-incoming/gini/app.js, ~lines
// 3548-3580). `owner` is a nullable FK to `gini_family_members.id` — same
// discrepancy as assets: the original defaulted an unset owner to a
// hardcoded client-side id of `1`, we leave it nullable instead so an
// unowned liability is representable without a fabricated reference.
const liabilityCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    type: z.string().optional().nullable(),
    amount: z.number().positive("Amount must be a positive number"),
    rate: z.number().min(0, "Interest rate must be between 0 and 50 percent").max(50, "Interest rate must be between 0 and 50 percent").optional().nullable(),
    emi: z.number().nonnegative("EMI cannot be negative").optional().nullable(),
    tenure: z.number().positive("Tenure must be a positive number").optional().nullable(),
    ownership_type: z.enum(["Individual", "Joint", "Trust"]).optional().nullable(),
    owner: z.string().uuid("Invalid owner id").optional().nullable(),
    joint_share: z.number().gt(0, "Joint share must be between 1 and 100").max(100, "Joint share must be between 1 and 100").optional().nullable(),
});

export const validateLiabilityCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = liabilityCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const liabilityUpdateSchema = liabilityCreateSchema.partial();

export const validateLiabilityUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = liabilityUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
