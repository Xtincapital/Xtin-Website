// Journal broker-sync API: link a broker client code, see the connection,
// sync now, disconnect. The daily all-customers sync is the token-protected
// trigger at the bottom. Everything here is behind XTS_SYNC_ENABLED except
// reading the status and disconnecting, which must keep working if sync is
// switched off while someone is linked.
import { timingSafeEqual } from "node:crypto";
import { HTTP_STATUS } from "../../../constants/constants.js";
import { brokerSyncAvailable, brokerSyncEnabled, getBrokerAdapter } from "./adapter.js";
import { validateConsent, validateLink } from "./broker.validator.js";
import { countSyncedTrades, deleteSyncedData, getLatestLink, getLiveLink, insertLink, revokeLink, supabaseStore, updateLinkConsent } from "./broker.repository.js";
import { notifyAdminsNewBrokerLink } from "../../../services/adminNotify.service.js";
import { startBrokerSync } from "./broker.runner.js";
import { CONSENT_TEXT, CONSENT_VERSION, consentIsCurrent } from "./consent.js";
import { pilotAllows, pilotList } from "./pilot.js";
import { syncLink } from "./syncService.js";
import type { BrokerLink } from "./store.js";

// Reading a broker costs a rate-limited request per customer, so "sync now" is not for hammering.
const MANUAL_SYNC_COOLDOWN_MS = 10 * 60 * 1000;
const lastManualAttempt = new Map<string, number>();

// The same timing-safe check the other cron-triggered endpoints use.
const sameToken = (given: unknown, expected: string) => {
    const a = Buffer.from(String(given ?? ""));
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
};

/** What the browser may see of a link; never the raw sync error. */
const publicLink = (l: BrokerLink) => ({
    id: l.id,
    client_code: l.client_code,
    status: l.status,
    consent_at: l.consent_at,
    verified_at: l.verified_at,
    last_synced_at: l.last_synced_at,
    last_sync_status: l.last_sync_status,
    // The consent wording has changed since they agreed: reading is paused until they confirm the new one.
    consent_outdated: !consentIsCurrent(l),
});

/** 503 unless sync is switched on and has an adapter; 403 for a customer outside the trial, while there is one. */
export const requireBrokerSync = (req, res, next) => {
    if (!brokerSyncAvailable()) {
        return res.status(503).json({ error: "Broker sync isn't available yet.", code: "BROKER_SYNC_UNAVAILABLE" });
    }
    if (!pilotAllows(req.user?.email)) {
        return res.status(403).json({ error: "Broker sync is being tried with a small group first and isn't open to your account yet.", code: "BROKER_SYNC_PILOT" });
    }
    next();
};

/* GET /journal/broker/status */
export const getStatus = async (req, res) => {
    const userId = req.user.authId;
    try {
        const link = await getLiveLink(userId);
        const synced = link ? await countSyncedTrades(userId) : 0;
        // With no current link, say so if the last request was turned down (a newer request replaces this).
        const latest = link ? null : await getLatestLink(userId);
        const rejection = latest?.review_outcome === "rejected" ? { client_code: latest.client_code, note: latest.review_note ?? null, at: latest.reviewed_at ?? null } : null;
        const allowed = pilotAllows(req.user.email);
        return res.status(HTTP_STATUS.OK).json({
            enabled: brokerSyncEnabled(),
            available: brokerSyncAvailable() && allowed,
            // Sync is live, but only for a trial group that doesn't include this customer yet.
            pilot_only: brokerSyncAvailable() && !allowed && pilotList() !== null,
            consent: { version: CONSENT_VERSION, text: CONSENT_TEXT },
            link: link ? publicLink(link) : null,
            rejection,
            synced_trades: synced,
        });
    } catch (err) {
        console.error("[Journal] broker status failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't load your broker connection" });
    }
};

/* POST /journal/broker/link { client_code, consent: true, consent_version } */
export const createLink = async (req, res) => {
    const validation = validateLink(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { client_code, consent_version } = validation.data;
    if (consent_version !== CONSENT_VERSION) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: "The consent wording has changed. Please read it again and confirm.", code: "CONSENT_CHANGED" });
    }
    const userId = req.user.authId;

    try {
        if (await getLiveLink(userId)) {
            return res.status(HTTP_STATUS.CONFLICT).json({ error: "You already have a broker connected. Disconnect it first.", code: "ALREADY_LINKED" });
        }
        // Nothing can yet prove who owns a client code, so a link waits as 'pending' and
        // is never read. Only the sample-data adapter (never in production) skips that.
        const verified = getBrokerAdapter()?.name === "mock";
        const now = new Date().toISOString();
        const { data, error } = await insertLink({
            user_id: userId,
            broker: "xts",
            client_code,
            status: verified ? "active" : "pending",
            consent_version,
            consent_at: now,
            verified_at: verified ? now : null,
            verification_method: verified ? "mock" : null,
        });
        if (error) {
            // The client code is already linked to another account. Say no more than that.
            if (error.code === "23505") {
                return res.status(HTTP_STATUS.CONFLICT).json({ error: "This client code can't be linked to your account.", code: "CODE_UNAVAILABLE" });
            }
            throw error;
        }
        // A request that is waiting needs someone to look at it.
        if (!verified) {
            notifyAdminsNewBrokerLink({
                id: (data as BrokerLink).id,
                client_code,
                email: req.user.email ?? null,
                name: [req.user.first_name, req.user.last_name].filter(Boolean).join(" "),
            });
        }
        return res.status(HTTP_STATUS.CREATED).json(publicLink(data as BrokerLink));
    } catch (err) {
        console.error("[Journal] broker link failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't link your broker account" });
    }
};

