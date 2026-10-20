// The strategy engine. Runs a normalised Strategy Spec v1 (see spec.ts) bar by
// bar and returns trades, a per-bar equity curve, metrics and the assumptions
// behind them. Pure functions: no I/O, no database — trivially testable, safe
// per request, and deterministic (same spec + candles → identical output).
//
// Conservative by default: signals use bar t's close and fill at bar t+1's
// open; a stop or target the open gapped through fills at the open; when one
// bar touches both, the stop is assumed first; each trade is sized from the
// sizing rule at its own fill price and capped by buying power; Indian charges
// and slippage apply to every fill; zero equity liquidates and ends the run.
//
// Legacy chat/builder definitions go through `runBacktest`, which converts
// them to a spec first — there is one engine path.
import { computeRef, type IndicatorRef } from "./indicators.js";
import { costsApply, fillCharges } from "./costs.js";
import {
    canonicalJson,
    definitionToSpec,
    groupItems,
    isGroup,
    MIS_MAX_LEVERAGE,
    normaliseSpec,
    SpecConversionError,
    specHash,
    specRefs,
    sizingText,
    symbolOf,
    type LevelRule,
    type Spec,
    type SpecCondition,
    type SpecGroup,
    type SpecOperand,
} from "./spec.js";
import type { Candle, EngineResult, EquityPoint, Metrics, Sizing, StrategyDefinition, Trade } from "./types.js";

/** A problem with the request itself (bad window, too little data) — safe to show to the user. */
export class BacktestInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BacktestInputError";
    }
}

/**
 * Bumped on any change that can move a number. Stored with every run, so a
 * past run is reproducible: same spec + data version + engine version → same
 * result. 2.1.0: runs on Spec v1; VWAP resets each session; more metrics.
 */
export const ENGINE_VERSION = "2.1.0";

/** Intraday (MIS) buying power as a multiple of equity — the broker's equity leverage. */
export const MIS_LEVERAGE = MIS_MAX_LEVERAGE;

const EPS = 1e-9;

/** Python-style round-half-away tolerance fix so 1.005 → 1.01 like a human expects. */
export const round2 = (x: number): number => (Number.isFinite(x) ? Math.round((x + Number.EPSILON) * 100) / 100 : x);

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

export function describeSizing(sizing: Sizing): string {
    return sizingText({ ...sizing, max_leverage: 1 });
}

// ── conditions ──────────────────────────────────────────────────────────────

const refKey = (ref: IndicatorRef) => canonicalJson(ref);

type Ctx = { candles: Candle[]; series: Map<string, number[]> };

export function buildSeries(spec: Spec, candles: Candle[]): Map<string, number[]> {
    const series = new Map<string, number[]>();
    for (const ref of specRefs(spec)) {
        const key = refKey(ref);
        if (!series.has(key)) series.set(key, computeRef(candles, ref));
    }
    return series;
}

function valueAt(o: SpecOperand | undefined, ctx: Ctx, i: number): number | null {
    if (o === undefined || i < 0) return null;
    if (typeof o === "number") return o;
    if ("field" in o) return ctx.candles[i][o.field];
    const v = ctx.series.get(refKey(o))?.[i];
    return v === undefined || Number.isNaN(v) ? null : v;
}

export function evalCondition(c: SpecCondition, ctx: Ctx, i: number): boolean {
    const left = valueAt(c.left, ctx, i);
    if (left === null) return false;
    switch (c.op) {
        case "between": {
            const lo = valueAt(c.low, ctx, i);
            const hi = valueAt(c.high, ctx, i);
            return lo !== null && hi !== null && left >= Math.min(lo, hi) && left <= Math.max(lo, hi);
        }
        case "rising":
        case "falling": {
            // strictly up (down) on each of the last `bars` bars
            const n = c.bars ?? 1;
            for (let k = 0; k < n; k++) {
                const now = valueAt(c.left, ctx, i - k);
                const before = valueAt(c.left, ctx, i - k - 1);
                if (now === null || before === null) return false;
                if (c.op === "rising" ? !(now > before) : !(now < before)) return false;
            }
            return true;
        }
    }
    const right = valueAt(c.right, ctx, i);
    if (right === null) return false;
    switch (c.op) {
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
            const pl = valueAt(c.left, ctx, i - 1);
            const pr = valueAt(c.right, ctx, i - 1);
            if (pl === null || pr === null) return false;
            return c.op === "crosses_above" ? pl <= pr && left > right : pl >= pr && left < right;
        }
        default:
            return false;
    }
}

