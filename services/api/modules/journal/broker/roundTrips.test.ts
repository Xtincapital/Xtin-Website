import { describe, it, expect } from "vitest";
import { pairFills } from "./roundTrips.js";
import type { BrokerFill } from "./types.js";

const at = (time: string, day = "2026-11-03") => `${day}T${time}:00+05:30`;

let next = 1;
const fill = (o: Partial<BrokerFill> & Pick<BrokerFill, "side" | "quantity" | "price" | "tradedAt">): BrokerFill => ({
    executionId: String(next++),
    clientCode: "C1",
    symbol: "RELIANCE",
    segment: "NSECM",
    instrumentId: 2885,
    product: "MIS",
    charges: null,
    ...o,
});

describe("pairFills", () => {
    it("pairs a buy and a later sell into one long trade", () => {
        const { trades, open } = pairFills([
            fill({ executionId: "101", side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
            fill({ executionId: "102", side: "sell", quantity: 10, price: 110, tradedAt: at("09:45") }),
        ]);
        expect(open).toEqual([]);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ side: "buy", quantity: 10, entryPrice: 100, exitPrice: 110, grossPnl: 100, netPnl: 100, fillCount: 2 });
        expect(trades[0].externalId).toBe("C1:NSECM:RELIANCE:MIS:101");
        expect(trades[0].openedAt).toBe(at("09:15"));
        expect(trades[0].closedAt).toBe(at("09:45"));
    });

    it("pairs a sell and a later buy into one short trade", () => {
        const { trades } = pairFills([
            fill({ side: "sell", quantity: 5, price: 200, tradedAt: at("10:00") }),
            fill({ side: "buy", quantity: 5, price: 190, tradedAt: at("10:30") }),
        ]);
        expect(trades[0]).toMatchObject({ side: "sell", entryPrice: 200, exitPrice: 190, grossPnl: 50 });
    });

    it("averages several entries into one trade", () => {
        const { trades } = pairFills([
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
            fill({ side: "buy", quantity: 10, price: 110, tradedAt: at("09:20") }),
            fill({ side: "sell", quantity: 20, price: 120, tradedAt: at("09:50") }),
        ]);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ quantity: 20, entryPrice: 105, exitPrice: 120, grossPnl: 300 });
    });

    it("averages several exits into one trade", () => {
        const { trades, open } = pairFills([
            fill({ side: "buy", quantity: 30, price: 100, tradedAt: at("09:15") }),
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("09:40") }),
            fill({ side: "sell", quantity: 20, price: 104, tradedAt: at("10:10") }),
        ]);
        expect(open).toEqual([]);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ quantity: 30, entryPrice: 100, exitPrice: 106, grossPnl: 180 });
    });

    it("keeps a partly closed position open and emits no trade yet", () => {
        const { trades, open } = pairFills([
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
            fill({ side: "sell", quantity: 4, price: 105, tradedAt: at("09:30") }),
        ]);
        expect(trades).toEqual([]);
        expect(open).toEqual([{ clientCode: "C1", symbol: "RELIANCE", segment: "NSECM", product: "MIS", side: "buy", quantity: 6, avgPrice: 100, openedAt: at("09:15") }]);
    });

    it("closes a position and opens the opposite one when a fill is larger than it", () => {
        const { trades, open } = pairFills([
            fill({ executionId: "1", side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
            fill({ executionId: "2", side: "sell", quantity: 15, price: 110, tradedAt: at("09:45") }),
            fill({ executionId: "3", side: "buy", quantity: 5, price: 105, tradedAt: at("10:15") }),
        ]);
        expect(open).toEqual([]);
        expect(trades).toHaveLength(2);
        expect(trades[0]).toMatchObject({ side: "buy", quantity: 10, entryPrice: 100, exitPrice: 110, grossPnl: 100 });
        expect(trades[1]).toMatchObject({ side: "sell", quantity: 5, entryPrice: 110, exitPrice: 105, grossPnl: 25 });
        expect(trades[1].externalId).toBe("C1:NSECM:RELIANCE:MIS:2");
    });

    it("splits a flipping fill's charges between the trade it closes and the one it opens", () => {
        const { trades } = pairFills([
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
            fill({ side: "sell", quantity: 15, price: 110, tradedAt: at("09:45"), charges: 15 }),
            fill({ side: "buy", quantity: 5, price: 105, tradedAt: at("10:15") }),
        ]);
        expect(trades[0].charges).toBe(10);
        expect(trades[1].charges).toBe(5);
    });

    it("subtracts entry and exit charges from the P&L", () => {
        const { trades } = pairFills([
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15"), charges: 5 }),
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("09:45"), charges: 7 }),
        ]);
        expect(trades[0]).toMatchObject({ charges: 12, grossPnl: 100, netPnl: 88 });
    });

    it("does not invent a short from a delivery sale it never saw bought", () => {
        const { trades, open, unmatched } = pairFills([fill({ executionId: "55", side: "sell", quantity: 20, price: 500, tradedAt: at("11:00"), product: "CNC" })]);
        expect(trades).toEqual([]);
        expect(open).toEqual([]);
        expect(unmatched).toEqual([{ executionId: "55", clientCode: "C1", symbol: "RELIANCE", quantity: 20, price: 500, tradedAt: at("11:00") }]);
    });

    it("reports only the excess of a delivery sale as unmatched", () => {
        const { trades, unmatched } = pairFills([
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15"), product: "CNC" }),
            fill({ executionId: "77", side: "sell", quantity: 25, price: 110, tradedAt: at("09:45"), product: "CNC" }),
        ]);
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ quantity: 10, grossPnl: 100 });
        expect(unmatched).toMatchObject([{ executionId: "77", quantity: 15 }]);
    });

    it("lets intraday and futures products go short", () => {
        const { trades, open } = pairFills([fill({ side: "sell", quantity: 75, price: 120, tradedAt: at("09:20"), product: "NRML", symbol: "NIFTY26NOV24500CE", segment: "NSEFO" })]);
        expect(trades).toEqual([]);
        expect(open[0]).toMatchObject({ side: "sell", quantity: 75 });
    });

    it("keeps products, instruments and clients apart", () => {
        const { trades, open } = pairFills([
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15"), product: "MIS" }),
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("09:45"), product: "NRML" }),
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("09:46"), symbol: "INFY" }),
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("09:47"), clientCode: "C2" }),
        ]);
        expect(trades).toEqual([]);
        expect(open).toHaveLength(4);
    });

    it("carries a position across days and keeps the first day as the trade's start", () => {
        const dayOne = [fill({ executionId: "201", side: "buy", quantity: 10, price: 100, tradedAt: at("15:00", "2026-11-03"), product: "NRML" })];
        const dayTwo = [fill({ executionId: "305", side: "sell", quantity: 10, price: 108, tradedAt: at("10:00", "2026-11-04"), product: "NRML" })];

        const first = pairFills(dayOne);
        expect(first.trades).toEqual([]);
        expect(first.open).toHaveLength(1);

        const second = pairFills([...dayOne, ...dayTwo]);
        expect(second.open).toEqual([]);
        expect(second.trades).toHaveLength(1);
        expect(second.trades[0].openedAt).toBe(at("15:00", "2026-11-03"));
        expect(second.trades[0].closedAt).toBe(at("10:00", "2026-11-04"));
        expect(second.trades[0].externalId).toBe("C1:NSECM:RELIANCE:NRML:201");
    });

    it("gives earlier trades the same id when more fills arrive later", () => {
        const base = [
            fill({ executionId: "1", side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
            fill({ executionId: "2", side: "sell", quantity: 10, price: 110, tradedAt: at("09:45") }),
        ];
        const more = [
            ...base,
            fill({ executionId: "3", side: "buy", quantity: 5, price: 90, tradedAt: at("11:00", "2026-11-04") }),
            fill({ executionId: "4", side: "sell", quantity: 5, price: 95, tradedAt: at("12:00", "2026-11-04") }),
        ];
        const a = pairFills(base).trades.map((t) => t.externalId);
        const b = pairFills(more).trades.map((t) => t.externalId);
        expect(b.slice(0, 1)).toEqual(a);
        expect(b).toHaveLength(2);
    });

    it("sorts fills by time whatever order they arrive in", () => {
        const { trades } = pairFills([
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: at("09:45") }),
            fill({ side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") }),
        ]);
        expect(trades).toHaveLength(1);
        expect(trades[0].side).toBe("buy");
    });

    it("orders same-instant fills by numeric execution id", () => {
        const t = at("09:15");
        const { trades } = pairFills([
            fill({ executionId: "10", side: "sell", quantity: 10, price: 101, tradedAt: t }),
            fill({ executionId: "9", side: "buy", quantity: 10, price: 100, tradedAt: t }),
        ]);
        expect(trades[0].side).toBe("buy"); // "9" before "10", not the string order
    });

    it("ignores an execution reported twice and fills it cannot use", () => {
        const buy = fill({ executionId: "1", side: "buy", quantity: 10, price: 100, tradedAt: at("09:15") });
        const result = pairFills([
            buy,
            { ...buy },
            fill({ side: "sell", quantity: 0, price: 110, tradedAt: at("09:30") }),
            fill({ side: "sell", quantity: 10, price: NaN, tradedAt: at("09:31") }),
            fill({ side: "sell", quantity: 10, price: 110, tradedAt: "not a time" }),
            fill({ executionId: "9", side: "sell", quantity: 10, price: 110, tradedAt: at("09:45") }),
        ]);
        expect(result.duplicates).toBe(1);
        expect(result.invalid).toBe(3);
        expect(result.trades).toHaveLength(1);
    });

    it("rounds P&L to paise", () => {
        const { trades } = pairFills([
            fill({ side: "buy", quantity: 3, price: 0.1, tradedAt: at("09:15") }),
            fill({ side: "sell", quantity: 3, price: 0.2, tradedAt: at("09:30") }),
        ]);
        expect(trades[0].grossPnl).toBe(0.3);
    });

    it("returns nothing for no fills", () => {
        expect(pairFills([])).toEqual({ trades: [], open: [], unmatched: [], duplicates: 0, invalid: 0 });
    });
});
