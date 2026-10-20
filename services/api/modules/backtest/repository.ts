// Supabase access for the Backtest module. Service-role client: the backend
// owns this data (see database/migrations/0013_backtest.sql). `user_id` is the
// Supabase auth id (`req.user.authId`), like Journal.
import supabase from "../../supabase/index.js";
import type { BacktestResult, Candle } from "./types.js";

/** Raised when migration 0013 hasn't been applied yet, so callers can say so plainly. */
export class BacktestTablesMissingError extends Error {
    constructor() {
        super("Backtest tables are missing — run database/migrations/0013_backtest.sql in Supabase.");
        this.name = "BacktestTablesMissingError";
    }
}

type PgError = { code?: string; message?: string } | null;
const isMissingTable = (e: PgError) => e?.code === "42P01" || e?.code === "PGRST205" || e?.code === "PGRST202" || /does not exist|schema cache/i.test(e?.message || "");
const check = (error: PgError) => {
    if (!error) return;
    if (isMissingTable(error)) throw new BacktestTablesMissingError();
    throw error;
};

// ── candle cache ────────────────────────────────────────────────────────────

export async function getCachedCandles(key: string): Promise<Candle[] | null> {
    const { data, error } = await supabase.from("backtest_candle_cache").select("payload").eq("key", key).maybeSingle();
    if (error) {
        // The cache is an optimisation: never fail a backtest because it's unavailable.
        console.error("[Backtest] candle cache read failed:", error.message);
        return null;
    }
    return (data?.payload as Candle[]) ?? null;
}

export async function saveCachedCandles(key: string, payload: Candle[]): Promise<void> {
    const { error } = await supabase.from("backtest_candle_cache").upsert({ key, payload }, { onConflict: "key" });
    if (error) console.error("[Backtest] candle cache write failed:", error.message);
}

// ── strategies ──────────────────────────────────────────────────────────────

export type StrategyRow = { id: string; user_id: string; name: string; definition: Record<string, unknown>; is_public: boolean; created_at: string; updated_at: string };

export async function listStrategies(userId: string): Promise<StrategyRow[]> {
    const { data, error } = await supabase.from("backtest_strategies").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    check(error);
    return (data || []) as StrategyRow[];
}

export async function getStrategy(userId: string, id: string): Promise<StrategyRow | null> {
    const { data, error } = await supabase.from("backtest_strategies").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    check(error);
    return (data as StrategyRow) ?? null;
}

export async function insertStrategy(row: { user_id: string; name: string; definition: unknown; is_public: boolean }): Promise<StrategyRow> {
    const { data, error } = await supabase.from("backtest_strategies").insert(row).select().single();
    check(error);
    return data as StrategyRow;
}

export async function updateStrategy(userId: string, id: string, patch: Record<string, unknown>): Promise<StrategyRow | null> {
    const { data, error } = await supabase
        .from("backtest_strategies")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();
    check(error);
    return (data as StrategyRow) ?? null;
}

export async function deleteStrategy(userId: string, id: string): Promise<boolean> {
    const { data, error } = await supabase.from("backtest_strategies").delete().eq("id", id).eq("user_id", userId).select("id");
    check(error);
    return (data?.length ?? 0) > 0;
}

// ── runs ────────────────────────────────────────────────────────────────────

export type RunRow = {
    id: string;
    user_id: string;
    strategy_id: string | null;
    strategy_name: string;
    definition: Record<string, unknown> | null;
    start_date: string;
    end_date: string;
    starting_capital: number;
    status: "running" | "completed" | "failed";
    error: string | null;
    result: BacktestResult | null;
    created_at: string;
    /** Migration 0019: the spec the run used and its versions (absent on older rows). */
    spec?: Record<string, unknown> | null;
    spec_hash?: string | null;
    engine_version?: string | null;
    data_version?: string | null;
};

const RUN_0019_COLUMNS = ["spec", "spec_hash", "engine_version", "data_version"] as const;
/** Postgres / PostgREST "no such column" — migration 0019 not applied yet. */
const isMissingColumn = (e: PgError) => e?.code === "42703" || e?.code === "PGRST204" || /column .* (does not exist|of 'backtest_runs')/i.test(e?.message || "");
let warnedRun0019 = false;

