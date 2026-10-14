import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { IntroBackdrop, IntroHeroArt, CtaTexture } from '../../marketing/components/IntroKit';

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

/* --- SVG Icons --- */
const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
);
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);
const CertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
);
const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5 text-brand flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
);
const LockOpen = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
);
const AcademicIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
);
const BriefcaseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
);
const RocketIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
);
const SeedlingIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
);

/* --- Course Data --- */
const courseLevels = [
  {
    level: 'Beginner',
    tag: 'Free',
    tagColor: 'bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand',
    color: 'bg-brand-fill',
    borderColor: 'border-l-brand',
    courses: [
      { name: 'Personal Finance Fundamentals', lessons: 8 },
      { name: 'Introduction to Stock Markets', lessons: 10 },
      { name: 'Mutual Funds Deep Dive', lessons: 8 },
    ],
  },
  {
    level: 'Intermediate',
    tag: 'Popular',
    tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-l-blue-500',
    courses: [
      { name: 'Fundamental Analysis', lessons: 12 },
      { name: 'Technical Analysis', lessons: 10 },
      { name: 'Options & Derivatives', lessons: 10 },
      { name: 'Portfolio Management', lessons: 6 },
      { name: 'Tax Planning for Investors', lessons: 6 },
    ],
  },
  {
    level: 'Advanced',
    tag: 'Pro',
    tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-l-purple-500',
    courses: [
      { name: 'Commodity & Currency Markets', lessons: 6 },
      { name: 'IPO Analysis', lessons: 4 },
      { name: 'Introduction to Algo Trading', lessons: 8 },
      { name: 'Retirement Planning', lessons: 6 },
    ],
  },
];

const steps = [
  { num: '01', title: 'Pick a course', desc: 'Browse by level. Start anywhere.', icon: <BookIcon /> },
  { num: '02', title: 'Learn at your pace', desc: '10-20 min bite-sized lessons.', icon: <PlayIcon /> },
  { num: '03', title: 'Test yourself', desc: 'Quizzes after every module.', icon: <ChartIcon /> },
  { num: '04', title: 'Get certified', desc: 'Downloadable certificate.', icon: <CertIcon /> },
];

/* ======================================================
   LEARN INTRO - Edtech / Varsity-style learning page
   ====================================================== */
