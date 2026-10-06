// Gini document import — parses an uploaded CSV / Excel sheet of assets or
// liabilities into rows shaped exactly like the `POST /gini/assets` and
// `POST /gini/liabilities` bodies (see assets.validator.ts /
// liabilities.validator.ts), so the frontend can preview them and then save
// each row straight through. Stateless: nothing is written here.
import * as XLSX from "xlsx";

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
    name: ["name", "asset", "asset name", "liability", "liability name", "description", "particulars", "holding", "scheme", "instrument", "loan", "loan name"],
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
    const rows = readRows(content, fileType);
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
