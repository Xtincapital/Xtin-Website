// Thin Supabase-query wrappers for document upload + AI analysis — Node/TS
// port of `api/endpoints/analysis.py`'s table access.
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql):
// reports -> funda_reports, source_documents -> funda_source_documents,
// users -> funda_users (id = auth.users.id 1:1, not a separate id space).
import supabase from "../../supabase/index.js";
import { STORAGE_BUCKET } from "./fileProcessor.js";

/* funda_source_documents ---------------------------------------------------- */

const getSourceDocumentById = (fileId: string, userId: string) =>
    supabase.from("funda_source_documents").select("*").eq("id", fileId).eq("user_id", userId).maybeSingle();

/** Downloads the raw file bytes back from Storage so `/analyze` can re-extract
 * text on demand (funda_source_documents has no extracted_text column to cache
 * it in — see fileProcessor.ts's header comment). */
const downloadDocumentFromStorage = (storagePath: string) => supabase.storage.from(STORAGE_BUCKET).download(storagePath);

/* funda_reports --------------------------------------------------------------- */

const insertReport = (record: Record<string, unknown>) => supabase.from("funda_reports").insert(record).select();

const updateReportStatus = (reportId: string, status: string, extra: Record<string, unknown> = {}) =>
    supabase
        .from("funda_reports")
        .update({ status, ...extra })
        .eq("id", reportId);

const updateReport = (reportId: string, updateData: Record<string, unknown>) =>
    supabase.from("funda_reports").update(updateData).eq("id", reportId);

const getReportById = (reportId: string, userId: string) =>
    supabase.from("funda_reports").select("*").eq("id", reportId).eq("user_id", userId).maybeSingle();

/* funda_users ------------------------------------------------------------------ */

const getUserProfile = (userId: string) =>
    supabase.from("funda_users").select("id, plan, reports_used, reports_limit").eq("id", userId).maybeSingle();

const setReportsUsed = (userId: string, reportsUsed: number) =>
    supabase
        .from("funda_users")
        .update({ reports_used: reportsUsed, updated_at: new Date().toISOString() })
        .eq("id", userId);

export {
    getSourceDocumentById,
    downloadDocumentFromStorage,
    insertReport,
    updateReportStatus,
    updateReport,
    getReportById,
    getUserProfile,
    setReportsUsed,
};

/** A report still "pending"/"processing" this long after it was created was
 * cut off (e.g. the server restarted mid-analysis) and will never finish. */
export const STALE_ANALYSIS_MS = 15 * 60 * 1000;
export const STALE_ANALYSIS_ERROR = "The analysis was interrupted before it finished. No tokens were charged — please run it again.";

export function isStaleAnalysis(report: { status?: string | null; created_at?: string | null }): boolean {
    if (report.status !== "pending" && report.status !== "processing") return false;
    const created = new Date(report.created_at || 0).getTime();
    return Number.isFinite(created) && Date.now() - created > STALE_ANALYSIS_MS;
}

/** Mark a cut-off analysis as failed so History and polling stop waiting on it. */
export const failStaleAnalysis = (reportId: string) =>
    supabase.from("funda_reports").update({ status: "failed", error: STALE_ANALYSIS_ERROR }).eq("id", reportId).in("status", ["pending", "processing"]);

