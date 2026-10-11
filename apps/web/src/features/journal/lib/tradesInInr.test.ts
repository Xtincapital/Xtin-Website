import { describe, it, expect } from "vitest";
import { convert } from "@/lib/region";
import { tradeInInr } from "./tradesInInr";

describe("tradeInInr", () => {
  it("leaves rupee trades (and trades without a currency) untouched", () => {
    const t = { id: "1", currency: "INR", pnl: 500, entry_price: 100 } as any;
    expect(tradeInInr(t)).toBe(t);
    expect(tradeInInr({ id: "2", pnl: 7 } as any).pnl).toBe(7);
  });

  it("brings a dollar trade's money into rupees so totals add up", () => {
    const t = tradeInInr({ id: "1", currency: "usd", pnl: 10, entry_price: 2, quantity: 5, exit_price: null } as any);
    expect(t.pnl).toBeCloseTo(convert(10, "USD", "INR"));
    expect(t.entry_price).toBeCloseTo(convert(2, "USD", "INR"));
    expect(t).toMatchObject({ currency: "INR", quantity: 5, exit_price: null });
  });
});
