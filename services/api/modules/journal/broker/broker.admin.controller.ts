// Admin side of broker linking: see who has asked to connect a client code,
// check it against what the broker has on file, and approve or turn it down.
// A link is only ever read once an admin has approved it. All routes sit behind
// requireAdmin (see broker.routes.ts).
import { HTTP_STATUS } from "../../../constants/constants.js";
import { getBrokerAdapter } from "./adapter.js";
import { countLinks, getLinkById, getUsersByAuthIds, insertFinishedRun, listLinksForReview, listRecentRuns, listRunningRuns, probeSchema, reviewLink, supabaseStore, type ReviewFilter } from "./broker.repository.js";
import { applyBackfill, planBackfill } from "./backfill.js";
import { adminEmails } from "../../../middlewares/auth.js";
import { brokerSyncEnabled } from "./adapter.js";
import { CONSENT_VERSION } from "./consent.js";
import { pilotList } from "./pilot.js";
import { buildReadiness } from "./readiness.js";
import { readXtsConfig } from "./xts/config.js";
import { readProxyUrl } from "./xts/egress.js";
import { checkStatement } from "./statementCheck.js";
import { BackfillFileError, readBackfillFile } from "./backfillFile.js";
import { isStaleRun, startBrokerSync } from "./broker.runner.js";
import { lookupOutboundIp } from "./xts/egress.js";
import { getOutboundFetch } from "./xts/index.js";
import { compareNames } from "./nameMatch.js";
import type { BrokerLink } from "./store.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FILTERS: ReviewFilter[] = ["pending", "active", "revoked", "all"];
const NOTE_MAX = 300;

type UserInfo = { email: string | null; name: string | null };

const toAdminLink = (l: BrokerLink, user?: UserInfo) => ({
    id: l.id,
    client_code: l.client_code,
    status: l.status,
    created_at: l.created_at,
    consent_at: l.consent_at,
    consent_version: l.consent_version,
    verified_at: l.verified_at,
    verification_method: l.verification_method,
    review_outcome: l.review_outcome ?? null,
    review_note: l.review_note ?? null,
    reviewed_by: l.reviewed_by ?? null,
    reviewed_at: l.reviewed_at ?? null,
    last_synced_at: l.last_synced_at,
    last_sync_status: l.last_sync_status,
    last_sync_error: l.last_sync_error,
    user: { email: user?.email ?? null, name: user?.name ?? null },
});

/** The optional note that goes with a decision: trimmed text, at most NOTE_MAX characters. */
function readNote(body: unknown): { note: string | null } | { error: string } {
    const raw = (body as { note?: unknown } | undefined)?.note;
    if (raw === undefined || raw === null) return { note: null };
    if (typeof raw !== "string") return { error: "Note must be text" };
    const note = raw.trim();
    if (note.length > NOTE_MAX) return { error: `Note can be at most ${NOTE_MAX} characters` };
    return { note: note || null };
}

/* GET /admin/broker/links?status=pending|active|revoked|all */
export const listLinks = async (req, res) => {
    const status = (typeof req.query.status === "string" ? req.query.status : "pending") as ReviewFilter;
    if (!FILTERS.includes(status)) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `status must be one of ${FILTERS.join(", ")}` });
    try {
        const links = await listLinksForReview(status);
        const users = await getUsersByAuthIds(links.map((l) => l.user_id));
        return res.status(HTTP_STATUS.OK).json({ links: links.map((l) => toAdminLink(l, users.get(l.user_id))) });
    } catch (err) {
        console.error("[Journal] admin list broker links failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't load the link requests" });
    }
};

/* GET /admin/broker/links/:id/check — what the broker has on file for this client code, beside the customer's name */
export const checkLink = async (req, res) => {
    if (!UUID.test(req.params.id)) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid link id" });
    try {
        const link = await getLinkById(req.params.id);
        if (!link) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Link not found" });

        const adapter = getBrokerAdapter();
        if (!adapter?.getClientProfile) {
            return res.status(HTTP_STATUS.OK).json({ available: false, reason: "No broker connection is set up yet, so there is nothing to check against." });
        }
        const user = (await getUsersByAuthIds([link.user_id])).get(link.user_id);
        try {
            const profile = await adapter.getClientProfile(link.client_code);
            return res.status(HTTP_STATUS.OK).json({
                available: true,
                broker_name: profile.name,
                account_name: user?.name ?? null,
                match: compareNames(profile.name, user?.name),
            });
        } catch (err) {
            console.error("[Journal] broker profile check failed:", (err as Error)?.message || err);
            return res.status(502).json({ error: "Couldn't get this client's details from the broker." });
        }
    } catch (err) {
        console.error("[Journal] admin check broker link failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't check this link" });
    }
};

