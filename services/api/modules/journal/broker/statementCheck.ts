// Compares a customer's own broker statement with what their journal holds, trade
// by trade. It is how the trial is judged: upload the customer's tradebook for
// some days, and see whether the sync got every trade right.
//
// The statement is turned into trades the same way the sync does it (executions
// paired flat to flat). Only the part both sides can speak to is compared:
//   - from the first day the sync has any data for this customer, since earlier
//     days aren't in the journal at all (that is what a backfill is for);
//   - trades that start inside the statement's days. A position carried in from
//     before the statement began can't be worked out from the statement alone, so
//     its trade is counted as "carried in", not as a difference.
// A difference is reported with its reason (price, quantity, a missing trade) so
// the pilot can fix the cause rather than guess.
import { readCustomerFile } from "./backfillFile.js";
import { pairFills } from "./roundTrips.js";
import type { BrokerLink, BrokerStore } from "./store.js";
import { istParts, toJournalTrade } from "./tradeMapper.js";

type Row = Record<string, any>;

export interface TradeBrief {
    date: string;
    exitDate: string | null;
    asset: string;
    contract: string | null;
    side: string;
    quantity: number;
    entryPrice: number | null;
    exitPrice: number | null;
    /** Profit or loss before brokerage and taxes, so a statement without charges compares fairly. */
    grossPnl: number | null;
}

export interface TradeDifference {
    statement: TradeBrief;
    journal: TradeBrief;
    /** What differs, in words: "entry price", "quantity", ... */
    what: string[];
}

export interface StatementCheck {
    file: { executions: number; trades: number; skippedRows: number; otherClientRows: number; from: string | null; to: string | null };
    /** The days that could be compared: the statement's, from the first day the sync has data. */
    window: { from: string | null; to: string | null; statementTrades: number; journalTrades: number };
    matched: number;
    differences: TradeDifference[];
    missingInJournal: TradeBrief[];
    extraInJournal: TradeBrief[];
    counts: { differences: number; missingInJournal: number; extraInJournal: number };
    /** Trades left out of the comparison, and why. */
    notCompared: {
        /** Statement trades that began before the sync had any data. */
        beforeSync: number;
        /** Journal trades that began before the statement's days: positions carried in. */
        carriedIn: number;
        /** Journal trades still going after the statement's last day. */
        continuesAfter: number;
    };
    /** Gross profit and loss over the compared trades, on each side. */
    totals: { statement: number; journal: number; difference: number };
    /** Days (by the day a trade closed) where the two disagree on profit and loss. */
    daysThatDiffer: Array<{ date: string; statement: number; journal: number; difference: number }>;
}

export const SHOWN = 50;
const round2 = (n: number) => Math.round(n * 100) / 100;
const num = (v: unknown): number | null => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

function brief(row: Row): TradeBrief {
    const pnl = num(row.pnl);
    return {
        date: String(row.date),
        exitDate: row.exit_date ? String(row.exit_date) : null,
        asset: String(row.asset ?? ""),
        contract: row.contract ? String(row.contract) : null,
        side: String(row.buy_sell ?? ""),
        quantity: Number(row.quantity),
        entryPrice: num(row.entry_price),
        exitPrice: num(row.exit_price),
        grossPnl: pnl === null ? null : round2(pnl + (num(row.brokerage) ?? 0)),
    };
}

const priceDiffers = (a: number | null, b: number | null) => a !== null && b !== null && Math.abs(a - b) > Math.max(0.01, 1e-4 * Math.max(Math.abs(a), Math.abs(b)));
const PNL_TOLERANCE = 1; // a rupee: prices are held to a few decimals

function whatDiffers(s: TradeBrief, j: TradeBrief): string[] {
    const what: string[] = [];
    if (s.quantity !== j.quantity) what.push("quantity");
    if (priceDiffers(s.entryPrice, j.entryPrice)) what.push("entry price");
    if (priceDiffers(s.exitPrice, j.exitPrice)) what.push("exit price");
    if (s.exitDate !== j.exitDate) what.push("exit date");
    if (s.grossPnl !== null && j.grossPnl !== null && Math.abs(s.grossPnl - j.grossPnl) > PNL_TOLERANCE) what.push("profit and loss");
    return what;
}

/** Pairs each trade in `a` with at most one in `b`, closest first, by `distance` (lower is closer). */
function pairClosest<T>(a: T[], b: T[], distance: (x: T, y: T) => number): Array<[T, T]> {
    const candidates: Array<{ i: number; j: number; d: number }> = [];
    a.forEach((x, i) => b.forEach((y, j) => candidates.push({ i, j, d: distance(x, y) })));
    candidates.sort((p, q) => p.d - q.d || p.i - q.i || p.j - q.j);
    const usedA = new Set<number>();
    const usedB = new Set<number>();
    const pairs: Array<[T, T]> = [];
    for (const { i, j } of candidates) {
        if (usedA.has(i) || usedB.has(j)) continue;
        usedA.add(i);
        usedB.add(j);
        pairs.push([a[i], b[j]]);
    }
    return pairs;
}

const group = <T>(items: T[], key: (t: T) => string) => {
    const m = new Map<string, T[]>();
    for (const item of items) m.set(key(item), [...(m.get(key(item)) ?? []), item]);
    return m;
};

