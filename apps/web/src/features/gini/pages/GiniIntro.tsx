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
  ai: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
    </svg>
  ),
};

/* ─── Dot Grid Background ───────────────────────────────── */
const DotGridBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="giniDotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-gray-200 dark:fill-slate-800" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#giniDotGrid)" />
    </svg>
  </div>
);

export default function GiniIntro() {
  const features = [
    {
      icon: Icons.ai,
      title: 'AI-Powered Advisor',
      desc: 'Get personalized financial advice powered by advanced AI technology',
      color: 'bg-primary/10 ring-1 ring-primary/15 text-primary dark:text-success'
    },
    {
      icon: Icons.chat,
      title: '24/7 Chat Support',
      desc: 'Ask questions anytime and get instant responses from your AI advisor',
      color: 'bg-primary/10 ring-1 ring-primary/15 text-primary dark:text-success'
    },
    {
      icon: Icons.shield,
      title: 'Personalized Plans',
      desc: 'Receive tailored financial strategies based on your unique goals',
      color: 'bg-primary/10 ring-1 ring-primary/15 text-primary dark:text-success'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <AnimatedSection className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <DotGridBg />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="font-display text-5xl md:text-6xl font-normal tracking-[-0.02em] mb-6 text-gray-900 dark:text-white">
              Gini AI Advisor
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your personal AI financial advisor available 24/7 for guidance on investing, taxes, and wealth building
            </p>
          </motion.div>
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <Link
              to="/gini"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Chat with Gini AI
              {Icons.arrowRight}
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2 custom={0} initial="hidden" animate="visible" variants={fadeUp} className="font-display text-4xl font-normal tracking-[-0.01em] mb-16 text-center text-gray-900 dark:text-white">
            Why Choose Gini AI?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="p-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2 custom={0} initial="hidden" animate="visible" variants={fadeUp} className="text-4xl font-display font-normal mb-12 text-center text-gray-900 dark:text-white tracking-[-0.015em]">
            What You Get
          </motion.h2>
          <div className="space-y-4">
            {[
              'Personalized financial advice tailored to your situation',
              'Save thousands by avoiding costly advisor fees',
              'Instant answers to your investment questions',
              'Portfolio analysis and optimization recommendations',
              'Tax planning and retirement strategies',
            ].map((benefit, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                {Icons.check}
                <span className="text-gray-800 dark:text-gray-200">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}
