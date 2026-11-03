import { describe, it, expect, vi } from "vitest";
import * as XLSX from "xlsx";
import { parseCsvImport, parseExcelImport, pdfTableTrades, rowsToImportTrades, type ImportStats } from "./importParsers.js";

// The import endpoint checks uploads against the journal; here the journal is empty.
vi.mock("./tradeDuplicates.js", async (original) => ({ ...(await original<typeof import("./tradeDuplicates.js")>()), existingTradeKeys: async () => new Map() }));

// Tradebook files: one row per execution, paired into trades by the same engine
// the broker sync uses. Every expected number below is worked out by hand.

const csv = (text: string, stats: ImportStats = { skipped: 0 }) => ({ trades: parseCsvImport(Buffer.from(text.trim()), stats), stats });

describe("a Zerodha-style tradebook", () => {
    const FILE = `
symbol,isin,trade_date,exchange,segment,series,trade_type,auction,quantity,price,trade_id,order_id,order_execution_time
RELIANCE,INE002A01018,2026-01-05,NSE,EQ,EQ,buy,false,10,1250.50,1001,o1,2026-01-05T09:20:11
RELIANCE,INE002A01018,2026-01-05,NSE,EQ,EQ,sell,false,10,1262.00,1002,o2,2026-01-05T10:05:40
NIFTY2611324500CE,,2026-01-05,NFO,FO,,sell,false,75,150,1003,o3,2026-01-05T11:00:00
NIFTY2611324500CE,,2026-01-05,NFO,FO,,buy,false,75,120,1004,o4,2026-01-05T11:30:00
TCS,INE467B01029,2026-01-05,NSE,EQ,EQ,buy,false,5,3900,1005,o5,2026-01-05T14:00:00
INFY,INE009A01021,2026-01-05,NSE,EQ,EQ,sell,false,20,1500,1006,o6,2026-01-05T15:00:00
`;

    it("pairs the executions into trades, in the shape the preview shows", () => {
        const { trades } = csv(FILE);
        expect(trades).toHaveLength(2);
        expect(trades[0]).toMatchObject({
            date: "2026-01-05",
            exit_date: "2026-01-05",
            entry_time: "09:20",
            exit_time: "10:05",
            type: "Intraday",
            market: "Equity",
            asset: "RELIANCE",
            currency: "INR",
            quantity: 10,
            entry_price: 1250.5,
            exit_price: 1262,
            brokerage: 0,
            buy_sell: "buy",
            pnl: 115,
            strike_price: null,
            option_type: null,
            contract: null,
            tags: ["imported"],
            notes: "Imported from tradebook",
        });
    });

    it("reads the option from its symbol, and works out the days to expiry", () => {
        const [, nifty] = csv(FILE).trades;
        expect(nifty).toMatchObject({
            asset: "NIFTY",
            market: "Options",
            contract: "NIFTY2611324500CE",
            buy_sell: "sell",
            quantity: 75,
            entry_price: 150,
            exit_price: 120,
            pnl: 2250,
            strike_price: 24500,
            option_type: "call",
            days_to_expiry: 8, // 5 Jan to 13 Jan
            entry_time: "11:00",
            exit_time: "11:30",
        });
    });

    it("says what it left out: a position still open and a sale with no purchase in the file", () => {
        const { stats } = csv(FILE);
        expect(stats.skipped).toBe(0);
        expect(stats.fills).toEqual({ fills: 6, trades: 2, open: 1, unmatched: 1 }); // TCS still held; INFY sold from earlier holdings
    });
});

