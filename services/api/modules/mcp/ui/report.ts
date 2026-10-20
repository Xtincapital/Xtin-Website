/// <reference lib="dom" />
// The in-chat backtest report (an MCP App view). Built into report.html by
// `npm run build:mcp-ui` (scripts/build-mcp-ui.ts) — one self-contained file:
// no external scripts, styles, fonts or fetches. Data arrives from the host:
// the run_backtest result, then get_backtest_report calls through the host.
import { App, applyDocumentTheme } from "@modelcontextprotocol/ext-apps";

type Headline = { total_return_pct: number; cagr_pct: number | null; max_drawdown_pct: number; sharpe: number; win_rate: number; num_trades: number; profit_factor: number; total_costs: number };
type Run = {
    run_id: string;
    cached: boolean;
    name: string;
    period: { from: string; to: string };
    capital: number;
    summary: string | null;
    headline: Headline | null;
    assumptions_line: string | null;
    warnings: string[];
    report_url?: string;
    disclaimer?: string;
};
type Point = { time: string; value: number };
type Trade = { side: string; qty: number; entry_time: string; entry_price: number; exit_time: string; exit_price: number; pnl: number; pnl_pct: number; costs?: number; reason: string };

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const el = (tag: string, cls?: string, text?: string) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text; // always text — names and warnings are user data
    return e;
};
const signed = (n: number, d = 1) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}`;
const inr = (n: number) => `${n < 0 ? "−" : ""}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
const REASON: Record<string, string> = { stop_loss: "Stop-loss", trailing_sl: "Trailing stop", target: "Target", signal: "Exit signal", square_off: "Square-off", end_of_data: "End of data", time_exit: "Time exit", liquidated: "Liquidated" };

const app = new App({ name: "Xtin backtest report", version: "1.0.0" }, {}, { autoResize: true });
let run: Run | null = null;
let tradePage = 1;
let series: { equity: Point[]; drawdown: Point[] } = { equity: [], drawdown: [] };
let chartKind: "equity" | "drawdown" = "equity";

function setTheme(theme: "light" | "dark" | undefined) {
    if (!theme) return;
    applyDocumentTheme(theme);
    document.documentElement.dataset.theme = theme;
}

async function part<T>(name: string, extra: Record<string, unknown> = {}): Promise<T | null> {
    if (!run) return null;
    try {
        const res = await app.callServerTool({ name: "get_backtest_report", arguments: { run_id: run.run_id, part: name, ...extra } });
        return res.isError ? null : (res.structuredContent as T);
    } catch {
        return null;
    }
}

function renderHeader(r: Run) {
    $("title").textContent = r.name;
    $("subtitle").textContent = `${r.period.from} → ${r.period.to} · ${inr(r.capital)}${r.cached ? " · stored result" : ""}`;
    $("rules").textContent = r.summary ?? "";
    const kpis = $("kpis");
    kpis.replaceChildren();
    const h = r.headline;
    if (!h) return;
    const tiles: [string, string, string?][] = [
        ["Return", `${signed(h.total_return_pct)}%`, h.total_return_pct >= 0 ? "pos" : "neg"],
        ["CAGR", h.cagr_pct === null ? "—" : `${signed(h.cagr_pct)}%`],
        ["Max drawdown", `−${Math.abs(h.max_drawdown_pct).toFixed(1)}%`, "neg"],
        ["Sharpe", h.sharpe.toFixed(2)],
        ["Win rate", `${h.win_rate.toFixed(0)}%`],
        ["Trades", String(h.num_trades)],
        ["Profit factor", h.profit_factor.toFixed(2)],
        ["Charges", inr(h.total_costs)],
    ];
    for (const [label, value, tone] of tiles) {
        const t = el("div", "kpi");
        t.append(el("div", "kpi-label", label), el("div", `kpi-value ${tone ?? ""}`, value));
        kpis.append(t);
    }
    $("assumptions").textContent = r.assumptions_line ? `Assumptions: ${r.assumptions_line}` : "";
    const warn = $("warnings");
    warn.replaceChildren(...r.warnings.map((w) => el("li", "", w)));
    $("disclaimer").textContent = r.disclaimer ?? "Hypothetical backtest on historical data. Not investment advice. Past results do not predict future results.";
    ($("open") as HTMLButtonElement).hidden = !r.report_url;
}

