import { describe, it, expect } from "vitest";
import { canonicalJson, definitionToSpec, normaliseSpec, specJsonSchema, summariseSpec, type Spec, type SpecInput } from "./spec.js";
import { parseStrategy } from "./parser.js";

const today = new Date("2026-10-15T12:00:00Z");

// The example from the build plan, verbatim.
const PLAN_EXAMPLE = {
    spec_version: "1.0",
    name: "RSI mean reversion",
    instrument: { id: "NSE:RELIANCE", segment: "EQ", timeframe: "1d" },
    period: { from: "2023-10-16", to: "2026-10-14" },
    capital: { initial: 100000, currency: "INR" },
    entry: { side: "long", when: { all: [{ left: { ind: "RSI", len: 14 }, op: "<", right: 30 }] } },
    exit: {
        when: { any: [{ left: { ind: "RSI", len: 14 }, op: ">", right: 70 }] },
        stop_loss: { type: "pct", value: 2 },
        target: null,
        trailing_stop: null,
        time_exit: null,
    },
    sizing: { mode: "pct_equity", value: 50, max_leverage: 1 },
    execution: { fill: "next_bar_open", product: "CNC", reentry_cooldown_bars: 1 },
    costs: { profile: "zerodha", slippage_bps: 5 },
    data: { source: "auto", adjust: "splits_bonus", lag_days: 0 },
};

const ok = (input: unknown) => {
    const r = normaliseSpec(input, { today });
    if ("errors" in r) throw new Error(r.errors.join("; "));
    return r;
};
const errorsOf = (input: unknown) => {
    const r = normaliseSpec(input, { today });
    return "errors" in r ? r.errors : [];
};
const minimal = (over: Partial<SpecInput> = {}): SpecInput => ({
    instrument: { id: "NSE:INFY" },
    entry: { when: { all: [{ left: { ind: "EMA", len: 20 }, op: "crosses_above", right: { ind: "EMA", len: 50 } }] } },
    ...over,
});

