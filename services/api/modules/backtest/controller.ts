// Backtest API — Node/TS port of the standalone tool's `api/chat.py` and
// `api/backtests.py` (+ strategy CRUD).
//
//   POST /backtest/chat      "chat to backtest" playground; public, quota-gated
//   *    /backtest/strategies saved strategies (auth)
//   *    /backtest/runs       run + history (auth)
//
// Every user-scoped query is filtered by `req.user.authId`; request bodies never
// carry a user id.
import { createHash } from "node:crypto";
import { HTTP_STATUS } from "../../constants/constants.js";
import {
    allocationFor,
    applyModification,
    applyOptionsModification,
    awaitingSymbol,
    classifyMessage,
    defaultWindow,
    looksLikeTrading,
    namesQuantity,
    parseOptions,
    parseStrategy,
    personalize,
    sizingFor,
    STRATEGY_EXAMPLES,
    type AnyDefinition,
} from "./parser.js";
import { llmParse } from "./llmParse.js";
import { BacktestInputError, describeSizing, ENGINE_VERSION, runBacktest, runDefinition, runSpec } from "./engine.js";
import { normaliseSpec, OPERATORS, SPEC_INDICATOR_LIST, SPEC_VERSION, specJsonSchema } from "./spec.js";
import { lotsForCapital, runOptionsBacktest } from "./options.js";
import { getCandles, INDEX_ETF, isIndexSymbol, MarketDataError } from "./marketData.js";
import {
    consumeAllowance,
    earliestFreeStart,
    FREE_TIMEFRAMES,
    getEntitlement,
    limits,
    paywallReply,
    planStatus,
    PRO_MESSAGES,
    ProRequiredError,
    usageFor,
    type Usage,
} from "./plans.js";
import { rateLimit } from "./rateLimit.js";
import {
    BacktestTablesMissingError,
    deleteRun,
    deleteStrategy,
    getRun,
    getStrategy,
    insertRun,
    insertStrategy,
    listRuns,
    listStrategies,
    recordMeter,
    updateStrategy as updateStrategyRepo,
    type MeterRow,
    type RunRow,
} from "./repository.js";
import { validateChat, validateRun, validateStrategyCreate, validateStrategyUpdate } from "./validator.js";
import type { BacktestResult, Candle, EngineResult, StrategyDefinition } from "./types.js";

const MAX_CANDLES = 100_000; // the engine runs on the event loop; keep one request bounded
const MAX_WINDOW_DAYS = 365 * 25;

const bad = (res, validation: { message: string; errors?: string[] }) =>
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });

/** Best-effort client address. Behind Render/Cloudflare `req.ip` is the proxy, not the visitor. */
export const clientIp = (req): string => {
    const cf = req.get?.("cf-connecting-ip");
    if (cf) return String(cf).trim();
    const xff = req.get?.("x-forwarded-for");
    if (xff) return String(xff).split(",")[0].trim();
    return req.ip || req.socket?.remoteAddress || "unknown";
};

// Ids are Postgres UUIDs; anything else would surface as a 500 from the database.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = (res, what: string) => res.status(HTTP_STATUS.NOT_FOUND).json({ error: `${what} not found` });

const proRequired = (res, err: ProRequiredError) => res.status(403).json({ error: err.message, code: "PRO_REQUIRED", feature: err.feature });

const serverError = (res, tag: string, err: unknown) => {
    if (err instanceof BacktestTablesMissingError) {
        console.error(`[Backtest] ${err.message}`);
        return res.status(503).json({ error: "Backtest is being set up — please try again shortly.", code: "not_migrated" });
    }
    console.error(`[Backtest] ${tag}:`, err);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `${tag}: ${(err as Error)?.message || err}` });
};

const windowError = (start: string, end: string): string | null => {
    if (end < start) return "end_date is before start_date";
    const days = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000;
    if (days > MAX_WINDOW_DAYS) return "That date range is too long — pick 25 years or less.";
    return null;
};

