import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CalendarDays,
  Crown,
  Gauge,
  Layers,
  LineChart,
  ListOrdered,
  Save,
  SendHorizontal,
  Shield,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import Report from "../components/Report";
import ProBadge from "../components/ProBadge";
import { ApiError, backtestApi } from "../lib/api";
import { v1 } from "../lib/v1";
import MoneyInput from "@/components/MoneyInput";
import { usePlan } from "../lib/usePlan";
import { showProRequired, useProDialog } from "../lib/proDialog";
import { btnSecondary, card, muted } from "../lib/styles";
import type { BacktestResult } from "../lib/types";

interface Message {
  role: "user" | "assistant";
  text: string;
  interpretation?: string;
  warnings?: string[];
  suggestions?: string[];
  paywall?: boolean;
  ok?: boolean;
}

type Risk = "conservative" | "balanced" | "aggressive";

const EXAMPLES = [
  { icon: Activity, tag: "Mean reversion", text: "Buy RELIANCE when RSI drops below 30 and sell above 70, 2% stop-loss" },
  { icon: TrendingUp, tag: "Trend", text: "Golden cross: buy when 50 EMA crosses above 200 EMA on NIFTY, daily" },
  { icon: Shield, tag: "Options income", text: "Short a NIFTY straddle with a 20% stop-loss", pro: true },
  { icon: Layers, tag: "Defined risk", text: "Backtest an iron condor on BANKNIFTY, daily", pro: true },
  { icon: BarChart3, tag: "Volatility", text: "Buy RELIANCE when price closes below the lower Bollinger band" },
  { icon: Zap, tag: "Momentum", text: "Buy TCS when MACD crosses above zero, 3% trailing stop" },
];

const RISKS: { id: Risk; label: string }[] = [
  { id: "conservative", label: "Careful" },
  { id: "balanced", label: "Balanced" },
  { id: "aggressive", label: "Aggressive" },
];

const RISK_KEY = "xtin_bt_risk";
const readRisk = (): Risk => {
  try {
    const v = localStorage.getItem(RISK_KEY);
    if (v === "conservative" || v === "balanced" || v === "aggressive") return v;
  } catch {
    /* storage unavailable */
  }
  return "balanced";
};

// tiny **bold** renderer so the assistant's markdown reads nicely
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-semibold text-slate-900 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </span>
      ))}
    </>
  );
}

function Avatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-md shadow-brand/20 bg-brand-fill">
      <Bot className="h-4 w-4 text-white" />
    </span>
  );
}

function Thinking() {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-white/5">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-fill" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
            ))}
          </span>
          Reading your rule and replaying the market…
        </div>
      </div>
    </div>
  );
}

