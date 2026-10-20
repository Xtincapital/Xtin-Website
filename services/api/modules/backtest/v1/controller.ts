// /api/v1 — the versioned Backtest API. One contract for the web app, the
// Claude MCP server (next phase) and future partners; the MCP server is just
// another client and never touches the database. See openapi.ts.
//
// Everything a run produces is computed by the engine from a Strategy Spec v1;
// no channel computes results. Errors are problem+json (http.ts).
import { clientIp, DISCLAIMER, applyDataLag, dataVersion, labelResult } from "../controller.js";
import { BacktestInputError, ENGINE_VERSION, runSpec } from "../engine.js";
import { getCandles, MarketDataError } from "../marketData.js";
import {
    consumeAllowance,
    earliestFreeStart,
    FREE_TIMEFRAMES,
    getEntitlement,
    limits,
    paywallReply,
    planStatus,
    PRO_MESSAGES,
    usageFor,
} from "../plans.js";
import {
    appendStrategyVersion,
    deleteRun,
    deleteStrategy,
    findCachedRun,
    getRun,
    getRuns,
    getStrategy,
    insertRun,
    insertStrategy,
    latestVersions,
    listRuns,
    listStrategies,
    listStrategyVersions,
    recordMeter,
    updateStrategy,
    type MeterRow,
    type RunRow,
    type StrategyRow,
} from "../repository.js";
import { definitionToSpec, normaliseSpec, specHash, summariseSpec, symbolOf, type Spec } from "../spec.js";
import type { Candle, EngineResult, Metrics, StrategyDefinition } from "../types.js";
import { coverage, searchInstruments } from "./instruments.js";
import { problem } from "./http.js";
import { TEMPLATES } from "./templates.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INSTRUMENT_ID = /^(NSE|BSE|NASDAQ|NYSE):[A-Z0-9&.^-]{1,20}$/;
const MAX_CANDLES = 100_000;
export const TRADES_PAGE_SIZE = 20;
const BARS_PER_DAY: Record<string, number> = { "1m": 375, "5m": 75, "15m": 25, "1h": 7, "1d": 1 };

const channelOf = (req): MeterRow["channel"] => {
    const c = String(req.get?.("x-xtin-channel") ?? "").toLowerCase();
    return c === "web" || c === "mcp" ? c : "api";
};

const isSpecObject = (d: unknown): d is Record<string, unknown> => Boolean(d && typeof d === "object" && "spec_version" in (d as object));

const notFound = (req, res, what: string) => problem(req, res, 404, "not_found", `${what} not found`, `No ${what.toLowerCase()} with that id belongs to your account.`);

const invalidSpec = (req, res, errors: string[]) =>
    problem(req, res, 422, "invalid_spec", "The strategy spec isn't valid", errors.length === 1 ? errors[0] : `${errors.length} problems — see errors.`, { errors });

// ── instruments, spec validation, templates ─────────────────────────────────

/* GET /v1/instruments?q= */
export const searchInstrumentsV1 = (req, res) => {
    const limit = Math.min(25, Math.max(1, Number(req.query.limit) || 10));
    return res.json({ data: searchInstruments(String(req.query.q ?? ""), limit) });
};

/* GET /v1/instruments/:id/coverage */
export const getCoverageV1 = (req, res) => {
    const id = String(req.params.id ?? "").toUpperCase();
    if (!INSTRUMENT_ID.test(id)) return problem(req, res, 400, "invalid_instrument", "Invalid instrument id", 'Use EXCHANGE:SYMBOL, e.g. "NSE:RELIANCE".');
    return res.json(coverage(id));
};

const estimateBars = (spec: Spec) => {
    const days = (Date.parse(`${spec.period.to}T00:00:00Z`) - Date.parse(`${spec.period.from}T00:00:00Z`)) / 86_400_000 + 1;
    return Math.round(days * (252 / 365) * (BARS_PER_DAY[spec.instrument.timeframe] ?? 1));
};

