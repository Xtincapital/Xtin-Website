// Same trade added twice, or uploaded again: refused / flagged (2026-10-11).
import { describe, it, expect, vi, beforeEach } from "vitest";

const existingRows = vi.hoisted(() => [] as any[]);
const inserted = vi.hoisted(() => [] as any[]);
vi.mock("./trades.repository.js", () => ({
    getTradeKeysInRange: vi.fn(async () => existingRows),
    insertTrade: vi.fn(async (row: any) => {
        inserted.push(row);
        return { data: [{ id: "new", ...row }], error: null };
    }),
    getTradesByUser: vi.fn(),
    getTradeById: vi.fn(),
    updateTrade: vi.fn(),
    deleteTrade: vi.fn(),
    deleteAllTrades: vi.fn(),
}));

const { tradeKey, markDuplicates } = await import("./tradeDuplicates.js");
const { createTrade } = await import("./trades.controller.js");

const trade = { date: "2026-10-05", asset: "INFY", market: "Equity", buy_sell: "buy", quantity: 10, entry_price: 1500, exit_price: 1520, entry_time: "09:30" };

const call = async (body: unknown) => {
    const res: any = { statusCode: 0, body: null, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; } };
    await createTrade({ body, user: { authId: "u1" } }, res);
    return res;
};

beforeEach(() => {
    existingRows.length = 0;
    inserted.length = 0;
});

describe("tradeKey", () => {
    it("ignores case, spacing, number formatting and seconds", () => {
        expect(tradeKey(trade)).toBe(tradeKey({ ...trade, asset: " infy ", quantity: "10.0", entry_price: "1500.00", entry_time: "9:30:00" }));
    });

    it("tells apart different sides, quantities, prices and times", () => {
        for (const change of [{ buy_sell: "sell" }, { quantity: 11 }, { exit_price: 1521 }, { entry_time: "10:30" }, { date: "2026-10-06" }]) {
            expect(tradeKey({ ...trade, ...change })).not.toBe(tradeKey(trade));
        }
    });
});

describe("adding a trade", () => {
    it("refuses one that's already in the journal", async () => {
        existingRows.push({ id: "t1", ...trade, entry_time: "09:30:00" });
        const res = await call(trade);
        expect(res.statusCode).toBe(409);
        expect(res.body).toMatchObject({ code: "DUPLICATE_TRADE", existing_id: "t1" });
        expect(res.body.error).toMatch(/already in your journal/);
        expect(inserted).toHaveLength(0);
    });

    it("saves it when confirmed as a separate trade", async () => {
        existingRows.push({ id: "t1", ...trade });
        const res = await call({ ...trade, allow_duplicate: true });
        expect(res.statusCode).toBe(201);
        expect(inserted[0]).not.toHaveProperty("allow_duplicate");
    });

    it("saves a new trade normally", async () => {
        existingRows.push({ id: "t1", ...trade, quantity: 5 });
        expect((await call(trade)).statusCode).toBe(201);
    });
});

describe("uploading trades", () => {
    it("marks rows already in the journal and rows repeated in the file", () => {
        const existing = new Map([[tradeKey(trade), "t1"]]);
        const other = { ...trade, asset: "TCS" };
        const marked = markDuplicates([trade, other, { ...other }], existing);
        expect(marked.map((m) => m.duplicate)).toEqual(["journal", undefined, "file"]);
    });
});