describe("the tradebook template in the import dialog", () => {
    // Keep this text in step with TRADEBOOK_TEMPLATE_CSV in ImportTradesDialog.tsx.
    it("is read by the parser into the trade it describes", () => {
        const { trades, stats } = csv(`
Date,Time,Symbol,Buy/Sell,Quantity,Price,Product,Brokerage
2025-01-15,09:20:00,RELIANCE,Buy,50,2450.5,MIS,20
2025-01-15,10:05:00,RELIANCE,Sell,50,2478.25,MIS,20
`);
        expect(stats.fills).toEqual({ fills: 2, trades: 1, open: 0, unmatched: 0 });
        // 50 x 27.75 = 1387.50, less 40 of brokerage.
        expect(trades[0]).toMatchObject({ asset: "RELIANCE", quantity: 50, entry_price: 2450.5, exit_price: 2478.25, brokerage: 40, pnl: 1347.5, entry_time: "09:20", exit_time: "10:05" });
    });
});

describe("another broker's layout", () => {
    it("reads dd-mm-yyyy dates, B/S, a rate column and brokerage on each execution", () => {
        const { trades } = csv(`
Trade Date,Trade Time,Scrip Name,Buy/Sell,Quantity,Rate,Exchange,Product,Brokerage
05-01-2026,09:20:00,SBIN,B,100,800,NSE,MIS,10
05-01-2026,09:45:00,SBIN,S,40,805,NSE,MIS,5
05-01-2026,10:30:00,SBIN,S,60,810,NSE,MIS,8
`);
        expect(trades).toHaveLength(1);
        // Bought 100 at 800; sold 40 at 805 and 60 at 810 (average 808): 100 x 8 = 800, less 23 of brokerage.
        expect(trades[0]).toMatchObject({ date: "2026-01-05", quantity: 100, entry_price: 800, exit_price: 808, brokerage: 23, pnl: 777, entry_time: "09:20", exit_time: "10:30" });
    });

    it("reads negative quantities for sales", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,Buy,10,100,MIS
2026-01-05,SBIN,Sell,-10,105,MIS
`);
        expect(trades[0]).toMatchObject({ quantity: 10, pnl: 50 });
    });

    it("reads derivatives from the symbol when there are no exchange columns", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price
2026-01-05,NIFTY26NOV24500PE,Sell,100,120
2026-01-05,NIFTY26NOV24500PE,Buy,100,100
`);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ asset: "NIFTY", market: "Options", option_type: "put", strike_price: 24500, buy_sell: "sell", pnl: 2000 });
    });

    it("treats an options sale as a short even though cash-equity sales aren't, when no product is given", () => {
        const { trades, stats } = csv(`
Date,Symbol,Side,Qty,Price
2026-01-05,BANKNIFTY26NOVFUT,Sell,30,50000
2026-01-05,BANKNIFTY26NOVFUT,Buy,30,49900
`);
        expect(trades[0]).toMatchObject({ market: "Futures", buy_sell: "sell", pnl: 3000 });
        expect(stats.fills?.unmatched).toBe(0);
    });

    it("reads a derivative symbol as a derivative even if the exchange column just says NSE", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price,Exchange
2026-01-05,NIFTY26NOV24500CE,Buy,75,100,NSE
2026-01-05,NIFTY26NOV24500CE,Sell,75,110,NSE
`);
        expect(trades[0]).toMatchObject({ market: "Options", option_type: "call" });
    });
});

describe("what a file can't tell us", () => {
    it("honours the product column: intraday cash can be short, delivery can't", () => {
        const { trades, stats } = csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,SELL,10,100,MIS
2026-01-05,SBIN,BUY,10,98,MIS
2026-01-05,ITC,SELL,10,400,CNC
`);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ asset: "SBIN", buy_sell: "sell", pnl: 20 });
        expect(stats.fills).toEqual({ fills: 3, trades: 1, open: 0, unmatched: 1 });
    });

    it("reads the many ways a product is written", () => {
        const rows = (product: string) =>
            csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,SELL,10,100,${product}
2026-01-05,SBIN,BUY,10,98,${product}
`).trades.length;
        for (const intraday of ["MIS", "Intraday", "I"]) expect(rows(intraday), intraday).toBe(1);
        for (const delivery of ["CNC", "Delivery", "D"]) expect(rows(delivery), delivery).toBe(0);
        expect(rows("NRML")).toBe(1);
    });

    it("without a product, takes a cash sale with nothing before it for old holdings and leaves it out", () => {
        const { trades, stats } = csv(`
Date,Symbol,Side,Qty,Price
2026-01-05,ITC,Sell,10,400
2026-01-05,ITC,Buy,10,390
`);
        // The sale came first, and is taken to be shares bought earlier; the later purchase stays open.
        expect(trades).toEqual([]);
        expect(stats.fills).toEqual({ fills: 2, trades: 0, open: 1, unmatched: 1 });
    });

    it("pairs a purchase on one day with a sale on a later day", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price
2026-01-05,ITC,Buy,10,400
2026-01-06,ITC,Sell,10,410
`);
        expect(trades[0]).toMatchObject({ date: "2026-01-05", exit_date: "2026-01-06", type: null, pnl: 100 });
    });

    it("leaves times empty when the file has none, rather than inventing a midnight", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,Buy,10,100,MIS
2026-01-05,SBIN,Sell,10,105,MIS
`);
        expect(trades[0]).toMatchObject({ entry_time: null, exit_time: null, type: "Intraday", pnl: 50 });
    });

    it("reads the time out of a combined date-and-time column", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05 09:20:00,SBIN,Buy,10,100,MIS
2026-01-05 09:50:00,SBIN,Sell,10,105,MIS
`);
        expect(trades[0]).toMatchObject({ entry_time: "09:20", exit_time: "09:50" });
    });

    it("drops all times if even one row lacks one, since a half-timed file can't be ordered by time", () => {
        const { trades } = csv(`
Date,Time,Symbol,Side,Qty,Price,Product
2026-01-05,09:20:00,SBIN,Buy,10,100,MIS
2026-01-05,,SBIN,Sell,10,105,MIS
`);
        expect(trades[0]).toMatchObject({ entry_time: null, exit_time: null, pnl: 50 });
    });

    it("puts a newest-first file back in order, so a short isn't mistaken for a long", () => {
        const { trades } = csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-06,SBIN,Sell,10,95,MIS
2026-01-06,SBIN,Buy,10,90,MIS
2026-01-05,SBIN,Buy,10,100,MIS
2026-01-05,SBIN,Sell,10,110,MIS
`);
        // In order: on the 5th a short (sold 110, covered 100) and on the 6th a long (bought 90, sold 95).
        expect(trades.map((t) => [t.date, t.buy_sell, t.pnl])).toEqual([
            ["2026-01-05", "sell", 100],
            ["2026-01-06", "buy", 50],
        ]);
    });

    it("uses the file's trade ids to order same-time executions, when they are all there and all different", () => {
        const { trades } = csv(`
Date,Time,Symbol,Side,Qty,Price,Trade ID,Product
2026-01-05,09:20:00,SBIN,Sell,10,110,1002,MIS
2026-01-05,09:20:00,SBIN,Buy,10,100,1001,MIS
`);
        // Same second: id 1001 (the buy) is first, so this is a long that sold higher, not a short.
        expect(trades[0]).toMatchObject({ buy_sell: "buy", pnl: 100 });
    });

    it("doesn't trust trade ids that repeat, so no execution is dropped as a repeat", () => {
        const { trades, stats } = csv(`
Date,Symbol,Side,Qty,Price,Trade ID,Product
2026-01-05,SBIN,Buy,10,100,777,MIS
2026-01-05,SBIN,Buy,10,100,777,MIS
2026-01-05,SBIN,Sell,20,102,778,MIS
`);
        expect(stats.fills?.fills).toBe(3);
        expect(trades[0]).toMatchObject({ quantity: 20, entry_price: 100, exit_price: 102, pnl: 40 });
    });
});

describe("rows it can't read", () => {
    it("skips and counts them without stopping, ignoring blank lines", () => {
        const { trades, stats } = csv(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,Buy,10,100,MIS
2026-01-05,SBIN,Hold,10,100,MIS
2026-01-05,SBIN,Buy,0,100,MIS
2026-01-05,SBIN,Buy,10,,MIS
not a date,SBIN,Buy,10,100,MIS
2026-01-05,,Buy,10,100,MIS
,,,,,
2026-01-05,SBIN,Sell,10,101,MIS
`);
        expect(stats.skipped).toBe(5);
        expect(trades).toHaveLength(1);
        expect(trades[0].pnl).toBe(10);
    });

    it("returns nothing, with a summary, when no execution makes a finished trade", () => {
        const { trades, stats } = csv(`
Date,Symbol,Side,Qty,Price
2026-01-05,TCS,Buy,5,3900
`);
        expect(trades).toEqual([]);
        expect(stats.fills).toEqual({ fills: 1, trades: 0, open: 1, unmatched: 0 });
    });
});

