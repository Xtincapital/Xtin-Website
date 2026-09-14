import supabase from "../../supabase/index.js";

const getLearnPlanByUserId = (userId) =>
	supabase
		.from("learn_pro_plans")
		.select("plan_id, billing, currency, region, activated_at, valid_until, payment_id")
		.eq("user_id", String(userId))
		.maybeSingle();

const upsertLearnPlan = (record) =>
	supabase
		.from("learn_pro_plans")
		.upsert(record, { onConflict: "user_id" });

// Used by the billing/subscriptionPlan aggregation endpoint.
const getLearnPlansForUser = (userId, authId) =>
	supabase
		.from("learn_pro_plans")
		.select("*")
		.or(`user_id.eq.${userId},auth_id.eq.${authId || userId}`);

export { getLearnPlanByUserId, upsertLearnPlan, getLearnPlansForUser };
