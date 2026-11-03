import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { pairFills } from "./roundTrips.js";
import { statementCsv } from "./statementCsv.testutil.js";
import { toJournalTrade } from "./tradeMapper.js";

// The real router, controller, runner, adapter choice and validators, behind a
// real HTTP server. Only the edges are replaced: sign-in (a header names the
// user), the Pro check (a set of user ids), and the database (in memory).

const uuid = vi.hoisted(() => {
    let n = 0;
    return () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
});

const db = vi.hoisted(() => ({
    links: [] as any[],
    runs: [] as any[],
    pro: new Set<string>(),
    admins: new Set<string>(),
    users: new Map<string, { email: string | null; name: string | null }>(),
    notified: [] as any[],
    problems: [] as any[],
    listFails: false,
    ip: "203.0.113.7",
    ipFails: false,
    adminEmails: ["admin-1@test.example"] as string[],
    schemaMissing: [] as string[],
    seq: 0,
    mem: null as any,
}));

vi.mock("../../../middlewares/auth.js", () => ({
    authenticate: (req: any, res: any, next: any) => {
        const id = req.headers["x-test-user"];
        if (!id) return res.status(401).json({ error: "Access denied. No token provided." });
        const person = db.users.get(String(id));
        req.user = { authId: String(id), email: person?.email ?? `${id}@test.example`, first_name: person?.name?.split(" ")[0], last_name: person?.name?.split(" ").slice(1).join(" ") || undefined };
        next();
    },
    requireAdmin: (req: any, res: any, next: any) => (db.admins.has(req.user.authId) ? next() : res.status(403).json({ error: "Forbidden. Admin access only." })),
    adminEmails: () => db.adminEmails,
}));

// Never ask an outside service for our address in a test.
vi.mock("./xts/egress.js", async (original) => ({
    ...(await original<typeof import("./xts/egress.js")>()),
    lookupOutboundIp: async () => {
        if (db.ipFails) throw new Error("lookup service down");
        return db.ip;
    },
}));

vi.mock("../../../services/adminNotify.service.js", () => ({
    notifyAdminsNewBrokerLink: (info: any) => db.notified.push(info),
    notifyAdminsBrokerSyncProblem: (info: any) => db.problems.push(info),
}));

vi.mock("../planTier.js", () => ({
    requireJournalPro: (req: any, res: any, next: any) => (db.pro.has(req.user.authId) ? next() : res.status(403).json({ error: "Pro only", code: "PRO_REQUIRED" })),
    getPlanTier: async (userId: string) => (db.pro.has(userId) ? "pro" : "free"),
}));

vi.mock("./broker.repository.js", async () => {
    const { memoryStore } = await import("./memoryStore.testutil.js");
    const mem = memoryStore();
    db.mem = mem;
    const live = (userId: string) => db.links.find((l) => l.user_id === userId && l.status !== "revoked") ?? null;
    const store = {
        ...mem.store,
        // A customer whose client code is FAIL01 can't be read, to see how a failing sync is handled.
        async saveFills(link: any, fills: any) {
            if (link.client_code === "FAIL01") throw new Error("broker said no");
            return mem.store.saveFills(link, fills);
        },
        // Like the Supabase store, a recorded sync is written onto the link.
        async recordSync(link: any, outcome: any) {
            const row = db.links.find((l) => l.id === link.id);
            if (row) {
                if ("error" in outcome) Object.assign(row, { last_sync_status: "failed", last_sync_error: outcome.error });
                else Object.assign(row, { last_synced_at: new Date().toISOString(), last_sync_status: "success", last_sync_error: null });
            }
            await mem.store.recordSync(link, outcome);
        },
    };
    return {
        supabaseStore: store,
        getLiveLink: async (userId: string) => live(userId),
        insertLink: async (rec: any) => {
            if (db.links.some((l) => l.broker === rec.broker && l.client_code === rec.client_code && l.status !== "revoked")) return { data: null, error: { code: "23505" } };
            const row = { id: uuid(), opening_positions: [], last_synced_at: null, last_sync_status: null, last_sync_error: null, created_at: new Date().toISOString(), ...rec };
            db.links.push(row);
            return { data: row, error: null };
        },
        revokeLink: async (id: string) => {
            db.links.find((l) => l.id === id).status = "revoked";
        },
        listActiveLinks: async () => {
            if (db.listFails) throw new Error("database is down");
            return db.links.filter((l) => l.status === "active");
        },
        updateLinkConsent: async (id: string, version: string) => {
            const row = db.links.find((l) => l.id === id && l.status !== "revoked");
            return row ? Object.assign(row, { consent_version: version, consent_at: new Date().toISOString() }) : null;
        },
        listRecentRuns: async (n: number) => [...db.runs].reverse().slice(0, n),
        probeSchema: async () => [...db.schemaMissing],
        countLinks: async (version: string) => ({
            pending: db.links.filter((l) => l.status === "pending").length,
            active: db.links.filter((l) => l.status === "active").length,
            revoked: db.links.filter((l) => l.status === "revoked").length,
            outdatedConsent: db.links.filter((l) => l.status === "active" && l.consent_version !== version).length,
        }),
        countSyncedTrades: async (userId: string) => [...mem.trades.values()].filter((t: any) => t.user_id === userId && t.source === "xts").length,
        deleteSyncedData: async (userId: string, code: string) => {
            for (const [k, t] of mem.trades) if ((t as any).user_id === userId && (t as any).source === "xts") mem.trades.delete(k);
            for (const [k, f] of mem.fills) if ((f as any).clientCode === code) mem.fills.delete(k);
        },
        insertFinishedRun: async (source: string, result: unknown) => {
            db.runs.push({ id: `done-${++db.seq}`, source, status: "success", started_at: new Date().toISOString(), result });
        },
        getLinkById: async (id: string) => db.links.find((l) => l.id === id) ?? null,
        getLatestLink: async (userId: string) => [...db.links].reverse().find((l) => l.user_id === userId) ?? null,
        listLinksForReview: async (filter: string) => [...db.links].reverse().filter((l) => filter === "all" || l.status === filter),
        reviewLink: async (id: string, from: string[], patch: any) => {
            const row = db.links.find((l) => l.id === id);
            if (!row || !from.includes(row.status)) return null;
            return Object.assign(row, patch);
        },
        getUsersByAuthIds: async (ids: string[]) => new Map(ids.filter((i) => db.users.has(i)).map((i) => [i, db.users.get(i)!])),
        // The runs still going, earliest first (insertion order stands in for started_at).
        listRunningRuns: async () => db.runs.filter((r) => r.status === "running").map(({ id, started_at, result }) => ({ id, started_at, result })),
        updateRunProgress: async (id: string, progress: unknown) => {
            const run = db.runs.find((r) => r.id === id);
            if (run && run.status === "running") run.result = progress; // like the real one, only while running
        },
        startRun: async (source: string) => {
            const run = { id: `run-${++db.seq}`, source, status: "running", started_at: new Date().toISOString(), result: null };
            db.runs.push(run);
            return { data: { id: run.id }, error: null };
        },
        completeRun: async (id: string, status: string, result: unknown) => {
            Object.assign(
                db.runs.find((r) => r.id === id),
                { status, result },
            );
        },
    };
});

let server: Server;
let base = "";

beforeAll(async () => {
    const { default: router } = await import("./broker.routes.js");
    const app = express();
    app.use(express.json());
    app.use("/api", router);
    await new Promise<void>((resolve) => {
        server = app.listen(0, "127.0.0.1", () => resolve());
    });
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
    db.links.length = 0;
    db.runs.length = 0;
    db.pro.clear();
    db.admins.clear();
    db.users.clear();
    db.notified.length = 0;
    db.problems.length = 0;
    db.listFails = false;
    db.ipFails = false;
    db.adminEmails = ["admin-1@test.example"];
    db.schemaMissing = [];
    db.mem.reset();
    vi.stubEnv("XTS_SYNC_ENABLED", "true");
    vi.stubEnv("XTS_ADAPTER", "mock");
    vi.stubEnv("CRON_SECRET_TOKEN", "cron-secret");
});

afterEach(() => vi.unstubAllEnvs());