describe("files that are not tradebooks are read as before", () => {
    it("reads the template the import dialog offers", () => {
        const { trades, stats } = csv(`
Date,Asset,Buy/Sell,Quantity,Entry Price,Exit Price,Brokerage,Strategy,Market,Currency,Notes
2025-01-15,RELIANCE,Buy,50,2450.5,2478.25,40,Breakout,Equity,INR,Sample row - replace me
2025-01-16,NIFTY 22500 CE,Sell,75,120,95,60,Iron Condor,Options,INR,
`);
        expect(trades).toHaveLength(2);
        expect(trades[0]).toMatchObject({ asset: "RELIANCE", entry_price: 2450.5, exit_price: 2478.25, strategy: "Breakout" });
        expect(stats.fills).toBeUndefined();
    });

    it("keeps a file with a Price and an Exit Price as finished trades", () => {
        const { trades, stats } = csv(`
Date,Asset,Side,Qty,Price,Exit Price
2026-01-05,SBIN,Buy,10,100,105
`);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ entry_price: 100, exit_price: 105, pnl: 50 });
        expect(stats.fills).toBeUndefined();
    });

    it("keeps a file with a Price and a P&L column as finished trades, back-working the exit", () => {
        const { trades, stats } = csv(`
Date,Asset,Side,Qty,Price,P&L
2026-01-05,SBIN,Buy,10,100,50
`);
        expect(trades[0]).toMatchObject({ entry_price: 100, exit_price: 105 });
        expect(stats.fills).toBeUndefined();
    });

    it("needs all of a symbol, a side, a quantity, a price and a date to treat a file as a tradebook", () => {
        for (const header of ["Symbol,Side,Qty,Price", "Date,Side,Qty,Price", "Date,Symbol,Qty,Price", "Date,Symbol,Side,Price", "Date,Symbol,Side,Qty"]) {
            const stats: ImportStats = { skipped: 0 };
            const cols = header.split(",");
            const row = cols.map((c) => ({ Date: "2026-01-05", Symbol: "SBIN", Side: "Buy", Qty: "10", Price: "100" })[c]).join(",");
            parseCsvImport(Buffer.from(`${header}\n${row}`), stats);
            expect(stats.fills, header).toBeUndefined();
        }
    });
});

