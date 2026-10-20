// The Xtin Backtest MCP server: ten narrow tools over /api/v1, the Strategy
// Spec schema as a resource, and an interactive report (an MCP App) for runs.
//
// Tool descriptions say what a tool does, never what the model should do
// next — the workflow lives in the Claude plugin's skills. Responses stay
// small: a run returns headline metrics, one assumptions line, warnings and a
// report link, never a trade dump (trades come 20 per page).
//
// It never places orders: the directory excludes software that executes
// financial transactions, and backtesting needs none.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import * as z from "zod/v4";
import { ENGINE_VERSION } from "../backtest/engine.js";
import { OPERATORS, SPEC_INDICATOR_LIST, SPEC_VERSION, specJsonSchema } from "../backtest/spec.js";
import { ApiProblem, type ApiClient } from "./apiClient.js";

export const SERVER_VERSION = "1.0.0";
export const REPORT_URI = "ui://xtin-backtest/report.html";
export const SCHEMA_URI = "xtin://spec/v1/schema.json";
const DISCLAIMER = "Hypothetical backtest on historical data. Not investment advice. Past results do not predict future results.";

/** The report view, built from ui/report.ts by `npm run build:mcp-ui`. */
function reportHtml(): string {
    try {
        return readFileSync(new URL("./ui/report.html", import.meta.url), "utf8");
    } catch {
        return "<!doctype html><meta charset=utf-8><p style='font:14px system-ui'>The report view isn't built — run <code>npm run build:mcp-ui</code>.</p>";
    }
}

/** Claude serves MCP App views from a per-server sandbox domain: the first 32 hex of SHA-256(server URL). */
export const claudeUiDomain = (mcpUrl: string) => `${createHash("sha256").update(mcpUrl).digest("hex").slice(0, 32)}.claudemcpcontent.com`;

type Headline = { total_return_pct: number; cagr_pct: number | null; max_drawdown_pct: number; sharpe: number; win_rate: number; num_trades: number; profit_factor: number; total_costs: number };
type RunSummary = {
    run_id: string;
    cached: boolean;
    name: string;
    period: { from: string; to: string };
    capital: number;
    spec_hash: string | null;
    summary: string | null;
    headline: Headline | null;
    assumptions_line: string | null;
    warnings: string[];
    links: { report: string };
};

