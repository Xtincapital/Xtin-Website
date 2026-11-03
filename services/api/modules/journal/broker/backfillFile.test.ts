import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { BackfillFileError, readBackfillFile } from "./backfillFile.js";
import { memoryStore } from "./memoryStore.testutil.js";
import type { BrokerLink } from "./store.js";

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

const read = (csv: string, l = link(), store = memoryStore().store) => readBackfillFile(store, l, Buffer.from(csv.trim()), "csv");

const FILE = `
symbol,isin,trade_date,exchange,segment,series,trade_type,auction,quantity,price,trade_id,order_id,order_execution_time
RELIANCE,INE002A01018,2026-01-05,NSE,EQ,EQ,buy,false,10,1250.50,1001,o1,2026-01-05T09:20:11
RELIANCE,INE002A01018,2026-01-05,NSE,EQ,EQ,sell,false,10,1262.00,1002,o2,2026-01-05T10:05:40
INFY,INE009A01021,2026-01-06,NSE,EQ,EQ,buy,false,5,1500,1003,o3,2026-01-06T11:00:00
`;

describe("reading a tradebook as history", () => {
    it("gives the customer's executions, with ids that say where they came from", async () => {
        const file = await read(FILE);
        expect(file.executions).toBe(3);
        expect(file.fills).toHaveLength(3);
        expect(file.fills.map((f) => f.executionId)).toEqual(["bf:1001", "bf:1002", "bf:1003"]);
        expect(file.fills.every((f) => f.clientCode === "AB1234")).toBe(true);
        expect(file).toMatchObject({ skippedRows: 0, otherClientRows: 0, leftOutDays: [], from: "2026-01-05", to: "2026-01-06" });
    });

    it("makes the same ids when the same file is read again, so nothing is added twice", async () => {
        const [a, b] = [await read(FILE), await read(FILE)];
        expect(b.fills.map((f) => f.executionId)).toEqual(a.fills.map((f) => f.executionId));
    });

    it("makes stable ids from the details when the file has no trade ids, telling identical executions apart", async () => {
        const noIds = `
Date,Time,Symbol,Side,Qty,Price,Product
2026-01-05,09:20:00,SBIN,Buy,10,100,MIS
2026-01-05,09:20:00,SBIN,Buy,10,100,MIS
2026-01-05,09:50:00,SBIN,Sell,20,102,MIS
`;
        const first = await read(noIds);
        const ids = first.fills.map((f) => f.executionId);
        expect(new Set(ids).size).toBe(3); // the two identical purchases are still two
        expect(ids.every((id) => /^bf:[0-9a-f]{16}$/.test(id))).toBe(true);
        expect((await read(noIds)).fills.map((f) => f.executionId)).toEqual(ids);
        // A different file that repeats one of the rows gives that row the same id.
        const overlap = await read(`
Date,Time,Symbol,Side,Qty,Price,Product
2026-01-05,09:50:00,SBIN,Sell,20,102,MIS
2026-01-07,09:20:00,SBIN,Buy,1,100,MIS
`);
        expect(overlap.fills[0].executionId).toBe(ids[2]);
    });

    it("doesn't trust trade ids that repeat, and uses content ids instead", async () => {
        const file = await read(`
Date,Symbol,Side,Qty,Price,Trade ID,Product
2026-01-05,SBIN,Buy,10,100,777,MIS
2026-01-05,SBIN,Sell,10,102,777,MIS
`);
        expect(file.fills).toHaveLength(2);
        expect(file.fills.every((f) => /^bf:[0-9a-f]{16}$/.test(f.executionId))).toBe(true);
    });

    it("counts rows it couldn't read", async () => {
        const file = await read(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,Buy,10,100,MIS
2026-01-05,SBIN,Hold,10,100,MIS
not a date,SBIN,Buy,10,100,MIS
`);
        expect(file).toMatchObject({ executions: 1, skippedRows: 2 });
    });

    it("reads an Excel file", async () => {
        const sheet = XLSX.utils.aoa_to_sheet([
            ["Trade Date", "Trade Time", "Scrip", "Buy/Sell", "Qty", "Price", "Product"],
            [new Date(Date.UTC(2026, 0, 5)), "09:20:00", "SBIN", "BUY", 10, 100, "MIS"],
        ]);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Tradebook");
        const file = await readBackfillFile(memoryStore().store, link(), XLSX.write(book, { type: "buffer", bookType: "xlsx", cellDates: true }), "excel");
        expect(file.executions).toBe(1);
        expect(file.from).toBe("2026-01-05");
    });
});

describe("days the live sync already holds", () => {
    it("leaves those days alone, so nothing is counted twice", async () => {
        const { store } = memoryStore();
        // The live sync has a trade on the 5th, with the broker's own id and a time to the millisecond.
        await store.saveFills(link(), [
            { executionId: "210513139", clientCode: "AB1234", symbol: "RELIANCE", segment: "NSECM", instrumentId: null, product: "MIS", side: "buy", quantity: 10, price: 1250.5, charges: null, tradedAt: "2026-01-05T09:20:11.072+05:30" },
        ]);
        const file = await read(FILE, link(), store);

        expect(file.leftOutDays).toEqual(["2026-01-05"]);
        expect(file.fills.map((f) => f.symbol)).toEqual(["INFY"]); // only the 6th is new
        expect(file.executions).toBe(3); // what the file held
        expect(file).toMatchObject({ from: "2026-01-06", to: "2026-01-06" });
    });

    it("reads the day on the Indian clock", async () => {
        const { store } = memoryStore();
        // 03:00 IST on the 6th is 21:30 UTC on the 5th: still the 6th for the customer.
        await store.saveFills(link(), [{ executionId: "x", clientCode: "AB1234", symbol: "MCX", segment: "MCXFO", instrumentId: null, product: "NRML", side: "buy", quantity: 1, price: 1, charges: null, tradedAt: "2026-01-05T21:30:00Z" }]);
        expect((await read(FILE, link(), store)).leftOutDays).toEqual(["2026-01-06"]);
    });

    it("fills a day the sync missed", async () => {
        const { store } = memoryStore();
        await store.saveFills(link(), [{ executionId: "x", clientCode: "AB1234", symbol: "X", segment: "NSECM", instrumentId: null, product: "MIS", side: "buy", quantity: 1, price: 1, charges: null, tradedAt: "2026-01-07T10:00:00+05:30" }]);
        const file = await read(FILE, link(), store);
        expect(file.leftOutDays).toEqual([]);
        expect(file.fills).toHaveLength(3);
    });
});

describe("whose file it is", () => {
    const MANY = `
Client Code,Date,Symbol,Side,Qty,Price,Product
AB1234,2026-01-05,SBIN,Buy,10,100,MIS
CD5678,2026-01-05,SBIN,Buy,99,100,MIS
ab1234,2026-01-05,SBIN,Sell,10,105,MIS
EF9999,2026-01-05,ITC,Sell,5,400,CNC
`;

    it("keeps only this customer's rows from a report that covers several clients", async () => {
        const file = await read(MANY);
        expect(file.executions).toBe(2);
        expect(file.otherClientRows).toBe(2);
        expect(file.fills.map((f) => [f.side, f.quantity])).toEqual([["buy", 10], ["sell", 10]]); // client code matched whatever the case
    });

    it("gives a customer's rows the same ids whether or not other clients are in the file", async () => {
        const all = await read(MANY);
        const alone = await read(`
Client Code,Date,Symbol,Side,Qty,Price,Product
AB1234,2026-01-05,SBIN,Buy,10,100,MIS
ab1234,2026-01-05,SBIN,Sell,10,105,MIS
`);
        expect(alone.fills.map((f) => f.executionId)).toEqual(all.fills.map((f) => f.executionId));
    });

    it("keeps ids stable even when another client has an identical execution in the same file", async () => {
        // The same date, symbol, side, quantity and price for two clients: counting repeats must be per client.
        const shared = await read(`
Client Code,Date,Symbol,Side,Qty,Price,Product
CD5678,2026-01-05,SBIN,Buy,10,100,MIS
AB1234,2026-01-05,SBIN,Buy,10,100,MIS
`);
        const alone = await read(`
Client Code,Date,Symbol,Side,Qty,Price,Product
AB1234,2026-01-05,SBIN,Buy,10,100,MIS
`);
        expect(shared.fills.map((f) => f.executionId)).toEqual(alone.fills.map((f) => f.executionId));
    });

    it("refuses another customer's file", async () => {
        const err = await read(MANY, link("ZZ0001")).catch((e) => e);
        expect(err).toBeInstanceOf(BackfillFileError);
        expect(err.message).toContain("no trades for client ZZ0001");
        expect(err.message).toContain("AB1234");
        expect(err.message).toContain("CD5678");
    });

    it("says 'and others' rather than listing every client", async () => {
        const many = `Client Code,Date,Symbol,Side,Qty,Price\n${["A1", "B2", "C3", "D4", "E5"].map((c) => `${c},2026-01-05,SBIN,Buy,1,1`).join("\n")}`;
        expect((await read(many, link("ZZ0001")).catch((e) => e)).message).toContain("and others");
    });

    it("accepts a file with no client column, since a tradebook usually belongs to one client", async () => {
        expect((await read(FILE)).executions).toBe(3);
    });

    it("matches a client code with an underscore or hyphen exactly", async () => {
        const file = await read(`Client Code,Date,Symbol,Side,Qty,Price\nAB_12,2026-01-05,SBIN,Buy,1,1\nABX12,2026-01-05,SBIN,Buy,1,1`, link("AB_12"));
        expect(file.executions).toBe(1);
    });
});

describe("files that aren't a usable tradebook", () => {
    it.each([
        ["a list of finished trades", "Date,Asset,Side,Qty,Entry Price,Exit Price\n2026-01-05,SBIN,Buy,10,100,105", /doesn't look like a tradebook/],
        ["something unrelated", "name,email\nAsha,asha@example.com", /doesn't look like a tradebook/],
        ["nothing at all", "", /doesn't look like a tradebook/],
        ["a tradebook with no readable rows", "Date,Symbol,Side,Qty,Price\nnot a date,SBIN,Buy,10,100", /No executions could be read/],
    ])("rejects %s", async (_label, csv, message) => {
        const err = await readBackfillFile(memoryStore().store, link(), Buffer.from(csv), "csv").catch((e) => e);
        expect(err).toBeInstanceOf(BackfillFileError);
        expect(err.message).toMatch(message);
    });

    it("rejects an Excel file that isn't one", async () => {
        const err = await readBackfillFile(memoryStore().store, link(), Buffer.from("PK nonsense"), "excel").catch((e) => e);
        expect(err).toBeInstanceOf(BackfillFileError);
    });
});