/* POST /v1/strategies/validate — spec in; normalised spec, summary, warnings and credit estimate out. Spends nothing. */
export const validateStrategyV1 = (req, res) => {
    const input = req.body?.spec ?? req.body;
    const n = normaliseSpec(input);
    if ("errors" in n) return res.json({ valid: false, errors: n.errors });
    const bars = estimateBars(n.spec);
    const warnings = [...n.warnings];
    if (bars > MAX_CANDLES) warnings.push(`About ${bars.toLocaleString("en-IN")} bars — over the ${MAX_CANDLES.toLocaleString("en-IN")}-bar limit. Shorten the period or use a coarser timeframe.`);
    return res.json({ valid: true, spec: n.spec, spec_hash: n.hash, summary: n.summary, warnings, errors: [], estimate: { credits: 1, bars } });
};

/* GET /v1/strategies/templates */
export const listTemplatesV1 = (_req, res) => {
    res.set("Cache-Control", "public, max-age=3600");
    return res.json({ data: TEMPLATES });
};

// ── saved strategies (versioned) ────────────────────────────────────────────

/** A stored strategy as Spec v1. Rows saved before /v1 hold a legacy definition and are converted on the fly. */
function strategySpec(row: StrategyRow): { spec: Spec | null; legacy: boolean; errors: string[] } {
    const legacy = !isSpecObject(row.definition);
    let input: unknown = row.definition;
    if (legacy) {
        try {
            input = definitionToSpec(row.definition as StrategyDefinition, { name: row.name, capital: 100_000 });
        } catch (err) {
            return { spec: null, legacy, errors: [(err as Error).message] };
        }
    }
    const n = normaliseSpec(input, { allowEmptyEntry: legacy });
    return "errors" in n ? { spec: null, legacy, errors: n.errors } : { spec: { ...n.spec, name: row.name }, legacy, errors: [] };
}

function strategyOut(row: StrategyRow, version: number | undefined) {
    const { spec, legacy, errors } = strategySpec(row);
    return {
        id: row.id,
        name: row.name,
        version: version ?? 1,
        legacy,
        spec,
        spec_hash: spec ? specHash(spec) : null,
        summary: spec ? summariseSpec(spec) : null,
        ...(errors.length ? { errors } : {}),
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

/* GET /v1/strategies */
export const listStrategiesV1 = async (req, res) => {
    const rows = await listStrategies(req.user.authId);
    const versions = await latestVersions(rows.map((r) => r.id));
    return res.json({ data: rows.map((r) => strategyOut(r, versions.get(r.id))) });
};

/* GET /v1/strategies/:id */
export const getStrategyV1 = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(req, res, "Strategy");
    const row = await getStrategy(req.user.authId, req.params.id);
    if (!row) return notFound(req, res, "Strategy");
    const versions = await listStrategyVersions(row.id);
    return res.json({
        ...strategyOut(row, versions[0]?.version),
        versions: versions.map((v) => ({ version: v.version, spec_hash: v.spec_hash, created_at: v.created_at })),
    });
};

/* GET /v1/strategies/:id/versions/:version */
export const getStrategyVersionV1 = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(req, res, "Strategy");
    const row = await getStrategy(req.user.authId, req.params.id);
    if (!row) return notFound(req, res, "Strategy");
    const v = (await listStrategyVersions(row.id)).find((x) => x.version === Number(req.params.version));
    if (!v) return notFound(req, res, "Version");
    return res.json({ id: row.id, name: row.name, version: v.version, spec: v.spec, spec_hash: v.spec_hash, created_at: v.created_at });
};

/** Body → normalised spec: `spec` (Spec v1), or `definition` (a chat/legacy definition, converted). */
function specFromBody(body, name: string | undefined): { spec: Spec; hash: string; warnings: string[] } | { errors: string[] } {
    let input = body?.spec;
    if (!input && body?.definition) {
        try {
            input = definitionToSpec(body.definition as StrategyDefinition, { name, capital: 100_000 });
        } catch (err) {
            return { errors: [(err as Error).message] };
        }
    }
    if (!input) return { errors: ["Send the strategy as `spec` (Strategy Spec v1)."] };
    const n = normaliseSpec(name ? { ...input, name } : input);
    return "errors" in n ? { errors: n.errors } : { spec: n.spec, hash: n.hash, warnings: n.warnings };
}

