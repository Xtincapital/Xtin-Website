import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const cron = vi.hoisted(() => ({ jobs: [] as Array<{ expr: string; fire: () => void; options: any }> }));
vi.mock("node-cron", () => ({
    default: {
        schedule: (expr: string, fire: () => void, options: unknown) => void cron.jobs.push({ expr, fire, options }),
        validate: () => true,
    },
}));

const state = vi.hoisted(() => ({ runs: [] as any[], listFails: false, started: [] as string[], startResult: { started: true } as any, startThrows: false }));
vi.mock("./broker.repository.js", () => ({
    listRecentRuns: async () => {
        if (state.listFails) throw new Error("database is down");
        return state.runs;
    },
}));
vi.mock("./broker.runner.js", () => ({
    // The real staleness rule, but no actual syncing.
    isStaleRun: (run: any, now = Date.now()) => now - Date.parse(run.result?.heartbeat ?? run.started_at) > 15 * 60 * 1000,
    startBrokerSync: async (source: string) => {
        state.started.push(source);
        if (state.startThrows) throw new Error("could not record the run");
        return state.startResult;
    },
}));

const { catchUpDue, catchUpIfMissed, startBrokerSyncScheduler, SYNC_SCHEDULES } = await import("./broker.scheduler.js");

// Tuesday 3 November 2026, in Indian time.
const ist = (hhmm: string, day = "2026-11-03") => Date.parse(`${day}T${hhmm}:00+05:30`);
const run = (status: string, hhmm: string, extra: Record<string, unknown> = {}, day = "2026-11-03") => ({ status, started_at: new Date(ist(hhmm, day)).toISOString(), ...extra });

describe("catchUpDue", () => {
    it("is not due before the first cutoff, or after midnight", () => {
        expect(catchUpDue(ist("15:44"), [])).toBe(false);
        expect(catchUpDue(ist("09:00"), [])).toBe(false);
        expect(catchUpDue(ist("00:10", "2026-11-04"), [])).toBe(false); // past midnight: the day's trades are gone
    });

    it("is due once the first cutoff has passed with nothing run", () => {
        expect(catchUpDue(ist("15:45"), [])).toBe(true);
        expect(catchUpDue(ist("16:30"), [])).toBe(true);
        expect(catchUpDue(ist("23:30"), [])).toBe(true);
    });

    it("is covered by a run that succeeded after the cutoff", () => {
        expect(catchUpDue(ist("16:30"), [run("success", "15:50")])).toBe(false);
        expect(catchUpDue(ist("20:00"), [run("success", "17:31")])).toBe(false);
    });

    it("is not covered by a run from before the cutoff", () => {
        expect(catchUpDue(ist("16:30"), [run("success", "15:30")])).toBe(true);
        expect(catchUpDue(ist("16:30"), [run("success", "15:50", {}, "2026-11-02")])).toBe(true); // yesterday's
    });

    it("tries again after a failed, skipped or crashed run", () => {
        expect(catchUpDue(ist("16:30"), [run("failed", "15:50")])).toBe(true);
        expect(catchUpDue(ist("16:30"), [run("skipped", "15:50")])).toBe(true);
        // "running" with no heartbeat for 40 minutes is a crash.
        expect(catchUpDue(ist("16:30"), [run("running", "15:50")])).toBe(true);
    });

    it("is covered by a run that is still going", () => {
        expect(catchUpDue(ist("16:00"), [run("running", "15:50")])).toBe(false);
        // A long sweep that started earlier but is still sending heartbeats.
        expect(catchUpDue(ist("17:00"), [run("running", "15:50", { result: { heartbeat: new Date(ist("16:58")).toISOString() } })])).toBe(false);
    });

    it("doesn't count history added by an admin as a sync of the day", () => {
        const backfill = run("success", "15:50", { source: "backfill: admin@x.test" });
        expect(catchUpDue(ist("16:30"), [backfill])).toBe(true); // the day still needs its sync
        expect(catchUpDue(ist("16:30"), [backfill, run("success", "16:00", { source: "cron:after the equity and F&O close (3:45 PM IST)" })])).toBe(false);
    });

    it("wants a second run after the commodity close, even if the afternoon one went well", () => {
        const afternoon = [run("success", "16:00")];
        expect(catchUpDue(ist("23:44"), afternoon)).toBe(false);
        expect(catchUpDue(ist("23:45"), afternoon)).toBe(true);
        expect(catchUpDue(ist("23:50"), [...afternoon, run("success", "23:46")])).toBe(false);
    });

    it("never fires at weekends", () => {
        expect(catchUpDue(ist("16:30", "2026-11-07"), [])).toBe(false); // Saturday
        expect(catchUpDue(ist("16:30", "2026-11-08"), [])).toBe(false); // Sunday
        expect(catchUpDue(ist("16:30", "2026-11-06"), [])).toBe(true); // Friday
        expect(catchUpDue(ist("23:50", "2026-11-06"), [])).toBe(true);
    });

    it("reads the day on the Indian clock, not UTC", () => {
        // 18:20 UTC on Tuesday is 23:50 on Tuesday in India; 20:00 UTC is already Wednesday 01:30 there.
        expect(catchUpDue(Date.parse("2026-11-03T18:20:00Z"), [])).toBe(true);
        expect(catchUpDue(Date.parse("2026-11-03T20:00:00Z"), [])).toBe(false);
        // Friday 23:50 India is still Friday; Saturday 01:30 India is not a trading day.
        expect(catchUpDue(Date.parse("2026-11-06T18:20:00Z"), [])).toBe(true);
        expect(catchUpDue(Date.parse("2026-11-06T20:00:00Z"), [])).toBe(false);
    });
});

