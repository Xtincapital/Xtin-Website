import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Column shapes mirror `journal_trades` exactly (see
// database/migrations/0005_journal_normalized_schema.sql) — this module
// has no legacy API contract to preserve, so request/response fields use
// the same snake_case names as the DB columns 1:1.
const tradeCreateSchema = z.object({
    date: z.string().min(1, "Date is required"),
    exit_date: z.string().optional().nullable(),
    entry_time: z.string().optional().nullable(),
    exit_time: z.string().optional().nullable(),
    time_zone: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    market: z.string().optional().nullable(),
    asset: z.string().min(1, "Asset is required"),
    currency: z.string().optional().nullable(),
    quantity: z.number().optional().nullable(),
    entry_price: z.number().optional().nullable(),
    target_price: z.number().optional().nullable(),
    stop_loss: z.number().optional().nullable(),
    exit_price: z.number().optional().nullable(),
    brokerage: z.number().optional().nullable(),
    pnl: z.number().optional().nullable(),
    strategy: z.string().optional().nullable(),
    margin: z.number().optional().nullable(),
    buy_sell: z.enum(["buy", "sell"]).optional().nullable(),
    contract: z.string().optional().nullable(),
    strike_price: z.number().optional().nullable(),
    option_type: z.enum(["call", "put"]).optional().nullable(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    emotion: z.string().optional().nullable(),
    underlying_price: z.number().optional().nullable(),
    implied_volatility: z.number().optional().nullable(),
    days_to_expiry: z.number().optional().nullable(),
    greeks: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const validateTradeCreate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = tradeCreateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const tradeUpdateSchema = tradeCreateSchema.partial();

export const validateTradeUpdate = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = tradeUpdateSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const tradeListQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export const validateTradeListQuery = (input: unknown) => {
    const result = tradeListQuerySchema.safeParse(input || {});
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
