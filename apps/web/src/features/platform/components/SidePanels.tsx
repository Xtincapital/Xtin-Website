import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Crown, Lightbulb, PlayCircle, Sparkles } from 'lucide-react';
import progressService from '../../../services/progressService';
import { cn } from '@/lib/utils';
import { COURSES, LESSON_COUNT, PRODUCTS, PRODUCT_ORDER, type ProductId } from '../lib/catalog';

// Lesson routes differ from module ids for a few modules (mirrors LearnPage).
const ROUTE_PREFIX_OVERRIDES: Record<string, string> = {
  'algorithmic-trading': 'algo-trading',
  'risk-management': 'risk',
  'long-term-investing': 'lti',
  'portfolio-construction': 'pc',
  taxes: 'tax',
};
const lessonPath = (moduleSlug: string, n: number) => {
  if (moduleSlug === 'personal-finance' && n === 1) return '/learn/personal-finance-basics';
  if (moduleSlug === 'derivatives') return `/learn/derivatives/lesson-${n}`;
  return `/learn/${ROUTE_PREFIX_OVERRIDES[moduleSlug] || moduleSlug}-lesson-${n}`;
};

type Progress = Record<string, { lesson_slug: string; completed_at: string }[]>;

export function ContinueLearning() {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState<Progress | null>(null);

  // Real progress when signed in; quietly nothing otherwise.
  useEffect(() => {
    let alive = true;
    progressService
      .getUserProgress()
      .then((p: Progress | null) => alive && setProgress(p))
      .catch(() => alive && setProgress(null));
    return () => {
      alive = false;
    };
  }, []);

  const { target, done } = useMemo(() => {
    const doneCount = COURSES.reduce((s, m) => s + Math.min(progress?.[m.id]?.length || 0, m.lessons || 0), 0);
    if (!progress) return { target: null, done: doneCount };
    let latest: { moduleSlug: string; lesson_slug: string; completed_at: string } | null = null;
    Object.entries(progress).forEach(([moduleSlug, lessons]) =>
      (lessons || []).forEach((l) => {
        if (!latest || new Date(l.completed_at) > new Date(latest.completed_at)) latest = { moduleSlug, ...l };
      }),
    );
    if (!latest) return { target: null, done: doneCount };
    const l = latest as { moduleSlug: string; lesson_slug: string };
    const mod = COURSES.find((m) => m.id === l.moduleSlug);
    if (!mod) return { target: null, done: doneCount };
    const completed = Math.min(progress[mod.id]?.length || 0, mod.lessons);
    const lastN = parseInt(String(l.lesson_slug).replace('lesson-', ''), 10) || 1;
    const next = Math.min(lastN + 1, mod.lessons || lastN);
    return { target: { mod, completed, next, path: lessonPath(mod.id, next), finished: completed >= mod.lessons }, done: doneCount };
  }, [progress]);

  const first = COURSES[0];
  const mod = target?.mod || first;
  const pct = target ? Math.round((target.completed / target.mod.lessons) * 100) : 0;
  const C = 2 * Math.PI * 26;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--xp-tile-shadow)] md:p-6">
      <div className="flex items-center gap-2 text-xs font-bold text-brand">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        {target ? 'Continue learning' : 'Start learning'}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--xp-panel-line)" strokeWidth="6" />
            <motion.circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="rgb(var(--brand))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: reduce ? C * (1 - pct / 100) : C }}
              animate={{ strokeDashoffset: C * (1 - pct / 100) }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-foreground">{pct}%</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug text-foreground">{mod.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {target
              ? target.finished
                ? `All ${mod.lessons} lessons done`
                : `${target.completed} of ${mod.lessons} lessons · next is lesson ${target.next}`
              : `${mod.lessons} lessons · the best place to begin`}
          </p>
        </div>
      </div>
      <Link
        to={target && !target.finished ? target.path : mod.path}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-fill px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
      >
        <PlayCircle className="h-4 w-4" aria-hidden="true" />
        {target && !target.finished ? `Resume lesson ${target.next}` : target ? 'Review the course' : 'Start lesson 1'}
      </Link>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-bold tabular-nums text-foreground">{done}</span> of {LESSON_COUNT} lessons done across Xtin
        </span>
        <Link to="/learn" className="font-bold text-brand hover:underline">
          All courses
        </Link>
      </div>
    </div>
  );
}

