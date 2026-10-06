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

import { compactTradeContext } from "./tradeContext.js";

describe("AI trade context", () => {
    it("leaves open trades (no P&L) out of the win rate", () => {
        const text = compactTradeContext([
            { asset: "A", date: "2026-10-05", pnl: 200 },
            { asset: "B", date: "2026-10-05", pnl: -100 },
            { asset: "C", date: "2026-10-04", pnl: null }, // still open
            { asset: "D", date: "2026-10-04" },
        ] as any);
        expect(text).toContain("WinRate=50.0%"); // 1 win of 2 closed trades, not 1 of 4
        expect(text).toContain("Trades=4");
    });
});

import { rowsToImportTrades } from "./importParsers.js";

describe("import with missing columns", () => {
    it("leaves strategy, times, type, market, margin and emotion blank instead of inventing them", () => {
        const [trade] = rowsToImportTrades([
            ["Date", "Asset", "Quantity", "Entry Price", "Exit Price"],
            ["2026-10-05", "INFY", 10, 100, 110],
        ]);
        expect(trade).toMatchObject({
            strategy: null, entry_time: null, exit_time: null, type: null, market: null,
            margin: null, emotion: null, target_price: null, stop_loss: null, pnl: 100,
        });
    });

    it("still reads those columns when the file has them", () => {
        const [trade] = rowsToImportTrades([
            ["Date", "Asset", "Quantity", "Entry Price", "Exit Price", "Strategy", "Entry Time", "Market"],
            ["2026-10-05", "INFY", 10, 100, 110, " Breakout ", "10:05:00", "Equity"],
        ]);
        expect(trade).toMatchObject({ strategy: "Breakout", entry_time: "10:05:00", market: "Equity" });
    });
});
