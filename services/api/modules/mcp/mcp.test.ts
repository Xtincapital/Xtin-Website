// The Claude connector end to end: an Express server running /api/v1 and the
// MCP endpoint, driven by the official MCP SDK client like Claude would be.
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import { readFileSync, statSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

vi.mock("../backtest/repository.js", async () => (await import("../backtest/v1/fakeRepository.js")).repo);
vi.mock("../backtest/llmParse.js", () => ({ llmParse: vi.fn(async () => null) }));
// Bearer tokens: "good-<user>" signs in as <user>; "expired" is an expired token.
const verify = vi.hoisted(
    () => async (token: string) =>
        token.startsWith("good-") ? { sub: token.slice(5), clientId: "claude" } : { error: token === "expired" ? "JWT expired" : "invalid JWT", expired: token === "expired" }
);
vi.mock("../../middlewares/auth.js", () => ({
    verifyAccessToken: verify,
    authenticate: async (req, res, next) => {
        const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? "");
        const v = m ? await verify(m[1]) : null;
        if (!v || "error" in v) return res.status(401).json({ error: "Not authenticated" });
        req.user = { authId: v.sub };
        next();
    },
}));

import v1Router, { v1ErrorHandler } from "../backtest/v1/routes.js";
import { mcpRouter } from "./routes.js";
import { claudeUiDomain, REPORT_URI, SCHEMA_URI } from "./server.js";
import { resetDb, db } from "../backtest/v1/fakeRepository.js";
import { _resetIdempotency } from "../backtest/v1/http.js";
import { _resetAnon, invalidateEntitlementCache } from "../backtest/plans.js";

let origin = "";
let server: ReturnType<ReturnType<typeof express>["listen"]>;
beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use(
        mcpRouter({
            apiBase: () => `${origin}/api/v1`,
            mcpUrl: () => `${origin}/mcp`,
            siteUrl: () => "https://www.xtincapital.com",
            authorizationServer: () => "https://project.supabase.co/auth/v1",
        })
    );
    app.use("/api/v1", v1Router);
    app.use("/api/v1", v1ErrorHandler);
    server = app.listen(0);
    await new Promise((r) => server.once("listening", r));
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => server.close());

let user = "";
beforeEach(() => {
    resetDb();
    _resetIdempotency();
    _resetAnon();
    user = `u-${randomUUID().slice(0, 8)}`;
    invalidateEntitlementCache(user);
    process.env.BACKTEST_FREE_HISTORY_DAYS = "36500";
});

async function connect(token = `good-${user}`) {
    const client = new Client({ name: "test-claude", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${origin}/mcp`), { requestInit: { headers: { Authorization: `Bearer ${token}` } } }));
    return client;
}

const SPEC = {
    name: "RSI on SAMPLE",
    instrument: { id: "NSE:SAMPLE", timeframe: "1d" },
    period: { from: "2022-01-01", to: "2024-12-31" },
    entry: { side: "long", when: { all: [{ left: { ind: "RSI", len: 14 }, op: "<", right: 35 }] } },
    exit: { when: { any: [{ left: { ind: "RSI", len: 14 }, op: ">", right: 65 }] }, stop_loss: { type: "pct", value: 3 } },
};

const text = (r: unknown) => (((r as { content?: { type: string; text?: string }[] }).content) ?? []).map((c) => c.text ?? "").join("\n");

describe("sign-in", () => {
    it("publishes protected-resource metadata pointing at the Xtin (Supabase) authorization server", async () => {
        for (const path of ["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"]) {
            const body = await (await fetch(`${origin}${path}`)).json();
            expect(body).toMatchObject({ resource: `${origin}/mcp`, authorization_servers: ["https://project.supabase.co/auth/v1"], bearer_methods_supported: ["header"] });
        }
    });

    it("answers an unauthenticated call with 401 and a WWW-Authenticate pointer to the metadata", async () => {
        const res = await fetch(`${origin}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" }, body: "{}" });
        expect(res.status).toBe(401);
        expect(res.headers.get("www-authenticate")).toBe(`Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"`);
    });

    it("flags an expired token as invalid_token so the client refreshes", async () => {
        const res = await fetch(`${origin}/mcp`, { method: "POST", headers: { Authorization: "Bearer expired", "Content-Type": "application/json" }, body: "{}" });
        expect(res.status).toBe(401);
        expect(res.headers.get("www-authenticate")).toMatch(/error="invalid_token", error_description="The access token expired"/);
        await expect(connect("nope")).rejects.toThrow();
    });

    it("refuses browser calls from other sites, allows Claude's", async () => {
        const call = (o: string) => fetch(`${origin}/mcp`, { method: "POST", headers: { Origin: o, Authorization: `Bearer good-${user}`, "Content-Type": "application/json" }, body: "{}" });
        expect((await call("https://evil.example")).status).toBe(403);
        expect((await call("https://claude.ai")).status).not.toBe(403);
    });

    it("has no sessions or server stream to open", async () => {
        expect((await fetch(`${origin}/mcp`)).status).toBe(405);
    });
});

