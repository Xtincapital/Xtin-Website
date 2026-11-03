// A small HTTP client for XTS: JSON in and out, the documented response
// envelope turned into errors, a one-request-per-second pace (the Interactive
// API's limit for most read endpoints), and a few retries for 429s and flaky
// networks. It never puts a token, key or secret into an error message.

export class XtsError extends Error {
    readonly status: number | null;
    readonly code: string | null;
    /** The session token was missing, expired or refused, so logging in again may fix it. */
    readonly auth: boolean;
    constructor(message: string, opts: { status?: number | null; code?: string | null; auth?: boolean } = {}) {
        super(message);
        this.name = "XtsError";
        this.status = opts.status ?? null;
        this.code = opts.code ?? null;
        this.auth = opts.auth ?? false;
    }
}

export interface XtsHttpDeps {
    fetch?: typeof fetch;
    sleep?: (ms: number) => Promise<void>;
    now?: () => number;
    timeoutMs?: number;
    /** Smallest gap between the start of two requests. */
    minIntervalMs?: number;
}

export interface XtsRequestOptions {
    headers?: Record<string, string>;
    body?: unknown;
}

export interface XtsHttp {
    request(method: "GET" | "POST", url: string, options?: XtsRequestOptions): Promise<any>;
}

// The docs don't say what an expired token looks like (no 401 body is documented),
// so a 401 or an error that talks about the token or session counts.
const AUTH_HINT = /token|session|unauthori[sz]ed|expired/i;
const MAX_429_RETRIES = 3;
const MAX_NETWORK_RETRIES = 2;
const MAX_WAIT_MS = 30_000;

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createXtsHttp(deps: XtsHttpDeps = {}): XtsHttp {
    const doFetch = deps.fetch ?? fetch;
    const sleep = deps.sleep ?? realSleep;
    const now = deps.now ?? Date.now;
    const timeoutMs = deps.timeoutMs ?? 20_000;
    const minIntervalMs = deps.minIntervalMs ?? 1000;

    // Requests take turns, each at least `minIntervalMs` after the previous one began.
    let lastStart = 0;
    let queue: Promise<void> = Promise.resolve();
    const takeTurn = (): Promise<void> => {
        const turn = queue.then(async () => {
            const wait = lastStart + minIntervalMs - now();
            if (wait > 0) await sleep(wait);
            lastStart = now();
        });
        queue = turn.catch(() => undefined);
        return turn;
    };

    const retryDelay = (res: Response | null, attempt: number) => {
        const seconds = Number(res?.headers.get("retry-after"));
        const ms = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 2 ** attempt * 1000;
        return Math.min(ms, MAX_WAIT_MS);
    };

    async function readEnvelope(res: Response): Promise<any> {
        let body: any = null;
        try {
            body = await res.json();
        } catch {
            // not JSON; handled below
        }
        const failed = !res.ok || body?.type === "error";
        if (failed) {
            const description = typeof body?.description === "string" && body.description ? body.description.slice(0, 200) : `HTTP ${res.status}`;
            throw new XtsError(`XTS: ${description}`, { status: res.status, code: typeof body?.code === "string" ? body.code : null, auth: res.status === 401 || AUTH_HINT.test(description) });
        }
        if (body === null || typeof body !== "object") {
            throw new XtsError("XTS sent a response we couldn't read", { status: res.status });
        }
        return body;
    }

    return {
        async request(method, url, options = {}) {
            const idempotent = method === "GET";
            let rateLimited = 0;
            let networkFailures = 0;
            for (;;) {
                await takeTurn();
                let res: Response;
                try {
                    res = await doFetch(url, {
                        method,
                        headers: { Accept: "application/json", ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}), ...options.headers },
                        body: options.body === undefined ? undefined : JSON.stringify(options.body),
                        signal: AbortSignal.timeout(timeoutMs),
                    });
                } catch {
                    // Only a read is safe to repeat; a login or lookup that timed out may have gone through.
                    if (idempotent && networkFailures < MAX_NETWORK_RETRIES) {
                        networkFailures += 1;
                        await sleep(retryDelay(null, networkFailures));
                        continue;
                    }
                    throw new XtsError("Could not reach the XTS server");
                }
                if (res.status === 429 && rateLimited < MAX_429_RETRIES) {
                    rateLimited += 1;
                    await sleep(retryDelay(res, rateLimited));
                    continue;
                }
                return readEnvelope(res);
            }
        },
    };
}
