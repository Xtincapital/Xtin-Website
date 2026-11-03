// Test helper: an in-memory BrokerStore with the same rules as the Supabase one
// (fills unique per client and execution id, trades per user and external id).
import type { BrokerStore, SyncOutcome } from "./store.js";
import type { BrokerFill } from "./types.js";

export function memoryStore() {
    const fills = new Map<string, BrokerFill>();
    const trades = new Map<string, Record<string, unknown>>();
    const outcomes: Array<{ link: string; outcome: SyncOutcome }> = [];
    const store: BrokerStore = {
        async saveFills(link, incoming) {
            let added = 0;
            for (const f of incoming) {
                const key = `${link.client_code}|${f.executionId}`;
                if (!fills.has(key)) {
                    fills.set(key, f);
                    added += 1;
                }
            }
            return added;
        },
        async loadFills(link) {
            return [...fills.values()].filter((f) => f.clientCode === link.client_code);
        },
        async existingExternalIds(userId, ids) {
            return new Set(ids.filter((id) => trades.has(`${userId}|${id}`)));
        },
        async insertTrades(rows) {
            for (const r of rows) {
                const key = `${r.user_id}|${r.external_id}`;
                if (!trades.has(key)) trades.set(key, r);
            }
        },
        async listSyncedTrades(userId, clientCode) {
            return [...trades.values()].filter((t) => t.user_id === userId && t.source === "xts" && String(t.external_id).startsWith(`${clientCode}:`)).map((t) => ({ ...t }));
        },
        async updateSyncedTrade(userId, externalId, patch) {
            const row = trades.get(`${userId}|${externalId}`);
            if (row && row.source === "xts") Object.assign(row, patch);
        },
        async deleteSyncedTrades(userId, externalIds) {
            for (const id of externalIds) {
                const key = `${userId}|${id}`;
                if (trades.get(key)?.source === "xts") trades.delete(key);
            }
        },
        async recordSync(link, outcome) {
            outcomes.push({ link: link.id, outcome });
        },
    };
    const reset = () => {
        fills.clear();
        trades.clear();
        outcomes.length = 0;
    };
    return { store, fills, trades, outcomes, reset };
}
