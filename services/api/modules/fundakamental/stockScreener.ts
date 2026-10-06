// Stock Screening Engine — Node/TS port of `utils/stock_screener.py`'s
// StockScreener class (kept as plain functions rather than a class,
// matching this codebase's module style).
import crypto from "node:crypto";
import { getScreeningCache, upsertScreeningCache, queryStocksForScreener, countActiveStocks, sectorNames, type ScreenFilter } from "./stocks.repository.js";
import { screenSample } from "./sampleStocks.js";

const CACHE_DURATION_MINUTES = 30;

export interface ScreenStocksOptions {
    filters: ScreenFilter[];
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    useCache?: boolean;
    market?: string | null;
}

export interface ScreenStocksResult {
    results: Array<Record<string, unknown>>;
    total_count: number;
    filters_applied?: number;
    cached: boolean;
    sample_data?: boolean;
    last_updated?: string;
    error?: string;
}

// The market and limit are part of the key: without them an India scan's
// cached rows were served for the same screen on the US market.
function getFilterHash(filters: ScreenFilter[], sortBy: string, sortOrder: string, market: string | null | undefined, limit: number): string {
    const sorted = [...(filters || [])].sort((a, b) => (a.field || "").localeCompare(b.field || ""));
    const payload = JSON.stringify({ filters: sorted, sort_by: sortBy, sort_order: sortOrder, market: market || "", limit });
    return crypto.createHash("md5").update(payload).digest("hex");
}

function scoreFilterMatch(stockValue: unknown, operator: string, targetValue: unknown): number {
    try {
        if (operator === "eq") {
            const wanted = sectorNames(targetValue).map((v) => v.toLowerCase());
            return wanted.includes(String(stockValue).toLowerCase()) || Number(stockValue) === Number(targetValue) ? 100.0 : 0.0;
        }

        if (operator === "gt" || operator === "gte" || operator === "lt" || operator === "lte") {
            const stockNum = Number(stockValue);
            const targetNum = Number(targetValue);
            if (Number.isNaN(stockNum) || Number.isNaN(targetNum)) return 50.0;

            // Meeting the threshold is a full match, however far past it the
            // stock is (the old formula took points off for beating a ">="
            // limit by a lot, down to -697% for the largest companies).
            const passes =
                operator === "gt" ? stockNum > targetNum
                : operator === "gte" ? stockNum >= targetNum
                : operator === "lt" ? stockNum < targetNum
                : stockNum <= targetNum;
            if (passes) return 100.0;
            // Near misses score partially, never below 0.
            const miss = Math.abs(stockNum - targetNum) / Math.max(Math.abs(targetNum), 1);
            return Math.max(0.0, 50.0 - miss * 100);
        }

        if (operator === "contains") {
            return String(stockValue).toLowerCase().includes(String(targetValue).toLowerCase()) ? 100.0 : 0.0;
        }

        return 50.0;
    } catch {
        return 50.0;
    }
}

function calculateMatchScore(stock: Record<string, unknown>, filters: ScreenFilter[]): number {
    if (!filters || filters.length === 0) return 100.0;

    let totalScore = 0;
    let scoredFilters = 0;
    for (const filter of filters) {
        const stockValue = stock[filter.field];
        if (stockValue === null || stockValue === undefined) continue;
        totalScore += scoreFilterMatch(stockValue, filter.operator, filter.value);
        scoredFilters += 1;
    }
    return scoredFilters > 0 ? totalScore / scoredFilters : 50.0;
}

async function getCachedResults(filters: ScreenFilter[], sortBy: string, sortOrder: string, market: string | null | undefined, limit: number): Promise<ScreenStocksResult | null> {
    const filterHash = getFilterHash(filters, sortBy, sortOrder, market, limit);
    try {
        const { data } = await getScreeningCache(filterHash);
        if (data?.results) {
            return { ...(data.results as ScreenStocksResult), cached: true };
        }
    } catch {
        // fall through to a live query, matching the Python source's bare except
    }
    return null;
}

async function cacheResults(filters: ScreenFilter[], sortBy: string, sortOrder: string, market: string | null | undefined, limit: number, results: ScreenStocksResult): Promise<void> {
    const filterHash = getFilterHash(filters, sortBy, sortOrder, market, limit);
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MINUTES * 60 * 1000).toISOString();
    try {
        const { error } = await upsertScreeningCache({
            filter_hash: filterHash,
            results,
            result_count: results.total_count || 0,
            expires_at: expiresAt,
        });
        if (error) throw error;
    } catch (err) {
        console.error("[Fundakamental] screening cache error:", err);
    }
}

