// Thin Supabase-query wrappers for `journal_trades`. Style mirrors
// fundakamental/watchlists.repository.ts — one small function per query,
// controllers own all the branching/error handling.
import supabase from "../../supabase/index.js";

const insertTrade = (record: Record<string, unknown>) => supabase.from("journal_trades").insert(record).select();

export interface TradeListFilters {
    search?: string;
    from?: string;
    to?: string;
    /** Only these trade ids (e.g. the duplicates). */
    ids?: string[];
}

// Characters that would change the meaning of a PostgREST `or=(...)` filter.
const searchSafe = (term: string) => term.replace(/[,()%*\\:"]/g, " ").trim();

const getTradesByUser = (userId: string, limit: number, offset: number, filters: TradeListFilters = {}) => {
    let query = supabase.from("journal_trades").select("*", { count: "exact" }).eq("user_id", userId);
    const term = filters.search ? searchSafe(filters.search) : "";
    if (term) query = query.or(`asset.ilike.%${term}%,strategy.ilike.%${term}%`);
    if (filters.from) query = query.gte("date", filters.from);
    if (filters.to) query = query.lte("date", filters.to);
    if (filters.ids) query = query.in("id", filters.ids);
    return query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
};

// Just the fields that identify a trade (see tradeDuplicates.ts), for every
// trade dated from..to. Read in pages because Supabase returns at most 1000
// rows per request.
const KEY_COLUMNS = "id, date, asset, buy_sell, quantity, entry_price, exit_price, entry_time";
const KEY_PAGE = 1000;
const KEY_MAX = 50_000;

export async function getTradeKeysInRange(userId: string, from: string, to: string) {
    const rows: Array<{ id: string; date: string; asset: string; buy_sell: string | null; quantity: number | null; entry_price: number | null; exit_price: number | null; entry_time: string | null }> = [];
    for (let offset = 0; offset < KEY_MAX; offset += KEY_PAGE) {
        const { data, error } = await supabase
            .from("journal_trades")
            .select(KEY_COLUMNS)
            .eq("user_id", userId)
            .gte("date", from)
            .lte("date", to)
            .order("id")
            .range(offset, offset + KEY_PAGE - 1);
        if (error) throw error;
        rows.push(...((data as typeof rows) || []));
        if (!data || data.length < KEY_PAGE) break;
    }
    return rows;
}

const getTradeById = (tradeId: string, userId: string) => supabase.from("journal_trades").select("*").eq("id", tradeId).eq("user_id", userId);

const updateTrade = (tradeId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("journal_trades").update(updateData).eq("id", tradeId).eq("user_id", userId).select();

const deleteTrade = (tradeId: string, userId: string) => supabase.from("journal_trades").delete().eq("id", tradeId).eq("user_id", userId).select();

// Bulk "clear journal" — mirrors the original app's `clearDatabase()`
// (see features-incoming/journal/app.js), scoped to trades only here since
// goals/strategies each have their own delete endpoints.
const deleteAllTrades = (userId: string) => supabase.from("journal_trades").delete().eq("user_id", userId).select("id");

export { insertTrade, getTradesByUser, getTradeById, updateTrade, deleteTrade, deleteAllTrades };
