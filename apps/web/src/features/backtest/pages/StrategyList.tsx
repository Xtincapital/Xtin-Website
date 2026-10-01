import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Layers, Pencil, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { backtestApi } from "../lib/api";
import { conditionText } from "../lib/analytics";
import { btnGhost, btnPrimary, btnSecondary, card, chip, muted } from "../lib/styles";
import type { Strategy } from "../lib/types";

function RuleLine({ label, tone, strategy, group }: { label: string; tone: string; strategy: Strategy; group: "entry" | "exit" }) {
  const g = strategy.definition[group];
  const conds = g?.conditions ?? [];
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`mt-0.5 w-10 shrink-0 font-bold uppercase tracking-wider ${tone}`}>{label}</span>
      <span className="flex flex-wrap gap-1">
        {conds.length ? (
          conds.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <span className={`text-[10px] font-semibold uppercase ${muted}`}>{g.match === "any" ? "or" : "and"}</span>}
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-white/5 dark:text-slate-200">{conditionText(c)}</code>
            </span>
          ))
        ) : (
          <span className={muted}>{group === "exit" ? "stops / targets only" : "—"}</span>
        )}
      </span>
    </div>
  );
}

export default function StrategyList() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["bt-strategies"], queryFn: backtestApi.listStrategies });

  const del = useMutation({
    mutationFn: (id: string) => backtestApi.deleteStrategy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bt-strategies"] });
      toast.success("Strategy deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't delete the strategy"),
  });

  return (
    <BacktestLayout>
      <PageHeader
        eyebrow="Library"
        title="My strategies"
        description="Every rule you've saved. Re-run any of them over a new window, or fine-tune the conditions by hand."
        actions={
          <>
            <Link to="/backtest/app" className={btnSecondary}>
              <Sparkles className="h-4 w-4" /> Describe one
            </Link>
            <Link to="/backtest/app/strategies/new" className={btnPrimary}>
              <Plus className="h-4 w-4" /> Build by hand
            </Link>
          </>
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${card} h-48 animate-pulse`} />
          ))}
        </div>
      )}
      {isError && <p className="text-rose-600">Failed to load strategies. Please refresh.</p>}

      {data && data.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No strategies yet"
          text="Describe an idea in the Playground and tap “Save strategy”, or build one condition by condition."
          action={
            <>
              <Link to="/backtest/app" className={btnPrimary}>
                <Sparkles className="h-4 w-4" /> Open the Playground
              </Link>
              <Link to="/backtest/app/strategies/new" className={btnSecondary}>
                Build by hand
              </Link>
            </>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((s, idx) => {
            const inst = s.definition.instrument;
            const risk = s.definition.risk;
            const short = s.definition.entry_action?.side === "SELL";
            return (
              <motion.article key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx, 8) * 0.04 }} className={`${card} group flex flex-col p-5 transition hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-600/5 dark:hover:border-emerald-400/30`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{s.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`${chip} font-bold text-slate-800 dark:text-white`}>{inst?.symbol}</span>
                      <span className={chip}>{inst?.timeframe}</span>
                      <span className={`${chip} ${short ? "!text-violet-700 dark:!text-violet-300" : "!text-sky-700 dark:!text-sky-300"}`}>
                        {short ? "Short" : "Long"} × {s.definition.entry_action?.qty}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[11px] ${muted}`}>Updated {new Date(s.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <RuleLine label="Entry" tone="text-emerald-600 dark:text-emerald-400" strategy={s} group="entry" />
                  <RuleLine label="Exit" tone="text-amber-600 dark:text-amber-400" strategy={s} group="exit" />
                  {(risk?.stop_loss_pct || risk?.target_pct || risk?.trailing_sl_pct) && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-10 shrink-0 font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Risk</span>
                      <span className={muted}>
                        {[risk.stop_loss_pct && `${risk.stop_loss_pct}% stop`, risk.target_pct && `${risk.target_pct}% target`, risk.trailing_sl_pct && `${risk.trailing_sl_pct}% trail`].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 pt-1">
                  <Link to={`/backtest/app/strategies/${s.id}/run`} className={`${btnPrimary} !py-2`}>
                    <Play className="h-4 w-4" /> Backtest
                  </Link>
                  <Link to={`/backtest/app/strategies/${s.id}`} className={`${btnSecondary} !py-2`}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${s.name}"? This can't be undone.`)) del.mutate(s.id);
                    }}
                    className={`${btnGhost} ml-auto hover:!text-rose-600`}
                    aria-label={`Delete ${s.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </BacktestLayout>
  );
}