export function evalGroup(g: SpecGroup | null, ctx: Ctx, i: number): boolean {
    if (!g) return false;
    const items = groupItems(g);
    if (!items.length) return false;
    const test = (n: SpecCondition | SpecGroup) => (isGroup(n) ? evalGroup(n, ctx, i) : evalCondition(n, ctx, i));
    return "all" in g ? items.every(test) : items.some(test);
}

// ── stops, targets and fills ────────────────────────────────────────────────

/** Distance of a stop / target rule from the entry price, or null if its ATR isn't warmed up yet. */
function levelDistance(rule: LevelRule, price: number, atr: number | null): number | null {
    if (rule.type === "pct") return (price * rule.value) / 100;
    if (rule.type === "points") return rule.value;
    return atr === null ? null : rule.value * atr;
}

type Level = { price: number; reason: string };
type Bar = { open: number; high: number; low: number };

export const updateBest = (direction: number, best: number, hi: number, lo: number) => (direction === 1 ? Math.max(best, hi) : Math.min(best, lo));

/**
 * Price-based exit within one bar → [fill price, reason, isMarketOrder].
 *
 * The open comes first: a stop the open has already gapped through fills at
 * the open, not at the stop price, and so does a target the open gapped past.
 * Within the bar the order of high and low is unknown, so the stop is assumed
 * to have come first (conservative). Of several stops, the one nearest the
 * price is the one hit first.
 */
export function priceExit(direction: number, bar: Bar, stops: Level[], target: number | null): [number, string, boolean] | null {
    const { open, high: hi, low: lo } = bar;
    const stop = stops.length ? stops.reduce((a, b) => (direction === 1 ? (b.price > a.price ? b : a) : b.price < a.price ? b : a)) : null;
    if (direction === 1) {
        if (stop && open <= stop.price) return [open, stop.reason, true];
        if (target !== null && open >= target) return [open, "target", false];
        if (stop && lo <= stop.price) return [stop.price, stop.reason, true];
        if (target !== null && hi >= target) return [target, "target", false];
    } else {
        if (stop && open >= stop.price) return [open, stop.reason, true];
        if (target !== null && open <= target) return [open, "target", false];
        if (stop && hi >= stop.price) return [stop.price, stop.reason, true];
        if (target !== null && lo <= target) return [target, "target", false];
    }
    return null;
}

type Position = {
    qty: number;
    entryPrice: number;
    entryTime: string;
    entryCosts: number;
    best: number;
    stop: number | null;
    target: number | null;
    /** Closes seen while open. A bar_close entry opens after this bar's count, so its own bar isn't counted. */
    barsHeld: number;
};

// ── the run ─────────────────────────────────────────────────────────────────

