import { describe, it, expect, vi, beforeEach } from "vitest";

const { rpc, queries, nextResult } = vi.hoisted(() => ({
    rpc: vi.fn(),
    queries: [] as Array<Record<string, unknown>>,
    nextResult: { value: { data: null as unknown, error: null as unknown } },
}));

function builder(table: string) {
    const q: Record<string, unknown> = { table };
    queries.push(q);
    const b: any = {
        select: (cols: string) => ((q.select = cols), b),
        update: (val: unknown) => ((q.update = val), b),
        eq: (col: string, val: unknown) => ((q[`eq:${col}`] = val), b),
        in: (col: string, val: unknown) => ((q[`in:${col}`] = val), b),
        or: (filter: string) => ((q.or = filter), b),
        order: () => b,
        limit: () => b,
        maybeSingle: () => b,
        then: (resolve: (v: unknown) => void) => resolve(nextResult.value),
    };
    return b;
}

vi.mock("../../supabase/index.js", () => ({ default: { rpc, from: (t: string) => builder(t) } }));
vi.mock("../../middlewares/auth.js", () => ({ authenticate: (_req, _res, next) => next() }));

const { describePurchase, issueReceipt, listMyReceipts, getMyReceiptByOrder } = await import("./receipts.js");

function response() {
    const res = { statusCode: 200, payload: null as any, status(c: number) { res.statusCode = c; return res; }, json(p: unknown) { res.payload = p; return res; } };
    return res;
}

beforeEach(() => {
    rpc.mockReset();
    queries.length = 0;
    nextResult.value = { data: null, error: null };
});

describe("describePurchase", () => {
    it("names each product from the order's own notes", () => {
        expect(describePurchase("journal_pro_plan", { plan_id: "journal_pro_yearly" })).toBe("Xtin Journal Pro — Yearly");
        expect(describePurchase("gini_pro_plan", { plan_id: "pro_monthly" })).toBe("Gini Pro — Monthly");
        expect(describePurchase("xtin_learn_pro", { planId: "learn_pro_yearly" })).toBe("Learn Pro — Yearly");
        expect(describePurchase("gini_ai_tokens", { tokens: "700000" })).toBe("Gini AI Pack — 700K tokens");
        expect(describePurchase("fundakamental_tokens", { tokens: "1200000" })).toBe("FundaKaMental Token Pack — 1.2M tokens");
        expect(describePurchase("xtin_algo_subscription", { algo_name: "GreenZone", plan_type: "monthly" })).toBe("Algo Subscription — GreenZone — Monthly");
        expect(describePurchase("xtin_bundle", { plan_name: "Ultimate Pass", billing_cycle: "annual" })).toBe("Ultimate Pass — Yearly");
        expect(describePurchase("backtest_pro_pass", { pass_id: "event" })).toBe("Backtest Pro — Event Pass");
    });

    it("falls back to a readable name for products it doesn't know", () => {
        expect(describePurchase("some_new_thing", {})).toBe("Some New Thing");
    });
});

describe("issueReceipt", () => {
    const input = {
        order: { id: "order_ABC123", amount: 49900, currency: "INR" },
        payment: { id: "pay_1", created_at: 1_790_000_000 },
        product: "fundakamental_pro",
        notes: { plan_id: "pro_monthly" },
        user: { userId: "user-1", authId: "auth-1", email: "a@b.c" },
    };

    it("issues through the numbering function with what the order says was paid", async () => {
        rpc.mockResolvedValue({ data: { receipt_no: "XTN/2026-27/00001" }, error: null });
        const receipt = await issueReceipt(input);
        expect(receipt?.receipt_no).toBe("XTN/2026-27/00001");
        expect(rpc).toHaveBeenCalledWith(
            "issue_payment_receipt",
            expect.objectContaining({
                p_order_id: "order_ABC123",
                p_amount: 49900,
                p_currency: "INR",
                p_description: "FundaKaMental Pro — Monthly",
                p_user_id: "user-1",
                p_auth_id: "auth-1",
                p_paid_at: new Date(1_790_000_000 * 1000).toISOString(),
                p_source: "live",
            })
        );
    });

    it("never throws — a receipt failure must not fail a paid order", async () => {
        rpc.mockResolvedValue({ data: null, error: { message: "Could not find the function public.issue_payment_receipt" } });
        await expect(issueReceipt(input)).resolves.toBeNull();
        rpc.mockRejectedValue(new Error("network down"));
        await expect(issueReceipt(input)).resolves.toBeNull();
    });
});

describe("receipt routes", () => {
    it("lists only the signed-in user's receipts", async () => {
        nextResult.value = { data: [{ receipt_no: "XTN/2026-27/00001" }], error: null };
        const res = response();
        await listMyReceipts({ user: { authId: "11111111-2222-3333-4444-555555555555", userId: "user-1" } }, res);
        expect(res.payload.receipts).toHaveLength(1);
        expect(queries[0].or).toBe("auth_id.eq.11111111-2222-3333-4444-555555555555,user_id.eq.user-1");
        expect(String(queries[0].select)).not.toContain("user_id");
    });

    it("never builds a filter from ids with PostgREST syntax in them", async () => {
        const res = response();
        await listMyReceipts({ user: { authId: "x,user_id.neq.0", userId: "" } }, res);
        expect(res.statusCode).toBe(401);
        expect(queries).toHaveLength(0);
    });

    it("looks up one order's receipt scoped to the owner, and 404s for anyone else", async () => {
        const res = response();
        await getMyReceiptByOrder({ params: { orderId: "order_ABC123" }, user: { authId: "auth-1", userId: "user-1" } }, res);
        expect(res.statusCode).toBe(404);
        expect(queries[0]["eq:order_id"]).toBe("order_ABC123");
        expect(queries[0].or).toBe("auth_id.eq.auth-1,user_id.eq.user-1");
    });

    it("rejects malformed order ids", async () => {
        const res = response();
        await getMyReceiptByOrder({ params: { orderId: "order_1,auth_id.neq.x" }, user: { authId: "auth-1" } }, res);
        expect(res.statusCode).toBe(400);
        expect(queries).toHaveLength(0);
    });
});
