// Plan-based feature gating — Node/TS port of `utils/feature_gates.py`.
//
// Deviation from the Python source's shape: `feature_gates.py`'s functions
// are FastAPI dependency FACTORIES — they call out to `StripeService` (DB
// reads) themselves. The task brief for this port describes it as "no DB
// calls of its own — it operates on the already-fetched user profile dict
// (has plan, reports_used, reports_limit fields)", which is how
// `funda_users` is actually shaped (see the migration). So this port is
// synchronous, pure functions over a `FundaUserProfile` the caller has
// already fetched — no Stripe, no DB access here.
//
// Also worth noting: `api/endpoints/analysis.py`'s `/analyze` endpoint does
// NOT actually call anything in `feature_gates.py` — it gates report
// generation with an inline `utils/token_wallet.py` balance check instead
// (a later, separate billing task per the task brief, intentionally not
// ported). `checkReportLimit` below is this port's stand-in for "whatever
// gates report generation": it enforces the plan-based
// `reports_used`/`reports_limit` counters that already live on
// `funda_users`, which is the natural equivalent of feature_gates.py's
// `check_and_increment_usage("analysis_runs", ...)` pattern applied to this
// schema. `requirePdfExport` is a straight port of `require_pdf_export`,
// kept here for the parallel PDF-export task to reuse if useful (it's a
// pure plan check, no DB access, so it fits this module's contract).
export interface FundaUserProfile {
    plan?: string | null;
    reports_used?: number | null;
    reports_limit?: number | null;
}

const PREMIUM_PLANS = new Set(["premium", "enterprise"]);

export function isPremiumPlan(profile: FundaUserProfile): boolean {
    return PREMIUM_PLANS.has((profile.plan || "free").toLowerCase());
}

export interface UsageCheckResult {
    allowed: boolean;
    used: number;
    limit: number;
}

/** Port of the "analysis_runs" usage gate `check_and_increment_usage` would apply,
 * using funda_users.reports_used / reports_limit directly. A limit of -1 means
 * unlimited, matching the convention used by this schema's other funda_* limit
 * columns. Does NOT increment usage — the caller persists that via
 * analysis.repository.ts after a report completes successfully. */
export function checkReportLimit(profile: FundaUserProfile): UsageCheckResult {
    const used = profile.reports_used ?? 0;
    const limit = profile.reports_limit ?? 0;
    if (limit === -1) return { allowed: true, used, limit };
    return { allowed: used < limit, used, limit };
}

export interface FeatureCheckResult {
    allowed: boolean;
    reason?: string;
}

/** Port of `require_pdf_export`. */
export function requirePdfExport(profile: FundaUserProfile): FeatureCheckResult {
    if (!isPremiumPlan(profile)) {
        return {
            allowed: false,
            reason: "This feature requires a Premium subscription. Upgrade your plan to access this feature.",
        };
    }
    return { allowed: true };
}
