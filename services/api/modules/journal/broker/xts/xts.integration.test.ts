import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { createXtsAdapter } from "./adapter.js";
import { syncLink, syncLinks } from "../syncService.js";
import { memoryStore } from "../memoryStore.testutil.js";
import type { BrokerLink } from "../store.js";

// The XTS adapter and the whole sync, over real HTTP: a small server behaves as
// the Interactive docs describe, and can be told to misbehave once (expire the
// token, rate-limit, drop the connection, stall, send an HTML error page).
// Real fetch, real sockets, real timeouts. Only the waiting between retries is
// shortened.

const NOW = Date.parse("2026-09-02T10:00:00Z"); // 15:30 IST on 2 September
const DAY = "02-09-2026";
const ts = (hhmm: string) => `${DAY} ${hhmm.replace(":", ".")}.00.000`;

let n = 0;
const fillRow = (symbol: string, segment: string, product: string, side: "Buy" | "Sell", qty: number, price: number, hhmm: string, over: Record<string, unknown> = {}) => ({
    LoginID: "DEAL1",
    ClientID: "AB1234",
    AppOrderID: `order-${n}`,
    ExchangeSegment: segment,
    ExchangeInstrumentID: 1000 + n,
    TradingSymbol: symbol,
    OrderSide: side,
    ProductType: product,
    OrderStatus: "Filled",
    CumulativeQuantity: qty,
    LeavesQuantity: 0,
    LastTradedPrice: price,
    LastTradedQuantity: qty,
    ExecutionID: String(210000000 + n++),
    ExecutionReportIndex: 3,
    ExchangeTransactTime: ts(hhmm),
    LastExecutionTransactTime: `${DAY} ${hhmm.replace(":", ".")}.04.072`,
    ...over,
});

// A day of trades whose results are easy to work out by hand.
const dayOfTrades = () => {
    n = 0;
    return [
        // RELIANCE: bought 10 @100 and 10 @102 (average 101), sold 15 @105 and 5 @101 (average 104): 20 x 3 = +60
        fillRow("RELIANCE", "NSECM", "MIS", "Buy", 10, 100, "09:20"),
        fillRow("RELIANCE", "NSECM", "MIS", "Buy", 10, 102, "09:30"),
        fillRow("RELIANCE", "NSECM", "MIS", "Sell", 15, 105, "10:00"),
        fillRow("RELIANCE", "NSECM", "MIS", "Sell", 5, 101, "10:10"),
        // NIFTY weekly call, sold 75 @150 and bought back @120: 75 x 30 = +2250
        fillRow("NIFTY26N1024500CE", "NSEFO", "NRML", "Sell", 75, 150, "11:00"),
        fillRow("NIFTY26N1024500CE", "NSEFO", "NRML", "Buy", 75, 120, "11:30"),
        // INFY: bought 10 @1500, sold 15 @1510 (closes the long for +100, opens a short of 5), bought 5 @1505 back: +25
        fillRow("INFY", "NSECM", "MIS", "Buy", 10, 1500, "12:00"),
        fillRow("INFY", "NSECM", "MIS", "Sell", 15, 1510, "12:30"),
        fillRow("INFY", "NSECM", "MIS", "Buy", 5, 1505, "13:00"),
        // TCS delivery bought and still held: nothing to report yet
        fillRow("TCS", "NSECM", "CNC", "Buy", 5, 3900, "14:00"),
        // An order that never traded
        { ...fillRow("WIPRO", "NSECM", "MIS", "Buy", 10, 0, "14:30"), OrderStatus: "New", LastTradedQuantity: 0, LastTradedPrice: 0, ExecutionID: "" },
        // Another client's trade, in case the server ignores clientID
        fillRow("SBIN", "NSECM", "MIS", "Buy", 1, 800, "14:40", { ClientID: "CD5678" }),
    ];
};

type Fault = "expire" | "rate" | "drop" | "html" | "slow" | "badjson";

class FakeXts {
    server!: http.Server;
    url = "";
    faults: Fault[] = [];
    logins = 0;
    tradeCalls: Array<{ url: string; auth: string | undefined }> = [];
    profileCalls: Array<{ url: string; auth: string | undefined }> = [];
    validToken: string | null = null;
    rows = dayOfTrades();

    async start() {
        this.server = http.createServer((req, res) => this.handle(req, res));
        await new Promise<void>((r) => this.server.listen(0, "127.0.0.1", r));
        this.url = `http://127.0.0.1:${(this.server.address() as AddressInfo).port}/interactive`;
    }
    async stop() {
        this.server.closeAllConnections();
        await new Promise<void>((r) => this.server.close(() => r()));
    }
    reset() {
        this.faults = [];
        this.logins = 0;
        this.tradeCalls = [];
        this.profileCalls = [];
        this.validToken = null;
        this.rows = dayOfTrades();
    }