async function call(method: string, path: string, opts: { user?: string; body?: unknown; headers?: Record<string, string> } = {}) {
    const res = await fetch(base + path, {
        method,
        headers: { "content-type": "application/json", ...(opts.user ? { "x-test-user": opts.user } : {}), ...opts.headers },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    return { status: res.status, body: (await res.json().catch(() => null)) as any };
}

// "Sync now" remembers each user's last attempt for the life of the process, so tests that sync each use their own user.
let userCount = 0;
const proUser = () => {
    const id = `pro-${++userCount}`;
    db.pro.add(id);
    return id;
};

const CONSENT = { consent: true, consent_version: "draft-1" };
const link = (user: string, code = "ab1234") => call("POST", "/journal/broker/link", { user, body: { client_code: code, ...CONSENT } });
const waitForRun = async () => {
    for (let i = 0; i < 100; i++) {
        if (db.runs.length && db.runs[db.runs.length - 1].status !== "running") return;
        await new Promise((r) => setTimeout(r, 10));
    }
    throw new Error("the sync run never finished");
};

describe("who may call what", () => {
    it("needs a signed-in user for every route except the cron trigger", async () => {
        for (const [method, path] of [
            ["GET", "/journal/broker/status"],
            ["POST", "/journal/broker/link"],
            ["POST", "/journal/broker/consent"],
            ["DELETE", "/journal/broker/link"],
            ["POST", "/journal/broker/sync"],
        ]) {
            expect((await call(method, path)).status, `${method} ${path}`).toBe(401);
        }
    });

    it("keeps linking and syncing to Pro users, but not the status or disconnecting", async () => {
        expect(await link("free-user")).toMatchObject({ status: 403, body: { code: "PRO_REQUIRED" } });
        expect((await call("POST", "/journal/broker/sync", { user: "free-user" })).status).toBe(403);
        expect((await call("GET", "/journal/broker/status", { user: "free-user" })).status).toBe(200);
        expect((await call("DELETE", "/journal/broker/link", { user: "free-user" })).status).toBe(404); // reachable; just nothing to remove
    });
});

describe("status", () => {
    it("reports that sync is off, and still shows the consent wording", async () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        const { status, body } = await call("GET", "/journal/broker/status", { user: "u-status" });
        expect(status).toBe(200);
        expect(body).toMatchObject({ enabled: false, available: false, link: null, synced_trades: 0, consent: { version: "draft-1" } });
        expect(body.consent.text).toMatch(/read-only/);
    });

    it("reports that sync is on only when there is an adapter too", async () => {
        vi.stubEnv("XTS_ADAPTER", "");
        expect((await call("GET", "/journal/broker/status", { user: "u-status" })).body).toMatchObject({ enabled: true, available: false });
        vi.stubEnv("XTS_ADAPTER", "mock");
        expect((await call("GET", "/journal/broker/status", { user: "u-status" })).body).toMatchObject({ enabled: true, available: true });
    });
});

describe("linking", () => {
    beforeEach(() => db.pro.add("u1").add("u2"));

    it("links a client code, upper-cased, and shows only what the browser should see", async () => {
        const { status, body } = await link("u1", "ab1234");
        expect(status).toBe(201);
        expect(body).toMatchObject({ client_code: "AB1234", status: "active", last_synced_at: null, consent_outdated: false });
        expect(Object.keys(body).sort()).toEqual(["client_code", "consent_at", "consent_outdated", "id", "last_sync_status", "last_synced_at", "status", "verified_at"]);
        // Nothing internal: not the owner's id, the consent version, or the raw sync error.
        for (const hidden of ["user_id", "consent_version", "last_sync_error", "opening_positions", "verification_method"]) expect(body).not.toHaveProperty(hidden);
        expect(db.links[0]).toMatchObject({ user_id: "u1", broker: "xts", consent_version: "draft-1" });
    });

    it("is unavailable while sync is off or has no adapter", async () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        expect(await link("u1")).toMatchObject({ status: 503, body: { code: "BROKER_SYNC_UNAVAILABLE" } });
        vi.stubEnv("XTS_SYNC_ENABLED", "true");
        vi.stubEnv("XTS_ADAPTER", "");
        expect((await link("u1")).status).toBe(503);
        expect(db.links).toHaveLength(0);
    });

    it("refuses without consent, or with a client code that can't be real", async () => {
        const send = (body: unknown) => call("POST", "/journal/broker/link", { user: "u1", body });
        expect((await send({ client_code: "AB1234", consent_version: "draft-1" })).status).toBe(400);
        expect((await send({ client_code: "AB1234", consent: false, consent_version: "draft-1" })).status).toBe(400);
        expect((await send({ client_code: "A", ...CONSENT })).status).toBe(400);
        expect((await send({ client_code: "AB 12; DROP", ...CONSENT })).status).toBe(400);
        expect((await send({ client_code: "AB1234", consent: true })).status).toBe(400);
        expect(db.links).toHaveLength(0);
    });

    it("makes the customer re-read the consent if the wording has changed", async () => {
        const res = await call("POST", "/journal/broker/link", { user: "u1", body: { client_code: "AB1234", consent: true, consent_version: "older-wording" } });
        expect(res).toMatchObject({ status: 409, body: { code: "CONSENT_CHANGED" } });
        expect(db.links).toHaveLength(0);
    });

    it("allows one broker per customer", async () => {
        await link("u1", "AB1234");
        expect(await link("u1", "ZZ9999")).toMatchObject({ status: 409, body: { code: "ALREADY_LINKED" } });
    });

    it("won't link a client code that is already someone else's, and says no more than that", async () => {
        await link("u1", "AB1234");
        const res = await link("u2", "ab1234");
        expect(res).toMatchObject({ status: 409, body: { code: "CODE_UNAVAILABLE" } });
        expect(JSON.stringify(res.body)).not.toMatch(/u1/);
        expect(db.links).toHaveLength(1);
    });

    it("leaves a link unverified, and so unread, when the real adapter is in use", async () => {
        vi.stubEnv("XTS_ADAPTER", "xts");
        vi.stubEnv("XTS_BASE_URL", "http://xts.invalid/interactive");
        vi.stubEnv("XTS_APP_KEY", "key");
        vi.stubEnv("XTS_SECRET_KEY", "secret");
        const res = await link("u1");
        expect(res).toMatchObject({ status: 201, body: { status: "pending", verified_at: null } });
        // A waiting request tells the admins; a link that needs no review (the sample adapter's) does not.
        expect(db.notified).toEqual([{ id: db.links[0].id, client_code: "AB1234", email: "u1@test.example", name: "" }]);

        // Syncing a pending link is refused...
        expect(await call("POST", "/journal/broker/sync", { user: "u1" })).toMatchObject({ status: 409, body: { code: "LINK_NOT_ACTIVE" } });
        // ...and so is the daily run: it makes no attempt to reach the broker at all.
        expect((await call("POST", "/trigger-broker-sync?token=cron-secret")).status).toBe(202);
        await waitForRun();
        expect(db.runs[0]).toMatchObject({ status: "success", result: { total: 0, synced: 0, failed: 0 } });
    });
});

describe("syncing now", () => {
    it("needs a link, and an active one", async () => {
        const u = proUser();
        expect(await call("POST", "/journal/broker/sync", { user: u })).toMatchObject({ status: 409, body: { code: "LINK_NOT_ACTIVE" } });
        db.links.push({ id: "p1", user_id: u, broker: "xts", client_code: "PEND01", status: "pending" });
        expect(await call("POST", "/journal/broker/sync", { user: u })).toMatchObject({ status: 409, body: { code: "LINK_NOT_ACTIVE" } });
    });

    it("brings the day's trades into the journal, then asks to wait before the next sync", async () => {
        const u = proUser();
        await link(u, "SYN001");
        const first = await call("POST", "/journal/broker/sync", { user: u });
        expect(first.status).toBe(200);
        expect(first.body).toMatchObject({ fetched: 5, newFills: 5, closedTrades: 2, insertedTrades: 2, openPositions: 1 });
        expect([...db.mem.trades.values()].every((t: any) => t.user_id === u && t.source === "xts")).toBe(true);

        const status = await call("GET", "/journal/broker/status", { user: u });
        expect(status.body).toMatchObject({ synced_trades: 2, link: { last_sync_status: "success" } });

        const again = await call("POST", "/journal/broker/sync", { user: u });
        expect(again).toMatchObject({ status: 429, body: { code: "SYNC_COOLDOWN" } });
        expect(again.body.retry_after_seconds).toBeGreaterThan(0);
        expect(db.mem.trades.size).toBe(2);
    });

    it("keeps each customer's trades to themselves", async () => {
        const [a, b] = [proUser(), proUser()];
        await link(a, "SYN002");
        await link(b, "SYN003");
        await call("POST", "/journal/broker/sync", { user: a });
        await call("POST", "/journal/broker/sync", { user: b });
        const owners = [...db.mem.trades.values()].map((t: any) => `${t.user_id}:${String(t.external_id).split(":")[0]}`);
        expect(owners.sort()).toEqual([`${a}:SYN002`, `${a}:SYN002`, `${b}:SYN003`, `${b}:SYN003`].sort());
    });
});

