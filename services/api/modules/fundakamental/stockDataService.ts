// Stock Data Service — Node/TS port of FundaKaMental's
// `utils/stock_data_service.py`, backed by `yahoo-finance2` instead of
// Python's `yfinance`. The Python source could also fall back to Alpha
// Vantage / FMP when an API key was configured; this port only wires up the
// Yahoo Finance path since that's the dependency the task specifies and it
// needs no API key (works for both US and Indian ".NS"/".BO" tickers).
import YahooFinance from "yahoo-finance2";
import type { PriceBar } from "./technicalIndicators.js";

const yahooFinance = new YahooFinance();

export interface StockOverview {
    ticker: string;
    name: string | null;
    description: string | null;
    sector: string | null;
    industry: string | null;
    exchange: string | null;
    currency: string | null;
    country: string | null;
    market_cap: number | null;
    pe_ratio: number | null;
    peg_ratio: number | null;
    pb_ratio: number | null;
    dividend_yield: number | null;
    eps: number | null;
    profit_margin: number | null;
    operating_margin: number | null;
    roe: number | null;
    roa: number | null;
    revenue_growth: number | null;
    earnings_growth: number | null;
    current_ratio: number | null;
    debt_to_equity: number | null;
    beta: number | null;
    week_52_high: number | null;
    week_52_low: number | null;
    avg_volume: number | null;
    shares_outstanding: number | null;
    price: number | null;
    change: number | null;
    change_percent: number | null;
    volume: number | null;
    last_updated: string;
}

export interface QuoteData {
    ticker: string;
    price: number | null;
    change: number | null;
    change_percent: number | null;
    volume: number | null;
    previous_close: number | null;
    open: number | null;
    high: number | null;
    low: number | null;
}

export interface CompanySearchResult {
    ticker: string;
    name: string;
    sector: string;
    exchange?: string;
}

/**
 * Get comprehensive company fundamentals for a ticker.
 *
 * Node equivalent of the Python source's `_get_overview_yfinance`, which
 * read `yf.Ticker(ticker).info`. `yahoo-finance2` doesn't expose an
 * equivalent flat `.info` dict, so we request the same underlying data via
 * `quoteSummary`'s modules instead.
 *
 * Note on scaling: the Python source multiplies Yahoo's ratio/margin
 * fields (dividendYield, profitMargins, etc.) by 100, assuming they come
 * back as 0-1 fractions. We mirror that here. Yahoo has changed this
 * scaling before across API versions — if displayed percentages look off
 * by 100x, drop the `* 100` in `asPercent` below (there is no live server
 * in this task to verify against).
 */
export async function getCompanyOverview(ticker: string): Promise<StockOverview | null> {
    try {
        const result = await yahooFinance.quoteSummary(ticker, {
            modules: ["assetProfile", "summaryDetail", "defaultKeyStatistics", "financialData", "price"],
        });

        const { assetProfile, summaryDetail, defaultKeyStatistics, financialData, price } = result;
        if (!price?.symbol) return null;

        const asPercent = (v: number | null | undefined): number | null => (v === null || v === undefined ? null : v * 100);

        return {
            ticker: price.symbol,
            name: price.longName || price.shortName || null,
            description: assetProfile?.longBusinessSummary ?? null,
            sector: assetProfile?.sector ?? null,
            industry: assetProfile?.industry ?? null,
            exchange: price.exchangeName ?? price.exchange ?? null,
            currency: price.currency ?? null,
            country: assetProfile?.country ?? null,
            market_cap: price.marketCap ?? null,
            pe_ratio: summaryDetail?.trailingPE ?? summaryDetail?.forwardPE ?? null,
            peg_ratio: defaultKeyStatistics?.pegRatio ?? null,
            pb_ratio: defaultKeyStatistics?.priceToBook ?? null,
            dividend_yield: asPercent(summaryDetail?.dividendYield ?? null),
            eps: defaultKeyStatistics?.trailingEps ?? null,
            profit_margin: asPercent(financialData?.profitMargins ?? null),
            operating_margin: asPercent(financialData?.operatingMargins ?? null),
            roe: asPercent(financialData?.returnOnEquity ?? null),
            roa: asPercent(financialData?.returnOnAssets ?? null),
            revenue_growth: asPercent(financialData?.revenueGrowth ?? null),
            earnings_growth: asPercent(financialData?.earningsGrowth ?? null),
            current_ratio: financialData?.currentRatio ?? null,
            debt_to_equity: financialData?.debtToEquity ?? null,
            beta: summaryDetail?.beta ?? defaultKeyStatistics?.beta ?? null,
            week_52_high: summaryDetail?.fiftyTwoWeekHigh ?? null,
            week_52_low: summaryDetail?.fiftyTwoWeekLow ?? null,
            avg_volume: summaryDetail?.averageVolume ?? null,
            shares_outstanding: defaultKeyStatistics?.sharesOutstanding ?? null,
            price: price.regularMarketPrice ?? null,
            change: price.regularMarketChange ?? null,
            change_percent: price.regularMarketChangePercent ?? null,
            volume: price.regularMarketVolume ?? null,
            last_updated: new Date().toISOString(),
        };
    } catch (err) {
        console.error(`[Fundakamental] error fetching Yahoo Finance overview for ${ticker}:`, err);
        return null;
    }
}

