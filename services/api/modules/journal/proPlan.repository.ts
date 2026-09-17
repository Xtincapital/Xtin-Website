// Thin Supabase-query wrappers for Journal's Pro-plan purchase flow —
// Node/TS port of `features-incoming/journal/main.py`'s `persist_pro_plan` /
// `get_pro_plan` table access against `journal_pro_plans` (live since
// migration 0001 — see database/migrations/0001_gini_journal_fundakamental.sql).
//
// `journal_pro_plans.user_id` is the table's primary key (one row per user),
// so a repeat purchase is an upsert, not an insert — matches the Python
// source's own `prefer: resolution=merge-duplicates` header on its raw
// Supabase REST write.
import supabase from "../../supabase/index.js";

export const getProPlanByUser = (userId: string) =>
    supabase.from("journal_pro_plans").select("*").eq("user_id", userId).maybeSingle();

export const upsertProPlan = (record: Record<string, unknown>) =>
    supabase.from("journal_pro_plans").upsert(record, { onConflict: "user_id" });
