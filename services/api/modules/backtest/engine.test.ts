import { describe, it, expect } from "vitest";
import { runBacktest, BacktestInputError } from "./engine.js";
import { lotsForCapital, runOptionsBacktest, type OptionsSpec } from "./options.js";
import { generateSampleCandles } from "./synthetic.js";
import { computeIndicator, rsi, sma } from "./indicators.js";
import type { Candle, StrategyDefinition } from "./types.js";

const sample = (tf = "1d", start = "2023-01-01", end = "2024-01-01") => generateSampleCandles(tf, start, end);

const bar = (time: string, o: number, h: number, l: number, c: number): Candle => ({ time, open: o, high: h, low: l, close: c, volume: 1000 });

const rsiDef = (risk: StrategyDefinition["risk"] = { stop_loss_pct: 2, target_pct: 4 }): StrategyDefinition => ({
    instrument: { symbol: "SAMPLE", exchange: "NSE", timeframe: "1d" },
    entry: { match: "all", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: "<", right: { kind: "value", value: 30 } }] },
    entry_action: { side: "BUY", qty: 1, order_type: "MARKET" },
    exit: { match: "any", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: ">", right: { kind: "value", value: 70 } }] },
    risk,
});

describe("synthetic candles", () => {
    it("are deterministic for the same request and differ across requests", () => {
        expect(sample()).toEqual(sample());
        expect(sample("1d", "2023-01-01", "2024-01-01")).not.toEqual(sample("1d", "2023-01-01", "2024-02-01"));
        expect(sample().length).toBeGreaterThan(100);
    });

    it("skip weekends and keep high/low around open/close", () => {
        for (const c of sample()) {
            const dow = new Date(`${c.time.slice(0, 10)}T00:00:00Z`).getUTCDay();
            expect(dow).not.toBe(0);
            expect(dow).not.toBe(6);
            expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
            expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
        }
    });

    it("produce the expected number of intraday bars", () => {
        // 2024-01-01 is a Monday: Mon–Fri × 75 five-minute bars
        expect(generateSampleCandles("5m", "2024-01-01", "2024-01-07")).toHaveLength(5 * 75);
    });
});

describe("runBacktest", () => {
    it("returns the full result shape with consistent metrics", () => {
        const result = runBacktest(rsiDef(), sample(), 100_000);
        expect(Object.keys(result).sort()).toEqual(["equity_curve", "metrics", "trades"]);
        const m = result.metrics;
        expect(m.starting_capital).toBe(100_000);
        expect(m.num_trades).toBe(result.trades.length);
        expect(m.wins + m.losses).toBeLessThanOrEqual(m.num_trades);
        expect(m.final_equity).toBeCloseTo(100_000 + m.total_pnl, 2);
        expect(result.equity_curve).toHaveLength(sample().length);
    });

    it("throws a user-facing error on too few candles", () => {
        expect(() => runBacktest(rsiDef(), [bar("2024-01-01", 1, 1, 1, 1)], 100_000)).toThrow(BacktestInputError);
    });

    it("exits at the stop-loss and checks the stop before the target on the same bar", () => {
        const candles = [
            bar("2024-01-01T09:15:00", 100, 100, 100, 100),
            bar("2024-01-02T09:15:00", 100, 100, 100, 100),
            // wide bar: low breaches the 2% stop AND high reaches the 4% target
            bar("2024-01-03T09:15:00", 100, 105, 97, 101),
            bar("2024-01-04T09:15:00", 101, 101, 101, 101),
        ];
        const def: StrategyDefinition = {
            instrument: { timeframe: "1d" },
            entry: { match: "all", conditions: [{ left: { kind: "field", field: "close" }, op: "==", right: { kind: "value", value: 100 } }] },
            entry_action: { side: "BUY", qty: 10 },
            exit: { conditions: [] },
            risk: { stop_loss_pct: 2, target_pct: 4 },
        };
        const { trades } = runBacktest(def, candles, 100_000);
        expect(trades[0]).toMatchObject({ reason: "stop_loss", exit_price: 98, pnl: -20, qty: 10 });
    });

    it("mirrors the stop/target for shorts", () => {
        const candles = [
            bar("2024-01-01T09:15:00", 100, 100, 100, 100),
            bar("2024-01-02T09:15:00", 100, 100, 95, 96),
            bar("2024-01-03T09:15:00", 96, 96, 96, 96),
        ];
        const def: StrategyDefinition = {
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field", field: "close" }, op: "==", right: { kind: "value", value: 100 } }] },
            entry_action: { side: "SELL", qty: 1 },
            exit: { conditions: [] },
            risk: { target_pct: 4 },
        };
        const { trades } = runBacktest(def, candles, 1000);
        expect(trades[0]).toMatchObject({ side: "SELL", reason: "target", exit_price: 96, pnl: 4 });
    });

    it("squares off intraday positions at the configured clock time", () => {
        const candles = [
            bar("2024-01-01T15:00:00", 100, 100, 100, 100),
            bar("2024-01-01T15:05:00", 101, 101, 101, 101),
            bar("2024-01-01T15:15:00", 102, 102, 102, 102),
            bar("2024-01-01T15:20:00", 103, 103, 103, 103),
        ];
        const def: StrategyDefinition = {
            instrument: { timeframe: "5m" },
            entry: { conditions: [{ left: { kind: "field", field: "close" }, op: "==", right: { kind: "value", value: 100 } }] },
            entry_action: { side: "BUY", qty: 1 },
            exit: { conditions: [] },
            risk: { square_off_time: "15:15" },
        };
        const { trades } = runBacktest(def, candles, 1000);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ reason: "square_off", exit_time: "2024-01-01T15:15:00", exit_price: 102 });
    });

    it("force-closes an open position on the last bar", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 100, 101, 100, 101), bar("2024-01-03", 101, 102, 101, 102)];
        const def: StrategyDefinition = {
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field", field: "close" }, op: "==", right: { kind: "value", value: 100 } }] },
            entry_action: { side: "BUY", qty: 1 },
            exit: { conditions: [] },
            risk: {},
        };
        const { trades, equity_curve, metrics } = runBacktest(def, candles, 1000);
        expect(trades[0]).toMatchObject({ reason: "end_of_data", exit_price: 102, pnl: 2 });
        expect(equity_curve[equity_curve.length - 1].equity).toBe(1002);
        expect(metrics.final_equity).toBe(1002);
    });

    it("detects crossovers only on the bar where the cross happens", () => {
        const closes = [10, 9, 8, 9, 11, 12, 11, 9];
        const candles = closes.map((c, i) => bar(`2024-01-0${i + 1}`, c, c, c, c));
        const def: StrategyDefinition = {
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field", field: "close" }, op: "crosses_above", right: { kind: "value", value: 10 } }] },
            entry_action: { side: "BUY", qty: 1 },
            exit: { conditions: [{ left: { kind: "field", field: "close" }, op: "crosses_below", right: { kind: "value", value: 10 } }] },
            risk: {},
        };
        const { trades } = runBacktest(def, candles, 1000);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ entry_price: 11, exit_price: 9, reason: "signal" });
    });

    it("treats a non-numeric operand as 'condition not met' instead of crashing", () => {
        const def: StrategyDefinition = {
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field", field: "time" }, op: ">", right: { kind: "value", value: "09:30" } }] },
            entry_action: { side: "BUY", qty: 1 },
            exit: { conditions: [] },
            risk: {},
        };
        expect(runBacktest(def, sample(), 1000).trades).toHaveLength(0);
    });
});

