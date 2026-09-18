// Thin Supabase-query wrappers for `gini_elder_care`. Style mirrors
// gini/goals.repository.ts and gini/familyMembers.repository.ts — one
// small function per query, controllers own all the branching/error
// handling.
//
// `member_id` is a required FK to `gini_family_members.id`, but that FK
// alone doesn't scope by `user_id` — anyone could reference any family
// member row in the table. `getFamilyMemberOwnership` lets the controller
// confirm the referenced member actually belongs to the authenticated user
// before an insert/update is attempted, and doubles as the source of the
// member's `age` used to derive `years_remaining` (see elderCare.controller.ts).
import supabase from "../../supabase/index.js";

const getFamilyMemberOwnership = (memberId: string, userId: string) =>
    supabase.from("gini_family_members").select("id, age").eq("id", memberId).eq("user_id", userId);

// Embeds the referenced family member's `age` (via the member_id FK) on
// every read so the controller can derive `years_remaining` server-side
// without an extra round trip per row.
const ELDER_CARE_SELECT = "*, family_member:gini_family_members(age)";

const insertElderCarePlan = (record: Record<string, unknown>) => supabase.from("gini_elder_care").insert(record).select(ELDER_CARE_SELECT);

const getElderCarePlansByUser = (userId: string) =>
    supabase.from("gini_elder_care").select(ELDER_CARE_SELECT).eq("user_id", userId).order("created_at", { ascending: true });

const getElderCarePlanById = (planId: string, userId: string) =>
    supabase.from("gini_elder_care").select(ELDER_CARE_SELECT).eq("id", planId).eq("user_id", userId);

const updateElderCarePlan = (planId: string, userId: string, updateData: Record<string, unknown>) =>
    supabase.from("gini_elder_care").update(updateData).eq("id", planId).eq("user_id", userId).select(ELDER_CARE_SELECT);

const deleteElderCarePlan = (planId: string, userId: string) => supabase.from("gini_elder_care").delete().eq("id", planId).eq("user_id", userId).select();

export { getFamilyMemberOwnership, insertElderCarePlan, getElderCarePlansByUser, getElderCarePlanById, updateElderCarePlan, deleteElderCarePlan };
