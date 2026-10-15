// Everything the Platform home links to, in one place: the eight products,
// their deep links, every calculator and every Academy course. The command
// search, the ecosystem orbit, the bento grid and the journey all read from
// here, so a new product or route only needs adding once.
import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  BookOpen,
  Calculator,
  FileSearch,
  FlaskConical,
  Newspaper,
  NotebookPen,
  Workflow,
} from 'lucide-react';
import { MODULES_CONFIG } from '../../../constants/learningModules';

export type ProductId =
  | 'gini'
  | 'fundakamental'
  | 'journal'
  | 'backtest'
  | 'algos'
  | 'tools'
  | 'learn'
  | 'newsletter';

export interface Product {
  id: ProductId;
  name: string;
  path: string;
  Icon: LucideIcon;
  tagline: string;
  keywords: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  gini: {
    id: 'gini',
    name: 'Gini AI',
    path: '/gini',
    Icon: Bot,
    tagline: 'Your family money planner: goals, retirement, net worth, and an AI that knows your numbers.',
    keywords: 'ai advisor planner family goals retirement net worth chat',
  },
  fundakamental: {
    id: 'fundakamental',
    name: 'Fundakamental',
    path: '/fundakamental',
    Icon: FileSearch,
    tagline: 'Research any NSE or US company with AI reports, a stock scanner and watchlists.',
    keywords: 'stocks research company analysis report scanner watchlist portfolio',
  },
  journal: {
    id: 'journal',
    name: 'Journal',
    path: '/journal',
    Icon: NotebookPen,
    tagline: 'Log every trade and find the patterns behind your wins and losses.',
    keywords: 'trades journal log psychology analytics coach pnl',
  },
  backtest: {
    id: 'backtest',
    name: 'Backtest',
    path: '/backtest',
    Icon: FlaskConical,
    tagline: 'Test any strategy idea on real data by chatting with AI. No code.',
    keywords: 'backtest strategy test ema rsi idea historical',
  },
  algos: {
    id: 'algos',
    name: 'Algorithms',
    path: '/algos',
    Icon: Workflow,
    tagline: 'Rule-based strategies with plain-English entries, exits and risk rules.',
    keywords: 'algo algorithms automated trading strategies momentum options',
  },
  tools: {
    id: 'tools',
    name: 'Tools',
    path: '/tools',
    Icon: Calculator,
    tagline: '20+ calculators, from SIP and FD to retirement and income tax.',
    keywords: 'calculators tools sip fd tax retirement emi',
  },
  learn: {
    id: 'learn',
    name: 'Learn',
    path: '/learn',
    Icon: BookOpen,
    tagline: 'Structured courses from money basics to algo trading, with certificates.',
    keywords: 'courses learn academy lessons education certificate',
  },
  newsletter: {
    id: 'newsletter',
    name: 'Newsletter',
    path: '/newsletter',
    Icon: Newspaper,
    tagline: 'The market in three minutes, written in plain English, every morning.',
    keywords: 'newsletter news brief market summary ipo morning',
  },
};

export const PRODUCT_ORDER: ProductId[] = [
  'gini',
  'fundakamental',
  'journal',
  'backtest',
  'algos',
  'tools',
  'learn',
  'newsletter',
];

/* ── Academy numbers, derived from the real course list ───────────────── */

type Module = (typeof MODULES_CONFIG)[number];

export const COURSES: Module[] = MODULES_CONFIG.filter((m) => m.available);
export const COURSE_COUNT = COURSES.length;
export const LESSON_COUNT = COURSES.reduce((sum, m) => sum + (m.lessons || 0), 0);

/* ── Calculators (same list and paths as the Tools page) ──────────────── */

export const CALCULATORS: { label: string; path: string; indiaOnly?: boolean; keywords?: string }[] = [
  { label: 'SIP Calculator', path: '/tools/sip', keywords: 'mutual fund monthly' },
  { label: 'Step-up SIP Calculator', path: '/tools/step-up-sip', keywords: 'increasing sip' },
  { label: 'Lumpsum Calculator', path: '/tools/lumpsum', keywords: 'one time' },
  { label: 'SWP Calculator', path: '/tools/swp', keywords: 'withdrawal' },
  { label: 'CAGR Calculator', path: '/tools/cagr', keywords: 'growth rate' },
  { label: 'Real Estate Calculator', path: '/tools/real-estate-investment', keywords: 'property house' },
  { label: 'ELSS Calculator', path: '/tools/elss', indiaOnly: true, keywords: 'tax saving 80c' },
  { label: 'FD Calculator', path: '/tools/fd', indiaOnly: true, keywords: 'fixed deposit' },
  { label: 'RD Calculator', path: '/tools/rd', indiaOnly: true, keywords: 'recurring deposit' },
  { label: 'Compound Interest Calculator', path: '/tools/compound-interest' },
  { label: 'Simple Interest Calculator', path: '/tools/simple-interest' },
  { label: 'SSY Calculator', path: '/tools/ssy-calculator', indiaOnly: true, keywords: 'sukanya samriddhi girl' },
  { label: 'Retirement Calculator', path: '/tools/retirement', keywords: 'corpus pension' },
  { label: 'PPF Calculator', path: '/tools/ppf', indiaOnly: true, keywords: 'provident fund' },
  { label: 'NPS Calculator', path: '/tools/nps', indiaOnly: true, keywords: 'pension scheme' },
  { label: 'EPF Calculator', path: '/tools/epf', indiaOnly: true, keywords: 'provident fund pf' },
  { label: 'Gratuity Calculator', path: '/tools/gratuity', indiaOnly: true },
  { label: 'Income Tax Calculator', path: '/tools/income-tax', indiaOnly: true, keywords: 'slab regime' },
  { label: 'Inflation Calculator', path: '/tools/inflation', keywords: 'purchasing power' },
  { label: 'HRA Calculator', path: '/tools/hra', indiaOnly: true, keywords: 'house rent allowance' },
];

