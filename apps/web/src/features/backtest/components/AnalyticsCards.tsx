// Secondary report views: monthly returns heatmap, trade P&L distribution and
// how trades ended. All derived client-side from the backtest result.
import { CalendarDays, ChartColumn, DoorOpen } from "lucide-react";
import { exitReasons, monthlyReturns, pnlHistogram, REASON_LABEL, streaks } from "../lib/analytics";
import { card, muted } from "../lib/styles";
import { inr, type BacktestResult } from "../lib/types";
import { useCurrency } from "@/contexts/CurrencyContext";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CardHeader({ icon: Icon, title, hint }: { icon: typeof CalendarDays; title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h4 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
        <Icon className="h-4 w-4 text-brand dark:text-brand" />
        {title}
      </h4>
      {hint && <span className={`text-xs ${muted}`}>{hint}</span>}
    </div>
  );
}

const FLAT = 0.05; // |return| below this reads as "no change"
const cellColor = (ret: number, maxAbs: number) => {
  if (!maxAbs || Math.abs(ret) < FLAT) return "rgba(160, 163, 170,0.12)";
  const a = 0.15 + 0.75 * Math.min(1, Math.abs(ret) / maxAbs);
  return ret > 0 ? `rgba(22, 163, 74,${a})` : `rgba(224, 72, 72,${a})`;
};

export function MonthlyHeatmap({ result }: { result: BacktestResult }) {
  const cells = monthlyReturns(result.equity_curve, result.metrics.starting_capital);
  const years = [...new Set(cells.map((c) => c.year))];
  const maxAbs = Math.max(0, ...cells.map((c) => Math.abs(c.returnPct)));
  const byKey = new Map(cells.map((c) => [`${c.year}-${c.month}`, c.returnPct]));
  const yearTotal = (y: number) => (cells.filter((c) => c.year === y).reduce((acc, c) => acc * (1 + c.returnPct / 100), 1) - 1) * 100;

  return (
    <div className={`${card} p-5`}>
      <CardHeader icon={CalendarDays} title="Monthly returns" hint="% change per month" />
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr className={muted}>
              <th className="w-10 text-left font-medium" />
              {MONTHS.map((m, i) => (
                <th key={i} className="font-medium">
                  {m}
                </th>
              ))}
              <th className="pl-2 text-right font-medium">Year</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              const total = yearTotal(y);
              return (
                <tr key={y}>
                  <td className={`pr-1 font-medium tabular-nums ${muted}`}>{y}</td>
                  {MONTHS.map((_, i) => {
                    const v = byKey.get(`${y}-${i + 1}`);
                    return (
                      <td key={i} className="p-0">
                        <div
                          className="flex h-8 min-w-[2.25rem] items-center justify-center rounded-md font-medium tabular-nums text-slate-900 dark:text-white"
                          style={{ background: v === undefined ? "transparent" : cellColor(v, maxAbs) }}
                          title={v === undefined ? "" : `${MONTH_NAMES[i]} ${y}: ${v >= 0 ? "+" : ""}${v.toFixed(2)}%`}
                        >
                          {v === undefined || Math.abs(v) < FLAT ? "" : Math.abs(v) >= 9.95 ? v.toFixed(0) : v.toFixed(1)}
                        </div>
                      </td>
                    );
                  })}
                  <td className={`pl-2 text-right font-semibold tabular-nums ${total >= 0 ? "text-brand dark:text-brand" : "text-rose-600 dark:text-rose-400"}`}>
                    {total >= 0 ? "+" : ""}
                    {total.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PnlDistribution({ result }: { result: BacktestResult }) {
  useCurrency(); // re-render on currency change
  const buckets = pnlHistogram(result.trades, 14);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const m = result.metrics;
  return (
    <div className={`${card} p-5`}>
      <CardHeader icon={ChartColumn} title="Trade outcomes" hint={`${result.trades.length} trades`} />
      {buckets.length ? (
        <>
          <div className="flex h-28 items-end gap-1" role="img" aria-label="Histogram of profit and loss per trade">
            {buckets.map((b, i) => {
              const mid = (b.from + b.to) / 2;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-md ${mid >= 0 ? "bg-brand-fill/80" : "bg-rose-500/80"}`}
                  style={{ height: `${Math.max(b.count ? 6 : 2, (b.count / max) * 100)}%`, opacity: b.count ? 1 : 0.25 }}
                  title={`${b.from.toFixed(1)}% to ${b.to.toFixed(1)}%: ${b.count} trade${b.count === 1 ? "" : "s"}`}
                />
              );
            })}
          </div>
          <div className={`mt-1.5 flex justify-between text-xs tabular-nums ${muted}`}>
            <span>{buckets[0].from.toFixed(1)}%</span>
            <span>P&L per trade</span>
            <span>{buckets[buckets.length - 1].to.toFixed(1)}%</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className={`text-xs ${muted}`}>Average win</dt>
              <dd className="font-semibold tabular-nums text-brand dark:text-brand">{inr(m.avg_win)}</dd>
            </div>
            <div>
              <dt className={`text-xs ${muted}`}>Average loss</dt>
              <dd className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{inr(m.avg_loss)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className={`text-sm ${muted}`}>No trades in this window.</p>
      )}
    </div>
  );
}

const REASON_COLOR: Record<string, string> = {
  target: "bg-brand-fill",
  signal: "bg-sky-500",
  stop_loss: "bg-rose-500",
  trailing_sl: "bg-amber-500",
  square_off: "bg-violet-500",
  end_of_data: "bg-slate-400",
  expiry: "bg-teal-500",
};

export function ExitMix({ result }: { result: BacktestResult }) {
  const reasons = exitReasons(result.trades);
  const total = result.trades.length;
  const s = streaks(result.trades);
  return (
    <div className={`${card} p-5`}>
      <CardHeader icon={DoorOpen} title="How trades ended" />
      {total ? (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            {reasons.map((r) => (
              <div key={r.reason} className={REASON_COLOR[r.reason] ?? "bg-slate-400"} style={{ width: `${(r.count / total) * 100}%` }} title={`${REASON_LABEL[r.reason] ?? r.reason}: ${r.count}`} />
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {reasons.map((r) => (
              <li key={r.reason} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${REASON_COLOR[r.reason] ?? "bg-slate-400"}`} />
                  {REASON_LABEL[r.reason] ?? r.reason}
                </span>
                <span className={`tabular-nums ${muted}`}>
                  {r.count} · {((r.count / total) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-white/5">
            <div>
              <div className={`text-xs ${muted}`}>Longest win streak</div>
              <div className="font-semibold tabular-nums">{s.wins}</div>
            </div>
            <div>
              <div className={`text-xs ${muted}`}>Longest losing streak</div>
              <div className="font-semibold tabular-nums">{s.losses}</div>
            </div>
          </div>
        </>
      ) : (
        <p className={`text-sm ${muted}`}>No trades in this window.</p>
      )}
    </div>
  );
}
