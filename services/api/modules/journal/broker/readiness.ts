// "Is this ready to go live?", answered from the real settings and database
// rather than from a document someone has to keep up to date. Each check says
// ok, warn (worth knowing, doesn't stop a launch) or fail (it won't work), in
// words an admin can act on. It never shows a key, password or address.
//
// buildReadiness is a pure function of what it is given, so every case can be
// tested; broker.admin.controller.ts gathers the inputs.

export type CheckStatus = "ok" | "warn" | "fail";

export interface ReadinessCheck {
    id: string;
    label: string;
    status: CheckStatus;
    detail: string;
}

export interface ReadinessInput {
    now: number;
    nodeEnv: string | undefined;
    syncEnabled: boolean;
    /** "xts", "mock", or null when none is available. */
    adapter: string | null;
    adapterRequested: string | undefined;
    /** The XTS keys and address are all set. */
    xtsConfigured: boolean;
    proxy: "none" | "valid" | "invalid";
    consentVersion: string;
    adminCount: number;
    emailConfigured: boolean;
    schedulerOff: boolean;
    cronTokenSet: boolean;
    /** Tables and columns the sync needs that are missing (empty when the database is ready). */
    schemaMissing: string[];
    links: { pending: number; active: number; revoked: number; outdatedConsent: number };
    /** The most recent daily sync (not a backfill, not a skipped attempt), if any. */
    lastRun: { status: string; started_at: string; result?: { synced?: number; total?: number; failed?: number; error?: string } | null } | null;
    /** The trial list, or null when sync is open to every Pro customer. */
    pilot: string[] | null;
}

export interface Readiness {
    /** Nothing that would stop it working. Warnings don't count. */
    ready: boolean;
    checks: ReadinessCheck[];
    summary: { ok: number; warn: number; fail: number };
}

const HOUR = 3_600_000;
// Syncs run on weekdays, so the gap over a long weekend is more than a day.
const STALE_AFTER_HOURS = 80;