const nameOf = (body) => (typeof body?.name === "string" && body.name.trim() ? body.name.trim().slice(0, 160) : undefined);

/* POST /v1/strategies — save a new strategy as version 1. */
export const createStrategyV1 = async (req, res) => {
    const userId = req.user.authId;
    const parsed = specFromBody(req.body, nameOf(req.body));
    if ("errors" in parsed) return invalidSpec(req, res, parsed.errors);
    if (!(await getEntitlement(userId)).pro && (await listStrategies(userId)).length >= limits().freeStrategies) {
        return problem(req, res, 403, "pro_required", "Pro feature", PRO_MESSAGES.unlimited_strategies(), { feature: "unlimited_strategies" });
    }
    const row = await insertStrategy({ user_id: userId, name: parsed.spec.name, definition: parsed.spec, is_public: false });
    const version = await appendStrategyVersion(row.id, parsed.spec as unknown as Record<string, unknown>, parsed.hash);
    return res.status(201).json({ ...strategyOut(row, version), warnings: parsed.warnings });
};

/* POST /v1/strategies/:id/versions — save an edit as the next version (earlier versions are kept). */
export const addStrategyVersionV1 = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(req, res, "Strategy");
    const userId = req.user.authId;
    const row = await getStrategy(userId, req.params.id);
    if (!row) return notFound(req, res, "Strategy");
    const parsed = specFromBody(req.body, nameOf(req.body) ?? row.name);
    if ("errors" in parsed) return invalidSpec(req, res, parsed.errors);

    // A strategy saved before /v1 gets its original rules recorded as version 1 first.
    const history = await listStrategyVersions(row.id);
    if (!history.length) {
        const before = strategySpec(row).spec;
        if (before && specHash(before) !== parsed.hash) await appendStrategyVersion(row.id, before as unknown as Record<string, unknown>, specHash(before));
    }
    const updated = await updateStrategy(userId, row.id, { name: parsed.spec.name, definition: parsed.spec });
    if (!updated) return notFound(req, res, "Strategy");
    const version = await appendStrategyVersion(row.id, parsed.spec as unknown as Record<string, unknown>, parsed.hash);
    return res.status(201).json({ ...strategyOut(updated, version), warnings: parsed.warnings });
};

/* DELETE /v1/strategies/:id */
export const deleteStrategyV1 = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(req, res, "Strategy");
    if (!(await deleteStrategy(req.user.authId, req.params.id))) return notFound(req, res, "Strategy");
    return res.status(204).end();
};

// ── runs ────────────────────────────────────────────────────────────────────

type Headline = Pick<Metrics, "total_return_pct" | "max_drawdown_pct" | "sharpe" | "win_rate" | "num_trades" | "profit_factor" | "total_costs"> & { cagr_pct: number | null };

const headline = (m: Metrics): Headline => ({
    total_return_pct: m.total_return_pct,
    cagr_pct: m.cagr_pct ?? null,
    max_drawdown_pct: m.max_drawdown_pct,
    sharpe: m.sharpe,
    win_rate: m.win_rate,
    num_trades: m.num_trades,
    profit_factor: m.profit_factor,
    total_costs: m.total_costs ?? 0,
});

/** One line a reader can put beside the numbers. */
export function assumptionsLine(r: EngineResult): string {
    const a = r.assumptions;
    return [
        a.fill === "next_bar_open" ? "next-bar-open fills" : "signal-bar-close fills",
        a.product === "CNC" ? "delivery" : "intraday",
        a.sizing,
        a.cost_profile ? `${a.cost_profile[0].toUpperCase()}${a.cost_profile.slice(1)} charges + ${a.slippage_bps} bps slippage` : "before costs",
        a.synthetic ? "SYNTHETIC data" : a.data_source === "yahoo" ? "Yahoo Finance data" : null,
        a.data_lag_days ? `data ≥ ${a.data_lag_days} days old` : null,
        `engine ${a.engine_version}`,
    ]
        .filter(Boolean)
        .join(" · ");
}

