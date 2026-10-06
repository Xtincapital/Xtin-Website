// Stocks API — Node/TS port of `api/endpoints/stocks.py`.
//
// Intentionally NOT ported here: the watchlist endpoints
// (`/watchlist/add`, `GET /watchlist`, `DELETE /watchlist/{ticker}`) at the
// bottom of the Python file — a separate task owns watchlists/portfolios
// and will build on top of this module's exports.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateScreenerRequest, validateSaveScreen } from "./stocks.validator.js";
import { searchCompanies as searchCompaniesApi, getCompanyOverview } from "./stockDataService.js";
import { getStockByTicker, upsertStock, searchStocksInDb, getSavedScreens as getSavedScreensRepo, insertSavedScreen } from "./stocks.repository.js";
import { screenStocks, getScreeningPresets as getPresets } from "./stockScreener.js";
import { searchDirectory } from "./companyDirectory.js";
import { refresh as refreshStockPipeline, type Market } from "./stockPipeline.js";
import { timingSafeEqual } from "node:crypto";
import { startPriceRefresh, getPriceRefreshStatus, type RefreshMarket } from "./stockPriceRefresh.js";
import { getMarketStreamerStats } from "./marketStream.js";

const STALE_MS = 60 * 60 * 1000; // 1 hour — matches the Python source's staleness window
// Search shows a saved price only if it is this fresh; an older one disagreed
// with the live price shown elsewhere (price 0 hides it in the UI).
const SEARCH_PRICE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function formatMarketCap(marketCap: unknown, market: "india" | "us" = "us"): string {
    if (marketCap === null || marketCap === undefined || marketCap === "") return "N/A";
    const mc = Number(marketCap);
    if (Number.isNaN(mc)) return String(marketCap);
    if (market === "india") {
        // Indian convention: crore (1e7) and lakh crore (1e12).
        if (mc >= 1e12) return `₹${(mc / 1e12).toFixed(2)}L Cr`;
        if (mc >= 1e7) return `₹${Math.round(mc / 1e7).toLocaleString("en-IN")} Cr`;
        return `₹${mc.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    }
    if (mc >= 1_000_000_000_000) return `$${(mc / 1_000_000_000_000).toFixed(1)}T`;
    if (mc >= 1_000_000_000) return `$${(mc / 1_000_000_000).toFixed(1)}B`;
    if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(1)}M`;
    return `$${mc.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const SEARCH_LIMIT = 50;

// "TCS.NS" and "TCS" are the same company: Yahoo/directory use the suffix,
// funda_stocks stores the bare symbol.
const baseSymbol = (ticker: string) => ticker.toUpperCase().replace(/\.(NS|BO)$/, "");

function directoryFallback(query: string) {
    return searchDirectory(query, SEARCH_LIMIT).map((c) => ({
        ticker: c.ticker,
        name: c.name,
        sector: c.sector,
        price: 0,
        change_percent: 0,
        pe_ratio: null,
        revenue_growth: null,
        profit_margin: null,
        market_cap: "",
    }));
}

/* GET /api/fundakamental/stocks/search?q= (the web client sends ?query=) */
export const searchCompanies = async (req, res) => {
    const q = String(req.query.q || req.query.query || "").trim();
    if (!q) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Query must be at least 1 character" });
    }

    try {
        const apiResults = await searchCompaniesApi(q);
        const { data: dbResults } = await searchStocksInDb(q, 10);

        const combined = new Map<string, Record<string, unknown>>();
        const seen = new Set<string>(); // base symbols already listed

        for (const result of apiResults) {
            if (result.ticker) {
                seen.add(baseSymbol(result.ticker));
                combined.set(result.ticker, {
                    ticker: result.ticker,
                    name: result.name || "",
                    sector: result.sector || "",
                    price: 0,
                    change_percent: 0,
                    pe_ratio: null,
                    revenue_growth: null,
                    profit_margin: null,
                    market_cap: "",
                });
            }
        }

        for (const stock of dbResults || []) {
            if (stock.ticker) {
                seen.add(baseSymbol(stock.ticker));
                const fresh = Date.now() - new Date(stock.last_updated).getTime() < SEARCH_PRICE_MAX_AGE_MS;
                combined.set(stock.ticker, {
                    ticker: stock.ticker,
                    name: stock.name || "",
                    sector: stock.sector || "",
                    price: fresh ? Number(stock.price || 0) : 0,
                    change_percent: fresh ? Number(stock.change_percent || 0) : 0,
                    pe_ratio: null,
                    revenue_growth: null,
                    profit_margin: null,
                    market_cap: String(stock.market_cap || ""),
                });
            }
        }

        // Always add the full offline directory (every NSE + US company). Yahoo
        // rate-limits Render's IP, so relying on it alone left search nearly
        // empty. Entries Yahoo/the DB already returned are skipped.
        for (const c of directoryFallback(q)) {
            const key = baseSymbol(c.ticker as string);
            if (!seen.has(key)) {
                seen.add(key);
                combined.set(c.ticker as string, c);
            }
        }

        return res.status(HTTP_STATUS.OK).json(Array.from(combined.values()).slice(0, SEARCH_LIMIT));
    } catch (err) {
        // Never fail the search UX — fall back to the offline directory.
        console.error("[Fundakamental] stock search failed:", err);
        try {
            return res.status(HTTP_STATUS.OK).json(directoryFallback(q));
        } catch {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Search failed: ${(err as Error)?.message || err}` });
        }
    }
};

