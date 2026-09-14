/**
 * FundaKaMental currency helpers, ported from
 * features-incoming/fundakamental/src/lib/currency.ts.
 *
 * Region source: this app already has a region service at `@/lib/region`
 * (built for the newsletter feature's regional pricing) that is,
 * structurally, the same service FundaKaMental's own `lib/region.ts` is —
 * same region codes (IN/US/GB/EU/AE/SG/GLOBAL), same saved-override → IP →
 * timezone/locale heuristic detection, same localStorage keys
 * (`xtin_region_v1`, `xtin_ip_region`, `xtin_fx_rates`), same FX/`convert`
 * logic. Running FundaKaMental's own copy of `region.ts` side by side would
 * create two independent singletons that both read/write the SAME
 * localStorage key but don't notify each other's subscribers — a real
 * desync bug (switch region in one, the other only catches up on reload).
 * So this port reuses the shared `@/lib/region` instead of duplicating it,
 * and only re-adds the two things FundaKaMental-specific code needs that
 * the shared file doesn't already export: the `Currency`/`RegionCode`
 * *type* aliases (the shared file is intentionally untyped/plain) and
 * `popularTickers()` (FundaKaMental's curated per-region example tickers —
 * the shared file has no notion of "example tickers", it's a newsletter
 * pricing concern only).
 */
import {
  REGIONS,
  getRegion,
  setRegion,
} from "@/lib/region";

export type RegionCode = keyof typeof REGIONS;
export type Currency = "INR" | "USD" | "GBP" | "EUR" | "AED" | "SGD";

const CURRENCY_META: Record<Currency, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  EUR: { symbol: "€", locale: "de-DE" },
  AED: { symbol: "د.إ", locale: "en-AE" },
  SGD: { symbol: "S$", locale: "en-SG" },
};

/** The current region's currency. */
export function detectCurrency(): Currency {
  return REGIONS[getRegion() as RegionCode].currency as Currency;
}

/** Switch to the first region that uses this currency. */
export function setCurrency(c: Currency) {
  const match = (Object.keys(REGIONS) as RegionCode[]).find((r) => REGIONS[r].currency === c);
  if (match) setRegion(match);
}

/** Format a whole-unit amount with an explicit currency (not the active region). */
export function formatPrice(amount: number, currency: Currency): string {
  const meta = CURRENCY_META[currency] || CURRENCY_META.USD;
  return `${meta.symbol}${Math.round(amount).toLocaleString(meta.locale)}`;
}

export function currencySymbol(currency: Currency): string {
  return (CURRENCY_META[currency] || CURRENCY_META.USD).symbol;
}

/**
 * Curated "Popular:" example tickers for search pills — region's own market
 * first, then a couple of globally-recognised names so the list never feels
 * parochial. Symbols are ready to paste into the analyzer search.
 *
 * Ported from FundaKaMental's own `lib/region.ts` (not otherwise reused —
 * see the module doc comment above).
 */
export function popularTickers(region?: RegionCode): string[] {
  const code = region || (getRegion() as RegionCode);
  const IN = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"];
  const US = ["AAPL", "MSFT", "NVDA", "GOOGL"];
  switch (code) {
    case "IN": return [...IN, "AAPL", "MSFT"];
    case "GB": return ["SHEL.L", "HSBA.L", "AZN.L", "AAPL", "MSFT"];
    case "EU": return ["ASML", "SAP", "MC.PA", "AAPL", "MSFT"];
    case "AE": return ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA"];
    case "SG": return ["D05.SI", "O39.SI", "AAPL", "MSFT", "NVDA"];
    default: return [...US, "TSLA", "AMZN"];
  }
}
