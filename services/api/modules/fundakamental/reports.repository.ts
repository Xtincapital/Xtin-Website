// Thin Supabase-query wrappers for FundaKaMental reports + PDF export.
// Node/TS port of `api/endpoints/reports.py` and `api/endpoints/pdf_export.py`'s
// table access.
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql):
//   reports -> funda_reports, chat_messages -> funda_chat_messages,
//   users -> funda_users.
//
// KNOWN BUG FIXED HERE: the Python source's `pdf_export.py` queries a table
// called "analysis_reports", which has never existed in any FundaKaMental
// migration (see the migration file's header comment). The real table is
// `funda_reports` — every query below uses it instead.
import supabase from "../../supabase/index.js";

/* funda_reports --------------------------------------------------------- */

const listReportsForUser = (userId: string, limit: number, offset: number) =>
    supabase
        .from("funda_reports")
        .select("id, company, ticker, overall_score, created_at, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

const countReportsForUser = (userId: string) =>
    supabase.from("funda_reports").select("id", { count: "exact", head: true }).eq("user_id", userId);

const getReportByIdForUser = (reportId: string, userId: string) =>
    supabase.from("funda_reports").select("*").eq("id", reportId).eq("user_id", userId).single();

const getLatestReportByTickerForUser = (ticker: string, userId: string) =>
    supabase
        .from("funda_reports")
        .select("*")
        .eq("ticker", ticker)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

const deleteReportByIdForUser = (reportId: string, userId: string) =>
    supabase.from("funda_reports").delete().eq("id", reportId).eq("user_id", userId);

/* funda_chat_messages ----------------------------------------------------- */

const deleteChatMessagesByReportId = (reportId: string) => supabase.from("funda_chat_messages").delete().eq("report_id", reportId);

/* funda_users -------------------------------------------------------------- */
// Used by featureGates.ts (require_pdf_export / check_pdf_limit ports) — the
// user's plan + usage counters, fetched once per request by the controller.

const getFundaUserProfile = (userId: string) => supabase.from("funda_users").select("id, plan, reports_used, reports_limit").eq("id", userId).single();

export {
    listReportsForUser,
    countReportsForUser,
    getReportByIdForUser,
    getLatestReportByTickerForUser,
    deleteReportByIdForUser,
    deleteChatMessagesByReportId,
    getFundaUserProfile,
};
