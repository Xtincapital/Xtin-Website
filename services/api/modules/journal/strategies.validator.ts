import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// `journal_strategies` is deliberately minimal — just a per-user list of
// custom strategy names (see the migration's comment on this table, and
// app.js's `customStrategies`, a plain string array).
const strategyCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(120, "Name must be at most 120 characters"),
});

export const validateStrategyCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = strategyCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
