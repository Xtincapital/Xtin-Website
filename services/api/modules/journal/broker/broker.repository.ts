// Supabase-backed storage for the broker sync: links, fills and sync runs, plus
// the BrokerStore the sync service works through. Style mirrors
// trades.repository.ts: one small function per query.
import supabase from "../../../supabase/index.js";
import type { BrokerFill } from "./types.js";
import type { BrokerLink, BrokerStore, SyncOutcome } from "./store.js";

const BROKER = "xts";
const PAGE = 1000; // the most Supabase returns in one request
const CHUNK = 200;

const chunks = <T>(items: T[], size: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
};

// ── links ─────────────────────────────────────────────────────────────────

/** The customer's current link (pending or active), if any. */
export const getLiveLink = async (userId: string): Promise<BrokerLink | null> => {
    const { data, error } = await supabase.from("broker_links").select("*").eq("user_id", userId).eq("broker", BROKER).neq("status", "revoked").maybeSingle();
    if (error) throw error;
    return (data as BrokerLink | null) ?? null;
};

export const insertLink = (record: Record<string, unknown>) => supabase.from("broker_links").insert(record).select().single();

export const revokeLink = async (id: string) => {
    const { error } = await supabase.from("broker_links").update({ status: "revoked", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
};

export const getLinkById = async (id: string): Promise<BrokerLink | null> => {
    const { data, error } = await supabase.from("broker_links").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as BrokerLink | null) ?? null;
};

/** The customer's most recent link of any status, so a rejection can be shown to them. */
export const getLatestLink = async (userId: string): Promise<BrokerLink | null> => {
    const { data, error } = await supabase.from("broker_links").select("*").eq("user_id", userId).eq("broker", BROKER).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return (data as BrokerLink | null) ?? null;
};

/** Records that the customer confirmed the current consent wording (the earlier acceptance is replaced). */
export const updateLinkConsent = async (id: string, version: string): Promise<BrokerLink | null> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("broker_links").update({ consent_version: version, consent_at: now, updated_at: now }).eq("id", id).neq("status", "revoked").select().maybeSingle();
    if (error) throw error;
    return (data as BrokerLink | null) ?? null;
};

export type ReviewFilter = "pending" | "active" | "revoked" | "all";

/** Links for the admin page, newest first (at most 200). */
export async function listLinksForReview(filter: ReviewFilter): Promise<BrokerLink[]> {
    let query = supabase.from("broker_links").select("*").eq("broker", BROKER);
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return (data as BrokerLink[]) || [];
}

/**
 * Applies a review to a link, but only while it is in one of the `from` states, so two admins
 * (or a double click) can't both act on it. Returns the updated link, or null if it wasn't in one.
 */
export const reviewLink = async (id: string, from: BrokerLink["status"][], patch: Record<string, unknown>): Promise<BrokerLink | null> => {
    const { data, error } = await supabase.from("broker_links").update(patch).eq("id", id).in("status", from).select().maybeSingle();
    if (error) throw error;
    return (data as BrokerLink | null) ?? null;
};

/** Name and email for each account, from the profile table. */
export async function getUsersByAuthIds(ids: string[]): Promise<Map<string, { email: string | null; name: string | null }>> {
    const found = new Map<string, { email: string | null; name: string | null }>();
    for (const batch of chunks([...new Set(ids)], CHUNK)) {
        const { data, error } = await supabase.from("users").select("auth_id, email, first_name, last_name").in("auth_id", batch);
        if (error) throw error;
        for (const u of data || []) {
            const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
            found.set(u.auth_id as string, { email: (u.email as string) ?? null, name: name || null });
        }
    }
    return found;
}

export async function listActiveLinks(): Promise<BrokerLink[]> {
    const links: BrokerLink[] = [];
    for (let offset = 0; ; offset += PAGE) {
        const { data, error } = await supabase
            .from("broker_links")
            .select("*")
            .eq("broker", BROKER)
            .eq("status", "active")
            .order("id")
            .range(offset, offset + PAGE - 1);
        if (error) throw error;
        links.push(...((data as BrokerLink[]) || []));
        if (!data || data.length < PAGE) break;
    }
    return links;
}

// ── journal data ──────────────────────────────────────────────────────────

export async function countSyncedTrades(userId: string): Promise<number> {
    const { count, error } = await supabase.from("journal_trades").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("source", BROKER);
    if (error) throw error;
    return count ?? 0;
}

