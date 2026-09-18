// Thin Supabase-query wrappers for `gini_education_plans`. Style mirrors
// gini/elderCare.repository.ts — one small function per query, controllers
// own all the branching/error handling.
//
// `child_id` is a required FK to `gini_family_members.id`, but that FK
// alone doesn't scope by `user_id` — anyone could reference any family
// member row in the table. `getFamilyMemberOwnership` lets the controller
// confirm the referenced child actually belongs to the authenticated user
// before an insert/update is attempted.
import supabase from "../../supabase/index.js";

const getFamilyMemberOwnership = (childId: string, userId: string) =>
    supabase.from("gini_family_members").select("id").eq("id", childId).eq("user_id", userId);

const insertEducationPlan = (record: Record<string, unknown>) => supabase.from("gini_education_plans").insert(record).select();

const getEducationPlansByUser = (userId: string) =>
    supabase.from("gini_education_plans").select("*").eq("user_id", userId).order("created_at", { ascending: true });

const getEducationPlanById = (planId: string, userId: string) =>
    supabase.from("gini_education_plans").select("*").eq("id", planId).eq("user_id", userId);

const updateEducationPlan = (planId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("gini_education_plans").update(updateData).eq("id", planId).eq("user_id", userId).select();

const deleteEducationPlan = (planId: string, userId: string) =>
    supabase.from("gini_education_plans").delete().eq("id", planId).eq("user_id", userId).select();

export { getFamilyMemberOwnership, insertEducationPlan, getEducationPlansByUser, getEducationPlanById, updateEducationPlan, deleteEducationPlan };
