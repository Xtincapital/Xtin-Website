// URL of the standalone Backtest app. Journal, Gini and Fundakamental are
// built into this site now (/journal, /gini, /fundakamental), so only
// Backtest still lives elsewhere. Override locally via VITE_BACKTEST_URL.
export const BACKTEST_URL =
  import.meta.env.VITE_BACKTEST_URL || 'https://backtest.xtincapital.com';