export function buildReadiness(i: ReadinessInput): Readiness {
    const checks: ReadinessCheck[] = [];
    const add = (id: string, label: string, status: CheckStatus, detail: string) => void checks.push({ id, label, status, detail });

    // ── set up
    add(
        "database",
        "Database is ready",
        i.schemaMissing.length ? "fail" : "ok",
        i.schemaMissing.length ? `Missing or unreadable: ${i.schemaMissing.join("; ")}. Run the migrations in Supabase.` : "The tables and columns the sync needs are there (migrations 0019 and 0020).",
    );
    add("switch", "Sync is switched on", i.syncEnabled ? "ok" : "warn", i.syncEnabled ? "XTS_SYNC_ENABLED is true." : "XTS_SYNC_ENABLED isn't true, so customers can't link and nothing is read. Right for now; set it when you go live.");

    if (i.adapter === "xts") add("adapter", "Real broker connection in use", "ok", "XTS_ADAPTER=xts.");
    else if (i.adapter === "mock") add("adapter", "Real broker connection in use", "warn", "The sample-data adapter is in use. It is refused in production; use XTS_ADAPTER=xts for the real thing.");
    else add("adapter", "Real broker connection in use", i.adapterRequested === "xts" ? "fail" : "warn", i.adapterRequested === "xts" ? "XTS_ADAPTER=xts, but the settings below are incomplete or the proxy address is wrong." : "No broker adapter is selected. Set XTS_ADAPTER=xts once you have the broker's settings.");

    add(
        "settings",
        "Broker settings are complete",
        i.xtsConfigured ? "ok" : i.adapterRequested === "xts" ? "fail" : "warn",
        i.xtsConfigured ? "The key pair and address are set." : "XTS_APP_KEY, XTS_SECRET_KEY and an address (XTS_BASE_URL, or the host lookup settings) aren't all set.",
    );
    add("proxy", "Route to the broker", i.proxy === "invalid" ? "fail" : "ok", i.proxy === "invalid" ? "XTS_PROXY_URL isn't a valid http(s) address, so broker calls won't be made." : i.proxy === "valid" ? "Broker traffic goes through your fixed-address proxy." : "Broker traffic goes directly from this server.");

    // ── people and wording
    add(
        "consent",
        "Consent wording is final",
        i.consentVersion.startsWith("draft") ? "warn" : "ok",
        i.consentVersion.startsWith("draft") ? `Still the draft (${i.consentVersion}). Agree the wording with the broker and bump CONSENT_VERSION before real customers link.` : `Version ${i.consentVersion}.`,
    );
    const alerts = i.emailConfigured && i.adminCount > 0;
    add("alerts", "Admins are told what needs them", alerts ? "ok" : "warn", alerts ? `${i.adminCount} admin${i.adminCount === 1 ? "" : "s"} will get link requests and failed-sync emails.` : !i.emailConfigured ? "No email is set up (RESEND_API_KEY, or EMAIL_USER and EMAIL_PASS), so link requests and failures won't be emailed." : "No admin email address is set.");

    // ── running
    const nothingTriggers = i.schedulerOff && !i.cronTokenSet;
    add(
        "schedule",
        "Something will run the daily sync",
        nothingTriggers ? "fail" : i.schedulerOff ? "warn" : "ok",
        nothingTriggers
            ? "The built-in timetable is off (DISABLE_BROKER_SYNC_CRON) and CRON_SECRET_TOKEN isn't set for an outside trigger, so nothing will start a sync."
            : i.schedulerOff
              ? "The built-in timetable is off on this server. A worker, or the outside trigger, has to run the sync."
              : "The built-in timetable runs it at 3:45 PM, 5:30 PM and 11:45 PM IST on weekdays.",
    );

    const run = i.lastRun;
    if (!run) add("lastRun", "A sync has run lately", "warn", "No daily sync has run yet. Use Run sync now, or wait for the next timetable slot.");
    else if (run.status === "running") add("lastRun", "A sync has run lately", "ok", "A sync is running now.");
    else if (run.status === "failed") add("lastRun", "A sync has run lately", "fail", `The last sync failed${run.result?.error ? `: ${run.result.error}` : "."}`);
    else if (i.now - Date.parse(run.started_at) > STALE_AFTER_HOURS * HOUR) add("lastRun", "A sync has run lately", "warn", `The last successful sync was more than ${STALE_AFTER_HOURS} hours ago.`);
    else if ((run.result?.failed ?? 0) > 0) add("lastRun", "A sync has run lately", "warn", `The last sync ran, but ${run.result?.failed} of ${run.result?.total ?? "?"} customers failed.`);
    else add("lastRun", "A sync has run lately", "ok", `The last sync covered ${run.result?.synced ?? 0} customer${run.result?.synced === 1 ? "" : "s"} without a failure.`);

    // ── rollout
    add(
        "rollout",
        "Who can use it",
        "ok",
        i.pilot ? `A trial: ${i.pilot.length} customer${i.pilot.length === 1 ? "" : "s"} (BROKER_SYNC_PILOT_EMAILS), plus admins.` : "Open to every Journal Pro customer. Set BROKER_SYNC_PILOT_EMAILS to limit it to a trial group.",
    );
    add("waiting", "Link requests waiting", i.links.pending > 0 ? "warn" : "ok", i.links.pending > 0 ? `${i.links.pending} request${i.links.pending === 1 ? " is" : "s are"} waiting for an admin to approve.` : "None waiting.");
    add("outdated", "Customers to re-confirm consent", i.links.outdatedConsent > 0 ? "warn" : "ok", i.links.outdatedConsent > 0 ? `${i.links.outdatedConsent} linked customer${i.links.outdatedConsent === 1 ? " hasn't" : "s haven't"} confirmed the current wording, so ${i.links.outdatedConsent === 1 ? "they aren't" : "they aren't"} being read.` : "Everyone linked has confirmed the current wording.");

    const summary = { ok: checks.filter((c) => c.status === "ok").length, warn: checks.filter((c) => c.status === "warn").length, fail: checks.filter((c) => c.status === "fail").length };
    return { ready: summary.fail === 0, checks, summary };
}