    private json(res: http.ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
        res.writeHead(status, { "content-type": "application/json", ...headers });
        res.end(JSON.stringify(body));
    }

    private handle(req: http.IncomingMessage, res: http.ServerResponse) {
        const url = new URL(req.url ?? "/", "http://x");
        if (req.method === "POST" && url.pathname === "/interactive/user/session") {
            let raw = "";
            req.on("data", (c) => (raw += c));
            req.on("end", () => {
                const body = JSON.parse(raw || "{}");
                if (body.appKey !== "APPKEY123" || body.secretKey !== "SECRET456") {
                    return this.json(res, 400, { type: "error", code: "e-user-0001", description: "Invalid appKey or secretKey" });
                }
                this.logins += 1;
                this.validToken = `TOKEN-${this.logins}`;
                this.json(res, 200, { type: "success", code: "s-user-0001", description: "Valid User.", result: { token: this.validToken, userID: "DEAL1", isInvestorClient: false, clientCodes: ["AB1234", "CD5678"] } });
            });
            return;
        }
        if (req.method === "GET" && url.pathname === "/interactive/user/profile") {
            this.profileCalls.push({ url: req.url ?? "", auth: req.headers.authorization });
            if (!req.headers.authorization || req.headers.authorization !== this.validToken) {
                return this.json(res, 401, { type: "error", code: "e-session-0001", description: "Invalid token" });
            }
            return this.json(res, 200, { type: "success", code: "s-user-0002", description: "Success profile", result: { ClientId: url.searchParams.get("clientID"), ClientName: "Asha Verma", PAN: "ABCDE1234F" } });
        }
        if (req.method === "GET" && url.pathname === "/interactive/orders/trades") {
            const auth = req.headers.authorization;
            this.tradeCalls.push({ url: req.url ?? "", auth });
            const fault = this.faults.shift();
            if (fault === "expire") {
                this.validToken = null;
                return this.json(res, 401, { type: "error", code: "e-session-0002", description: "Token expired, login again" });
            }
            if (fault === "rate") return this.json(res, 429, { type: "error", code: "e-limit", description: "Too many requests" }, { "retry-after": "2" });
            if (fault === "drop") return void req.socket.destroy();
            if (fault === "html") {
                res.writeHead(502, { "content-type": "text/html" });
                return void res.end("<html><body>Bad gateway</body></html>");
            }
            if (fault === "badjson") {
                res.writeHead(200, { "content-type": "application/json" });
                return void res.end('{"type":"success","result":[');
            }
            const respond = () => {
                if (!auth || auth !== this.validToken) return this.json(res, 401, { type: "error", code: "e-session-0001", description: "Invalid token" });
                this.json(res, 200, { type: "success", code: "s-tradeBook-0001", description: "Success trade book", result: this.rows });
            };
            if (fault === "slow") return void setTimeout(respond, 600);
            return respond();
        }
        this.json(res, 404, { type: "error", code: "e-404", description: "Not found" });
    }
}

const xts = new FakeXts();
beforeAll(() => xts.start());
afterAll(() => xts.stop());
beforeEach(() => xts.reset());

const link = (): BrokerLink => ({
    id: "link-1",
    user_id: "user-1",
    broker: "xts",
    client_code: "AB1234",
    status: "active",
    consent_version: "draft-1",
    consent_at: "2026-09-01T00:00:00Z",
    verified_at: "2026-09-01T00:00:00Z",
    verification_method: "test",
    opening_positions: [],
    last_synced_at: null,
    last_sync_status: null,
    last_sync_error: null,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
});

function adapter(over: { timeoutMs?: number } = {}) {
    const waits: number[] = [];
    const a = createXtsAdapter(
        { baseUrl: xts.url, appKey: "APPKEY123", secretKey: "SECRET456", hostLookup: null },
        {
            now: () => NOW,
            minIntervalMs: 0,
            timeoutMs: over.timeoutMs ?? 5000,
            // Record how long it was asked to wait, but only really wait a moment.
            sleep: async (ms) => {
                waits.push(ms);
                await new Promise((r) => setTimeout(r, Math.min(ms, 10)));
            },
        },
    );
    return { a, waits };
}

const summary = (trades: Map<string, Record<string, unknown>>) =>
    [...trades.values()]
        .map((t) => `${t.asset} ${t.buy_sell} ${t.quantity} ${t.entry_price}->${t.exit_price} = ${t.pnl}`)
        .sort();

const EXPECTED = ["INFY buy 10 1500->1510 = 100", "INFY sell 5 1510->1505 = 25", "NIFTY sell 75 150->120 = 2250", "RELIANCE buy 20 101->104 = 60"];

