import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const hexColor = /^#[0-9A-Fa-f]{6}$/;

const watchlistCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    description: z.string().optional().nullable(),
    color: z.string().regex(hexColor, "Color must be a hex code like #3b82f6").optional().nullable(),
    is_default: z.boolean().default(false),
});

export const validateWatchlistCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = watchlistCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const watchlistUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    color: z.string().regex(hexColor, "Color must be a hex code like #3b82f6").optional().nullable(),
    is_default: z.boolean().optional(),
    sort_order: z.number().int().optional(),
});

export const validateWatchlistUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = watchlistUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const watchlistItemCreateSchema = z.object({
    ticker: z.string().min(1, "Ticker is required").max(20, "Ticker must be at most 20 characters"),
    company_name: z.string().optional().nullable(),
    target_price: z.number().positive("Target price must be greater than 0").optional().nullable(),
    target_price_type: z.enum(["BUY", "SELL", "ALERT"]).optional().nullable(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
});

export const validateWatchlistItemCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = watchlistItemCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const watchlistItemUpdateSchema = z.object({
    target_price: z.number().positive("Target price must be greater than 0").optional().nullable(),
    target_price_type: z.enum(["BUY", "SELL", "ALERT"]).optional().nullable(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
});

export const validateWatchlistItemUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = watchlistItemUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// The Python source binds these as repeated `?tickers=A&tickers=B` query
// params on the bulk add/remove endpoints (an unusual shape for a POST body
// and for a DELETE). This port accepts a JSON body `{ tickers: [...] }` on
// both instead, which is the idiomatic Express/REST equivalent.
const bulkTickersSchema = z.object({
    tickers: z.array(z.string().min(1)).min(1, "At least one ticker is required"),
});

export const validateBulkTickers = (input: unknown) => {
    const result = bulkTickersSchema.safeParse(input);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
