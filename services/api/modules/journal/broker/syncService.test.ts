import { describe, it, expect } from "vitest";
import { syncLink, syncLinks } from "./syncService.js";
import { createMockAdapter } from "./mockAdapter.js";
import { memoryStore } from "./memoryStore.testutil.js";
import type { BrokerLink } from "./store.js";
import type { BrokerAdapter } from "./types.js";

const link = (over: Partial<BrokerLink> = {}): BrokerLink => ({
    id: "link-1",
    user_id: "user-1",
    broker: "xts",
    client_code: "AB1234",
    status: "active",
    consent_version: "draft-1",
    consent_at: "2026-11-03T00:00:00Z",
    verified_at: "2026-11-03T00:00:00Z",
    verification_method: "mock",
    opening_positions: [],
    last_synced_at: null,
    last_sync_status: null,
    last_sync_error: null,
    created_at: "2026-11-03T00:00:00Z",
    updated_at: "2026-11-03T00:00:00Z",
    ...over,
});

// 3 November 2026, 16:00 IST
const mock = createMockAdapter(() => new Date("2026-11-03T10:30:00Z"));

describe("syncLink", () => {
    it("turns a day of fills into journal trades", async () => {
        const { store, trades } = memoryStore();
        const summary = await syncLink(mock, store, link());

        expect(summary).toMatchObject({ fetched: 5, foreign: 0, newFills: 5, closedTrades: 2, insertedTrades: 2, alreadyInJournal: 0, openPositions: 1, unmatched: 0 });
        const rows = [...trades.values()];
        const reliance = rows.find((r) => r.asset === "RELIANCE")!;
        expect(reliance).toMatchObject({
            user_id: "user-1",
            date: "2026-11-03",
            exit_date: "2026-11-03",
            entry_time: "09:20",
            exit_time: "10:05",
            type: "Intraday",
            market: "Equity",
            quantity: 10,
            entry_price: 2450.5,
            exit_price: 2462,
            brokerage: 20.6,
            pnl: 94.4,
            buy_sell: "buy",
            source: "xts",
        });
        const option = rows.find((r) => r.asset === "NIFTY")!;
        expect(option).toMatchObject({ market: "Options", contract: "NIFTY26N1024500CE", strike_price: 24500, option_type: "call", quantity: 75, pnl: 1079.5, days_to_expiry: 7 });
    });

    it("adds nothing the second time", async () => {
        const { store, trades } = memoryStore();
        await syncLink(mock, store, link());
        const again = await syncLink(mock, store, link());

        expect(again).toMatchObject({ fetched: 5, newFills: 0, closedTrades: 2, insertedTrades: 0, alreadyInJournal: 2 });
        expect(trades.size).toBe(2);
    });

    it("leaves a trade the customer has edited alone", async () => {
        const { store, trades } = memoryStore();
        await syncLink(mock, store, link());
        const [key] = [...trades.keys()];
        trades.set(key, { ...trades.get(key)!, notes: "chased the open", strategy: "Breakout" });

        await syncLink(mock, store, link());
        expect(trades.get(key)).toMatchObject({ notes: "chased the open", strategy: "Breakout" });
    });

    it("ignores executions that belong to another client code", async () => {
        const { store, fills } = memoryStore();
        const leaky: BrokerAdapter = {
            name: "leaky",
            async getTodaysFills() {
                const own = await mock.getTodaysFills("AB1234");
                const other = await mock.getTodaysFills("ZZ9999");
                return [...own, ...other];
            },
        };
        const summary = await syncLink(leaky, store, link());
        expect(summary).toMatchObject({ fetched: 10, foreign: 5, newFills: 5 });
        expect([...fills.values()].every((f) => f.clientCode === "AB1234")).toBe(true);
    });

    it("closes a position the customer already held, using the opening position", async () => {
        const { store, trades } = memoryStore();
        const sellsHolding: BrokerAdapter = {
            name: "t",
            async getTodaysFills(clientCode) {
                return [{ executionId: "9001", clientCode, symbol: "ITC", segment: "NSECM", instrumentId: null, product: "CNC", side: "sell", quantity: 20, price: 480, charges: null, tradedAt: "2026-11-03T11:00:00+05:30" }];
            },
        };
        const held = link({ opening_positions: [{ symbol: "ITC", segment: "NSECM", product: "CNC", side: "buy", quantity: 20, price: 450, openedAt: "2026-10-01T00:00:00+05:30" }] });

        const summary = await syncLink(sellsHolding, store, held);
        expect(summary).toMatchObject({ insertedTrades: 1, unmatched: 0 });
        expect([...trades.values()][0]).toMatchObject({ asset: "ITC", date: "2026-10-01", exit_date: "2026-11-03", type: null, entry_price: 450, exit_price: 480, pnl: 600 });
    });

    it("reports a delivery sale it cannot match instead of inventing a short", async () => {
        const { store, trades } = memoryStore();
        const sellsHolding: BrokerAdapter = {
            name: "t",
            async getTodaysFills(clientCode) {
                return [{ executionId: "9001", clientCode, symbol: "ITC", segment: "NSECM", instrumentId: null, product: "CNC", side: "sell", quantity: 20, price: 480, charges: null, tradedAt: "2026-11-03T11:00:00+05:30" }];
            },
        };
        const summary = await syncLink(sellsHolding, store, link());
        expect(summary).toMatchObject({ insertedTrades: 0, unmatched: 1 });
        expect(trades.size).toBe(0);
    });

    it("records a successful sync on the link", async () => {
        const { store, outcomes } = memoryStore();
        await syncLink(mock, store, link());
        expect(outcomes).toEqual([{ link: "link-1", outcome: { ok: true } }]);
    });
});

describe("syncLinks", () => {
    it("carries on after one customer fails and records why", async () => {
        const { store, trades, outcomes } = memoryStore();
        const flaky: BrokerAdapter = {
            name: "flaky",
            async getTodaysFills(clientCode) {
                if (clientCode === "BAD001") throw new Error("broker said no");
                return mock.getTodaysFills(clientCode);
            },
        };
        const links = [link({ id: "a", user_id: "u-a", client_code: "AAA111" }), link({ id: "b", user_id: "u-b", client_code: "BAD001" }), link({ id: "c", user_id: "u-c", client_code: "CCC333" })];

        const result = await syncLinks(flaky, store, links);

        expect(result).toEqual({ total: 3, synced: 2, failed: 1, failures: [{ clientCode: "BAD001", error: "broker said no" }] });
        expect(trades.size).toBe(4); // two trades each for a and c
        expect(outcomes.find((o) => o.link === "b")!.outcome).toEqual({ ok: false, error: "broker said no" });
    });

    it("handles no links", async () => {
        expect(await syncLinks(mock, memoryStore().store, [])).toEqual({ total: 0, synced: 0, failed: 0, failures: [] });
    });
});