/** List columns only — `result` carries every candle and trade, far too heavy for a list. */
const RUN_LIST_COLUMNS = "id, user_id, strategy_id, strategy_name, start_date, end_date, starting_capital, status, error, created_at, metrics:result->metrics";

/** Returns the stored row's id/created_at only — echoing `result` back would re-send every candle. */
export async function insertRun(row: Omit<RunRow, "id" | "created_at">): Promise<RunRow> {
    let { data, error } = await supabase.from("backtest_runs").insert(row).select("id, created_at").single();
    if (error && isMissingColumn(error)) {
        // Before migration 0019: store the run without its spec/version columns.
        if (!warnedRun0019) {
            console.warn("[Backtest] backtest_runs has no spec/version columns — run database/migrations/0019_backtest_spec_metering.sql.");
            warnedRun0019 = true;
        }
        const legacy = { ...row };
        for (const k of RUN_0019_COLUMNS) delete legacy[k];
        ({ data, error } = await supabase.from("backtest_runs").insert(legacy).select("id, created_at").single());
    }
    check(error);
    return { ...row, ...(data as { id: string; created_at: string }) };
}

// ── metering ────────────────────────────────────────────────────────────────

export type MeterRow = {
    user_id: string | null;
    /** web_chat / web_run (legacy routes); web / mcp / api (v1, from the X-Xtin-Channel header). */
    channel: "web_chat" | "web_run" | "web" | "mcp" | "api";
    tier: string | null;
    ok: boolean;
    spec_hash: string | null;
    engine_version: string | null;
    data_lane: string | null;
    data_version: string | null;
    timeframe: string | null;
    bars: number | null;
    trades: number | null;
    compute_ms: number | null;
    fetch_ms: number | null;
    credits: number;
};

let meterDisabled = false;

/** Best effort: metering must never fail or slow a backtest, so errors are logged and swallowed. */
export async function recordMeter(row: MeterRow): Promise<void> {
    if (meterDisabled) return;
    try {
        const { error } = await supabase.from("backtest_run_meter").insert(row);
        if (!error) return;
        if (isMissingTable(error)) {
            meterDisabled = true; // until restart — saves a failing insert on every run
            console.warn("[Backtest] backtest_run_meter is missing — run database/migrations/0019_backtest_spec_metering.sql. Metering is off until then.");
        } else console.error("[Backtest] meter write failed:", error.message);
    } catch (err) {
        console.error("[Backtest] meter write failed:", (err as Error)?.message ?? err);
    }
}

export async function listRuns(userId: string, limit = 100, offset = 0): Promise<(Omit<RunRow, "result"> & { metrics: unknown })[]> {
    const { data, error } = await supabase
        .from("backtest_runs")
        .select(RUN_LIST_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    check(error);
    return (data || []) as unknown as (Omit<RunRow, "result"> & { metrics: unknown })[];
}

export async function getRun(userId: string, id: string): Promise<RunRow | null> {
    const { data, error } = await supabase.from("backtest_runs").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    check(error);
    return (data as RunRow) ?? null;
}

export async function deleteRun(userId: string, id: string): Promise<boolean> {
    const { data, error } = await supabase.from("backtest_runs").delete().eq("id", id).eq("user_id", userId).select("id");
    check(error);
    return (data?.length ?? 0) > 0;
}

/**
 * A completed run of the same spec on the same data with the same engine —
 * the result cache: identical inputs give byte-identical outputs, so the
 * stored result can be returned instead of running again. Null before
 * migration 0019 (no spec_hash column) or on any lookup error.
 */
export async function findCachedRun(userId: string, specHash: string, engineVersion: string, dataVersion: string): Promise<RunRow | null> {
    const { data, error } = await supabase
        .from("backtest_runs")
        .select("*")
        .eq("user_id", userId)
        .eq("spec_hash", specHash)
        .eq("engine_version", engineVersion)
        .eq("data_version", dataVersion)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) {
        if (!isMissingColumn(error) && !isMissingTable(error)) console.error("[Backtest] run cache lookup failed:", error.message);
        return null;
    }
    return (data as RunRow) ?? null;
}

