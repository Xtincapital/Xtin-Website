// When two journal trades count as the same trade: same date, asset (ignoring
// case and extra spaces), side, quantity, entry price, exit price and entry
// time. Used to refuse adding a trade that's already in the journal, and to
// mark rows of an uploaded file that are already there or repeated in the
// file. Two genuinely separate identical trades on one day can still be saved
// by giving them their entry times (or with `allow_duplicate`).
import { getTradeKeysInRange } from "./trades.repository.js";

export interface TradeKeyFields {
    date?: string | null;
    asset?: string | null;
    buy_sell?: string | null;
    quantity?: number | string | null;
    entry_price?: number | string | null;
    exit_price?: number | string | null;
    entry_time?: string | null;
}

const num = (v: unknown) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? "" : String(Number(v)));

/** "9:05", "09:05:00" and "09:05" are the same time. */
const time = (v: unknown) => {
    const m = String(v ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
    return m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
};

export function tradeKey(t: TradeKeyFields): string {
    return [
        String(t.date ?? "").slice(0, 10),
        String(t.asset ?? "").trim().replace(/\s+/g, " ").toLowerCase(),
        String(t.buy_sell ?? "").toLowerCase(),
        num(t.quantity),
        num(t.entry_price),
        num(t.exit_price),
        time(t.entry_time),
    ].join("|");
}

/** Keys of the user's trades dated between the earliest and latest of `trades`. */
export async function existingTradeKeys(userId: string, trades: TradeKeyFields[]): Promise<Map<string, string>> {
    const dates = trades.map((t) => String(t.date ?? "").slice(0, 10)).filter(Boolean).sort();
    const keys = new Map<string, string>();
    if (!dates.length) return keys;
    const rows = await getTradeKeysInRange(userId, dates[0], dates[dates.length - 1]);
    for (const row of rows) keys.set(tradeKey(row), row.id);
    return keys;
}

export type DuplicateOf = "journal" | "file";

/** Marks each uploaded row already in the journal, or repeating an earlier row of the same file. */
export function markDuplicates<T extends TradeKeyFields>(rows: T[], existing: Map<string, string>): Array<T & { duplicate?: DuplicateOf }> {
    const seen = new Set<string>();
    return rows.map((row) => {
        const key = tradeKey(row);
        if (existing.has(key)) return { ...row, duplicate: "journal" as const };
        if (seen.has(key)) return { ...row, duplicate: "file" as const };
        seen.add(key);
        return { ...row };
    });
}
