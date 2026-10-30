// Two cards side by side: where the money sits (by asset type) and every goal
// with how far along it is on today's plan.

import { chartColors } from "@/components/charts/chartTheme";
import { inr, inrShort, type PlannedGoal, type Slice, type Tone } from "../../lib/money";
import { CARD, SECTION_TITLE } from "./styles";
import { Chip, GoLink, GoalIcon, IconTile, Progress } from "./ui";

const EQUITY = new Set(["Stocks", "Mutual Funds"]);

function goalTone(g: PlannedGoal): Tone {
  return g.ok ? "good" : g.overdue ? "bad" : g.unknown ? "none" : "ok";
}

function goalChip(g: PlannedGoal): string {
  if (g.ok) return "On track";
  if (g.overdue) return "Overdue";
  if (g.unknown) return `Needs ${inrShort(g.required)}/mo`;
  if (g.year == null) return "Needs a date";
  return `Behind · ${Math.min(99, Math.round(g.pct))}%`;
}

export default function MoneyBreakdown({ slices, totalAssets, plan }: { slices: Slice[]; totalAssets: number; plan: PlannedGoal[] }) {
  const equity = slices.filter((s) => EQUITY.has(s.name)).reduce((sum, s) => sum + s.share, 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <section className={CARD} aria-labelledby="alloc-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="alloc-title" className={SECTION_TITLE}>Where your money sits</h2>
          {slices.length > 0 && (
            <span className="text-sm font-semibold tabular-nums text-muted-foreground">
              {inrShort(totalAssets)} across {slices.length} {slices.length === 1 ? "place" : "places"}
            </span>
          )}
        </div>
        {slices.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No assets yet. <GoLink href="/gini/networth" className="min-h-0">Add them in Gini</GoLink>
          </p>
        ) : (
          <>
            <div className="mt-4 flex h-3.5 gap-[3px] overflow-hidden rounded-lg" aria-hidden="true">
              {slices.map((s, i) => (
                <span key={s.name} className="xd-grow h-full" style={{ width: `${s.share * 100}%`, background: chartColors.series[i % chartColors.series.length] }} />
              ))}
            </div>
            <ul className="mt-4">
              {slices.map((s, i) => (
                <li key={s.name} className="flex items-center gap-3 border-t border-border py-2.5 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: chartColors.series[i % chartColors.series.length] }} />
                  <span className="flex-1 font-semibold">{s.name}</span>
                  <span className="font-bold tabular-nums">{inr(s.value)}</span>
                  <span className="w-11 text-right tabular-nums text-muted-foreground">{Math.round(s.share * 100)}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              {equity > 0
                ? `${Math.round(equity * 100)}% sits in equity (stocks and mutual funds).`
                : "Nothing in equity yet (stocks or mutual funds)."}{" "}
              Goals five or more years away usually have room for more.
            </p>
          </>
        )}
      </section>

      <section className={CARD} aria-labelledby="goals-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="goals-title" className={SECTION_TITLE}>Your goals</h2>
          <GoLink href="#life-road">Open Life Road</GoLink>
        </div>
        {plan.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No goals yet. <GoLink href="/gini/goals" className="min-h-0">Add one in Gini</GoLink>
          </p>
        ) : (
          <div className="mt-2">
            {plan.map((g) => {
              const tone = goalTone(g);
              return (
                <div key={g.id} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3.5 border-t border-border py-3">
                  <IconTile tone={tone}>
                    <GoalIcon category={g.category} />
                  </IconTile>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-[15px] font-bold">{g.name}</span>
                      <span className="text-[13px] tabular-nums text-muted-foreground">
                        {inrShort(g.target)}
                        {g.year ? ` by ${g.year}` : ""}
                      </span>
                    </div>
                    <Progress pct={g.pct} tone={tone} className="mt-2" />
                  </div>
                  <Chip tone={tone}>{goalChip(g)}</Chip>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
