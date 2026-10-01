// Buyer-facing detail content for each XTIN algo (shown in AlgoDetailsModal).
//
// Principles/requirements below restate what the algo cards and the purchase
// flow already promise (TradingView indicator, signals/alerts, setup within 24h).
//
// `backtest` is deliberately empty: fill it in with the REAL, verified
// numbers (and a `reportUrl` to the PDF) once they're ready. Until then the
// modal shows a "request the backtest report" prompt instead of any figures —
// never put illustrative numbers here.

export interface BacktestSummary {
  period: string; // e.g. "Jan 2020 – Dec 2025"
  market: string; // e.g. "NIFTY 50 futures, 4H"
  trades: number;
  winRate: string; // e.g. "54%"
  profitFactor: string;
  maxDrawdown: string;
  reportUrl?: string; // link to the full PDF report
}

export interface AlgoDetail {
  name: string; // must match the name passed to subscribeToAlgo()
  tagline: string;
  style: string;
  timeframes: string;
  principle: string[];
  bestFor: string;
  included: string[];
  backtest?: BacktestSummary;
}

const COMMON_INCLUDED = [
  'Indicator added to your TradingView account by our team',
  'Real-time buy/sell signals on your chart',
  'Alert-ready — set TradingView alerts on the signals',
  'Setup within 24 hours of subscribing',
];

export const ALGO_DETAILS: Record<string, AlgoDetail> = {
  'XTIN Alpha 1.0': {
    name: 'XTIN Alpha 1.0',
    tagline: 'Momentum Signal Generator',
    style: 'Momentum',
    timeframes: 'Multiple timeframes',
    principle: [
      'Built as a Pine Script v6 indicator that reads momentum across several indicators at once instead of relying on a single one.',
      'A signal appears only when the momentum readings agree, which is meant to filter out weak, one-indicator moves.',
      'Position sizing and risk controls are part of the logic, so each signal comes with how much to risk, not just which way to trade.',
    ],
    bestFor: 'Traders who want clear momentum entries on the chart without building their own rules.',
    included: COMMON_INCLUDED,
  },
  'XTIN ALPHA V1': {
    name: 'XTIN ALPHA V1',
    tagline: 'Intraday Fast Signals',
    style: 'Intraday momentum + volatility',
    timeframes: '1 minute – 1 hour',
    principle: [
      'Combines momentum with volatility so signals fire quickly when price is moving, and stay quiet when the market is flat.',
      'Designed for intraday charts, where speed of the signal matters more than holding a position for days.',
      'Risk-aware position sizing is built in, and our team customises the setup for your account.',
    ],
    bestFor: 'Active intraday traders who watch the market during the session.',
    included: [...COMMON_INCLUDED, 'Custom setup by our team'],
  },
  'XTIN GammaV1': {
    name: 'XTIN GammaV1',
    tagline: '4H Swing Trading',
    style: 'Swing',
    timeframes: '4 hour',
    principle: [
      'Works on the 4-hour chart to catch swings that last days, so you are not glued to the screen.',
      'Uses a multi-level exit: positions can be scaled out in steps instead of closed all at once.',
      'Exit levels are set to keep a favourable risk-to-reward ratio, and signals adapt to the market you apply it to.',
    ],
    bestFor: 'Part-time traders who prefer a few considered trades over constant screen time.',
    included: COMMON_INCLUDED,
  },
  'XTIN Z1': {
    name: 'XTIN Z1',
    tagline: 'Long-term Investment',
    style: 'Investing / accumulation',
    timeframes: '1 day – 1 week',
    principle: [
      'Built for long-term investing on daily and weekly charts, not short-term trading.',
      'Marks clear buy entries so you can accumulate in stages rather than guessing a single entry.',
      'Gives exit signals for large positions, and adapts to the market you apply it to.',
    ],
    bestFor: 'Investors building positions over months or years who want disciplined entries and exits.',
    included: COMMON_INCLUDED,
  },
};
