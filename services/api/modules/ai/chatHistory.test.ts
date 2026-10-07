import { describe, it, expect, vi, beforeEach } from "vitest";

// A tiny fake Supabase: records each query and answers from `answers[table]`.
const { calls, answers } = vi.hoisted(() => ({
    calls: [] as Array<Record<string, unknown>>,
    answers: {} as Record<string, () => { data: unknown; error: unknown }>,
}));

function builder(table: string) {
    const q: Record<string, unknown> = { table };
    calls.push(q);
    const done = () => (answers[table] || (() => ({ data: null, error: null })))();
    const b: any = {
        select: () => b,
        insert: (rows: unknown) => ((q.insert = rows), b),
        update: (patch: unknown) => ((q.update = patch), b),
        delete: () => ((q.delete = true), b),
        eq: (col: string, val: unknown) => ((q[`eq:${col}`] = val), b),
        order: () => b,
        limit: () => b,
        maybeSingle: () => Promise.resolve(done()),
        single: () => Promise.resolve(done()),
        then: (resolve: (v: unknown) => void) => resolve(done()),
    };
    return b;
}

vi.mock("../../supabase/index.js", () => ({ default: { from: (t: string) => builder(t) } }));
vi.mock("../../middlewares/auth.js", () => ({ authenticate: (_req, _res, next) => next() }));

const { saveExchange, titleFrom, chatHistoryRouter } = await import("./chatHistory.js");

const CONVO = "11111111-2222-3333-4444-555555555555";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

beforeEach(() => {
    calls.length = 0;
    for (const k of Object.keys(answers)) delete answers[k];
});

describe("titleFrom", () => {
    it("uses the first question on one line, shortened", () => {
        expect(titleFrom("  How do I\nstart a SIP?  ")).toBe("How do I start a SIP?");
        expect(titleFrom("x".repeat(200))).toHaveLength(80);
        expect(titleFrom("   ")).toBe("New chat");
    });
});

describe("saveExchange", () => {
    it("starts a new conversation and stores question then reply", async () => {
        answers.ai_conversations = () => ({ data: { id: CONVO }, error: null });
        const id = await saveExchange({ app: "gini", userId: USER, question: "Am I saving enough?", reply: "Mostly, yes." });
        expect(id).toBe(CONVO);
        const created = calls.find((c) => c.table === "ai_conversations" && c.insert) as any;
        expect(created.insert).toMatchObject({ user_id: USER, app: "gini", title: "Am I saving enough?" });
        const msgs = (calls.find((c) => c.table === "ai_messages") as any).insert;
        expect(msgs.map((m: any) => m.role)).toEqual(["user", "assistant"]);
        expect(msgs[1].created_at > msgs[0].created_at).toBe(true);
    });

    it("continues the user's own conversation in the same app", async () => {
        answers.ai_conversations = () => ({ data: { id: CONVO }, error: null });
        await saveExchange({ app: "journal", userId: USER, conversationId: CONVO, question: "And now?", reply: "Better." });
        const lookup = calls.find((c) => c.table === "ai_conversations" && c["eq:id"]) as any;
        expect(lookup).toMatchObject({ "eq:id": CONVO, "eq:user_id": USER, "eq:app": "journal" });
        expect(calls.some((c) => c.table === "ai_conversations" && c.insert)).toBe(false);
        expect(calls.some((c) => c.table === "ai_conversations" && c.update)).toBe(true);
    });

    it("never throws — a failed save still lets the chat answer", async () => {
        answers.ai_conversations = () => ({ data: null, error: { message: "db down" } });
        await expect(saveExchange({ app: "gini", userId: USER, question: "q", reply: "r" })).resolves.toBeNull();
    });
});

describe("chatHistoryRouter", () => {
    const handler = (router: any, method: string, path: string) =>
        router.stack.find((l: any) => l.route?.path === path && l.route.methods[method]).route.stack.at(-1).handle;
    const response = () => {
        const res: any = { statusCode: 200, body: null, status(c: number) { res.statusCode = c; return res; }, json(b: unknown) { res.body = b; return res; } };
        return res;
    };

    it("lists nothing for free users so the page can show the upsell", async () => {
        const router = chatHistoryRouter("gini", async () => false);
        const res = response();
        await handler(router, "get", "/gini/chat/conversations")({ user: { authId: USER } }, res);
        expect(res.body).toEqual({ pro: false, conversations: [] });
        expect(calls).toHaveLength(0);
    });

    it("lists only this user's conversations in this app for Pro", async () => {
        answers.ai_conversations = () => ({ data: [{ id: CONVO, title: "t" }], error: null });
        const router = chatHistoryRouter("journal", async () => true);
        const res = response();
        await handler(router, "get", "/journal/chat/conversations")({ user: { authId: USER } }, res);
        expect(res.body).toMatchObject({ pro: true, conversations: [{ id: CONVO }] });
        expect(calls[0]).toMatchObject({ "eq:user_id": USER, "eq:app": "journal" });
    });

    it("won't open someone else's conversation", async () => {
        answers.ai_conversations = () => ({ data: null, error: null });
        const router = chatHistoryRouter("gini", async () => true);
        const res = response();
        await handler(router, "get", "/gini/chat/conversations/:id")({ user: { authId: USER }, params: { id: CONVO } }, res);
        expect(res.statusCode).toBe(404);
        expect(calls.some((c) => c.table === "ai_messages")).toBe(false);
    });

    it("lets anyone delete their own chats, Pro or not", async () => {
        answers.ai_conversations = () => ({ data: { id: CONVO }, error: null });
        const router = chatHistoryRouter("gini", async () => false);
        const res = response();
        await handler(router, "delete", "/gini/chat/conversations/:id")({ user: { authId: USER }, params: { id: CONVO } }, res);
        expect(res.body).toEqual({ success: true });
        expect(calls.find((c) => c.delete)).toMatchObject({ "eq:id": CONVO, "eq:user_id": USER });
    });
});
