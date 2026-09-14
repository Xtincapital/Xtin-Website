import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BrainCircuit, FileText, Search, TrendingUp, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const features = [
  {
    title: 'Company Research',
    description: 'Search listed businesses, review key metrics, and move faster from screening to conviction.',
    Icon: Search,
  },
  {
    title: 'AI Report Builder',
    description: 'Turn filings, statements, PDFs, and spreadsheets into structured investment research.',
    Icon: BrainCircuit,
  },
  {
    title: 'Watchlist Workflow',
    description: 'Track companies, signals, and follow-up questions from one focused research loop.',
    Icon: TrendingUp,
  },
];

const FundakamentalIntro = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/60 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950" />
          
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200 dark:border-emerald-700/50">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Fundamental Equity Research Demo
              </div>

              {/* Title */}
              <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                Research Companies with{' '}
                <span className="text-green-600 dark:text-emerald-400">Clear Data &amp; AI</span>
              </h1>

              {/* Subhead */}
              <p className="mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Fundakamental is the Xtin Capital research workspace for company analysis, financial statement review,
                document Q&amp;A, watchlists, and faster decision making.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.fundakamental.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
                >
                  <span>Open Fundakamental</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
                <Link
                  to="/products"
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  View Products
                </Link>
              </div>
            </div>

            {/* Research Card Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-green-100 dark:border-emerald-800/40">
                    <BarChart3 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold text-base text-slate-900 dark:text-white">Research Snapshot</p>
                    <p className="text-xs text-slate-400">Sample AI analysis preview</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  9.1 / 10
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Revenue quality', 'Margin trend', 'Debt profile', 'Watchlist signal'].map((item, index) => (
                  <div key={item} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{item}</p>
                    <p className="mt-2 font-bold text-slate-900 dark:text-slate-100">
                      {index === 3 ? 'Monitor Catalyst' : 'Strong Fundamentals'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="px-6 py-16 md:px-12 lg:px-24 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <article key={title} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 hover:border-green-300 dark:hover:border-emerald-500 transition-all duration-300">
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-green-600 dark:text-emerald-400 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FundakamentalIntro;
