// Thin Supabase-query wrappers for `gini_tax_optimization` — a single
// settings-like row per user (user_id is the primary key), not a list, so
// this repository is a get-or-create-style pair rather than full CRUD.
import supabase from "../../supabase/index.js";

const getTaxOptimizationByUser = (userId: string) => supabase.from("gini_tax_optimization").select("*").eq("user_id", userId);

// Insert-only, relying entirely on the table's column defaults
// ('{}'::jsonb / false) — used by the controller's GET handler the first
// time a user has no row yet.
const insertDefaultTaxOptimization = (userId: string) => supabase.from("gini_tax_optimization").insert({ user_id: userId }).select();

// Upsert on the `user_id` primary key — creates the row (DB defaults fill
// any column not present in `record`) if it doesn't exist yet, or merges
// the given fields into the existing row otherwise. This is what PUT uses.
const upsertTaxOptimization = (userId: string, record: Record<string, unknown>) =>
    supabase
        .from("gini_tax_optimization")
        .upsert({ user_id: userId, ...record, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select();

export { getTaxOptimizationByUser, insertDefaultTaxOptimization, upsertTaxOptimization };
