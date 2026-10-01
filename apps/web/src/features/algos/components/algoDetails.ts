// Buyer-facing content for each XTIN algo — drives the algo cards on /algos and
// the "View details" modal.
//
// Every number below is copied from the strategy's own performance report
// (AurumV, Bird Eye, Gamma and Z1 — the PDFs themselves are confidential and
// are NOT published anywhere on the site). They are HISTORICAL BACKTEST results, not live results — the UI
// says so wherever they appear. Update this file when a report is re-issued.
//
// `name` must match the keys of ALGO_PLANS in
// services/api/modules/algos/algorithm.controller.ts (that is what gets charged).
//
// The reports deliberately do not disclose the signal logic, so "how it works"
// describes the framework (rules-based, risk layer, monitoring) and the observed
// behaviour (win rate, holding time, drawdowns) — never the entry/exit rules.

export interface YearlyReturn {
  label: string; // "2024", "2026 (to Sep)"
  value: string; // "+27.29%"
}

export interface BacktestSummary {
  period: string;
  market: string; // instrument + data granularity, as stated in the report
  cumulativeReturn: string;
  cagr: string;
  maxDrawdown: string; // equity drawdown (relative) — the stricter of the two reported
  balanceDrawdown: string;
  sharpe: string;
  profitFactor: string;
  winRate: string;
  trades: string;
  yearly: YearlyReturn[];
  /** Extra facts worth knowing before buying (streaks, drawdown length…). */
  notes: string[];
}

export interface AlgoDetail {
  name: string; // must match the server catalogue key
  tagline: string;
  style: string;
  timeframes: string;
  /** Short chips on the card. */
  tags: string[];
  principle: string[];
  bestFor: string;
  included: string[];
  backtest: BacktestSummary;
}

const COMMON_INCLUDED = [
  'Full algorithm access on TradingView, added to your TradingView account by our team',
  'Real-time buy/sell signals on your chart',
  'Setup within 24 hours of subscribing',
];

const TEST_PERIOD = 'Jan 2024 – Sep 2026';