describe("disconnecting", () => {
    it("has nothing to do without a link", async () => {
        expect((await call("DELETE", "/journal/broker/link", { user: proUser() })).status).toBe(404);
    });

    it("stops reading but keeps the synced trades unless asked to delete them", async () => {
        const u = proUser();
        await link(u, "DIS001");
        await call("POST", "/journal/broker/sync", { user: u });
        const res = await call("DELETE", "/journal/broker/link", { user: u });
        expect(res).toMatchObject({ status: 200, body: { success: true, deleted_data: false } });
        expect(db.links[0].status).toBe("revoked");
        expect(db.mem.trades.size).toBe(2);
        expect((await call("GET", "/journal/broker/status", { user: u })).body).toMatchObject({ link: null });
    });

    it("deletes the synced trades and fills when asked", async () => {
        const u = proUser();
        await link(u, "DIS002");
        await call("POST", "/journal/broker/sync", { user: u });
        expect(db.mem.trades.size).toBe(2);
        await call("DELETE", "/journal/broker/link?delete_data=true", { user: u });
        expect(db.mem.trades.size).toBe(0);
        expect(db.mem.fills.size).toBe(0);
    });

    it("works with sync switched off and the Pro plan lapsed, and frees the client code for linking again", async () => {
        const u = proUser();
        await link(u, "DIS003");
        db.pro.delete(u);
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        expect((await call("DELETE", "/journal/broker/link", { user: u })).status).toBe(200);

        vi.stubEnv("XTS_SYNC_ENABLED", "true");
        db.pro.add(u);
        expect((await link(u, "DIS003")).status).toBe(201);
    });
});

describe("the daily trigger", () => {
    it("refuses to run at all when no secret is configured", async () => {
        vi.stubEnv("CRON_SECRET_TOKEN", "");
        expect((await call("POST", "/trigger-broker-sync?token=")).status).toBe(503);
    });

    it("refuses a wrong or missing token", async () => {
        expect((await call("POST", "/trigger-broker-sync?token=nope")).status).toBe(401);
        expect((await call("POST", "/trigger-broker-sync")).status).toBe(401);
        expect((await call("POST", "/trigger-broker-sync", { headers: { "x-cron-token": "nope" } })).status).toBe(401);
        expect(db.runs).toHaveLength(0);
    });

    it("skips quietly, with a 200 so the scheduler doesn't retry, when sync is off", async () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        const res = await call("POST", "/trigger-broker-sync?token=cron-secret");
        expect(res).toMatchObject({ status: 200, body: { started: false, skipped: true } });
        expect(db.runs).toHaveLength(0);
    });

    it("syncs every active link in the background and records the run", async () => {
        db.pro.add("ua").add("ub").add("uc").add("ud");
        db.links.push(
            { id: "a", user_id: "ua", broker: "xts", client_code: "TRG001", status: "active", consent_version: "draft-1", opening_positions: [] },
            { id: "b", user_id: "ub", broker: "xts", client_code: "TRG002", status: "active", consent_version: "draft-1", opening_positions: [] },
            { id: "c", user_id: "uc", broker: "xts", client_code: "TRG003", status: "pending", consent_version: "draft-1", opening_positions: [] },
            { id: "d", user_id: "ud", broker: "xts", client_code: "TRG004", status: "revoked", consent_version: "draft-1", opening_positions: [] },
        );
        const res = await call("POST", "/trigger-broker-sync?token=cron-secret");
        expect(res).toMatchObject({ status: 202, body: { started: true } });
        await waitForRun();

        expect(db.runs).toHaveLength(1);
        expect(db.runs[0]).toMatchObject({ source: "http-trigger", status: "success", result: { total: 2, synced: 2, failed: 0, paused: 0, awaitingConsent: 0 } });
        expect(db.problems).toHaveLength(0); // nothing went wrong, so nobody is bothered
        const users = new Set([...db.mem.trades.values()].map((t: any) => t.user_id));
        expect(users).toEqual(new Set(["ua", "ub"])); // not the pending or revoked ones
    });

    it("accepts the token as a header too, and can run again once the last run has finished", async () => {
        db.pro.add("ua");
        db.links.push({ id: "a", user_id: "ua", broker: "xts", client_code: "TRG001", status: "active", consent_version: "draft-1", opening_positions: [] });
        expect((await call("POST", "/trigger-broker-sync", { headers: { "x-cron-token": "cron-secret" } })).status).toBe(202);
        await waitForRun();
        expect((await call("POST", "/trigger-broker-sync?token=cron-secret")).status).toBe(202);
        await waitForRun();
        expect(db.runs).toHaveLength(2);
        expect(db.mem.trades.size).toBe(2); // the second run added nothing new
    });

    it("won't start a second run while one is still going", async () => {
        db.runs.push({ id: "stuck", source: "http-trigger", status: "running", started_at: new Date().toISOString() });
        const res = await call("POST", "/trigger-broker-sync?token=cron-secret");
        expect(res).toMatchObject({ status: 200, body: { started: false, skipped: true } });
        expect(db.runs).toHaveLength(1);
    });

    it("treats a run that has been 'running' for over an hour as crashed and starts afresh", async () => {
        db.runs.push({ id: "old", source: "http-trigger", status: "running", started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() });
        expect((await call("POST", "/trigger-broker-sync?token=cron-secret")).status).toBe(202);
        await waitForRun();
    });
});

describe("who is read when the daily run goes", () => {
    it("pauses a customer whose Pro plan has lapsed, and says how many", async () => {
        db.pro.add("still-pro");
        db.links.push(
            { id: "p", user_id: "still-pro", broker: "xts", client_code: "PRO001", status: "active", consent_version: "draft-1", opening_positions: [] },
            { id: "l", user_id: "lapsed", broker: "xts", client_code: "LAP001", status: "active", consent_version: "draft-1", opening_positions: [] },
        );
        expect((await call("POST", "/trigger-broker-sync?token=cron-secret")).status).toBe(202);
        await waitForRun();

        expect(db.runs[0].result).toMatchObject({ total: 1, synced: 1, failed: 0, paused: 1 });
        expect(new Set([...db.mem.trades.values()].map((t: any) => t.user_id))).toEqual(new Set(["still-pro"]));
        expect(db.links.find((l) => l.id === "l").status).toBe("active"); // still linked; reading resumes with Pro
    });
});

const pending = (user: string, code: string, extra: Record<string, unknown> = {}) => {
    const row = { id: uuid(), user_id: user, broker: "xts", client_code: code, status: "pending", consent_version: "draft-1", consent_at: new Date().toISOString(), verified_at: null, verification_method: null, opening_positions: [], last_synced_at: null, last_sync_status: null, last_sync_error: null, created_at: new Date().toISOString(), ...extra };
    db.links.push(row);
    return row;
};
const ADMIN_ROUTES = (id: string): Array<[string, string]> => [
    ["GET", "/admin/broker/links"],
    ["GET", `/admin/broker/links/${id}/check`],
    ["POST", `/admin/broker/links/${id}/approve`],
    ["POST", `/admin/broker/links/${id}/reject`],
    ["GET", "/admin/broker/runs"],
    ["POST", "/admin/broker/sync"],
    ["POST", "/admin/broker/diagnose"],
    ["GET", "/admin/broker/outbound-ip"],
    ["GET", "/admin/broker/readiness"],
    ["POST", `/admin/broker/links/${id}/compare`],
];

