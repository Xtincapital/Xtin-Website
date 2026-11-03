// What the sync needs from storage. The Supabase implementation lives in
// broker.repository.ts; keeping it behind this interface lets the sync logic be
// tested against an in-memory store.
import type { BrokerFill, Side } from "./types.js";

/** A position the customer already held when they linked, so a later sale has something to close. */
export interface OpeningPosition {
    symbol: string;
    segment: string | null;
    product: string | null;
    side: Side;
    quantity: number;
    price: number;
    /** ISO-8601; must be earlier than the customer's first synced fill. */
    openedAt: string;
}

export interface BrokerLink {
    id: string;
    user_id: string;
    broker: string;
    client_code: string;
    status: "pending" | "active" | "revoked";
    consent_version: string;
    consent_at: string;
    verified_at: string | null;
    verification_method: string | null;
    opening_positions: OpeningPosition[];
    last_synced_at: string | null;
    last_sync_status: "success" | "failed" | null;
    last_sync_error: string | null;
    /** Who decided, when and why (see migration 0020). Absent until a link has been reviewed. */
    review_outcome?: "approved" | "rejected" | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    review_note?: string | null;
    created_at: string;
    updated_at: string;
}

export type SyncOutcome = { ok: true } | { ok: false; error: string };

export interface BrokerStore {
    /** Stores fills not already held; returns how many were new. */
    saveFills(link: BrokerLink, fills: BrokerFill[]): Promise<number>;
    /** Every fill held for the link's client code. */
    loadFills(link: BrokerLink): Promise<BrokerFill[]>;
    /** Which of these `external_id`s the user's journal already has. */
    existingExternalIds(userId: string, ids: string[]): Promise<Set<string>>;
    /** Inserts trades, skipping any whose (user, external_id) already exists. */
    insertTrades(rows: Record<string, unknown>[]): Promise<void>;
    /** The trades the sync made for this client code in the user's journal (never hand-entered ones), as stored. */
    listSyncedTrades(userId: string, clientCode: string): Promise<Array<Record<string, any>>>;
    /** Changes the named fields of one synced trade. */
    updateSyncedTrade(userId: string, externalId: string, patch: Record<string, unknown>): Promise<void>;
    /** Removes synced trades by external id. Only ever synced ones: hand-entered trades are never touched. */
    deleteSyncedTrades(userId: string, externalIds: string[]): Promise<void>;
    recordSync(link: BrokerLink, outcome: SyncOutcome): Promise<void>;
}
