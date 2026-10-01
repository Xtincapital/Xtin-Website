import { describe, it, expect, vi, beforeEach } from "vitest";

const repo = vi.hoisted(() => ({
    getAccountCreatedAt: vi.fn(),
    getProPlan: vi.fn(),
    getUsage: vi.fn(),
    consumeUsage: vi.fn(),
    getCachedCandles: vi.fn(),
    saveCachedCandles: vi.fn(),
    getStrategy: vi.fn(),
    insertRun: vi.fn(),
    listRuns: vi.fn(),
    getRun: vi.fn(),
    BacktestTablesMissingError: class extends Error {},
}));
vi.mock("./repository.js", () => ({
    ...repo,
    listStrategies: vi.fn(),
    insertStrategy: vi.fn(),
    updateStrategy: vi.fn(),
    deleteStrategy: vi.fn(),
    deleteRun: vi.fn(),
    upsertProPlan: vi.fn(),
}));
vi.mock("./llmParse.js", () => ({ llmParse: vi.fn(async () => null) }));

import { chatBacktest, clientIp, createRun, getMyRun } from "./controller.js";
import { _resetAnon, invalidateEntitlementCache } from "./plans.js";
import { llmParse } from "./llmParse.js";

const mockRes = () => {
    const res: any = { statusCode: 200, body: undefined };
    res.status = (c: number) => ((res.statusCode = c), res);
    res.json = (b: unknown) => ((res.body = b), res);
    res.end = () => res;
    return res;
};
const mockReq = (body: unknown, extra: Record<string, unknown> = {}) => ({ body, ip: "9.9.9.9", get: () => undefined, ...extra }) as any;

beforeEach(() => {
    vi.clearAllMocks();
    _resetAnon();
    invalidateEntitlementCache("u1");
    repo.getProPlan.mockResolvedValue(null);
    repo.getAccountCreatedAt.mockResolvedValue(new Date(Date.now() - 1000 * 3_600_000).toISOString());
    repo.getUsage.mockResolvedValue(0);
    repo.consumeUsage.mockResolvedValue(1);
    repo.getCachedCandles.mockResolvedValue(null);
});

