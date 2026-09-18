// Thin Supabase-query wrappers for `gini_goals`. Style mirrors
// journal/goals.repository.ts and gini/familyMembers.repository.ts — one
// small function per query, controllers own all the branching/error
// handling.
//
// `assigned_to` is a nullable FK to `gini_family_members.id`, same
// cross-user reference gap as gini_elder_care.member_id /
// gini_education_plans.child_id (the FK alone doesn't scope by user_id).
// `getFamilyMemberOwnership` mirrors elderCare.repository.ts's helper of
// the same name so the controller can confirm a supplied assigned_to
// actually belongs to the authenticated user before insert/update.
import supabase from "../../supabase/index.js";

const getFamilyMemberOwnership = (memberId: string, userId: string) =>
    supabase.from("gini_family_members").select("id").eq("id", memberId).eq("user_id", userId);

const insertGoal = (record: Record<string, unknown>) => supabase.from("gini_goals").insert(record).select();

const getGoalsByUser = (userId: string) => supabase.from("gini_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true });

const getGoalById = (goalId: string, userId: string) => supabase.from("gini_goals").select("*").eq("id", goalId).eq("user_id", userId);

const updateGoal = (goalId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("gini_goals").update(updateData).eq("id", goalId).eq("user_id", userId).select();

const deleteGoal = (goalId: string, userId: string) => supabase.from("gini_goals").delete().eq("id", goalId).eq("user_id", userId).select();

export { getFamilyMemberOwnership, insertGoal, getGoalsByUser, getGoalById, updateGoal, deleteGoal };
