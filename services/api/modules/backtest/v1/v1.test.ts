// /api/v1 over real HTTP: an Express app on a random port, the real router and
// middleware, and an in-memory repository in place of Supabase.
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";

vi.mock("../repository.js", async () => (await import("./fakeRepository.js")).repo);
vi.mock("../llmParse.js", () => ({ llmParse: vi.fn(async () => null) }));
// "Bearer <user>" signs in as <user>; no header → the real middleware's 401 shape.
vi.mock("../../../middlewares/auth.js", () => ({
    authenticate: (req, res, next) => {
        const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? "");
        if (!m) return res.status(401).json({ error: "Not authenticated" });
        req.user = { authId: m[1] };
        next();
    },
}));

import router, { v1ErrorHandler } from "./routes.js";
import { db, repo, resetDb } from "./fakeRepository.js";
import { lttb, monthlyReturns } from "./controller.js";
import { _resetIdempotency } from "./http.js";
import { TEMPLATES } from "./templates.js";
import { openApiDocument } from "./openapi.js";
import { normaliseSpec } from "../spec.js";
import { _resetAnon, invalidateEntitlementCache } from "../plans.js";

let base = "";
let server: ReturnType<ReturnType<typeof express>["listen"]>;
beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/v1", router);
    app.use("/api/v1", v1ErrorHandler);
    server = app.listen(0);
    await new Promise((r) => server.once("listening", r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;
});
afterAll(() => server.close());

let user = "u1";
beforeEach(() => {
    resetDb();
    _resetIdempotency();
    _resetAnon();
    vi.clearAllMocks();
    user = `u-${randomUUID().slice(0, 8)}`; // fresh user per test: rate limits and plan caches don't leak between tests
    invalidateEntitlementCache(user);
    process.env.BACKTEST_FREE_HISTORY_DAYS = "36500";
});

