import { describe, it, expect } from "vitest";
import { pairFills } from "./roundTrips.js";
import type { BrokerFill, RoundTrip } from "./types.js";

// Randomised checks of the pairing engine against rules that must hold for ANY
// run of fills, plus a second, differently written calculation of the trades
// to compare with. Seeded, so a failure reproduces: the failing seed is in the
// test name.

function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const PRODUCTS = ["MIS", "NRML", "CNC"];
const SYMBOLS = ["RELIANCE", "INFY", "NIFTY26N1024500CE"];

function randomFills(seed: number): BrokerFill[] {
    const rnd = mulberry32(seed);
    const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
    const count = int(1, 40);
    const fills: BrokerFill[] = [];
    let minute = 9 * 60 + 15;
    for (let i = 0; i < count; i++) {
        // Often the same minute as the last fill, to exercise the execution-id tie-break.
        if (rnd() < 0.7) minute += int(1, 9);
        const hh = String(Math.floor(minute / 60) % 24).padStart(2, "0");
        const mm = String(minute % 60).padStart(2, "0");
        fills.push({
            executionId: String(1000 + i),
            clientCode: rnd() < 0.8 ? "C1" : "C2",
            symbol: SYMBOLS[int(0, SYMBOLS.length - 1)],
            segment: "NSECM",
            instrumentId: null,
            product: PRODUCTS[int(0, PRODUCTS.length - 1)],
            side: rnd() < 0.5 ? "buy" : "sell",
            quantity: int(1, 20),
            price: int(9000, 11000) / 100,
            charges: rnd() < 0.5 ? int(0, 5000) / 100 : null,
            tradedAt: `2026-11-03T${hh}:${mm}:00+05:30`,
        });
    }
    return fills;
}

const keyOf = (f: { clientCode: string; segment: string | null; symbol: string; product: string | null }) => [f.clientCode, f.segment ?? "", f.symbol, (f.product ?? "").toUpperCase()].join("|");
const sortFills = (fills: BrokerFill[]) => [...fills].sort((a, b) => Date.parse(a.tradedAt) - Date.parse(b.tradedAt) || Number(a.executionId) - Number(b.executionId));

// ── the second calculation ────────────────────────────────────────────────
// Walks a running signed position instead of tracking entries and exits: a
// trade runs from one time the position is zero to the next, a fill that crosses
// zero is cut in two, and the trade's P&L is simply the cash it moved.
interface Expected {
    key: string;
    side: "buy" | "sell";
    quantity: number;
    entryPrice: number;
    gross: number;
    charges: number;
}

function expectedTrades(fills: BrokerFill[]) {
    const byKey = new Map<string, BrokerFill[]>();
    for (const f of sortFills(fills)) byKey.set(keyOf(f), [...(byKey.get(keyOf(f)) ?? []), f]);

    const trades: Expected[] = [];
    const open = new Map<string, number>(); // signed open quantity per key
    let unmatchedQty = 0;
    for (const [key, list] of byKey) {
        let position = 0;
        let cycle: { side: "buy" | "sell"; entryQty: number; entryAmount: number; cash: number; charges: number } | null = null;
        for (const f of list) {
            const delta = f.side === "buy" ? f.quantity : -f.quantity;
            const crosses = position !== 0 && Math.sign(position) !== Math.sign(delta) && Math.abs(delta) > Math.abs(position);
            const slices = crosses ? [-position, delta + position] : [delta];
            for (const d of slices) {
                if (position === 0 && d < 0 && (f.product ?? "").toUpperCase() === "CNC") {
                    unmatchedQty += Math.abs(d);
                    continue;
                }
                const q = Math.abs(d);
                if (position === 0) cycle = { side: d > 0 ? "buy" : "sell", entryQty: 0, entryAmount: 0, cash: 0, charges: 0 };
                if (Math.sign(d) === (cycle!.side === "buy" ? 1 : -1)) {
                    cycle!.entryQty += q;
                    cycle!.entryAmount += q * f.price;
                }
                cycle!.cash += -d * f.price; // buying spends cash, selling brings it in
                cycle!.charges += ((f.charges ?? 0) * q) / f.quantity;
                position += d;
                if (position === 0) {
                    trades.push({ key, side: cycle!.side, quantity: cycle!.entryQty, entryPrice: cycle!.entryAmount / cycle!.entryQty, gross: cycle!.cash, charges: cycle!.charges });
                    cycle = null;
                }
            }
        }
        open.set(key, position);
    }
    return { trades, open, unmatchedQty };
}

const tripKey = (t: RoundTrip) => keyOf(t);
const close = (a: number, b: number, tol = 0.006) => Math.abs(a - b) <= tol;

const SEEDS = Array.from({ length: 400 }, (_, i) => i + 1);

