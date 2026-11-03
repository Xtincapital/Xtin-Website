// Turns XTS TradeBook rows into the BrokerFill shape the pairing works on.
//
// Written from the Interactive docs (field names and the timestamp style
// "02-09-2026 12.58.04.072"), not yet checked against a live server. It is strict
// on purpose: a row that claims to be a fill but can't be read makes the sync fail
// where someone will see it, because dropping it quietly would leave a trade
// missing from the customer's journal with nothing to show why.
import type { BrokerFill } from "../types.js";

export class XtsParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "XtsParseError";
    }
}

const IST = "+05:30";
const pad = (n: number | string, width = 2) => String(n).padStart(width, "0");

const realDate = (y: number, m: number, d: number) => {
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

/**
 * An XTS timestamp as ISO-8601. Times without an offset are Indian time.
 *
 * "02-09-2026 12.58.04.072" could be 2 September or 9 February, and the docs
 * don't say. When it is ambiguous, `expectedDates` (the trading days the data can
 * belong to, YYYY-MM-DD) picks the reading; if neither fits it returns null rather
 * than guess. With no `expectedDates` it reads day first.
 */
export function parseXtsTimestamp(value: unknown, expectedDates?: string[]): string | null {
    if (typeof value !== "string") return null;
    const text = value.trim();

    const iso = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3})\d*)?(Z|[+-]\d{2}:?\d{2})?$/.exec(text);
    const dmy = /^(\d{2})-(\d{2})-(\d{4}) (\d{2})[.:](\d{2})[.:](\d{2})(?:[.:](\d{1,3}))?$/.exec(text);

    let y: number, m: number, d: number, hh: number, mm: number, ss: number, ms: string, offset: string;
    if (iso) {
        [y, m, d, hh, mm, ss] = [1, 2, 3, 4, 5, 6].map((i) => Number(iso[i]));
        ms = (iso[7] ?? "0").padEnd(3, "0");
        const zone = iso[8];
        offset = !zone ? IST : zone === "Z" ? "+00:00" : zone.includes(":") ? zone : `${zone.slice(0, 3)}:${zone.slice(3)}`;
        if (!realDate(y, m, d)) return null;
    } else if (dmy) {
        const [a, b] = [Number(dmy[1]), Number(dmy[2])];
        y = Number(dmy[3]);
        [hh, mm, ss] = [4, 5, 6].map((i) => Number(dmy[i]));
        ms = (dmy[7] ?? "0").padEnd(3, "0");
        offset = IST;
        const readings = [
            { d: a, m: b },
            { d: b, m: a },
        ].filter((r) => realDate(y, r.m, r.d));
        if (!readings.length) return null;
        let chosen = readings[0];
        if (a !== b && readings.length > 1 && expectedDates) {
            const hit = readings.find((r) => expectedDates.includes(`${y}-${pad(r.m)}-${pad(r.d)}`));
            if (!hit) return null;
            chosen = hit;
        }
        ({ d, m } = chosen);
    } else {
        return null;
    }

    if (hh > 23 || mm > 59 || ss > 59) return null;
    return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:${pad(ss)}.${ms}${offset}`;
};

const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
const text = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim());

export interface MapContext {
    /** The client code that was asked for. */
    requestedClient: string;
    /** A login that can see only one account, so a row without a ClientID can only be that account's. */
    singleClient: boolean;
    /** The trading days a row's date can belong to; settles day-first versus month-first. */
    expectedDates: string[];
}

/** The fill in a TradeBook row, or null if the row is not an execution (a new, cancelled or rejected order). */
export function tradeRowToFill(row: Record<string, any>, ctx: MapContext, index: number): BrokerFill | null {
    const fail = (problem: string): never => {
        throw new XtsParseError(`TradeBook row ${index + 1}: ${problem}`);
    };

    const quantity = num(row.LastTradedQuantity);
    if (!(quantity > 0)) {
        // An order that is filled (even partly) must say how much traded.
        if (/fill/i.test(text(row.OrderStatus))) fail("a filled order has no traded quantity");
        return null;
    }

    const executionId = text(row.ExecutionID);
    if (!executionId) fail("no ExecutionID");
    const symbol = text(row.TradingSymbol);
    if (!symbol) fail("no TradingSymbol");
    const price = num(row.LastTradedPrice);
    if (!(price >= 0) || !Number.isFinite(price)) fail("no usable LastTradedPrice");

    const side = /^buy$/i.test(text(row.OrderSide)) ? "buy" : /^sell$/i.test(text(row.OrderSide)) ? "sell" : fail("OrderSide is neither buy nor sell");

    const tradedAt = parseXtsTimestamp(row.LastExecutionTransactTime ?? row.ExchangeTransactTime ?? row.LastUpdateDateTime, ctx.expectedDates);
    if (!tradedAt) fail("the execution time is missing, unrecognised or ambiguous");

    // A row has to say whose it is. Taking an unlabelled row for the asking client is only safe
    // when the login can see that one client and no other.
    const rowClient = text(row.ClientID).toUpperCase();
    if (!rowClient && !ctx.singleClient) fail("no ClientID, so it can't be tied to a customer");

    const instrumentId = num(row.ExchangeInstrumentID);
    return {
        executionId,
        clientCode: rowClient || ctx.requestedClient,
        symbol,
        segment: text(row.ExchangeSegment) || null,
        instrumentId: Number.isFinite(instrumentId) ? instrumentId : null,
        product: text(row.ProductType) || null,
        side: side as "buy" | "sell",
        quantity,
        price,
        // TradeBook carries no brokerage or taxes.
        charges: null,
        tradedAt: tradedAt as string,
        raw: row,
    };
}
