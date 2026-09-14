import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

const portfolioCreateSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    description: z.string().optional().nullable(),
    currency: z.string().max(3, "Currency must be at most 3 characters").default("USD"),
    is_default: z.boolean().default(false),
});

export const validatePortfolioCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = portfolioCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const portfolioUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    is_default: z.boolean().optional(),
});

export const validatePortfolioUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = portfolioUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const transactionCreateSchema = z.object({
    ticker: z.string().min(1, "Ticker is required").max(20, "Ticker must be at most 20 characters"),
    company_name: z.string().optional().nullable(),
    transaction_type: z.enum(["BUY", "SELL", "DIVIDEND", "SPLIT"]),
    quantity: z.number().positive("Quantity must be greater than 0"),
    price_per_share: z.number().min(0, "Price per share cannot be negative"),
    fees: z.number().min(0, "Fees cannot be negative").default(0),
    transaction_date: z.coerce.date(),
    notes: z.string().optional().nullable(),
});

export const validateTransactionCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = transactionCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const holdingCreateSchema = z.object({
    asset_type: z.enum(["stock", "gold", "cash", "other"]).default("stock"),
    ticker: z.string().min(1, "Ticker is required").max(40, "Ticker must be at most 40 characters"),
    company_name: z.string().optional().nullable(),
    quantity: z.number().positive("Quantity must be greater than 0"),
    avg_cost_basis: z.number().min(0, "Cost basis cannot be negative").default(0),
    purchase_date: z.coerce.date().optional().nullable(),
    live_ticker: z.string().optional().nullable(),
    manual_price: z.number().optional().nullable(),
    currency: z.string().optional().nullable().default("INR"),
    notes: z.string().optional().nullable(),
});

export const validateHoldingCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = holdingCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
