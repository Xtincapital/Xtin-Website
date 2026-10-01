import * as z from "zod/v4";
import { INDICATOR_NAMES } from "./indicators.js";
import { trimStrings } from "../../utils/helper_functions.js";

// Exchange tickers only — rejects pasted URLs, sentences and injection attempts with a readable message.
const symbolField = z
    .string()
    .trim()
    .max(20, "Symbol is too long — use the exchange ticker, e.g. RELIANCE")
    .regex(/^[A-Za-z0-9&.^-]*$/, "Symbol can only contain letters, numbers and & . ^ - (e.g. RELIANCE, M&M, ^NSEI)");


const operand = z.union([
    z.object({ kind: z.literal("indicator"), indicator: z.enum(INDICATOR_NAMES), period: z.number().int().min(1).max(1000).nullable().optional() }),
    z.object({ kind: z.literal("field"), field: z.enum(["close", "open", "high", "low", "volume"]) }),
    z.object({ kind: z.literal("value"), value: z.number() }),
]);
const condition = z.object({ left: operand, op: z.enum([">", "<", ">=", "<=", "==", "crosses_above", "crosses_below"]), right: operand });
const group = z.object({ match: z.enum(["all", "any"]).default("all"), conditions: z.array(condition).max(20).default([]) });
const pct = z.number().min(0).max(1000).nullable().optional();

/** The strategy JSON the engine understands — also the contract Claude must produce. */
export const strategyDefinitionSchema = z.object({
    instrument: z
        .object({
            symbol: symbolField.pipe(z.string().min(1, "Pick a symbol (or SAMPLE)")).default("SAMPLE"),
            exchange: z.string().trim().min(1).max(10).default("NSE"),
            timeframe: z.enum(["1m", "5m", "15m", "1h", "1d"]).default("1d"),
        })
        .default({ symbol: "SAMPLE", exchange: "NSE", timeframe: "1d" }),
    entry: group.default({ match: "all", conditions: [] }),
    entry_action: z
        .object({ side: z.enum(["BUY", "SELL"]).default("BUY"), qty: z.number().int().min(1).max(1_000_000).default(1), order_type: z.enum(["MARKET", "LIMIT"]).default("MARKET") })
        .default({ side: "BUY", qty: 1, order_type: "MARKET" }),
    exit: group.default({ match: "any", conditions: [] }),
    risk: z
        .object({
            stop_loss_pct: pct,
            target_pct: pct,
            trailing_sl_pct: pct,
            square_off_time: z.string().regex(/^\d{1,2}:\d{2}$/).nullable().optional(),
        })
        .default({ square_off_time: "15:15" }),
});

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD").refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "Invalid date");

const strategyCreateSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(160),
    definition: strategyDefinitionSchema.default(strategyDefinitionSchema.parse({})),
    is_public: z.boolean().default(false),
});

const strategyUpdateSchema = z.object({
    name: z.string().trim().min(1).max(160).optional(),
    definition: strategyDefinitionSchema.optional(),
    is_public: z.boolean().optional(),
});

const runSchema = z.object({
    strategy_id: z.string().min(1, "strategy_id is required"),
    start_date: day,
    end_date: day,
    starting_capital: z.number().gt(0).max(1e10).default(100_000),
});

const chatSchema = z.object({
    message: z.string().trim().min(1, "message is required").max(1000),
    starting_capital: z.number().gt(0).max(1e10).default(100_000),
    symbol: symbolField.nullable().optional(),
    start_date: day.nullable().optional(),
    end_date: day.nullable().optional(),
    history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1200) })).max(12).default([]),
    prev_definition: z.record(z.string(), z.unknown()).nullable().optional(),
    profile: z.object({ capital: z.number().gt(0).nullable().optional(), risk: z.enum(["conservative", "balanced", "aggressive"]).nullable().optional() }).nullable().optional(),
});

const orderSchema = z.object({ pass_id: z.string().min(1, "pass_id is required") });
const verifySchema = z.object({
    razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
    razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
    razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

function run<T extends z.ZodType>(schema: T, input: unknown) {
    const result = schema.safeParse(trimStrings((input || {}) as Record<string, unknown>));
    if (!result.success) return { errors: result.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`), message: "Validation failed" } as const;
    return { data: result.data as z.output<T>, message: "Validation successful" } as const;
}

export const validateStrategyCreate = (input: unknown) => run(strategyCreateSchema, input);
export const validateStrategyUpdate = (input: unknown) => run(strategyUpdateSchema, input);
export const validateRun = (input: unknown) => run(runSchema, input);
export const validateChat = (input: unknown) => run(chatSchema, input);
export const validatePassOrder = (input: unknown) => run(orderSchema, input);
export const validatePassVerify = (input: unknown) => run(verifySchema, input);
