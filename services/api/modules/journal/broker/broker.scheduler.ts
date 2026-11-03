// Runs the broker sync on a timetable, inside the server (or a worker), so it
// doesn't depend only on an outside scheduler like cron-job.org. That outside
// trigger (POST /api/trigger-broker-sync) still works alongside this: every
// path goes through startBrokerSync, which lets only one run happen at a time.
//
// The broker's trade book is for the current day only, so a sync that is missed
// is lost once the day ends. Two things guard against that:
//   - three runs a day, the later two being a retry and the commodity close;
//   - a catch-up after a restart or a wake-up: a host that sleeps (Render's
//     free tier) misses timers, so on start it checks whether the latest cutoff
//     has been covered by a run and, if not, syncs then.
import cron from "node-cron";
import { brokerSyncEnabled } from "./adapter.js";
import { listRecentRuns } from "./broker.repository.js";
import { isStaleRun, startBrokerSync } from "./broker.runner.js";

const TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60_000;
const CATCH_UP_DELAY_MS = 90 * 1000;

// Weekdays only: the exchanges are closed at weekends, so there is nothing to read.
export const SYNC_SCHEDULES = [
    { label: "after the equity and F&O close (3:45 PM IST)", expr: "45 15 * * 1-5" },
    { label: "retry (5:30 PM IST)", expr: "30 17 * * 1-5" },
    { label: "after the commodity close (11:45 PM IST)", expr: "45 23 * * 1-5" },
];

// Minutes after midnight IST by which a day's trades are complete: the equity and F&O close (3:30 PM)
// plus a margin, and the commodity close (11:30 PM) plus a margin. A run started after a cutoff has
// everything up to that cutoff. The 5:30 PM run is only a retry, so it isn't one.
const CUTOFFS_IST = [15 * 60 + 45, 23 * 60 + 45];

type RunRow = { status: string; started_at: string; source?: string; result?: { heartbeat?: string } | null };

/**
 * Whether a sync has been missed and should run now. True on a weekday, once a cutoff has passed,
 * if no run that started after the latest cutoff succeeded or is still going. A failed, skipped or
 * crashed run doesn't count, so those are tried again. After midnight it is always false: the
 * broker's trade book no longer has the day's trades to fetch.
 */
export function catchUpDue(nowMs: number, runs: RunRow[]): boolean {
    const ist = new Date(nowMs + IST_OFFSET_MS);
    const weekday = ist.getUTCDay(); // 0 is Sunday
    if (weekday === 0 || weekday === 6) return false;

    const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    const cutoff = [...CUTOFFS_IST].reverse().find((c) => c <= minutes);
    if (cutoff === undefined) return false;

    const midnightIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET_MS;
    const cutoffMs = midnightIst + cutoff * 60_000;
    // A backfill (history added by an admin) is recorded as a run too, but it isn't a sync of the day.
    const covered = runs.some((r) => !r.source?.startsWith("backfill") && Date.parse(r.started_at) >= cutoffMs && (r.status === "success" || (r.status === "running" && !isStaleRun(r, nowMs))));
    return !covered;
}

/** Starts a sync if the latest cutoff has not been covered. Never throws. */
export async function catchUpIfMissed(nowMs = Date.now()) {
    try {
        if (catchUpDue(nowMs, await listRecentRuns(20))) {
            console.log("[BrokerSync] A scheduled sync was missed; running one now.");
            return await startBrokerSync("startup-catch-up");
        }
    } catch (err) {
        console.error("[BrokerSync] catch-up check failed:", (err as Error)?.message || err);
    }
    return null;
}

export function startBrokerSyncScheduler() {
    if (!brokerSyncEnabled()) {
        console.log("[BrokerSync] Scheduler is off (XTS_SYNC_ENABLED is not true).");
        return;
    }
    if (process.env.DISABLE_BROKER_SYNC_CRON === "true") {
        console.log("[BrokerSync] In-process scheduler is off (DISABLE_BROKER_SYNC_CRON=true); relying on the outside trigger.");
        return;
    }

    for (const { label, expr } of SYNC_SCHEDULES) {
        cron.schedule(
            expr,
            () => {
                startBrokerSync(`cron:${label}`)
                    .then((run) => {
                        if ("reason" in run) console.log(`[BrokerSync] ${label}: not started (${run.reason}).`);
                    })
                    .catch((err) => console.error(`[BrokerSync] ${label}: could not start:`, (err as Error)?.message || err));
            },
            { timezone: TIMEZONE },
        );
        console.log(`[BrokerSync] Registered ${label} → "${expr}" (${TIMEZONE})`);
    }

    // The process may have been asleep, or restarting, through a scheduled time.
    const timer = setTimeout(() => void catchUpIfMissed(), CATCH_UP_DELAY_MS);
    timer.unref?.();
}
