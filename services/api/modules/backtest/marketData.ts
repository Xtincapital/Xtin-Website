// Market data layer — port of `data/base.py` + `data/yfinance_source.py`.
//
// `getCandles` is the single entry point. The special "SAMPLE" symbol is served
// by the deterministic synthetic source (works offline); everything else comes
// from Yahoo Finance with a Supabase JSON cache in between. Yahoo throttles
// cloud IPs, so a 429 pauses upstream calls for an escalating cooldown instead
// of retrying on every request (same approach as the FundaKaMental data layer).
import YahooFinance from "yahoo-finance2";
import { generateSampleCandles } from "./synthetic.js";
import { getCachedCandles, saveCachedCandles } from "./repository.js";
import type { Candle } from "./types.js";

export class MarketDataError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MarketDataError";
    }
}

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const INTERVAL: Record<string, string> = { "1m": "1m", "5m": "5m", "15m": "15m", "1h": "60m", "1d": "1d" };

// Indices trade under Yahoo's caret-prefixed tickers, not the .NS/.BO equity
// suffix — a plain "NIFTY.NS" 404s.
const INDEX_SYMBOLS: Record<string, string> = { NIFTY: "^NSEI", NIFTY50: "^NSEI", BANKNIFTY: "^NSEBANK", SENSEX: "^BSESN" };

// Candle times are naive local-clock strings, so intraday square-off times
// ("15:15") mean the exchange's clock.
const EXCHANGE_TZ: Record<string, string> = { NSE: "Asia/Kolkata", BSE: "Asia/Kolkata", NFO: "Asia/Kolkata", MCX: "Asia/Kolkata", NASDAQ: "America/New_York", NYSE: "America/New_York" };

export const yahooSymbol = (symbol: string, exchange: string): string => {
    if (INDEX_SYMBOLS[symbol]) return INDEX_SYMBOLS[symbol];
    if (exchange === "NSE") return `${symbol}.NS`;
    if (exchange === "BSE") return `${symbol}.BO`;
    return symbol;
};

/** Format an instant as the naive local-clock ISO string "YYYY-MM-DDTHH:MM:SS" in `timeZone`. */
export function toLocalIso(date: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

// ── 429 protection ──────────────────────────────────────────────────────────
const BACKOFF_MS = [60_000, 120_000, 300_000, 900_000];
let rateLimitedUntil = 0;
let strikes = 0;

const isRateLimit = (err: unknown) => {
    const msg = String((err as Error)?.message ?? err);
    return msg.includes("429") || /too many requests/i.test(msg);
};

async function fetchYahooCandles(symbol: string, exchange: string, timeframe: string, start: string, end: string): Promise<Candle[]> {
    if (Date.now() < rateLimitedUntil) {
        throw new MarketDataError("Market data is temporarily rate-limited. Please try again in a minute, or use the offline SAMPLE symbol.");
    }
    const ticker = yahooSymbol(symbol, exchange);
    const interval = INTERVAL[timeframe] ?? "1d";
    const tz = EXCHANGE_TZ[exchange] ?? "UTC";

    let quotes: { date: Date; open: number | null; high: number | null; low: number | null; close: number | null; volume: number | null }[];
    try {
        // Yahoo's period2 is exclusive — add a day so `end` is included.
        const result = await yahooFinance.chart(ticker, {
            period1: new Date(`${start}T00:00:00Z`),
            period2: new Date(new Date(`${end}T00:00:00Z`).getTime() + 86_400_000),
            interval: interval as "1d",
            return: "array",
        });
        quotes = (result as unknown as { quotes: typeof quotes }).quotes;
        if (strikes > 0) {
            strikes = 0;
            rateLimitedUntil = 0;
        }
    } catch (err) {
        if (isRateLimit(err)) {
            rateLimitedUntil = Date.now() + BACKOFF_MS[Math.min(strikes, BACKOFF_MS.length - 1)];
            strikes += 1;
            throw new MarketDataError("Market data is temporarily rate-limited. Please try again in a minute, or use the offline SAMPLE symbol.");
        }
        const msg = String((err as Error)?.message ?? err);
        if (/not found|no data|404|delisted|invalid/i.test(msg)) throw new MarketDataError(unknownSymbol(symbol, exchange));
        throw new MarketDataError(`The market data provider didn't respond for ${ticker}. Please try again in a moment.`);
    }

    const candles: Candle[] = [];
    const seen = new Set<string>();
    for (const q of quotes) {
        if (q.open == null || q.high == null || q.low == null || q.close == null) continue;
        const time = toLocalIso(q.date, tz);
        if (seen.has(time)) continue;
        seen.add(time);
        candles.push({ time, open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume ?? 0 });
    }
    if (!candles.length) {
        throw new MarketDataError(
            timeframe === "1d"
                ? unknownSymbol(symbol, exchange)
                : `No ${timeframe} candles for ${symbol} in that window — intraday history only goes back about 60 days (1-minute: about 7). Try a shorter window or daily candles.`
        );
    }
    return candles;
}

const unknownSymbol = (symbol: string, exchange: string) =>
    `We couldn't find market data for "${symbol}" on ${exchange}. Check the spelling and use the exchange ticker (e.g. RELIANCE, TCS, HDFCBANK, NIFTY), or try the offline SAMPLE symbol`;

export type CandleRequest = { symbol: string; exchange: string; timeframe: string; start: string; end: string };

export async function getCandles(req: CandleRequest): Promise<Candle[]> {
    const symbol = req.symbol.trim().toUpperCase();
    const exchange = req.exchange.trim().toUpperCase();

    if (symbol === "SAMPLE") return generateSampleCandles(req.timeframe, req.start, req.end);

    const key = `${exchange}:${symbol}:${req.timeframe}:${req.start}:${req.end}`;
    const cached = await getCachedCandles(key);
    if (cached?.length) return cached;

    const candles = await fetchYahooCandles(symbol, exchange, req.timeframe, req.start, req.end);
    await saveCachedCandles(key, candles);
    return candles;
}
