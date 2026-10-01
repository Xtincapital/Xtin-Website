import type { UTCTimestamp } from "lightweight-charts";

// Candle times are naive exchange-local strings; reading them as UTC keeps the
// chart's clock identical to the trade table's.
export const toUnix = (iso: string) => Math.floor(Date.parse(iso.length <= 10 ? `${iso}T00:00:00Z` : `${iso}Z`) / 1000) as UTCTimestamp;

/** "2024-01-02T09:15:00" → "2 Jan 2024, 09:15"; `dateOnly` drops the clock (daily bars). */
export function shortTime(iso: string, dateOnly = false): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00Z` : `${iso}Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const hm = iso.slice(11, 16);
  return !dateOnly && hm && hm !== "00:00" ? `${date}, ${hm}` : date;
}
