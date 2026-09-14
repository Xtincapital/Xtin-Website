// Sample stock universe for the screener — Node/TS port of
// `utils/sample_stocks.py`.
//
// The live screener reads the Supabase `funda_stocks` table. When that
// table is empty (e.g. before a data feed is wired up), we fall back to
// this curated set so the screener still demonstrates value instead of
// returning nothing. Figures are illustrative (ported verbatim from the
// Python source).
export interface SampleStock {
    ticker: string;
    company: string;
    sector: string;
    price: number;
    market_cap: number;
    market_cap_label: string;
    pe_ratio: number;
    revenue_growth: number;
    profit_margin: number;
    roe: number;
    debt_to_equity: number;
    dividend_yield: number;
    current_ratio: number;
}

export interface ScreenFilter {
    field: string;
    operator: string;
    value: unknown;
}

// Fields align with the screener filter set: sector, market_cap, pe_ratio,
// revenue_growth, profit_margin, roe, debt_to_equity, dividend_yield,
// current_ratio. market_cap is a number (USD) for filtering; market_cap_label
// is the display string.
export const SAMPLE_STOCKS: SampleStock[] = [
    { ticker: "AAPL", company: "Apple Inc.", sector: "Technology", price: 225.5, market_cap: 2_800_000_000_000, market_cap_label: "2.8T", pe_ratio: 28.5, revenue_growth: 2.8, profit_margin: 25.5, roe: 147.0, debt_to_equity: 1.5, dividend_yield: 0.5, current_ratio: 0.9 },
    { ticker: "MSFT", company: "Microsoft Corporation", sector: "Technology", price: 415.2, market_cap: 3_100_000_000_000, market_cap_label: "3.1T", pe_ratio: 34.0, revenue_growth: 16.2, profit_margin: 35.8, roe: 39.0, debt_to_equity: 0.4, dividend_yield: 0.7, current_ratio: 1.3 },
    { ticker: "NVDA", company: "NVIDIA Corporation", sector: "Technology", price: 880.2, market_cap: 2_200_000_000_000, market_cap_label: "2.2T", pe_ratio: 65.2, revenue_growth: 126.0, profit_margin: 52.1, roe: 91.0, debt_to_equity: 0.2, dividend_yield: 0.03, current_ratio: 4.2 },
    { ticker: "GOOGL", company: "Alphabet Inc.", sector: "Communication Services", price: 168.0, market_cap: 2_100_000_000_000, market_cap_label: "2.1T", pe_ratio: 24.0, revenue_growth: 13.0, profit_margin: 27.0, roe: 29.0, debt_to_equity: 0.1, dividend_yield: 0.0, current_ratio: 2.1 },
    { ticker: "META", company: "Meta Platforms Inc.", sector: "Communication Services", price: 505.0, market_cap: 1_300_000_000_000, market_cap_label: "1.3T", pe_ratio: 27.0, revenue_growth: 22.0, profit_margin: 34.0, roe: 34.0, debt_to_equity: 0.3, dividend_yield: 0.4, current_ratio: 2.7 },
    { ticker: "JPM", company: "JPMorgan Chase & Co.", sector: "Financials", price: 205.0, market_cap: 590_000_000_000, market_cap_label: "590B", pe_ratio: 12.0, revenue_growth: 12.0, profit_margin: 32.0, roe: 17.0, debt_to_equity: 1.2, dividend_yield: 2.2, current_ratio: 1.1 },
    { ticker: "JNJ", company: "Johnson & Johnson", sector: "Healthcare", price: 155.0, market_cap: 375_000_000_000, market_cap_label: "375B", pe_ratio: 15.0, revenue_growth: 4.0, profit_margin: 18.0, roe: 24.0, debt_to_equity: 0.5, dividend_yield: 3.1, current_ratio: 1.1 },
    { ticker: "PG", company: "Procter & Gamble Co.", sector: "Consumer Discretionary", price: 165.0, market_cap: 390_000_000_000, market_cap_label: "390B", pe_ratio: 26.0, revenue_growth: 3.5, profit_margin: 18.5, roe: 31.0, debt_to_equity: 0.6, dividend_yield: 2.4, current_ratio: 0.7 },
    { ticker: "KO", company: "Coca-Cola Co.", sector: "Consumer Discretionary", price: 62.0, market_cap: 268_000_000_000, market_cap_label: "268B", pe_ratio: 24.0, revenue_growth: 3.0, profit_margin: 23.0, roe: 40.0, debt_to_equity: 1.6, dividend_yield: 3.1, current_ratio: 1.1 },
    { ticker: "WMT", company: "Walmart Inc.", sector: "Consumer Discretionary", price: 68.0, market_cap: 545_000_000_000, market_cap_label: "545B", pe_ratio: 30.0, revenue_growth: 6.0, profit_margin: 2.5, roe: 20.0, debt_to_equity: 0.6, dividend_yield: 1.3, current_ratio: 0.8 },
    { ticker: "XOM", company: "Exxon Mobil Corporation", sector: "Energy", price: 115.0, market_cap: 460_000_000_000, market_cap_label: "460B", pe_ratio: 13.5, revenue_growth: -3.0, profit_margin: 10.5, roe: 18.0, debt_to_equity: 0.2, dividend_yield: 3.3, current_ratio: 1.3 },
    { ticker: "TSLA", company: "Tesla Inc.", sector: "Consumer Discretionary", price: 250.0, market_cap: 800_000_000_000, market_cap_label: "800B", pe_ratio: 62.0, revenue_growth: 19.0, profit_margin: 15.0, roe: 22.0, debt_to_equity: 0.1, dividend_yield: 0.0, current_ratio: 1.7 },
    // India
    { ticker: "RELIANCE", company: "Reliance Industries Ltd", sector: "Energy", price: 2950.0, market_cap: 240_000_000_000, market_cap_label: "20L Cr", pe_ratio: 25.0, revenue_growth: 8.0, profit_margin: 8.5, roe: 9.0, debt_to_equity: 0.4, dividend_yield: 0.4, current_ratio: 1.1 },
    { ticker: "TCS", company: "Tata Consultancy Services Ltd", sector: "Technology", price: 3900.0, market_cap: 175_000_000_000, market_cap_label: "14L Cr", pe_ratio: 30.0, revenue_growth: 7.0, profit_margin: 19.0, roe: 47.0, debt_to_equity: 0.1, dividend_yield: 1.4, current_ratio: 2.5 },
    { ticker: "INFY", company: "Infosys Ltd", sector: "Technology", price: 1650.0, market_cap: 85_000_000_000, market_cap_label: "7L Cr", pe_ratio: 24.0, revenue_growth: 6.0, profit_margin: 17.0, roe: 32.0, debt_to_equity: 0.1, dividend_yield: 2.2, current_ratio: 2.3 },
    { ticker: "HDFCBANK", company: "HDFC Bank Ltd", sector: "Financials", price: 1650.0, market_cap: 150_000_000_000, market_cap_label: "12L Cr", pe_ratio: 19.0, revenue_growth: 20.0, profit_margin: 26.0, roe: 17.0, debt_to_equity: 1.1, dividend_yield: 1.1, current_ratio: 1.0 },
    { ticker: "ITC", company: "ITC Ltd", sector: "Consumer Discretionary", price: 460.0, market_cap: 68_000_000_000, market_cap_label: "5.7L Cr", pe_ratio: 27.0, revenue_growth: 6.0, profit_margin: 25.0, roe: 28.0, debt_to_equity: 0.0, dividend_yield: 3.2, current_ratio: 2.8 },
    { ticker: "SUNPHARMA", company: "Sun Pharmaceutical Industries Ltd", sector: "Healthcare", price: 1750.0, market_cap: 52_000_000_000, market_cap_label: "4.2L Cr", pe_ratio: 38.0, revenue_growth: 10.0, profit_margin: 17.0, roe: 16.0, debt_to_equity: 0.1, dividend_yield: 0.8, current_ratio: 2.0 },
    { ticker: "MARUTI", company: "Maruti Suzuki India Ltd", sector: "Consumer Discretionary", price: 12500.0, market_cap: 47_000_000_000, market_cap_label: "3.9L Cr", pe_ratio: 28.0, revenue_growth: 14.0, profit_margin: 9.0, roe: 16.0, debt_to_equity: 0.0, dividend_yield: 0.9, current_ratio: 0.9 },
    { ticker: "ASIANPAINT", company: "Asian Paints Ltd", sector: "Materials", price: 2900.0, market_cap: 33_000_000_000, market_cap_label: "2.8L Cr", pe_ratio: 55.0, revenue_growth: 4.0, profit_margin: 13.0, roe: 28.0, debt_to_equity: 0.1, dividend_yield: 1.1, current_ratio: 1.8 },
];