describe("a day's sync over real HTTP", () => {
    it("turns the broker's day into the right journal trades", async () => {
        const { a } = adapter();
        const mem = memoryStore();
        const result = await syncLink(a, mem.store, link());

        expect(summary(mem.trades)).toEqual(EXPECTED);
        expect(result).toMatchObject({ fetched: 11, foreign: 1, newFills: 10, closedTrades: 4, insertedTrades: 4, openPositions: 1 }); // TCS is held
        expect(xts.logins).toBe(1);
        expect(xts.tradeCalls).toEqual([{ url: "/interactive/orders/trades?clientID=AB1234", auth: "TOKEN-1" }]);

        const nifty = [...mem.trades.values()].find((t) => t.asset === "NIFTY")!;
        expect(nifty).toMatchObject({ date: "2026-09-02", entry_time: "11:00", exit_time: "11:30", market: "Options", strike_price: 24500, option_type: "call", contract: "NIFTY26N1024500CE", days_to_expiry: 69, type: "Intraday", source: "xts" });
        expect([...mem.fills.values()].every((f) => f.clientCode === "AB1234")).toBe(true); // the other client's trade never got in
    });

    it("adds nothing on a second run and reuses the login", async () => {
        const { a } = adapter();
        const mem = memoryStore();
        await syncLink(a, mem.store, link());
        const again = await syncLink(a, mem.store, link());

        expect(again).toMatchObject({ newFills: 0, insertedTrades: 0, alreadyInJournal: 4 });
        expect(mem.trades.size).toBe(4);
        expect(xts.logins).toBe(1);
    });

    it("picks up a trade that arrives later in the day without disturbing the earlier ones", async () => {
        const { a } = adapter();
        const mem = memoryStore();
        const early = xts.rows.slice(0, 6); // RELIANCE and NIFTY only
        xts.rows = early;
        await syncLink(a, mem.store, link());
        expect(mem.trades.size).toBe(2);
        const ids = [...mem.trades.keys()];

        xts.rows = dayOfTrades();
        const later = await syncLink(a, mem.store, link());
        expect(later).toMatchObject({ insertedTrades: 2, alreadyInJournal: 2 });
        expect(summary(mem.trades)).toEqual(EXPECTED);
        for (const id of ids) expect(mem.trades.has(id)).toBe(true);
    });
});

describe("the broker's name for a client, over real HTTP", () => {
    it("fetches the name, after logging in, and nothing else", async () => {
        const { a } = adapter();
        const result = await a.getClientProfile!("ab1234");
        expect(result).toEqual({ name: "Asha Verma" });
        expect(xts.profileCalls).toEqual([{ url: "/interactive/user/profile?clientID=AB1234", auth: "TOKEN-1" }]);
        expect(xts.logins).toBe(1);
    });

    it("logs in again when the token has gone stale since the last call", async () => {
        const { a } = adapter();
        await a.getClientProfile!("AB1234");
        xts.validToken = null; // the server forgets the session
        expect(await a.getClientProfile!("AB1234")).toEqual({ name: "Asha Verma" });
        expect(xts.logins).toBe(2);
    });
});

describe("the connection test, over real HTTP", () => {
    it("settles the open questions from a real day, and flags that this server returns other clients' rows too", async () => {
        const { a } = adapter();
        const report = await a.diagnose!("AB1234");
        const byName = Object.fromEntries(report.steps.map((s) => [s.name, s]));

        expect(byName["Log in"].ok).toBe(true);
        expect(byName["Read today's trade book"].detail).toBe("12 rows came back.");
        expect(byName["Execution rows have every field we read"].ok).toBe(true);
        expect(byName["Execution times are in a format we read"].ok).toBe(true);
        expect(byName["Rows turn into fills"].ok).toBe(true);
        expect(byName["Fills pair into trades"].detail).toContain("4 completed trades");
        expect(byName["Read the client's profile"].ok).toBe(true);
        // The fake server includes a CD5678 row, as a server that ignored clientID would.
        expect(byName["Trade book is limited to the requested client (?clientID= works)"].ok).toBe(false);
        // And none of the day's actual values are in what it says.
        expect(JSON.stringify(report)).not.toMatch(/RELIANCE|INFY|NIFTY|Asha|ABCDE1234F|2100000/);
    });

    it("tests only the login when asked for no client", async () => {
        const { a } = adapter();
        const report = await a.diagnose!();
        expect(report.steps.map((s) => s.ok)).toEqual([true, true]);
        expect(xts.tradeCalls).toHaveLength(0);
    });
});

