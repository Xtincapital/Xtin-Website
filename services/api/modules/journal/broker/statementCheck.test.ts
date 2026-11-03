import { describe, it, expect } from "vitest";
import { BackfillFileError } from "./backfillFile.js";
import { memoryStore } from "./memoryStore.testutil.js";
import { pairFills } from "./roundTrips.js";
import { statementCsv } from "./statementCsv.testutil.js";
import { checkStatement, SHOWN } from "./statementCheck.js";
import { toJournalTrade } from "./tradeMapper.js";
import type { BrokerLink } from "./store.js";
import type { BrokerFill } from "./types.js";

const link = (code = "AB1234"): BrokerLink => ({
    id: "link-1",
    user_id: "user-1",
    broker: "xts",
    client_code: code,
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
});

let n = 0;
const fill = (o: Partial<BrokerFill> & Pick<BrokerFill, "side" | "quantity" | "price" | "tradedAt">): BrokerFill => ({
    executionId: `e${String(++n).padStart(5, "0")}`,
    clientCode: "AB1234",
    symbol: "RELIANCE",
    segment: "NSECM",
    instrumentId: null,
    product: "MIS",
    charges: null,
    ...o,
});
const at = (day: string, time = "10:00") => `${day}T${time}:00+05:30`;

/** A journal built the way the daily sync builds it: the executions stored, their trades added. */
async function journalFrom(fills: BrokerFill[], l = link()) {
    const m = memoryStore();
    await m.store.saveFills(l, fills);
    await m.store.insertTrades(pairFills(fills).trades.map((t) => toJournalTrade(t, l.user_id)));
    return m;
}
const check = (m: { store: any }, fills: BrokerFill[], l = link()) => checkStatement(m.store, l, statementCsv(fills), "csv");

const DAY = "2026-01-05";
const roundTrip = (symbol: string, qty: number, buy: number, sell: number, day = DAY, product = "MIS") => [
    fill({ symbol, side: "buy", quantity: qty, price: buy, tradedAt: at(day, "09:30"), product }),
    fill({ symbol, side: "sell", quantity: qty, price: sell, tradedAt: at(day, "10:30"), product }),
];

describe("a journal that agrees with the statement", () => {
    it("matches every trade, with no differences and the same profit on both sides", async () => {
        const fills = [...roundTrip("RELIANCE", 10, 100, 110), ...roundTrip("INFY", 5, 1500, 1490), ...roundTrip("TCS", 2, 3900, 3950, "2026-01-06")];
        const r = await check(await journalFrom(fills), fills);

        expect(r.matched).toBe(3);
        expect(r.differences).toEqual([]);
        expect(r.missingInJournal).toEqual([]);
        expect(r.extraInJournal).toEqual([]);
        expect(r.totals).toEqual({ statement: 100 - 50 + 100, journal: 150, difference: 0 });
        expect(r.daysThatDiffer).toEqual([]);
        expect(r.window).toMatchObject({ from: DAY, to: "2026-01-06", statementTrades: 3, journalTrades: 3 });
        expect(r.file).toMatchObject({ executions: 6, trades: 3, skippedRows: 0, otherClientRows: 0 });
    });

    it("compares profit before charges, so a statement without brokerage still agrees", async () => {
        const withCharges = roundTrip("RELIANCE", 10, 100, 110).map((f) => ({ ...f, charges: 20 }));
        const m = await journalFrom(withCharges); // the journal's profit is net of the 40 of charges
        const r = await check(m, roundTrip("RELIANCE", 10, 100, 110).map((f, i) => ({ ...f, executionId: withCharges[i].executionId })));
        expect(r.matched).toBe(1);
        expect(r.differences).toEqual([]);
        expect(r.totals.difference).toBe(0);
    });

    it("pairs identical trades one for one", async () => {
        const fills = [...roundTrip("RELIANCE", 10, 100, 110), ...roundTrip("RELIANCE", 10, 100, 110)].map((f, i) => ({ ...f, tradedAt: at(DAY, `${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "45" : "15"}`) }));
        const r = await check(await journalFrom(fills), fills);
        expect(r.matched).toBe(2);
        expect(r.missingInJournal).toEqual([]);
        expect(r.extraInJournal).toEqual([]);
    });

    it("keeps different contracts of one underlying apart", async () => {
        const call = (side: "buy" | "sell", price: number, time: string) => fill({ symbol: "NIFTY26N1024500CE", segment: "NSEFO", product: "NRML", side, quantity: 75, price, tradedAt: at(DAY, time) });
        const put = (side: "buy" | "sell", price: number, time: string) => fill({ symbol: "NIFTY26N1024500PE", segment: "NSEFO", product: "NRML", side, quantity: 75, price, tradedAt: at(DAY, time) });
        const fills = [call("buy", 100, "09:30"), call("sell", 120, "10:30"), put("buy", 90, "09:31"), put("sell", 80, "10:31")];
        const r = await check(await journalFrom(fills), fills);
        expect(r.matched).toBe(2);
        expect(r.differences).toEqual([]);
    });
});