describe("admin: reviewing link requests", () => {
    beforeEach(() => {
        db.admins.add("admin-1");
        db.users.set("cust-1", { email: "asha@example.com", name: "Asha Verma" });
        db.users.set("cust-2", { email: "ravi@example.com", name: "Ravi Menon" });
    });

    it("is for admins only", async () => {
        const row = pending("cust-1", "REV001");
        for (const [method, path] of ADMIN_ROUTES(row.id)) {
            expect((await call(method, path)).status, `${method} ${path} anonymous`).toBe(401);
            expect((await call(method, path, { user: "cust-1" })).status, `${method} ${path} customer`).toBe(403);
        }
        expect(row.status).toBe("pending"); // nothing happened
    });

    it("lists waiting requests with who asked, newest first", async () => {
        db.pro.add("cust-1").add("cust-2");
        pending("cust-1", "REV001", { created_at: "2026-11-03T05:00:00Z" });
        pending("cust-2", "REV002", { created_at: "2026-11-03T06:00:00Z" });
        pending("cust-1", "OLD001", { status: "active" });

        const res = await call("GET", "/admin/broker/links", { user: "admin-1" });
        expect(res.status).toBe(200);
        expect(res.body.links.map((l: any) => l.client_code)).toEqual(["REV002", "REV001"]);
        expect(res.body.links[1]).toMatchObject({ status: "pending", consent_version: "draft-1", user: { email: "asha@example.com", name: "Asha Verma" } });
    });

    it("can list other states, and refuses one that doesn't exist", async () => {
        pending("cust-1", "REV001");
        pending("cust-2", "REV002", { status: "active" });
        const active = await call("GET", "/admin/broker/links?status=active", { user: "admin-1" });
        expect(active.body.links.map((l: any) => l.client_code)).toEqual(["REV002"]);
        expect((await call("GET", "/admin/broker/links?status=all", { user: "admin-1" })).body.links).toHaveLength(2);
        expect((await call("GET", "/admin/broker/links?status=bogus", { user: "admin-1" })).status).toBe(400);
    });

    describe("checking against the broker", () => {
        it("shows the name the broker has next to the customer's, and how well they agree", async () => {
            const row = pending("cust-1", "REV001");
            const res = await call("GET", `/admin/broker/links/${row.id}/check`, { user: "admin-1" });
            // The sample adapter's client is "Sample Trader"; the customer is "Asha Verma".
            expect(res).toMatchObject({ status: 200, body: { available: true, broker_name: "Sample Trader", account_name: "Asha Verma", match: "mismatch" } });
        });

        it("says unknown when the customer has no name on file", async () => {
            const row = pending("nameless", "REV003");
            expect((await call("GET", `/admin/broker/links/${row.id}/check`, { user: "admin-1" })).body).toMatchObject({ available: true, account_name: null, match: "unknown" });
        });

        it("says so when no broker connection is set up", async () => {
            vi.stubEnv("XTS_ADAPTER", "");
            const row = pending("cust-1", "REV001");
            const res = await call("GET", `/admin/broker/links/${row.id}/check`, { user: "admin-1" });
            expect(res).toMatchObject({ status: 200, body: { available: false } });
            expect(res.body.reason).toMatch(/nothing to check/);
        });

        it("reports a broker that can't be reached without passing on the details", async () => {
            vi.stubEnv("XTS_ADAPTER", "xts");
            vi.stubEnv("XTS_BASE_URL", "http://127.0.0.1:1/interactive");
            vi.stubEnv("XTS_APP_KEY", "KEY-VALUE");
            vi.stubEnv("XTS_SECRET_KEY", "SECRET-VALUE");
            const row = pending("cust-1", "REV001");
            const res = await call("GET", `/admin/broker/links/${row.id}/check`, { user: "admin-1" });
            expect(res.status).toBe(502);
            expect(JSON.stringify(res.body)).not.toMatch(/KEY-VALUE|SECRET-VALUE|127\.0\.0\.1/);
        });

        it("404s an unknown link and 400s a malformed id", async () => {
            expect((await call("GET", `/admin/broker/links/${uuid()}/check`, { user: "admin-1" })).status).toBe(404);
            expect((await call("GET", "/admin/broker/links/not-an-id/check", { user: "admin-1" })).status).toBe(400);
        });
    });

    describe("approving", () => {
        it("makes the link active and records who approved it and why", async () => {
            const row = pending("cust-1", "REV001");
            const res = await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1", body: { note: "  Name and email match the broker's records  " } });

            expect(res.status).toBe(200);
            expect(res.body.link).toMatchObject({ status: "active", verification_method: "manual", review_outcome: "approved", reviewed_by: "admin-1@test.example", review_note: "Name and email match the broker's records", user: { name: "Asha Verma" } });
            expect(res.body.link.verified_at).toBeTruthy();
            expect(row.status).toBe("active");
        });

        it("is what lets the link be read: before, a sync is refused; after, it works", async () => {
            db.pro.add("cust-1");
            const row = pending("cust-1", "REV001");
            expect(await call("POST", "/journal/broker/sync", { user: "cust-1" })).toMatchObject({ status: 409, body: { code: "LINK_NOT_ACTIVE" } });

            await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1" });
            expect((await call("GET", "/journal/broker/status", { user: "cust-1" })).body.link).toMatchObject({ status: "active" });
            const sync = await call("POST", "/journal/broker/sync", { user: "cust-1" });
            expect(sync).toMatchObject({ status: 200, body: { insertedTrades: 2 } });
        });

        it("works without a note", async () => {
            const row = pending("cust-1", "REV001");
            expect((await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1" })).body.link).toMatchObject({ status: "active", review_note: null });
        });

        it("only applies to a request that is waiting", async () => {
            const row = pending("cust-1", "REV001");
            await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1" });
            expect(await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1" })).toMatchObject({ status: 409, body: { code: "WRONG_STATE" } });

            const revoked = pending("cust-2", "REV002", { status: "revoked" });
            expect((await call("POST", `/admin/broker/links/${revoked.id}/approve`, { user: "admin-1" })).status).toBe(409);
            expect(revoked.status).toBe("revoked");
        });

        it("refuses an unknown link, a malformed id, and a note that is too long or not text", async () => {
            const row = pending("cust-1", "REV001");
            expect((await call("POST", `/admin/broker/links/${uuid()}/approve`, { user: "admin-1" })).status).toBe(404);
            expect((await call("POST", "/admin/broker/links/nope/approve", { user: "admin-1" })).status).toBe(400);
            expect((await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1", body: { note: "x".repeat(301) } })).status).toBe(400);
            expect((await call("POST", `/admin/broker/links/${row.id}/approve`, { user: "admin-1", body: { note: 42 } })).status).toBe(400);
            expect(row.status).toBe("pending");
        });
    });

    describe("rejecting", () => {
        it("turns a request down, keeps the reason, and tells the customer", async () => {
            db.pro.add("cust-1");
            const row = pending("cust-1", "REV001");
            const res = await call("POST", `/admin/broker/links/${row.id}/reject`, { user: "admin-1", body: { note: "The name doesn't match the broker's records" } });
            expect(res.body.link).toMatchObject({ status: "revoked", review_outcome: "rejected", reviewed_by: "admin-1@test.example", review_note: "The name doesn't match the broker's records" });

            const status = await call("GET", "/journal/broker/status", { user: "cust-1" });
            expect(status.body.link).toBeNull();
            expect(status.body.rejection).toMatchObject({ client_code: "REV001", note: "The name doesn't match the broker's records" });
            expect(status.body.rejection.at).toBeTruthy();
        });

        it("lets the customer try again, and the notice goes away once they do", async () => {
            db.pro.add("cust-1");
            const row = pending("cust-1", "REV001");
            await call("POST", `/admin/broker/links/${row.id}/reject`, { user: "admin-1", body: { note: "Typo in the code?" } });
            expect((await link("cust-1", "REV009")).status).toBe(201);
            expect((await call("GET", "/journal/broker/status", { user: "cust-1" })).body.rejection).toBeNull();
        });

        it("frees the client code for someone else", async () => {
            db.pro.add("cust-1").add("cust-2");
            const row = pending("cust-1", "REV001");
            await call("POST", `/admin/broker/links/${row.id}/reject`, { user: "admin-1" });
            expect((await link("cust-2", "REV001")).status).toBe(201);
        });

        it("can also cut off a link that is already active, which stops it being read", async () => {
            db.pro.add("cust-1");
            const row = pending("cust-1", "REV001", { status: "active" });
            expect((await call("POST", `/admin/broker/links/${row.id}/reject`, { user: "admin-1", body: { note: "Reported by the broker" } })).body.link.status).toBe("revoked");

            expect(await call("POST", "/journal/broker/sync", { user: "cust-1" })).toMatchObject({ status: 409 });
            await call("POST", "/trigger-broker-sync?token=cron-secret");
            await waitForRun();
            expect(db.runs[0].result).toMatchObject({ total: 0 });
        });

        it("only applies once", async () => {
            const row = pending("cust-1", "REV001");
            await call("POST", `/admin/broker/links/${row.id}/reject`, { user: "admin-1" });
            expect((await call("POST", `/admin/broker/links/${row.id}/reject`, { user: "admin-1" })).status).toBe(409);
        });

        it("does not mistake a customer's own disconnect for a rejection", async () => {
            db.pro.add("cust-1");
            await link("cust-1", "REV001");
            await call("DELETE", "/journal/broker/link", { user: "cust-1" });
            expect((await call("GET", "/journal/broker/status", { user: "cust-1" })).body.rejection).toBeNull();
        });
    });
});

describe("when the consent wording changes", () => {
    const oldLink = (user: string, code: string, extra: Record<string, unknown> = {}) => pending(user, code, { status: "active", consent_version: "older-wording", verified_at: new Date().toISOString(), ...extra });

    it("flags the link as needing confirmation, and says nothing of the sort for a current one", async () => {
        oldLink("cust-old", "CON001");
        pending("cust-new", "CON002", { status: "active" });
        expect((await call("GET", "/journal/broker/status", { user: "cust-old" })).body.link).toMatchObject({ consent_outdated: true });
        expect((await call("GET", "/journal/broker/status", { user: "cust-new" })).body.link).toMatchObject({ consent_outdated: false });
    });

    it("stops 'sync now' until the customer confirms", async () => {
        const u = proUser();
        oldLink(u, "CON003");
        expect(await call("POST", "/journal/broker/sync", { user: u })).toMatchObject({ status: 409, body: { code: "CONSENT_OUTDATED" } });
        expect(db.mem.trades.size).toBe(0);
    });

    it("leaves such a link out of the daily run, and counts it", async () => {
        db.pro.add("c1").add("c2");
        oldLink("c1", "CON004");
        pending("c2", "CON005", { status: "active" });
        await call("POST", "/trigger-broker-sync?token=cron-secret");
        await waitForRun();

        expect(db.runs[0].result).toMatchObject({ total: 1, synced: 1, awaitingConsent: 1, paused: 0 });
        expect(new Set([...db.mem.trades.values()].map((t: any) => t.user_id))).toEqual(new Set(["c2"]));
    });

    it("lets the customer confirm the new wording, which unpauses everything", async () => {
        const u = proUser();
        const row = oldLink(u, "CON006");
        const before = row.consent_at;
        const res = await call("POST", "/journal/broker/consent", { user: u, body: { consent: true, consent_version: "draft-1" } });

        expect(res).toMatchObject({ status: 200, body: { consent_outdated: false } });
        expect(row.consent_version).toBe("draft-1");
        expect(row.consent_at >= before).toBe(true);
        expect((await call("POST", "/journal/broker/sync", { user: u })).status).toBe(200);
    });

    it("works for a customer whose plan has lapsed, since they must be able to answer", async () => {
        oldLink("lapsed-cust", "CON007");
        expect((await call("POST", "/journal/broker/consent", { user: "lapsed-cust", body: { consent: true, consent_version: "draft-1" } })).status).toBe(200);
    });

    it("needs a real confirmation of the current wording", async () => {
        const u = proUser();
        const row = oldLink(u, "CON008");
        const send = (body: unknown) => call("POST", "/journal/broker/consent", { user: u, body });
        expect((await send({ consent_version: "draft-1" })).status).toBe(400);
        expect((await send({ consent: false, consent_version: "draft-1" })).status).toBe(400);
        expect((await send({ consent: true })).status).toBe(400);
        expect(await send({ consent: true, consent_version: "older-wording" })).toMatchObject({ status: 409, body: { code: "CONSENT_CHANGED" } });
        expect(row.consent_version).toBe("older-wording");
    });

    it("has nothing to confirm without a link, and does nothing to a current one", async () => {
        expect((await call("POST", "/journal/broker/consent", { user: "nobody", body: { consent: true, consent_version: "draft-1" } })).status).toBe(404);
        const row = pending("cust-new", "CON009", { status: "active", consent_at: "2026-01-01T00:00:00Z" });
        expect((await call("POST", "/journal/broker/consent", { user: "cust-new", body: { consent: true, consent_version: "draft-1" } })).status).toBe(200);
        expect(row.consent_at).toBe("2026-01-01T00:00:00Z"); // untouched
    });

    it("won't re-confirm a link that has been removed", async () => {
        oldLink("gone", "CON010", { status: "revoked" });
        expect((await call("POST", "/journal/broker/consent", { user: "gone", body: { consent: true, consent_version: "draft-1" } })).status).toBe(404);
    });
});

describe("when the daily run goes wrong", () => {
    it("tells the admins which customers failed and why", async () => {
        db.pro.add("ok-user").add("bad-user");
        pending("ok-user", "FINE01", { status: "active" });
        pending("bad-user", "FAIL01", { status: "active" });
        await call("POST", "/trigger-broker-sync?token=cron-secret");
        await waitForRun();

        expect(db.runs[0]).toMatchObject({ status: "success", result: { total: 2, synced: 1, failed: 1 } });
        expect(db.problems).toEqual([expect.objectContaining({ source: "http-trigger", total: 2, synced: 1, failed: 1, failures: [{ clientCode: "FAIL01", error: "broker said no" }] })]);
        expect(db.mem.trades.size).toBe(2); // the customer who could be read still got their trades
    });

    it("calls a run failed, and still alerts, when nobody could be synced", async () => {
        db.pro.add("bad-user");
        pending("bad-user", "FAIL01", { status: "active" });
        await call("POST", "/trigger-broker-sync?token=cron-secret");
        await waitForRun();
        expect(db.runs[0].status).toBe("failed");
        expect(db.problems).toHaveLength(1);
    });

    it("alerts when the whole run breaks, with the error", async () => {
        db.listFails = true;
        await call("POST", "/trigger-broker-sync?token=cron-secret");
        await waitForRun();
        expect(db.runs[0]).toMatchObject({ status: "failed", result: { error: "database is down" } });
        expect(db.problems).toEqual([expect.objectContaining({ source: "http-trigger", error: "database is down" })]);
    });
});

describe("admin: running and testing the sync", () => {
    beforeEach(() => db.admins.add("admin-1"));

    it("lists the latest runs, newest first", async () => {
        for (let i = 1; i <= 12; i++) db.runs.push({ id: `r${i}`, source: "http-trigger", status: "success", started_at: new Date(2026, 10, i).toISOString(), result: { total: i } });
        const res = await call("GET", "/admin/broker/runs", { user: "admin-1" });
        expect(res.status).toBe(200);
        expect(res.body.runs).toHaveLength(10);
        expect(res.body.runs[0]).toMatchObject({ id: "r12", result: { total: 12 } });
    });

    it("runs the sync on demand, as 'admin', without the cron token", async () => {
        db.pro.add("cust-1");
        pending("cust-1", "RUN001", { status: "active" });
        const res = await call("POST", "/admin/broker/sync", { user: "admin-1" });
        expect(res).toMatchObject({ status: 202, body: { started: true } });
        await waitForRun();
        expect(db.runs[0]).toMatchObject({ source: "admin", status: "success", result: { total: 1, synced: 1 } });
    });

    it("says why when the sync can't run", async () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        const res = await call("POST", "/admin/broker/sync", { user: "admin-1" });
        expect(res).toMatchObject({ status: 200, body: { started: false } });
        expect(res.body.reason).toMatch(/not enabled/);
        expect(db.runs).toHaveLength(0);
    });

    it("has nothing to test with the sample adapter, and says so", async () => {
        const res = await call("POST", "/admin/broker/diagnose", { user: "admin-1", body: { client_code: "AB1234" } });
        expect(res).toMatchObject({ status: 200, body: { available: false } });
    });

    it("runs the connection test and reports a step that fails, without leaking the keys or address", async () => {
        vi.stubEnv("XTS_ADAPTER", "xts");
        vi.stubEnv("XTS_BASE_URL", "http://127.0.0.1:1/interactive");
        vi.stubEnv("XTS_APP_KEY", "KEY-VALUE");
        vi.stubEnv("XTS_SECRET_KEY", "SECRET-VALUE");
        const res = await call("POST", "/admin/broker/diagnose", { user: "admin-1", body: { client_code: "ab1234" } });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ available: true, steps: [{ name: "Log in", ok: false }] });
        expect(JSON.stringify(res.body)).not.toMatch(/KEY-VALUE|SECRET-VALUE|127\.0\.0\.1/);
    });

    it("tells the admin what address the broker will see, for the broker's whitelist", async () => {
        const res = await call("GET", "/admin/broker/outbound-ip", { user: "admin-1" });
        expect(res).toMatchObject({ status: 200, body: { ip: "203.0.113.7", via: "direct" } });
    });

    it("says when that address is the proxy's", async () => {
        vi.stubEnv("XTS_PROXY_URL", "http://user:proxy-secret@127.0.0.1:3128");
        const res = await call("GET", "/admin/broker/outbound-ip", { user: "admin-1" });
        expect(res).toMatchObject({ status: 200, body: { ip: "203.0.113.7", via: "proxy" } });
        expect(JSON.stringify(res.body)).not.toContain("proxy-secret");
    });

    it("refuses to look it up when the proxy address is wrong, without repeating that address", async () => {
        vi.stubEnv("XTS_PROXY_URL", "socks5://user:proxy-secret@proxy:1080");
        const res = await call("GET", "/admin/broker/outbound-ip", { user: "admin-1" });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/isn't a valid/);
        expect(JSON.stringify(res.body)).not.toContain("proxy-secret");
    });

    it("reports a lookup that fails, with advice that depends on whether a proxy is in use", async () => {
        db.ipFails = true;
        const direct = await call("GET", "/admin/broker/outbound-ip", { user: "admin-1" });
        expect(direct.status).toBe(502);
        expect(direct.body.error).toMatch(/outbound address/);

        vi.stubEnv("XTS_PROXY_URL", "http://127.0.0.1:3128");
        const proxied = await call("GET", "/admin/broker/outbound-ip", { user: "admin-1" });
        expect(proxied.status).toBe(502);
        expect(proxied.body.error).toMatch(/proxy/);
        expect(JSON.stringify([direct.body, proxied.body])).not.toContain("lookup service down");
    });

    it("refuses a client code that can't be real", async () => {
        for (const client_code of ["A", "AB 12; DROP", 42, "x".repeat(31)]) {
            expect((await call("POST", "/admin/broker/diagnose", { user: "admin-1", body: { client_code } })).status, String(client_code)).toBe(400);
        }
        expect((await call("POST", "/admin/broker/diagnose", { user: "admin-1", body: {} })).status).toBe(200); // the code is optional
    });
});

describe("admin: adding history from a broker file", () => {
    beforeEach(() => db.admins.add("admin-1"));

    // The sync has only seen the 6th: a sale and a purchase of the same futures, which read alone is a short.
    const day2 = (client: string) => {
        const fill = (executionId: string, side: "buy" | "sell", price: number, time: string) => ({ executionId, clientCode: client, symbol: "NIFTY26NOVFUT", segment: "NSEFO", instrumentId: null, product: "NRML", side, quantity: 10, price, charges: null, tradedAt: `2026-01-06T${time}:00+05:30` });
        return [fill("d2s", "sell", 110, "10:00"), fill("d2b", "buy", 100, "11:00")];
    };
    const seed = async (user: string, client: string) => {
        const row = pending(user, client, { status: "active" });
        await db.mem.store.saveFills(row, day2(client));
        await db.mem.store.insertTrades(pairFills(day2(client)).trades.map((t) => toJournalTrade(t, user)));
        return row;
    };
    // The purchase on the 5th that the sync never saw.
    const EARLIER = `
symbol,trade_date,exchange,segment,trade_type,quantity,price,trade_id,product
NIFTY26NOVFUT,2026-01-05,NFO,FO,buy,10,90,9001,NRML
`;
    const upload = async (id: string, csv: string, opts: { apply?: boolean; user?: string | null; type?: string; name?: string } = {}) => {
        const form = new FormData();
        form.append("file", new Blob([csv.trim()]), opts.name ?? "tradebook.csv");
        form.append("file_type", opts.type ?? "csv");
        const user = opts.user === undefined ? "admin-1" : opts.user;
        const res = await fetch(`${base}/admin/broker/links/${id}/backfill${opts.apply ? "?apply=true" : ""}`, { method: "POST", headers: user ? { "x-test-user": user } : {}, body: form });
        return { status: res.status, body: (await res.json().catch(() => null)) as any };
    };
    const journal = (user: string, client: string) => db.mem.store.listSyncedTrades(user, client);

    it("is for admins only", async () => {
        const row = await seed("bf-user", "BFL001");
        expect((await upload(row.id, EARLIER, { user: null })).status).toBe(401);
        expect((await upload(row.id, EARLIER, { user: "bf-user" })).status).toBe(403);
        expect(db.mem.fills.size).toBe(2);
    });

    it("previews by default: says what it would do and changes nothing", async () => {
        const row = await seed("bf-user", "BFL001");
        const res = await upload(row.id, EARLIER);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            applied: false,
            file: { executions: 1, newExecutions: 1, skippedRows: 0, otherClientRows: 0, leftOutDays: [], leftOutDayCount: 0, from: "2026-01-05", to: "2026-01-05" },
            changes: { add: 1, update: 0, remove: 1, keptCount: 0, kept: [] },
            history: { fills: 3, trades: 1, open: 1, unmatched: 0 },
        });
        expect(db.mem.fills.size).toBe(2);
        expect((await journal("bf-user", "BFL001")).map((t) => t.pnl)).toEqual([100]); // still the wrong short
        expect(db.runs).toHaveLength(0); // and no record, since nothing happened
    });

    it("applies it: the wrong short is replaced by the real trade, and the history is stored", async () => {
        const row = await seed("bf-user", "BFL001");
        const res = await upload(row.id, EARLIER, { apply: true });

        expect(res.body).toMatchObject({ applied: true, changes: { add: 1, remove: 1 } });
        const trades = await journal("bf-user", "BFL001");
        expect(trades).toHaveLength(1);
        expect(trades[0]).toMatchObject({ date: "2026-01-05", exit_date: "2026-01-06", buy_sell: "buy", entry_price: 90, exit_price: 110, pnl: 200, source: "xts" });
        expect(db.mem.fills.size).toBe(3);
        expect([...db.mem.fills.keys()]).toContain("BFL001|bf:9001");
    });

    it("keeps a record of who added the history", async () => {
        const row = await seed("bf-user", "BFL001");
        await upload(row.id, EARLIER, { apply: true });
        expect(db.runs).toHaveLength(1);
        expect(db.runs[0]).toMatchObject({ source: "backfill: admin-1@test.example", status: "success", result: { backfill: true, clientCode: "BFL001", executions: 1, add: 1, remove: 1 } });
    });

    it("does nothing the second time the same file is applied", async () => {
        const row = await seed("bf-user", "BFL001");
        await upload(row.id, EARLIER, { apply: true });
        const again = await upload(row.id, EARLIER, { apply: true });

        // The 5th is now a day we hold, so the file is left out entirely.
        expect(again.body).toMatchObject({ file: { newExecutions: 0, leftOutDays: ["2026-01-05"] }, changes: { add: 0, update: 0, remove: 0, keptCount: 0 } });
        expect(db.mem.fills.size).toBe(3);
        expect(await journal("bf-user", "BFL001")).toHaveLength(1);
    });

    it("never overwrites a trade the customer wrote on, and lists it for review", async () => {
        const row = await seed("bf-user", "BFL001");
        const [wrong] = await journal("bf-user", "BFL001");
        db.mem.trades.get(`bf-user|${wrong.external_id}`)!.notes = "Faded the open";

        const res = await upload(row.id, EARLIER, { apply: true });
        expect(res.body.changes).toMatchObject({ add: 1, remove: 0, keptCount: 1, kept: [{ externalId: wrong.external_id, asset: "NIFTY", date: "2026-01-06", why: "superseded" }] });
        const trades = await journal("bf-user", "BFL001");
        expect(trades).toHaveLength(2);
        expect(trades.find((t) => t.external_id === wrong.external_id)!.notes).toBe("Faded the open");
    });

    it("leaves days the live sync already holds alone", async () => {
        const row = await seed("bf-user", "BFL001");
        const overlapping = `${EARLIER}\nNIFTY26NOVFUT,2026-01-06,NFO,FO,buy,99,1,9002,NRML`;
        const res = await upload(row.id, overlapping, { apply: true });
        expect(res.body.file).toMatchObject({ executions: 2, newExecutions: 1, leftOutDays: ["2026-01-06"], leftOutDayCount: 1 });
        expect(db.mem.fills.size).toBe(3); // the 6th's extra row was not stored
    });

    it("refuses a file that is another customer's", async () => {
        const row = await seed("bf-user", "BFL001");
        const res = await upload(row.id, "client code,symbol,trade_date,trade_type,quantity,price\nZZ9999,SBIN,2026-01-05,buy,1,1", { apply: true });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/no trades for client BFL001/);
        expect(db.mem.fills.size).toBe(2);
    });

    it("refuses what isn't a tradebook, and what isn't a CSV or Excel file", async () => {
        const row = await seed("bf-user", "BFL001");
        expect((await upload(row.id, "Date,Asset,Side,Qty,Entry Price,Exit Price\n2026-01-05,SBIN,Buy,1,1,2")).status).toBe(400);
        expect((await upload(row.id, EARLIER, { type: "pdf" })).status).toBe(400);
        expect((await upload(row.id, "", { name: "empty.csv" })).status).toBe(400);
        expect(db.mem.fills.size).toBe(2);
    });

    it("needs an active link", async () => {
        const waiting = pending("bf-wait", "BFL002");
        const res = await upload(waiting.id, EARLIER, { apply: true });
        expect(res).toMatchObject({ status: 409, body: { code: "LINK_NOT_ACTIVE" } });
        const removed = pending("bf-gone", "BFL003", { status: "revoked" });
        expect((await upload(removed.id, EARLIER)).status).toBe(409);
    });

    it("waits for a sync that is running, but isn't held up by one that crashed", async () => {
        const row = await seed("bf-user", "BFL001");
        db.runs.push({ id: "live", source: "http-trigger", status: "running", started_at: new Date().toISOString(), result: null });
        expect(await upload(row.id, EARLIER, { apply: true })).toMatchObject({ status: 409, body: { code: "SYNC_RUNNING" } });
        expect(db.mem.fills.size).toBe(2);

        db.runs[0].started_at = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // no sign of life for half an hour
        expect((await upload(row.id, EARLIER, { apply: true })).status).toBe(200);
    });

    it("404s an unknown link and 400s a malformed id or a missing file", async () => {
        expect((await upload(uuid(), EARLIER)).status).toBe(404);
        expect((await upload("not-an-id", EARLIER)).status).toBe(400);
        const row = await seed("bf-user", "BFL001");
        const res = await fetch(`${base}/admin/broker/links/${row.id}/backfill`, { method: "POST", headers: { "x-test-user": "admin-1" }, body: new FormData() });
        expect(res.status).toBe(400);
    });

    it("answers a file that is too large with a plain message", async () => {
        const row = await seed("bf-user", "BFL001");
        const res = await upload(row.id, "x".repeat(21 * 1024 * 1024));
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/too large/);
    });

    it("never touches another customer's journal", async () => {
        const mine = await seed("bf-user", "BFL001");
        await seed("bf-other", "BFL009");
        await upload(mine.id, EARLIER, { apply: true });
        const theirs = await journal("bf-other", "BFL009");
        expect(theirs).toHaveLength(1);
        expect(theirs[0].pnl).toBe(100); // still as the sync left it
    });
});

