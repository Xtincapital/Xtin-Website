// Strategy Spec v1 — the one rules language every channel produces and the
// engine runs. Claude writes it from English (MCP, later), the website builds
// it from a form, and legacy chat/builder definitions are converted into it;
// none of them compute results.
//
//   specSchema       Zod schema; `specJsonSchema()` publishes it as JSON Schema
//   normaliseSpec    validate + write back every default the engine applies
//   specHash         SHA-256 of the normalised spec (minus its name): the
//                    strategy's fingerprint for caching and reproducibility
//   summariseSpec    rule-based plain-English summary — no language model
//   definitionToSpec legacy StrategyDefinition → Spec v1
import { createHash } from "node:crypto";
import * as z from "zod/v4";
import { COST_PROFILES, costsApply } from "./costs.js";
import { INDICATOR_DEFAULTS, INDICATOR_LINES, INDICATOR_PARAMS, INTRADAY_ONLY, legacyRef, SPEC_INDICATORS, type IndicatorRef, type SpecIndicator } from "./indicators.js";
import { defaultWindow } from "./parser.js";
import type { Operand as LegacyOperand, StrategyDefinition } from "./types.js";

export const SPEC_VERSION = "1.0";
export const MIS_MAX_LEVERAGE = 5;
const MAX_WINDOW_DAYS = 365 * 25;

const INDEX_IDS = new Set(["NIFTY", "NIFTY50", "BANKNIFTY", "SENSEX"]);

// ── schema ──────────────────────────────────────────────────────────────────

const int = (min: number, max: number) => z.number().int().min(min).max(max);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD").refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "Invalid date");
const clock = z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Times must look like 15:15");

const PARAM_SCHEMA: Record<Exclude<keyof IndicatorRef, "ind" | "line">, z.ZodType> = {
    len: int(1, 500),
    mult: z.number().min(0.1).max(10),
    fast: int(1, 500),
    slow: int(1, 500),
    signal: int(1, 500),
    smooth: int(1, 50),
    minutes: int(1, 375),
};

/** One strict object per indicator, so a parameter it doesn't take is an error, not silently ignored. */
const indicatorSchema = z.discriminatedUnion(
    "ind",
    SPEC_INDICATORS.map((ind) => {
        const shape: Record<string, z.ZodType> = { ind: z.literal(ind) };
        for (const p of INDICATOR_PARAMS[ind]) {
            if (p === "line") shape.line = z.enum(INDICATOR_LINES[ind] as [string, ...string[]]).optional();
            else if (p !== "ind") shape[p] = PARAM_SCHEMA[p].optional();
        }
        return z.object(shape).strict();
    }) as unknown as [z.ZodObject, ...z.ZodObject[]]
);

const fieldSchema = z.object({ field: z.enum(["open", "high", "low", "close", "volume"]) }).strict();
const operandSchema = z.union([z.number(), fieldSchema, indicatorSchema]);

export const OPERATORS = ["<", "<=", ">", ">=", "==", "crosses_above", "crosses_below", "between", "rising", "falling"] as const;

const conditionSchema = z
    .object({
        left: operandSchema,
        op: z.enum(OPERATORS),
        right: operandSchema.optional(),
        low: operandSchema.optional(),
        high: operandSchema.optional(),
        bars: int(1, 100).optional(),
    })
    .strict();

const innerGroup = z.union([z.object({ all: z.array(conditionSchema).min(1).max(20) }).strict(), z.object({ any: z.array(conditionSchema).min(1).max(20) }).strict()]);
const node = z.union([conditionSchema, innerGroup]);
/** Up to two levels: {"all": [cond, {"any": [cond, cond]}]}. */
const groupSchema = z.union([z.object({ all: z.array(node).max(20) }).strict(), z.object({ any: z.array(node).max(20) }).strict()]);

const levelSchema = z
    .object({ type: z.enum(["pct", "points", "atr"]), value: z.number().gt(0).max(1e6), len: int(1, 500).optional() })
    .strict()
    .refine((s) => s.type === "atr" || s.len === undefined, "len only applies to ATR stops");
const trailSchema = z
    .object({ type: z.enum(["pct", "atr"]), value: z.number().gt(0).max(1e6), len: int(1, 500).optional() })
    .strict()
    .refine((s) => s.type === "atr" || s.len === undefined, "len only applies to ATR trailing stops");

