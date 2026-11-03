import { describe, it, expect } from "vitest";
import { resolveInstrument, normaliseSegment, daysToExpiry } from "./instruments.js";

describe("resolveInstrument", () => {
    it("treats a cash-segment symbol as an equity ticker and drops the series suffix", () => {
        expect(resolveInstrument("RELIANCE", "NSECM")).toEqual({ asset: "RELIANCE", market: "Equity", contract: null, strikePrice: null, optionType: null, expiry: null });
        expect(resolveInstrument("INFY-EQ", "NSECM").asset).toBe("INFY");
        expect(resolveInstrument("BAJAJ-AUTO", "NSECM").asset).toBe("BAJAJ-AUTO");
    });

    it("reads a monthly option", () => {
        expect(resolveInstrument("NIFTY26NOV24500CE", "NSEFO")).toEqual({ asset: "NIFTY", market: "Options", contract: "NIFTY26NOV24500CE", strikePrice: 24500, optionType: "call", expiry: null });
        expect(resolveInstrument("BANKNIFTY26DEC48000PE", "NSEFO")).toMatchObject({ asset: "BANKNIFTY", strikePrice: 48000, optionType: "put" });
    });

    it("reads a weekly option, including the day of expiry", () => {
        expect(resolveInstrument("NIFTY2611324500CE", "NSEFO")).toEqual({ asset: "NIFTY", market: "Options", contract: "NIFTY2611324500CE", strikePrice: 24500, optionType: "call", expiry: "2026-01-13" });
        expect(resolveInstrument("NIFTY26O2124000PE", "NSEFO")).toMatchObject({ expiry: "2026-10-21", optionType: "put" });
        expect(resolveInstrument("NIFTY26D0224000PE", "NSEFO").expiry).toBe("2026-12-02");
    });

    it("keeps underlyings that contain & or -", () => {
        expect(resolveInstrument("M&M26NOV3000CE", "NSEFO")).toMatchObject({ asset: "M&M", strikePrice: 3000 });
        expect(resolveInstrument("BAJAJ-AUTO26NOV9000PE", "NSEFO")).toMatchObject({ asset: "BAJAJ-AUTO", optionType: "put" });
    });

    it("reads a decimal strike", () => {
        expect(resolveInstrument("IDEA26NOV7.5CE", "NSEFO")).toMatchObject({ asset: "IDEA", strikePrice: 7.5 });
    });

    it("reads a future", () => {
        expect(resolveInstrument("NIFTY26NOVFUT", "NSEFO")).toEqual({ asset: "NIFTY", market: "Futures", contract: "NIFTY26NOVFUT", strikePrice: null, optionType: null, expiry: null });
    });

    it("uses the segment for commodity and currency contracts", () => {
        expect(resolveInstrument("CRUDEOIL26NOVFUT", "MCXFO").market).toBe("Commodities");
        expect(resolveInstrument("CRUDEOIL26NOV6500CE", "MCXFO")).toMatchObject({ market: "Commodities", strikePrice: 6500 });
        expect(resolveInstrument("USDINR26NOVFUT", "NSECD").market).toBe("Forex");
    });

    it("still reads the symbol when the segment is unknown", () => {
        expect(resolveInstrument("NIFTY26NOV24500CE", null)).toMatchObject({ market: "Options", strikePrice: 24500 });
    });

    it("falls back to the raw symbol rather than guessing", () => {
        expect(resolveInstrument("SOMETHING-ODD", "NSEFO")).toEqual({ asset: "SOMETHING-ODD", market: null, contract: null, strikePrice: null, optionType: null, expiry: null });
    });

    it("accepts lower-case input", () => {
        expect(resolveInstrument(" nifty26nov24500ce ", "nsefo").asset).toBe("NIFTY");
    });
});

describe("normaliseSegment", () => {
    it("maps XTS numeric ids to names and passes names through", () => {
        expect(normaliseSegment(2)).toBe("NSEFO");
        expect(normaliseSegment("1")).toBe("NSECM");
        expect(normaliseSegment("nsefo")).toBe("NSEFO");
        expect(normaliseSegment(null)).toBeNull();
        expect(normaliseSegment("")).toBeNull();
    });
});

describe("daysToExpiry", () => {
    it("counts whole days", () => {
        expect(daysToExpiry("2026-01-13", "2026-01-09")).toBe(4);
        expect(daysToExpiry("2026-01-13", "2026-01-13")).toBe(0);
    });

    it("is null when unknown or already passed", () => {
        expect(daysToExpiry(null, "2026-01-09")).toBeNull();
        expect(daysToExpiry("2026-01-01", "2026-01-09")).toBeNull();
    });
});