const LearnIntro = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Navbar />

      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <IntroBackdrop />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none bg-brand-soft" />

        <div className="relative max-w-4xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

            <motion.div variants={fadeUp}><IntroHeroArt id="Learn" /></motion.div>

            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-soft dark:bg-brand-soft border border-brand-line dark:border-brand-line text-brand dark:text-brand text-sm font-medium mb-8">
              <BookIcon />
              100% Free Forever
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-display font-semibold leading-[1.08] tracking-[-0.025em] mb-5">
              Learn investing,
              <br />
              <span className="text-brand">the right way</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              12+ structured courses from personal finance basics to algo trading. India-focused. Self-paced. Earn certificates.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/learn"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 text-base bg-brand-fill"
              >
                Start Learning Free
                <ArrowRight />
              </Link>
              <button
                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-slate-200 font-semibold px-10 py-4 rounded-xl hover:border-brand-line dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-all duration-200 text-base"
              >
                Browse Courses
              </button>
            </motion.div>

            {/* Stats pill */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-6 sm:gap-10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm px-8 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              {[
                { value: '12+', label: 'Courses' },
                { value: '100+', label: 'Lessons' },
                { value: '100%', label: 'Free' },
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

      {/* ======== VALUE STRIP ======== */}
      <section className="border-y border-gray-100 dark:border-slate-800/60 bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { icon: <ClockIcon />, text: '10-20 min lessons' },
              { icon: <BookIcon />, text: 'India-focused content' },
              { icon: <LockOpen />, text: 'Self-paced, no deadlines' },
              { icon: <CertIcon />, text: 'Earn certificates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                <span className="text-brand dark:text-brand">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Simple process</span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold mt-3 tracking-[-0.025em]">How it works</h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-brand-soft" />
            <div className="grid md:grid-cols-4 gap-8 md:gap-4">
              {steps.map((s, i) => (
                <motion.div key={s.num} variants={fadeUp} custom={i} className="relative text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-sm text-brand dark:text-brand">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-brand dark:text-brand">{s.num}</span>
                  <h3 className="font-semibold mt-1 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ======== COURSE CATALOG ======== */}
      <AnimatedSection id="courses" className="py-20 px-6 bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100/80 dark:border-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Course catalog</span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold mt-3 tracking-[-0.025em]">Pick your learning path</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">Structured from beginner to advanced. Start anywhere.</p>
          </motion.div>

          <div className="space-y-8">
            {courseLevels.map((level, li) => (
              <motion.div key={level.level} variants={fadeUp} custom={li}>
                {/* Level header */}
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{level.level}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${level.tagColor}`}>{level.tag}</span>
                </div>

                {/* Course cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {level.courses.map((c) => (
                    <div
                      key={c.name}
                      className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border-l-4 ${level.borderColor} border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base group-hover:text-brand dark:group-hover:text-brand transition-colors">{c.name}</h4>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">{c.lessons} lessons</p>
                        </div>
                        <span className="text-gray-300 dark:text-slate-600 group-hover:text-brand dark:group-hover:text-brand transition-colors ml-3">
                          <ArrowRight />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ======== WHY LEARN HERE ======== */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">The advantage</span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold mt-3 tracking-[-0.025em]">Why learn here</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <CheckIcon />, text: 'India-specific: real stocks, real tax rules, real instruments' },
              { icon: <CheckIcon />, text: 'Logical progression: each course builds on the last' },
              { icon: <CheckIcon />, text: 'No deadlines: truly self-paced, access never expires' },
              { icon: <CheckIcon />, text: 'Practical examples with real market data' },
              { icon: <CheckIcon />, text: 'Learn and apply within the same platform' },
              { icon: <CheckIcon />, text: 'Downloadable certificates for LinkedIn & resume' },
            ].map((b, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="flex items-start gap-3 bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100/80 dark:border-slate-700/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
                {b.icon}
                <span className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{b.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ======== WHO IT'S FOR ======== */}
      <AnimatedSection className="py-16 px-6 bg-gray-50/70 dark:bg-slate-900/40 border-y border-gray-100/80 dark:border-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-[-0.025em]">Who it's for</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <SeedlingIcon />, label: 'Complete Beginner', desc: 'Starting from scratch with zero knowledge', border: 'border-l-brand' },
              { icon: <BriefcaseIcon />, label: 'Working Professional', desc: 'Deepening investment knowledge', border: 'border-l-blue-500' },
              { icon: <RocketIcon />, label: 'Aspiring Trader', desc: 'Learning algo trading fundamentals', border: 'border-l-purple-500' },
              { icon: <AcademicIcon />, label: 'Student', desc: 'Building a strong financial foundation', border: 'border-l-amber-500' },
            ].map((p, i) => (
              <motion.div
                key={p.label}
                variants={fadeUp}
                custom={i}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 ${p.border} border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-brand dark:text-brand mb-4">{p.icon}</div>
                <h3 className="font-semibold mb-2">{p.label}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ======== PRICING ======== */}
      <AnimatedSection className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="text-brand dark:text-brand font-medium text-sm uppercase tracking-wider inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Pricing</span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold mt-3 tracking-[-0.025em]">100% Free. Always.</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl p-10 md:p-14 text-white relative overflow-hidden text-center shadow-xl shadow-brand/20 bg-brand-fill">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <LockOpen />
                <span>Our Mission</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-semibold mb-6 tracking-[-0.025em]">&#8377;0 Forever</h3>
              <p className="text-white/85 text-lg md:text-xl leading-relaxed mb-10">
                We believe in making India wealthy, not just rich. Education should never be a luxury. This is our contribution to India's second freedom movement &mdash; a financial movement for everyone.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
                {[
                  'All courses unlocked',
                  'Free certifications',
                  'Zero hidden fees',
                  'Real market case studies',
                  'Interactive quizzes',
                  'Ad-free experience'
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/85">
                    <span className="text-brand flex-shrink-0"><CheckIcon /></span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ======== FINAL CTA ======== */}
      <AnimatedSection className="py-24 md:py-32 px-6">
        <motion.div
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-16 relative overflow-hidden bg-brand-fill"
        >
          <CtaTexture />
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-white mb-4 tracking-[-0.025em]">
              Start learning today
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              All courses are 100% free. No prior knowledge needed. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/learn"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand font-bold px-10 py-4 rounded-xl hover:bg-brand-soft transition-all duration-200 shadow-lg hover:-translate-y-0.5"
              >
                Go to Courses
                <ArrowRight />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default LearnIntro;
