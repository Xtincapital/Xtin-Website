// Coverage for the free-token grant in getOrCreateWallet, raised from 5,000
// to Journal's amount (now 30,000): wallets granted the old 5,000 are
// topped up by the difference exactly once.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// A chainable stand-in for the supabase query builder. Each terminal call
// (maybeSingle/single) resolves the next queued result; every call is logged.
const calls: Array<[string, unknown[]]> = [];
const results: Array<{ data: unknown; error: unknown }> = [];
const builder: any = new Proxy(
    {},
    {
        get(_t, method: string) {
            return (...args: unknown[]) => {
                calls.push([method, args]);
                if (method === "maybeSingle" || method === "single") return Promise.resolve(results.shift());
                return builder;
            };
        },
    }
);

vi.mock("../../supabase/index.js", () => ({ default: builder }));

const { getOrCreateWallet } = await import("./aiWallet.repository.js");

const wallet = (over: Record<string, unknown>) => ({
    user_id: "u1",
    token_balance: 3_000,
    tokens_purchased: 0,
    tokens_used: 2_000,
    free_tokens_granted: 5_000,
    free_tokens_granted_at: "2026-09-01T00:00:00.000Z",
    last_recharge: null,
    updated_at: "2026-09-01T00:00:00.000Z",
    ...over,
});

const updateArgs = () => calls.find(([m]) => m === "update")?.[1][0] as Record<string, unknown> | undefined;

describe("getOrCreateWallet free-token grant", () => {
    beforeEach(() => {
        calls.length = 0;
        results.length = 0;
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("GINI_FREE_AI_TOKENS", "");
    });
    afterEach(() => vi.unstubAllEnvs());

    it("gives a new wallet 30,000 tokens", async () => {
        results.push({ data: null, error: null }, { data: wallet({ token_balance: 30_000, free_tokens_granted: 30_000 }), error: null });
        await getOrCreateWallet("u1");
        const inserted = calls.find(([m]) => m === "insert")?.[1][0] as Record<string, unknown>;
        expect(inserted).toMatchObject({ token_balance: 30_000, free_tokens_granted: 30_000 });
    });

    it("tops up a wallet granted the old 5,000 by the difference, guarded on the old grant", async () => {
        const topped = wallet({ token_balance: 28_000, free_tokens_granted: 30_000 });
        results.push({ data: wallet({}), error: null }, { data: topped, error: null });
        expect(await getOrCreateWallet("u1")).toEqual(topped);
        expect(updateArgs()).toMatchObject({ token_balance: 28_000, free_tokens_granted: 30_000 });
        expect(calls).toContainEqual(["eq", ["free_tokens_granted", 5_000]]);
    });

    it("does not top up again once the full grant is recorded", async () => {
        const current = wallet({ token_balance: 120_000, free_tokens_granted: 30_000 });
        results.push({ data: current, error: null });
        expect(await getOrCreateWallet("u1")).toEqual(current);
        expect(updateArgs()).toBeUndefined();
    });

    it("returns the fresh row when a concurrent request already topped up", async () => {
        const fresh = wallet({ token_balance: 28_000, free_tokens_granted: 30_000 });
        results.push({ data: wallet({}), error: null }, { data: null, error: null }, { data: fresh, error: null });
        expect(await getOrCreateWallet("u1")).toEqual(fresh);
    });
});

describe("lowering the free grant", () => {
    beforeEach(() => {
        calls.length = 0;
        results.length = 0;
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("GINI_FREE_AI_TOKENS", "");
    });
    afterEach(() => vi.unstubAllEnvs());

    it("never takes tokens back from a wallet granted the old 300,000", async () => {
        const current = wallet({ token_balance: 250_000, free_tokens_granted: 300_000 });
        results.push({ data: current, error: null });
        expect(await getOrCreateWallet("u1")).toEqual(current);
        expect(updateArgs()).toBeUndefined();
    });
});
