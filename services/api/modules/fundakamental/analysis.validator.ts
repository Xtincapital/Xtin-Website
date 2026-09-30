// Zod validators for the analysis endpoints — Node/TS port of the
// `AnalysisRequest` Pydantic model in `app/models/schemas.py`.
import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// Blank strings mean "not provided" — the web client sends company_ticker: ""
// when the user uploads a file without picking a company first.
const optionalText = z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(1).optional().nullable(),
);

const analysisRequestSchema = z
    .object({
        file_id: optionalText,
        company_ticker: optionalText,
        company_name: optionalText,
        // Personalization: how this investor thinks, so the report speaks to them.
        investor_style: z.enum(["beginner", "value", "growth", "income", "trader", "balanced"]).default("balanced"),
        // long_term | medium | short
        horizon: z.enum(["long_term", "medium", "short"]).default("long_term"),
        // Reader's region (IN|US|GB|EU|AE|SG|GLOBAL) so the report uses the right
        // currency symbol and market conventions. Falls back to the ticker's market.
        region: z.string().optional().nullable(),
    })
    .refine((data) => Boolean(data.file_id || data.company_ticker || data.company_name), {
        message: "Either file_id or company_ticker must be provided",
    });

export const validateAnalysisRequest = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = analysisRequestSchema.safeParse(trimmed);
    if (!result.success) {
        return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    }
    return { data: result.data, message: "Validation successful" };
};
