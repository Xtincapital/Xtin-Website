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


/* ─── Product artwork: small themed vector scenes (inherit brand colour) ─── */
const G = 'currentColor';
const ProductArt = ({ id }: { id: string }) => {
  const common = { viewBox: '0 0 96 96', fill: 'none', className: 'h-full w-full', 'aria-hidden': true } as const;
  switch (id) {
    case 'Algorithms':
      return (
        <svg {...common}>
          <path d="M14 78H84" stroke={G} strokeOpacity=".25" strokeWidth="2" strokeLinecap="round"/>
          {([
            [24, 50, 68, 44, 72, true], [38, 40, 64, 34, 70, false], [52, 44, 62, 36, 68, true], [66, 26, 54, 20, 60, false],
          ] as [number, number, number, number, number, boolean][]).map(([x, top, bot, wt, wb, up], i) => (
            <g key={i}>
              <path d={`M${x} ${wt}V${wb}`} stroke={G} strokeWidth="2" strokeLinecap="round"/>
              <rect x={x - 5} y={top} width="10" height={bot - top} rx="2.5" fill={G} fillOpacity={up ? 0.9 : 0.28} stroke={G} strokeWidth="1.5"/>
            </g>
          ))}
          <path d="M14 66 L30 52 L44 58 L60 36 L82 22" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 6"/>
          <circle cx="82" cy="22" r="4" fill={G}/>
        </svg>
      );
    case 'Backtest':
      return (
        <svg {...common}>
          <path d="M38 14h20M42 14v22L26 66a8 8 0 0 0 7 12h30a8 8 0 0 0 7-12L54 36V14" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M31 62h34l5 9a4 4 0 0 1-3.5 6H29.500A4 4 0 0 1 26 71z" fill={G} fillOpacity=".35"/>
          <circle cx="40" cy="68" r="3" fill={G}/><circle cx="52" cy="72" r="2" fill={G}/><circle cx="58" cy="64" r="2.5" fill={G} fillOpacity=".6"/>
          <path d="M66 26 L74 20 L80 28 L88 16" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'Tools':
      return (
        <svg {...common}>
          <rect x="22" y="12" width="52" height="72" rx="10" stroke={G} strokeWidth="3"/>
          <rect x="30" y="20" width="36" height="16" rx="4" fill={G} fillOpacity=".3" stroke={G} strokeWidth="1.5"/>
          <path d="M36 28h12" stroke={G} strokeWidth="2.5" strokeLinecap="round"/>
          {[0,1,2].map(r => [0,1,2].map(c => (
            <rect key={`${r}${c}`} x={31 + c * 12} y={44 + r * 12} width="8" height="8" rx="2.5" fill={G} fillOpacity={r === 2 && c === 2 ? 1 : 0.5}/>
          )))}
        </svg>
      );
    case 'Learn':
      return (
        <svg {...common}>
          <path d="M48 28 C40 20 26 18 14 22 V70 C26 66 40 68 48 76 C56 68 70 66 82 70 V22 C70 18 56 20 48 28Z" stroke={G} strokeWidth="3" strokeLinejoin="round" fill={G} fillOpacity=".12"/>
          <path d="M48 28V76" stroke={G} strokeWidth="2.5"/>
          <path d="M22 34c8-1 15 0 20 4M22 44c8-1 15 0 20 4M22 54c8-1 15 0 20 4M74 34c-8-1-15 0-20 4M74 44c-8-1-15 0-20 4" stroke={G} strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"/>
          <path d="M62 8 L66 16 L74 17 L68 23 L70 31 L62 27 L54 31 L56 23 L50 17 L58 16Z" fill={G}/>
        </svg>
      );
    case 'Fundakamental':
      return (
        <svg {...common}>
          <path d="M20 12h34l16 16v48a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" stroke={G} strokeWidth="3" strokeLinejoin="round" fill={G} fillOpacity=".12"/>
          <path d="M54 12v16h16" stroke={G} strokeWidth="3" strokeLinejoin="round"/>
          <path d="M24 42h20M24 52h14" stroke={G} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round"/>
          <rect x="24" y="62" width="6" height="12" rx="1.5" fill={G} fillOpacity=".5"/><rect x="34" y="56" width="6" height="18" rx="1.5" fill={G} fillOpacity=".7"/>
          <circle cx="64" cy="62" r="14" fill="var(--card, #fff)" stroke={G} strokeWidth="3"/>
          <path d="M74 72 L84 82" stroke={G} strokeWidth="4" strokeLinecap="round"/>
          <path d="M58 64l4 -5 4 3 4 -6" stroke={G} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'Gini AI':
      return (
        <svg {...common}>
          <path d="M22 16h52a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H48L32 80V64h-10a8 8 0 0 1-8-8V24a8 8 0 0 1 8-8z" stroke={G} strokeWidth="3" strokeLinejoin="round" fill={G} fillOpacity=".12"/>
          <circle cx="38" cy="40" r="5" fill={G}/><circle cx="58" cy="40" r="5" fill={G}/>
          <path d="M38 52c6 5 14 5 20 0" stroke={G} strokeWidth="3" strokeLinecap="round"/>
          <path d="M48 16V8" stroke={G} strokeWidth="3" strokeLinecap="round"/><circle cx="48" cy="6" r="3" fill={G}/>
          <path d="M82 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={G}/>
        </svg>
      );
    case 'Journal':
      return (
        <svg {...common}>
          <rect x="20" y="10" width="52" height="76" rx="7" stroke={G} strokeWidth="3" fill={G} fillOpacity=".12"/>
          <path d="M30 10v76" stroke={G} strokeWidth="2.5"/>
          {[24,34,44].map(y => <path key={y} d={`M38 ${y}h26`} stroke={G} strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round"/>)}
          <path d="M38 62l8-8 6 5 10-12" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M62 78 L80 36 L88 40 L70 82 L60 86Z" fill="var(--card, #fff)" stroke={G} strokeWidth="3" strokeLinejoin="round"/>
          <path d="M80 36l-3-7 7-3 3 7" stroke={G} strokeWidth="3" strokeLinejoin="round"/>
        </svg>
      );
    default: // Newsletter
      return (
        <svg {...common}>
          <rect x="12" y="24" width="72" height="52" rx="8" stroke={G} strokeWidth="3" fill={G} fillOpacity=".12"/>
          <path d="M14 30l34 26 34-26" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="26" y="10" width="44" height="34" rx="4" fill="var(--card, #fff)" stroke={G} strokeWidth="2.5"/>
          <path d="M33 20h30M33 27h20M33 34h14" stroke={G} strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="74" cy="66" r="9" fill={G}/><path d="M69 66l4 4 7-8" stroke="var(--card, #fff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
  }
};

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
          <div className="relative mb-12 max-w-2xl">
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-16 h-56 w-80 rounded-full bg-brand-soft blur-3xl opacity-80" />
            <p className="xt-eyebrow relative mb-3">Xtin Capital Suite</p>
            <h1 className="xt-title relative mb-4">Products</h1>
            <p className="relative text-gray-600">Explore each product and open its dedicated workspace.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    <span className="relative inline-flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-soft via-brand-soft/60 to-transparent ring-1 ring-brand-line/70 text-brand overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1">
                      <span aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(circle_at_70%_20%,#000,transparent_65%)]" />
                      <span aria-hidden="true" className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-fill/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
                      <span className="relative h-[72px] w-[72px] drop-shadow-sm">
                        <ProductArt id={item.title} />
                      </span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>
                </div>
              );

              const cardClasses = "group relative overflow-hidden min-h-[19rem] rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-line hover:shadow-xl hover:shadow-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

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
