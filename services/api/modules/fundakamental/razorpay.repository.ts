// Thin Supabase-query wrappers for FundaKaMental's Razorpay Pro-subscription
// flow — Node/TS port of `api/endpoints/razorpay_payments.py`'s table access.
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql):
// profiles -> funda_users, pro_payments -> funda_pro_payments.
import supabase from "../../supabase/index.js";

/* funda_users ---------------------------------------------------------------- */

const getUserPlan = (userId: string) =>
    supabase.from("funda_users").select("plan, plan_valid_until").eq("id", userId).maybeSingle();

const grantPro = (userId: string, planValidUntil: string) =>
    supabase
        .from("funda_users")
        .update({ plan: "premium", reports_limit: 999999, plan_valid_until: planValidUntil })
        .eq("id", userId);

const downgradeToFree = (userId: string) =>
    supabase.from("funda_users").update({ plan: "free", reports_limit: 5 }).eq("id", userId);

/* funda_pro_payments ---------------------------------------------------------- */

const insertProPayment = (record: Record<string, unknown>) => supabase.from("funda_pro_payments").insert(record);

export { getUserPlan, grantPro, downgradeToFree, insertProPayment };
