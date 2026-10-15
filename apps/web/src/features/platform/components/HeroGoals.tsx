import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import RollingNumber from '../../../components/motion/RollingNumber';
import { cn } from '@/lib/utils';
import { ASSUMED_RETURN, GOALS, monthlyFor, shortMoney, type GoalId } from '../lib/goals';

export const CYCLE_MS = 6500;

/** Goal pills. While `auto` is on, the active pill fills up like a story bar. */
export function GoalPicker({ goal, auto, onPick }: { goal: GoalId; auto: boolean; onPick: (id: GoalId) => void }) {
  const reduce = useReducedMotion();
  return (
    <div role="radiogroup" aria-label="Pick a goal" className="flex flex-wrap gap-2">
      {GOALS.map((g) => {
        const on = g.id === goal;
        return (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(g.id)}
            className={cn(
              'relative inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-full border px-3.5 text-sm font-bold transition-all duration-300',
              on
                ? 'border-foreground bg-foreground text-background shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]'
                : 'border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-brand-line hover:text-brand',
            )}
          >
            <g.Icon className={cn('h-4 w-4', on ? 'text-[#E2C273] dark:text-[#9A7634]' : 'text-muted-foreground')} aria-hidden="true" />
            {g.label}
            {on && auto && !reduce && (
              <motion.span
                key={`${g.id}-bar`}
                aria-hidden="true"
                className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-[#E2C273] dark:bg-[#B8923F]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** What it takes: the monthly SIP for the chosen goal, with a years stepper. */
export function GoalPlanCard({
  goal,
  years,
  onYears,
  symbol,
}: {
  goal: GoalId;
  years: number;
  onYears: (y: number) => void;
  symbol: string;
}) {
  const reduce = useReducedMotion();
  const g = GOALS.find((x) => x.id === goal)!;
  const isINR = symbol === '₹';
  const target = (isINR ? g.inr : g.other).amount;
  const monthly = Math.ceil(monthlyFor(target, years) / 10) * 10;
  const full = `${symbol}${monthly.toLocaleString(isINR ? 'en-IN' : 'en-US')}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/90 p-5 shadow-[var(--xp-tile-shadow)] backdrop-blur md:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(226,194,115,0.22)] blur-3xl" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={goal}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6, transition: { duration: 0.15 } }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center gap-4"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EDD89D,#CDAA5F_55%,#9A7634)] text-white shadow-[0_8px_20px_-8px_rgba(184,146,63,0.8)]">
            <g.Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-lg font-bold leading-snug text-foreground">{g.title}</div>
            <div className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{shortMoney(target, symbol)}</span> {g.what} in {years} year{years > 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-muted-foreground">Invest every month</div>
          <div className="mt-1 flex items-baseline gap-1.5" aria-live="polite">
            <span className="text-4xl font-bold tracking-[-0.03em] text-brand md:text-[2.75rem]">
              <RollingNumber value={full} />
            </span>
            <span className="text-sm font-semibold text-muted-foreground">a month</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-muted-foreground">For</div>
          <div className="mt-1 flex items-center rounded-xl border border-border bg-background">
            <button
              type="button"
              onClick={() => onYears(Math.max(1, years - 1))}
              disabled={years <= 1}
              aria-label="One year less"
              className="flex h-10 w-10 items-center justify-center rounded-l-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-20 text-center text-sm font-bold tabular-nums text-foreground">
              {years} year{years > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => onYears(Math.min(40, years + 1))}
              disabled={years >= 40}
              aria-label="One year more"
              className="flex h-10 w-10 items-center justify-center rounded-r-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <Link to="/gini/goals" className="inline-flex items-center gap-2 rounded-xl bg-brand-fill px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover">
          Plan this goal with Gini <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/tools/sip" className="rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">
          Try your own numbers
        </Link>
      </div>
      <p className="relative mt-3 text-xs text-muted-foreground">
        At an assumed {ASSUMED_RETURN}% a year, the SIP calculator’s default. Real returns can be lower; this is not advice.
      </p>
    </div>
  );
}

/** No-WebGL / reduced-motion stand-in for the coin sculpture. */
export function StaticGoalArt({ goal }: { goal: GoalId }) {
  const g = GOALS.find((x) => x.id === goal)!;
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center">
      <div aria-hidden="true" className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(226,194,115,0.4),rgba(22,163,74,0.12)_55%,transparent_72%)] blur-2xl" />
      <g.Icon aria-hidden="true" className="relative h-1/2 w-1/2 text-[#B8923F] drop-shadow-[0_12px_30px_rgba(184,146,63,0.45)]" strokeWidth={1.4} />
    </div>
  );
}
