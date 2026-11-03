// Reads a broker TRADEBOOK file: one row per execution (a buy or a sell at a
// price), the layout most brokers export. The existing importer expects one row
// per finished trade with both an entry and an exit price, so a tradebook was
// skipped row by row. Here the executions are paired into trades by the same
// engine the broker sync uses (broker/roundTrips.ts) and returned in the shape
// the import preview already shows.
//
// A file knows less than a live feed, so this is careful about what it guesses:
//   - without a product column, a cash-equity sale with nothing bought before it in
//     the file is taken to be shares bought earlier, and is reported rather than
//     turned into a short trade;
//   - times the file doesn't have are left empty, not invented;
//   - the file's own trade ids are used only when they are all there and all different.
//
// The helpers from importParsers.ts are passed in rather than imported, since that
// file calls this one.
import { createHash } from "node:crypto";
import { pairFills } from "./broker/roundTrips.js";
import { resolveInstrument } from "./broker/instruments.js";
import { toJournalTrade } from "./broker/tradeMapper.js";
import type { BrokerFill } from "./broker/types.js";
import type { ParsedImportTrade } from "./importParsers.js";

export interface ImportHelpers {
    normalizeImportHeader(header: unknown): string;
    importHeaderAliases(keys: string[]): string[];
    parseImportNumber(value: unknown): number | null;
    parseImportDate(value: unknown): string;
}

/** What was made of a tradebook, so the preview can say what was left out. */
export interface FillsSummary {
    /** Executions read from the file. */
    fills: number;
    /** Finished trades made from them. */
    trades: number;
    /** Positions still open at the end of the file (bought but not yet sold, or the reverse); not included. */
    open: number;
    /** Sales with no purchase in the file, such as shares bought before it began; not included. */
    unmatched: number;
}

const SYMBOL = ["symbol", "trading symbol", "tradingsymbol", "scrip", "scrip name", "script", "security", "security name", "instrument", "contract", "stock", "asset", "asset name"];
const SIDE = ["trade type", "buy sell", "buy/sell", "b/s", "bs", "side", "action", "transaction type", "order side", "buy or sell", "trade side"];
const QTY = ["quantity", "qty", "qty.", "traded qty", "trade qty", "trade quantity", "traded quantity", "filled qty", "executed quantity"];
const PRICE = ["price", "trade price", "traded price", "rate", "trade rate", "executed price", "execution price", "avg price", "average price", "market rate"];
const TRADE_ID = ["trade id", "trade no", "trade no.", "trade number", "execution id", "exec id", "tradeid"];
const DATE = ["trade date", "date", "execution date", "transaction date", "order date", "datetime", "date/time", "order execution time", "trade execution time", "execution time"];
const TIME = ["trade time", "time", "order execution time", "trade execution time", "execution time", "exchange time", "order time", "date/time", "datetime"];
const EXCHANGE = ["exchange", "exch"];
const SEGMENT = ["segment", "market segment"];
const PRODUCT = ["product", "product type"];
const CHARGES = ["brokerage", "fee", "fees", "charges", "total charges"];
// Back-office reports usually say whose trades they are.
const CLIENT_COLUMN = ["client code", "client id", "ucc", "client", "account", "account id", "trading code"];

// A file with any of these is a list of finished trades, which the existing importer handles.
const FINISHED_TRADE_COLUMNS = [
    "exit price", "exit", "sell price", "exitprice", "exit avg price", "average sell price", "avg sell price", "sell avg", "sell average",
    "entry price", "entry", "buy price", "entryprice", "entry avg price", "average buy price", "avg buy price", "buy avg", "buy average",
    "p&l", "pnl", "p/l", "profit loss", "profit/loss", "net pnl", "net p&l", "realized pnl", "realised pnl",
];

const CLIENT = "IMPORT";

/** The exchange segment name the instrument reader uses, from the file's exchange and segment columns. */
function segmentName(exchange: string, segment: string): string | null {
    const ex = exchange.toUpperCase().replace(/[^A-Z]/g, "");
    const seg = segment.toUpperCase().replace(/[^A-Z]/g, "");
    if (ex === "MCX" || seg === "COM" || seg === "COMMODITY" || seg === "MCX") return "MCXFO";
    if (ex === "NFO" || (ex === "NSE" && ["FO", "FNO", "DERIVATIVES"].includes(seg))) return "NSEFO";
    if (ex === "BFO" || (ex === "BSE" && ["FO", "FNO", "DERIVATIVES"].includes(seg))) return "BSEFO";
    if (ex === "BCD" || (ex === "BSE" && ["CD", "CDS"].includes(seg))) return "BSECD";
    if (ex === "CDS" || ["CD", "CDS", "CURRENCY"].includes(seg)) return "NSECD";
    const cash = ["", "EQ", "CM", "EQUITY", "CASH", "EQUITIES"].includes(seg);
    if (ex === "BSE" && cash) return "BSECM";
    if ((ex === "NSE" || ex === "") && cash && (ex !== "" || seg !== "")) return "NSECM";
    return null;
}

