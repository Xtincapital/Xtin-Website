// Server-authoritative Pro/free lookup for Gini, mirroring
// journal/planTier.ts's structure but against `gini_pro_plans` (already live
// from database/migrations/0001_gini_journal_fundakamental.sql). Drives the
// `isPro` branch in `GiniAIEngine._buildLeanSystemPrompt` (response
// length/history depth/max output tokens/feature-gating language — see
// chatPrompt.ts). Unlike journal's `getPlanTier`, there is no
// `client_tier`-in-dev override here: the `/gini/chat` request body
// (`{ message, history }`) never carries a client-reported tier at all, so
// this is unconditionally server-authoritative in every environment.
import supabase from "../../supabase/index.js";

type PlanTier = "free" | "pro";

interface CacheEntry {
    tier: PlanTier;
    at: number;
}

const planTierCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

export async function getGiniPlanTier(userId: string | null | undefined): Promise<PlanTier> {
    if (!userId) return "free";

    const cached = planTierCache.get(userId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        return cached.tier;
    }

    let tier: PlanTier = "free";
    try {
        const { data, error } = await supabase.from("gini_pro_plans").select("valid_until").eq("user_id", userId).maybeSingle();
        if (!error && data?.valid_until) {
            const validUntil = new Date(data.valid_until as string).getTime();
            if (validUntil > Date.now()) tier = "pro";
        }
    } catch (err) {
        console.error("[Gini] plan tier lookup failed:", (err as Error)?.message || err);
    }

    planTierCache.set(userId, { tier, at: Date.now() });
    return tier;
}

/** Invalidate the cached tier for a user — not called anywhere in this
 * phase; kept for the future Gini plan-purchase flow, mirroring
 * journal/planTier.ts's `invalidatePlanTierCache`. */
export function invalidateGiniPlanTierCache(userId: string): void {
    planTierCache.delete(userId);
}

/** Express guard for Gini Pro-only endpoints (Advanced Family Planning's
 * elder-care, education-plan and tax-optimization data): 403 +
 * `code: "PRO_REQUIRED"` unless `gini_pro_plans.valid_until` is in the future. */
export async function requireGiniPro(req, res, next) {
    const tier = await getGiniPlanTier(req.user?.authId);
    if (tier !== "pro") {
        return res.status(403).json({ error: "This is a Gini Pro feature. Upgrade to Pro to use it.", code: "PRO_REQUIRED" });
    }
    next();
}
