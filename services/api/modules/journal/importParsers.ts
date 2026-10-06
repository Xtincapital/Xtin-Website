// Bulk trade-import parsing — Node/TS port of features-incoming/journal/main.py's
// "IMPORT HELPERS" section (main.py lines ~201-424):
//   normalize_import_header, import_header_aliases, parse_import_number,
//   parse_import_date, rows_to_import_trades, map_import_row_to_trade,
//   parse_csv_import, parse_excel_import, parse_pdf_import,
//   parse_pdf_lines_to_import_trades.
//
// Deliberate deviation from the original: the Python functions return
// camelCase dicts (exitDate, entryPrice, buySell, strikePrice, optionType, ...)
// matching the OLD client-side blob-store trade shape. That schema is gone —
// Phase 9a built a real `journal_trades` table (see
// database/migrations/0005_journal_normalized_schema.sql) with snake_case
// columns, and trades.validator.ts's `tradeCreateSchema` is the live contract
// for POST /journal/trades. This port returns that snake_case shape directly
// (exit_date, entry_price, buy_sell, strike_price, option_type, ...) so the
// frontend can preview-then-POST a parsed row straight through with zero
// further transformation. Two fields also get their *values* normalized to
// satisfy that schema's enums (the original left these as free text):
//   - buy_sell: lowercase "buy" | "sell" (was Title-case "Buy" | "Sell")
//   - option_type: normalized to "call" | "put" | null (was raw text like
//     "CE"/"PE"/"Call"/"Put" passed through verbatim)
// Every other field mapping, alias list, and parsing heuristic below is a
// faithful line-for-line port.
import * as XLSX from "xlsx";
import { pdfLineCells, pdfTextLines } from "../../utils/pdfText.js";

/** P&L of a closed trade, net of brokerage; null until quantity, entry and exit are all known.
 * Used for CSV import and for trades saved without a P&L, so both give the same number. */
export function computeTradePnl(t: {
    buy_sell?: string | null;
    quantity?: number | null;
    entry_price?: number | null;
    exit_price?: number | null;
    brokerage?: number | null;
}): number | null {
    if (t.quantity == null || t.entry_price == null || t.exit_price == null) return null;
    const gross = t.buy_sell === "sell" ? (t.entry_price - t.exit_price) * t.quantity : (t.exit_price - t.entry_price) * t.quantity;
    return Math.round((gross - (t.brokerage ?? 0)) * 100) / 100;
}

/** Filled in by the parsers: how many non-blank rows could not be turned into a trade. */
export interface ImportStats {
    skipped: number;
}

/** Trimmed text, or null when the cell is missing or blank. */
function textOrNull(value: unknown): string | null {
    const text = value === null || value === undefined ? "" : String(value).trim();
    // "-" is how exports (ours included) show an empty cell.
    return text && !/^[-–—]+$/.test(text) ? text : null;
}

/** Market as stored: our screens show "Crypto Currency" but the saved value is "Crypto_Currency". */
function marketOrNull(value: unknown): string | null {
    const text = textOrNull(value);
    return text && /^crypto[\s_-]*currency$/i.test(text) ? "Crypto_Currency" : text;
}

export interface ParsedImportTrade {
    date: string;
    exit_date: string;
    entry_time: string | null;
    exit_time: string | null;
    type: string | null;
    market: string | null;
    asset: string;
    currency: string;
    quantity: number;
    entry_price: number;
    target_price: number | null;
    stop_loss: number | null;
    exit_price: number;
    brokerage: number;
    strategy: string | null;
    margin: number | null;
    buy_sell: "buy" | "sell";
    pnl: number;
    emotion: string | null;
    notes: string;
    tags: string[];
    strike_price: number | null;
    option_type: "call" | "put" | null;
    underlying_price: number | null;
    implied_volatility: number | null;
    days_to_expiry: number | null;
}

/** Port of `normalize_import_header`: strips currency symbols/punctuation from a
 * column header, lowercases, collapses whitespace. */
export function normalizeImportHeader(header: unknown): string {
    let value = String(header ?? "")
        .replace(/\uFEFF/g, "")
        .toLowerCase();
    value = value.replace(/&/g, " and ");
    value = value.replace(/[%₹$€£¥]/g, " ");
    value = value.replace(/[^a-z0-9]+/g, " ").trim();
    return value.replace(/\s+/g, " ");
}

