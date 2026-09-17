// Audit trail + real idempotency guard for Journal AI token-pack purchases
// and the Pro-plan-included AI bonus grant — backed by
// `journal_ai_wallet_purchases` (database/migrations/0005), reserved for
// this Phase 9c sub-phase per aiWallet.repository.ts's own header comment
// ("the later 9c sub-phase will build against journal_ai_wallet_purchases").
//
// Replaces the Python source's in-memory `AI_ORDER_STORE` (main.py) with a
// persistent, restart-safe record of every credited payment.
//
// It also does real double-duty as the replay guard for `addAiTokens`
// (aiWallet.repository.ts, Phase 9b): that function does NOT itself dedupe
// on `payment_id` the way the Python source's `credited_payments` list
// did — it always adds `tokens` on every call, unconditionally. So callers
// (aiWallet.controller.ts, proPlan.controller.ts) MUST check
// `findPurchaseByPaymentId` before calling `addAiTokens` and skip the
// credit when a row already exists for that payment id, or a Razorpay
// webhook retry / duplicate verify call would double-credit the wallet.
import supabase from "../../supabase/index.js";

export interface JournalAiWalletPurchase {
    id: string;
    user_id: string;
    package_id: string;
    tokens: number;
    amount_inr: number;
    payment_id: string | null;
    order_id: string | null;
    created_at: string;
}

/** Look up a previously-recorded purchase by Razorpay payment id (globally
 * unique per transaction). Used as the idempotency guard before crediting
 * tokens — a hit here means this exact payment was already credited. */
export const findPurchaseByPaymentId = (paymentId: string) =>
    supabase
        .from("journal_ai_wallet_purchases")
        .select("id, user_id, package_id, tokens")
        .eq("payment_id", paymentId)
        .maybeSingle();

export const insertAiWalletPurchase = (record: {
    user_id: string;
    package_id: string;
    tokens: number;
    amount_inr: number;
    payment_id: string | null;
    order_id: string | null;
}) => supabase.from("journal_ai_wallet_purchases").insert(record);
