import { describe, it, expect, vi, afterEach } from "vitest";
import { createXtsAdapter } from "./adapter.js";
import { readXtsConfig } from "./config.js";
import { XtsError } from "./http.js";
import { parseXtsTimestamp, tradeRowToFill, XtsParseError } from "./mapper.js";
import { getBrokerAdapter, brokerSyncAvailable } from "../adapter.js";

// Everything here runs against responses written from Symphony's Interactive
// documentation, not a live server. A fake fetch answers from a script and
// records each request; a fake clock stands in for waiting.

interface Call {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
}
type Step = Response | Error;

function fakeXts(script: Step[]) {
    const calls: Call[] = [];
    const fetchImpl = async (url: any, init: any) => {
        calls.push({ method: init.method, url: String(url), headers: init.headers, body: init.body ? JSON.parse(init.body) : undefined });
        const next = script.shift();
        if (!next) throw new Error(`unexpected extra request to ${url}`);
        if (next instanceof Error) throw next;
        return next;
    };
    return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

function fakeClock(start = Date.parse("2026-09-02T10:00:00Z")) {
    let t = start;
    const sleeps: number[] = [];
    return {
        now: () => t,
        sleep: async (ms: number) => {
            sleeps.push(ms);
            t += ms;
        },
        advance: (ms: number) => {
            t += ms;
        },
        sleeps,
    };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

const BASE = "https://xts.broker.test/interactive";
const config = { baseUrl: BASE, appKey: "APPKEY123", secretKey: "SECRET456", hostLookup: null };

const loginOk = (over: Record<string, unknown> = {}) =>
    json({ type: "success", code: "s-user-0001", description: "Valid User.", result: { token: "TOKEN-A", userID: "DEAL1", isInvestorClient: false, clientCodes: ["AB1234", "CD5678"], ...over } });
const tradeBook = (rows: unknown[]) => json({ type: "success", code: "s-tradeBook-0001", description: "Success trade book", result: rows });

// A TradeBook row in the shape the docs show (the 02-09-2026 timestamps are theirs).
const row = (over: Record<string, unknown> = {}) => ({
    LoginID: "DEAL1",
    ClientID: "AB1234",
    AppOrderID: "18001262450000042762",
    ExchangeSegment: "NSECM",
    ExchangeInstrumentID: 2885,
    TradingSymbol: "RELIANCE",
    OrderSide: "Buy",
    OrderType: "Limit",
    ProductType: "MIS",
    OrderPrice: 1350,
    OrderStatus: "Filled",
    OrderAverageTradedPrice: "1308.4",
    CumulativeQuantity: 10,
    LeavesQuantity: 0,
    LastTradedPrice: 1308.4,
    LastTradedQuantity: 10,
    ExecutionID: "210513139",
    ExecutionReportIndex: 3,
    ExchangeTransactTime: "02-09-2026 12.58.04.000",
    LastExecutionTransactTime: "02-09-2026 12.58.04.072",
    ...over,
});

function make(script: Step[], cfg: any = config) {
    const clock = fakeClock();
    const xts = fakeXts(script);
    const adapter = createXtsAdapter(cfg, { fetch: xts.fetchImpl, sleep: clock.sleep, now: clock.now });
    return { adapter, clock, ...xts };
}

describe("login and session", () => {
    it("logs in once and sends the token as-is on every later request", async () => {
        const { adapter, calls } = make([loginOk(), tradeBook([]), tradeBook([])]);
        await adapter.getTodaysFills("AB1234");
        await adapter.getTodaysFills("AB1234");

        expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([`POST ${BASE}/user/session`, `GET ${BASE}/orders/trades?clientID=AB1234`, `GET ${BASE}/orders/trades?clientID=AB1234`]);
        expect(calls[0].body).toEqual({ appKey: "APPKEY123", secretKey: "SECRET456" });
        expect(calls[0].headers.Authorization).toBeUndefined();
        expect(calls[1].headers.Authorization).toBe("TOKEN-A"); // no "Bearer " prefix, as the docs show
    });

    it("lets simultaneous syncs share one login", async () => {
        const { adapter, calls } = make([loginOk(), tradeBook([]), tradeBook([])]);
        await Promise.all([adapter.getTodaysFills("AB1234"), adapter.getTodaysFills("CD5678")]);
        expect(calls.filter((c) => c.url.endsWith("/user/session"))).toHaveLength(1);
    });

    it("logs in again once the token is close to its 24 hours", async () => {
        const { adapter, calls, clock } = make([loginOk(), tradeBook([]), loginOk({ token: "TOKEN-B" }), tradeBook([])]);
        await adapter.getTodaysFills("AB1234");
        clock.advance(23 * 60 * 60 * 1000 + 1000);
        await adapter.getTodaysFills("AB1234");

        expect(calls.filter((c) => c.url.endsWith("/user/session"))).toHaveLength(2);
        expect(calls[3].headers.Authorization).toBe("TOKEN-B");
    });

    it("logs in again and retries once when the token is refused", async () => {
        const { adapter, calls } = make([
            loginOk(),
            json({ type: "error", code: "e-session-0001", description: "Invalid token" }, 401),
            loginOk({ token: "TOKEN-B" }),
            tradeBook([row()]),
        ]);
        const fills = await adapter.getTodaysFills("AB1234");

        expect(fills).toHaveLength(1);
        expect(calls.map((c) => c.headers.Authorization)).toEqual([undefined, "TOKEN-A", undefined, "TOKEN-B"]);
    });

    it("gives up if the token is refused again straight after logging in", async () => {
        const { adapter, calls } = make([
            loginOk(),
            json({ type: "error", description: "Invalid token" }, 401),
            loginOk({ token: "TOKEN-B" }),
            json({ type: "error", description: "Invalid token" }, 401),
        ]);
        await expect(adapter.getTodaysFills("AB1234")).rejects.toMatchObject({ name: "XtsError", status: 401 });
        expect(calls).toHaveLength(4); // not an endless login loop
    });

    it("uses the host lookup's address and unique key when configured", async () => {
        const cfg = { baseUrl: null, appKey: "APPKEY123", secretKey: "SECRET456", hostLookup: { url: "https://lookup.broker.test/hostlookup", accessPassword: "PW", version: "interactive_1.0.1" } };
        const { adapter, calls } = make(
            [
                json({ type: "success", code: "hostlookup", description: "Hostlookup successful", UniqueKey: "UK123", connectionString: "https://xts.broker.test/1interactive/", timeStamp: "0", remarks: "" }),
                loginOk(),
                tradeBook([]),
            ],
            cfg,
        );
        await adapter.getTodaysFills("AB1234");

        expect(calls[0]).toMatchObject({ method: "POST", url: "https://lookup.broker.test/hostlookup", body: { AccessPassword: "PW", version: "interactive_1.0.1" } });
        expect(calls[1]).toMatchObject({ url: "https://xts.broker.test/1interactive/user/session", body: { appKey: "APPKEY123", secretKey: "SECRET456", uniqueKey: "UK123" } });
        expect(calls[2].url).toBe("https://xts.broker.test/1interactive/orders/trades?clientID=AB1234");
    });

    it("fails clearly when the host lookup or login returns nothing usable", async () => {
        const cfg = { baseUrl: null, appKey: "A", secretKey: "S", hostLookup: { url: "https://lookup.broker.test/hostlookup", accessPassword: "PW", version: "v" } };
        await expect(make([json({ type: "success", code: "hostlookup" })], cfg).adapter.getTodaysFills("AB1234")).rejects.toThrow(/connection details/);
        await expect(make([json({ type: "success", result: { isInvestorClient: false } })]).adapter.getTodaysFills("AB1234")).rejects.toThrow(/no token/);
    });
});

describe("reading the trade book", () => {
    it("reads a dealer's client by clientID and keeps only real executions", async () => {
        const { adapter } = make([
            loginOk(),
            tradeBook([
                row(),
                row({ OrderSide: "SELL", LastTradedPrice: "1320.5", ExecutionID: "210513188", LastExecutionTransactTime: "02-09-2026 13.20.00.500" }),
                row({ OrderStatus: "New", LastTradedQuantity: 0, ExecutionID: "", LastExecutionTransactTime: undefined }),
            ]),
        ]);
        const fills = await adapter.getTodaysFills("ab1234");

        expect(fills).toHaveLength(2);
        expect(fills[0]).toMatchObject({
            executionId: "210513139",
            clientCode: "AB1234",
            symbol: "RELIANCE",
            segment: "NSECM",
            instrumentId: 2885,
            product: "MIS",
            side: "buy",
            quantity: 10,
            price: 1308.4,
            charges: null,
            tradedAt: "2026-09-02T12:58:04.072+05:30",
        });
        expect(fills[1]).toMatchObject({ side: "sell", price: 1320.5, tradedAt: "2026-09-02T13:20:00.500+05:30" });
    });

    it("returns nothing for an empty trade book", async () => {
        expect(await make([loginOk(), tradeBook([])]).adapter.getTodaysFills("AB1234")).toEqual([]);
        expect(await make([loginOk(), json({ type: "success", result: null })]).adapter.getTodaysFills("AB1234")).toEqual([]);
    });

    it("refuses a client code that isn't mapped to the login, without asking for its trades", async () => {
        const { adapter, calls } = make([loginOk()]);
        await expect(adapter.getTodaysFills("ZZ9999")).rejects.toThrow(/isn't mapped/);
        expect(calls).toHaveLength(1); // the login only
    });

    it("asks an investor login for its own trades, with no clientID", async () => {
        const { adapter, calls } = make([loginOk({ isInvestorClient: true, clientCodes: ["AB1234"] }), tradeBook([row({ ClientID: undefined })])]);
        const fills = await adapter.getTodaysFills("AB1234");

        expect(calls[1].url).toBe(`${BASE}/orders/trades`);
        expect(fills[0].clientCode).toBe("AB1234"); // the only client this login can see
    });

    it("won't tie a dealer's unlabelled row to a customer", async () => {
        const { adapter } = make([loginOk(), tradeBook([row({ ClientID: undefined })])]);
        await expect(adapter.getTodaysFills("AB1234")).rejects.toThrow(/no ClientID/);
    });

    it("hands back other clients' rows under their own code, for the sync to drop", async () => {
        const { adapter } = make([loginOk(), tradeBook([row({ ClientID: "cd5678" })])]);
        const fills = await adapter.getTodaysFills("AB1234");
        expect(fills[0].clientCode).toBe("CD5678");
    });

    it("rejects a trade book that isn't a list", async () => {
        await expect(make([loginOk(), json({ type: "success", result: { oops: true } })]).adapter.getTodaysFills("AB1234")).rejects.toThrow(/couldn't read/);
    });
});

describe("the broker's name for a client", () => {
    const profile = (over: Record<string, unknown> = {}) =>
        json({ type: "success", code: "s-user-0002", description: "Success profile", result: { ClientId: "AB1234", ClientName: "  Asha Verma ", PAN: "ABCDE1234F", IsInvestorClient: false, ClientBankInfoList: [{ AccountNumber: "123456789012" }], ...over } });

    it("asks for the client by clientID and passes on only the name", async () => {
        const { adapter, calls } = make([loginOk(), profile()]);
        const result = await adapter.getClientProfile!("ab1234");

        expect(calls[1]).toMatchObject({ method: "GET", url: `${BASE}/user/profile?clientID=AB1234`, headers: { Authorization: "TOKEN-A" } });
        expect(result).toEqual({ name: "Asha Verma" });
        // The profile also holds a PAN and bank details; none of it gets out.
        expect(JSON.stringify(result)).not.toMatch(/ABCDE1234F|123456789012/);
    });

    it("asks an investor login for its own profile, with no clientID", async () => {
        const { adapter, calls } = make([loginOk({ isInvestorClient: true, clientCodes: ["AB1234"] }), profile()]);
        await adapter.getClientProfile!("AB1234");
        expect(calls[1].url).toBe(`${BASE}/user/profile`);
    });

    it("reads the name from a one-item list too, and gives null when there isn't one", async () => {
        const listed = make([loginOk(), json({ type: "success", result: [{ ClientName: "Ravi Menon" }] })]);
        expect(await listed.adapter.getClientProfile!("AB1234")).toEqual({ name: "Ravi Menon" });

        for (const body of [{ ClientName: "" }, { ClientName: null }, { ClientName: undefined }, { ClientName: 42 }]) {
            expect(await make([loginOk(), profile(body)]).adapter.getClientProfile!("AB1234")).toEqual({ name: null });
        }
        expect(await make([loginOk(), json({ type: "success", result: null })]).adapter.getClientProfile!("AB1234")).toEqual({ name: null });
    });

    it("refuses a client code that isn't mapped to the login without asking for it", async () => {
        const { adapter, calls } = make([loginOk()]);
        await expect(adapter.getClientProfile!("ZZ9999")).rejects.toThrow(/isn't mapped/);
        expect(calls).toHaveLength(1);
    });

    it("logs in again if the token is refused, like the trade book does", async () => {
        const { adapter, calls } = make([loginOk(), json({ type: "error", description: "Invalid token" }, 401), loginOk({ token: "TOKEN-B" }), profile()]);
        expect(await adapter.getClientProfile!("AB1234")).toEqual({ name: "Asha Verma" });
        expect(calls.map((c) => c.headers.Authorization)).toEqual([undefined, "TOKEN-A", undefined, "TOKEN-B"]);
    });

    it("shares the login with the trade book", async () => {
        const { adapter, calls } = make([loginOk(), profile(), tradeBook([])]);
        await adapter.getClientProfile!("AB1234");
        await adapter.getTodaysFills("AB1234");
        expect(calls.filter((c) => c.url.endsWith("/user/session"))).toHaveLength(1);
    });
});

describe("the connection test", () => {
    const named = (report: { steps: Array<{ name: string; ok: boolean; detail: string }> }) => Object.fromEntries(report.steps.map((s) => [s.name, s]));
    const profileOk = () => json({ type: "success", result: { ClientId: "AB1234", ClientName: "Asha Verma", PAN: "ABCDE1234F" } });

    it("passes every step on a healthy day", async () => {
        const { adapter } = make([loginOk(), tradeBook([row(), row({ OrderSide: "Sell", ExecutionID: "210513188", LastExecutionTransactTime: "02-09-2026 13.20.00.500" })]), profileOk()]);
        const report = await adapter.diagnose!("AB1234");

        expect(report.steps.map((s) => s.name)).toEqual([
            "Log in",
            "Client code is visible to this login",
            "Read today's trade book",
            "Trade book is limited to the requested client (?clientID= works)",
            "Execution rows have every field we read",
            "Execution times are in a format we read",
            "Rows turn into fills",
            "Fills pair into trades",
            "Read the client's profile",
        ]);
        expect(report.steps.filter((s) => !s.ok)).toEqual([]);
        expect(named(report)["Execution times are in a format we read"].detail).toContain('"99-99-9999 99.99.99.999"');
        expect(named(report)["Fills pair into trades"].detail).toContain("1 completed trade");
    });

    it("never reports a customer's symbols, prices, names, ids or times", async () => {
        const { adapter } = make([loginOk(), tradeBook([row()]), profileOk()]);
        const text = JSON.stringify(await adapter.diagnose!("AB1234"));
        for (const secret of ["RELIANCE", "1308.4", "Asha", "Verma", "ABCDE1234F", "210513139", "12.58.04", "TOKEN-A", "APPKEY123", "SECRET456"]) expect(text).not.toContain(secret);
    });

    it("tests only the login when no client code is given", async () => {
        const { adapter, calls } = make([loginOk()]);
        const report = await adapter.diagnose!();
        expect(report.steps.map((s) => s.name)).toEqual(["Log in", "Client code"]);
        expect(calls).toHaveLength(1);
    });

    it("stops at a login that fails, saying why", async () => {
        const { adapter, calls } = make([json({ type: "error", code: "e-user-0001", description: "Invalid appKey or secretKey" }, 400)]);
        const report = await adapter.diagnose!("AB1234");
        expect(report.steps).toEqual([{ name: "Log in", ok: false, detail: "XTS: Invalid appKey or secretKey" }]);
        expect(calls).toHaveLength(1);
    });

    it("stops at a client code the login can't see", async () => {
        const { adapter, calls } = make([loginOk()]);
        const report = await adapter.diagnose!("ZZ9999");
        expect(named(report)["Client code is visible to this login"]).toMatchObject({ ok: false });
        expect(calls).toHaveLength(1);
    });

    it("notices when the server ignores clientID and sends other clients' trades", async () => {
        const { adapter } = make([loginOk(), tradeBook([row(), row({ ClientID: "CD5678", ExecutionID: "2" })]), profileOk()]);
        const check = named(await adapter.diagnose!("AB1234"))["Trade book is limited to the requested client (?clientID= works)"];
        expect(check.ok).toBe(false);
        expect(check.detail).toContain("1 belong to other clients");
    });

    it("lists the fields that are missing from execution rows", async () => {
        const { adapter } = make([loginOk(), tradeBook([row({ ExecutionID: undefined }), row({ ExecutionID: "2", LastTradedPrice: undefined, ProductType: " " })]), profileOk()]);
        const check = named(await adapter.diagnose!("AB1234"))["Execution rows have every field we read"];
        expect(check.ok).toBe(false);
        expect(check.detail).toContain("ExecutionID (1 of 2 rows)");
        expect(check.detail).toContain("LastTradedPrice (1 of 2 rows)");
        expect(check.detail).toContain("ProductType (1 of 2 rows)");
    });

    it("flags times it can't read, and carries on to the rest", async () => {
        const { adapter } = make([loginOk(), tradeBook([row({ LastExecutionTransactTime: "yesterday" })]), profileOk()]);
        const report = await adapter.diagnose!("AB1234");
        const steps = named(report);
        expect(steps["Execution times are in a format we read"]).toMatchObject({ ok: false });
        expect(steps["Rows turn into fills"]).toMatchObject({ ok: false });
        expect(steps["Rows turn into fills"].detail).toContain("TradeBook row 1");
        expect(steps["Read the client's profile"]).toMatchObject({ ok: true }); // still checked
    });

    it("flags a date that fits neither today nor yesterday in either order", async () => {
        const { adapter } = make([loginOk(), tradeBook([row({ LastExecutionTransactTime: "03-04-2026 09.20.00.000" })]), profileOk()]);
        expect(named(await adapter.diagnose!("AB1234"))["Execution times are in a format we read"].ok).toBe(false);
    });

    it("says an empty trade book can't be judged, and still checks the profile", async () => {
        const { adapter } = make([loginOk(), tradeBook([]), profileOk()]);
        const report = await adapter.diagnose!("AB1234");
        expect(named(report)["Check the trade rows"]).toMatchObject({ ok: true });
        expect(named(report)["Check the trade rows"].detail).toContain("Run this again on a day the client has traded");
        expect(named(report)["Read the client's profile"].ok).toBe(true);
    });

    it("reports a trade book that can't be read, and still tries the profile", async () => {
        const { adapter } = make([loginOk(), json({ type: "error", description: "Order book unavailable" }, 500), profileOk()]);
        const steps = named(await adapter.diagnose!("AB1234"));
        expect(steps["Read today's trade book"]).toEqual({ name: "Read today's trade book", ok: false, detail: "XTS: Order book unavailable" });
        expect(steps["Read the client's profile"].ok).toBe(true);
        expect(steps["Check the trade rows"]).toBeUndefined();
    });

    it("reports a profile without a name", async () => {
        const { adapter } = make([loginOk(), tradeBook([]), json({ type: "success", result: { ClientId: "AB1234" } })]);
        expect(named(await adapter.diagnose!("AB1234"))["Read the client's profile"]).toMatchObject({ ok: false });
    });

    it("skips the clientID check for an investor login, which has no clients to choose between", async () => {
        const { adapter } = make([loginOk({ isInvestorClient: true, clientCodes: ["AB1234"] }), tradeBook([row()]), profileOk()]);
        const report = await adapter.diagnose!("AB1234");
        expect(report.steps.map((s) => s.name)).not.toContain("Trade book is limited to the requested client (?clientID= works)");
        expect(report.steps.filter((s) => !s.ok)).toEqual([]);
    });
});

describe("requests and errors", () => {
    it("waits a second between requests", async () => {
        const { adapter, clock } = make([loginOk(), tradeBook([]), tradeBook([])]);
        await adapter.getTodaysFills("AB1234");
        await adapter.getTodaysFills("AB1234");
        expect(clock.sleeps).toEqual([1000, 1000]); // before the first trade-book call, and before the second
    });

    it("waits as long as Retry-After says on a 429, then carries on", async () => {
        const { adapter, clock } = make([loginOk(), json({ type: "error", description: "Too many requests" }, 429, { "retry-after": "3" }), tradeBook([row()])]);
        const fills = await adapter.getTodaysFills("AB1234");
        expect(fills).toHaveLength(1);
        expect(clock.sleeps).toEqual([1000, 3000]);
    });

    it("backs off and eventually gives up on repeated 429s", async () => {
        const tooMany = () => json({ type: "error", code: "e-limit", description: "Too many requests" }, 429);
        const { adapter, calls, clock } = make([loginOk(), tooMany(), tooMany(), tooMany(), tooMany()]);
        await expect(adapter.getTodaysFills("AB1234")).rejects.toMatchObject({ status: 429 });
        expect(calls).toHaveLength(5); // the login, then the first try and three retries
        expect(clock.sleeps).toEqual([1000, 2000, 4000, 8000]);
    });

    it("repeats a read after a network failure, but never repeats a login", async () => {
        const read = make([loginOk(), new Error("socket hang up"), tradeBook([row()])]);
        expect(await read.adapter.getTodaysFills("AB1234")).toHaveLength(1);

        const login = make([new Error("socket hang up")]);
        await expect(login.adapter.getTodaysFills("AB1234")).rejects.toThrow(/Could not reach/);
        expect(login.calls).toHaveLength(1);
    });

    it("reports the broker's own error code and message", async () => {
        const { adapter } = make([loginOk(), json({ type: "error", code: "e-orders-0007", description: "Order book unavailable" }, 400)]);
        await expect(adapter.getTodaysFills("AB1234")).rejects.toMatchObject({ name: "XtsError", status: 400, code: "e-orders-0007", message: "XTS: Order book unavailable" });
    });

    it("treats a type:error body as a failure even on HTTP 200", async () => {
        const { adapter } = make([json({ type: "error", code: "e-user-0001", description: "Invalid user" })]);
        await expect(adapter.getTodaysFills("AB1234")).rejects.toBeInstanceOf(XtsError);
    });

    it("never puts the keys or the token in an error", async () => {
        const failures = [
            make([json({ type: "error", code: "e-user-0001", description: "Invalid credentials" }, 400)]),
            make([loginOk(), json({ type: "error", description: "Server busy" }, 500), json({ type: "error", description: "Server busy" }, 500)]),
        ];
        for (const f of failures) {
            const err = await f.adapter.getTodaysFills("AB1234").catch((e) => e);
            expect(err).toBeInstanceOf(XtsError);
            for (const secret of ["APPKEY123", "SECRET456", "TOKEN-A"]) expect(String(err.message)).not.toContain(secret);
        }
    });

    it("says so when the answer isn't JSON", async () => {
        const { adapter } = make([new Response("<html>Gateway</html>", { status: 200 })]);
        await expect(adapter.getTodaysFills("AB1234")).rejects.toThrow(/couldn't read/);
    });
});

describe("tradeRowToFill", () => {
    const ctx = { requestedClient: "AB1234", singleClient: false, expectedDates: ["2026-09-02", "2026-09-01"] };

    it("skips an order that has not traded", () => {
        expect(tradeRowToFill(row({ OrderStatus: "New", LastTradedQuantity: 0 }), ctx, 0)).toBeNull();
        expect(tradeRowToFill(row({ OrderStatus: "Cancelled", LastTradedQuantity: undefined }), ctx, 0)).toBeNull();
    });

    it("accepts numbers sent as text and either letter case for the side", () => {
        const fill = tradeRowToFill(row({ LastTradedQuantity: "75", LastTradedPrice: "120.05", OrderSide: "SELL" }), ctx, 0);
        expect(fill).toMatchObject({ quantity: 75, price: 120.05, side: "sell" });
    });

    it.each([
        ["a filled order with no traded quantity", { LastTradedQuantity: 0 }, /no traded quantity/],
        ["a partly filled order with no traded quantity", { OrderStatus: "PartiallyFilled", LastTradedQuantity: undefined }, /no traded quantity/],
        ["a fill with no ExecutionID", { ExecutionID: " " }, /no ExecutionID/],
        ["a fill with no symbol", { TradingSymbol: "" }, /no TradingSymbol/],
        ["a fill with no price", { LastTradedPrice: undefined }, /LastTradedPrice/],
        ["a fill with a negative price", { LastTradedPrice: -1 }, /LastTradedPrice/],
        ["a fill with an unknown side", { OrderSide: "Hold" }, /OrderSide/],
        ["a fill with no time", { LastExecutionTransactTime: undefined, ExchangeTransactTime: undefined }, /execution time/],
        ["a fill with an unreadable time", { LastExecutionTransactTime: "yesterday" }, /execution time/],
    ])("fails loudly on %s", (_label, over, message) => {
        expect(() => tradeRowToFill(row(over), ctx, 4)).toThrow(XtsParseError);
        expect(() => tradeRowToFill(row(over), ctx, 4)).toThrow(message);
        expect(() => tradeRowToFill(row(over), ctx, 4)).toThrow(/^TradeBook row 5:/);
    });

    it("falls back to the exchange time when the execution time is missing", () => {
        const fill = tradeRowToFill(row({ LastExecutionTransactTime: undefined }), ctx, 0);
        expect(fill?.tradedAt).toBe("2026-09-02T12:58:04.000+05:30");
    });
});

describe("parseXtsTimestamp", () => {
    it("reads the documented day-month-year style as Indian time", () => {
        expect(parseXtsTimestamp("13-09-2026 12.58.04.072")).toBe("2026-09-13T12:58:04.072+05:30");
        expect(parseXtsTimestamp("13-09-2026 12:58:04")).toBe("2026-09-13T12:58:04.000+05:30");
        expect(parseXtsTimestamp("  13-09-2026 09.15.00.5 ")).toBe("2026-09-13T09:15:00.500+05:30");
    });

    it("reads ISO timestamps, assuming Indian time when there is no offset", () => {
        expect(parseXtsTimestamp("2026-09-02T12:58:04")).toBe("2026-09-02T12:58:04.000+05:30");
        expect(parseXtsTimestamp("2026-09-02 12:58:04.072")).toBe("2026-09-02T12:58:04.072+05:30");
        expect(parseXtsTimestamp("2026-09-02T07:28:04Z")).toBe("2026-09-02T07:28:04.000+00:00");
        expect(parseXtsTimestamp("2026-09-02T12:58:04+0530")).toBe("2026-09-02T12:58:04.000+05:30");
    });

    it("uses the trading day to settle an ambiguous date", () => {
        const text = "02-09-2026 12.58.04.072";
        expect(parseXtsTimestamp(text, ["2026-09-02"])).toBe("2026-09-02T12:58:04.072+05:30"); // 2 September
        expect(parseXtsTimestamp(text, ["2026-02-09"])).toBe("2026-02-09T12:58:04.072+05:30"); // 9 February
    });

    it("refuses to guess when an ambiguous date matches neither trading day", () => {
        expect(parseXtsTimestamp("02-09-2026 12.58.04.072", ["2026-11-03"])).toBeNull();
    });

    it("reads day first when nothing says otherwise, and needs no help when it can't be ambiguous", () => {
        expect(parseXtsTimestamp("02-09-2026 12.58.04.072")).toBe("2026-09-02T12:58:04.072+05:30");
        expect(parseXtsTimestamp("03-03-2026 12.58.04.072", ["2026-03-03"])).toBe("2026-03-03T12:58:04.072+05:30");
        expect(parseXtsTimestamp("09-13-2026 12.58.04.072")).toBe("2026-09-13T12:58:04.072+05:30"); // only one reading is a real date
    });

    it("rejects things that are not times", () => {
        for (const bad of ["31-02-2026 10.00.00", "13-13-2026 10.00.00", "02-09-2026 25.00.00", "02-09-2026", "yesterday", "", null, undefined, 1730000000]) {
            expect(parseXtsTimestamp(bad as any)).toBeNull();
        }
    });
});

describe("readXtsConfig", () => {
    const env = { XTS_BASE_URL: "https://xts.broker.test/interactive/", XTS_APP_KEY: " key ", XTS_SECRET_KEY: "secret" };

    it("reads the keys and address, tidying whitespace and a trailing slash", () => {
        expect(readXtsConfig(env)).toEqual({ baseUrl: "https://xts.broker.test/interactive", appKey: "key", secretKey: "secret", hostLookup: null });
    });

    it("needs both keys and an address", () => {
        expect(readXtsConfig({ ...env, XTS_SECRET_KEY: "" })).toBeNull();
        expect(readXtsConfig({ ...env, XTS_APP_KEY: undefined })).toBeNull();
        expect(readXtsConfig({ ...env, XTS_BASE_URL: "" })).toBeNull();
        expect(readXtsConfig({})).toBeNull();
    });

    it("accepts the host lookup instead of a fixed address, and defaults its version", () => {
        const config = readXtsConfig({ XTS_APP_KEY: "k", XTS_SECRET_KEY: "s", XTS_HOSTLOOKUP_URL: "https://lookup/hostlookup", XTS_ACCESS_PASSWORD: "pw" });
        expect(config).toEqual({ baseUrl: null, appKey: "k", secretKey: "s", hostLookup: { url: "https://lookup/hostlookup", accessPassword: "pw", version: "interactive_1.0.1" } });
    });

    it("ignores a host lookup that is missing its password", () => {
        expect(readXtsConfig({ XTS_APP_KEY: "k", XTS_SECRET_KEY: "s", XTS_HOSTLOOKUP_URL: "https://lookup/hostlookup" })).toBeNull();
    });
});

describe("choosing the XTS adapter", () => {
    afterEach(() => vi.unstubAllEnvs());

    const configure = () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "true");
        vi.stubEnv("XTS_ADAPTER", "xts");
        vi.stubEnv("XTS_BASE_URL", BASE);
        vi.stubEnv("XTS_APP_KEY", "APPKEY123");
        vi.stubEnv("XTS_SECRET_KEY", "SECRET456");
    };

    it("is used when asked for and fully configured, in production too, and is reused", () => {
        configure();
        vi.stubEnv("NODE_ENV", "production");
        const adapter = getBrokerAdapter();
        expect(adapter?.name).toBe("xts");
        expect(getBrokerAdapter()).toBe(adapter); // one login session per process
        expect(brokerSyncAvailable()).toBe(true);
    });

    it("stays unavailable when the settings are incomplete", () => {
        configure();
        vi.stubEnv("XTS_SECRET_KEY", "");
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        expect(getBrokerAdapter()).toBeNull();
        expect(brokerSyncAvailable()).toBe(false);
    });

    it("needs the switch as well as the adapter", () => {
        configure();
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        expect(brokerSyncAvailable()).toBe(false);
    });

    it("is not used unless XTS_ADAPTER says xts, even with keys present", () => {
        configure();
        vi.stubEnv("XTS_ADAPTER", "");
        expect(getBrokerAdapter()).toBeNull();
    });
});
