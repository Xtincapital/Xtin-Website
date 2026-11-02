// In-process sliding-window limiter, keyed per signed-in user (or per client IP
// for anonymous calls). Each limiter can stack several windows — e.g. a burst
// cap per minute plus a sustained cap per hour — so a script hammering the
// engine is stopped quickly while normal use never notices. Fine for a single
// Render instance; swap for Redis if the API ever runs multi-process.
type Window = { limit: number; seconds: number };

/** Best-effort client address. Behind Render/Cloudflare `req.ip` is the proxy, not the visitor. */
export const clientIp = (req): string => {
    const cf = req.get?.("cf-connecting-ip");
    if (cf) return String(cf).trim();
    const xff = req.get?.("x-forwarded-for");
    if (xff) return String(xff).split(",")[0].trim();
    return req.ip || req.socket?.remoteAddress || "unknown";
};

const hits = new Map<string, Map<string, number[]>>(); // bucket → key → timestamps (ms)

const fmtWait = (s: number) => (s < 90 ? `${s} second${s === 1 ? "" : "s"}` : `${Math.ceil(s / 60)} minutes`);

/**
 * @param action  what the user is doing, for the message ("running backtests")
 * @param keyOf   who to count — defaults to the signed-in user, else `ipOf(req)`
 */
export const rateLimit = (bucket: string, windows: Window[], action: string, ipOf: (req) => string = (req) => req.ip || "unknown") => {
    const longest = Math.max(...windows.map((w) => w.seconds)) * 1000;
    return (req, res, next) => {
        const now = Date.now();
        const key = req.user?.authId ? `user:${req.user.authId}` : `ip:${ipOf(req)}`;
        const byKey = hits.get(bucket) ?? new Map<string, number[]>();
        hits.set(bucket, byKey);
        const recent = (byKey.get(key) ?? []).filter((t) => t > now - longest);

        for (const w of windows) {
            const inWindow = recent.filter((t) => t > now - w.seconds * 1000);
            if (inWindow.length >= w.limit) {
                // Free again when the oldest hit in this window ages out.
                const retry = Math.max(1, Math.ceil((inWindow[0] + w.seconds * 1000 - now) / 1000));
                byKey.set(key, recent);
                res.set("Retry-After", String(retry));
                return res.status(429).json({
                    error: `You're ${action} too quickly (more than ${w.limit} in ${w.seconds >= 3600 ? `${w.seconds / 3600} hour${w.seconds === 3600 ? "" : "s"}` : `${w.seconds} seconds`}). Please wait ${fmtWait(retry)} and try again.`,
                    code: "RATE_LIMITED",
                    retry_after: retry,
                });
            }
        }

        recent.push(now);
        byKey.set(key, recent);
        // opportunistic cleanup so idle clients don't accumulate
        if (byKey.size > 5000) for (const [k, v] of byKey) if (!v.some((t) => t > now - longest)) byKey.delete(k);
        next();
    };
};

/** Test hook. */
export const _resetRateLimits = () => hits.clear();