describe("other file types", () => {
    it("reads an Excel tradebook, with real date cells and a separate time column", () => {
        const sheet = XLSX.utils.aoa_to_sheet([
            ["Trade Date", "Trade Time", "Scrip", "Buy/Sell", "Qty", "Price", "Product"],
            [new Date(Date.UTC(2026, 0, 5)), "09:20:00", "SBIN", "BUY", 10, 100, "MIS"],
            [new Date(Date.UTC(2026, 0, 5)), "09:50:00", "SBIN", "SELL", 10, 106.5, "MIS"],
        ]);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Tradebook");
        const stats: ImportStats = { skipped: 0 };
        const trades = parseExcelImport(XLSX.write(book, { type: "buffer", bookType: "xlsx", cellDates: true }), stats);

        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ date: "2026-01-05", entry_time: "09:20", exit_time: "09:50", entry_price: 100, exit_price: 106.5, pnl: 65 });
        expect(stats.fills).toEqual({ fills: 2, trades: 1, open: 0, unmatched: 0 });
    });

    it("reads the time out of an Excel date-and-time cell", () => {
        const sheet = XLSX.utils.aoa_to_sheet([
            ["Execution Time", "Symbol", "Side", "Quantity", "Price", "Product"],
            [new Date(Date.UTC(2026, 0, 5, 9, 20)), "SBIN", "Buy", 10, 100, "MIS"],
            [new Date(Date.UTC(2026, 0, 5, 9, 50)), "SBIN", "Sell", 10, 105, "MIS"],
        ]);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Sheet1");
        const [trade] = parseExcelImport(XLSX.write(book, { type: "buffer", bookType: "xlsx", cellDates: true }));
        expect(trade).toMatchObject({ entry_time: "09:20", exit_time: "09:50" });
    });

    it("reads a tradebook laid out as a table in a PDF", () => {
        const stats: ImportStats = { skipped: 0 };
        const trades = pdfTableTrades(
            ["Trade Date   Scrip   Buy/Sell   Qty   Price   Product", "2026-01-05   SBIN   BUY   10   100   MIS", "2026-01-05   SBIN   SELL   10   105   MIS"],
            stats,
        );
        expect(trades).toHaveLength(1);
        expect(trades[0].pnl).toBe(50);
        expect(stats.fills).toEqual({ fills: 2, trades: 1, open: 0, unmatched: 0 });
    });

    it("works through rowsToImportTrades with no stats object", () => {
        const trades = rowsToImportTrades([
            ["Date", "Symbol", "Side", "Qty", "Price", "Product"],
            ["2026-01-05", "SBIN", "Buy", 10, 100, "MIS"],
            ["2026-01-05", "SBIN", "Sell", 10, 105, "MIS"],
        ]);
        expect(trades).toHaveLength(1);
    });
});