function ReportPlaceholder({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Running backtest">
        {[176, 64, 300].map((h, i) => (
          <div key={i} className={`${card} animate-pulse`} style={{ height: h }}>
            <div className="h-full rounded-2xl bg-gradient-to-r from-transparent via-slate-100/80 to-transparent dark:via-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }
  const items = [
    { icon: Gauge, text: "Return, Sharpe, drawdown & win rate" },
    { icon: LineChart, text: "Equity, drawdown and price charts" },
    { icon: CalendarDays, text: "Month-by-month returns heatmap" },
    { icon: ListOrdered, text: "Every trade, with why it exited" },
  ];
  return (
    <div className={`${card} relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden p-8 text-center`}>
      <svg aria-hidden viewBox="0 0 600 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full opacity-60">
        <defs>
          <linearGradient id="bt-ph" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 160 L40 150 L80 156 L120 130 L160 138 L200 110 L240 118 L280 92 L320 100 L360 76 L400 84 L440 58 L480 66 L520 40 L560 46 L600 24 L600 200 L0 200 Z" fill="url(#bt-ph)" />
        <path d="M0 160 L40 150 L80 156 L120 130 L160 138 L200 110 L240 118 L280 92 L320 100 L360 76 L400 84 L440 58 L480 66 L520 40 L560 46 L600 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeDasharray="6 6" />
      </svg>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-brand-line dark:ring-brand-line bg-brand-soft">
        <Wand2 className="h-6 w-6 text-brand dark:text-brand" />
      </span>
      <h2 className="relative mt-5 text-xl font-semibold tracking-tight">Your quant report lands here</h2>
      <p className={`relative mt-2 max-w-sm text-sm ${muted}`}>Describe a trading idea on the left. In about a second you'll know how it would have done on real history.</p>
      <ul className="relative mt-6 grid gap-2.5 text-left text-sm sm:grid-cols-2">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <Icon className="h-4 w-4 shrink-0 text-brand dark:text-brand" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Playground() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { locked, loaded, isPro, historyDays } = usePlan();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! Describe a trading rule in plain English — entries, exits, stops, any NSE stock or index — and I'll backtest it on historical data. No code needed.",
    },
  ]);
  const [input, setInput] = useState("");
  const [capital, setCapital] = useState(100000);
  const [symbol, setSymbol] = useState("");
  const [risk, setRisk] = useState<Risk>(readRisk);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<{ result: BacktestResult; name: string; window: string; definition: unknown } | null>(null);
  // Rules waiting on an answer ("which stock?") — the reply re-targets these, not the last report's.
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(RISK_KEY, risk);
    } catch {
      /* storage unavailable */
    }
  }, [risk]);

  // Follow the conversation once it starts (the fresh state keeps the greeting in view).
  useEffect(() => {
    if (messages.length > 1) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Deep link: /backtest/app?prompt=... auto-runs once.
  useEffect(() => {
    const p = searchParams.get("prompt") || searchParams.get("q");
    if (p && !didInit.current) {
      didInit.current = true;
      void send(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setLoading(true);
    try {
      // Conversation context: prior turns + the last strategy, so
      // "tighten the stop and re-run" mutates instead of restarting.
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.text.slice(0, 1200) }));
      const data = await backtestApi.chat({
        message,
        starting_capital: capital > 0 ? capital : 100000,
        symbol: symbol.trim() || undefined,
        history,
        prev_definition: draft ?? (report?.definition as Record<string, unknown> | undefined) ?? undefined,
        profile: { risk, capital: capital > 0 ? capital : 100000 },
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply, interpretation: data.interpretation, warnings: data.warnings, suggestions: data.suggestions, paywall: data.paywall, ok: data.ok },
      ]);
      if (data.paywall) {
        // Hard Pro wall (monthly limit or options) — explain it in a popup too.
        useProDialog.getState().show(data.error === "quota_exceeded" ? "quota" : "options", data.error === "quota_exceeded" ? data.reply : "");
      } else if (data.ok && data.locked?.length) {
        // It ran, but on the free version of what was asked — say so up front.
        const what = data.locked.includes("intraday") ? "Ran on daily candles — intraday candles are a Pro feature." : "Tested the last 2 years — older history is a Pro feature.";
        toast.warning(what, { action: { label: "See Pro", onClick: () => navigate("/backtest/app/upgrade") } });
      }
      if (data.ok && data.result) {
        setReport({ result: data.result, name: data.strategy_name, window: `${data.start_date} → ${data.end_date}`, definition: data.definition });
      }
      if (data.error === "symbol_required") setDraft(data.definition as Record<string, unknown>);
      else if (data.ok) setDraft(null);
      void qc.invalidateQueries({ queryKey: ["bt-plan"] });
    } catch (err) {
      const text =
        err instanceof ApiError && err.status === 429
          ? `⏳ ${err.message}`
          : err instanceof ApiError && err.status === 400
            ? `That didn't work: ${err.message}`
            : err instanceof ApiError && err.code === "not_migrated"
            ? "Backtest is being set up on our side — please try again shortly."
            : "Couldn't reach the backtest engine. Please check your connection and try again.";
      setMessages((m) => [...m, { role: "assistant", text }]);
    } finally {
      setLoading(false);
    }
  }

  const isOptions = (report?.definition as { kind?: string } | undefined)?.kind === "options";

  async function saveStrategy() {
    if (!report || isOptions) return;
    setSaving(true);
    try {
      await v1.createStrategy({ name: report.name, definition: report.definition });
      void qc.invalidateQueries({ queryKey: ["bt-strategies"] });
      toast.success("Saved to your strategies", { action: { label: "View", onClick: () => (window.location.href = "/backtest/app/strategies") } });
    } catch (err) {
      if (!showProRequired(err)) toast.error(err instanceof Error ? err.message : "Couldn't save the strategy");
    } finally {
      setSaving(false);
    }
  }

  const fresh = messages.length <= 1;

  return (
    <BacktestLayout wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        {/* ── console ─────────────────────────────────────────── */}
        <section className={`${card} flex h-[calc(100vh-15rem)] min-h-[560px] flex-col overflow-hidden lg:sticky lg:top-24`} aria-label="Strategy copilot">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <Avatar />
              <div>
                <div className="text-sm font-semibold">Strategy copilot</div>
                <div className={`text-xs ${muted}`}>Plain English in, quant report out</div>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${loading ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${loading ? "animate-pulse bg-amber-500" : "bg-brand-fill"}`} />
              {loading ? "Running" : "Ready"}
            </span>
          </div>

          {/* settings */}
          <div className="grid grid-cols-2 items-end gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:grid-cols-[1fr_auto_auto] dark:border-white/5 dark:bg-white/[0.02]">
            <div className="col-span-2 sm:col-span-1">
              <div className={`mb-1 text-xs font-semibold uppercase tracking-wider ${muted}`}>Risk profile</div>
              <div className="flex rounded-lg bg-slate-200/60 p-0.5 dark:bg-white/5" role="radiogroup" aria-label="Risk profile">
                {RISKS.map((r) => (
                  <button
                    key={r.id}
                    role="radio"
                    aria-checked={risk === r.id}
                    onClick={() => setRisk(r.id)}
                    title="Tunes the default stop-loss, target and position size"
                    className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold transition ${risk === r.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : `${muted} hover:text-slate-900 dark:hover:text-white`}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <span className={`mb-1 block text-xs font-semibold uppercase tracking-wider ${muted}`}>Symbol</span>
              <input
                value={symbol}
                placeholder="Auto"
                maxLength={20}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase sm:w-20 text-slate-900 outline-none placeholder:font-normal placeholder:normal-case focus:border-brand dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>
            <label>
              <span className={`mb-1 block text-xs font-semibold uppercase tracking-wider ${muted}`}>Capital</span>
              <div className="sm:w-28">
                <MoneyInput
                  value={capital}
                  min={1000}
                  decimals={0}
                  aria-label="Starting capital"
                  onChange={(e) => setCapital(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold tabular-nums text-slate-900 outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                />
              </div>
            </label>
          </div>

          {/* conversation */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white shadow-md shadow-brand/15 bg-brand-fill">{msg.text}</div>
                  </motion.div>
                ) : (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5">
                    <Avatar />
                    <div className="min-w-0 max-w-[90%] space-y-2">
                      <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:bg-white/5 dark:text-slate-300">
                        <RichText text={msg.text} />
                      </div>
                      {msg.interpretation && (
                        <div className="rounded-xl border border-brand-line bg-brand-soft px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:border-brand-line dark:bg-brand-soft dark:text-slate-300">
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand dark:text-brand">
                            <Sparkles className="h-3 w-3" /> What I understood
                          </div>
                          <RichText text={msg.interpretation} />
                        </div>
                      )}
                      {msg.warnings?.map((w, j) => (
                        <div key={j} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {w}
                        </div>
                      ))}
                      {msg.paywall && (
                        <Link to="/backtest/app/upgrade" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400">
                          <Crown className="h-3.5 w-3.5" /> Go Pro — unlimited backtests
                        </Link>
                      )}
                      {!msg.paywall && i === messages.length - 1 && !loading && (msg.suggestions?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {msg.suggestions!.map((s) => (
                            <button
                              key={s}
                              onClick={() => void send(s)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand hover:text-brand dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand"
                            >
                              <Sparkles className="h-3 w-3" />
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
            {loading && <Thinking />}

            {fresh && !loading && (
              <div className="pt-2">
                <div className={`mb-2 text-xs font-semibold uppercase tracking-wider ${muted}`}>Try an idea</div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {EXAMPLES.map(({ icon: Icon, tag, text, pro }) => (
                    <button
                      key={text}
                      onClick={() => void send(text)}
                      className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md hover:shadow-brand/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand/50"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand dark:text-brand">
                        <Icon className="h-3.5 w-3.5" /> {tag}
                        {pro && locked("options") && <ProBadge className="ml-auto" />}
                      </div>
                      <div className="mt-1 text-xs leading-snug text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">{text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-slate-100 p-3 dark:border-white/5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-3 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-line dark:border-white/10 dark:bg-slate-950/60">
              <textarea
                value={input}
                rows={2}
                maxLength={1000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="e.g. Buy INFY when 20 EMA crosses above 50 EMA, 2% stop"
                aria-label="Describe a strategy to backtest"
                className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Run backtest"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-brand/25 transition disabled:opacity-40 bg-brand-fill hover:bg-brand-hover"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className={`mt-1.5 px-1 text-xs ${muted}`}>
              {loaded && !isPro ? (
                <>
                  Free plan: daily candles · last {historyDays && historyDays % 365 === 0 ? `${historyDays / 365} years` : `${historyDays} days`} · stocks &amp; indices.{" "}
                  <Link to="/backtest/app/upgrade" className="font-semibold text-amber-600 hover:underline dark:text-amber-400">
                    Pro unlocks intraday, options &amp; AI
                  </Link>
                </>
              ) : (
                "Enter to run · Shift+Enter for a new line · Simulated on historical data, not advice"
              )}
            </div>
          </form>
        </section>

        {/* ── report ──────────────────────────────────────────── */}
        <section aria-label="Backtest report" className="min-w-0">
          {report ? (
            <div className={loading ? "pointer-events-none opacity-60 transition" : "transition"}>
              <Report
                result={report.result}
                title={report.name}
                subtitle={report.window}
                definition={report.definition}
                actions={
                  !isOptions && (
                    <button onClick={() => void saveStrategy()} disabled={saving} className={btnSecondary}>
                      <Save className="h-4 w-4" />
                      {saving ? "Saving…" : "Save strategy"}
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <ReportPlaceholder loading={loading} />
          )}
        </section>
      </div>
    </BacktestLayout>
  );
}
