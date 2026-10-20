// Known-answer tests: small hand-calculated cases for every exit, sizing mode
// and operator, plus a regression snapshot of stored results. No engine
// change ships unless these still pass — a deliberate change updates the
// snapshot AND bumps ENGINE_VERSION (both are in the snapshot).
import { describe, it, expect } from "vitest";
import { ENGINE_VERSION, runSpec } from "./engine.js";
import { normaliseSpec, type Spec, type SpecInput } from "./spec.js";
import { adx, donchian, macd, openingRange, priorDay, stochD, stochK, vwap, wma } from "./indicators.js";
import { generateSampleCandles } from "./synthetic.js";
import type { Candle } from "./types.js";

const bar = (time: string, o: number, h: number, l: number, c: number, v = 1000): Candle => ({ time, open: o, high: h, low: l, close: c, volume: v });
const days = (n: number, start = "2024-01-01") => Array.from({ length: n }, (_, i) => new Date(Date.parse(`${start}T00:00:00Z`) + i * 86_400_000).toISOString().slice(0, 10));
/** Daily candles from [open, high, low, close] rows. */
const series = (rows: [number, number, number, number][], start?: string) => days(rows.length, start).map((d, i) => bar(d, ...rows[i]));

const always = { all: [{ left: { field: "close" as const }, op: ">" as const, right: 0 }] };
const closeIs = (v: number) => ({ all: [{ left: { field: "close" as const }, op: "==" as const, right: v }] });

function spec(candles: Candle[], over: Partial<SpecInput>): Spec {
    const r = normaliseSpec({
        instrument: { id: "NSE:TEST", timeframe: "1d" },
        period: { from: candles[0].time.slice(0, 10), to: candles[candles.length - 1].time.slice(0, 10) },
        entry: { when: closeIs(100) },
        sizing: { mode: "fixed_qty", value: 10 },
        costs: { profile: null, slippage_bps: 0 },
        execution: { reentry_cooldown_bars: 1 },
        ...over,
    });
    if ("errors" in r) throw new Error(r.errors.join("; "));
    return r.spec;
}
const run = (candles: Candle[], over: Partial<SpecInput>) => runSpec(spec(candles, over), candles);

