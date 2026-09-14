// Historical price data service — Node/TS port of the `get_daily_prices`
// path of `utils/historical_data_service.py`'s HistoricalDataService.
//
// Only the daily-price path is ported: it's the only one actually called
// from technicals.py (this slice's scope). The intraday-price path
// (`get_intraday_prices`, `record_price_snapshot`) is only used by
// history.py, which belongs to a different phase/task and isn't touched
// here.
import supabase from "../../supabase/index.js";
import { getHistoricalPrices } from "./stockDataService.js";
import type { PriceBar } from "./technicalIndicators.js";

const PERIOD_TO_DAYS: Record<string, number> = {
    "1d": 1,
    "5d": 5,
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "2y": 730,
    "5y": 1825,
    max: 7300, // ~20 years
};

function calculateStartDate(endDate: Date, period: string): Date {
    const days = PERIOD_TO_DAYS[period] ?? 365;
    return new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
}

function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

async function getCachedDailyPrices(ticker: string, startDate: Date, endDate: Date): Promise<PriceBar[]> {
    try {
        const { data, error } = await supabase
            .from("funda_price_history")
            .select("*")
            .eq("ticker", ticker)
            .gte("date", toISODate(startDate))
            .lte("date", toISODate(endDate))
            .order("date", { ascending: true });
        if (error) throw error;
        return (data || []) as unknown as PriceBar[];
    } catch (err) {
        console.error(`[Fundakamental] error fetching cached prices for ${ticker}:`, err);
        return [];
    }
}

/** Simple check: do we have at least 90% of expected trading days? */
function isCacheComplete(cachedData: PriceBar[], startDate: Date, endDate: Date): boolean {
    if (!cachedData.length) return false;
    const expectedDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
    const tradingDays = expectedDays * 0.7; // ~70% of days are trading days
    return cachedData.length >= tradingDays * 0.9;
}

async function saveDailyPrices(ticker: string, prices: PriceBar[]): Promise<void> {
    if (!prices.length) return;
    const records = prices.map((p) => ({
        ticker,
        date: p.date,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
        adjusted_close: p.adjusted_close ?? p.close,
    }));

    try {
        // onConflict targets the (ticker, date) unique constraint — the
        // Python source's `.upsert(records).execute()` omits an explicit
        // conflict target, which would default to the table's `id` PK and
        // insert duplicates instead of updating; specified explicitly here
        // for correctness (see stocks.repository.ts's upsertStock for the
        // same fix).
        const { error } = await supabase.from("funda_price_history").upsert(records, { onConflict: "ticker,date" });
        if (error) throw error;
    } catch (err) {
        console.error(`[Fundakamental] error saving daily prices for ${ticker}:`, err);
    }
}

/**
 * Get daily historical prices (OHLCV), reading from the `funda_price_history`
 * cache first and falling back to a live Yahoo Finance fetch (which is then
 * cached) when the cache doesn't cover the requested range.
 */
export async function getDailyPrices(ticker: string, period = "1y"): Promise<PriceBar[]> {
    const upperTicker = ticker.toUpperCase();
    const endDate = new Date();
    const startDate = calculateStartDate(endDate, period);

    const cached = await getCachedDailyPrices(upperTicker, startDate, endDate);
    if (isCacheComplete(cached, startDate, endDate)) return cached;

    try {
        const apiData = await getHistoricalPrices(upperTicker, startDate, endDate);
        if (apiData.length) {
            await saveDailyPrices(upperTicker, apiData);
            return apiData;
        }
        return cached;
    } catch (err) {
        console.error(`[Fundakamental] error fetching historical prices for ${upperTicker}:`, err);
        return cached;
    }
}