export function runSpec(spec: Spec, candles: Candle[]): EngineResult {
    if (candles.length < 2) throw new BacktestInputError("Not enough candle data to run a backtest");

    const { exchange } = symbolOf(spec);
    const direction = spec.entry.side === "long" ? 1 : -1;
    const side = direction === 1 ? "BUY" : "SELL";
    const timeframe = spec.instrument.timeframe;
    const { fill, product, reentry_cooldown_bars: cooldown } = spec.execution;
    const squareOff = timeframe === "1d" ? null : parseClock(spec.execution.square_off);
    const { stop_loss: stopRule, target: targetRule, trailing_stop: trailRule, time_exit: timeExit } = spec.exit;
    const sizing = spec.sizing;
    const leverage = sizing.max_leverage;
    const profile = spec.costs.profile;
    const slippageBps = spec.costs.slippage_bps;
    const startingCapital = spec.capital.initial;

    const ctx: Ctx = { candles, series: buildSeries(spec, candles) };
    const atrAt = (len: number | undefined, i: number) => valueAt({ ind: "ATR", len: len ?? 14 }, ctx, i);

    const slip = (price: number, buy: boolean) => price * (1 + ((buy ? 1 : -1) * slippageBps) / 10_000);
    const charges = (buy: boolean, price: number, qty: number, time: string) => (profile ? fillCharges(profile, product, buy, price, qty, time) : 0);

    let cash = startingCapital; // realised equity: capital + closed P&L − all charges paid
    let position: Position | null = null;
    let pending: { kind: "enter" } | { kind: "exit"; reason: string } | null = null; // decided on a close, filled at the next open
    let lastExitBar = -Infinity;
    let capped = 0;
    let skipped = 0;
    let warmupSkips = 0;
    let barsInMarket = 0;
    let wipedOutAt: string | null = null;
    const trades: Trade[] = [];
    const equityCurve: EquityPoint[] = [];

    /** Open at `rawPrice`; `signalBar` is the last bar whose data the order could have used. */
    const openPosition = (rawPrice: number, time: string, signalBar: number) => {
        const price = slip(rawPrice, direction === 1);
        let stopDist: number | null = null;
        if (stopRule) {
            stopDist = levelDistance(stopRule, price, atrAt(stopRule.len, signalBar));
            if (stopDist === null) {
                warmupSkips++;
                return;
            }
        }
        const targetDist = targetRule ? levelDistance(targetRule, price, atrAt(targetRule.len, signalBar)) : null;
        if (targetRule && targetDist === null) {
            warmupSkips++;
            return;
        }

        let qty: number;
        if (sizing.mode === "fixed_qty") qty = Math.trunc(sizing.value);
        else if (sizing.mode === "fixed_amount") qty = Math.floor(sizing.value / price);
        else if (sizing.mode === "pct_equity") qty = Math.floor((cash * sizing.value) / 100 / price);
        else qty = stopDist && stopDist > 0 ? Math.floor((cash * sizing.value) / 100 / stopDist) : 0;

        // Buying power: the margin (notional ÷ leverage) plus the entry charges must fit in equity.
        const fits = (q: number) => (q * price) / leverage + charges(direction === 1, price, q, time) <= cash;
        if (qty > 0 && !fits(qty)) {
            let q = Math.floor((cash * leverage) / price);
            while (q > 0 && !fits(q)) q--;
            qty = q;
            capped++;
        }
        if (qty < 1) {
            skipped++;
            return;
        }
        const entryCosts = charges(direction === 1, price, qty, time);
        cash -= entryCosts;
        position = {
            qty,
            entryPrice: price,
            entryTime: time,
            entryCosts,
            best: price,
            stop: stopDist === null ? null : price - direction * stopDist,
            target: targetDist === null ? null : price + direction * targetDist,
            barsHeld: 0,
        };
    };

    const closePosition = (rawPrice: number, time: string, reason: string, i: number, market = true) => {
        const pos = position as Position;
        const price = market ? slip(rawPrice, direction === -1) : rawPrice;
        const gross = (price - pos.entryPrice) * pos.qty * direction;
        const exitCosts = charges(direction === -1, price, pos.qty, time);
        cash += gross - exitCosts;
        const costs = pos.entryCosts + exitCosts;
        const invested = pos.entryPrice * pos.qty;
        trades.push({
            side,
            qty: pos.qty,
            entry_time: pos.entryTime,
            entry_price: round2(pos.entryPrice),
            exit_time: time,
            exit_price: round2(price),
            pnl: round2(gross - costs),
            pnl_pct: invested ? round2(((gross - costs) / invested) * 100) : 0,
            reason,
            gross_pnl: round2(gross),
            costs: round2(costs),
        });
        position = null;
        lastExitBar = i;
    };

    for (let i = 0; i < candles.length; i++) {
        const bar = candles[i];
        const { open, close, high: hi, low: lo, time: ts } = bar;
        const clock = squareOff === null ? null : barClock(ts);
        const pastCutoff = clock !== null && squareOff !== null && clock >= squareOff;

        // 1) intraday square-off at the open of the first bar at or after the cut-off,
        //    or of the next session if the data skipped the cut-off bar
        if (position && squareOff !== null && (pastCutoff || ts.slice(0, 10) > (position as Position).entryTime.slice(0, 10))) {
            closePosition(open, ts, "square_off", i);
            if (pending?.kind === "exit") pending = null;
        }

        // 2) orders decided on the previous close fill at this bar's open
        if (pending?.kind === "exit" && position) closePosition(open, ts, pending.reason, i);
        else if (pending?.kind === "enter" && !position && !pastCutoff) openPosition(open, ts, i - 1);
        pending = null;

        // 3) stops and targets inside this bar (also for a position opened at this open)
        if (position) {
            const pos = position as Position;
            const stops: Level[] = [];
            if (pos.stop !== null) stops.push({ price: pos.stop, reason: "stop_loss" });
            if (trailRule) {
                // the trail uses the best price up to the previous bar and the previous bar's ATR
                const dist = trailRule.type === "pct" ? (pos.best * trailRule.value) / 100 : (() => {
                    const a = atrAt(trailRule.len, i - 1);
                    return a === null ? null : trailRule.value * a;
                })();
                if (dist !== null) stops.push({ price: pos.best - direction * dist, reason: "trailing_sl" });
            }
            const hit = priceExit(direction, bar, stops, pos.target);
            if (hit) closePosition(hit[0], ts, hit[1], i, hit[2]);
            else pos.best = updateBest(direction, pos.best, hi, lo);
        }

        // 4) signals on this bar's close
        if (position) {
            const pos = position as Position;
            pos.barsHeld++;
            const reason = evalGroup(spec.exit.when, ctx, i) ? "signal" : timeExit && pos.barsHeld >= timeExit.bars ? "time_exit" : null;
            if (reason) {
                if (fill === "bar_close") closePosition(close, ts, reason, i);
                else if (i < candles.length - 1) pending = { kind: "exit", reason };
            }
        } else if (i - lastExitBar >= cooldown && !pastCutoff && evalGroup(spec.entry.when, ctx, i)) {
            if (fill === "bar_close") openPosition(close, ts, i);
            else if (i < candles.length - 1) pending = { kind: "enter" };
        }

        // 5) mark to market; at zero equity the account is wiped out and the run ends
        const pos = position as Position | null;
        if (pos) barsInMarket++;
        const equity = cash + (pos ? (close - pos.entryPrice) * pos.qty * direction : 0);
        if (equity <= 0) {
            if (pos) closePosition(close, ts, "liquidated", i);
            wipedOutAt = ts;
            equityCurve.push({ time: ts, equity: round2(cash) });
            for (let j = i + 1; j < candles.length; j++) equityCurve.push({ time: candles[j].time, equity: round2(cash) });
            break;
        }
        equityCurve.push({ time: ts, equity: round2(equity) });
    }

    // close any open position on the last bar
    if (position && !wipedOutAt) {
        const last = candles[candles.length - 1];
        closePosition(last.close, last.time, "end_of_data", candles.length - 1);
        equityCurve[equityCurve.length - 1].equity = round2(cash);
    }

    const warnings: string[] = [];
    if (capped) {
        warnings.push(
            product === "MIS"
                ? `Position size was capped on ${capped} trade${capped === 1 ? "" : "s"} to the ${leverage}× intraday buying power.`
                : `Position size was capped on ${capped} trade${capped === 1 ? "" : "s"} to the cash in the account — delivery trades can't use more money than you have.`
        );
    }
    if (skipped) warnings.push(`${skipped} entry signal${skipped === 1 ? " was" : "s were"} skipped: not enough capital for one share at the fill price.`);
    if (warmupSkips) warnings.push(`${warmupSkips} entry signal${warmupSkips === 1 ? " was" : "s were"} skipped while the ATR for the stop/target was still warming up.`);
    if (wipedOutAt) warnings.push(`Account wiped out on ${wipedOutAt.slice(0, 10)}: equity fell to zero, the position was liquidated and the run stopped there.`);
    if (direction === -1 && product === "CNC") {
        warnings.push("Delivery (CNC) shorts aren't possible in Indian cash markets — treat this short as theoretical, or test it on an intraday timeframe.");
    }
    if (!profile && !costsApply(exchange)) warnings.push("Results are before costs: the Indian cost model covers NSE and BSE only.");

    return {
        trades,
        equity_curve: equityCurve,
        metrics: computeMetrics(trades, equityCurve, startingCapital, timeframe, Boolean(wipedOutAt), {
            barsInMarket,
            riskFreePct: spec.report.risk_free_pct,
            benchmark: spec.report.benchmark === "buy_hold" ? candles : null,
        }),
        assumptions: {
            engine_version: ENGINE_VERSION,
            spec_version: spec.spec_version,
            spec_hash: specHash(spec),
            fill,
            product,
            sizing: sizingText(sizing),
            cost_profile: profile,
            slippage_bps: slippageBps,
            reentry_cooldown_bars: cooldown,
            risk_free_pct: spec.report.risk_free_pct,
            data_adjust: spec.data.adjust,
            data_lag_days: spec.data.lag_days,
        },
        warnings,
    };
}

