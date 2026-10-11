// Coverage for authenticate() — the sole gate in front of every protected
// route in this app. Mocks ../supabase/index.js entirely (that module
// throws at import time if SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY aren't
// set, and this is a unit test of the middleware's branching logic, not an
// integration test against a real Supabase project).
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mockGetClaims = vi.fn();
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ auth: { getClaims: mockGetClaims } })) }));

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockSupabase = { from: mockFrom };

vi.mock("../supabase/index.js", () => ({ default: mockSupabase }));

const claims = (sub: string, email: string, user_metadata: Record<string, unknown> = {}) => ({
    data: { claims: { sub, email, user_metadata } },
    error: null,
});

const { authenticate, authorize, requireAdmin, forgetCachedProfile } = await import("./auth.js");

function makeReq(token?: string) {
    return { headers: { authorization: token ? `Bearer ${token}` : undefined } } as any;
}

function makeRes() {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
}

describe("authenticate", () => {
    const originalUrl = process.env.SUPABASE_URL;
    const originalAnonKey = process.env.SUPABASE_ANON_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SUPABASE_URL = "https://example.supabase.co";
        process.env.SUPABASE_ANON_KEY = "anon-key";
    });

    afterAll(() => {
        process.env.SUPABASE_URL = originalUrl;
        process.env.SUPABASE_ANON_KEY = originalAnonKey;
    });

    it("rejects a request with no Authorization header", async () => {
        const req = makeReq();
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("rejects when Supabase env vars are missing", async () => {
        delete process.env.SUPABASE_URL;
        const req = makeReq("some-token");
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

    it("rejects an invalid token (signature check fails)", async () => {
        mockGetClaims.mockResolvedValue({ data: null, error: { message: "Invalid JWT signature" } });
        const req = makeReq("bad-token");
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("reports token expiry distinctly (code: TOKEN_EXPIRED)", async () => {
        mockGetClaims.mockResolvedValue({ data: null, error: { message: "JWT has expired" } });
        const req = makeReq("expired-token");
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "TOKEN_EXPIRED" }));
    });

    it("accepts a valid Supabase token and populates req.user with authId = the real Supabase uid", async () => {
        mockGetClaims.mockResolvedValue(claims("auth-uuid-123", "person@example.com"));
        mockMaybeSingle.mockResolvedValue({
            data: { id: "profile-uuid-456", email: "person@example.com", first_name: "A", last_name: "B", phone_number: null },
            error: null,
        });

        const req = makeReq("good-token");
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toMatchObject({
            userId: "profile-uuid-456", // from the public.users row
            authId: "auth-uuid-123", // always the real Supabase uid
            email: "person@example.com",
        });
    });

    it("falls back to the raw Supabase uid for userId when no public.users row exists yet (PGRST116 = no rows found)", async () => {
        mockGetClaims.mockResolvedValue(claims("auth-uuid-789", "new@example.com", { first_name: "New" }));
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        const req = makeReq("good-token-no-profile");
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user.userId).toBe("auth-uuid-789"); // falls back to user.id, not left undefined
        expect(req.user.authId).toBe("auth-uuid-789");
        expect(req.user.first_name).toBe("New");
    });

    it("looks the profile row up once, then serves it from cache until it's forgotten", async () => {
        mockGetClaims.mockResolvedValue(claims("auth-cache-1", "c@example.com"));
        mockMaybeSingle.mockResolvedValue({ data: { id: "p-1", email: "c@example.com", first_name: "C", last_name: "D", phone_number: null }, error: null });

        for (let i = 0; i < 3; i++) await authenticate(makeReq("t"), makeRes(), vi.fn());
        expect(mockMaybeSingle).toHaveBeenCalledTimes(1);

        forgetCachedProfile("auth-cache-1");
        const req = makeReq("t");
        await authenticate(req, makeRes(), vi.fn());
        expect(mockMaybeSingle).toHaveBeenCalledTimes(2);
        expect(req.user.userId).toBe("p-1");
    });

    it("never calls the Supabase Auth server per request", async () => {
        mockGetClaims.mockResolvedValue(claims("auth-x", "x@example.com"));
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });
        await authenticate(makeReq("t"), makeRes(), vi.fn());
        expect(mockGetClaims).toHaveBeenCalledWith("t");
    });

    it("returns 401 (not a 500 crash) when the token check throws", async () => {
        mockGetClaims.mockRejectedValue(new Error("network error"));
        const req = makeReq("some-token");
        const res = makeRes();
        const next = vi.fn();

        await authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});

describe("authorize", () => {
    it("rejects when req.user.role is not in the allowed list", () => {
        const req = { user: { role: "member" } } as any;
        const res = makeRes();
        const next = vi.fn();

        authorize(["admin"])(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it("allows when req.user.role is in the allowed list", () => {
        const req = { user: { role: "admin" } } as any;
        const res = makeRes();
        const next = vi.fn();

        authorize(["admin"])(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });
});

describe("requireAdmin", () => {
    const originalAdmins = process.env.ADMIN_EMAILS;

    afterAll(() => {
        process.env.ADMIN_EMAILS = originalAdmins;
    });

    const run = (email?: string) => {
        const next = vi.fn();
        const res = makeRes();
        requireAdmin({ user: email ? { email } : undefined } as any, res, next);
        return { next, res };
    };

    it("lets the built-in admin through, case-insensitively", () => {
        delete process.env.ADMIN_EMAILS;
        const { next, res } = run("XtinCapital@Gmail.com");
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("lets emails listed in ADMIN_EMAILS through", () => {
        process.env.ADMIN_EMAILS = "owner@example.com, second@example.com";
        expect(run("second@example.com").next).toHaveBeenCalled();
    });

    it("rejects a signed-in user who isn't an admin with 403", () => {
        process.env.ADMIN_EMAILS = "owner@example.com";
        const { next, res } = run("someone@example.com");
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("rejects a request with no user with 403", () => {
        const { next, res } = run();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
