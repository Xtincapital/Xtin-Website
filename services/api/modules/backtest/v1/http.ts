// HTTP conventions for /api/v1: a request id on every response, errors as
// problem+json (RFC 9457) with a message a user can act on, and idempotency
// keys on every POST.
import { createHash, randomUUID } from "node:crypto";

export const PROBLEM_BASE = "https://www.xtincapital.com/problems/";

export type ProblemExtras = Record<string, unknown>;

/** Send an RFC 9457 problem. `code` becomes the type URI and a machine-readable `code` member. */
export function problem(req, res, status: number, code: string, title: string, detail?: string, extras: ProblemExtras = {}) {
    res.status(status);
    res.type("application/problem+json");
    return res.send(
        JSON.stringify({ type: `${PROBLEM_BASE}${code}`, title, status, ...(detail ? { detail } : {}), code, request_id: req.requestId, instance: req.originalUrl, ...extras })
    );
}

const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

/** X-Request-Id: echo a sane incoming id (so callers can correlate), else mint one. */
export function requestId(req, res, next) {
    const incoming = req.get?.("x-request-id");
    req.requestId = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
    res.set("X-Request-Id", req.requestId);
    next();
}

/**
 * Shared middleware (auth, rate limits) answers errors as `{ error, code }`
 * JSON. Inside /v1 rewrite those into problem+json so clients see one format.
 */
export function problemShim(req, res, next) {
    const json = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 400 && body && typeof body === "object" && !("type" in body)) {
            const code = typeof body.code === "string" ? body.code.toLowerCase() : STATUS_CODE[res.statusCode] ?? "error";
            const detail = typeof body.error === "string" ? body.error : typeof body.message === "string" ? body.message : undefined;
            const rest = Object.fromEntries(Object.entries(body).filter(([k]) => k !== "error" && k !== "message" && k !== "code"));
            return problem(req, res, res.statusCode, code, STATUS_TITLE[res.statusCode] ?? "Request failed", detail, rest);
        }
        return json(body);
    };
    next();
}

const STATUS_CODE: Record<number, string> = { 400: "bad_request", 401: "unauthorized", 403: "forbidden", 404: "not_found", 409: "conflict", 422: "unprocessable", 429: "rate_limited", 503: "unavailable" };
const STATUS_TITLE: Record<number, string> = {
    400: "Bad request",
    401: "Sign in required",
    403: "Not allowed",
    404: "Not found",
    409: "Conflict",
    422: "Can't process this request",
    429: "Too many requests",
    500: "Something went wrong",
    503: "Temporarily unavailable",
};

/** Wrap an async handler so a thrown error becomes a problem response, never an HTML 500. */
export const handle = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        console.error(`[Backtest v1] ${req.method} ${req.originalUrl} (${req.requestId}):`, err);
        if (res.headersSent) return;
        if ((err as Error)?.name === "BacktestTablesMissingError") return problem(req, res, 503, "not_migrated", "Backtest is being set up", "Please try again shortly.");
        return problem(req, res, 500, "internal", "Something went wrong", "The error has been logged. Please try again.");
    }
};

// ── idempotency ─────────────────────────────────────────────────────────────
//
// A POST with `Idempotency-Key` returns the first response again for 24 hours
// instead of acting twice (a retried "run" never double-charges, a retried
// "save" never makes two strategies). The same key with a different body is
// refused. In-process, like the rate limiter: correct for one Render instance;
// move to Redis/Postgres if the API ever runs several.

type Stored = { fingerprint: string; status: number; body: string; contentType: string; at: number } | { fingerprint: string; pending: true; at: number };

const IDEM_TTL_MS = 24 * 3_600_000;
const IDEM_MAX = 10_000;
const idem = new Map<string, Stored>();

/** Test hook. */
export const _resetIdempotency = () => idem.clear();

const VALID_KEY = /^[\x21-\x7e]{1,255}$/;

export function idempotency(req, res, next) {
    if (req.method !== "POST") return next();
    const key = req.get?.("idempotency-key");
    if (key === undefined) return next();
    if (!VALID_KEY.test(key)) return problem(req, res, 400, "invalid_idempotency_key", "Invalid Idempotency-Key", "Use 1–255 printable ASCII characters, e.g. a UUID.");

    const now = Date.now();
    for (const [k, v] of idem) if (now - v.at > IDEM_TTL_MS) idem.delete(k);
    while (idem.size >= IDEM_MAX) idem.delete(idem.keys().next().value as string);

    const who = req.user?.authId ? `u:${req.user.authId}` : `ip:${req.ip}`;
    const slot = `${who}|${req.baseUrl}${req.path}|${key}`;
    const fingerprint = createHash("sha256").update(JSON.stringify(req.body ?? null)).digest("hex");
    const seen = idem.get(slot);
    if (seen) {
        if (seen.fingerprint !== fingerprint) {
            return problem(req, res, 422, "idempotency_key_reused", "Idempotency-Key already used", "This key was used with a different request body. Use a new key for a new request.");
        }
        if ("pending" in seen) return problem(req, res, 409, "request_in_progress", "Request still in progress", "The first request with this Idempotency-Key hasn't finished yet — retry in a moment.");
        res.set("Idempotent-Replayed", "true");
        res.status(seen.status).type(seen.contentType);
        return res.send(seen.body);
    }

    idem.set(slot, { fingerprint, pending: true, at: now });
    const send = res.send.bind(res);
    res.send = (body) => {
        // Server errors aren't stored, so the client can retry them with the same key.
        if (res.statusCode >= 500) idem.delete(slot);
        else idem.set(slot, { fingerprint, status: res.statusCode, body: typeof body === "string" ? body : JSON.stringify(body), contentType: String(res.get("Content-Type") ?? "application/json"), at: now });
        return send(body);
    };
    next();
}
