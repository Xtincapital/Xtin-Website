// Pure helpers that turn a backtest result into the report's extra views
// (drawdown curve, monthly returns, P&L distribution) and describe a strategy
// in plain words. No React here, so it's unit-tested directly.
import type { BacktestTrade, Condition, EquityPoint, Operand, StrategyDefinition } from "./types";

/** Percent below the running peak at every bar (0 at a new high, negative under water). */
export function drawdownSeries(curve: EquityPoint[]): EquityPoint[] {
  let peak = -Infinity;
  return curve.map((p) => {
    peak = Math.max(peak, p.equity);
    return { time: p.time, equity: peak > 0 ? ((p.equity - peak) / peak) * 100 : 0 };
  });
}

export type MonthCell = { year: number; month: number; returnPct: number };

/** Month-over-month return from the last equity of each month (the first month is measured from `startingCapital`). */
export function monthlyReturns(curve: EquityPoint[], startingCapital: number): MonthCell[] {
  const lastByMonth = new Map<string, number>();
  for (const p of curve) lastByMonth.set(p.time.slice(0, 7), p.equity);
  const out: MonthCell[] = [];
  let prev = startingCapital;
  for (const [ym, equity] of lastByMonth) {
    const [y, m] = ym.split("-").map(Number);
    out.push({ year: y, month: m, returnPct: prev ? ((equity - prev) / prev) * 100 : 0 });
    prev = equity;
  }
  return out;
}

export type Bucket = { from: number; to: number; count: number };

/** Histogram of per-trade P&L % in `bins` equal-width buckets. */
export function pnlHistogram(trades: BacktestTrade[], bins = 12): Bucket[] {
  if (!trades.length) return [];
  const xs = trades.map((t) => t.pnl_pct);
  let lo = Math.min(...xs);
  let hi = Math.max(...xs);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const width = (hi - lo) / bins;
  const buckets: Bucket[] = Array.from({ length: bins }, (_, i) => ({ from: lo + i * width, to: lo + (i + 1) * width, count: 0 }));
  for (const x of xs) buckets[Math.min(bins - 1, Math.floor((x - lo) / width))].count += 1;
  return buckets;
}

/** How trades ended (stop, target, signal…), most common first. */
export function exitReasons(trades: BacktestTrade[]): { reason: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of trades) counts.set(t.reason, (counts.get(t.reason) ?? 0) + 1);
  return [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

/** Longest run of consecutive winning / losing trades. */
export function streaks(trades: BacktestTrade[]): { wins: number; losses: number } {
  let w = 0;
  let l = 0;
  let best = { wins: 0, losses: 0 };
  for (const t of trades) {
    if (t.pnl > 0) {
      w += 1;
      l = 0;
    } else if (t.pnl < 0) {
      l += 1;
      w = 0;
    }
    best = { wins: Math.max(best.wins, w), losses: Math.max(best.losses, l) };
  }
  return best;
}

export const REASON_LABEL: Record<string, string> = {
  stop_loss: "Stop-loss",
  trailing_sl: "Trailing stop",
  target: "Target",
  signal: "Exit signal",
  square_off: "Square-off",
  end_of_data: "End of data",
  expiry: "Expiry",
};

const OP_WORD: Record<string, string> = {
  ">": ">",
  "<": "<",
  ">=": "≥",
  "<=": "≤",
  "==": "=",
  crosses_above: "crosses above",
  crosses_below: "crosses below",
};

export function operandText(o: Operand): string {
  if (o.kind === "value") return String(o.value);
  if (o.kind === "field") return o.field.charAt(0).toUpperCase() + o.field.slice(1);
  const name = o.indicator.replace("_", " ");
  return o.period && !["MACD", "VWAP"].includes(o.indicator) ? `${name}(${o.period})` : name;
}

export const conditionText = (c: Condition) => `${operandText(c.left)} ${OP_WORD[c.op] ?? c.op} ${operandText(c.right)}`;

type AnyDef = Partial<StrategyDefinition> & { kind?: string; structure?: string; side?: string; stop_multiple?: number };

/** One-line, human description of a strategy definition (equity or options). */
export function strategySentence(raw: unknown): string {
  const d = (raw ?? {}) as AnyDef;
  const inst = d.instrument;
  if (d.kind === "options") {
    const structure = (d.structure ?? "straddle").replace("_", " ");
    const article = /^[aeiou]/i.test(structure) ? "an" : "a";
    return `${d.side === "BUY" ? "Buy" : "Sell"} ${article} ${structure} on ${inst?.symbol ?? "SAMPLE"} every ${inst?.timeframe === "1d" ? "day" : `${inst?.timeframe} bar`}, stop at ${d.stop_multiple ?? 1}× the credit.`;
  }
  const side = d.entry_action?.side === "SELL" ? "Short" : "Buy";
  const join = (g?: { match?: string; conditions?: Condition[] }) => (g?.conditions ?? []).map(conditionText).join(g?.match === "any" ? " or " : " and ");
  const entry = join(d.entry);
  const exit = join(d.exit);
  const risk = [
    d.risk?.stop_loss_pct ? `${d.risk.stop_loss_pct}% stop` : "",
    d.risk?.target_pct ? `${d.risk.target_pct}% target` : "",
    d.risk?.trailing_sl_pct ? `${d.risk.trailing_sl_pct}% trailing stop` : "",
  ].filter(Boolean);
  let s = `${side} ${d.entry_action?.qty ?? 1} ${inst?.symbol ?? "SAMPLE"} (${inst?.timeframe ?? "1d"})`;
  s += entry ? ` when ${entry}` : " (no entry rule yet)";
  if (exit) s += `; exit when ${exit}`;
  if (risk.length) s += ` · ${risk.join(", ")}`;
  return s + ".";
}