/* DELETE /journal/broker/link?delete_data=true */
export const removeLink = async (req, res) => {
    const userId = req.user.authId;
    const deleteData = req.query.delete_data === "true";
    try {
        const link = await getLiveLink(userId);
        if (!link) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "No broker connection to remove" });
        // Stop reading first; that is what matters most. Then remove the data if asked.
        await revokeLink(link.id);
        if (deleteData) {
            try {
                await deleteSyncedData(userId, link.client_code);
            } catch (err) {
                console.error("[Journal] deleting synced broker data failed:", err);
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Your broker is disconnected, but we couldn't delete the synced trades. Please contact support." });
            }
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, deleted_data: deleteData });
    } catch (err) {
        console.error("[Journal] broker disconnect failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't disconnect your broker" });
    }
};

/* POST /journal/broker/consent { consent: true, consent_version } — confirm the current wording after it changed */
export const reconsent = async (req, res) => {
    const validation = validateConsent(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (validation.data.consent_version !== CONSENT_VERSION) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: "The consent wording has changed. Please read it again and confirm.", code: "CONSENT_CHANGED" });
    }
    try {
        const link = await getLiveLink(req.user.authId);
        if (!link) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "No broker connection to confirm" });
        if (consentIsCurrent(link)) return res.status(HTTP_STATUS.OK).json(publicLink(link));
        const updated = await updateLinkConsent(link.id, CONSENT_VERSION);
        if (!updated) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "No broker connection to confirm" });
        return res.status(HTTP_STATUS.OK).json(publicLink(updated));
    } catch (err) {
        console.error("[Journal] broker re-consent failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't save your confirmation" });
    }
};

/* POST /journal/broker/sync */
export const syncNow = async (req, res) => {
    const userId = req.user.authId;
    try {
        const link = await getLiveLink(userId);
        if (!link || link.status !== "active") {
            return res.status(HTTP_STATUS.CONFLICT).json({ error: "Your broker connection isn't active yet.", code: "LINK_NOT_ACTIVE" });
        }
        if (!consentIsCurrent(link)) {
            return res.status(HTTP_STATUS.CONFLICT).json({ error: "Please confirm the updated consent wording first.", code: "CONSENT_OUTDATED" });
        }
        const lastTried = Math.max(lastManualAttempt.get(userId) ?? 0, link.last_synced_at ? Date.parse(link.last_synced_at) : 0);
        const waitMs = lastTried + MANUAL_SYNC_COOLDOWN_MS - Date.now();
        if (waitMs > 0) {
            return res.status(429).json({ error: "You synced a moment ago. Try again in a few minutes.", code: "SYNC_COOLDOWN", retry_after_seconds: Math.ceil(waitMs / 1000) });
        }
        lastManualAttempt.set(userId, Date.now());

        const adapter = getBrokerAdapter();
        if (!adapter) return res.status(503).json({ error: "Broker sync isn't available yet.", code: "BROKER_SYNC_UNAVAILABLE" });
        try {
            return res.status(HTTP_STATUS.OK).json(await syncLink(adapter, supabaseStore, link));
        } catch (err) {
            const message = ((err as Error)?.message || String(err)).slice(0, 300);
            console.error("[Journal] broker sync-now failed:", message);
            await supabaseStore.recordSync(link, { ok: false, error: message }).catch(() => undefined);
            return res.status(502).json({ error: "We couldn't read your trades from your broker just now. Please try again later." });
        }
    } catch (err) {
        console.error("[Journal] broker sync-now failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't sync your trades" });
    }
};

/**
 * POST /api/trigger-broker-sync?token=CRON_SECRET_TOKEN
 * For an external scheduler (cron-job.org), once a day after the market closes.
 * Answers at once and syncs in the background. Refuses to run when
 * CRON_SECRET_TOKEN isn't set rather than letting anyone call it.
 */
export const triggerBrokerSync = async (req, res) => {
    const secret = process.env.CRON_SECRET_TOKEN;
    if (!secret) return res.status(503).json({ error: "CRON_SECRET_TOKEN is not configured" });
    if (!sameToken(req.query.token || req.headers["x-cron-token"], secret)) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "Invalid cron token" });
    }
    try {
        const run = await startBrokerSync("http-trigger");
        // 200 for a skip: cron-job.org retries on non-2xx.
        if ("reason" in run) return res.status(HTTP_STATUS.OK).json({ started: false, skipped: true, reason: run.reason });
        return res.status(202).json({ started: true });
    } catch (err) {
        console.error("[Journal] broker sync trigger failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Couldn't start the sync" });
    }
};