describe("the import endpoint", () => {
    const post = async (text: string, fileType = "csv") => {
        const { importTrades } = await import("./import.controller.js");
        let status = 0;
        let body: any;
        const res = { status: (s: number) => ({ json: (b: unknown) => ((status = s), (body = b)) }) };
        await importTrades({ file: { buffer: Buffer.from(text.trim()) }, body: { file_type: fileType }, user: { authId: "u1" } } as any, res as any);
        return { status, body };
    };

    it("returns the trades with a summary of the tradebook", async () => {
        const { status, body } = await post(`
Date,Symbol,Side,Qty,Price,Product
2026-01-05,SBIN,Buy,10,100,MIS
2026-01-05,SBIN,Sell,10,105,MIS
2026-01-05,ITC,Buy,5,400,MIS
`);
        expect(status).toBe(200);
        expect(body).toMatchObject({ count: 1, skipped: 0, fills: { fills: 3, trades: 1, open: 1, unmatched: 0 }, file_type: "csv" });
        expect(body.trades[0]).toMatchObject({ asset: "SBIN", pnl: 50 });
    });

    it("sends no summary for an ordinary file", async () => {
        const { body } = await post(`
Date,Asset,Side,Quantity,Entry Price,Exit Price
2026-01-05,SBIN,Buy,10,100,105
`);
        expect(body).toMatchObject({ count: 1, fills: null });
    });

    it("flags a tradebook's repeated rows like any other file's", async () => {
        const { body } = await post(`
Date,Time,Symbol,Side,Qty,Price,Product
2026-01-05,09:20:00,SBIN,Buy,10,100,MIS
2026-01-05,09:50:00,SBIN,Sell,10,105,MIS
2026-01-06,09:20:00,SBIN,Buy,10,100,MIS
2026-01-06,09:50:00,SBIN,Sell,10,105,MIS
`);
        expect(body.count).toBe(2);
        expect(body.duplicates).toEqual({ journal: 0, file: 0 }); // different days, so not repeats
    });
});
