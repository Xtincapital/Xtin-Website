import { describe, it, expect } from "vitest";
import { runBacktest, BacktestInputError, ENGINE_VERSION } from "./engine.js";
import { fillCharges } from "./costs.js";
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

// No charges or slippage, so prices and P&L can be checked by hand.
const frictionless = { costs: { profile: null, slippage_bps: 0 } } as const;
const closeIs = (value: number) => ({ conditions: [{ left: { kind: "field" as const, field: "close" }, op: "==" as const, right: { kind: "value" as const, value } }] });

describe("runBacktest", () => {
    it("returns the full result shape with consistent metrics", () => {
        const result = runBacktest(rsiDef(), sample(), 100_000);
        expect(Object.keys(result).sort()).toEqual(["assumptions", "equity_curve", "metrics", "trades", "warnings"]);
        const m = result.metrics;
        expect(m.starting_capital).toBe(100_000);
        expect(m.num_trades).toBe(result.trades.length);
        expect(m.wins + m.losses).toBeLessThanOrEqual(m.num_trades);
        expect(m.final_equity).toBeCloseTo(100_000 + m.total_pnl, 2);
        expect(result.equity_curve).toHaveLength(sample().length);
        expect(result.assumptions).toMatchObject({ engine_version: ENGINE_VERSION, fill: "next_bar_open", product: "CNC", cost_profile: "zerodha", slippage_bps: 5, reentry_cooldown_bars: 1 });
    });

    it("throws a user-facing error on too few candles", () => {
        expect(() => runBacktest(rsiDef(), [bar("2024-01-01", 1, 1, 1, 1)], 100_000)).toThrow(BacktestInputError);
    });

    it("fills a signal at the NEXT bar's open, never on the signal bar", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 103, 104, 102, 103), bar("2024-01-03", 103, 103, 103, 103)];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 1 }, exit: { conditions: [] }, risk: {} };
        const { trades } = runBacktest(def, candles, 1000);
        expect(trades[0]).toMatchObject({ entry_time: "2024-01-02", entry_price: 103 });
    });

    it("can still fill on the signal bar's close when asked", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 103, 104, 102, 103)];
        const def: StrategyDefinition = { ...frictionless, execution: { fill: "bar_close" }, instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 1 }, exit: { conditions: [] }, risk: {} };
        expect(runBacktest(def, candles, 1000).trades[0]).toMatchObject({ entry_time: "2024-01-01", entry_price: 100 });
    });

    it("checks the stop before the target when one bar touches both", () => {
        const candles = [
            bar("2024-01-01", 100, 100, 100, 100),
            bar("2024-01-02", 100, 100, 100, 100.5), // fills at this open
            bar("2024-01-03", 100, 105, 97, 101), // low breaches the 2% stop AND high reaches the 4% target
            bar("2024-01-04", 101, 101, 101, 101),
        ];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 10 }, exit: { conditions: [] }, risk: { stop_loss_pct: 2, target_pct: 4 } };
        expect(runBacktest(def, candles, 100_000).trades[0]).toMatchObject({ reason: "stop_loss", exit_price: 98, pnl: -20, qty: 10 });
    });

    it("fills a stop the open gapped through at the open, not at the stop price", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 100, 101, 99.5, 100.5), bar("2024-01-03", 90, 92, 89, 91), bar("2024-01-04", 91, 91, 91, 91)];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 10 }, exit: { conditions: [] }, risk: { stop_loss_pct: 2 } };
        expect(runBacktest(def, candles, 100_000).trades[0]).toMatchObject({ reason: "stop_loss", exit_time: "2024-01-03", exit_price: 90, pnl: -100 });
    });

    it("mirrors the stop/target for shorts", () => {
        const candles = [bar("2024-01-01T09:15:00", 100, 100, 100, 100), bar("2024-01-01T09:20:00", 100, 100, 95, 96), bar("2024-01-01T09:25:00", 96, 96, 96, 96)];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "5m" }, entry: closeIs(100), entry_action: { side: "SELL", qty: 1 }, exit: { conditions: [] }, risk: { target_pct: 4, square_off_time: "15:15" } };
        const { trades, assumptions } = runBacktest(def, candles, 1000);
        expect(assumptions.product).toBe("MIS");
        expect(trades[0]).toMatchObject({ side: "SELL", reason: "target", exit_price: 96, pnl: 4 });
    });

    it("squares off intraday positions at the open of the cut-off bar and takes no new entries after it", () => {
        const candles = [
            bar("2024-01-01T15:00:00", 100, 100, 100, 100),
            bar("2024-01-01T15:05:00", 101, 101, 101, 101),
            bar("2024-01-01T15:15:00", 102, 102, 102, 100),
            bar("2024-01-01T15:20:00", 100, 100, 100, 100),
            bar("2024-01-01T15:25:00", 103, 103, 103, 103),
        ];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "5m" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 1 }, exit: { conditions: [] }, risk: { square_off_time: "15:15" } };
        const { trades } = runBacktest(def, candles, 1000);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ reason: "square_off", entry_price: 101, exit_time: "2024-01-01T15:15:00", exit_price: 102 });
    });

    it("force-closes an open position on the last bar", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 100, 101, 100, 101), bar("2024-01-03", 101, 102, 101, 102)];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 1 }, exit: { conditions: [] }, risk: {} };
        const { trades, equity_curve, metrics } = runBacktest(def, candles, 1000);
        expect(trades[0]).toMatchObject({ reason: "end_of_data", entry_price: 100, exit_price: 102, pnl: 2 });
        expect(equity_curve[equity_curve.length - 1].equity).toBe(1002);
        expect(metrics.final_equity).toBe(1002);
    });

    it("detects crossovers only on the bar where the cross happens", () => {
        const closes = [10, 9, 8, 9, 11, 12, 11, 9, 9];
        const candles = closes.map((c, i) => bar(`2024-01-0${i + 1}`, c, c, c, c));
        const def: StrategyDefinition = {
            ...frictionless,
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field", field: "close" }, op: "crosses_above", right: { kind: "value", value: 10 } }] },
            entry_action: { side: "BUY", qty: 1 },
            exit: { conditions: [{ left: { kind: "field", field: "close" }, op: "crosses_below", right: { kind: "value", value: 10 } }] },
            risk: {},
        };
        const { trades } = runBacktest(def, candles, 1000);
        expect(trades).toHaveLength(1);
        // cross above on bar 5 (close 11) → fill at bar 6's open; cross below on bar 8 → fill at bar 9's open
        expect(trades[0]).toMatchObject({ entry_price: 12, exit_price: 9, reason: "signal" });
    });

    it("ignores entry signals on the bar of an exit (one-bar cooldown)", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 100, 100, 97, 100), bar("2024-01-03", 100, 100, 100, 100), bar("2024-01-04", 100, 100, 100, 100)];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 1 }, exit: { conditions: [] }, risk: { stop_loss_pct: 2 } };
        const { trades } = runBacktest(def, candles, 1000);
        // stopped out on 01-02; the close==100 signal that day is ignored, the next one (01-03) fills on 01-04
        expect(trades.map((t) => [t.entry_time, t.reason])).toEqual([
            ["2024-01-02", "stop_loss"],
            ["2024-01-04", "end_of_data"],
        ]);
    });

    it("rejects an operand the spec can't express with a user-facing error", () => {
        const def: StrategyDefinition = {
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field", field: "time" }, op: ">", right: { kind: "value", value: "09:30" } }] },
            entry_action: { side: "BUY", qty: 1 },
            exit: { conditions: [] },
            risk: {},
        };
        expect(() => runBacktest(def, sample(), 1000)).toThrow(BacktestInputError);
    });
});

