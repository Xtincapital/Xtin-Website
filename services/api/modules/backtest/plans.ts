// Plan logic — the single source of truth for tiers, passes and quotas
// (port of `core/plans.py`).
//
//   anon — playground visitors: BACKTEST_ANON_PER_DAY per IP per day (in-process).
//   free — signed-in accounts: BACKTEST_FREE_PER_MONTH backtests per month
//          (chat runs AND re-runs of saved strategies share one persistent
//          counter), daily candles only, the last BACKTEST_FREE_HISTORY_DAYS
//          of history, BACKTEST_FREE_STRATEGIES saved strategies, the offline
//          rules parser (no Claude), no options structures. There is no
//          free Pro trial by default; setting BACKTEST_TRIAL_HOURS > 0 would
//          make new accounts Pro for their first N hours.
//   pro  — an unexpired pass: everything, unlimited.
//
// Passes are one-time payments (no auto-renew). Buying again while a pass is
// running stacks the new period on top of the remaining days.
import { getAccountCreatedAt, getProPlan, getUsage, consumeUsage } from "./repository.js";

const int = (name: string, fallback: number) => {
    const v = Number(process.env[name]);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
};

export const limits = () => ({
    anonPerDay: int("BACKTEST_ANON_PER_DAY", 5),
    // Ceiling across ALL anonymous visitors per day — the per-IP limit can be
    // dodged by spoofing a header, but the AI/data bill can't run away.
    anonGlobalPerDay: int("BACKTEST_ANON_GLOBAL_PER_DAY", 500),
    freePerMonth: int("BACKTEST_FREE_PER_MONTH", 25),
    trialHours: int("BACKTEST_TRIAL_HOURS", 0), // off: Pro only through a paid pass
    freeStrategies: int("BACKTEST_FREE_STRATEGIES", 3),
    freeHistoryDays: int("BACKTEST_FREE_HISTORY_DAYS", 730),
});

// ── Pro-only features ───────────────────────────────────────────────────────

export type Feature = "intraday" | "full_history" | "options" | "ai" | "advanced_analytics" | "unlimited_strategies";
export type Features = Record<Feature, boolean>;

export const featuresFor = (pro: boolean): Features => ({
    intraday: pro,
    full_history: pro,
    options: pro,
    ai: pro,
    advanced_analytics: pro,
    unlimited_strategies: pro,
});

export const FREE_TIMEFRAMES = ["1d"];