/* POST /api/fundakamental/stocks/screener */
export const runStockScreener = async (req, res) => {
    const validation = validateScreenerRequest(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { filters, sort_by, sort_order, limit, market } = validation.data;

    try {
        const results = await screenStocks({
            filters,
            sortBy: sort_by,
            sortOrder: sort_order,
            limit,
            market: market || "india",
        });

        const stockResults = (results.results || []).map((stock: Record<string, unknown>) => ({
            ticker: stock.ticker || "",
            company: stock.name || "",
            sector: stock.sector || "",
            price: Number(stock.price || 0),
            market_cap: formatMarketCap(stock.market_cap, market === "us" ? "us" : "india"),
            pe_ratio: Number(stock.pe_ratio || 0),
            revenue_growth: Number(stock.revenue_growth || 0),
            profit_margin: Number(stock.profit_margin || 0),
            match_score: Math.round(Number(stock.match_score || 0)),
        }));

        return res.status(HTTP_STATUS.OK).json({
            total: results.total_count || 0,
            results: stockResults,
            filters_applied: filters,
            // true when funda_stocks is empty and the built-in sample universe answered
            sample_data: results.sample_data === true,
        });
    } catch (err) {
        console.error("[Fundakamental] screener failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Screening failed: ${(err as Error)?.message || err}` });
    }
};

async function refreshStockInBackground(ticker: string) {
    try {
        const overview = await getCompanyOverview(ticker);
        if (overview) {
            const { error } = await upsertStock(overview as unknown as Record<string, unknown>);
            if (error) throw error;
        }
    } catch (err) {
        console.error(`[Fundakamental] background refresh failed for ${ticker}:`, err);
    }
}

/* GET /api/fundakamental/stocks/details/:ticker */
export const getStockDetails = async (req, res) => {
    const ticker = String(req.params.ticker || "").toUpperCase();

    try {
        const { data: stock } = await getStockByTicker(ticker);
        if (stock) {
            const lastUpdated = new Date(stock.last_updated);
            if (Date.now() - lastUpdated.getTime() > STALE_MS) {
                // Fire-and-forget refresh, mirroring the Python source's
                // `background_tasks.add_task(refresh_stock_data, ...)`.
                void refreshStockInBackground(ticker);
            }
            return res.status(HTTP_STATUS.OK).json(stock);
        }
    } catch (err) {
        console.error(`[Fundakamental] db lookup failed for ${ticker}:`, err);
    }

    try {
        const overview = await getCompanyOverview(ticker);
        if (!overview) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: `Stock ${ticker} not found` });
        }
        const { error } = await upsertStock(overview as unknown as Record<string, unknown>);
        if (error) console.error(`[Fundakamental] failed to cache stock details for ${ticker}:`, error);
        return res.status(HTTP_STATUS.OK).json(overview);
    } catch (err) {
        console.error(`[Fundakamental] failed to fetch stock details for ${ticker}:`, err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to fetch stock details: ${(err as Error)?.message || err}` });
    }
};

const sameToken = (given: unknown, expected: string) => {
    const a = Buffer.from(String(given ?? ""));
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * POST /api/trigger-stock-refresh?token=CRON_SECRET_TOKEN[&market=india|us|all]
 * For an external scheduler (cron-job.org). Answers at once and refreshes
 * prices in the background. Unlike the newsletter trigger, this refuses to run
 * when CRON_SECRET_TOKEN isn't set rather than letting anyone call it.
 */
export const triggerStockRefresh = async (req, res) => {
    const secret = process.env.CRON_SECRET_TOKEN;
    if (!secret) return res.status(503).json({ error: "CRON_SECRET_TOKEN is not configured" });
    if (!sameToken(req.query.token || req.headers["x-cron-token"], secret)) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Invalid cron token" });
    }
    const market = String(req.query.market || "all");
    if (!["all", "india", "us"].includes(market)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "market must be india, us or all" });
    }

    const run = startPriceRefresh({ source: "http-trigger", market: market as RefreshMarket | "all" });
    // 200 for a skip, like the newsletter trigger: cron-job.org retries on non-2xx.
    if ("reason" in run) return res.status(HTTP_STATUS.OK).json({ started: false, skipped: true, reason: run.reason, ...getPriceRefreshStatus() });
    return res.status(202).json({ started: true, market });
};

/* POST /api/fundakamental/stocks/refresh?market=all|india|us&token=CRON_SECRET_TOKEN
 * Re-fetches full fundamentals for ~110 stocks from Yahoo. Admin/scheduler
 * only: any signed-in user could previously start it over and over. */
export const refreshStockData = async (req, res) => {
    const secret = process.env.CRON_SECRET_TOKEN;
    if (!secret) return res.status(503).json({ error: "CRON_SECRET_TOKEN is not configured" });
    if (!sameToken(req.query.token || req.headers["x-cron-token"], secret)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: "Not allowed" });
    }
    const marketParam = String(req.query.market || "all");
    const markets: Market[] = marketParam === "all" || marketParam === "both" ? ["india", "us"] : [marketParam as Market];

    // Fire-and-forget: fetching ~100 tickers takes ~1 minute, matching the
    // Python source's BackgroundTasks usage.
    refreshStockPipeline(markets)
        .then((summary) => console.log("[Fundakamental] stocks refresh done:", summary))
        .catch((err) => console.error("[Fundakamental] stocks refresh failed:", err));

    return res.status(HTTP_STATUS.OK).json({
        status: "started",
        markets,
        message: "Refreshing stock data in the background.",
    });
};

/* GET /api/fundakamental/stocks/screener/presets */
export const getScreeningPresets = async (_req, res) => {
    return res.status(HTTP_STATUS.OK).json({ presets: getPresets() });
};

/* POST /api/fundakamental/stocks/screener/save */
export const saveCustomScreen = async (req, res) => {
    const validation = validateSaveScreen(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { name, description, filters, is_public } = validation.data;

    try {
        // funda_saved_screens.user_id references funda_users(id), which is
        // 1:1 with auth.users.id — i.e. req.user.authId, not req.user.userId.
        const { data, error } = await insertSavedScreen({
            user_id: req.user.authId,
            name,
            description,
            filters,
            is_public,
        });
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            screen_id: data?.id || null,
            message: "Screen saved successfully",
        });
    } catch (err) {
        console.error("[Fundakamental] save screen failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to save screen: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/stocks/screener/saved */
export const getSavedScreens = async (req, res) => {
    try {
        const { data, error } = await getSavedScreensRepo(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json({ saved_screens: data || [] });
    } catch (err) {
        console.error("[Fundakamental] fetch saved screens failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to fetch saved screens: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/market-data/status */
export const getMarketDataStatus = async (_req, res) => {
    return res.status(HTTP_STATUS.OK).json(getMarketStreamerStats());
};