export const DISCLAIMER = "Hypothetical backtest on historical data. Not investment advice. Past results do not predict future results.";

/**
 * Stamp where the candles came from on the result, and say so up front when
 * they aren't a tradable market series (synthetic SAMPLE data, or an index).
 * Returns the result's warnings, these notes first.
 */
export function labelResult(engine: EngineResult, symbol: string, candles?: Candle[], lagNote?: string | null): string[] {
    const sym = symbol.trim().toUpperCase();
    const synthetic = sym === "SAMPLE";
    const theoretical = isIndexSymbol(sym);
    const source = synthetic ? "synthetic" : "yahoo";
    engine.assumptions = {
        ...engine.assumptions,
        data_source: source,
        ...(candles ? { data_version: dataVersion(source, candles) } : {}),
        data_lag_days: Math.max(engine.assumptions.data_lag_days ?? 0, dataLagDays()),
        synthetic,
        theoretical_index: theoretical,
    };
    const notes: string[] = [];
    if (lagNote) notes.push(lagNote);
    if (synthetic) notes.push("SYNTHETIC DATA: SAMPLE is a generated demo series, not market prices — these are not market results.");
    if (theoretical) {
        const etf = INDEX_ETF[sym];
        notes.push(`${sym} is an index and can't be bought directly, so this is a theoretical index backtest.${etf ? ` For a tradable version, run it on ${etf}, the ETF that tracks it.` : ""}`);
    }
    engine.warnings = [...notes, ...engine.warnings];
    return engine.warnings;
}

/** Content hash of the candles a run used: the same data version always means the same candles. */
export const dataVersion = (source: string, candles: Candle[]) => `${source}:${createHash("sha256").update(JSON.stringify(candles)).digest("hex").slice(0, 16)}`;

/**
 * Server-side data-lag policy (BACKTEST_DATA_LAG_DAYS, default 0): runs never
 * use prices newer than this many days. Kept ready for the legal opinion on
 * SEBI's 30-day rule for price data used in education.
 */
export const dataLagDays = () => {
    const v = Number(process.env.BACKTEST_DATA_LAG_DAYS);
    return Number.isFinite(v) && v > 0 ? Math.trunc(v) : 0;
};

/** Clamp a window's end to the lag policy; returns the end to use and a note when it moved. */
export function applyDataLag(end: string, today: Date = new Date()): { end: string; note: string | null } {
    const lag = dataLagDays();
    if (!lag) return { end, note: null };
    const latest = new Date(today.getTime() - lag * 86_400_000).toISOString().slice(0, 10);
    return end > latest ? { end: latest, note: `Prices end on ${latest}: backtests use data at least ${lag} days old.` } : { end, note: null };
}

type Meter = Pick<MeterRow, "spec_hash" | "engine_version" | "data_lane" | "data_version" | "timeframe" | "bars" | "trades" | "compute_ms" | "fetch_ms">;
type Executed = { result: BacktestResult; spec: Record<string, unknown>; meter: Meter };

const timer = () => {
    const t0 = performance.now();
    return () => Math.round(performance.now() - t0);
};

const EMPTY_METER: Meter = { spec_hash: null, engine_version: ENGINE_VERSION, data_lane: null, data_version: null, timeframe: null, bars: null, trades: null, compute_ms: null, fetch_ms: null };

/** Log a run's cost drivers. Fire-and-forget: metering never delays or fails a backtest. */
function meter(row: Omit<MeterRow, "credits"> & { credits?: number }) {
    void recordMeter({ credits: 1, ...row }).catch(() => undefined);
}

/** Strategies saved through /api/v1 store a Strategy Spec, not a legacy definition. */
const isSpec = (d: unknown): d is Record<string, unknown> => Boolean(d && typeof d === "object" && "spec_version" in (d as object));

function runSavedSpec(saved: Record<string, unknown>, candles: Candle[], capital: number, name: string, start: string) {
    const n = normaliseSpec({ ...saved, name, capital: { initial: capital, currency: "INR" }, period: { from: start, to: candles[candles.length - 1].time.slice(0, 10) } });
    if ("errors" in n) throw new BacktestInputError(n.errors.join("; "));
    return { result: runSpec(n.spec, candles), spec: n.spec };
}