describe("normaliseSpec", () => {
    it("accepts the build plan's example spec unchanged in meaning", () => {
        const { spec, warnings } = ok(PLAN_EXAMPLE);
        expect(spec.instrument).toEqual({ id: "NSE:RELIANCE", segment: "EQ", timeframe: "1d" });
        expect(spec.exit.stop_loss).toEqual({ type: "pct", value: 2 });
        expect(spec.sizing).toEqual({ mode: "pct_equity", value: 50, max_leverage: 1 });
        expect(warnings).toEqual([]);
    });

    it("writes every default the engine applies back into the spec", () => {
        const { spec } = ok(minimal());
        expect(spec).toMatchObject({
            spec_version: "1.0",
            instrument: { id: "NSE:INFY", segment: "EQ", timeframe: "1d" },
            period: { from: "2023-10-16", to: "2026-10-15" },
            capital: { initial: 100000, currency: "INR" },
            entry: { side: "long" },
            exit: { when: null, stop_loss: null, target: null, trailing_stop: null, time_exit: null },
            sizing: { mode: "pct_equity", value: 50, max_leverage: 1 },
            execution: { fill: "next_bar_open", product: "CNC", reentry_cooldown_bars: 1, square_off: null },
            costs: { profile: "zerodha", slippage_bps: 5 },
            data: { source: "auto", adjust: "splits_bonus", lag_days: 0 },
            report: { risk_free_pct: 0, benchmark: "buy_hold" },
        });
    });

    it("fills indicator defaults so equivalent specs look identical", () => {
        const a = ok(minimal({ entry: { when: { all: [{ left: { ind: "MACD" }, op: "crosses_above", right: 0 }] } } }));
        const b = ok(minimal({ entry: { when: { all: [{ left: { ind: "MACD", fast: 12, slow: 26, signal: 9, line: "macd" }, op: "crosses_above", right: 0 }] } } }));
        expect(a.spec.entry.when).toEqual(b.spec.entry.when);
        expect(a.hash).toBe(b.hash);
    });

    it("defaults intraday specs to MIS with a 15:15 square-off and 5× buying power", () => {
        const { spec } = ok(minimal({ instrument: { id: "NSE:INFY", timeframe: "15m" } }));
        expect(spec.execution).toMatchObject({ product: "MIS", square_off: "15:15" });
        expect(spec.sizing.max_leverage).toBe(5);
    });

    it("hashes the spec, not its display name, and changes the hash for any rule change", () => {
        const a = ok(PLAN_EXAMPLE);
        const renamed = ok({ ...PLAN_EXAMPLE, name: "Something else" });
        const tighter = ok({ ...PLAN_EXAMPLE, exit: { ...PLAN_EXAMPLE.exit, stop_loss: { type: "pct", value: 1 } } });
        expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
        expect(renamed.hash).toBe(a.hash);
        expect(tighter.hash).not.toBe(a.hash);
    });

    it("is stable: key order doesn't change the hash", () => {
        const reverseKeys = (v: unknown): unknown =>
            Array.isArray(v) ? v.map(reverseKeys) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).reverse().map(([k, x]) => [k, reverseKeys(x)])) : v;
        const reordered = reverseKeys(PLAN_EXAMPLE);
        expect(ok(reordered).hash).toBe(ok(PLAN_EXAMPLE).hash);
        expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
    });

    it("labels indices, synthetic data, delivery shorts and non-Indian costs", () => {
        expect(ok(minimal({ instrument: { id: "NSE:NIFTY" } })).spec.instrument.segment).toBe("INDEX");
        const sample = ok(minimal({ instrument: { id: "NSE:SAMPLE" } }));
        expect(sample.spec).toMatchObject({ instrument: { segment: "SYNTHETIC" }, data: { source: "synthetic" } });
        expect(ok(minimal({ entry: { side: "short", when: minimal().entry.when } })).warnings.join(" ")).toMatch(/Delivery \(CNC\) shorts/);
        const us = ok(minimal({ instrument: { id: "NASDAQ:AAPL" } }));
        expect(us.spec.costs.profile).toBeNull();
        expect(us.warnings.join(" ")).toMatch(/before costs/);
    });

    it.each([
        ["an unknown indicator parameter", minimal({ entry: { when: { all: [{ left: { ind: "RSI", len: 14, mult: 2 } as never, op: "<", right: 30 }] } } }), /entry\.when\.all\.0\.left: unknown key "mult"/],
        ["a bad instrument id", minimal({ instrument: { id: "RELIANCE" } }), /NSE:RELIANCE/],
        ["no entry rule", minimal({ entry: { when: { all: [] } } }), /at least one entry condition/],
        ["between without bounds", minimal({ entry: { when: { all: [{ left: { ind: "RSI" }, op: "between", right: 30 }] } } }), /needs low and high/],
        ["a comparison with no right side", minimal({ entry: { when: { all: [{ left: { ind: "RSI" }, op: "<" }] } } }), /needs a right side/],
        ["VWAP on daily candles", minimal({ entry: { when: { all: [{ left: { field: "close" }, op: ">", right: { ind: "VWAP" } }] } } }), /VWAP needs intraday/],
        ["risk sizing without a stop", minimal({ sizing: { mode: "risk_pct", value: 1 } }), /needs exit.stop_loss/],
        ["more than 100% of equity on delivery", minimal({ sizing: { mode: "pct_equity", value: 150 } }), /buying power/],
        ["MIS on daily candles", minimal({ execution: { product: "MIS" } }), /needs an intraday timeframe/],
        ["a backwards period", minimal({ period: { from: "2025-01-01", to: "2024-01-01" } }), /before 'from'/],
        ["MACD fast ≥ slow", minimal({ entry: { when: { all: [{ left: { ind: "MACD", fast: 30, slow: 20 }, op: ">", right: 0 }] } } }), /fast must be shorter/],
        ["a points stop with an ATR length", minimal({ exit: { stop_loss: { type: "points", value: 5, len: 14 } } }), /len only applies/],
    ])("rejects %s with a readable message", (_label, input, pattern) => {
        expect(errorsOf(input).join(" ")).toMatch(pattern);
    });

    it("caps max_leverage at what the product allows, and says so", () => {
        const r = ok(minimal({ sizing: { mode: "pct_equity", value: 50, max_leverage: 4 } }));
        expect(r.spec.sizing.max_leverage).toBe(1);
        expect(r.warnings.join(" ")).toMatch(/capped at 1×/);
    });
});