export const specSchema = z
    .object({
        spec_version: z.literal(SPEC_VERSION).default(SPEC_VERSION),
        name: z.string().trim().min(1).max(160).default("Untitled strategy"),
        instrument: z
            .object({
                id: z
                    .string()
                    .trim()
                    .toUpperCase()
                    .regex(/^(NSE|BSE|NASDAQ|NYSE):[A-Z0-9&.^-]{1,20}$/, 'Instrument id looks like "NSE:RELIANCE"'),
                segment: z.enum(["EQ", "INDEX", "SYNTHETIC"]).optional(),
                timeframe: z.enum(["1m", "5m", "15m", "1h", "1d"]).default("1d"),
            })
            .strict(),
        period: z.object({ from: day, to: day }).strict().optional(),
        capital: z
            .object({ initial: z.number().gt(0).max(1e10).default(100_000), currency: z.literal("INR").default("INR") })
            .strict()
            .default({ initial: 100_000, currency: "INR" }),
        entry: z.object({ side: z.enum(["long", "short"]).default("long"), when: groupSchema }).strict(),
        exit: z
            .object({
                when: groupSchema.nullable().default(null),
                stop_loss: levelSchema.nullable().default(null),
                target: levelSchema.nullable().default(null),
                trailing_stop: trailSchema.nullable().default(null),
                time_exit: z.object({ bars: int(1, 100_000) }).strict().nullable().default(null),
            })
            .strict()
            .default({ when: null, stop_loss: null, target: null, trailing_stop: null, time_exit: null }),
        sizing: z
            .object({
                mode: z.enum(["fixed_qty", "fixed_amount", "pct_equity", "risk_pct"]),
                value: z.number().gt(0).max(1e10),
                max_leverage: z.number().min(1).max(MIS_MAX_LEVERAGE).optional(),
            })
            .strict()
            .default({ mode: "pct_equity", value: 50 }),
        execution: z
            .object({
                fill: z.enum(["next_bar_open", "bar_close"]).default("next_bar_open"),
                product: z.enum(["CNC", "MIS"]).optional(),
                reentry_cooldown_bars: int(0, 100).default(1),
                square_off: clock.nullable().optional(),
            })
            .strict()
            .default({ fill: "next_bar_open", reentry_cooldown_bars: 1 }),
        costs: z
            .object({
                profile: z
                    .enum(Object.keys(COST_PROFILES) as [string, ...string[]])
                    .nullable()
                    .default("zerodha"),
                slippage_bps: z.number().min(0).max(500).default(5),
            })
            .strict()
            .default({ profile: "zerodha", slippage_bps: 5 }),
        data: z
            .object({
                source: z.enum(["auto", "synthetic"]).default("auto"),
                adjust: z.enum(["splits_bonus"]).default("splits_bonus"),
                lag_days: int(0, 365).default(0),
            })
            .strict()
            .default({ source: "auto", adjust: "splits_bonus", lag_days: 0 }),
        report: z
            .object({ risk_free_pct: z.number().min(0).max(20).default(0), benchmark: z.enum(["buy_hold", "none"]).default("buy_hold") })
            .strict()
            .default({ risk_free_pct: 0, benchmark: "buy_hold" }),
    })
    .strict();

export type SpecInput = z.input<typeof specSchema>;
type Parsed = z.output<typeof specSchema>;
export type SpecOperand = number | { field: "open" | "high" | "low" | "close" | "volume" } | IndicatorRef;
export type SpecCondition = { left: SpecOperand; op: (typeof OPERATORS)[number]; right?: SpecOperand; low?: SpecOperand; high?: SpecOperand; bars?: number };
export type SpecGroup = { all: (SpecCondition | SpecGroup)[] } | { any: (SpecCondition | SpecGroup)[] };
export type LevelRule = { type: "pct" | "points" | "atr"; value: number; len?: number };
export type TrailRule = { type: "pct" | "atr"; value: number; len?: number };

