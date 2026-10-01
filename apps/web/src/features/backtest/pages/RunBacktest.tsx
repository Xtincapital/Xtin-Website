import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarRange, Database, Play, Wallet } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import { ApiError, backtestApi, isProRequired } from "../lib/api";
import { earliestStart, usePlan } from "../lib/usePlan";
import ProBadge from "../components/ProBadge";
import { strategySentence } from "../lib/analytics";
import { btnPrimary, card, chip, input, label, muted } from "../lib/styles";
import { inr } from "../lib/types";

const isoDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const PERIODS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 182 },
  { label: "1Y", days: 365 },
  { label: "3Y", days: 365 * 3 },
  { label: "5Y", days: 365 * 5 },
];
const CAPITALS = [50_000, 100_000, 500_000, 1_000_000];

export default function RunBacktest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [startDate, setStartDate] = useState(isoDaysAgo(365));
  const [endDate, setEndDate] = useState(isoDaysAgo(0));
  const [capital, setCapital] = useState(100000);
  const [error, setError] = useState<{ text: string; pro: boolean } | null>(null);
  const { locked, historyDays } = usePlan();
  const minStart = locked("full_history") ? earliestStart(historyDays) : null;

  const strategy = useQuery({ queryKey: ["bt-strategy", id], queryFn: () => backtestApi.getStrategy(id as string) });

  const run = useMutation({
    mutationFn: () => backtestApi.run({ strategy_id: id as string, start_date: startDate, end_date: endDate, starting_capital: capital }),
    onSuccess: (bt) => {
      qc.invalidateQueries({ queryKey: ["bt-runs"] });
      navigate(`/backtest/app/history/${bt.id}`);
    },
    onError: (err) => {
      qc.invalidateQueries({ queryKey: ["bt-runs"] });
      setError({ text: err instanceof ApiError ? err.message : "Backtest failed", pro: isProRequired(err) });
    },
  });

  const inst = strategy.data?.definition.instrument;
  const intraday = inst && inst.timeframe !== "1d";
  const intradayLocked = Boolean(intraday && locked("intraday"));
  const tooEarly = (date: string) => minStart !== null && date < minStart;
  const activePeriod = endDate === isoDaysAgo(0) ? PERIODS.find((p) => startDate === isoDaysAgo(p.days))?.label : undefined;

  return (
    <BacktestLayout>
      <Link to="/backtest/app/strategies" className={`mb-4 inline-flex items-center gap-1.5 text-sm ${muted} hover:text-slate-900 dark:hover:text-white`}>
        <ArrowLeft className="h-4 w-4" /> Strategies
      </Link>
      <PageHeader eyebrow="Run a backtest" title={strategy.data?.name ?? "Loading…"} description={strategy.data ? strategySentence(strategy.data.definition) : undefined} />
      {strategy.isError && <p className="text-rose-600">Couldn't load this strategy.</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={`${card} p-5 sm:p-6`}>
          <div className="flex items-center gap-2 font-semibold">
            <CalendarRange className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Test window
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PERIODS.map((p) => {
              const lockedPeriod = tooEarly(isoDaysAgo(p.days));
              return (
                <button
                  key={p.label}
                  type="button"
                  disabled={lockedPeriod}
                  title={lockedPeriod ? "Longer history is a Pro feature" : undefined}
                  onClick={() => {
                    setStartDate(isoDaysAgo(p.days));
                    setEndDate(isoDaysAgo(0));
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${activePeriod === p.label ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}
                >
                  {p.label}
                  {lockedPeriod && <ProBadge />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block">
              <span className={label}>From</span>
              <input type="date" className={input} value={startDate} min={minStart ?? undefined} max={endDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="block">
              <span className={label}>To</span>
              <input type="date" className={input} value={endDate} min={startDate} max={isoDaysAgo(0)} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <div className="mt-6 flex items-center gap-2 font-semibold">
            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Starting capital
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {CAPITALS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCapital(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums transition ${capital === c ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}
              >
                {inr(c)}
              </button>
            ))}
            <input type="number" min={1} className={`${input} !w-36 tabular-nums`} value={capital} aria-label="Starting capital in rupees" onChange={(e) => setCapital(Number(e.target.value))} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Data
            </div>
            {inst && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={`${chip} font-bold`}>{inst.symbol}</span>
                <span className={chip}>{inst.exchange}</span>
                <span className={chip}>{inst.timeframe}</span>
              </div>
            )}
            <p className={`mt-3 text-xs leading-relaxed ${muted}`}>
              {inst?.symbol === "SAMPLE"
                ? "SAMPLE is a deterministic offline series — instant and reproducible, great for trying rules."
                : intraday
                  ? "Live intraday history from the market data provider. It only reaches back ~60 days (1-minute: ~7 days), so keep the window short."
                  : "Live daily history from the market data provider."}
            </p>
          </div>

          {intradayLocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
              <div className="flex items-center gap-2 font-semibold">
                <ProBadge /> Intraday strategy
              </div>
              <p className="mt-1 text-xs">This strategy uses {inst?.timeframe} candles, which need Pro. Switch it to daily in the editor, or upgrade.</p>
              <Link to="/backtest/app/upgrade" className="mt-2 inline-block text-xs font-semibold underline">
                See Pro
              </Link>
            </div>
          )}
          {tooEarly(startDate) && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              The free plan tests from {minStart} onwards. <Link to="/backtest/app/upgrade" className="font-semibold underline">Pro unlocks the full history.</Link>
            </p>
          )}
          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error.text}{" "}
              {error.pro && (
                <Link to="/backtest/app/upgrade" className="font-semibold underline">
                  Go Pro
                </Link>
              )}
            </p>
          )}

          <button
            onClick={() => {
              setError(null);
              run.mutate();
            }}
            disabled={run.isPending || !strategy.data || !(capital > 0) || !startDate || !endDate || intradayLocked || tooEarly(startDate)}
            className={`${btnPrimary} w-full !py-3.5 text-base`}
          >
            <Play className="h-5 w-5" />
            {run.isPending ? "Replaying the market…" : "Run backtest"}
          </button>
        </aside>
      </div>
    </BacktestLayout>
  );
}
