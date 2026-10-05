// Keeps funda_stocks prices fresh. Before this nothing refreshed them on a
// schedule, so saved prices went stale (INFY showed a 30 Sep price in search
// on 4 Oct while Quick Access showed the live one).
//
// This is a price-only refresh: one quote per stock, not the full fundamentals
// pull in stockPipeline.ts. Yahoo rate-limits Render's IP, and the quote/chart
// endpoints this uses are far lighter than the crumb-requiring fundamentals
// ones, so it can keep working when a full refresh cannot.
//
// Triggers (all share one single-flight guard, so they can't pile up):
//   - node-cron: India after the NSE close, US after the NYSE close
//   - catch-up shortly after boot if prices are stale (Render's free tier
//     sleeps, so timers alone would often be missed)
//   - POST /api/trigger-stock-refresh?token=CRON_SECRET_TOKEN, e.g. cron-job.org
import cron from "node-cron";
import { getLiveQuote } from "./stockDataService.js";
import { listActiveStocks, updateStockPrice, getNewestStockUpdate } from "./stocks.repository.js";

export type RefreshMarket = "india" | "us";

export type PriceRefreshResult = {
    total: number;
    updated: number;
    failed: number;
    /** Set when the run stopped early because Yahoo kept refusing us. */
    aborted: boolean;
    seconds: number;
};

const MIN_GAP_MS = 30 * 60 * 1000; // ignore triggers that arrive right after a run
const MAX_CONSECUTIVE_FAILURES = 8; // Yahoo is blocking this server; stop instead of grinding through every stock
const CATCH_UP_AFTER_MS = 12 * 60 * 60 * 1000;
const CATCH_UP_DELAY_MS = 90 * 1000;
const TIMEZONE = "Asia/Kolkata";

let running = false;
let lastRun: { at: string; source: string; market: string; result: PriceRefreshResult } | null = null;
let lastFinishedAt = 0;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The `market` column, else guessed from the suffix (older rows saved as "INFY.NS" have none). */
export const marketOf = (row: { ticker: string; market?: string | null }): RefreshMarket =>
    row.market === "india" || row.market === "us" ? row.market : /\.(NS|BO)$/i.test(row.ticker) ? "india" : "us";

/** What Yahoo calls it: Indian stocks saved without a suffix need ".NS". */
export const yahooSymbol = (row: { ticker: string; market?: string | null }): string =>
    marketOf(row) === "india" && !/\.(NS|BO)$/i.test(row.ticker) ? `${row.ticker}.NS` : row.ticker;

export const getPriceRefreshStatus = () => ({ running, lastRun });

async function refreshPrices(market: RefreshMarket | "all", delayMs: number, log: (msg: string) => void): Promise<PriceRefreshResult> {
    const started = Date.now();
    const { data, error } = await listActiveStocks();
    if (error) throw error;
    const rows = (data || []).filter((r) => market === "all" || marketOf(r) === market);

    let updated = 0;
    let failed = 0;
    let streak = 0;
    let aborted = false;
    for (const row of rows) {
        try {
            const quote = await getLiveQuote(yahooSymbol(row));
            if (quote?.price == null) throw new Error("no quote");
            const { error: updateError } = await updateStockPrice(row.ticker, {
                price: quote.price,
                change: quote.change,
                change_percent: quote.change_percent,
                ...(quote.volume != null ? { volume: quote.volume } : {}),
            });
            if (updateError) throw updateError;
            updated++;
            streak = 0;
        } catch (err) {
            failed++;
            streak++;
            log(`[StockRefresh] ${row.ticker}: ${String((err as Error)?.message || err).slice(0, 80)}`);
            if (streak >= MAX_CONSECUTIVE_FAILURES) {
                aborted = true;
                log(`[StockRefresh] ${streak} failures in a row, Yahoo looks blocked; stopping.`);
                break;
            }
        }
        if (delayMs > 0) await sleep(delayMs);
    }
    return { total: rows.length, updated, failed, aborted, seconds: Math.round((Date.now() - started) / 100) / 10 };
}

/**
 * Starts a refresh in the background. Returns `{ started: false }` when one is
 * already running or one finished in the last 30 minutes. `done` resolves with
 * the result and never rejects.
 */
export function startPriceRefresh(opts: {
    source: string;
    market?: RefreshMarket | "all";
    delayMs?: number;
    minGapMs?: number;
    log?: (msg: string) => void;
}): { started: true; done: Promise<PriceRefreshResult | null> } | { started: false; reason: string } {
    const market = opts.market ?? "all";
    if (running) return { started: false, reason: "A price refresh is already running." };
    const gap = opts.minGapMs ?? MIN_GAP_MS;
    if (Date.now() - lastFinishedAt < gap) return { started: false, reason: "Prices were refreshed less than 30 minutes ago." };

    const log = opts.log ?? console.log;
    running = true;
    const done = refreshPrices(market, opts.delayMs ?? 300, log)
        .then((result) => {
            lastRun = { at: new Date().toISOString(), source: opts.source, market, result };
            log(`[StockRefresh] ${opts.source} (${market}): ${result.updated}/${result.total} updated, ${result.failed} failed${result.aborted ? ", aborted" : ""} in ${result.seconds}s`);
            return result;
        })
        .catch((err) => {
            console.error(`[StockRefresh] ${opts.source} failed:`, (err as Error)?.message || err);
            return null;
        })
        .finally(() => {
            running = false;
            lastFinishedAt = Date.now();
        });
    return { started: true, done };
}

/** Test hook: forget the last run so the next call isn't treated as too soon. */
export function resetPriceRefreshState() {
    running = false;
    lastRun = null;
    lastFinishedAt = 0;
}

export function startStockRefreshScheduler() {
    if (process.env.DISABLE_STOCK_REFRESH_CRON === "true") {
        console.log("[StockRefresh] Scheduler is off (DISABLE_STOCK_REFRESH_CRON=true).");
        return;
    }

    // NSE closes 3:30 PM IST; NYSE closes about 1:30-2:30 AM IST the next day, so run it at 7:30 AM.
    const schedules: Array<{ label: string; expr: string; market: RefreshMarket }> = [
        { label: "India (4:00 PM IST, Mon-Fri)", expr: "0 16 * * 1-5", market: "india" },
        { label: "US (7:30 AM IST, Tue-Sat)", expr: "30 7 * * 2-6", market: "us" },
    ];
    for (const { label, expr, market } of schedules) {
        cron.schedule(expr, () => void startPriceRefresh({ source: `cron:${market}`, market }), { timezone: TIMEZONE });
        console.log(`[StockRefresh] Registered ${label} → "${expr}"`);
    }

    // The service may have been asleep through the schedule above.
    const timer = setTimeout(async () => {
        try {
            const { data } = await getNewestStockUpdate();
            const newest = data?.last_updated ? new Date(data.last_updated).getTime() : 0;
            if (Date.now() - newest > CATCH_UP_AFTER_MS) {
                console.log("[StockRefresh] Saved prices are stale; refreshing now.");
                startPriceRefresh({ source: "startup-catch-up" });
            }
        } catch (err) {
            console.error("[StockRefresh] catch-up check failed:", (err as Error)?.message || err);
        }
    }, CATCH_UP_DELAY_MS);
    timer.unref?.();
}
