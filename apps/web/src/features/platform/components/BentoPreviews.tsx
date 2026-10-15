// Live mini-previews for the ecosystem bento. Each one is a small, looping
// picture of what the product does, built from SVG and Motion. Numbers here
// are samples (each preview says so); nothing pretends to be the user's data.
// Loops only run while the tile is on screen.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from 'motion/react';
import { AlertTriangle, ArrowUp, Award, Check, LogIn, LogOut, Send, ShieldCheck } from 'lucide-react';
import useRegion from '../../../hooks/useRegion';
import { cn } from '@/lib/utils';
import { CALCULATORS, COURSES } from '../lib/catalog';

const EASE = [0.16, 1, 0.3, 1] as const;

export function SampleTag({ children = 'Sample', className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground', className)}>
      {children}
    </span>
  );
}

// `seen` flips once (one-shot reveals: bars, rings, counts); `inView` tracks
// visibility so loops pause off screen.
function useLive<T extends Element>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { margin: '-8% 0px -8% 0px' });
  const seen = useInView(ref, { once: true, margin: '-8% 0px -8% 0px' });
  const reduce = useReducedMotion();
  return { ref, inView, seen, reduce: !!reduce };
}

function CountUp({ to, decimals = 0, run, reduce, suffix = '' }: { to: number; decimals?: number; run: boolean; reduce: boolean; suffix?: string }) {
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return setV(to);
    if (!run) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [run, reduce, to]);
  return (
    <span className="tabular-nums">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Deterministic "random" so previews look the same on every visit.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── Gini ─────────────────────────────────────────────────────────────── */

const GINI_CHAT = [
  { q: 'Can we retire at 55?', a: 'Likely, if you raise your SIP by ₹6,000 a month. Your plan’s success odds move from 61% to 84%.' },
  { q: 'How big should our emergency fund be?', a: 'About ₹3.6 lakh, six months of expenses. You have ₹2.1 lakh, so add ₹25,000 a month until March.' },
  { q: 'Is our term cover enough?', a: 'You have ₹1 crore. With two children and a home loan, plan for about ₹1.8 crore.' },
];

const GINI_GOALS = [
  { name: 'Home down payment', year: 2030, pct: 68 },
  { name: 'Daughter’s education', year: 2038, pct: 41 },
  { name: 'Retire at 55', year: 2051, pct: 23 },
];

export function GiniPreview() {
  const { ref, inView, seen, reduce } = useLive<HTMLDivElement>();
  // `turn` only grows; the last three turns are on screen, newest at the
  // bottom, so the panel reads like a real conversation. Start at 2 so two
  // finished exchanges are already there.
  const [turn, setTurn] = useState(2);
  const [phase, setPhase] = useState<'ask' | 'think' | 'answer'>('ask');
  const [typed, setTyped] = useState(0);
  const current = GINI_CHAT[turn % GINI_CHAT.length];

  useEffect(() => {
    if (!inView) return;
    const len = current.a.length;
    if (reduce) {
      setPhase('answer');
      setTyped(len);
      return;
    }
    setPhase('ask');
    setTyped(0);
    let iv = 0;
    const timers = [
      window.setTimeout(() => setPhase('think'), 650),
      window.setTimeout(() => {
        setPhase('answer');
        iv = window.setInterval(() => setTyped((n) => (n >= len ? n : n + 2)), 22);
      }, 1800),
      window.setTimeout(() => setTurn((t) => t + 1), 1800 + len * 11 + 3600),
    ];
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(iv);
    };
  }, [turn, inView, reduce, current.a.length]);

  return (
    <div ref={ref} className="flex h-full flex-col gap-3">
      <div className="xp-panel rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-muted-foreground">Household net worth</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                ₹<CountUp to={48.6} decimals={1} run={seen} reduce={reduce} />L
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-brand">
                <ArrowUp className="h-3 w-3" aria-hidden="true" />
                12% this year
              </span>
            </div>
          </div>
          <SampleTag>Sample family</SampleTag>
        </div>
        <ul className="mt-4 space-y-3">
          {GINI_GOALS.map((g, idx) => (
            <li key={g.name}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {g.name} <span className="font-medium text-muted-foreground">· {g.year}</span>
                </span>
                <span className="font-bold tabular-nums text-foreground">{g.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--xp-panel-line)]">
                <motion.div
                  className="h-full origin-left rounded-full bg-brand-fill"
                  initial={{ scaleX: reduce ? g.pct / 100 : 0 }}
                  animate={seen ? { scaleX: g.pct / 100 } : undefined}
                  transition={{ duration: 1.1, delay: 0.15 + idx * 0.12, ease: EASE }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="xp-panel relative flex min-h-[14rem] flex-1 flex-col overflow-hidden rounded-2xl p-4" aria-hidden="true">
        <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_28%)]">
          <AnimatePresence initial={false}>
            {[turn - 2, turn - 1, turn].map((t) => {
              const pair = GINI_CHAT[t % GINI_CHAT.length];
              const live = t === turn;
              return (
                <motion.div
                  key={t}
                  layout={reduce ? false : 'position'}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: live ? 1 : 0.6, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex shrink-0 flex-col gap-2"
                >
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand-fill px-3.5 py-2 text-sm font-medium text-white">{pair.q}</div>
                  <div className="flex items-end gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">G</span>
                    <div className="min-h-[2.5rem] max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2 text-sm leading-relaxed text-foreground">
                      {!live || phase === 'answer' ? (
                        <>
                          {live ? pair.a.slice(0, typed) : pair.a}
                          {live && typed < pair.a.length && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-brand-fill" />}
                        </>
                      ) : phase === 'think' ? (
                        <span className="flex h-5 items-center gap-1">
                          {[0, 1, 2].map((d) => (
                            <motion.span
                              key={d}
                              className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">…</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <span className="flex-1 truncate text-sm text-muted-foreground">Ask about your family’s money…</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-fill text-white">
            <Send className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Fundakamental ────────────────────────────────────────────────────── */

const FUNDA_METRICS = [
  { label: 'ROE', value: '18.4%' },
  { label: 'Debt/equity', value: '0.31' },
  { label: 'P/E', value: '24.1' },
  { label: 'Sales YoY', value: '14.2%' },
];

export function FundakamentalPreview() {
  const { ref, seen, reduce } = useLive<HTMLDivElement>();
  const score = 78;
  const C = 2 * Math.PI * 42;
  return (
    <div ref={ref} className="xp-panel grid h-full grid-cols-1 items-center gap-4 rounded-2xl p-4 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_1fr]">
      <div className="flex items-center gap-4 sm:flex-col sm:gap-1">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--xp-panel-line)" strokeWidth="9" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgb(var(--brand))"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: reduce ? C * (1 - score / 100) : C }}
              animate={seen ? { strokeDashoffset: C * (1 - score / 100) } : undefined}
              transition={{ duration: 1.4, ease: EASE }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none text-foreground">
              <CountUp to={score} run={seen} reduce={reduce} />
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="sm:text-center">
          <div className="text-xs font-bold text-foreground">Health score</div>
          <div className="text-[11px] text-muted-foreground">Sample Co. · FMCG</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FUNDA_METRICS.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={seen ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.08, ease: EASE }}
            className="rounded-xl border border-border bg-card px-3 py-2"
          >
            <div className="text-[11px] font-semibold text-muted-foreground">{m.label}</div>
            <div className="text-base font-bold tabular-nums text-foreground">{m.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 sm:col-span-2 lg:col-span-1">
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-bold text-muted-foreground">
            <span>Sell</span>
            <span>Hold</span>
            <span>Buy</span>
          </div>
          <div className="relative h-2 rounded-full bg-gradient-to-r from-red-400/70 via-amber-300/80 to-green-500">
            <motion.span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow-md dark:border-[#1F1F1F]"
              initial={{ left: reduce ? '74%' : '50%' }}
              animate={seen ? { left: '74%' } : undefined}
              transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
            />
          </div>
          <div className="mt-1.5 text-xs font-bold text-foreground">
            View: <span className="text-brand">Buy</span> <span className="font-medium text-muted-foreground">for a long-term value investor</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand">
            <Check className="h-3 w-3" aria-hidden="true" /> Low debt
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Margins down 2 quarters
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">Illustrative example, not a real company.</p>
      </div>
    </div>
  );
}

/* ── Journal ──────────────────────────────────────────────────────────── */

export function JournalPreview() {
  const { ref, seen, reduce } = useLive<HTMLDivElement>();
  const { line, area, last, cells } = useMemo(() => {
    const rnd = seeded(7);
    const pts: number[] = [];
    let v = 40;
    for (let k = 0; k < 28; k++) {
      v += (rnd() - 0.38) * 9;
      pts.push(Math.max(8, Math.min(92, v)));
    }
    const W = 200;
    const H = 70;
    const xy = pts.map((p, k) => [(k / (pts.length - 1)) * W, H - (p / 100) * H] as const);
    const d = xy.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const r2 = seeded(11);
    return {
      line: d,
      area: `${d} L${W} ${H} L0 ${H} Z`,
      last: xy[xy.length - 1],
      cells: Array.from({ length: 20 }, () => {
        const x = r2();
        return x < 0.38 ? -(0.3 + r2() * 0.7) : 0.25 + r2() * 0.75;
      }),
    };
  }, []);

  return (
    <div ref={ref} className="xp-panel flex h-full flex-col justify-between gap-3 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground">Win rate</div>
            <div className="text-base font-bold text-foreground">
              <CountUp to={58} run={seen} reduce={reduce} suffix="%" />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground">Profit factor</div>
            <div className="text-base font-bold text-foreground">
              <CountUp to={1.62} decimals={2} run={seen} reduce={reduce} />
            </div>
          </div>
        </div>
        <SampleTag />
      </div>
      <svg viewBox="0 0 200 70" className="h-16 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="xp-jr-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(22 163 74)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(22 163 74)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#xp-jr-fill)"
          initial={{ opacity: reduce ? 1 : 0 }}
          animate={seen ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.9 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="rgb(var(--brand))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={seen ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.6, ease: EASE }}
        />
        <motion.circle
          cx={last[0]}
          cy={last[1]}
          r="3"
          fill="rgb(var(--brand))"
          initial={{ scale: reduce ? 1 : 0 }}
          animate={seen ? { scale: 1 } : undefined}
          transition={{ delay: 1.5 }}
        />
      </svg>
      <div>
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">Last 4 weeks</div>
        <div className="grid grid-cols-10 gap-1" aria-hidden="true">
          {cells.map((c, k) => (
            <motion.span
              key={k}
              className="aspect-square rounded-[4px]"
              style={{ background: c > 0 ? `rgba(22,163,74,${0.18 + c * 0.7})` : `rgba(224,72,72,${0.18 + -c * 0.6})` }}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={seen ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.3, delay: 0.6 + k * 0.025 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Backtest ─────────────────────────────────────────────────────────── */

const BT_PROMPT = 'Buy Nifty when the 20 EMA crosses above the 50 EMA';

export function BacktestPreview() {
  const { ref, inView, reduce } = useLive<HTMLDivElement>();
  const [step, setStep] = useState<'type' | 'run' | 'done'>(reduce ? 'done' : 'type');
  const [typed, setTyped] = useState(reduce ? BT_PROMPT.length : 0);
  const [cycle, setCycle] = useState(0);

  const { price, marks } = useMemo(() => {
    const rnd = seeded(23);
    const pts: number[] = [];
    let v = 30;
    for (let k = 0; k < 40; k++) {
      v += (rnd() - 0.42) * 7;
      pts.push(Math.max(6, Math.min(94, v)));
    }
    const xy = pts.map((p, k) => [(k / 39) * 200, 64 - (p / 100) * 60] as const);
    return {
      price: xy.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '),
      marks: [
        { k: 5, buy: true },
        { k: 14, buy: false },
        { k: 19, buy: true },
        { k: 30, buy: false },
        { k: 33, buy: true },
      ].map((m) => ({ ...m, x: xy[m.k][0], y: xy[m.k][1] })),
    };
  }, []);

  useEffect(() => {
    if (!inView || reduce) return;
    setStep('type');
    setTyped(0);
    const iv = window.setInterval(() => setTyped((n) => Math.min(BT_PROMPT.length, n + 1)), 38);
    const t1 = window.setTimeout(() => setStep('run'), BT_PROMPT.length * 38 + 300);
    const t2 = window.setTimeout(() => setStep('done'), BT_PROMPT.length * 38 + 1700);
    const t3 = window.setTimeout(() => setCycle((c) => c + 1), BT_PROMPT.length * 38 + 7000);
    return () => {
      window.clearInterval(iv);
      [t1, t2, t3].forEach(window.clearTimeout);
    };
  }, [inView, reduce, cycle]);

  return (
    <div ref={ref} className="xp-panel flex h-full flex-col gap-3 rounded-2xl p-4" aria-hidden="true">
      <div className="rounded-xl border border-border bg-card px-3 py-2 text-[13px] leading-snug text-foreground">
        {BT_PROMPT.slice(0, typed)}
        {step === 'type' && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-brand-fill" />}
      </div>
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {step === 'run' && (
            <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Testing on 10 years of daily data…</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--xp-panel-line)]">
                <motion.div className="h-full origin-left rounded-full bg-brand-fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.3, ease: 'easeInOut' }} />
              </div>
            </motion.div>
          )}
          {step === 'done' && (
            <motion.div key={`done-${cycle}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
              <svg viewBox="0 0 200 68" className="w-full flex-1 overflow-visible" preserveAspectRatio="none">
                <motion.path
                  d={price}
                  fill="none"
                  stroke="currentColor"
                  className="text-muted-foreground/60"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                />
              </svg>
              {/* markers as HTML so they stay round when the SVG stretches */}
              <div className="pointer-events-none absolute inset-x-0 top-0" style={{ bottom: '1.5rem' }}>
                {marks.map((m, k) => (
                  <motion.span
                    key={k}
                    className={cn(
                      'absolute flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full text-white shadow',
                      m.buy ? 'bg-brand-fill' : 'bg-red-500',
                    )}
                    style={{ left: `${(m.x / 200) * 100}%`, top: `calc(${(m.y / 68) * 100}% - 8px)` }}
                    initial={{ scale: reduce ? 1 : 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: reduce ? 0 : 0.8 + k * 0.12, type: 'spring', stiffness: 420, damping: 18 }}
                  >
                    {m.buy ? <LogIn className="h-2.5 w-2.5" /> : <LogOut className="h-2.5 w-2.5" />}
                  </motion.span>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>
                  <span className="text-brand">●</span> entry <span className="ml-1 text-red-500">●</span> exit
                </span>
                <SampleTag>Sample run</SampleTag>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Algorithms ───────────────────────────────────────────────────────── */

const ALGOS = [
  { name: 'Momentum / Breakout', desc: 'Rides strong price moves using RSI, MACD & Bollinger Bands.', rules: ['New 20-day high', 'Trailing stop-loss', '1% risk per trade'] },
  { name: 'Mean reversion', desc: 'Bets that overextended prices snap back to their average.', rules: ['RSI deeply oversold', 'Back at the average', 'Fixed stop-loss'] },
  { name: 'Options selling', desc: 'Earns from time decay on Nifty & Bank Nifty options.', rules: ['Sell OTM options', 'At 50% of premium', 'Hedged, capped loss'] },
  { name: 'Trend following', desc: 'Captures large moves; sits out during choppy markets.', rules: ['Fast avg above slow', 'Trend flips', 'Size by volatility'] },
];
const RULE_ICONS = [LogIn, LogOut, ShieldCheck];
const RULE_NAMES = ['Entry', 'Exit', 'Risk'];

export function AlgosPreview() {
  const { ref, inView, reduce } = useLive<HTMLDivElement>();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % ALGOS.length), 3600);
    return () => window.clearInterval(id);
  }, [inView, reduce]);
  const a = ALGOS[i];
  return (
    <div ref={ref} className="xp-panel flex h-full flex-col rounded-2xl p-4" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -14, transition: { duration: 0.18 } }}
          transition={{ duration: 0.32, ease: EASE }}
          className="flex-1"
        >
          <div className="text-sm font-bold text-foreground">{a.name}</div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.desc}</p>
          <ul className="mt-3 space-y-1.5">
            {a.rules.map((r, k) => {
              const Icon = RULE_ICONS[k];
              return (
                <li key={r} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', k === 1 ? 'text-red-500' : 'text-brand')} />
                  <span className="w-9 shrink-0 font-bold text-foreground">{RULE_NAMES[k]}</span>
                  <span className="truncate text-muted-foreground">{r}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {ALGOS.map((_, k) => (
            <span key={k} className={cn('h-1.5 rounded-full transition-all duration-300', k === i ? 'w-5 bg-brand-fill' : 'w-1.5 bg-[var(--xp-panel-line)]')} />
          ))}
        </div>
        <SampleTag>Example rules</SampleTag>
      </div>
    </div>
  );
}

/* ── Tools ────────────────────────────────────────────────────────────── */

const SHORT: Record<string, string> = {
  '/tools/sip': 'SIP',
  '/tools/step-up-sip': 'Step-up',
  '/tools/lumpsum': 'Lumpsum',
  '/tools/fd': 'FD',
  '/tools/ppf': 'PPF',
  '/tools/nps': 'NPS',
  '/tools/income-tax': 'Tax',
  '/tools/retirement': 'Retire',
  '/tools/cagr': 'CAGR',
  '/tools/swp': 'SWP',
  '/tools/inflation': 'Inflation',
  '/tools/compound-interest': 'Interest',
};

export function ToolsPreview() {
  const { ref, inView, reduce } = useLive<HTMLDivElement>();
  const { region } = useRegion();
  const chips = useMemo(
    () => CALCULATORS.filter((c) => SHORT[c.path] && (region === 'IN' || !c.indiaOnly)).slice(0, 9).map((c) => SHORT[c.path]),
    [region],
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % chips.length), 1100);
    return () => window.clearInterval(id);
  }, [inView, reduce, chips.length]);
  return (
    <div ref={ref} className="xp-panel grid h-full grid-cols-3 content-center gap-2 rounded-2xl p-4" aria-hidden="true">
      {chips.map((c, k) => (
        <div key={c} className="relative flex h-11 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-foreground">
          {k === i && (
            <motion.span layoutId="xp-tools-hi" className="absolute inset-0 rounded-xl bg-brand-fill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
          )}
          <span className={cn('relative transition-colors duration-200', k === i && 'text-white')}>{c}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Learn ────────────────────────────────────────────────────────────── */

const LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export function LearnPreview() {
  const { ref, seen, reduce } = useLive<HTMLDivElement>();
  const rows = LEVELS.map((l) => {
    const mods = COURSES.filter((m) => m.difficulty === l.id);
    return { ...l, courses: mods.length, lessons: mods.reduce((s, m) => s + (m.lessons || 0), 0) };
  });
  const max = Math.max(...rows.map((r) => r.lessons), 1);
  return (
    <div ref={ref} className="xp-panel flex h-full flex-col justify-between gap-3 rounded-2xl p-4">
      <ul className="space-y-3">
        {rows.map((r, k) => (
          <li key={r.id}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-bold text-foreground">{r.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {r.courses} courses · {r.lessons} lessons
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--xp-panel-line)]">
              <motion.div
                className="h-full origin-left rounded-full bg-brand-fill"
                style={{ opacity: 1 - k * 0.22 }}
                initial={{ scaleX: reduce ? r.lessons / max : 0 }}
                animate={seen ? { scaleX: r.lessons / max } : undefined}
                transition={{ duration: 1, delay: 0.1 + k * 0.12, ease: EASE }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Award className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
        <span className="text-xs font-semibold text-foreground">Certificates you can verify by QR</span>
      </div>
    </div>
  );
}

/* ── Newsletter ───────────────────────────────────────────────────────── */

const HEADLINES = [
  { tag: 'Markets', title: 'Sensex crosses 85,000: what drove the rally' },
  { tag: 'Economy', title: 'RBI holds rates: what it means for your EMI' },
  { tag: 'IPO', title: 'Ather Energy IPO: should you subscribe?' },
];

export function NewsletterPreview() {
  const { ref, inView, reduce } = useLive<HTMLDivElement>();
  const [top, setTop] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setTop((x) => (x + 1) % HEADLINES.length), 3200);
    return () => window.clearInterval(id);
  }, [inView, reduce]);
  return (
    <div ref={ref} className="xp-panel relative flex h-full flex-col rounded-2xl p-4" aria-hidden="true">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Every day, 8:00 AM</span>
        <SampleTag />
      </div>
      <div className="relative mt-3 flex-1">
        {HEADLINES.map((h, k) => {
          const depth = (k - top + HEADLINES.length) % HEADLINES.length;
          return (
            <motion.div
              key={h.title}
              className="absolute inset-x-0 top-0 rounded-xl border border-border bg-card p-3 shadow-sm"
              animate={{ y: depth * 12, scale: 1 - depth * 0.05, opacity: depth === 2 ? 0.55 : 1, zIndex: 3 - depth }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26 }}
              style={{ transformOrigin: 'top center' }}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand">{h.tag}</span>
              <div className="mt-1 text-sm font-bold leading-snug text-foreground">{h.title}</div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">3 min read · plain English</div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {['Nifty & Sensex', 'FII / DII', 'IPOs', 'RBI & macro'].map((t) => (
          <span key={t} className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