describe("tools", () => {
    it("lists the ten tools, each titled, annotated and under 64 characters", async () => {
        const client = await connect();
        const { tools } = await client.listTools();
        expect(tools.map((t) => t.name).sort()).toEqual(
            ["compare_backtests", "delete_strategy", "get_backtest_report", "get_strategy_schema", "get_usage", "list_strategies", "run_backtest", "save_strategy", "search_instruments", "validate_strategy"].sort()
        );
        for (const t of tools) {
            expect(t.name.length).toBeLessThan(64);
            expect(t.title).toBeTruthy();
            expect(t.description).not.toMatch(/\byou should\b|\bthen call\b/i); // say what it does, not what to do next
            expect(t.annotations).toBeDefined();
        }
        const ann = Object.fromEntries(tools.map((t) => [t.name, t.annotations]));
        expect(ann.run_backtest).toMatchObject({ readOnlyHint: false, destructiveHint: false });
        expect(ann.save_strategy).toMatchObject({ readOnlyHint: false, destructiveHint: false });
        expect(ann.delete_strategy).toMatchObject({ destructiveHint: true });
        for (const name of ["search_instruments", "get_strategy_schema", "validate_strategy", "get_backtest_report", "compare_backtests", "list_strategies", "get_usage"]) expect(ann[name]).toMatchObject({ readOnlyHint: true });
        expect(tools.find((t) => t.name === "run_backtest")?._meta).toMatchObject({ ui: { resourceUri: REPORT_URI } });
        await client.close();
    });

    it("resolves instruments with coverage, and serves the spec schema", async () => {
        const client = await connect();
        const found = await client.callTool({ name: "search_instruments", arguments: { query: "reliance" } });
        expect(text(found)).toMatch(/^NSE:RELIANCE — Reliance Industries \(EQ\); daily from/);
        const schema = await client.callTool({ name: "get_strategy_schema", arguments: {} });
        expect(schema.structuredContent).toMatchObject({ spec_version: "1.0", operators: expect.arrayContaining(["between"]) });
        const res = await client.readResource({ uri: SCHEMA_URI });
        expect(JSON.parse((res.contents[0] as { text: string }).text).type).toBe("object");
        await client.close();
    });

    it("validates a spec without spending a credit, and lists every problem in a bad one", async () => {
        const client = await connect();
        const good = await client.callTool({ name: "validate_strategy", arguments: { spec: SPEC } });
        expect(text(good)).toMatch(/^Understood: Long NSE:SAMPLE on daily candles/);
        expect(text(good)).toMatch(/Cost: 1 credit/);
        const bad = await client.callTool({ name: "validate_strategy", arguments: { spec: { ...SPEC, instrument: { id: "RELIANCE" } } } });
        expect(bad.isError).toBe(true);
        expect(text(bad)).toMatch(/The spec isn't valid:\n- instrument\.id: .*NSE:RELIANCE/);
        await client.close();
    });

    it("runs a backtest and answers small — headline, assumptions, link, disclaimer — with the run in the report view", async () => {
        const client = await connect();
        const r = await client.callTool({ name: "run_backtest", arguments: { spec: SPEC } });
        const t = text(r);
        expect(t).toMatch(/Return [+−]\d+\.\d% · CAGR .* · Max drawdown −\d+\.\d% · Sharpe .* · Win rate \d+% · \d+ trades · Profit factor .* · Charges ₹/);
        expect(t).toMatch(/Assumptions: next-bar-open fills · delivery/);
        expect(t).toMatch(/Full report: https:\/\/www\.xtincapital\.com\/backtest\/app\/history\//);
        expect(t).toMatch(/Not investment advice/);
        expect(r.structuredContent).toMatchObject({ run_id: expect.any(String), cached: false, headline: { num_trades: expect.any(Number) } });
        expect(JSON.stringify(r.structuredContent)).not.toContain("entry_time"); // never a trade dump
        const again = await client.callTool({ name: "run_backtest", arguments: { spec: SPEC } });
        expect(text(again)).toMatch(/stored result — no credit used/);
        await client.close();
    });

    it("turns plan limits and bad input into tool errors the model can explain", async () => {
        const client = await connect();
        const intraday = await client.callTool({ name: "run_backtest", arguments: { spec: { ...SPEC, instrument: { id: "NSE:SAMPLE", timeframe: "15m" }, period: { from: "2024-01-01", to: "2024-01-31" } } } });
        expect(intraday.isError).toBe(true);
        expect(text(intraday)).toMatch(/Pro feature: Intraday candles \(15m\) are a Pro feature[\s\S]*Needs Xtin Pro: intraday/);
        const nothing = await client.callTool({ name: "run_backtest", arguments: {} });
        expect(text(nothing)).toMatch(/Nothing to run/);
        await client.close();
    });

    it("returns report parts: metrics, a page of trades, monthly returns and series", async () => {
        const client = await connect();
        const run = (await client.callTool({ name: "run_backtest", arguments: { spec: SPEC } })).structuredContent as { run_id: string };
        const metrics = await client.callTool({ name: "get_backtest_report", arguments: { run_id: run.run_id, part: "metrics" } });
        expect(metrics.structuredContent).toMatchObject({ metrics: { sortino: expect.anything() }, assumptions: { engine_version: expect.any(String) } });
        const trades = await client.callTool({ name: "get_backtest_report", arguments: { run_id: run.run_id, part: "trades", page: 1 } });
        expect(trades.structuredContent).toMatchObject({ page: 1, page_size: 20 });
        const monthly = await client.callTool({ name: "get_backtest_report", arguments: { run_id: run.run_id, part: "monthly" } });
        expect((monthly.structuredContent as { data: unknown[] }).data.length).toBeGreaterThanOrEqual(36);
        const equity = await client.callTool({ name: "get_backtest_report", arguments: { run_id: run.run_id, part: "equity" } });
        expect((equity.structuredContent as { data: unknown[] }).data.length).toBeLessThanOrEqual(300);
        await client.close();
    });

    it("compares runs and names differing assumptions", async () => {
        const client = await connect();
        const a = (await client.callTool({ name: "run_backtest", arguments: { spec: SPEC } })).structuredContent as { run_id: string };
        const b = (await client.callTool({ name: "run_backtest", arguments: { spec: { ...SPEC, costs: { profile: null, slippage_bps: 0 } } } })).structuredContent as { run_id: string };
        const c = await client.callTool({ name: "compare_backtests", arguments: { run_ids: [a.run_id, b.run_id] } });
        expect(text(c)).toMatch(/differ in: cost_profile, slippage_bps/);
        await client.close();
    });

    it("saves, versions, lists and deletes strategies — and a retried save doesn't duplicate", async () => {
        const client = await connect();
        const saved = await client.callTool({ name: "save_strategy", arguments: { name: "My RSI", spec: SPEC } });
        const id = (saved.structuredContent as { id: string }).id;
        expect(text(saved)).toMatch(/^Saved "My RSI" as version 1/);
        await client.callTool({ name: "save_strategy", arguments: { name: "My RSI", spec: SPEC } }); // the same call again
        expect(db.strategies.size).toBe(1);
        const v2 = await client.callTool({ name: "save_strategy", arguments: { name: "My RSI", spec: { ...SPEC, exit: { ...SPEC.exit, stop_loss: { type: "pct", value: 1 } } }, strategy_id: id } });
        expect(text(v2)).toMatch(/as version 2/);
        expect(text(await client.callTool({ name: "list_strategies", arguments: {} }))).toMatch(new RegExp(`My RSI \\(v2, id ${id}\\)`));
        const one = await client.callTool({ name: "list_strategies", arguments: { strategy_id: id } });
        expect((one.structuredContent as { versions: unknown[] }).versions).toHaveLength(2);
        expect(text(await client.callTool({ name: "run_backtest", arguments: { strategy_id: id, version: 1 } }))).toMatch(/3% stop-loss/);
        expect(text(await client.callTool({ name: "delete_strategy", arguments: { strategy_id: id } }))).toBe(`Deleted strategy ${id}.`);
        expect(text(await client.callTool({ name: "list_strategies", arguments: {} }))).toBe("No saved strategies yet.");
        await client.close();
    });

    it("reports usage", async () => {
        const client = await connect();
        expect(text(await client.callTool({ name: "get_usage", arguments: {} }))).toMatch(/^Free plan: 25 of 25 backtests left this month; 1d candles/);
        await client.close();
    });

    it("meters runs on the mcp channel", async () => {
        const { repo } = await import("../backtest/v1/fakeRepository.js");
        const client = await connect();
        await client.callTool({ name: "run_backtest", arguments: { spec: SPEC } });
        expect(repo.recordMeter).toHaveBeenCalledWith(expect.objectContaining({ channel: "mcp", ok: true }));
        await client.close();
    });
});

describe("in-chat report (MCP App)", () => {
    it("serves the self-contained view with Claude's sandbox domain and no external loads", async () => {
        const client = await connect();
        const res = await client.readResource({ uri: REPORT_URI });
        const item = res.contents[0] as { mimeType: string; text: string; _meta?: { ui?: { domain?: string } } };
        expect(item.mimeType).toBe("text/html;profile=mcp-app");
        expect(item._meta?.ui?.domain).toBe(claudeUiDomain(`${origin}/mcp`));
        expect(item._meta?.ui?.domain).toMatch(/^[0-9a-f]{32}\.claudemcpcontent\.com$/);
        expect(item.text).toContain('id="kpis"');
        expect(item.text).not.toMatch(/<script[^>]+src=|<link[^>]+href=|https?:\/\/[^"'\s]*\.(js|css)\b/); // nothing loaded from elsewhere
        await client.close();
    });

    it("is rebuilt whenever its source changes", () => {
        const dir = new URL("./ui/", import.meta.url);
        const html = readFileSync(new URL("report.html", dir), "utf8");
        const source = readFileSync(new URL("report.ts", dir), "utf8");
        expect(html, "report.html is stale — run `npm run build:mcp-ui`").toContain(`source sha256 ${createHash("sha256").update(source).digest("hex")}`);
        expect(statSync(new URL("report.html", dir)).size).toBeLessThan(1_000_000);
    });
});
