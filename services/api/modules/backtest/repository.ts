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
};

/** List columns only — `result` carries every candle and trade, far too heavy for a list. */
const RUN_LIST_COLUMNS = "id, user_id, strategy_id, strategy_name, start_date, end_date, starting_capital, status, error, created_at, metrics:result->metrics";

/** Returns the stored row's id/created_at only — echoing `result` back would re-send every candle. */
export async function insertRun(row: Omit<RunRow, "id" | "created_at">): Promise<RunRow> {
    const { data, error } = await supabase.from("backtest_runs").insert(row).select("id, created_at").single();
    check(error);
    return { ...row, ...(data as { id: string; created_at: string }) };
}

export async function listRuns(userId: string, limit = 100): Promise<(Omit<RunRow, "result"> & { metrics: unknown })[]> {
    const { data, error } = await supabase.from("backtest_runs").select(RUN_LIST_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
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