export async function checkStatement(store: BrokerStore, link: BrokerLink, content: Buffer, fileType: "csv" | "excel"): Promise<StatementCheck> {
    const file = readCustomerFile(link, content, fileType);
    const statementRows = pairFills(file.fills).trades.map((t) => toJournalTrade(t, link.user_id));
    const days = file.fills.map((f) => istParts(f.tradedAt).date).sort();
    const from = days[0] ?? null;
    const to = days[days.length - 1] ?? null;

    const syncedDays = (await store.loadFills(link)).map((f) => istParts(f.tradedAt).date).sort();
    const firstSynced = syncedDays[0] ?? null;
    // Nothing earlier than the sync's first day can be in the journal.
    const windowFrom = from && firstSynced ? (from > firstSynced ? from : firstSynced) : null;

    const statementAll = statementRows.map(brief);
    const journalAll = (await store.listSyncedTrades(link.user_id, link.client_code)).map(brief);

    const inWindow = (t: TradeBrief) => windowFrom !== null && to !== null && t.date >= windowFrom && t.date <= to;
    const statementTrades = statementAll.filter(inWindow);
    const journalCandidates = journalAll.filter(inWindow);
    const journalTrades = journalCandidates.filter((t) => t.exitDate !== null && t.exitDate <= (to as string));

    const notCompared = {
        beforeSync: windowFrom === null ? statementAll.length : statementAll.filter((t) => t.date < windowFrom).length,
        carriedIn: windowFrom === null ? 0 : journalAll.filter((t) => t.date < windowFrom && t.exitDate !== null && t.exitDate >= windowFrom && t.exitDate <= (to as string)).length,
        continuesAfter: journalCandidates.length - journalTrades.length,
    };

    // First pass: same day, instrument, side and size. Second: same day, instrument and side, closest size.
    // Closest means the nearest prices, so identical trades pair with each other first and
    // a fault lands on the one trade that has it, whatever order the two lists come in.
    const priceGap = (x: TradeBrief, y: TradeBrief) => Math.abs((x.entryPrice ?? 0) - (y.entryPrice ?? 0)) + Math.abs((x.exitPrice ?? 0) - (y.exitPrice ?? 0));
    const instrument = (t: TradeBrief) => `${t.date}|${t.asset}|${t.contract ?? ""}|${t.side}`;
    const pairs: Array<[TradeBrief, TradeBrief]> = [];
    let leftoverStatement: TradeBrief[] = [];
    let leftoverJournal: TradeBrief[] = [];

    const bySame = (t: TradeBrief) => `${instrument(t)}|${t.quantity}`;
    const journalSame = group(journalTrades, bySame);
    const statementSame = group(statementTrades, bySame);
    for (const key of new Set([...journalSame.keys(), ...statementSame.keys()])) {
        const s = statementSame.get(key) ?? [];
        const j = journalSame.get(key) ?? [];
        const made = pairClosest(s, j, priceGap);
        pairs.push(...made);
        leftoverStatement.push(...s.filter((x) => !made.some(([m]) => m === x)));
        leftoverJournal.push(...j.filter((y) => !made.some(([, m]) => m === y)));
    }
    const sJ = group(leftoverStatement, instrument);
    const jJ = group(leftoverJournal, instrument);
    leftoverStatement = [];
    leftoverJournal = [];
    for (const key of new Set([...sJ.keys(), ...jJ.keys()])) {
        const s = sJ.get(key) ?? [];
        const j = jJ.get(key) ?? [];
        const made = pairClosest(s, j, (x, y) => Math.abs(x.quantity - y.quantity) * 1e9 + priceGap(x, y));
        pairs.push(...made);
        leftoverStatement.push(...s.filter((x) => !made.some(([m]) => m === x)));
        leftoverJournal.push(...j.filter((y) => !made.some(([, m]) => m === y)));
    }

    const differences: TradeDifference[] = [];
    let matched = 0;
    for (const [statement, journal] of pairs) {
        const what = whatDiffers(statement, journal);
        if (what.length) differences.push({ statement, journal, what });
        else matched += 1;
    }
    const order = (a: TradeBrief, b: TradeBrief) => a.date.localeCompare(b.date) || a.asset.localeCompare(b.asset);
    differences.sort((a, b) => order(a.statement, b.statement));
    leftoverStatement.sort(order);
    leftoverJournal.sort(order);

    const sum = (items: TradeBrief[]) => round2(items.reduce((n, t) => n + (t.grossPnl ?? 0), 0));
    const byClose = (items: TradeBrief[]) => {
        const m = new Map<string, number>();
        for (const t of items) m.set(t.exitDate ?? t.date, (m.get(t.exitDate ?? t.date) ?? 0) + (t.grossPnl ?? 0));
        return m;
    };
    const [sDay, jDay] = [byClose(statementTrades), byClose(journalTrades)];
    const daysThatDiffer = [...new Set([...sDay.keys(), ...jDay.keys()])]
        .sort()
        .map((date) => ({ date, statement: round2(sDay.get(date) ?? 0), journal: round2(jDay.get(date) ?? 0) }))
        .map((d) => ({ ...d, difference: round2(d.journal - d.statement) }))
        .filter((d) => Math.abs(d.difference) > PNL_TOLERANCE)
        .slice(0, 31);

    return {
        file: { executions: file.fills.length, trades: statementAll.length, skippedRows: file.skippedRows, otherClientRows: file.otherClientRows, from, to },
        window: { from: windowFrom, to: windowFrom ? to : null, statementTrades: statementTrades.length, journalTrades: journalTrades.length },
        matched,
        differences: differences.slice(0, SHOWN),
        missingInJournal: leftoverStatement.slice(0, SHOWN),
        extraInJournal: leftoverJournal.slice(0, SHOWN),
        counts: { differences: differences.length, missingInJournal: leftoverStatement.length, extraInJournal: leftoverJournal.length },
        notCompared,
        totals: { statement: sum(statementTrades), journal: sum(journalTrades), difference: round2(sum(journalTrades) - sum(statementTrades)) },
        daysThatDiffer,
    };
}