/**
 * Get a real-time-ish quote for a ticker (price/change/volume).
 *
 * The Python source gated this behind an Alpha Vantage / FMP API key and
 * returned null without one — meaning its market-data streamer wouldn't
 * actually stream anything by default. This port always uses
 * `yahoo-finance2` here too, per the task's direction to use it for
 * "quotes/history/fundamentals", so streaming works out of the box.
 */
export async function getQuote(ticker: string): Promise<QuoteData | null> {
    try {
        const q = await yahooFinance.quote(ticker);
        if (!q?.symbol) return null;
        return {
            ticker: q.symbol,
            price: q.regularMarketPrice ?? null,
            change: q.regularMarketChange ?? null,
            change_percent: q.regularMarketChangePercent ?? null,
            volume: q.regularMarketVolume ?? null,
            previous_close: q.regularMarketPreviousClose ?? null,
            open: q.regularMarketOpen ?? null,
            high: q.regularMarketDayHigh ?? null,
            low: q.regularMarketDayLow ?? null,
        };
    } catch (err) {
        console.error(`[Fundakamental] error fetching quote for ${ticker}:`, err);
        return null;
    }
}

/** Search for companies by name or ticker symbol via Yahoo Finance. */
export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
    try {
        const results = await yahooFinance.search(query, { quotesCount: 10, newsCount: 0 });
        return results.quotes
            .filter((q): q is typeof q & { isYahooFinance: true; symbol: string } => Boolean((q as { isYahooFinance?: boolean }).isYahooFinance))
            .slice(0, 10)
            .map((q) => ({
                ticker: q.symbol,
                name: q.longname || q.shortname || "",
                sector: q.sector || "",
                exchange: q.exchange,
            }));
    } catch (err) {
        console.error("[Fundakamental] error searching companies:", err);
        return [];
    }
}

/** Get historical daily OHLCV data for a date range. */
export async function getHistoricalPrices(ticker: string, startDate: Date, endDate: Date): Promise<PriceBar[]> {
    try {
        const result = await yahooFinance.chart(ticker, {
            period1: startDate,
            period2: endDate,
            interval: "1d",
            return: "array",
        });

        return result.quotes
            .filter((q) => q.close !== null && q.open !== null && q.high !== null && q.low !== null)
            .map((q) => ({
                date: q.date.toISOString().slice(0, 10),
                open: q.open as number,
                high: q.high as number,
                low: q.low as number,
                close: q.close as number,
                volume: q.volume ?? 0,
                adjusted_close: q.adjclose ?? q.close,
            }));
    } catch (err) {
        console.error(`[Fundakamental] error fetching historical prices for ${ticker}:`, err);
        return [];
    }
}
