// Live stock data pipeline — Node/TS port of `utils/stock_pipeline.py`.
//
// Fetches fundamentals for a curated India + US universe and upserts them
// into `funda_stocks`, tagged with `market`. Used by the admin refresh
// endpoint (POST /fundakamental/stocks/refresh). The Python source's
// `StockRefreshScheduler` (a startup/interval scheduler wired up in
// main.py's app lifespan) is intentionally not ported here — it isn't
// called by any of the endpoint files in this slice's scope, and wiring a
// background scheduler into this app's startup belongs to whoever wires
// `index.ts` (explicitly out of scope for this task).
import { getCompanyOverview } from "./stockDataService.js";
import { upsertStock } from "./stocks.repository.js";

export const INDIA_TICKERS: string[] = [
    "TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS", "LTIM.NS", "PERSISTENT.NS",
    "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS", "BAJFINANCE.NS",
    "RELIANCE.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "TATAPOWER.NS", "COALINDIA.NS",
    "HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS", "MARICO.NS", "TATACONSUM.NS",
    "SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
    "MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "EICHERMOT.NS", "HEROMOTOCO.NS",
    "TATASTEEL.NS", "JSWSTEEL.NS", "HINDALCO.NS", "VEDL.NS",
    "LT.NS", "ULTRACEMCO.NS", "GRASIM.NS", "ADANIPORTS.NS", "DLF.NS",
    "BHARTIARTL.NS", "ADANIENT.NS", "HAVELLS.NS", "PIDILITIND.NS", "ASIANPAINT.NS", "TITAN.NS",
];

export const US_TICKERS: string[] = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AVGO", "ORCL", "ADBE",
    "CRM", "AMD", "INTC", "CSCO", "QCOM", "TXN", "IBM", "NOW", "INTU", "AMAT",
    "JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "AXP", "BLK", "SCHW",
    "JNJ", "UNH", "LLY", "PFE", "ABBV", "MRK", "TMO", "ABT", "DHR", "BMY",
    "WMT", "PG", "KO", "PEP", "COST", "MCD", "NKE", "HD", "SBUX", "DIS",
    "XOM", "CVX", "COP", "CAT", "BA", "GE", "HON", "UPS", "LMT",
];

export type Market = "india" | "us";

function normalise(overview: Record<string, unknown>, rawTicker: string, market: Market): Record<string, unknown> {
    const display = rawTicker.toUpperCase().endsWith(".NS") ? rawTicker.slice(0, -3) : rawTicker;
    return {
        ...overview,
        ticker: display,
        market,
        currency: overview.currency ?? (market === "india" ? "INR" : "USD"),
        is_active: true,
        data_source: "yfinance",
    };
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function populate(tickers: string[], market: Market, log: (msg: string) => void): Promise<{ ok: number; err: number }> {
    let ok = 0;
    let err = 0;
    for (let i = 0; i < tickers.length; i++) {
        const raw = tickers[i];
        try {
            const overview = await getCompanyOverview(raw);
            if (overview && overview.name) {
                const { error } = await upsertStock(normalise(overview as unknown as Record<string, unknown>, raw, market));
                if (error) throw error;
                ok += 1;
                log(`[${market}] [${i + 1}/${tickers.length}] OK ${overview.name}`);
            } else {
                err += 1;
                log(`[${market}] [${i + 1}/${tickers.length}] no data for ${raw}`);
            }
        } catch (e) {
            err += 1;
            log(`[${market}] [${i + 1}/${tickers.length}] error ${raw}: ${String((e as Error)?.message || e).slice(0, 60)}`);
        }
        await sleep(400); // be gentle with Yahoo
    }
    return { ok, err };
}

export async function refresh(
    markets: Market[] = ["india", "us"],
    log: (msg: string) => void = console.log,
): Promise<Record<string, { saved: number; errors: number }>> {
    const result: Record<string, { saved: number; errors: number }> = {};
    if (markets.includes("india")) {
        const { ok, err } = await populate(INDIA_TICKERS, "india", log);
        result.india = { saved: ok, errors: err };
    }
    if (markets.includes("us")) {
        const { ok, err } = await populate(US_TICKERS, "us", log);
        result.us = { saved: ok, errors: err };
    }
    return result;
}
