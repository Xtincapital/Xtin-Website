import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The run lock, with the database replaced by a list. "Another process" is
// simulated by adding rows to that list, the way a second server's attempt
// would appear in broker_sync_runs.

const db = vi.hoisted(() => ({
    runs: [] as any[],
    links: [] as any[],
    pro: new Set<string>(),
    progress: [] as any[],
    problems: [] as any[],
    synced: [] as string[],
    seq: 0,
    gate: null as Promise<void> | null,
    onSave: null as null | (() => void),
    beforeInsert: null as null | (() => void),
    afterInsert: null as null | (() => void),
    startFails: false,
}));

vi.mock("./broker.repository.js", () => ({
    listActiveLinks: async () => db.links.filter((l) => l.status === "active"),
    listRunningRuns: async () => db.runs.filter((r) => r.status === "running").map(({ id, started_at, result }) => ({ id, started_at, result })),
    startRun: async (source: string) => {
        if (db.startFails) return { data: null, error: new Error("database is down") };
        db.beforeInsert?.();
        const run = { id: `run-${String(++db.seq).padStart(3, "0")}`, source, status: "running", started_at: new Date().toISOString(), result: null };
        db.runs.push(run);
        db.afterInsert?.();
        return { data: { id: run.id }, error: null };
    },
    completeRun: async (id: string, status: string, result: unknown) => {
        Object.assign(db.runs.find((r) => r.id === id), { status, result });
    },
    updateRunProgress: async (id: string, progress: any) => {
        const run = db.runs.find((r) => r.id === id);
        if (run && run.status === "running") {
            run.result = progress;
            db.progress.push(progress);
        }
    },
    supabaseStore: {
        saveFills: async (link: any) => {
            await db.gate;
            db.onSave?.();
            db.synced.push(link.client_code);
            return 0;
        },
        loadFills: async () => [],
        existingExternalIds: async () => new Set<string>(),
        insertTrades: async () => undefined,
        recordSync: async () => undefined,
    },
}));
vi.mock("../planTier.js", () => ({ getPlanTier: async (id: string) => (db.pro.has(id) ? "pro" : "free") }));
vi.mock("../../../services/adminNotify.service.js", () => ({ notifyAdminsBrokerSyncProblem: (info: any) => db.problems.push(info) }));

const { startBrokerSync, isStaleRun, lastSignOfLife, STALE_AFTER_MS } = await import("./broker.runner.js");

const MIN = 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const link = (n: number) => ({ id: `l${n}`, user_id: `u${n}`, broker: "xts", client_code: `CLI${String(n).padStart(3, "0")}`, status: "active", consent_version: "draft-1", opening_positions: [] });
const addLinks = (count: number) => {
    for (let i = 1; i <= count; i++) {
        db.links.push(link(i));
        db.pro.add(`u${i}`);
    }
};
const other = (over: Record<string, unknown> = {}) => {
    const run = { id: `other-${++db.seq}`, source: "another-process", status: "running", started_at: new Date().toISOString(), result: null, ...over };
    db.runs.push(run);
    return run;
};
const finished = async () => {
    for (let i = 0; i < 200; i++) {
        if (!db.runs.some((r) => r.status === "running" && r.source !== "another-process" && !r.id.startsWith("other-")) && db.runs.length) return;
        await new Promise((r) => setTimeout(r, 5));
    }
    throw new Error("the sync never finished");
};

beforeEach(() => {
    Object.assign(db, { runs: [], links: [], progress: [], problems: [], synced: [], seq: 0, gate: null, onSave: null, beforeInsert: null, afterInsert: null, startFails: false });
    db.pro.clear();
    vi.stubEnv("XTS_SYNC_ENABLED", "true");
    vi.stubEnv("XTS_ADAPTER", "mock");
});

afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    // Let any run left going finish, so the next test starts with nothing in flight.
    db.gate = null;
    await new Promise((r) => setTimeout(r, 30));
});

describe("whether a run has crashed", () => {
    it("goes by the last heartbeat, and by the start if there hasn't been one", () => {
        const now = Date.now();
        expect(lastSignOfLife({ started_at: ago(10 * MIN) })).toBeCloseTo(now - 10 * MIN, -3);
        expect(lastSignOfLife({ started_at: ago(3 * 60 * MIN), result: { heartbeat: ago(MIN) } })).toBeCloseTo(now - MIN, -3);
    });

    it("is stale only after 15 minutes of silence", () => {
        expect(STALE_AFTER_MS).toBe(15 * MIN);
        expect(isStaleRun({ started_at: ago(14 * MIN) })).toBe(false);
        expect(isStaleRun({ started_at: ago(16 * MIN) })).toBe(true);
    });

    it("doesn't count a long run that is still sending heartbeats as dead", () => {
        expect(isStaleRun({ started_at: ago(3 * 60 * MIN), result: { heartbeat: ago(2 * MIN) } })).toBe(false);
        expect(isStaleRun({ started_at: ago(3 * 60 * MIN), result: { heartbeat: ago(20 * MIN) } })).toBe(true);
    });
});

