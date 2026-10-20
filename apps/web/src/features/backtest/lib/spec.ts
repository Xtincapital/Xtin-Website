// Strategy Spec v1 on the client — mirrors services/api/modules/backtest/spec.ts.
// The builder edits a spec; the server validates it, writes the plain-English
// summary and runs it. Nothing here computes a result.

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "1d";
export type IndicatorName = "SMA" | "EMA" | "WMA" | "RSI" | "MACD" | "BB" | "ATR" | "SUPERTREND" | "VWAP" | "STOCH" | "ADX" | "DONCHIAN" | "PDH" | "PDL" | "ORH" | "ORL";
export type Line = "upper" | "middle" | "lower" | "macd" | "signal" | "hist" | "k" | "d";
export type IndicatorRef = { ind: IndicatorName; len?: number; mult?: number; fast?: number; slow?: number; signal?: number; smooth?: number; minutes?: number; line?: Line };
export type PriceField = "open" | "high" | "low" | "close" | "volume";
export type SpecOperand = number | { field: PriceField } | IndicatorRef;
export type SpecOp = "<" | "<=" | ">" | ">=" | "==" | "crosses_above" | "crosses_below" | "between" | "rising" | "falling";
export type SpecCondition = { left: SpecOperand; op: SpecOp; right?: SpecOperand; low?: SpecOperand; high?: SpecOperand; bars?: number };
export type SpecGroup = { all: (SpecCondition | SpecGroup)[] } | { any: (SpecCondition | SpecGroup)[] };
export type LevelRule = { type: "pct" | "points" | "atr"; value: number; len?: number };
export type TrailRule = { type: "pct" | "atr"; value: number; len?: number };
export type SizingMode = "fixed_qty" | "fixed_amount" | "pct_equity" | "risk_pct";

export interface Spec {
  spec_version: "1.0";
  name: string;
  instrument: { id: string; segment?: "EQ" | "INDEX" | "SYNTHETIC"; timeframe: Timeframe };
  period?: { from: string; to: string };
  capital?: { initial: number; currency: "INR" };
  entry: { side: "long" | "short"; when: SpecGroup };
  exit: { when: SpecGroup | null; stop_loss: LevelRule | null; target: LevelRule | null; trailing_stop: TrailRule | null; time_exit: { bars: number } | null };
  sizing: { mode: SizingMode; value: number; max_leverage?: number };
  execution?: { fill?: "next_bar_open" | "bar_close"; product?: "CNC" | "MIS"; reentry_cooldown_bars?: number; square_off?: string | null };
  costs?: { profile: string | null; slippage_bps: number };
  data?: { source: string; adjust: string; lag_days: number };
  report?: { risk_free_pct: number; benchmark: "buy_hold" | "none" };
}

type Meta = { label: string; params: ("len" | "mult" | "fast" | "slow" | "signal" | "smooth" | "minutes")[]; lines?: Line[]; defaults: Partial<IndicatorRef>; intradayOnly?: boolean };

/** Indicators the engine knows, with their parameters and defaults (same as the server's). */
export const INDICATOR_META: Record<IndicatorName, Meta> = {
  SMA: { label: "SMA", params: ["len"], defaults: { len: 20 } },
  EMA: { label: "EMA", params: ["len"], defaults: { len: 20 } },
  WMA: { label: "WMA", params: ["len"], defaults: { len: 20 } },
  RSI: { label: "RSI", params: ["len"], defaults: { len: 14 } },
  MACD: { label: "MACD", params: ["fast", "slow", "signal"], lines: ["macd", "signal", "hist"], defaults: { fast: 12, slow: 26, signal: 9, line: "macd" } },
  BB: { label: "Bollinger", params: ["len", "mult"], lines: ["upper", "middle", "lower"], defaults: { len: 20, mult: 2, line: "middle" } },
  ATR: { label: "ATR", params: ["len"], defaults: { len: 14 } },
  SUPERTREND: { label: "Supertrend", params: ["len", "mult"], defaults: { len: 10, mult: 3 } },
  STOCH: { label: "Stochastic", params: ["len", "smooth"], lines: ["k", "d"], defaults: { len: 14, smooth: 3, line: "k" } },
  ADX: { label: "ADX", params: ["len"], defaults: { len: 14 } },
  DONCHIAN: { label: "Donchian", params: ["len"], lines: ["upper", "middle", "lower"], defaults: { len: 20, line: "upper" } },
  VWAP: { label: "VWAP", params: [], defaults: {}, intradayOnly: true },
  PDH: { label: "Prior-day high", params: [], defaults: {} },
  PDL: { label: "Prior-day low", params: [], defaults: {} },
  ORH: { label: "Opening-range high", params: ["minutes"], defaults: { minutes: 15 }, intradayOnly: true },
  ORL: { label: "Opening-range low", params: ["minutes"], defaults: { minutes: 15 }, intradayOnly: true },
};