/** Several runs by id, scoped to the caller (for side-by-side comparison). */
export async function getRuns(userId: string, ids: string[]): Promise<RunRow[]> {
    const { data, error } = await supabase.from("backtest_runs").select("*").eq("user_id", userId).in("id", ids);
    check(error);
    return (data || []) as RunRow[];
}

// ── strategy versions (migration 0020) ──────────────────────────────────────

export type StrategyVersionRow = { strategy_id: string; version: number; spec: Record<string, unknown>; spec_hash: string; created_at: string };

let warnedVersions = false;
const versionsMissing = (error: PgError) => {
    if (!isMissingTable(error)) return false;
    if (!warnedVersions) {
        console.warn("[Backtest] backtest_strategy_versions is missing — run database/migrations/0020_backtest_strategy_versions.sql. Saving keeps the current version only.");
        warnedVersions = true;
    }
    return true;
};

/** Versions of one strategy, newest first; empty before migration 0020. */
export async function listStrategyVersions(strategyId: string): Promise<StrategyVersionRow[]> {
    const { data, error } = await supabase.from("backtest_strategy_versions").select("*").eq("strategy_id", strategyId).order("version", { ascending: false });
    if (error) {
        if (versionsMissing(error)) return [];
        throw error;
    }
    return (data || []) as StrategyVersionRow[];
}

/** Latest version number per strategy (strategies with no version rows are absent). */
export async function latestVersions(strategyIds: string[]): Promise<Map<string, number>> {
    const out = new Map<string, number>();
    if (!strategyIds.length) return out;
    const { data, error } = await supabase.from("backtest_strategy_versions").select("strategy_id, version").in("strategy_id", strategyIds);
    if (error) {
        if (versionsMissing(error)) return out;
        throw error;
    }
    for (const r of (data || []) as { strategy_id: string; version: number }[]) out.set(r.strategy_id, Math.max(out.get(r.strategy_id) ?? 0, r.version));
    return out;
}

/** Append the next version; returns its number (1 when version history isn't available yet). */
export async function appendStrategyVersion(strategyId: string, spec: Record<string, unknown>, specHash: string): Promise<number> {
    const existing = await listStrategyVersions(strategyId);
    if (warnedVersions && !existing.length) return 1;
    const version = (existing[0]?.version ?? 0) + 1;
    const { error } = await supabase.from("backtest_strategy_versions").insert({ strategy_id: strategyId, version, spec, spec_hash: specHash });
    if (error) {
        if (versionsMissing(error)) return 1;
        throw error;
    }
    return version;
}

// ── usage counters ──────────────────────────────────────────────────────────

export async function getUsage(scope: string, period: string, kind: string): Promise<number> {
    const { data, error } = await supabase.from("backtest_usage").select("count").eq("scope", scope).eq("period", period).eq("kind", kind).maybeSingle();
    check(error);
    return Number(data?.count ?? 0);
}

/** Atomically increments and returns the new count (SQL function, see migration). */
export async function consumeUsage(scope: string, period: string, kind: string): Promise<number> {
    const { data, error } = await supabase.rpc("backtest_consume_usage", { p_scope: scope, p_period: period, p_kind: kind });
    check(error);
    return Number(data ?? 0);
}

// ── Pro plan + account age ──────────────────────────────────────────────────

export type ProPlanRow = { user_id: string; pass_id: string; valid_until: string; payment_id: string | null; order_id: string | null };

export async function getProPlan(userId: string): Promise<ProPlanRow | null> {
    const { data, error } = await supabase.from("backtest_pro_plans").select("*").eq("user_id", userId).maybeSingle();
    check(error);
    return (data as ProPlanRow) ?? null;
}

export async function upsertProPlan(record: Record<string, unknown>): Promise<void> {
    const { error } = await supabase.from("backtest_pro_plans").upsert({ ...record, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    check(error);
}

/** When the buyer's account was created — drives the new-account Pro trial. */
export async function getAccountCreatedAt(authId: string): Promise<string | null> {
    const { data, error } = await supabase.from("users").select("created_at").eq("auth_id", authId).maybeSingle();
    if (error) {
        console.error("[Backtest] account age lookup failed:", error.message);
        return null;
    }
    return (data?.created_at as string) ?? null;
}