describe("known answers: stops, targets and exits", () => {
    it("points stop: entry 100, ₹5 stop → exit at 95", () => {
        const c = series([[100, 100, 100, 100], [100, 101, 99, 100.5], [100, 100, 94, 95], [95, 95, 95, 95]]);
        expect(run(c, { exit: { stop_loss: { type: "points", value: 5 } } }).trades[0]).toMatchObject({ entry_price: 100, exit_price: 95, reason: "stop_loss", pnl: -50 });
    });

    it("ATR stop: true range 2 every bar → 1.5× ATR = ₹3 below a 100 entry", () => {
        // every bar spans 2 with no gaps, so TR = 2 and ATR(3) = 2 from the first bar
        const rows: [number, number, number, number][] = [
            [99, 100, 98, 99],
            [99, 100, 98, 99],
            [99, 100, 98, 100],
            [100, 101, 99, 100], // fills here at 100
            [100, 101, 96, 97], // low 96 breaches 97
            [97, 98, 96, 97],
        ];
        const r = run(series(rows), { exit: { stop_loss: { type: "atr", value: 1.5, len: 3 } } });
        expect(r.trades[0]).toMatchObject({ entry_price: 100, exit_price: 97, reason: "stop_loss" });
    });

    it("ATR target: 2× ATR(3) = ₹4 above entry", () => {
        const rows: [number, number, number, number][] = [
            [99, 100, 98, 99],
            [99, 100, 98, 100],
            [100, 101, 99, 100.5],
            [100.5, 105, 100, 104],
            [104, 104, 104, 104],
        ];
        expect(run(series(rows), { exit: { target: { type: "atr", value: 2, len: 3 } } }).trades[0]).toMatchObject({ entry_price: 100, exit_price: 104, reason: "target" });
    });

    it("pct trailing stop follows the best price: best 110, 5% trail → 104.5", () => {
        const c = series([[100, 100, 100, 100], [100, 101, 99, 101], [101, 110, 101, 109], [109, 109, 104, 105], [105, 105, 105, 105]]);
        expect(run(c, { exit: { trailing_stop: { type: "pct", value: 5 } } }).trades[0]).toMatchObject({ exit_price: 104.5, reason: "trailing_sl" });
    });

    it("ATR trailing stop uses the previous bar's ATR: best 110 − 1× ATR(1) of 9 → 101", () => {
        // ATR(1) = that bar's true range. On the last bar the trail is best 110 minus the
        // previous (110) bar's TR of 9 = 101; earlier bars' trails (92, then 99) never get hit.
        const c = series([[100, 104, 96, 100], [100, 101, 99, 101], [101, 110, 101, 109], [109, 109, 100, 102], [102, 102, 102, 102]]);
        expect(run(c, { exit: { trailing_stop: { type: "atr", value: 1, len: 1 } } }).trades[0]).toMatchObject({ exit_price: 101, reason: "trailing_sl" });
    });

    it("a target the open gapped past fills at the open", () => {
        const c = series([[100, 100, 100, 100], [100, 101, 99, 100.5], [108, 109, 107, 108], [108, 108, 108, 108]]);
        expect(run(c, { exit: { target: { type: "pct", value: 5 } } }).trades[0]).toMatchObject({ exit_price: 108, reason: "target" });
    });

    it("time exit after 2 bars held: filled on day 2, closes counted on days 2 and 3, out at day 4's open", () => {
        const c = series([[100, 100, 100, 100], [101, 101, 101, 101], [102, 102, 102, 102], [103, 103, 103, 103], [104, 104, 104, 104]]);
        expect(run(c, { exit: { time_exit: { bars: 2 } } }).trades[0]).toMatchObject({ entry_time: "2024-01-02", entry_price: 101, exit_time: "2024-01-04", exit_price: 103, reason: "time_exit" });
    });

    it("time exit with bar_close fills: in at day 1's close, out at day 3's close", () => {
        const c = series([[100, 100, 100, 100], [101, 101, 101, 101], [102, 102, 102, 102], [103, 103, 103, 103]]);
        const r = run(c, { execution: { fill: "bar_close" }, exit: { time_exit: { bars: 2 } } });
        expect(r.trades[0]).toMatchObject({ entry_time: "2024-01-01", entry_price: 100, exit_time: "2024-01-03", exit_price: 102, reason: "time_exit" });
    });

    it("short with a points stop: entry 100, ₹4 stop → out at 104", () => {
        const c = series([[100, 100, 100, 100], [100, 101, 99, 100], [100, 105, 100, 104], [104, 104, 104, 104]]);
        expect(run(c, { entry: { side: "short", when: closeIs(100) }, exit: { stop_loss: { type: "points", value: 4 } } }).trades[0]).toMatchObject({ side: "SELL", exit_price: 104, pnl: -40 });
    });
});

describe("known answers: sizing", () => {
    const flat = series([[100, 100, 100, 100], [100, 100, 100, 100], [100, 100, 100, 100]]);

    it("risk_pct: risking 1% of ₹1,00,000 with a 2% stop on a ₹100 entry → 500 shares", () => {
        expect(run(flat, { sizing: { mode: "risk_pct", value: 1 }, exit: { stop_loss: { type: "pct", value: 2 } } }).trades[0].qty).toBe(500);
    });

    it("risk_pct is still capped by cash: a 0.5% stop would ask for 2,000 shares (₹2L)", () => {
        const r = run(flat, { sizing: { mode: "risk_pct", value: 1 }, exit: { stop_loss: { type: "pct", value: 0.5 } } });
        expect(r.trades[0].qty).toBe(1000);
        expect(r.warnings.join(" ")).toMatch(/capped/);
    });

    it("fixed_amount: ₹25,000 at ₹100 → 250 shares", () => {
        expect(run(flat, { sizing: { mode: "fixed_amount", value: 25000 } }).trades[0].qty).toBe(250);
    });

    it("max_leverage on MIS lets a ₹3L position through on ₹1L, at most 5×", () => {
        const intraday = [bar("2024-01-01T09:15:00", 100, 100, 100, 100), bar("2024-01-01T09:20:00", 100, 100, 100, 100), bar("2024-01-01T09:25:00", 100, 100, 100, 100)];
        const base = { instrument: { id: "NSE:TEST", timeframe: "5m" as const }, sizing: { mode: "fixed_amount" as const, value: 300000, max_leverage: 3 } };
        expect(run(intraday, base).trades[0].qty).toBe(3000);
        expect(run(intraday, { ...base, sizing: { mode: "fixed_amount", value: 900000, max_leverage: 5 } }).trades[0].qty).toBe(5000);
    });
});