function num(v: unknown): number {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isNaN(n) ? NaN : n;
}

const OPS: Record<string, (a: unknown, b: unknown) => boolean> = {
    eq: (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
    neq: (a, b) => String(a).toLowerCase() !== String(b).toLowerCase(),
    gt: (a, b) => num(a) > num(b),
    gte: (a, b) => num(a) >= num(b),
    lt: (a, b) => num(a) < num(b),
    lte: (a, b) => num(a) <= num(b),
};

function passes(stock: Record<string, unknown>, f: ScreenFilter): boolean {
    const { field, operator, value } = f;
    if (!(field in stock) || !(operator in OPS)) return true;
    try {
        return OPS[operator](stock[field], value);
    } catch {
        return true;
    }
}

// Which sample tickers are Indian (the rest are US).
const INDIA_TICKERS = new Set(["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC", "SUNPHARMA", "MARUTI", "ASIANPAINT"]);

function marketOf(ticker: string): "india" | "us" {
    return INDIA_TICKERS.has(ticker) ? "india" : "us";
}

function score(stock: SampleStock, filters: ScreenFilter[]): number {
    if (!filters || filters.length === 0) return 85;
    const passed = filters.filter((f) => passes(stock as unknown as Record<string, unknown>, f)).length;
    return Math.trunc(70 + (passed / Math.max(1, filters.length)) * 30);
}

/** Filter + sort the sample universe entirely in memory (returns copies). */
export function screenSample(
    filters: ScreenFilter[],
    sortBy: string,
    sortOrder: string,
    limit: number,
    market?: string | null,
): Array<Record<string, unknown>> {
    const matches: Array<Record<string, unknown>> = [];
    for (const s of SAMPLE_STOCKS) {
        const mkt = marketOf(s.ticker);
        if (market && mkt !== market) continue;
        if ((filters || []).every((f) => passes(s as unknown as Record<string, unknown>, f))) {
            matches.push({ ...s, name: s.company, market: mkt, match_score: score(s, filters) });
        }
    }

    let key = "market_cap";
    if (sortBy === "match_score" || sortBy === "matchScore") key = "match_score";
    else if (SAMPLE_STOCKS.length && sortBy in SAMPLE_STOCKS[0]) key = sortBy;

    try {
        matches.sort((a, b) => {
            const diff = num(a[key]) - num(b[key]);
            return sortOrder === "asc" ? diff : -diff;
        });
    } catch {
        // best-effort sort, matching the Python source's bare except
    }

    return matches.slice(0, limit);
}