describe("POST /backtest/chat", () => {
    it("rejects an empty message", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "   " }), res);
        expect(res.statusCode).toBe(400);
    });

    it("runs an equity idea end to end on the offline SAMPLE series", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when RSI drops below 30 and sell above 70, 2% stop", start_date: "2023-01-01", end_date: "2024-12-31" }), res);
        expect(res.statusCode).toBe(200);
        const b = res.body;
        expect(b.ok).toBe(true);
        expect(b.paywall).toBe(false);
        expect(b.strategy_name).toMatch(/^RSI Mean-Reversion/);
        expect(b.result.metrics.num_trades).toBe(b.result.trades.length);
        expect(b.result.candles.length).toBeGreaterThan(100);
        expect(b.reply).toContain("Done — I backtested");
        expect(b.usage).toMatchObject({ tier: "anon", limit: 5, remaining: 4 });
        expect(b.suggestions).toHaveLength(3);
        expect(llmParse).toHaveBeenCalledOnce();
    });

    it("sizes the position from capital and risk profile when no quantity is named", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30", starting_capital: 200000, profile: { risk: "conservative" }, start_date: "2024-01-01", end_date: "2024-12-31" }), res);
        const qty = res.body.definition.entry_action.qty;
        const firstClose = res.body.result.candles[0].close;
        expect(qty).toBe(Math.floor((200000 * 0.25) / firstClose));
        expect(res.body.result.trades.every((t: { qty: number }) => t.qty === qty)).toBe(true);
        expect(res.body.interpretation).toMatch(/Position size:.*about 25% of your capital/);
    });

    it("keeps a quantity the user named", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy 7 shares when rsi below 30", start_date: "2024-01-01", end_date: "2024-12-31" }), res);
        expect(res.body.definition.entry_action.qty).toBe(7);
        expect(res.body.interpretation).not.toMatch(/Position size/);
    });

    it("answers an options idea through the options engine", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "short a straddle with a 20% stop", start_date: "2024-01-01", end_date: "2024-06-30" }), res);
        expect(res.body.ok).toBe(true);
        expect(res.body.definition).toMatchObject({ kind: "options", structure: "straddle", side: "SELL", stop_multiple: 0.2 });
        expect(res.body.result.metrics.num_trades).toBe(res.body.result.candles.length);
        expect(llmParse).not.toHaveBeenCalled(); // options never reach the LLM
        // sized by margin: ~50% of ₹1L at 12% margin on a ~₹100 SAMPLE spot
        const spot = res.body.result.candles[0].open;
        expect(res.body.definition.lots).toBe(Math.floor((100000 * 0.5) / (spot * 0.12)));
        expect(res.body.result.trades[0].qty).toBe(res.body.definition.lots);
        expect(res.body.interpretation).toMatch(/\*\*Size:\*\* [\d,]+ lots/);
    });

    it("keeps an options strategy when the user taps a follow-up chip", async () => {
        const first = mockRes();
        await chatBacktest(mockReq({ message: "short a nifty straddle with a 20% stop", start_date: "2024-01-01", end_date: "2024-06-30", symbol: "SAMPLE" }), first);
        expect(first.body.suggestions).toContain("Run it on BANKNIFTY");

        const prev = { ...first.body.definition, instrument: { ...first.body.definition.instrument, symbol: "SAMPLE" } };
        const res = mockRes();
        await chatBacktest(mockReq({ message: "Add a 30% stop per leg", prev_definition: prev, start_date: "2024-01-01", end_date: "2024-06-30" }), res);
        expect(res.body.ok).toBe(true);
        expect(res.body.definition).toMatchObject({ kind: "options", structure: "straddle", stop_multiple: 0.3 });
        expect(res.body.interpretation).toMatch(/Updated your previous options strategy/);
    });

    it("applies a tweak to the previous strategy without calling the LLM", async () => {
        const first = mockRes();
        await chatBacktest(mockReq({ message: "buy when RSI drops below 30 and sell above 70, 2% stop", start_date: "2024-01-01", end_date: "2024-12-31" }), first);
        vi.mocked(llmParse).mockClear();

        const res = mockRes();
        await chatBacktest(mockReq({ message: "tighten the stop to 1%", prev_definition: first.body.definition, start_date: "2024-01-01", end_date: "2024-12-31" }), res);
        expect(res.body.definition.risk.stop_loss_pct).toBe(1);
        expect(res.body.strategy_name).toBe("RSI Mean-Reversion (tweaked) · SAMPLE 1d");
        expect(llmParse).not.toHaveBeenCalled();
    });

    it("reports a bad date window instead of throwing", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30", start_date: "2024-06-01", end_date: "2024-01-01" }), res);
        expect(res.body).toMatchObject({ ok: false, error: "end_date is before start_date" });
    });

    it("explains a data failure and keeps the strategy", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30", start_date: "2024-01-01", end_date: "2024-01-01" }), res); // single weekday-less window → too few candles
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/Not enough candle data/);
        expect(res.body.definition.instrument.symbol).toBe("SAMPLE");
        expect(res.statusCode).toBe(200);
    });

    it("stops anonymous visitors at the daily limit with a paywall — before any parsing", async () => {
        const body = { message: "buy when rsi below 30", start_date: "2024-01-01", end_date: "2024-06-30" };
        for (let i = 0; i < 5; i++) await chatBacktest(mockReq(body), mockRes());
        vi.mocked(llmParse).mockClear();

        const res = mockRes();
        await chatBacktest(mockReq(body), res);
        expect(res.body).toMatchObject({ ok: false, paywall: true, error: "quota_exceeded" });
        expect(res.body.reply).toMatch(/free account/);
        expect(llmParse).not.toHaveBeenCalled();
    });

    it("counts signed-in free users against the persistent monthly counter", async () => {
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30", start_date: "2024-01-01", end_date: "2024-06-30" }, { user: { authId: "u1" } }), res);
        expect(res.body.usage.tier).toBe("free");
        expect(repo.consumeUsage).toHaveBeenCalledWith("user:u1", expect.any(String), "chat_backtest");
    });

    it("blocks a signed-in free user who has used the month's allowance", async () => {
        repo.getUsage.mockResolvedValue(25);
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30" }, { user: { authId: "u1" } }), res);
        expect(res.body).toMatchObject({ paywall: true, error: "quota_exceeded" });
        expect(repo.consumeUsage).not.toHaveBeenCalled();
    });

    it("lets Pro users through regardless of usage", async () => {
        repo.getProPlan.mockResolvedValue({ user_id: "u1", pass_id: "weekly", valid_until: new Date(Date.now() + 86_400_000).toISOString() });
        repo.getUsage.mockResolvedValue(999);
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30", start_date: "2024-01-01", end_date: "2024-06-30" }, { user: { authId: "u1" } }), res);
        expect(res.body).toMatchObject({ ok: true, usage: { tier: "pro" } });
        expect(repo.consumeUsage).not.toHaveBeenCalled();
    });

    it("surfaces a missing migration as a calm 503, not a stack trace", async () => {
        repo.getProPlan.mockRejectedValue(new repo.BacktestTablesMissingError("missing"));
        const res = mockRes();
        await chatBacktest(mockReq({ message: "buy when rsi below 30" }, { user: { authId: "u1" } }), res);
        expect(res.statusCode).toBe(503);
        expect(res.body.code).toBe("not_migrated");
    });
});