export const PARAM_LABEL: Record<string, string> = { len: "length", mult: "mult", fast: "fast", slow: "slow", signal: "signal", smooth: "smooth", minutes: "min" };
export const LINE_LABEL: Record<Line, string> = { upper: "upper", middle: "middle", lower: "lower", macd: "line", signal: "signal", hist: "histogram", k: "%K", d: "%D" };

export const SPEC_OPS: { op: SpecOp; label: string }[] = [
  { op: "<", label: "<" },
  { op: "<=", label: "≤" },
  { op: ">", label: ">" },
  { op: ">=", label: "≥" },
  { op: "==", label: "=" },
  { op: "crosses_above", label: "crosses above" },
  { op: "crosses_below", label: "crosses below" },
  { op: "between", label: "is between" },
  { op: "rising", label: "is rising for" },
  { op: "falling", label: "is falling for" },
];

export const isGroup = (n: SpecCondition | SpecGroup): n is SpecGroup => "all" in n || "any" in n;
export const items = (g: SpecGroup) => ("all" in g ? g.all : g.any);
export const matchOf = (g: SpecGroup): "all" | "any" => ("all" in g ? "all" : "any");
export const withItems = (g: SpecGroup, next: (SpecCondition | SpecGroup)[]): SpecGroup => ("all" in g ? { all: next } : { any: next });
export const isRef = (o: SpecOperand | undefined): o is IndicatorRef => typeof o === "object" && o !== null && "ind" in o;

export const indicator = (ind: IndicatorName): IndicatorRef => ({ ind, ...INDICATOR_META[ind].defaults });

export const emptyCondition = (): SpecCondition => ({ left: indicator("RSI"), op: "<", right: 30 });

/** A fresh strategy for the builder (the server fills every other default). */
export function emptySpec(): Spec {
  return {
    spec_version: "1.0",
    name: "",
    instrument: { id: "NSE:RELIANCE", timeframe: "1d" },
    entry: { side: "long", when: { all: [emptyCondition()] } },
    exit: { when: { any: [{ left: indicator("RSI"), op: ">", right: 70 }] }, stop_loss: { type: "pct", value: 2 }, target: null, trailing_stop: null, time_exit: null },
    sizing: { mode: "pct_equity", value: 50 },
  };
}

/** Split "NSE:RELIANCE" into its parts. */
export const parseInstrumentId = (id: string) => {
  const [exchange, symbol] = id.includes(":") ? id.split(":") : ["NSE", id];
  return { exchange: exchange || "NSE", symbol: symbol || "" };
};

export function operandText(o: SpecOperand | undefined): string {
  if (o === undefined) return "?";
  if (typeof o === "number") return String(o);
  if ("field" in o) return o.field;
  const r = { ...INDICATOR_META[o.ind].defaults, ...o };
  const meta = INDICATOR_META[o.ind];
  const params = meta.params.map((p) => r[p]).filter((v) => v !== undefined);
  const line = meta.lines && r.line ? ` ${LINE_LABEL[r.line]}` : "";
  return `${meta.label}${params.length ? `(${params.join(", ")})` : ""}${line}`;
}

export function conditionText(c: SpecCondition): string {
  if (c.op === "between") return `${operandText(c.left)} between ${operandText(c.low)} and ${operandText(c.high)}`;
  if (c.op === "rising" || c.op === "falling") return `${operandText(c.left)} ${c.op} ${c.bars ?? 1} bar${(c.bars ?? 1) === 1 ? "" : "s"}`;
  return `${operandText(c.left)} ${SPEC_OPS.find((x) => x.op === c.op)?.label ?? c.op} ${operandText(c.right)}`;
}

/** Flattened condition texts of a group (nested groups in brackets). */
export function groupTexts(g: SpecGroup | null): string[] {
  if (!g) return [];
  return items(g).map((n) => (isGroup(n) ? `(${groupTexts(n).join(matchOf(n) === "any" ? " or " : " and ")})` : conditionText(n)));
}

export const levelText = (l: LevelRule | TrailRule | null, what: string) =>
  !l ? null : l.type === "pct" ? `${l.value}% ${what}` : l.type === "points" ? `₹${l.value} ${what}` : `${l.value}× ATR ${what}`;

export function sizingShort(s: Spec["sizing"]): string {
  if (s.mode === "fixed_qty") return `${s.value} sh`;
  if (s.mode === "fixed_amount") return `₹${Math.round(s.value).toLocaleString("en-IN")}`;
  if (s.mode === "risk_pct") return `${s.value}% risk`;
  return `${s.value}% equity`;
}
