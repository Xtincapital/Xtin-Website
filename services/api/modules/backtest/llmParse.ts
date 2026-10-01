// Claude-powered natural-language → strategy parsing — port of `nlp/llm_parse.py`.
//
// The "chat with AI" path behind the playground. It is conversation-aware
// (prior turns), iterative (the previous strategy is passed so "tighter stop"
// mutates it) and personalised (capital / risk profile). The model returns a
// strategy as JSON which is validated against the same schema the engine uses,
// so a malformed or hallucinated reply can never reach the backtester — on any
// failure we return null and the caller falls back to the offline parser.
import { generateAIWithUsage } from "../ai/providers.js";
import { INDICATOR_NAMES } from "./indicators.js";
import type { ParsedStrategy } from "./parser.js";
import type { StrategyDefinition } from "./types.js";
import { strategyDefinitionSchema } from "./validator.js";

const SYSTEM_PROMPT = `You are Xtin Backtest's strategy compiler. Turn the user's plain-English trading idea into a single JSON strategy definition. Output ONLY the JSON object — no prose, no markdown fences.

Schema:
{
  "instrument": {"symbol": string, "exchange": "NSE"|"BSE"|"NASDAQ", "timeframe": "1m"|"5m"|"15m"|"1h"|"1d"},
  "entry": {"match": "all"|"any", "conditions": Condition[]},
  "entry_action": {"side": "BUY"|"SELL", "qty": integer>=1, "order_type": "MARKET"},
  "exit": {"match": "all"|"any", "conditions": Condition[]},
  "risk": {"stop_loss_pct": number|null, "target_pct": number|null, "trailing_sl_pct": number|null, "square_off_time": "HH:MM"|null}
}

A Condition is {"left": Operand, "op": Operator, "right": Operand}.
Operator is one of ">", "<", ">=", "<=", "==", "crosses_above", "crosses_below".
An Operand is one of:
  {"kind": "indicator", "indicator": NAME, "period": integer|null}
  {"kind": "field", "field": "close"|"open"|"high"|"low"|"volume"}
  {"kind": "value", "value": number}
Indicator NAME must be one of: ${INDICATOR_NAMES.map((n) => `"${n}"`).join(", ")}.
(MACD ignores period — compare it to value 0 for zero-line crosses. VWAP ignores period. SUPERTREND: price crossing above it = uptrend entry, below = exit/short.)

Rules:
- If no symbol is named, use "SAMPLE" (a deterministic offline series) so the backtest always runs.
- Default timeframe is "1d" unless the user implies intraday.
- For intraday timeframes set square_off_time to "15:15"; for "1d" set it to null.
- Prefer a crossover strategy for moving-average ideas; RSI<30/>70 for mean reversion; price crossing a level or BB band for breakouts; SUPERTREND or EMA for trend-following; STOCH_K for overbought/oversold timing; VWAP for intraday value reference.
- If the user gives no explicit exit, use stop_loss_pct and target_pct and leave exit.conditions empty.

ITERATION — this matters most:
- When a PREVIOUS_STRATEGY is provided and the user asks for a change ("tighter stop", "try 15m", "run it on RELIANCE", "make it short"), output the FULL updated JSON: keep every unchanged part of PREVIOUS_STRATEGY exactly as-is and modify ONLY what they asked.
- When they describe a brand-new idea, ignore PREVIOUS_STRATEGY.

PERSONALISATION — when a PROFILE is provided:
- conservative → tighter stop (~1–1.5%), modest target (~2–3%), smaller qty.
- balanced → stop ~2%, target ~4%.
- aggressive → wider stop (~3–4%), bigger target (~6–8%), may hold without square-off on daily.
- If capital is given, size qty so one position uses roughly 20% of capital at a typical price for the symbol (round to a sane integer, min 1).

Also include a top-level "_interpretation" key: ONE plain-English line a beginner understands, describing what you built (and, on iteration, what changed).`;

export const llmConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export function stripFences(text: string): string {
    let t = text.trim();
    if (t.startsWith("```")) {
        t = t.includes("\n") ? t.slice(t.indexOf("\n") + 1) : t;
        if (t.endsWith("```")) t = t.slice(0, t.lastIndexOf("```"));
        if (t.trimStart().startsWith("json")) t = t.trimStart().slice(4);
    }
    return t.trim();
}

export type LlmParseInput = {
    message: string;
    history?: { role: "user" | "assistant"; content: string }[];
    prevDefinition?: Record<string, unknown> | null;
    profile?: { capital?: number | null; risk?: string | null } | null;
};

export async function llmParse(input: LlmParseInput): Promise<ParsedStrategy | null> {
    if (!llmConfigured()) return null;

    const ctx: string[] = [];
    if (input.prevDefinition) ctx.push("PREVIOUS_STRATEGY:\n" + JSON.stringify(input.prevDefinition));
    const profile = Object.fromEntries(Object.entries(input.profile ?? {}).filter(([, v]) => v != null && v !== "" && v !== 0));
    if (Object.keys(profile).length) ctx.push("PROFILE:\n" + JSON.stringify(profile));
    ctx.push("REQUEST:\n" + input.message);

    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (const turn of (input.history ?? []).slice(-8)) {
        const content = String(turn.content ?? "").slice(0, 600);
        if ((turn.role === "user" || turn.role === "assistant") && content) messages.push({ role: turn.role, content });
    }
    // Anthropic requires alternating roles starting with "user".
    while (messages.length && messages[0].role === "assistant") messages.shift();
    messages.push({ role: "user", content: ctx.join("\n\n") });

    let data: Record<string, unknown>;
    try {
        const { text } = await generateAIWithUsage({ system: SYSTEM_PROMPT, messages, maxTokens: 1400, temperature: 0 });
        data = JSON.parse(stripFences(text));
    } catch {
        return null; // any API / parse failure → fall back to the rules parser
    }

    const interpretationRaw = String(data._interpretation ?? "").trim();
    delete data._interpretation;
    const parsed = strategyDefinitionSchema.safeParse(data);
    if (!parsed.success) return null;

    const definition = parsed.data as unknown as StrategyDefinition & { instrument: { symbol: string; timeframe: string } };
    const { symbol, timeframe } = definition.instrument;
    const warnings: string[] = [];
    if (symbol.toUpperCase() === "SAMPLE") {
        warnings.push("No specific symbol recognised — running on the offline SAMPLE series so you get instant, reproducible results.");
    }
    return {
        name: `AI · ${symbol} ${timeframe}`,
        definition,
        interpretation: interpretationRaw || `Built a strategy on ${symbol} (${timeframe}).`,
        warnings,
    };
}