describe("catchUpIfMissed", () => {
    beforeEach(() => Object.assign(state, { runs: [], listFails: false, started: [], startResult: { started: true }, startThrows: false }));

    it("starts a sync when one was missed", async () => {
        const result = await catchUpIfMissed(ist("16:30"));
        expect(state.started).toEqual(["startup-catch-up"]);
        expect(result).toEqual({ started: true });
    });

    it("leaves things alone when the latest cutoff is covered", async () => {
        state.runs = [run("success", "15:50")];
        expect(await catchUpIfMissed(ist("16:30"))).toBeNull();
        expect(state.started).toEqual([]);
    });

    it("never throws, whether the database or the start fails", async () => {
        state.listFails = true;
        expect(await catchUpIfMissed(ist("16:30"))).toBeNull();
        state.listFails = false;
        state.startThrows = true;
        await expect(catchUpIfMissed(ist("16:30"))).resolves.toBeNull();
    });
});

describe("startBrokerSyncScheduler", () => {
    beforeEach(() => {
        cron.jobs.length = 0;
        Object.assign(state, { runs: [], listFails: false, started: [], startResult: { started: true }, startThrows: false });
        vi.useFakeTimers();
        vi.stubEnv("XTS_SYNC_ENABLED", "true");
        vi.spyOn(console, "log").mockImplementation(() => undefined);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("registers the three weekday runs, in Indian time", () => {
        startBrokerSyncScheduler();
        expect(cron.jobs.map((j) => j.expr)).toEqual(["45 15 * * 1-5", "30 17 * * 1-5", "45 23 * * 1-5"]);
        expect(cron.jobs.every((j) => j.options.timezone === "Asia/Kolkata")).toBe(true);
        expect(SYNC_SCHEDULES).toHaveLength(3);
    });

    it("does nothing when sync is switched off", () => {
        vi.stubEnv("XTS_SYNC_ENABLED", "false");
        startBrokerSyncScheduler();
        expect(cron.jobs).toEqual([]);
    });

    it("can be turned off on its own, leaving the outside trigger to do the work", async () => {
        vi.stubEnv("DISABLE_BROKER_SYNC_CRON", "true");
        startBrokerSyncScheduler();
        expect(cron.jobs).toEqual([]);
        await vi.advanceTimersByTimeAsync(120_000);
        expect(state.started).toEqual([]); // and no catch-up either
    });

    it("starts a sync, named for the slot, when a job fires", async () => {
        startBrokerSyncScheduler();
        cron.jobs[1].fire();
        await vi.advanceTimersByTimeAsync(0);
        expect(state.started).toEqual(["cron:retry (5:30 PM IST)"]);
    });

    it("survives a sync that can't be started, or is refused", async () => {
        startBrokerSyncScheduler();
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        state.startThrows = true;
        cron.jobs[0].fire();
        await vi.advanceTimersByTimeAsync(0);
        expect(error).toHaveBeenCalled();

        state.startThrows = false;
        state.startResult = { started: false, reason: "A sync is already running" };
        cron.jobs[0].fire();
        await vi.advanceTimersByTimeAsync(0);
        expect(state.started).toHaveLength(2);
    });

    it("checks for a missed run 90 seconds after starting", async () => {
        vi.setSystemTime(ist("16:30"));
        startBrokerSyncScheduler();
        await vi.advanceTimersByTimeAsync(89_000);
        expect(state.started).toEqual([]);
        await vi.advanceTimersByTimeAsync(2_000);
        expect(state.started).toEqual(["startup-catch-up"]);
    });

    it("doesn't catch up when nothing was missed", async () => {
        vi.setSystemTime(ist("10:00"));
        startBrokerSyncScheduler();
        await vi.advanceTimersByTimeAsync(120_000);
        expect(state.started).toEqual([]);
    });
});