describe("sizing and buying power", () => {
    const always = { conditions: [{ left: { kind: "field" as const, field: "close" }, op: ">" as const, right: { kind: "value" as const, value: 0 } }] };

    it("sizes pct_equity at each trade's own fill price", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 100, 100, 100, 100), bar("2024-01-03", 200, 200, 200, 200), bar("2024-01-04", 200, 200, 200, 200)];
        const def: StrategyDefinition = {
            ...frictionless,
            instrument: { timeframe: "1d" },
            entry: always,
            entry_action: { side: "BUY", qty: 999 }, // ignored: the sizing rule wins
            exit: always,
            execution: { reentry_cooldown_bars: 0 },
            sizing: { mode: "pct_equity", value: 50 },
            risk: {},
        };
        const { trades } = runBacktest(def, candles, 10_000);
        expect(trades[0]).toMatchObject({ entry_price: 100, qty: 50 }); // 50% of ₹10,000 at ₹100
        // the first trade made ₹5,000, so the second is 50% of ₹15,000 at ₹200 — re-sized, not carried over
        expect(trades[1]).toMatchObject({ entry_price: 200, qty: 37 });
    });

    it("caps a delivery position to the cash in the account and says so", () => {
        const candles = [bar("2024-01-01", 100, 100, 100, 100), bar("2024-01-02", 100, 100, 100, 100), bar("2024-01-03", 100, 100, 100, 100)];
        const def: StrategyDefinition = { instrument: { timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY", qty: 503 }, exit: { conditions: [] }, risk: {} };
        const { trades, warnings } = runBacktest(def, candles, 10_000);
        expect(trades[0].qty).toBeLessThan(100); // ₹10,000 of cash buys under 100 shares once charges are paid
        expect(trades[0].qty * trades[0].entry_price).toBeLessThanOrEqual(10_000);
        expect(warnings.join(" ")).toMatch(/capped on 1 trade to the cash in the account/);
    });

    it("skips an entry it can't afford instead of buying a fraction", () => {
        const candles = [bar("2024-01-01", 5000, 5000, 5000, 5000), bar("2024-01-02", 5000, 5000, 5000, 5000), bar("2024-01-03", 5000, 5000, 5000, 5000)];
        const def: StrategyDefinition = { ...frictionless, instrument: { timeframe: "1d" }, entry: closeIs(5000), entry_action: { side: "BUY" }, sizing: { mode: "fixed_amount", value: 1000 }, exit: { conditions: [] }, risk: {} };
        const { trades, warnings } = runBacktest(def, candles, 100_000);
        expect(trades).toHaveLength(0);
        expect(warnings.join(" ")).toMatch(/skipped/);
    });

    it("liquidates and stops the run when equity reaches zero", () => {
        // A leveraged intraday short into a 30% rally.
        const candles = [
            bar("2024-01-01T09:15:00", 100, 100, 100, 100),
            bar("2024-01-01T09:20:00", 100, 100, 100, 100),
            bar("2024-01-01T09:25:00", 100, 130, 100, 130),
            bar("2024-01-01T09:30:00", 130, 130, 130, 130),
        ];
        const def: StrategyDefinition = {
            ...frictionless,
            instrument: { timeframe: "5m" },
            entry: closeIs(100),
            entry_action: { side: "SELL" },
            sizing: { mode: "pct_equity", value: 500 },
            exit: { conditions: [] },
            risk: { square_off_time: "15:15" },
        };
        const { trades, metrics, equity_curve, warnings } = runBacktest(def, candles, 10_000);
        expect(trades.at(-1)!.reason).toBe("liquidated");
        expect(metrics.wiped_out).toBe(true);
        expect(equity_curve).toHaveLength(candles.length);
        expect(warnings.join(" ")).toMatch(/wiped out/);
    });
});

