import { describe, it, expect } from "vitest";
import { applyBackfill, hasCustomerEdits, planBackfill, DERIVED_FIELDS } from "./backfill.js";
import { memoryStore } from "./memoryStore.testutil.js";
import { pairFills } from "./roundTrips.js";
import { toJournalTrade } from "./tradeMapper.js";
import type { BrokerLink } from "./store.js";
import type { BrokerFill } from "./types.js";

const link = (over: Partial<BrokerLink> = {}): BrokerLink => ({
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
    ...over,
});

let n = 0;
const fill = (o: Partial<BrokerFill> & Pick<BrokerFill, "side" | "quantity" | "price" | "tradedAt">): BrokerFill => ({
    executionId: `f${String(++n).padStart(5, "0")}`,
    clientCode: "AB1234",
    symbol: "NIFTY26NOVFUT",
    segment: "NSEFO",
    instrumentId: null,
    product: "NRML",
    charges: null,
    ...o,
});
const at = (day: string, time = "10:00") => `${day}T${time}:00+05:30`;

/** What the daily sync leaves behind: the fills stored, and the trades the fills make, added once each. */
async function dailySync(store: ReturnType<typeof memoryStore>["store"], l: BrokerLink, fills: BrokerFill[]) {
    await store.saveFills(l, fills);
    const rows = pairFills(await store.loadFills(l)).trades.map((t) => toJournalTrade(t, l.user_id));
    await store.insertTrades(rows);
}

const backfill = async (store: ReturnType<typeof memoryStore>["store"], l: BrokerLink, incoming: BrokerFill[]) => {
    const plan = await planBackfill(store, l, incoming);
    await applyBackfill(store, l, plan);
    return plan;
};
const synced = async (store: ReturnType<typeof memoryStore>["store"], l = link()) => (await store.listSyncedTrades(l.user_id, l.client_code)).sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.external_id).localeCompare(String(b.external_id)));

describe("a position bought before the customer linked", () => {
    // Day 2 is all the sync saw: a sale, then a purchase. Read alone, that is a short trade.
    const day2 = () => [fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("2026-01-06", "10:00") }), fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-06", "11:00") })];
    const day1Purchase = () => fill({ side: "buy", quantity: 10, price: 90, tradedAt: at("2026-01-05", "10:00") });

    it("replaces the wrong short with the real trade", async () => {
        const { store } = memoryStore();
        await dailySync(store, link(), day2());
        const [wrong] = await synced(store);
        expect(wrong).toMatchObject({ buy_sell: "sell", pnl: 100 }); // what was believed

        const purchase = day1Purchase();
        const plan = await backfill(store, link(), [purchase]);

        expect(plan).toMatchObject({ insert: [expect.objectContaining({ buy_sell: "buy", entry_price: 90, exit_price: 110, pnl: 200 })], update: [], kept: [] });
        expect(plan.remove).toEqual([wrong.external_id]);
        const after = await synced(store);
        expect(after).toHaveLength(1);
        expect(after[0]).toMatchObject({ date: "2026-01-05", exit_date: "2026-01-06", buy_sell: "buy", pnl: 200 });
        expect(plan.totals).toEqual({ fills: 3, trades: 1, open: 1, unmatched: 0 }); // the later purchase is a new open position
    });

    it("keeps the wrong trade if the customer has written on it, and says so", async () => {
        const { store, trades } = memoryStore();
        await dailySync(store, link(), day2());
        const [wrong] = await synced(store);
        trades.get(`user-1|${wrong.external_id}`)!.notes = "Faded the open, worked well";

        const plan = await backfill(store, link(), [day1Purchase()]);

        expect(plan.remove).toEqual([]);
        expect(plan.kept).toEqual([{ externalId: wrong.external_id, asset: "NIFTY", date: "2026-01-06", why: "superseded" }]);
        const after = await synced(store);
        expect(after).toHaveLength(2); // theirs stays, and the corrected one is added beside it
        expect(after.find((t) => t.external_id === wrong.external_id)!.notes).toBe("Faded the open, worked well");
    });
});

