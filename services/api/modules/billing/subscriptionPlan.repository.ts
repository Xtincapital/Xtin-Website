import supabase from "../../supabase/index.js";

const getActiveUserSubscriptions = (userId, authId) => {
	const query = supabase.from("user_subscriptions").select("*").eq("status", "active");
	return authId
		? query.or(`user_id.eq.${userId},auth_id.eq.${authId}`)
		: query.eq("user_id", userId);
};

const upsertUserSubscription = (payload) =>
	supabase
		.from("user_subscriptions")
		.upsert(payload, { onConflict: "user_id,plan_id" })
		.select()
		.single();

const getUserSubscriptionByPlan = (userId, planId) =>
	supabase
		.from("user_subscriptions")
		.select("valid_until, payment_id")
		.eq("user_id", String(userId))
		.eq("plan_id", planId)
		.maybeSingle();

export { getActiveUserSubscriptions, getUserSubscriptionByPlan, upsertUserSubscription };
