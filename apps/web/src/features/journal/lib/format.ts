// Money as the Journal shows it: the site's normal formatting ("₹1,475",
// "-₹345"). Profit and loss read from the colour (green / red), so no extra
// "+" is added. Kept as one helper so every Journal page formats amounts the
// same way.
type Format = (amount: number, opts?: { compact?: boolean }) => string;

export function signedMoney(format: Format, value: number, opts?: { compact?: boolean }): string {
  return format(value, opts);
}

/** "18.4%" / "-3.1%" */
export function signedPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