describe("the trial group", () => {
    beforeEach(() => vi.stubEnv("BROKER_SYNC_PILOT_EMAILS", "Pilot-One@test.example, pilot-two@test.example"));
    const pro = (id: string) => db.pro.add(id);

    it("tells a customer outside it that it is being tried with a small group first", async () => {
        pro("outsider");
        const status = await call("GET", "/journal/broker/status", { user: "outsider" });
        expect(status.body).toMatchObject({ enabled: true, available: false, pilot_only: true });

        expect(await link("outsider")).toMatchObject({ status: 403, body: { code: "BROKER_SYNC_PILOT" } });
        expect(await call("POST", "/journal/broker/sync", { user: "outsider" })).toMatchObject({ status: 403, body: { code: "BROKER_SYNC_PILOT" } });
        expect(db.links).toHaveLength(0);
    });

    it("lets someone on the list in, however the address is written", async () => {
        pro("pilot-one");
        pro("pilot-two");
        expect((await call("GET", "/journal/broker/status", { user: "pilot-one" })).body).toMatchObject({ available: true, pilot_only: false });
        expect((await link("pilot-one", "PIL001")).status).toBe(201);
        expect((await link("pilot-two", "PIL002")).status).toBe(201);
        expect((await call("POST", "/journal/broker/sync", { user: "pilot-one" })).status).toBe(200);
    });

    it("lets an admin in without being on the list", async () => {
        pro("admin-1");
        db.admins.add("admin-1");
        expect((await call("GET", "/journal/broker/status", { user: "admin-1" })).body).toMatchObject({ available: true, pilot_only: false });
        expect((await link("admin-1", "ADM001")).status).toBe(201);
    });

    it("is open to every Pro customer when there is no list", async () => {
        vi.stubEnv("BROKER_SYNC_PILOT_EMAILS", "");
        pro("anyone");
        expect((await call("GET", "/journal/broker/status", { user: "anyone" })).body).toMatchObject({ available: true, pilot_only: false });
        expect((await link("anyone", "ANY001")).status).toBe(201);
    });

    it("doesn't talk about a trial while sync is switched off", async () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        const { body } = await call("GET", "/journal/broker/status", { user: "outsider" });
        expect(body).toMatchObject({ enabled: false, available: false, pilot_only: false });
    });

    it("doesn't cut off someone already linked who is not on the list", async () => {
        pro("linked-before");
        pending("linked-before", "OLD001", { status: "active", verified_at: new Date().toISOString() });
        // They can see their connection and remove it...
        expect((await call("GET", "/journal/broker/status", { user: "linked-before" })).body).toMatchObject({ pilot_only: true, link: { client_code: "OLD001", status: "active" } });
        // ...and the daily run goes on reading them.
        expect((await call("POST", "/trigger-broker-sync?token=cron-secret")).status).toBe(202);
        await waitForRun();
        expect(db.runs[0].result).toMatchObject({ total: 1, synced: 1, failed: 0 });
        expect([...db.mem.trades.values()].some((t: any) => t.user_id === "linked-before")).toBe(true);
        expect((await call("DELETE", "/journal/broker/link", { user: "linked-before" })).status).toBe(200);
    });
});

