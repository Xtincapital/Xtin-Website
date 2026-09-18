// Thin Supabase-query wrappers for Gini's Pro-plan purchase flow — Node/TS
// port of `features-incoming/gini/api/razorpay-plan-verify.js`'s
// `persistProPlan` table access against `gini_pro_plans` (live since
// migration 0001 — see database/migrations/0001_gini_journal_fundakamental.sql).
//
// `gini_pro_plans.user_id` is the table's primary key (one row per user), so
// a repeat purchase is an upsert, not an insert — matches the original's own
// `Prefer: resolution=merge-duplicates` header on its raw Supabase REST
// write.
import supabase from "../../supabase/index.js";

export const getProPlanByUser = (userId: string) =>
    supabase.from("gini_pro_plans").select("*").eq("user_id", userId).maybeSingle();

export const upsertProPlan = (record: Record<string, unknown>) =>
    supabase.from("gini_pro_plans").upsert(record, { onConflict: "user_id" });
