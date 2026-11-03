// Pulls a linked customer's executions from the broker, keeps them, and adds
// any newly completed trades to their journal.
//
// Idempotent by design: fills are stored once (the broker's execution id is
// unique per client), the trades are always re-worked out from every stored
// fill, and a trade already in the journal is left exactly as it is, so a
// customer's notes and edits are never overwritten by a later sync.
import { pairFills } from "./roundTrips.js";
import { toJournalTrade } from "./tradeMapper.js";
import type { BrokerLink, BrokerStore } from "./store.js";
import type { BrokerAdapter, BrokerFill } from "./types.js";

export interface SyncSummary {
    /** Executions the broker returned. */
    fetched: number;
    /** Returned for a different client code than the link's, and ignored. */
    foreign: number;
    newFills: number;
    closedTrades: number;
    insertedTrades: number;
    alreadyInJournal: number;
    openPositions: number;
    /** Delivery sales with no known purchase; left out until opening positions are supplied. */
    unmatched: number;
    duplicates: number;
    invalid: number;
}

export interface SyncFailure {
    clientCode: string;
    error: string;
}

export interface SyncRunResult {
    total: number;
    synced: number;
    failed: number;
    /** Which customers failed and why, for the admins. */
    failures: SyncFailure[];
}

export function openingFills(link: BrokerLink): BrokerFill[] {
    return (link.opening_positions ?? []).map((p, i) => ({
        executionId: `seed:${i}`,
        clientCode: link.client_code,
        symbol: p.symbol,
        segment: p.segment,
        instrumentId: null,
        product: p.product,
        side: p.side,
        quantity: p.quantity,
        price: p.price,
        charges: null,
        tradedAt: p.openedAt,
    }));
}

export async function syncLink(adapter: BrokerAdapter, store: BrokerStore, link: BrokerLink): Promise<SyncSummary> {
    const fetched = await adapter.getTodaysFills(link.client_code);
    // Only this customer's executions may reach this customer's journal.
    const own = fetched.filter((f) => f.clientCode === link.client_code);
    const newFills = await store.saveFills(link, own);

    const stored = await store.loadFills(link);
    const paired = pairFills([...openingFills(link), ...stored]);

    const rows = paired.trades.map((t) => toJournalTrade(t, link.user_id));
    const have = await store.existingExternalIds(
        link.user_id,
        rows.map((r) => r.external_id as string),
    );
    const fresh = rows.filter((r) => !have.has(r.external_id as string));
    if (fresh.length) await store.insertTrades(fresh);

    await store.recordSync(link, { ok: true });
    return {
        fetched: fetched.length,
        foreign: fetched.length - own.length,
        newFills,
        closedTrades: rows.length,
        insertedTrades: fresh.length,
        alreadyInJournal: rows.length - fresh.length,
        openPositions: paired.open.length,
        unmatched: paired.unmatched.length,
        duplicates: paired.duplicates,
        invalid: paired.invalid,
    };
}

/** Syncs each link in turn; one customer's failure is recorded and never stops the rest. */
export async function syncLinks(adapter: BrokerAdapter, store: BrokerStore, links: BrokerLink[], onProgress?: (done: number, total: number) => void): Promise<SyncRunResult> {
    let synced = 0;
    let failed = 0;
    const failures: SyncFailure[] = [];
    for (const link of links) {
        try {
            await syncLink(adapter, store, link);
            synced += 1;
        } catch (err) {
            failed += 1;
            const message = ((err as Error)?.message || String(err)).slice(0, 300);
            failures.push({ clientCode: link.client_code, error: message });
            console.error(`[Journal] broker sync failed for link ${link.id}:`, message);
            await store.recordSync(link, { ok: false, error: message }).catch((e) => console.error("[Journal] could not record the sync failure:", e));
        }
        onProgress?.(synced + failed, links.length);
    }
    return { total: links.length, synced, failed, failures };
}