/** A spec after normalisation: every default the engine applies is written in. */
export type Spec = Omit<Parsed, "instrument" | "period" | "entry" | "exit" | "sizing" | "execution"> & {
    instrument: { id: string; segment: "EQ" | "INDEX" | "SYNTHETIC"; timeframe: "1m" | "5m" | "15m" | "1h" | "1d" };
    period: { from: string; to: string };
    entry: { side: "long" | "short"; when: SpecGroup };
    exit: { when: SpecGroup | null; stop_loss: LevelRule | null; target: LevelRule | null; trailing_stop: TrailRule | null; time_exit: { bars: number } | null };
    sizing: { mode: "fixed_qty" | "fixed_amount" | "pct_equity" | "risk_pct"; value: number; max_leverage: number };
    execution: { fill: "next_bar_open" | "bar_close"; product: "CNC" | "MIS"; reentry_cooldown_bars: number; square_off: string | null };
};

/** The published JSON Schema (also served to Claude as an MCP resource later). */
export function specJsonSchema(): Record<string, unknown> {
    return z.toJSONSchema(specSchema, { io: "input", unrepresentable: "any" }) as Record<string, unknown>;
}

// ── helpers ─────────────────────────────────────────────────────────────────

export const isGroup = (n: SpecCondition | SpecGroup): n is SpecGroup => "all" in n || "any" in n;
export const groupItems = (g: SpecGroup) => ("all" in g ? g.all : g.any);
export const isRef = (o: SpecOperand | undefined): o is IndicatorRef => typeof o === "object" && o !== null && "ind" in o;

export function symbolOf(spec: Pick<Spec, "instrument">) {
    const [exchange, symbol] = spec.instrument.id.split(":");
    return { exchange, symbol };
}

function* conditions(g: SpecGroup | null): Generator<SpecCondition> {
    if (!g) return;
    for (const n of groupItems(g)) {
        if (isGroup(n)) yield* conditions(n);
        else yield n;
    }
}

/** Every indicator a spec reads — conditions plus ATR-based stops. */
export function specRefs(spec: Spec): IndicatorRef[] {
    const refs: IndicatorRef[] = [];
    for (const c of [...conditions(spec.entry.when), ...conditions(spec.exit.when)]) {
        for (const o of [c.left, c.right, c.low, c.high]) if (isRef(o)) refs.push(o);
    }
    for (const lvl of [spec.exit.stop_loss, spec.exit.target, spec.exit.trailing_stop]) {
        if (lvl?.type === "atr") refs.push({ ind: "ATR", len: lvl.len ?? 14 });
    }
    return refs;
}