/** The small response for a run (MCP-friendly): never a trade dump. */
function runSummary(row: RunRow, cached = false) {
    const r = row.result as EngineResult;
    const spec = (row.spec ?? (isSpecObject(row.definition) ? row.definition : null)) as Spec | null;
    return {
        run_id: row.id,
        cached,
        status: row.status,
        name: row.strategy_name,
        strategy_id: row.strategy_id,
        created_at: row.created_at,
        period: { from: row.start_date, to: row.end_date },
        capital: row.starting_capital,
        spec_hash: r?.assumptions?.spec_hash ?? row.spec_hash ?? null,
        summary: spec ? summariseSpec(spec) : null,
        headline: r ? headline(r.metrics) : null,
        assumptions_line: r ? assumptionsLine(r) : null,
        warnings: r?.warnings ?? [],
        disclaimer: DISCLAIMER,
        links: {
            self: `/api/v1/backtests/${row.id}`,
            trades: `/api/v1/backtests/${row.id}/trades?page=1`,
            series: `/api/v1/backtests/${row.id}/series?kind=equity`,
            report: `/backtest/app/history/${row.id}`,
        },
    };
}

type RunBody = { spec?: unknown; strategy_id?: string; version?: number; period?: { from?: string; to?: string }; capital?: number; name?: string };

/** The spec a run request asks for: inline, or a saved strategy (current or a given version), with overrides. */
async function resolveRunSpec(userId: string, body: RunBody): Promise<{ input: Record<string, unknown>; strategyId: string | null } | { status: number; code: string; title: string; detail: string }> {
    let input: Record<string, unknown> | null = null;
    let strategyId: string | null = null;
    if (body.strategy_id) {
        if (!UUID.test(body.strategy_id)) return { status: 404, code: "not_found", title: "Strategy not found", detail: "No strategy with that id belongs to your account." };
        const row = await getStrategy(userId, body.strategy_id);
        if (!row) return { status: 404, code: "not_found", title: "Strategy not found", detail: "No strategy with that id belongs to your account." };
        strategyId = row.id;
        if (body.version !== undefined) {
            const v = (await listStrategyVersions(row.id)).find((x) => x.version === Number(body.version));
            if (!v) return { status: 404, code: "not_found", title: "Version not found", detail: `Strategy has no version ${body.version}.` };
            input = { ...v.spec };
        } else {
            const { spec, errors } = strategySpec(row);
            if (!spec) return { status: 422, code: "invalid_spec", title: "The saved strategy can't run", detail: errors.join("; ") };
            input = { ...(spec as unknown as Record<string, unknown>) };
        }
    } else if (body.spec && typeof body.spec === "object") {
        input = { ...(body.spec as Record<string, unknown>) };
    } else {
        return { status: 400, code: "bad_request", title: "Nothing to run", detail: "Send a `spec`, or a `strategy_id` of a saved strategy." };
    }
    if (body.period) input.period = { ...((input.period as object) ?? {}), ...body.period };
    if (body.capital !== undefined) input.capital = { ...((input.capital as object) ?? {}), initial: body.capital };
    if (body.name) input.name = body.name;
    return { input, strategyId };
}

const meter = (row: MeterRow) => void recordMeter(row).catch(() => undefined);

