// Port of main.py's `get_plan_tier` — server-authoritative Pro/free lookup
// against `journal_pro_plans`, used to gate AI response depth/length across
// the chat/weekly-review/pre-trade-check endpoints. Same 60s in-memory
// cache TTL as the source.
import supabase from "../../supabase/index.js";

type PlanTier = "free" | "pro";

interface CacheEntry {
    tier: PlanTier;
    at: number;
}

const planTierCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

/**
 * Look up whether `userId` currently has a still-valid Journal Pro plan.
 * `clientTier` mirrors the source's `client_tier` request field: main.py's
 * own comment calls it "trusted only in local dev" — honored here only
 * outside `NODE_ENV=production`, exactly like the source's
 * `is_local_runtime()` gate. Supabase (`journal_pro_plans.valid_until`) is
 * the sole source of truth in production.
 */
export async function getPlanTier(userId: string | null | undefined, clientTier: string = "free"): Promise<PlanTier> {
    if (!userId) return "free";

    const cached = planTierCache.get(userId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        return cached.tier;
    }

    let tier: PlanTier = "free";
    try {
        const { data, error } = await supabase.from("journal_pro_plans").select("valid_until").eq("user_id", userId).maybeSingle();
        if (!error && data?.valid_until) {
            const validUntil = new Date(data.valid_until as string).getTime();
            if (validUntil > Date.now()) tier = "pro";
        }
    } catch (err) {
        console.error("[Journal] plan tier lookup failed:", (err as Error)?.message || err);
    }

    if (tier === "free" && process.env.NODE_ENV !== "production" && clientTier === "pro") {
        tier = "pro";
    }

    planTierCache.set(userId, { tier, at: Date.now() });
    return tier;
}

/** Invalidate the cached tier for a user. Not called anywhere in this phase
 * (9b-i) — kept for the later plan-purchase sub-phase, which should call
 * this right after a plan is verified so the new tier takes effect
 * immediately instead of waiting out the 60s cache (matches main.py's
 * `PLAN_TIER_CACHE.pop(request.user_id, None)` after a verified payment). */
export function invalidatePlanTierCache(userId: string): void {
    planTierCache.delete(userId);
}

/** Express guard: only lets users with a currently valid Journal Pro plan
 * through (403 + `code: "PRO_REQUIRED"` otherwise). Always server-authoritative —
 * no client-reported tier is honored. */
export async function requireJournalPro(req, res, next) {
    const tier = await getPlanTier(req.user?.authId, "free");
    if (tier !== "pro") {
        return res.status(403).json({ error: "This is a Journal Pro feature. Upgrade to Pro to use it.", code: "PRO_REQUIRED" });
    }
    next();
}

/** Free-plan cap on saved performance goals (matches the Pricing page copy). */
export const FREE_GOAL_LIMIT = 2;
