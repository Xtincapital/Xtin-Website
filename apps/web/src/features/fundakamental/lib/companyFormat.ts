// Number formatting for the Company numbers page.
const dash = "—";

export const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** ₹ crore for Indian companies, $ millions/billions otherwise. */
export function makeMoney(inr: boolean) {
  return (v: number | null | undefined): string => {
    if (!isNum(v)) return dash;
    const sign = v < 0 ? "-" : "";
    const abs = Math.abs(v);
    if (inr) return `${sign}₹${Math.round(abs / 1e7).toLocaleString("en-IN")} Cr`;
    if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
    return abs >= 1e9 ? `${sign}$${(abs / 1e9).toFixed(1)}B` : `${sign}$${(abs / 1e6).toFixed(0)}M`;
  };
}

export const pctText = (v: number | null | undefined): string => (isNum(v) ? `${v.toFixed(1)}%` : dash);
export const ratioText = (v: number | null | undefined): string => (isNum(v) ? v.toFixed(2) : dash);

/** Numeric snapshot values can arrive as strings (bigint/numeric columns). */
export const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const isIndianCompany = (ticker: string, currency?: string | null) => /\.(NS|BO)$/i.test(ticker) || currency === "INR";

// Fiscal years are named by the year they end in (Mar-2026 → FY26, Sep-2025 → FY25).
export const yearLabel = (date: string) => `FY${String(new Date(date).getUTCFullYear()).slice(2)}`;
export const quarterLabel = (date: string) => new Date(date).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
