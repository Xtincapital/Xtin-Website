// Money as the Journal shows it: profits carry a "+", losses a real minus
// sign ("+₹1,475", "−₹345"), so the direction reads before the colour does.
type Format = (amount: number, opts?: { compact?: boolean }) => string;

export function signedMoney(format: Format, value: number, opts?: { compact?: boolean }): string {
  if (value > 0) return `+${format(value, opts)}`;
  if (value < 0) return `−${format(Math.abs(value), opts)}`;
  return format(0, opts);
}

/** "+18.4%" / "−3.1%" */
export function signedPercent(value: number, digits = 1): string {
  const s = Math.abs(value).toFixed(digits);
  return value > 0 ? `+${s}%` : value < 0 ? `−${s}%` : `${s}%`;
}
