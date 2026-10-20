// OpenAPI 3.1 description of /api/v1 — the contract clients are written
// against (the web app's client, the MCP server next). Served at
// GET /api/v1/openapi.json. A test keeps it in sync with the router.
import { ENGINE_VERSION } from "../engine.js";
import { OPERATORS, SPEC_VERSION, specJsonSchema } from "../spec.js";
import { SPEC_INDICATORS } from "../indicators.js";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: object, description = "OK") => ({ description, content: { "application/json": { schema } } });
const problems = (...codes: number[]) =>
    Object.fromEntries(codes.map((c) => [String(c), { description: PROBLEM_TEXT[c], content: { "application/problem+json": { schema: ref("Problem") } } }]));
const PROBLEM_TEXT: Record<number, string> = {
    400: "Malformed request",
    401: "Sign in required",
    403: "Plan limit (`pro_required`, `quota_exceeded`)",
    404: "Not found in your account",
    409: "Same Idempotency-Key still in progress",
    422: "Invalid spec, unavailable data, or reused Idempotency-Key",
    429: "Rate limited",
};
const idParam = (name: string, description: string, schema: object = { type: "string", format: "uuid" }) => ({ name, in: "path", required: true, description, schema });
const query = (name: string, description: string, schema: object) => ({ name, in: "query", required: false, description, schema });
const idempotencyKey = { name: "Idempotency-Key", in: "header", required: false, description: "Repeat a POST safely: the first response is returned again for 24 hours.", schema: { type: "string", maxLength: 255 } };
const channel = { name: "X-Xtin-Channel", in: "header", required: false, description: "Which client is calling (web, mcp, api) — for usage metering.", schema: { type: "string", enum: ["web", "mcp", "api"] } };
const auth = [{ bearerAuth: [] }];