describe("POST /backtest/runs", () => {
    const strategy = {
        id: "11111111-1111-4111-8111-111111111111",
        name: "My RSI",
        definition: { instrument: { symbol: "SAMPLE", exchange: "NSE", timeframe: "1d" }, entry: { conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: "<", right: { kind: "value", value: 30 } }] }, entry_action: { side: "BUY", qty: 1 }, exit: { conditions: [] }, risk: { stop_loss_pct: 2 } },
    };

    it("runs a saved strategy, stores the run and returns summary + result", async () => {
        repo.getStrategy.mockResolvedValue(strategy);
        repo.insertRun.mockImplementation(async (row) => ({ ...row, id: "r1", created_at: "2025-01-01T00:00:00Z" }));
        const res = mockRes();
        await createRun(mockReq({ strategy_id: "11111111-1111-4111-8111-111111111111", start_date: "2023-01-01", end_date: "2024-12-31" }, { user: { authId: "u1" } }), res);
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ id: "r1", strategy_name: "My RSI", status: "completed", definition: strategy.definition });
        expect(res.body.metrics.num_trades).toBe(res.body.result.trades.length);
        expect(repo.getStrategy).toHaveBeenCalledWith("u1", "11111111-1111-4111-8111-111111111111"); // always scoped to the caller
        expect(repo.insertRun).toHaveBeenCalledWith(expect.objectContaining({ user_id: "u1", status: "completed" }));
    });

    it("404s for a strategy that isn't the caller's", async () => {
        repo.getStrategy.mockResolvedValue(null);
        const res = mockRes();
        await createRun(mockReq({ strategy_id: "33333333-3333-4333-8333-333333333333", start_date: "2024-01-01", end_date: "2024-12-31" }, { user: { authId: "u1" } }), res);
        expect(res.statusCode).toBe(404);
        expect(repo.insertRun).not.toHaveBeenCalled();
    });

    it("records a failed run and answers 422 when there isn't enough data", async () => {
        repo.getStrategy.mockResolvedValue(strategy);
        repo.insertRun.mockResolvedValue({});
        const res = mockRes();
        await createRun(mockReq({ strategy_id: "11111111-1111-4111-8111-111111111111", start_date: "2024-01-01", end_date: "2024-01-01" }, { user: { authId: "u1" } }), res);
        expect(res.statusCode).toBe(422);
        expect(repo.insertRun).toHaveBeenCalledWith(expect.objectContaining({ status: "failed", result: null }));
    });

    it("validates the request and the window", async () => {
        const a = mockRes();
        await createRun(mockReq({ strategy_id: "11111111-1111-4111-8111-111111111111", start_date: "nope", end_date: "2024-01-01" }, { user: { authId: "u1" } }), a);
        expect(a.statusCode).toBe(400);
        const b = mockRes();
        await createRun(mockReq({ strategy_id: "11111111-1111-4111-8111-111111111111", start_date: "2024-06-01", end_date: "2024-01-01" }, { user: { authId: "u1" } }), b);
        expect(b.statusCode).toBe(422);
    });

    it("answers 404 (not a database 500) for ids that aren't UUIDs", async () => {
        const a = mockRes();
        await getMyRun(mockReq({}, { user: { authId: "u1" }, params: { id: "not-a-uuid" } }), a);
        expect(a.statusCode).toBe(404);
        const b = mockRes();
        await createRun(mockReq({ strategy_id: "123", start_date: "2024-01-01", end_date: "2024-12-31" }, { user: { authId: "u1" } }), b);
        expect(b.statusCode).toBe(404);
        expect(repo.getRun).not.toHaveBeenCalled();
        expect(repo.getStrategy).not.toHaveBeenCalled();
    });

    it("GET /runs/:id is scoped to the caller", async () => {
        repo.getRun.mockResolvedValue(null);
        const res = mockRes();
        await getMyRun(mockReq({}, { user: { authId: "u1" }, params: { id: "22222222-2222-4222-8222-222222222222" } }), res);
        expect(repo.getRun).toHaveBeenCalledWith("u1", "22222222-2222-4222-8222-222222222222");
        expect(res.statusCode).toBe(404);
    });
});

describe("clientIp", () => {
    const withHeaders = (h: Record<string, string>) => ({ ip: "10.0.0.1", get: (k: string) => h[k.toLowerCase()] }) as any;
    it("prefers Cloudflare's header, then the first forwarded hop, then the socket address", () => {
        expect(clientIp(withHeaders({ "cf-connecting-ip": "1.2.3.4", "x-forwarded-for": "5.6.7.8" }))).toBe("1.2.3.4");
        expect(clientIp(withHeaders({ "x-forwarded-for": "5.6.7.8, 10.0.0.2" }))).toBe("5.6.7.8");
        expect(clientIp(withHeaders({}))).toBe("10.0.0.1");
    });
});
