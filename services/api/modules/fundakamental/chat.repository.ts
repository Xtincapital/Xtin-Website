// Thin Supabase-query wrappers for FundaKaMental document chat — Node/TS
// port of `api/endpoints/chat.py`'s table access, plus the
// `funda_document_chunks` insert used by analysis.controller.ts's
// upload-time chunk/embed/store wiring (this slice owns that table).
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql
// and 0004_fundakamental_rag_chat.sql): reports -> funda_reports,
// chat_messages -> funda_chat_messages, source_documents ->
// funda_source_documents.
import crypto from "node:crypto";
import supabase from "../../supabase/index.js";

/* funda_reports ------------------------------------------------------------ */

/** Port of chat.py's `report_result` lookup, scoped to the owning user, used by
 * both endpoints. Deviation: the Python source selects `'*, source_documents(*)'`
 * (a join) but only ever reads `report.get('source_document_id')` off the result —
 * `funda_reports.source_document_id` is already a direct column (see the schema),
 * so no join is needed here. */
const getReportForChat = (reportId: string, userId: string) =>
    supabase.from("funda_reports").select("id, source_document_id").eq("id", reportId).eq("user_id", userId).maybeSingle();

/* funda_chat_messages -------------------------------------------------------- */

/** Port of the `history_result` query in `POST /message` — last N messages, oldest
 * first, used to seed conversation continuity for the next AI turn. */
const getRecentChatHistory = (reportId: string, limit = 10) =>
    supabase.from("funda_chat_messages").select("role, content").eq("report_id", reportId).order("created_at", { ascending: true }).limit(limit);

/** Port of `GET /history/{report_id}`'s full-history query (no limit). */
const getAllChatMessages = (reportId: string) =>
    supabase.from("funda_chat_messages").select("*").eq("report_id", reportId).order("created_at", { ascending: true });

interface ChatMessageInsert {
    report_id: string;
    user_id: string;
    role: "user" | "assistant";
    content: string;
}

const insertChatMessage = (record: ChatMessageInsert) =>
    supabase
        .from("funda_chat_messages")
        .insert({ id: crypto.randomUUID(), ...record })
        .select();

/* funda_document_chunks ------------------------------------------------------ */
// Retrieval itself goes through the funda_match_document_chunks RPC (see
// ragChat.ts) — this insert is only used at upload time.

interface DocumentChunkInsert {
    source_document_id: string;
    user_id: string;
    chunk_index: number;
    content: string;
    /** Bracketed pgvector string, e.g. "[0.1,0.2,...]" — see embeddings.ts's
     * `toPgVector`. */
    embedding: string;
}

const insertDocumentChunks = (rows: DocumentChunkInsert[]) => supabase.from("funda_document_chunks").insert(rows);

export { getReportForChat, getRecentChatHistory, getAllChatMessages, insertChatMessage, insertDocumentChunks };
