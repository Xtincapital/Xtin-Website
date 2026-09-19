// Coverage for newsletterGeneratorSimple.ts — the AI-driven newsletter
// pipeline. generateNewsletter() talks to the Claude API directly via raw
// fetch (not modules/ai/providers.ts) and has three distinct paths that
// must degrade to the RSS-backed fallback rather than ever crashing the
// twice-daily cron: (1) no ANTHROPIC_API_KEY configured, (2) a Claude
// response with no usable text content, (3) a Claude response that can't
// be parsed into JSON. There's also a catch-all around the whole flow.
//
// ANTHROPIC_API_KEY is read into a module-level const at import time (from
// constants/config.js, which itself reads process.env at import time), so
// each scenario that needs a different key state uses vi.resetModules()
// and a fresh dynamic import rather than mutating process.env after the
// fact — mutating it after import would have no effect on the already
// -captured const.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn((_data: Record<string, any>) => ({ select: mockSelect }));
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
const mockSupabase = { from: mockFrom };

vi.mock("../supabase/index.js", () => ({ default: mockSupabase }));
vi.mock("../modules/newsletter/subscription.repository.js", () => ({
    readSubscribers: vi.fn(),
}));
vi.mock("../services/mail.service.js", () => ({
    sendEmail: vi.fn(),
    sendEmailToAll: vi.fn(),
}));

// constants/config.js calls dotenv.config() at import time, which (unlike
// setting process.env directly) will happily re-populate
// process.env.ANTHROPIC_API_KEY from a real .env file on disk any time the
// var is deleted and the module is freshly re-imported — which would leak
// a real key into the "no key configured" scenarios below. Mocking this
// module out entirely removes that dotenv side effect and gives full
// control over what generateNewsletter() sees as `config.ANTHROPIC_API_KEY`.
let mockAnthropicKey: string | undefined;
vi.mock("../constants/config.js", () => ({
    get config() {
        return { ANTHROPIC_API_KEY: mockAnthropicKey || "" };
    },
}));

// A small, deterministic RSS feed body. Every feed URL returns the same
// body in these tests, and fetchMarketHeadlines() dedupes by title, so
// this always yields exactly 3 unique headlines regardless of how many
// feeds a market has configured.
const RSS_XML = `<?xml version="1.0"?>
<rss><channel>
<item><title>Sensex jumps 300 points on bank rally</title><description>Markets rallied on strong earnings from lenders</description></item>
<item><title>US Fed holds rates steady</title><description>Fed signals no change is likely this quarter</description></item>
<item><title>Oil prices dip on supply glut</title><description>Crude fell 2% amid oversupply concerns</description></item>
</channel></rss>`;

function jsonResponse(body: any, ok = true, status = ok ? 200 : 500) {
    return {
        ok,
        status,
        headers: { get: () => null },
        json: async () => body,
        text: async () => JSON.stringify(body),
    };
}

function textResponse(body: string, ok = true, status = ok ? 200 : 500) {
    return {
        ok,
        status,
        headers: { get: () => null },
        text: async () => body,
        json: async () => JSON.parse(body),
    };
}

/**
 * Builds a fetch mock that serves `claudeHandler` for the Anthropic API
 * call and a plain RSS body for every other (feed) URL.
 */
function mockFetchWith(claudeHandler: (url: string, options: any) => any) {
    return vi.fn(async (url: string, options?: any) => {
        if (url === ANTHROPIC_URL) {
            return claudeHandler(url, options);
        }
        return textResponse(RSS_XML);
    });
}

/** Builds a full, valid AI newsletter JSON payload (all 56 required keys). */
function buildFullAINewsletter(overrides: Record<string, string> = {}) {
    const data: Record<string, string> = { title: "AI Wrote This Title (should be overridden)" };
    for (let i = 1; i <= 5; i++) {
        data[`heading_${i}`] = `AI Heading ${i}`;
        for (let j = 1; j <= 5; j++) {
            data[`heading_${i}_subheading_${j}`] = `AI Subheading ${i}-${j}`;
            data[`heading_${i}_subheading_${j}_content`] = `AI generated content for item ${i}-${j}. Why it matters: it just does.`;
        }
    }
    return { ...data, ...overrides };
}