/** Port of `import_header_aliases`: for a list of candidate header names, returns
 * both the normalized form and a no-spaces variant (so "Entry Price" matches both
 * "entry price" and "entryprice" headers). */
export function importHeaderAliases(keys: string[]): string[] {
    const aliases: string[] = [];
    for (const key of keys) {
        const normalized = normalizeImportHeader(key);
        if (normalized) {
            aliases.push(normalized);
            aliases.push(normalized.replace(/ /g, ""));
        }
    }
    return aliases;
}

/** Port of `parse_import_number`: parses a number from messy spreadsheet/PDF text —
 * parenthesized negatives `(500)`, currency symbols, "cr"/"dr"/"credit"/"debit"/
 * "profit"/"loss" suffixes, thousands separators. */
export function parseImportNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return value;
    const text = String(value).trim();
    if (!text) return null;
    const isNegative = /^\(.*\)$/.test(text) || /\b(dr|debit|loss)\b/i.test(text);
    let cleaned = text.replace(/[,\s₹$€£¥()]/g, "");
    cleaned = cleaned.replace(/\b(cr|credit|dr|debit|profit|loss)\b/gi, "");
    const match = cleaned.match(/[-+]?\d*\.?\d+/);
    if (!match) return null;
    const num = parseFloat(match[0]);
    if (Number.isNaN(num)) return null;
    return isNegative && num > 0 ? -num : num;
}

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

function ymd(year: number, month: number, day: number): string | null {
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
    return `${year}-${pad2(month)}-${pad2(day)}`;
}

function formatDateUTC(d: Date): string {
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

const MONTH_NAMES: Record<string, number> = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
};

type DateFormatParser = (text: string) => string | null;

// Ordered to mirror the Python `formats` list in parse_import_date (tried in order,
// first match wins). The two month-name entries each cover both the Python source's
// abbreviated (%b) and full (%B) variants in one pattern — both produce the identical
// "%Y-%m-%d" output on a match, so collapsing them changes nothing observable.
const DATE_FORMAT_PARSERS: DateFormatParser[] = [
    // %Y-%m-%d
    (t) => { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t); return m ? ymd(+m[1], +m[2], +m[3]) : null; },
    // %d-%m-%Y
    (t) => { const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(t); return m ? ymd(+m[3], +m[2], +m[1]) : null; },
    // %d/%m/%Y
    (t) => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t); return m ? ymd(+m[3], +m[2], +m[1]) : null; },
    // %Y/%m/%d
    (t) => { const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(t); return m ? ymd(+m[1], +m[2], +m[3]) : null; },
    // %d.%m.%Y
    (t) => { const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(t); return m ? ymd(+m[3], +m[2], +m[1]) : null; },
    // %Y.%m.%d
    (t) => { const m = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(t); return m ? ymd(+m[1], +m[2], +m[3]) : null; },
    // %d-%b-%Y / %d-%B-%Y
    (t) => {
        const m = /^(\d{1,2})-([A-Za-z]+)-(\d{4})$/.exec(t);
        if (!m) return null;
        const mo = MONTH_NAMES[m[2].toLowerCase()];
        return mo ? ymd(+m[3], mo, +m[1]) : null;
    },
    // %d %b %Y / %d %B %Y
    (t) => {
        const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(t);
        if (!m) return null;
        const mo = MONTH_NAMES[m[2].toLowerCase()];
        return mo ? ymd(+m[3], mo, +m[1]) : null;
    },
    // %Y-%m-%d %H:%M:%S
    (t) => { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})\s+\d{1,2}:\d{2}:\d{2}$/.exec(t); return m ? ymd(+m[1], +m[2], +m[3]) : null; },
    // %d/%m/%Y %H:%M:%S
    (t) => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+\d{1,2}:\d{2}:\d{2}$/.exec(t); return m ? ymd(+m[3], +m[2], +m[1]) : null; },
    // %d-%m-%Y %H:%M:%S
    (t) => { const m = /^(\d{1,2})-(\d{1,2})-(\d{4})\s+\d{1,2}:\d{2}:\d{2}$/.exec(t); return m ? ymd(+m[3], +m[2], +m[1]) : null; },
];

