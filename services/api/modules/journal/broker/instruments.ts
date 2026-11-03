// Works out what a broker symbol is (underlying, market, strike, call/put,
// expiry) so a synced trade fills the same Journal fields a hand-entered one does.
//
// This reads the symbol text, which is a stopgap: once we have the MarketData
// instrument master it should replace `resolveInstrument` (same return shape).
// The formats below are the exchange conventions (NIFTY26NOV24500CE monthly,
// NIFTY2611324500CE weekly, NIFTY26NOVFUT, RELIANCE-EQ) and have not yet been
// checked against what XTS actually sends. Anything that doesn't match falls
// back to the raw symbol with the unknown fields left empty, never a guess.

export interface InstrumentInfo {
    /** Underlying or ticker, e.g. "NIFTY", "RELIANCE". */
    asset: string;
    /** One of the Journal's markets (Equity, Futures, Options, Commodities, Forex), or null if unknown. */
    market: string | null;
    /** The full contract symbol, for options and futures. */
    contract: string | null;
    strikePrice: number | null;
    optionType: "call" | "put" | null;
    /** YYYY-MM-DD. Only weekly contracts carry the day in their symbol. */
    expiry: string | null;
}

// XTS exchange segments by name, and the numeric ids it also uses. The numbers
// are from XTS convention and need confirming against the enum table the broker
// is sending us.
const SEGMENT_BY_ID: Record<string, string> = { "1": "NSECM", "2": "NSEFO", "3": "NSECD", "11": "BSECM", "12": "BSEFO", "51": "MCXFO" };

export function normaliseSegment(segment: string | number | null | undefined): string | null {
    if (segment === null || segment === undefined || segment === "") return null;
    const text = String(segment).trim().toUpperCase();
    return SEGMENT_BY_ID[text] ?? text;
}

const MONTHS: Record<string, number> = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
// Weekly contracts write the month as one character: 1-9, then O, N, D.
const WEEKLY_MONTH: Record<string, number> = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, O: 10, N: 11, D: 12 };

const UNDERLYING = "([A-Z0-9&-]+?)";
const STRIKE = "(\\d+(?:\\.\\d+)?)";
const MONTHLY_OPTION = new RegExp(`^${UNDERLYING}(\\d{2})(${Object.keys(MONTHS).join("|")})${STRIKE}(CE|PE)$`);
const WEEKLY_OPTION = new RegExp(`^${UNDERLYING}(\\d{2})([1-9OND])(\\d{2})${STRIKE}(CE|PE)$`);
const FUTURE = new RegExp(`^${UNDERLYING}(\\d{2})(${Object.keys(MONTHS).join("|")})FUT$`);

const pad = (n: number) => String(n).padStart(2, "0");

function marketForSegment(segment: string | null): string | null | undefined {
    if (!segment) return undefined;
    if (segment === "NSECM" || segment === "BSECM") return "Equity";
    if (segment.startsWith("MCX")) return "Commodities";
    if (segment.endsWith("CD")) return "Forex";
    return undefined; // F&O segments: the symbol says whether it's an option or a future
}

export function resolveInstrument(symbol: string, segment: string | number | null | undefined): InstrumentInfo {
    const text = symbol.trim().toUpperCase();
    const seg = normaliseSegment(segment);
    const segmentMarket = marketForSegment(seg);
    const none = { contract: null, strikePrice: null, optionType: null, expiry: null } as const;

    // A cash-segment symbol is a plain ticker, possibly with a series suffix.
    if (seg === "NSECM" || seg === "BSECM") {
        return { asset: text.replace(/-(EQ|BE|BZ|SM|ST|IL)$/, ""), market: "Equity", ...none };
    }

    const monthly = MONTHLY_OPTION.exec(text);
    if (monthly) {
        return { asset: monthly[1], market: segmentMarket ?? "Options", contract: text, strikePrice: Number(monthly[4]), optionType: monthly[5] === "CE" ? "call" : "put", expiry: null };
    }

    const weekly = WEEKLY_OPTION.exec(text);
    if (weekly) {
        const [, asset, yy, monthCode, dd, strike, kind] = weekly;
        return {
            asset,
            market: segmentMarket ?? "Options",
            contract: text,
            strikePrice: Number(strike),
            optionType: kind === "CE" ? "call" : "put",
            expiry: `20${yy}-${pad(WEEKLY_MONTH[monthCode])}-${dd}`,
        };
    }

    const future = FUTURE.exec(text);
    if (future) return { asset: future[1], market: segmentMarket ?? "Futures", ...none, contract: text };

    return { asset: text, market: segmentMarket ?? null, ...none };
}

/** Whole days from `fromDate` to `expiry` (both YYYY-MM-DD); null if either is missing or the expiry has passed. */
export function daysToExpiry(expiry: string | null, fromDate: string): number | null {
    if (!expiry) return null;
    const days = Math.round((Date.parse(`${expiry}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / 86_400_000);
    return Number.isFinite(days) && days >= 0 ? days : null;
}
