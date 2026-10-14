import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

/* ─── Animation Helpers ─────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const AnimatedSection = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.section
      ref={ref} id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── SVG Icons ─────────────────────────────────────────── */
const Icons = {
  calculator: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
  ),
  cursor: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
  ),
  chartBar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  ),
  save: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  lockOpen: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
  ),
  noSignup: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
  ),
  flag: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  ),
  download: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
  ),
  check: (
    <svg className="w-5 h-5 text-brand flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
  ),
  /* Benefit Icons */
  zap: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  ),
  compare: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
  ),
  doc: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  ),
  /* Persona Icons */
  seedling: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  ),
  briefcase: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  ),
  academic: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
  ),
  trendUp: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
  ),
};

/* ─── Dot Grid Background ───────────────────────────────── */
const DotGridBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="toolsDotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-gray-200 dark:fill-slate-800" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#toolsDotGrid)" />
    </svg>
  </div>
);

/* ─── Data ──────────────────────────────────────────────── */

const howItWorks = [
  { icon: Icons.calculator, title: 'Choose a Calculator', desc: 'Browse 20+ tools by category — investment, tax, retirement & more', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
  { icon: Icons.cursor, title: 'Enter Your Numbers', desc: 'Simple inputs with clear labels — no financial jargon', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
  { icon: Icons.chartBar, title: 'Get Instant Results', desc: 'Precise calculations with visual charts & breakdowns', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
  { icon: Icons.save, title: 'Compare & Save', desc: 'Run multiple scenarios, save results & export as PDF', color: 'bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand' },
];

const calculatorCategories = [
  {
    level: 'Investment Calculators',
    borderColor: 'border-l-brand',
    tools: [
      { name: 'SIP Calculator', desc: 'Monthly SIP → projected corpus over time' },
      { name: 'Lumpsum Calculator', desc: 'One-time investment → future value' },
      { name: 'CAGR Calculator', desc: 'Compound annual growth rate' },
      { name: 'Step-up SIP', desc: 'Growth with increasing monthly investments' },
      { name: 'SWP Calculator', desc: 'Systematic withdrawal planning' },
      { name: 'ELSS Calculator', desc: 'Tax-saving equity linked schemes' },
      { name: 'Real Estate', desc: '4-Filter Framework for property analysis' },
    ],
  },
  {
    level: 'Deposit & Savings',
    borderColor: 'border-l-blue-500',
    tools: [
      { name: 'FD Calculator', desc: 'Fixed deposit interest earnings' },
      { name: 'RD Calculator', desc: 'Recurring deposit maturity amount' },
      { name: 'Compound Interest', desc: 'Compounding at different frequencies' },
      { name: 'Simple Interest', desc: 'Basic interest on loans or deposits' },
      { name: 'SSY Calculator', desc: 'Sukanya Samriddhi Yojana savings' },
    ],
  },
  {
    level: 'Retirement Planning',
    borderColor: 'border-l-purple-500',
    tools: [
      { name: 'Retirement Calculator', desc: 'Corpus & savings needed to retire' },
      { name: 'PPF Calculator', desc: 'Public Provident Fund returns' },
      { name: 'NPS Calculator', desc: 'National Pension Scheme benefits' },
      { name: 'EPF Calculator', desc: 'Employee Provident Fund balance' },
      { name: 'Gratuity Calculator', desc: 'Gratuity benefits from employment' },
    ],
  },
  {
    level: 'Tax & Inflation',
    borderColor: 'border-l-amber-500',
    tools: [
      { name: 'Income Tax Calculator', desc: 'Old vs new regime comparison' },
      { name: 'Inflation Calculator', desc: 'Adjust values for inflation over time' },
      { name: 'HRA Calculator', desc: 'House Rent Allowance exemptions' },
    ],
  },
];

const benefits = [
  { icon: Icons.zap, title: 'Instant Results', desc: 'Enter numbers, get precise answers — no waiting, no loading' },
  { icon: Icons.flag, title: 'India-Specific', desc: 'Uses Indian tax rules, instruments, conventions & real rates' },
  { icon: Icons.lockOpen, title: 'No Signup Needed', desc: 'Use all calculators immediately — zero barriers' },
  { icon: Icons.compare, title: 'Compare Scenarios', desc: 'SIP vs lumpsum, old vs new tax regime — side by side' },
  { icon: Icons.doc, title: 'Save & Export PDF', desc: 'Create an account to save results and generate reports' },
  { icon: Icons.chat, title: 'No Jargon', desc: 'Every input is explained in plain English — beginner-friendly' },
];

const personas = [
  { icon: Icons.seedling, label: 'First-time Investor', desc: 'Curious about SIP, FD, or mutual funds — needs quick answers', border: 'border-l-brand' },
  { icon: Icons.briefcase, label: 'Salaried Professional', desc: 'Planning tax savings, HRA calculations & retirement corpus', border: 'border-l-blue-500' },
  { icon: Icons.academic, label: 'Student', desc: 'Learning personal finance with practical tools', border: 'border-l-purple-500' },
  { icon: Icons.trendUp, label: 'Experienced Investor', desc: 'Comparing scenarios, optimizing returns & running projections', border: 'border-l-amber-500' },
];

/* ═══════════════════════════════════════════════════════════
   TOOLS INTRO PAGE
   ═══════════════════════════════════════════════════════════ */
const ToolsIntro = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      {/* Subtle global dot-grid background */}
      <DotGridBg />

      <Navbar />

      {/* ─────────── 1. HERO ─────────── */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Soft gradient blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-soft dark:bg-brand-soft opacity-50 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-brand-soft dark:bg-brand-soft opacity-50 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full bg-brand-soft dark:bg-brand-soft opacity-40 blur-[80px] pointer-events-none" />

        {/* Decorative SVG line */}
        <svg className="absolute bottom-0 left-0 w-full h-32 pointer-events-none opacity-[0.04] dark:opacity-[0.06]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0 120 Q360 20 720 60 T1440 10" stroke="currentColor" strokeWidth="2" className="text-brand"/>
          <path d="M0 120 Q400 50 800 80 T1440 30" stroke="currentColor" strokeWidth="1.5" className="text-brand"/>
        </svg>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-soft dark:bg-brand-soft border border-brand-line dark:border-brand-line text-brand dark:text-brand text-sm font-medium mb-8">
              {Icons.calculator}
              20+ Free Calculators
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-display font-semibold leading-[1.05] tracking-[-0.025em] mb-5">
              Plan your finances,
              <br />
              <span className="text-brand">with precision</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              SIP, tax, retirement, loans & more — free calculators with instant results, built for Indian investors. No signup. No jargon.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 text-base bg-brand-fill"
              >
                Open Calculators
                {Icons.arrowRight}
              </Link>
              <button
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-slate-200 font-semibold px-10 py-4 rounded-xl hover:border-brand-line dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-all duration-200 text-base"
              >
                Browse Categories
              </button>
            </motion.div>

            {/* Stats pill */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-6 sm:gap-10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm px-8 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              {[
                { value: '20+', label: 'Calculators' },
                { value: '100%', label: 'Free' },
                { value: 'Instant', label: 'Results' },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />}
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">{s.value}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────── 2. VALUE STRIP ─────────── */}
      <section className="border-y border-gray-100 dark:border-slate-800/60 bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { icon: Icons.lockOpen, text: 'No signup needed' },
              { icon: Icons.flag, text: 'India-specific rules' },
              { icon: Icons.clock, text: 'Instant results' },
              { icon: Icons.download, text: 'Save & export PDF' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                <span className="text-brand dark:text-brand">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── 3. HOW IT WORKS ─────────── */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider">Simple process</span>
            <h2 className="xt-title mt-3">How it works</h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-green-200 via-blue-200 via-purple-200 to-amber-200 dark:from-green-800/40 dark:via-blue-800/40 dark:via-purple-800/40 dark:to-amber-800/40" />
            <div className="grid md:grid-cols-4 gap-8 md:gap-4">
              {howItWorks.map((step, i) => (
                <motion.div key={step.title} variants={fadeUp} custom={i} className="relative text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-sm ${step.color}`}>
                    {step.icon}
                  </div>
                  <span className="inline-block bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full mb-3">Step {i + 1}</span>
                  <h3 className="text-base font-bold mb-1.5">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─────────── 4. CALCULATOR CATEGORIES ─────────── */}
      <AnimatedSection id="categories" className="py-20 px-6 bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100/80 dark:border-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider">Calculator suite</span>
            <h2 className="xt-title mt-3">Every tool you need</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">20+ calculators organized by purpose — from your first SIP to retirement planning.</p>
          </motion.div>

          <div className="space-y-8">
            {calculatorCategories.map((cat, ci) => (
              <motion.div key={cat.level} variants={fadeUp} custom={ci}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{cat.level}</h3>
                </div>

                {/* Tool cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className={`bg-white dark:bg-slate-800 rounded-xl p-5 border-l-4 ${cat.borderColor} border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base group-hover:text-brand dark:group-hover:text-brand transition-colors">{tool.name}</h4>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">{tool.desc}</p>
                        </div>
                        <span className="text-gray-300 dark:text-slate-600 group-hover:text-brand dark:group-hover:text-brand transition-colors ml-3">
                          {Icons.arrowRight}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Featured: Xtin Gini */}
          <motion.div variants={fadeUp} className="mt-10">
            <div className="rounded-2xl p-8 text-white relative overflow-hidden bg-brand-fill">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Featured Tool
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Xtin Gini — AI Financial Planner</h3>
                  <p className="text-white/85 text-sm max-w-md">Get personalized financial advice from our AI-powered expert. Tax planning, investment strategy & goal-based recommendations.</p>
                </div>
                <Link
                  to="/gini"
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand font-bold px-8 py-3.5 rounded-xl hover:bg-brand-soft transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex-shrink-0"
                >
                  Try Xtin Gini
                  {Icons.arrowRight}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─────────── 5. WHY USE THESE (BENEFITS) ─────────── */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider">The advantage</span>
            <h2 className="xt-title mt-3">Why use these</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </AnimatedSection>

      {/* ─────────── 6. WHO IT'S FOR ─────────── */}
      <AnimatedSection className="py-16 px-6 bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100/80 dark:border-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="xt-section">Who it's for</h2>
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
                <h3 className="font-bold mb-2">{p.label}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─────────── 7. PRICING ─────────── */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="xt-title mt-3">100% Free. Always.</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl p-10 md:p-14 text-white relative overflow-hidden text-center shadow-xl shadow-brand/20 bg-brand-fill">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                {Icons.lockOpen}
                <span>No Hidden Charges</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold mb-6">&#8377;0 Forever</h3>
              <p className="text-white/85 text-lg md:text-xl leading-relaxed mb-10">
                Every calculator is completely free. Create an account to save your calculations and download PDF reports.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
                {[
                  'All 20+ calculators free',
                  'No signup required',
                  'Indian tax rules built-in',
                  'Compare scenarios instantly',
                  'Save & export results',
                  'Ad-free experience',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/85">
                    <span className="text-brand flex-shrink-0">{Icons.check}</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─────────── 8. FINAL CTA ─────────── */}
      <AnimatedSection className="py-24 md:py-32 px-6">
        <motion.div
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-16 relative overflow-hidden bg-brand-fill"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl text-white mb-4 font-semibold">
              Start calculating today
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              20+ free calculators. No signup needed. Instant results with Indian tax rules & conventions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand font-bold px-10 py-4 rounded-xl hover:bg-brand-soft transition-all duration-200 shadow-lg hover:-translate-y-0.5"
              >
                Open Calculators
                {Icons.arrowRight}
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Create Free Account
              </Link>
            </div>
            <p className="text-white/85 text-sm mt-6">Free forever. No credit card required.</p>
          </div>
        </motion.div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default ToolsIntro;
