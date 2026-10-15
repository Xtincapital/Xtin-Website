// The signed-in "Platform" home: a command center for the whole Xtin
// ecosystem. Standalone for now (route /platform-preview); to make it the
// real Platform page, render <PlatformHome /> for signed-in users in
// features/marketing/pages/LandingPages.tsx instead of <Hero /> + <ToolsSection />.
import { Fragment, Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ChatWidget from '../../../components/ChatWidget';
import SEO from '../../../components/SEO';
import { useAuth } from '../../../contexts/AuthContext';
import bundleSubscriptionService from '../../dashboard/services/bundleSubscriptionService';
import { cn } from '@/lib/utils';
import CommandSearch from '../components/CommandSearch';
import MarketClock from '../components/MarketClock';
import EcosystemBento from '../components/EcosystemBento';
import SipPlayground from '../components/SipPlayground';
import { ContinueLearning, MoneyTip, PlanCard } from '../components/SidePanels';
import JourneyPath from '../components/JourneyPath';
import CommunityBand from '../components/CommunityBand';
import { MARKETS, formatIn, greetingFor, marketStatus } from '../lib/marketClock';
import { GOALS, shortMoney, type GoalId } from '../lib/goals';
import { CYCLE_MS, GoalPicker, GoalPlanCard, StaticGoalArt } from '../components/HeroGoals';
import useRegion from '../../../hooks/useRegion';
import { PRODUCTS, PRODUCT_ORDER, type ProductId } from '../lib/catalog';
import '../platform.css';

// three.js is heavy, so the coin sculpture loads on its own after the page paints.
const MoneyShapes3D = lazy(() => import('../components/MoneyShapes3D'));

// Phones get a lighter coin sculpture (fewer coins, lower resolution).
function useWideScreen() {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

function canWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Headline words rise out of a blur one after another.
function RevealWords({ words, start, reduce }: { words: { text: string; sheen?: boolean }[]; start: number; reduce: boolean | null }) {
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            initial={reduce ? false : { opacity: 0, y: '0.35em', filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.75, delay: start + i * 0.07, ease: EASE }}
          >
            {w.sheen ? (
              <>
                <span className="xp-sheen">{w.text}</span>.
              </>
            ) : (
              w.text
            )}
          </motion.span>{' '}
        </Fragment>
      ))}
    </>
  );
}

function useMinuteClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

