import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { buildTradesPdf, tradeSummary } from "./tradesPdf";

const trade = (i: number, pnl: number | null) => ({
  date: "2026-10-06", asset: `STOCK-${i}`, buy_sell: "buy" as const, quantity: 10, entry_price: 100, exit_price: pnl == null ? null : 100 + pnl / 10,
  brokerage: 0, pnl, currency: "INR", strategy: null, market: "Crypto_Currency", emotion: null,
});

describe("trades PDF", () => {
  it("summarises only closed trades in the win rate", () => {
    expect(tradeSummary([trade(1, 100), trade(2, -50), trade(3, null)])).toMatchObject({
      trades: 3, closed: 2, open: 1, wins: 1, losses: 1, totalPnl: 50, winRate: 50,
    });
  });

  it("runs onto more pages for long lists and numbers them", () => {
    const doc = buildTradesPdf(jsPDF, Array.from({ length: 70 }, (_, i) => trade(i, i % 2 ? 100 : -40)));
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
    const raw = doc.output();
    expect(raw).toContain("Page 1 of");
    expect(raw).toContain("Crypto Currency");
    expect(raw).toContain("STOCK-69");
    expect(raw.length).toBeLessThan(200_000); // text, not an image
  });
});