/** Canonical JSON: keys sorted at every level, so equal specs always serialise identically. */
export function canonicalJson(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
    if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

/** The fingerprint: SHA-256 of the normalised spec without its display name. */
export function specHash(spec: Spec): string {
    return createHash("sha256").update(canonicalJson({ ...spec, name: undefined })).digest("hex");
}

const withDefaults = (ref: IndicatorRef): IndicatorRef => ({ ...INDICATOR_DEFAULTS[ref.ind], ...ref }) as IndicatorRef;

function fillOperand(o: SpecOperand | undefined): SpecOperand | undefined {
    return isRef(o) ? withDefaults(o) : o;
}

function fillGroup(g: SpecGroup): SpecGroup {
    const items = groupItems(g).map((n) => (isGroup(n) ? fillGroup(n) : fillCondition(n)));
    return "all" in g ? { all: items } : { any: items };
}

function fillCondition(c: SpecCondition): SpecCondition {
    const out: SpecCondition = { left: fillOperand(c.left) as SpecOperand, op: c.op };
    for (const k of ["right", "low", "high"] as const) if (c[k] !== undefined) out[k] = fillOperand(c[k]);
    if (c.bars !== undefined) out.bars = c.bars;
    return out;
}

// ── normalise ───────────────────────────────────────────────────────────────

export type NormaliseResult = { ok: true; spec: Spec; hash: string; summary: string; warnings: string[] } | { ok: false; errors: string[] };

export type NormaliseOptions = {
    today?: Date;
    /** Legacy definitions may have no entry rule (they simply never trade); new specs may not. */
    allowEmptyEntry?: boolean;
};

type Issue = { code: string; path: PropertyKey[]; message: string; errors?: Issue[][]; keys?: string[] };

/**
 * Readable validation errors. A union failure ("Invalid input") is replaced
 * by the problems of the branch that came closest — the one that only failed
 * on details, not on its overall shape.
 */
export function formatIssues(issues: Issue[], prefix: PropertyKey[] = []): string[] {
    const shapeMiss = (i: Issue) => i.path.length === 0 && (i.code === "invalid_type" || i.code === "invalid_union");
    return issues.flatMap((issue) => {
        const path = [...prefix, ...issue.path];
        if (issue.code === "invalid_union" && issue.errors?.length) {
            const score = (branch: Issue[]) => branch.reduce((n, i) => n + (shapeMiss(i) ? 100 : 1), 0);
            const best = [...issue.errors].sort((a, b) => score(a) - score(b))[0];
            if (best.length && score(best) < 100) return formatIssues(best, path);
        }
        const msg = issue.code === "unrecognized_keys" && issue.keys ? `unknown key${issue.keys.length === 1 ? "" : "s"} ${issue.keys.map((k) => `"${k}"`).join(", ")}` : issue.message;
        return [`${path.map(String).join(".") || "spec"}: ${msg}`];
    });
}

export function normaliseSpec(input: unknown, opts: NormaliseOptions = {}): NormaliseResult {
    const parsed = specSchema.safeParse(input);
    if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error.issues as unknown as Issue[]) };
    const p = parsed.data;
    const errors: string[] = [];
    const warnings: string[] = [];

    const [exchange, symbol] = p.instrument.id.split(":");
    const timeframe = p.instrument.timeframe;
    const intraday = timeframe !== "1d";
    const segment = symbol === "SAMPLE" ? "SYNTHETIC" : INDEX_IDS.has(symbol) ? "INDEX" : (p.instrument.segment ?? "EQ");

    const [defFrom, defTo] = defaultWindow(timeframe, opts.today);
    const period = p.period ?? { from: defFrom, to: defTo };
    if (period.to < period.from) errors.push("period: 'to' is before 'from'");
    else if ((Date.parse(`${period.to}T00:00:00Z`) - Date.parse(`${period.from}T00:00:00Z`)) / 86_400_000 > MAX_WINDOW_DAYS) errors.push("period: pick 25 years or less");

    const squareOff = intraday ? (p.execution.square_off === undefined ? "15:15" : p.execution.square_off) : null;
    if (!intraday && p.execution.square_off) warnings.push("Square-off only applies to intraday timeframes; ignored on daily candles.");
    const product = p.execution.product ?? (intraday && squareOff ? "MIS" : "CNC");
    if (product === "MIS" && !intraday) errors.push("execution.product: MIS (intraday) needs an intraday timeframe");
    const productCap = product === "MIS" ? MIS_MAX_LEVERAGE : 1;
    let maxLeverage = p.sizing.max_leverage ?? productCap;
    if (maxLeverage > productCap) {
        warnings.push(`max_leverage ${maxLeverage}× is above what ${product} allows; capped at ${productCap}×.`);
        maxLeverage = productCap;
    }

    const entry = fillGroup(p.entry.when as SpecGroup);
    const exitWhen = p.exit.when ? fillGroup(p.exit.when as SpecGroup) : null;
    const allConditions = [...conditions(entry), ...conditions(exitWhen)];
    if (!opts.allowEmptyEntry && !groupItems(entry).length) errors.push("entry.when: add at least one entry condition");

    for (const c of allConditions) {
        const where = `condition "${conditionText(c)}"`;
        if (c.op === "between") {
            if (c.low === undefined || c.high === undefined) errors.push(`${where}: "between" needs low and high`);
            if (c.right !== undefined) errors.push(`${where}: "between" uses low/high, not right`);
        } else if (c.op === "rising" || c.op === "falling") {
            if (c.right !== undefined || c.low !== undefined || c.high !== undefined) errors.push(`${where}: "${c.op}" compares the left side with itself — remove right/low/high`);
        } else {
            if (c.right === undefined) errors.push(`${where}: "${c.op}" needs a right side`);
            if (c.low !== undefined || c.high !== undefined) errors.push(`${where}: low/high only apply to "between"`);
        }
        if (c.bars !== undefined && c.op !== "rising" && c.op !== "falling") errors.push(`${where}: bars only applies to rising/falling`);
        for (const o of [c.left, c.right, c.low, c.high]) {
            if (isRef(o) && !intraday && INTRADAY_ONLY.includes(o.ind)) errors.push(`${where}: ${o.ind} needs intraday candles`);
            if (isRef(o) && o.ind === "MACD" && (o.fast ?? 12) >= (o.slow ?? 26)) errors.push(`${where}: MACD fast must be shorter than slow`);
        }
    }

    const sizing = { mode: p.sizing.mode, value: p.sizing.value, max_leverage: maxLeverage };
    if (sizing.mode === "risk_pct" && !p.exit.stop_loss) errors.push("sizing: risk_pct sizes from the stop distance, so it needs exit.stop_loss");
    if (sizing.mode === "risk_pct" && sizing.value > 10) errors.push("sizing: risk_pct is the % of equity risked per trade — 10% at most");
    if (sizing.mode === "pct_equity" && sizing.value > 100 * maxLeverage) errors.push(`sizing: ${sizing.value}% of equity needs more than ${maxLeverage}× buying power`);
    if (sizing.mode === "fixed_qty" && !Number.isInteger(sizing.value)) errors.push("sizing: fixed_qty must be a whole number of shares");

    let costProfile = p.costs.profile;
    if (costProfile && !costsApply(exchange)) {
        warnings.push("Results are before costs: the Indian cost model covers NSE and BSE only.");
        costProfile = null;
    }
    if (segment === "INDEX") warnings.push(`${symbol} is an index and can't be bought directly, so this is a theoretical index backtest.`);
    if (segment === "SYNTHETIC") warnings.push("SAMPLE is generated demo data — results are synthetic, not market results.");
    if (p.entry.side === "short" && product === "CNC") warnings.push("Delivery (CNC) shorts aren't possible in Indian cash markets — treat this short as theoretical.");

    if (errors.length) return { ok: false, errors };

    const spec: Spec = {
        spec_version: SPEC_VERSION,
        name: p.name,
        instrument: { id: `${exchange}:${symbol}`, segment, timeframe },
        period,
        capital: p.capital,
        entry: { side: p.entry.side, when: entry },
        exit: {
            when: exitWhen,
            stop_loss: p.exit.stop_loss ? fillLevel(p.exit.stop_loss) : null,
            target: p.exit.target ? fillLevel(p.exit.target) : null,
            trailing_stop: p.exit.trailing_stop ? (fillLevel(p.exit.trailing_stop) as TrailRule) : null,
            time_exit: p.exit.time_exit,
        },
        sizing,
        execution: { fill: p.execution.fill, product, reentry_cooldown_bars: p.execution.reentry_cooldown_bars, square_off: squareOff },
        costs: { profile: costProfile, slippage_bps: p.costs.slippage_bps },
        data: { ...p.data, source: segment === "SYNTHETIC" ? "synthetic" : p.data.source },
        report: p.report,
    };
    return { ok: true, spec, hash: specHash(spec), summary: summariseSpec(spec), warnings };
}

