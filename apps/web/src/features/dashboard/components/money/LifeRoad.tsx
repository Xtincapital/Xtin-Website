// The Life Road: every goal with a target year as a pin on one road from
// today, green where the goal is covered and gold where it isn't. Below it,
// the chosen goal's numbers and a what-if panel for how much goes in each
// month (Gini doesn't store that, so it's asked here and saved to the account
// with the other money basics).

import { useMemo, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { inr, inrShort, type PlannedGoal, type Tone } from "../../lib/money";
import { CARD, SECTION_TITLE, TONE } from "./styles";
import { Chip, GoLink, GoalIcon, IconTile, Progress } from "./ui";

const VB_W = 1200;
const VB_H = 380;
const START: [number, number] = [70, 310];
const MAX_PINS = 8;

type Placement = "above" | "below" | "below-end";
const LABEL_TRANSFORM: Record<Placement, string> = {
  above: "translate(-50%, calc(-100% - 40px))",
  below: "translate(-50%, 40px)",
  "below-end": "translate(-88%, 46px)",
};

/** Pin positions: evenly spaced, climbing towards the top right, with a gentle wave. */
function roadPoints(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n;
    const wave = i === n - 1 ? 0 : i % 2 === 0 ? -14 : 22;
    return [START[0] + t * 1070, START[1] - t * 240 + wave] as [number, number];
  });
}

