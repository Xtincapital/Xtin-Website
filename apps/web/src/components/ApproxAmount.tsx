// "≈ $24.79" — an amount kept in its own currency (e.g. an NSE share price in
// rupees) with a guide to its value in the visitor's selected currency.
// Renders nothing when the two currencies are the same.
import { useCurrency } from '@/contexts/CurrencyContext';
import { convert } from '@/lib/region';

export default function ApproxAmount({
  amount,
  from,
  inline = false,
  className = '',
}: {
  amount: number | null | undefined;
  /** The amount's currency, e.g. "INR". */
  from: string;
  /** Next to the amount on the same line, instead of underneath. */
  inline?: boolean;
  className?: string;
}) {
  const { currency, locale } = useCurrency();
  const n = Number(amount);
  if (from === currency || !Number.isFinite(n) || n === 0) return null;
  const value = convert(n, from, currency);
  let text: string;
  try {
    text = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
    }).format(value);
  } catch {
    text = value.toFixed(2);
  }
  return (
    <span className={`${inline ? 'ml-1' : 'block'} text-xs font-normal text-muted-foreground ${className}`} title={`Approximate value in ${currency}`}>
      ≈ {text}
    </span>
  );
}
