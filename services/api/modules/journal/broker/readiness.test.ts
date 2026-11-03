import { describe, it, expect } from "vitest";
import { buildReadiness, type ReadinessInput } from "./readiness.js";

const NOW = Date.parse("2026-11-03T12:00:00Z");
const good = (over: Partial<ReadinessInput> = {}): ReadinessInput => ({
    now: NOW,
    nodeEnv: "production",
    syncEnabled: true,
    adapter: "xts",
    adapterRequested: "xts",
    xtsConfigured: true,
    proxy: "none",
    consentVersion: "2026-11-v1",
    adminCount: 2,
    emailConfigured: true,
    schedulerOff: false,
    cronTokenSet: true,
    schemaMissing: [],
    links: { pending: 0, active: 12, revoked: 1, outdatedConsent: 0 },
    lastRun: { status: "success", started_at: new Date(NOW - 2 * 3_600_000).toISOString(), result: { total: 12, synced: 12, failed: 0 } },
    pilot: null,
    ...over,
});
const by = (r: ReturnType<typeof buildReadiness>, id: string) => r.checks.find((c) => c.id === id)!;

describe("buildReadiness", () => {
    it("is ready, with every check ok, when everything is in place", () => {
        const r = buildReadiness(good());
        expect(r.ready).toBe(true);
        expect(r.checks.filter((c) => c.status !== "ok")).toEqual([]);
        expect(r.summary).toEqual({ ok: r.checks.length, warn: 0, fail: 0 });
    });

    it("never repeats a key, password or address", () => {
        const text = JSON.stringify(buildReadiness(good({ proxy: "valid", pilot: ["a@x.test"] })));
        expect(text).not.toMatch(/secret|password|http:\/\/|https:\/\//i);
    });

    describe("the database", () => {
        it("fails, naming what is missing, if a migration hasn't been run", () => {
            const r = buildReadiness(good({ schemaMissing: ["broker_links (migration 0019)", "broker_links review columns (migration 0020)"] }));
            expect(by(r, "database")).toMatchObject({ status: "fail" });
            expect(by(r, "database").detail).toContain("broker_links (migration 0019); broker_links review columns (migration 0020)");
            expect(r.ready).toBe(false);
        });
    });

    describe("the switch and the adapter", () => {
        it("only warns when sync is off, since that is right before launch", () => {
            const r = buildReadiness(good({ syncEnabled: false }));
            expect(by(r, "switch").status).toBe("warn");
            expect(r.ready).toBe(true);
        });

        it("warns about the sample adapter, and fails a requested real one that can't be built", () => {
            expect(by(buildReadiness(good({ adapter: "mock", adapterRequested: "mock" })), "adapter").status).toBe("warn");
            expect(by(buildReadiness(good({ adapter: null, adapterRequested: undefined })), "adapter").status).toBe("warn");
            const broken = buildReadiness(good({ adapter: null, adapterRequested: "xts", xtsConfigured: false }));
            expect(by(broken, "adapter").status).toBe("fail");
            expect(by(broken, "settings").status).toBe("fail");
            expect(broken.ready).toBe(false);
        });

        it("only warns about missing broker settings while no real adapter is asked for", () => {
            expect(by(buildReadiness(good({ adapter: null, adapterRequested: undefined, xtsConfigured: false })), "settings").status).toBe("warn");
        });

        it("fails a proxy address that isn't valid, and says which route is used otherwise", () => {
            expect(by(buildReadiness(good({ proxy: "invalid" })), "proxy").status).toBe("fail");
            expect(by(buildReadiness(good({ proxy: "valid" })), "proxy").detail).toContain("fixed-address proxy");
            expect(by(buildReadiness(good({ proxy: "none" })), "proxy").detail).toContain("directly");
        });
    });

    describe("consent and alerts", () => {
        it("warns while the consent wording is still the draft", () => {
            const r = buildReadiness(good({ consentVersion: "draft-1" }));
            expect(by(r, "consent").status).toBe("warn");
            expect(by(r, "consent").detail).toContain("draft-1");
            expect(r.ready).toBe(true);
        });

        it("warns when nobody would be emailed, for either reason", () => {
            expect(by(buildReadiness(good({ emailConfigured: false })), "alerts").detail).toContain("No email is set up");
            expect(by(buildReadiness(good({ adminCount: 0 })), "alerts").detail).toContain("No admin email address");
            expect(by(buildReadiness(good({ adminCount: 1 })), "alerts").detail).toContain("1 admin will");
        });
    });

    describe("what will run the sync", () => {
        it("is fine with the built-in timetable", () => {
            expect(by(buildReadiness(good()), "schedule").status).toBe("ok");
        });

        it("warns when the timetable is off but an outside trigger can run it", () => {
            expect(by(buildReadiness(good({ schedulerOff: true, cronTokenSet: true })), "schedule").status).toBe("warn");
        });

        it("fails when nothing could start a sync at all", () => {
            const r = buildReadiness(good({ schedulerOff: true, cronTokenSet: false }));
            expect(by(r, "schedule").status).toBe("fail");
            expect(r.ready).toBe(false);
        });
    });

    describe("the last sync", () => {
        const run = (status: string, hoursAgo: number, result: Record<string, unknown> = {}) => ({ status, started_at: new Date(NOW - hoursAgo * 3_600_000).toISOString(), result });

        it("warns if none has run", () => {
            expect(by(buildReadiness(good({ lastRun: null })), "lastRun").status).toBe("warn");
        });

        it("fails, with the reason, if the last one failed", () => {
            const r = buildReadiness(good({ lastRun: run("failed", 1, { error: "XTS: Invalid token" }) }));
            expect(by(r, "lastRun")).toMatchObject({ status: "fail" });
            expect(by(r, "lastRun").detail).toContain("XTS: Invalid token");
            expect(r.ready).toBe(false);
        });

        it("is fine if one is running, or the last finished cleanly", () => {
            expect(by(buildReadiness(good({ lastRun: run("running", 0) })), "lastRun").status).toBe("ok");
            expect(by(buildReadiness(good({ lastRun: run("success", 20, { total: 5, synced: 5, failed: 0 }) })), "lastRun").detail).toContain("5 customers");
            expect(by(buildReadiness(good({ lastRun: run("success", 20, { total: 1, synced: 1, failed: 0 }) })), "lastRun").detail).toContain("1 customer ");
        });

        it("warns if it only partly worked", () => {
            const r = buildReadiness(good({ lastRun: run("success", 3, { total: 10, synced: 8, failed: 2 }) }));
            expect(by(r, "lastRun")).toMatchObject({ status: "warn" });
            expect(by(r, "lastRun").detail).toContain("2 of 10");
        });

        it("allows for a weekend, and warns after longer", () => {
            expect(by(buildReadiness(good({ lastRun: run("success", 60, { total: 1, synced: 1, failed: 0 }) })), "lastRun").status).toBe("ok"); // Friday night to Monday
            expect(by(buildReadiness(good({ lastRun: run("success", 100, { total: 1, synced: 1, failed: 0 }) })), "lastRun").status).toBe("warn");
        });
    });

    describe("who can use it, and who is waiting", () => {
        it("describes a trial and an open launch", () => {
            expect(by(buildReadiness(good({ pilot: ["a@x.test", "b@x.test"] })), "rollout").detail).toContain("A trial: 2 customers");
            expect(by(buildReadiness(good({ pilot: ["a@x.test"] })), "rollout").detail).toContain("1 customer ");
            expect(by(buildReadiness(good({ pilot: null })), "rollout").detail).toContain("Open to every Journal Pro customer");
        });

        it("flags requests waiting and customers who haven't re-confirmed consent", () => {
            const r = buildReadiness(good({ links: { pending: 3, active: 10, revoked: 0, outdatedConsent: 2 } }));
            expect(by(r, "waiting")).toMatchObject({ status: "warn" });
            expect(by(r, "waiting").detail).toContain("3 requests are waiting");
            expect(by(r, "outdated").detail).toContain("2 linked customers haven't confirmed");
            expect(buildReadiness(good({ links: { pending: 1, active: 0, revoked: 0, outdatedConsent: 1 } })).checks.find((c) => c.id === "waiting")!.detail).toContain("1 request is waiting");
        });
    });

    it("is not ready as soon as anything fails, whatever else is fine", () => {
        for (const broken of [{ schemaMissing: ["x"] }, { proxy: "invalid" as const }, { schedulerOff: true, cronTokenSet: false }]) {
            expect(buildReadiness(good(broken)).ready, JSON.stringify(broken)).toBe(false);
        }
    });

    it("keeps its checks in a steady order, each with a distinct id", () => {
        const ids = buildReadiness(good()).checks.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids[0]).toBe("database");
    });
});