/* POST /v1/backtests — run a spec. Identical inputs return the stored result (cached, no credit). */
export const createBacktestV1 = async (req, res) => {
    const userId: string = req.user.authId;
    const channel = channelOf(req);
    const resolved = await resolveRunSpec(userId, req.body ?? {});
    if ("status" in resolved) return problem(req, res, resolved.status, resolved.code, resolved.title, resolved.detail);

    const n = normaliseSpec(resolved.input);
    if ("errors" in n) return invalidSpec(req, res, n.errors);
    const spec = n.spec;
    const { exchange, symbol } = symbolOf(spec);
    const timeframe = spec.instrument.timeframe;

    // Plan gates — before any data is fetched.
    const usage = await usageFor(userId, clientIp(req));
    if (usage.tier !== "pro") {
        if (!FREE_TIMEFRAMES.includes(timeframe)) return problem(req, res, 403, "pro_required", "Pro feature", PRO_MESSAGES.intraday(timeframe), { feature: "intraday" });
        if (spec.period.from < earliestFreeStart()) return problem(req, res, 403, "pro_required", "Pro feature", PRO_MESSAGES.full_history(), { feature: "full_history", earliest_from: earliestFreeStart() });
        if (usage.remaining !== null && usage.remaining <= 0) return problem(req, res, 403, "quota_exceeded", "Monthly backtests used up", paywallReply(usage), { feature: "quota", usage });
    }
    if (estimateBars(spec) > MAX_CANDLES * 1.2) return problem(req, res, 422, "too_many_bars", "Window too large", "That window has too many bars — shorten the period or use a coarser timeframe.");

    const lag = applyDataLag(spec.period.to);
    const baseMeter = { user_id: userId, channel, tier: usage.tier, spec_hash: n.hash, engine_version: ENGINE_VERSION, timeframe };
    let candles: Candle[];
    const t0 = performance.now();
    try {
        candles = await getCandles({ symbol, exchange, timeframe, start: spec.period.from, end: lag.end });
        if (candles.length > MAX_CANDLES) throw new BacktestInputError("That window has too many bars — shorten the period or use a coarser timeframe.");
    } catch (err) {
        if (err instanceof MarketDataError || err instanceof BacktestInputError) {
            meter({ ...baseMeter, ok: false, data_lane: null, data_version: null, bars: null, trades: null, compute_ms: null, fetch_ms: Math.round(performance.now() - t0), credits: 0 });
            return problem(req, res, 422, "data_unavailable", "Couldn't get data for this run", err.message);
        }
        throw err;
    }
    const fetch_ms = Math.round(performance.now() - t0);
    const lane = symbol === "SAMPLE" ? "synthetic" : "yahoo";
    const dv = dataVersion(lane, candles);

    const cachedRow = await findCachedRun(userId, n.hash, ENGINE_VERSION, dv);
    if (cachedRow) {
        meter({ ...baseMeter, ok: true, data_lane: lane, data_version: dv, bars: candles.length, trades: cachedRow.result?.trades.length ?? null, compute_ms: 0, fetch_ms, credits: 0 });
        return res.status(200).json(runSummary(cachedRow, true));
    }

    let engine: EngineResult;
    const t1 = performance.now();
    try {
        engine = runSpec(spec, candles);
    } catch (err) {
        if (err instanceof BacktestInputError) return problem(req, res, 422, "cannot_run", "Can't run this backtest", err.message);
        throw err;
    }
    const compute_ms = Math.round(performance.now() - t1);
    labelResult(engine, symbol, candles, lag.note);
    meter({ ...baseMeter, ok: true, data_lane: lane, data_version: dv, bars: candles.length, trades: engine.trades.length, compute_ms, fetch_ms, credits: 1 });
    if (usage.tier !== "pro") await consumeAllowance(userId, clientIp(req), usage);

    const row = await insertRun({
        user_id: userId,
        strategy_id: resolved.strategyId,
        strategy_name: spec.name,
        definition: spec as unknown as Record<string, unknown>,
        start_date: spec.period.from,
        end_date: lag.end,
        starting_capital: spec.capital.initial,
        status: "completed",
        error: null,
        result: { ...engine, candles },
        spec: spec as unknown as Record<string, unknown>,
        spec_hash: n.hash,
        engine_version: ENGINE_VERSION,
        data_version: dv,
    });
    return res.status(201).json(runSummary(row));
};

const loadRun = async (req, res): Promise<RunRow | null> => {
    if (!UUID.test(req.params.id)) {
        notFound(req, res, "Backtest");
        return null;
    }
    const row = await getRun(req.user.authId, req.params.id);
    if (!row) notFound(req, res, "Backtest");
    return row;
};