/** A smooth curve through the points, as one path and as one path per stretch. */
function roadPaths(P: [number, number][]) {
  const segs: string[] = [];
  let full = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    const cmd = `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    segs.push(`M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${cmd}`);
    full += ` ${cmd}`;
  }
  return { full, segs };
}

const PIN_BORDER: Record<Tone, string> = {
  good: "border-brand",
  ok: "border-[var(--pro-gold)]",
  bad: "border-destructive",
  none: "border-border",
};

const goalTone = (g: PlannedGoal): Tone => (g.ok ? "good" : g.overdue ? "bad" : g.unknown ? "none" : "ok");
const statusWord = (g: PlannedGoal) => (g.ok ? "On track" : g.overdue ? "Overdue" : g.unknown ? "Not set" : "Behind");

/** Asked once, before any goal is scored: what goes into investments each month. */
function MonthlyPrompt({ onSave }: { onSave: (n: number) => void }) {
  const [value, setValue] = useState("");
  const amount = Number(value.replace(/\D/g, ""));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (amount > 0) onSave(amount);
      }}
      className={cn("mb-5 rounded-2xl border p-4 sm:p-5", TONE.ok.soft, TONE.ok.border)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold">How much do you invest each month?</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            SIPs, PF top-ups and RDs, all of it. It's the one number Gini doesn't have, so your goals stay out of your score until you add it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="xd-monthly-input" className="sr-only">
            Monthly investing in rupees
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
            <input
              id="xd-monthly-input"
              inputMode="numeric"
              autoComplete="off"
              placeholder="25,000"
              value={value}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                setValue(digits ? Number(digits).toLocaleString("en-IN") : "");
              }}
              className="h-11 w-36 rounded-xl border border-border bg-card pl-7 pr-3 text-sm font-bold tabular-nums outline-none focus:border-brand"
            />
          </div>
          <button
            type="submit"
            disabled={!(amount > 0)}
            className="h-11 rounded-xl bg-brand-fill px-5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onSave(0)}
            className="h-11 rounded-xl px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            I don't invest yet
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Saved to your account. You can change it any time with the slider below.</p>
    </form>
  );
}

interface Props {
  plan: PlannedGoal[];
  /** Null until the user has said what they invest each month. */
  monthly: number | null;
  stepUp: number;
  /** `dragging` while the slider moves, so saves can wait for the user to let go. */
  onMonthly: (n: number, dragging?: boolean) => void;
  onStepUp: (n: number) => void;
  totalRequired: number;
  spare: number;
  age: number | null;
  netWorth: number;
}

export default function LifeRoad({ plan, monthly, stepUp, onMonthly, onStepUp, totalRequired, spare, age, netWorth }: Props) {
  const thisYear = new Date().getFullYear();
  const future = useMemo(() => plan.filter((g) => g.year != null && g.year > thisYear), [plan, thisYear]);
  const onRoad = future.slice(0, MAX_PINS);
  const onTrack = plan.filter((g) => g.ok).length;

  const [picked, setPicked] = useState<string | null>(null);
  const selected = onRoad.find((g) => g.id === picked) ?? onRoad.find((g) => !g.ok) ?? onRoad[0] ?? null;

  const road = useMemo(() => {
    const P = [START, ...roadPoints(onRoad.length)];
    return { P, ...roadPaths(P) };
  }, [onRoad.length]);

  // No monthly amount yet and some goal needs one: ask before scoring goals.
  const needsMonthly = monthly == null && plan.some((g) => g.unknown);
  const m = monthly ?? 0;
  const sliderMax = Math.max(50000, Math.ceil((Math.max(totalRequired, m) * 1.25) / 5000) * 5000);
  const sliderStep = sliderMax > 200000 ? 1000 : 500;
  const ageAt = (year: number) => (age ? ` · age ${age + (year - thisYear)}` : "");

  return (
    <section id="life-road" className={cn(CARD, "scroll-mt-24")} aria-labelledby="road-title">
      <div className="mb-4">
        <h2 id="road-title" className={SECTION_TITLE}>Your Life Road</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every goal with a target year, from today{age ? ` at ${age}` : ""}. Green is covered, gold needs more. Tap a goal.
        </p>
      </div>

      {needsMonthly && <MonthlyPrompt onSave={onMonthly} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-secondary px-4 py-3.5">
          <div className="xt-label">Goals on track</div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-bold tabular-nums">{needsMonthly ? "–" : `${onTrack} of ${plan.length}`}</span>
            <span className="hidden gap-1.5 sm:flex" aria-hidden="true">
              {plan.slice(0, 8).map((g) => (
                <span key={g.id} className={cn("h-3 w-3 rounded-full transition-colors", TONE[goalTone(g)].fill)} />
              ))}
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-secondary px-4 py-3.5">
          <div className="xt-label">Investing each month</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{monthly != null ? inr(monthly) : "Not set"}</div>
        </div>
        <div className="rounded-2xl bg-secondary px-4 py-3.5">
          <div className="xt-label">Needed for every goal</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{inr(totalRequired)}</div>
        </div>
        <div className="rounded-2xl bg-secondary px-4 py-3.5">
          <div className="xt-label">Next goal</div>
          <div className="mt-1 truncate text-2xl font-bold">{future[0] ? `${future[0].year}` : "None yet"}</div>
          {future[0] && <div className="truncate text-xs text-muted-foreground">{future[0].name}</div>}
        </div>
      </div>

      {onRoad.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <p className="font-bold">Your road is empty</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Add goals with a target year in Gini, like a car, a home or retirement, and each one becomes a stop on this road.
          </p>
          <GoLink href="/gini/goals" className="justify-center">
            Add a goal
          </GoLink>
        </div>
      ) : (
        <div className="relative mt-2" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <pattern id="xd-road-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" className="xd-dots" />
              </pattern>
            </defs>
            <rect width={VB_W} height={VB_H} fill="url(#xd-road-dots)" />
            <path d={road.full} className="xd-road-edge" fill="none" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
            <path d={road.full} className="xd-road" fill="none" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
            {road.segs.map((d, i) => (
              <path
                key={`b${i}`}
                d={d}
                fill="none"
                strokeWidth="42"
                stroke={TONE[goalTone(onRoad[i])].stroke}
                strokeOpacity={onRoad[i].ok ? 0.16 : 0.26}
                style={{ transition: "stroke .5s" }}
              />
            ))}
            {road.segs.map((d, i) => (
              <path key={`l${i}`} d={d} className="xd-lane" fill="none" strokeWidth="4" strokeLinecap="round" stroke={TONE[goalTone(onRoad[i])].stroke} />
            ))}
          </svg>

          <div
            className="pointer-events-none absolute hidden whitespace-nowrap rounded-[10px] border border-border bg-card px-2.5 py-1 text-center shadow-[var(--shadow-sm)] md:block"
            style={{ left: `${(START[0] / VB_W) * 100}%`, top: `${(START[1] / VB_H) * 100}%`, transform: "translate(-22%, calc(-100% - 36px))" }}
          >
            <div className="text-[13px] font-bold">Today{age ? ` · age ${age}` : ""}</div>
            <div className="text-xs tabular-nums text-muted-foreground">Net worth {inrShort(netWorth)}</div>
          </div>
          <span
            className="xd-ping absolute -ml-[13px] -mt-[13px] flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-card bg-brand-fill text-xs font-bold text-white md:-ml-[23px] md:-mt-[23px] md:h-[46px] md:w-[46px] md:border-[3px] md:text-sm"
            style={{ left: `${(START[0] / VB_W) * 100}%`, top: `${(START[1] / VB_H) * 100}%` }}
            aria-hidden="true"
          >
            Now
          </span>

          {onRoad.map((g, i) => {
            const [x, y] = road.P[i + 1];
            const place: Placement = i === onRoad.length - 1 && x > 1000 ? "below-end" : i % 2 === 0 ? "above" : "below";
            const tone = goalTone(g);
            const isSel = selected?.id === g.id;
            const big = g.category === "Retirement" && i === onRoad.length - 1;
            const pos = { left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` };
            return (
              <div key={g.id}>
                <div
                  className="xd-appear pointer-events-none absolute hidden max-w-[180px] rounded-[10px] border border-border bg-card px-2.5 py-1 text-center shadow-[var(--shadow-sm)] md:block"
                  style={{ ...pos, transform: LABEL_TRANSFORM[place], animationDelay: `${250 + i * 140}ms` }}
                >
                  <div className="truncate text-[13px] font-bold">{g.name}</div>
                  <div className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                    {g.year} · {inrShort(g.target)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPicked(g.id)}
                  aria-pressed={isSel}
                  aria-label={`${g.name}, ${g.year}, ${statusWord(g).toLowerCase()}`}
                  className={cn(
                    "xd-pop xd-pin absolute flex items-center justify-center rounded-full border-2 bg-card shadow-[var(--shadow-md)] hover:[scale:1.08] md:border-[3px]",
                    big ? "-ml-[18px] -mt-[18px] h-9 w-9 md:-ml-[33px] md:-mt-[33px] md:h-[66px] md:w-[66px]" : "-ml-[15px] -mt-[15px] h-[30px] w-[30px] md:-ml-[27px] md:-mt-[27px] md:h-[54px] md:w-[54px]",
                    PIN_BORDER[tone],
                    TONE[tone].text,
                  )}
                  style={{
                    ...pos,
                    animationDelay: `${250 + i * 140}ms`,
                    scale: isSel ? "1.18" : undefined,
                    boxShadow: isSel ? `0 0 0 7px color-mix(in srgb, ${TONE[tone].stroke} 18%, transparent), var(--shadow-md)` : undefined,
                  }}
                >
                  <span className="scale-75 md:scale-100">
                    <GoalIcon category={g.category} size={big ? 26 : 20} />
                  </span>
                  {!g.unknown && (
                    <span
                      className={cn(
                        "absolute -right-1.5 -top-1.5 hidden h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-card md:flex",
                        TONE[tone].fill,
                        tone === "ok" ? "text-[var(--pro-gold-ink)]" : "text-white",
                      )}
                      aria-hidden="true"
                    >
                      {g.ok ? <Check size={12} strokeWidth={3.2} /> : <AlertTriangle size={11} strokeWidth={3} />}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {future.length > MAX_PINS && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing the next {MAX_PINS} goals. All {future.length} are in Your goals below.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
        {selected ? (
          <div key={selected.id} className="xd-fade rounded-[18px] bg-secondary p-5" aria-live="polite">
            <div className="flex items-start gap-3.5">
              <IconTile tone={goalTone(selected)}>
                <GoalIcon category={selected.category} />
              </IconTile>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold tracking-[-0.01em]">{selected.name}</h3>
                  <Chip tone={goalTone(selected)}>{statusWord(selected)}</Chip>
                </div>
                <div className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                  {inrShort(selected.target)} by {selected.year}
                  {ageAt(selected.year as number)}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div>
                <div className="xt-label">Saved today</div>
                <div className="mt-0.5 text-lg font-bold tabular-nums">{inrShort(selected.saved)}</div>
              </div>
              <div>
                <div className="xt-label">Needs a month</div>
                <div className="mt-0.5 text-lg font-bold tabular-nums">{inr(selected.required)}</div>
              </div>
              <div>
                <div className="xt-label">Projected</div>
                <div className="mt-0.5 text-lg font-bold tabular-nums">{inrShort(selected.projected)}</div>
              </div>
            </div>
            <Progress pct={selected.pct} tone={goalTone(selected)} className="mt-3.5" />
            <p className="mt-3 text-sm leading-relaxed">
              {selected.required === 0
                ? "What you've saved grows enough to cover it on its own."
                : selected.unknown
                  ? `Needs ${inr(selected.required)} a month on top of what's saved. Add what you invest each month to see if that's covered.`
                  : selected.ok
                  ? `Covered by ${inr(selected.allocated)} of your monthly investing.`
                  : `Short by ${inrShort(selected.target - selected.projected)}. It needs ${inr(selected.required - selected.allocated)} a month more, or a later date.`}
            </p>
            <GoLink href="/gini/goals">Adjust this goal in Gini</GoLink>
          </div>
        ) : (
          <div className="rounded-[18px] bg-secondary p-5 text-sm text-muted-foreground">Pick a goal on the road to see its numbers.</div>
        )}

        <div className="rounded-[18px] bg-secondary p-5">
          <h3 className="text-lg font-bold tracking-[-0.01em]">What if…</h3>
          {needsMonthly ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Save what you invest each month above. Then drag here to try bigger amounts and a yearly step-up, and watch goals turn green.
            </p>
          ) : (
            <>
              <div className="mt-4 flex items-baseline justify-between gap-2">
                <label htmlFor="xd-monthly" className="text-sm font-bold">
                  I invest each month
                </label>
                <span className="text-xl font-bold tabular-nums text-brand">{inr(m)}</span>
              </div>
              <input
                id="xd-monthly"
                type="range"
                min={0}
                max={sliderMax}
                step={sliderStep}
                value={m}
                onChange={(e) => onMonthly(Number(e.target.value), true)}
                aria-valuetext={`${inr(m)} a month`}
                className="h-11 w-full cursor-pointer accent-[rgb(var(--brand))]"
              />
              <div className="-mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
                <span>₹0</span>
                <span>{inrShort(sliderMax)}</span>
              </div>

              <div className="mt-4 text-sm font-bold">And raise it every year by</div>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Yearly increase">
                {[
                  ["None", 0],
                  ["5%", 0.05],
                  ["10%", 0.1],
                ].map(([label, value]) => (
                  <button
                    key={label as string}
                    type="button"
                    aria-pressed={stepUp === value}
                    onClick={() => onStepUp(value as number)}
                    className={cn(
                      "min-h-[44px] rounded-xl border-[1.5px] px-4 text-sm font-bold transition-colors",
                      stepUp === value ? "border-brand bg-brand-soft text-brand" : "border-border bg-card hover:border-brand-line",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="text-base font-bold">
                  {plan.length > 0 && onTrack === plan.length ? "Every goal is covered" : `${onTrack} of ${plan.length} goals on track`}
                </div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                  {m === 0
                    ? "Set what you invest each month and see which goals it covers, nearest goal first."
                    : spare > 0
                      ? `${inr(spare)} a month is left over after every goal.`
                      : `${inr(Math.max(0, totalRequired - m))} more a month would cover every goal.`}{" "}
                  Saved to your account.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