/** Shared by approve and reject: validate, apply the change if the link is still in a state it applies to, and answer. */
async function decide(req, res, opts: { from: BrokerLink["status"][]; patch: (now: string, adminEmail: string, note: string | null) => Record<string, unknown>; wrongState: string; failure: string }) {
    if (!UUID.test(req.params.id)) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid link id" });
    const parsed = readNote(req.body);
    if ("error" in parsed) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: parsed.error });
    try {
        const now = new Date().toISOString();
        const updated = await reviewLink(req.params.id, opts.from, opts.patch(now, req.user.email, parsed.note));
        if (!updated) {
            return (await getLinkById(req.params.id))
                ? res.status(HTTP_STATUS.CONFLICT).json({ error: opts.wrongState, code: "WRONG_STATE" })
                : res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Link not found" });
        }
        const user = (await getUsersByAuthIds([updated.user_id])).get(updated.user_id);
        return res.status(HTTP_STATUS.OK).json({ link: toAdminLink(updated, user) });
    } catch (err) {
        console.error("[Journal] admin broker link decision failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: opts.failure });
    }
}

/* POST /admin/broker/links/:id/approve { note? } — the client code is confirmed as the customer's; it will be read from now on */
export const approveLink = (req, res) =>
    decide(req, res, {
        from: ["pending"],
        wrongState: "Only a request that is waiting can be approved.",
        failure: "Couldn't approve this link",
        patch: (now, admin, note) => ({
            status: "active",
            verified_at: now,
            verification_method: "manual",
            review_outcome: "approved",
            reviewed_by: admin,
            reviewed_at: now,
            review_note: note,
            updated_at: now,
        }),
    });

/* POST /admin/broker/links/:id/reject { note? } — turns down a waiting request, or cuts off an active link. The note is shown to the customer. */
export const rejectLink = (req, res) =>
    decide(req, res, {
        from: ["pending", "active"],
        wrongState: "This link has already been turned down or removed.",
        failure: "Couldn't reject this link",
        patch: (now, admin, note) => ({
            status: "revoked",
            review_outcome: "rejected",
            reviewed_by: admin,
            reviewed_at: now,
            review_note: note,
            updated_at: now,
        }),
    });

/* GET /admin/broker/runs — the last few daily runs */
export const listRuns = async (_req, res) => {
    try {
        return res.status(HTTP_STATUS.OK).json({ runs: await listRecentRuns(10) });
    } catch (err) {
        console.error("[Journal] admin list broker sync runs failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't load the sync runs" });
    }
};

/* POST /admin/broker/sync — run the daily sync now, without needing the cron token */
export const startSync = async (_req, res) => {
    try {
        const run = await startBrokerSync("admin");
        if ("reason" in run) return res.status(HTTP_STATUS.OK).json({ started: false, reason: run.reason });
        return res.status(202).json({ started: true });
    } catch (err) {
        console.error("[Journal] admin broker sync start failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't start the sync" });
    }
};

const CLIENT_CODE = /^[A-Za-z0-9_-]{3,30}$/;

/* POST /admin/broker/diagnose { client_code? } — a read-only test of the broker connection */
export const diagnose = async (req, res) => {
    const code = req.body?.client_code;
    if (code !== undefined && code !== null && code !== "" && !(typeof code === "string" && CLIENT_CODE.test(code.trim()))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Client code can only contain letters, numbers, - and _" });
    }
    const adapter = getBrokerAdapter();
    if (!adapter?.diagnose) {
        return res.status(HTTP_STATUS.OK).json({ available: false, reason: "There is no live broker connection to test. Set the broker's settings first." });
    }
    try {
        const report = await adapter.diagnose(typeof code === "string" && code.trim() ? code.trim() : undefined);
        return res.status(HTTP_STATUS.OK).json({ available: true, ...report });
    } catch (err) {
        console.error("[Journal] broker connection test failed:", (err as Error)?.message || err);
        return res.status(502).json({ error: "The connection test couldn't run." });
    }
};

/* GET /admin/broker/outbound-ip — the address the broker sees our requests coming from (to give them if they whitelist) */
export const outboundIp = async (_req, res) => {
    let route;
    try {
        route = getOutboundFetch();
    } catch (err) {
        // The proxy address in the settings is wrong; say so without repeating it.
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: (err as Error).message });
    }
    try {
        return res.status(HTTP_STATUS.OK).json({ ip: await lookupOutboundIp(route.fetch), via: route.viaProxy ? "proxy" : "direct" });
    } catch (err) {
        console.error("[Journal] outbound address lookup failed:", (err as Error)?.message || err);
        return res.status(502).json({ error: route.viaProxy ? "Couldn't find our address through the proxy. Check that it is running and the settings are right." : "Couldn't find our outbound address just now." });
    }
};

const SHOWN_FOR_REVIEW = 20;

/**
 * POST /admin/broker/links/:id/backfill?apply=true|false (multipart: file, file_type csv|excel)
 * Adds earlier executions for a linked customer from a broker tradebook file, and corrects the
 * trades that were worked out without them. Without apply=true it only reports what it would do.
 */