export function openApiDocument() {
    return {
        openapi: "3.1.0",
        info: {
            title: "Xtin Backtest API",
            version: "1.0.0",
            summary: "Deterministic backtests of NSE trading rules written as Strategy Spec v1.",
            description:
                `Every result is computed by the Xtin engine (engine ${ENGINE_VERSION}) from a Strategy Spec ${SPEC_VERSION}; the same spec, data version and engine version always give the same numbers. ` +
                "Results are hypothetical backtests on historical data — not investment advice. Errors are RFC 9457 problem+json. Every response carries X-Request-Id.",
        },
        servers: [{ url: "/api/v1" }],
        security: auth,
        tags: [
            { name: "Instruments" },
            { name: "Strategies", description: "Specs, validation, templates and versioned saved strategies." },
            { name: "Backtests", description: "Runs, reports and comparisons." },
            { name: "Account" },
        ],
        paths: {
            "/instruments": {
                get: {
                    tags: ["Instruments"],
                    operationId: "searchInstruments",
                    summary: "Search instruments",
                    security: [],
                    parameters: [query("q", "Symbol or name, e.g. 'reliance'", { type: "string" }), query("limit", "Max results (1–25)", { type: "integer", minimum: 1, maximum: 25, default: 10 })],
                    responses: { "200": json({ type: "object", properties: { data: { type: "array", items: ref("Instrument") } }, required: ["data"] }) },
                },
            },
            "/instruments/{id}/coverage": {
                get: {
                    tags: ["Instruments"],
                    operationId: "getCoverage",
                    summary: "Data available by timeframe and source",
                    security: [],
                    parameters: [idParam("id", "EXCHANGE:SYMBOL, e.g. NSE:RELIANCE", { type: "string", pattern: "^(NSE|BSE|NASDAQ|NYSE):[A-Za-z0-9&.^-]{1,20}$" })],
                    responses: { "200": json(ref("Coverage")), ...problems(400) },
                },
            },
            "/strategies/validate": {
                post: {
                    tags: ["Strategies"],
                    operationId: "validateStrategy",
                    summary: "Normalise a spec: summary, warnings and credit estimate (spends nothing)",
                    security: [],
                    parameters: [idempotencyKey],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { spec: ref("StrategySpec") }, required: ["spec"] } } } },
                    responses: { "200": json(ref("ValidationResult")), ...problems(429) },
                },
            },
            "/strategies/templates": {
                get: {
                    tags: ["Strategies"],
                    operationId: "listTemplates",
                    summary: "Template strategies for the builder",
                    security: [],
                    responses: { "200": json({ type: "object", properties: { data: { type: "array", items: ref("Template") } } }) },
                },
            },
            "/strategies": {
                get: { tags: ["Strategies"], operationId: "listStrategies", summary: "Saved strategies (current version of each)", responses: { "200": json({ type: "object", properties: { data: { type: "array", items: ref("Strategy") } } }), ...problems(401) } },
                post: {
                    tags: ["Strategies"],
                    operationId: "createStrategy",
                    summary: "Save a strategy as version 1",
                    parameters: [idempotencyKey],
                    requestBody: { required: true, content: { "application/json": { schema: ref("StrategyWrite") } } },
                    responses: { "201": json(ref("Strategy"), "Created"), ...problems(401, 403, 409, 422, 429) },
                },
            },
            "/strategies/{id}": {
                get: {
                    tags: ["Strategies"],
                    operationId: "getStrategy",
                    summary: "A saved strategy with its version list",
                    parameters: [idParam("id", "Strategy id")],
                    responses: { "200": json(ref("StrategyWithVersions")), ...problems(401, 404) },
                },
                delete: { tags: ["Strategies"], operationId: "deleteStrategy", summary: "Delete a saved strategy", parameters: [idParam("id", "Strategy id")], responses: { "204": { description: "Deleted" }, ...problems(401, 404, 429) } },
            },
            "/strategies/{id}/versions": {
                post: {
                    tags: ["Strategies"],
                    operationId: "addStrategyVersion",
                    summary: "Save an edit as the next version (earlier versions are kept)",
                    parameters: [idParam("id", "Strategy id"), idempotencyKey],
                    requestBody: { required: true, content: { "application/json": { schema: ref("StrategyWrite") } } },
                    responses: { "201": json(ref("Strategy"), "Created"), ...problems(401, 404, 409, 422, 429) },
                },
            },
            "/strategies/{id}/versions/{version}": {
                get: {
                    tags: ["Strategies"],
                    operationId: "getStrategyVersion",
                    summary: "One version of a saved strategy",
                    parameters: [idParam("id", "Strategy id"), idParam("version", "Version number", { type: "integer", minimum: 1 })],
                    responses: { "200": json({ type: "object", properties: { id: { type: "string" }, name: { type: "string" }, version: { type: "integer" }, spec: ref("StrategySpec"), spec_hash: { type: "string" }, created_at: { type: "string", format: "date-time" } } }), ...problems(401, 404) },
                },
            },
            "/backtests": {
                get: {
                    tags: ["Backtests"],
                    operationId: "listBacktests",
                    summary: "Run history, newest first",
                    parameters: [query("page", "Page (1-based)", { type: "integer", minimum: 1, default: 1 }), query("page_size", "Runs per page (1–100)", { type: "integer", minimum: 1, maximum: 100, default: 25 })],
                    responses: { "200": json({ type: "object", properties: { data: { type: "array", items: ref("RunListItem") }, page: { type: "integer" }, page_size: { type: "integer" }, has_more: { type: "boolean" } } }), ...problems(401) },
                },
                post: {
                    tags: ["Backtests"],
                    operationId: "runBacktest",
                    summary: "Run a spec (inline, or a saved strategy). Identical inputs return the stored result with cached: true and no credit.",
                    parameters: [idempotencyKey, channel],
                    requestBody: { required: true, content: { "application/json": { schema: ref("RunRequest") } } },
                    responses: { "201": json(ref("RunSummary"), "Ran and stored"), "200": json(ref("RunSummary"), "Cached result"), ...problems(400, 401, 403, 404, 409, 422, 429) },
                },
            },
            "/backtests/compare": {
                post: {
                    tags: ["Backtests"],
                    operationId: "compareBacktests",
                    summary: "Side-by-side metrics for 2–5 runs, and which assumptions differ",
                    parameters: [idempotencyKey],
                    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { run_ids: { type: "array", items: { type: "string", format: "uuid" }, minItems: 2, maxItems: 5 } }, required: ["run_ids"] } } } },
                    responses: { "200": json(ref("Comparison")), ...problems(400, 401, 404) },
                },
            },
            "/backtests/{id}": {
                get: {
                    tags: ["Backtests"],
                    operationId: "getBacktest",
                    summary: "Headline, metrics, assumptions and spec of a run",
                    parameters: [idParam("id", "Run id"), query("include", "`result` adds trades, equity curve and candles (large)", { type: "string", enum: ["result"] })],
                    responses: { "200": json(ref("RunDetail")), ...problems(401, 404) },
                },
                delete: { tags: ["Backtests"], operationId: "deleteBacktest", summary: "Delete a run", parameters: [idParam("id", "Run id")], responses: { "204": { description: "Deleted" }, ...problems(401, 404, 429) } },
            },
            "/backtests/{id}/trades": {
                get: {
                    tags: ["Backtests"],
                    operationId: "getBacktestTrades",
                    summary: "Trade log, 20 per page",
                    parameters: [idParam("id", "Run id"), query("page", "Page (1-based)", { type: "integer", minimum: 1, default: 1 })],
                    responses: { "200": json({ type: "object", properties: { data: { type: "array", items: ref("Trade") }, page: { type: "integer" }, page_size: { type: "integer" }, total: { type: "integer" }, has_more: { type: "boolean" } } }), ...problems(401, 404) },
                },
            },
            "/backtests/{id}/series": {
                get: {
                    tags: ["Backtests"],
                    operationId: "getBacktestSeries",
                    summary: "Equity or drawdown series (downsampled for charts), or month-by-month returns",
                    parameters: [idParam("id", "Run id"), query("kind", "Which series", { type: "string", enum: ["equity", "drawdown", "monthly"], default: "equity" }), query("points", "Max points (10–2000)", { type: "integer", minimum: 10, maximum: 2000, default: 500 })],
                    responses: {
                        "200": json({ type: "object", properties: { kind: { type: "string" }, unit: { type: "string" }, total_points: { type: "integer" }, data: { type: "array", items: { type: "object", description: "{time, value} for equity/drawdown; {month, return_pct} for monthly", properties: { time: { type: "string" }, value: { type: "number" }, month: { type: "string" }, return_pct: { type: "number" } } } } } }),
                        ...problems(400, 401, 404),
                    },
                },
            },
            "/usage": { get: { tags: ["Account"], operationId: "getUsage", summary: "Credits left this period and plan limits", responses: { "200": json(ref("Usage")), ...problems(401) } } },
            "/openapi.json": { get: { tags: ["Account"], operationId: "getOpenApi", summary: "This document", security: [], responses: { "200": json({ type: "object" }) } } },
        },
        components: {
            securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", description: "Your Xtin session token (the same login as the website)." } },
            schemas: {
                StrategySpec: specJsonSchema(),
                Problem: {
                    type: "object",
                    description: "RFC 9457 problem details.",
                    properties: {
                        type: { type: "string", format: "uri" },
                        title: { type: "string" },
                        status: { type: "integer" },
                        detail: { type: "string", description: "What went wrong and how to fix it." },
                        code: { type: "string" },
                        request_id: { type: "string" },
                        instance: { type: "string" },
                        errors: { type: "array", items: { type: "string" } },
                        feature: { type: "string" },
                    },
                    required: ["type", "title", "status", "code"],
                },
                Instrument: { type: "object", properties: { id: { type: "string" }, symbol: { type: "string" }, exchange: { type: "string" }, name: { type: "string" }, segment: { type: "string", enum: ["EQ", "INDEX", "ETF", "SYNTHETIC"] } }, required: ["id", "symbol", "exchange", "name", "segment"] },
                Coverage: { type: "object", properties: { id: { type: "string" }, source: { type: "string" }, note: { type: "string" }, timeframes: { type: "object", additionalProperties: { type: "object", properties: { from: { type: "string" }, to: { type: "string" }, approximate: { type: "boolean" } } } } } },
                ValidationResult: {
                    type: "object",
                    properties: {
                        valid: { type: "boolean" },
                        spec: ref("StrategySpec"),
                        spec_hash: { type: "string", description: "SHA-256 of the normalised spec — its fingerprint." },
                        summary: { type: "string" },
                        warnings: { type: "array", items: { type: "string" } },
                        errors: { type: "array", items: { type: "string" } },
                        estimate: { type: "object", properties: { credits: { type: "integer" }, bars: { type: "integer" } } },
                    },
                    required: ["valid"],
                },
                Template: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, category: { type: "string" }, description: { type: "string" }, spec: ref("StrategySpec") } },
                StrategyWrite: {
                    type: "object",
                    description: "A spec, or a legacy chat `definition` (converted to a spec).",
                    properties: { name: { type: "string", maxLength: 160 }, spec: ref("StrategySpec"), definition: { type: "object" } },
                },
                Strategy: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        version: { type: "integer" },
                        legacy: { type: "boolean", description: "Saved before /v1; its spec is converted from the old format." },
                        spec: { oneOf: [ref("StrategySpec"), { type: "null" }] },
                        spec_hash: { type: ["string", "null"] },
                        summary: { type: ["string", "null"] },
                        warnings: { type: "array", items: { type: "string" } },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                StrategyWithVersions: {
                    allOf: [ref("Strategy"), { type: "object", properties: { versions: { type: "array", items: { type: "object", properties: { version: { type: "integer" }, spec_hash: { type: "string" }, created_at: { type: "string" } } } } } }],
                },
                RunRequest: {
                    type: "object",
                    description: "Either `spec`, or `strategy_id` (+ optional `version`). `period`, `capital` and `name` override the spec.",
                    properties: {
                        spec: ref("StrategySpec"),
                        strategy_id: { type: "string", format: "uuid" },
                        version: { type: "integer", minimum: 1 },
                        period: { type: "object", properties: { from: { type: "string", format: "date" }, to: { type: "string", format: "date" } } },
                        capital: { type: "number", exclusiveMinimum: 0 },
                        name: { type: "string" },
                    },
                },
                Headline: {
                    type: "object",
                    properties: {
                        total_return_pct: { type: "number" },
                        cagr_pct: { type: ["number", "null"] },
                        max_drawdown_pct: { type: "number" },
                        sharpe: { type: "number" },
                        win_rate: { type: "number" },
                        num_trades: { type: "integer" },
                        profit_factor: { type: "number" },
                        total_costs: { type: "number" },
                    },
                },
                RunSummary: {
                    type: "object",
                    description: "The small response for a run — eight headline metrics, one assumptions line, warnings and links. Never a trade dump.",
                    properties: {
                        run_id: { type: "string", format: "uuid" },
                        cached: { type: "boolean" },
                        status: { type: "string" },
                        name: { type: "string" },
                        strategy_id: { type: ["string", "null"] },
                        created_at: { type: "string", format: "date-time" },
                        period: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } } },
                        capital: { type: "number" },
                        spec_hash: { type: ["string", "null"] },
                        summary: { type: ["string", "null"] },
                        headline: ref("Headline"),
                        assumptions_line: { type: ["string", "null"] },
                        warnings: { type: "array", items: { type: "string" } },
                        disclaimer: { type: "string" },
                        links: { type: "object", properties: { self: { type: "string" }, trades: { type: "string" }, series: { type: "string" }, report: { type: "string" } } },
                    },
                },
                RunDetail: { allOf: [ref("RunSummary"), { type: "object", properties: { metrics: { type: "object" }, assumptions: { type: "object" }, spec: ref("StrategySpec"), result: { type: "object", description: "With include=result: trades, equity_curve, candles." } } }] },
                RunListItem: { type: "object", properties: { run_id: { type: "string" }, name: { type: "string" }, strategy_id: { type: ["string", "null"] }, status: { type: "string" }, period: { type: "object" }, capital: { type: "number" }, metrics: { type: ["object", "null"] }, created_at: { type: "string" } } },
                Trade: {
                    type: "object",
                    properties: {
                        side: { type: "string" },
                        qty: { type: "integer" },
                        entry_time: { type: "string" },
                        entry_price: { type: "number" },
                        exit_time: { type: "string" },
                        exit_price: { type: "number" },
                        pnl: { type: "number", description: "Net of charges" },
                        pnl_pct: { type: "number" },
                        gross_pnl: { type: "number" },
                        costs: { type: "number" },
                        reason: { type: "string" },
                    },
                },
                Comparison: { type: "object", properties: { runs: { type: "array", items: ref("RunDetail") }, differences: { type: "array", items: { type: "string" } }, note: { type: ["string", "null"] }, disclaimer: { type: "string" } } },
                Usage: {
                    type: "object",
                    properties: {
                        tier: { type: "string", enum: ["free", "pro"] },
                        credits_remaining: { type: ["integer", "null"] },
                        credits_limit: { type: ["integer", "null"] },
                        period: { type: ["string", "null"] },
                        credits_per_run: { type: "integer" },
                        cached_runs_free: { type: "boolean" },
                        timeframes: { type: ["array", "null"], items: { type: "string" } },
                        history_days: { type: ["integer", "null"] },
                        saved_strategies_limit: { type: ["integer", "null"] },
                        features: { type: "object" },
                    },
                },
            },
        },
        "x-indicators": SPEC_INDICATORS,
        "x-operators": OPERATORS,
    };
}
