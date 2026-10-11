// Coverage for the region-detection/currency math every product on this
// site depends on for pricing, jargon, and defaults. countryToRegion and
// heuristicRegion were made exportable in this same phase specifically so
// they could be tested directly instead of only indirectly through the
// async, network/localStorage-touching detectRegion().
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { countryToRegion, heuristicRegion, convert, formatMoney, getRegionConfig, currencySymbol, setRegion, getRegion, isIndia, REGIONS } from "./region";

describe("countryToRegion", () => {
    it("maps India directly", () => {
        expect(countryToRegion("IN")).toBe("IN");
        expect(countryToRegion("in")).toBe("IN"); // case-insensitive
    });

    it("maps the US directly", () => {
        expect(countryToRegion("US")).toBe("US");
    });

    it("maps GB and the legacy UK code both to GB", () => {
        expect(countryToRegion("GB")).toBe("GB");
        expect(countryToRegion("UK")).toBe("GB");
    });

    it("maps UAE and Singapore directly", () => {
        expect(countryToRegion("AE")).toBe("AE");
        expect(countryToRegion("SG")).toBe("SG");
    });

    it("maps every Eurozone country code to EU", () => {
        for (const c of ["DE", "FR", "IT", "ES", "NL", "IE"]) {
            expect(countryToRegion(c)).toBe("EU");
        }
    });

    it("falls back to GLOBAL for an unmapped country", () => {
        expect(countryToRegion("BR")).toBe("GLOBAL");
        expect(countryToRegion("JP")).toBe("GLOBAL");
    });

    it("falls back to GLOBAL for empty/missing input", () => {
        expect(countryToRegion("")).toBe("GLOBAL");
        expect(countryToRegion(undefined as any)).toBe("GLOBAL");
    });
});

describe("heuristicRegion", () => {
    const originalDTF = Intl.DateTimeFormat;

    function mockTimezone(tz: string) {
        Intl.DateTimeFormat = vi.fn(() => ({ resolvedOptions: () => ({ timeZone: tz }) })) as any;
    }

    afterEach(() => {
        Intl.DateTimeFormat = originalDTF;
    });

    it("detects India from the Kolkata timezone", () => {
        mockTimezone("Asia/Kolkata");
        expect(heuristicRegion()).toBe("IN");
    });

    it("detects GB from the London timezone", () => {
        mockTimezone("Europe/London");
        expect(heuristicRegion()).toBe("GB");
    });

    it("detects EU from any other Europe/* timezone", () => {
        mockTimezone("Europe/Berlin");
        expect(heuristicRegion()).toBe("EU");
    });

    it("detects US from any America/* timezone", () => {
        mockTimezone("America/Chicago");
        expect(heuristicRegion()).toBe("US");
    });

    it("falls back to US for an unrecognized timezone", () => {
        mockTimezone("Pacific/Auckland");
        expect(heuristicRegion()).toBe("US");
    });
});

describe("convert", () => {
    it("returns the same amount when converting a currency to itself", async () => {
        // convert() reads module-level `_rates`, seeded from FALLBACK_RATES
        // until getRates() is called — exercised here via the fallback path,
        // which is deterministic and doesn't need a network mock.
        const result = convert(100, "USD", "USD");
        expect(result).toBeCloseTo(100, 5);
    });

    it("converts using the fallback USD/INR rate (96.7) when no live rate has been fetched", () => {
        const result = convert(1, "USD", "INR");
        expect(result).toBeCloseTo(96.7, 0);
    });

    it("converts INR back to USD correctly (round-trip)", () => {
        const inr = convert(100, "USD", "INR");
        const backToUsd = convert(inr, "INR", "USD");
        expect(backToUsd).toBeCloseTo(100, 5);
    });
});

describe("formatMoney", () => {
    it("formats a plain INR amount with the rupee symbol and Indian grouping", () => {
        expect(formatMoney(150000, { region: "IN" })).toBe("₹1,50,000");
    });

    it("formats a plain USD amount with western grouping", () => {
        expect(formatMoney(150000, { region: "US" })).toBe("$150,000");
    });

    it("compact-formats large INR amounts as Lakh/Crore", () => {
        expect(formatMoney(500000, { region: "IN", compact: true })).toBe("₹5L");
        expect(formatMoney(20000000, { region: "IN", compact: true })).toBe("₹2Cr");
    });

    it("compact-formats large USD amounts as K/M/B", () => {
        expect(formatMoney(5000, { region: "US", compact: true })).toBe("$5K");
        expect(formatMoney(2500000, { region: "US", compact: true })).toBe("$2.50M"); // toFixed(2) only strips an exact trailing ".00", not ".50"
        expect(formatMoney(3000000000, { region: "US", compact: true })).toBe("$3B");
    });

    it("treats a falsy/NaN amount as zero rather than throwing", () => {
        expect(formatMoney(NaN, { region: "US" })).toBe("$0");
        expect(formatMoney(undefined, { region: "US" })).toBe("$0");
    });
});

describe("region state (getRegion/setRegion/getRegionConfig/currencySymbol/isIndia)", () => {
    beforeEach(() => {
        setRegion("US"); // reset to a known state between tests
    });

    it("setRegion updates getRegion and getRegionConfig together", () => {
        setRegion("IN");
        expect(getRegion()).toBe("IN");
        expect(getRegionConfig().currency).toBe("INR");
        expect(isIndia()).toBe(true);
    });

    it("setRegion ignores an unknown region code", () => {
        setRegion("IN");
        setRegion("NOT_A_REGION" as any);
        expect(getRegion()).toBe("IN"); // unchanged
    });

    it("currencySymbol reflects the current region by default", () => {
        setRegion("GB");
        expect(currencySymbol()).toBe(REGIONS.GB.symbol);
    });

    it("currencySymbol can be queried for a specific region regardless of current", () => {
        setRegion("US");
        expect(currencySymbol("IN")).toBe("₹");
    });
});
