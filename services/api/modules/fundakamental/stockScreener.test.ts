import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../supabase/index.js", () => ({ default: {} }));

const getScreeningCache = vi.fn();
const upsertScreeningCache = vi.fn();
const queryStocksForScreener = vi.fn();
const countActiveStocks = vi.fn();

vi.mock("./stocks.repository.js", async () => {
    const actual = await vi.importActual<typeof import("./stocks.repository.js")>("./stocks.repository.js");
    return { ...actual, getScreeningCache, upsertScreeningCache, queryStocksForScreener, countActiveStocks };
});

const { screenStocks } = await import("./stockScreener.js");
const { sectorNames } = await import("./stocks.repository.js");

describe("stock screener", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getScreeningCache.mockResolvedValue({ data: null });
        upsertScreeningCache.mockResolvedValue({ error: null });
    });

    it("matches Yahoo's sector names for the scanner's GICS names", () => {
        expect(sectorNames("Financials")).toEqual(["Financials", "Financial Services"]);
        expect(sectorNames("Consumer Staples")).toContain("Consumer Defensive");
        expect(sectorNames("Energy")).toEqual(["Energy"]);
    });

    it("keys the cache by market so India rows are never served for a US scan", async () => {
        queryStocksForScreener.mockResolvedValue({ data: [{ ticker: "AAPL", sector: "Technology" }], error: null });
        await screenStocks({ filters: [], market: "india" });
        await screenStocks({ filters: [], market: "us" });
        const keys = upsertScreeningCache.mock.calls.map((c) => c[0].filter_hash);
        expect(new Set(keys).size).toBe(2);
    });

    it("returns no rows (not sample data) when filters match nothing in a populated market", async () => {
        queryStocksForScreener.mockResolvedValue({ data: [], error: null });
        countActiveStocks.mockResolvedValue({ count: 50 });
        const result = await screenStocks({ filters: [{ field: "pe_ratio", operator: "lt", value: 1 }], market: "india" });
        expect(result.results).toEqual([]);
        expect(result.sample_data).toBeUndefined();
    });

    it("falls back to the sample universe only when the market has no stocks at all", async () => {
        queryStocksForScreener.mockResolvedValue({ data: [], error: null });
        countActiveStocks.mockResolvedValue({ count: 0 });
        const result = await screenStocks({ filters: [], market: "us" });
        expect(result.sample_data).toBe(true);
        expect(result.results.length).toBeGreaterThan(0);
    });

    it("scores a Yahoo 'Financial Services' stock as a full match for Financials", async () => {
        queryStocksForScreener.mockResolvedValue({ data: [{ ticker: "JPM", sector: "Financial Services" }], error: null });
        const result = await screenStocks({ filters: [{ field: "sector", operator: "eq", value: "Financials" }], sortBy: "match_score", market: "us" });
        expect(result.results[0].match_score).toBe(100);
    });
});