/** Fetch candles and run the equity engine; throws MarketDataError / Error with a user-facing message. */
async function execute(definition: StrategyDefinition, start: string, end: string, capital: number, name: string): Promise<Executed> {
    const specInst = isSpec(definition) ? String((definition.instrument as { id?: string })?.id ?? "NSE:SAMPLE").split(":") : null;
    const inst = specInst ? { symbol: specInst[1], exchange: specInst[0], timeframe: (definition.instrument as { timeframe?: string }).timeframe ?? "1d" } : (definition.instrument ?? {});
    const symbol = inst.symbol || "SAMPLE";
    const lag = applyDataLag(end);
    const fetchTime = timer();
    const candles = await getCandles({ symbol, exchange: inst.exchange ?? "NSE", timeframe: inst.timeframe ?? "1d", start, end: lag.end });
    const fetch_ms = fetchTime();
    if (candles.length > MAX_CANDLES) throw new BacktestInputError("That window has too many bars — shorten the date range or use a coarser timeframe.");
    const computeTime = timer();
    const { result: engine, spec } = isSpec(definition) ? runSavedSpec(definition, candles, capital, name, start) : runDefinition(definition, candles, capital, name);
    const compute_ms = computeTime();
    labelResult(engine, symbol, candles, lag.note);
    return {
        result: { ...engine, candles },
        spec: spec as unknown as Record<string, unknown>,
        meter: {
            spec_hash: engine.assumptions.spec_hash ?? null,
            engine_version: ENGINE_VERSION,
            data_lane: engine.assumptions.data_source ?? null,
            data_version: engine.assumptions.data_version ?? null,
            timeframe: inst.timeframe ?? "1d",
            bars: candles.length,
            trades: engine.trades.length,
            compute_ms,
            fetch_ms,
        },
    };
}

// ── chat to backtest ────────────────────────────────────────────────────────

const suggestions = (definition: AnyDefinition, pro: boolean): string[] => {
    if (definition.kind === "options") return ["Add a 30% stop per leg", "Try a strangle instead", "Run it on BANKNIFTY"];
    const inst = definition.instrument ?? {};
    const sl = definition.risk?.stop_loss_pct;
    const out: string[] = [];
    out.push(sl && sl > 1 ? "Tighten the stop to 1%" : "Widen the stop to 3%");
    // Don't offer free users a chip that leads to a Pro wall.
    if (!pro) out.push("Set the target to 5%");
    else out.push(inst.timeframe === "1d" ? "Try it on the 15m timeframe" : "Try it on daily candles");
    out.push(String(inst.symbol ?? "").toUpperCase() === "SAMPLE" ? "Run it on RELIANCE" : "Make it a short instead");
    return out.slice(0, 3);
};

export const reportReply = (name: string, r: EngineResult): string => {
    const m = r.metrics;
    const verdict = m.wiped_out ? "**wiped out** — equity hit zero and the run stopped there" : m.total_pnl > 0 ? "profitable" : "a net loser";
    const sign = m.total_return_pct >= 0 ? "+" : "";
    // The amount is in the report, in the visitor's currency; the reply only says whether charges are in.
    const costs = r.assumptions.cost_profile ? "after charges" : "**before costs**";
    const lead = r.assumptions.synthetic ? "**SYNTHETIC DATA — not market results.** " : "";
    return (
        `${lead}Done — I backtested your **${name}** idea. Over this window it was ${verdict}: **${sign}${m.total_return_pct.toFixed(2)}%** return ${costs} across ` +
        `**${m.num_trades} trades** with a **${m.win_rate.toFixed(0)}% win rate**, Sharpe **${m.sharpe.toFixed(2)}** and max drawdown **${m.max_drawdown_pct.toFixed(1)}%**. ` +
        `Full report and equity curve are on the right. Want me to tweak the stop, target, or timeframe and re-run?\n${DISCLAIMER}`
    );
};

