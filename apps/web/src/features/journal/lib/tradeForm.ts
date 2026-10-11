// Trade form data: option lists, form state <-> trade conversion, P&L maths
// and validation, shared by TradeFormDialog and the Trades page.
import type { Trade } from "./api";

// Option lists carried over from the original journal (app.js / index.html).
export const TRADING_TYPES = ["Scalping", "Intraday", "Swing Trading", "Positional Trading", "Investing", "Long-Term Investing"];
export const TRADE_MARKETS = ["Equity", "Futures", "Options", "Commodities", "Forex", "Crypto_Currency"];
export const DEFAULT_STRATEGIES = ["Breakout", "Breakdown", "M Pattern", "W Pattern", "Head & shoulder", "Iron Condor", "Hammer Candle", "Shooting Star"];
export const TIME_ZONES = [
  { value: "Asia/Kolkata", label: "IST - India" },
  { value: "America/New_York", label: "ET - New York" },
  { value: "America/Chicago", label: "CT - Chicago" },
  { value: "America/Los_Angeles", label: "PT - Los Angeles" },
  { value: "Europe/London", label: "GMT/BST - London" },
  { value: "Europe/Berlin", label: "CET - Berlin" },
  { value: "Asia/Dubai", label: "GST - Dubai" },
  { value: "Asia/Singapore", label: "SGT - Singapore" },
  { value: "Asia/Tokyo", label: "JST - Tokyo" },
  { value: "Australia/Sydney", label: "AET - Sydney" },
];
export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];
export const CURRENCY_SYMBOL: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED", SGD: "S$", JPY: "¥" };
export const EMOTIONS = [
  { value: "confident", label: "😊 Confident" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "uncertain", label: "😟 Uncertain" },
  { value: "frustrated", label: "😤 Frustrated" },
  { value: "excited", label: "🤩 Excited" },
  { value: "fearful", label: "😨 Fearful" },
  { value: "greedy", label: "💰 Greedy" },
];

// Form state uses strings for every input (native form control values),
// converted to the typed/snake_case payload on submit.
export interface TradeFormState {
  date: string;
  exit_date: string;
  entry_time: string;
  exit_time: string;
  time_zone: string;
  type: string;
  market: string;
  asset: string;
  currency: string;
  quantity: string;
  entry_price: string;
  target_price: string;
  stop_loss: string;
  exit_price: string;
  brokerage: string;
  pnl: string;
  strategy: string;
  margin: string;
  buy_sell: "buy" | "sell";
  contract: string;
  strike_price: string;
  option_type: "call" | "put" | "";
  underlying_price: string;
  implied_volatility: string;
  days_to_expiry: string;
  notes: string;
  tags: string;
  emotion: string;
}

export const EMPTY_FORM: TradeFormState = {
  date: "",
  exit_date: "",
  entry_time: "",
  exit_time: "",
  time_zone: "Asia/Kolkata",
  type: "",
  market: "",
  asset: "",
  currency: "INR",
  quantity: "",
  entry_price: "",
  target_price: "",
  stop_loss: "",
  exit_price: "",
  brokerage: "",
  pnl: "",
  strategy: "",
  margin: "",
  buy_sell: "buy",
  contract: "",
  strike_price: "",
  option_type: "",
  underlying_price: "",
  implied_volatility: "",
  days_to_expiry: "",
  notes: "",
  tags: "",
  emotion: "neutral",
};

// Quick-add memory: the last market/type/currency/time zone/fees used, and
// recently traded assets, so a new trade starts mostly filled in.
export const DEFAULTS_KEY = "journal_trade_defaults_v1";
export const RECENT_ASSETS_KEY = "journal_recent_assets_v1";
export type RememberedDefaults = Partial<Pick<TradeFormState, "market" | "type" | "currency" | "time_zone" | "brokerage">>;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — just don't remember
  }
}

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** A blank trade for today, using the last-used market/type/currency/fees. */
export function newTradeForm(): TradeFormState {
  const remembered = readJson<RememberedDefaults>(DEFAULTS_KEY, {});
  return { ...EMPTY_FORM, ...remembered, date: todayIso() };
}