async function loadModule(env: { ANTHROPIC_API_KEY?: string } = {}) {
    vi.resetModules();
    mockAnthropicKey = env.ANTHROPIC_API_KEY;
    if (env.ANTHROPIC_API_KEY === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
    return await import("./newsletterGeneratorSimple.js");
}

describe("newsletterGeneratorSimple", () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSingle.mockResolvedValue({
            data: { id: "newsletter-1", title: "Saved Title", created_at: new Date().toISOString() },
            error: null,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
        else process.env.ANTHROPIC_API_KEY = originalKey;
        if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalNodeEnv;
    });

    describe("generateNewsletter — fallback path 1: no ANTHROPIC_API_KEY configured", () => {
        it("falls back to the RSS-backed newsletter and never calls the Claude API", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: undefined });
            const fetchMock = mockFetchWith(() => {
                throw new Error("Claude should not have been called when no API key is configured");
            });
            vi.stubGlobal("fetch", fetchMock);

            const result = await generateNewsletter({ edition: "post_market", market: "IN" });

            expect(result).toEqual({ id: "newsletter-1", title: "Saved Title", created_at: expect.any(String) });
            expect(mockInsert).toHaveBeenCalledTimes(1);
            const saved = mockInsert.mock.calls[0][0];
            // RSS-backed content: the first live headline should land in slot 1.
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
            expect(saved.heading_1_subheading_1_content).toContain("Markets rallied on strong earnings from lenders");
            // Slots beyond the 3 unique headlines fall back to the "limited" placeholder.
            expect(saved.heading_1_subheading_4).toBe("Live source coverage was limited for this slot");
            // No fetch call ever hit Claude.
            expect(fetchMock.mock.calls.every(([url]) => url !== ANTHROPIC_URL)).toBe(true);
        });
    });

    describe("generateNewsletter — fallback path 2: Claude responds but with no usable text content", () => {
        it("falls back to RSS content when Claude's content array has no text items", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            const fetchMock = mockFetchWith(() => jsonResponse({ content: [{ type: "tool_use", id: "x" }] }));
            vi.stubGlobal("fetch", fetchMock);

            await generateNewsletter({ edition: "pre_market", market: "US" });

            expect(fetchMock.mock.calls.some(([url]) => url === ANTHROPIC_URL)).toBe(true);
            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
        });

        it("falls back to RSS content when Claude's content array is empty", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            const fetchMock = mockFetchWith(() => jsonResponse({ content: [] }));
            vi.stubGlobal("fetch", fetchMock);

            await generateNewsletter({ edition: "pre_market", market: "GLOBAL" });

            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
        });
    });

    describe("generateNewsletter — fallback path 3: Claude's response can't be parsed", () => {
        it("falls back to RSS content when the text isn't JSON at all", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            const fetchMock = mockFetchWith(() =>
                jsonResponse({ content: [{ type: "text", text: "Sorry, I can't help with that today." }] })
            );
            vi.stubGlobal("fetch", fetchMock);

            await generateNewsletter({ edition: "post_market", market: "IN" });

            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
        });

        it("falls back to RSS content on truncated JSON (cut off mid-response)", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            const truncated = JSON.stringify(buildFullAINewsletter()).slice(0, 120); // no closing brace
            const fetchMock = mockFetchWith(() => jsonResponse({ content: [{ type: "text", text: truncated }] }));
            vi.stubGlobal("fetch", fetchMock);

            await expect(generateNewsletter({ edition: "post_market", market: "IN" })).resolves.toBeDefined();
            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
        });

        it("falls back to RSS content when the response is an unterminated markdown code fence", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            // Opens a ```json fence but never closes it — exercises the
            // indexOf(...)/substring(...) fence-stripping branch with no
            // matching end marker.
            const fetchMock = mockFetchWith(() =>
                jsonResponse({ content: [{ type: "text", text: "```json\n{ \"title\": \"oops, no closing fence\"" }] })
            );
            vi.stubGlobal("fetch", fetchMock);

            await expect(generateNewsletter({ edition: "post_market", market: "IN" })).resolves.toBeDefined();
            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
        });
    });

    describe("generateNewsletter — catch-all: any thrown error during the flow still resolves via RSS fallback", () => {
        it("recovers when persistence fails on the first attempt and succeeds on the retry", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: undefined });
            const fetchMock = mockFetchWith(() => {
                throw new Error("Claude should not be called in this scenario");
            });
            vi.stubGlobal("fetch", fetchMock);

            mockSingle
                .mockRejectedValueOnce(new Error("supabase connection reset"))
                .mockResolvedValueOnce({
                    data: { id: "newsletter-2", title: "Saved Title", created_at: new Date().toISOString() },
                    error: null,
                });

            const result = await generateNewsletter({ edition: "post_market", market: "IN" });

            expect(result).toMatchObject({ id: "newsletter-2" });
            // First attempt failed, flow recovered and saved a second time.
            expect(mockInsert).toHaveBeenCalledTimes(2);
        });

        it("recovers from an unexpected error thrown mid-flow (e.g. Claude request failure)", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            // fetchWithRetry only sleeps between attempts when the error
            // message does NOT include "rate limit" — using that keyword
            // keeps every retry synchronous so this test stays fast, while
            // still exercising the real retry-then-rethrow path.
            const fetchMock = mockFetchWith(() => {
                throw new Error("simulated rate limit failure for test speed");
            });
            vi.stubGlobal("fetch", fetchMock);

            const result = await generateNewsletter({ edition: "post_market", market: "IN" });

            expect(result).toMatchObject({ id: "newsletter-1" });
            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Sensex jumps 300 points on bank rally");
        });
    });

    describe("generateNewsletter — successful (non-fallback) path", () => {
        it("returns AI-generated content when Claude responds with valid, complete JSON", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            const aiPayload = buildFullAINewsletter();
            const fetchMock = mockFetchWith(() =>
                jsonResponse({ content: [{ type: "text", text: JSON.stringify(aiPayload) }] })
            );
            vi.stubGlobal("fetch", fetchMock);

            await generateNewsletter({ edition: "pre_market", market: "US" });

            expect(mockInsert).toHaveBeenCalledTimes(1);
            const saved = mockInsert.mock.calls[0][0];

            // Content comes from the AI, not the RSS fallback.
            expect(saved.heading_1).toBe("AI Heading 1");
            expect(saved.heading_1_subheading_1).toBe("AI Subheading 1-1");
            expect(saved.heading_1_subheading_1_content).toContain("AI generated content for item 1-1");
            expect(saved.heading_5_subheading_5).toBe("AI Subheading 5-5");

            // The title is always the deterministic product title, not
            // whatever the model returned — normalizeNewsletterData()
            // overwrites it unconditionally.
            expect(saved.title).toContain("Pre-Market Brief");
            expect(saved.title).toContain("United States");
            expect(saved.title).not.toContain("should be overridden");
        });

        it("fills gaps from the RSS base when the AI response is only partially complete", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: "test-key" });
            // Only heading_1's fields are provided by the "model".
            const partial: Record<string, string> = {
                heading_1: "Only This Heading",
                heading_1_subheading_1: "Only This Subheading",
                heading_1_subheading_1_content: "Only this content was generated by the AI for this test.",
            };
            const fetchMock = mockFetchWith(() =>
                jsonResponse({ content: [{ type: "text", text: JSON.stringify(partial) }] })
            );
            vi.stubGlobal("fetch", fetchMock);

            await generateNewsletter({ edition: "post_market", market: "IN" });

            const saved = mockInsert.mock.calls[0][0];
            expect(saved.heading_1_subheading_1).toBe("Only This Subheading");
            expect(saved.heading_1_subheading_1_content).toBe("Only this content was generated by the AI for this test.");
            // heading_2 was never provided by the AI, so it's backfilled
            // from the RSS-backed base newsletter (the 3 live headlines are
            // all consumed by heading_1's slots, so heading_2 gets the
            // "limited coverage" placeholder rather than being left blank).
            expect(saved.heading_2).toBe("Winners & Losers");
            expect(saved.heading_2_subheading_1).toBe("Live source coverage was limited for this slot");
        });
    });

    describe("generateNewsletter — edition/market resolution", () => {
        it("defaults an unrecognized market to IN and an unrecognized edition to the IST-hour default", async () => {
            const { generateNewsletter } = await loadModule({ ANTHROPIC_API_KEY: undefined });
            const fetchMock = mockFetchWith(() => {
                throw new Error("should not reach Claude");
            });
            vi.stubGlobal("fetch", fetchMock);

            await generateNewsletter({ edition: "not_a_real_edition", market: "MARS" } as any);

            const saved = mockInsert.mock.calls[0][0];
            expect(saved.title).toContain("India");
        });
    });
});

