// Thin Supabase-query wrappers for `gini_liabilities`. Style mirrors
// journal/goals.repository.ts — one small function per query, controllers
// own all the branching/error handling.
//
// `owner` is a nullable FK to `gini_family_members.id` that doesn't scope by
// user_id on its own — `getFamilyMemberOwnership` (mirrors
// elderCare.repository.ts's helper of the same name) lets the controller
// confirm a supplied owner actually belongs to the authenticated user.
import supabase from "../../supabase/index.js";

const getFamilyMemberOwnership = (memberId: string, userId: string) =>
    supabase.from("gini_family_members").select("id").eq("id", memberId).eq("user_id", userId);

const insertLiability = (record: Record<string, unknown>) => supabase.from("gini_liabilities").insert(record).select();

const getLiabilitiesByUser = (userId: string) =>
    supabase.from("gini_liabilities").select("*").eq("user_id", userId).order("created_at", { ascending: true });

const getLiabilityById = (liabilityId: string, userId: string) =>
    supabase.from("gini_liabilities").select("*").eq("id", liabilityId).eq("user_id", userId);

const updateLiability = (liabilityId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("gini_liabilities").update(updateData).eq("id", liabilityId).eq("user_id", userId).select();

const deleteLiability = (liabilityId: string, userId: string) =>
    supabase.from("gini_liabilities").delete().eq("id", liabilityId).eq("user_id", userId).select();

export { getFamilyMemberOwnership, insertLiability, getLiabilitiesByUser, getLiabilityById, updateLiability, deleteLiability };
