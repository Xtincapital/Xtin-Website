// The quant report: hero result, plain-words verdict, tabbed charts,
// analytics and the trade log. Shared by the Playground and saved runs.
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Braces, Info, Lightbulb, ListOrdered } from "lucide-react";
import TimeSeriesChart from "./TimeSeriesChart";
import CandleChart from "./CandleChart";
import { ExitMix, MonthlyHeatmap, PnlDistribution } from "./AnalyticsCards";
import ProLock from "./ProLock";
import ProBadge from "./ProBadge";
import { usePlan } from "../lib/usePlan";
import { drawdownSeries, REASON_LABEL, strategySentence } from "../lib/analytics";
import { card, chip, muted } from "../lib/styles";
import { shortTime } from "../lib/time";
import { inr, type Assumptions, type BacktestResult, type Metrics } from "../lib/types";
import { formatFromInr } from "@/lib/region";
import { useCurrency } from "@/contexts/CurrencyContext";

const sharpeLabel = (s: number) => (s < 0 ? "Negative" : s < 1 ? "Weak" : s < 2 ? "Decent" : s < 3 ? "Strong" : "Exceptional");
const signed = (n: number, digits = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(digits)}`;
const compactInr = (v: number) => formatFromInr(v, { compact: true });

function WinRing({ rate }: { rate: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" title="Share of trades that made money">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-slate-100 dark:stroke-white/10" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" strokeLinecap="round" stroke="url(#bt-ring)" strokeDasharray={`${(Math.min(100, rate) / 100) * c} ${c}`} />
        <defs>
          <linearGradient id="bt-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#2A8C9A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="xt-metric">{rate.toFixed(0)}%</span>
        <span className={`text-xs uppercase tracking-wider ${muted}`}>win rate</span>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone, help }: { label: string; value: string; sub?: string; tone?: "pos" | "neg"; help: string }) {
  const color = tone === "pos" ? "text-brand dark:text-brand" : tone === "neg" ? "text-rose-600 dark:text-rose-400" : "";
  return (
    <div className="rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-white/[0.04]" title={help}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>{label}</div>
      <div className={`mt-0.5 text-lg font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className={`text-xs ${muted}`}>{sub}</div>}
    </div>
  );
}

