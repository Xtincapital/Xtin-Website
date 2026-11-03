// Shared shapes for the broker (XTS) sync. The adapter turns the broker's own
// rows into `BrokerFill`s; everything after that works on these types only.

export type Side = "buy" | "sell";

/** One execution reported by the broker (a TradeBook row), already normalised. */
export interface BrokerFill {
    /** The broker's id for the execution; unique per client. */
    executionId: string;
    clientCode: string;
    /** The broker's TradingSymbol, e.g. "RELIANCE" or "NIFTY2611324500CE". */
    symbol: string;
    /** Exchange segment as the broker names it (NSECM, NSEFO, ...), when known. */
    segment: string | null;
    instrumentId: number | null;
    /** MIS | NRML | CNC (case-insensitive). */
    product: string | null;
    side: Side;
    /** Units, not lots. */
    quantity: number;
    price: number;
    /** Brokerage and taxes for this execution, when the broker reports them. */
    charges: number | null;
    /** ISO-8601 with an offset (e.g. "2026-11-03T09:16:04+05:30"). */
    tradedAt: string;
    /** The broker's row as received, kept for audit. */
    raw?: unknown;
}

/** A completed trade: a position taken from flat and brought back to flat. */
export interface RoundTrip {
    /** Stable across re-runs; see `pairFills`. */
    externalId: string;
    clientCode: string;
    symbol: string;
    segment: string | null;
    product: string | null;
    /** The side that opened the trade. */
    side: Side;
    quantity: number;
    entryPrice: number;
    exitPrice: number;
    openedAt: string;
    closedAt: string;
    charges: number;
    grossPnl: number;
    /** Gross P&L less charges. */
    netPnl: number;
    fillCount: number;
}

/** A position that is still open after the last fill. */
export interface OpenPosition {
    clientCode: string;
    symbol: string;
    segment: string | null;
    product: string | null;
    side: Side;
    quantity: number;
    avgPrice: number;
    openedAt: string;
}

/** A sale of something we never saw bought, in a product that can't be short. */
export interface UnmatchedExit {
    executionId: string;
    clientCode: string;
    symbol: string;
    quantity: number;
    price: number;
    tradedAt: string;
}

export interface PairResult {
    trades: RoundTrip[];
    open: OpenPosition[];
    unmatched: UnmatchedExit[];
    /** Fills dropped because the same execution id appeared twice. */
    duplicates: number;
    /** Fills dropped because quantity or price was not a usable number. */
    invalid: number;
}

/** What the sync needs from a broker. Implemented by xts/ (the real one) and mockAdapter.ts (sample data). */
export interface BrokerAdapter {
    readonly name: string;
    /** The day's executions for one client (the TradeBook), normalised. */
    getTodaysFills(clientCode: string): Promise<BrokerFill[]>;
    /**
     * The name the broker has on file for a client code, to help an admin check a link
     * request. Only the name: nothing else from the profile (PAN, bank details) leaves the adapter.
     */
    getClientProfile?(clientCode: string): Promise<{ name: string | null }>;
    /** A read-only test of the broker connection for the admin page; see xts/diagnose.ts. */
    diagnose?(clientCode?: string): Promise<DiagnosisReport>;
}

export interface DiagnosisStep {
    name: string;
    ok: boolean;
    detail: string;
}

export interface DiagnosisReport {
    steps: DiagnosisStep[];
}
