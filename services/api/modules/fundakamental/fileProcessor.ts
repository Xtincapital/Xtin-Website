// File Processing Service — Node/TS port of `utils/file_processor.py`'s
// `FileProcessor` class.
//
// Ported: `validate_file` -> validateFile, `upload_to_storage` -> uploadToStorage,
// `get_content_type` -> getContentType, `save_document_record` -> saveDocumentRecord,
// and the EXTRACTION half of `process_file` -> processFile.
//
// Intentionally NOT ported:
//   - Both `add_to_vector_store` method definitions (the Python source has a
//     duplicate/shadowing definition — a pre-existing quirk, irrelevant here)
//     and the chunking branch inside `process_file` (`chunk_text`/
//     `chunk_by_pages`) — chunking only exists to feed the RAG vector store,
//     a separate later task. `processFile` here returns extracted text +
//     metadata only, no chunks.
//
// Schema deviation: the Python source's `save_document_record` persists
// `extracted_text` and `metadata` columns directly onto `source_documents`.
// The live `funda_source_documents` table (see
// database/migrations/0001_gini_journal_fundakamental.sql) has NO such
// columns — only id, user_id, report_id, file_name, file_size, file_type,
// storage_path, created_at (this is the exact, shared contract with the
// parallel report-retrieval/PDF-export task, so it isn't something this port
// can add to). Extracted text is therefore NOT cached in the DB; the
// `/analysis/analyze` endpoint re-downloads the file from Storage and
// re-runs `processFile` on demand instead of reading a stored column. See
// analysis.controller.ts's `startAnalysis` for that re-extraction.
import path from "node:path";
import supabase from "../../supabase/index.js";
import { extractTextFromPdf, extractDataFromExcel } from "./documentExtractors.js";

const ALLOWED_EXTENSIONS = new Set([".pdf", ".xlsx", ".xls"]);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const STORAGE_BUCKET = "funda-documents";

/** Port of `validate_file`. */
export function validateFile(filename: string, fileSize: number): { isValid: boolean; error: string } {
    const ext = path.extname(filename || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return {
            isValid: false,
            error: `File type not supported. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
        };
    }
    if (fileSize > MAX_FILE_SIZE) {
        const maxMb = MAX_FILE_SIZE / (1024 * 1024);
        return { isValid: false, error: `File too large. Maximum size: ${maxMb}MB` };
    }
    return { isValid: true, error: "" };
}

/** Port of `get_content_type` (`FileProcessor.get_content_type`). */
export function getContentType(fileExt: string): string {
    const contentTypes: Record<string, string> = {
        ".pdf": "application/pdf",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel",
    };
    return contentTypes[fileExt.toLowerCase()] || "application/octet-stream";
}

export interface UploadToStorageResult {
    success: boolean;
    storage_path?: string;
    filename?: string;
    size?: number;
    uploaded_at?: string;
    error?: string;
}

/** Port of `upload_to_storage`. Path convention `{user_id}/{timestamp}_{filename}`
 * matches the Storage RLS policies (`(storage.foldername(name))[1] = auth.uid()::text`)
 * in the migration file exactly. */
export async function uploadToStorage(
    fileContent: Buffer,
    filename: string,
    userId: string,
): Promise<UploadToStorageResult> {
    try {
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d+Z$/, "")
            .replace("T", "_");
        const ext = path.extname(filename || "");
        const storagePath = `${userId}/${timestamp}_${filename}`;

        const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, fileContent, {
            contentType: getContentType(ext),
            upsert: false,
        });

        if (error) {
            return { success: false, error: `Upload failed: ${error.message}` };
        }

        return {
            success: true,
            storage_path: storagePath,
            filename,
            size: fileContent.length,
            uploaded_at: new Date().toISOString(),
        };
    } catch (err) {
        return { success: false, error: `Upload failed: ${(err as Error)?.message || err}` };
    }
}

export interface ProcessFileResult {
    filename: string;
    file_type: string;
    success: boolean;
    extracted_text: string;
    metadata: Record<string, unknown>;
    error?: string;
}

/** Port of the extraction portion of `process_file` (no chunking, no vector store). */
export async function processFile(fileContent: Buffer, filename: string): Promise<ProcessFileResult> {
    const fileExt = path.extname(filename || "").toLowerCase();

    const result: ProcessFileResult = {
        filename,
        file_type: fileExt,
        success: false,
        extracted_text: "",
        metadata: {},
    };

    try {
        if (fileExt === ".pdf") {
            const extraction = await extractTextFromPdf(fileContent);

            if (extraction.success) {
                result.extracted_text = extraction.text;
                result.metadata = {
                    total_pages: extraction.total_pages,
                    char_count: extraction.char_count,
                    word_count: extraction.word_count,
                    extraction_method: extraction.extraction_method,
                };
                result.success = true;
            } else {
                result.error = extraction.error || "PDF extraction failed";
            }
        } else if (fileExt === ".xlsx" || fileExt === ".xls") {
            const extraction = extractDataFromExcel(fileContent);

            if (extraction.success) {
                result.extracted_text = extraction.text;
                result.metadata = {
                    total_sheets: extraction.total_sheets,
                    char_count: extraction.char_count,
                    word_count: extraction.word_count,
                    sheets: extraction.sheets.map((sheet) => ({
                        name: sheet.name,
                        rows: sheet.row_count,
                        columns: sheet.column_count,
                    })),
                };
                result.success = true;
            } else {
                result.error = extraction.error || "Excel extraction failed";
            }
        } else {
            result.error = `Unsupported file type: ${fileExt}`;
        }
    } catch (err) {
        result.error = `Processing failed: ${(err as Error)?.message || err}`;
    }

    return result;
}

export interface SaveDocumentRecordParams {
    userId: string;
    filename: string;
    fileSize: number;
    fileType: string;
    storagePath: string;
    reportId?: string | null;
}

/** Port of `save_document_record`, trimmed to the columns `funda_source_documents`
 * actually has (see the schema-deviation note at the top of this file). */
export async function saveDocumentRecord(params: SaveDocumentRecordParams) {
    const { userId, filename, fileSize, fileType, storagePath, reportId } = params;
    try {
        const { data, error } = await supabase
            .from("funda_source_documents")
            .insert({
                user_id: userId,
                report_id: reportId ?? null,
                file_name: filename,
                file_size: fileSize,
                file_type: fileType,
                storage_path: storagePath,
            })
            .select();

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error("Failed to create document record");
        return data[0];
    } catch (err) {
        throw new Error(`Database error: ${(err as Error)?.message || err}`);
    }
}
