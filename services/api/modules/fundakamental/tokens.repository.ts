// Thin Supabase-query wrapper for FundaKaMental's token top-up purchase
// audit — Node/TS port of `api/endpoints/tokens.py`'s table access.
// Wallet reads/writes themselves live in tokenWallet.ts (getWallet/addTopup),
// mirroring how the Python source splits `utils/token_wallet.py` (wallet
// logic) from `api/endpoints/tokens.py` (the API + purchase audit row).
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql):
// token_pack_purchases -> funda_token_pack_purchases, profiles -> funda_users.
import supabase from "../../supabase/index.js";

const insertTokenPackPurchase = (record: Record<string, unknown>) =>
    supabase.from("funda_token_pack_purchases").insert(record);

/** `req.user` (populated by `authenticate`) doesn't carry the plan tier —
 * unlike the Python source's `current_user.get("plan", "free")`, which reads
 * it off an already-fetched profile dict — so wallet/pack endpoints look it
 * up here, the same funda_users.plan column analysis.repository.ts's
 * `getUserProfile` and razorpay.repository.ts's `getUserPlan` read. */
const getUserTier = (userId: string) => supabase.from("funda_users").select("plan").eq("id", userId).maybeSingle();

export { insertTokenPackPurchase, getUserTier };
