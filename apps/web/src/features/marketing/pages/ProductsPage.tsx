import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  BookOpen,
  Calculator,
  FileSearch,
  FlaskConical,
  Handshake,
  Newspaper,
  NotebookPen,
  PiggyBank,
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductArt from '../components/ProductArt';


const ProductsPage = () => {
  const productItems = [
    {
      title: 'Algorithms',
      description: 'Automated trading strategies with backtested performance.',
      path: '/algos',
      Icon: BarChart3,
    },
    {
      title: 'Backtest',
      description: 'Backtest any strategy by chatting with AI — no code, real data.',
      path: '/backtest',
      Icon: FlaskConical,
    },
    {
      title: 'Tools',
      description: '20+ financial calculators for investments, tax, and planning.',
      path: '/tools',
      Icon: Calculator,
    },
    {
      title: 'Learn',
      description: 'Structured learning paths from basics to advanced topics.',
      path: '/learn',
      Icon: BookOpen,
    },
    {
      title: 'Fundakamental',
      description: 'Company research, AI reports, watchlists, and stock analysis.',
      path: '/fundakamental',
      Icon: FileSearch,
    },
    {
      title: 'Gini AI',
      description: 'AI-assisted finance guidance and investing support.',
      path: '/gini',
      Icon: Bot,
    },
    {
      title: 'Journal',
      description: 'Trading journal and market notes for disciplined decisions.',
      path: '/journal',
      Icon: NotebookPen,
    },
    {
      title: 'Newsletter',
      description: 'AI-curated market insights with plain-language analysis.',
      path: '/newsletter',
      Icon: Newspaper,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main id="main-content" className="pt-28 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="relative mb-12 max-w-2xl">
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-16 h-56 w-80 rounded-full bg-brand-soft blur-3xl opacity-80" />
            <p className="xt-eyebrow relative mb-3">Xtin Capital Suite</p>
            <h1 className="xt-title relative mb-4">Products</h1>
            <p className="relative text-gray-600">Explore each product and open its dedicated workspace.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {productItems.map((item) => {
              const CardContent = (
                <div className="relative flex h-full flex-col text-center">
                  <span aria-hidden="true" className="pointer-events-none absolute -inset-x-5 -top-5 h-24 bg-gradient-to-b from-brand-soft/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-gray-300 dark:text-slate-600">{String(productItems.indexOf(item) + 1).padStart(2, '0')}</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition duration-200 group-hover:border-brand-fill group-hover:bg-brand-fill group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>

                  <div className="flex flex-1 items-center justify-center py-3">
                    <span className="relative inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-soft via-brand-soft/60 to-transparent ring-1 ring-brand-line/70 text-brand overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1">
                      <span aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(circle_at_70%_20%,#000,transparent_65%)]" />
                      <span aria-hidden="true" className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-fill/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
                      <span className="relative h-[60px] w-[60px] drop-shadow-sm">
                        <ProductArt id={item.title} />
                      </span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-3 min-h-[6.25rem] lg:min-h-[6.25rem] text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>
                </div>
              );

              const cardClasses = "group relative overflow-hidden min-h-[20rem] rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-line hover:shadow-xl hover:shadow-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

              return (
                <Link
                  key={item.title}
                  to={item.path}
                  className={cardClasses}
                >
                  {CardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
