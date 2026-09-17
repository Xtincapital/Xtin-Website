// Thin Supabase-query wrappers for `journal_goals`.
import supabase from "../../supabase/index.js";

const insertGoal = (record: Record<string, unknown>) => supabase.from("journal_goals").insert(record).select();

const getGoalsByUser = (userId: string) => supabase.from("journal_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });

const getGoalById = (goalId: string, userId: string) => supabase.from("journal_goals").select("*").eq("id", goalId).eq("user_id", userId);

const updateGoal = (goalId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("journal_goals").update(updateData).eq("id", goalId).eq("user_id", userId).select();

const deleteGoal = (goalId: string, userId: string) => supabase.from("journal_goals").delete().eq("id", goalId).eq("user_id", userId).select();

export { insertGoal, getGoalsByUser, getGoalById, updateGoal, deleteGoal };