describe("admin: the launch checklist", () => {
    beforeEach(() => {
        db.admins.add("admin-1");
        vi.stubEnv("RESEND_API_KEY", "re_test");
        vi.stubEnv("DISABLE_BROKER_SYNC_CRON", "");
        vi.stubEnv("BROKER_SYNC_PILOT_EMAILS", "");
    });
    const get = async () => (await call("GET", "/admin/broker/readiness", { user: "admin-1" })).body;
    const find = (report: any, id: string) => report.checks.find((c: any) => c.id === id);

    it("lists every check, with its words, and the tally", async () => {
        const report = await get();
        expect(report.checks.map((c: any) => c.id)).toEqual(["database", "switch", "adapter", "settings", "proxy", "consent", "alerts", "schedule", "lastRun", "rollout", "waiting", "outdated"]);
        for (const c of report.checks) expect(c).toMatchObject({ label: expect.any(String), detail: expect.any(String), status: expect.stringMatching(/^(ok|warn|fail)$/) });
        expect(report.summary.ok + report.summary.warn + report.summary.fail).toBe(report.checks.length);
        expect(report.links).toEqual({ pending: 0, active: 0, revoked: 0, outdatedConsent: 0 });
        // Sample data, the draft wording and no sync yet are worth knowing but don't stop a launch.
        expect(report.ready).toBe(true);
        expect(find(report, "adapter").status).toBe("warn");
        expect(find(report, "consent").status).toBe("warn");
        expect(find(report, "lastRun").status).toBe("warn");
    });

    it("fails the database check, and so the launch, when a migration hasn't been run", async () => {
        db.schemaMissing = ["broker_fills (migration 0019)"];
        const report = await get();
        expect(report.ready).toBe(false);
        expect(find(report, "database")).toMatchObject({ status: "fail" });
        expect(find(report, "database").detail).toMatch(/broker_fills \(migration 0019\)/);
    });

    it("counts the links in each state and flags the ones that need someone", async () => {
        pending("c1", "RDY001");
        pending("c2", "RDY002", { status: "active" });
        pending("c3", "RDY003", { status: "active", consent_version: "older-wording" });
        pending("c4", "RDY004", { status: "revoked" });
        const report = await get();
        expect(report.links).toEqual({ pending: 1, active: 2, revoked: 1, outdatedConsent: 1 });
        expect(find(report, "waiting")).toMatchObject({ status: "warn", detail: expect.stringMatching(/1 request is waiting/) });
        expect(find(report, "outdated")).toMatchObject({ status: "warn", detail: expect.stringMatching(/1 linked customer hasn't/) });
    });

    it("judges the last real sync, not history added by hand or a run that stood aside", async () => {
        const now = new Date().toISOString();
        db.runs.push({ id: "a", source: "cron", status: "success", started_at: now, result: { total: 3, synced: 3, failed: 0 } });
        db.runs.push({ id: "b", source: "backfill: admin-1@test.example", status: "failed", started_at: now, result: { error: "not a sync" } });
        db.runs.push({ id: "c", source: "http-trigger", status: "skipped", started_at: now, result: null });
        expect(find(await get(), "lastRun")).toMatchObject({ status: "ok", detail: expect.stringMatching(/3 customers without a failure/) });

        db.runs.push({ id: "d", source: "http-trigger", status: "failed", started_at: now, result: { error: "broker said no" } });
        const failed = find(await get(), "lastRun");
        expect(failed).toMatchObject({ status: "fail" });
        expect(failed.detail).toMatch(/broker said no/);
    });

    it("reads the trial list and the admin count from the real settings", async () => {
        vi.stubEnv("BROKER_SYNC_PILOT_EMAILS", "a@x.example, b@x.example");
        db.adminEmails = ["one@x.example", "two@x.example"];
        const report = await get();
        expect(find(report, "rollout").detail).toMatch(/A trial: 2 customers/);
        expect(find(report, "alerts")).toMatchObject({ status: "ok", detail: expect.stringMatching(/2 admins/) });

        db.adminEmails = [];
        expect(find(await get(), "alerts")).toMatchObject({ status: "warn", detail: expect.stringMatching(/No admin email/) });
    });

    it("warns that nothing will run the sync when the timetable is off and there is no outside trigger", async () => {
        vi.stubEnv("DISABLE_BROKER_SYNC_CRON", "true");
        vi.stubEnv("CRON_SECRET_TOKEN", "");
        const report = await get();
        expect(find(report, "schedule").status).toBe("fail");
        expect(report.ready).toBe(false);
    });

    it("never shows a key, a password or an address", async () => {
        vi.stubEnv("XTS_ADAPTER", "xts");
        vi.stubEnv("XTS_BASE_URL", "http://xts.invalid/interactive");
        vi.stubEnv("XTS_APP_KEY", "app-key-do-not-show");
        vi.stubEnv("XTS_SECRET_KEY", "secret-do-not-show");
        vi.stubEnv("XTS_PROXY_URL", "http://proxyuser:proxypass-do-not-show@proxy.example:3128");
        vi.stubEnv("RESEND_API_KEY", "resend-do-not-show");
        vi.stubEnv("CRON_SECRET_TOKEN", "cron-do-not-show");
        const report = await get();
        const text = JSON.stringify(report);
        for (const secret of ["do-not-show", "proxyuser", "proxy.example", "xts.invalid"]) expect(text).not.toContain(secret);
        expect(find(report, "adapter").status).toBe("ok");
        expect(find(report, "settings").status).toBe("ok");
        expect(find(report, "proxy")).toMatchObject({ status: "ok", detail: expect.stringMatching(/proxy/) });
    });

    it("fails when the proxy address can't be used", async () => {
        vi.stubEnv("XTS_PROXY_URL", "not a url");
        const report = await get();
        expect(find(report, "proxy").status).toBe("fail");
        expect(report.ready).toBe(false);
    });
});

describe("admin: checking a statement against the journal", () => {
    beforeEach(() => db.admins.add("admin-1"));

    const exec = (client: string, id: string, side: "buy" | "sell", qty: number, price: number, time: string, day = "2026-01-06") => ({
        executionId: id,
        clientCode: client,
        symbol: "NIFTY26NOVFUT",
        segment: "NSEFO",
        instrumentId: null,
        product: "NRML",
        side,
        quantity: qty,
        price,
        charges: null,
        tradedAt: `${day}T${time}:00+05:30`,
    });
    const history = (client: string) => [exec(client, "c1", "buy", 10, 100, "10:00"), exec(client, "c2", "sell", 10, 110, "11:00"), exec(client, "c3", "buy", 5, 200, "12:00"), exec(client, "c4", "sell", 5, 190, "13:00")];
    const seed = async (user: string, client: string) => {
        const row = pending(user, client, { status: "active" });
        await db.mem.store.saveFills(row, history(client));
        await db.mem.store.insertTrades(pairFills(history(client)).trades.map((t) => toJournalTrade(t, user)));
        return row;
    };
    const csv = (fills: ReturnType<typeof history>) => statementCsv(fills).toString();
    const upload = async (id: string, content: string, opts: { user?: string | null; type?: string; name?: string; omitFile?: boolean } = {}) => {
        const form = new FormData();
        if (!opts.omitFile) form.append("file", new Blob([content]), opts.name ?? "statement.csv");
        form.append("file_type", opts.type ?? "csv");
        const user = opts.user === undefined ? "admin-1" : opts.user;
        const res = await fetch(`${base}/admin/broker/links/${id}/compare`, { method: "POST", headers: user ? { "x-test-user": user } : {}, body: form });
        return { status: res.status, body: (await res.json().catch(() => null)) as any };
    };

    it("is for admins only", async () => {
        const row = await seed("cmp-user", "CMP001");
        expect((await upload(row.id, csv(history("CMP001")), { user: null })).status).toBe(401);
        expect((await upload(row.id, csv(history("CMP001")), { user: "cmp-user" })).status).toBe(403);
    });

    it("says the journal agrees when it does", async () => {
        const row = await seed("cmp-user", "CMP001");
        const { status, body } = await upload(row.id, csv(history("CMP001")));
        expect(status).toBe(200);
        expect(body).toMatchObject({ matched: 2, counts: { differences: 0, missingInJournal: 0, extraInJournal: 0 }, totals: { statement: -50 + 100, journal: 50, difference: 0 } });
        expect(body.window).toMatchObject({ from: "2026-01-06", to: "2026-01-06", statementTrades: 2, journalTrades: 2 });
    });

    it("names what is wrong and changes nothing", async () => {
        const row = await seed("cmp-user", "CMP001");
        const [first] = await db.mem.store.listSyncedTrades("cmp-user", "CMP001");
        db.mem.trades.get(`cmp-user|${first.external_id}`)!.exit_price = 99;
        const before = JSON.stringify([...db.mem.trades.entries()]);
        const fillsBefore = db.mem.fills.size;

        const { body } = await upload(row.id, csv(history("CMP001")));
        expect(body.counts).toMatchObject({ differences: 1, missingInJournal: 0, extraInJournal: 0 });
        expect(body.differences[0].what).toContain("exit price");
        expect(JSON.stringify([...db.mem.trades.entries()])).toBe(before);
        expect(db.mem.fills.size).toBe(fillsBefore);
        expect(db.runs).toHaveLength(0); // looking is not an event
    });

    it("leaves days from before the sync began out of the comparison, and says so", async () => {
        const row = await seed("cmp-user", "CMP001");
        const earlier = [exec("CMP001", "e1", "buy", 1, 50, "10:00", "2026-01-02"), exec("CMP001", "e2", "sell", 1, 60, "11:00", "2026-01-02")];
        const { body } = await upload(row.id, csv([...earlier, ...history("CMP001")]));
        expect(body.notCompared).toMatchObject({ beforeSync: 1 });
        expect(body.counts.missingInJournal).toBe(0);
        expect(body.window.from).toBe("2026-01-06");
    });

    it("only weighs this customer's trades against the file", async () => {
        const row = await seed("cmp-user", "CMP001");
        await seed("cmp-other", "CMP009");
        const { body } = await upload(row.id, csv(history("CMP001")));
        expect(body.counts.extraInJournal).toBe(0);
        expect(body.window.journalTrades).toBe(2);
    });

    it("refuses another customer's file, and what isn't a tradebook", async () => {
        const row = await seed("cmp-user", "CMP001");
        const other = await upload(row.id, "client code,symbol,trade_date,trade_type,quantity,price\nZZ9999,SBIN,2026-01-05,buy,1,1");
        expect(other.status).toBe(400);
        expect(other.body.error).toMatch(/no trades for client CMP001/);
        expect((await upload(row.id, "Date,Asset,Side,Qty,Entry Price,Exit Price\n2026-01-05,SBIN,Buy,1,1,2")).status).toBe(400);
    });

    it("404s an unknown link and 400s a malformed id, a missing file or an unsupported type", async () => {
        const row = await seed("cmp-user", "CMP001");
        expect((await upload(uuid(), csv(history("CMP001")))).status).toBe(404);
        expect((await upload("not-an-id", csv(history("CMP001")))).status).toBe(400);
        expect((await upload(row.id, "", { omitFile: true })).status).toBe(400);
        expect((await upload(row.id, csv(history("CMP001")), { type: "pdf" })).status).toBe(400);
    });

    it("answers a file that is too large with a plain message", async () => {
        const row = await seed("cmp-user", "CMP001");
        const res = await upload(row.id, "x".repeat(21 * 1024 * 1024));
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/too large/);
    });
});
