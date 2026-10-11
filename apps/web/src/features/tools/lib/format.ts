// Display helpers shared by the calculators' charts.
// Recharts prints raw numbers by default, which exposes floating-point noise
// such as 20127.589999999997 — always round money to at most 2 decimals.
// Symbol and grouping follow the active region (₹ + lakh grouping for India).
import { getRegionConfig } from '../../../lib/region';

const money = (n: number) => {
  const cfg = getRegionConfig();
  return n.toLocaleString(cfg.currency === 'INR' ? 'en-IN' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const symbol = () => getRegionConfig().symbol;

/** `label` for a <Pie>: "₹6,96,088.75". */
export const pieValueLabel = ({ value }: { value: number }) => `${symbol()}${money(Number(value))}`;

/** `formatter` for a <Tooltip>: same rounding for hover values. */
export const moneyTooltip = (value: number | string) => `${symbol()}${money(Number(value))}`;

/** Always-rupee versions for India-only calculators (ELSS), whatever the region. */
export const moneyTooltipInr = (value: number | string) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
