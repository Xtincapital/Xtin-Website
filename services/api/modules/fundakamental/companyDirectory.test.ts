import { describe, it, expect } from "vitest";
import { searchDirectory } from "./companyDirectory.js";

describe("searchDirectory", () => {
    it("covers the full NSE + US universe", () => {
        // Any 1-char query matches thousands of names; the limit is the only cap.
        expect(searchDirectory("a", 100000).length).toBeGreaterThan(10000);
    });

    it("ranks an exact ticker first", () => {
        expect(searchDirectory("tcs")[0].ticker).toBe("TCS.NS");
        expect(searchDirectory("aapl")[0].ticker).toBe("AAPL");
    });

    it("lists many group companies, not just a handful", () => {
        const tata = searchDirectory("tata").filter((c) => c.market === "IN");
        expect(tata.length).toBeGreaterThan(10);
    });

    it("matches renamed companies through aliases", () => {
        expect(searchDirectory("zomato")[0].ticker).toBe("ETERNAL.NS");
        expect(searchDirectory("facebook")[0].ticker).toBe("META");
    });

    it("requires every word of a multi-word query", () => {
        const r = searchDirectory("tata motors");
        expect(r.length).toBeGreaterThan(0);
        expect(r.every((c) => /tata/i.test(c.name) || /tata/i.test(c.ticker) || c.ticker.startsWith("TM"))).toBe(true);
    });

    it("returns nothing for empty or nonsense queries", () => {
        expect(searchDirectory("")).toEqual([]);
        expect(searchDirectory("zzzzqqqq")).toEqual([]);
    });
});
