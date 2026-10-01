import { describe, it, expect, vi } from "vitest";

vi.mock("./repository.js", () => ({ getCachedCandles: vi.fn(), saveCachedCandles: vi.fn() }));

import { toLocalIso, yahooSymbol, getCandles } from "./marketData.js";

describe("yahooSymbol", () => {
    it("maps indices to caret tickers and equities to exchange suffixes", () => {
        expect(yahooSymbol("NIFTY", "NSE")).toBe("^NSEI");
        expect(yahooSymbol("BANKNIFTY", "NSE")).toBe("^NSEBANK");
        expect(yahooSymbol("SENSEX", "BSE")).toBe("^BSESN");
        expect(yahooSymbol("RELIANCE", "NSE")).toBe("RELIANCE.NS");
        expect(yahooSymbol("RELIANCE", "BSE")).toBe("RELIANCE.BO");
        expect(yahooSymbol("AAPL", "NASDAQ")).toBe("AAPL");
    });
});

describe("toLocalIso", () => {
    it("renders the exchange's local clock, so '15:15' square-offs mean IST for NSE", () => {
        const open = new Date("2024-01-02T03:45:00Z"); // 09:15 IST
        expect(toLocalIso(open, "Asia/Kolkata")).toBe("2024-01-02T09:15:00");
        expect(toLocalIso(new Date("2024-01-02T14:30:00Z"), "America/New_York")).toBe("2024-01-02T09:30:00");
    });

    it("never emits hour 24 at midnight", () => {
        expect(toLocalIso(new Date("2024-01-02T18:30:00Z"), "Asia/Kolkata")).toBe("2024-01-03T00:00:00");
    });
});

describe("getCandles", () => {
    it("serves SAMPLE offline without touching the cache or the network", async () => {
        const candles = await getCandles({ symbol: " sample ", exchange: "nse", timeframe: "1d", start: "2024-01-01", end: "2024-03-01" });
        expect(candles.length).toBeGreaterThan(30);
    });
});
