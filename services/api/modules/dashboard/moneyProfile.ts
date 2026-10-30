// Pure pieces of the account dashboard's money API: the "money basics" the
// user tells us (what they invest each month, their expenses and insurance
// cover — none of which Gini's tables have) and the monthly net-worth
// history. Both live in `gini_user_data.app_state` (jsonb, one row per user;
// see dashboard.repository.ts), under `money` and `netWorthHistory`.

import * as z from "zod/v4";

export const STEP_UPS = [0, 0.05, 0.1] as const;

export interface MoneyProfile {
    /** Rupees a month into SIPs, PF top-ups, RDs. Null = not answered yet; 0 = "I don't invest yet". */
    monthlyInvesting: number | null;
    /** Yearly increase of that amount: 0, 5% or 10%. */
    stepUp: number;
    monthlyExpenses: number | null;
    /** Life (term) cover, sum assured in rupees. */
    termCover: number | null;
    /** Health cover, sum insured in rupees. */
    healthCover: number | null;
    updatedAt: string | null;
}

export interface NetWorthPoint {
    /** YYYY-MM */
    month: string;
    assets: number;
    liabilities: number;
}

/** Ten years of monthly points is plenty for a dashboard chart. */
export const MAX_HISTORY = 120;

const amount = z.number().nonnegative().max(1e11);

const moneyProfilePatchSchema = z
    .object({
        monthlyInvesting: amount.nullable().optional(),
        stepUp: z.union([z.literal(0), z.literal(0.05), z.literal(0.1)]).optional(),
        monthlyExpenses: amount.nullable().optional(),
        termCover: amount.nullable().optional(),
        healthCover: amount.nullable().optional(),
    })
    .strict();

export type MoneyProfilePatch = z.infer<typeof moneyProfilePatchSchema>;

export const validateMoneyProfilePatch = (input: unknown) => {
    const result = moneyProfilePatchSchema.safeParse(input ?? {});
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);

/** Reads a stored profile defensively; null when the user has never saved one. */
export function asProfile(raw: unknown): MoneyProfile | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    return {
        monthlyInvesting: num(r.monthlyInvesting),
        stepUp: STEP_UPS.includes(r.stepUp as (typeof STEP_UPS)[number]) ? (r.stepUp as number) : 0,
        monthlyExpenses: num(r.monthlyExpenses),
        termCover: num(r.termCover),
        healthCover: num(r.healthCover),
        updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : null,
    };
}

export function mergeProfile(current: MoneyProfile | null, patch: MoneyProfilePatch, now = new Date()): MoneyProfile {
    const base: MoneyProfile = current ?? {
        monthlyInvesting: null,
        stepUp: 0,
        monthlyExpenses: null,
        termCover: null,
        healthCover: null,
        updatedAt: null,
    };
    const next = { ...base };
    for (const key of ["monthlyInvesting", "monthlyExpenses", "termCover", "healthCover"] as const) {
        if (patch[key] !== undefined) next[key] = patch[key];
    }
    if (patch.stepUp !== undefined) next.stepUp = patch.stepUp;
    next.updatedAt = now.toISOString();
    return next;
}

/** Reads stored history defensively, oldest month first. */
export function asHistory(raw: unknown): NetWorthPoint[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter(
            (p): p is NetWorthPoint =>
                !!p && typeof p.month === "string" && /^\d{4}-\d{2}$/.test(p.month) && num(p.assets) != null && num(p.liabilities) != null,
        )
        .map((p) => ({ month: p.month, assets: p.assets, liabilities: p.liabilities }))
        .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Puts this month's totals into the history: one point per month, the
 * latest value for a month replacing the earlier one. `changed` is false when
 * the month already holds the same numbers, so callers can skip the write.
 */
export function withSnapshot(history: NetWorthPoint[], point: NetWorthPoint): { history: NetWorthPoint[]; changed: boolean } {
    const same = history.find((p) => p.month === point.month);
    if (same && same.assets === point.assets && same.liabilities === point.liabilities) return { history, changed: false };
    const next = [...history.filter((p) => p.month !== point.month), point].sort((a, b) => a.month.localeCompare(b.month));
    return { history: next.slice(-MAX_HISTORY), changed: true };
}

/** "YYYY-MM-DD" for today in India, where the app's users are. */
export function todayInIndia(now = new Date()): string {
    return now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
