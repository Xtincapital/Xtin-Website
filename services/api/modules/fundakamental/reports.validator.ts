// Validators for reports list pagination + PDF export request bodies.
// Node/TS port of the Pydantic models `reports.py`/`pdf_export.py` use
// (`ExportAnalysisRequest`, `ExportScreeningRequest`, `ExportTechnicalRequest`).
import * as z from "zod/v4";

const listReportsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const validateListReportsQuery = (input: unknown) => {
    const result = listReportsQuerySchema.safeParse(input);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// Port of `ExportAnalysisRequest`. `analysis_data` is expected in the same
// shape `GET /fundakamental/reports/:reportId` returns (AnalysisReportResponse) —
// see reports.controller.ts header comment for why, unlike the Python
// source's mismatched ad hoc dict.
const exportAnalysisBodySchema = z.object({
    ticker: z.string().min(1, "ticker is required"),
    analysis_data: z.record(z.string(), z.any()),
});

export const validateExportAnalysisBody = (input: unknown) => {
    const result = exportAnalysisBodySchema.safeParse(input);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// Port of `ExportScreeningRequest`.
const exportScreeningBodySchema = z.object({
    preset_name: z.string().min(1, "preset_name is required"),
    description: z.string().optional().nullable(),
    stocks: z.array(z.record(z.string(), z.any())).default([]),
    filters: z.array(z.record(z.string(), z.any())).optional().nullable(),
    total_matches: z.coerce.number().int(),
    average_score: z.coerce.number().optional().nullable(),
    top_sectors: z.array(z.record(z.string(), z.any())).optional().nullable(),
});

export const validateExportScreeningBody = (input: unknown) => {
    const result = exportScreeningBodySchema.safeParse(input);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

// Port of `ExportTechnicalRequest`.
const exportTechnicalBodySchema = z.object({
    ticker: z.string().min(1, "ticker is required"),
    technical_data: z.record(z.string(), z.any()),
});

export const validateExportTechnicalBody = (input: unknown) => {
    const result = exportTechnicalBodySchema.safeParse(input);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