function Hero({ m, title, subtitle, sentence, actions }: { m: Metrics; title: string; subtitle: string; sentence?: string; actions?: React.ReactNode }) {
  const up = m.total_pnl >= 0;
  return (
    <div className={`${card} relative overflow-hidden`}>
      <div aria-hidden className={`absolute inset-x-0 top-0 h-1 ${up ? "bg-brand-fill" : "bg-gradient-to-r from-rose-400 via-orange-400 to-rose-600"}`} />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${muted}`}>Backtest report</div>
            <h3 className="mt-1 truncate text-xl font-semibold tracking-tight">{title}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className={chip}>{subtitle}</span>
            </div>
          </div>
          {actions}
        </div>
        {sentence && <p className={`mt-3 text-sm leading-relaxed ${muted}`}>{sentence}</p>}

        <div className="mt-5 grid gap-5 2xl:grid-cols-[auto_1fr] 2xl:items-center">
          <div className="flex items-center gap-5">
            <div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${up ? "bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand" : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
                {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {m.wiped_out ? "Account wiped out" : up ? "Profitable" : "Lost money"}
              </span>
              <div className={`mt-1 text-5xl font-extrabold tracking-tight tabular-nums ${up ? "text-brand dark:text-brand" : "text-rose-600 dark:text-rose-400"}`}>{signed(m.total_return_pct)}%</div>
              <div className={`mt-1 text-sm tabular-nums ${muted}`}>
                {compactInr(m.starting_capital)} → <span className="font-semibold text-slate-800 dark:text-slate-100">{compactInr(m.final_equity)}</span>{" "}
                <span className="whitespace-nowrap">· {up ? "+" : ""}{inr(m.total_pnl)}</span>
              </div>
            </div>
            <WinRing rate={m.win_rate} />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Kpi label="Sharpe" value={m.sharpe.toFixed(2)} sub={sharpeLabel(m.sharpe)} help="Return earned per unit of risk. Above 1 is decent, above 2 is very good." />
            <Kpi label="Max drawdown" value={`−${Math.abs(m.max_drawdown_pct).toFixed(1)}%`} sub="worst dip from a peak" tone="neg" help="The worst peak-to-bottom fall along the way." />
            <Kpi label="Profit factor" value={m.profit_factor.toFixed(2)} sub={m.profit_factor >= 1 ? "wins outweigh losses" : "losses outweigh wins"} help="Money won ÷ money lost." />
            <Kpi label="Trades" value={`${m.num_trades}`} sub={`${m.wins} won · ${m.losses} lost`} help="How many times the strategy entered and exited." />
          </div>
        </div>
      </div>
    </div>
  );
}

const DISCLAIMER = "Hypothetical backtest on historical data. Not investment advice. Past results do not predict future results.";

/** Synthetic or index data is called out before any number is read. */
function DataBanner({ a }: { a?: Assumptions }) {
  if (!a?.synthetic && !a?.theoretical_index) return null;
  return (
    <div role="note" className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-900 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        {a.synthetic ? (
          <>
            <span className="font-semibold">Synthetic data — not market results.</span> SAMPLE is a generated demo series, not real prices. Pick a real symbol to see how the rule did on actual history.
          </>
        ) : (
          <>
            <span className="font-semibold">Theoretical index backtest.</span> An index can't be bought directly. For a tradable version, run the rule on the index's ETF (e.g. NIFTYBEES for NIFTY).
          </>
        )}
      </p>
    </div>
  );
}

/** Every assumption behind the numbers, beside them — or a clear note for runs made before engine 2.0. */
function AssumptionsStrip({ a }: { a?: Assumptions }) {
  const parts = a
    ? [
        a.fill === "next_bar_open" ? "Signals on a bar's close fill at the next bar's open" : "Fills on the signal bar's close",
        a.product === "CNC" ? "delivery (cash only)" : "intraday (MIS)",
        a.sizing,
        a.cost_profile ? `Zerodha charges + ${a.slippage_bps} bps slippage per side` : "before costs",
        a.data_source === "synthetic" ? "synthetic data" : a.data_source === "yahoo" ? "data: Yahoo Finance" : "",
        a.data_lag_days ? `prices at least ${a.data_lag_days} days old` : "",
        a.risk_free_pct ? `risk-free rate ${a.risk_free_pct}%` : "",
        `engine ${a.engine_version}`,
        a.spec_hash ? `fingerprint ${a.spec_hash.slice(0, 8)}` : "",
        a.data_version ? `data version ${a.data_version.split(":").pop()?.slice(0, 8)}` : "",
      ].filter(Boolean)
    : ["Older run (engine 1.x): filled on the signal bar's close with no charges — re-run it for current assumptions"];
  return (
    <div className={`flex gap-2.5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed dark:bg-white/[0.04] ${muted}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold text-slate-700 dark:text-slate-200">Assumptions: </span>
        {parts.join(" · ")}.<br />
        {DISCLAIMER}
      </p>
    </div>
  );
}

const pctOrDash = (v: number | null | undefined, digits = 1) => (v === null || v === undefined ? "—" : `${signed(v, digits)}%`);
const numOrDash = (v: number | null | undefined) => (v === null || v === undefined ? "—" : v.toFixed(2));