/** MIS, NRML or CNC from the many ways a file writes the product, or null when it doesn't say. */
function productName(raw: string): string | null {
    const t = raw.trim().toLowerCase();
    if (!t) return null;
    if (/mis|intraday|^i$|margin intraday/.test(t)) return "MIS";
    if (/cnc|delivery|^d$|cash and carry/.test(t)) return "CNC";
    if (/nrml|normal|carry|^m$|margin/.test(t)) return "NRML";
    return t.toUpperCase();
}

/** Hours, minutes and seconds in a time cell, a datetime cell, or an Excel date object. */
function timeOf(value: unknown): string | null {
    if (value instanceof Date) {
        const [h, m, s] = [value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()];
        // A date-only cell is midnight; a trade at exactly midnight is not a thing.
        return h + m + s === 0 ? null : [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
    }
    const match = /(?:^|[T\s])(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(value ?? "").trim());
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
    return `${match[1].padStart(2, "0")}:${match[2]}:${(match[3] ?? "00").padStart(2, "0")}`;
}

/** What a tradebook file holds, before the executions are paired into trades. */
export interface TradebookFills {
    fills: BrokerFill[];
    /** Rows that couldn't be read. */
    skipped: number;
    /** Every row had a time, so the fills carry real times rather than a placeholder. */
    timed: boolean;
    /** Client codes the file names, upper case (empty if it has no client column). */
    clientCodes: string[];
    /** Which client each fill belongs to, in the same order as `fills` ("" where the file doesn't say). */
    clientByFill: string[];
}

export interface ReadOptions {
    /** The client code given to the fills. */
    clientCode?: string;
    /**
     * How executions are told apart. "row" numbers them in file order (fine for a one-off import).
     * "content" makes each id from the execution's own details, so reading the same file again, or a
     * file that overlaps an earlier one, gives the same ids and nothing is added twice.
     */
    ids?: "row" | "content";
}

/**
 * The executions in a tradebook, or null if `rows` isn't a tradebook (so the caller reads it as a
 * list of finished trades). `rows[0]` is the header row.
 */
export function readTradebookFills(rows: unknown[][], h: ImportHelpers, options: ReadOptions = {}): TradebookFills | null {
    const headers = (rows[0] || []).map((cell) => h.normalizeImportHeader(cell));
    const present = new Set(headers.filter(Boolean));
    const find = (keys: string[]) => h.importHeaderAliases(keys).find((a) => present.has(a)) ?? null;

    if (find(FINISHED_TRADE_COLUMNS)) return null;
    const cols = { symbol: find(SYMBOL), side: find(SIDE), qty: find(QTY), price: find(PRICE), date: find(DATE) };
    if (!cols.symbol || !cols.side || !cols.qty || !cols.price || !cols.date) return null;
    const optional = { time: find(TIME), id: find(TRADE_ID), exchange: find(EXCHANGE), segment: find(SEGMENT), product: find(PRODUCT), charges: find(CHARGES), client: find(CLIENT_COLUMN) };

    interface Row { symbol: string; side: "buy" | "sell"; quantity: number; price: number; date: string; time: string | null; id: string; exchange: string; segment: string; product: string; charges: number | null; client: string }
    const parsed: Row[] = [];
    let skipped = 0;
    for (const row of rows.slice(1)) {
        if (!row || row.every((cell) => String(cell ?? "").trim() === "")) continue;
        const cell = (col: string | null): unknown => (col ? row[headers.indexOf(col)] ?? "" : "");
        const text = (col: string | null) => String(cell(col) ?? "").trim();

        const sideText = text(cols.side).toLowerCase();
        const side = /^(b|buy|bought|purchase)/.test(sideText) ? "buy" : /^(s|sell|sold|sale)/.test(sideText) ? "sell" : null;
        const quantity = h.parseImportNumber(cell(cols.qty));
        const price = h.parseImportNumber(cell(cols.price));
        const date = h.parseImportDate(cell(cols.date));
        const symbol = text(cols.symbol);
        if (!side || !symbol || quantity === null || quantity === 0 || price === null || price < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            skipped += 1;
            continue;
        }
        // The time may be its own column or part of the date column.
        const time = timeOf(cell(optional.time)) ?? timeOf(cell(cols.date));
        parsed.push({
            symbol,
            side,
            // Some exports show sales as negative quantities.
            quantity: Math.abs(quantity),
            price,
            date,
            time,
            id: text(optional.id),
            exchange: text(optional.exchange),
            segment: text(optional.segment),
            product: text(optional.product),
            charges: optional.charges ? h.parseImportNumber(cell(optional.charges)) : null,
            client: text(optional.client).toUpperCase(),
        });
    }

    // Times: used only if every row has one, so a half-timed file can't order itself wrongly or show made-up times.
    const timed = parsed.length > 0 && parsed.every((r) => r.time);
    // Ids: the file's own, if every row has one and they are all different (an order id repeated across
    // several fills would otherwise look like repeated executions). Otherwise numbered in file order,
    // reversed if the file runs newest first.
    const ids = parsed.map((r) => r.id);
    const ownIds = parsed.length > 0 && ids.every(Boolean) && new Set(ids).size === ids.length;
    const newestFirst = parsed.length > 1 && parsed[0].date > parsed[parsed.length - 1].date;

    const byContent = options.ids === "content";
    const seen = new Map<string, number>();
    const idOf = (r: Row, order: number) => {
        if (!byContent) return ownIds ? r.id : `r${String(order).padStart(7, "0")}`;
        if (ownIds) return `bf:${r.id}`;
        // Two identical executions in one file are still two: count them.
        const key = [r.client, r.date, timed ? r.time : "", r.symbol, r.side, r.quantity, r.price].join("|");
        const n = (seen.get(key) ?? 0) + 1;
        seen.set(key, n);
        return `bf:${createHash("sha1").update(`${key}|${n}`).digest("hex").slice(0, 16)}`;
    };

    const fills: BrokerFill[] = parsed.map((r, i) => {
        let seg = segmentName(r.exchange, r.segment);
        // "NSE" with a symbol like NIFTY26NOV24500CE is a derivative whatever the exchange column says.
        if (seg && /CM$/.test(seg) && resolveInstrument(r.symbol, null).contract !== null) seg = null;
        const derivative = resolveInstrument(r.symbol, seg).contract !== null || (seg !== null && !/CM$/.test(seg));
        // A file that doesn't say whether a cash trade was intraday or delivery: a sale with nothing before it is
        // far more often old holdings than a short, so treat it as delivery (which can't be short).
        const product = productName(r.product) ?? (derivative ? null : "CNC");
        const order = newestFirst ? parsed.length - 1 - i : i;
        return {
            executionId: idOf(r, order),
            clientCode: options.clientCode ?? CLIENT,
            symbol: r.symbol,
            segment: seg,
            instrumentId: null,
            product,
            side: r.side,
            quantity: r.quantity,
            price: r.price,
            charges: r.charges,
            tradedAt: `${r.date}T${timed ? r.time : "00:00:00"}+05:30`,
        };
    });

    return { fills, skipped, timed, clientCodes: [...new Set(parsed.map((r) => r.client).filter(Boolean))], clientByFill: parsed.map((r) => r.client) };
}

/**
 * The trades in a tradebook, or null if `rows` isn't a tradebook (so the caller reads it as a
 * list of finished trades). Rows that can't be read count towards `stats.skipped`; `stats.fills`
 * says what was made of the rest.
 */
export function fillRowsToTrades(rows: unknown[][], stats: { skipped: number; fills?: FillsSummary } | undefined, h: ImportHelpers): ParsedImportTrade[] | null {
    const read = readTradebookFills(rows, h);
    if (!read) return null;
    const { fills, timed } = read;
    if (stats) stats.skipped += read.skipped;

    const paired = pairFills(fills);
    if (stats) stats.fills = { fills: fills.length, trades: paired.trades.length, open: paired.open.length, unmatched: paired.unmatched.length };

    return paired.trades.map((trip) => {
        const t = toJournalTrade(trip, "") as Record<string, any>;
        return {
            date: t.date,
            exit_date: t.exit_date,
            // A file with no times shows none, rather than a midnight that never happened.
            entry_time: timed ? t.entry_time : null,
            exit_time: timed ? t.exit_time : null,
            type: t.type,
            market: t.market,
            asset: t.asset,
            currency: "INR",
            quantity: t.quantity,
            entry_price: t.entry_price,
            target_price: null,
            stop_loss: null,
            exit_price: t.exit_price,
            brokerage: t.brokerage,
            strategy: null,
            margin: null,
            buy_sell: t.buy_sell,
            pnl: t.pnl,
            emotion: null,
            notes: "Imported from tradebook",
            tags: ["imported"],
            strike_price: t.strike_price,
            option_type: t.option_type,
            underlying_price: null,
            implied_volatility: null,
            days_to_expiry: t.days_to_expiry,
            contract: t.contract,
        };
    });
}
