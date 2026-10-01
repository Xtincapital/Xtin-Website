import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ai = vi.hoisted(() => ({ generateAIWithUsage: vi.fn() }));
vi.mock("../ai/providers.js", () => ai);

import { llmParse, stripFences } from "./llmParse.js";

const valid = {
    _interpretation: "Buys oversold dips on RELIANCE.",
    instrument: { symbol: "RELIANCE", exchange: "NSE", timeframe: "15m" },
    entry: { match: "all", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: "<", right: { kind: "value", value: 30 } }] },
    entry_action: { side: "BUY", qty: 5, order_type: "MARKET" },
    exit: { match: "any", conditions: [] },
    risk: { stop_loss_pct: 1.5, target_pct: 3, trailing_sl_pct: null, square_off_time: "15:15" },
};

beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
});
afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
});

describe("stripFences", () => {
    it("removes json code fences", () => {
        expect(stripFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
        expect(stripFences('{"a":1}')).toBe('{"a":1}');
    });
});

describe("llmParse", () => {
    it("returns null without an API key and never calls the model", async () => {
        delete process.env.ANTHROPIC_API_KEY;
        expect(await llmParse({ message: "x" })).toBeNull();
        expect(ai.generateAIWithUsage).not.toHaveBeenCalled();
    });

    it("turns a valid model reply into a parsed strategy", async () => {
        ai.generateAIWithUsage.mockResolvedValue({ text: "```json\n" + JSON.stringify(valid) + "\n```", usage: { inputTokens: 1, outputTokens: 1 } });
        const p = await llmParse({ message: "rsi dips on reliance 15m" });
        expect(p).toMatchObject({ name: "AI · RELIANCE 15m", interpretation: "Buys oversold dips on RELIANCE.", warnings: [] });
        expect(p!.definition.entry_action!.qty).toBe(5);
        expect((p!.definition as Record<string, unknown>)._interpretation).toBeUndefined();
    });

    it("rejects hallucinated indicators and bad shapes so they can never reach the engine", async () => {
        const bogus = { ...valid, entry: { match: "all", conditions: [{ left: { kind: "indicator", indicator: "MAGIC", period: 3 }, op: "<", right: { kind: "value", value: 1 } }] } };
        ai.generateAIWithUsage.mockResolvedValue({ text: JSON.stringify(bogus), usage: {} });
        expect(await llmParse({ message: "x" })).toBeNull();

        ai.generateAIWithUsage.mockResolvedValue({ text: "not json at all", usage: {} });
        expect(await llmParse({ message: "x" })).toBeNull();
    });

    it("falls back (null) when the API call fails", async () => {
        ai.generateAIWithUsage.mockRejectedValue(new Error("overloaded"));
        expect(await llmParse({ message: "x" })).toBeNull();
    });

    it("sends history, previous strategy and profile, and starts with a user turn", async () => {
        ai.generateAIWithUsage.mockResolvedValue({ text: JSON.stringify(valid), usage: {} });
        await llmParse({
            message: "tighter stop",
            history: [
                { role: "assistant", content: "stale leading assistant turn" },
                { role: "user", content: "first idea" },
                { role: "assistant", content: "ran it" },
            ],
            prevDefinition: { instrument: { symbol: "TCS" } },
            profile: { risk: "conservative", capital: 0 },
        });
        const { messages, temperature } = ai.generateAIWithUsage.mock.calls[0][0];
        expect(temperature).toBe(0);
        expect(messages[0]).toEqual({ role: "user", content: "first idea" });
        const last = messages[messages.length - 1].content;
        expect(last).toContain("PREVIOUS_STRATEGY");
        expect(last).toContain('"risk":"conservative"');
        expect(last).not.toContain("capital"); // zero values are dropped
        expect(last).toContain("REQUEST:\ntighter stop");
    });
});
