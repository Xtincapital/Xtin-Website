import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Price — a drop-in replacement for every hardcoded `<span>$50</span>`.
 *
 * Features:
 *   • Auto-formatting via Intl.NumberFormat (respects locale like en-IN → ₹1,23,456)
 *   • Optional FX conversion (base=USD, converts to visitor's currency)
 *   • Compact mode for large numbers (1.2K, 5L, 2Cr)
 *   • Handles loading/ratesLoading gracefully
 *
 * Props:
 *   @param {number}   amount      - The numeric amount (in base currency, USD)
 *   @param {boolean}  [convert]   - Convert from USD to local currency
 *   @param {boolean}  [compact]   - Show compact form
 *   @param {number}   [minDecimals]
 *   @param {number}   [maxDecimals]
 *   @param {string}   [currency]  - Override currency code
 *   @param {object}   [style]     - Optional inline styles for the wrapper
 *   @param {string}   [className] - CSS classes
 *   @param {string}   [fallback]  - Text to show while loading ("—" by default)
 *
 * Usage:
 *   // Static local price (e.g. pricing in INR)
 *   <Price amount={99} />
 *
 *   // Convert from base USD to visitor's currency
 *   <Price amount={49.99} convert />
 *
 *   // Compact large numbers
 *   <Price amount={5000000} compact />
 *
 *   // Combine
 *   <Price amount={299} convert compact />
 */
interface PriceProps {
  amount: number;
  convert?: boolean;
  compact?: boolean;
  minDecimals?: number;
  maxDecimals?: number;
  currency?: string;
  style?: React.CSSProperties;
  className?: string;
  fallback?: string;
}

const Price = ({
  amount,
  convert = false,
  compact = false,
  minDecimals,
  maxDecimals,
  currency: overrideCurrency,
  style,
  className = '',
  fallback = '—',
}: PriceProps) => {
  const { formatCurrency, loading, ratesLoading } = useCurrency();

  // While detecting region, show fallback
  if (loading) {
    return <span className={`text-gray-300 dark:text-slate-600 ${className}`} style={style}>{fallback}</span>;
  }

  // If converting but rates haven't loaded yet, show placeholder
  if (convert && ratesLoading) {
    return <span className={`animate-pulse text-gray-300 dark:text-slate-600 ${className}`} style={style}>⟳</span>;
  }

  const formatted = formatCurrency(amount, {
    convert,
    compact,
    minDecimals,
    maxDecimals,
    currency: overrideCurrency,
  });

  return (
    <span className={className} style={style}>
      {formatted}
    </span>
  );
};

export default Price;

/**
 * PriceGroup — renders two prices side-by-side for comparison
 * (e.g. monthly/yearly toggle).
 *
 * Props:
 *   @param {number}  primaryAmount
 *   @param {string}  primaryLabel
 *   @param {number}  [secondaryAmount]
 *   @param {string}  [secondaryLabel]
 *   @param {object}  [priceProps]  - Extra props passed to both <Price>s
 */
export const PriceGroup = ({
  primaryAmount,
  primaryLabel,
  secondaryAmount,
  secondaryLabel,
  priceProps = {},
}: {
  primaryAmount: number;
  primaryLabel?: React.ReactNode;
  secondaryAmount?: number | null;
  secondaryLabel?: React.ReactNode;
  priceProps?: Partial<Omit<PriceProps, 'amount'>>;
}) => {
  const { loading, ratesLoading } = useCurrency();
  const isLoading = loading || (priceProps.convert && ratesLoading);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      {isLoading ? (
        <span className="text-gray-300 dark:text-slate-600 animate-pulse">⟳</span>
      ) : (
        <>
          <Price amount={primaryAmount} {...priceProps} />
          {primaryLabel && <span className="text-sm text-gray-500">{primaryLabel}</span>}
          {secondaryAmount != null && (
            <>
              <span className="text-sm text-gray-400">/</span>
              <Price amount={secondaryAmount} {...priceProps} />
              {secondaryLabel && <span className="text-sm text-gray-500">{secondaryLabel}</span>}
            </>
          )}
        </>
      )}
    </span>
  );
};