const SYMBOL_CHIPS = ["Run it on RELIANCE", "Run it on TCS", "Run it on NIFTYBEES"];

// Abuse protection (applies to every plan, Pro included): normal use never
// gets near these, a script or a stuck button does.
export const limitChat = rateLimit("chat", [{ limit: 8, seconds: 60 }, { limit: 120, seconds: 3600 }], "running backtests", clientIp);
export const limitRuns = rateLimit("runs", [{ limit: 8, seconds: 60 }, { limit: 120, seconds: 3600 }], "running backtests", clientIp);
export const limitWrites = rateLimit("writes", [{ limit: 30, seconds: 60 }], "saving or deleting", clientIp);
export const limitCheckout = rateLimit("checkout", [{ limit: 6, seconds: 60 }, { limit: 30, seconds: 3600 }], "starting checkouts", clientIp);

/* POST /backtest/chat — optional auth (anon visitors get a small daily allowance). */
export const chatBacktest = async (req, res) => {
    const validation = validateChat(req.body);
    if (validation.errors) return bad(res, validation);
    const payload = validation.data;

    const userId: string | null = req.user?.authId ?? null;
    const ip = clientIp(req);

    try {
        let usage: Usage = await usageFor(userId, ip);
        const today = new Date().toISOString().slice(0, 10);

        // Quota gate — before any Claude call: this is the unit-economics wall.
        if (usage.remaining !== null && usage.remaining <= 0) {
            return res.status(HTTP_STATUS.OK).json({
                reply: paywallReply(usage),
                interpretation: "",
                warnings: [],
                strategy_name: "",
                definition: {},
                start_date: today,
                end_date: today,
                result: null,
                ok: false,
                error: "quota_exceeded",
                usage,
                suggestions: [],
                paywall: true,
            });
        }

        // Not a trading rule at all → say so (and spend nothing) instead of
        // silently backtesting a default strategy.
        const prevDefinition = (payload.prev_definition ?? null) as AnyDefinition | null;
        if (!looksLikeTrading(payload.message) && !(awaitingSymbol(prevDefinition) && applyModification(prevDefinition, payload.message))) {
            const quoted = payload.message.length > 60 ? `${payload.message.slice(0, 57)}…` : payload.message;
            return res.status(HTTP_STATUS.OK).json({
                reply: `I couldn't find a trading rule in "${quoted}". Tell me **when to buy or sell** — an indicator, a price level or a crossover — plus any stop-loss or target. For example: "${STRATEGY_EXAMPLES[0]}".`,
                interpretation: "",
                warnings: [],
                strategy_name: "",
                definition: {},
                start_date: today,
                end_date: today,
                result: null,
                ok: false,
                error: "not_a_strategy",
                usage,
                suggestions: STRATEGY_EXAMPLES,
                paywall: false,
                locked: [],
            });
        }

        // Anonymous visitors get the free feature set too.
        const pro = usage.tier === "pro";
        const locked: string[] = [];

        const override = payload.symbol ? payload.symbol.trim().toUpperCase() : null;
        const history = payload.history;
        const profile = payload.profile ?? null;

        let name: string;
        let interpretation: string;
        let warnings: string[];
        let definition: AnyDefinition;
        let symbol: string;
        let exchange: string;
        let timeframe: string;
        let run: (candles: Awaited<ReturnType<typeof getCandles>>) => EngineResult;

        const prev = prevDefinition;
        const options = applyOptionsModification(prev, payload.message, override) ?? parseOptions(payload.message, override);
        if (options && !pro) {
            // Pro-only — answered before any quota is spent or data fetched.
            return res.status(HTTP_STATUS.OK).json({
                reply: PRO_MESSAGES.options(),
                interpretation: options.interpretation,
                warnings: [],
                strategy_name: options.name,
                definition: {},
                start_date: today,
                end_date: today,
                result: null,
                ok: false,
                error: "pro_required",
                usage,
                suggestions: ["Buy NIFTY when RSI drops below 30", "Golden cross on BANKNIFTY, daily"],
                paywall: true,
                locked: ["options"],
            });
        }
        if (options) {
            const spec = options.spec;
            ({ name, interpretation, warnings } = options);
            ({ symbol, exchange, timeframe } = spec);
            definition = {
                kind: "options",
                structure: spec.structure,
                side: spec.side,
                instrument: { symbol, exchange, timeframe },
                stop_multiple: spec.stopMultiple,
            };
            run = (candles) => {
                // Size lots by margin like the equity path sizes shares; a 1-unit
                // "lot" on a ₹100 underlying made a ₹1L account look idle.
                if (candles.length) {
                    const allocation = allocationFor(profile?.risk);
                    spec.lots = lotsForCapital(spec.symbol, candles[0].open, payload.starting_capital, allocation);
                    definition.lots = spec.lots;
                    interpretation += `\n**Size:** ${spec.lots.toLocaleString("en-IN")} lot${spec.lots === 1 ? "" : "s"} (margin ≈ ${Math.round(allocation * 100)}% of your capital, at least one lot)`;
                }
                return runOptionsBacktest(spec, candles, payload.starting_capital);
            };
        } else {
            // A message with its own entry rule is a new strategy; "try EMA
            // instead" names an indicator but no rule, so ask instead of guessing.
            const kind = classifyMessage(prev, payload.message);
            if (kind === "ambiguous") {
                return res.status(HTTP_STATUS.OK).json({
                    reply: `Do you want to replace the entry and exit rules? Tell me the full rule — for example "${STRATEGY_EXAMPLES[1]}" — or say what to change ("tighten the stop to 1%", "run it on INFY").`,
                    interpretation: "",
                    warnings: [],
                    strategy_name: "",
                    definition: prev,
                    start_date: today,
                    end_date: today,
                    result: null,
                    ok: false,
                    error: "clarify",
                    usage,
                    suggestions: [STRATEGY_EXAMPLES[1], "Tighten the stop to 1%"],
                    paywall: false,
                    locked: [],
                });
            }
            // 1. deterministic tweak of the previous strategy (no API cost, works with no key)
            // 2. Claude for long-tail phrasings, when configured   3. offline rules parser
            const tweak = kind === "modify" ? applyModification(prev, payload.message) : null;
            // Claude (paid tokens) is a Pro feature; free accounts use the offline rules parser.
            // A new strategy never sees the previous one, so it can't be read as a tweak of it.
            const ai = tweak || !pro ? null : await llmParse({ message: payload.message, history, prevDefinition: kind === "new" ? null : prev, profile });
            const parsed = tweak ?? ai ?? parseStrategy(payload.message, override);
            definition = parsed.definition;
            // Store a sizing RULE, never a share count: the engine sizes each trade
            // at its own fill price, so re-targeting a symbol can't carry a stale size.
            if (namesQuantity(payload.message)) definition.sizing = sizingFor(payload.message);
            else if (tweak) definition.sizing = prev?.sizing ?? sizingFor(payload.message, profile?.risk);
            else if (!(ai && definition.sizing)) definition.sizing = sizingFor(payload.message, profile?.risk);
            parsed.warnings.push(...personalize(definition, profile));
            if (override && definition.instrument) definition.instrument.symbol = override;
            ({ name, interpretation, warnings } = parsed);
            interpretation += `\n**Position size:** ${describeSizing(definition.sizing!)}`;
            const inst = definition.instrument ?? {};
            symbol = inst.symbol || "SAMPLE";
            exchange = inst.exchange ?? "NSE";
            timeframe = inst.timeframe ?? "1d";
            if (!pro && !FREE_TIMEFRAMES.includes(timeframe)) {
                // Free plan: run it on daily candles rather than refuse outright.
                warnings.push(`${PRO_MESSAGES.intraday(timeframe)} I ran it on daily candles instead.`);
                name = name.replace(new RegExp(` ${timeframe}$`), " 1d");
                definition.instrument = { ...inst, timeframe: "1d" };
                definition.risk = { ...(definition.risk ?? {}), square_off_time: null };
                timeframe = "1d";
                locked.push("intraday");
            }
            // No symbol named → ask, never fall back to synthetic data silently.
            // SAMPLE runs only when asked for (or kept from a SAMPLE run being tweaked).
            const explicitSample = /\bsample\b/i.test(payload.message) || override === "SAMPLE" || Boolean(tweak && prev?.instrument?.symbol === "SAMPLE");
            if (!inst.symbol || (symbol === "SAMPLE" && !explicitSample)) {
                return res.status(HTTP_STATUS.OK).json({
                    reply: `Which stock should I test this on? Name an NSE symbol — for example RELIANCE, TCS or HDFCBANK. (Say "on SAMPLE" for the offline demo series; its results are synthetic.)`,
                    interpretation: interpretation.replace(/(\*\*Instrument:\*\*) [^·\n]*/, "$1 not chosen yet "),
                    warnings,
                    strategy_name: name,
                    // Blank symbol, so a reply like "RELIANCE" re-targets these rules.
                    definition: { ...definition, instrument: { ...inst, symbol: "" } },
                    start_date: today,
                    end_date: today,
                    result: null,
                    ok: false,
                    error: "symbol_required",
                    usage,
                    suggestions: SYMBOL_CHIPS,
                    paywall: false,
                    locked,
                });
            }
            run = (candles) => runBacktest(definition, candles, payload.starting_capital);
        }

        const [defStart, defEnd] = defaultWindow(timeframe);
        let start = payload.start_date || defStart;
        const lag = applyDataLag(payload.end_date || defEnd);
        const end = lag.end;
        if (!pro && start < earliestFreeStart()) {
            // Default windows are clamped quietly; an explicit older start gets told why.
            if (payload.start_date) {
                warnings.push(PRO_MESSAGES.full_history());
                locked.push("full_history");
            }
            start = earliestFreeStart();
        }

        const base = {
            reply: "",
            interpretation,
            warnings,
            strategy_name: name,
            definition,
            start_date: start,
            end_date: end,
            result: null as BacktestResult | null,
            ok: false,
            error: null as string | null,
            usage,
            suggestions: suggestions(definition, pro),
            paywall: false,
            locked,
        };

        const badWindow = windowError(start, end);
        if (badWindow) {
            return res.status(HTTP_STATUS.OK).json({ ...base, error: badWindow, reply: `${badWindow} — please fix the window.` });
        }

        try {
            const fetchTime = timer();
            const candles = await getCandles({ symbol, exchange, timeframe, start, end });
            const fetch_ms = fetchTime();
            if (candles.length > MAX_CANDLES) throw new BacktestInputError("That window has too many bars — shorten the date range or use a coarser timeframe.");
            const computeTime = timer();
            const engine = run(candles);
            const compute_ms = computeTime();
            const notes = labelResult(engine, symbol, candles, lag.note);
            meter({
                user_id: userId,
                channel: "web_chat",
                tier: usage.tier,
                ok: true,
                spec_hash: engine.assumptions.spec_hash ?? null,
                engine_version: ENGINE_VERSION,
                data_lane: engine.assumptions.data_source ?? null,
                data_version: engine.assumptions.data_version ?? null,
                timeframe,
                bars: candles.length,
                trades: engine.trades.length,
                compute_ms,
                fetch_ms,
            });
            // Only a backtest that actually ran counts against the allowance —
            // a typo'd symbol or an empty window costs the user nothing.
            usage = await consumeAllowance(userId, ip, usage);
            return res
                .status(HTTP_STATUS.OK)
                .json({ ...base, warnings: [...notes, ...warnings], usage, interpretation, ok: true, result: { ...engine, candles }, reply: reportReply(name, engine) });
        } catch (err) {
            meter({ ...EMPTY_METER, user_id: userId, channel: "web_chat", tier: usage.tier, ok: false, timeframe });
            if (err instanceof MarketDataError || err instanceof BacktestInputError) {
                const msg = (err as Error).message;
                return res.status(HTTP_STATUS.OK).json({
                    ...base,
                    error: msg,
                    reply: `I set up the strategy, but couldn't pull data to test it: ${msg}. Try a liquid name like RELIANCE or NIFTYBEES.`,
                });
            }
            console.error("[Backtest] chat run failed:", err);
            return res.status(HTTP_STATUS.OK).json({ ...base, error: `Unexpected error: ${(err as Error)?.message || err}`, reply: "Something went wrong running that backtest. Try rephrasing the rule." });
        }
    } catch (err) {
        return serverError(res, "Chat backtest failed", err);
    }
};

