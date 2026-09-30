// Analysis API — Node/TS port of `api/endpoints/analysis.py`.
//
// Auth: `req.user.authId` (populated by `authenticate`) is the FundaKaMental
// user id for every query here — it equals `auth.users.id`, which is what
// `funda_reports.user_id` / `funda_source_documents.user_id` /
// `funda_users.id` reference.
//
// Deviations from the Python source (see the referenced files for the full
// rationale on each):
//   - fileProcessor.ts: extracted text isn't cached on `funda_source_documents`
//     (no such column in the live schema) — `startAnalysis` re-downloads the
//     file from Storage and re-extracts text on demand instead of reading a
//     stored column.
//   - `company_name` fallback: the Python source reads
//     `file_result.data['metadata']['company_name']` when the caller doesn't
//     pass one explicitly. `funda_source_documents` has no `metadata`
//     column, so this port falls back to "Unknown Company" directly.
//   - aiAnalyzer.ts: the Python source's provider_order loop (try Anthropic,
//     then OpenAI, as separate AIAnalyzer instances) collapses into a single
//     `generateAIText` call, which already implements that same
//     Claude-primary/fallback selection internally.
//   - Token-wallet gating (Phase 8d): the Python source actually gates
//     `/analyze` with an inline `utils/token_wallet.py` balance check, not
//     `feature_gates.py` — `MIN_TOKENS_FOR_REPORT = 20_000`, checked against
//     `get_wallet(...).balance` before the AI call, then `deduct_tokens(...)`
//     after a successful one. That's what this port now does too, via
//     `hasTokens`/`deduct` from tokenWallet.ts (see the Phase 8d block
//     below) — replacing the `checkReportLimit` stand-in this file used to
//     rely on before the wallet system existed. `checkReportLimit` itself
//     (featureGates.ts) is unchanged and still gates PDF export usage in
//     reports.controller.ts.
//   - Token metering: `generateAIText` doesn't return a usage count, so
//     `aiAnalyzer.ts`'s `tokens_used` is always null (see its header
//     comment). `tokens_charged`/`token_balance` are populated using a
//     length-based estimate instead, in the same style as the Python
//     source's chat endpoint's `max(500, (len(question)+len(answer))//4)`
//     fallback (see the Phase 8d block below for the exact formula used
//     here).
//
// Phase 8c addition: `uploadFile` now also chunks + embeds the extracted text
// and stores it in `funda_document_chunks` (best-effort, see the try/catch
// around it below) so `modules/fundakamental/chat.*` can answer questions
// about the document. This was deliberately deferred out of the original
// port of this file (see fileProcessor.ts's header comment) until the
// pgvector-backed replacement for the Python source's ChromaDB vector store
// existed — see chunking.ts, embeddings.ts and chat.repository.ts.
import crypto from "node:crypto";
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateAnalysisRequest } from "./analysis.validator.js";
import { validateFile, uploadToStorage, processFile, saveDocumentRecord } from "./fileProcessor.js";
import { analyzeFinancialDocument, isAiAvailable } from "./aiAnalyzer.js";
import { hasTokens, deduct } from "./tokenWallet.js";
import { chunkText } from "./chunking.js";
import { embedTexts, toPgVector } from "./embeddings.js";
import { insertDocumentChunks } from "./chat.repository.js";
import {
    getSourceDocumentById,
    downloadDocumentFromStorage,
    insertReport,
    updateReportStatus,
    updateReport,
    getReportById,
    getUserProfile,
    setReportsUsed,
} from "./analysis.repository.js";

/** Phase 8d: minimum wallet balance required to attempt a report, matching
 * `analysis.py`'s `MIN_TOKENS_FOR_REPORT = 20_000` (chat.controller.ts's
 * equivalent gate is 500 — a report is a far larger single generation). */
const MIN_TOKENS_FOR_REPORT = 20_000;

/** Carries an HTTP status code through the single catch block in `startAnalysis`,
 * mirroring the Python source's `except HTTPException: raise` / generic 500 split. */
class AnalysisHttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

