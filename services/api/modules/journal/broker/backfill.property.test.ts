import { describe, it, expect } from "vitest";
import { applyBackfill, planBackfill, DERIVED_FIELDS } from "./backfill.js";
import { memoryStore } from "./memoryStore.testutil.js";
import { pairFills } from "./roundTrips.js";
import { toJournalTrade } from "./tradeMapper.js";
import type { BrokerLink } from "./store.js";
import type { BrokerFill } from "./types.js";

// However a customer's executions are divided between what the daily sync saw
// and what a backfill adds later, the journal must end up exactly as it would
// have if the whole history had been there from the start, except that a trade
// the customer has written on is never changed or removed. Randomised, and
// seeded so a failure reproduces (the seed is in the test name).

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

const SYMBOLS: Array<[string, string, string[]]> = [
    ["RELIANCE", "NSECM", ["MIS", "CNC"]],
    ["INFY", "NSECM", ["MIS", "CNC"]],
    ["NIFTY26NOVFUT", "NSEFO", ["NRML", "MIS"]],
    ["NIFTY26N1024500CE", "NSEFO", ["NRML"]],
];

function randomHistory(seed: number): BrokerFill[] {
    const rnd = mulberry32(seed);
    const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
    const fills: BrokerFill[] = [];
    let minute = 9 * 60 + 15;
    let day = 5;
    for (let i = 0; i < int(2, 30); i++) {
        minute += int(1, 90);
        if (minute > 15 * 60) {
            minute = 9 * 60 + 15 + int(0, 30);
            day += 1;
        }
        const [symbol, segment, products] = SYMBOLS[int(0, SYMBOLS.length - 1)];
        fills.push({
            executionId: `e${String(i).padStart(4, "0")}`,
            clientCode: "AB1234",
            symbol,
            segment,
            instrumentId: null,
            product: products[int(0, products.length - 1)],
            side: rnd() < 0.5 ? "buy" : "sell",
            quantity: int(1, 10),
            price: int(9000, 11000) / 100,
            charges: rnd() < 0.5 ? int(0, 3000) / 100 : null,
            tradedAt: `2026-01-${String(day).padStart(2, "0")}T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}:00+05:30`,
        });
    }
    return fills;
}

const SEEDS = Array.from({ length: 400 }, (_, i) => i + 1);

/** What the daily sync leaves behind for the fills it saw. */
async function dailySync(store: ReturnType<typeof memoryStore>["store"], fills: BrokerFill[]) {
    await store.saveFills(link, fills);
    await store.insertTrades(pairFills(await store.loadFills(link)).trades.map((t) => toJournalTrade(t, link.user_id)));
}

const sameDerived = (a: Record<string, any>, b: Record<string, any>) => DERIVED_FIELDS.every((f) => (a[f] ?? null) === (b[f] ?? null) || Math.abs(Number(a[f]) - Number(b[f])) < 1e-9);

async function scenario(seed: number, edits: boolean) {
    const all = randomHistory(seed);
    const rnd = mulberry32(seed * 7919 + 13);
    const late: BrokerFill[] = [];
    const early: BrokerFill[] = [];
    for (const f of all) (rnd() < 0.55 ? late : early).push(f);

    const { store, trades } = memoryStore();
    await dailySync(store, late);

    const edited = new Set<string>();
    if (edits) {
        for (const row of await store.listSyncedTrades(link.user_id, link.client_code)) {
            if (rnd() < 0.3) {
                trades.get(`${link.user_id}|${row.external_id}`)!.notes = `note ${row.external_id}`;
                edited.add(row.external_id);
            }
        }
    }

    const plan = await planBackfill(store, link, early);
    await applyBackfill(store, link, plan);

    const expected = new Map(pairFills(all).trades.map((t) => [t.externalId, toJournalTrade(t, link.user_id)]));
    const final = new Map((await store.listSyncedTrades(link.user_id, link.client_code)).map((r) => [String(r.external_id), r]));
    return { all, early, store, trades, plan, expected, final, edited };
}

describe("a backfill, however the history is divided", () => {
    it.each(SEEDS)("ends with exactly the trades the full history makes (seed %i)", async (seed) => {
        const { all, store, plan, expected, final } = await scenario(seed, false);

        expect([...final.keys()].sort()).toEqual([...expected.keys()].sort());
        for (const [id, want] of expected) expect(sameDerived(final.get(id)!, want), `trade ${id}`).toBe(true);
        expect(await store.loadFills(link)).toHaveLength(all.length);
        // Nothing was left for anyone to review.
        expect(plan.kept).toEqual([]);
    });

    it.each(SEEDS)("then has nothing left to do (seed %i)", async (seed) => {
        const { store, early, trades } = await scenario(seed, false);
        const before = JSON.stringify([...trades.entries()]);
        const again = await planBackfill(store, link, early);
        expect(again).toMatchObject({ newFills: [], insert: [], update: [], remove: [], kept: [] });
        await applyBackfill(store, link, again);
        expect(JSON.stringify([...trades.entries()])).toBe(before);
    });

    it.each(SEEDS)("never changes or removes a trade the customer has written on (seed %i)", async (seed) => {
        const { expected, final, edited, trades } = await scenario(seed, true);

        // Everything the full history makes is there; where the row differs it is because the customer had edited it.
        for (const [id, want] of expected) {
            const row = final.get(id);
            expect(row, `missing ${id}`).toBeDefined();
            if (!sameDerived(row!, want)) expect(edited.has(id), `${id} differs but wasn't edited`).toBe(true);
        }
        // Anything that shouldn't exist but does is an edited trade left in place.
        for (const id of final.keys()) if (!expected.has(id)) expect(edited.has(id), `${id} should be gone`).toBe(true);
        // Every edited trade is still there, with its notes.
        for (const id of edited) expect(trades.get(`user-1|${id}`)?.notes, id).toBe(`note ${id}`);
    });

    it.each(SEEDS)("reports exactly the edited trades it left differing from the full history (seed %i)", async (seed) => {
        const { plan, expected, final, edited } = await scenario(seed, true);
        const differing = [...final.keys()].filter((id) => !expected.has(id) || !sameDerived(final.get(id)!, expected.get(id)!)).sort();
        expect(plan.kept.map((k) => k.externalId).sort()).toEqual(differing);
        for (const k of plan.kept) expect(edited.has(k.externalId)).toBe(true);
    });
});