export const ALGO_DETAILS: Record<string, AlgoDetail> = {
  AurumV: {
    name: 'AurumV',
    tagline: 'Systematic Gold Strategy',
    style: 'Systematic · risk-managed',
    timeframes: '1-minute data',
    tags: ['XAUUSD (Gold)', 'Rules-based', 'Risk-managed'],
    principle: [
      'A rules-driven strategy for gold (XAUUSD). The same rules are applied to every trade, so there is no discretionary decision-making.',
      'Built in four layers: a signal layer that decides trades, a risk layer that applies exposure and position limits, an execution layer that manages orders, and a monitoring layer that tracks balance, equity and drawdown.',
      'It wins on a minority of trades (about 37%) but the average winner is about 2.45× the average loser, so expect frequent small losses and occasional large wins.',
      'The signal logic itself is proprietary and is not published.',
    ],
    bestFor: 'Traders comfortable with long losing stretches in exchange for a higher return, and with gold exposure.',
    included: COMMON_INCLUDED,
    backtest: {
      period: TEST_PERIOD,
      market: 'XAUUSD, 1-minute data, 99% real-tick history',
      cumulativeReturn: '+112.96%',
      cagr: '32.41%',
      maxDrawdown: '18.30%',
      balanceDrawdown: '15.80%',
      sharpe: '2.00',
      profitFactor: '1.45',
      winRate: '37.24%',
      trades: '478',
      yearly: [
        { label: '2024', value: '-12.45%' },
        { label: '2025', value: '+110.59%' },
        { label: '2026 (to Sep)', value: '+15.51%' },
      ],
      notes: [
        'The first year lost money (-12.45%) before the strategy recovered.',
        'Longest balance drawdown: about 175 days.',
        '15 of 33 months were positive.',
      ],
    },
  },

  'Bird Eye': {
    name: 'Bird Eye',
    tagline: 'Multi-Engine Portfolio Strategy',
    style: 'Systematic portfolio',
    timeframes: '1-minute data',
    tags: ['XAUUSD (Gold)', 'Portfolio', 'Diversified engines'],
    principle: [
      'A portfolio of several rules-based return engines that share one capital-allocation and risk framework, instead of depending on a single source of returns.',
      'Capital is distributed across the active engines, and drawdown and exposure are monitored at both portfolio and trade level.',
      'Wins about half of its trades (50.4%), with the average winner larger than the average loser.',
      'The signal logic itself is proprietary and is not published.',
    ],
    bestFor: 'Traders who prefer smoother results and smaller drawdowns over the highest possible return.',
    included: COMMON_INCLUDED,
    backtest: {
      period: TEST_PERIOD,
      market: 'XAUUSD, 1-minute data, 99% real-tick history',
      cumulativeReturn: '+68.80%',
      cagr: '21.45%',
      maxDrawdown: '7.66%',
      balanceDrawdown: '3.94%',
      sharpe: '1.98',
      profitFactor: '1.66',
      winRate: '50.39%',
      trades: '1,028',
      yearly: [
        { label: '2024', value: '+5.62%' },
        { label: '2025', value: '+31.69%' },
        { label: '2026 (to Sep)', value: '+21.36%' },
      ],
      notes: [
        'Longest major drawdown: about 192 days (Apr–Oct 2024).',
        '22 of 33 months were positive; all three calendar years finished positive.',
      ],
    },
  },

  Gamma: {
    name: 'Gamma',
    tagline: '15-Minute Gold Strategy',
    style: 'Systematic · risk-managed',
    timeframes: '15 minute',
    tags: ['XAUUSD (Gold)', '15-min', 'Stop-managed'],
    principle: [
      'A rules-driven strategy for gold (XAUUSD) on the 15-minute chart, with predefined stops, position controls and exposure checks applied to every trade.',
      'Built to keep any single market episode from dominating the result: risk is monitored continuously rather than adjusted by hand.',
      'Wins most of its trades (about 65%). In the test the longest winning run was 12 trades and the longest losing run was 7.',
      'The signal logic itself is proprietary and is not published.',
    ],
    bestFor: 'Traders who want a higher win rate and a smaller maximum drawdown than the other strategies.',
    included: COMMON_INCLUDED,
    backtest: {
      period: TEST_PERIOD,
      market: 'XAUUSD, 15-minute, 99% real-tick history',
      cumulativeReturn: '+57.58%',
      cagr: '18.39%',
      maxDrawdown: '8.76%',
      balanceDrawdown: '8.20%',
      sharpe: '1.74',
      profitFactor: '1.43',
      winRate: '65.45%',
      trades: '495',
      yearly: [
        { label: '2024', value: '+1.38%' },
        { label: '2025', value: '+27.29%' },
        { label: '2026 (to Sep)', value: '+22.12%' },
      ],
      notes: [
        'Longest drawdown recovery: about 145 days.',
        '24 of 33 months were positive; all three calendar years finished positive.',
      ],
    },
  },

  Z1: {
    name: 'Z1',
    tagline: 'Systematic Investment Strategy',
    style: 'Systematic · position holding',
    timeframes: 'Multi-day holds',
    tags: ['Rules-based', 'Low trade count', 'Multi-day holds'],
    principle: [
      'A rules-based systematic strategy with predefined entry and exit rules and position sizing set by the model, not trade-by-trade overrides.',
      'It trades rarely — 69 trades in the whole test — and holds each position for about 4.7 days on average.',
      'Only about 28% of trades win, but winners are far larger than losers (profit factor 2.19), so results depend on a few big winners.',
      'The signal logic itself is proprietary and is not published.',
    ],
    bestFor: 'Patient investors who can sit through many small losses and long drawdowns while waiting for the larger winners.',
    included: COMMON_INCLUDED,
    backtest: {
      period: 'Jan 2024 – 11 Sep 2026',
      market: 'Backtest on the strategy tester ledger (commissions and swap included)',
      cumulativeReturn: '+60.91%',
      cagr: '19.30%',
      maxDrawdown: '15.04%',
      balanceDrawdown: '8.81%',
      sharpe: '2.04',
      profitFactor: '2.19',
      winRate: '27.54%',
      trades: '69',
      yearly: [
        { label: '2024', value: '+13.09%' },
        { label: '2025', value: '+23.91%' },
        { label: '2026 (to Sep)', value: '+14.84%' },
      ],
      notes: [
        'Up to 8 losing trades in a row; longest balance drawdown about 212 days.',
        'Only 69 trades, so a few large winners or losers can move the result a lot.',
      ],
    },
  },
};

/** Display order on the page. */
export const ALGO_ORDER = ['AurumV', 'Bird Eye', 'Gamma', 'Z1'];