describe("what a difference looks like", () => {
    it("names the price that is wrong, and the profit that follows from it", async () => {
        const fills = roundTrip("RELIANCE", 10, 100, 110);
        const m = await journalFrom(fills);
        const [row] = await m.store.listSyncedTrades("user-1", "AB1234");
        await m.store.updateSyncedTrade("user-1", row.external_id, { exit_price: 108, pnl: 80 });

        const r = await check(m, fills);
        expect(r.matched).toBe(0);
        expect(r.differences).toHaveLength(1);
        expect(r.differences[0].what).toEqual(["exit price", "profit and loss"]);
        expect(r.differences[0].statement).toMatchObject({ exitPrice: 110, grossPnl: 100 });
        expect(r.differences[0].journal).toMatchObject({ exitPrice: 108, grossPnl: 80 });
        expect(r.totals).toEqual({ statement: 100, journal: 80, difference: -20 });
        expect(r.daysThatDiffer).toEqual([{ date: DAY, statement: 100, journal: 80, difference: -20 }]);
    });

    it("allows for rounding, but not for a real difference", async () => {
        const fills = roundTrip("RELIANCE", 10, 100, 110);
        const m = await journalFrom(fills);
        const [row] = await m.store.listSyncedTrades("user-1", "AB1234");
        await m.store.updateSyncedTrade("user-1", row.external_id, { entry_price: 100.005 });
        expect((await check(m, fills)).matched).toBe(1); // half a paisa
        await m.store.updateSyncedTrade("user-1", row.external_id, { entry_price: 100.05 });
        expect((await check(m, fills)).differences[0].what).toContain("entry price");
    });

    it("blames the right one of two look-alike trades", async () => {
        // Same day, instrument, side, size and entry price: only the exits tell them apart.
        const first = [fill({ symbol: "RELIANCE", side: "buy", quantity: 10, price: 100, tradedAt: at(DAY, "09:30") }), fill({ symbol: "RELIANCE", side: "sell", quantity: 10, price: 110, tradedAt: at(DAY, "09:40") })];
        const second = [fill({ symbol: "RELIANCE", side: "buy", quantity: 10, price: 100, tradedAt: at(DAY, "10:30") }), fill({ symbol: "RELIANCE", side: "sell", quantity: 10, price: 120, tradedAt: at(DAY, "10:40") })];
        const fills = [...first, ...second];
        const m = await journalFrom(fills);
        const rows = await m.store.listSyncedTrades("user-1", "AB1234");
        const one = rows.find((r) => Number(r.exit_price) === 110)!;
        await m.store.updateSyncedTrade("user-1", one.external_id, { exit_price: 111, pnl: 110 });
        // Whatever order the database lists them in, the answer is the same.
        const key = `user-1|${one.external_id}`;
        const held = m.trades.get(key)!;
        m.trades.delete(key);
        m.trades.set(key, held);

        const r = await check(m, fills);
        expect(r.counts.differences).toBe(1);
        expect(r.matched).toBe(1);
        expect(r.differences[0].statement.exitPrice).toBe(110);
        expect(r.differences[0].journal.exitPrice).toBe(111);
    });

    it("pairs a trade whose size differs and says it is the quantity", async () => {
        const fills = roundTrip("RELIANCE", 10, 100, 110);
        const m = await journalFrom(fills);
        const [row] = await m.store.listSyncedTrades("user-1", "AB1234");
        await m.store.updateSyncedTrade("user-1", row.external_id, { quantity: 6, pnl: 60 }); // a fill was missed
        const r = await check(m, fills);
        expect(r.differences).toHaveLength(1);
        expect(r.differences[0].what).toEqual(["quantity", "profit and loss"]);
        expect(r.missingInJournal).toEqual([]);
        expect(r.extraInJournal).toEqual([]);
    });

    it("reports a trade the journal lacks", async () => {
        const fills = [...roundTrip("RELIANCE", 10, 100, 110), ...roundTrip("INFY", 5, 1500, 1490)];
        const r = await check(await journalFrom(roundTrip("RELIANCE", 10, 100, 110).map((f, i) => ({ ...f, executionId: fills[i].executionId }))), fills);
        expect(r.counts).toEqual({ differences: 0, missingInJournal: 1, extraInJournal: 0 });
        expect(r.missingInJournal[0]).toMatchObject({ asset: "INFY", side: "buy", quantity: 5, grossPnl: -50 });
        expect(r.totals.difference).toBe(50); // the journal is 50 better than the statement, because it lacks a loss
    });

    it("reports a trade the journal has that the statement doesn't", async () => {
        const fills = roundTrip("RELIANCE", 10, 100, 110);
        const m = await journalFrom([...fills, ...roundTrip("INFY", 5, 1500, 1490)]);
        const r = await check(m, fills);
        expect(r.counts).toEqual({ differences: 0, missingInJournal: 0, extraInJournal: 1 });
        expect(r.extraInJournal[0]).toMatchObject({ asset: "INFY" });
    });

    it("lists only the first batch but counts them all", async () => {
        const fills = Array.from({ length: SHOWN + 7 }, (_, i) => roundTrip(`SYM${String(i).padStart(3, "0")}`, 1, 100, 101)).flat();
        const r = await check(await journalFrom([]), fills);
        expect(r.counts.missingInJournal).toBe(0); // nothing synced at all: see below
        const m = await journalFrom(roundTrip("OTHER", 1, 100, 101, DAY));
        const wide = await check(m, fills);
        expect(wide.counts.missingInJournal).toBe(SHOWN + 7);
        expect(wide.missingInJournal).toHaveLength(SHOWN);
    });
});