const SVG = "http://www.w3.org/2000/svg";
function renderChart() {
    const box = $("chart");
    box.replaceChildren();
    const pts = series[chartKind];
    document.querySelectorAll<HTMLButtonElement>(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.kind === chartKind)));
    if (pts.length < 2) {
        box.append(el("p", "muted", "Loading chart…"));
        return;
    }
    const W = 640;
    const H = 200;
    const vals = pts.map((p) => p.value);
    const min = Math.min(...vals);
    let max = Math.max(...vals);
    if (chartKind === "drawdown") max = 0;
    if (max === min) max = min + 1;
    const x = (i: number) => (i / (pts.length - 1)) * W;
    const y = (v: number) => H - ((v - min) / (max - min)) * (H - 8) - 4;
    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", chartKind === "equity" ? "Account value over time" : "Drawdown from the previous peak over time");
    const area = document.createElementNS(SVG, "path");
    area.setAttribute("d", `${line}L${W},${chartKind === "drawdown" ? y(0) : H}L0,${chartKind === "drawdown" ? y(0) : H}Z`);
    area.setAttribute("class", chartKind === "equity" ? "area-pos" : "area-neg");
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", line);
    path.setAttribute("class", chartKind === "equity" ? "line-pos" : "line-neg");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.append(area, path);
    if (chartKind === "equity" && run) {
        const base = document.createElementNS(SVG, "line");
        const by = y(run.capital);
        base.setAttribute("x1", "0");
        base.setAttribute("x2", String(W));
        base.setAttribute("y1", String(by));
        base.setAttribute("y2", String(by));
        base.setAttribute("class", "baseline");
        base.setAttribute("vector-effect", "non-scaling-stroke");
        svg.append(base);
    }
    const fmt = (v: number) => (chartKind === "equity" ? inr(v) : `${v.toFixed(1)}%`);
    const axis = el("div", "axis");
    axis.append(el("span", "", pts[0].time.slice(0, 10)), el("span", "", `${fmt(min)} – ${fmt(max)}`), el("span", "", pts[pts.length - 1].time.slice(0, 10)));
    box.append(svg, axis);
}

function renderMonthly(rows: { month: string; return_pct: number }[]) {
    const box = $("monthly");
    box.replaceChildren();
    if (!rows.length) return;
    const years = [...new Set(rows.map((r) => r.month.slice(0, 4)))];
    const byMonth = new Map(rows.map((r) => [r.month, r.return_pct]));
    const table = el("table", "heat");
    const head = el("tr");
    head.append(el("th", "", ""), ...["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m) => el("th", "", m)));
    table.append(head);
    const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.return_pct)));
    for (const yr of years) {
        const tr = el("tr");
        tr.append(el("th", "", yr));
        for (let m = 1; m <= 12; m++) {
            const v = byMonth.get(`${yr}-${String(m).padStart(2, "0")}`);
            // A flat month (no position, or no change) stays neutral rather than green.
            const td = el("td", v === undefined ? "empty" : v > 0 ? "up" : v < 0 ? "down" : "flat", v === undefined ? "" : v.toFixed(1));
            if (v) td.style.setProperty("--a", String(0.15 + 0.7 * Math.min(1, Math.abs(v) / maxAbs)));
            td.title = v === undefined ? "" : `${yr}-${m}: ${signed(v)}%`;
            tr.append(td);
        }
        table.append(tr);
    }
    box.append(table);
}

async function loadTrades() {
    const data = await part<{ data: Trade[]; page: number; total: number; has_more: boolean }>("trades", { page: tradePage });
    const body = $("trades");
    body.replaceChildren();
    if (!data) return;
    for (const t of data.data) {
        const tr = el("tr");
        tr.append(
            el("td", "", t.side),
            el("td", "", `${t.entry_time.slice(0, 10)} @ ${t.entry_price.toFixed(2)}`),
            el("td", "", `${t.exit_time.slice(0, 10)} @ ${t.exit_price.toFixed(2)}`),
            el("td", "muted", REASON[t.reason] ?? t.reason),
            el("td", `num ${t.pnl >= 0 ? "pos" : "neg"}`, `${inr(t.pnl)} (${signed(t.pnl_pct)}%)`)
        );
        body.append(tr);
    }
    $("page").textContent = data.total ? `Trades ${(data.page - 1) * 20 + 1}–${(data.page - 1) * 20 + data.data.length} of ${data.total}` : "No trades";
    ($("prev") as HTMLButtonElement).disabled = data.page <= 1;
    ($("next") as HTMLButtonElement).disabled = !data.has_more;
}

async function loadAll() {
    const [eq, dd, monthly] = await Promise.all([part<{ data: Point[] }>("equity"), part<{ data: Point[] }>("drawdown"), part<{ data: { month: string; return_pct: number }[] }>("monthly")]);
    series = { equity: eq?.data ?? [], drawdown: dd?.data ?? [] };
    renderChart();
    renderMonthly(monthly?.data ?? []);
    await loadTrades();
}

app.ontoolresult = (params) => {
    const r = params.structuredContent as Run | undefined;
    if (!r?.run_id) {
        $("title").textContent = "This backtest didn't run";
        const text = params.content?.find((c) => c.type === "text");
        $("rules").textContent = text && "text" in text ? String(text.text) : "";
        return;
    }
    run = r;
    tradePage = 1;
    renderHeader(r);
    void loadAll();
};
app.onhostcontextchanged = (ctx) => setTheme(ctx.theme);

document.querySelectorAll<HTMLButtonElement>(".tab").forEach((b) =>
    b.addEventListener("click", () => {
        chartKind = b.dataset.kind as "equity" | "drawdown";
        renderChart();
    })
);
$("prev").addEventListener("click", () => {
    tradePage = Math.max(1, tradePage - 1);
    void loadTrades();
});
$("next").addEventListener("click", () => {
    tradePage += 1;
    void loadTrades();
});
$("open").addEventListener("click", () => {
    if (run?.report_url) void app.openLink({ url: run.report_url });
});

void app.connect().then(() => setTheme(app.getHostContext()?.theme));
