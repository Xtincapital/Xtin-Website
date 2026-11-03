// Turns a client's executions into completed Journal trades.
//
// The broker reports individual fills; the Journal stores one row per
// completed trade. A trade here is a position taken from flat and brought back
// to flat: its entry price is the volume-weighted average of the fills that
// built it, its exit price the same for the fills that closed it, so scaling in
// and out never splits one idea into several rows. A fill larger than the open
// position closes it and opens the opposite one with the remainder.
//
// This is a pure function of the fills it is given. The sync re-runs it over
// every stored fill each time, so a late or backfilled day corrects itself and
// a trade's `externalId` (built from its first fill) stays the same between
// runs, which is what lets the sync insert each trade once.
import type { BrokerFill, OpenPosition, PairResult, RoundTrip, Side, UnmatchedExit } from "./types.js";

const EPS = 1e-9;

const round = (n: number, places: number) => {
    const f = 10 ** places;
    return Math.round(n * f) / f;
};

interface Cycle {
    side: Side;
    clientCode: string;
    symbol: string;
    segment: string | null;
    product: string | null;
    firstExecutionId: string;
    openedAt: string;
    closedAt: string;
    entryQty: number;
    entryAmount: number;
    exitQty: number;
    exitAmount: number;
    charges: number;
    fillCount: number;
}

const productOf = (f: BrokerFill) => (f.product ?? "").trim().toUpperCase();

/** Delivery holdings can't be sold short, so a sale with nothing behind it is not a new trade. */
const isDelivery = (f: BrokerFill) => productOf(f) === "CNC";

const keyOf = (f: BrokerFill) => [f.clientCode, f.segment ?? "", f.symbol, productOf(f)].join("|");

/** Time first; for the same instant, the broker's execution ids in numeric order ("9" before "10"). */
function compareFills(a: BrokerFill, b: BrokerFill): number {
    const byTime = Date.parse(a.tradedAt) - Date.parse(b.tradedAt);
    if (byTime !== 0) return byTime;
    const na = Number(a.executionId);
    const nb = Number(b.executionId);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
    return a.executionId < b.executionId ? -1 : a.executionId > b.executionId ? 1 : 0;
}

function startCycle(f: BrokerFill, qty: number, charges: number): Cycle {
    return {
        side: f.side,
        clientCode: f.clientCode,
        symbol: f.symbol,
        segment: f.segment,
        product: f.product,
        firstExecutionId: f.executionId,
        openedAt: f.tradedAt,
        closedAt: f.tradedAt,
        entryQty: qty,
        entryAmount: qty * f.price,
        exitQty: 0,
        exitAmount: 0,
        charges,
        fillCount: 1,
    };
}

function finish(c: Cycle): RoundTrip {
    const gross = c.side === "buy" ? c.exitAmount - c.entryAmount : c.entryAmount - c.exitAmount;
    return {
        externalId: [c.clientCode, c.segment ?? "", c.symbol, (c.product ?? "").toUpperCase(), c.firstExecutionId].join(":"),
        clientCode: c.clientCode,
        symbol: c.symbol,
        segment: c.segment,
        product: c.product,
        side: c.side,
        quantity: round(c.entryQty, 6),
        entryPrice: round(c.entryAmount / c.entryQty, 4),
        exitPrice: round(c.exitAmount / c.exitQty, 4),
        openedAt: c.openedAt,
        closedAt: c.closedAt,
        charges: round(c.charges, 2),
        grossPnl: round(gross, 2),
        netPnl: round(gross - c.charges, 2),
        fillCount: c.fillCount,
    };
}

export function pairFills(input: BrokerFill[]): PairResult {
    const seen = new Set<string>();
    const fills: BrokerFill[] = [];
    let duplicates = 0;
    let invalid = 0;
    for (const f of input) {
        const usable = Number.isFinite(f.quantity) && f.quantity > 0 && Number.isFinite(f.price) && f.price >= 0 && !Number.isNaN(Date.parse(f.tradedAt));
        if (!usable) {
            invalid += 1;
            continue;
        }
        const id = `${f.clientCode}|${f.executionId}`;
        if (seen.has(id)) {
            duplicates += 1;
            continue;
        }
        seen.add(id);
        fills.push(f);
    }
    fills.sort(compareFills);

    const cycles = new Map<string, Cycle>();
    const trades: RoundTrip[] = [];
    const unmatched: UnmatchedExit[] = [];

    for (const f of fills) {
        const key = keyOf(f);
        const chargesFor = (qty: number) => ((f.charges ?? 0) * qty) / f.quantity;
        let left = f.quantity;
        let cycle = cycles.get(key);

        while (left > EPS) {
            if (!cycle) {
                if (f.side === "sell" && isDelivery(f)) {
                    unmatched.push({ executionId: f.executionId, clientCode: f.clientCode, symbol: f.symbol, quantity: round(left, 6), price: f.price, tradedAt: f.tradedAt });
                    break;
                }
                cycle = startCycle(f, left, chargesFor(left));
                cycles.set(key, cycle);
                break;
            }
            if (cycle.side === f.side) {
                cycle.entryQty += left;
                cycle.entryAmount += left * f.price;
                cycle.charges += chargesFor(left);
                cycle.fillCount += 1;
                cycle.closedAt = f.tradedAt;
                break;
            }
            const close = Math.min(left, cycle.entryQty - cycle.exitQty);
            cycle.exitQty += close;
            cycle.exitAmount += close * f.price;
            cycle.charges += chargesFor(close);
            cycle.fillCount += 1;
            cycle.closedAt = f.tradedAt;
            left -= close;
            if (cycle.entryQty - cycle.exitQty > EPS) break; // still open; this fill is used up
            trades.push(finish(cycle));
            cycles.delete(key);
            cycle = undefined;
        }
    }

    const open: OpenPosition[] = [...cycles.values()].map((c) => ({
        clientCode: c.clientCode,
        symbol: c.symbol,
        segment: c.segment,
        product: c.product,
        side: c.side,
        quantity: round(c.entryQty - c.exitQty, 6),
        avgPrice: round(c.entryAmount / c.entryQty, 4),
        openedAt: c.openedAt,
    }));

    trades.sort((a, b) => Date.parse(a.closedAt) - Date.parse(b.closedAt) || (a.externalId < b.externalId ? -1 : 1));
    return { trades, open, unmatched, duplicates, invalid };
}
