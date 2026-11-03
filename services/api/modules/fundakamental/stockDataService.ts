// Stock Data Service — Node/TS port of FundaKaMental's
// `utils/stock_data_service.py`, backed by `yahoo-finance2` instead of
// Python's `yfinance`. The Python source could also fall back to Alpha
// Vantage / FMP when an API key was configured; this port only wires up the
// Yahoo Finance path since that's the dependency the task specifies and it
// needs no API key (works for both US and Indian ".NS"/".BO" tickers).
import YahooFinance from "yahoo-finance2";
import { getStockByTicker } from "./stocks.repository.js";
import type { PriceBar } from "./technicalIndicators.js";

const yahooFinance = new YahooFinance();

// --- Rate-limit protection -------------------------------------------------
// Yahoo returns 429 ("Failed to get crumb") to cloud IPs when hit repeatedly.
// We (1) cache results per key, (2) share in-flight requests so concurrent
// callers for the same ticker make one upstream call, and (3) after a 429,
// skip crumb-requiring endpoints for a cooldown instead of retrying each one.
const QUOTE_TTL_MS = 60_000;
const OVERVIEW_TTL_MS = 15 * 60_000;
const HISTORY_TTL_MS = 10 * 60_000;
const SEARCH_TTL_MS = 10 * 60_000;
const FAILURE_TTL_MS = 30_000; // short negative cache so failures aren't retried in a burst
// Cooldown escalates while Yahoo keeps refusing us (60s -> 2m -> 5m -> 15m)
// and resets once a call succeeds, so a blocked IP is probed rarely instead
// of once a minute forever.
const RATE_LIMIT_BACKOFF_MS = [60_000, 120_000, 300_000, 900_000];
const MAX_CACHE_ENTRIES = 2000;

const cache = new Map<string, { value: unknown; expires: number }>();
const inflight = new Map<string, Promise<unknown>>();
let rateLimitedUntil = 0;
let rateLimitStrikes = 0;

function isRateLimitError(err: unknown): boolean {
    const msg = String((err as Error)?.message ?? err);
    return msg.includes("429") || /too many requests/i.test(msg);
}

// Logs once when the limit is first hit and once per escalation; repeats at
// the same level stay silent so Render's logs aren't flooded.
function noteRateLimit(err: unknown): void {
    if (!isRateLimitError(err)) return;
    if (Date.now() < rateLimitedUntil) return; // already cooling down, nothing new to report
    const level = Math.min(rateLimitStrikes, RATE_LIMIT_BACKOFF_MS.length - 1);
    const cooldown = RATE_LIMIT_BACKOFF_MS[level];
    if (rateLimitStrikes === 0 || level > Math.min(rateLimitStrikes - 1, RATE_LIMIT_BACKOFF_MS.length - 1)) {
        console.warn(`[Fundakamental] Yahoo rate-limited (429); pausing Yahoo calls for ${cooldown / 1000}s (served from cache/DB meanwhile)`);
    }
    rateLimitStrikes += 1;
    rateLimitedUntil = Date.now() + cooldown;
}

function noteSuccess(): void {
    if (rateLimitStrikes > 0) {
        console.info("[Fundakamental] Yahoo recovered; resuming live calls");
        rateLimitStrikes = 0;
        rateLimitedUntil = 0;
    }
}

const isRateLimited = (): boolean => Date.now() < rateLimitedUntil;

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T | null>): Promise<T | null> {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T | null;

    const pending = inflight.get(key);
    if (pending) return pending as Promise<T | null>;

    const p = (async () => {
        const value = await fn();
        if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value as string);
        cache.set(key, { value, expires: Date.now() + (value == null ? FAILURE_TTL_MS : ttlMs) });
        return value;
    })().finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
}

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
    quick_ratio: number | null;
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
export function getCompanyOverview(ticker: string): Promise<StockOverview | null> {
    return cached(`overview:${ticker}`, OVERVIEW_TTL_MS, () => fetchCompanyOverview(ticker));
}

async function fetchCompanyOverview(ticker: string): Promise<StockOverview | null> {
    if (isRateLimited()) return null;
    try {
        const result = await yahooFinance.quoteSummary(ticker, {
            modules: ["assetProfile", "summaryDetail", "defaultKeyStatistics", "financialData", "price"],
        });

        noteSuccess();
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
            quick_ratio: financialData?.quickRatio ?? null,
            // Yahoo quotes debt/equity as a percentage (150 = 1.5x); the screener
            // and its presets use the plain ratio.
            debt_to_equity: financialData?.debtToEquity == null ? null : financialData.debtToEquity / 100,
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
        noteRateLimit(err);
        if (!isRateLimitError(err)) console.error(`[Fundakamental] error fetching Yahoo Finance overview for ${ticker}:`, (err as Error)?.message || err);
        return null;
    }
}

/* Financial statements ------------------------------------------------------ */

