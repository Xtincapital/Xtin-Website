// Thin Supabase-query wrappers for `gini_family_members`. Style mirrors
// journal/goals.repository.ts — one small function per query, controllers
// own all the branching/error handling.
import supabase from "../../supabase/index.js";

const insertFamilyMember = (record: Record<string, unknown>) => supabase.from("gini_family_members").insert(record).select();

const getFamilyMembersByUser = (userId: string) =>
    supabase.from("gini_family_members").select("*").eq("user_id", userId).order("created_at", { ascending: true });

const getFamilyMemberById = (memberId: string, userId: string) =>
    supabase.from("gini_family_members").select("*").eq("id", memberId).eq("user_id", userId);

const updateFamilyMember = (memberId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("gini_family_members").update(updateData).eq("id", memberId).eq("user_id", userId).select();

const deleteFamilyMember = (memberId: string, userId: string) =>
    supabase.from("gini_family_members").delete().eq("id", memberId).eq("user_id", userId).select();

export { insertFamilyMember, getFamilyMembersByUser, getFamilyMemberById, updateFamilyMember, deleteFamilyMember };
