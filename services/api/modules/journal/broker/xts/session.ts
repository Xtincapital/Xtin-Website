// The XTS login session: finds the broker's instance (optional host lookup),
// logs in with the key pair, and keeps the token until it is close to expiring.
//
// XTS allows ONE active session per appKey/secretKey pair. Logging in again,
// from this process or any other, ends the earlier session, so only one process
// should ever sync (the sync's run lock in broker_sync_runs is what ensures that)
// and the token is kept in memory only, never stored.
import { XtsError, type XtsHttp } from "./http.js";
import type { XtsConfig } from "./config.js";

export interface XtsSession {
    token: string;
    /** Interactive API base, no trailing slash; every path below is relative to it. */
    baseUrl: string;
    /** An investor client sees only its own account; a dealer sees every mapped client. */
    isInvestorClient: boolean;
    /** Client codes this login can read (a dealer's mapped clients). */
    clientCodes: string[];
    expiresAt: number;
}

// Tokens last 24 hours; renew an hour early rather than meet the expiry mid-request.
const SESSION_TTL_MS = 23 * 60 * 60 * 1000;

/** A string field from a response, whether it sits at the top level or inside `result`. */
const pick = (body: any, ...keys: string[]): string | undefined => {
    for (const key of keys) {
        const value = body?.[key] ?? body?.result?.[key];
        if (typeof value === "string" && value) return value;
    }
    return undefined;
};

export interface SessionManager {
    get(): Promise<XtsSession>;
    /** Forget the session if it is still the one with this token. */
    invalidate(token: string): void;
}

export function createSessionManager(config: XtsConfig, http: XtsHttp, now: () => number = Date.now): SessionManager {
    let current: XtsSession | null = null;
    let pending: Promise<XtsSession> | null = null;

    async function login(): Promise<XtsSession> {
        let baseUrl = config.baseUrl;
        let uniqueKey: string | undefined;
        if (config.hostLookup) {
            // The docs print the body's key as both AccessPassword and accesspassword; the first is the documented one.
            const found = await http.request("POST", config.hostLookup.url, { body: { AccessPassword: config.hostLookup.accessPassword, version: config.hostLookup.version } });
            uniqueKey = pick(found, "UniqueKey", "uniqueKey");
            baseUrl = pick(found, "connectionString") ?? null;
            if (!uniqueKey || !baseUrl) throw new XtsError("XTS host lookup didn't return the connection details");
        }
        if (!baseUrl) throw new XtsError("No XTS address is configured");
        baseUrl = baseUrl.replace(/\/+$/, "");

        // The docs' example also shows an `accessToken` from the browser (OAuth) login. We don't
        // have one for an unattended login; whether the broker needs it is an open question for them.
        const res = await http.request("POST", `${baseUrl}/user/session`, {
            body: { appKey: config.appKey, secretKey: config.secretKey, ...(uniqueKey ? { uniqueKey } : {}) },
        });
        const result = res.result ?? res;
        const token = pick(result, "token");
        if (!token) throw new XtsError("XTS login succeeded but returned no token");
        return {
            token,
            baseUrl,
            isInvestorClient: result.isInvestorClient === true,
            clientCodes: Array.isArray(result.clientCodes) ? result.clientCodes.map((c: unknown) => String(c).toUpperCase()) : [],
            expiresAt: now() + SESSION_TTL_MS,
        };
    }

    return {
        async get() {
            if (current && now() < current.expiresAt) return current;
            // Concurrent callers share one login, since a second login would end the first's session.
            if (!pending) {
                pending = login()
                    .then((session) => {
                        current = session;
                        return session;
                    })
                    .finally(() => {
                        pending = null;
                    });
            }
            return pending;
        },
        invalidate(token) {
            if (current?.token === token) current = null;
        },
    };
}