describe("known answers: operators", () => {
    const closes = [10, 11, 12, 13, 12, 11, 15, 15, 15];
    const c = closes.map((x, i) => bar(days(closes.length)[i], x, x, x, x));
    const entries = (when: SpecInput["entry"]["when"]) => run(c, { entry: { when }, exit: { when: always }, execution: { reentry_cooldown_bars: 0 } }).trades.map((t) => t.entry_time);

    it("rising(3): up on each of the last three bars → signal on 01-04, fill 01-05", () => {
        expect(entries({ all: [{ left: { field: "close" }, op: "rising", bars: 3 }] })[0]).toBe("2024-01-05");
    });

    it("falling(2): down two bars running → signal on 01-06, fill 01-07", () => {
        expect(entries({ all: [{ left: { field: "close" }, op: "falling", bars: 2 }] })[0]).toBe("2024-01-07");
    });

    it("between is inclusive and order-free", () => {
        expect(entries({ all: [{ left: { field: "close" }, op: "between", low: 14, high: 16 }] })[0]).toBe("2024-01-08");
        expect(entries({ all: [{ left: { field: "close" }, op: "between", low: 15, high: 11 }] })[0]).toBe("2024-01-03");
    });

    it("nested groups: all(close > 11, any(close == 13, close == 15))", () => {
        const when = { all: [{ left: { field: "close" as const }, op: ">" as const, right: 11 }, { any: [{ left: { field: "close" as const }, op: "==" as const, right: 13 }, { left: { field: "close" as const }, op: "==" as const, right: 15 }] }] };
        expect(entries(when)[0]).toBe("2024-01-05");
    });
});

describe("known answers: metrics", () => {
    it("CAGR: equity doubling over two years ≈ 41.42% a year", () => {
        const c = [bar("2022-01-01", 100, 100, 100, 100), bar("2022-01-02", 100, 100, 100, 100), bar("2024-01-02", 200, 200, 200, 200)];
        const m = run(c, { sizing: { mode: "pct_equity", value: 100 } }).metrics;
        expect(m.total_return_pct).toBe(100);
        expect(m.cagr_pct).toBeCloseTo(41.42, 1);
    });

    it("CAGR is withheld for windows under 30 days", () => {
        const c = series([[100, 100, 100, 100], [100, 100, 100, 100], [110, 110, 110, 110]]);
        expect(run(c, {}).metrics.cagr_pct).toBeNull();
    });

    it("buy & hold benchmark: first open 100 → last close 120, with a dip to 90", () => {
        const c = series([[100, 100, 90, 90], [90, 100, 90, 100], [100, 120, 100, 120]]);
        expect(run(c, {}).metrics.benchmark).toEqual({ kind: "buy_hold", total_return_pct: 20, cagr_pct: null, max_drawdown_pct: 10 });
    });

    it("exposure and drawdown duration", () => {
        // in on 01-02, out at 01-04's open (signal on 01-03's close)
        const c = series([[100, 100, 100, 100], [100, 100, 100, 90], [90, 90, 90, 95], [95, 95, 95, 95], [95, 95, 95, 95]]);
        const m = run(c, { exit: { when: { all: [{ left: { field: "close" }, op: ">", right: 92 }] } } }).metrics;
        expect(m.exposure_pct).toBe(40); // 2 of 5 closes
        expect(m.max_drawdown_duration_bars).toBe(4); // never recovers the 01-01 peak
        expect(m.max_drawdown_duration_days).toBe(4);
        expect(m.expectancy).toBe(-50);
    });

    it("Sortino is null without a single down bar; Sharpe honours the risk-free rate", () => {
        const up = series([[100, 100, 100, 100], [100, 101, 100, 101], [101, 102, 101, 102], [102, 103, 102, 103], [103, 104, 103, 104]]);
        const zero = run(up, { sizing: { mode: "pct_equity", value: 100 } }).metrics;
        expect(zero.sortino).toBeNull();
        const rf = run(up, { sizing: { mode: "pct_equity", value: 100 }, report: { risk_free_pct: 20 } }).metrics;
        expect(rf.risk_free_pct).toBe(20);
        expect(rf.sharpe).toBeLessThan(zero.sharpe);
    });
});

