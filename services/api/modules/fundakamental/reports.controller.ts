// Reports + PDF Export API — Node/TS port of `api/endpoints/reports.py` and
// `api/endpoints/pdf_export.py`.
//
// KNOWN BUG FIXED: `pdf_export.py`'s ticker convenience endpoint
// (`GET /export/analysis/{ticker}`) queried a Supabase table called
// `"analysis_reports"`, which has never existed in any FundaKaMental
// migration — the real table is `funda_reports` (see
// reports.repository.ts). Every query here uses `funda_reports`.
//
// A SECOND, related bug in the same Python file: that ticker endpoint (and
// the generic `POST /export/analysis`) built its PDF context from an ad hoc
// dict shape (`company_name`, `current_price`, `recommendation`, `valuation`,
// `weaknesses`, `risk_level`, `risk_factors`, ...) that matches NONE of
// `funda_reports`'s real columns — it was written against the same
// never-existent table. This port instead builds PDF context from the real
// `AnalysisReportResponse` shape (`company`, `ticker`, `exchange`,
// `overall_score`, `summary`, `metrics`, `key_ratios`, `strengths`,
// `red_flags`, `investment_assessment`, plus the Pro-tier
// `analysis_result` fields) everywhere — the same shape `GET /reports/{id}`
// already returns, so `analysisReport.njk` has one consistent contract.
//
// Feature gating: the parallel analysis-generation task already created
// `featureGates.ts` with `requirePdfExport` (plan check) and
// `checkReportLimit` (reports_used/reports_limit check). `funda_users` has
// no dedicated `pdf_exports` usage counter (unlike the Python source's
// Stripe-backed one), so `checkReportLimit` doubles as this port's
// `check_pdf_limit` — see that file's header comment.
import { HTTP_STATUS } from "../../constants/constants.js";
import {
    listReportsForUser,
    countReportsForUser,
    getReportByIdForUser,
    getLatestReportByTickerForUser,
    deleteReportByIdForUser,
    deleteChatMessagesByReportId,
    getFundaUserProfile,
} from "./reports.repository.js";
import { requirePdfExport, checkReportLimit, isPremiumPlan, type FundaUserProfile } from "./featureGates.js";
import { generateAnalysisReportPdf, generateScreeningReportPdf, generateTechnicalReportPdf, getPdfSize } from "./pdfGenerator.js";
import {
    validateListReportsQuery,
    validateExportAnalysisBody,
    validateExportScreeningBody,
    validateExportTechnicalBody,
} from "./reports.validator.js";

/* ========================================================================
 * SHARED HELPERS
 * ==================================================================== */

// Port of the fallback sample data in `reports.py`'s `get_report` — used
// when `analysis_result` is empty (e.g. a report seeded without an AI run).
// Already shaped correctly against AnalysisReportResponse in the Python
// source, so ported verbatim.
function sampleAnalysisData(report: Record<string, unknown>) {
    return {
        company: report.company || "Sample Company",
        ticker: report.ticker || "SMPL",
        exchange: "NASDAQ",
        overall_score: 8.5,
        summary: "Comprehensive financial analysis shows strong fundamentals with some areas of concern.",
        metrics: {
            profitability: { score: 9.2, label: "Excellent" },
            liquidity: { score: 7.8, label: "Good" },
            solvency: { score: 8.5, label: "Strong" },
            efficiency: { score: 8.9, label: "Excellent" },
        },
        key_ratios: [
            { name: "P/E Ratio", value: "28.5x", benchmark: "Industry: 25.2x" },
            { name: "ROE", value: "89.6%", benchmark: "Industry: 18.4%" },
            { name: "Gross Margin", value: "46.2%", benchmark: "Industry: 42.1%" },
            { name: "Current Ratio", value: "1.08", benchmark: "Industry: 1.35" },
            { name: "Debt/Equity", value: "1.98", benchmark: "Industry: 0.85" },
            { name: "Operating Margin", value: "31.5%", benchmark: "Industry: 22.3%" },
        ],
        strengths: [
            "Exceptional brand value and customer loyalty",
            "Dominant market position",
            "Strong cash flow generation",
            "Proven pricing power",
        ],
        red_flags: ["High debt levels relative to historical norms", "Slowing growth in core segments", "Regulatory scrutiny"],
        investment_assessment:
            "This company represents a quality holding for long-term investors. While valuation appears premium, strong fundamentals support the current multiple.",
    };
}