export const backfillLink = async (req, res) => {
    if (!UUID.test(req.params.id)) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid link id" });
    if (!req.file?.buffer?.length) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Choose a file to upload." });
    const rawType = String(req.body?.file_type || "").trim().toLowerCase();
    const fileType = rawType === "csv" ? "csv" : ["excel", "xls", "xlsx"].includes(rawType) ? "excel" : null;
    if (!fileType) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Upload a CSV or Excel file." });
    const apply = req.query.apply === "true";

    try {
        const link = await getLinkById(req.params.id);
        if (!link) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Link not found" });
        if (link.status !== "active") return res.status(HTTP_STATUS.CONFLICT).json({ error: "History can only be added to an active link.", code: "LINK_NOT_ACTIVE" });
        // A sync and a backfill working on the same customer at once could undo each other's changes.
        if ((await listRunningRuns()).some((run) => !isStaleRun(run))) {
            return res.status(HTTP_STATUS.CONFLICT).json({ error: "A sync is running. Try again in a few minutes.", code: "SYNC_RUNNING" });
        }

        let file;
        try {
            file = await readBackfillFile(supabaseStore, link, req.file.buffer, fileType);
        } catch (err) {
            if (err instanceof BackfillFileError) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
            throw err;
        }
        const plan = await planBackfill(supabaseStore, link, file.fills);
        const report = {
            applied: apply,
            file: {
                executions: file.executions,
                newExecutions: plan.newFills.length,
                skippedRows: file.skippedRows,
                otherClientRows: file.otherClientRows,
                leftOutDays: file.leftOutDays.slice(0, 31),
                leftOutDayCount: file.leftOutDays.length,
                from: file.from,
                to: file.to,
            },
            changes: { add: plan.insert.length, update: plan.update.length, remove: plan.remove.length, keptCount: plan.kept.length, kept: plan.kept.slice(0, SHOWN_FOR_REVIEW) },
            history: plan.totals,
        };

        if (apply) {
            await applyBackfill(supabaseStore, link, plan);
            // A record of who added what, in the same place as the sync runs.
            await insertFinishedRun(`backfill: ${req.user.email}`, { backfill: true, clientCode: link.client_code, ...report.file, ...report.changes, kept: undefined });
        }
        return res.status(HTTP_STATUS.OK).json(report);
    } catch (err) {
        console.error("[Journal] admin broker backfill failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't add the history" });
    }
};

/* GET /admin/broker/readiness — is everything in place to go live, and how is it going */
export const readiness = async (_req, res) => {
    try {
        const adapter = getBrokerAdapter();
        const [schemaMissing, links, runs] = await Promise.all([probeSchema(), countLinks(CONSENT_VERSION).catch(() => ({ pending: 0, active: 0, revoked: 0, outdatedConsent: 0 })), listRecentRuns(20).catch(() => [])]);
        // The latest real sync: not history added by an admin, not an attempt that stood aside for another.
        const lastRun = (runs as any[]).find((r) => !String(r.source ?? "").startsWith("backfill") && r.status !== "skipped") ?? null;
        const env = process.env;
        const report = buildReadiness({
            now: Date.now(),
            nodeEnv: env.NODE_ENV,
            syncEnabled: brokerSyncEnabled(),
            adapter: adapter?.name ?? null,
            adapterRequested: env.XTS_ADAPTER,
            xtsConfigured: readXtsConfig() !== null,
            proxy: (() => {
                const p = readProxyUrl();
                return "error" in p ? "invalid" : p.url ? "valid" : "none";
            })(),
            consentVersion: CONSENT_VERSION,
            adminCount: adminEmails().length,
            emailConfigured: !!env.RESEND_API_KEY || (!!env.EMAIL_USER && !!env.EMAIL_PASS),
            schedulerOff: env.DISABLE_BROKER_SYNC_CRON === "true",
            cronTokenSet: !!env.CRON_SECRET_TOKEN,
            schemaMissing,
            links,
            lastRun,
            pilot: pilotList(),
        });
        return res.status(HTTP_STATUS.OK).json({ ...report, links });
    } catch (err) {
        console.error("[Journal] admin broker readiness failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't work out the launch checklist" });
    }
};

/**
 * POST /admin/broker/links/:id/compare (multipart: file, file_type csv|excel)
 * Compares a customer's own broker statement with their journal, trade by trade. Read-only.
 */
export const compareStatement = async (req, res) => {
    if (!UUID.test(req.params.id)) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid link id" });
    if (!req.file?.buffer?.length) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Choose a file to upload." });
    const rawType = String(req.body?.file_type || "").trim().toLowerCase();
    const fileType = rawType === "csv" ? "csv" : ["excel", "xls", "xlsx"].includes(rawType) ? "excel" : null;
    if (!fileType) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Upload a CSV or Excel file." });
    try {
        const link = await getLinkById(req.params.id);
        if (!link) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Link not found" });
        try {
            return res.status(HTTP_STATUS.OK).json(await checkStatement(supabaseStore, link, req.file.buffer, fileType));
        } catch (err) {
            if (err instanceof BackfillFileError) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
            throw err;
        }
    } catch (err) {
        console.error("[Journal] admin broker statement comparison failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't compare the statement" });
    }
};
