// Tiny in-process fixed-window limiter (per client IP + bucket) — port of
// `core/ratelimit.py`. Fine for a single Render instance; swap for Redis if the
// API ever runs multi-process.
const hits = new Map<string, Map<string, number[]>>();

export const rateLimit = (bucket: string, limit: number, windowSeconds: number, ipOf: (req) => string = (req) => req.ip || "unknown") => {
    return (req, res, next) => {
        const now = Date.now();
        const windowStart = now - windowSeconds * 1000;
        const byClient = hits.get(bucket) ?? new Map<string, number[]>();
        hits.set(bucket, byClient);
        const client = ipOf(req);
        const recent = (byClient.get(client) ?? []).filter((t) => t > windowStart);
        if (recent.length >= limit) {
            byClient.set(client, recent);
            res.set("Retry-After", String(windowSeconds));
            return res.status(429).json({ error: "Too many requests — please wait and try again." });
        }
        recent.push(now);
        byClient.set(client, recent);
        // opportunistic cleanup so idle clients don't accumulate
        if (byClient.size > 5000) for (const [k, v] of byClient) if (!v.some((t) => t > windowStart)) byClient.delete(k);
        next();
    };
};
