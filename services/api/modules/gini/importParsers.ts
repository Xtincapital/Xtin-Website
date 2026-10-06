// Gini document import — parses an uploaded CSV / Excel sheet of assets or
// liabilities into rows shaped exactly like the `POST /gini/assets` and
// `POST /gini/liabilities` bodies (see assets.validator.ts /
// liabilities.validator.ts), so the frontend can preview them and then save
// each row straight through. Stateless: nothing is written here.
import * as XLSX from "xlsx";
import { pdfLineCells, pdfTextLines } from "../../utils/pdfText.js";

export type ImportKind = "assets" | "liabilities";

export interface ParsedAsset {
    name: string;
    category: string | null;
    value: number;
    return_rate: number | null;
}

export interface ParsedLiability {
    name: string;
    type: string | null;
    amount: number;
    rate: number | null;
    emi: number | null;
    tenure: number | null;
}

const norm = (h: unknown) =>
    String(h ?? "")
        .replace(/\uFEFF/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const cleaned = String(v).replace(/[,\s₹$€£¥%]/g, "");
    const m = cleaned.match(/-?\d*\.?\d+/);
    if (!m) return null;
    const n = parseFloat(m[0]);
    return Number.isFinite(n) ? n : null;
};

const text = (v: unknown): string | null => {
    const s = String(v ?? "").trim();
    return s ? s.slice(0, 200) : null;
};

const ALIASES: Record<string, string[]> = {
    name: ["name", "asset", "asset name", "liability", "liability name", "description", "particulars", "holding", "holding name", "scheme", "scheme name", "fund", "fund name", "instrument", "instrument name", "security", "security name", "stock", "stock name", "company", "loan", "loan name"],
    category: ["category", "asset class", "class", "asset type", "type of asset"],
    type: ["type", "loan type", "liability type", "category"],
    value: ["value", "current value", "market value", "amount", "balance", "worth", "current market value"],
    amount: ["amount", "outstanding", "outstanding amount", "balance", "principal", "principal outstanding", "loan amount", "value"],
    rate: ["rate", "interest rate", "interest", "roi", "rate of interest", "return rate", "expected return", "return", "cagr"],
    emi: ["emi", "monthly emi", "installment", "monthly payment"],
    tenure: ["tenure", "remaining tenure", "months", "term", "remaining months", "tenure months"],
};

const CATEGORY_HINTS: [RegExp, string][] = [
    [/real estate|property|house|flat|land/i, "Real Estate"],
    [/mutual|mf|fund|sip/i, "Mutual Funds"],
    [/stock|equity|share/i, "Stocks"],
    [/fixed deposit|fd\b|deposit/i, "Fixed Deposits"],
    [/gold|silver/i, "Gold"],
    [/cash|savings|bank/i, "Cash"],
    [/ppf|epf|nps|provident/i, "PPF"],
    [/insurance|ulip|lic/i, "Insurance"],
];
const LIABILITY_HINTS: [RegExp, string][] = [
    [/credit\s*card/i, "Credit Card"],
    [/home|housing|mortgage/i, "Home Loan"],
    [/\b(car|auto|vehicle)\b/i, "Car Loan"],
    [/personal/i, "Personal Loan"],
];

function mapCategory(raw: string | null, name: string): string | null {
    const hay = `${raw ?? ""} ${name}`;
    for (const [re, label] of CATEGORY_HINTS) if (re.test(hay)) return label;
    return raw ? "Others" : null;
}
function mapLiabilityType(raw: string | null, name: string): string | null {
    const hay = `${raw ?? ""} ${name}`;
    for (const [re, label] of LIABILITY_HINTS) if (re.test(hay)) return label;
    return raw ? "Others" : null;
}

/** Finds the header row (first row with 2+ recognizable columns) and returns
 * column-index lookups per logical field. */
function locate(rows: unknown[][], fields: string[]) {
    for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const headers = rows[r].map(norm);
        const idx: Record<string, number> = {};
        for (const f of fields) {
            const i = headers.findIndex((h) => ALIASES[f].includes(h));
            if (i >= 0) idx[f] = i;
        }
        const usedCols = new Set<number>();
        // A column can only serve one field (e.g. "amount" must not be both name and value).
        for (const f of fields) {
            if (idx[f] !== undefined) {
                if (usedCols.has(idx[f])) delete idx[f];
                else usedCols.add(idx[f]);
            }
        }
        if (Object.keys(idx).length >= 2) return { headerRow: r, idx };
    }
    return null;
}

function readRows(content: Buffer, fileType: string): unknown[][] {
    let workbook: XLSX.WorkBook;
    if (fileType === "csv") {
        let t = content.toString("utf8");
        if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
        workbook = XLSX.read(t, { type: "string", raw: true });
    } else {
        workbook = XLSX.read(content, { type: "buffer" });
    }
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
}

export function parseGiniImport(content: Buffer, fileType: string, kind: ImportKind, stats?: { skipped: number }): (ParsedAsset | ParsedLiability)[] {
    return parseGiniRows(readRows(content, fileType), kind, stats);
}

