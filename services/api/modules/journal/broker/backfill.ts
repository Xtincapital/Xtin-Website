// Adds earlier executions to a customer's history and corrects the trades the
// journal derived without them.
//
// The daily sync only ever adds later fills, and a trade already closed never
// changes when later fills arrive (the pairing is tested for that), so it can
// simply add new trades. A backfill is different: earlier fills can change trades
// already in the journal. A long position bought before the customer linked and
// sold after was first read as a short; with the purchase added, that trade is
// wrong. So a backfill works out the trades from the complete history and
// reconciles them with what the journal already holds:
//
//   - a trade that is new is added;
//   - a trade whose numbers change is updated, and one that no longer exists is
//     removed, BUT ONLY if nobody has touched it. A trade the customer has
//     annotated or edited is never changed or deleted; it is kept and reported
//     so someone can look at it;
//   - a trade already right is left alone.
//
// "Nobody has touched it" is checked against what the sync itself would have
// written from the fills held before the backfill, field by field, and against
// the fields only the customer fills in (notes, strategy, tags, ...).
import { pairFills } from "./roundTrips.js";
import { openingFills } from "./syncService.js";
import { toJournalTrade } from "./tradeMapper.js";
import type { BrokerLink, BrokerStore } from "./store.js";
import type { BrokerFill } from "./types.js";

type Row = Record<string, any>;

/** The fields the sync works out from fills. These are what an update rewrites. */
export const DERIVED_FIELDS = [
    "date", "exit_date", "entry_time", "exit_time", "time_zone", "type", "market", "asset", "currency", "quantity",
    "entry_price", "exit_price", "brokerage", "pnl", "buy_sell", "contract", "strike_price", "option_type", "days_to_expiry",
] as const;

const blank = (v: unknown) => v === null || v === undefined || v === "";

/** Equal as the database would hold them: empty is empty, numbers compare by value, anything else as given. */
const sameValue = (a: unknown, b: unknown) => {
    if (blank(a) || blank(b)) return blank(a) && blank(b);
    const [x, y] = [Number(a), Number(b)];
    if (Number.isFinite(x) && Number.isFinite(y)) return Math.abs(x - y) < 1e-9;
    return a === b;
};

const sameDerived = (a: Row, b: Row) => DERIVED_FIELDS.every((f) => sameValue(a[f], b[f]));

/** True if the customer has filled in or changed anything of their own on a trade. */
export function hasCustomerEdits(row: Row): boolean {
    return (
        !blank(row.notes) ||
        !blank(row.strategy) ||
        (Array.isArray(row.tags) && row.tags.length > 0) ||
        (!blank(row.emotion) && row.emotion !== "neutral") ||
        !blank(row.target_price) ||
        !blank(row.stop_loss) ||
        !blank(row.margin) ||
        !blank(row.underlying_price) ||
        !blank(row.implied_volatility) ||
        !blank(row.greeks)
    );
}

export interface KeptTrade {
    externalId: string;
    asset: string;
    date: string;
    /** The history now says the trade should be different (changed) or shouldn't exist (superseded), but it has been edited. */
    why: "changed" | "superseded";
}

export interface BackfillPlan {
    /** Executions not already held. */
    newFills: BrokerFill[];
    insert: Row[];
    update: Array<{ externalId: string; patch: Row }>;
    remove: string[];
    kept: KeptTrade[];
    /** What the complete history comes to once applied. */
    totals: { fills: number; trades: number; open: number; unmatched: number };
}

/** Works out what adding `incoming` executions would do, without changing anything. */
export async function planBackfill(store: BrokerStore, link: BrokerLink, incoming: BrokerFill[]): Promise<BackfillPlan> {
    const have = await store.loadFills(link);
    const haveIds = new Set(have.map((f) => f.executionId));
    const seen = new Set<string>();
    const newFills = incoming.filter((f) => {
        if (f.clientCode !== link.client_code || haveIds.has(f.executionId) || seen.has(f.executionId)) return false;
        seen.add(f.executionId);
        return true;
    });

    const opening = openingFills(link);
    const before = pairFills([...opening, ...have]);
    const after = pairFills([...opening, ...have, ...newFills]);
    const asRows = (trades: typeof after.trades) => new Map<string, Row>(trades.map((t) => [t.externalId, toJournalTrade(t, link.user_id)]));
    const wasRows = asRows(before.trades);
    const nowRows = asRows(after.trades);

    const existing = new Map<string, Row>((await store.listSyncedTrades(link.user_id, link.client_code)).map((r) => [String(r.external_id), r]));
    const plan: BackfillPlan = {
        newFills,
        insert: [],
        update: [],
        remove: [],
        kept: [],
        totals: { fills: have.length + newFills.length, trades: after.trades.length, open: after.open.length, unmatched: after.unmatched.length },
    };

    for (const [externalId, row] of existing) {
        const should = nowRows.get(externalId);
        if (should && sameDerived(row, should)) continue; // already right

        // Untouched means it is what the sync would have written from the fills held until now, and
        // the customer has added nothing of their own. If we can't tell, it is treated as touched.
        const wasWritten = wasRows.get(externalId);
        const untouched = !!wasWritten && sameDerived(row, wasWritten) && !hasCustomerEdits(row);

        if (!untouched) {
            plan.kept.push({ externalId, asset: String(row.asset ?? ""), date: String(row.date ?? ""), why: should ? "changed" : "superseded" });
        } else if (should) {
            plan.update.push({ externalId, patch: Object.fromEntries(DERIVED_FIELDS.map((f) => [f, should[f] ?? null])) });
        } else {
            plan.remove.push(externalId);
        }
    }
    for (const [externalId, row] of nowRows) if (!existing.has(externalId)) plan.insert.push(row);
    return plan;
}

/**
 * Carries out a plan. Trades first and the executions last, so if it stops part-way, running the
 * same backfill again finishes the job: the second run sees the trades already right and the
 * executions still to be saved.
 */
export async function applyBackfill(store: BrokerStore, link: BrokerLink, plan: BackfillPlan): Promise<void> {
    if (plan.remove.length) await store.deleteSyncedTrades(link.user_id, plan.remove);
    for (const { externalId, patch } of plan.update) await store.updateSyncedTrade(link.user_id, externalId, patch);
    if (plan.insert.length) await store.insertTrades(plan.insert);
    if (plan.newFills.length) await store.saveFills(link, plan.newFills);
}