describe("generateNewsletterHTML", () => {
    async function loadHTML() {
        vi.resetModules();
        mockAnthropicKey = undefined;
        const mod = await import("./newsletterGeneratorSimple.js");
        return mod.generateNewsletterHTML;
    }

    it("renders title, edition/market badge, and section content for a full newsletter", async () => {
        const generateNewsletterHTML = await loadHTML();
        const newsletter: Record<string, any> = {
            title: "Post-Market Wrap — India | January 1, 2026",
            edition: "post_market",
            market: "IN",
            created_at: "2026-01-01T12:00:00.000Z",
        };
        for (let i = 1; i <= 5; i++) {
            newsletter[`heading_${i}`] = `Section Heading ${i}`;
            for (let j = 1; j <= 5; j++) {
                newsletter[`heading_${i}_subheading_${j}`] = `Sub ${i}-${j}`;
                newsletter[`heading_${i}_subheading_${j}_content`] = `Body text for ${i}-${j}.`;
            }
        }

        const html = generateNewsletterHTML(newsletter);

        expect(html).toContain("Post-Market Wrap — India | January 1, 2026");
        expect(html).toContain("Post-Market Wrap");
        expect(html).toContain("India");
        expect(html).toContain("What moved & why"); // edition tagline in the badge, unescaped
        expect(html).toContain("Section Heading 1");
        expect(html).toContain("Sub 3-2");
        expect(html).toContain("Body text for 3-2.");
        expect(html).not.toMatch(/undefined/);
        expect(html).not.toMatch(/\bnull\b/);
    });

    it("falls back to default title/badge when edition, market and title are absent", async () => {
        const generateNewsletterHTML = await loadHTML();
        const html = generateNewsletterHTML({ created_at: "2026-01-01T00:00:00.000Z" });

        expect(html).toContain("Xtin Market Newsletter");
        expect(html).toContain("Financial News Made Simple");
        expect(html).not.toMatch(/undefined/);
        expect(html).not.toMatch(/\bnull\b/);
    });

    it("omits heading blocks entirely when a heading has no title, rather than rendering empty/undefined markup", async () => {
        const generateNewsletterHTML = await loadHTML();
        const html = generateNewsletterHTML({
            title: "Sparse Edition",
            created_at: "2026-01-01T00:00:00.000Z",
            heading_1: "Only Heading",
            heading_1_subheading_1: "Only Sub",
            heading_1_subheading_1_content: "Only content.",
            // heading_2..5 intentionally absent
        });

        expect(html).toContain("Only Heading");
        expect((html.match(/class="heading"/g) || []).length).toBe(1);
        expect(html).not.toMatch(/undefined/);
    });

    it("omits a subheading block when content is present but the subheading title is missing (and vice versa)", async () => {
        const generateNewsletterHTML = await loadHTML();
        const html = generateNewsletterHTML({
            title: "Edge Case Edition",
            created_at: "2026-01-01T00:00:00.000Z",
            heading_1: "Heading One",
            heading_1_subheading_1_content: "Orphaned content with no subheading title.",
            heading_1_subheading_2: "Orphaned subheading with no content",
        });

        expect(html).not.toContain("Orphaned content with no subheading title.");
        expect(html).not.toContain("Orphaned subheading with no content");
        expect(html).not.toMatch(/undefined/);
    });

    it("renders distinct output for pre_market vs post_market editions and different markets", async () => {
        const generateNewsletterHTML = await loadHTML();
        const preUS = generateNewsletterHTML({
            title: "Pre-Market — US",
            edition: "pre_market",
            market: "US",
            created_at: "2026-01-01T00:00:00.000Z",
        });
        const postGlobal = generateNewsletterHTML({
            title: "Post-Market — Global",
            edition: "post_market",
            market: "GLOBAL",
            created_at: "2026-01-01T00:00:00.000Z",
        });

        expect(preUS).toContain("Pre-Market Brief");
        expect(preUS).toContain("United States");
        expect(postGlobal).toContain("Post-Market Wrap");
        expect(postGlobal).toContain("Global");
        expect(preUS).not.toBe(postGlobal);
    });
});
