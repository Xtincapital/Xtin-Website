// Thin Supabase-query wrappers for `journal_trades`. Style mirrors
// fundakamental/watchlists.repository.ts — one small function per query,
// controllers own all the branching/error handling.
import supabase from "../../supabase/index.js";

const insertTrade = (record: Record<string, unknown>) => supabase.from("journal_trades").insert(record).select();

const getTradesByUser = (userId: string, limit: number, offset: number) =>
    supabase
        .from("journal_trades")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

const getTradeById = (tradeId: string, userId: string) => supabase.from("journal_trades").select("*").eq("id", tradeId).eq("user_id", userId);

const updateTrade = (tradeId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("journal_trades").update(updateData).eq("id", tradeId).eq("user_id", userId).select();

const deleteTrade = (tradeId: string, userId: string) => supabase.from("journal_trades").delete().eq("id", tradeId).eq("user_id", userId).select();

// Bulk "clear journal" — mirrors the original app's `clearDatabase()`
// (see features-incoming/journal/app.js), scoped to trades only here since
// goals/strategies each have their own delete endpoints.
const deleteAllTrades = (userId: string) => supabase.from("journal_trades").delete().eq("user_id", userId).select("id");

export { insertTrade, getTradesByUser, getTradeById, updateTrade, deleteTrade, deleteAllTrades };
