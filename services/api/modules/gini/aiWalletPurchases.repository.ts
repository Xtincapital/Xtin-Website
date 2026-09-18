// Audit trail + real idempotency guard for Gini AI token-pack purchases
// and the Pro-plan-included AI bonus grant — backed by
// `gini_ai_wallet_purchases` (database/migrations/0006), reserved for this
// Phase 10c sub-phase per aiWallet.repository.ts's own header comment ("the
// user-facing ... Razorpay purchase endpoints are explicitly out of scope
// here (a later sub-phase, 10c)").
//
// Direct structural port of journal/aiWalletPurchases.repository.ts — see
// that file's header for the full rationale. In short: `addTokens`
// (aiWallet.repository.ts, Phase 10b) does not itself dedupe on
// `payment_id` — it always adds `tokens` on every call. Callers here check
// `findPurchaseByPaymentId` before crediting, so a duplicate verify call
// (retry, webhook replay) is a no-op instead of a double-credit.
import supabase from "../../supabase/index.js";

export interface GiniAiWalletPurchase {
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
        .from("gini_ai_wallet_purchases")
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
}) => supabase.from("gini_ai_wallet_purchases").insert(record);
