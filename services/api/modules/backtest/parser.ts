// Natural-language → strategy definition — port of `nlp/strategy_parser.py`.
//
// Powers the "just chat to backtest" experience: a sentence like "buy nifty when
// RSI drops below 30, sell above 70, 2% stop loss" becomes the same JSON
// StrategyDefinition the engine already understands. The parser is deliberately
// rule-based and offline so it is deterministic and needs no API key; llmParse.ts
// can layer Claude on top for free-form phrasing.
import type { Condition, Operand, StrategyDefinition } from "./types.js";
import type { OptionsSpec, OptionsStructure } from "./options.js";

// Known symbols we let through to the live data source. Anything else (or
// nothing) falls back to the deterministic offline "SAMPLE" series.
export const KNOWN_SYMBOLS: Record<string, [string, string]> = {
    NIFTY: ["NIFTY", "NSE"],
    BANKNIFTY: ["BANKNIFTY", "NSE"],
    SENSEX: ["SENSEX", "BSE"],
    RELIANCE: ["RELIANCE", "NSE"],
    TCS: ["TCS", "NSE"],
    INFY: ["INFY", "NSE"],
    INFOSYS: ["INFY", "NSE"],
    HDFC: ["HDFCBANK", "NSE"],
    HDFCBANK: ["HDFCBANK", "NSE"],
    ICICI: ["ICICIBANK", "NSE"],
    SBIN: ["SBIN", "NSE"],
    SBI: ["SBIN", "NSE"],
    TATAMOTORS: ["TATAMOTORS", "NSE"],
    AAPL: ["AAPL", "NASDAQ"],
    TSLA: ["TSLA", "NASDAQ"],
};

const TIMEFRAME_PATTERNS: [RegExp, string][] = [
    // `\b` before the digits matters: without it "15m" also matches the 5m pattern
    // (the Python original had that bug, so "try it on 15m" silently ran on 5m).
    [/\b1\s?min|\b1m\b|one[- ]minute/i, "1m"],
    [/\b5\s?min|\b5m\b|five[- ]minute/i, "5m"],
    [/\b15\s?min|\b15m\b|fifteen[- ]minute/i, "15m"],
    [/\bhour|1h\b|hourly|60\s?min/i, "1h"],
    [/\bdaily|1d\b|per day|end of day|eod|swing/i, "1d"],
];

export type ParsedStrategy = { name: string; definition: StrategyDefinition; interpretation: string; warnings: string[] };
export type ParsedOptions = { spec: OptionsSpec; name: string; interpretation: string; warnings: string[] };

/** A stored definition may be an equity strategy or an options structure. */
export type AnyDefinition = StrategyDefinition & { kind?: string; structure?: string; side?: string; stop_multiple?: number; lots?: number };

// ── helpers ─────────────────────────────────────────────────────────────────

const num = (m: RegExpExecArray | null, fallback: number | null = null): number | null => {
    if (!m) return fallback;
    const v = parseFloat(m[1]);
    return Number.isFinite(v) ? v : fallback;
};

const cond = (left: Operand, op: Condition["op"], right: Operand): Condition => ({ left, op, right });
const ind = (indicator: string, period: number | null = null): Operand => ({ kind: "indicator", indicator, period });
const field = (f: string): Operand => ({ kind: "field", field: f });
const val = (value: number): Operand => ({ kind: "value", value });

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function detectSymbol(text: string): [string, string] {
    for (const [token, [symbol, exchange]] of Object.entries(KNOWN_SYMBOLS)) {
        if (new RegExp(`\\b${escapeRe(token)}\\b`, "i").test(text)) return [symbol, exchange];
    }
    return ["SAMPLE", "NSE"];
}

