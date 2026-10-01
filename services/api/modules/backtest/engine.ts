// The strategy engine — Node/TS port of the standalone tool's `engine/engine.py`.
//
// Walks candles bar by bar, evaluates the strategy's entry/exit condition tree,
// simulates fills with stop-loss / target / trailing / square-off, and returns
// trades, a per-bar equity curve and summary metrics. Pure functions: no I/O,
// no database — so it is trivially testable and safe to run per request.
import { computeIndicator } from "./indicators.js";
import type { Candle, Condition, ConditionGroup, EngineResult, Metrics, Operand, StrategyDefinition, Trade } from "./types.js";

/** A problem with the request itself (bad window, too little data) — safe to show to the user. */
export class BacktestInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BacktestInputError";
    }
}

const EPS = 1e-9;

type IndicatorMap = Map<string, number[]>;

const indicatorKey = (indicator: string, period?: number | null) => `${indicator}:${period ?? ""}`;

/** Python-style round-half-away tolerance fix so 1.005 → 1.01 like a human expects. */
export const round2 = (x: number): number => (Number.isFinite(x) ? Math.round((x + Number.EPSILON) * 100) / 100 : x);

function collectIndicatorSpecs(group: ConditionGroup | undefined, into: Map<string, [string, number | null | undefined]>) {
    for (const cond of group?.conditions ?? []) {
        for (const side of [cond.left, cond.right]) {
            if (side?.kind === "indicator") into.set(indicatorKey(side.indicator, side.period), [side.indicator, side.period]);
        }
    }
}

export function buildIndicators(definition: StrategyDefinition, candles: Candle[]): IndicatorMap {
    const specs = new Map<string, [string, number | null | undefined]>();
    collectIndicatorSpecs(definition.entry, specs);
    collectIndicatorSpecs(definition.exit, specs);
    const out: IndicatorMap = new Map();
    for (const [key, [indicator, period]] of specs) out.set(key, computeIndicator(candles, indicator, period));
    return out;
}

function resolve(operand: Operand | undefined, candles: Candle[], indicators: IndicatorMap, i: number): number | null {
    if (!operand) return null;
    if (operand.kind === "value") {
        const v = Number(operand.value);
        return operand.value === "" || !Number.isFinite(v) ? null : v;
    }
    if (operand.kind === "field") {
        const f = operand.field;
        if (f === "open" || f === "high" || f === "low" || f === "close" || f === "volume") return candles[i][f];
        return null; // e.g. "time" is not numeric
    }
    if (operand.kind === "indicator") {
        const series = indicators.get(indicatorKey(operand.indicator, operand.period));
        const val = series?.[i];
        return val === undefined || Number.isNaN(val) ? null : val;
    }
    return null;
}

function evalCondition(cond: Condition, candles: Candle[], indicators: IndicatorMap, i: number): boolean {
    const left = resolve(cond.left, candles, indicators, i);
    const right = resolve(cond.right, candles, indicators, i);
    if (left === null || right === null) return false;

    switch (cond.op) {
        case ">":
            return left > right;
        case "<":
            return left < right;
        case ">=":
            return left >= right;
        case "<=":
            return left <= right;
        case "==":
            return Math.abs(left - right) < EPS;
        case "crosses_above":
        case "crosses_below": {
            if (i === 0) return false;
            const pl = resolve(cond.left, candles, indicators, i - 1);
            const pr = resolve(cond.right, candles, indicators, i - 1);
            if (pl === null || pr === null) return false;
            return cond.op === "crosses_above" ? pl <= pr && left > right : pl >= pr && left < right;
        }
        default:
            return false;
    }
}

function evalGroup(group: ConditionGroup | undefined, candles: Candle[], indicators: IndicatorMap, i: number): boolean {
    const conditions = group?.conditions ?? [];
    if (!conditions.length) return false;
    const results = conditions.map((c) => evalCondition(c, candles, indicators, i));
    return (group?.match ?? "all") === "all" ? results.every(Boolean) : results.some(Boolean);
}

const ANNUALISATION: Record<string, number> = { "1m": 98280, "5m": 19656, "15m": 6552, "1h": 1638, "1d": 252 };

