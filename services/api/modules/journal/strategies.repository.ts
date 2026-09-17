// Thin Supabase-query wrappers for `journal_strategies`.
import supabase from "../../supabase/index.js";

const getStrategiesByUser = (userId: string) => supabase.from("journal_strategies").select("*").eq("user_id", userId).order("name", { ascending: true });

// Case-insensitive lookup — mirrors app.js's `rememberCustomStrategy`, which
// dedupes by `.toLowerCase()` comparison before adding a new name.
const findStrategyByNameCI = (userId: string, name: string) =>
    supabase.from("journal_strategies").select("*").eq("user_id", userId).ilike("name", name).limit(1);

const insertStrategy = (record: Record<string, unknown>) => supabase.from("journal_strategies").insert(record).select();

const deleteStrategy = (strategyId: string, userId: string) =>
    supabase.from("journal_strategies").delete().eq("id", strategyId).eq("user_id", userId).select();

export { getStrategiesByUser, findStrategyByNameCI, insertStrategy, deleteStrategy };