/** The rest of the standard statistics (engine 2.1+ results). A dash means the figure can't be stated honestly. */
function StatsGrid({ m }: { m: Metrics }) {
  if (m.cagr_pct === undefined) return null;
  const b = m.benchmark;
  const beat = b ? m.total_return_pct - b.total_return_pct : null;
  const stats: { label: string; value: string; sub?: string; tone?: "pos" | "neg"; help: string }[] = [
    { label: "CAGR", value: pctOrDash(m.cagr_pct), sub: m.cagr_pct === null ? "window under 30 days" : "per year, compounded", help: "Compound annual growth rate of the account. Not shown for windows under 30 days." },
    { label: "Sortino", value: numOrDash(m.sortino), sub: "return per unit of downside", help: "Like Sharpe, but only counts the bars that lost money as risk." },
    { label: "Calmar", value: numOrDash(m.calmar), sub: "CAGR ÷ max drawdown", help: "Yearly growth earned per point of the worst drawdown." },
    { label: "Expectancy", value: m.expectancy === undefined ? "—" : inr(m.expectancy), sub: "average net P&L per trade", tone: (m.expectancy ?? 0) >= 0 ? "pos" : "neg", help: "Total net profit divided by the number of trades, after charges." },
    { label: "Time in market", value: m.exposure_pct === null || m.exposure_pct === undefined ? "—" : `${m.exposure_pct.toFixed(0)}%`, sub: "bars holding a position", help: "Share of bars that ended with a position open." },
    {
      label: "Longest drawdown",
      value: m.max_drawdown_duration_days !== null && m.max_drawdown_duration_days !== undefined ? `${m.max_drawdown_duration_days} days` : `${m.max_drawdown_duration_bars ?? 0} bars`,
      sub: "from a peak until it was regained",
      help: "The longest stretch the account spent below a previous high.",
    },
    { label: "Charges paid", value: inr(m.total_costs ?? 0), sub: "brokerage, taxes and fees", help: "Every charge across all fills: brokerage, STT, exchange fee, SEBI fee, stamp duty, GST and DP charges." },
    b
      ? { label: "vs buy & hold", value: `${signed(beat ?? 0, 1)} pts`, sub: `holding returned ${signed(b.total_return_pct, 1)}%`, tone: (beat ?? 0) >= 0 ? "pos" : "neg", help: "This strategy's return minus simply buying at the first open and holding to the last close (before costs)." }
      : { label: "vs buy & hold", value: "—", help: "Benchmark comparison is off for this run." },
  ];
  return (
    <div className={`${card} p-4 sm:p-5`}>
      <h4 className="mb-3 text-base font-semibold">More statistics</h4>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <Kpi key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}

function PlainWords({ m }: { m: Metrics }) {
  const made = m.total_pnl >= 0;
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 text-sm leading-relaxed text-slate-700 dark:border-amber-400/20 dark:from-amber-500/10 dark:to-transparent dark:text-slate-300">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <p>
        <span className="font-semibold text-slate-900 dark:text-white">In plain words: </span>
        this strategy would have {made ? "made" : "lost"} <span className={`font-semibold ${made ? "text-brand dark:text-brand" : "text-rose-600 dark:text-rose-400"}`}>{inr(Math.abs(m.total_pnl))}</span> (
        {signed(m.total_return_pct, 1)}%){m.total_costs ? <>, after {inr(m.total_costs)} in charges</> : null}. It traded {m.num_trades} times and won {m.win_rate.toFixed(0)}% of them. The worst dip from a high point was {Math.abs(m.max_drawdown_pct).toFixed(1)}% — ask yourself
        honestly if you'd have held on through that. Past results never guarantee the future.
      </p>
    </div>
  );
}

type ChartTab = "equity" | "drawdown" | "price";

// Module-level so the charts don't re-create on every parent re-render.
const fmtRupees = (v: number) => formatFromInr(v, { maxDecimals: 0 });
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