/* POST /api/fundakamental/analysis/upload  (multipart/form-data, field "file") */
export const uploadFile = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No file provided" });
    }

    const fileContent: Buffer = file.buffer;
    const fileSize: number = file.size;
    const filename: string = file.originalname;
    const userId = req.user.authId;

    const { isValid, error: validationError } = validateFile(filename, fileSize);
    if (!isValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validationError });
    }

    try {
        const uploadResult = await uploadToStorage(fileContent, filename, userId);
        if (!uploadResult.success) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: uploadResult.error || "Upload failed" });
        }

        const processingResult = await processFile(fileContent, filename);
        if (!processingResult.success) {
            // 422 Unprocessable Entity, matching the Python source.
            return res.status(422).json({ error: processingResult.error || "File processing failed" });
        }

        const document = await saveDocumentRecord({
            userId,
            filename,
            fileSize,
            fileType: processingResult.file_type,
            storagePath: uploadResult.storage_path as string,
        });

        // Chunk + embed + store for document chat (RAG) — best-effort: a
        // failure here logs and continues rather than failing the whole
        // upload, matching this codebase's established pattern for
        // non-critical side effects (e.g. entitlement.repository.ts's
        // upsertEntitlement). Analysis can still proceed without chat
        // working, and chat gracefully reports "no information" if no
        // chunks ever landed for a document (see ragChat.ts).
        let chunksCreated = 0;
        let chunksEmbedded = 0;
        try {
            const chunks = chunkText(processingResult.extracted_text);
            chunksCreated = chunks.length;
            if (chunks.length > 0) {
                const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));
                const { error: chunksError } = await insertDocumentChunks(
                    chunks.map((chunk, i) => ({
                        source_document_id: document.id,
                        user_id: userId,
                        chunk_index: chunk.chunk_id,
                        content: chunk.text,
                        embedding: toPgVector(embeddings[i]),
                    })),
                );
                if (chunksError) throw chunksError;
                chunksEmbedded = chunks.length;
            }
        } catch (chunkErr) {
            console.error("[Fundakamental] chunk/embed/store failed (document chat won't be available for this file):", chunkErr);
        }

        return res.status(HTTP_STATUS.CREATED).json({
            file_id: document.id,
            file_name: filename,
            file_size: fileSize,
            uploaded_at: new Date().toISOString(),
            metadata: {
                extracted_text_length: processingResult.extracted_text.length,
                chunks_created: chunksCreated,
                chunks_embedded: chunksEmbedded,
                ...processingResult.metadata,
            },
        });
    } catch (err) {
        console.error("[Fundakamental] upload failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to upload file: ${(err as Error)?.message || err}` });
    }
};

