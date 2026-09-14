import supabase from "../../supabase/index.js";

const getAlgorithmSubscriptionsByUserId = (userId) =>
	supabase
		.from("algorithm_subscriptions")
		.select("algo_name, plan_type, amount, currency, activated_at, valid_until, payment_id, status, tradingview_username")
		.eq("user_id", String(userId));

const upsertAlgorithmSubscription = (record) =>
	supabase
		.from("algorithm_subscriptions")
		.upsert(record, { onConflict: "user_id,algo_name" });

// Used by the billing/subscriptionPlan aggregation endpoint to compute
// cross-product access flags -- a broader, unfiltered-by-status-elsewhere
// read than getAlgorithmSubscriptionsByUserId, matched by user_id OR auth_id.
const getActiveAlgorithmSubscriptionsForUser = (userId, authId) =>
	supabase
		.from("algorithm_subscriptions")
		.select("*")
		.eq("status", "active")
		.or(`user_id.eq.${userId},auth_id.eq.${authId || userId}`);

export {
	getAlgorithmSubscriptionsByUserId,
	upsertAlgorithmSubscription,
	getActiveAlgorithmSubscriptionsForUser,
};
