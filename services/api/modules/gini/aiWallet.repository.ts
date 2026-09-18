// Gini AI token wallet — internal gate/deduct mechanics only, backed by the
// real `gini_ai_wallets` table (database/migrations/0006_gini_normalized_schema.sql).
// Direct structural port of journal/aiWallet.repository.ts's
// `getOrCreateWallet`/`ensureAiTokens`/`deductAiTokens`/`addAiTokens`
// against `gini_ai_wallets` instead of `journal_ai_wallets`.
//
// Free-token grant sizing: the ORIGINAL Gini app (unlike Journal, which had
// separate LOCAL_FREE_AI_TOKENS=20,000 / PRODUCTION_FREE_AI_TOKENS=300,000
// constants) used a single flat constant regardless of environment — see
// features-incoming/gini/app.js's `CHAT_LIMITS.trialTokens = 5000` (~line 8),
// the trial balance new wallets are seeded with client-side
// (`getOrCreateAiWallet`, app.js ~89-123: `tokenBalance: CHAT_LIMITS.trialTokens`
// for a brand-new local wallet). Ported as `GINI_FREE_AI_TOKENS = 5000` here,
// with the same `FREE_AI_TOKENS`-style env override journal supports, for
// ops parity — Gini's original had no such override, but nothing prevents
// adding one, and it costs nothing to support.
//
// Scope note (Phase 10b): this file is ONLY the internal gating a Claude
// call needs (get-or-create wallet with a free grant, balance check, deduct
// real usage). The user-facing `GET /gini/ai/wallet` and Razorpay purchase
// endpoints are explicitly out of scope here (a later sub-phase, 10c) —
// `addAiTokens` is ported already so that phase can import it directly,
// exactly like journal/aiWallet.repository.ts's own `addAiTokens`.
//
// Auth: callers pass `req.user.authId` (== `auth.users.id`), same id space
// as `gini_ai_wallets.user_id`.
import supabase from "../../supabase/index.js";

const GINI_FREE_AI_TOKENS = 5_000;

function getFreeAiTokenGrant(): number {
    const override = process.env.GINI_FREE_AI_TOKENS?.trim();
    if (override) {
        const parsed = parseInt(override, 10);
        if (!Number.isNaN(parsed)) return Math.max(0, parsed);
    }
    return GINI_FREE_AI_TOKENS;
}

export interface GiniAiWallet {
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
 * allotment on first use (or topping an existing-but-never-granted wallet up
 * once). Port of journal/aiWallet.repository.ts's `getOrCreateWallet`.
 */
export async function getOrCreateWallet(userId: string): Promise<GiniAiWallet> {
    const { data: row, error } = await supabase.from("gini_ai_wallets").select("*").eq("user_id", userId).maybeSingle();
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
        const { data: inserted, error: insertError } = await supabase.from("gini_ai_wallets").insert(wallet).select().single();
        if (insertError) throw insertError;
        return inserted as GiniAiWallet;
    }

    if (!row.free_tokens_granted) {
        const grant = getFreeAiTokenGrant();
        if (grant > 0) {
            const { data: updated, error: updateError } = await supabase
                .from("gini_ai_wallets")
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
            return updated as GiniAiWallet;
        }
    }

    return row as GiniAiWallet;
}

/** Thrown when the wallet balance is below the minimum required for a
 * Claude call — controllers catch this and translate it to a 402 response
 * (matching Journal's established `InsufficientAiTokensError` convention). */
export class InsufficientAiTokensError extends Error {
    tokenBalance: number;
    constructor(tokenBalance: number) {
        super("AI token balance is low. Please recharge to continue.");
        this.name = "InsufficientAiTokensError";
        this.tokenBalance = tokenBalance;
    }
}

/** Ensures `userId`'s wallet balance is at least `minimum` before a Claude
 * call is made, creating/free-granting the wallet if needed. Port of
 * journal/aiWallet.repository.ts's `ensureAiTokens`. */
export async function ensureTokens(userId: string, minimum: number): Promise<GiniAiWallet> {
    const wallet = await getOrCreateWallet(userId);
    if (wallet.token_balance < minimum) {
        throw new InsufficientAiTokensError(wallet.token_balance);
    }
    return wallet;
}

/** Deducts real (Anthropic-reported) token usage from the wallet after a
 * Claude call completes. Port of journal/aiWallet.repository.ts's
 * `deductAiTokens`. */
export async function deductTokens(userId: string, tokens: number): Promise<GiniAiWallet> {
    const wallet = await getOrCreateWallet(userId);
    const newBalance = Math.max(0, wallet.token_balance - tokens);
    const { data, error } = await supabase
        .from("gini_ai_wallets")
        .update({
            token_balance: newBalance,
            tokens_used: wallet.tokens_used + tokens,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();
    if (error) throw error;
    return data as GiniAiWallet;
}

/**
 * Credit purchased/bonus tokens to the wallet. NOT wired to any route in
 * this phase (10b) — exported so the later wallet-purchase sub-phase (10c,
 * see gini_ai_wallet_purchases's own idempotency columns) can import it
 * directly, mirroring journal/aiWallet.repository.ts's `addAiTokens`.
 */
export async function addTokens(userId: string, tokens: number, source: string, amountInr = 0, paymentId?: string | null): Promise<GiniAiWallet> {
    const wallet = await getOrCreateWallet(userId);
    const { data, error } = await supabase
        .from("gini_ai_wallets")
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
    return data as GiniAiWallet;
}
