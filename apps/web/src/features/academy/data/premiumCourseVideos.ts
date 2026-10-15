/**
 * Premium course video modules — public metadata for the Learn page cards and
 * the shareable /learn/watch/:slug pages.
 *
 * Lesson 1 of every module is FREE and public, so its YouTube ID lives here
 * (`freeVideoId`). Lessons 2+ are Academy Pro: their YouTube IDs are kept on
 * the SERVER (services/api/data/premiumVideoIds.ts) and only sent to Pro users.
 * Here you only maintain titles — rename the "Lesson N" placeholders when
 * you record them, and add/remove rows to change the lesson count.
 */
export interface PremiumCourse {
  slug: string;
  number: string;
  name: string;
  /** SEO/share description. */
  description: string;
  /** YouTube ID of free Lesson 1. */
  freeVideoId: string;
  /** Lesson titles; index 0 is the free lesson. */
  lessons: string[];
}

export const PREMIUM_COURSES: PremiumCourse[] = [
  {
    slug: 'personal-finance',
    number: '01',
    name: 'Personal Finance Mastery',
    description: 'Budgeting, saving, emergency funds and building a strong financial foundation — a free video course from Xtin Capital.',
    freeVideoId: 'PB5Hrmrj2Ns',
    lessons: [
      'Personal Finance for Beginners',
      'Lesson 2',
      'Lesson 3',
      'Lesson 4',
      'Lesson 5',
      'Lesson 6',
      'Lesson 7',
      'Lesson 8',
      'Lesson 9',
      'Lesson 10',
      'Lesson 11',
      'Lesson 12',
    ],
  },
  {
    slug: 'stock-market-investing',
    number: '02',
    name: 'Stock Market Investing',
    description: 'Learn to read financial statements, use P/E and ROE, and build a long-term stock portfolio. Lesson 1 is free.',
    freeVideoId: '32N2oAJpZPs',
    lessons: [
      'Stock Market Investing for Beginners: Financial Statements, P/E, ROE & Portfolio',
      'Lesson 2',
      'Lesson 3',
      'Lesson 4',
      'Lesson 5',
      'Lesson 6',
      'Lesson 7',
      'Lesson 8',
      'Lesson 9',
      'Lesson 10',
      'Lesson 11',
      'Lesson 12',
      'Lesson 13',
      'Lesson 14',
      'Lesson 15',
    ],
  },
  {
    slug: 'mutual-funds',
    number: '03',
    name: 'Mutual Funds Deep Dive',
    description: 'SIPs, index funds, debt funds and direct vs regular plans explained simply. Lesson 1 is free.',
    freeVideoId: 'beddr4IOhJk',
    lessons: [
      'Mutual Funds Explained: SIP, Index Funds, Debt Funds & Direct vs Regular Plans',
      'Lesson 2',
      'Lesson 3',
      'Lesson 4',
      'Lesson 5',
      'Lesson 6',
      'Lesson 7',
      'Lesson 8',
      'Lesson 9',
      'Lesson 10',
    ],
  },
  {
    slug: 'options-derivatives',
    number: '04',
    name: 'Options & Derivatives',
    description: 'Calls, puts, payoffs and hedging — and why most F&O traders lose money. Lesson 1 is free. Educational only.',
    freeVideoId: 'f1pt2AOLX20',
    lessons: [
      'Options & Futures Explained: Calls, Puts, Payoffs & Hedging (Why 93% Lose in F&O)',
      'How to Read an Option Chain (India): ITM, ATM, OTM, Premium, OI & IV Explained',
      'Option Strategies for Beginners: Spreads, Straddle & Iron Condor (With Exits)',
      'How to Hedge Your Portfolio: Protective Put, Collar & Nifty Futures Explained',
      'Futures Explained: Pricing, Basis, Margin, Mark-to-Market & Rollover (India)',
      'Option Greeks Explained: Delta, Gamma, Theta & Vega (Read Them Like a Pro)',
      'Volatility Explained: Implied Volatility, India VIX, IV Rank & Skew (Options)',
      'How Options Are Priced: Black-Scholes, Put-Call Parity & Implied Volatility',
      'Advanced Option Spreads: Credit Spreads, Butterfly, Calendar & Ratio Spread',
      'F&O Expiry Day, SEBI Rules, Costs & Tax in India: What Every Trader Must Know',
      'Risk Management for Options Traders: Loss Maths, Expectancy & Loss Limits',
      'Trading Psychology: Revenge Trading, FOMO & Biases That Cost You Money',
      'How to Build & Backtest a Trading Plan: Rules, Paper Trading & Kill Switch',
      'One Complete Options Trade, Start to Finish: View, Size, Exit & Checklist',
    ],
  },
  {
    slug: 'tax-planning',
    number: '05',
    name: 'Tax Planning & Filing',
    description: 'New vs old tax regime, capital gains and ITR filing for investors (tax year 2026-27). Lesson 1 is free.',
    freeVideoId: 'x0d8DhKD04E',
    lessons: [
      'Income Tax for Investors (Tax Year 2026-27): New vs Old Regime, Capital Gains & ITR Filing',
      'Lesson 2',
      'Lesson 3',
      'Lesson 4',
      'Lesson 5',
      'Lesson 6',
      'Lesson 7',
      'Lesson 8',
    ],
  },
];

export const getPremiumCourse = (slug?: string) =>
  PREMIUM_COURSES.find((c) => c.slug === slug);

export const watchPath = (slug: string) => `/learn/watch/${slug}`;