// Fallback ISO-ish parse, mirroring Python's `datetime.fromisoformat(text.replace("Z", "+00:00"))`.
function tryParseIso(text: string): string | null {
    const normalized = text.replace(/Z$/, "+00:00");
    if (!/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?([+-]\d{2}:?\d{2})?)?$/.test(normalized)) return null;
    const d = new Date(normalized.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return null;
    return formatDateUTC(d);
}

/** Port of `parse_import_date`: tries a long list of date formats in order, falls
 * back to returning the raw string if nothing matches. */
export function parseImportDate(value: unknown): string {
    if (value instanceof Date) {
        return formatDateUTC(value);
    }
    const text = String(value ?? "").trim();
    if (!text) return "";
    for (const parser of DATE_FORMAT_PARSERS) {
        const result = parser(text);
        if (result) return result;
    }
    const iso = tryParseIso(text);
    if (iso) return iso;
    return text;
}

/** Normalizes free-text option-type values ("CE"/"PE"/"Call"/"Put"/"C"/"P"/...) to the
 * "call" | "put" enum `trades.validator.ts`'s `tradeCreateSchema` expects. The original
 * Python left this as raw passthrough text — see file header comment for why this port
 * normalizes it instead. */
function normalizeOptionType(raw: unknown): "call" | "put" | null {
    const text = String(raw ?? "").trim().toLowerCase();
    if (!text) return null;
    if (text.startsWith("c") || text.includes("call")) return "call";
    if (text.startsWith("p") || text.includes("put")) return "put";
    return null;
}

/** Port of `map_import_row_to_trade`: the core column-mapping logic. Fuzzy-matches a
 * huge list of possible header-name variants per field, back-calculates a missing exit
 * price from P&L when needed, computes P&L itself when not directly provided, and
 * returns null if required fields (date/asset/quantity/entry/exit price) are missing. */
export function mapImportRowToTrade(row: Record<string, unknown>): ParsedImportTrade | null {
    const findValue = (keys: string[]): unknown => {
        for (const key of importHeaderAliases(keys)) {
            const value = row[key];
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                return value;
            }
        }
        return "";
    };

    const dateValue = findValue(["date", "trade date", "entry date", "entry day", "datetime", "time", "date/time", "order execution time", "trade execution time"]);
    const exitDateValue = findValue(["exit day", "exit date", "close date", "closed date", "closing date", "exit datetime", "exit date/time"]);
    const asset = String(findValue(["asset", "asset/stock", "stock", "symbol", "ticker", "instrument", "asset name", "scrip", "scrip name", "security", "contract"]) || "").trim();
    const quantity = parseImportNumber(findValue(["quantity", "qty", "qty.", "volume", "size", "shares", "lots", "lot size", "filled qty", "executed quantity"]));
    const entryPrice = parseImportNumber(findValue(["entry price", "entry", "buy price", "price", "entryprice", "entry avg price", "average buy price", "avg buy price", "buy avg", "buy average"]));
    let exitPrice = parseImportNumber(findValue(["exit price", "exit", "sell price", "exitprice", "exit avg price", "average sell price", "avg sell price", "sell avg", "sell average"]));
    const buySellRaw = String(findValue(["buysell", "buy/sell", "side", "trade side", "action", "type", "direction", "b/s"]) || "").toLowerCase();
    const buySell: "buy" | "sell" = buySellRaw.startsWith("s") || buySellRaw.includes("short") ? "sell" : "buy";
    const brokerage = parseImportNumber(findValue(["brokerage", "fee", "fees", "charges", "total charges"])) ?? 0;
    const importedPnl = parseImportNumber(findValue(["p&l", "pnl", "p/l", "profit loss", "profit/loss", "net pnl", "net p&l", "realized pnl", "realised pnl"]));

    if (exitPrice === null && importedPnl !== null && quantity && entryPrice !== null) {
        exitPrice = buySell === "buy"
            ? entryPrice + (importedPnl + brokerage) / quantity
            : entryPrice - (importedPnl + brokerage) / quantity;
    }

    if (!dateValue || !asset || quantity === null || entryPrice === null || exitPrice === null) {
        return null;
    }

    const pnl = computeTradePnl({ buy_sell: buySell, quantity, entry_price: entryPrice, exit_price: exitPrice, brokerage })!;

    const tagsRaw = String(findValue(["tags", "labels"]) || "imported");
    const parsedTags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const tags = parsedTags.length ? parsedTags : ["imported"];
    const currency = String(findValue(["currency", "trade currency", "ccy"]) || "INR").trim().toUpperCase() || "INR";

    return {
        date: parseImportDate(dateValue),
        exit_date: exitDateValue ? parseImportDate(exitDateValue) : parseImportDate(dateValue),
        // A column the file doesn't have stays empty; inventing values (09:15 entries, "Breakout",
        // Intraday/Equity) made them show up in the hourly, strategy and market analytics.
        entry_time: textOrNull(findValue(["entry time", "entrytime"])),
        exit_time: textOrNull(findValue(["exit time", "exittime"])),
        type: textOrNull(findValue(["trading type", "trade type", "category", "product", "product type"])),
        market: marketOrNull(findValue(["trade market", "market", "segment"])),
        asset,
        currency,
        quantity,
        entry_price: entryPrice,
        target_price: parseImportNumber(findValue(["target price", "target"])),
        stop_loss: parseImportNumber(findValue(["stop loss", "sl"])),
        exit_price: exitPrice,
        brokerage,
        strategy: textOrNull(findValue(["trading strategy", "strategy", "setup"])),
        margin: parseImportNumber(findValue(["margin", "capital", "required capital", "turnover"])),
        buy_sell: buySell,
        pnl,
        emotion: textOrNull(findValue(["emotion", "emotion/psychology", "psychology"]))?.toLowerCase() ?? null,
        notes: String(findValue(["notes", "trade notes/journal", "journal", "comment", "description"]) || "Imported from file"),
        tags,
        strike_price: parseImportNumber(findValue(["strike price", "strike", "strikeprice", "strike_price"])),
        option_type: normalizeOptionType(findValue(["option type", "optiontype", "opt type", "call/put", "cp", "option_type"])),
        underlying_price: parseImportNumber(findValue(["underlying price", "underlying", "underlyingprice", "spot price", "spot", "underlying_price"])),
        implied_volatility: parseImportNumber(findValue(["implied volatility", "iv", "volatility", "impliedvolatility", "implied_volatility", "vol"])),
        days_to_expiry: parseImportNumber(findValue(["days to expiry", "days to expiration", "dte", "daystoexpiry", "days_to_expiry"])),
    };
}

