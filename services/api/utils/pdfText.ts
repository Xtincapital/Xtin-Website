import pdfParse from "pdf-parse";

// Text pieces on the same line further apart than this (in PDF points) are separate
// cells; they get COLUMN_GAP between them so table rows can be split into columns.
const CELL_GAP_PT = 2;
export const COLUMN_GAP = "   ";

/** pdf-parse page renderer that keeps table cells apart. Its default joins every piece
 *  on a line with nothing between them, so "Date" + "Asset" came out as "DateAsset". */
async function renderPage(pageData: any): Promise<string> {
    const content = await pageData.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
    let text = "";
    let lastY: number | null = null;
    let lastEnd: number | null = null;
    for (const item of content.items as { str: string; transform: number[]; width: number }[]) {
        const x = item.transform[4];
        const y = item.transform[5];
        if (lastY === null || Math.abs(y - lastY) > 1) {
            if (lastY !== null) text += "\n";
        } else if (lastEnd !== null && x - lastEnd > CELL_GAP_PT) {
            text += COLUMN_GAP;
        }
        text += item.str;
        lastY = y;
        lastEnd = x + (item.width || 0);
    }
    return text;
}

async function extract(content: Buffer, version?: string): Promise<string> {
    const options: Record<string, unknown> = { pagerender: renderPage };
    if (version) options.version = version;
    return (await pdfParse(content, options as any)).text;
}

/**
 * The text lines of a PDF, in reading order, with table cells separated by
 * COLUMN_GAP. pdf-parse defaults to its bundled pdf.js v1.10.100, which rejects PDFs
 * made by jsPDF (our own exports included) with "bad XRef entry"; its bundled
 * v2.0.550 reads them and ordinary statements alike, so try that first.
 */
export async function pdfTextLines(content: Buffer): Promise<string[]> {
    let text: string;
    try {
        text = await extract(content, "v2.0.550");
    } catch {
        text = await extract(content);
    }
    return String(text || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

/** Splits a line into table cells (runs of 2+ spaces mark a cell boundary). */
export function pdfLineCells(line: string): string[] {
    return line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
}
