// Text chunking utility — Node/TS port of `utils/text_chunker.py`'s
// `chunk_text` (sentence-boundary-aware chunking with overlap).
//
// `chunk_by_pages` and `chunk_by_sections` are intentionally NOT ported:
//   - `chunk_by_pages` is only reachable from `file_processor.py`'s
//     `process_file` when a PDF extraction returns page-level text. This
//     port's `fileProcessor.ts` deliberately doesn't surface `pages` in its
//     `ProcessFileResult` (see that file's header comment — extraction
//     returns `extracted_text` + `metadata` only), and this task's wiring
//     point (`analysis.controller.ts`'s `uploadFile`) only has the flat
//     extracted text to chunk, for both PDFs and Excel files alike.
//   - `chunk_by_sections` has no caller anywhere in the Python source.
export interface TextChunk {
    chunk_id: number;
    text: string;
    start_char: number;
    end_char: number;
    char_count: number;
    word_count: number;
}

/** Finds the last occurrence of `sub` within `text.slice(start, end)`, returning
 * its index in `text`'s own coordinates (or -1 if not found) — the JS
 * equivalent of Python's `str.rfind(sub, start, end)`. */
function rfind(text: string, sub: string, start: number, end: number): number {
    const segment = text.slice(start, end);
    const idx = segment.lastIndexOf(sub);
    return idx === -1 ? -1 : start + idx;
}

/** Port of `chunk_text`. Splits text into overlapping chunks, preferring to break
 * at a sentence boundary (`. `, `! `, `? `, or a newline) near the target chunk
 * size rather than mid-sentence. Defaults match the Python source exactly. */
export function chunkText(text: string, chunkSize = 1000, chunkOverlap = 200, minChunkSize = 100): TextChunk[] {
    // Matches the Python source: the length gate checks the ORIGINAL text,
    // before whitespace collapsing below.
    if (!text || text.length < minChunkSize) return [];

    const chunks: TextChunk[] = [];
    let start = 0;
    let chunkId = 0;

    // Clean text (collapse all whitespace runs to a single space).
    const cleaned = text.replace(/\s+/g, " ").trim();

    while (start < cleaned.length) {
        let end = start + chunkSize;

        // If this isn't the last chunk, try to break at a sentence boundary.
        if (end < cleaned.length) {
            const sentenceEnd = Math.max(
                rfind(cleaned, ". ", start, end),
                rfind(cleaned, "! ", start, end),
                rfind(cleaned, "? ", start, end),
                rfind(cleaned, "\n", start, end),
            );

            if (sentenceEnd > start + minChunkSize) {
                end = sentenceEnd + 1;
            }
        }

        const chunkContent = cleaned.slice(start, end).trim();

        if (chunkContent.length >= minChunkSize) {
            chunks.push({
                chunk_id: chunkId,
                text: chunkContent,
                start_char: start,
                end_char: end,
                char_count: chunkContent.length,
                word_count: chunkContent.split(/\s+/).filter(Boolean).length,
            });
            chunkId += 1;
        }

        // Move start position with overlap.
        start = end - chunkOverlap;

        // Prevent infinite loop (port of the Python source's guard, including
        // its quirk of only checking against the last chunk's start when at
        // least one chunk has been produced so far).
        if (chunks.length > 0 && start <= chunks[chunks.length - 1].start_char) {
            start = end;
        }
    }

    return chunks;
}
