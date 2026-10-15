/** Text-colour class for a 0–10 score: green from 7, amber from 5, else red. */
export const scoreTone = (s: number) =>
  s >= 7 ? "text-brand" : s >= 5 ? "text-warning" : "text-destructive";

/** Soft pill (background + text) matching scoreTone. */
export const scorePill = (s: number) =>
  s >= 7 ? "bg-brand-soft text-brand" : s >= 5 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";

/** Short plain-language health label — never a buy/sell call. */
export const healthLabel = (s: number) =>
  s >= 8 ? "Strong" : s >= 6.5 ? "Healthy" : s >= 5 ? "Mixed" : "Weak";

/** 2–4 letter tile text for a company: ticker without exchange suffix, else name. */
export const tickerTile = (ticker: string | undefined, company: string) => {
  const t = ticker && !/^n\/?a$/i.test(ticker.trim()) ? ticker : company;
  return (t || "?").replace(/\.(NS|BO|L|PA|SI)$/i, "").replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase();
};