/**
 * Screen stocks based on filters. Reads `funda_stocks`, scores + sorts
 * matches by how well they satisfy the filter set, and caches the response
 * in `funda_screening_cache`. Falls back to an in-memory sample universe
 * when `funda_stocks` isn't populated yet (see sampleStocks.ts).
 */
export async function screenStocks(options: ScreenStocksOptions): Promise<ScreenStocksResult> {
    const { filters, sortBy = "market_cap", sortOrder = "desc", limit = 100, useCache = true, market = "india" } = options;

    if (useCache) {
        const cached = await getCachedResults(filters, sortBy, sortOrder, market, limit);
        if (cached) return cached;
    }

    try {
        const { data, error } = await queryStocksForScreener(filters, sortBy, sortOrder, limit, market);
        if (error) throw error;
        let stocks: Array<Record<string, unknown>> = data || [];

        // Fallback: only when `funda_stocks` has no stocks for this market at
        // all. A screen that simply matches nothing must say so, not show
        // made-up sample rows as if they matched.
        let universeEmpty = false;
        if (!stocks.length) {
            const { count } = await countActiveStocks(market);
            universeEmpty = !count;
        }
        if (universeEmpty) {
            const sample = screenSample(filters, sortBy, sortOrder, limit, market);
            return {
                results: sample,
                total_count: sample.length,
                filters_applied: filters.length,
                cached: false,
                sample_data: true,
                last_updated: new Date().toISOString(),
            };
        }

        stocks = stocks.map((stock) => ({ ...stock, match_score: calculateMatchScore(stock, filters) }));
        if (sortBy === "match_score" || sortBy === "matchScore") {
            const dir = sortOrder === "asc" ? 1 : -1;
            stocks = [...stocks].sort((a, b) => dir * (Number(a.match_score) - Number(b.match_score)));
        }

        const response: ScreenStocksResult = {
            results: stocks.slice(0, limit),
            total_count: stocks.length,
            filters_applied: filters.length,
            cached: false,
            last_updated: new Date().toISOString(),
        };

        if (useCache) await cacheResults(filters, sortBy, sortOrder, market, limit, response);

        return response;
    } catch (err) {
        console.error("[Fundakamental] screening error:", err);
        return { results: [], total_count: 0, cached: false, error: String((err as Error)?.message || err) };
    }
}

/** Predefined screening presets (Value/Growth/Dividend/Quality/Momentum/Tech). */
export function getScreeningPresets() {
    return [
        {
            id: "value_stocks",
            name: "Value Stocks",
            description: "Undervalued companies with low P/E and high dividend yield",
            filters: [
                { field: "pe_ratio", operator: "lt", value: 20 },
                { field: "dividend_yield", operator: "gt", value: 2.0 },
                { field: "debt_to_equity", operator: "lt", value: 1.0 },
            ],
        },
        {
            id: "growth_stocks",
            name: "Growth Stocks",
            description: "High growth companies with strong revenue expansion",
            filters: [
                { field: "revenue_growth", operator: "gt", value: 15 },
                { field: "profit_margin", operator: "gt", value: 15 },
                { field: "market_cap", operator: "gt", value: 1_000_000_000 },
            ],
        },
        {
            id: "dividend_aristocrats",
            name: "Dividend Aristocrats",
            description: "Reliable dividend payers with strong yields",
            filters: [
                { field: "dividend_yield", operator: "gt", value: 3.0 },
                { field: "roe", operator: "gt", value: 15 },
                { field: "debt_to_equity", operator: "lt", value: 0.8 },
            ],
        },
        {
            id: "quality_stocks",
            name: "Quality Stocks",
            description: "High quality companies with strong fundamentals",
            filters: [
                { field: "roe", operator: "gt", value: 15 },
                { field: "profit_margin", operator: "gt", value: 15 },
                { field: "current_ratio", operator: "gt", value: 1.5 },
                { field: "debt_to_equity", operator: "lt", value: 0.5 },
            ],
        },
        {
            id: "momentum_stocks",
            name: "Momentum Stocks",
            description: "Stocks with strong recent performance",
            filters: [
                { field: "change_percent", operator: "gt", value: 5 },
                { field: "volume", operator: "gt", value: 1_000_000 },
            ],
        },
        {
            id: "tech_leaders",
            name: "Technology Leaders",
            description: "Top performing technology companies",
            filters: [
                { field: "sector", operator: "eq", value: "Technology" },
                { field: "market_cap", operator: "gt", value: 10_000_000_000 },
                { field: "revenue_growth", operator: "gt", value: 10 },
            ],
        },
    ];
}