/* GET /backtest/spec — the Strategy Spec v1 contract: JSON Schema, indicators and operators (public). */
export const getSpecSchema = (_req, res) => {
    res.set("Cache-Control", "public, max-age=3600");
    return res.status(HTTP_STATUS.OK).json({
        spec_version: SPEC_VERSION,
        engine_version: ENGINE_VERSION,
        json_schema: specJsonSchema(),
        indicators: SPEC_INDICATOR_LIST,
        operators: OPERATORS,
    });
};

/* GET /backtest/plan — tier + usage summary (optional auth). */
export const getPlan = async (req, res) => {
    try {
        const status = await planStatus(req.user?.authId ?? null, clientIp(req));
        return res.status(HTTP_STATUS.OK).json({ ...status, trial_hours: limits().trialHours });
    } catch (err) {
        return serverError(res, "Plan lookup failed", err);
    }
};

// ── strategies ──────────────────────────────────────────────────────────────

export const listMyStrategies = async (req, res) => {
    try {
        return res.status(HTTP_STATUS.OK).json(await listStrategies(req.user.authId));
    } catch (err) {
        return serverError(res, "Listing strategies failed", err);
    }
};

export const createStrategy = async (req, res) => {
    const validation = validateStrategyCreate(req.body);
    if (validation.errors) return bad(res, validation);
    try {
        if (!(await getEntitlement(req.user.authId)).pro && (await listStrategies(req.user.authId)).length >= limits().freeStrategies) {
            return proRequired(res, new ProRequiredError("unlimited_strategies", PRO_MESSAGES.unlimited_strategies()));
        }
        const row = await insertStrategy({ user_id: req.user.authId, ...validation.data });
        return res.status(HTTP_STATUS.CREATED).json(row);
    } catch (err) {
        return serverError(res, "Creating strategy failed", err);
    }
};

