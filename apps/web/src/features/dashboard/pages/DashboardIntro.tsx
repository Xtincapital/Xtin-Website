import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { IntroBackdrop, IntroHeroArt } from '../../marketing/components/IntroKit';

const DashboardIntro = () => {
  return (
    <div className="relative min-h-screen bg-background text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <div className="absolute inset-x-0 top-0 h-[640px] overflow-hidden"><IntroBackdrop /></div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <IntroHeroArt id="Dashboard" />
          <span className="text-sm font-medium text-brand dark:text-brand tracking-wider uppercase inline-flex items-center gap-3 before:block before:h-px before:w-8 before:bg-current before:opacity-50 after:block after:h-px after:w-8 after:bg-current after:opacity-50">Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mt-2 mb-4 text-gray-900 dark:text-white tracking-[-0.025em]">Everything in One Place</h1>
          <p className="text-lg text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
            Your personal financial command center. Portfolio, courses, advisors, algorithms — one screen.
          </p>
        </div>

        {/* At a Glance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Data', value: 'Real-Time' },
            { label: 'Layout', value: 'Card-Based' },
            { label: 'Works On', value: 'All Devices' },
            { label: 'Cost', value: 'Free' },
          ].map((item) => (
            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 text-center border border-gray-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
              <p className="text-xl font-bold text-brand dark:text-brand">{item.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* What It Is */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 mb-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">What Is This?</h2>
          <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
            Your home screen after login. A bird's-eye view of everything you do on Xtin Capital — investments, learning, advisory sessions, algo performance, and more. No need to navigate feature by feature.
          </p>
        </section>

        {/* What You See */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 mb-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
          <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">What You'll See</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Portfolio Overview', desc: 'Current value, returns, today\'s P&L, asset allocation.' },
              { name: 'Performance Charts', desc: 'Daily/weekly/monthly returns vs Nifty & Sensex benchmarks.' },
              { name: 'Learning Progress', desc: 'Enrolled courses, completed lessons, quiz scores, streaks.' },
              { name: 'Algorithm Status', desc: 'Active/paused strategies, recent trades, P&L per algo.' },
              { name: 'Advisory Activity', desc: 'Upcoming appointments, recent chats, advisor recommendations.' },
              { name: 'Newsletter Archive', desc: 'Latest editions, bookmarks & searchable past issues.' },
              { name: 'Journal Entries', desc: 'Recent trading notes and decision logs.' },
              { name: 'Alerts & Notifications', desc: 'Price alerts, course updates, messages — one feed.' },
            ].map((s) => (
              <div key={s.name} className="border border-gray-100 dark:border-slate-800 rounded-lg p-4 bg-gray-50/50 dark:bg-slate-800/40">
                <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-slate-100">{s.name}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 mb-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
          <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">Why Use It</h2>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {[
              'Single page for all your financial data',
              'Live updates during market hours',
              'Highlights what needs your attention',
              'Fully private — only you see your data',
              'Responsive — works on phone, tablet & desktop',
              'Clean design, no ads, no clutter',
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span className="text-brand mt-0.5">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Who It's For */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 mb-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
          <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">Who It's For</h2>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {[
              'Every Xtin Capital user — it\'s the central hub',
              'Active investors monitoring portfolios & algos',
              'Learners tracking course progress',
              'Advisory users with upcoming appointments',
            ].map((w) => (
              <li key={w} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span className="text-gray-400 dark:text-slate-500">—</span>
                {w}
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 mb-16 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand-line transition-all duration-300">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Pricing</h2>
          <p className="text-gray-600 dark:text-slate-300 text-sm">
            <strong className="text-gray-900 dark:text-white">Free</strong> with every Xtin Capital account. No premium tier needed for the dashboard itself.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">See your financial picture</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Create your account and get your personal dashboard instantly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="px-8 py-3 bg-brand-fill hover:bg-brand-hover text-white font-semibold rounded-lg text-sm transition-colors">
              Go to Dashboard
            </Link>
            <Link to="/signup" className="px-8 py-3 border border-gray-200 dark:border-slate-700 hover:border-brand-line text-gray-600 dark:text-slate-200 font-semibold rounded-lg text-sm transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardIntro;