/**
 * Run a legacy chat / builder definition: converted to a Spec v1 over the
 * candles' own window, normalised, and run on the one engine path.
 */
export function runBacktest(definition: StrategyDefinition, candles: Candle[], startingCapital = 100_000): EngineResult {
    return runDefinition(definition, candles, startingCapital).result;
}

/** `runBacktest`, also returning the normalised spec that ran — stored with saved runs. */
export function runDefinition(definition: StrategyDefinition, candles: Candle[], startingCapital = 100_000, name?: string): { result: EngineResult; spec: Spec } {
    if (candles.length < 2) throw new BacktestInputError("Not enough candle data to run a backtest");
    let input;
    try {
        input = definitionToSpec(definition, { name, from: candles[0].time.slice(0, 10), to: candles[candles.length - 1].time.slice(0, 10), capital: startingCapital });
    } catch (err) {
        if (err instanceof SpecConversionError) throw new BacktestInputError(err.message);
        throw err;
    }
    const n = normaliseSpec(input, { allowEmptyEntry: true });
    if ("errors" in n) throw new BacktestInputError(n.errors.join("; "));
    return { result: runSpec(n.spec, candles), spec: n.spec };
}

// ── metrics ─────────────────────────────────────────────────────────────────

const dayMs = (time: string) => Date.parse(`${time.slice(0, 10)}T00:00:00Z`);