describe("indicators", () => {
    it("SMA matches a hand calculation and is NaN during warm-up", () => {
        const s = sma([1, 2, 3, 4, 5], 3);
        expect(s.slice(0, 2).every(Number.isNaN)).toBe(true);
        expect(s.slice(2)).toEqual([2, 3, 4]);
    });

    it("RSI is 100 (not undefined) on an unbroken run-up", () => {
        const r = rsi([1, 2, 3, 4, 5, 6, 7, 8], 3);
        expect(r[r.length - 1]).toBe(100);
    });

    it("rejects unknown indicators", () => {
        expect(() => computeIndicator(sample(), "NOPE", 5)).toThrow(/Unknown indicator/);
    });

    it("computes every supported indicator without throwing", () => {
        const c = sample("1d", "2023-01-01", "2024-06-01");
        for (const name of ["SMA", "EMA", "RSI", "MACD", "BB_UPPER", "BB_LOWER", "ATR", "STOCH_K", "VWAP", "SUPERTREND"]) {
            expect(computeIndicator(c, name, 14)).toHaveLength(c.length);
        }
    });
});

describe("runOptionsBacktest", () => {
    const spec = (structure: OptionsSpec["structure"], over: Partial<OptionsSpec> = {}): OptionsSpec => ({
        structure,
        side: "SELL",
        symbol: "SAMPLE",
        exchange: "NSE",
        timeframe: "1d",
        stopMultiple: 0.2,
        ...over,
    });

    it.each(["straddle", "strangle", "iron_condor"] as const)("runs for %s, one trade per candle", (structure) => {
        const candles = sample();
        const { metrics } = runOptionsBacktest(spec(structure), candles, 100_000);
        expect(metrics.num_trades).toBe(candles.length);
        expect(metrics.starting_capital).toBe(100_000); // SAMPLE spot (~100) needs no margin bump
    });

    it("reports the margin-adjusted capital at real index scale", () => {
        const candles = [bar("2024-01-01", 24000, 24100, 23950, 24050), bar("2024-01-02", 24050, 24150, 24000, 24080)];
        const { metrics } = runOptionsBacktest(spec("straddle", { symbol: "NIFTY" }), candles, 100_000);
        expect(metrics.starting_capital).toBeGreaterThan(100_000);
    });

    it("caps a short structure's loss at stopMultiple × credit", () => {
        const candles = [bar("2024-01-01", 100, 130, 70, 130), bar("2024-01-02", 100, 100, 100, 100)];
        const { trades } = runOptionsBacktest(spec("straddle", { stopMultiple: 0.5 }), candles, 100_000);
        expect(trades[0].reason).toBe("stop_loss");
        expect(trades[0].pnl).toBeCloseTo(-0.5 * 100 * 0.009, 2);
    });

    it("throws a user-facing error on too few candles", () => {
        expect(() => runOptionsBacktest(spec("straddle"), [bar("x", 1, 1, 1, 1)])).toThrow(BacktestInputError);
    });

    it("sizes lots from capital by margin, never below one lot", () => {
        expect(lotsForCapital("SAMPLE", 100, 100_000, 0.5)).toBe(Math.floor(50_000 / 12));
        expect(lotsForCapital("NIFTY", 24_000, 100_000, 0.5)).toBe(1); // one lot needs ~₹1.44L of margin
        expect(lotsForCapital("NIFTY", 24_000, 1_000_000, 0.9)).toBe(6);
    });
});
