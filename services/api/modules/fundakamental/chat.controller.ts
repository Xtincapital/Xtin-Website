// Document Chat API — Node/TS port of `api/endpoints/chat.py`'s two
// endpoints (`POST /message`, `GET /history/{report_id}`). See ragChat.ts's
// header comment for what's ported faithfully vs. adapted in the RAG layer
// itself.
//
// Deviations from the Python source:
//   - Token-wallet gating (Phase 8d): `utils/token_wallet.py`'s balance
//     check before answering, plus `deduct_tokens` after, is now ported —
//     see the `hasTokens`/`deduct` calls in `sendChatMessage` below. This
//     was previously deferred (no gate at all) until tokenWallet.ts existed;
//     that stand-in period is over. Message copy for the 402 matches
//     `chat.py` verbatim. `ragChat.ts` doesn't return a real usage count
//     (see its header comment), so the post-answer deduction always uses the
//     Python source's own fallback estimate,
//     `max(500, (len(question)+len(answer))//4)`, rather than a real count.
//   - Report/document ownership check no longer joins `source_documents(*)`
//     — `funda_reports.source_document_id` is already a direct column (see
//     chat.repository.ts), so the join the Python source did is redundant.
import { HTTP_STATUS } from "../../constants/constants.js";
import { ragChat } from "./ragChat.js";
import { getReportForChat, getRecentChatHistory, getAllChatMessages, insertChatMessage } from "./chat.repository.js";
import { hasTokens, deduct } from "./tokenWallet.js";
import { getUserTier } from "./tokens.repository.js";

/** Phase 8d: minimum wallet balance required for a chat turn, matching
 * `chat.py`'s inline `< 500` check (analysis.controller.ts's equivalent gate
 * is 20,000 — a full report is a far larger single generation). */
const CHAT_MIN_TOKENS = 500;

/** `req.user` has no `plan` field (see tokens.controller.ts's identical
 * helper) — look the tier up from funda_users, defaulting to "free" on a
 * missing row or read failure. */
async function resolveTier(userId: string): Promise<string> {
    try {
        const { data, error } = await getUserTier(userId);
        if (error) throw error;
        return data?.plan || "free";
    } catch (err) {
        console.error("[Fundakamental] chat tier lookup failed:", (err as Error)?.message || err);
        return "free";
    }
}

/* POST /fundakamental/chat/message
 * Body: { report_id: string, message: string } */
export const sendChatMessage = async (req, res) => {
    const reportId = typeof req.body?.report_id === "string" ? req.body.report_id.trim() : "";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!reportId || !message) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "report_id and message are required" });
    }

    const userId = req.user.authId;

    try {
        const { data: report, error: reportError } = await getReportForChat(reportId, userId);
        if (reportError) throw reportError;
        if (!report) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Report not found" });
        }

        const sourceDocumentId = report.source_document_id;
        if (!sourceDocumentId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Report has no associated document for chat" });
        }

        const { data: historyRows, error: historyError } = await getRecentChatHistory(reportId, 10);
        if (historyError) throw historyError;
        const conversationHistory = (historyRows || []).map((row) => ({ role: row.role, content: row.content }));

        // Phase 8d: real token-wallet gate, port of chat.py's inline balance
        // check (see module header comment). Message copy matches the
        // Python source verbatim.
        const tier = await resolveTier(userId);
        if (!(await hasTokens(userId, tier, CHAT_MIN_TOKENS))) {
            return res.status(402).json({
                error: `You're out of AI tokens. ${
                    tier === "free" ? "Upgrade to Pro for a much larger allowance." : "Top up your tokens to keep asking."
                }`,
            });
        }

        const ragResult = await ragChat(message, sourceDocumentId, userId, conversationHistory, 5);
        const responseContent = ragResult.answer;

        // Phase 8d: meter this turn's token cost, port of chat.py's
        // post-answer `deduct_tokens` call. `ragChat.ts` never returns a
        // real usage count (see module header comment), so this always uses
        // the Python source's own length-based fallback estimate.
        const chatTokens = Math.max(CHAT_MIN_TOKENS, Math.floor((message.length + responseContent.length) / 4));
        await deduct(userId, chatTokens, tier);

        // Save user message, then assistant response — matches the Python
        // source's ordering (both saved only after the AI call completes).
        const { error: userInsertError } = await insertChatMessage({
            report_id: reportId,
            user_id: userId,
            role: "user",
            content: message,
        });
        if (userInsertError) console.error("[Fundakamental] failed to persist user chat message:", userInsertError.message);

        const { error: assistantInsertError } = await insertChatMessage({
            report_id: reportId,
            user_id: userId,
            role: "assistant",
            content: responseContent,
        });
        if (assistantInsertError) console.error("[Fundakamental] failed to persist assistant chat message:", assistantInsertError.message);

        return res.status(HTTP_STATUS.OK).json({
            role: "assistant",
            content: responseContent,
            sources: ragResult.sources,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("[Fundakamental] chat message failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to process chat message: ${(err as Error)?.message || err}` });
    }
};

/* GET /fundakamental/chat/history/:reportId */
export const getChatHistory = async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.authId;

    try {
        const { data: report, error: reportError } = await getReportForChat(reportId, userId);
        if (reportError) throw reportError;
        if (!report) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Report not found" });
        }

        const { data: rows, error: messagesError } = await getAllChatMessages(reportId);
        if (messagesError) throw messagesError;

        const messages = (rows || []).map((row) => ({
            role: row.role,
            content: row.content,
            // funda_chat_messages has no `sources` column — sources are only
            // ever returned live from a POST /message call, never persisted,
            // matching chat.py's comment at its assistant-message insert.
            sources: [],
            timestamp: row.created_at,
        }));

        return res.status(HTTP_STATUS.OK).json({
            session_id: reportId,
            report_id: reportId,
            messages,
        });
    } catch (err) {
        console.error("[Fundakamental] fetch chat history failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to fetch chat history: ${(err as Error)?.message || err}` });
    }
};
