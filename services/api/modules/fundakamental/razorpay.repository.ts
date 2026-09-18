// Thin Supabase-query wrappers for FundaKaMental's Razorpay Pro-subscription
// flow — Node/TS port of `api/endpoints/razorpay_payments.py`'s table access.
//
// Table mapping (see database/migrations/0001_gini_journal_fundakamental.sql,
// renamed funda_pro_payments -> funda_pro_plans in 0009_schema_cleanup.sql
// for naming consistency with gini_pro_plans/journal_pro_plans):
// profiles -> funda_users, pro_payments -> funda_pro_plans.
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

/* funda_pro_plans ---------------------------------------------------------- */

const insertProPayment = (record: Record<string, unknown>) => supabase.from("funda_pro_plans").insert(record);

export { getUserPlan, grantPro, downgradeToFree, insertProPayment };