const fillLevel = (l: LevelRule): LevelRule => (l.type === "atr" ? { ...l, len: l.len ?? 14 } : l);

// ── plain-English summary (rules, not a model) ──────────────────────────────

const g = (n: number) => String(Number(n.toFixed(6)));

export function operandText(o: SpecOperand | undefined): string {
    if (o === undefined) return "?";
    if (typeof o === "number") return g(o);
    if ("field" in o) return o.field;
    const r = withDefaults(o);
    switch (r.ind) {
        case "MACD":
            return `MACD(${r.fast},${r.slow},${r.signal})${r.line === "macd" ? "" : ` ${r.line}`}`;
        case "BB":
            return `Bollinger(${r.len}, ${g(r.mult!)}) ${r.line}`;
        case "STOCH":
            return `Stochastic %${(r.line ?? "k").toUpperCase()}(${r.len})`;
        case "DONCHIAN":
            return `Donchian(${r.len}) ${r.line}`;
        case "SUPERTREND":
            return `Supertrend(${r.len}, ${g(r.mult!)})`;
        case "VWAP":
            return "VWAP";
        case "PDH":
            return "prior-day high";
        case "PDL":
            return "prior-day low";
        case "ORH":
            return `opening-range high (${r.minutes} min)`;
        case "ORL":
            return `opening-range low (${r.minutes} min)`;
        default:
            return `${r.ind}(${r.len})`;
    }
}

