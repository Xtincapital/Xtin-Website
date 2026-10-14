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
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="xt-eyebrow mb-3">Xtin Capital Suite</p>
            <h1 className="xt-title mb-4">Products</h1>
            <p className="text-gray-600">Explore each product and open its dedicated workspace.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {productItems.map((item) => {
              const CardContent = (
                <div className="relative flex h-full flex-col text-center">
                  <div className="flex justify-end">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition group-hover:border-brand-line group-hover:text-brand">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    <span className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 text-brand dark:text-brand transition-transform duration-300 group-hover:scale-105">
                      <item.Icon className="h-12 w-12" strokeWidth={1.7} />
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>
                </div>
              );

              const cardClasses = "group aspect-square rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-line hover:shadow-xl hover:shadow-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

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
