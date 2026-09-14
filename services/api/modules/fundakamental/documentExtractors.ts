// Document text extraction — Node/TS port of `utils/pdf_extractor.py` and
// `utils/excel_extractor.py`.
//
// Ported: `extract_text_from_pdf` (-> extractTextFromPdf) and
// `extract_data_from_excel` (-> extractDataFromExcel) — these are the only
// two functions `file_processor.py`'s `process_file` actually calls.
//
// Intentionally NOT ported:
//   - `extract_tables_from_pdf` — pdfplumber's table-detection algorithm has
//     no well-maintained npm equivalent, and its only consumer
//     (`process_file`) merely records a `tables_found` count in metadata
//     (informational only; never fed into the AI prompt or persisted
//     per-table). Skipped rather than approximated with a weak heuristic.
//   - `extract_specific_sheets`, `get_excel_summary` — unused by
//     `process_file`.
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";

export interface PdfPage {
    page_number: number;
    text: string;
    char_count: number;
}

export interface PdfExtractionResult {
    text: string;
    pages: PdfPage[];
    total_pages: number;
    extraction_method: string;
    success: boolean;
    error: string | null;
    char_count?: number;
    word_count?: number;
}

/** Port of `extract_text_from_pdf`. pdf-parse (pdf.js under the hood) replaces the
 * Python source's pdfplumber-primary/PyPDF2-fallback pair — one library, no fallback
 * needed since pdf.js's text extraction already covers both cases those two handled. */
export async function extractTextFromPdf(fileContent: Buffer): Promise<PdfExtractionResult> {
    const pages: PdfPage[] = [];

    try {
        const data = await pdfParse(fileContent, {
            // Capture per-page text the same way the Python source keeps a
            // `pages` array alongside the concatenated full text.
            pagerender: async (pageData: any) => {
                const textContent = await pageData.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                pages.push({
                    page_number: pages.length + 1,
                    text: pageText,
                    char_count: pageText.length,
                });
                return pageText;
            },
        });

        const text = String(data.text || "").trim();

        return {
            text,
            pages,
            total_pages: data.numpages || pages.length,
            extraction_method: "pdf-parse",
            success: true,
            error: null,
            char_count: text.length,
            word_count: text.length ? text.split(/\s+/).filter(Boolean).length : 0,
        };
    } catch (err) {
        return {
            text: "",
            pages: [],
            total_pages: 0,
            extraction_method: "pdf-parse",
            success: false,
            error: `PDF extraction failed: ${(err as Error)?.message || err}`,
        };
    }
}

export interface ExcelSheetResult {
    name: string;
    row_count: number;
    column_count: number;
    columns: string[];
    text: string;
    char_count: number;
}

export interface ExcelExtractionResult {
    text: string;
    sheets: ExcelSheetResult[];
    total_sheets: number;
    success: boolean;
    error: string | null;
    char_count?: number;
    word_count?: number;
}

/** Port of `extract_data_from_excel`. Uses SheetJS (`xlsx`) as the pandas/openpyxl
 * equivalent — reads every sheet and renders it as `col | col | col` rows, matching
 * the Python source's plain-text table format exactly. */
export function extractDataFromExcel(fileContent: Buffer): ExcelExtractionResult {
    try {
        const workbook = XLSX.read(fileContent, { type: "buffer" });
        const sheets: ExcelSheetResult[] = [];
        let fullText = "";

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                raw: false,
                defval: "",
            });

            const columns = (rows[0] || []).map((c) => String(c));
            const dataRows = rows.slice(1);

            let sheetText = `\n\n=== Sheet: ${sheetName} ===\n\n`;
            sheetText += columns.join(" | ") + "\n";
            sheetText += "-".repeat(80) + "\n";
            for (const row of dataRows) {
                sheetText += row.map((v) => String(v ?? "")).join(" | ") + "\n";
            }

            sheets.push({
                name: sheetName,
                row_count: dataRows.length,
                column_count: columns.length,
                columns,
                text: sheetText,
                char_count: sheetText.length,
            });

            fullText += sheetText + "\n\n";
        }

        const text = fullText.trim();

        return {
            text,
            sheets,
            total_sheets: workbook.SheetNames.length,
            success: true,
            error: null,
            char_count: text.length,
            word_count: text.length ? text.split(/\s+/).filter(Boolean).length : 0,
        };
    } catch (err) {
        return {
            text: "",
            sheets: [],
            total_sheets: 0,
            success: false,
            error: `Excel extraction failed: ${(err as Error)?.message || err}`,
        };
    }
}