/** Port of `rows_to_import_trades`: turns a 2D array of spreadsheet rows (first row =
 * headers) into trade dicts, skipping blank rows. */
export function rowsToImportTrades(rows: unknown[][], stats?: ImportStats): ParsedImportTrade[] {
    if (rows.length < 2) return [];
    const headers = (rows[0] || []).map((cell) => normalizeImportHeader(cell));
    const trades: ParsedImportTrade[] = [];
    for (const row of rows.slice(1)) {
        if (!row || row.every((cell) => String(cell ?? "").trim() === "")) continue;
        const rowData: Record<string, unknown> = {};
        headers.forEach((header, index) => {
            if (header) rowData[header] = index < row.length ? row[index] : "";
        });
        const trade = mapImportRowToTrade(rowData);
        if (trade) trades.push(trade);
        else if (stats) stats.skipped += 1;
    }
    return trades;
}

/** Port of `parse_csv_import`: decodes CSV bytes (utf-8-sig to handle a BOM), feeds
 * through rowsToImportTrades. Uses the already-installed `xlsx` package to parse the
 * CSV text (SheetJS treats a plain string `read()` input as CSV) rather than hand-rolling
 * a quoted-field CSV tokenizer. */
export function parseCsvImport(content: Buffer, stats?: ImportStats): ParsedImportTrade[] {
    let text = content.toString("utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const workbook = XLSX.read(text, { type: "string", raw: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
    return rowsToImportTrades(rows, stats);
}

/** Port of `parse_excel_import`. The Python original branches on `.xls` (xlrd) vs
 * `.xlsx` (openpyxl); the `xlsx` package handles both natively from a buffer, so one
 * code path covers both here. `cellDates: true` makes date cells come through as JS
 * `Date` objects, mirroring the Python source's `xlrd.xldate_as_tuple`/openpyxl
 * `datetime` cells (parseImportDate's `instanceof Date` branch handles them). */
export function parseExcelImport(content: Buffer, stats?: ImportStats): ParsedImportTrade[] {
    const workbook = XLSX.read(content, { type: "buffer", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
    return rowsToImportTrades(rows, stats);
}

const PDF_DATE_REGEX = /\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\b/;
const PDF_DATE_REGEX_G = /\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\b/g;
const PDF_ACTION_REGEX = /\b(buy|sell|long|short)\b/i;
const PDF_NUMBER_TOKEN_REGEX = /[-+()]?[\d,]+(?:\.\d+)?/g;
const PDF_NUMBER_ONLY_REGEX = /^[-+()]?[\d,.]+$/;
const PDF_NON_ASSET_WORDS = new Set(["intraday", "scalping", "swing", "equity", "futures", "options", "commodity", "forex", "crypto"]);

/** Port of `parse_pdf_lines_to_import_trades`: for each line that contains both a
 * date-like pattern and a buy/sell/long/short keyword, heuristically extracts 3+
 * numbers (quantity, entry price, exit price) and treats the remaining words as the
 * asset name. */
export function parsePdfLinesToImportTrades(lines: string[]): ParsedImportTrade[] {
    const trades: ParsedImportTrade[] = [];
    for (const line of lines) {
        const dateMatch = PDF_DATE_REGEX.exec(line);
        const actionMatch = PDF_ACTION_REGEX.exec(line);
        if (!dateMatch || !actionMatch) continue;

        const cleanLine = line.replace(PDF_DATE_REGEX_G, " ");
        const numberTokens = cleanLine.match(PDF_NUMBER_TOKEN_REGEX) || [];
        const numbers = numberTokens
            .map((token) => parseImportNumber(token))
            .filter((n): n is number => n !== null);
        if (numbers.length < 3) continue;

        const words = cleanLine.split(/\s+/).filter((word) => {
            if (word.length <= 1) return false;
            if (PDF_ACTION_REGEX.test(word)) return false;
            if (PDF_NUMBER_ONLY_REGEX.test(word)) return false;
            if (PDF_NON_ASSET_WORDS.has(word.toLowerCase())) return false;
            return true;
        });

        const [quantity, entryPrice, exitPrice] = numbers;
        const buySell: "buy" | "sell" = ["buy", "long"].includes(actionMatch[1].toLowerCase()) ? "buy" : "sell";
        const pnl = buySell === "buy" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;

        trades.push({
            date: parseImportDate(dateMatch[1]),
            exit_date: parseImportDate(dateMatch[1]),
            entry_time: null,
            exit_time: null,
            type: null,
            market: null,
            asset: words.join(" ") || "Unknown",
            currency: "INR",
            quantity,
            entry_price: entryPrice,
            target_price: null,
            stop_loss: null,
            exit_price: exitPrice,
            brokerage: 0,
            strategy: null,
            margin: null,
            buy_sell: buySell,
            pnl,
            emotion: null,
            notes: "Imported from PDF statement",
            tags: ["imported", "pdf"],
            strike_price: null,
            option_type: null,
            underlying_price: null,
            implied_volatility: null,
            days_to_expiry: null,
        });
    }
    return trades;
}

/** Port of `parse_pdf_import`: reads the PDF's text lines (utils/pdfText.ts keeps each
 * row on its own line and table cells apart), then parses them as a table when there
 * is a header row, or line by line otherwise. */
export async function parsePdfImport(content: Buffer, stats?: ImportStats): Promise<ParsedImportTrade[]> {
    const lines = await pdfTextLines(content);
    // A statement laid out as a table (including our own Export PDF) is read by its
    // column headers, exactly like a CSV. Otherwise fall back to reading each line.
    const table = pdfTableTrades(lines, stats);
    return table.length ? table : parsePdfLinesToImportTrades(lines);
}

/** Finds the first line that works as a header row and reads the lines below it as cells. */
export function pdfTableTrades(lines: string[], stats?: ImportStats): ParsedImportTrade[] {
    for (let i = 0; i < Math.min(lines.length, 40); i++) {
        const header = pdfLineCells(lines[i]);
        if (header.length < 4 || /\d/.test(lines[i])) continue;
        const local: ImportStats = { skipped: 0 };
        // Footer lines ("Page 1 of 2") have a single cell; they are not table rows.
        const body = lines.slice(i + 1).map(pdfLineCells).filter((cells) => cells.length >= 3);
        const trades = rowsToImportTrades([header, ...body], local);
        if (trades.length) {
            if (stats) stats.skipped += local.skipped;
            return trades;
        }
    }
    return [];
}