/* POST /api/fundakamental/analysis/analyze */
export const startAnalysis = async (req, res) => {
    const validation = validateAnalysisRequest(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { file_id, company_ticker, company_name, investor_style, horizon, region } = validation.data;

    const userId = req.user.authId;
    const reportId = crypto.randomUUID();
    let reportInserted = false;
    let responded = false;

    try {
        const reportRecord: Record<string, unknown> = {
            id: reportId,
            user_id: userId,
            status: "pending",
        };

        let documentText = "";
        let companyName = "";
        const ticker = company_ticker || "N/A";

        if (file_id) {
            const { data: sourceDoc, error: docError } = await getSourceDocumentById(file_id, userId);
            if (docError) throw docError;
            if (!sourceDoc) {
                throw new AnalysisHttpError(HTTP_STATUS.NOT_FOUND, "File not found");
            }

            const { data: fileBlob, error: downloadError } = await downloadDocumentFromStorage(sourceDoc.storage_path);
            if (downloadError || !fileBlob) {
                throw new AnalysisHttpError(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    `Failed to download document: ${downloadError?.message || "unknown error"}`,
                );
            }
            const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());
            const processingResult = await processFile(fileBuffer, sourceDoc.file_name);

            reportRecord.source_document_id = file_id;
            documentText = processingResult.extracted_text || "";
            // funda_source_documents has no `metadata` column to read a
            // company_name back from (see header comment) — falls back
            // straight to "Unknown Company".
            companyName = company_name || "Unknown Company";

            if (!documentText) {
                throw new AnalysisHttpError(HTTP_STATUS.BAD_REQUEST, "Document has no extracted text. Please reupload the file.");
            }
        } else if (company_ticker || company_name) {
            // For company ticker/name, we'd fetch from external API — not yet implemented.
            throw new AnalysisHttpError(501, "Company ticker analysis not yet implemented. Please upload a financial document.");
        } else {
            throw new AnalysisHttpError(HTTP_STATUS.BAD_REQUEST, "Either file_id or company_ticker must be provided");
        }

        const { error: insertError } = await insertReport(reportRecord);
        if (insertError) throw insertError;
        reportInserted = true;

        const { error: statusError } = await updateReportStatus(reportId, "processing");
        if (statusError) throw statusError;

        if (!isAiAvailable()) {
            throw new AnalysisHttpError(
                503,
                "AI service not configured. Please set ANTHROPIC_API_KEY (primary) or OPENAI_API_KEY (fallback).",
            );
        }

        const { data: profile, error: profileError } = await getUserProfile(userId);
        if (profileError) throw profileError;
        if (!profile) {
            throw new AnalysisHttpError(HTTP_STATUS.NOT_FOUND, "User profile not found");
        }

        const tier = profile.plan || "free";
        // Phase 8d: real token-wallet gate, replacing the checkReportLimit
        // stand-in — port of analysis.py's inline balance check (see header
        // comment). Message copy matches the Python source verbatim.
        if (!(await hasTokens(userId, tier, MIN_TOKENS_FOR_REPORT))) {
            throw new AnalysisHttpError(
                402,
                `You're out of AI tokens. ${
                    tier === "free"
                        ? "Upgrade to Pro for a much larger monthly allowance."
                        : "Top up your tokens to keep analysing."
                }`,
            );
        }

        // Writing the report takes ~1–2 minutes — longer than Cloudflare's
        // 100-second limit in front of Render, which would cut the request
        // off. Reply now and finish in the background; the client polls
        // GET /analysis/status/:reportId until the report is completed/failed.
        res.status(202).json({
            report_id: reportId,
            status: "processing",
            message: "Analysis started",
        });
        responded = true;

        const analysisResult = await analyzeFinancialDocument({
            extractedText: documentText,
            companyName,
            ticker,
            investorStyle: investor_style,
            horizon,
            tier,
            region,
        });

        if (!analysisResult.success) {
            throw new AnalysisHttpError(502, analysisResult.error || "AI analysis failed");
        }

        // Phase 8d: meter the token cost of this report against the user's
        // wallet, port of analysis.py's post-success `deduct_tokens` call.
        // `aiAnalyzer.ts` never returns a real usage count (see its header
        // comment), so this always falls through to the estimate — a
        // length-based figure over the document text + the full analysis
        // payload, floored at MIN_TOKENS_FOR_REPORT so a short document
        // never undercharges relative to the gate above. Same estimate
        // *style* as chat.controller.ts's `max(500, (len(q)+len(a))//4)`
        // port of the Python source, with the higher, report-appropriate
        // floor in place of chat's 500.
        const tokensUsed = Number(analysisResult.tokens_used) || 0;
        const tokensCharged =
            tokensUsed > 0
                ? tokensUsed
                : Math.max(MIN_TOKENS_FOR_REPORT, Math.floor((documentText.length + JSON.stringify(analysisResult).length) / 4));
        const walletAfter = await deduct(userId, tokensCharged, tier);
        analysisResult.tokens_charged = tokensCharged;
        analysisResult.token_balance = walletAfter.balance;

        // Deviation: the Python source's `update_data` only ever sets
        // status/analysis_result/company/ticker/exchange/overall_score/summary,
        // leaving `metrics`/`key_ratios`/`strengths`/`red_flags`/
        // `investment_assessment` as null even though `funda_reports` has
        // dedicated columns for them (they're duplicated into the
        // `analysis_result` jsonb blob only). That looks like an oversight in
        // the original rather than intentional — this port populates those
        // columns too, since the task's schema contract calls them out as
        // real columns for the parallel report-retrieval task to read.
        const updateData: Record<string, unknown> = {
            status: "completed",
            analysis_result: analysisResult,
            company: analysisResult.company || companyName,
            ticker: analysisResult.ticker || ticker,
            exchange: analysisResult.exchange,
            overall_score: analysisResult.overall_score,
            summary: analysisResult.summary,
            investment_assessment: analysisResult.investment_assessment,
            metrics: analysisResult.metrics,
            key_ratios: analysisResult.key_ratios,
            strengths: analysisResult.strengths,
            red_flags: analysisResult.red_flags,
            completed_at: new Date().toISOString(),
        };

        const { error: updateError } = await updateReport(reportId, updateData);
        if (updateError) throw updateError;

        const { error: usageError } = await setReportsUsed(userId, (profile.reports_used ?? 0) + 1);
        if (usageError) console.error("[Fundakamental] failed to update reports_used:", usageError.message);

        return;
    } catch (err) {
        if (reportInserted) {
            try {
                await updateReportStatus(reportId, "failed", { error: (err as Error)?.message || String(err) });
            } catch {
                // Best-effort, matching the Python source's swallow-and-continue.
            }
        }

        console.error("[Fundakamental] analysis failed:", err);
        // Already replied "processing" — the failure is recorded on the report
        // (status "failed" + error), which the client picks up when polling.
        if (responded) return;
        if (err instanceof AnalysisHttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to complete analysis: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/analysis/status/:reportId */
export const getAnalysisStatus = async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.authId;

    try {
        const { data: report, error } = await getReportById(reportId, userId);
        if (error) throw error;
        if (!report) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Report not found" });
        }

        const done = report.status === "completed";
        return res.status(HTTP_STATUS.OK).json({
            report_id: reportId,
            status: report.status,
            error: report.status === "failed" ? report.error || "Analysis failed" : undefined,
            overall_progress: done ? 100 : report.status === "failed" ? 0 : 60,
            estimated_time: done ? null : 60,
        });
    } catch (err) {
        console.error("[Fundakamental] fetch analysis status failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching status: ${(err as Error)?.message || err}` });
    }
};