export function PlanCard({ pro, loaded }: { pro: Partial<Record<ProductId, boolean>>; loaded: boolean }) {
  const owned = PRODUCT_ORDER.filter((id) => pro[id]);
  const all = owned.length === PRODUCT_ORDER.filter((id) => id !== 'tools' && id !== 'backtest').length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--xp-tile-shadow)] md:p-6">
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-400/15 blur-2xl" />
      <div className="relative flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
        <Crown className="h-4 w-4" aria-hidden="true" />
        Your plan
      </div>
      {!loaded ? (
        <div className="relative mt-3 space-y-2" aria-busy="true" aria-label="Loading your plan">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      ) : owned.length ? (
        <>
          <h3 className="relative mt-3 text-base font-bold text-foreground">{all ? 'All-Access. Everything is unlocked.' : `Pro on ${owned.length} product${owned.length > 1 ? 's' : ''}`}</h3>
          <div className="relative mt-3 flex flex-wrap gap-1.5">
            {owned.map((id) => {
              const P = PRODUCTS[id];
              return (
                <Link key={id} to={P.path} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:border-amber-400 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
                  <P.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {P.name}
                </Link>
              );
            })}
          </div>
          <Link to="/dashboard" className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
            Manage plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </>
      ) : (
        <>
          <h3 className="relative mt-3 text-base font-bold text-foreground">You’re on the free plan</h3>
          <p className="relative mt-1 text-sm text-muted-foreground">
            Calculators and first lessons are free. Go Pro on one product, or get every product with the All-Access pass.
          </p>
          <Link
            to="/dashboard"
            className={cn(
              'relative mt-5 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition',
              'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/15',
            )}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            See plans and bundles
          </Link>
        </>
      )}
    </div>
  );
}

// General rules of thumb (figures worked out with the same SIP / inflation
// maths the calculators use), each pointing at where to go deeper.
const TIPS = [
  {
    title: 'Start early, even small',
    body: '₹5,000 a month at 12% from age 25 grows to about ₹3.25 crore by 60. Start at 35 and it is about ₹95 lakh.',
    link: { label: 'Try the SIP calculator', to: '/tools/sip' },
  },
  {
    title: 'The rule of 72',
    body: 'Divide 72 by your yearly return to see roughly how many years your money takes to double. At 12%, that is about 6 years.',
    link: { label: 'Compound interest calculator', to: '/tools/compound-interest' },
  },
  {
    title: 'Emergency fund first',
    body: 'Keep 3 to 6 months of expenses somewhere safe and easy to reach before you invest for growth.',
    link: { label: 'Emergency fund course', to: '/learn/emergency-fund' },
  },
  {
    title: 'Inflation is a quiet tax',
    body: 'At 6% inflation, ₹1 lakh ten years from now buys only what about ₹56,000 buys today.',
    link: { label: 'Inflation calculator', to: '/tools/inflation' },
  },
  {
    title: 'Cover before you chase returns',
    body: 'A common rule of thumb is term life cover of 10 to 15 times your yearly income, bought before you start investing.',
    link: { label: 'Insurance course', to: '/learn/insurance' },
  },
];

export function MoneyTip() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(() => new Date().getDate() % TIPS.length);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (reduce || held) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % TIPS.length), 9000);
    return () => window.clearInterval(id);
  }, [reduce, held]);
  const tip = TIPS[i];
  const step = (d: number) => setI((x) => (x + d + TIPS.length) % TIPS.length);

  return (
    <div
      className="rounded-3xl border border-border bg-card p-5 shadow-[var(--xp-tile-shadow)] md:p-6"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-brand">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          Money tip
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => step(-1)} aria-label="Previous tip" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {i + 1}/{TIPS.length}
          </span>
          <button type="button" onClick={() => step(1)} aria-label="Next tip" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative mt-2 min-h-[8.5rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-base font-bold text-foreground">{tip.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
            <Link to={tip.link.to} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
              {tip.link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
