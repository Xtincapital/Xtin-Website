import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Trades in these request bodies are client-supplied (same contract as the
// source app — see tradeContext.ts's header comment), shaped like either
// Phase 9a's `journal_trades` rows or the legacy TradeData fields. Shape is
// intentionally loose here; tradeContext.ts's helpers read defensively.
const tradeLikeSchema = z.record(z.string(), z.unknown());

const analyzeSchema = z.object({
    trades: z.array(tradeLikeSchema).default([]),
});

export const validateAnalyzeRequest = (input: unknown) => {
    const result = analyzeSchema.safeParse(input || {});
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// Defaults mirror main.py's PreTradeRequest field defaults exactly.
const preTradeCheckSchema = z.object({
    symbol: z.string().trim().optional().default("Planned trade"),
    trade_type: z.string().trim().optional().default("Manual"),
    market: z.string().trim().optional().default("Unknown"),
    strategy: z.string().trim().optional().default("Journal setup"),
    risk_amount: z.number().optional().default(0),
    potential_profit: z.number().optional().default(0),
});

export const validatePreTradeCheck = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = preTradeCheckSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const weeklyReviewSchema = z.object({
    trades: z.array(tradeLikeSchema).default([]),
    start_date: z.string().trim().optional().nullable(),
    end_date: z.string().trim().optional().nullable(),
});

export const validateWeeklyReview = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = weeklyReviewSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const chatSchema = z.object({
    message: z.string().min(1, "Message is required"),
    trades: z.array(tradeLikeSchema).optional().default([]),
    display_name: z.string().trim().optional().default(""),
    history: z.array(tradeLikeSchema).optional().default([]),
    goals: z.array(tradeLikeSchema).optional().default([]),
    client_tier: z.enum(["free", "pro"]).optional().default("free"),
    /** Pro: the saved conversation this message continues (modules/ai/chatHistory.ts). */
    conversation_id: z.string().uuid().optional().nullable(),
    currency: z.string().trim().optional().default("INR"),
});

export const validateChatRequest = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = chatSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
