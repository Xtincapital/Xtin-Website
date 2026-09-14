// AI token wallet — Node/TS port of `utils/token_wallet.py`.
//
// Usage metering that keeps the product profitable. Every AI generation (a
// report analysis, a Q&A message) costs real model tokens. Each user has a
// wallet with:
//   - a monthly allowance that resets each calendar month (by plan tier), and
//   - a top-up balance from purchased packs that never expires.
//
// Deductions come off the monthly allowance first, then top-ups. When both
// are empty the caller blocks the action and prompts to upgrade (free) or
// buy a pack (pro). All state lives in `funda_ai_wallets`, written with the
// service-role Supabase client (see
// database/migrations/0001_gini_journal_fundakamental.sql for the table's
// `ai_wallets` -> `funda_ai_wallets` rename).
//
// Ported faithfully, including the Python source's file structure: like
// `utils/token_wallet.py`, this module hits Supabase directly (no separate
// repository layer) rather than following this codebase's usual
// controller/repository split — it's a shared service used by multiple
// controllers (razorpay/tokens/analysis/chat), same role as aiAnalyzer.ts.
//
// Fail-open: if Supabase is unreachable we don't hard-block the user, we
// just can't meter — pretend a full monthly allowance rather than wrongly
// blocking. Production keeps Supabase up so metering is enforced there.
import supabase from "../../supabase/index.js";

/** Monthly allowance by plan tier (in model tokens). Mirrors
 * `token_wallet.py`'s MONTHLY_GRANT unit-economics comment: the wallet is a
 * hard cap, so as long as grant cost stays below subscription revenue every
 * subscriber stays profitable even at 100% utilisation. */
export const MONTHLY_GRANT: Record<string, number> = {
    free: 60_000,
    premium: 500_000,
    enterprise: 2_500_000,
};

export interface TokenPack {
    tokens: number;
    amounts: Record<string, number>;
    label: string;
}

/** One-off top-up packs (Pro users who run out). Amounts in smallest currency unit. */
export const TOKEN_PACKS: Record<string, TokenPack> = {
    pack_small: { tokens: 200_000, amounts: { INR: 19900, USD: 300, GBP: 200, EUR: 300 }, label: "200K tokens" },
    pack_medium: { tokens: 500_000, amounts: { INR: 49900, USD: 700, GBP: 500, EUR: 600 }, label: "500K tokens" },
    pack_large: { tokens: 1_200_000, amounts: { INR: 99900, USD: 1500, GBP: 1100, EUR: 1300 }, label: "1.2M tokens" },
};

export interface Wallet {
    monthly_balance: number;
    topup_balance: number;
    balance: number;
    monthly_grant: number;
    period: string;
    tier: string;
    tokens_used_total: number;
    /** Whether this reflects a real DB row (false only on a fail-open read). */
    persisted: boolean;
}

function currentPeriod(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function grantFor(tier: string): number {
    return MONTHLY_GRANT[tier] ?? MONTHLY_GRANT.free;
}

/**
 * Return the user's wallet, applying a monthly reset if the calendar month
 * changed or the plan tier changed. Port of `get_wallet`.
 */
export async function getWallet(userId: string, tier: string = "free"): Promise<Wallet> {
    const period = currentPeriod();
    const grant = grantFor(tier);

    let row: Record<string, any> | null;
    try {
        const { data, error } = await supabase.from("funda_ai_wallets").select("*").eq("user_id", userId).maybeSingle();
        if (error) throw error;
        row = data;
    } catch (err) {
        console.error("[wallet] read failed:", (err as Error)?.message || err);
        // Fail-open: pretend a full monthly allowance so we never wrongly block.
        return {
            monthly_balance: grant,
            topup_balance: 0,
            balance: grant,
            monthly_grant: grant,
            period,
            tier,
            tokens_used_total: 0,
            persisted: false,
        };
    }

    let wallet: Record<string, any>;
    if (!row) {
        wallet = {
            user_id: userId,
            tier,
            period,
            monthly_balance: grant,
            topup_balance: 0,
            monthly_grant: grant,
            tokens_used_total: 0,
            updated_at: new Date().toISOString(),
        };
        const { error: insertError } = await supabase.from("funda_ai_wallets").insert(wallet);
        if (insertError) console.error("[wallet] insert failed:", insertError.message);
    } else {
        wallet = row;
        // Monthly reset (or tier change) tops the monthly allowance back up.
        if (wallet.period !== period || wallet.tier !== tier) {
            wallet.period = period;
            wallet.tier = tier;
            wallet.monthly_balance = grant;
            wallet.monthly_grant = grant;
            const { error: resetError } = await supabase
                .from("funda_ai_wallets")
                .update({
                    period,
                    tier,
                    monthly_balance: grant,
                    monthly_grant: grant,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);
            if (resetError) console.error("[wallet] reset failed:", resetError.message);
        }
    }

    const monthly = Number(wallet.monthly_balance ?? 0) || 0;
    const topup = Number(wallet.topup_balance ?? 0) || 0;
    return {
        monthly_balance: monthly,
        topup_balance: topup,
        balance: monthly + topup,
        monthly_grant: Number(wallet.monthly_grant ?? grant) || grant,
        period: wallet.period ?? period,
        tier: wallet.tier ?? tier,
        tokens_used_total: Number(wallet.tokens_used_total ?? 0) || 0,
        persisted: true,
    };
}

/** Port of `has_tokens`. */
export async function hasTokens(userId: string, tier: string, needed: number = 1): Promise<boolean> {
    const wallet = await getWallet(userId, tier);
    return wallet.balance >= needed;
}

/** Deduct from monthly allowance first, then top-ups. Returns the updated wallet.
 * Port of `deduct`. */
export async function deduct(userId: string, tokens: number, tier: string = "free"): Promise<Wallet> {
    if (tokens <= 0) return getWallet(userId, tier);
    const w = await getWallet(userId, tier);
    const monthly = w.monthly_balance;
    const topup = w.topup_balance;

    const fromMonthly = Math.min(monthly, tokens);
    const remaining = tokens - fromMonthly;
    const fromTopup = Math.min(topup, remaining);
    const newMonthly = monthly - fromMonthly;
    const newTopup = topup - fromTopup;

    try {
        const { error } = await supabase
            .from("funda_ai_wallets")
            .update({
                monthly_balance: newMonthly,
                topup_balance: newTopup,
                tokens_used_total: w.tokens_used_total + tokens,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        if (error) throw error;
    } catch (err) {
        console.error("[wallet] deduct failed:", (err as Error)?.message || err);
    }

    return { ...w, monthly_balance: newMonthly, topup_balance: newTopup, balance: newMonthly + newTopup };
}

/** Credit purchased tokens to the persistent top-up balance. Port of `add_topup`. */
export async function addTopup(userId: string, tokens: number, tier: string = "free"): Promise<Wallet> {
    const w = await getWallet(userId, tier);
    const newTopup = w.topup_balance + Number(tokens);

    try {
        const { error } = await supabase
            .from("funda_ai_wallets")
            .update({ topup_balance: newTopup, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        if (error) throw error;
    } catch (err) {
        console.error("[wallet] topup failed:", (err as Error)?.message || err);
    }

    return { ...w, topup_balance: newTopup, balance: w.monthly_balance + newTopup };
}
