// Backtest API — Node/TS port of the standalone tool's `api/chat.py` and
// `api/backtests.py` (+ strategy CRUD).
//
//   POST /backtest/chat      "chat to backtest" playground; public, quota-gated
//   *    /backtest/strategies saved strategies (auth)
//   *    /backtest/runs       run + history (auth)
//
// Every user-scoped query is filtered by `req.user.authId`; request bodies never
// carry a user id.
import { HTTP_STATUS } from "../../constants/constants.js";
import {
    allocationFor,
    applyModification,
    applyOptionsModification,
    defaultWindow,
    looksLikeTrading,
    namesQuantity,
    parseOptions,
    parseStrategy,
    personalize,
    positionSize,
    STRATEGY_EXAMPLES,
    type AnyDefinition,
} from "./parser.js";
import { llmParse } from "./llmParse.js";
import { BacktestInputError, runBacktest } from "./engine.js";
import { lotsForCapital, runOptionsBacktest } from "./options.js";
import { getCandles, MarketDataError } from "./marketData.js";
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
import { clientIp, rateLimit } from "./rateLimit.js";
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
    updateStrategy as updateStrategyRepo,
    type RunRow,
} from "./repository.js";
import { validateChat, validateRun, validateStrategyCreate, validateStrategyUpdate } from "./validator.js";
import type { BacktestResult, EngineResult, StrategyDefinition } from "./types.js";

const MAX_CANDLES = 100_000; // the engine runs on the event loop; keep one request bounded
const MAX_WINDOW_DAYS = 365 * 25;

const bad = (res, validation: { message: string; errors?: string[] }) =>
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });

// Lives in ./rateLimit.ts so other modules (the public AI routes) can use it
// without importing this whole controller.
export { clientIp };

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

type Executed = { result: BacktestResult };

/** Fetch candles and run the equity engine; throws MarketDataError / Error with a user-facing message. */
async function execute(definition: StrategyDefinition, start: string, end: string, capital: number): Promise<Executed> {
    const inst = definition.instrument ?? {};
    const candles = await getCandles({
        symbol: inst.symbol ?? "SAMPLE",
        exchange: inst.exchange ?? "NSE",
        timeframe: inst.timeframe ?? "1d",
        start,
        end,
    });
    if (candles.length > MAX_CANDLES) throw new BacktestInputError("That window has too many bars — shorten the date range or use a coarser timeframe.");
    const engine = runBacktest(definition, candles, capital);
    return { result: { ...engine, candles } };
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

const reportReply = (name: string, r: EngineResult): string => {
    const m = r.metrics;
    const verdict = m.total_pnl > 0 ? "profitable ✅" : "a net loser ❌";
    const sign = m.total_return_pct >= 0 ? "+" : "";
    return (
        `Done — I backtested your **${name}** idea. Over this window it was ${verdict}: **${sign}${m.total_return_pct.toFixed(2)}%** return across ` +
        `**${m.num_trades} trades** with a **${m.win_rate.toFixed(0)}% win rate**, Sharpe **${m.sharpe.toFixed(2)}** and max drawdown **${m.max_drawdown_pct.toFixed(1)}%**. ` +
        `Full report and equity curve are on the right. Want me to tweak the stop, target, or timeframe and re-run?`
    );
};

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
        if (!looksLikeTrading(payload.message)) {
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

        const prev = (payload.prev_definition ?? null) as AnyDefinition | null;
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
            // 1. deterministic tweak of the previous strategy (no API cost, works with no key)
            // 2. Claude for long-tail phrasings, when configured   3. offline rules parser
            const tweak = prev ? applyModification(prev, payload.message) : null;
            // Claude (paid tokens) is a Pro feature; free accounts use the offline rules parser.
            const ai = tweak || !pro ? null : await llmParse({ message: payload.message, history, prevDefinition: prev, profile });
            const parsed = tweak ?? ai ?? parseStrategy(payload.message, override);
            definition = parsed.definition;
            parsed.warnings.push(...personalize(definition, profile));
            if (override && definition.instrument) definition.instrument.symbol = override;
            ({ name, interpretation, warnings } = parsed);
            const inst = definition.instrument ?? {};
            symbol = inst.symbol ?? "SAMPLE";
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
            // Claude sizes positions itself and a tweak keeps the previous size;
            // the rules parser always says 1, so size that from capital.
            const autoSize = !tweak && !ai && !namesQuantity(payload.message);
            run = (candles) => {
                if (autoSize && candles.length) {
                    const { qty, allocation } = positionSize(payload.starting_capital, candles[0].close, profile?.risk);
                    definition.entry_action = { ...(definition.entry_action ?? {}), qty };
                    interpretation += `\n**Position size:** ${qty.toLocaleString("en-IN")} × ${symbol} (about ${Math.round(allocation * 100)}% of your capital at the first price)`;
                }
                return runBacktest(definition, candles, payload.starting_capital);
            };
        }

        const [defStart, defEnd] = defaultWindow(timeframe);
        let start = payload.start_date || defStart;
        const end = payload.end_date || defEnd;
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
            const candles = await getCandles({ symbol, exchange, timeframe, start, end });
            if (candles.length > MAX_CANDLES) throw new BacktestInputError("That window has too many bars — shorten the date range or use a coarser timeframe.");
            const engine = run(candles);
            // Only a backtest that actually ran counts against the allowance —
            // a typo'd symbol or an empty window costs the user nothing.
            usage = await consumeAllowance(userId, ip, usage);
            return res.status(HTTP_STATUS.OK).json({ ...base, usage, interpretation, ok: true, result: { ...engine, candles }, reply: reportReply(name, engine) });
        } catch (err) {
            if (err instanceof MarketDataError || err instanceof BacktestInputError) {
                const msg = (err as Error).message;
                return res.status(HTTP_STATUS.OK).json({
                    ...base,
                    error: msg,
                    reply: `I set up the strategy, but couldn't pull data to test it: ${msg}. Try the offline **SAMPLE** symbol or a liquid name like RELIANCE / NIFTY.`,
                });
            }
            console.error("[Backtest] chat run failed:", err);
            return res.status(HTTP_STATUS.OK).json({ ...base, error: `Unexpected error: ${(err as Error)?.message || err}`, reply: "Something went wrong running that backtest. Try rephrasing the rule." });
        }
    } catch (err) {
        return serverError(res, "Chat backtest failed", err);
    }
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
            const { result } = await execute(definition, start_date, end_date, starting_capital);
            // Counted only once the run succeeded (failed runs are free).
            if (usage.tier !== "pro") await consumeAllowance(userId, clientIp(req), usage);
            const row = await insertRun({ ...meta, status: "completed", error: null, result });
            return res.status(HTTP_STATUS.CREATED).json({ ...summary({ ...row, metrics: result.metrics }), definition: strategy.definition, result });
        } catch (err) {
            if (err instanceof BacktestTablesMissingError) throw err;
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
