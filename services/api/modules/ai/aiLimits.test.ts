import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { _resetRateLimits } from "../backtest/rateLimit.js";
import { createAiLimits } from "./aiLimits.js";

type Chain = Array<(req: any, res: any, next: () => void) => unknown>;

/** Run a middleware chain the way Express would; report whether it reached the handler. */
const run = (chain: Chain, req: any) => {
    const res: any = { statusCode: 200, headers: {} as Record<string, string> };
    res.status = (c: number) => ((res.statusCode = c), res);
    res.json = (b: unknown) => ((res.body = b), res);
    res.set = (k: string, v: string) => ((res.headers[k] = v), res);
    let reached = false;
    const step = (i: number) => {
        if (i === chain.length) return void (reached = true);
        chain[i](req, res, () => step(i + 1));
    };
    step(0);
    return { res, reached };
};

/** A request whose real visitor address arrives in cf-connecting-ip, as on Render behind Cloudflare. */
const visitor = (ip: string, body: unknown = { message: "hello" }) => ({
    body,
    ip: "10.0.0.1", // the proxy — identical for every visitor
    get: (h: string) => (h.toLowerCase() === "cf-connecting-ip" ? ip : undefined),
});

const config = { chatPerMinute: 3, chatPerHour: 5, otherPerMinute: 1, otherPerHour: 2, globalPerDay: 6, maxMessageChars: 20 };

beforeEach(() => _resetRateLimits());
afterEach(() => vi.useRealTimers());

describe("AI limits: /ai/chat", () => {
    it("lets normal chatting through, then returns 429 with a wait time", () => {
        const { chat } = createAiLimits(config);
        for (let i = 0; i < 3; i++) expect(run(chat, visitor("1.1.1.1")).reached).toBe(true);
        const { res, reached } = run(chat, visitor("1.1.1.1"));
        expect(reached).toBe(false);
        expect(res.statusCode).toBe(429);
        expect(res.body).toMatchObject({ code: "RATE_LIMITED" });
        expect(Number(res.headers["Retry-After"])).toBeGreaterThan(0);
    });

    it("counts each visitor separately even though every request comes from the proxy's IP", () => {
        const { chat } = createAiLimits(config);
        for (let i = 0; i < 3; i++) run(chat, visitor("1.1.1.1"));
        expect(run(chat, visitor("1.1.1.1")).reached).toBe(false);
        expect(run(chat, visitor("2.2.2.2")).reached).toBe(true);
    });

    it("rejects an over-long message with 400 before it can use any allowance", () => {
        const { chat } = createAiLimits(config);
        const { res, reached } = run(chat, visitor("1.1.1.1", { message: "x".repeat(21) }));
        expect(reached).toBe(false);
        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({ code: "MESSAGE_TOO_LONG" });
        // none of the 3 allowed calls was spent
        for (let i = 0; i < 3; i++) expect(run(chat, visitor("1.1.1.1")).reached).toBe(true);
    });

    it("accepts a message of exactly the maximum length, in either body field", () => {
        const { chat } = createAiLimits(config);
        expect(run(chat, visitor("1.1.1.1", { message: "x".repeat(20) })).reached).toBe(true);
        expect(run(chat, visitor("1.1.1.1", { text: "x".repeat(20) })).reached).toBe(true);
    });

    it("stops everyone at the daily ceiling, even a brand-new visitor", () => {
        const { chat } = createAiLimits(config);
        for (let i = 0; i < 6; i++) expect(run(chat, visitor(`9.9.9.${i}`)).reached).toBe(true);
        const { res, reached } = run(chat, visitor("7.7.7.7"));
        expect(reached).toBe(false);
        expect(res.statusCode).toBe(429);
        expect(res.body).toMatchObject({ code: "AI_BUSY" });
    });

    it("starts a fresh daily allowance the next day", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-02T10:00:00Z"));
        const { chat } = createAiLimits(config);
        for (let i = 0; i < 6; i++) run(chat, visitor(`9.9.9.${i}`));
        expect(run(chat, visitor("7.7.7.7")).reached).toBe(false);
        vi.setSystemTime(new Date("2026-11-03T10:00:00Z"));
        expect(run(chat, visitor("7.7.7.7")).reached).toBe(true);
    });
});

describe("AI limits: /ai/gemini and /ai/analyze", () => {
    it("get a tighter per-visitor cap than chat", () => {
        const { other } = createAiLimits(config);
        expect(run(other, visitor("1.1.1.1")).reached).toBe(true);
        expect(run(other, visitor("1.1.1.1")).reached).toBe(false);
    });

    it("spend from the same daily ceiling as chat", () => {
        const { chat, other } = createAiLimits(config);
        for (let i = 0; i < 5; i++) run(chat, visitor(`9.9.9.${i}`));
        expect(run(other, visitor("3.3.3.3")).reached).toBe(true); // 6th of 6
        expect(run(chat, visitor("4.4.4.4")).reached).toBe(false); // ceiling reached
    });
});