/** Port of `get_report`'s response-building logic (minus the FastAPI response model). Shared by the JSON detail endpoint and every PDF-export endpoint that reads from `funda_reports`. */
function buildAnalysisReportResponse(report: Record<string, unknown>) {
    const reportData = sampleAnalysisDataIfEmpty(report);

    return {
        id: report.id,
        company: reportData.company,
        ticker: reportData.ticker,
        exchange: reportData.exchange ?? "N/A",
        date: report.created_at,
        overall_score: reportData.overall_score,
        summary: reportData.summary,
        metrics: reportData.metrics,
        key_ratios: reportData.key_ratios,
        strengths: reportData.strengths,
        red_flags: reportData.red_flags,
        investment_assessment: reportData.investment_assessment,
        plain_english: reportData.plain_english ?? null,
        personalized_take: reportData.personalized_take ?? null,
        bull_case: reportData.bull_case ?? null,
        bear_case: reportData.bear_case ?? null,
        what_to_watch: reportData.what_to_watch ?? null,
        peer_context: reportData.peer_context ?? null,
        data_confidence: reportData.data_confidence ?? null,
    };
}

function sampleAnalysisDataIfEmpty(report: Record<string, unknown>): Record<string, unknown> {
    const result = report.analysis_result as Record<string, unknown> | null | undefined;
    if (result && Object.keys(result).length > 0) return result;
    return sampleAnalysisData(report);
}

async function loadUserProfile(userId: string): Promise<FundaUserProfile | null> {
    const { data, error } = await getFundaUserProfile(userId);
    if (error || !data) return null;
    return data as FundaUserProfile;
}

function pdfResponse(res, buffer: Buffer, filename: string) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", String(buffer.length));
    return res.status(HTTP_STATUS.OK).send(buffer);
}

/* ========================================================================
 * REPORTS CRUD — port of reports.py
 * ==================================================================== */