/** Removes everything synced for this customer: their synced trades and the stored fills. */
export async function deleteSyncedData(userId: string, clientCode: string): Promise<void> {
    const trades = await supabase.from("journal_trades").delete().eq("user_id", userId).eq("source", BROKER);
    if (trades.error) throw trades.error;
    const fills = await supabase.from("broker_fills").delete().eq("user_id", userId).eq("broker", BROKER).eq("client_code", clientCode);
    if (fills.error) throw fills.error;
}

// ── sync runs (the lock and audit trail) ──────────────────────────────────

/** Runs that say they are still going, earliest first (the earliest live one is the one allowed to continue). */
export const listRunningRuns = async () => {
    const { data, error } = await supabase.from("broker_sync_runs").select("id, started_at, result").eq("status", "running").order("started_at").order("id");
    if (error) throw error;
    return (data || []) as Array<{ id: string; started_at: string; result: { heartbeat?: string } | null }>;
};

/** Records how far a running sync has got. Does nothing once the run has finished, so a late write can't undo its result. */
export const updateRunProgress = (id: string, progress: Record<string, unknown>) =>
    supabase.from("broker_sync_runs").update({ result: progress }).eq("id", id).eq("status", "running");

/** The most recent sync runs, newest first, for the admin page. */
export const listRecentRuns = async (limit = 10) => {
    const { data, error } = await supabase.from("broker_sync_runs").select("id, source, status, result, started_at, completed_at").order("started_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
};

/** The tables and columns the sync needs that are missing or can't be read (empty when the database is ready). */
export async function probeSchema(): Promise<string[]> {
    const probes: Array<[string, () => PromiseLike<{ error: unknown }>]> = [
        ["broker_links (migration 0019)", () => supabase.from("broker_links").select("id").limit(1)],
        ["broker_fills (migration 0019)", () => supabase.from("broker_fills").select("id").limit(1)],
        ["broker_sync_runs (migration 0019)", () => supabase.from("broker_sync_runs").select("id").limit(1)],
        ["journal_trades source and external_id (migration 0019)", () => supabase.from("journal_trades").select("source, external_id").limit(1)],
        ["broker_links review columns (migration 0020)", () => supabase.from("broker_links").select("review_outcome, reviewed_by, reviewed_at, review_note").limit(1)],
    ];
    const missing: string[] = [];
    for (const [name, run] of probes) {
        const { error } = await run();
        if (error) missing.push(name);
    }
    return missing;
}

/** How many links are in each state, and how many active ones were agreed under older consent wording. */
export async function countLinks(currentConsentVersion: string) {
    const count = async (status: BrokerLink["status"], outdated = false) => {
        let query = supabase.from("broker_links").select("id", { count: "exact", head: true }).eq("broker", BROKER).eq("status", status);
        if (outdated) query = query.neq("consent_version", currentConsentVersion);
        const { count: n, error } = await query;
        if (error) throw error;
        return n ?? 0;
    };
    return { pending: await count("pending"), active: await count("active"), revoked: await count("revoked"), outdatedConsent: await count("active", true) };
}

export const startRun = (source: string) => supabase.from("broker_sync_runs").insert({ source, status: "running" }).select("id").single();

/** Records something that already happened (a backfill), without it ever counting as a running sync. */
export const insertFinishedRun = (source: string, result: unknown) =>
    supabase.from("broker_sync_runs").insert({ source, status: "success", result: result as object, completed_at: new Date().toISOString() });

export const completeRun = (id: string, status: "success" | "failed" | "skipped", result: unknown) =>
    supabase.from("broker_sync_runs").update({ status, result: result as object, completed_at: new Date().toISOString() }).eq("id", id);

// ── the store the sync service uses ───────────────────────────────────────

export type FillRow = {
    execution_id: string;
    client_code: string;
    trading_symbol: string;
    exchange_segment: string | null;
    exchange_instrument_id: number | null;
    product_type: string | null;
    side: "buy" | "sell";
    quantity: number;
    price: number;
    charges: number | null;
    traded_at: string;
};

export const FILL_COLUMNS = "execution_id, client_code, trading_symbol, exchange_segment, exchange_instrument_id, product_type, side, quantity, price, charges, traded_at";

/** A fill as the broker_fills row it is stored in. */
export const fillToRow = (link: Pick<BrokerLink, "user_id" | "broker" | "client_code">, f: BrokerFill) => ({
    user_id: link.user_id,
    broker: link.broker,
    client_code: link.client_code,
    execution_id: f.executionId,
    trading_symbol: f.symbol,
    exchange_segment: f.segment,
    exchange_instrument_id: f.instrumentId,
    product_type: f.product,
    side: f.side,
    quantity: f.quantity,
    price: f.price,
    charges: f.charges,
    traded_at: new Date(f.tradedAt).toISOString(),
    raw: f.raw ?? null,
});

/** A stored broker_fills row (the FILL_COLUMNS) back as a fill. Numbers may arrive as text. */
export const rowToFill = (r: FillRow): BrokerFill => ({
    executionId: r.execution_id,
    clientCode: r.client_code,
    symbol: r.trading_symbol,
    segment: r.exchange_segment,
    instrumentId: r.exchange_instrument_id === null ? null : Number(r.exchange_instrument_id),
    product: r.product_type,
    side: r.side,
    quantity: Number(r.quantity),
    price: Number(r.price),
    charges: r.charges === null ? null : Number(r.charges),
    tradedAt: r.traded_at,
});

export const supabaseStore: BrokerStore = {
    async saveFills(link, fills) {
        let added = 0;
        for (const batch of chunks(fills, 500)) {
            const rows = batch.map((f) => fillToRow(link, f));
            // Fills already held are skipped, so only new rows come back.
            const { data, error } = await supabase.from("broker_fills").upsert(rows, { onConflict: "broker,client_code,execution_id", ignoreDuplicates: true }).select("id");
            if (error) throw error;
            added += data?.length ?? 0;
        }
        return added;
    },

    async loadFills(link) {
        const fills: BrokerFill[] = [];
        for (let offset = 0; ; offset += PAGE) {
            const { data, error } = await supabase
                .from("broker_fills")
                .select(FILL_COLUMNS)
                .eq("user_id", link.user_id)
                .eq("broker", link.broker)
                .eq("client_code", link.client_code)
                .order("traded_at")
                .order("id")
                .range(offset, offset + PAGE - 1);
            if (error) throw error;
            for (const r of (data as FillRow[]) || []) fills.push(rowToFill(r));
            if (!data || data.length < PAGE) break;
        }
        return fills;
    },

    async existingExternalIds(userId, ids) {
        const have = new Set<string>();
        for (const batch of chunks(ids, CHUNK)) {
            const { data, error } = await supabase.from("journal_trades").select("external_id").eq("user_id", userId).in("external_id", batch);
            if (error) throw error;
            for (const row of data || []) have.add(row.external_id as string);
        }
        return have;
    },

    async insertTrades(rows) {
        for (const batch of chunks(rows, CHUNK)) {
            // A second sync racing this one can't double-insert: the unique index
            // on (user_id, external_id) makes the loser's rows a no-op.
            const { error } = await supabase.from("journal_trades").upsert(batch, { onConflict: "user_id,external_id", ignoreDuplicates: true });
            if (error) throw error;
        }
    },

    async listSyncedTrades(userId, clientCode) {
        const rows: Array<Record<string, any>> = [];
        for (let offset = 0; ; offset += PAGE) {
            const { data, error } = await supabase
                .from("journal_trades")
                .select("*")
                .eq("user_id", userId)
                .eq("source", BROKER)
                .order("id")
                .range(offset, offset + PAGE - 1);
            if (error) throw error;
            rows.push(...(data || []));
            if (!data || data.length < PAGE) break;
        }
        // Matched here rather than with LIKE, since "_" in a client code would act as a wildcard.
        return rows.filter((r) => String(r.external_id ?? "").startsWith(`${clientCode}:`));
    },

    async updateSyncedTrade(userId, externalId, patch) {
        const { error } = await supabase.from("journal_trades").update(patch).eq("user_id", userId).eq("source", BROKER).eq("external_id", externalId);
        if (error) throw error;
    },

    async deleteSyncedTrades(userId, externalIds) {
        for (const batch of chunks(externalIds, CHUNK)) {
            // The source filter is what keeps hand-entered trades out of reach.
            const { error } = await supabase.from("journal_trades").delete().eq("user_id", userId).eq("source", BROKER).in("external_id", batch);
            if (error) throw error;
        }
    },

    async recordSync(link, outcome: SyncOutcome) {
        const now = new Date().toISOString();
        const patch =
            "error" in outcome
                ? { last_sync_status: "failed", last_sync_error: outcome.error, updated_at: now }
                : { last_synced_at: now, last_sync_status: "success", last_sync_error: null, updated_at: now };
        const { error } = await supabase.from("broker_links").update(patch).eq("id", link.id);
        if (error) throw error;
    },
};