/** Compound annual growth, or null for spans too short to annualise honestly (under 30 days). */
function cagr(start: number, end: number, firstTime: string, lastTime: string): number | null {
    const years = (dayMs(lastTime) - dayMs(firstTime)) / (365.25 * 86_400_000);
    if (!(years >= 30 / 365.25) || start <= 0 || end <= 0) return null;
    return (Math.pow(end / start, 1 / years) - 1) * 100;
}

function drawdownStats(values: number[], times?: string[]): { maxPct: number; durationBars: number; durationDays: number } {
    let peak = -Infinity;
    let peakIdx = 0;
    let maxPct = 0;
    let durationBars = 0;
    let durationDays = 0;
    values.forEach((v, i) => {
        if (v >= peak) {
            peak = v;
            peakIdx = i;
            return;
        }
        if (peak > 0) maxPct = Math.max(maxPct, ((peak - v) / peak) * 100);
        if (i - peakIdx > durationBars) {
            durationBars = i - peakIdx;
            if (times) durationDays = Math.round((dayMs(times[i]) - dayMs(times[peakIdx])) / 86_400_000);
        }
    });
    return { maxPct, durationBars, durationDays };
}

type MetricsExtra = { barsInMarket?: number; riskFreePct?: number; benchmark?: Candle[] | null };

