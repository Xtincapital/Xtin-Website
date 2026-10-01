import { describe, it, expect } from "vitest";
import { conditionText, drawdownSeries, exitReasons, monthlyReturns, pnlHistogram, strategySentence, streaks } from "./analytics";
import type { BacktestTrade } from "./types";

const trade = (pnl: number, reason = "signal"): BacktestTrade => ({
  side: "BUY",
  qty: 1,
  entry_time: "2024-01-01",
  entry_price: 100,
  exit_time: "2024-01-02",
  exit_price: 100 + pnl,
  pnl,
  pnl_pct: pnl,
  reason,
});

describe("drawdownSeries", () => {
  it("is 0 at new highs and negative under water", () => {
    const dd = drawdownSeries([
      { time: "a", equity: 100 },
      { time: "b", equity: 120 },
      { time: "c", equity: 90 },
      { time: "d", equity: 130 },
    ]);
    expect(dd.map((p) => p.equity)).toEqual([0, 0, -25, 0]);
  });
});

describe("monthlyReturns", () => {
  it("chains month-end equity, starting from the starting capital", () => {
    const cells = monthlyReturns(
      [
        { time: "2024-01-05T09:15:00", equity: 100 },
        { time: "2024-01-31T09:15:00", equity: 110 },
        { time: "2024-02-29T09:15:00", equity: 99 },
      ],
      100
    );
    expect(cells).toEqual([
      { year: 2024, month: 1, returnPct: 10 },
      { year: 2024, month: 2, returnPct: -10 },
    ]);
  });
});

describe("pnlHistogram", () => {
  it("puts every trade in a bucket, including the maximum", () => {
    const b = pnlHistogram([trade(-5), trade(0), trade(5), trade(5)], 2);
    expect(b.map((x) => x.count)).toEqual([1, 3]);
    expect(b.reduce((s, x) => s + x.count, 0)).toBe(4);
  });
  it("handles a single value and no trades", () => {
    expect(pnlHistogram([trade(2)], 4).reduce((s, x) => s + x.count, 0)).toBe(1);
    expect(pnlHistogram([])).toEqual([]);
  });
});

describe("exitReasons / streaks", () => {
  it("counts reasons and longest streaks", () => {
    const ts = [trade(1, "target"), trade(2, "target"), trade(-1, "stop_loss"), trade(3, "target"), trade(-1), trade(-2)];
    expect(exitReasons(ts)[0]).toEqual({ reason: "target", count: 3 });
    expect(streaks(ts)).toEqual({ wins: 2, losses: 2 });
  });
});

describe("strategySentence", () => {
  it("describes an equity strategy", () => {
    expect(
      strategySentence({
        instrument: { symbol: "RELIANCE", exchange: "NSE", timeframe: "1d" },
        entry: { match: "all", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: "<", right: { kind: "value", value: 30 } }] },
        entry_action: { side: "BUY", qty: 5, order_type: "MARKET" },
        exit: { match: "any", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: ">", right: { kind: "value", value: 70 } }] },
        risk: { stop_loss_pct: 2, target_pct: null, trailing_sl_pct: null, square_off_time: null },
      })
    ).toBe("Buy 5 RELIANCE (1d) when RSI(14) < 30; exit when RSI(14) > 70 · 2% stop.");
  });
  it("describes an options structure", () => {
    expect(strategySentence({ kind: "options", structure: "iron_condor", side: "SELL", instrument: { symbol: "NIFTY", timeframe: "1d" }, stop_multiple: 0.5 })).toBe(
      "Sell an iron condor on NIFTY every day, stop at 0.5× the credit."
    );
  });
  it("words crossovers", () => {
    expect(conditionText({ left: { kind: "indicator", indicator: "EMA", period: 20 }, op: "crosses_above", right: { kind: "indicator", indicator: "EMA", period: 50 } })).toBe("EMA(20) crosses above EMA(50)");
  });
});
