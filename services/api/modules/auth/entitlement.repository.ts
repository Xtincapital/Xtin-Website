import supabase from "../../supabase/index.js";

// Called from every payment-verification path (learn/newsletter/algo/
// subscriptionPlan controllers) right after that domain's own table write
// succeeds. Best-effort: never blocks or fails the payment response over
// this derived index falling out of sync — matches the "payment already
// succeeded, never fail the response over storage" precedent used
// elsewhere in this codebase.
const upsertEntitlement = async ({
	userId,
	authId,
	product,
	validUntil,
	sourceTable,
}: {
	userId: string;
	authId?: string | null;
	product: "learn" | "newsletter" | "algo" | "bundle";
	validUntil: string;
	sourceTable: string;
}) => {
	try {
		await supabase.from("user_entitlements").upsert(
			{
				user_id: String(userId),
				auth_id: authId ? String(authId) : null,
				product,
				active: true,
				valid_until: validUntil,
				source_table: sourceTable,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id,product" }
		);
	} catch (err: any) {
		console.warn(`[Entitlements] Failed to upsert ${product} entitlement for user ${userId}:`, err?.message);
	}
};

export { upsertEntitlement };
