import { describe, it, expect } from "vitest";
import { conditionText, emptySpec, groupTexts, indicator, levelText, operandText, parseInstrumentId, sizingShort } from "./spec";
import { rulesOnly } from "./v1";

describe("spec helpers", () => {
  it("describes operands and conditions the way the builder shows them", () => {
    expect(operandText(indicator("RSI"))).toBe("RSI(14)");
    expect(operandText({ ind: "BB", len: 20, mult: 2, line: "lower" })).toBe("Bollinger(20, 2) lower");
    expect(operandText({ field: "close" })).toBe("close");
    expect(conditionText({ left: indicator("EMA"), op: "crosses_above", right: { ind: "EMA", len: 50 } })).toBe("EMA(20) crosses above EMA(50)");
    expect(conditionText({ left: indicator("RSI"), op: "between", low: 40, high: 60 })).toBe("RSI(14) between 40 and 60");
    expect(conditionText({ left: { field: "close" }, op: "rising", bars: 3 })).toBe("close rising 3 bars");
  });

  it("flattens nested groups into readable text", () => {
    expect(groupTexts({ all: [{ left: 1, op: "<", right: 2 }, { any: [{ left: 3, op: ">", right: 4 }, { left: 5, op: "==", right: 5 }] }] })).toEqual(["1 < 2", "(3 > 4 or 5 = 5)"]);
    expect(groupTexts(null)).toEqual([]);
  });

  it("formats stops, sizing and instrument ids", () => {
    expect(levelText({ type: "atr", value: 2, len: 14 }, "stop")).toBe("2× ATR stop");
    expect(levelText(null, "stop")).toBeNull();
    expect(sizingShort({ mode: "risk_pct", value: 1 })).toBe("1% risk");
    expect(parseInstrumentId("BSE:SENSEX")).toEqual({ exchange: "BSE", symbol: "SENSEX" });
  });

  it("saves rules only — the run page picks the window", () => {
    const s = { ...emptySpec(), period: { from: "2024-01-01", to: "2024-12-31" } };
    expect(rulesOnly(s)).not.toHaveProperty("period");
    expect(rulesOnly(s).entry).toEqual(s.entry);
  });
});