/* GET /api/fundakamental/reports */
export const getReportsList = async (req, res) => {
    const validation = validateListReportsQuery(req.query);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { limit, offset } = validation.data;
    const userId = req.user.authId;

    try {
        const [{ data: reportsData, error: reportsError }, { count, error: countError }] = await Promise.all([
            listReportsForUser(userId, limit, offset),
            countReportsForUser(userId),
        ]);

        if (reportsError) throw reportsError;
        if (countError) throw countError;

        const reports = (reportsData || []).map((report) => ({
            id: report.id,
            company: report.company || "Unknown",
            ticker: report.ticker || "N/A",
            overall_score: report.overall_score ?? 0.0,
            created_at: report.created_at,
            status: report.status || "pending",
        }));

        return res.status(HTTP_STATUS.OK).json({ total: count || 0, reports });
    } catch (err) {
        console.error("[Fundakamental] list reports failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to list reports: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/reports/:reportId */
export const getReport = async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.authId;

    try {
        const { data: report, error } = await getReportByIdForUser(reportId, userId);
        if (error || !report) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Report not found" });
        }

        if (report.status !== "completed") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Report is still being processed. Status: ${report.status}` });
        }

        return res.status(HTTP_STATUS.OK).json(buildAnalysisReportResponse(report));
    } catch (err) {
        console.error("[Fundakamental] get report failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to get report: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/reports/:reportId */
export const deleteReport = async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.authId;

    try {
        const { data: report, error } = await getReportByIdForUser(reportId, userId);
        if (error || !report) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Report not found" });
        }

        const { error: deleteError } = await deleteReportByIdForUser(reportId, userId);
        if (deleteError) throw deleteError;

        await deleteChatMessagesByReportId(reportId);

        return res.status(HTTP_STATUS.OK).json({ message: "Report deleted successfully" });
    } catch (err) {
        console.error("[Fundakamental] delete report failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to delete report: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * PDF EXPORT — port of pdf_export.py
 * ==================================================================== */

/* GET /api/fundakamental/reports/:reportId/pdf */
export const exportReportPdf = async (req, res) => {
    const { reportId } = req.params;
    const userId = req.user.authId;

    try {
        const profile = await loadUserProfile(userId);
        if (!profile) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User profile not found" });

        const gate = requirePdfExport(profile);
        if (!gate.allowed) return res.status(HTTP_STATUS.FORBIDDEN).json({ error: gate.reason });

        const usage = checkReportLimit(profile);
        if (!usage.allowed) {
            return res
                .status(429)
                .json({ error: `Daily limit reached. You've used ${usage.used} out of ${usage.limit} allowed today. Upgrade to Premium for unlimited access.` });
        }

        const { data: report, error } = await getReportByIdForUser(reportId, userId);
        if (error || !report) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Report not found" });
        if (report.status !== "completed") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Report is still being processed. Status: ${report.status}` });
        }

        const analysisData = buildAnalysisReportResponse(report);
        const pdfBytes = await generateAnalysisReportPdf(analysisData);

        const filename = `analysis_${analysisData.ticker}_${String(userId).slice(0, 8)}.pdf`;
        return pdfResponse(res, pdfBytes, filename);
    } catch (err) {
        console.error("[Fundakamental] export report PDF failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating PDF: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/reports/ticker/:ticker/pdf
 * Port of the buggy `GET /export/analysis/{ticker}` — fixed to query
 * `funda_reports` (not "analysis_reports") and to map real columns. */
export const exportReportPdfByTicker = async (req, res) => {
    const ticker = String(req.params.ticker || "").toUpperCase();
    const userId = req.user.authId;

    try {
        const profile = await loadUserProfile(userId);
        if (!profile) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User profile not found" });

        const gate = requirePdfExport(profile);
        if (!gate.allowed) return res.status(HTTP_STATUS.FORBIDDEN).json({ error: gate.reason });

        const usage = checkReportLimit(profile);
        if (!usage.allowed) {
            return res
                .status(429)
                .json({ error: `Daily limit reached. You've used ${usage.used} out of ${usage.limit} allowed today. Upgrade to Premium for unlimited access.` });
        }

        const { data: rows, error } = await getLatestReportByTickerForUser(ticker, userId);
        if (error) throw error;
        if (!rows || rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: `No analysis found for ${ticker}. Please run analysis first.` });
        }

        const report = rows[0];
        if (report.status !== "completed") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Report is still being processed. Status: ${report.status}` });
        }

        const analysisData = buildAnalysisReportResponse(report);
        const pdfBytes = await generateAnalysisReportPdf(analysisData);

        const filename = `analysis_${ticker}_${String(userId).slice(0, 8)}.pdf`;
        return pdfResponse(res, pdfBytes, filename);
    } catch (err) {
        console.error("[Fundakamental] export report PDF by ticker failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating PDF: ${(err as Error)?.message || err}` });
    }
};

/* POST /api/fundakamental/reports/export/analysis
 * Port of `POST /export/analysis`. `analysis_data` in the request body is
 * expected in the AnalysisReportResponse shape (as returned by
 * GET /reports/:reportId) — see module header comment. */