/* GET /v1/backtests — run history, newest first. */
export const listBacktestsV1 = async (req, res) => {
    const page = Math.max(1, Math.trunc(Number(req.query.page) || 1));
    const size = Math.min(100, Math.max(1, Math.trunc(Number(req.query.page_size) || 25)));
    const rows = await listRuns(req.user.authId, size + 1, (page - 1) * size);
    return res.json({
        data: rows.slice(0, size).map((r) => ({
            run_id: r.id,
            name: r.strategy_name,
            strategy_id: r.strategy_id,
            status: r.status,
            error: r.error,
            period: { from: r.start_date, to: r.end_date },
            capital: r.starting_capital,
            metrics: r.metrics ?? null,
            created_at: r.created_at,
        })),
        page,
        page_size: size,
        has_more: rows.length > size,
    });
};

/* GET /v1/backtests/:id — headline, full metrics, assumptions and spec; `?include=result` adds trades, equity and candles. */
export const getBacktestV1 = async (req, res) => {
    const row = await loadRun(req, res);
    if (!row) return;
    const r = row.result;
    const spec = row.spec ?? (isSpecObject(row.definition) ? row.definition : null);
    return res.json({
        ...runSummary(row),
        metrics: r?.metrics ?? null,
        assumptions: r?.assumptions ?? null,
        spec,
        legacy_definition: spec ? undefined : row.definition,
        ...(String(req.query.include ?? "") === "result" ? { result: r } : {}),
    });
};

/* GET /v1/backtests/:id/trades?page= — 20 per page. */
export const getBacktestTradesV1 = async (req, res) => {
    const row = await loadRun(req, res);
    if (!row) return;
    const trades = row.result?.trades ?? [];
    const page = Math.max(1, Math.trunc(Number(req.query.page) || 1));
    const start = (page - 1) * TRADES_PAGE_SIZE;
    return res.json({ data: trades.slice(start, start + TRADES_PAGE_SIZE), page, page_size: TRADES_PAGE_SIZE, total: trades.length, has_more: start + TRADES_PAGE_SIZE < trades.length });
};

/**
 * Largest-Triangle-Three-Buckets downsampling: keeps the visual shape of a
 * series (peaks and troughs) in `threshold` points.
 */
export function lttb<T extends { time: string; value: number }>(data: T[], threshold: number): T[] {
    if (threshold >= data.length || threshold < 3) return data;
    const out: T[] = [data[0]];
    const every = (data.length - 2) / (threshold - 2);
    let a = 0;
    for (let i = 0; i < threshold - 2; i++) {
        const nextStart = Math.floor((i + 1) * every) + 1;
        const nextEnd = Math.min(Math.floor((i + 2) * every) + 1, data.length);
        let avgX = 0;
        let avgY = 0;
        for (let j = nextStart; j < nextEnd; j++) {
            avgX += j;
            avgY += data[j].value;
        }
        avgX /= nextEnd - nextStart || 1;
        avgY /= nextEnd - nextStart || 1;
        const start = Math.floor(i * every) + 1;
        const end = Math.floor((i + 1) * every) + 1;
        let best = start;
        let bestArea = -1;
        for (let j = start; j < end; j++) {
            const area = Math.abs((a - avgX) * (data[j].value - data[a].value) - (a - j) * (avgY - data[a].value));
            if (area > bestArea) {
                bestArea = area;
                best = j;
            }
        }
        out.push(data[best]);
        a = best;
    }
    out.push(data[data.length - 1]);
    return out;
}

/** Month-by-month returns from the full equity curve (each month's last equity vs the previous month's; the first vs starting capital). */
export function monthlyReturns(curve: { time: string; equity: number }[], startingCapital: number): { month: string; return_pct: number }[] {
    const ends = new Map<string, number>();
    for (const p of curve) ends.set(p.time.slice(0, 7), p.equity);
    let prev = startingCapital;
    return [...ends].map(([month, equity]) => {
        const r = prev > 0 ? Math.round(((equity - prev) / prev) * 10_000) / 100 : 0;
        prev = equity;
        return { month, return_pct: r };
    });
}