describe("when XTS misbehaves", () => {
    it("logs in again if the token expired mid-session", async () => {
        const { a } = adapter();
        const mem = memoryStore();
        await syncLink(a, mem.store, link());
        xts.faults = ["expire"];
        xts.tradeCalls = [];

        const result = await syncLink(a, mem.store, link());
        expect(result.insertedTrades).toBe(0);
        expect(xts.logins).toBe(2);
        expect(xts.tradeCalls.map((c) => c.auth)).toEqual(["TOKEN-1", "TOKEN-2"]);
    });

    it("waits as long as the server says when it is rate-limited, then succeeds", async () => {
        xts.faults = ["rate"];
        const { a, waits } = adapter();
        const mem = memoryStore();
        await syncLink(a, mem.store, link());
        expect(summary(mem.trades)).toEqual(EXPECTED);
        expect(waits).toContain(2000);
    });

    it("tries again after the connection is dropped", async () => {
        xts.faults = ["drop"];
        const { a } = adapter();
        const mem = memoryStore();
        await syncLink(a, mem.store, link());
        expect(summary(mem.trades)).toEqual(EXPECTED);
        expect(xts.tradeCalls).toHaveLength(2);
    });

    it("gives up on a stalled request after the timeout, then tries again", async () => {
        xts.faults = ["slow"];
        const { a } = adapter({ timeoutMs: 200 });
        const mem = memoryStore();
        const started = Date.now();
        await syncLink(a, mem.store, link());
        expect(summary(mem.trades)).toEqual(EXPECTED);
        expect(xts.tradeCalls).toHaveLength(2);
        expect(Date.now() - started).toBeLessThan(2000); // it did not wait out the whole stall
    });

    it("fails the sync, and stores nothing, on an HTML error page", async () => {
        xts.faults = ["html"];
        const { a } = adapter();
        const mem = memoryStore();
        const result = await syncLinks(a, mem.store, [link()]);

        expect(result).toMatchObject({ total: 1, synced: 0, failed: 1 });
        expect(mem.trades.size).toBe(0);
        expect(mem.fills.size).toBe(0);
        expect(mem.outcomes).toEqual([{ link: "link-1", outcome: { ok: false, error: expect.stringContaining("XTS") } }]);
    });

    it("fails the sync on a half-sent JSON body rather than using part of it", async () => {
        xts.faults = ["badjson"];
        const { a } = adapter();
        const mem = memoryStore();
        const result = await syncLinks(a, mem.store, [link()]);
        expect(result.failed).toBe(1);
        expect(mem.trades.size).toBe(0);
    });

    it("recovers on the next run after a failed one", async () => {
        const { a } = adapter();
        const mem = memoryStore();
        xts.faults = ["html"];
        expect((await syncLinks(a, mem.store, [link()])).failed).toBe(1);
        expect((await syncLinks(a, mem.store, [link()])).synced).toBe(1);
        expect(summary(mem.trades)).toEqual(EXPECTED);
    });

    it("reports wrong keys plainly, without echoing them", async () => {
        const wrong = createXtsAdapter({ baseUrl: xts.url, appKey: "NOT-THE-KEY", secretKey: "NOT-THE-SECRET", hostLookup: null }, { minIntervalMs: 0, now: () => NOW });
        const mem = memoryStore();
        const result = await syncLinks(wrong, mem.store, [link()]);
        expect(result.failed).toBe(1);
        const message = (mem.outcomes[0].outcome as { error: string }).error;
        expect(message).toContain("Invalid appKey or secretKey");
        expect(message).not.toContain("NOT-THE-KEY");
        expect(message).not.toContain("NOT-THE-SECRET");
    });

    it("fails clearly when the server can't be reached at all", async () => {
        const down = createXtsAdapter({ baseUrl: "http://127.0.0.1:1/interactive", appKey: "a", secretKey: "b", hostLookup: null }, { minIntervalMs: 0, now: () => NOW });
        await expect(down.getTodaysFills("AB1234")).rejects.toThrow(/Could not reach/);
    });
});

describe("what the broker sends that we can't trust", () => {
    it("fails the sync, not just one row, when a filled order has no usable price", async () => {
        xts.rows = [...dayOfTrades(), fillRow("HDFCBANK", "NSECM", "MIS", "Buy", 5, 0, "14:50", { LastTradedPrice: "n/a" })];
        const { a } = adapter();
        const mem = memoryStore();
        const result = await syncLinks(a, mem.store, [link()]);
        expect(result.failed).toBe(1);
        expect(mem.trades.size).toBe(0); // nothing half-imported
    });

    it("refuses a date it can't place on today's trading day", async () => {
        xts.rows = [fillRow("INFY", "NSECM", "MIS", "Buy", 1, 100, "09:20", { LastExecutionTransactTime: "03-04-2026 09.20.00.000", ExchangeTransactTime: undefined })];
        const { a } = adapter();
        await expect(a.getTodaysFills("AB1234")).rejects.toThrow(/execution time/);
    });
});