export interface FinancialPeriod {
    date: string; // period end, YYYY-MM-DD
    revenue: number | null;
    gross_profit: number | null;
    operating_income: number | null;
    ebitda: number | null;
    net_income: number | null;
    eps: number | null;
    total_assets: number | null;
    total_debt: number | null;
    equity: number | null;
    cash: number | null;
    operating_cf: number | null;
    capex: number | null;
    free_cf: number | null;
    // Derived (percent, except debt_to_equity which is a plain ratio)
    revenue_growth: number | null;
    net_income_growth: number | null;
    gross_margin: number | null;
    operating_margin: number | null;
    net_margin: number | null;
    roe: number | null;
    debt_to_equity: number | null;
}

export interface CompanyFinancials {
    ticker: string;
    annual: FinancialPeriod[]; // oldest -> newest
    quarterly: FinancialPeriod[];
}

const FINANCIALS_TTL_MS = 6 * 60 * 60_000;

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const pct = (a: number | null, b: number | null): number | null => (a === null || b === null || b === 0 ? null : (a / b) * 100);
const growth = (cur: number | null, prev: number | null): number | null =>
    cur === null || prev === null || prev <= 0 ? null : ((cur - prev) / prev) * 100;

export function toPeriods(rows: Array<Record<string, unknown>>, annual: boolean): FinancialPeriod[] {
    const sorted = [...rows]
        .filter((r) => r.date)
        .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
    const base = sorted.map((r) => {
        const netIncome = num(r.netIncomeCommonStockholders) ?? num(r.netIncome);
        const revenue = num(r.totalRevenue);
        const equity = num(r.stockholdersEquity) ?? num(r.commonStockEquity);
        const debt = num(r.totalDebt);
        const opIncome = num(r.operatingIncome);
        const gross = num(r.grossProfit);
        const opCf = num(r.operatingCashFlow);
        const capex = num(r.capitalExpenditure);
        return {
            date: new Date(r.date as string).toISOString().slice(0, 10),
            revenue,
            gross_profit: gross,
            operating_income: opIncome,
            ebitda: num(r.EBITDA) ?? num(r.ebitda),
            net_income: netIncome,
            eps: num(r.dilutedEPS) ?? num(r.basicEPS),
            total_assets: num(r.totalAssets),
            total_debt: debt,
            equity,
            cash: num(r.cashAndCashEquivalents),
            operating_cf: opCf,
            capex,
            free_cf: num(r.freeCashFlow) ?? (opCf !== null && capex !== null ? opCf + capex : null),
            gross_margin: pct(gross, revenue),
            operating_margin: pct(opIncome, revenue),
            net_margin: pct(netIncome, revenue),
            // Annual only is meaningful; quarterly ROE would be a quarter's return.
            roe: annual ? pct(netIncome, equity) : null,
            debt_to_equity: debt !== null && equity ? debt / equity : null,
        };
    });
    // Prior year = the row ~12 months earlier (by date: Yahoo leaves some quarters sparse).
    const yearAgo = (date: string) => {
        const t = new Date(date).getTime();
        return base.find((r) => Math.abs(t - new Date(r.date).getTime() - 365 * 86400_000) < 25 * 86400_000) ?? null;
    };
    return base.map((row) => {
        const prev = yearAgo(row.date);
        return {
            ...row,
            revenue_growth: growth(row.revenue, prev?.revenue ?? null),
            net_income_growth: growth(row.net_income, prev?.net_income ?? null),
        };
    });
}

async function fetchFinancialSeries(ticker: string, type: "annual" | "quarterly"): Promise<Array<Record<string, unknown>>> {
    const rows = await yahooFinance.fundamentalsTimeSeries(
        ticker,
        { period1: new Date(Date.now() - 6 * 365 * 24 * 3600_000), type, module: "all" },
        { validateResult: false },
    );
    return rows as unknown as Array<Record<string, unknown>>;
}

/** Annual (≈5 yrs) and quarterly statements for a ticker, with growth/margin/ROE derived. */
export function getCompanyFinancials(ticker: string): Promise<CompanyFinancials | null> {
    return cached(`financials:${ticker}`, FINANCIALS_TTL_MS, async () => {
        if (isRateLimited()) return null;
        try {
            const [annual, quarterly] = await Promise.all([fetchFinancialSeries(ticker, "annual"), fetchFinancialSeries(ticker, "quarterly")]);
            noteSuccess();
            if (annual.length === 0 && quarterly.length === 0) return null;
            return {
                ticker,
                annual: toPeriods(annual, true).filter((a) => a.revenue !== null || a.net_income !== null),
                // Quarters with no income figures (balance-sheet-only rows) aren't useful here.
                quarterly: toPeriods(quarterly, false)
                    .filter((q) => q.revenue !== null || q.net_income !== null)
                    .slice(-8),
            };
        } catch (err) {
            noteRateLimit(err);
            if (!isRateLimitError(err)) console.error(`[Fundakamental] error fetching financials for ${ticker}:`, (err as Error)?.message || err);
            return null;
        }
    });
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
    return cached(`quote:${ticker}`, QUOTE_TTL_MS, () => fetchQuote(ticker));
}

