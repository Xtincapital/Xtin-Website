import { describe, it, expect } from "vitest";
import { applyModification, applyOptionsModification, classifyMessage, defaultWindow, looksLikeTrading, parseOptions, parseStrategy, personalize, sizingFor } from "./parser.js";

describe("parseStrategy", () => {
    it("detects RSI with thresholds and stop", () => {
        const p = parseStrategy("buy when RSI drops below 30 and sell above 70, 2% stop");
        expect(p.interpretation).toContain("RSI");
        const entry = p.definition.entry!.conditions![0];
        expect(entry.left).toMatchObject({ indicator: "RSI", period: 14 });
        expect(p.definition.risk!.stop_loss_pct).toBe(2);
    });

    it("detects MACD instead of falling into the generic MA-crossover branch", () => {
        const p = parseStrategy("short when MACD crosses below zero, 1.5% trailing stop");
        expect(p.definition.entry!.conditions![0].left).toMatchObject({ indicator: "MACD" });
        expect(p.definition.entry_action!.side).toBe("SELL");
        expect(p.definition.risk!.trailing_sl_pct).toBe(1.5);
    });

    it("marks a missing symbol as SAMPLE for the controller to ask about", () => {
        const p = parseStrategy("some random idea about the market");
        expect(p.definition.instrument!.symbol).toBe("SAMPLE");
    });

    it("stores a sizing rule, and a fixed quantity only when one was typed", () => {
        expect(parseStrategy("buy RELIANCE when rsi below 30").definition.sizing).toEqual({ mode: "pct_equity", value: 50 });
        expect(parseStrategy("buy 7 shares of RELIANCE when rsi below 30").definition.sizing).toEqual({ mode: "fixed_qty", value: 7 });
    });

    it("detects a known symbol and timeframe", () => {
        const p = parseStrategy("golden cross strategy on nifty daily");
        expect(p.definition.instrument).toMatchObject({ symbol: "NIFTY", timeframe: "1d" });
        expect(p.definition.entry!.conditions![0].left).toMatchObject({ period: 50 });
    });

    it("keeps the interpretation consistent when the symbol is overridden", () => {
        const p = parseStrategy("buy nifty when rsi below 30", "RELIANCE");
        expect(p.definition.instrument!.symbol).toBe("RELIANCE");
        expect(p.interpretation).toContain("RELIANCE");
        expect(p.interpretation.toUpperCase()).not.toContain("NIFTY");
    });

    it("ignores an override of SAMPLE", () => {
        expect(parseStrategy("buy nifty when rsi below 30", "SAMPLE").definition.instrument!.symbol).toBe("NIFTY");
    });

    it("sets a square-off only for intraday timeframes", () => {
        expect(parseStrategy("buy reliance when 20 ema crosses above 50 ema on 15 min").definition.risk!.square_off_time).toBe("15:15");
        expect(parseStrategy("buy reliance when rsi below 30 daily").definition.risk!.square_off_time).toBeNull();
    });
});

describe("names and quantities", () => {
    it("keeps acronyms in strategy names", () => {
        expect(parseStrategy("buy when rsi below 30").name).toMatch(/^RSI Mean-Reversion · SAMPLE 1d$/);
        expect(parseStrategy("macd cross").name).toMatch(/^MACD Momentum/);
        expect(parseOptions("sell an iron condor")!.name).toMatch(/^Short Iron Condor/);
    });

    it("reads an explicit quantity", () => {
        expect(parseStrategy("buy 50 shares of tcs when rsi below 30").definition.entry_action!.qty).toBe(50);
        expect(parseStrategy("buy tcs qty 12 when rsi below 30").definition.entry_action!.qty).toBe(12);
        expect(parseStrategy("buy tcs when rsi below 30").definition.entry_action!.qty).toBe(1);
    });
});

describe("parseOptions", () => {
    it("returns null for equity strategies", () => {
        expect(parseOptions("buy when RSI drops below 30")).toBeNull();
    });

    it("detects a short straddle with a stop multiple", () => {
        const p = parseOptions("short a NIFTY straddle with a 20% stop")!;
        expect(p.spec).toMatchObject({ structure: "straddle", side: "SELL", symbol: "NIFTY", stopMultiple: 0.2 });
    });

    it("detects an iron condor", () => {
        const p = parseOptions("backtest an iron condor on banknifty, daily")!;
        expect(p.spec).toMatchObject({ structure: "iron_condor", symbol: "BANKNIFTY", stopMultiple: 1 });
    });

    it("goes long only when buying is explicit", () => {
        expect(parseOptions("buy a strangle")!.spec.side).toBe("BUY");
    });

    it("keeps the interpretation consistent when the symbol is overridden", () => {
        const p = parseOptions("short a nifty straddle, 20% stop", "RELIANCE")!;
        expect(p.spec.symbol).toBe("RELIANCE");
        expect(p.interpretation).toContain("RELIANCE");
    });

    it("warns about tail risk on short premium only", () => {
        expect(parseOptions("short a nifty straddle, 20% stop")!.warnings.some((w) => /gap/i.test(w))).toBe(true);
        expect(parseOptions("buy a nifty straddle")!.warnings.some((w) => /tail risk/i.test(w))).toBe(false);
    });
});

