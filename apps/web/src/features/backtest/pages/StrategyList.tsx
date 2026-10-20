import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Layers, Pencil, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { v1 } from "../lib/v1";
import { usePlan } from "../lib/usePlan";
import ProBadge from "../components/ProBadge";
import { useProDialog } from "../lib/proDialog";
import { groupTexts, levelText, matchOf, parseInstrumentId, sizingShort, type SpecGroup } from "../lib/spec";
import { btnGhost, btnPrimary, btnSecondary, card, chip, muted } from "../lib/styles";

function RuleLine({ label, tone, group, empty }: { label: string; tone: string; group: SpecGroup | null; empty: string }) {
  const conds = groupTexts(group);
  const joiner = group && matchOf(group) === "any" ? "or" : "and";
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`mt-0.5 w-10 shrink-0 font-bold uppercase tracking-wider ${tone}`}>{label}</span>
      <span className="flex flex-wrap gap-1">
        {conds.length ? (
          conds.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <span className={`text-xs font-semibold uppercase ${muted}`}>{joiner}</span>}
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-200">{c}</code>
            </span>
          ))
        ) : (
          <span className={muted}>{empty}</span>
        )}
      </span>
    </div>
  );
}

export default function StrategyList() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["bt-strategies"], queryFn: async () => (await v1.listStrategies()).data });
  const { strategyLimit, isPro } = usePlan();
  const atLimit = !isPro && strategyLimit !== null && (data?.length ?? 0) >= strategyLimit;

  const del = useMutation({
    mutationFn: (id: string) => v1.deleteStrategy(id),
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
            {!isPro && strategyLimit !== null && data && (
              <span className={`mr-1 text-xs tabular-nums ${muted}`}>
                {Math.min(data.length, strategyLimit)} / {strategyLimit} saved
              </span>
            )}
            <Link to="/backtest/app" className={btnSecondary}>
              <Sparkles className="h-4 w-4" /> Describe one
            </Link>
            {atLimit ? (
              <button
                type="button"
                className={btnPrimary}
                onClick={() => useProDialog.getState().show("unlimited_strategies", `The free plan saves up to ${strategyLimit} strategies — delete one to make room, or go Pro for unlimited.`)}
              >
                <Plus className="h-4 w-4" /> Build by hand <ProBadge />
              </button>
            ) : (
              <Link to="/backtest/app/strategies/new" className={btnPrimary}>
                <Plus className="h-4 w-4" /> Build by hand
              </Link>
            )}
          </>
        }
      />
      {atLimit && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
          <span>You've saved {strategyLimit} strategies — the free plan's limit. Delete one to make room, or go Pro for unlimited.</span>
          <Link to="/backtest/app/upgrade" className="font-semibold underline">
            See Pro
          </Link>
        </div>
      )}

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
            const spec = s.spec;
            const inst = spec ? parseInstrumentId(spec.instrument.id) : null;
            const short = spec?.entry.side === "short";
            const risk = spec
              ? [levelText(spec.exit.stop_loss, "stop"), levelText(spec.exit.target, "target"), levelText(spec.exit.trailing_stop, "trail"), spec.exit.time_exit && `out after ${spec.exit.time_exit.bars} bars`].filter(Boolean)
              : [];
            return (
              <motion.article key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx, 8) * 0.04 }} className={`${card} group flex flex-col p-5 transition hover:border-brand-line hover:shadow-lg hover:shadow-brand/5 dark:hover:border-brand-line`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{s.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`${chip} font-bold text-slate-800 dark:text-white`}>{inst?.symbol ?? "—"}</span>
                      {spec && <span className={chip}>{spec.instrument.timeframe}</span>}
                      {spec && (
                        <span className={`${chip} ${short ? "!text-violet-700 dark:!text-violet-300" : "!text-sky-700 dark:!text-sky-300"}`}>
                          {short ? "Short" : "Long"} · {sizingShort(spec.sizing)}
                        </span>
                      )}
                      <span className={chip} title="Every save keeps the earlier versions">
                        v{s.version}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs ${muted}`}>Updated {new Date(s.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  {spec ? (
                    <>
                      <RuleLine label="Entry" tone="text-brand dark:text-brand" group={spec.entry.when} empty="—" />
                      <RuleLine label="Exit" tone="text-amber-600 dark:text-amber-400" group={spec.exit.when} empty="stops / targets only" />
                      {risk.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-10 shrink-0 font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Risk</span>
                          <span className={muted}>{risk.join(" · ")}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-rose-600 dark:text-rose-400">This strategy can't be read: {s.errors?.join("; ")}. Edit it in the builder to fix it.</p>
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