const OP_TEXT: Record<string, string> = { "<": "<", "<=": "≤", ">": ">", ">=": "≥", "==": "=", crosses_above: "crosses above", crosses_below: "crosses below" };

export function conditionText(c: SpecCondition): string {
    if (c.op === "between") return `${operandText(c.left)} is between ${operandText(c.low)} and ${operandText(c.high)}`;
    if (c.op === "rising" || c.op === "falling") return `${operandText(c.left)} has been ${c.op} for ${c.bars ?? 1} bar${(c.bars ?? 1) === 1 ? "" : "s"}`;
    return `${operandText(c.left)} ${OP_TEXT[c.op] ?? c.op} ${operandText(c.right)}`;
}

function groupText(gr: SpecGroup): string {
    const joiner = "all" in gr ? " and " : " or ";
    return groupItems(gr)
        .map((n) => (isGroup(n) ? `(${groupText(n)})` : conditionText(n)))
        .join(joiner);
}

const levelText = (l: LevelRule, what: string) =>
    l.type === "pct" ? `${g(l.value)}% ${what}` : l.type === "points" ? `₹${g(l.value)} ${what}` : `${g(l.value)}× ATR(${l.len ?? 14}) ${what}`;

const TF_TEXT: Record<string, string> = { "1m": "1-minute", "5m": "5-minute", "15m": "15-minute", "1h": "hourly", "1d": "daily" };

export function sizingText(s: Spec["sizing"]): string {
    if (s.mode === "fixed_qty") return `${s.value.toLocaleString("en-IN")} share${s.value === 1 ? "" : "s"} per trade`;
    if (s.mode === "fixed_amount") return `₹${Math.round(s.value).toLocaleString("en-IN")} per trade, sized at each fill price`;
    if (s.mode === "risk_pct") return `risking ${g(s.value)}% of equity per trade (size = risk ÷ stop distance)`;
    return `${g(s.value)}% of equity per trade, sized at each fill price`;
}

export function summariseSpec(spec: Spec): string {
    const { symbol } = symbolOf(spec);
    const side = spec.entry.side === "long" ? "Long" : "Short";
    const parts = [
        `${side} ${spec.instrument.id} on ${TF_TEXT[spec.instrument.timeframe]} candles, ${spec.period.from} to ${spec.period.to}, with ₹${Math.round(spec.capital.initial).toLocaleString("en-IN")}.`,
        groupItems(spec.entry.when).length ? `Enter when ${groupText(spec.entry.when)}.` : "No entry rule, so it never trades.",
    ];
    const exits: string[] = [];
    if (spec.exit.when && groupItems(spec.exit.when).length) exits.push(`when ${groupText(spec.exit.when)}`);
    if (spec.exit.stop_loss) exits.push(`at a ${levelText(spec.exit.stop_loss, "stop-loss")}`);
    if (spec.exit.target) exits.push(`at a ${levelText(spec.exit.target, "target")}`);
    if (spec.exit.trailing_stop) exits.push(`on a ${levelText(spec.exit.trailing_stop, "trailing stop")}`);
    if (spec.exit.time_exit) exits.push(`after ${spec.exit.time_exit.bars} bar${spec.exit.time_exit.bars === 1 ? "" : "s"}`);
    if (spec.execution.square_off) exits.push(`at the ${spec.execution.square_off} square-off`);
    parts.push(exits.length ? `Exit ${exits.join(", or ")}.` : "No exit rule — positions close at the end of the data.");
    parts.push(`Size: ${sizingText(spec.sizing)}.`);
    parts.push(
        `${spec.execution.fill === "next_bar_open" ? "Fills at the next bar's open" : "Fills on the signal bar's close"}, ${spec.execution.product === "CNC" ? "delivery (CNC)" : "intraday (MIS)"}, ` +
            `${spec.costs.profile ? `${spec.costs.profile[0].toUpperCase()}${spec.costs.profile.slice(1)} charges + ${g(spec.costs.slippage_bps)} bps slippage` : "before costs"}.`
    );
    if (spec.instrument.segment === "SYNTHETIC") parts.push(`${symbol} is synthetic demo data.`);
    return parts.join(" ");
}

