import { describe, it, expect } from "vitest";
import { memoryStore } from "./memoryStore.testutil.js";
import { pairFills } from "./roundTrips.js";
import { checkStatement } from "./statementCheck.js";
import { statementCsv } from "./statementCsv.testutil.js";
import { toJournalTrade } from "./tradeMapper.js";
import type { BrokerLink } from "./store.js";
import type { BrokerFill } from "./types.js";

// The statement check is how the trial is judged, so it has to be right both ways:
// a journal built from a history must always agree with that same history's
// statement, and a single deliberate fault must be found exactly once, as the
// right kind of fault, without disturbing the rest. Randomised, and seeded so a
// failure reproduces (the seed is in the test name).

function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const link: BrokerLink = {
    id: "link-1",
    user_id: "user-1",
    broker: "xts",
    client_code: "AB1234",
    status: "active",
    consent_version: "draft-1",
    consent_at: "2026-01-01T00:00:00Z",
    verified_at: "2026-01-01T00:00:00Z",
    verification_method: "manual",
    opening_positions: [],
    last_synced_at: null,
    last_sync_status: null,
    last_sync_error: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
};

// Few instruments and small sizes on purpose: it makes look-alike trades (same day,
// instrument, side, size) common, which is where pairing could go wrong.
const SYMBOLS: Array<[string, string, string[]]> = [
    ["RELIANCE", "NSECM", ["MIS", "CNC"]],
    ["INFY", "NSECM", ["MIS"]],
    ["NIFTY26NOVFUT", "NSEFO", ["NRML", "MIS"]],
    ["NIFTY26N1024500CE", "NSEFO", ["NRML"]],
];

function randomHistory(seed: number): BrokerFill[] {
    const rnd = mulberry32(seed);
    const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
    const fills: BrokerFill[] = [];
    let minute = 9 * 60 + 15;
    let day = 5;
    const nextDay = () => {
        day += 1;
        minute = 9 * 60 + 15 + int(0, 30);
    };
    const tick = (by: number) => {
        minute += by;
        if (minute > 15 * 60) nextDay();
    };
    const push = (symbol: string, segment: string, product: string, side: "buy" | "sell", quantity: number) =>
        fills.push({
            executionId: `e${String(fills.length).padStart(4, "0")}`,
            clientCode: "AB1234",
            symbol,
            segment,
            instrumentId: null,
            product,
            side,
            quantity,
            price: int(95, 105),
            charges: rnd() < 0.5 ? int(0, 3000) / 100 : null,
            tradedAt: `2026-01-${String(day).padStart(2, "0")}T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}:00+05:30`,
        });
    // One or two fills that add up to the whole size.
    const parts = (total: number) => (total > 1 && rnd() < 0.4 ? [1, total - 1] : [total]);

    // Positions that are opened and then closed, some in pieces, some held overnight, some short.
    for (let episode = 0, n = int(4, 14); episode < n; episode++) {
        const [symbol, segment, products] = SYMBOLS[int(0, SYMBOLS.length - 1)];
        const product = products[int(0, products.length - 1)];
        const [open, close]: Array<"buy" | "sell"> = product === "CNC" || rnd() < 0.6 ? ["buy", "sell"] : ["sell", "buy"];
        const size = int(1, 6);
        for (const q of parts(size)) {
            tick(int(1, 30));
            push(symbol, segment, product, open, q);
        }
        if (product !== "MIS" && rnd() < 0.3) nextDay();
        for (const q of parts(size)) {
            tick(int(1, 30));
            push(symbol, segment, product, close, q);
        }
    }
    return fills;
}

const SEEDS = Array.from({ length: 400 }, (_, i) => i + 1);

async function journalFrom(fills: BrokerFill[]) {
    const m = memoryStore();
    await m.store.saveFills(link, fills);
    await m.store.insertTrades(pairFills(fills).trades.map((t) => toJournalTrade(t, link.user_id)));
    return m;
}
/** The database makes no promise about the order it lists trades in, so neither may the check. */
function shuffleTrades(trades: Map<string, Record<string, unknown>>, rnd: () => number) {
    const entries = [...trades.entries()].sort(() => rnd() - 0.5);
    trades.clear();
    for (const [k, v] of entries) trades.set(k, v);
}
const check = (m: { store: any }, fills: BrokerFill[]) => checkStatement(m.store, link, statementCsv(fills), "csv");

describe("a journal built from a history, checked against that history's statement", () => {
    it.each(SEEDS)("agrees completely (seed %i)", async (seed) => {
        const fills = randomHistory(seed);
        const trades = pairFills(fills).trades.length;
        const m = await journalFrom(fills);
        shuffleTrades(m.trades, mulberry32(seed + 99));
        const r = await check(m, fills);

        expect(r.counts).toEqual({ differences: 0, missingInJournal: 0, extraInJournal: 0 });
        expect(r.matched).toBe(trades);
        expect(r.totals.difference).toBe(0);
        expect(r.daysThatDiffer).toEqual([]);
        expect(r.notCompared).toEqual({ beforeSync: 0, carriedIn: 0, continuesAfter: 0 });
    });

    it("is not vacuous: most of the histories make trades to compare", () => {
        const withTrades = SEEDS.filter((s) => pairFills(randomHistory(s)).trades.length >= 2).length;
        expect(withTrades).toBeGreaterThan(SEEDS.length * 0.8);
    });
});

const FAULTS = ["exit price", "entry price", "quantity", "missing", "extra"] as const;

describe("one deliberate fault in the journal", () => {
    it.each(SEEDS)("is found exactly once, as the right kind of fault (seed %i)", async (seed) => {
        const fills = randomHistory(seed);
        const m = await journalFrom(fills);
        const rows = await m.store.listSyncedTrades(link.user_id, link.client_code);
        if (rows.length === 0) return;
        const rnd = mulberry32(seed * 104729 + 7);
        const victim = rows[Math.floor(rnd() * rows.length)];
        const fault = FAULTS[seed % FAULTS.length];
        const key = `${link.user_id}|${victim.external_id}`;

        if (fault === "exit price") m.trades.get(key)!.exit_price = Number(victim.exit_price) + 5;
        else if (fault === "entry price") m.trades.get(key)!.entry_price = Number(victim.entry_price) - 5;
        else if (fault === "quantity") m.trades.get(key)!.quantity = Number(victim.quantity) + 1;
        else if (fault === "missing") m.trades.delete(key);
        else m.trades.set(`${link.user_id}|${link.client_code}:fake`, { ...victim, external_id: `${link.client_code}:fake`, asset: "ZZTOP", contract: null });

        shuffleTrades(m.trades, rnd);
        const r = await check(m, fills);
        const expected = { differences: 0, missingInJournal: 0, extraInJournal: 0 };
        if (fault === "missing") expected.missingInJournal = 1;
        else if (fault === "extra") expected.extraInJournal = 1;
        else expected.differences = 1;
        expect(r.counts).toEqual(expected);
        expect(r.matched).toBe(rows.length - (fault === "extra" ? 0 : 1));

        if (fault === "exit price") expect(r.differences[0].what).toContain("exit price");
        if (fault === "entry price") expect(r.differences[0].what).toContain("entry price");
        if (fault === "quantity") expect(r.differences[0].what).toContain("quantity");
        if (fault === "missing") expect(r.missingInJournal[0].asset).toBe(victim.asset);
        if (fault === "extra") expect(r.extraInJournal[0].asset).toBe("ZZTOP");
    });
});