const call = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await fetch(`${base}${path}`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user}`, ...headers },
        body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
};

const SAMPLE_SPEC = {
    name: "RSI on SAMPLE",
    instrument: { id: "NSE:SAMPLE", timeframe: "1d" },
    period: { from: "2022-01-01", to: "2024-12-31" },
    entry: { side: "long", when: { all: [{ left: { ind: "RSI", len: 14 }, op: "<", right: 35 }] } },
    exit: { when: { any: [{ left: { ind: "RSI", len: 14 }, op: ">", right: 65 }] }, stop_loss: { type: "pct", value: 3 } },
};

describe("conventions", () => {
    it("puts a request id on every response, echoing a sane incoming one", async () => {
        const a = await call("GET", "/instruments?q=tcs");
        expect(a.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
        const b = await call("GET", "/instruments?q=tcs", undefined, { "X-Request-Id": "trace-12345678" });
        expect(b.headers.get("x-request-id")).toBe("trace-12345678");
    });

    it("answers errors as problem+json with an actionable detail", async () => {
        const res = await fetch(`${base}/instruments/RELIANCE/coverage`);
        expect(res.status).toBe(400);
        expect(res.headers.get("content-type")).toMatch(/application\/problem\+json/);
        const body = (await res.json()) as Record<string, unknown>;
        expect(body).toMatchObject({ type: "https://www.xtincapital.com/problems/invalid_instrument", status: 400, code: "invalid_instrument", detail: expect.stringContaining("NSE:RELIANCE") });
        expect(body.request_id).toBe(res.headers.get("x-request-id"));
    });

    it("turns the shared auth middleware's 401 into problem+json", async () => {
        const res = await fetch(`${base}/strategies`);
        expect(res.status).toBe(401);
        expect(res.headers.get("content-type")).toMatch(/problem\+json/);
        expect(await res.json()).toMatchObject({ code: "unauthorized", detail: "Not authenticated" });
    });

    it("rejects malformed JSON and unknown endpoints as problems", async () => {
        const bad = await call("POST", "/strategies/validate", "{not json");
        expect(bad).toMatchObject({ status: 400, body: { code: "malformed_json" } });
        const missing = await call("GET", "/nope");
        expect(missing).toMatchObject({ status: 404, body: { code: "not_found" } });
    });

    it("keeps the OpenAPI document in sync with the router", () => {
        const doc = openApiDocument();
        const routes = (router.stack as any[])
            .filter((l) => l.route)
            .flatMap((l) => Object.keys(l.route.methods).map((m) => `${m} ${l.route.path.replace(/:(\w+)/g, "{$1}")}`));
        const documented = Object.entries(doc.paths).flatMap(([p, ops]) => Object.keys(ops as object).map((m) => `${m} ${p}`));
        expect(new Set(routes)).toEqual(new Set(documented));
        expect(doc.openapi).toBe("3.1.0");
        expect((doc.components.schemas.StrategySpec as { type: string }).type).toBe("object");
    });
});

describe("instruments, validation, templates", () => {
    it("searches by symbol, alias and name", async () => {
        expect((await call("GET", "/instruments?q=reli")).body.data[0].id).toBe("NSE:RELIANCE");
        expect((await call("GET", "/instruments?q=hdfc")).body.data[0].id).toBe("NSE:HDFCBANK");
        expect((await call("GET", "/instruments?q=state%20bank")).body.data[0].id).toBe("NSE:SBIN");
        expect((await call("GET", "/instruments?q=nifty")).body.data.map((i: { id: string }) => i.id)).toEqual(expect.arrayContaining(["NSE:NIFTY", "NSE:NIFTYBEES"]));
    });

    it("reports coverage per timeframe", async () => {
        const res = await call("GET", "/instruments/NSE:RELIANCE/coverage");
        expect(res.body).toMatchObject({ id: "NSE:RELIANCE", source: "yahoo", timeframes: { "1d": { approximate: true }, "1m": { approximate: true } } });
        expect((await call("GET", "/instruments/NSE:NIFTY/coverage")).body.note).toMatch(/theoretical.*NIFTYBEES/);
    });

    it("validates a spec: normalised spec, fingerprint, summary and credit estimate — spends nothing", async () => {
        const res = await call("POST", "/strategies/validate", { spec: SAMPLE_SPEC });
        expect(res.body).toMatchObject({ valid: true, spec_hash: expect.stringMatching(/^[0-9a-f]{64}$/), estimate: { credits: 1 } });
        expect(res.body.summary).toMatch(/^Long NSE:SAMPLE on daily candles/);
        expect(res.body.estimate.bars).toBeGreaterThan(700);
        const bad = await call("POST", "/strategies/validate", { spec: { ...SAMPLE_SPEC, sizing: { mode: "risk_pct", value: 1 }, exit: {} } });
        expect(bad.body).toMatchObject({ valid: false, errors: [expect.stringMatching(/needs exit.stop_loss/)] });
        expect(repo.consumeUsage).not.toHaveBeenCalled();
    });

    it("serves templates that are all valid specs", async () => {
        const res = await call("GET", "/strategies/templates");
        expect(res.body.data).toHaveLength(TEMPLATES.length);
        for (const t of TEMPLATES) {
            const n = normaliseSpec(t.spec);
            expect("errors" in n ? n.errors : []).toEqual([]);
        }
    });
});

describe("saved strategies are versioned", () => {
    it("saves version 1, then each edit as the next version, keeping the old ones", async () => {
        const created = await call("POST", "/strategies", { spec: SAMPLE_SPEC });
        expect(created).toMatchObject({ status: 201, body: { name: "RSI on SAMPLE", version: 1, legacy: false } });
        const id = created.body.id;
        const edited = await call("POST", `/strategies/${id}/versions`, { spec: { ...SAMPLE_SPEC, exit: { ...SAMPLE_SPEC.exit, stop_loss: { type: "pct", value: 1 } } } });
        expect(edited.body).toMatchObject({ version: 2, spec: { exit: { stop_loss: { value: 1 } } } });
        const got = await call("GET", `/strategies/${id}`);
        expect(got.body.versions.map((v: { version: number }) => v.version)).toEqual([2, 1]);
        expect((await call("GET", `/strategies/${id}/versions/1`)).body.spec.exit.stop_loss.value).toBe(3);
        expect((await call("GET", "/strategies")).body.data).toEqual([expect.objectContaining({ id, version: 2 })]);
    });

    it("lists a pre-/v1 strategy converted to a spec, and records it as version 1 on its first edit", async () => {
        const legacy = await repo.insertStrategy({
            user_id: user,
            name: "Old RSI",
            is_public: false,
            definition: { instrument: { symbol: "INFY", exchange: "NSE", timeframe: "1d" }, entry: { match: "all", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: "<", right: { kind: "value", value: 30 } }] }, entry_action: { side: "BUY", qty: 5 }, exit: { conditions: [] }, risk: { stop_loss_pct: 2 } },
        });
        const listed = (await call("GET", "/strategies")).body.data[0];
        expect(listed).toMatchObject({ legacy: true, version: 1, spec: { instrument: { id: "NSE:INFY" }, sizing: { mode: "fixed_qty", value: 5 } } });
        const edited = await call("POST", `/strategies/${legacy.id}/versions`, { spec: { ...listed.spec, exit: { stop_loss: { type: "pct", value: 4 } } } });
        expect(edited.body).toMatchObject({ version: 2, legacy: false });
        expect((await call("GET", `/strategies/${legacy.id}/versions/1`)).body.spec.exit.stop_loss.value).toBe(2);
    });

    it("accepts a chat definition and converts it", async () => {
        const res = await call("POST", "/strategies", {
            name: "From chat",
            definition: { instrument: { symbol: "TCS", exchange: "NSE", timeframe: "1d" }, entry: { conditions: [{ left: { kind: "indicator", indicator: "EMA", period: 20 }, op: "crosses_above", right: { kind: "indicator", indicator: "EMA", period: 50 } }] }, entry_action: { side: "BUY" }, sizing: { mode: "pct_equity", value: 50 }, exit: { conditions: [] }, risk: {} },
        });
        expect(res.body).toMatchObject({ name: "From chat", spec: { instrument: { id: "NSE:TCS" }, sizing: { mode: "pct_equity", value: 50 } } });
    });

    it("rejects an invalid spec with every problem listed, and caps free accounts' strategies", async () => {
        const bad = await call("POST", "/strategies", { spec: { ...SAMPLE_SPEC, instrument: { id: "RELIANCE" } } });
        expect(bad).toMatchObject({ status: 422, body: { code: "invalid_spec", errors: [expect.stringContaining("NSE:RELIANCE")] } });
        for (let i = 0; i < 3; i++) await call("POST", "/strategies", { spec: { ...SAMPLE_SPEC, name: `S${i}` } });
        expect(await call("POST", "/strategies", { spec: SAMPLE_SPEC })).toMatchObject({ status: 403, body: { code: "pro_required", feature: "unlimited_strategies" } });
    });

    it("never shows another user's strategy", async () => {
        const id = (await call("POST", "/strategies", { spec: SAMPLE_SPEC })).body.id;
        user = "someone-else";
        expect((await call("GET", `/strategies/${id}`)).status).toBe(404);
        expect((await call("DELETE", `/strategies/${id}`)).status).toBe(404);
    });
});

describe("backtests", () => {
    it("runs a spec and answers small: headline, one assumptions line, warnings, links — no trade dump", async () => {
        const res = await call("POST", "/backtests", { spec: SAMPLE_SPEC });
        expect(res.status).toBe(201);
        expect(Object.keys(res.body.headline).sort()).toEqual(["cagr_pct", "max_drawdown_pct", "num_trades", "profit_factor", "sharpe", "total_costs", "total_return_pct", "win_rate"]);
        expect(res.body).toMatchObject({ cached: false, status: "completed", spec_hash: expect.stringMatching(/^[0-9a-f]{64}$/), disclaimer: expect.stringMatching(/Not investment advice/) });
        expect(res.body.assumptions_line).toMatch(/next-bar-open fills · delivery · 50% of equity.*Zerodha charges \+ 5 bps slippage · SYNTHETIC data · engine/);
        expect(res.body.warnings[0]).toMatch(/SYNTHETIC/);
        expect(res.body).not.toHaveProperty("result");
        expect(res.body.links.report).toBe(`/backtest/app/history/${res.body.run_id}`);
        expect(repo.consumeUsage).toHaveBeenCalledOnce();
        expect(repo.recordMeter).toHaveBeenCalledWith(expect.objectContaining({ channel: "api", ok: true, credits: 1 }));
    });

    it("returns the stored result for identical inputs — cached, no credit — and runs again when anything changes", async () => {
        const first = await call("POST", "/backtests", { spec: SAMPLE_SPEC }, { "X-Xtin-Channel": "mcp" });
        const again = await call("POST", "/backtests", { spec: SAMPLE_SPEC }, { "X-Xtin-Channel": "mcp" });
        expect(again).toMatchObject({ status: 200, body: { cached: true, run_id: first.body.run_id } });
        expect(again.body.headline).toEqual(first.body.headline);
        expect(repo.consumeUsage).toHaveBeenCalledOnce();
        expect(repo.recordMeter).toHaveBeenLastCalledWith(expect.objectContaining({ channel: "mcp", credits: 0 }));
        const changed = await call("POST", "/backtests", { spec: SAMPLE_SPEC, capital: 250000 });
        expect(changed).toMatchObject({ status: 201, body: { cached: false } });
        expect(changed.body.run_id).not.toBe(first.body.run_id);
    });

    it("runs a saved strategy, or one of its earlier versions", async () => {
        const id = (await call("POST", "/strategies", { spec: SAMPLE_SPEC })).body.id;
        await call("POST", `/strategies/${id}/versions`, { spec: { ...SAMPLE_SPEC, entry: { side: "long", when: { all: [{ left: { ind: "RSI", len: 14 }, op: "<", right: 25 }] } } } });
        const current = await call("POST", "/backtests", { strategy_id: id });
        const v1 = await call("POST", "/backtests", { strategy_id: id, version: 1 });
        expect(current.body.strategy_id).toBe(id);
        expect(current.body.spec_hash).not.toBe(v1.body.spec_hash);
        expect(v1.body.summary).toContain("RSI(14) < 35");
        expect((await call("POST", "/backtests", { strategy_id: id, version: 9 })).status).toBe(404);
    });

    it("gates free accounts before fetching data, and explains each refusal", async () => {
        const intraday = await call("POST", "/backtests", { spec: { ...SAMPLE_SPEC, instrument: { id: "NSE:SAMPLE", timeframe: "15m" }, period: { from: "2024-01-01", to: "2024-01-31" } } });
        expect(intraday).toMatchObject({ status: 403, body: { code: "pro_required", feature: "intraday" } });
        const invalid = await call("POST", "/backtests", { spec: { ...SAMPLE_SPEC, entry: { when: { all: [] } } } });
        expect(invalid).toMatchObject({ status: 422, body: { code: "invalid_spec" } });
        const tooShort = await call("POST", "/backtests", { spec: { ...SAMPLE_SPEC, period: { from: "2024-01-06", to: "2024-01-07" } } });
        expect(tooShort.status).toBe(422);
        expect(repo.consumeUsage).not.toHaveBeenCalled();
        db.pro.add(user);
        invalidateEntitlementCache(user);
        expect((await call("POST", "/backtests", { spec: { ...SAMPLE_SPEC, instrument: { id: "NSE:SAMPLE", timeframe: "15m" }, period: { from: "2024-01-01", to: "2024-01-31" } } })).status).toBe(201);
    });

    it("pages trades 20 at a time and downsamples series", async () => {
        const id = (await call("POST", "/backtests", { spec: { ...SAMPLE_SPEC, entry: { side: "long", when: { all: [{ left: { field: "close" }, op: ">", right: 0 }] } }, exit: { time_exit: { bars: 2 } } } })).body.run_id;
        const p1 = await call("GET", `/backtests/${id}/trades?page=1`);
        expect(p1.body).toMatchObject({ page: 1, page_size: 20, has_more: true });
        expect(p1.body.data).toHaveLength(20);
        expect(p1.body.total).toBeGreaterThan(100);
        const eq = await call("GET", `/backtests/${id}/series?kind=equity&points=50`);
        expect(eq.body.data).toHaveLength(50);
        expect(eq.body.total_points).toBeGreaterThan(700);
        const dd = await call("GET", `/backtests/${id}/series?kind=drawdown&points=50`);
        expect(Math.max(...dd.body.data.map((p: { value: number }) => p.value))).toBeLessThanOrEqual(0);
        const monthly = await call("GET", `/backtests/${id}/series?kind=monthly`);
        expect(monthly.body.data[0]).toEqual({ month: "2022-01", return_pct: expect.any(Number) });
        expect(monthly.body.data.length).toBeGreaterThanOrEqual(36);
        expect((await call("GET", `/backtests/${id}/series?kind=price`)).status).toBe(400);
    });

    it("returns details, the full result only on request, and history", async () => {
        const id = (await call("POST", "/backtests", { spec: SAMPLE_SPEC })).body.run_id;
        const detail = await call("GET", `/backtests/${id}`);
        expect(detail.body).toMatchObject({ run_id: id, metrics: { num_trades: expect.any(Number) }, assumptions: { engine_version: expect.any(String) }, spec: { instrument: { id: "NSE:SAMPLE" } } });
        expect(detail.body).not.toHaveProperty("result");
        const full = await call("GET", `/backtests/${id}?include=result`);
        expect(full.body.result.trades.length).toBe(detail.body.metrics.num_trades);
        expect(full.body.result.candles.length).toBeGreaterThan(700);
        const list = await call("GET", "/backtests?page=1&page_size=10");
        expect(list.body).toMatchObject({ page: 1, has_more: false, data: [expect.objectContaining({ run_id: id, metrics: expect.any(Object) })] });
        expect((await call("DELETE", `/backtests/${id}`)).status).toBe(204);
        expect((await call("GET", `/backtests/${id}`)).status).toBe(404);
    });

    it("compares runs side by side and names the assumptions that differ", async () => {
        const a = (await call("POST", "/backtests", { spec: SAMPLE_SPEC })).body.run_id;
        const b = (await call("POST", "/backtests", { spec: { ...SAMPLE_SPEC, costs: { profile: null, slippage_bps: 0 } } })).body.run_id;
        const res = await call("POST", "/backtests/compare", { run_ids: [a, b] });
        expect(res.body.runs.map((r: { run_id: string }) => r.run_id)).toEqual([a, b]);
        expect(res.body.differences).toEqual(["cost_profile", "slippage_bps"]);
        expect(res.body.note).toMatch(/differ in: cost_profile, slippage_bps/);
        expect((await call("POST", "/backtests/compare", { run_ids: [a] })).status).toBe(400);
        expect((await call("POST", "/backtests/compare", { run_ids: [a, randomUUID()] })).body).toMatchObject({ status: 404, missing: [expect.any(String)] });
    });

    it("reports usage", async () => {
        await call("POST", "/backtests", { spec: SAMPLE_SPEC });
        expect((await call("GET", "/usage")).body).toMatchObject({ tier: "free", credits_limit: 25, credits_remaining: 24, credits_per_run: 1, cached_runs_free: true, timeframes: ["1d"] });
    });
});

describe("idempotency keys", () => {
    it("replays the first response instead of running twice", async () => {
        const key = randomUUID();
        const a = await call("POST", "/backtests", { spec: SAMPLE_SPEC, capital: 123456 }, { "Idempotency-Key": key });
        const b = await call("POST", "/backtests", { spec: SAMPLE_SPEC, capital: 123456 }, { "Idempotency-Key": key });
        expect(b.headers.get("idempotent-replayed")).toBe("true");
        expect(b.status).toBe(a.status);
        expect(b.body).toEqual(a.body);
        expect(repo.insertRun).toHaveBeenCalledOnce();
    });

    it("refuses the same key with a different body", async () => {
        const key = randomUUID();
        await call("POST", "/strategies", { spec: SAMPLE_SPEC }, { "Idempotency-Key": key });
        const res = await call("POST", "/strategies", { spec: { ...SAMPLE_SPEC, name: "Other" } }, { "Idempotency-Key": key });
        expect(res).toMatchObject({ status: 422, body: { code: "idempotency_key_reused" } });
        expect(db.strategies.size).toBe(1);
    });

    it("keys are per user", async () => {
        const key = randomUUID();
        await call("POST", "/strategies", { spec: SAMPLE_SPEC }, { "Idempotency-Key": key });
        user = "second-user";
        const res = await call("POST", "/strategies", { spec: SAMPLE_SPEC }, { "Idempotency-Key": key });
        expect(res.status).toBe(201);
        expect(res.headers.get("idempotent-replayed")).toBeNull();
    });
});

describe("monthlyReturns", () => {
    it("chains month-end equity, starting from the initial capital", () => {
        const curve = [
            { time: "2024-01-02", equity: 100 },
            { time: "2024-01-31", equity: 110 },
            { time: "2024-02-29", equity: 99 },
        ];
        expect(monthlyReturns(curve, 100)).toEqual([
            { month: "2024-01", return_pct: 10 },
            { month: "2024-02", return_pct: -10 },
        ]);
    });
});

describe("lttb", () => {
    it("keeps the first and last points and the peaks", () => {
        const data = Array.from({ length: 1000 }, (_, i) => ({ time: String(i), value: i === 500 ? 1000 : Math.sin(i / 50) }));
        const out = lttb(data, 100);
        expect(out).toHaveLength(100);
        expect(out[0]).toBe(data[0]);
        expect(out[99]).toBe(data[999]);
        expect(out.some((p) => p.value === 1000)).toBe(true);
    });
});