describe("costs", () => {
    it("charges Zerodha delivery costs and slippage on both fills", () => {
        const candles = [bar("2026-05-04", 100, 100, 100, 100), bar("2026-05-05", 100, 100, 100, 100), bar("2026-05-06", 110, 110, 110, 110)];
        const def: StrategyDefinition = { instrument: { exchange: "NSE", timeframe: "1d" }, entry: closeIs(100), entry_action: { side: "BUY" }, sizing: { mode: "fixed_qty", value: 100 }, exit: { conditions: [] }, risk: {} };
        const { trades, metrics } = runBacktest(def, candles, 100_000);
        const t = trades[0];
        expect(t.entry_price).toBe(100.05); // +5 bps
        expect(t.exit_price).toBe(109.95); // −5 bps (₹109.945, shown to the paisa)
        // buy ₹10,005: STT ₹10 + exchange ₹0.3072 + SEBI ₹0.0100 + stamp ₹1.5008 + GST ₹0.0571
        // sell ₹10,995: STT ₹11 + exchange ₹0.3375 + SEBI ₹0.0110 + GST ₹0.0627 + DP ₹15.34
        expect(t.costs).toBeCloseTo(11.87 + 26.75, 2);
        expect(t.gross_pnl).toBe(989.5); // (109.945 − 100.05) × 100
        expect(t.pnl).toBeCloseTo(989.5 - t.costs, 2);
        expect(metrics.total_costs).toBe(t.costs);
    });

    it("computes intraday brokerage capped at ₹20 and sell-side STT", () => {
        // ₹1,00,000 turnover: brokerage min(₹30, ₹20) + exchange ₹3.07 + SEBI ₹0.10 + GST 18% of those (₹4.17)
        expect(fillCharges("zerodha", "MIS", true, 1000, 100, "2026-05-04")).toBe(30.34); // + stamp ₹3
        expect(fillCharges("zerodha", "MIS", false, 1000, 100, "2026-05-04")).toBe(52.34); // + STT ₹25
    });

    it("charges each fill with the schedule in force on its date", () => {
        // NSE transaction charge on ₹1 crore: 0.00322% → ₹322, 0.00297% → ₹297, 0.00307% → ₹307 (+18% GST, + SEBI ₹10 and its GST, + STT ₹10,000, no stamp on a sell)
        const sell = (date: string) => fillCharges("zerodha", "CNC", false, 1_00_00_000, 1, date) - 15.34 - 10_000 - 11.8;
        expect(sell("2024-09-30")).toBeCloseTo(322 * 1.18, 2);
        expect(sell("2024-10-01")).toBeCloseTo(297 * 1.18, 2);
        expect(sell("2026-10-21")).toBeCloseTo(307 * 1.18, 2);
    });

    it("runs before costs, and says so, outside Indian exchanges", () => {
        const def = { ...rsiDef(), instrument: { symbol: "AAPL", exchange: "NASDAQ", timeframe: "1d" } };
        const result = runBacktest(def, sample(), 100_000);
        expect(result.assumptions.cost_profile).toBeNull();
        expect(result.metrics.total_costs).toBe(0);
        expect(result.warnings.join(" ")).toMatch(/before costs/);
    });
});

