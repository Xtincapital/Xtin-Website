import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `gini_tax_optimization` exactly (see
// database/migrations/0006_gini_normalized_schema.sql): one row per user,
// not a list — `user_id` is the primary key. Nested shapes for the three
// jsonb columns come from `appState.taxOptimization`'s initialization and
// seed data in features-incoming/gini/app.js (~lines 1704 and 6734):
//   deductions_80c: { ppf, elss, nsc, lifePremium, tuitionFees }
//   deductions_80d: { selfHealth, parentHealth }
//   deductions_80e: { educationLoanInterest }
// All three are jsonb with a `{}` default, so every key here is optional
// and unrecognized extra keys are still accepted (`.catchall`) rather than
// rejected, matching the columns' deliberately flexible jsonb typing.
const deductions80CSchema = z
    .object({
        ppf: z.number().nonnegative().optional(),
        elss: z.number().nonnegative().optional(),
        nsc: z.number().nonnegative().optional(),
        lifePremium: z.number().nonnegative().optional(),
        tuitionFees: z.number().nonnegative().optional(),
    })
    .catchall(z.number());

const deductions80DSchema = z
    .object({
        selfHealth: z.number().nonnegative().optional(),
        parentHealth: z.number().nonnegative().optional(),
    })
    .catchall(z.number());

const deductions80ESchema = z
    .object({
        educationLoanInterest: z.number().nonnegative().optional(),
    })
    .catchall(z.number());

const taxOptimizationUpsertSchema = z.object({
    deductions_80c: deductions80CSchema.optional().nullable(),
    deductions_80d: deductions80DSchema.optional().nullable(),
    deductions_80e: deductions80ESchema.optional().nullable(),
    huf_benefits: z.boolean().optional().nullable(),
});

export const validateTaxOptimizationUpsert = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = taxOptimizationUpsertSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
