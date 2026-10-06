import { describe, it, expect, vi, beforeEach } from "vitest";

// Records every delete the service issues against a fake Supabase client.
const calls: Array<{ table: string; op: string; col?: string; val?: unknown }> = [];
let failTable: string | null = null;
const deleteUser = vi.fn(async () => ({ error: null }));

function builder(table: string) {
    const result = () => ({ error: failTable === table ? { message: "boom" } : null, data: table === "users" ? [{ id: "legacy-1" }] : [] });
    const b: any = {
        select: () => b,
        delete: () => {
            calls.push({ table, op: "delete" });
            return b;
        },
        eq: (col: string, val: unknown) => {
            calls.push({ table, op: "eq", col, val });
            return b;
        },
        in: (col: string, val: unknown) => {
            calls.push({ table, op: "in", col, val });
            return b;
        },
        ilike: (col: string, val: unknown) => {
            calls.push({ table, op: "ilike", col, val });
            return b;
        },
        then: (resolve: (v: unknown) => void) => resolve(result()),
    };
    return b;
}

vi.mock("../../supabase/index.js", () => ({
    default: {
        from: (table: string) => builder(table),
        storage: { from: () => ({ list: async () => ({ data: [], error: null }), remove: async () => ({ error: null }) }) },
        auth: { admin: { deleteUser } },
    },
}));

const { deleteAccountData } = await import("./accountDeletion.js");
const AUTH = "11111111-2222-3333-4444-555555555555";

describe("deleteAccountData", () => {
    beforeEach(() => {
        calls.length = 0;
        failTable = null;
        deleteUser.mockClear();
    });

    it("deletes per-user rows for both ids, email rows, profiles, then the auth user", async () => {
        const result = await deleteAccountData({ authId: AUTH, userId: AUTH, email: "Some_One@Example.com" });
        expect(result.ok).toBe(true);
        const journal = calls.find((c) => c.table === "journal_trades" && c.op === "in");
        expect(journal?.val).toEqual([AUTH, "legacy-1"]);
        expect(calls.some((c) => c.table === "user_subscriptions" && c.col === "auth_id" && c.val === AUTH)).toBe(true);
        // "_" is escaped so it can't wildcard-match another address.
        expect(calls.find((c) => c.table === "newsletter_subscribers" && c.op === "ilike")?.val).toBe("some\\_one@example.com");
        expect(calls.some((c) => c.table === "payment_fulfillments")).toBe(false);
        expect(deleteUser).toHaveBeenCalledWith(AUTH);
    });

    it("keeps the login when any data delete fails, so the user can retry", async () => {
        failTable = "gini_assets";
        const result = await deleteAccountData({ authId: AUTH, email: "a@b.com" });
        expect(result.ok).toBe(false);
        expect(result.failures[0]).toContain("gini_assets");
        expect(deleteUser).not.toHaveBeenCalled();
        expect(calls.some((c) => c.table === "users" && c.op === "delete")).toBe(false);
    });

    it("refuses a malformed account id", async () => {
        const result = await deleteAccountData({ authId: "not-a-uuid" });
        expect(result.ok).toBe(false);
        expect(calls.length).toBe(0);
    });
});
