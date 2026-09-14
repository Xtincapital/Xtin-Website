import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const filterSchema = z.object({
    field: z.string().min(1, "Filter field is required"),
    operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains"], { error: "Invalid filter operator" }),
    value: z.any(),
});

const screenerRequestSchema = z.object({
    filters: z.array(filterSchema).default([]),
    sort_by: z.string().default("match_score"),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
    limit: z.coerce.number().int().positive().max(500).default(100),
    market: z.string().optional(),
});

export const validateScreenerRequest = (input: unknown) => {
    const result = screenerRequestSchema.safeParse(input);
    if (!result.success) {
        return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};

const saveScreenSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().default(""),
    filters: z.array(z.record(z.string(), z.any())).default([]),
    is_public: z.boolean().optional().default(false),
});

export const validateSaveScreen = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = saveScreenSchema.safeParse(trimmed);
    if (!result.success) {
        return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};

// The Python endpoint takes `tickers: List[str]` as its sole body param,
// which FastAPI binds to the raw JSON body (i.e. the request body IS the
// array, not `{"tickers": [...]}`) — matched here directly.
const bulkSignalsSchema = z.array(z.string().min(1)).min(1, "At least one ticker is required").max(50, "Maximum 50 tickers per request");

export const validateBulkSignals = (input: unknown) => {
    const result = bulkSignalsSchema.safeParse(input);
    if (!result.success) {
        return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    }
    return { data: { tickers: result.data }, message: "Validation successful" };
};
