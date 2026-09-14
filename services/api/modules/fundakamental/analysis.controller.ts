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
//   - featureGates.ts: the Python source actually gates `/analyze` with an
//     inline `utils/token_wallet.py` balance check (a later, separate
//     billing task — intentionally not ported). This port instead enforces
//     the plan-based `reports_used`/`reports_limit` counters already on
//     `funda_users` via `checkReportLimit`, which is the closest available
//     stand-in for "whatever gates report generation" using only what this
//     slice owns.
//   - Token metering: `tokens_used`/`tokens_charged`/`token_balance` from the
//     Python response are omitted — that's the token-wallet billing system,
//     a later task.
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
import { checkReportLimit } from "./featureGates.js";
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
        const limitCheck = checkReportLimit(profile);
        if (!limitCheck.allowed) {
            throw new AnalysisHttpError(
                402,
                tier === "free"
                    ? `You've used all ${limitCheck.limit} reports on the free plan. Upgrade to Pro for a much larger monthly allowance.`
                    : `You've used all ${limitCheck.limit} reports for this billing period. Upgrade or wait for your plan to renew.`,
            );
        }

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

        return res.status(HTTP_STATUS.OK).json({
            report_id: reportId,
            status: "completed",
            message: "Analysis completed successfully",
            analysis: analysisResult,
        });
    } catch (err) {
        if (reportInserted) {
            try {
                await updateReportStatus(reportId, "failed", { error: (err as Error)?.message || String(err) });
            } catch {
                // Best-effort, matching the Python source's swallow-and-continue.
            }
        }

        if (err instanceof AnalysisHttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("[Fundakamental] analysis failed:", err);
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

        // Mock processing steps (will be real in actual implementation) — ported
        // as-is from the Python source, including its "analyzing" status check,
        // which is currently unreachable since this flow never sets that status.
        const steps = [
            { name: "Uploading file", status: "completed", progress: 100.0 },
            { name: "Extracting text from document", status: "completed", progress: 100.0 },
            {
                name: "Generating embeddings",
                status: report.status === "analyzing" ? "analyzing" : "completed",
                progress: report.status === "analyzing" ? 50.0 : 100.0,
            },
            { name: "Analyzing financial data", status: "pending", progress: 0.0 },
            { name: "Generating report", status: "pending", progress: 0.0 },
        ];

        const overallProgress = steps.reduce((sum, step) => sum + step.progress, 0) / steps.length;

        return res.status(HTTP_STATUS.OK).json({
            report_id: reportId,
            status: report.status,
            overall_progress: overallProgress,
            steps,
            estimated_time: report.status !== "completed" ? 30 : null,
        });
    } catch (err) {
        console.error("[Fundakamental] fetch analysis status failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching status: ${(err as Error)?.message || err}` });
    }
};