export function detectTimeframe(text: string): string {
    for (const [pattern, tf] of TIMEFRAME_PATTERNS) if (pattern.test(text)) return tf;
    return "1d";
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Sensible backtest window per timeframe (keeps bar counts sane). Dates are "YYYY-MM-DD". */
export function defaultWindow(timeframe: string, today: Date = new Date()): [string, string] {
    const back = (days: number) => isoDay(new Date(today.getTime() - days * 86_400_000));
    if (timeframe === "1d") return [back(365 * 3), isoDay(today)];
    if (timeframe === "1h") return [back(180), isoDay(today)];
    // Yahoo serves only ~7 days of 1-minute bars (and ~60 days of 5m/15m).
    if (timeframe === "1m") return [back(6), isoDay(today)];
    return [back(45), isoDay(today)];
}

// ── the parser ──────────────────────────────────────────────────────────────

export function parseStrategy(message: string, symbolOverride?: string | null): ParsedStrategy {
    const text = message.trim();
    const low = text.toLowerCase();
    const warnings: string[] = [];

    let [symbol, exchange] = detectSymbol(text);
    if (symbolOverride && symbolOverride.trim().toUpperCase() !== "SAMPLE") {
        symbol = symbolOverride.trim().toUpperCase();
        exchange = "NSE";
    }
    const timeframe = detectTimeframe(low);
    if (symbol === "SAMPLE") {
        warnings.push("No specific symbol recognised — running on Xtin Backtest's offline SAMPLE series so you get instant, reproducible results.");
    }

    // direction
    const short = /\b(short|sell to open|bearish|put)\b/.test(low) && !/\bbuy\b/.test(low);
    const side: "BUY" | "SELL" = short ? "SELL" : "BUY";

    // risk parameters
    let sl = num(/(\d+(?:\.\d+)?)\s*%?\s*(?:stop[- ]?loss|sl|stop)/.exec(low));
    if (sl === null) sl = num(/stop[- ]?loss\s*(?:of|at|=|:)?\s*(\d+(?:\.\d+)?)/.exec(low));
    let tp = num(/(\d+(?:\.\d+)?)\s*%?\s*(?:target|take[- ]?profit|tp)/.exec(low));
    if (tp === null) tp = num(/(?:target|take[- ]?profit)\s*(?:of|at|=|:)?\s*(\d+(?:\.\d+)?)/.exec(low));
    const trail = num(/(\d+(?:\.\d+)?)\s*%?\s*(?:trailing|trail)/.exec(low));

    const entry: Condition[] = [];
    const exit: Condition[] = [];
    let kind = "custom";

    if (low.includes("rsi")) {
        // 1) RSI mean reversion
        kind = "RSI mean-reversion";
        const period = Math.trunc(num(/rsi[^\d]*(\d{1,3})\s*(?:period|length)/.exec(low), 14) as number);
        const below = num(/rsi[^\d]*(?:below|under|less than|<|dips? below|drops? below)\s*(\d{1,3})/.exec(low));
        const above = num(/rsi[^\d]*(?:above|over|greater than|>|crosses above|rises above)\s*(\d{1,3})/.exec(low));
        const buyLevel = below ?? 30;
        const sellLevel = above ?? 70;
        if (side === "BUY") {
            entry.push(cond(ind("RSI", period), "<", val(buyLevel)));
            exit.push(cond(ind("RSI", period), ">", val(sellLevel)));
        } else {
            entry.push(cond(ind("RSI", period), ">", val(sellLevel)));
            exit.push(cond(ind("RSI", period), "<", val(buyLevel)));
        }
    } else if (low.includes("macd")) {
        // 2) MACD (checked before the generic crossover branch)
        kind = "MACD momentum";
        entry.push(cond(ind("MACD"), side === "BUY" ? "crosses_above" : "crosses_below", val(0)));
        exit.push(cond(ind("MACD"), side === "BUY" ? "crosses_below" : "crosses_above", val(0)));
    } else if (low.includes("bollinger") || low.includes("band")) {
        // 3) Bollinger bands (before generic crossover)
        kind = "Bollinger reversion";
        const period = Math.trunc(num(/(\d{1,3})\s*(?:period|day)/.exec(low), 20) as number);
        if (side === "BUY") {
            entry.push(cond(field("close"), "<", ind("BB_LOWER", period)));
            exit.push(cond(field("close"), ">", ind("BB_UPPER", period)));
        } else {
            entry.push(cond(field("close"), ">", ind("BB_UPPER", period)));
            exit.push(cond(field("close"), "<", ind("BB_LOWER", period)));
        }
    } else if (/cross|golden cross|death cross|moving average|\bma\b|\bema\b|\bsma\b/.test(low)) {
        // 4) Moving-average crossover
        kind = "moving-average crossover";
        const maType = low.includes("ema") || low.includes("exponential") ? "EMA" : "SMA";
        let periods = [...low.matchAll(/\b(\d{1,3})\s*(?:day|period|ema|sma|ma)\b/g)].map((m) => parseInt(m[1], 10));
        if (periods.length < 2) {
            periods = [...low.matchAll(/\b(\d{1,3})\b/g)].map((m) => parseInt(m[1], 10)).filter((n) => n >= 2 && n <= 400).slice(0, 2);
        }
        let fast: number;
        let slow: number;
        if (low.includes("golden")) [fast, slow] = [50, 200];
        else if (periods.length >= 2) [fast, slow] = periods.slice(0, 2).sort((a, b) => a - b);
        else [fast, slow] = [20, 50];
        entry.push(cond(ind(maType, fast), side === "BUY" ? "crosses_above" : "crosses_below", ind(maType, slow)));
        exit.push(cond(ind(maType, fast), side === "BUY" ? "crosses_below" : "crosses_above", ind(maType, slow)));
    } else if (/break|breakout|above\s+\d|below\s+\d|crosses?\s+\d/.test(low)) {
        // 5) price breakout / level
        kind = "price breakout";
        const level = num(/(?:above|below|cross(?:es)?|break(?:out)?(?:\s*above)?)\s*(\d+(?:\.\d+)?)/.exec(low)) ?? 100;
        if (side === "BUY") {
            entry.push(cond(field("close"), "crosses_above", val(level)));
            exit.push(cond(field("close"), "crosses_below", val(level)));
        } else {
            entry.push(cond(field("close"), "crosses_below", val(level)));
            exit.push(cond(field("close"), "crosses_above", val(level)));
        }
    }

    // fallback: classic EMA trend-following
    if (!entry.length) {
        kind = "EMA trend-following";
        warnings.push(
            "Couldn't match a specific indicator, so I set up a classic 20/50 EMA trend-following strategy. Tell me an exact rule (RSI, MACD, Bollinger, breakout…) to refine it."
        );
        entry.push(cond(ind("EMA", 20), "crosses_above", ind("EMA", 50)));
        exit.push(cond(ind("EMA", 20), "crosses_below", ind("EMA", 50)));
    }

    // default protective stop if the user gave no exit signal AND no risk
    if (sl === null && tp === null && !exit.length) {
        sl = 2;
        tp = 4;
    }

    const definition: StrategyDefinition = {
        instrument: { symbol, exchange, timeframe },
        entry: { match: "all", conditions: entry },
        entry_action: { side, qty: explicitQty(text) ?? 1, order_type: "MARKET" },
        exit: { match: "any", conditions: exit },
        risk: { stop_loss_pct: sl, target_pct: tp, trailing_sl_pct: trail, square_off_time: timeframe !== "1d" ? "15:15" : null },
    };

    return {
        name: `${titleCase(kind)} · ${symbol} ${timeframe}`,
        definition,
        interpretation: describe(kind, symbol, timeframe, side, sl, tp, trail),
        warnings,
    };
}

/** Capitalise each word but keep acronyms ("RSI mean-reversion" → "RSI Mean-Reversion"). */
const titleCase = (s: string) => s.replace(/[A-Za-z]+/g, (w) => (w === w.toUpperCase() ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()));

const g = (n: number) => String(Number(n)); // Python "{:g}" for the values we see (e.g. 2.0 → "2")

function describe(kind: string, symbol: string, timeframe: string, side: string, sl: number | null, tp: number | null, trail: number | null): string {
    const bits = [`**Strategy:** ${kind}`, `**Instrument:** ${symbol} · ${timeframe}`, `**Direction:** ${side === "BUY" ? "Long" : "Short"}`];
    const risk: string[] = [];
    if (sl) risk.push(`${g(sl)}% stop-loss`);
    if (tp) risk.push(`${g(tp)}% target`);
    if (trail) risk.push(`${g(trail)}% trailing stop`);
    if (risk.length) bits.push("**Risk:** " + risk.join(", "));
    return bits.join("\n");
}

const OPTION_WORDS = /straddle|strangle|iron\s*condor|iron\s*fly|\boption|\bcall\b|\bput\b/i;

function buildOptions(spec: OptionsSpec, interpretationLead?: string): ParsedOptions {
    const warnings = ["Options backtests use Xtin Backtest's synthetic premium/volatility model (a realistic approximation, not live option-chain replay)."];
    if (spec.side === "SELL") {
        warnings.push(
            "Short-premium risk warning: the stop only sees each day's open-to-close move, so it cannot model overnight gaps or volatility spikes — real short-option strategies carry much larger tail risk than this backtest can show. Smooth returns and low drawdown here do not mean low real risk."
        );
    }
    if (spec.symbol === "SAMPLE") {
        warnings.push("No index recognised — using the offline SAMPLE series. Name NIFTY or BANKNIFTY for index-scaled lot sizing.");
    }
    const label = titleCase(spec.structure.replace("_", " "));
    const dir = spec.side === "SELL" ? "Short" : "Long";
    const lines = [`**Structure:** ${dir} ${label}`, `**Underlying:** ${spec.symbol} · ${spec.timeframe}`, `**Per-cycle stop:** ${g(spec.stopMultiple)}× credit`];
    if (interpretationLead) lines.unshift(interpretationLead);
    return { spec, name: `${dir} ${label} · ${spec.symbol} ${spec.timeframe}`, interpretation: lines.join("\n"), warnings };
}

const structureIn = (low: string): OptionsStructure | null => {
    if (low.includes("iron condor") || low.includes("ironcondor") || low.includes("condor") || low.includes("iron fly")) return "iron_condor";
    if (low.includes("strangle")) return "strangle";
    if (low.includes("straddle")) return "straddle";
    return null;
};

/** Detect an options-selling structure. Returns null for equity strategies. */
export function parseOptions(message: string, symbolOverride?: string | null): ParsedOptions | null {
    const text = message.trim();
    const low = text.toLowerCase();
    if (!OPTION_WORDS.test(low)) return null;

    const structure = structureIn(low) ?? "straddle"; // default also covers a bare "option/call/put"

    // Premium selling is short by default; only long if explicitly buying.
    const side: "BUY" | "SELL" = /\b(buy|long|go long)\b/.test(low) ? "BUY" : "SELL";

    let [symbol, exchange] = detectSymbol(text);
    if (symbolOverride && symbolOverride.trim().toUpperCase() !== "SAMPLE") {
        symbol = symbolOverride.trim().toUpperCase();
        exchange = "NSE";
    }
    const timeframe = detectTimeframe(low);

    // Per-cycle stop: "20% stop" → 0.2× credit; default 1× credit (100% of premium).
    const slPct = num(/(\d+(?:\.\d+)?)\s*%?\s*(?:stop|sl)/.exec(low));
    const stopMultiple = slPct ? slPct / 100 : 1;

    return buildOptions({ structure, side, symbol, exchange, timeframe, stopMultiple, lots: 1 });
}

// Equity-indicator vocabulary: a message using it is a new equity idea, not a
// tweak of a previous options structure.
const EQUITY_WORDS = /\b(rsi|macd|ema|sma|bollinger|band|moving average|crossover|cross(?:es)?|breakout|vwap|supertrend|stoch)\b/i;

/**
 * Tweak a previous options structure ("run it on BANKNIFTY", "add a 30% stop",
 * "try a strangle instead"). Without this, those follow-ups — including the
 * suggestion chips the chat itself offers after an options run — fell through
 * to the equity parser and silently built an unrelated EMA strategy.
 */
export function applyOptionsModification(prev: AnyDefinition | null | undefined, message: string, symbolOverride?: string | null): ParsedOptions | null {
    if (!prev || prev.kind !== "options" || !prev.instrument) return null;
    const low = message.toLowerCase();
    if (EQUITY_WORDS.test(low) && !OPTION_WORDS.test(low)) return null;
    if (!MOD_HINTS.test(message) && !OPTION_WORDS.test(low)) return null;

    const prevStructure = (["straddle", "strangle", "iron_condor"] as const).find((s) => s === prev.structure) ?? "straddle";
    const spec: OptionsSpec = {
        structure: prevStructure,
        side: prev.side === "BUY" ? "BUY" : "SELL",
        symbol: prev.instrument.symbol ?? "SAMPLE",
        exchange: prev.instrument.exchange ?? "NSE",
        timeframe: prev.instrument.timeframe ?? "1d",
        stopMultiple: typeof prev.stop_multiple === "number" && prev.stop_multiple > 0 ? prev.stop_multiple : 1,
        lots: 1,
    };
    const changes: string[] = [];

    const structure = structureIn(low);
    if (structure && structure !== spec.structure) {
        spec.structure = structure;
        changes.push(`structure → ${titleCase(structure.replace("_", " "))}`);
    }
    if (/\b(buy|long|go long)\b/.test(low) && spec.side !== "BUY") {
        spec.side = "BUY";
        changes.push("direction → LONG");
    } else if (/\b(sell|short|go short)\b/.test(low) && spec.side !== "SELL") {
        spec.side = "SELL";
        changes.push("direction → SHORT");
    }
    const stop = num(/(\d+(?:\.\d+)?)\s*%?\s*(?:stop|sl)/.exec(low)) ?? num(/stop\D{0,12}(\d+(?:\.\d+)?)\s*%/.exec(low));
    if (stop) {
        spec.stopMultiple = stop / 100;
        changes.push(`per-cycle stop → ${g(spec.stopMultiple)}× credit`);
    }
    let [sym, exch] = detectSymbol(message);
    if (symbolOverride && symbolOverride.trim().toUpperCase() !== "SAMPLE") [sym, exch] = [symbolOverride.trim().toUpperCase(), "NSE"];
    if (sym !== "SAMPLE" && sym !== spec.symbol) {
        spec.symbol = sym;
        spec.exchange = exch;
        changes.push(`underlying → ${sym}`);
    }
    const tf = detectTimeframe(message);
    if ((tf !== "1d" || /\b(daily|1d|day candles?)\b/i.test(message)) && tf !== spec.timeframe) {
        spec.timeframe = tf;
        changes.push(`timeframe → ${tf}`);
    }

    if (!changes.length) return null;
    return buildOptions(spec, "Updated your previous options strategy: " + changes.join(", ") + ".");
}

// ── conversation memory & personalisation (no API key required) ─────────────
//
// applyModification() gives the chat real iteration even fully offline: when a
// previous strategy exists and the message reads like a tweak ("tighten the stop
// to 1%", "try it on 15m", "run it on RELIANCE", "make it short"), we mutate the
// previous definition deterministically instead of re-parsing from scratch.

/** A short label for a definition's main idea, from its first entry rule. */
function baseName(d: AnyDefinition): string {
    const c = d.entry?.conditions?.[0];
    if (!c) return "Strategy";
    const ind = (o: Operand) => (o.kind === "indicator" ? o.indicator.replace("_", " ") : null);
    const [l, r] = [ind(c.left), ind(c.right)];
    if (l && r && c.op.startsWith("crosses")) return `${l === r ? l : `${l}/${r}`} Crossover`;
    if (l === "RSI" || r === "RSI") return "RSI Mean-Reversion";
    if ((l ?? r)?.startsWith("BB")) return "Bollinger Reversion";
    if (l ?? r) return `${l ?? r} Strategy`;
    return c.op.startsWith("crosses") ? "Price Breakout" : "Price Rule";
}

const MOD_HINTS =
    /\b(stop|target|trailing|timeframe|15m|5m|1m|1h|hourly|daily|minute|short|long|qty|quantity|re-?run|rerun|instead|tighten|widen|change|switch|make it|run it|try it|same but)\b/i;

export function applyModification(prev: AnyDefinition | null | undefined, message: string): ParsedStrategy | null {
    if (!prev || prev.kind === "options" || !prev.instrument) return null;
    if (!MOD_HINTS.test(message)) return null;

    const d: AnyDefinition = JSON.parse(JSON.stringify(prev));
    const changes: string[] = [];
    const risk = (d.risk ??= {});
    const inst = d.instrument!;
    const action = (d.entry_action ??= { side: "BUY", qty: 1, order_type: "MARKET" });

    let m = /stop(?:\s*-?\s*loss)?\D{0,12}(\d+(?:\.\d+)?)\s*%/i.exec(message);
    if (m) {
        risk.stop_loss_pct = parseFloat(m[1]);
        changes.push(`stop-loss → ${m[1]}%`);
    }
    m = /target\D{0,12}(\d+(?:\.\d+)?)\s*%/i.exec(message);
    if (m) {
        risk.target_pct = parseFloat(m[1]);
        changes.push(`target → ${m[1]}%`);
    }
    m = /trail\w*\D{0,12}(\d+(?:\.\d+)?)\s*%/i.exec(message);
    if (m) {
        risk.trailing_sl_pct = parseFloat(m[1]);
        changes.push(`trailing stop → ${m[1]}%`);
    }

    const tf = detectTimeframe(message);
    if (tf !== "1d" || /\b(daily|1d|day candles?)\b/i.test(message)) {
        if (tf !== inst.timeframe) {
            inst.timeframe = tf;
            risk.square_off_time = tf === "1d" ? null : "15:15";
            changes.push(`timeframe → ${tf}`);
        }
    }

    const [sym, exch] = detectSymbol(message);
    if (sym !== "SAMPLE" && sym !== inst.symbol) {
        inst.symbol = sym;
        inst.exchange = exch;
        changes.push(`symbol → ${sym}`);
    }

    if (/\bmake it (a )?short\b|\bgo short\b|\bshort instead\b/i.test(message)) {
        action.side = "SELL";
        changes.push("direction → SHORT");
    } else if (/\bmake it (a )?long\b|\bgo long\b|\blong instead\b/i.test(message)) {
        action.side = "BUY";
        changes.push("direction → LONG");
    }

    m = /\b(?:qty|quantity)\D{0,6}(\d+)\b/i.exec(message);
    if (m) {
        action.qty = Math.max(1, parseInt(m[1], 10));
        changes.push(`qty → ${m[1]}`);
    }

    if (!changes.length) return null; // hint words but nothing parseable — treat as a new idea

    return {
        name: `${baseName(d)} (tweaked) · ${inst.symbol ?? "SAMPLE"} ${inst.timeframe ?? "1d"}`,
        definition: d,
        interpretation: "Updated your previous strategy: " + changes.join(", ") + ".",
        warnings: [],
    };
}

// ── position sizing ─────────────────────────────────────────────────────────
//
// The rules parser can't know how big a position the user means, and a fixed
// 1 share made a ₹1L account report "−₹7 (−0.01%)". When the message names no
// quantity, size one position as a share of capital by risk profile instead.

const QTY_PATTERNS = [/\b(\d+)\s*(?:shares?|units?|qty)\b/i, /\b(?:qty|quantity)\D{0,6}(\d+)/i];
/** A quantity the user named ("50 shares", "qty 10"), if any. */
export function explicitQty(message: string): number | null {
    for (const re of QTY_PATTERNS) {
        const m = re.exec(message);
        if (m) return Math.max(1, parseInt(m[1], 10));
    }
    return null;
}
export const namesQuantity = (message: string) => explicitQty(message) !== null;

const ALLOCATION: Record<string, number> = { conservative: 0.25, balanced: 0.5, aggressive: 0.9 };

export const allocationFor = (risk?: string | null) => ALLOCATION[risk ?? ""] ?? ALLOCATION.balanced;

export function positionSize(capital: number, price: number, risk?: string | null): { qty: number; allocation: number } {
    const allocation = allocationFor(risk);
    const qty = price > 0 ? Math.max(1, Math.floor((capital * allocation) / price)) : 1;
    return { qty, allocation };
}

const RISK_DEFAULTS: Record<string, { stop_loss_pct: number; target_pct: number }> = {
    conservative: { stop_loss_pct: 1.5, target_pct: 2.5 },
    balanced: { stop_loss_pct: 2, target_pct: 4 },
    aggressive: { stop_loss_pct: 3.5, target_pct: 7 },
};

/** Fill missing risk defaults from the user's profile. Returns notes. */
export function personalize(definition: AnyDefinition, profile: { risk?: string | null } | null | undefined): string[] {
    if (!profile || definition.kind === "options") return [];
    const level = profile.risk ?? "";
    const defaults = RISK_DEFAULTS[level];
    if (!defaults) return [];
    const risk = (definition.risk ??= {});
    const hasExit = Boolean(definition.exit?.conditions?.length);
    const notes: string[] = [];
    // A trailing stop the user asked for already protects the position.
    if (risk.stop_loss_pct == null && !risk.trailing_sl_pct) {
        risk.stop_loss_pct = defaults.stop_loss_pct;
        notes.push(`Applied your ${level} profile: ${g(defaults.stop_loss_pct)}% stop-loss`);
    }
    if (risk.target_pct == null && !hasExit) {
        risk.target_pct = defaults.target_pct;
        notes.push(`${g(defaults.target_pct)}% target from your ${level} profile`);
    }
    return notes;
}