/**
 * A quote from Yahoo right now: no in-memory cache and no fall-back to the
 * price already saved in funda_stocks (which getQuote does). For the refresh
 * job, which must not write a stale price back as if it were fresh.
 */
export async function getLiveQuote(ticker: string): Promise<QuoteData | null> {
    return (await quoteFromQuoteApi(ticker)) ?? (await quoteFromChartApi(ticker));
}

async function fetchQuote(ticker: string): Promise<QuoteData | null> {
    // Yahoo's quote API needs a session cookie ("crumb") that it often
    // refuses to cloud servers like Render, so a live price can come back
    // empty there while working fine locally. Fall back to the chart API
    // (no crumb needed), then to the last cached price in funda_stocks, so
    // portfolios and watchlists still show a value.
    return (await quoteFromQuoteApi(ticker)) ?? (await quoteFromChartApi(ticker)) ?? (await quoteFromCache(ticker));
}

async function quoteFromQuoteApi(ticker: string): Promise<QuoteData | null> {
    if (isRateLimited()) return null; // skip straight to chart API / cache
    try {
        const q = await yahooFinance.quote(ticker);
        noteSuccess();
        if (!q?.symbol || q.regularMarketPrice == null) return null;
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
        noteRateLimit(err);
        if (!isRateLimitError(err)) console.error(`[Fundakamental] quote API failed for ${ticker}, trying chart API:`, (err as Error)?.message || err);
        return null;
    }
}

async function quoteFromChartApi(ticker: string): Promise<QuoteData | null> {
    try {
        const chart = await yahooFinance.chart(ticker, {
            period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            interval: "1d",
        });
        const meta = chart?.meta;
        const price = meta?.regularMarketPrice;
        if (price == null) return null;
        // Day change is against the previous session's close (the second-last
        // daily bar) — chartPreviousClose is the close before the whole window.
        const closes = (chart.quotes || []).map((q) => q.close).filter((c): c is number => c != null);
        const prev = closes.length >= 2 ? closes[closes.length - 2] : meta.chartPreviousClose ?? null;
        const change = prev != null ? price - prev : null;
        return {
            ticker: meta.symbol || ticker,
            price,
            change,
            change_percent: change != null && prev ? (change / prev) * 100 : null,
            volume: meta.regularMarketVolume ?? null,
            previous_close: prev,
            open: null,
            high: meta.regularMarketDayHigh ?? null,
            low: meta.regularMarketDayLow ?? null,
        };
    } catch (err) {
        noteRateLimit(err);
        if (!isRateLimitError(err)) console.error(`[Fundakamental] chart API failed for ${ticker}, using cached price:`, (err as Error)?.message || err);
        return null;
    }
}

async function quoteFromCache(ticker: string): Promise<QuoteData | null> {
    try {
        const { data } = await getStockByTicker(ticker);
        if (!data || data.price == null) return null;
        return {
            ticker: data.ticker,
            price: Number(data.price),
            change: data.change ?? null,
            change_percent: data.change_percent ?? null,
            volume: data.volume ?? null,
            previous_close: null,
            open: null,
            high: null,
            low: null,
        };
    } catch {
        return null;
    }
}

/** Search for companies by name or ticker symbol via Yahoo Finance. */
export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
    const key = `search:${query.trim().toLowerCase()}`;
    return (await cached(key, SEARCH_TTL_MS, () => fetchSearch(query))) ?? [];
}

async function fetchSearch(query: string): Promise<CompanySearchResult[] | null> {
    if (isRateLimited()) return null;
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
        noteRateLimit(err);
        if (!isRateLimitError(err)) console.error("[Fundakamental] error searching companies:", (err as Error)?.message || err);
        return null;
    }
}

/** Get historical daily OHLCV data for a date range. */
export async function getHistoricalPrices(ticker: string, startDate: Date, endDate: Date): Promise<PriceBar[]> {
    // Key on day granularity so "now"-based end dates still hit the cache.
    const day = (d: Date) => d.toISOString().slice(0, 10);
    const key = `history:${ticker}:${day(startDate)}:${day(endDate)}`;
    return (await cached(key, HISTORY_TTL_MS, () => fetchHistoricalPrices(ticker, startDate, endDate))) ?? [];
}

async function fetchHistoricalPrices(ticker: string, startDate: Date, endDate: Date): Promise<PriceBar[] | null> {
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
        noteRateLimit(err);
        if (!isRateLimitError(err)) console.error(`[Fundakamental] error fetching historical prices for ${ticker}:`, (err as Error)?.message || err);
        return null;
    }
}