// Pro status per product, from the server only (same source as /dashboard).
function useProPlans() {
  const [pro, setPro] = useState<Partial<Record<ProductId, boolean>>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    bundleSubscriptionService
      .getUserActivePlans()
      .then((data) => {
        if (!alive) return;
        const subs = data?.userSubscriptions || {};
        const bundle = Boolean(subs.bundle);
        setPro({
          algos: Boolean(subs.algos) || bundle,
          gini: Boolean(subs.gini) || bundle,
          fundakamental: Boolean(subs.fundakamental) || bundle,
          journal: Boolean(subs.journal) || bundle,
          newsletter: Boolean(subs.newsletter) || bundle,
          learn: Boolean(subs.learn) || bundle,
        });
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);
  return { pro, loaded };
}

const PlatformHome = () => {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const now = useMinuteClock();
  const { pro, loaded } = useProPlans();

  const rawName = user?.first_name || (user?.user_metadata?.first_name as string | undefined) || user?.email?.split('@')[0] || '';
  const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';
  const nse = marketStatus(MARKETS[0], now);
  const [webgl] = useState(() => canWebGL());
  const wide = useWideScreen();

  const greeting = greetingFor(now);
  const line1 = name
    ? [...`${greeting},`.split(' ').map((text) => ({ text })), { text: name, sheen: true }]
    : `${greeting}.`.split(' ').map((text) => ({ text }));
  const line2 = 'What should your money become?'.split(' ').map((text) => ({ text }));

  // Goals cycle on their own (story-style) until the user picks one; hovering
  // the coins holds the current shape.
  const { symbol } = useRegion();
  const [goal, setGoal] = useState<GoalId>('home');
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const [yearsBy, setYearsBy] = useState<Partial<Record<GoalId, number>>>({});
  const goalDef = GOALS.find((g) => g.id === goal)!;
  const years = yearsBy[goal] ?? (symbol === '₹' ? goalDef.inr : goalDef.other).years;
  useEffect(() => {
    if (!auto || hold || reduce) return;
    const id = window.setTimeout(() => {
      const i = GOALS.findIndex((g) => g.id === goal);
      setGoal(GOALS[(i + 1) % GOALS.length].id);
    }, CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [auto, hold, reduce, goal]);
  const pickGoal = (id: GoalId) => {
    setAuto(false);
    setGoal(id);
  };
  const setGoalYears = (y: number) => {
    setAuto(false);
    setYearsBy((m) => ({ ...m, [goal]: y }));
  };

  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } };

  return (
    <div className="xp min-h-screen bg-background text-foreground">
      <SEO
        title="Platform"
        description="Your Xtin Capital command center: every product, calculator and course in one place."
        canonicalUrl="/platform-preview"
        noIndex
      />
      <Navbar />

      <main id="main-content">
        {/* ── Hero ─────────────────────────────────────────────── */}
        {/* not overflow-hidden: the search results must be able to drop over the next section */}
        <section
          className="group/hero relative z-10 pb-14 pt-28 md:pb-20 md:pt-32"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--hx', `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty('--hy', `${e.clientY - r.top}px`);
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="xp-dots absolute inset-0" />
            <div className="xp-spotlight absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/hero:opacity-100" />
            <div className="absolute right-[6%] top-20 hidden h-[30rem] w-[30rem] rounded-full bg-[rgba(226,194,115,0.2)] blur-[90px] md:block" />
            <div className="xp-blob -left-40 top-64 h-72 w-72 opacity-60" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-x-12 gap-y-6 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-y-8 lg:px-8">
            {/* greeting */}
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <motion.div {...rise(0)} className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold',
                    nse.state === 'open' ? 'border-brand-line bg-brand-soft text-brand' : 'border-border bg-card text-muted-foreground',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', nse.state === 'open' ? 'xp-live-dot bg-brand-fill' : nse.state === 'pre' ? 'bg-amber-500' : 'bg-muted-foreground/50')} aria-hidden="true" />
                  NSE {nse.state === 'open' ? 'is open' : nse.state === 'pre' ? 'pre-open' : 'is closed'} · {nse.note.replace(/^Pre-open · /, '')}
                </span>
                <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">
                  {formatIn(now, { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </motion.div>

              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-6xl">
                <span className="block">
                  <RevealWords words={line1} start={0.05} reduce={reduce} />
                </span>
                <span className="mt-2 block text-muted-foreground/80 [text-wrap:balance]">
                  <RevealWords words={line2} start={0.05 + line1.length * 0.07 + 0.08} reduce={reduce} />
                </span>
              </h1>
            </div>

            {/* the coins */}
            <motion.div
              className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-my-6 lg:-mr-6 lg:self-center"
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            >
              {webgl && !reduce ? (
                <Suspense
                  fallback={
                    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[600px]">
                      <div className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgba(226,194,115,0.35),rgba(22,163,74,0.12)_55%,transparent_72%)] blur-2xl" />
                    </div>
                  }
                >
                  <MoneyShapes3D
                    goal={goal}
                    symbol={symbol}
                    compact={!wide}
                    onActive={setHold}
                    tag={{ amount: shortMoney((symbol === '₹' ? goalDef.inr : goalDef.other).amount, symbol), when: `by ${new Date(now).getFullYear() + years}` }}
                  />
                </Suspense>
              ) : (
                <StaticGoalArt goal={goal} />
              )}
            </motion.div>

            {/* goal + plan + search */}
            <div className="min-w-0 lg:col-start-1 lg:row-start-2">
              <motion.div {...rise(0.25)}>
                <GoalPicker goal={goal} auto={auto && !hold} onPick={pickGoal} />
              </motion.div>
              <motion.div {...rise(0.32)} className="mt-4">
                <GoalPlanCard goal={goal} years={years} onYears={setGoalYears} symbol={symbol} />
              </motion.div>
              <motion.div {...rise(0.4)} className="relative z-20 mt-8">
                <p className="mb-2 text-xs font-bold text-muted-foreground">Or jump straight to anything on Xtin</p>
                <CommandSearch />
              </motion.div>

              {/* phones also get a launcher grid */}
              <motion.ul {...rise(0.45)} className="mt-8 grid grid-cols-4 gap-x-2 gap-y-4 md:hidden" aria-label="Products">
                {PRODUCT_ORDER.map((id) => {
                  const p = PRODUCTS[id];
                  return (
                    <li key={id}>
                      <Link to={p.path} className="group flex flex-col items-center gap-1.5 text-center">
                        <span className="xp-node flex h-14 w-14 items-center justify-center rounded-2xl border border-border text-brand transition group-active:scale-95">
                          <p.Icon className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
                        </span>
                        <span className="text-xs font-bold leading-tight text-foreground">{p.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </motion.ul>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-20 px-4 pb-24 sm:px-6 md:space-y-28 lg:px-8">
          <MarketClock />

          {/* ── Ecosystem ──────────────────────────────────────── */}
          <section aria-labelledby="xp-eco-title">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="xt-eyebrow">The ecosystem</p>
                <h2 id="xp-eco-title" className="mt-2 text-3xl font-bold tracking-[-0.025em] text-foreground md:text-4xl">
                  Eight products. One account.
                </h2>
                <p className="mt-3 text-base text-muted-foreground">One login and one plan for everything: what you learn here shapes what you plan, research and trade.</p>
              </div>
              <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                All products <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <EcosystemBento pro={pro} />
          </section>

          {/* ── Quick plan + you ───────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
            <SipPlayground />
            <div className="grid content-start gap-5">
              <ContinueLearning />
              <PlanCard pro={pro} loaded={loaded} />
              <MoneyTip />
            </div>
          </div>

          <JourneyPath />

          <CommunityBand />
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default PlatformHome;
