// "≈ $12 · charged in ₹" — shown beside a rupee price that can only be paid in
// rupees (AI packs, algo listings, consultations), when the visitor has picked
// another currency. The converted figure is a guide from the daily exchange rate;
// the real charge is always the rupee amount.
import useRegion from '../hooks/useRegion';
import { convert } from '../lib/region';

const approx = (n: number) =>
  n >= 100 ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function ApproxPrice({ inr, suffix = '', className = '' }: { inr: number; suffix?: string; className?: string }) {
  const { config } = useRegion();
  if (config.currency === 'INR' || !(inr > 0)) return null;
  const value = convert(inr, 'INR', config.currency);
  return (
    <span className={`text-xs font-normal opacity-70 ${className}`}>
      ≈ {config.symbol}
      {approx(value)}
      {suffix} · charged in ₹
    </span>
  );
}