describe("summariseSpec", () => {
    it("describes the plan example in plain English", () => {
        expect(ok(PLAN_EXAMPLE).summary).toBe(
            "Long NSE:RELIANCE on daily candles, 2023-10-16 to 2026-10-14, with ₹1,00,000. Enter when RSI(14) < 30. Exit when RSI(14) > 70, or at a 2% stop-loss. " +
                "Size: 50% of equity per trade, sized at each fill price. Fills at the next bar's open, delivery (CNC), Zerodha charges + 5 bps slippage."
        );
    });

    it("covers nested groups, ATR levels, time exits and every new operator", () => {
        const { spec } = ok(
            minimal({
                instrument: { id: "NSE:TCS", timeframe: "15m" },
                entry: {
                    when: {
                        all: [
                            { left: { field: "close" }, op: "crosses_above", right: { ind: "ORH", minutes: 30 } },
                            { any: [{ left: { ind: "ADX" }, op: "rising", bars: 3 }, { left: { ind: "RSI" }, op: "between", low: 40, high: 60 }] },
                        ],
                    },
                },
                exit: { stop_loss: { type: "atr", value: 1.5 }, target: { type: "points", value: 25 }, time_exit: { bars: 10 } },
                sizing: { mode: "risk_pct", value: 1 },
            })
        );
        const s = summariseSpec(spec as Spec);
        expect(s).toContain("Enter when close crosses above opening-range high (30 min) and (ADX(14) has been rising for 3 bars or RSI(14) is between 40 and 60).");
        expect(s).toContain("Exit at a 1.5× ATR(14) stop-loss, or at a ₹25 target, or after 10 bars, or at the 15:15 square-off.");
        expect(s).toContain("risking 1% of equity per trade");
        expect(s).toContain("intraday (MIS)");
    });
});

describe("definitionToSpec", () => {
    it("converts a chat strategy into an equivalent spec", () => {
        const def = parseStrategy("buy RELIANCE when RSI drops below 30 and sell above 70, 2% stop").definition;
        const { spec } = ok(definitionToSpec(def, { from: "2024-01-01", to: "2024-12-31", capital: 200000, name: "RSI" }));
        expect(spec).toMatchObject({
            instrument: { id: "NSE:RELIANCE", timeframe: "1d" },
            capital: { initial: 200000 },
            entry: { side: "long", when: { all: [{ left: { ind: "RSI", len: 14 }, op: "<", right: 30 }] } },
            exit: { when: { any: [{ left: { ind: "RSI", len: 14 }, op: ">", right: 70 }] }, stop_loss: { type: "pct", value: 2 } },
            sizing: { mode: "pct_equity", value: 50 },
        });
    });

    it("keeps a legacy fixed quantity and legacy indicator names", () => {
        const def = {
            instrument: { symbol: "INFY", exchange: "NSE", timeframe: "1d" },
            entry: { conditions: [{ left: { kind: "field" as const, field: "close" }, op: ">" as const, right: { kind: "indicator" as const, indicator: "BB_UPPER", period: 20 } }] },
            entry_action: { side: "BUY" as const, qty: 7 },
            exit: { conditions: [] },
            risk: {},
        };
        const { spec } = ok(definitionToSpec(def, { from: "2024-01-01", to: "2024-12-31", capital: 100000 }));
        expect(spec.sizing).toMatchObject({ mode: "fixed_qty", value: 7 });
        expect(spec.entry.when).toEqual({ all: [{ left: { field: "close" }, op: ">", right: { ind: "BB", len: 20, mult: 2, line: "upper" } }] });
        expect(spec.exit.when).toBeNull();
    });
});

describe("specJsonSchema", () => {
    it("publishes a JSON Schema with every indicator and operator", () => {
        const schema = JSON.stringify(specJsonSchema());
        for (const word of ["spec_version", "crosses_above", "between", "rising", "DONCHIAN", "risk_pct", "next_bar_open"]) expect(schema).toContain(word);
    });
});
