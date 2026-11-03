// Runs the daily sync for every active link, in the background.
//
// Triggered by the in-process scheduler (broker.scheduler.ts), by the admin's
// "Run sync now", and by POST /api/trigger-broker-sync (an external scheduler
// such as cron-job.org). Any of them, in any number of processes, may fire at
// once, and only one sync may run: XTS allows one login session per key pair,
// so a second sync would end the first one's session mid-run.
//
// How one run is chosen. Every attempt writes its own row in broker_sync_runs
// and then looks at the rows still running; only the earliest one goes on, and
// the others mark themselves skipped. Because each attempt records itself
// before it looks, at least one always sees the other, so two attempts at the
// same instant can't both win.
//
// A running sync records a heartbeat in its row as it works through the
// customers. A run with no heartbeat for STALE_AFTER_MS is taken to have
// crashed, so a long sweep isn't mistaken for a dead one and a dead one doesn't
// block the next day.
import { brokerSyncEnabled, getBrokerAdapter } from "./adapter.js";
import { completeRun, listActiveLinks, listRunningRuns, startRun, supabaseStore, updateRunProgress } from "./broker.repository.js";
import { getPlanTier } from "../planTier.js";
import { notifyAdminsBrokerSyncProblem } from "../../../services/adminNotify.service.js";
import { consentIsCurrent } from "./consent.js";
import type { BrokerLink } from "./store.js";
import { syncLinks } from "./syncService.js";
import type { BrokerAdapter } from "./types.js";

// A run whose last sign of life is older than this has crashed.
export const STALE_AFTER_MS = 15 * 60 * 1000;
// How often a running sync writes its progress.
const PROGRESS_EVERY_MS = 15 * 1000;
const ALREADY_RUNNING = "A sync is already running";

let running = false;

type RunLike = { started_at: string; result?: { heartbeat?: string } | null };

/** When a run last showed it was alive: its latest heartbeat, or its start if it hasn't written one yet. */
export const lastSignOfLife = (run: RunLike) => Date.parse(run.result?.heartbeat ?? run.started_at);

export const isStaleRun = (run: RunLike, now = Date.now()) => now - lastSignOfLife(run) > STALE_AFTER_MS;

const liveRuns = async () => (await listRunningRuns()).filter((run) => !isStaleRun(run));

async function runAll(adapter: BrokerAdapter, runId: string, source: string) {
    // Progress is best effort: failing to write it must never stop the sync.
    const beat = async (done: number, total: number) => {
        try {
            await updateRunProgress(runId, { heartbeat: new Date().toISOString(), done, total });
        } catch (err) {
            console.error("[Journal] could not record sync progress:", (err as Error)?.message || err);
        }
    };

    try {
        const links = await listActiveLinks();
        // Two reasons to leave a link alone for now; both keep it linked and resume by themselves:
        //  - the consent wording changed and the customer hasn't confirmed the new one yet
        //  - syncing is a Journal Pro feature and their plan has lapsed (the days in between can't be fetched later)
        const eligible: BrokerLink[] = [];
        let awaitingConsent = 0;
        let paused = 0;
        for (const link of links) {
            if (!consentIsCurrent(link)) awaitingConsent += 1;
            else if ((await getPlanTier(link.user_id)) !== "pro") paused += 1;
            else eligible.push(link);
        }

        await beat(0, eligible.length);
        let lastBeat = Date.now();
        const onProgress = (done: number, total: number) => {
            if (done < total && Date.now() - lastBeat < PROGRESS_EVERY_MS) return;
            lastBeat = Date.now();
            void beat(done, total);
        };
        const result = { ...(await syncLinks(adapter, supabaseStore, eligible, onProgress)), paused, awaitingConsent };
        // "failed" only when nothing worked; a few customers failing is in the result.
        await completeRun(runId, result.total > 0 && result.synced === 0 ? "failed" : "success", result);
        console.log("[Journal] broker sync finished:", { ...result, failures: result.failures.length });
        if (result.failed > 0) notifyAdminsBrokerSyncProblem({ source, ...result });
    } catch (err) {
        console.error("[Journal] broker sync failed:", err);
        const error = ((err as Error)?.message || String(err)).slice(0, 300);
        notifyAdminsBrokerSyncProblem({ source, total: 0, synced: 0, failed: 0, failures: [], error });
        // If even this fails the run stays "running" and is treated as crashed after STALE_AFTER_MS.
        await completeRun(runId, "failed", { error });
    }
}

export async function startBrokerSync(source: string): Promise<{ started: true } | { started: false; reason: string }> {
    const adapter = getBrokerAdapter();
    if (!brokerSyncEnabled() || !adapter) return { started: false, reason: "Broker sync is not enabled" };
    if (running) return { started: false, reason: ALREADY_RUNNING };

    running = true;
    let runId: string;
    try {
        // Cheap look first, so a scheduler that fires while a sync is going doesn't leave a row each time.
        if ((await liveRuns()).length) {
            running = false;
            return { started: false, reason: ALREADY_RUNNING };
        }
        const { data: run, error } = await startRun(source);
        if (error || !run) throw error ?? new Error("Could not record the sync run");
        runId = run.id;

        // Another process may have started at the same moment. The earliest recorded run goes on.
        const [first] = await liveRuns();
        if (first?.id !== runId) {
            await completeRun(runId, "skipped", { reason: "Another sync was already running" });
            running = false;
            return { started: false, reason: ALREADY_RUNNING };
        }
    } catch (err) {
        running = false;
        throw err;
    }

    void runAll(adapter, runId, source).finally(() => {
        running = false;
    });
    return { started: true };
}