describe("what it can't compare, and says so", () => {
    it("leaves out days from before the sync had any data, rather than calling them missing", async () => {
        const early = roundTrip("RELIANCE", 10, 100, 110, "2026-01-02");
        const later = roundTrip("INFY", 5, 1500, 1490, "2026-01-06");
        const m = await journalFrom(later); // the sync only started on the 6th
        const r = await check(m, [...early, ...later]);

        expect(r.notCompared.beforeSync).toBe(1);
        expect(r.missingInJournal).toEqual([]);
        expect(r.matched).toBe(1);
        expect(r.window).toMatchObject({ from: "2026-01-06", to: "2026-01-06" });
        expect(r.file).toMatchObject({ from: "2026-01-02", to: "2026-01-06", trades: 2 });
    });

    it("says nothing could be compared when the sync has no data for the customer yet", async () => {
        const r = await check(memoryStore(), roundTrip("RELIANCE", 10, 100, 110));
        expect(r.window).toEqual({ from: null, to: null, statementTrades: 0, journalTrades: 0 });
        expect(r.notCompared.beforeSync).toBe(1);
        expect(r.matched).toBe(0);
        expect(r.missingInJournal).toEqual([]);
    });

    it("counts a position carried in from before the statement, instead of calling the trade extra", async () => {
        // Bought on the 2nd and sold on the 6th; the statement only covers the 6th onwards.
        const all = [fill({ symbol: "ITC", product: "CNC", side: "buy", quantity: 10, price: 400, tradedAt: at("2026-01-02") }), fill({ symbol: "ITC", product: "CNC", side: "sell", quantity: 10, price: 410, tradedAt: at("2026-01-06") })];
        const statement = [...all.slice(1), ...roundTrip("INFY", 5, 1500, 1490, "2026-01-06")];
        const m = await journalFrom([...all, ...roundTrip("INFY", 5, 1500, 1490, "2026-01-06")]);
        const r = await check(m, statement);

        expect(r.notCompared.carriedIn).toBe(1);
        expect(r.extraInJournal).toEqual([]);
        expect(r.matched).toBe(1); // the INFY trade
    });

    it("counts a journal trade still going after the statement's last day", async () => {
        const all = [fill({ symbol: "ITC", product: "NRML", segment: "NSEFO", side: "buy", quantity: 10, price: 400, tradedAt: at("2026-01-05") }), fill({ symbol: "ITC", product: "NRML", segment: "NSEFO", side: "sell", quantity: 10, price: 410, tradedAt: at("2026-01-09") })];
        const m = await journalFrom([...all, ...roundTrip("INFY", 5, 1500, 1490, "2026-01-05")]);
        const r = await check(m, [all[0], ...roundTrip("INFY", 5, 1500, 1490, "2026-01-05")]); // a statement that stops on the 5th
        expect(r.notCompared.continuesAfter).toBe(1);
        expect(r.extraInJournal).toEqual([]);
        expect(r.matched).toBe(1);
    });

    it("leaves out hand-entered trades, which the sync didn't make", async () => {
        const fills = roundTrip("RELIANCE", 10, 100, 110);
        const m = await journalFrom(fills);
        m.trades.set("user-1|manual", { user_id: "user-1", source: "manual", external_id: null, asset: "SBIN", date: DAY, exit_date: DAY, buy_sell: "buy", quantity: 1, entry_price: 1, exit_price: 2, pnl: 1 });
        expect((await check(m, fills)).extraInJournal).toEqual([]);
    });
});

