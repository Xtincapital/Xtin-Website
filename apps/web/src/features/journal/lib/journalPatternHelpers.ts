// Shared helpers for Journal's "pattern analysis" pages (Heatmaps, Hourly) —
// ported from features-incoming/journal/app.js's hourly-analysis and
// heatmap-visualization sections (roughly lines 4150-4790). Kept as small,
// pure functions with no DOM/localStorage/Chart.js dependencies so both
// pages/Heatmaps.tsx and pages/Hourly.tsx can share them.
//
// Deliberate departure from the original (same one Dashboard.tsx already
// documents, applied consistently here): the original converted every
// trade's P&L to INR via `getTradePnlInINR()`/`convertTradeAmountToINR()`
// before aggregating, then formatted with a hardcoded INR-aware
// `formatCurrencyShort()`. This port sums raw `trade.pnl` as-is and callers
// format with the shared `useCurrency()` (`formatCurrency(v, { compact:
// true })` in place of `formatCurrencyShort`) — correct for single-currency
// trade history, not for mixed-currency aggregation. A real fix needs either
// a stored FX rate per trade or a backend aggregate endpoint; out of scope
// here, same as Dashboard.tsx's note.
import type { Trade } from './api';

/** Universal 24h session buckets — port of app.js's `GLOBAL_SESSIONS`
 *  (supports equity/forex/crypto trades that span all hours, not just a
 *  single market's regular session). */
export const GLOBAL_SESSIONS = [
  { label: 'Asia (00:00-06:00)', startHour: 0, endHour: 6 },
  { label: 'Europe (06:00-12:00)', startHour: 6, endHour: 12 },
  { label: 'Americas (12:00-18:00)', startHour: 12, endHour: 18 },
  { label: 'Overnight (18:00-24:00)', startHour: 18, endHour: 24 },
] as const;

/** Port of app.js's `getEntryHour()`. Trades without a parseable entry_time
 *  are excluded from hour-based buckets (matches original returning null). */
export function getEntryHour(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;
  const hour = parseInt(timeStr.split(':')[0], 10);
  return isNaN(hour) ? null : hour;
}

/** Port of app.js's `getEntryMinute()`. */
export function getEntryMinute(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const minute = parseInt(timeStr.split(':')[1], 10);
  return isNaN(minute) ? 0 : minute;
}

/** Port of app.js's `getSessionLabelForTrade()` (and its `getSessionBucket`
 *  alias, which just called this same function). */
export function getSessionLabelForTrade(trade: Pick<Trade, 'entry_time'>): string {
  const hour = getEntryHour(trade.entry_time);
  const minute = getEntryMinute(trade.entry_time);
  if (hour === null) return GLOBAL_SESSIONS[0]?.label ?? 'Global Session';
  const totalMinutes = hour * 60 + minute;
  const session =
    GLOBAL_SESSIONS.find(({ startHour, endHour }) => {
      const start = startHour * 60;
      const end = endHour * 60;
      return totalMinutes >= start && totalMinutes < end;
    }) ?? GLOBAL_SESSIONS[GLOBAL_SESSIONS.length - 1];
  return session.label;
}

/** Port of app.js's `getSessionBucket()` — a plain alias for
 *  `getSessionLabelForTrade` in the original too. */
export const getSessionBucket = getSessionLabelForTrade;

/** Port of app.js's `formatHourDisplay()` — "9:00 AM" / "2:00 PM" style. */
export function formatHourDisplay(hour: number | null): string {
  if (hour === null || isNaN(hour)) return 'N/A';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

/** Port of app.js's `formatHourRange()` — "9:00 AM - 10:00 AM" style. */
export function formatHourRange(hour: number | null): string {
  if (hour === null || isNaN(hour)) return '--';
  const endHour = (hour + 1) % 24;
  return `${formatHourDisplay(hour)} - ${formatHourDisplay(endHour)}`;
}

/** Colour for a heatmap cell, scaled by `value` relative to `maxAbs`:
 *  a green tint for profit and a red tint for loss, stronger for bigger
 *  amounts, mixed into the card colour so it works in light and dark mode
 *  (labels on top use the normal text colours). Gold marks exactly zero; the
 *  muted surface means there is nothing to scale against. */
export function getHeatmapColor(value: number, maxAbs: number): string {
  if (!maxAbs || maxAbs === 0) {
    return 'hsl(var(--muted))';
  }
  if (value === 0) {
    return 'color-mix(in srgb, hsl(var(--warning)) 16%, hsl(var(--card)))';
  }
  const ratio = Math.min(Math.abs(value) / maxAbs, 1);
  const strength = Math.round(10 + ratio * 45);
  const tone = value > 0 ? 'var(--chart-positive)' : 'var(--chart-negative)';
  return `color-mix(in srgb, hsl(${tone}) ${strength}%, hsl(var(--card)))`;
}

/** Port of app.js's `normalizeStrategyName()` — used by Hourly's
 *  "best strategy per hour" breakdown. */
export function normalizeStrategyName(name: string | null | undefined): string {
  return typeof name === 'string' ? name.trim() : '';
}

/** How a stored market value is shown: "Crypto_Currency" is kept in the data for
 *  existing trades but reads "Crypto Currency". */
export function marketLabel(market: string): string {
  return market.replace(/_/g, " ");
}
