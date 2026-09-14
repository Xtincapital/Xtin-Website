// Thin Supabase-query wrappers for portfolio tracking — Node/TS port of
// `api/endpoints/portfolios.py`'s table access.
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql,
// "Portfolio tracking" section): portfolios -> funda_portfolios,
// portfolio_holdings -> funda_portfolio_holdings, portfolio_transactions ->
// funda_portfolio_transactions, portfolio_snapshots -> funda_portfolio_snapshots.
// `funda_portfolio_performance` exists in the migration but no live endpoint
// in portfolios.py ever reads/writes a `portfolio_performance` table, so no
// wrapper is defined for it here.
import supabase from "../../supabase/index.js";

/* funda_portfolios ---------------------------------------------------------- */

const insertPortfolio = (record: Record<string, unknown>) => supabase.from("funda_portfolios").insert(record).select();

const getPortfoliosByUser = (userId: string) =>
    supabase.from("funda_portfolios").select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at", { ascending: true });

const getPortfolioOwnership = (portfolioId: string, userId: string) =>
    supabase.from("funda_portfolios").select("id").eq("id", portfolioId).eq("user_id", userId);

const getPortfolioById = (portfolioId: string, userId: string) =>
    supabase.from("funda_portfolios").select("*").eq("id", portfolioId).eq("user_id", userId);

const updatePortfolio = (portfolioId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("funda_portfolios").update(updateData).eq("id", portfolioId).eq("user_id", userId).select();

const deletePortfolio = (portfolioId: string, userId: string) =>
    supabase.from("funda_portfolios").delete().eq("id", portfolioId).eq("user_id", userId).select();

/* funda_portfolio_transactions ------------------------------------------------ */

const insertTransaction = (record: Record<string, unknown>) => supabase.from("funda_portfolio_transactions").insert(record).select();

const getTransactions = (portfolioId: string, ticker: string | null, transactionType: string | null, limit: number) => {
    let query = supabase.from("funda_portfolio_transactions").select("*").eq("portfolio_id", portfolioId);
    if (ticker) query = query.eq("ticker", ticker);
    if (transactionType) query = query.eq("transaction_type", transactionType);
    return query.order("transaction_date", { ascending: false }).limit(limit);
};

const getAllTransactionsOrdered = (portfolioId: string) =>
    supabase.from("funda_portfolio_transactions").select("*").eq("portfolio_id", portfolioId).order("transaction_date", { ascending: true });

const deleteTransaction = (portfolioId: string, transactionId: string) =>
    supabase.from("funda_portfolio_transactions").delete().eq("id", transactionId).eq("portfolio_id", portfolioId).select();

/* funda_portfolio_holdings ---------------------------------------------------- */

const getHoldings = (portfolioId: string) => supabase.from("funda_portfolio_holdings").select("*").eq("portfolio_id", portfolioId);

const upsertHolding = (record: Record<string, unknown>) =>
    supabase.from("funda_portfolio_holdings").upsert(record, { onConflict: "portfolio_id,ticker" }).select();

const getHoldingByTicker = (portfolioId: string, ticker: string) =>
    supabase.from("funda_portfolio_holdings").select("*").eq("portfolio_id", portfolioId).eq("ticker", ticker);

const deleteHolding = (portfolioId: string, ticker: string) =>
    supabase.from("funda_portfolio_holdings").delete().eq("portfolio_id", portfolioId).eq("ticker", ticker);

const updateHoldingNotes = (portfolioId: string, ticker: string, notes: string) =>
    supabase.from("funda_portfolio_holdings").update({ notes }).eq("portfolio_id", portfolioId).eq("ticker", ticker).select();

/* funda_portfolio_snapshots ---------------------------------------------------- */

const getSnapshotsSince = (portfolioId: string, startDateIso: string) =>
    supabase
        .from("funda_portfolio_snapshots")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .gte("snapshot_date", startDateIso)
        .order("snapshot_date", { ascending: true });

export {
    insertPortfolio,
    getPortfoliosByUser,
    getPortfolioOwnership,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    insertTransaction,
    getTransactions,
    getAllTransactionsOrdered,
    deleteTransaction,
    getHoldings,
    upsertHolding,
    getHoldingByTicker,
    deleteHolding,
    updateHoldingNotes,
    getSnapshotsSince,
};