describe("a file that isn't this customer's statement", () => {
    it("is refused, as it is for a backfill", async () => {
        const csv = Buffer.from("Client Code,Date,Symbol,Side,Qty,Price\nZZ9999,2026-01-05,SBIN,Buy,1,1");
        await expect(checkStatement(memoryStore().store, link(), csv, "csv")).rejects.toBeInstanceOf(BackfillFileError);
        await expect(checkStatement(memoryStore().store, link(), Buffer.from("name,email\nA,b"), "csv")).rejects.toThrow(/doesn't look like a tradebook/);
    });

    it("keeps only this customer's rows from a report that covers several", async () => {
        const mine = roundTrip("RELIANCE", 10, 100, 110);
        const m = await journalFrom(mine);
        const csv = Buffer.from(
            ["Client Code,Trade Date,Trade Time,Symbol,Side,Qty,Price,Product"]
                .concat(mine.map((f) => `AB1234,${f.tradedAt.slice(0, 10)},${f.tradedAt.slice(11, 19)},${f.symbol},${f.side},${f.quantity},${f.price},MIS`))
                .concat(["CD5678,2026-01-05,09:30:00,SBIN,Buy,99,50,MIS", "CD5678,2026-01-05,10:30:00,SBIN,Sell,99,55,MIS"])
                .join("\n"),
        );
        const r = await checkStatement(m.store, link(), csv, "csv");
        expect(r.file.otherClientRows).toBe(2);
        expect(r.matched).toBe(1);
        expect(r.missingInJournal).toEqual([]);
    });
});