// ── legacy definitions → Spec v1 ────────────────────────────────────────────

/** Thrown for a legacy definition the spec can't express (e.g. a blank number). */
export class SpecConversionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SpecConversionError";
    }
}

function legacyOperand(o: LegacyOperand | undefined): SpecOperand {
    if (!o) throw new SpecConversionError("A condition is missing one side.");
    if (o.kind === "value") {
        const v = Number(o.value);
        if (o.value === "" || !Number.isFinite(v)) throw new SpecConversionError("A condition has a blank or non-numeric value.");
        return v;
    }
    if (o.kind === "field") {
        if (!["open", "high", "low", "close", "volume"].includes(o.field)) throw new SpecConversionError(`"${o.field}" can't be used in a condition.`);
        return { field: o.field as "close" };
    }
    return legacyRef(o.indicator, o.period);
}

/** `from`/`to` omitted → the spec gets the default window for its timeframe when normalised. */
export type LegacyContext = { name?: string; from?: string; to?: string; capital: number };

/** Convert a chat / builder definition into a Spec v1 input (normalise it before running). */
export function definitionToSpec(def: StrategyDefinition, ctx: LegacyContext): SpecInput {
    const inst = def.instrument ?? {};
    const symbol = (inst.symbol || "SAMPLE").toUpperCase();
    const exchange = (inst.exchange || "NSE").toUpperCase();
    const timeframe = (inst.timeframe ?? "1d") as "1d";
    const toGroup = (grp: StrategyDefinition["entry"]) => {
        const conds = (grp?.conditions ?? []).map((c) => ({ left: legacyOperand(c.left), op: c.op, right: legacyOperand(c.right) }));
        return (grp?.match ?? "all") === "any" ? { any: conds } : { all: conds };
    };
    const risk = def.risk ?? {};
    const legacyQty = Math.max(1, Math.trunc(Number(def.entry_action?.qty ?? 1)) || 1);
    const sizing = def.sizing?.mode && def.sizing.value > 0 ? def.sizing : { mode: "fixed_qty" as const, value: legacyQty };
    const exitGroup = toGroup(def.exit);
    return {
        spec_version: SPEC_VERSION,
        name: ctx.name ?? "Strategy",
        instrument: { id: `${exchange}:${symbol}`, timeframe },
        ...(ctx.from && ctx.to ? { period: { from: ctx.from, to: ctx.to } } : {}),
        capital: { initial: ctx.capital, currency: "INR" },
        entry: { side: def.entry_action?.side === "SELL" ? "short" : "long", when: toGroup(def.entry) },
        exit: {
            when: groupItems(exitGroup as SpecGroup).length ? exitGroup : null,
            stop_loss: risk.stop_loss_pct ? { type: "pct", value: risk.stop_loss_pct } : null,
            target: risk.target_pct ? { type: "pct", value: risk.target_pct } : null,
            trailing_stop: risk.trailing_sl_pct ? { type: "pct", value: risk.trailing_sl_pct } : null,
            time_exit: null,
        },
        sizing: { mode: sizing.mode, value: sizing.value },
        execution: {
            fill: def.execution?.fill ?? "next_bar_open",
            ...(def.execution?.product ? { product: def.execution.product } : {}),
            reentry_cooldown_bars: def.execution?.reentry_cooldown_bars ?? 1,
            // Legacy definitions with no square-off time trade intraday as positional.
            square_off: timeframe === "1d" ? null : (risk.square_off_time ?? null),
        },
        costs: { profile: def.costs?.profile === null ? null : (def.costs?.profile ?? "zerodha"), slippage_bps: def.costs?.slippage_bps ?? 5 },
    };
}

export const SPEC_INDICATOR_LIST = SPEC_INDICATORS.map((ind: SpecIndicator) => ({
    ind,
    params: INDICATOR_PARAMS[ind],
    defaults: INDICATOR_DEFAULTS[ind],
    lines: INDICATOR_LINES[ind] ?? null,
    intraday_only: INTRADAY_ONLY.includes(ind),
}));