function ChartPanel({ result, showTrades, analyticsLocked }: { result: BacktestResult; showTrades: boolean; analyticsLocked: boolean }) {
  const [tab, setTab] = useState<ChartTab>("equity");
  const dd = useMemo(() => drawdownSeries(result.equity_curve), [result.equity_curve]);
  const tabs: { id: ChartTab; label: string }[] = [
    { id: "equity", label: "Equity" },
    { id: "drawdown", label: "Drawdown" },
    ...(result.candles?.length ? [{ id: "price" as const, label: showTrades ? "Price & trades" : "Price" }] : []),
  ];
  return (
    <div className={`${card} p-4 sm:p-5`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tab === t.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : `${muted} hover:text-slate-900 dark:hover:text-white`}`}
            >
              <span className="inline-flex items-center gap-1.5">
                {t.label}
                {t.id === "drawdown" && analyticsLocked && <ProBadge />}
              </span>
            </button>
          ))}
        </div>
        <span className={`text-xs ${muted}`}>
          {tab === "equity" && "Account value after every bar · dashed line = starting capital"}
          {tab === "drawdown" && "How far below its previous peak the account was"}
          {tab === "price" && (showTrades ? "▲ entries · ● exits (green = profit)" : "Underlying price")}
        </span>
      </div>
      {tab === "equity" && <TimeSeriesChart data={result.equity_curve} baseline={result.metrics.starting_capital} format={fmtRupees} />}
      {tab === "drawdown" && (
        <ProLock locked={analyticsLocked} title="Drawdown chart" text="See exactly how deep and how long every losing stretch was.">
          <TimeSeriesChart data={dd} tone="rose" format={fmtPct} />
        </ProLock>
      )}
      {tab === "price" && <CandleChart candles={result.candles} trades={result.trades} showTrades={showTrades} height={300} />}
    </div>
  );
}

const MAX_ROWS = 250;

function TradeLog({ result }: { result: BacktestResult }) {
  const rows = result.trades.slice(0, MAX_ROWS);
  // Daily bars all carry the same clock time — showing it is noise.
  const dateOnly = new Set(result.trades.flatMap((t) => [t.entry_time.slice(11, 16), t.exit_time.slice(11, 16)])).size <= 1;
  return (
    <div className={card}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-white/5">
        <h4 className="flex items-center gap-2 text-base font-semibold">
          <ListOrdered className="h-4 w-4 text-brand dark:text-brand" /> Trade log
        </h4>
        <span className={`text-xs ${muted}`}>{result.trades.length > MAX_ROWS ? `First ${MAX_ROWS} of ${result.trades.length}` : `${result.trades.length} trades`}</span>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className={`sticky top-0 z-10 bg-white/95 text-xs uppercase tracking-wider backdrop-blur dark:bg-slate-900/95 ${muted}`}>
            <tr>
              <th className="px-5 py-2.5 font-semibold">#</th>
              <th className="px-3 py-2.5 font-semibold">Side</th>
              <th className="px-3 py-2.5 font-semibold">Entry</th>
              <th className="px-3 py-2.5 font-semibold">Exit</th>
              <th className="px-3 py-2.5 font-semibold">Reason</th>
              <th className="px-5 py-2.5 text-right font-semibold">P&L</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((t, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                <td className={`px-5 py-2.5 ${muted}`}>{i + 1}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${t.side === "BUY" ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"}`}>{t.side}</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-medium">{t.entry_price.toFixed(2)}</div>
                  <div className={`text-xs ${muted}`}>{shortTime(t.entry_time, dateOnly)}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-medium">{t.exit_price.toFixed(2)}</div>
                  <div className={`text-xs ${muted}`}>{shortTime(t.exit_time, dateOnly)}</div>
                </td>
                <td className={`px-3 py-2.5 text-xs ${muted}`}>{REASON_LABEL[t.reason] ?? t.reason}</td>
                <td className={`px-5 py-2.5 text-right font-semibold ${t.pnl >= 0 ? "text-brand dark:text-brand" : "text-rose-600 dark:text-rose-400"}`}>
                  {signed(t.pnl)}
                  <div className="text-xs font-normal opacity-80">
                    {signed(t.pnl_pct)}%{t.costs ? ` · ${inr(t.costs)} charges` : ""}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className={`px-5 py-8 text-center text-sm ${muted}`}>No trades in this window — try loosening the entry rule or a longer date range.</p>}
      </div>
    </div>
  );
}

export default function Report({
  result,
  title,
  subtitle,
  definition,
  sentence,
  actions,
}: {
  result: BacktestResult;
  title: string;
  subtitle: string;
  definition?: unknown;
  /** The server's plain-English summary of a Strategy Spec; preferred over describing a legacy definition here. */
  sentence?: string;
  actions?: React.ReactNode;
}) {
  useCurrency(); // re-render when the visitor switches currency (amounts are kept in rupees)
  const isOptions = (definition as { kind?: string } | undefined)?.kind === "options";
  const isSpec = Boolean(definition && typeof definition === "object" && "spec_version" in definition);
  const analyticsLocked = usePlan().locked("advanced_analytics");
  return (
    <motion.div key={title + subtitle + result.metrics.final_equity} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-4">
      <DataBanner a={result.assumptions} />
      <Hero m={result.metrics} title={title} subtitle={subtitle} sentence={sentence ?? (definition && !isSpec ? strategySentence(definition) : undefined)} actions={actions} />
      <AssumptionsStrip a={result.assumptions} />
      <PlainWords m={result.metrics} />
      <StatsGrid m={result.metrics} />
      <ChartPanel result={result} showTrades={!isOptions} analyticsLocked={analyticsLocked} />
      <ProLock locked={analyticsLocked} title="Advanced analytics" text="Monthly returns heatmap, trade-outcome spread, exit breakdown and streaks — all in Pro.">
        <div className="space-y-4">
          <MonthlyHeatmap result={result} />
          <div className="grid gap-4 md:grid-cols-2">
            <PnlDistribution result={result} />
            <ExitMix result={result} />
          </div>
        </div>
      </ProLock>
      <TradeLog result={result} />
      {definition !== undefined && (
        <details className={`${card} group`}>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 text-sm font-semibold">
            <Braces className="h-4 w-4 text-brand dark:text-brand" /> {isSpec ? "Strategy spec (JSON)" : "Strategy definition (JSON)"}
          </summary>
          <pre className="max-h-72 overflow-auto border-t border-slate-100 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-300">{JSON.stringify(definition, null, 2)}</pre>
        </details>
      )}
    </motion.div>
  );
}