export const getMyStrategy = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(res, "Strategy");
    try {
        const row = await getStrategy(req.user.authId, req.params.id);
        if (!row) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Strategy not found" });
        return res.status(HTTP_STATUS.OK).json(row);
    } catch (err) {
        return serverError(res, "Reading strategy failed", err);
    }
};

export const updateMyStrategy = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(res, "Strategy");
    const validation = validateStrategyUpdate(req.body);
    if (validation.errors) return bad(res, validation);
    try {
        const row = await updateStrategyRepo(req.user.authId, req.params.id, validation.data);
        if (!row) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Strategy not found" });
        return res.status(HTTP_STATUS.OK).json(row);
    } catch (err) {
        return serverError(res, "Updating strategy failed", err);
    }
};

export const deleteMyStrategy = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(res, "Strategy");
    try {
        if (!(await deleteStrategy(req.user.authId, req.params.id))) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Strategy not found" });
        return res.status(204).end();
    } catch (err) {
        return serverError(res, "Deleting strategy failed", err);
    }
};

// ── runs ────────────────────────────────────────────────────────────────────

const summary = (r: Omit<RunRow, "result"> & { metrics?: unknown }) => ({
    id: r.id,
    strategy_id: r.strategy_id,
    strategy_name: r.strategy_name,
    start_date: r.start_date,
    end_date: r.end_date,
    starting_capital: r.starting_capital,
    status: r.status,
    error: r.error,
    metrics: r.metrics ?? null,
    created_at: r.created_at,
});

