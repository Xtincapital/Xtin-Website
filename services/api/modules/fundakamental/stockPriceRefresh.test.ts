import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const listActiveStocks = vi.fn();
const updateStockPrice = vi.fn();
const getNewestStockUpdate = vi.fn();
const getLiveQuote = vi.fn();

vi.mock("./stocks.repository.js", () => ({ listActiveStocks, updateStockPrice, getNewestStockUpdate }));
vi.mock("./stockDataService.js", () => ({ getLiveQuote }));

const { startPriceRefresh, resetPriceRefreshState, marketOf, yahooSymbol } = await import("./stockPriceRefresh.js");

const quote = (price: number) => ({ price, change: 1, change_percent: 0.5, volume: 100 });
const run = (opts: Partial<Parameters<typeof startPriceRefresh>[0]> = {}) => {
    const r = startPriceRefresh({ source: "test", delayMs: 0, minGapMs: 0, log: () => {}, ...opts });
    if ("reason" in r) throw new Error(r.reason);
    return r.done;
};

describe("price refresh", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetPriceRefreshState();
        updateStockPrice.mockResolvedValue({ error: null });
    });

    it("writes each live quote to its row", async () => {
        listActiveStocks.mockResolvedValue({ data: [{ ticker: "INFY.NS", market: "india" }, { ticker: "AAPL", market: "us" }], error: null });
        getLiveQuote.mockImplementation(async (t: string) => quote(t === "AAPL" ? 230 : 1020.5));
        const result = await run();
        expect(result).toMatchObject({ total: 2, updated: 2, failed: 0, aborted: false });
        expect(updateStockPrice).toHaveBeenCalledWith("INFY.NS", { price: 1020.5, change: 1, change_percent: 0.5, volume: 100 });
        expect(updateStockPrice).toHaveBeenCalledWith("AAPL", { price: 230, change: 1, change_percent: 0.5, volume: 100 });
    });

    it("only refreshes the requested market", async () => {
        listActiveStocks.mockResolvedValue({ data: [{ ticker: "INFY.NS", market: null }, { ticker: "AAPL", market: "us" }], error: null });
        getLiveQuote.mockResolvedValue(quote(10));
        await run({ market: "us" });
        expect(getLiveQuote).toHaveBeenCalledTimes(1);
        expect(getLiveQuote).toHaveBeenCalledWith("AAPL");
    });

    it("never writes a price when there is no live quote", async () => {
        listActiveStocks.mockResolvedValue({ data: [{ ticker: "TCS.NS", market: "india" }], error: null });
        getLiveQuote.mockResolvedValue(null);
        const result = await run();
        expect(result).toMatchObject({ updated: 0, failed: 1 });
        expect(updateStockPrice).not.toHaveBeenCalled();
    });

    it("stops early when Yahoo keeps refusing", async () => {
        listActiveStocks.mockResolvedValue({ data: Array.from({ length: 30 }, (_, i) => ({ ticker: `S${i}`, market: "us" })), error: null });
        getLiveQuote.mockResolvedValue(null);
        const result = await run();
        expect(result).toMatchObject({ aborted: true, failed: 8 });
        expect(getLiveQuote).toHaveBeenCalledTimes(8);
    });

    it("a failure in the middle doesn't stop the run", async () => {
        listActiveStocks.mockResolvedValue({ data: [{ ticker: "A", market: "us" }, { ticker: "B", market: "us" }, { ticker: "C", market: "us" }], error: null });
        getLiveQuote.mockImplementation(async (t: string) => (t === "B" ? null : quote(5)));
        expect(await run()).toMatchObject({ updated: 2, failed: 1, aborted: false });
    });

    it("refuses a second run while one is in progress", async () => {
        let release!: () => void;
        listActiveStocks.mockReturnValue(new Promise((r) => (release = () => r({ data: [], error: null }))));
        const first = run();
        const second = startPriceRefresh({ source: "again", delayMs: 0, minGapMs: 0, log: () => {} });
        expect(second).toMatchObject({ started: false });
        release();
        await first;
    });

    it("refuses a run right after another finished (default 30 minute gap)", async () => {
        listActiveStocks.mockResolvedValue({ data: [], error: null });
        await run();
        expect(startPriceRefresh({ source: "soon", log: () => {} })).toMatchObject({ started: false });
    });

    it("reports a database error instead of throwing", async () => {
        listActiveStocks.mockResolvedValue({ data: null, error: new Error("db down") });
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(await run()).toBeNull();
        spy.mockRestore();
    });
});

describe("symbols", () => {
    it("guesses market from the suffix when the column is empty", () => {
        expect(marketOf({ ticker: "INFY.NS" })).toBe("india");
        expect(marketOf({ ticker: "AAPL" })).toBe("us");
        expect(marketOf({ ticker: "TCS", market: "india" })).toBe("india");
    });
    it("adds .NS for Indian stocks saved without it", () => {
        expect(yahooSymbol({ ticker: "TCS", market: "india" })).toBe("TCS.NS");
        expect(yahooSymbol({ ticker: "INFY.NS", market: "india" })).toBe("INFY.NS");
        expect(yahooSymbol({ ticker: "AAPL", market: "us" })).toBe("AAPL");
    });
});

describe("trigger endpoint", () => {
    const original = process.env.CRON_SECRET_TOKEN;
    afterEach(() => {
        if (original === undefined) delete process.env.CRON_SECRET_TOKEN;
        else process.env.CRON_SECRET_TOKEN = original;
    });

    const call = async (query: Record<string, string>, headers: Record<string, string> = {}) => {
        vi.doMock("./stocks.repository.js", () => ({ listActiveStocks, updateStockPrice, getNewestStockUpdate, getStockByTicker: vi.fn(), upsertStock: vi.fn(), searchStocksInDb: vi.fn(), queryStocksForScreener: vi.fn(), getSavedScreens: vi.fn(), insertSavedScreen: vi.fn(), getScreeningCache: vi.fn(), upsertScreeningCache: vi.fn() }));
        const { triggerStockRefresh } = await import("./stocks.controller.js");
        const res: any = { statusCode: 0, body: null, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; } };
        await triggerStockRefresh({ query, headers }, res);
        return res;
    };

    it("is closed when CRON_SECRET_TOKEN is not set", async () => {
        delete process.env.CRON_SECRET_TOKEN;
        expect((await call({ token: "anything" })).statusCode).toBe(503);
    });

    it("rejects a wrong or missing token", async () => {
        process.env.CRON_SECRET_TOKEN = "s3cret";
        expect((await call({ token: "nope" })).statusCode).toBe(401);
        expect((await call({})).statusCode).toBe(401);
    });

    it("starts a refresh with the right token, from the query or the header", async () => {
        process.env.CRON_SECRET_TOKEN = "s3cret";
        listActiveStocks.mockResolvedValue({ data: [], error: null });
        resetPriceRefreshState();
        expect((await call({ token: "s3cret" })).statusCode).toBe(202);
        await new Promise((r) => setTimeout(r, 20)); // let the background run finish before resetting
        resetPriceRefreshState();
        expect((await call({}, { "x-cron-token": "s3cret" })).statusCode).toBe(202);
    });

    it("rejects an unknown market", async () => {
        process.env.CRON_SECRET_TOKEN = "s3cret";
        expect((await call({ token: "s3cret", market: "mars" })).statusCode).toBe(400);
    });
});
