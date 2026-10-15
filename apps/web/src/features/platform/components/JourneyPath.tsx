import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCTS, type ProductId } from '../lib/catalog';

const STEPS: { name: string; title: string; body: string; products: ProductId[]; cta: { label: string; to: string } }[] = [
  {
    name: 'Learn',
    title: 'Understand money before you move it.',
    body: 'Start with budgeting, emergency funds and how markets work. Then read the morning brief and watch it play out in the real market.',
    products: ['learn', 'newsletter'],
    cta: { label: 'Start a course', to: '/learn' },
  },
  {
    name: 'Plan',
    title: 'Turn goals into numbers.',
    body: 'Work out what your home, your child’s education and your retirement will really cost, and how much to invest each month to get there.',
    products: ['tools', 'gini'],
    cta: { label: 'Plan with Gini', to: '/gini' },
  },
  {
    name: 'Research',
    title: 'Know what you own.',
    body: 'Read any company’s numbers in plain English: a health score, red flags, and a Buy / Hold / Sell view written for how you invest.',
    products: ['fundakamental'],
    cta: { label: 'Analyse a company', to: '/fundakamental/analyze' },
  },
  {
    name: 'Test',
    title: 'Prove an idea before you risk money.',
    body: 'Describe a strategy in one sentence and see how it would have done across years of real market data. No code needed.',
    products: ['backtest'],
    cta: { label: 'Run a backtest', to: '/backtest' },
  },
  {
    name: 'Trade & review',
    title: 'Follow rules, then learn from every trade.',
    body: 'Use rule-based strategies with stop-losses built in, and log every trade so you can see what works and what keeps costing you.',
    products: ['algos', 'journal'],
    cta: { label: 'Open your journal', to: '/journal' },
  },
];

const STEP_MS = 6500;

export default function JourneyPath() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // hover / focus pauses
  const [touched, setTouched] = useState(false); // a click stops the tour

  const playing = inView && !held && !touched && !reduce;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, active]);

  const step = STEPS[active];

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    setTouched(true);
    const next = (active + (e.key === 'ArrowRight' ? 1 : STEPS.length - 1)) % STEPS.length;
    setActive(next);
    document.getElementById(`xp-step-${next}`)?.focus();
  };

  return (
    <section ref={ref} aria-labelledby="xp-path-title" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="max-w-3xl">
        <p className="xt-eyebrow">Your path</p>
        <h2 id="xp-path-title" className="mt-2 text-3xl font-bold tracking-[-0.025em] text-foreground md:text-4xl">
          Financial freedom, one step at a time.
        </h2>
        <p className="mt-3 text-base text-muted-foreground">Not sure where to begin? Every product fits a step. Start at the first one or jump to where you are.</p>
      </div>

      {/* step rail */}
      <div className="relative mt-10">
        <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-5 h-0.5 rounded-full bg-border">
          <motion.div
            className="h-full origin-left rounded-full bg-brand-fill"
            animate={{ scaleX: active / (STEPS.length - 1) }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div role="tablist" aria-label="Steps" className="relative grid grid-cols-5" onKeyDown={onTabKey}>
          {STEPS.map((s, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <button
                key={s.name}
                id={`xp-step-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="xp-step-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => {
                  setActive(i);
                  setTouched(true);
                }}
                onFocus={() => setHeld(true)}
                onBlur={() => setHeld(false)}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl px-1 pb-1 outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
              >
                <span
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 text-sm font-bold tabular-nums transition-all duration-300',
                    on && 'scale-110 border-brand-fill bg-brand-fill text-white shadow-[0_0_0_6px_var(--brand-soft)]',
                    done && 'border-brand-fill bg-card text-brand',
                    !on && !done && 'border-border bg-card text-muted-foreground group-hover:border-brand-line group-hover:text-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn('text-center text-xs font-bold leading-tight transition-colors sm:text-sm', on ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>
                  {s.name}
                </span>
                <span aria-hidden="true" className="h-0.5 w-10 overflow-hidden rounded-full bg-transparent">
                  {on && playing && (
                    <motion.span
                      key={`${active}-timer`}
                      className="block h-full origin-left rounded-full bg-brand-fill/60"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* panel */}
      <div id="xp-step-panel" role="tabpanel" aria-labelledby={`xp-step-${active}`} className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--xp-tile-shadow)]">
        <div aria-hidden="true" className="xp-dots absolute inset-0 opacity-60" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:p-10"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-brand">
                Step {active + 1} of {STEPS.length} · {step.name}
              </span>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-foreground [text-wrap:balance] md:text-3xl">{step.title}</h3>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{step.body}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                <Link to={step.cta.to} className="inline-flex items-center gap-2 rounded-xl bg-brand-fill px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover">
                  {step.cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {active < STEPS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActive(active + 1);
                      setTouched(true);
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Next: {STEPS[active + 1].name}
                  </button>
                )}
              </div>
            </div>
            <div className="relative flex flex-col justify-center gap-3">
              {step.products.map((id, k) => {
                const p = PRODUCTS[id];
                return (
                  <motion.div key={id} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 + k * 0.08, ease: [0.16, 1, 0.3, 1] }}>
                    <Link to={p.path} className="group relative flex items-center gap-4 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-line hover:shadow-lg">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand-fill group-hover:text-white">
                        <p.Icon className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold text-foreground">{p.name}</span>
                        <span className="block text-sm text-muted-foreground">{p.tagline}</span>
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-brand" aria-hidden="true" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
