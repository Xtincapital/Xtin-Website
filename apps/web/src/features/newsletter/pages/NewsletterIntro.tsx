import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

/* --- Animation --- */
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

/* --- Sample Newsletter Previews (editorial content) --- */
const sampleArticles = [
  {
    category: 'Markets',
    title: "Sensex crosses 85,000 \u2014 here's what drove the rally",
    summary: 'An explainer on the key triggers behind the latest market surge, and whether it can sustain.',
    readTime: '3 min',
    date: 'Apr 12, 2026',
    accent: 'bg-emerald-500',
  },
  {
    category: 'Economy',
    title: 'RBI holds rates \u2014 what it means for your EMI',
    summary: 'The central bank kept the repo rate unchanged. We break down the impact on home loans, FDs, and debt funds.',
    readTime: '4 min',
    date: 'Apr 10, 2026',
    accent: 'bg-blue-500',
  },
  {
    category: 'IPO Watch',
    title: 'Ather Energy IPO: should you subscribe?',
    summary: "A plain-English look at the EV maker's financials, growth story, and whether the valuation makes sense.",
    readTime: '5 min',
    date: 'Apr 8, 2026',
    accent: 'bg-violet-500',
  },
];

/* --- SVG Icons --- */
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
);
const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);
const BoltIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
);
const CheckCircle = () => (
  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
);

/* ======================================================
   NEWSLETTER INTRO - Conversion-focused, editorial design
   Inspired by: Finshots, Morning Brew, The Ken
   ====================================================== */
const NewsletterIntro = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Navbar />

      {/* ======== HERO - Email capture above the fold ======== */}
      <section className="relative overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/60 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-green-100/50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-transparent blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-emerald-100/40 to-transparent dark:from-emerald-900/10 blur-[80px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100/80 dark:bg-emerald-900/20 border border-green-200/60 dark:border-emerald-700/30 text-green-700 dark:text-emerald-300 text-sm font-medium mb-8">
              <MailIcon />
              Free daily newsletter
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-[2.5rem] sm:text-5xl md:text-6xl font-display font-normal leading-[1.08] tracking-[-0.02em] mb-5">
              Understand Indian markets
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent">in 3 minutes a day</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">
              AI scans 500+ sources and delivers only what matters &mdash; in plain English, every morning at 8 AM.
            </motion.p>

            {/* Email Capture Form */}
            <motion.div variants={fadeUp} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-black/40 border border-gray-100 dark:border-slate-800">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 border-0 text-base"
                />
                <Link
                  to="/newsletter"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Subscribe free
                  <ArrowRight />
                </Link>
              </div>

              <p className="mt-4 text-sm text-gray-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                <LockIcon />
                No spam. Unsubscribe anytime.
              </p>
            </motion.div>

            {/* Social proof - reader avatars + count */}
            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-green-600', 'bg-teal-500'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold text-white ${bg}`}>
                    {['A', 'R', 'S', 'K', 'P'][i]}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Joined by <span className="font-semibold text-gray-700 dark:text-slate-200">10,000+</span> readers
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======== WHAT YOU GET - 3 bullet value props ======== */}
      <section className="border-y border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-12">
            {[
              { icon: <ClockIcon />, text: '3-minute read, every weekday at 8 AM' },
              { icon: <BoltIcon />, text: 'AI curates 500+ sources \u2014 zero jargon' },
              { icon: <LockIcon />, text: 'Free forever. No credit card needed' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                <span className="text-green-500 dark:text-emerald-400">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== PREVIEW - Recent editions (editorial) ======== */}
      <AnimatedSection className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-green-600 dark:text-emerald-400 font-medium text-sm uppercase tracking-wider">Recent editions</span>
            <h2 className="text-3xl md:text-4xl font-display font-normal mt-3 tracking-[-0.015em]">See what you've been missing</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">A taste of what lands in your inbox every morning</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {sampleArticles.map((a, i) => (
              <motion.article
                key={a.title}
                variants={fadeUp}
                custom={i}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-emerald-800/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Accent bar */}
                <div className={`h-1 ${a.accent}`} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-emerald-400">{a.category}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{a.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug mb-3 group-hover:text-green-600 dark:group-hover:text-emerald-400 transition-colors">{a.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed flex-1">{a.summary}</p>
                  <div className="mt-5 pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                      <ClockIcon /> {a.readTime}
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ======== WHAT'S INSIDE - Quick glance ======== */}
      <AnimatedSection className="py-16 px-6 bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100/80 dark:border-slate-800/40">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-normal tracking-[-0.015em]">Every edition covers</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Market Summary \u2014 Nifty, Sensex, FII/DII',
              "Sector Analysis \u2014 what's hot & why",
              'IPO Updates \u2014 listing analysis & picks',
              'Economic Indicators \u2014 RBI, inflation, GDP',
              'Regulatory Changes \u2014 SEBI, tax updates',
              'One Smart Idea \u2014 actionable investment tip',
            ].map((item, i) => (
              <motion.div key={item} variants={fadeUp} custom={i} className="flex items-start gap-3 bg-white dark:bg-slate-800/60 rounded-xl p-4 border border-gray-100/80 dark:border-slate-700/50">
                <CheckCircle />
                <span className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ======== HOW IT WORKS - Ultra-compact ======== */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="mb-14">
            <span className="text-green-600 dark:text-emerald-400 font-medium text-sm uppercase tracking-wider">How it works</span>
            <h2 className="text-3xl md:text-4xl font-display font-normal mt-3 tracking-[-0.015em]">AI does the heavy lifting</h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 dark:from-green-800/40 dark:via-emerald-800/40 dark:to-teal-800/40" />

            <div className="grid md:grid-cols-4 gap-8 md:gap-4">
              {[
                { step: '1', label: 'Scan', desc: '500+ sources scanned daily' },
                { step: '2', label: 'Score', desc: 'Ranked by relevance & impact' },
                { step: '3', label: 'Simplify', desc: 'Rewritten in plain English' },
                { step: '4', label: 'Deliver', desc: 'In your inbox at 8 AM' },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} custom={i} className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-green-200/50 dark:border-emerald-700/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold bg-gradient-to-br from-green-600 to-emerald-500 bg-clip-text text-transparent">{s.step}</span>
                  </div>
                  <h3 className="font-bold mb-1">{s.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ======== TESTIMONIAL STRIP ======== */}
      <section className="bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100/80 dark:border-slate-800/40 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: '"Replaced my 30-minute morning news doom-scroll."', name: 'Arjun K.', role: 'Software Engineer' },
              { quote: '"Finally, financial news I can actually understand."', name: 'Priya M.', role: 'MBA Student' },
              { quote: '"The only newsletter I open every single day."', name: 'Siddharth R.', role: 'CA, Mumbai' },
            ].map((t, i) => (
              <div key={i} className="text-center">
                <p className="text-sm text-gray-600 dark:text-slate-300 italic mb-3">{t.quote}</p>
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FINAL CTA ======== */}
      <AnimatedSection className="py-24 md:py-32 px-6">
        <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-normal mb-4 tracking-[-0.015em]">
            Start your morning smarter
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Join 10,000+ readers who understand Indian markets in 3 minutes a day. No jargon. No spam.
          </p>

          {/* CTA form */}
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-800">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 border-0 text-base"
              />
              <Link
                to="/newsletter"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Subscribe free
                <ArrowRight />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><ClockIcon /> Every weekday, 8 AM</span>
              <span className="flex items-center gap-1"><BoltIcon /> AI-curated</span>
              <span className="flex items-center gap-1"><LockIcon /> Free forever</span>
            </div>
          </div>
        </motion.div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default NewsletterIntro;
