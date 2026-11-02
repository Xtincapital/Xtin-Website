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
      'Emergency Fund in India: How Much You Need, Where to Keep It & How to Build It',
      'How to Make a Budget That Works (India): 50/30/20, Zero-Based & Envelope Method',
      'How to Get Out of Debt in India: Credit Card Trap, Avalanche vs Snowball & EMI Limits',
      'Credit Score in India Explained: CIBIL 300-900, What Moves It & How to Fix It',
      'Health Insurance in India: How Much Cover, Fine Print, Super Top-Up & Claims',
      'Life Insurance in India: Term Plan vs Endowment, How Much Cover & Common Mistakes',
      'How to Plan Financial Goals in India: Inflation, SIP Amount & Right Investment by Time Frame',
      'Asset Allocation Explained: Equity, Debt, Gold & Real Estate (Risk & Diversification)',
      'Retirement Planning in India: How Much You Need, EPF, PPF, NPS & Equity Funds',
      'Money Scams in India: UPI, OTP, Digital Arrest & Investment Fraud (How to Stay Safe)',
      'Build Your Personal Financial Plan: Net Worth, One-Page Plan, Nominees & Yearly Review',
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
      'How the Stock Market Works in India: Orders, Trading Hours, T+1 Settlement & Demat',
      'Nifty, Sensex, Large Cap, Mid Cap & Small Cap Explained: Stock Indices & Sectors in India',
      'How to Read an Income Statement: Revenue, EBITDA, Margins & EPS (Stock Analysis)',
      'How to Read a Balance Sheet: Debt to Equity, Interest Coverage & Current Ratio',
      'Cash Flow Statement Explained: Operating Cash, Free Cash Flow & Red Flags',
      'Stock Valuation Ratios Explained: P/E, P/B, EV/EBITDA, Dividend Yield & PEG',
      'How to Measure Business Quality: ROE, ROCE, Moat & the Quality Checklist (Stocks)',
      'Stock Growth & Management Quality: CAGR, Promoter Pledging & Governance Red Flags',
      'How to Value a Stock: Intrinsic Value, Fair P/E & Margin of Safety (With Example)',
      'Dividends, Bonus Shares, Stock Splits, Buybacks & Rights Issue Explained (India)',
      'IPO Investing in India: How to Read an Offer Document & Avoid the Hype (ASBA & UPI)',
      'How to Read Stock Charts for Beginners: Candlesticks, Support, Resistance & Moving Averages',
      'How to Manage Your Stock Portfolio: How Many Stocks, Position Size & When to Sell',
      'Investor Mindset: Market Crashes, Behavioural Biases & Habits That Build Wealth (Final Lesson)',
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
      'Equity Mutual Fund Categories Explained: Large, Mid, Small, Flexi & Multi Cap (SEBI)',
      'How to Read a Mutual Fund Factsheet: Expense Ratio, Sharpe Ratio, Beta & Riskometer',
      'Mutual Fund Returns Explained: CAGR vs XIRR, Rolling Returns & Benchmarks (TRI)',
      'Index Funds vs ETFs in India: Tracking Error, Tracking Difference & How to Choose',
      'Debt Mutual Funds Explained: Duration, Yield to Maturity, Credit Risk & Which Fund to Pick',
      'Hybrid Mutual Funds Explained: Aggressive, Balanced Advantage, Multi Asset & Arbitrage',
      'SIP Strategies That Work: Step-Up SIP, STP, SWP & What to Do When Markets Fall',
      'How to Choose Mutual Funds: A Simple 5-Step Filter & a 4-Fund Sample Portfolio',
      'Review Your Mutual Fund Portfolio: Yearly Checklist, When to Exit & Nominees (Final Lesson)',
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
      'Capital Gains Tax in India Explained: Holding Periods, Rates, Set-off & Grandfathering',
      'Mutual Fund Tax in India: SIP Units, Switching, IDCW vs Growth & Smart Withdrawals',
      'Tax on Interest, Dividends, PPF, EPF, Gold Bonds & Crypto in India (TDS Explained)',
      'Tax-Saving Investments in India: ELSS vs PPF vs NPS, Health Insurance, HRA & Home Loan',
      'How to File Your ITR Online: Documents, Which ITR Form, Portal Steps & e-Verify',
      'Advance Tax, TDS Credits & Income Tax Notices in India: Dates, Rules & What to Do',
      'Year-Round Tax Planning Calendar for Investors in India: Month-by-Month Checklist',
    ],
  },
];

export const getPremiumCourse = (slug?: string) =>
  PREMIUM_COURSES.find((c) => c.slug === slug);

export const watchPath = (slug: string) => `/learn/watch/${slug}`;