describe("a run", () => {
    it("syncs every eligible customer and records its progress and result", async () => {
        addLinks(3);
        expect(await startBrokerSync("test")).toEqual({ started: true });
        await finished();

        expect(db.synced).toEqual(["CLI001", "CLI002", "CLI003"]);
        expect(db.runs).toHaveLength(1);
        expect(db.runs[0]).toMatchObject({ source: "test", status: "success", result: { total: 3, synced: 3, failed: 0, paused: 0, awaitingConsent: 0 } });
        // It said it had started, and said it had finished; the final answer then replaced the progress.
        expect(db.progress[0]).toMatchObject({ done: 0, total: 3 });
        expect(db.progress[db.progress.length - 1]).toMatchObject({ done: 3, total: 3 });
        expect(db.runs[0].result).not.toHaveProperty("heartbeat");
    });

    it("doesn't write progress after every customer, only now and then", async () => {
        addLinks(8);
        await startBrokerSync("test");
        await finished();
        expect(db.progress.map((p) => `${p.done}/${p.total}`)).toEqual(["0/8", "8/8"]); // start and end, nothing in between
    });

    it("writes more progress when it is slow", async () => {
        addLinks(4);
        vi.useFakeTimers({ toFake: ["Date"] });
        // Each customer takes 20 seconds, so each one is worth a progress note.
        db.onSave = () => void vi.setSystemTime(Date.now() + 20_000);
        await startBrokerSync("test");
        await finished();
        expect(db.progress.map((p) => p.done)).toEqual([0, 1, 2, 3, 4]);
    });

    it("leaves out customers who haven't confirmed the new consent or whose plan has lapsed, and counts them", async () => {
        addLinks(2);
        db.links.push({ ...link(3), consent_version: "older-wording" });
        db.pro.delete("u2");
        await startBrokerSync("test");
        await finished();
        expect(db.synced).toEqual(["CLI001"]);
        expect(db.runs[0].result).toMatchObject({ total: 1, synced: 1, paused: 1, awaitingConsent: 1 });
    });
});

describe("only one run at a time", () => {
    it("refuses a second attempt in this process while one is going", async () => {
        addLinks(2);
        let release!: () => void;
        db.gate = new Promise<void>((resolve) => (release = resolve));

        expect(await startBrokerSync("first")).toEqual({ started: true });
        expect(await startBrokerSync("second")).toEqual({ started: false, reason: "A sync is already running" });
        expect(db.runs).toHaveLength(1);

        release();
        await finished();
        expect(await startBrokerSync("third")).toEqual({ started: true }); // fine once the first is done
        await finished();
        expect(db.runs.map((r) => r.source)).toEqual(["first", "third"]);
    });

    it("refuses when another process has a live run, without recording an attempt of its own", async () => {
        addLinks(1);
        other();
        expect(await startBrokerSync("test")).toEqual({ started: false, reason: "A sync is already running" });
        expect(db.runs).toHaveLength(1);
        expect(db.synced).toEqual([]);
    });

    it("isn't fooled by a long run that is still alive", async () => {
        addLinks(1);
        other({ started_at: ago(3 * 60 * MIN), result: { heartbeat: ago(MIN), done: 40, total: 400 } });
        expect((await startBrokerSync("test")).started).toBe(false);
    });

    it("goes ahead when the other run crashed (no sign of life for over 15 minutes)", async () => {
        addLinks(1);
        other({ started_at: ago(20 * MIN) });
        expect(await startBrokerSync("test")).toEqual({ started: true });
        await finished();
        expect(db.synced).toEqual(["CLI001"]);
    });

    it("lets only the earlier of two attempts that start at the same moment go on (the other got in first)", async () => {
        addLinks(2);
        // Between this attempt's first look and its recording itself, another process records an earlier attempt.
        db.beforeInsert = () => void other();
        const result = await startBrokerSync("mine");

        expect(result).toEqual({ started: false, reason: "A sync is already running" });
        expect(db.runs.find((r) => r.source === "mine")).toMatchObject({ status: "skipped", result: { reason: "Another sync was already running" } });
        expect(db.synced).toEqual([]); // it didn't touch a single customer
        expect(db.problems).toEqual([]); // and a skipped attempt isn't a problem
    });

    it("goes on when the other attempt came in just after it", async () => {
        addLinks(1);
        db.afterInsert = () => void other();
        expect(await startBrokerSync("mine")).toEqual({ started: true });
        await finished();
        expect(db.synced).toEqual(["CLI001"]);
        expect(db.runs.find((r) => r.source === "mine")?.status).toBe("success");
    });

    it("can try again after being turned away", async () => {
        addLinks(1);
        const blocker = other();
        expect((await startBrokerSync("test")).started).toBe(false);
        blocker.status = "success";
        expect((await startBrokerSync("test")).started).toBe(true);
        await finished();
    });

    it("can try again after the database failed it", async () => {
        addLinks(1);
        db.startFails = true;
        await expect(startBrokerSync("test")).rejects.toThrow("database is down");
        db.startFails = false;
        expect((await startBrokerSync("test")).started).toBe(true);
        await finished();
    });
});

describe("when sync is off", () => {
    it("does nothing at all", async () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        expect(await startBrokerSync("test")).toEqual({ started: false, reason: "Broker sync is not enabled" });
        expect(db.runs).toEqual([]);
    });
});