export function tradeToForm(trade: Trade): TradeFormState {
  const s = (v: number | null | undefined) => (v != null ? String(v) : "");
  return {
    date: trade.date || "",
    exit_date: trade.exit_date || "",
    entry_time: trade.entry_time || "",
    exit_time: trade.exit_time || "",
    time_zone: trade.time_zone || "Asia/Kolkata",
    type: trade.type || "",
    market: trade.market || "",
    asset: trade.asset || "",
    currency: trade.currency || "INR",
    quantity: s(trade.quantity),
    entry_price: s(trade.entry_price),
    target_price: s(trade.target_price),
    stop_loss: s(trade.stop_loss),
    exit_price: s(trade.exit_price),
    brokerage: trade.brokerage != null ? String(trade.brokerage) : "",
    pnl: s(trade.pnl),
    strategy: trade.strategy || "",
    margin: s(trade.margin),
    buy_sell: trade.buy_sell || "buy",
    contract: trade.contract || "",
    strike_price: s(trade.strike_price),
    option_type: trade.option_type || "",
    underlying_price: s(trade.underlying_price),
    implied_volatility: s(trade.implied_volatility),
    days_to_expiry: s(trade.days_to_expiry),
    notes: trade.notes || "",
    tags: (trade.tags || []).join(", "),
    emotion: trade.emotion || "neutral",
  };
}

export function num(value: string): number | null {
  if (value === "" || value == null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatMoney(value: number | null | undefined, currency: string | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 2 }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

// Same formula as CSV import (services/api/modules/journal/importParsers.ts).
// Returns "" until quantity, entry and exit price are all filled in.
export function calcPnl(f: Pick<TradeFormState, "quantity" | "entry_price" | "exit_price" | "brokerage" | "buy_sell">): string {
  const q = parseFloat(f.quantity);
  const entry = parseFloat(f.entry_price);
  const exit = parseFloat(f.exit_price);
  if (!Number.isFinite(q) || !Number.isFinite(entry) || !Number.isFinite(exit)) return "";
  const fees = parseFloat(f.brokerage) || 0;
  const gross = f.buy_sell === "sell" ? (entry - exit) * q : (exit - entry) * q;
  return String(Math.round((gross - fees) * 100) / 100);
}

export const PNL_INPUTS = new Set<keyof TradeFormState>(["quantity", "entry_price", "exit_price", "brokerage", "buy_sell"]);

// Fields that live under "More details"; open it automatically when editing a trade that uses them.
export const MORE_FIELDS: (keyof TradeFormState)[] = ["exit_date", "entry_time", "exit_time", "margin", "notes", "tags", "underlying_price", "implied_volatility"];

/** What still has to be filled in before the trade can be saved (empty = ready). */
export function missingRequired(f: TradeFormState): string[] {
  const missing: string[] = [];
  if (!f.asset.trim()) missing.push("asset");
  if (!f.date) missing.push("trade date");
  if (!f.market) missing.push("market");
  if (!((num(f.quantity) ?? 0) > 0)) missing.push("quantity");
  if (!((num(f.entry_price) ?? 0) > 0)) missing.push("entry price");
  return missing;
}

/** Other mistakes that block saving. */
export function formProblems(f: TradeFormState): string[] {
  const problems: string[] = [];
  if (f.exit_date && f.date && f.exit_date < f.date) problems.push("Exit day is before the trade date");
  const nonNegative = ["target_price", "stop_loss", "exit_price", "brokerage", "strike_price"] as const;
  if (nonNegative.some((k) => (num(f[k]) ?? 0) < 0)) problems.push("Prices and fees can't be negative");
  return problems;
}