export function computeMetrics(
    trades: Trade[],
    equityCurve: { equity: number; time?: string }[],
    startingCapital: number,
    timeframe: string,
    wipedOut = false,
    extra: MetricsExtra = {}
): Metrics {
    const pnls = trades.map((t) => t.pnl);
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p < 0);
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const totalPnl = sum(pnls);
    const grossProfit = sum(wins);
    const grossLoss = Math.abs(sum(losses));
    const finalEquity = startingCapital + totalPnl;

    const eqs = equityCurve.map((p) => p.equity);
    const times = equityCurve.every((p) => p.time) ? equityCurve.map((p) => p.time as string) : undefined;
    const dd = drawdownStats(eqs, times);

    // Sharpe / Sortino on per-bar equity returns, excess over the risk-free rate
    const ann = ANNUALISATION[timeframe] ?? 252;
    const rfPct = extra.riskFreePct ?? 0;
    const rfBar = Math.pow(1 + rfPct / 100, 1 / ann) - 1;
    let sharpe = 0;
    let sortino: number | null = null;
    if (eqs.length > 2) {
        const rets: number[] = [];
        for (let i = 1; i < eqs.length; i++) if (eqs[i - 1] !== 0) rets.push((eqs[i] - eqs[i - 1]) / eqs[i - 1] - rfBar);
        if (rets.length) {
            const mean = sum(rets) / rets.length;
            const std = Math.sqrt(sum(rets.map((r) => (r - mean) ** 2)) / rets.length);
            if (std > 0) sharpe = (mean / std) * Math.sqrt(ann);
            const downside = Math.sqrt(sum(rets.map((r) => Math.min(r, 0) ** 2)) / rets.length);
            sortino = downside > 0 ? (mean / downside) * Math.sqrt(ann) : null;
        }
    }

    const growth = times ? cagr(startingCapital, finalEquity, times[0], times[times.length - 1]) : null;

    let benchmark: Metrics["benchmark"] = null;
    const bm = extra.benchmark;
    if (bm && bm.length >= 2 && bm[0].open > 0) {
        const path = [bm[0].open, ...bm.map((c) => c.close)];
        benchmark = {
            kind: "buy_hold",
            total_return_pct: round2((bm[bm.length - 1].close / bm[0].open - 1) * 100),
            cagr_pct: (() => {
                const c = cagr(bm[0].open, bm[bm.length - 1].close, bm[0].time, bm[bm.length - 1].time);
                return c === null ? null : round2(c);
            })(),
            max_drawdown_pct: round2(drawdownStats(path).maxPct),
        };
    }

    return {
        starting_capital: round2(startingCapital),
        final_equity: round2(finalEquity),
        total_pnl: round2(totalPnl),
        total_return_pct: startingCapital ? round2((totalPnl / startingCapital) * 100) : 0,
        num_trades: trades.length,
        wins: wins.length,
        losses: losses.length,
        win_rate: trades.length ? round2((wins.length / trades.length) * 100) : 0,
        avg_win: wins.length ? round2(grossProfit / wins.length) : 0,
        avg_loss: losses.length ? round2(sum(losses) / losses.length) : 0,
        profit_factor: grossLoss > 0 ? round2(grossProfit / grossLoss) : grossProfit > 0 ? grossProfit : 0,
        max_drawdown_pct: round2(dd.maxPct),
        sharpe: round2(sharpe),
        total_costs: round2(sum(trades.map((t) => t.costs ?? 0))),
        wiped_out: wipedOut,
        cagr_pct: growth === null ? null : round2(growth),
        sortino: sortino === null ? null : round2(sortino),
        calmar: growth === null || dd.maxPct === 0 ? null : round2(growth / dd.maxPct),
        expectancy: trades.length ? round2(totalPnl / trades.length) : 0,
        max_drawdown_duration_bars: dd.durationBars,
        max_drawdown_duration_days: times ? dd.durationDays : null,
        exposure_pct: extra.barsInMarket === undefined || !eqs.length ? null : round2((extra.barsInMarket / eqs.length) * 100),
        risk_free_pct: rfPct,
        benchmark,
    };
}
