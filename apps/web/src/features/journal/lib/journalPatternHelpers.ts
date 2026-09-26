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

/** Port of app.js's `interpolateColor()` — linear RGB interpolation between
 *  two [r,g,b] triples by `factor` (0-1). */
export function interpolateColor(
  start: readonly [number, number, number],
  end: readonly [number, number, number],
  factor: number,
): string {
  const clamped = Math.min(Math.max(factor, 0), 1);
  const channel = start.map((val, idx) => Math.round(val + (end[idx] - val) * clamped));
  return `rgba(${channel[0]}, ${channel[1]}, ${channel[2]}, 0.9)`;
}

/** Port of app.js's `getHeatmapColor()` — the color-scaling logic behind
 *  every heatmap cell: gray when there's no data to scale against, amber at
 *  exactly zero, and an amber→green or red→amber gradient (scaled by
 *  magnitude relative to `maxAbs`) for positive/negative values
 *  respectively. */
export function getHeatmapColor(value: number, maxAbs: number): string {
  // Solid equivalents of the original translucent fills (as they render on
  // white), so the cells' dark labels stay readable on a dark-mode background.
  if (!maxAbs || maxAbs === 0) {
    return 'rgb(234, 237, 241)';
  }
  if (value === 0) {
    return 'rgb(254, 236, 188)';
  }
  const ratio = Math.min(Math.abs(value) / maxAbs, 1);
  if (value > 0) {
    return interpolateColor([251, 191, 36], [34, 197, 94], ratio);
  }
  return interpolateColor([239, 68, 68], [251, 191, 36], ratio);
}

/** Port of app.js's `normalizeStrategyName()` — used by Hourly's
 *  "best strategy per hour" breakdown. */
export function normalizeStrategyName(name: string | null | undefined): string {
  return typeof name === 'string' ? name.trim() : '';
}