/** Holdings from spreadsheet-style rows; throws when no Name and Value/Amount header is found. */
export function parseGiniRows(rows: unknown[][], kind: ImportKind, stats?: { skipped: number }): (ParsedAsset | ParsedLiability)[] {
    const valueField = kind === "assets" ? "value" : "amount";
    const fields = kind === "assets" ? ["name", "category", valueField, "rate"] : ["name", "type", valueField, "rate", "emi", "tenure"];
    const found = locate(rows, fields);
    if (!found || found.idx.name === undefined || found.idx[valueField] === undefined) {
        throw new Error(`Couldn't find a "Name" column and a "${kind === "assets" ? "Value" : "Amount"}" column in the first rows of the file`);
    }
    const { headerRow, idx } = found;
    const out: (ParsedAsset | ParsedLiability)[] = [];

    for (const row of rows.slice(headerRow + 1)) {
        const name = text(row[idx.name]);
        const amt = num(row[idx[valueField]]);
        // A statement's "Total" line is a sum of the rows above, not a holding of its own.
        if (name && TOTAL_ROW.test(name)) continue;
        // Count rows that have something in them but can't be used, so the preview can say so.
        const skip = () => {
            if (stats && row.some((cell) => String(cell ?? "").trim() !== "")) stats.skipped += 1;
        };
        if (!name || amt === null) {
            skip();
            continue;
        }
        const rate = idx.rate !== undefined ? num(row[idx.rate]) : null;
        const safeRate = rate !== null && rate >= 0 && rate <= (kind === "assets" ? 100 : 50) ? rate : null;

        if (kind === "assets") {
            if (amt < 0) {
                skip();
                continue;
            }
            const rawCat = idx.category !== undefined ? text(row[idx.category]) : null;
            out.push({ name, category: mapCategory(rawCat, name), value: amt, return_rate: safeRate });
        } else {
            if (amt <= 0) {
                skip();
                continue;
            }
            const rawType = idx.type !== undefined ? text(row[idx.type]) : null;
            const emi = idx.emi !== undefined ? num(row[idx.emi]) : null;
            const tenure = idx.tenure !== undefined ? num(row[idx.tenure]) : null;
            out.push({
                name,
                type: mapLiabilityType(rawType, name),
                amount: amt,
                rate: safeRate,
                emi: emi !== null && emi >= 0 ? emi : null,
                tenure: tenure !== null && tenure > 0 ? tenure : null,
            });
        }
    }
    return out;
}

// ── PDF statements ────────────────────────────────────────────────────────
// A PDF has no columns to read, only text lines. Like Journal's PDF import, each
// line is read on its own: a holding line is a name followed by its amounts,
// e.g. "HDFC Flexi Cap Fund  ₹2,50,000  12%". The name is the text before the
// trailing numbers, the value is the largest of them, and a "%" number is the
// rate. Header, total and page lines are skipped.

const NUMERIC_TOKEN = /^[-+(]?(₹|rs\.?|inr)?[\d,]+(\.\d+)?%?\)?$/i;
const TOTAL_ROW = /^(total|sub ?total|grand total|net total)\b/i;
const SKIP_LINE = /^(total|sub ?total|grand total|page \d|statement|portfolio summary|as on|date|name\b|scheme name|particulars)/i;

/** Turns one statement line into a holding, or null when it doesn't look like one. Exported for tests. */
export function pdfLineToHolding(line: string, kind: ImportKind): ParsedAsset | ParsedLiability | null {
    const clean = line.replace(/\s+/g, " ").trim();
    if (!clean || SKIP_LINE.test(clean)) return null;
    const tokens = clean.split(" ");
    const amounts: number[] = [];
    let rate: number | null = null;
    while (tokens.length && NUMERIC_TOKEN.test(tokens[tokens.length - 1])) {
        const token = tokens.pop() as string;
        const n = num(token);
        if (n === null) continue;
        if (token.endsWith("%")) rate = rate ?? n;
        else amounts.push(Math.abs(n));
    }
    const name = tokens.join(" ").replace(/[:\-–|]+$/, "").trim();
    if (!/[a-z]{2,}/i.test(name) || amounts.length === 0) return null;
    const amount = Math.max(...amounts);
    if (!(amount > 0)) return null;

    if (kind === "assets") {
        const safeRate = rate !== null && rate >= 0 && rate <= 100 ? rate : null;
        return { name: name.slice(0, 200), category: mapCategory(null, name), value: amount, return_rate: safeRate };
    }
    // For a loan, a second, smaller amount is read as the EMI.
    const rest = amounts.filter((a) => a !== amount).sort((a, b) => b - a);
    const safeRate = rate !== null && rate >= 0 && rate <= 50 ? rate : null;
    return { name: name.slice(0, 200), type: mapLiabilityType(null, name), amount, rate: safeRate, emi: rest[0] ?? null, tenure: null };
}

export function pdfLinesToHoldings(lines: string[], kind: ImportKind, stats?: { skipped: number }): (ParsedAsset | ParsedLiability)[] {
    const out: (ParsedAsset | ParsedLiability)[] = [];
    for (const line of lines) {
        const holding = pdfLineToHolding(line, kind);
        if (holding) out.push(holding);
        // Only count lines that had an amount but no usable name; prose lines are not "skipped rows".
        else if (stats && /\d{3,}/.test(line) && !SKIP_LINE.test(line.trim())) stats.skipped += 1;
    }
    return out;
}

export async function parseGiniPdfImport(content: Buffer, kind: ImportKind, stats?: { skipped: number }) {
    const lines = await pdfTextLines(content);
    // A statement with a header row (Name, Value, ...) is read column by column like a
    // spreadsheet; otherwise each line is read on its own.
    try {
        const local = { skipped: 0 };
        // Footer lines ("Page 1 of 2") have a single cell; they are not table rows.
        const rows = parseGiniRows(lines.map(pdfLineCells).filter((cells) => cells.length >= 2), kind, local);
        if (rows.length) {
            if (stats) stats.skipped += local.skipped;
            return rows;
        }
    } catch {
        // no header row: fall through
    }
    return pdfLinesToHoldings(lines, kind, stats);
}
