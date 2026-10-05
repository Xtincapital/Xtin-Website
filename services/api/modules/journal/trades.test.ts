import { describe, it, expect } from "vitest";
import { computeTradePnl } from "./importParsers.js";
import { validateTradeCreate, validateTradeUpdate } from "./trades.validator.js";

describe("computeTradePnl", () => {
    it("buy: (exit - entry) × qty - brokerage", () => {
        expect(computeTradePnl({ buy_sell: "buy", quantity: 10, entry_price: 100, exit_price: 110 })).toBe(100);
        expect(computeTradePnl({ buy_sell: "buy", quantity: 10, entry_price: 100, exit_price: 110, brokerage: 20 })).toBe(80);
    });

    it("sell (short): (entry - exit) × qty", () => {
        expect(computeTradePnl({ buy_sell: "sell", quantity: 5, entry_price: 200, exit_price: 210 })).toBe(-50);
    });

    it("is null while the trade is still open", () => {
        expect(computeTradePnl({ buy_sell: "buy", quantity: 10, entry_price: 100, exit_price: null })).toBeNull();
    });

    it("rounds to paise", () => {
        expect(computeTradePnl({ buy_sell: "buy", quantity: 3, entry_price: 0.1, exit_price: 0.2 })).toBe(0.3);
    });
});

describe("trade validation", () => {
    const base = { date: "2026-10-01", asset: "INFY" };

    it("rejects negative prices and quantity", () => {
        for (const field of ["quantity", "entry_price", "exit_price", "target_price", "stop_loss", "brokerage", "strike_price"]) {
            expect(validateTradeCreate({ ...base, [field]: -100 }).errors, field).toBeDefined();
            expect(validateTradeUpdate({ [field]: -1 }).errors, field).toBeDefined();
        }
    });

    it("still allows a negative P&L", () => {
        expect(validateTradeCreate({ ...base, pnl: -500 }).errors).toBeUndefined();
    });
});
