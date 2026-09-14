import supabase from "../../supabase/index.js";

const getNewsletterPlanByUserId = (userId) =>
	supabase
		.from("newsletter_pro_plans")
		.select("plan_id, billing, currency, region, markets, activated_at, valid_until, payment_id")
		.eq("user_id", String(userId))
		.maybeSingle();

// Best-effort mirror of market prefs onto the plan row; never throws.
const updateNewsletterPlanMarkets = async (userId, markets) => {
	try {
		await supabase
			.from("newsletter_pro_plans")
			.update({ markets, updated_at: new Date().toISOString() })
			.eq("user_id", String(userId));
	} catch {
		// best-effort; never throws
	}
};

const upsertNewsletterPlan = (record) =>
	supabase
		.from("newsletter_pro_plans")
		.upsert(record, { onConflict: "user_id" });

// Used by the billing/subscriptionPlan aggregation endpoint.
const getNewsletterPlansForUser = (userId, authId) =>
	supabase
		.from("newsletter_pro_plans")
		.select("*")
		.or(`user_id.eq.${userId},auth_id.eq.${authId || userId}`);

export {
	getNewsletterPlanByUserId,
	updateNewsletterPlanMarkets,
	upsertNewsletterPlan,
	getNewsletterPlansForUser,
};