/* GET /v1/backtests/:id/series?kind=equity|drawdown|monthly&points= */
export const getBacktestSeriesV1 = async (req, res) => {
    const kind = String(req.query.kind ?? "equity");
    if (kind !== "equity" && kind !== "drawdown" && kind !== "monthly") return problem(req, res, 400, "bad_request", "Unknown series", 'kind must be "equity", "drawdown" or "monthly".');
    const row = await loadRun(req, res);
    if (!row) return;
    if (kind === "monthly") {
        const data = monthlyReturns(row.result?.equity_curve ?? [], row.starting_capital);
        return res.json({ kind, unit: "percent", total_points: data.length, data });
    }
    const points = Math.min(2000, Math.max(10, Math.trunc(Number(req.query.points) || 500)));
    const curve = row.result?.equity_curve ?? [];
    let peak = -Infinity;
    const full =
        kind === "equity"
            ? curve.map((p) => ({ time: p.time, value: p.equity }))
            : curve.map((p) => {
                  peak = Math.max(peak, p.equity);
                  return { time: p.time, value: peak > 0 ? Math.round(((p.equity - peak) / peak) * 10_000) / 100 : 0 };
              });
    return res.json({ kind, unit: kind === "equity" ? "INR" : "percent", total_points: full.length, data: lttb(full, points) });
};

const COMPARED_ASSUMPTIONS = ["engine_version", "data_version", "fill", "product", "sizing", "cost_profile", "slippage_bps", "data_source"] as const;

/* POST /v1/backtests/compare — side-by-side metrics for 2–5 runs, and which assumptions differ. */
export const compareBacktestsV1 = async (req, res) => {
    const ids: unknown = req.body?.run_ids;
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 5 || !ids.every((x) => typeof x === "string" && UUID.test(x))) {
        return problem(req, res, 400, "bad_request", "Pick 2 to 5 runs", "Send run_ids: an array of 2 to 5 run ids.");
    }
    const rows = await getRuns(req.user.authId, [...new Set(ids as string[])]);
    const byId = new Map(rows.map((r) => [r.id, r]));
    const missing = (ids as string[]).filter((id) => !byId.has(id));
    if (missing.length) return problem(req, res, 404, "not_found", "Backtest not found", `Not found in your account: ${missing.join(", ")}`, { missing });
    const ordered = (ids as string[]).map((id) => byId.get(id)!);
    const differences = COMPARED_ASSUMPTIONS.filter((k) => new Set(ordered.map((r) => JSON.stringify(r.result?.assumptions?.[k] ?? null))).size > 1);
    return res.json({
        runs: ordered.map((r) => ({ ...runSummary(r), metrics: r.result?.metrics ?? null, assumptions: r.result?.assumptions ?? null })),
        differences,
        note: differences.length ? `These runs differ in: ${differences.join(", ")} — compare with that in mind.` : null,
        disclaimer: DISCLAIMER,
    });
};

/* DELETE /v1/backtests/:id */
export const deleteBacktestV1 = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(req, res, "Backtest");
    if (!(await deleteRun(req.user.authId, req.params.id))) return notFound(req, res, "Backtest");
    return res.status(204).end();
};

/* GET /v1/usage — credits left this period and what the plan allows. */
export const getUsageV1 = async (req, res) => {
    const userId: string = req.user.authId;
    const [usage, plan] = await Promise.all([usageFor(userId, clientIp(req)), planStatus(userId, clientIp(req))]);
    return res.json({
        tier: usage.tier,
        credits_remaining: usage.remaining,
        credits_limit: usage.limit,
        period: usage.window,
        credits_per_run: 1,
        cached_runs_free: true,
        timeframes: plan.timeframes,
        history_days: plan.history_days,
        saved_strategies_limit: plan.saved_strategies_limit,
        features: plan.features,
        ...("expires_at" in plan ? { pro_expires_at: plan.expires_at } : {}),
    });
};
