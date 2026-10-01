import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, _resetRateLimits } from "./rateLimit.js";

const call = (mw, req) => {
    const res: any = { statusCode: 200, headers: {} as Record<string, string> };
    res.status = (c: number) => ((res.statusCode = c), res);
    res.json = (b: unknown) => ((res.body = b), res);
    res.set = (k: string, v: string) => ((res.headers[k] = v), res);
    let passed = false;
    mw(req, res, () => (passed = true));
    return { res, passed };
};

beforeEach(() => _resetRateLimits());

describe("rateLimit", () => {
    const mw = rateLimit("t", [{ limit: 3, seconds: 60 }, { limit: 5, seconds: 3600 }], "running backtests");

    it("lets normal use through, then explains exactly what is too fast and how long to wait", () => {
        const req = { user: { authId: "u1" }, ip: "1.1.1.1" };
        for (let i = 0; i < 3; i++) expect(call(mw, req).passed).toBe(true);
        const { res, passed } = call(mw, req);
        expect(passed).toBe(false);
        expect(res.statusCode).toBe(429);
        expect(res.body).toMatchObject({ code: "RATE_LIMITED" });
        expect(res.body.error).toMatch(/You're running backtests too quickly \(more than 3 in 60 seconds\)\. Please wait \d+ seconds?/);
        expect(Number(res.headers["Retry-After"])).toBeGreaterThan(0);
    });

    it("counts per user, so people sharing an office IP don't block each other", () => {
        for (let i = 0; i < 3; i++) call(mw, { user: { authId: "a" }, ip: "same" });
        expect(call(mw, { user: { authId: "a" }, ip: "same" }).passed).toBe(false);
        expect(call(mw, { user: { authId: "b" }, ip: "same" }).passed).toBe(true);
    });

    it("falls back to the client address for anonymous calls", () => {
        for (let i = 0; i < 3; i++) call(mw, { ip: "9.9.9.9" });
        expect(call(mw, { ip: "9.9.9.9" }).passed).toBe(false);
        expect(call(mw, { ip: "8.8.8.8" }).passed).toBe(true);
    });
});