const signed = (n: number, d = 1) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}`;
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function headlineText(h: Headline): string {
    return [
        `Return ${signed(h.total_return_pct)}%`,
        `CAGR ${h.cagr_pct === null ? "n/a (under 30 days)" : `${signed(h.cagr_pct)}%`}`,
        `Max drawdown −${Math.abs(h.max_drawdown_pct).toFixed(1)}%`,
        `Sharpe ${h.sharpe.toFixed(2)}`,
        `Win rate ${h.win_rate.toFixed(0)}%`,
        `${h.num_trades} trades`,
        `Profit factor ${h.profit_factor.toFixed(2)}`,
        `Charges ${inr(h.total_costs)}`,
    ].join(" · ");
}

const ok = (text: string, structured?: Record<string, unknown>): CallToolResult => ({
    content: [{ type: "text", text }],
    ...(structured ? { structuredContent: structured } : {}),
});

/** An API problem as a tool error the model can act on (never an exception). */
function fail(err: unknown): CallToolResult {
    if (err instanceof ApiProblem) {
        const p = err.problem;
        const lines = [`${p.title}${p.detail ? `: ${p.detail}` : ""}`];
        if (p.errors?.length && !(p.errors.length === 1 && p.errors[0] === p.detail)) lines.push(...p.errors.map((e) => `- ${e}`));
        if (p.feature) lines.push(`(Needs Xtin Pro: ${p.feature})`);
        return { isError: true, content: [{ type: "text", text: lines.join("\n") }], structuredContent: { error: p } };
    }
    console.error("[MCP] tool failed:", err);
    return { isError: true, content: [{ type: "text", text: "The Xtin API couldn't be reached. Please try again in a moment." }] };
}

const guard =
    <A>(fn: (args: A) => Promise<CallToolResult>) =>
    async (args: A): Promise<CallToolResult> => {
        try {
            return await fn(args);
        } catch (err) {
            return fail(err);
        }
    };

// Inputs. Specs pass through untouched: the API validates them and answers
// with readable errors, and the full shape is in get_strategy_schema.
const specInput = z.record(z.string(), z.unknown()).describe(`A Strategy Spec v${SPEC_VERSION} object (see get_strategy_schema or the ${SCHEMA_URI} resource).`);
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Must be an id returned by another Xtin tool");
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");

export type ServerOptions = { api: ApiClient; siteUrl: string; mcpUrl: string };

export function buildMcpServer({ api, siteUrl, mcpUrl }: ServerOptions): McpServer {
    const server = new McpServer(
        { name: "xtin-backtest", title: "Xtin Backtest", version: SERVER_VERSION },
        {
            instructions:
                `Backtests NSE trading rules on Xtin's deterministic engine (engine ${ENGINE_VERSION}) with Indian transaction costs. ` +
                `Rules are written as a Strategy Spec v${SPEC_VERSION}; the engine computes every number. ` +
                "Results are hypothetical simulations on historical data, not investment advice. This server cannot place orders.",
        }
    );
    const reportUrl = (path: string) => `${siteUrl.replace(/\/$/, "")}${path}`;

    // ── discovery ───────────────────────────────────────────────────────────

    server.registerTool(
        "search_instruments",
        {
            title: "Search instruments",
            description: "Resolves a company, index or ETF name or ticker to Xtin instrument ids (e.g. NSE:RELIANCE), with the data available per timeframe.",
            inputSchema: { query: z.string().min(1).max(60).describe("Name or ticker, e.g. 'reliance' or 'nifty bank'"), limit: z.number().int().min(1).max(10).optional() },
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async ({ query, limit }) => {
            const found = await api<{ data: { id: string; name: string; segment: string }[] }>("GET", `/instruments?q=${encodeURIComponent(query)}&limit=${limit ?? 5}`);
            const top = found.data.slice(0, 3);
            const coverage = await Promise.all(top.map((i) => api<{ timeframes: Record<string, { from: string }>; note?: string }>("GET", `/instruments/${encodeURIComponent(i.id)}/coverage`)));
            const data = found.data.map((i, n) => ({ ...i, ...(coverage[n] ? { coverage: coverage[n].timeframes, note: coverage[n].note } : {}) }));
            if (!data.length) return ok(`No listed instrument matches "${query}". Any valid NSE ticker can still be backtested as NSE:<TICKER>.`, { data });
            const lines = data.map((i) => `${i.id} — ${i.name} (${i.segment})${"coverage" in i && i.coverage ? `; daily from ${i.coverage["1d"]?.from}, 15m from ${i.coverage["15m"]?.from}` : ""}`);
            return ok(lines.join("\n"), { data });
        })
    );

    server.registerTool(
        "get_strategy_schema",
        {
            title: "Get the strategy spec schema",
            description: `Returns the Strategy Spec v${SPEC_VERSION} JSON Schema, the indicators with their parameters and defaults, and the operators.`,
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async () => {
            const payload = { spec_version: SPEC_VERSION, engine_version: ENGINE_VERSION, indicators: SPEC_INDICATOR_LIST, operators: OPERATORS, json_schema: specJsonSchema() };
            return ok(JSON.stringify(payload), payload);
        })
    );

    server.registerResource(
        "strategy-spec-schema",
        SCHEMA_URI,
        { title: `Strategy Spec v${SPEC_VERSION} JSON Schema`, description: "The rules language every Xtin backtest is written in.", mimeType: "application/schema+json" },
        async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/schema+json", text: JSON.stringify(specJsonSchema()) }] })
    );

    server.registerTool(
        "validate_strategy",
        {
            title: "Validate a strategy",
            description: "Normalises a Strategy Spec without running it: returns the spec with every default filled in, a plain-English summary, warnings, its fingerprint and the credit cost. Spends no credits.",
            inputSchema: { spec: specInput },
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async ({ spec }) => {
            const v = await api<{ valid: boolean; errors: string[]; summary?: string; warnings?: string[]; spec_hash?: string; estimate?: { credits: number; bars: number } }>("POST", "/strategies/validate", { spec });
            if (!v.valid) return { isError: true, content: [{ type: "text", text: `The spec isn't valid:\n${v.errors.map((e) => `- ${e}`).join("\n")}` }], structuredContent: v };
            const text = [`Understood: ${v.summary}`, v.warnings?.length ? `Warnings:\n${v.warnings.map((w) => `- ${w}`).join("\n")}` : null, `Cost: ${v.estimate?.credits ?? 1} credit (about ${v.estimate?.bars ?? "?"} bars).`]
                .filter(Boolean)
                .join("\n");
            return ok(text, v as unknown as Record<string, unknown>);
        })
    );

    // ── runs ────────────────────────────────────────────────────────────────

    registerAppTool(
        server,
        "run_backtest",
        {
            title: "Run a backtest",
            description:
                "Runs a Strategy Spec (or a saved strategy by id) on Xtin's engine and returns the run id, eight headline metrics, the assumptions, warnings and a report link. " +
                "Uses one credit; an identical spec on identical data returns the stored result for free.",
            inputSchema: {
                spec: specInput.optional(),
                strategy_id: uuid.optional().describe("A saved strategy to run instead of an inline spec"),
                version: z.number().int().min(1).optional().describe("A saved strategy's earlier version"),
                period: z.object({ from: day, to: day }).optional().describe("Overrides the spec's test window"),
                capital: z.number().positive().optional().describe("Overrides the starting capital, in rupees"),
            },
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
            _meta: { ui: { resourceUri: REPORT_URI } },
        },
        guard(async (args) => {
            const run = await api<RunSummary>("POST", "/backtests", args);
            const report = reportUrl(run.links.report);
            const text = [
                `${run.name} — ${run.period.from} to ${run.period.to}, ${inr(run.capital)} (run ${run.run_id}${run.cached ? ", stored result — no credit used" : ""})`,
                run.summary ? `Rules: ${run.summary}` : null,
                run.headline ? headlineText(run.headline) : null,
                run.assumptions_line ? `Assumptions: ${run.assumptions_line}` : null,
                run.warnings.length ? `Warnings:\n${run.warnings.map((w) => `- ${w}`).join("\n")}` : null,
                `Full report: ${report}`,
                DISCLAIMER,
            ]
                .filter(Boolean)
                .join("\n");
            return ok(text, { ...run, report_url: report, disclaimer: DISCLAIMER });
        })
    );

    server.registerTool(
        "get_backtest_report",
        {
            title: "Get part of a backtest report",
            description:
                "Returns one part of a stored run: full metrics and assumptions, a page of 20 trades, month-by-month returns, or a downsampled equity or drawdown series.",
            inputSchema: {
                run_id: uuid,
                part: z.enum(["metrics", "trades", "monthly", "equity", "drawdown"]),
                page: z.number().int().min(1).optional().describe("Trade page (20 per page)"),
            },
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async ({ run_id, part, page }) => {
            if (part === "metrics") {
                const r = await api<RunSummary & { metrics: Record<string, unknown>; assumptions: Record<string, unknown> }>("GET", `/backtests/${run_id}`);
                const payload = { run_id, name: r.name, summary: r.summary, metrics: r.metrics, assumptions: r.assumptions, warnings: r.warnings, report_url: reportUrl(r.links.report), disclaimer: DISCLAIMER };
                return ok(JSON.stringify(payload), payload);
            }
            if (part === "trades") {
                const t = await api<{ data: unknown[]; page: number; total: number; has_more: boolean }>("GET", `/backtests/${run_id}/trades?page=${page ?? 1}`);
                return ok(JSON.stringify(t), t as unknown as Record<string, unknown>);
            }
            const s = await api<{ kind: string; data: unknown[] }>("GET", `/backtests/${run_id}/series?kind=${part}&points=300`);
            return ok(JSON.stringify(s), s as unknown as Record<string, unknown>);
        })
    );

    server.registerTool(
        "compare_backtests",
        {
            title: "Compare backtests",
            description: "Side-by-side metrics for 2 to 5 stored runs, and which assumptions (data, engine, costs, fills, sizing) differ between them.",
            inputSchema: { run_ids: z.array(uuid).min(2).max(5) },
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async ({ run_ids }) => {
            const c = await api<{ runs: (RunSummary & { metrics: Record<string, unknown> })[]; differences: string[]; note: string | null }>("POST", "/backtests/compare", { run_ids });
            const lines = c.runs.map((r) => `${r.name} (${r.run_id.slice(0, 8)}): ${r.headline ? headlineText(r.headline) : "no result"}`);
            if (c.note) lines.push(c.note);
            lines.push(DISCLAIMER);
            return ok(lines.join("\n"), c as unknown as Record<string, unknown>);
        })
    );

    // ── saved strategies ────────────────────────────────────────────────────

    server.registerTool(
        "save_strategy",
        {
            title: "Save a strategy",
            description: "Saves a Strategy Spec to the user's Xtin account. With strategy_id it saves the next version of that strategy; earlier versions are kept.",
            inputSchema: { name: z.string().min(1).max(160), spec: specInput, strategy_id: uuid.optional() },
            annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
        },
        guard(async ({ name, spec, strategy_id }) => {
            const s = await api<{ id: string; name: string; version: number; summary: string | null }>("POST", strategy_id ? `/strategies/${strategy_id}/versions` : "/strategies", { name, spec });
            return ok(`Saved "${s.name}" as version ${s.version} (id ${s.id}). ${s.summary ?? ""}`.trim(), s as unknown as Record<string, unknown>);
        })
    );

    server.registerTool(
        "list_strategies",
        {
            title: "List saved strategies",
            description: "Lists the user's saved strategies with their current version and summary, or returns one strategy (spec and version history) by id.",
            inputSchema: { strategy_id: uuid.optional() },
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async ({ strategy_id }) => {
            if (strategy_id) {
                const s = await api<Record<string, unknown>>("GET", `/strategies/${strategy_id}`);
                return ok(JSON.stringify(s), s);
            }
            const list = await api<{ data: { id: string; name: string; version: number; summary: string | null }[] }>("GET", "/strategies");
            const data = list.data.map(({ id, name, version, summary }) => ({ id, name, version, summary }));
            return ok(data.length ? data.map((s) => `${s.name} (v${s.version}, id ${s.id}): ${s.summary ?? "—"}`).join("\n") : "No saved strategies yet.", { data });
        })
    );

    server.registerTool(
        "delete_strategy",
        {
            title: "Delete a saved strategy",
            description: "Permanently deletes a saved strategy and all its versions from the user's Xtin account. Past runs are kept.",
            inputSchema: { strategy_id: uuid },
            annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
        },
        guard(async ({ strategy_id }) => {
            await api("DELETE", `/strategies/${strategy_id}`);
            return ok(`Deleted strategy ${strategy_id}.`, { deleted: strategy_id });
        })
    );

    server.registerTool(
        "get_usage",
        {
            title: "Get usage",
            description: "Returns the user's plan, backtest credits left this period, and what the plan allows (timeframes, history, saved strategies).",
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        guard(async () => {
            const u = await api<{ tier: string; credits_remaining: number | null; credits_limit: number | null; period: string | null; timeframes: string[] | null; history_days: number | null }>("GET", "/usage");
            const text =
                u.tier === "pro"
                    ? "Xtin Pro: unlimited backtests, every timeframe and the full history."
                    : `Free plan: ${u.credits_remaining} of ${u.credits_limit} backtests left this ${u.period}; ${u.timeframes?.join(", ")} candles; last ${u.history_days} days of history. Repeat runs of identical specs are free.`;
            return ok(text, u as unknown as Record<string, unknown>);
        })
    );

    // ── the in-chat report (MCP App) ────────────────────────────────────────

    registerAppResource(
        server,
        "Xtin backtest report",
        REPORT_URI,
        { description: "Interactive report for a backtest run: equity curve, drawdown, monthly returns and the trade log." },
        async () => ({
            contents: [
                {
                    uri: REPORT_URI,
                    mimeType: RESOURCE_MIME_TYPE,
                    text: reportHtml(),
                    // Self-contained: no external scripts, styles or fetches, so no CSP domains are needed.
                    _meta: { ui: { domain: claudeUiDomain(mcpUrl), prefersBorder: true } },
                },
            ],
        })
    );

    return server;
}
