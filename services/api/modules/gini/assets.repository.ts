// Thin Supabase-query wrappers for `gini_assets`. Style mirrors
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

const insertAsset = (record: Record<string, unknown>) => supabase.from("gini_assets").insert(record).select();

const getAssetsByUser = (userId: string) => supabase.from("gini_assets").select("*").eq("user_id", userId).order("created_at", { ascending: true });

const getAssetById = (assetId: string, userId: string) => supabase.from("gini_assets").select("*").eq("id", assetId).eq("user_id", userId);

const updateAsset = (assetId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("gini_assets").update(updateData).eq("id", assetId).eq("user_id", userId).select();

const deleteAsset = (assetId: string, userId: string) => supabase.from("gini_assets").delete().eq("id", assetId).eq("user_id", userId).select();

export { getFamilyMemberOwnership, insertAsset, getAssetsByUser, getAssetById, updateAsset, deleteAsset };
