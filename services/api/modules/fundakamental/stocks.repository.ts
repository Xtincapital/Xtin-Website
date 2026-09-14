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

const searchStocksInDb = (query: string, limit = 10) =>
    supabase
        .from("funda_stocks")
        .select("ticker, name, sector, price, change_percent, market_cap")
        .or(`ticker.ilike.%${query}%,name.ilike.%${query}%`)
        .eq("is_active", true)
        .limit(limit);

function applyFilter(query: any, filter: ScreenFilter) {
    const { field, operator, value } = filter;
    if (!field || !operator) return query;
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
    query = query.order(sortBy, { ascending: sortOrder !== "desc" });
    query = query.limit(limit);
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

export {
    getStockByTicker,
    upsertStock,
    searchStocksInDb,
    queryStocksForScreener,
    getSavedScreens,
    insertSavedScreen,
    getScreeningCache,
    upsertScreeningCache,
};
