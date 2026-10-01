import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, History as HistoryIcon, Layers, Trash2, TrendingUp, Trophy } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { backtestApi } from "../lib/api";
import { btnGhost, btnPrimary, card, muted } from "../lib/styles";

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Trophy; label: string; value: string; tone?: string }) {
  return (
    <div className={`${card} flex items-center gap-3 p-4`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </span>
      <div>
        <div className={`text-xs ${muted}`}>{label}</div>
        <div className={`text-lg font-bold tabular-nums ${tone ?? ""}`}>{value}</div>
      </div>
    </div>
  );
}

export default function Backtests() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["bt-runs"], queryFn: backtestApi.listRuns });

  const del = useMutation({
    mutationFn: (id: string) => backtestApi.deleteRun(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bt-runs"] }),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't delete the backtest"),
  });

  const done = (data ?? []).filter((b) => b.status === "completed" && b.metrics);
  const profitable = done.filter((b) => (b.metrics?.total_return_pct ?? 0) > 0).length;
  const best = done.reduce<number | null>((m, b) => (m === null || b.metrics!.total_return_pct > m ? b.metrics!.total_return_pct : m), null);

  return (
    <BacktestLayout>
      <PageHeader eyebrow="History" title="Your backtests" description="Every run of a saved strategy, with the full report kept for later." />

      {isLoading && <div className={`${card} h-72 animate-pulse`} />}
      {isError && <p className="text-rose-600">Failed to load your backtests. Please refresh.</p>}

      {data && data.length === 0 && (
        <EmptyState
          icon={HistoryIcon}
          title="No backtests yet"
          text="Save a strategy, then run it over any window — every run lands here with its full report."
          action={
            <Link to="/backtest/app/strategies" className={btnPrimary}>
              <Layers className="h-4 w-4" /> Go to strategies
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <Stat icon={HistoryIcon} label="Runs" value={`${data.length}`} />
            <Stat icon={TrendingUp} label="Profitable" value={done.length ? `${profitable}/${done.length}` : "—"} />
            <Stat icon={Trophy} label="Best return" value={best === null ? "—" : `${best >= 0 ? "+" : ""}${best.toFixed(2)}%`} tone={best !== null && best >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
          </div>

          <div className={`${card} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={`bg-slate-50 text-left text-[11px] uppercase tracking-wider dark:bg-white/[0.03] ${muted}`}>
                  <tr>
                    <th className="px-5 py-3 font-semibold">Strategy</th>
                    <th className="px-3 py-3 font-semibold">Window</th>
                    <th className="px-3 py-3 text-right font-semibold">Return</th>
                    <th className="px-3 py-3 font-semibold">Win rate</th>
                    <th className="px-3 py-3 text-right font-semibold">Trades</th>
                    <th className="px-3 py-3 text-right font-semibold">Max DD</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {data.map((b) => {
                    const m = b.metrics;
                    const ret = m?.total_return_pct ?? 0;
                    const ok = b.status === "completed" && m;
                    return (
                      <tr key={b.id} className="group border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold">{b.strategy_name}</div>
                          <div className={`text-[11px] ${muted}`}>{new Date(b.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td className={`px-3 py-3.5 text-xs ${muted}`}>
                          {b.start_date} → {b.end_date}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          {ok ? (
                            <span className={`rounded-lg px-2 py-1 text-xs font-bold ${ret >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
                              {ret >= 0 ? "+" : ""}
                              {ret.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" title={b.error ?? ""}>
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {m ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${Math.min(100, m.win_rate)}%` }} />
                              </div>
                              <span className="text-xs">{m.win_rate.toFixed(0)}%</span>
                            </div>
                          ) : (
                            <span className={muted}>—</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right">{m?.num_trades ?? "—"}</td>
                        <td className="px-3 py-3.5 text-right text-rose-600 dark:text-rose-400">{m ? `−${Math.abs(m.max_drawdown_pct).toFixed(1)}%` : "—"}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          {ok && (
                            <Link to={`/backtest/app/history/${b.id}`} className="inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10">
                              Report <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              if (confirm("Delete this backtest?")) del.mutate(b.id);
                            }}
                            className={`${btnGhost} hover:!text-rose-600`}
                            aria-label="Delete backtest"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </BacktestLayout>
  );
}