/** "HH:MM" → minutes since midnight, or null if absent / malformed. */
function parseClock(s: string | null | undefined): number | null {
    if (!s) return null;
    const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** Minutes since midnight of a candle's local clock time; null for date-only strings. */
function barClock(time: string): number | null {
    const m = /T(\d{2}):(\d{2})/.exec(time);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

type Position = { entryPrice: number; entryTime: string; best: number };

export const updateBest = (direction: number, best: number, hi: number, lo: number) => (direction === 1 ? Math.max(best, hi) : Math.min(best, lo));

/** Intrabar price-based exit. The stop is checked before the target (conservative). */
export function priceExit(
    direction: number,
    entryPrice: number,
    best: number,
    hi: number,
    lo: number,
    slPct?: number | null,
    tpPct?: number | null,
    trailPct?: number | null
): [number, string] | null {
    if (direction === 1) {
        const stop = slPct ? entryPrice * (1 - slPct / 100) : null;
        const target = tpPct ? entryPrice * (1 + tpPct / 100) : null;
        const trail = trailPct ? best * (1 - trailPct / 100) : null;
        if (stop !== null && lo <= stop) return [stop, "stop_loss"];
        if (trail !== null && lo <= trail) return [trail, "trailing_sl"];
        if (target !== null && hi >= target) return [target, "target"];
    } else {
        const stop = slPct ? entryPrice * (1 + slPct / 100) : null;
        const target = tpPct ? entryPrice * (1 - tpPct / 100) : null;
        const trail = trailPct ? best * (1 + trailPct / 100) : null;
        if (stop !== null && hi >= stop) return [stop, "stop_loss"];
        if (trail !== null && hi >= trail) return [trail, "trailing_sl"];
        if (target !== null && lo <= target) return [target, "target"];
    }
    return null;
}

export function makeTrade(side: string, qty: number, direction: number, position: Position, exitPrice: number, exitTime: string, reason: string): Trade {
    const pnl = (exitPrice - position.entryPrice) * qty * direction;
    const invested = position.entryPrice * qty;
    return {
        side,
        qty,
        entry_time: position.entryTime,
        entry_price: round2(position.entryPrice),
        exit_time: exitTime,
        exit_price: round2(exitPrice),
        pnl: round2(pnl),
        pnl_pct: invested ? round2((pnl / invested) * 100) : 0,
        reason,
    };
}

export function runBacktest(definition: StrategyDefinition, candles: Candle[], startingCapital = 100_000): EngineResult {
    if (candles.length < 2) throw new BacktestInputError("Not enough candle data to run a backtest");

    const action = definition.entry_action ?? {};
    const risk = definition.risk ?? {};
    const side = action.side ?? "BUY";
    const qty = Math.max(1, Math.trunc(Number(action.qty ?? 1)) || 1);
    const direction = side === "BUY" ? 1 : -1;
    const squareOff = parseClock(risk.square_off_time);
    const indicators = buildIndicators(definition, candles);

    let capital = startingCapital;
    let position: Position | null = null;
    const trades: Trade[] = [];
    const equityCurve: { time: string; equity: number }[] = [];

    const closePosition = (exitPrice: number, exitTime: string, reason: string) => {
        const trade = makeTrade(side, qty, direction, position as Position, exitPrice, exitTime, reason);
        capital += trade.pnl;
        trades.push(trade);
        position = null;
    };

    for (let i = 0; i < candles.length; i++) {
        const { close: price, high: hi, low: lo, time: ts } = candles[i];

        // 1) manage an open position (entered on a prior bar)
        if (position) {
            let exited = false;
            position.best = updateBest(direction, position.best, hi, lo);

            const hit = priceExit(direction, position.entryPrice, position.best, hi, lo, risk.stop_loss_pct, risk.target_pct, risk.trailing_sl_pct);
            if (hit) {
                closePosition(hit[0], ts, hit[1]);
                exited = true;
            }

            if (!exited && squareOff !== null) {
                const clock = barClock(ts);
                if (clock !== null && clock >= squareOff) {
                    closePosition(price, ts, "square_off");
                    exited = true;
                }
            }

            if (!exited && evalGroup(definition.exit, candles, indicators, i)) {
                closePosition(price, ts, "signal");
                exited = true;
            }
        }

        // 2) entry (only when flat; never on the same bar as an exit)
        if (!position && evalGroup(definition.entry, candles, indicators, i)) {
            position = { entryPrice: price, entryTime: ts, best: price };
        }

        // 3) mark-to-market equity
        let eq = capital;
        if (position) eq += (price - (position as Position).entryPrice) * qty * direction;
        equityCurve.push({ time: ts, equity: round2(eq) });
    }

    // force-close any open position at the last bar
    if (position) {
        closePosition(candles[candles.length - 1].close, candles[candles.length - 1].time, "end_of_data");
        equityCurve[equityCurve.length - 1].equity = round2(capital);
    }

    return { trades, equity_curve: equityCurve, metrics: computeMetrics(trades, equityCurve, startingCapital, definition.instrument?.timeframe ?? "1d") };
}

export function computeMetrics(trades: Trade[], equityCurve: { equity: number }[], startingCapital: number, timeframe: string): Metrics {
    const pnls = trades.map((t) => t.pnl);
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p < 0);
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const totalPnl = sum(pnls);
    const grossProfit = sum(wins);
    const grossLoss = Math.abs(sum(losses));

    let peak = -Infinity;
    let maxDd = 0;
    for (const { equity } of equityCurve) {
        peak = Math.max(peak, equity);
        if (peak > 0) maxDd = Math.max(maxDd, ((peak - equity) / peak) * 100);
    }

    // simple Sharpe on per-bar equity returns
    let sharpe = 0;
    const eqs = equityCurve.map((p) => p.equity);
    if (eqs.length > 2) {
        const rets: number[] = [];
        for (let i = 1; i < eqs.length; i++) if (eqs[i - 1] !== 0) rets.push((eqs[i] - eqs[i - 1]) / eqs[i - 1]);
        if (rets.length) {
            const mean = sum(rets) / rets.length;
            const std = Math.sqrt(sum(rets.map((r) => (r - mean) ** 2)) / rets.length);
            if (std > 0) sharpe = (mean / std) * Math.sqrt(ANNUALISATION[timeframe] ?? 252);
        }
    }

    return {
        starting_capital: round2(startingCapital),
        final_equity: round2(startingCapital + totalPnl),
        total_pnl: round2(totalPnl),
        total_return_pct: startingCapital ? round2((totalPnl / startingCapital) * 100) : 0,
        num_trades: trades.length,
        wins: wins.length,
        losses: losses.length,
        win_rate: trades.length ? round2((wins.length / trades.length) * 100) : 0,
        avg_win: wins.length ? round2(grossProfit / wins.length) : 0,
        avg_loss: losses.length ? round2(sum(losses) / losses.length) : 0,
        profit_factor: grossLoss > 0 ? round2(grossProfit / grossLoss) : grossProfit > 0 ? grossProfit : 0,
        max_drawdown_pct: round2(maxDd),
        sharpe: round2(sharpe),
    };
}
