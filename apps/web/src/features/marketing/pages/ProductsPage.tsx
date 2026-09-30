import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  BookOpen,
  Calculator,
  FileSearch,
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
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Tools',
      description: '20+ financial calculators for investments, tax, and planning.',
      path: '/tools',
      Icon: Calculator,
      accent: 'text-pink-600 bg-pink-50 border-pink-100',
    },
    {
      title: 'Learn',
      description: 'Structured learning paths from basics to advanced topics.',
      path: '/learn',
      Icon: BookOpen,
      accent: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    },
    {
      title: 'Fundakamental',
      description: 'Company research, AI reports, watchlists, and stock analysis.',
      path: '/fundakamental',
      Icon: FileSearch,
      accent: 'text-lime-700 bg-lime-50 border-lime-100',
    },
    {
      title: 'Gini AI',
      description: 'AI-assisted finance guidance and investing support.',
      path: '/gini',
      Icon: Bot,
      accent: 'text-violet-600 bg-violet-50 border-violet-100',
    },
    {
      title: 'Journal',
      description: 'Trading journal and market notes for disciplined decisions.',
      path: '/journal',
      Icon: NotebookPen,
      accent: 'text-orange-600 bg-orange-50 border-orange-100',
    },
    {
      title: 'Newsletter',
      description: 'AI-curated market insights with plain-language analysis.',
      path: '/newsletter',
      Icon: Newspaper,
      accent: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main id="main-content" className="pt-28 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 mb-3">Xtin Capital Suite</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Products</h1>
            <p className="text-gray-600">Explore each product and open its dedicated workspace.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {productItems.map((item) => {
              const CardContent = (
                <div className="relative flex h-full flex-col text-center">
                  <div className="flex justify-end">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition group-hover:border-emerald-200 group-hover:text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    <span className={`inline-flex h-24 w-24 items-center justify-center rounded-2xl border ${item.accent}`}>
                      <item.Icon className="h-12 w-12" strokeWidth={1.7} />
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>
                </div>
              );

              const cardClasses = "group aspect-square rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500";

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