describe("pairFills on random runs of fills", () => {
    it.each(SEEDS)("matches an independent calculation (seed %i)", (seed) => {
        const fills = randomFills(seed);
        const result = pairFills(fills);
        const oracle = expectedTrades(fills);

        // Same trades, same order within each instrument.
        const group = (items: Array<{ key: string }>) => {
            const m = new Map<string, any[]>();
            for (const it of items) m.set(it.key, [...(m.get(it.key) ?? []), it]);
            return m;
        };
        const got = group(result.trades.map((t) => ({ ...t, key: tripKey(t) })));
        const want = group(oracle.trades);
        expect([...got.keys()].sort()).toEqual([...want.keys()].sort());
        for (const [key, wanted] of want) {
            const actual = got.get(key)!;
            expect(actual, key).toHaveLength(wanted.length);
            wanted.forEach((w, i) => {
                const a = actual[i];
                expect(a.side).toBe(w.side);
                expect(a.quantity).toBe(w.quantity);
                expect(close(a.entryPrice, w.entryPrice, 0.0001), `entry ${a.entryPrice} vs ${w.entryPrice}`).toBe(true);
                expect(close(a.grossPnl, w.gross), `gross ${a.grossPnl} vs ${w.gross}`).toBe(true);
                expect(close(a.charges, w.charges), `charges ${a.charges} vs ${w.charges}`).toBe(true);
                expect(close(a.netPnl, w.gross - w.charges), `net ${a.netPnl} vs ${w.gross - w.charges}`).toBe(true);
            });
        }

        // Same positions left open.
        const openGot = new Map(result.open.map((o) => [keyOf(o), o.side === "buy" ? o.quantity : -o.quantity]));
        for (const [key, qty] of oracle.open) expect(openGot.get(key) ?? 0, key).toBe(qty);
        expect(result.unmatched.reduce((n, u) => n + u.quantity, 0)).toBe(oracle.unmatchedQty);
    });

    it.each(SEEDS)("conserves every unit bought and sold (seed %i)", (seed) => {
        const fills = randomFills(seed);
        const result = pairFills(fills);
        const bought = fills.filter((f) => f.side === "buy").reduce((n, f) => n + f.quantity, 0);
        const sold = fills.filter((f) => f.side === "sell").reduce((n, f) => n + f.quantity, 0);
        const unmatched = result.unmatched.reduce((n, u) => n + u.quantity, 0);

        // A completed trade uses the same quantity on both sides, so it nets to nothing. What is
        // left, bought less sold (not counting sales that had nothing behind them), must be exactly
        // the positions still open. An open position reports only its net quantity.
        const openBuy = result.open.filter((o) => o.side === "buy").reduce((n, o) => n + o.quantity, 0);
        const openSell = result.open.filter((o) => o.side === "sell").reduce((n, o) => n + o.quantity, 0);
        expect(bought - (sold - unmatched)).toBe(openBuy - openSell);
        // And every completed trade is balanced, with real units in it.
        for (const t of result.trades) expect(t.quantity).toBeGreaterThan(0);
    });

    it.each(SEEDS)("gives the same answer however the fills are ordered (seed %i)", (seed) => {
        const fills = randomFills(seed);
        const rnd = mulberry32(seed * 7919);
        const shuffled = [...fills].sort(() => rnd() - 0.5);
        expect(pairFills(shuffled)).toEqual(pairFills(fills));
    });

    it.each(SEEDS)("never changes a trade already closed when later fills arrive (seed %i)", (seed) => {
        const fills = sortFills(randomFills(seed));
        const cut = Math.floor(mulberry32(seed * 31)() * fills.length);
        const earlier = pairFills(fills.slice(0, cut)).trades;
        const later = pairFills(fills).trades;
        // This is what makes re-running the sync safe: yesterday's trades keep their ids and numbers.
        for (const t of earlier) expect(later).toContainEqual(t);
    });

    it.each(SEEDS)("ignores repeated executions (seed %i)", (seed) => {
        const fills = randomFills(seed);
        const repeats = fills.filter((_, i) => i % 3 === 0).map((f) => ({ ...f }));
        const result = pairFills([...fills, ...repeats]);
        const clean = pairFills(fills);
        expect(result.duplicates).toBe(repeats.length);
        expect({ ...result, duplicates: 0 }).toEqual(clean);
    });

    it.each(SEEDS)("keeps numbers sane and delivery trades long only (seed %i)", (seed) => {
        const fills = randomFills(seed);
        const result = pairFills(fills);
        const prices = fills.map((f) => f.price);
        const [lo, hi] = [Math.min(...prices), Math.max(...prices)];
        for (const t of result.trades) {
            for (const n of [t.quantity, t.entryPrice, t.exitPrice, t.charges, t.grossPnl, t.netPnl]) expect(Number.isFinite(n)).toBe(true);
            expect(t.quantity).toBeGreaterThan(0);
            expect(t.entryPrice).toBeGreaterThanOrEqual(lo - 1e-9);
            expect(t.entryPrice).toBeLessThanOrEqual(hi + 1e-9);
            expect(t.exitPrice).toBeGreaterThanOrEqual(lo - 1e-9);
            expect(t.exitPrice).toBeLessThanOrEqual(hi + 1e-9);
            expect(Date.parse(t.closedAt)).toBeGreaterThanOrEqual(Date.parse(t.openedAt));
            if ((t.product ?? "").toUpperCase() === "CNC") expect(t.side).toBe("buy");
        }
        for (const o of result.open) if ((o.product ?? "").toUpperCase() === "CNC") expect(o.side).toBe("buy");
        // No two trades share an id.
        expect(new Set(result.trades.map((t) => t.externalId)).size).toBe(result.trades.length);
    });
});
