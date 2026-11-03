import supabase from "../../supabase/index.js";

export interface ScreenFilter {
    field: string;
    operator: string;
    value: unknown;
}

/* funda_stocks ----------------------------------------------------------- */

const getStockByTicker = (ticker: string) =>
    supabase.from("funda_stocks").select("*").eq("ticker", ticker).eq("is_active", true).maybeSingle();

// Uses `ticker` as the conflict target (not the `id` PK) since that's the
// natural upsert key for a fetched-and-cached stock overview — matches the
// pattern already used by the Python source's own pipeline upsert
// (`stock_pipeline.py`'s `on_conflict="ticker"`), unlike the stocks.py
// endpoint's plain `.upsert(overview).execute()`, which would otherwise
// insert a new row every time since `ticker` is unique but not the PK.
const upsertStock = (record: Record<string, unknown>) => supabase.from("funda_stocks").upsert(record, { onConflict: "ticker" });

const listActiveStocks = () =>
    supabase.from("funda_stocks").select("ticker, market").eq("is_active", true).limit(1000);

// funda_update_stocks_timestamp (migration 0001) stamps last_updated on every update.
const updateStockPrice = (ticker: string, fields: { price: number; change: number | null; change_percent: number | null; volume?: number }) =>
    supabase.from("funda_stocks").update(fields).eq("ticker", ticker);

const getNewestStockUpdate = () =>
    supabase.from("funda_stocks").select("last_updated").eq("is_active", true).order("last_updated", { ascending: false }).limit(1).maybeSingle();

// Characters that would change the meaning of a PostgREST `or=(...)` filter.
const searchSafe = (query: string) => query.replace(/[,()%*\\:"]/g, " ").trim();

const searchStocksInDb = (query: string, limit = 10) => {
    const q = searchSafe(query);
    return supabase
        .from("funda_stocks")
        .select("ticker, name, sector, price, change_percent, market_cap, last_updated")
        .or(`ticker.ilike.%${q}%,name.ilike.%${q}%`)
        .eq("is_active", true)
        .limit(limit);
};

// Columns the screener may filter or sort on. Anything else is ignored rather
// than sent to PostgREST (an unknown column errors the whole query).
export const SCREENER_COLUMNS = new Set([
    "sector", "market_cap", "price", "pe_ratio", "peg_ratio", "pb_ratio", "eps", "dividend_yield",
    "profit_margin", "operating_margin", "roe", "roa", "revenue_growth", "earnings_growth",
    "debt_to_equity", "current_ratio", "quick_ratio", "beta", "change_percent", "volume",
]);

// The scanner offers GICS sector names; Yahoo (which fills funda_stocks)
// uses its own names for four of them. Match either.
const SECTOR_ALIASES: Record<string, string[]> = {
    financials: ["Financials", "Financial Services"],
    "financial services": ["Financials", "Financial Services"],
    "consumer discretionary": ["Consumer Discretionary", "Consumer Cyclical"],
    "consumer cyclical": ["Consumer Discretionary", "Consumer Cyclical"],
    "consumer staples": ["Consumer Staples", "Consumer Defensive"],
    "consumer defensive": ["Consumer Staples", "Consumer Defensive"],
    materials: ["Materials", "Basic Materials"],
    "basic materials": ["Materials", "Basic Materials"],
    "information technology": ["Technology", "Information Technology"],
    technology: ["Technology", "Information Technology"],
    "health care": ["Healthcare", "Health Care"],
    healthcare: ["Healthcare", "Health Care"],
};

export const sectorNames = (value: unknown): string[] => SECTOR_ALIASES[String(value).trim().toLowerCase()] || [String(value)];

function applyFilter(query: any, filter: ScreenFilter) {
    const { field, operator, value } = filter;
    if (!field || !operator || !SCREENER_COLUMNS.has(field)) return query;
    if (field === "sector" && (operator === "eq" || operator === "neq")) {
        const names = sectorNames(value);
        return operator === "eq" ? query.in("sector", names) : query.not("sector", "in", `(${names.map((n) => `"${n}"`).join(",")})`);
    }
    switch (operator) {
        case "eq":
            return query.eq(field, value);
        case "neq":
            return query.neq(field, value);
        case "gt":
            return query.gt(field, value);
        case "gte":
            return query.gte(field, value);
        case "lt":
            return query.lt(field, value);
        case "lte":
            return query.lte(field, value);
        case "in":
            return query.in(field, Array.isArray(value) ? value : [value]);
        case "contains":
            return query.ilike(field, `%${value}%`);
        default:
            return query;
    }
}

const queryStocksForScreener = (filters: ScreenFilter[], sortBy: string, sortOrder: string, limit: number, market?: string | null) => {
    let query = supabase.from("funda_stocks").select("*").eq("is_active", true);
    if (market) query = query.eq("market", market);
    for (const filter of filters || []) query = applyFilter(query, filter);
    // match_score is computed after the query; fetch by market cap then.
    const column = SCREENER_COLUMNS.has(sortBy) ? sortBy : "market_cap";
    query = query.order(column, { ascending: sortOrder !== "desc", nullsFirst: false });
    query = query.limit(limit);
    return query;
};

const countActiveStocks = (market?: string | null) => {
    let query = supabase.from("funda_stocks").select("id", { count: "exact", head: true }).eq("is_active", true);
    if (market) query = query.eq("market", market);
    return query;
};

/* funda_saved_screens ------------------------------------------------------ */

const getSavedScreens = (userId: string) =>
    supabase.from("funda_saved_screens").select("*").eq("user_id", userId).order("created_at", { ascending: false });

const insertSavedScreen = (record: Record<string, unknown>) => supabase.from("funda_saved_screens").insert(record).select().single();

/* funda_screening_cache ---------------------------------------------------- */

const getScreeningCache = (filterHash: string) =>
    supabase.from("funda_screening_cache").select("*").eq("filter_hash", filterHash).gt("expires_at", new Date().toISOString()).maybeSingle();

const upsertScreeningCache = (record: Record<string, unknown>) => supabase.from("funda_screening_cache").upsert(record, { onConflict: "filter_hash" });

/* funda_company_financials ------------------------------------------------ */

const getSavedFinancials = (ticker: string) =>
    supabase.from("funda_company_financials").select("ticker, annual, quarterly, fetched_at").eq("ticker", ticker).maybeSingle();

const saveFinancials = (ticker: string, annual: unknown[], quarterly: unknown[]) =>
    supabase.from("funda_company_financials").upsert({ ticker, annual, quarterly, fetched_at: new Date().toISOString() }, { onConflict: "ticker" });

export {
    getSavedFinancials,
    saveFinancials,
    getStockByTicker,
    upsertStock,
    listActiveStocks,
    updateStockPrice,
    getNewestStockUpdate,
    searchStocksInDb,
    queryStocksForScreener,
    countActiveStocks,
    getSavedScreens,
    insertSavedScreen,
    getScreeningCache,
    upsertScreeningCache,
};