describe("indicator references", () => {
    const c = [
        bar("2024-01-01T09:15:00", 10, 12, 9, 11, 100),
        bar("2024-01-01T09:30:00", 11, 13, 10, 12, 200),
        bar("2024-01-01T09:45:00", 12, 14, 11, 13, 100),
        bar("2024-01-02T09:15:00", 13, 15, 12, 14, 100),
        bar("2024-01-02T09:30:00", 14, 16, 8, 9, 300),
    ];
    const closes = c.map((x) => x.close);

    it("WMA(3) of 11, 12, 13 = (11 + 24 + 39) / 6", () => {
        expect(wma(closes, 3)[2]).toBeCloseTo(74 / 6, 12);
        expect(Number.isNaN(wma(closes, 3)[1])).toBe(true);
    });

    it("Donchian(2) uses the previous two bars only", () => {
        const [upper, lower, middle] = donchian(c, 2);
        expect([upper[2], lower[2], middle[2]]).toEqual([13, 9, 11]);
        expect(Number.isNaN(upper[1])).toBe(true);
    });

    it("prior-day high/low switch at the first bar of the next session", () => {
        const [hi, lo] = priorDay(c);
        expect(hi.slice(0, 3).every(Number.isNaN)).toBe(true);
        expect([hi[3], lo[3], hi[4], lo[4]]).toEqual([14, 9, 14, 9]);
    });

    it("opening range (30 min) is defined from the first bar after it closes", () => {
        const [hi, lo] = openingRange(c, 30);
        expect(Number.isNaN(hi[0]) && Number.isNaN(hi[1])).toBe(true);
        expect([hi[2], lo[2]]).toEqual([13, 9]);
        expect(Number.isNaN(hi[3])).toBe(true); // new session, range forming again
    });

    it("VWAP resets every session", () => {
        const v = vwap(c);
        expect(v[0]).toBeCloseTo((12 + 9 + 11) / 3, 12);
        expect(v[3]).toBeCloseTo((15 + 12 + 14) / 3, 12); // day 2 starts fresh
    });

    it("MACD histogram = line − signal; %D = 3-bar mean of %K; ADX stays within 0–100", () => {
        const s = generateSampleCandles("1d", "2023-01-01", "2024-01-01");
        const sc = s.map((x) => x.close);
        const [line, signal, hist] = macd(sc);
        expect(hist[100]).toBeCloseTo(line[100] - signal[100], 12);
        const k = stochK(s, 14);
        expect(stochD(s, 14, 3)[50]).toBeCloseTo((k[48] + k[49] + k[50]) / 3, 12);
        const a = adx(s, 14).filter((x) => !Number.isNaN(x));
        expect(a.length).toBeGreaterThan(200);
        expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...a)).toBeLessThanOrEqual(100);
    });

    it("ADX is high in a steady trend", () => {
        const trend = Array.from({ length: 60 }, (_, i) => bar(days(60)[i], 100 + i, 101 + i, 99.5 + i, 100.5 + i));
        expect(adx(trend, 14)[59]).toBeGreaterThan(90);
    });
});

