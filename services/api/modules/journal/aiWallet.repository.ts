// Journal AI token wallet — internal gate/deduct mechanics only. Port of
// `features-incoming/journal/main.py`'s `get_ai_wallet` / `apply_free_ai_tokens`
// / `ensure_ai_tokens` / `deduct_ai_tokens` / `add_ai_tokens`, backed by the
// real `journal_ai_wallets` table (database/migrations/0005) instead of the
// Python source's dual in-memory-store + best-effort Supabase mirror
// (`AI_WALLET_STORE`) — this backend has one source of truth, so there's no
// separate cache to keep in sync.
//
// Scope note (Phase 9b-i): this file is ONLY the internal gating a Claude
// call needs (get-or-create wallet with a free grant, balance check,
// deduct real usage). The user-facing `GET /journal/ai/wallet` and the
// Razorpay purchase endpoints (`add_ai_tokens`'s caller in the source) are a
// separate, later sub-phase (9c) — `addAiTokens` is ported here already so
// that phase can import it directly rather than re-deriving the same update,
// but nothing in this phase calls it.
//
// Auth: callers pass `req.user.authId` (== `auth.users.id`), same id space
// as `journal_ai_wallets.user_id`.
import supabase from "../../supabase/index.js";

// Port of main.py's LOCAL_FREE_AI_TOKENS / PRODUCTION_FREE_AI_TOKENS.
const LOCAL_FREE_AI_TOKENS = 20_000;
// Lowered from 300,000 on 2026-10-06 to cut AI cost per free sign-up; wallets already
// granted the larger amount keep it.
const PRODUCTION_FREE_AI_TOKENS = 30_000;

/** Port of main.py's `is_local_runtime` (`PORT == 8001 and RENDER != "true"`),
 * adapted to this app's own local/prod convention — see e.g.
 * modules/billing/subscriptionPlan.controller.ts, which already gates on
 * `process.env.NODE_ENV === "production"`. */
function isLocalRuntime(): boolean {
    return process.env.NODE_ENV !== "production";
}

/** Port of main.py's `get_free_ai_token_grant`. */
function getFreeAiTokenGrant(): number {
    const override = process.env.FREE_AI_TOKENS?.trim();
    if (override) {
        const parsed = parseInt(override, 10);
        if (!Number.isNaN(parsed)) return Math.max(0, parsed);
    }
    return isLocalRuntime() ? LOCAL_FREE_AI_TOKENS : PRODUCTION_FREE_AI_TOKENS;
}

export interface JournalAiWallet {
    user_id: string;
    token_balance: number;
    tokens_purchased: number;
    tokens_used: number;
    free_tokens_granted: number;
    free_tokens_granted_at: string | null;
    last_recharge: Record<string, unknown> | null;
    updated_at: string;
}

/**
 * Get-or-create the user's AI wallet, granting the one-time free token
 * allotment on first use (or topping an existing-but-never-granted wallet
 * up once). Port of main.py's `get_ai_wallet` + `apply_free_ai_tokens`.
 */
export async function getOrCreateWallet(userId: string): Promise<JournalAiWallet> {
    const { data: row, error } = await supabase.from("journal_ai_wallets").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;

    if (!row) {
        const grant = getFreeAiTokenGrant();
        const wallet = {
            user_id: userId,
            token_balance: grant,
            tokens_purchased: 0,
            tokens_used: 0,
            free_tokens_granted: grant,
            free_tokens_granted_at: grant ? new Date().toISOString() : null,
            last_recharge: null,
            updated_at: new Date().toISOString(),
        };
        const { data: inserted, error: insertError } = await supabase.from("journal_ai_wallets").insert(wallet).select().single();
        if (insertError) throw insertError;
        return inserted as JournalAiWallet;
    }

    // Existing wallet that never received its free grant (e.g. a row created
    // before this gate existed) — top it up once, mirroring
    // `apply_free_ai_tokens`'s `wallet.get("free_tokens_granted")` check.
    if (!row.free_tokens_granted) {
        const grant = getFreeAiTokenGrant();
        if (grant > 0) {
            const { data: updated, error: updateError } = await supabase
                .from("journal_ai_wallets")
                .update({
                    token_balance: Number(row.token_balance || 0) + grant,
                    free_tokens_granted: grant,
                    free_tokens_granted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId)
                .select()
                .single();
            if (updateError) throw updateError;
            return updated as JournalAiWallet;
        }
    }

    return row as JournalAiWallet;
}

/** Thrown when the wallet balance is below the minimum required for a
 * Claude call. Port of main.py's `ensure_ai_tokens` 402 HTTPException —
 * controllers catch this and translate it to a 402 response. */
export class InsufficientAiTokensError extends Error {
    tokenBalance: number;
    constructor(tokenBalance: number) {
        super("AI token balance is low. Please recharge to continue.");
        this.name = "InsufficientAiTokensError";
        this.tokenBalance = tokenBalance;
    }
}

/** Port of main.py's `ensure_ai_tokens` (default minimum matches the
 * source's `minimum=800` used by every `call_claude` invocation). */
export async function ensureAiTokens(userId: string, minimum = 800): Promise<JournalAiWallet> {
    const wallet = await getOrCreateWallet(userId);
    if (wallet.token_balance < minimum) {
        throw new InsufficientAiTokensError(wallet.token_balance);
    }
    return wallet;
}

/** Port of main.py's `deduct_ai_tokens`. */
export async function deductAiTokens(userId: string, tokens: number): Promise<JournalAiWallet> {
    const wallet = await getOrCreateWallet(userId);
    const newBalance = Math.max(0, wallet.token_balance - tokens);
    const { data, error } = await supabase
        .from("journal_ai_wallets")
        .update({
            token_balance: newBalance,
            tokens_used: wallet.tokens_used + tokens,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();
    if (error) throw error;
    return data as JournalAiWallet;
}

/**
 * Credit purchased/bonus tokens to the wallet. Port of main.py's
 * `add_ai_tokens` — NOT wired to any route in this phase (9b-i); the
 * source's replay-safety for this (its `credited_payments` list, keyed by
 * `payment_id`) belongs with the purchase flow itself, which the later 9c
 * sub-phase will build against `journal_ai_wallet_purchases` (which has its
 * own `payment_id` column for exactly that idempotency check) rather than
 * duplicating it here.
 */
export async function addAiTokens(
    userId: string,
    tokens: number,
    source: string,
    amountInr = 0,
    paymentId?: string | null
): Promise<JournalAiWallet> {
    const wallet = await getOrCreateWallet(userId);
    const { data, error } = await supabase
        .from("journal_ai_wallets")
        .update({
            token_balance: wallet.token_balance + tokens,
            tokens_purchased: wallet.tokens_purchased + tokens,
            last_recharge: {
                source,
                amount_inr: amountInr,
                tokens,
                payment_id: paymentId ?? null,
                at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();
    if (error) throw error;
    return data as JournalAiWallet;
}
