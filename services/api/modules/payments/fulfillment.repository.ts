import supabase from "../../supabase/index.js";

// payment_fulfillments (database/migrations/0011_payment_fulfillments.sql) —
// one row per Razorpay order, claimed before any product is granted. It is
// what makes the verify endpoint and the webhook safe to race each other or
// be replayed: whoever inserts the row first does the grant, everyone else
// reads the stored result.

export type FulfillmentRow = {
    order_id: string;
    payment_id: string;
    product: string;
    user_id: string | null;
    amount: number | null;
    currency: string | null;
    status: "processing" | "fulfilled";
    source: string;
    result: Record<string, unknown> | null;
    claimed_at: string;
    fulfilled_at: string | null;
};

// A claim left in "processing" this long means the process died mid-grant;
// it may be taken over.
const STALE_CLAIM_MS = 2 * 60 * 1000;

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

export class FulfillmentTableMissingError extends Error {
    constructor() {
        super("payment_fulfillments table is missing — run database/migrations/0011_payment_fulfillments.sql");
        this.name = "FulfillmentTableMissingError";
    }
}

export const getFulfillment = async (orderId: string): Promise<FulfillmentRow | null> => {
    const { data, error } = await supabase.from("payment_fulfillments").select("*").eq("order_id", orderId).maybeSingle();
    if (error) {
        if (MISSING_TABLE_CODES.has(error.code)) throw new FulfillmentTableMissingError();
        throw error;
    }
    return (data as FulfillmentRow) || null;
};

/**
 * Tries to take ownership of an order's fulfilment. Returns `{ claimed: true }`
 * when the caller must now grant the product, or `{ claimed: false, existing }`
 * when someone else already did (or is doing) it.
 */
export const claimFulfillment = async (
    row: Pick<FulfillmentRow, "order_id" | "payment_id" | "product" | "user_id" | "amount" | "currency" | "source">
): Promise<{ claimed: true } | { claimed: false; existing: FulfillmentRow }> => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("payment_fulfillments").insert({ ...row, status: "processing", claimed_at: now });
    if (!error) return { claimed: true };
    if (MISSING_TABLE_CODES.has(error.code)) throw new FulfillmentTableMissingError();
    if (error.code !== "23505") throw error;

    const existing = await getFulfillment(row.order_id);
    if (!existing) return claimFulfillment(row); // released between our insert and read

    const stale = existing.status === "processing" && Date.now() - new Date(existing.claimed_at).getTime() > STALE_CLAIM_MS;
    if (stale) {
        // Optimistic takeover: only succeeds if nobody else refreshed the claim first.
        const { data, error: takeoverError } = await supabase
            .from("payment_fulfillments")
            .update({ source: row.source, claimed_at: now })
            .eq("order_id", row.order_id)
            .eq("status", "processing")
            .eq("claimed_at", existing.claimed_at)
            .select("order_id");
        if (takeoverError) throw takeoverError;
        if (data && data.length) return { claimed: true };
    }
    return { claimed: false, existing };
};

export const completeFulfillment = async (orderId: string, result: Record<string, unknown>) => {
    const { error } = await supabase
        .from("payment_fulfillments")
        .update({ status: "fulfilled", result, fulfilled_at: new Date().toISOString() })
        .eq("order_id", orderId);
    if (error) throw error;
};

/** Gives the claim back after a failed grant so a retry (webhook redelivery) can try again. */
export const releaseFulfillment = async (orderId: string) => {
    const { error } = await supabase.from("payment_fulfillments").delete().eq("order_id", orderId).eq("status", "processing");
    if (error) console.error("[Payments] releasing fulfilment claim failed:", error.message);
};

/** Maps a Razorpay order's user to both ids this codebase uses (users.id and auth.users.id). */
export const findUserByAuthId = async (authId: string) => {
    const { data } = await supabase.from("users").select("id, auth_id, email").eq("auth_id", authId).maybeSingle();
    return data as { id: string; auth_id: string; email: string | null } | null;
};

export const findUserById = async (userId: string) => {
    const { data } = await supabase.from("users").select("id, auth_id, email").eq("id", userId).maybeSingle();
    return data as { id: string; auth_id: string; email: string | null } | null;
};
