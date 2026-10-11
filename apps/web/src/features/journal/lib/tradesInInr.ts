// Every trade with its money expressed in rupees, for the pages that add up
// or chart the whole journal (Dashboard, Analytics, Calendar, ...).
//
// Each trade is recorded in its own currency (`trade.currency`, INR unless
// the trader chose otherwise). Totals mix trades, so they're first brought to
// one currency — rupees, like the rest of the site's data — and the pages
// then show them in the visitor's selected currency with `formatInr`. The
// Trades list keeps each trade in its own currency.
import { convert } from "@/lib/region";
import { getAllTrades, type Trade, type TradeListResponse } from "./api";

const MONEY_FIELDS = ["entry_price", "exit_price", "target_price", "stop_loss", "brokerage", "pnl", "margin", "strike_price", "underlying_price"] as const;

export function tradeInInr<T extends Partial<Trade>>(trade: T): T {
  const from = String(trade.currency || "INR").toUpperCase();
  if (from === "INR") return trade;
  const out: Record<string, unknown> = { ...trade, currency: "INR" };
  for (const field of MONEY_FIELDS) {
    const v = trade[field as keyof T];
    if (typeof v === "number" && Number.isFinite(v)) out[field] = convert(v, from, "INR");
  }
  return out as T;
}

export async function getAllTradesInInr(): Promise<TradeListResponse> {
  const res = await getAllTrades();
  return { ...res, data: res.data.map(tradeInInr) };
}

/** A trade's money in another currency (e.g. the visitor's, for the AI coach). */
export function tradeInCurrency<T extends Partial<Trade>>(trade: T, to: string): T {
  const from = String(trade.currency || "INR").toUpperCase();
  if (from === to) return trade;
  const out: Record<string, unknown> = { ...trade, currency: to };
  for (const field of MONEY_FIELDS) {
    const v = trade[field as keyof T];
    if (typeof v === "number" && Number.isFinite(v)) out[field] = convert(v, from, to);
  }
  return out as T;
}
