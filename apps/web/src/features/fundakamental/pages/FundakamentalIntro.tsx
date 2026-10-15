import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BrainCircuit,
  FileText,
  Search,
  TrendingUp,
  ArrowRight,
  Check,
  Filter,
  Briefcase,
  Eye,
  MessageSquare,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { IntroBackdrop } from '../../marketing/components/IntroKit';
import useRegion from '@/hooks/useRegion';
import { billingFor } from '../store/usePlanStore';
import { formatPrice } from '../lib/currency';

const features = [
  {
    title: 'AI report from any statement',
    description:
      'Upload an annual report, balance sheet or spreadsheet (PDF, Excel, CSV up to 25 MB). Get health scores, key ratios, strengths, red flags and a Buy / Hold / Sell view written for your investing style.',
    Icon: BrainCircuit,
  },
  {
    title: 'Ask your report anything',
    description:
      'Chat with the document: "Why did margins fall?", "How much debt is due next year?". Answers come from the numbers in your file, with the source shown.',
    Icon: MessageSquare,
  },
  {
    title: 'Stock scanner',
    description:
      'Start from proven screens — undervalued gems, fast growers, quality compounders, income machines — or build your own filters across NSE and US stocks.',
    Icon: Filter,
  },
  {
    title: 'Portfolio tracker',
    description:
      'Add stocks, gold and cash. See live value, returns and CAGR in one place, in rupees or your own currency.',
    Icon: Briefcase,
  },
  {
    title: 'Watchlist with price targets',
    description:
      'Follow companies and set buy, sell or alert targets. See at a glance which ones have hit your price.',
    Icon: Eye,
  },
  {
    title: 'Company search & PDF export',
    description:
      'Search any listed Indian or US company in seconds, and download clean PDF reports to keep or share.',
    Icon: Download,
  },
];

const steps = [
  { title: 'Pick a company or upload a report', description: 'Search by name or ticker, or drop in a financial statement.', Icon: Upload },
  { title: 'Tell us how you invest', description: 'Value, growth, dividends or balanced — long or short horizon. The report is written for you.', Icon: Sparkles },
  { title: 'Read, question, decide', description: 'Scores, ratios and red flags in plain English. Ask follow-ups, then save it to your history.', Icon: FileText },
];

const freeFeatures = [
  '60K AI tokens every month (a few full reports)',
  'Search any NSE / US company',
  'Portfolio tracker and watchlist',
  'Stock scanner preview',
  'Report history',
];

const proFeatures = [
  '500K AI tokens every month — top up any time',
  'Run the full scanner on live data',
  'Interactive Q&A on every report',
  'PDF report exports',
  'Advanced technical indicators',
];

const FundakamentalIntro = () => {
  const { region } = useRegion();
  const bp = billingFor(region as any);
  return (
    <div className="min-h-screen bg-background text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
          <IntroBackdrop />
          
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand px-4 py-2 rounded-full text-sm font-medium mb-6 border border-brand-line dark:border-brand/50">
                <span className="w-2 h-2 bg-brand-fill rounded-full animate-pulse"></span>
                AI equity research for Indian & US stocks
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl mb-6 font-display font-bold leading-[1.02] tracking-[-0.025em] text-slate-900 dark:text-white">
                Research Companies with{' '}
                <span className="text-brand dark:text-brand">Clear Data &amp; AI</span>
              </h1>

              {/* Subhead */}
              <p className="mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Turn any annual report into a clear, plain-English analysis in minutes — scores, ratios, red flags and a
                verdict tailored to how you invest. Then screen stocks, track your portfolio and follow your watchlist.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/fundakamental"
                  className="bg-brand-fill hover:bg-brand-hover text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Try Fundakamental free</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/products"
                  className="bg-card border border-border hover:border-brand-line hover:bg-brand-soft text-foreground font-bold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  View Products
                </Link>
              </div>
            </div>

            {/* Research Card Preview */}
            <div className="rounded-2xl border border-border bg-card p-6 ring-8 ring-brand-soft">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-brand-fill/40 dark:text-brand border border-brand-line dark:border-brand-line">
                    <BarChart3 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold text-base text-slate-900 dark:text-white">Research Snapshot</p>
                    <p className="text-xs text-slate-400">Illustrative example, not a real company</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-soft dark:bg-brand-fill/50 px-3.5 py-1.5 text-xs font-bold text-brand dark:text-brand border border-brand-line dark:border-brand/50">
                  9.1 / 10
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Revenue quality', 'Growing three years running'],
                  ['Margin trend', 'Expanding'],
                  ['Debt profile', 'Falling each year'],
                  ['Watchlist signal', 'Near your buy target'],
                ].map(([item, value]) => (
                  <div key={item} className="rounded-xl border border-border bg-secondary/50 p-4">
                    <p className="xt-label">{item}</p>
                    <p className="mt-2 font-bold text-slate-900 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16 md:px-12 lg:px-24 border-t border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl md:text-4xl mb-10 text-center font-display font-bold tracking-[-0.025em] text-slate-900 dark:text-white">How it works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(({ title, description, Icon }, i) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-line">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-fill text-sm font-bold text-white">{i + 1}</span>
                    <Icon className="h-5 w-5 text-brand dark:text-brand" />
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="px-6 py-16 md:px-12 lg:px-24 bg-card border-t border-slate-200/60 dark:border-slate-800">
          <h2 className="text-3xl md:text-4xl mb-10 text-center font-display font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Everything you need to research a stock</h2>
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <article key={title} className="group p-8 bg-secondary/50 rounded-2xl border border-border hover:border-brand-line transition-colors duration-300">
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand transition-transform duration-300 group-hover:-translate-y-0.5">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Free vs Pro */}
        <section className="px-6 py-16 md:px-12 lg:px-24 border-t border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl mb-2 text-center font-display font-bold tracking-[-0.025em] text-slate-900 dark:text-white">Start free. Upgrade when it pays off.</h2>
            <p className="mb-10 text-center text-slate-600 dark:text-slate-400">No card needed to begin.</p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free</h3>
                <p className="mt-2 text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">{formatPrice(0, bp.currency)}</p>
                <ul className="mt-6 space-y-3">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md bg-brand-soft text-brand"><Check className="h-3 w-3" strokeWidth={3} /></span>{f}</li>
                  ))}
                </ul>
                <Link to="/fundakamental" className="mt-8 block rounded-xl border border-border py-3 text-center font-bold text-foreground transition-colors hover:border-brand-line hover:bg-brand-soft">
                  Get started
                </Link>
              </div>
              <div className="relative rounded-2xl border-2 border-brand bg-card p-8 ring-4 ring-brand-soft">
                <span className="absolute -top-3 left-8 rounded-full bg-brand-fill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Most popular</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro</h3>
                <p className="mt-2 text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {formatPrice(bp.monthly, bp.currency)}
                  <span className="text-base font-medium text-slate-500">/month</span>
                </p>
                <p className="text-sm text-slate-500">or {formatPrice(bp.yearly, bp.currency)}/year</p>
                <ul className="mt-6 space-y-3">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300"><span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md bg-brand-soft text-brand"><Check className="h-3 w-3" strokeWidth={3} /></span>{f}</li>
                  ))}
                </ul>
                <Link to="/fundakamental/pricing" className="mt-8 block rounded-xl bg-brand-fill py-3 text-center font-bold text-white transition-colors hover:bg-brand-hover">
                  Go Pro
                </Link>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-slate-500">
              Fundakamental is an educational research tool. It is not SEBI-registered and nothing here is investment advice.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FundakamentalIntro;
