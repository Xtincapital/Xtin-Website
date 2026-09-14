// URLs for the standalone sub-apps (Gini, Journal, Fundakamental, Backtest).
// Defaults point to production domains; override locally via Client/.env
// (VITE_GINI_URL / VITE_JOURNAL_URL / VITE_FUNDAMENTAL_URL / VITE_BACKTEST_URL)
// to run everything on localhost.
export const GINI_URL =
  import.meta.env.VITE_GINI_URL || 'https://www.xtingini.in';

export const JOURNAL_URL =
  import.meta.env.VITE_JOURNAL_URL || 'https://www.xtinjournal.website';

export const FUNDAMENTAL_URL =
  import.meta.env.VITE_FUNDAMENTAL_URL || 'https://fundakamental.in';

export const BACKTEST_URL =
  import.meta.env.VITE_BACKTEST_URL || 'https://backtest.xtincapital.com';