/* POST /backtest/runs — run a saved strategy over a window and store the result. */
export const createRun = async (req, res) => {
    const validation = validateRun(req.body);
    if (validation.errors) return bad(res, validation);
    const { strategy_id, start_date, end_date, starting_capital } = validation.data;
    const userId = req.user.authId;

    if (!UUID.test(strategy_id)) return notFound(res, "Strategy");
    const badWindow = windowError(start_date, end_date);
    if (badWindow) return res.status(422).json({ error: badWindow });

    try {
        const strategy = await getStrategy(userId, strategy_id);
        if (!strategy) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Strategy not found" });
        const definition = strategy.definition as StrategyDefinition;

        // Free plan: daily candles, recent history, and the shared monthly allowance.
        const usage = await usageFor(userId, clientIp(req));
        if (usage.tier !== "pro") {
            const tf = definition.instrument?.timeframe ?? "1d";
            if (!FREE_TIMEFRAMES.includes(tf)) return proRequired(res, new ProRequiredError("intraday", PRO_MESSAGES.intraday(tf)));
            if (start_date < earliestFreeStart()) return proRequired(res, new ProRequiredError("full_history", PRO_MESSAGES.full_history()));
            if (usage.remaining !== null && usage.remaining <= 0) return proRequired(res, new ProRequiredError("quota", paywallReply(usage)));
        }

        const meta = { user_id: userId, strategy_id: strategy.id, strategy_name: strategy.name, definition: strategy.definition, start_date, end_date, starting_capital };
        try {
            const { result, spec, meter: m } = await execute(definition, start_date, end_date, starting_capital, strategy.name);
            meter({ user_id: userId, channel: "web_run", tier: usage.tier, ok: true, ...m });
            // Counted only once the run succeeded (failed runs are free).
            if (usage.tier !== "pro") await consumeAllowance(userId, clientIp(req), usage);
            const row = await insertRun({
                ...meta,
                end_date: applyDataLag(end_date).end,
                status: "completed",
                error: null,
                result,
                spec,
                spec_hash: m.spec_hash,
                engine_version: m.engine_version,
                data_version: m.data_version,
            });
            return res.status(HTTP_STATUS.CREATED).json({ ...summary({ ...row, metrics: result.metrics }), definition: strategy.definition, result });
        } catch (err) {
            if (err instanceof BacktestTablesMissingError) throw err;
            meter({ ...EMPTY_METER, user_id: userId, channel: "web_run", tier: usage.tier, ok: false, timeframe: definition.instrument?.timeframe ?? "1d" });
            const message = err instanceof MarketDataError || err instanceof BacktestInputError ? err.message : `Unexpected error: ${(err as Error)?.message || err}`;
            await insertRun({ ...meta, status: "failed", error: message.slice(0, 500), result: null }).catch(() => undefined);
            return res.status(422).json({ error: message });
        }
    } catch (err) {
        return serverError(res, "Running backtest failed", err);
    }
};

export const listMyRuns = async (req, res) => {
    try {
        return res.status(HTTP_STATUS.OK).json((await listRuns(req.user.authId)).map(summary));
    } catch (err) {
        return serverError(res, "Listing backtests failed", err);
    }
};

export const getMyRun = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(res, "Backtest");
    try {
        const row = await getRun(req.user.authId, req.params.id);
        if (!row) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Backtest not found" });
        return res.status(HTTP_STATUS.OK).json({ ...summary({ ...row, metrics: row.result?.metrics ?? null }), definition: row.definition, result: row.result });
    } catch (err) {
        return serverError(res, "Reading backtest failed", err);
    }
};

export const deleteMyRun = async (req, res) => {
    if (!UUID.test(req.params.id)) return notFound(res, "Backtest");
    try {
        if (!(await deleteRun(req.user.authId, req.params.id))) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Backtest not found" });
        return res.status(204).end();
    } catch (err) {
        return serverError(res, "Deleting backtest failed", err);
    }
};