describe("a day the sync missed in the middle of a trade", () => {
    const f1 = () => fill({ executionId: "a1", side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-05", "10:00") });
    const f3 = () => fill({ executionId: "a3", side: "sell", quantity: 10, price: 110, tradedAt: at("2026-01-05", "14:00") });
    const missing = () => fill({ executionId: "a2", side: "sell", quantity: 4, price: 104, tradedAt: at("2026-01-05", "12:00") });

    it("updates the trade in place when its numbers change", async () => {
        const { store } = memoryStore();
        await dailySync(store, link(), [f1(), f3()]);
        expect((await synced(store))[0]).toMatchObject({ quantity: 10, exit_price: 110, pnl: 100 });

        const plan = await backfill(store, link(), [missing()]);

        // Sold 4 at 104 and 10 at 110 against 10 bought: the 10 bought are closed at an average of 107.6.
        expect(plan.update).toHaveLength(1);
        expect(plan.insert).toEqual([]);
        const [trade] = await synced(store);
        expect(trade).toMatchObject({ external_id: "AB1234:NSEFO:NIFTY26NOVFUT:NRML:a1", quantity: 10, entry_price: 100, exit_price: 107.6, pnl: 76 });
    });

    it("leaves an edited trade's numbers alone and reports that it differs", async () => {
        const { store, trades } = memoryStore();
        await dailySync(store, link(), [f1(), f3()]);
        const [t] = await synced(store);
        trades.get(`user-1|${t.external_id}`)!.strategy = "Breakout";

        const plan = await backfill(store, link(), [missing()]);

        expect(plan.update).toEqual([]);
        expect(plan.kept).toEqual([{ externalId: t.external_id, asset: "NIFTY", date: "2026-01-05", why: "changed" }]);
        expect((await synced(store))[0]).toMatchObject({ exit_price: 110, pnl: 100, strategy: "Breakout" });
    });

    it("treats a trade whose numbers the customer changed by hand as theirs, even with no notes", async () => {
        const { store, trades } = memoryStore();
        await dailySync(store, link(), [f1(), f3()]);
        const [t] = await synced(store);
        trades.get(`user-1|${t.external_id}`)!.exit_price = 111; // corrected by hand

        const plan = await backfill(store, link(), [missing()]);
        expect(plan.update).toEqual([]);
        expect(plan.kept.map((k) => k.why)).toEqual(["changed"]);
        expect((await synced(store))[0].exit_price).toBe(111);
    });
});

describe("a backfill that changes nothing", () => {
    it("has an empty plan when every execution is already held, and again after applying", async () => {
        const { store } = memoryStore();
        const fills = [fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-05") }), fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("2026-01-05", "11:00") })];
        await dailySync(store, link(), fills);

        const plan = await planBackfill(store, link(), fills);
        expect(plan).toMatchObject({ newFills: [], insert: [], update: [], remove: [], kept: [] });

        const extra = [fill({ side: "buy", quantity: 5, price: 90, tradedAt: at("2026-01-02") }), fill({ side: "sell", quantity: 5, price: 95, tradedAt: at("2026-01-02", "11:00") })];
        await backfill(store, link(), extra);
        const again = await planBackfill(store, link(), extra);
        expect(again).toMatchObject({ newFills: [], insert: [], update: [], remove: [], kept: [] });
        expect(await synced(store)).toHaveLength(2);
    });

    it("works on a link with no history yet, adding every trade the executions make", async () => {
        const { store } = memoryStore();
        const plan = await backfill(store, link(), [
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-05") }),
            fill({ side: "sell", quantity: 10, price: 105, tradedAt: at("2026-01-05", "11:00") }),
        ]);
        expect(plan.insert).toHaveLength(1);
        expect(await synced(store)).toHaveLength(1);
        expect(await store.loadFills(link())).toHaveLength(2);
    });

    it("ignores executions that belong to another client code", async () => {
        const { store } = memoryStore();
        const plan = await planBackfill(store, link(), [fill({ clientCode: "ZZ9999", side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-05") })]);
        expect(plan.newFills).toEqual([]);
    });

    it("counts a repeated execution id once", async () => {
        const { store } = memoryStore();
        const one = fill({ executionId: "dup", side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-05") });
        expect((await planBackfill(store, link(), [one, { ...one }])).newFills).toHaveLength(1);
    });
});

describe("what it never touches", () => {
    it("leaves hand-entered trades alone, and synced trades of another client code", async () => {
        const { store, trades } = memoryStore();
        trades.set("user-1|manual-1", { user_id: "user-1", source: "manual", external_id: null, asset: "NIFTY", date: "2026-01-06", quantity: 10, buy_sell: "sell", pnl: 100 });
        trades.set("user-1|OLD999:NSEFO:NIFTY26NOVFUT:NRML:x", { user_id: "user-1", source: "xts", external_id: "OLD999:NSEFO:NIFTY26NOVFUT:NRML:x", asset: "NIFTY", date: "2026-01-06" });
        await dailySync(store, link(), [fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("2026-01-06") }), fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-06", "11:00") })]);

        await backfill(store, link(), [fill({ side: "buy", quantity: 10, price: 90, tradedAt: at("2026-01-05") })]);

        expect(trades.has("user-1|manual-1")).toBe(true);
        expect(trades.has("user-1|OLD999:NSEFO:NIFTY26NOVFUT:NRML:x")).toBe(true);
    });

    it("keeps a synced trade it can't account for, rather than deleting it", async () => {
        const { store, trades } = memoryStore();
        trades.set("user-1|AB1234:NSEFO:X:NRML:q", { user_id: "user-1", source: "xts", external_id: "AB1234:NSEFO:X:NRML:q", asset: "X", date: "2026-01-02", quantity: 1, pnl: 5, notes: "" });
        const plan = await backfill(store, link(), [fill({ side: "buy", quantity: 10, price: 90, tradedAt: at("2026-01-05") })]);
        expect(plan.remove).toEqual([]);
        expect(plan.kept).toMatchObject([{ externalId: "AB1234:NSEFO:X:NRML:q", why: "superseded" }]);
        expect(trades.has("user-1|AB1234:NSEFO:X:NRML:q")).toBe(true);
    });
});

describe("a backfill that stops part-way", () => {
    it("is finished by running it again", async () => {
        const { store } = memoryStore();
        await dailySync(store, link(), [fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("2026-01-06") }), fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("2026-01-06", "11:00") })]);
        const purchase = fill({ side: "buy", quantity: 10, price: 90, tradedAt: at("2026-01-05") });

        // The trades are changed, but saving the executions fails.
        const realSave = store.saveFills;
        store.saveFills = async () => {
            throw new Error("connection lost");
        };
        await expect(backfill(store, link(), [purchase])).rejects.toThrow("connection lost");
        store.saveFills = realSave;
        expect(await store.loadFills(link())).toHaveLength(2); // the purchase isn't stored yet
        expect((await synced(store)).map((t) => t.pnl)).toEqual([200]); // but the corrected trade is in

        const plan = await backfill(store, link(), [purchase]);
        expect(plan).toMatchObject({ insert: [], update: [], remove: [], kept: [] });
        expect(await store.loadFills(link())).toHaveLength(3);
        expect((await synced(store)).map((t) => t.pnl)).toEqual([200]);
    });
});

describe("hasCustomerEdits", () => {
    it("is false for a trade as the sync wrote it, whatever the database filled in", () => {
        expect(hasCustomerEdits({ notes: "", tags: [], strategy: null, emotion: "neutral" })).toBe(false);
        expect(hasCustomerEdits({})).toBe(false);
        expect(hasCustomerEdits({ notes: null, tags: null, emotion: null, target_price: null, greeks: null })).toBe(false);
    });

    it("is true as soon as the customer has added anything", () => {
        for (const edit of [{ notes: "x" }, { strategy: "Breakout" }, { tags: ["swing"] }, { emotion: "fearful" }, { target_price: 120 }, { stop_loss: 95 }, { margin: 5000 }, { underlying_price: 24000 }, { implied_volatility: 15 }, { greeks: { delta: 0.5 } }]) {
            expect(hasCustomerEdits({ notes: "", tags: [], emotion: "neutral", ...edit }), JSON.stringify(edit)).toBe(true);
        }
    });

    it("covers every derived field in the update, and no customer field", () => {
        expect(DERIVED_FIELDS).toEqual(expect.arrayContaining(["quantity", "entry_price", "exit_price", "pnl", "brokerage", "date", "exit_date"]));
        for (const customerField of ["notes", "strategy", "tags", "emotion", "target_price", "stop_loss", "margin"]) expect(DERIVED_FIELDS as readonly string[]).not.toContain(customerField);
    });
});