/** Thrown (and answered as 403 `PRO_REQUIRED`) when a free account reaches for a Pro feature. */
export class ProRequiredError extends Error {
    feature: Feature | "quota";
    constructor(feature: Feature | "quota", message: string) {
        super(message);
        this.name = "ProRequiredError";
        this.feature = feature;
    }
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Earliest start date a free account may test from ("YYYY-MM-DD"). */
export const earliestFreeStart = (now = new Date()) => isoDay(new Date(now.getTime() - limits().freeHistoryDays * 86_400_000));

const historyLabel = () => {
    const days = limits().freeHistoryDays;
    return days % 365 === 0 ? `${days / 365} year${days === 365 ? "" : "s"}` : `${days} days`;
};

export const PRO_MESSAGES = {
    intraday: (tf: string) => `Intraday candles (${tf}) are a Pro feature — the free plan backtests on daily candles.`,
    full_history: () => `The free plan tests the last ${historyLabel()} of history — Pro unlocks the full history.`,
    options: () => "Options strategies (straddles, strangles, iron condors) are a Pro feature. A Pro pass unlocks them — or describe a stock/index rule to backtest it free.",
    unlimited_strategies: () => `The free plan saves up to ${limits().freeStrategies} strategies — delete one, or go Pro for unlimited.`,
};

/** Pass catalogue — amounts in paise (INR). Kept in lock-step with the Upgrade page. */
export const PASSES: Record<string, { id: string; label: string; days: number; amountPaise: number; tag: string | null }> = {
    event: { id: "event", label: "Event Pass", days: 2, amountPaise: 39900, tag: null },
    weekly: { id: "weekly", label: "Weekly", days: 7, amountPaise: 119900, tag: null },
    mini: { id: "mini", label: "Mini", days: 15, amountPaise: 199900, tag: null },
    monthly: { id: "monthly", label: "Monthly", days: 30, amountPaise: 329900, tag: "POPULAR" },
    quarter: { id: "quarter", label: "Quarter", days: 90, amountPaise: 799900, tag: "BEST VALUE" },
};

export type Tier = "anon" | "free" | "pro";
export type Usage = { tier: Tier; remaining: number | null; limit: number | null; window: "day" | "month" | null };

// One monthly counter for every backtest a free account runs (chat or saved
// strategy). The kind keeps its original name so existing counts carry over.
const CHAT_KIND = "chat_backtest";

// ── tier lookup (60s cache, invalidated on purchase) ────────────────────────

type Entitlement = { pro: boolean; trial: boolean; passId: string | null; expiresAt: string | null };
const cache = new Map<string, { value: Entitlement; at: number }>();
const TTL_MS = 60_000;

export const invalidateEntitlementCache = (userId: string) => cache.delete(userId);

export async function getEntitlement(userId: string): Promise<Entitlement> {
    const hit = cache.get(userId);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

    let value: Entitlement = { pro: false, trial: false, passId: null, expiresAt: null };
    const plan = await getProPlan(userId);
    if (plan && new Date(plan.valid_until).getTime() > Date.now()) {
        value = { pro: true, trial: false, passId: plan.pass_id, expiresAt: plan.valid_until };
    } else {
        const trialHours = limits().trialHours;
        const created = trialHours > 0 ? await getAccountCreatedAt(userId) : null;
        if (created) {
            const trialEnds = new Date(created).getTime() + trialHours * 3_600_000;
            if (trialEnds > Date.now()) value = { pro: true, trial: true, passId: null, expiresAt: new Date(trialEnds).toISOString() };
        }
    }
    cache.set(userId, { value, at: Date.now() });
    return value;
}

// ── anonymous allowance (in-process; resets at UTC midnight) ────────────────

const anonHits = new Map<string, Map<string, number>>(); // day → ip → count
const dayKey = () => new Date().toISOString().slice(0, 10);

export function anonUsed(ip: string): number {
    return anonHits.get(dayKey())?.get(ip) ?? 0;
}

function anonTotal(): number {
    let total = 0;
    for (const n of anonHits.get(dayKey())?.values() ?? []) total += n;
    return total;
}

export function anonConsume(ip: string): void {
    const day = dayKey();
    for (const k of [...anonHits.keys()]) if (k !== day) anonHits.delete(k); // never grow unbounded
    const today = anonHits.get(day) ?? new Map<string, number>();
    today.set(ip, (today.get(ip) ?? 0) + 1);
    anonHits.set(day, today);
}

/** Test hook. */
export const _resetAnon = () => anonHits.clear();

// ── per-request usage ───────────────────────────────────────────────────────

const monthPeriod = () => new Date().toISOString().slice(0, 7);
const userScope = (userId: string) => `user:${userId}`;

export async function usageFor(userId: string | null, ip: string): Promise<Usage> {
    const l = limits();
    if (userId) {
        if ((await getEntitlement(userId)).pro) return { tier: "pro", remaining: null, limit: null, window: null };
        const used = await getUsage(userScope(userId), monthPeriod(), CHAT_KIND);
        return { tier: "free", remaining: Math.max(0, l.freePerMonth - used), limit: l.freePerMonth, window: "month" };
    }
    const remaining = Math.max(0, Math.min(l.anonPerDay - anonUsed(ip), l.anonGlobalPerDay - anonTotal()));
    return { tier: "anon", remaining, limit: l.anonPerDay, window: "day" };
}

/** Count one chat backtest against the caller's allowance; returns the updated usage. */
export async function consumeAllowance(userId: string | null, ip: string, usage: Usage): Promise<Usage> {
    const l = limits();
    if (userId && usage.tier === "free") {
        const used = await consumeUsage(userScope(userId), monthPeriod(), CHAT_KIND);
        return { ...usage, remaining: Math.max(0, l.freePerMonth - used) };
    }
    if (!userId) {
        anonConsume(ip);
        return { ...usage, remaining: Math.max(0, Math.min(l.anonPerDay - anonUsed(ip), l.anonGlobalPerDay - anonTotal())) };
    }
    return usage;
}

export async function planStatus(userId: string | null, ip: string) {
    const l = limits();
    const free = { features: featuresFor(false), timeframes: FREE_TIMEFRAMES, history_days: l.freeHistoryDays, saved_strategies_limit: l.freeStrategies };
    if (!userId) return { tier: "anon" as const, backtests_limit: l.anonPerDay, backtests_used: anonUsed(ip), limit_window: "day", ...free };
    const ent = await getEntitlement(userId);
    if (ent.pro) {
        return {
            tier: "pro" as const,
            trial: ent.trial,
            pass_id: ent.passId,
            expires_at: ent.expiresAt,
            backtests_limit: null,
            features: featuresFor(true),
            timeframes: null,
            history_days: null,
            saved_strategies_limit: null,
        };
    }
    const used = await getUsage(userScope(userId), monthPeriod(), CHAT_KIND);
    return { tier: "free" as const, backtests_used: used, backtests_limit: l.freePerMonth, limit_window: "month", ...free };
}

export function paywallReply(usage: Usage): string {
    const l = limits();
    if (usage.tier === "anon") {
        return `You've used today's ${usage.limit} free backtests. Create a free account for ${l.freePerMonth} a month${
            l.trialHours > 0 ? ` — plus your first ${l.trialHours} hours of FULL Pro access, free` : ""
        }. Or grab a Pro pass for unlimited runs.`;
    }
    return `You've used all ${usage.limit} free backtests this month. A Pro pass makes them unlimited and unlocks intraday candles, options, full history and the AI parser — pay once, no auto-renew.`;
}
