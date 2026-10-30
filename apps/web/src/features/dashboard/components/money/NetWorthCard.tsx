// Net worth today, how it has moved (one point a month, recorded each time
// the dashboard loads — Gini keeps no history of its own, so this starts the
// first month a user visits), and where it heads in 5 or 10 years if nothing
// changes: each asset at its expected return, each loan paid down by its EMIs.

import { useId, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import RollingNumber from "@/components/motion/RollingNumber";
import { cn } from "@/lib/utils";
import type { Asset, Liability } from "@/features/gini/lib/api";
import { inr, inrShort, projectNetWorth, type Household } from "../../lib/money";
import type { NetWorthPoint } from "../../services/moneyService";
import { CARD } from "./styles";
import { Chip, GoLink } from "./ui";

const W = 600;
const H = 170;
const TOP = 12;
const BOTTOM = 162;

type View = "past" | 5 | 10;

function smoothPath(pts: [number, number][]): string {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** "Oct '26" from "2026-10". */
function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "short" })} '${String(y).slice(2)}`;
}

/** Up to `n` evenly spaced items, always including the first and last. */
function spread<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  return Array.from({ length: n }, (_, i) => items[Math.round((i * (items.length - 1)) / (n - 1))]);
}

export default function NetWorthCard({
  household: h,
  assets,
  liabilities,
  history,
  monthly,
}: {
  household: Household;
  assets: Asset[];
  liabilities: Liability[];
  history: NetWorthPoint[];
  /** Null until the user has said what they invest each month. */
  monthly: number | null;
}) {
  const hasPast = history.length >= 2;
  const [view, setView] = useState<View>(hasPast ? "past" : 10);
  const gradId = `nw${useId().replace(/:/g, "")}`;
  const thisYear = new Date().getFullYear();

  const series = useMemo(
    () => (view === "past" ? history.map((p) => p.assets - p.liabilities) : projectNetWorth(assets, liabilities, view)),
    [view, history, assets, liabilities],
  );
  const chart = useMemo(() => {
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = max - min;
    const pts = series.map((v, i): [number, number] => [
      series.length > 1 ? (i / (series.length - 1)) * (W - 12) : W - 12,
      span > 0 ? BOTTOM - ((v - min) / span) * (BOTTOM - TOP) : (TOP + BOTTOM) / 2,
    ]);
    const line = smoothPath(pts.length > 1 ? pts : [[0, pts[0][1]], pts[0]]);
    const last = pts[pts.length - 1];
    return { line, area: `${line} L${W - 12} ${H} L0 ${H} Z`, dotX: (last[0] / W) * 100, dotY: (last[1] / H) * 100 };
  }, [series]);

  const first = series[0];
  const end = series[series.length - 1];
  const change = end - first;
  const axis =
    view === "past"
      ? spread(history, 6).map((p) => monthLabel(p.month))
      : Array.from({ length: 6 }, (_, i) => String(thisYear + (view === 5 ? i : i * 2)));
  const views: View[] = hasPast ? ["past", 5, 10] : [5, 10];

  return (
    <section className={cn(CARD, "flex flex-col")} aria-labelledby="nw-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="nw-title" className="xt-label">Net worth</h2>
        <div className="inline-flex gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Chart range">
          {views.map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "min-h-[36px] rounded-lg px-3 text-[13px] font-bold transition-colors",
                view === v ? "bg-brand-fill text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {v === "past" ? "Past" : `${v}Y`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5 text-[40px] font-bold leading-[1.05] tracking-[-0.02em] tabular-nums sm:text-5xl">
        <RollingNumber value={inr(h.netWorth)} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <Chip tone={change >= 0 ? "good" : "bad"}>
          {change >= 0 ? <ArrowUpRight size={13} strokeWidth={3} aria-hidden="true" /> : <ArrowDownRight size={13} strokeWidth={3} aria-hidden="true" />}
          <span className="tabular-nums">
            {change >= 0 ? "+" : ""}
            {inrShort(change)}
          </span>
          {view === "past" ? ` since ${monthLabel(history[0].month)}` : ` in ${view} years`}
        </Chip>
        <span className="text-sm text-muted-foreground">
          {view === "past" ? "as recorded each month you visit" : `if nothing changes, ${inrShort(end)} by ${thisYear + view}`}
        </span>
      </div>

      <div key={String(view)} className="xd-reveal relative mt-4 h-[150px] min-h-[150px] flex-1">
        <span className="sr-only">
          {view === "past"
            ? `Net worth went from ${inrShort(first)} in ${monthLabel(history[0].month)} to ${inrShort(end)} now.`
            : `Projected net worth grows from ${inrShort(first)} today to ${inrShort(end)} in ${view} years.`}
        </span>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgb(var(--brand))" stopOpacity="0.24" />
              <stop offset="1" stopColor="rgb(var(--brand))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[TOP, (TOP + BOTTOM) / 2, BOTTOM].map((y) => (
            <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={chart.area} fill={`url(#${gradId})`} />
          <path
            d={chart.line}
            fill="none"
            stroke="rgb(var(--brand))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={view === "past" ? undefined : "6 5"}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="xd-ping absolute -ml-1.5 -mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-brand-fill"
          style={{ left: `${chart.dotX}%`, top: `${chart.dotY}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground" aria-hidden="true">
        {axis.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
      {!hasPast && (
        <p className="mt-2 text-xs text-muted-foreground">
          Your history starts this month. From next month, Past shows how your net worth has moved.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
        <div>
          <div className="xt-label">Assets</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{inr(h.totalAssets)}</div>
        </div>
        <div>
          <div className="xt-label">Liabilities</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{inr(h.totalLiabilities)}</div>
        </div>
        <div>
          <div className="xt-label">Investing each month</div>
          {monthly != null ? (
            <div className="mt-1 text-lg font-bold tabular-nums text-brand">{inr(monthly)}</div>
          ) : (
            <GoLink href="#life-road" className="min-h-0 pt-1">
              Set it
            </GoLink>
          )}
        </div>
      </div>
      {h.totalAssets === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Add your savings, investments and property in <GoLink href="/gini/networth" className="min-h-0">Gini</GoLink>
        </p>
      )}
    </section>
  );
}