export const exportAnalysisPdfFromBody = async (req, res) => {
    const validation = validateExportAnalysisBody(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { ticker, analysis_data } = validation.data;
    const userId = req.user.authId;

    try {
        const profile = await loadUserProfile(userId);
        if (!profile) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User profile not found" });

        const gate = requirePdfExport(profile);
        if (!gate.allowed) return res.status(HTTP_STATUS.FORBIDDEN).json({ error: gate.reason });

        const usage = checkReportLimit(profile);
        if (!usage.allowed) {
            return res
                .status(429)
                .json({ error: `Daily limit reached. You've used ${usage.used} out of ${usage.limit} allowed today. Upgrade to Premium for unlimited access.` });
        }

        const pdfBytes = await generateAnalysisReportPdf(analysis_data);
        const filename = `analysis_${ticker}_${String(userId).slice(0, 8)}.pdf`;
        return pdfResponse(res, pdfBytes, filename);
    } catch (err) {
        console.error("[Fundakamental] export analysis PDF failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating PDF: ${(err as Error)?.message || err}` });
    }
};

/* POST /api/fundakamental/reports/export/screening */
export const exportScreeningPdf = async (req, res) => {
    const validation = validateExportScreeningBody(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { preset_name, description, stocks, filters, total_matches, average_score, top_sectors } = validation.data;
    const userId = req.user.authId;

    try {
        const profile = await loadUserProfile(userId);
        if (!profile) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User profile not found" });

        const gate = requirePdfExport(profile);
        if (!gate.allowed) return res.status(HTTP_STATUS.FORBIDDEN).json({ error: gate.reason });

        const usage = checkReportLimit(profile);
        if (!usage.allowed) {
            return res
                .status(429)
                .json({ error: `Daily limit reached. You've used ${usage.used} out of ${usage.limit} allowed today. Upgrade to Premium for unlimited access.` });
        }

        const screeningData = {
            preset_name,
            description: description || "",
            total_matches,
            stocks,
            filters_applied: filters || [],
            average_score: average_score || 0,
            top_sectors: top_sectors || [],
        };

        const pdfBytes = await generateScreeningReportPdf(screeningData);
        const filename = `screening_${preset_name.replace(/\s+/g, "_")}_${String(userId).slice(0, 8)}.pdf`;
        return pdfResponse(res, pdfBytes, filename);
    } catch (err) {
        console.error("[Fundakamental] export screening PDF failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating PDF: ${(err as Error)?.message || err}` });
    }
};

/* POST /api/fundakamental/reports/export/technical */
export const exportTechnicalPdf = async (req, res) => {
    const validation = validateExportTechnicalBody(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { ticker, technical_data } = validation.data;
    const userId = req.user.authId;

    try {
        const profile = await loadUserProfile(userId);
        if (!profile) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User profile not found" });

        const gate = requirePdfExport(profile);
        if (!gate.allowed) return res.status(HTTP_STATUS.FORBIDDEN).json({ error: gate.reason });

        const usage = checkReportLimit(profile);
        if (!usage.allowed) {
            return res
                .status(429)
                .json({ error: `Daily limit reached. You've used ${usage.used} out of ${usage.limit} allowed today. Upgrade to Premium for unlimited access.` });
        }

        const pdfBytes = await generateTechnicalReportPdf({ ...technical_data, ticker });
        const filename = `technical_${ticker}_${String(userId).slice(0, 8)}.pdf`;
        return pdfResponse(res, pdfBytes, filename);
    } catch (err) {
        console.error("[Fundakamental] export technical PDF failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating PDF: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/reports/export/info
 * Port of `GET /export/info`. The Python source reads Stripe subscription +
 * usage state via `stripe_service`; that's out of scope here (owned by a
 * separate billing task), so this reports the same plan-based access/usage
 * state `featureGates.ts` already exposes from `funda_users`. */
export const getExportInfo = async (req, res) => {
    const userId = req.user.authId;

    try {
        const profile = await loadUserProfile(userId);
        if (!profile) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "User profile not found" });

        const usage = checkReportLimit(profile);

        return res.status(HTTP_STATUS.OK).json({
            has_access: isPremiumPlan(profile),
            usage,
            supported_formats: ["analysis", "screening", "technical"],
            max_file_size: "10 MB",
            format: "PDF (A4, portrait)",
        });
    } catch (err) {
        console.error("[Fundakamental] export info failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Failed to get export info: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/reports/export/health
 * Port of `GET /export/health`. Unauthenticated diagnostic endpoint,
 * matching the Python source (no auth dependency there either). */
export const getExportHealth = async (_req, res) => {
    try {
        const testData = {
            ticker: "TEST",
            company: "Test Company",
            exchange: "N/A",
            date: new Date().toISOString(),
            overall_score: 5,
            summary: "",
            metrics: {},
            key_ratios: [],
            strengths: [],
            red_flags: [],
            investment_assessment: "",
        };

        const pdfBytes = await generateAnalysisReportPdf(testData);

        return res.status(HTTP_STATUS.OK).json({
            status: "healthy",
            pdf_generator: "operational",
            template_system: "nunjucks",
            pdf_engine: "puppeteer",
            test_pdf_size: getPdfSize(pdfBytes),
        });
    } catch (err) {
        return res.status(HTTP_STATUS.OK).json({ status: "unhealthy", error: (err as Error)?.message || String(err) });
    }
};