describe("engine invariants", () => {
    const defs: StrategyDefinition[] = [
        rsiDef(),
        { ...rsiDef({ trailing_sl_pct: 3 }), sizing: { mode: "pct_equity", value: 90 } },
        {
            instrument: { timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "indicator", indicator: "EMA", period: 10 }, op: "crosses_above", right: { kind: "indicator", indicator: "EMA", period: 30 } }] },
            entry_action: { side: "BUY" },
            exit: { conditions: [{ left: { kind: "indicator", indicator: "EMA", period: 10 }, op: "crosses_below", right: { kind: "indicator", indicator: "EMA", period: 30 } }] },
            sizing: { mode: "fixed_qty", value: 5000 },
            risk: { stop_loss_pct: 1.5, target_pct: 6 },
        },
    ];
    const candles = sample("1d", "2021-01-01", "2024-12-31");

    it.each(defs.map((d, i) => [i, d] as const))("strategy %i: no fill outside its bar, no delivery exposure above equity, no negative equity", (_i, def) => {
        const zeroSlip = { ...def, costs: { profile: "zerodha", slippage_bps: 0 } };
        const { trades, equity_curve } = runBacktest(zeroSlip, candles, 100_000);
        const byTime = new Map(candles.map((c) => [c.time, c]));
        let equity = 100_000;
        for (const t of trades) {
            const inBar = (time: string, price: number) => {
                const c = byTime.get(time)!;
                return price >= c.low - 0.01 && price <= c.high + 0.01;
            };
            expect(inBar(t.entry_time, t.entry_price)).toBe(true);
            expect(inBar(t.exit_time, t.exit_price)).toBe(true);
            expect(t.qty * t.entry_price).toBeLessThanOrEqual(equity + 0.01);
            equity += t.pnl;
        }
        expect(Math.min(...equity_curve.map((p) => p.equity))).toBeGreaterThan(0);
    });

    it("never looks ahead: changing bars after t doesn't change any trade closed before t", () => {
        const cut = Math.floor(candles.length * 0.6);
        const altered = candles.map((c, i) => (i <= cut ? c : { ...c, open: c.open * 1.3, high: c.high * 1.3, low: c.low * 1.3, close: c.close * 1.3 }));
        for (const def of defs) {
            const before = (r: ReturnType<typeof runBacktest>) => r.trades.filter((t) => t.exit_time < candles[cut].time);
            expect(before(runBacktest(def, altered, 100_000))).toEqual(before(runBacktest(def, candles, 100_000)));
        }
    });

    it("is deterministic: the same inputs give identical output", () => {
        for (const def of defs) expect(JSON.stringify(runBacktest(def, candles, 100_000))).toBe(JSON.stringify(runBacktest(def, candles, 100_000)));
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