describe("regression snapshot", () => {
    const daily = generateSampleCandles("1d", "2021-01-01", "2025-12-31");
    const intraday = generateSampleCandles("15m", "2025-01-06", "2025-02-28");
    const rsi = (b: number, a: number) => ({
        entry: { when: { all: [{ left: { ind: "RSI" as const }, op: "<" as const, right: b }] } },
        exit: { when: { any: [{ left: { ind: "RSI" as const }, op: ">" as const, right: a }] } },
    });
    const cross = (ind: "EMA" | "SMA" | "WMA", f: number, s: number) => ({
        entry: { when: { all: [{ left: { ind, len: f }, op: "crosses_above" as const, right: { ind, len: s } }] } },
        exit: { when: { all: [{ left: { ind, len: f }, op: "crosses_below" as const, right: { ind, len: s } }] } },
    });
    const CASES: [string, Partial<SpecInput>, "1d" | "15m"][] = [
        ["rsi 30/70 pct stop", { ...rsi(30, 70), exit: { ...rsi(30, 70).exit, stop_loss: { type: "pct", value: 2 } } }, "1d"],
        ["rsi 25/75 risk sizing", { ...rsi(25, 75), exit: { ...rsi(25, 75).exit, stop_loss: { type: "atr", value: 2 } }, sizing: { mode: "risk_pct", value: 1 } }, "1d"],
        ["ema 20/50", cross("EMA", 20, 50), "1d"],
        ["sma 50/200", cross("SMA", 50, 200), "1d"],
        ["wma 10/30 trailing atr", { ...cross("WMA", 10, 30), exit: { ...cross("WMA", 10, 30).exit, trailing_stop: { type: "atr", value: 3 } } }, "1d"],
        ["macd zero cross", { entry: { when: { all: [{ left: { ind: "MACD" }, op: "crosses_above", right: 0 }] } }, exit: { when: { all: [{ left: { ind: "MACD" }, op: "crosses_below", right: 0 }] } } }, "1d"],
        ["macd signal cross", { entry: { when: { all: [{ left: { ind: "MACD" }, op: "crosses_above", right: { ind: "MACD", line: "signal" } }] } }, exit: { time_exit: { bars: 10 } } }, "1d"],
        ["bollinger reversion", { entry: { when: { all: [{ left: { field: "close" }, op: "<", right: { ind: "BB", line: "lower" } }] } }, exit: { when: { all: [{ left: { field: "close" }, op: ">", right: { ind: "BB", line: "middle" } }] } } }, "1d"],
        ["donchian breakout", { entry: { when: { all: [{ left: { field: "close" }, op: ">", right: { ind: "DONCHIAN", len: 20, line: "upper" } }] } }, exit: { when: { all: [{ left: { field: "close" }, op: "<", right: { ind: "DONCHIAN", len: 10, line: "lower" } }] } } }, "1d"],
        ["supertrend", { entry: { when: { all: [{ left: { field: "close" }, op: "crosses_above", right: { ind: "SUPERTREND" } }] } }, exit: { when: { all: [{ left: { field: "close" }, op: "crosses_below", right: { ind: "SUPERTREND" } }] } } }, "1d"],
        ["adx filter + ema", { entry: { when: { all: [{ left: { ind: "ADX" }, op: ">", right: 20 }, { left: { field: "close" }, op: ">", right: { ind: "EMA", len: 50 } }] } }, exit: { stop_loss: { type: "pct", value: 3 }, target: { type: "pct", value: 6 } } }, "1d"],
        ["stoch k/d", { entry: { when: { all: [{ left: { ind: "STOCH" }, op: "crosses_above", right: { ind: "STOCH", line: "d" } }, { left: { ind: "STOCH" }, op: "<", right: 30 }] } }, exit: { when: { any: [{ left: { ind: "STOCH" }, op: ">", right: 80 }] } } }, "1d"],
        ["rsi between + rising", { entry: { when: { all: [{ left: { ind: "RSI" }, op: "between", low: 45, high: 55 }, { left: { field: "close" }, op: "rising", bars: 3 }] } }, exit: { time_exit: { bars: 5 }, stop_loss: { type: "points", value: 3 } } }, "1d"],
        ["short rsi", { entry: { side: "short", when: { all: [{ left: { ind: "RSI" }, op: ">", right: 70 }] } }, exit: { when: { all: [{ left: { ind: "RSI" }, op: "<", right: 50 }] }, stop_loss: { type: "pct", value: 3 } } }, "1d"],
        ["bar_close fills", { ...cross("EMA", 10, 30), execution: { fill: "bar_close" } }, "1d"],
        ["fixed amount, no costs", { ...cross("EMA", 10, 30), sizing: { mode: "fixed_amount", value: 40000 }, costs: { profile: null, slippage_bps: 0 } }, "1d"],
        ["orb intraday", { entry: { when: { all: [{ left: { field: "close" }, op: "crosses_above", right: { ind: "ORH", minutes: 30 } }] } }, exit: { stop_loss: { type: "pct", value: 0.5 } } }, "15m"],
        ["vwap intraday short", { entry: { side: "short", when: { all: [{ left: { field: "close" }, op: "crosses_below", right: { ind: "VWAP" } }] } }, exit: { when: { all: [{ left: { field: "close" }, op: "crosses_above", right: { ind: "VWAP" } }] } } }, "15m"],
        ["pdh breakout intraday", { entry: { when: { all: [{ left: { field: "close" }, op: ">", right: { ind: "PDH" } }] } }, exit: { trailing_stop: { type: "pct", value: 0.7 } }, sizing: { mode: "pct_equity", value: 200 } }, "15m"],
        ["rsi 15m with leverage cap", { ...rsi(30, 60), sizing: { mode: "pct_equity", value: 300, max_leverage: 3 } }, "15m"],
    ];

    it.each(CASES)("%s", (_name, over, tf) => {
        const candles = tf === "1d" ? daily : intraday;
        const s = spec(candles, {
            instrument: { id: "NSE:SAMPLE", timeframe: tf },
            sizing: { mode: "pct_equity", value: 50 },
            costs: { profile: "zerodha", slippage_bps: 5 },
            ...over,
        });
        const r = runSpec(s, candles);
        const t = r.trades;
        expect({
            engine_version: ENGINE_VERSION,
            spec_hash: r.assumptions.spec_hash,
            metrics: r.metrics,
            trades: t.length,
            first: t[0] ?? null,
            last: t[t.length - 1] ?? null,
            reasons: [...new Set(t.map((x) => x.reason))].sort(),
            warnings: r.warnings,
        }).toMatchSnapshot();
    });
});
