import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { IntroHeroArt, CtaTexture } from '../../marketing/components/IntroKit';

/* ─── Animation Helpers ─────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Section = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Inline SVG Icons ──────────────────────────────────── */
const I = {
  bolt: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  ),
  chartBar: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  ),
  trendUp: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
  ),
  code: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
  ),
  search: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
  ),
  link: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
  ),
  play: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  doc: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  ),
  /* small icons */
  check: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
  ),
  arrowRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
  ),
  shieldCheck: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  server: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>
  ),
  noEntry: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
  ),
  /* strategy icons */
  momentum: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
  ),
  revert: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
  ),
  options: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 8v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  trend: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
  ),
  /* persona icons */
  briefcase: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  ),
  academic: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
  ),
  userChart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  ),
  refresh: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
  ),
  /* misc */
  globe: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  star: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
  ),
  upload: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
  ),
  wrench: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  ),
};

/* ─── Subtle Background Pattern ─────────────────────────── */
const DotGridBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-brand/30" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotGrid)" />
    </svg>
  </div>
);

/* ─── Data ──────────────────────────────────────────────── */
const steps = [
  { icon: I.search, title: 'Browse Strategies', desc: 'View algos with CAGR, win rate & drawdown stats', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
  { icon: I.code, title: 'Review the Logic', desc: 'Plain-English entry, exit & risk rules', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
  { icon: I.link, title: 'Connect Broker', desc: 'Link your account — supports major Indian brokers', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
  { icon: I.play, title: 'Go Live', desc: 'Auto-trades execute. Track every trade in real-time', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
];

const strategies = [
  { icon: I.momentum, title: 'Momentum / Breakout', desc: 'Rides strong price moves using RSI, MACD & Bollinger Bands', color: 'bg-brand-fill' },
  { icon: I.revert, title: 'Mean Reversion', desc: 'Bets that overextended prices snap back to their average', color: 'from-blue-500 to-cyan-600' },
  { icon: I.options, title: 'Options Selling', desc: 'Profits from time decay on Nifty & Bank Nifty options', color: 'from-violet-500 to-purple-600' },
  { icon: I.trend, title: 'Trend Following', desc: 'Captures large moves; sits out during choppy markets', color: 'from-amber-500 to-orange-600' },
];

const benefits = [
  { icon: I.noEntry, title: 'Zero Emotions', desc: 'Executes exactly as programmed — no fear, no greed' },
  { icon: I.bolt, title: 'Millisecond Speed', desc: 'Captures fleeting opportunities before you can blink' },
  { icon: I.chartBar, title: '10+ Years Backtested', desc: 'Every strategy tested on a decade of market data' },
  { icon: I.shieldCheck, title: 'Built-in Risk Mgmt', desc: 'Stop-loss & position sizing baked into every algo' },
  { icon: I.doc, title: 'Full Trade Log', desc: 'No black box — see every entry, exit & reason' },
  { icon: I.code, title: 'No Coding Needed', desc: 'Subscribe and deploy — zero programming required' },
];

const personas = [
  { icon: I.briefcase, label: 'Working Professional', problem: 'No time to watch charts all day', border: 'border-l-brand' },
  { icon: I.academic, label: 'Beginner Trader', problem: 'Wants to learn from automated trade logs', border: 'border-l-blue-500' },
  { icon: I.userChart, label: 'Experienced Trader', problem: 'Needs to remove emotional decisions', border: 'border-l-purple-500' },
  { icon: I.refresh, label: 'Passive Investor', problem: 'Seeks a set-and-forget approach', border: 'border-l-amber-500' },
];

const trustBadges = [
  { icon: I.shieldCheck, label: 'Transparent Logs', sub: 'Every trade recorded', color: 'text-brand dark:text-brand' },
  { icon: I.globe, label: 'NSE & BSE', sub: 'Both exchanges supported', color: 'text-brand dark:text-brand' },
  { icon: I.server, label: '99.9% Uptime', sub: 'Enterprise-grade infrastructure', color: 'text-brand dark:text-brand' },
  { icon: I.clock, label: '10+ Years', sub: 'Backtested historical data', color: 'text-brand dark:text-brand' },
];

/* ═══════════════════════════════════════════════════════════
   ALGORITHMS INTRO PAGE
   ═══════════════════════════════════════════════════════════ */
const AlgorithmsIntro = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      {/* Subtle global dot-grid background */}
      <DotGridBg />

      <Navbar />

      {/* ─────────── 1. HERO (Zerodha / Groww inspired — centered, warm, airy) ─────────── */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Soft gradient blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-soft dark:bg-brand-soft opacity-50 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-brand-soft dark:bg-brand-soft opacity-50 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full bg-brand-soft dark:bg-brand-soft opacity-40 blur-[80px] pointer-events-none" />

        {/* Minimal decorative SVG — rising line */}
        <svg className="absolute bottom-0 left-0 w-full h-32 pointer-events-none opacity-[0.04] dark:opacity-[0.06]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0 120 Q360 20 720 60 T1440 10" stroke="currentColor" strokeWidth="2" className="text-brand"/>
          <path d="M0 120 Q400 50 800 80 T1440 30" stroke="currentColor" strokeWidth="1.5" className="text-brand"/>
        </svg>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp}><IntroHeroArt id="Algorithms" /></motion.div>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-brand-soft dark:bg-brand-soft text-brand dark:text-brand px-4 py-2 rounded-full text-sm font-medium mb-8 border border-brand-line dark:border-brand-line">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
              AI-Powered Trading Systems
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-display font-bold leading-[1.1] mb-6 tracking-[-0.025em]">
              Invest smarter with{' '}
              <span className="text-brand">algorithms</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-500 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Pre-built trading strategies that run on NSE & BSE — no coding, no chart-watching. Just proven logic, working for you 24/5.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link
                to="/algos"
                className="inline-flex items-center justify-center gap-2 bg-brand-fill hover:bg-brand-hover text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 text-base"
              >
                Explore Algorithms
                {I.arrowRight}
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-slate-200 font-semibold px-10 py-4 rounded-xl hover:border-brand-line dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-all duration-200 text-base"
              >
                See How It Works
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────── 2. HOW IT WORKS ─────────── */}
      <Section id="how-it-works" className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="xt-eyebrow inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Simple Process</span>
            <h2 className="xt-title mt-2">How It Works</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">From browsing to live trading — in 4 simple steps</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector */}
            <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 via-purple-200 to-amber-200 dark:from-emerald-800 dark:via-blue-800 dark:via-purple-800 dark:to-amber-800 z-0" />

            {steps.map((step, i) => (
              <motion.div key={step.title} variants={fadeUp} custom={i} className="relative z-10">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center h-full">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    {step.icon}
                  </div>
                  <span className="inline-block bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full mb-3">Step {i + 1}</span>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────── 3. STRATEGY TYPES ─────────── */}
      <Section className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="xt-eyebrow inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Multiple Approaches</span>
            <h2 className="xt-title mt-2">Strategy Types</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">Choose from battle-tested strategies that match your trading style</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {strategies.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i}
                className="group bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:border-brand-line dark:hover:border-brand hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────── 4. WHY USE IT (BENEFITS) ─────────── */}
      <Section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="xt-eyebrow inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">The Edge</span>
            <h2 className="xt-title mt-2">Why Algorithmic Trading?</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">Let machines handle the math while you focus on living</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                custom={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-brand-soft text-brand dark:text-brand flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold mb-1.5">{b.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────── 5. PLATFORM FEATURES (2-COLUMN) ─────────── */}
      <Section className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="xt-eyebrow inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Platform</span>
            <h2 className="xt-title mt-2">Two Ways to Trade</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">Use our exclusive strategies or build your own</p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
            {/* XTIN Algos */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center mb-5 bg-brand-fill">
                {I.bolt}
              </div>
              <h3 className="text-xl font-semibold mb-2">XTIN Exclusive Algos</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Premium strategies built by our quant team.</p>
              <ul className="space-y-3 mb-6">
                {['AurumV — Systematic Gold Strategy', 'Bird Eye — Multi-Engine Portfolio', 'Gamma — 15-Minute Gold Strategy', 'Z1 — Systematic Investment Strategy'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <span className="text-brand mt-0.5 flex-shrink-0">{I.check}</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/algos" className="inline-flex items-center gap-2 text-brand dark:text-brand font-semibold text-sm hover:gap-3 transition-all">
                View Algorithms {I.arrowRight}
              </Link>
            </div>

            {/* AlgoMarket + Build */}
            <div className="rounded-2xl p-8 text-white relative overflow-hidden bg-brand-fill">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                    {I.wrench}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                    {I.upload}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Build & Publish</h3>
                <p className="text-white/85 text-sm mb-5">Create custom algorithms or publish your strategies on AlgoMarket</p>
                <ul className="space-y-3 mb-6">
                  {['Visual no-code algo builder', 'Full backtesting engine', 'Community marketplace (Q3 2026)', 'Revenue share for publishers'].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                      <span className="text-white/85 mt-0.5 flex-shrink-0">{I.check}</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/algos" className="inline-flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all border-b border-white/30 pb-0.5">
                  Learn More {I.arrowRight}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─────────── 6. WHO IT'S FOR ─────────── */}
      <Section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="xt-eyebrow inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">For Every Trader</span>
            <h2 className="xt-title mt-2">Who It's For</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">Whether you're starting out or scaling up — algos work for everyone</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((p, i) => (
              <motion.div
                key={p.label}
                variants={fadeUp}
                custom={i}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 ${p.border} border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-brand dark:text-brand mb-4">{p.icon}</div>
                <h3 className="text-base font-bold mb-2">{p.label}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 italic">"{p.problem}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────── 7. TRUST ─────────── */}
      <Section className="py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-[-0.025em]">Built for Trust & Reliability</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((t, i) => (
              <motion.div
                key={t.label}
                variants={fadeUp}
                custom={i}
                className="text-center p-5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-700 mb-3 ${t.color}`}>
                  {t.icon}
                </div>
                <h4 className="font-bold text-base mb-1">{t.label}</h4>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────── 8. PRICING ─────────── */}
      <Section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900/60">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="xt-eyebrow inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Transparent Pricing</span>
            <h2 className="xt-title mt-2">No Hidden Charges. Ever.</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700">
              <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                {I.search}
                <span>Browse</span>
              </div>
              <h3 className="text-3xl font-display font-bold mb-2 tracking-[-0.025em]">Free</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-5">to browse & view performance</p>
              <ul className="space-y-3">
                {['Browse all strategy performance', 'View CAGR, drawdown & win rates', 'Read plain-English logic', 'Compare strategies side-by-side'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <span className="text-brand mt-0.5 flex-shrink-0">{I.check}</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid */}
            <div className="rounded-2xl p-8 text-white relative overflow-hidden bg-brand-fill">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                  {I.bolt}
                  <span>Subscribe</span>
                </div>
                <h3 className="text-3xl font-display font-bold mb-2 tracking-[-0.025em]">Per-Publisher Pricing</h3>
                <p className="text-white/85 text-sm mb-5">Each publisher sets their strategy fee</p>
                <ul className="space-y-3">
                  {['Live automated execution', 'Real-time dashboard & alerts', 'Full trade log for every strategy', 'Cancel anytime — no lock-in'].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                      <span className="text-white/85 mt-0.5 flex-shrink-0">{I.check}</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-white/85 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Strategy subscriptions priced per publisher — no hidden charges.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─────────── 9. FINAL CTA ─────────── */}
      <Section className="py-24 px-6 md:px-12 lg:px-24">
        <motion.div
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-16 relative overflow-hidden bg-brand-fill"
        >
          <CtaTexture />
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-[-0.025em]">
              Let algorithms trade while you live your life
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              Browse strategies, review backtests, and deploy — all from your dashboard. No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/algos"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand font-bold px-10 py-4 rounded-xl hover:bg-brand-soft transition-all duration-200 shadow-lg hover:-translate-y-0.5"
              >
                Explore Algorithms
                {I.arrowRight}
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Create Free Account
              </Link>
            </div>
            <p className="text-white/85 text-sm mt-6">Free to browse. No commitment required.</p>
          </div>
        </motion.div>
      </Section>

      <Footer />
    </div>
  );
};

export default AlgorithmsIntro;
