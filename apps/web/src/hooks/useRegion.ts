import { useContext } from 'react';
import { getRegionConfig, formatMoney } from '../lib/region';
import { CurrencyContext } from '../contexts/CurrencyContext';

/**
 * React binding for the region service.
 *
 * CurrencyContext (mounted once at the app root in App.jsx, wrapping every
 * route) is the single source of truth for the active region. Must be used
 * within a <CurrencyProvider> tree.
 *
 * Returns the active region + config and re-renders on region change.
 */
export default function useRegion() {
  const currencyCtx = useContext(CurrencyContext);

  if (!currencyCtx) {
    throw new Error('useRegion must be used within a CurrencyProvider');
  }

  // Bridge: return the same shape consumers already rely on
  // (Newsletter.jsx, NewsletterUpgradeModal, etc.).
  return {
    region: currencyCtx.region,
    config: getRegionConfig(currencyCtx.region),
    symbol: currencyCtx.symbol,
    setRegion: currencyCtx.setRegion,
    formatMoney: (amount, opts) =>
      formatMoney(amount, { ...opts, region: currencyCtx.region }),
  };
}