/* ── Command search index ─────────────────────────────────────────────── */

export type SearchGroup = 'Products' | 'Jump to' | 'Calculators' | 'Courses' | 'Account';

export interface SearchItem {
  id: string;
  group: SearchGroup;
  label: string;
  hint: string;
  path: string;
  product?: ProductId;
  keywords: string;
}

// Deep links inside the product apps (real routes from each *App.tsx).
const DEEP_LINKS: Omit<SearchItem, 'id' | 'group'>[] = [
  { label: 'Net worth', hint: 'Gini AI', path: '/gini/networth', product: 'gini', keywords: 'assets liabilities wealth' },
  { label: 'Goals', hint: 'Gini AI', path: '/gini/goals', product: 'gini', keywords: 'house education car' },
  { label: 'Retirement plan', hint: 'Gini AI', path: '/gini/retirement', product: 'gini', keywords: 'retire pension' },
  { label: 'Monte Carlo simulation', hint: 'Gini AI', path: '/gini/monte-carlo', product: 'gini', keywords: 'probability success' },
  { label: 'Family planning', hint: 'Gini AI', path: '/gini/family-planning', product: 'gini', keywords: 'children family' },
  { label: 'Financial reports', hint: 'Gini AI', path: '/gini/reports', product: 'gini', keywords: 'pdf report' },
  { label: 'Analyse a company', hint: 'Fundakamental', path: '/fundakamental/analyze', product: 'fundakamental', keywords: 'upload annual report statement ai' },
  { label: 'Stock scanner', hint: 'Fundakamental', path: '/fundakamental/scanner', product: 'fundakamental', keywords: 'screener filter undervalued' },
  { label: 'Watchlist', hint: 'Fundakamental', path: '/fundakamental/watchlist', product: 'fundakamental', keywords: 'price target alert' },
  { label: 'Portfolio tracker', hint: 'Fundakamental', path: '/fundakamental/portfolio', product: 'fundakamental', keywords: 'holdings gold cash' },
  { label: 'Technical indicators', hint: 'Fundakamental', path: '/fundakamental/technicals', product: 'fundakamental', keywords: 'macd rsi bollinger' },
  { label: 'Trades', hint: 'Journal', path: '/journal/trades', product: 'journal', keywords: 'log add trade' },
  { label: 'Trade analytics', hint: 'Journal', path: '/journal/analytics', product: 'journal', keywords: 'win rate profit factor' },
  { label: 'P&L calendar', hint: 'Journal', path: '/journal/calendar', product: 'journal', keywords: 'daily pnl' },
  { label: 'Trading psychology', hint: 'Journal', path: '/journal/psychology', product: 'journal', keywords: 'emotion fomo revenge' },
  { label: 'AI trade coach', hint: 'Journal', path: '/journal/coach', product: 'journal', keywords: 'chat ai coach review' },
  { label: 'New backtest', hint: 'Backtest', path: '/backtest/app/strategies/new', product: 'backtest', keywords: 'create strategy' },
  { label: 'Backtest history', hint: 'Backtest', path: '/backtest/app/history', product: 'backtest', keywords: 'past runs results' },
];

const ACCOUNT_LINKS: Omit<SearchItem, 'id' | 'group'>[] = [
  { label: 'Dashboard', hint: 'Your account and plans', path: '/dashboard', keywords: 'account profile subscription plans upgrade pro' },
  { label: 'Billing & receipts', hint: 'Payments', path: '/billing', keywords: 'invoice receipt payment' },
  { label: 'Help center', hint: 'Support', path: '/help', keywords: 'support faq question' },
  { label: 'Contact us', hint: 'Support', path: '/contact', keywords: 'email phone' },
];

export function buildSearchIndex(region: string): SearchItem[] {
  const isIN = region === 'IN';
  const items: SearchItem[] = [];

  PRODUCT_ORDER.forEach((id) => {
    const p = PRODUCTS[id];
    items.push({ id: `p-${id}`, group: 'Products', label: p.name, hint: p.tagline, path: p.path, product: id, keywords: p.keywords });
  });
  DEEP_LINKS.forEach((d, i) => items.push({ id: `d-${i}`, group: 'Jump to', ...d }));
  CALCULATORS.filter((c) => isIN || !c.indiaOnly).forEach((c, i) =>
    items.push({ id: `c-${i}`, group: 'Calculators', label: c.label, hint: 'Tools', path: c.path, product: 'tools', keywords: c.keywords || '' }),
  );
  COURSES.forEach((m) =>
    items.push({
      id: `m-${m.id}`,
      group: 'Courses',
      label: m.title,
      hint: `${m.lessons} lessons · ${m.difficulty}`,
      path: m.path,
      product: 'learn',
      keywords: `${m.description} ${m.tag || ''}`,
    }),
  );
  ACCOUNT_LINKS.forEach((a, i) => items.push({ id: `a-${i}`, group: 'Account', ...a }));
  return items;
}

// Ranks by where the words match: label start > label word > label > keywords.
export function searchIndex(items: SearchItem[], query: string, limit = 9): SearchItem[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const label = item.label.toLowerCase();
    const rest = `${item.hint} ${item.keywords}`.toLowerCase();
    let score = 0;
    let all = true;
    for (const w of words) {
      if (label.startsWith(w)) score += 6;
      else if (label.includes(` ${w}`)) score += 4;
      else if (label.includes(w)) score += 3;
      else if (rest.includes(w)) score += 1;
      else { all = false; break; }
    }
    if (all) scored.push({ item, score: score + (item.group === 'Products' ? 1 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item);
}
