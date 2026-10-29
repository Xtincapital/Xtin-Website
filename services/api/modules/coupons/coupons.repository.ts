// Data access for coupons and coupon_redemptions
// (database/migrations/0016_coupons.sql). Backend-only tables.
import supabase from "../../supabase/index.js";

export type CouponRow = {
    id: string;
    code: string;
    description: string | null;
    kind: "discount" | "free_access";
    percent_off: number | null;
    amount_off_paise: number | null;
    free_product: string | null;
    free_plan: string | null;
    products: string[];
    audience: "everyone" | "new_customers" | "members";
    max_redemptions: number | null;
    per_user_limit: number;
    starts_at: string | null;
    expires_at: string | null;
    active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
};

export type RedemptionRow = {
    coupon_id: string;
    code: string;
    order_id: string;
    user_id: string | null;
    auth_id: string | null;
    buyer_email: string | null;
    product: string;
    list_amount: number | null;
    paid_amount: number | null;
    currency: string | null;
};

const MISSING_TABLE = /does not exist|Could not find the table|schema cache/i;

export const findCouponByCode = async (code: string): Promise<CouponRow | null> => {
    const { data, error } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
    if (error) {
        if (MISSING_TABLE.test(error.message)) return null;
        throw error;
    }
    return (data as CouponRow) || null;
};

export const findCouponById = async (id: string): Promise<CouponRow | null> => {
    const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as CouponRow) || null;
};

export const countRedemptions = async (couponId: string): Promise<number> => {
    const { count, error } = await supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", couponId);
    if (error) throw error;
    return count || 0;
};

// Ids come from the verified session or the users table, but they are
// interpolated into a PostgREST `or` filter, so allow only id characters.
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const idFilter = (column: string, ids: Array<string | null | undefined>) =>
    Array.from(new Set(ids.filter((id): id is string => !!id && SAFE_ID.test(id))))
        .map((id) => `${column}.eq.${id}`)
        .join(",");

export const countUserRedemptions = async (couponId: string, user: { userId?: string | null; authId?: string | null }): Promise<number> => {
    const filter = [idFilter("user_id", [user.userId, user.authId]), idFilter("auth_id", [user.authId])].filter(Boolean).join(",");
    if (!filter) return 0;
    const { count, error } = await supabase
        .from("coupon_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", couponId)
        .or(filter);
    if (error) throw error;
    return count || 0;
};

/** Whether this user has ever completed a paid purchase (free coupon grants don't count). */
export const hasPaidPurchase = async (user: { userId?: string | null; authId?: string | null }): Promise<boolean> => {
    const filter = idFilter("user_id", [user.userId, user.authId]);
    if (!filter) return false;
    const { count, error } = await supabase
        .from("payment_fulfillments")
        .select("order_id", { count: "exact", head: true })
        .eq("status", "fulfilled")
        .neq("source", "coupon")
        .or(filter);
    if (error) throw error;
    return (count || 0) > 0;
};

/** Idempotent per order. Never throws: a paid order must not fail over bookkeeping. */
export const recordRedemption = async (row: RedemptionRow) => {
    try {
        const { error } = await supabase.from("coupon_redemptions").insert(row);
        if (error && error.code !== "23505") throw error;
    } catch (err) {
        console.error(`[Coupons] recording redemption of ${row.code} for order ${row.order_id} failed:`, (err as Error)?.message || err);
    }
};

/** Account deletion: keep the usage count, drop who it was. */
export async function unlinkCouponRedemptions(authId: string, userIds: string[]): Promise<string | null> {
    const ids = Array.from(new Set([authId, ...userIds].filter(Boolean)));
    const cleared = { user_id: null, auth_id: null, buyer_email: null };
    const byUser = await supabase.from("coupon_redemptions").update(cleared).in("user_id", ids);
    if (byUser.error && !MISSING_TABLE.test(byUser.error.message)) return byUser.error.message;
    const byAuth = await supabase.from("coupon_redemptions").update(cleared).eq("auth_id", authId);
    if (byAuth.error && !MISSING_TABLE.test(byAuth.error.message)) return byAuth.error.message;
    return null;
}

// ── Admin ────────────────────────────────────────────────────────────────

export const listCoupons = async (): Promise<Array<CouponRow & { redemptions: number }>> => {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    const { data: used, error: usedError } = await supabase.from("coupon_redemptions").select("coupon_id").limit(100000);
    if (usedError) throw usedError;
    const counts = new Map<string, number>();
    for (const r of used || []) counts.set(r.coupon_id, (counts.get(r.coupon_id) || 0) + 1);
    return ((data as CouponRow[]) || []).map((c) => ({ ...c, redemptions: counts.get(c.id) || 0 }));
};

export const insertCoupon = async (row: Partial<CouponRow>) => {
    const { data, error } = await supabase.from("coupons").insert(row).select("*").single();
    if (error) throw error;
    return data as CouponRow;
};

export const updateCoupon = async (id: string, patch: Partial<CouponRow>) => {
    const { data, error } = await supabase
        .from("coupons")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) throw error;
    return (data as CouponRow) || null;
};

export const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;
};

export const listRedemptions = async (couponId: string) => {
    const { data, error } = await supabase
        .from("coupon_redemptions")
        .select("order_id, buyer_email, product, list_amount, paid_amount, currency, created_at")
        .eq("coupon_id", couponId)
        .order("created_at", { ascending: false })
        .limit(500);
    if (error) throw error;
    return data || [];
};
