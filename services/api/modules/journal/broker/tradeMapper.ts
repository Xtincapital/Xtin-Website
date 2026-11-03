// Turns a completed round trip into a `journal_trades` row, in the same shape
// POST /journal/trades takes plus the two sync-only columns (source, external_id).
import { daysToExpiry, resolveInstrument } from "./instruments.js";
import type { RoundTrip } from "./types.js";

const IST_OFFSET_MS = 330 * 60_000;

/** The date (YYYY-MM-DD) and time (HH:MM) of an instant on the Indian clock. */
export function istParts(iso: string): { date: string; time: string } {
    const shifted = new Date(Date.parse(iso) + IST_OFFSET_MS).toISOString();
    return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}

export function toJournalTrade(trip: RoundTrip, userId: string): Record<string, unknown> {
    const info = resolveInstrument(trip.symbol, trip.segment);
    const opened = istParts(trip.openedAt);
    const closed = istParts(trip.closedAt);
    return {
        user_id: userId,
        date: opened.date,
        exit_date: closed.date,
        entry_time: opened.time,
        exit_time: closed.time,
        time_zone: "Asia/Kolkata",
        // Held past the day it was opened is swing or positional, which the trader
        // decides, so only the same-day case is filled in.
        type: opened.date === closed.date ? "Intraday" : null,
        market: info.market,
        asset: info.asset,
        currency: "INR",
        quantity: trip.quantity,
        entry_price: trip.entryPrice,
        exit_price: trip.exitPrice,
        brokerage: trip.charges,
        pnl: trip.netPnl,
        buy_sell: trip.side,
        contract: info.contract,
        strike_price: info.strikePrice,
        option_type: info.optionType,
        days_to_expiry: daysToExpiry(info.expiry, opened.date),
        tags: [],
        notes: "",
        source: "xts",
        external_id: trip.externalId,
    };
}
