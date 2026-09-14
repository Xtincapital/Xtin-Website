import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getRegion,
  getRegionConfig,
  setRegion as setRegionService,
  subscribeRegion,
  detectRegion,
  getRates,
  convert as convertCurrency,
} from '../lib/region';

interface CurrencyFormatOpts {
  convert?: boolean;
  compact?: boolean;
  minDecimals?: number;
  maxDecimals?: number;
  currency?: string;
  locale?: string;
}

interface CurrencyContextValue {
  region: string;
  config: any;
  loading: boolean;
  ratesLoading: boolean;
  symbol: string;
  currency: string;
  locale: string;
  rate: number;
  formatCurrency: (amount: number, opts?: CurrencyFormatOpts) => string;
  setRegion: (code: string) => void;
  convert: typeof convertCurrency;
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * CurrencyProvider
 *
 * Wraps the existing lib/region service in a proper React Context so every
 * component can consume the resolved region, currency config, exchange rates
 * and formatting helpers without prop drilling.
 *
 * Loading flow:
 *   1. Mount → show loading=true, kick off IP detection + FX fetch in parallel.
 *   2. IP resolves → region config is available, loading=false.
 *   3. FX resolves later → rates update, components re-render with conversions.
 *
 * Until FX resolves, `rate` is 1.0 (display amounts in the local currency).
 */
export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState(() => {
    const region = getRegion();
    const config = getRegionConfig(region);
    return {
      region,
      config,
      loading: true,        // true until IP detection resolves
      ratesLoading: true,    // true until FX rates are fetched
      symbol: config.symbol,
      currency: config.currency,
      locale: config.locale,
      rate: 1,              // base-currency → local multiplier
    };
  });

  const detectStarted = useRef(false);

  // Subscribe to region changes (manual toggle in RegionSwitcher)
  useEffect(() => {
    const unsub = subscribeRegion((r) => {
      const cfg = getRegionConfig(r);
      setState((prev) => ({
        ...prev,
        region: r,
        config: cfg,
        symbol: cfg.symbol,
        currency: cfg.currency,
        locale: cfg.locale,
        loading: false,
      }));
    });
    return () => { unsub(); };
  }, []);

  // Initial detection — runs once
  useEffect(() => {
    if (detectStarted.current) return;
    detectStarted.current = true;

    (async () => {
      await detectRegion();
      const region = getRegion();
      const cfg = getRegionConfig(region);
      setState((prev) => ({
        ...prev,
        region,
        config: cfg,
        symbol: cfg.symbol,
        currency: cfg.currency,
        locale: cfg.locale,
        loading: false,
      }));
    })();
  }, []);

  // Fetch FX rates
  useEffect(() => {
    (async () => {
      const rates = await getRates();
      setState((prev) => ({
        ...prev,
        ratesLoading: false,
        rate: rates[prev.currency] || 1,
      }));
    })();
  }, [state.currency]);

  /**
   * formatCurrency — formats a raw number into the user's local currency.
   *
   * Uses Intl.NumberFormat for canonical locale-aware formatting:
   *   • en-IN → "₹1,23,456.78" (Indian numbering)
   *   • en-US → "$123,456.78" (Western numbering)
   *   • de-DE → "123.456,78 €" (EUR formatting)
   *
   * @param {number} amount       - Base-currency amount (e.g. USD 50)
   * @param {object} [opts]
   * @param {boolean} [opts.convert=false] - Convert from base to local currency
   * @param {boolean} [opts.compact=false] - Show compact form (1.2K, 5L, 2Cr)
   * @param {number}  [opts.minDecimals]   - Minimum fraction digits
   * @param {number}  [opts.maxDecimals]   - Maximum fraction digits
   * @param {string}  [opts.currency]      - Override currency code
   * @returns {string}
   */
  const formatCurrency = useCallback((amount: number, opts: CurrencyFormatOpts = {}) => {
    const n = Number(amount) || 0;
    const { convert = false, compact = false, minDecimals, maxDecimals } = opts;
    const targetCurrency = opts.currency || state.currency;
    const targetLocale = opts.locale || state.locale;

    // Optionally convert from base currency (USD) to target currency
    const localAmount = convert ? convertCurrency(n, 'USD', targetCurrency) : n;

    if (compact) {
      return compactFormat(localAmount, targetCurrency, targetLocale, state.config);
    }

    try {
      return new Intl.NumberFormat(targetLocale, {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: minDecimals ?? 0,
        maximumFractionDigits: maxDecimals ?? 2,
      }).format(localAmount);
    } catch {
      // Fallback if the locale/currency combo is unsupported
      const cfg = state.config;
      return `${cfg.symbol}${Math.round(localAmount).toLocaleString(targetLocale)}`;
    }
  }, [state.currency, state.locale, state.config]);

  /**
   * setRegion — change the active region (persisted, triggers re-render).
   */
  const setRegion = useCallback((code) => {
    setRegionService(code);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        ...state,
        formatCurrency,
        setRegion,
        convert: convertCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

/**
 * useCurrency — hook to consume the CurrencyContext.
 *
 * Usage:
 *   const { region, symbol, currency, formatCurrency, loading } = useCurrency();
 *
 *   // Basic formatting
 *   formatCurrency(50)                    // → "$50"
 *   formatCurrency(123456.78)             // → "₹1,23,456.78" for India
 *   formatCurrency(50, { convert: true }) // → "₹4,150" (50 USD → INR at 83)
 *   formatCurrency(5000000, { compact: true, convert: true }) // → "₹5L"
 */
export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a <CurrencyProvider>');
  }
  return ctx;
};

/* ─── helpers ─── */

function compactFormat(n, currency, locale, config) {
  const abs = Math.abs(n);
  const sym = config?.symbol || currency;

  if (config?.numberSystem === 'lakh') {
    if (abs >= 1e7) return `${sym}${(n / 1e7).toFixed(2).replace(/\.00$/, '')}Cr`;
    if (abs >= 1e5) return `${sym}${(n / 1e5).toFixed(2).replace(/\.00$/, '')}L`;
  } else {
    if (abs >= 1e9) return `${sym}${(n / 1e9).toFixed(2).replace(/\.00$/, '')}B`;
    if (abs >= 1e6) return `${sym}${(n / 1e6).toFixed(2).replace(/\.00$/, '')}M`;
    if (abs >= 1e3) return `${sym}${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${sym}${Math.round(n).toLocaleString(locale)}`;
  }
}
