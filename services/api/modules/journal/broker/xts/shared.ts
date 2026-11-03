// Small pieces both the adapter and the connection test use.
import type { XtsSession } from "./session.js";

export const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 330 * 60_000;

/** The date (YYYY-MM-DD) on the Indian clock at `ms`. */
export const istDay = (ms: number) => new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);

// ASSUMPTION: a dealer login picks the client with ?clientID=, as OrderBook documents it.
// TradeBook's and Profile's own docs list it only as a response field or not at all.
export const clientQuery = (session: XtsSession, code: string) => (session.isInvestorClient ? "" : `?clientID=${encodeURIComponent(code)}`);
