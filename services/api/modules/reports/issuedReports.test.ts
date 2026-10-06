import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({ existing: null as any, inserted: null as any }));
vi.mock("../../supabase/index.js", () => ({
    default: {
        from: () => ({
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: db.existing, error: null }) }) }),
            insert: async (row: any) => { db.inserted = row; return { error: null }; },
        }),
    },
}));
vi.mock("../../middlewares/auth.js", () => ({ authenticate: (_q: any, _s: any, n: any) => n() }));

import { register, verify, holderLabel } from "./issuedReports.js";

const FP = "7E37-2E93-81BC-6116-5E86-C5C0-B5A8-6818";
const NO = "XC-JN-20261006-7E372E93";
const res = () => { const r: any = { code: 0, body: null, status(c: number) { this.code = c; return this; }, json(b: any) { this.body = b; return this; } }; return r; };
const user = { authId: "u1", first_name: "Suraj", last_name: "Nandan", email: "s@x.com" };

beforeEach(() => { db.existing = null; db.inserted = null; });

describe("holderLabel", () => {
    it("shows first name + last initial only", () => {
        expect(holderLabel("Suraj Nandan")).toBe("Suraj N.");
        expect(holderLabel("", "abc@x.com")).toBe("A***");
    });
});

describe("register", () => {
    it("records a new report for the signed-in user", async () => {
        const r = res();
        await register({ body: { report_no: NO, fingerprint: FP }, user }, r);
        expect(r.code).toBe(201);
        expect(db.inserted).toMatchObject({ report_no: NO, user_id: "u1", holder_name: "Suraj N.", kind: "journal" });
    });
    it("refuses a number already held by different content", async () => {
        db.existing = { fingerprint: "AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA", user_id: "u1" };
        const r = res();
        await register({ body: { report_no: NO, fingerprint: FP }, user }, r);
        expect(r.code).toBe(409);
    });
    it("rejects malformed input and server-only types", async () => {
        const a = res(); await register({ body: { report_no: "nope", fingerprint: FP }, user }, a); expect(a.code).toBe(400);
        const b = res(); await register({ body: { report_no: "XC-FK-AN-20261006-7E372E93", fingerprint: FP }, user }, b); expect(b.code).toBe(400);
    });
});

describe("verify", () => {
    it("matches a genuine copy and flags an altered one", async () => {
        db.existing = { report_no: NO, kind: "journal", fingerprint: FP, holder_name: "Suraj N.", issued_at: "2026-10-06T10:00:00Z" };
        const ok = res(); await verify({ query: { report_no: NO, fingerprint: FP } }, ok);
        expect(ok.body).toMatchObject({ found: true, issued_to: "Suraj N.", fingerprint_match: true });
        const bad = res(); await verify({ query: { report_no: NO, fingerprint: "AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA" } }, bad);
        expect(bad.body.fingerprint_match).toBe(false);
    });
    it("says not found for unknown numbers", async () => {
        const r = res(); await verify({ query: { report_no: NO } }, r);
        expect(r.body).toEqual({ found: false });
    });
});
