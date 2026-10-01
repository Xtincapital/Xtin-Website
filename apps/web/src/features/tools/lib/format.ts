// Display helpers shared by the calculators' charts.
// Recharts prints raw numbers by default, which exposes floating-point noise
// such as 20127.589999999997 — always round money to at most 2 decimals.

const money = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** `label` for a <Pie>: "₹6,96,088.75". */
export const pieValueLabel = ({ value }: { value: number }) => `₹${money(Number(value))}`;

/** `formatter` for a <Tooltip>: same rounding for hover values. */
export const moneyTooltip = (value: number | string) => `₹${money(Number(value))}`;