describe("timeframe detection", () => {
    it.each([
        ["try it on 15m", "15m"],
        ["on 15 min candles", "15m"],
        ["5m chart", "5m"],
        ["5 min bars", "5m"],
        ["1m scalp", "1m"],
        ["one minute", "1m"],
        ["hourly", "1h"],
        ["swing", "1d"],
    ])("%s → %s", (text, tf) => {
        expect(parseStrategy(`buy when rsi below 30 ${text}`).definition.instrument!.timeframe).toBe(tf);
    });
});

describe("applyModification", () => {
    const base = () => parseStrategy("buy when RSI drops below 30 and sell above 70, 2% stop").definition;

    it("tightens the stop deterministically without re-parsing", () => {
        const p = applyModification(base(), "tighten the stop to 1%")!;
        expect(p.definition.risk!.stop_loss_pct).toBe(1);
        expect(p.definition.entry).toEqual(base().entry);
        expect(p.interpretation).toContain("stop-loss → 1%");
    });

    it("changes timeframe and square-off together", () => {
        const p = applyModification(base(), "try it on 15m")!;
        expect(p.definition.instrument!.timeframe).toBe("15m");
        expect(p.definition.risk!.square_off_time).toBe("15:15");
    });

    it("switches symbol and direction", () => {
        const p = applyModification(base(), "run it on RELIANCE and make it short")!;
        expect(p.definition.instrument!.symbol).toBe("RELIANCE");
        expect(p.definition.entry_action!.side).toBe("SELL");
    });

    it("does not mutate the previous definition", () => {
        const prev = base();
        applyModification(prev, "tighten the stop to 0.5%");
        expect(prev.risk!.stop_loss_pct).toBe(2);
    });

    it("re-targets on a bare symbol and keeps the sizing rule", () => {
        const p = applyModification(base(), "RELIANCE")!;
        expect(p.definition.instrument!.symbol).toBe("RELIANCE");
        expect(p.definition.sizing).toEqual(base().sizing);
    });

    it("re-targets to SAMPLE only when it is asked for", () => {
        const asked = { ...base(), instrument: { ...base().instrument, symbol: "" } };
        expect(applyModification(asked, "on SAMPLE")!.definition.instrument!.symbol).toBe("SAMPLE");
    });

    it("takes any ticker as the answer to 'which stock?', but only then", () => {
        const asked = { ...base(), instrument: { ...base().instrument, symbol: "" } };
        expect(applyModification(asked, "ZOMATO")!.definition.instrument).toMatchObject({ symbol: "ZOMATO", exchange: "NSE" });
        expect(applyModification(asked, "on irctc")!.definition.instrument!.symbol).toBe("IRCTC");
        expect(applyModification(base(), "ZOMATO")).toBeNull(); // no question pending
    });

    it("turns a typed quantity into a fixed-quantity rule", () => {
        expect(applyModification(base(), "make it 25 shares")!.definition.sizing).toEqual({ mode: "fixed_qty", value: 25 });
    });

    it("returns null for hint words with nothing parseable, and for options / no previous strategy", () => {
        expect(applyModification(base(), "change everything")).toBeNull();
        expect(applyModification(null, "tighten the stop to 1%")).toBeNull();
        expect(applyModification({ ...base(), kind: "options" }, "tighten the stop to 1%")).toBeNull();
    });
});

describe("classifyMessage", () => {
    const prev = parseStrategy("buy RELIANCE when RSI drops below 30 and sell above 70, 2% stop").definition;

    it("treats a message with its own entry rule as a new strategy (audit run 4)", () => {
        expect(classifyMessage(prev, "Buy NIFTY when 50 EMA crosses above 200 EMA, exit when it crosses below, daily")).toBe("new");
        expect(classifyMessage(prev, "Golden cross on BANKNIFTY, daily")).toBe("new");
        expect(classifyMessage(prev, "short when MACD crosses below zero")).toBe("new");
    });

    it("treats edits and re-targets as tweaks", () => {
        for (const m of ["Tighten the stop to 1%", "Run it on INFY", "try it on 15m", "Make it a short instead", "RELIANCE", "Set the target to 5%"]) {
            expect(classifyMessage(prev, m)).toBe("modify");
        }
    });

    it("asks when an indicator is named without a rule", () => {
        expect(classifyMessage(prev, "Try EMA instead")).toBe("ambiguous");
        expect(classifyMessage(prev, "use bollinger")).toBe("ambiguous");
    });

    it("anything is new without a previous equity strategy", () => {
        expect(classifyMessage(null, "Try EMA instead")).toBe("new");
        expect(classifyMessage({ kind: "options", instrument: { symbol: "NIFTY" } }, "tighten the stop")).toBe("new");
    });
});

describe("sizingFor", () => {
    it("sizes by risk profile unless a quantity is typed", () => {
        expect(sizingFor("buy when rsi below 30", "conservative")).toEqual({ mode: "pct_equity", value: 25 });
        expect(sizingFor("buy when rsi below 30", "aggressive")).toEqual({ mode: "pct_equity", value: 90 });
        expect(sizingFor("buy when rsi below 30")).toEqual({ mode: "pct_equity", value: 50 });
        expect(sizingFor("buy 10 shares when rsi below 30", "aggressive")).toEqual({ mode: "fixed_qty", value: 10 });
    });
});

describe("applyOptionsModification", () => {
    const prev = () => {
        const p = parseOptions("short a nifty straddle with a 20% stop")!;
        return { kind: "options", structure: p.spec.structure, side: p.spec.side, instrument: { symbol: p.spec.symbol, exchange: p.spec.exchange, timeframe: p.spec.timeframe }, stop_multiple: p.spec.stopMultiple };
    };

    it.each([
        ["Run it on BANKNIFTY", { symbol: "BANKNIFTY", structure: "straddle", stopMultiple: 0.2 }],
        ["Add a 30% stop per leg", { symbol: "NIFTY", structure: "straddle", stopMultiple: 0.3 }],
        ["Try a strangle instead", { symbol: "NIFTY", structure: "strangle", stopMultiple: 0.2 }],
        ["make it long", { side: "BUY", symbol: "NIFTY" }],
    ])("%s keeps the rest of the options structure", (msg, expected) => {
        const p = applyOptionsModification(prev(), msg as string)!;
        expect(p).not.toBeNull();
        expect(p.spec).toMatchObject(expected as object);
        expect(p.interpretation).toMatch(/^Updated your previous options strategy/);
    });

    it("treats a new equity idea as new, not as a tweak", () => {
        expect(applyOptionsModification(prev(), "buy when RSI below 30 with a 2% stop")).toBeNull();
    });

    it("ignores equity previous strategies and no-op messages", () => {
        expect(applyOptionsModification(parseStrategy("buy when rsi below 30").definition, "run it on BANKNIFTY")).toBeNull();
        expect(applyOptionsModification(prev(), "run it on NIFTY")).toBeNull(); // nothing actually changes
    });
});

describe("personalize", () => {
    it("fills missing stop/target from the risk profile", () => {
        const d = parseStrategy("buy sma cross 20 50").definition;
        d.risk!.stop_loss_pct = null;
        d.risk!.target_pct = null;
        d.exit = { conditions: [] };
        const notes = personalize(d, { risk: "conservative" });
        expect(d.risk).toMatchObject({ stop_loss_pct: 1.5, target_pct: 2.5 });
        expect(notes).toHaveLength(2);
    });

    it("doesn't stack a fixed stop on top of a trailing stop the user asked for", () => {
        const d = parseStrategy("buy when 20 ema crosses above 50 ema, 3% trailing stop").definition;
        expect(personalize(d, { risk: "balanced" })).toEqual([]);
        expect(d.risk).toMatchObject({ trailing_sl_pct: 3, stop_loss_pct: null });
    });

    it("never overrides an explicit stop and skips targets when exit rules exist", () => {
        const d = parseStrategy("buy when rsi below 30, 3% stop").definition;
        personalize(d, { risk: "aggressive" });
        expect(d.risk!.stop_loss_pct).toBe(3);
        expect(d.risk!.target_pct).toBeNull();
    });
});

describe("defaultWindow", () => {
    const today = new Date("2025-06-30T00:00:00Z");
    it("scales the lookback to the timeframe", () => {
        expect(defaultWindow("1d", today)).toEqual(["2022-07-01", "2025-06-30"]);
        expect(defaultWindow("1h", today)).toEqual(["2025-01-01", "2025-06-30"]);
        expect(defaultWindow("5m", today)).toEqual(["2025-05-16", "2025-06-30"]);
        expect(defaultWindow("1m", today)).toEqual(["2025-06-24", "2025-06-30"]); // Yahoo keeps ~7 days of 1m bars
    });
});

describe("looksLikeTrading", () => {
    it.each(["buy when rsi below 30", "golden cross on nifty", "tighten the stop to 1%", "RELIANCE", "short a straddle", "make it short", "sell tcs above 4000"])("accepts %s", (m) => {
        expect(looksLikeTrading(m)).toBe(true);
    });
    it.each(["hello", "asdf qwer", "what is the weather today", "??", "lol"])("rejects %s", (m) => {
        expect(looksLikeTrading(m)).toBe(false);
    });
});
