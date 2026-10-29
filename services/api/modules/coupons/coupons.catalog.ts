// What coupons can target. Product keys are the `notes.product` values each
// checkout puts on its Razorpay order (see modules/payments/fulfillment.ts).
//
// FREE_ACCESS_PLANS lists every plan a free-access code may grant, with the
// order notes that product's fulfiller reads to know which plan it is. Algo
// subscriptions and the other bundles are left out on purpose: algos need a
// TradingView username and manual setup, bundles are priced per selection.
// The one bundle here is the Ultimate pass (everything) for 3 months — a
// length only coupons grant (couponOnlyBundle in billing/bundleCatalog.ts).
// Its algo access is set up by hand afterwards, as for a paid Ultimate.

export const COUPON_PRODUCTS: Array<{ key: string; label: string }> = [
    { key: "xtin_bundle", label: "Bundles & plans (Dashboard)" },
    { key: "journal_pro_plan", label: "Xtin Journal Pro" },
    { key: "journal_ai_tokens", label: "Xtin Journal AI packs" },
    { key: "gini_pro_plan", label: "Gini Pro" },
    { key: "gini_ai_tokens", label: "Gini AI packs" },
    { key: "fundakamental_pro", label: "FundaKaMental Pro" },
    { key: "fundakamental_tokens", label: "FundaKaMental token packs" },
    { key: "xtin_learn_pro", label: "Learn Pro" },
    { key: "xtin_newsletter_pro", label: "Market Brief Pro (newsletter)" },
    { key: "xtin_algo_subscription", label: "Algo subscriptions" },
    { key: "backtest_pro_pass", label: "Backtest Pro passes" },
];

export const COUPON_PRODUCT_KEYS = new Set(COUPON_PRODUCTS.map((p) => p.key));

/** needsLimits: worth too much to hand out without an end — its codes must keep a total-uses limit and an end date. */
export type FreeAccessPlan = { product: string; plan: string; label: string; notes: Record<string, string>; needsLimits?: boolean };

export const FREE_ACCESS_PLANS: FreeAccessPlan[] = [
    {
        product: "xtin_bundle",
        plan: "ultimate_pass_quarterly",
        label: "Ultimate All-Access Pass (everything) — 3 months",
        notes: { plan_id: "ultimate-pass", plan_name: "Xtin Ultimate All-Access Pass", billing_cycle: "quarterly" },
        needsLimits: true,
    },
    { product: "xtin_newsletter_pro", plan: "newsletter_pro_monthly", label: "Market Brief Pro — 1 month", notes: { planId: "newsletter_pro_monthly" } },
    { product: "xtin_newsletter_pro", plan: "newsletter_pro_yearly", label: "Market Brief Pro — 1 year", notes: { planId: "newsletter_pro_yearly" } },
    { product: "xtin_learn_pro", plan: "learn_pro_monthly", label: "Learn Pro — 1 month", notes: { planId: "learn_pro_monthly" } },
    { product: "xtin_learn_pro", plan: "learn_pro_yearly", label: "Learn Pro — 1 year", notes: { planId: "learn_pro_yearly" } },
    { product: "journal_pro_plan", plan: "journal_pro_monthly", label: "Xtin Journal Pro — 1 month", notes: { plan_id: "journal_pro_monthly" } },
    { product: "journal_pro_plan", plan: "journal_pro_yearly", label: "Xtin Journal Pro — 1 year", notes: { plan_id: "journal_pro_yearly" } },
    { product: "gini_pro_plan", plan: "pro_monthly", label: "Gini Pro — 1 month", notes: { plan_id: "pro_monthly" } },
    { product: "gini_pro_plan", plan: "pro_yearly", label: "Gini Pro — 1 year", notes: { plan_id: "pro_yearly" } },
    { product: "fundakamental_pro", plan: "pro_monthly", label: "FundaKaMental Pro — 1 month", notes: { plan_id: "pro_monthly" } },
    { product: "fundakamental_pro", plan: "pro_yearly", label: "FundaKaMental Pro — 1 year", notes: { plan_id: "pro_yearly" } },
    { product: "backtest_pro_pass", plan: "event", label: "Backtest Pro — Event Pass (2 days)", notes: { pass_id: "event" } },
    { product: "backtest_pro_pass", plan: "weekly", label: "Backtest Pro — 7 days", notes: { pass_id: "weekly" } },
    { product: "backtest_pro_pass", plan: "mini", label: "Backtest Pro — 15 days", notes: { pass_id: "mini" } },
    { product: "backtest_pro_pass", plan: "monthly", label: "Backtest Pro — 30 days", notes: { pass_id: "monthly" } },
    { product: "backtest_pro_pass", plan: "quarter", label: "Backtest Pro — 90 days", notes: { pass_id: "quarter" } },
    { product: "journal_ai_tokens", plan: "ai_500", label: "Xtin Journal — Starter AI Pack (300K tokens)", notes: { package_id: "ai_500", tokens: "300000" } },
    { product: "journal_ai_tokens", plan: "ai_1000", label: "Xtin Journal — Growth AI Pack (700K tokens)", notes: { package_id: "ai_1000", tokens: "700000" } },
    { product: "gini_ai_tokens", plan: "ai_500", label: "Gini — Starter AI Pack (300K tokens)", notes: { package_id: "ai_500", tokens: "300000" } },
    { product: "gini_ai_tokens", plan: "ai_1000", label: "Gini — Growth AI Pack (700K tokens)", notes: { package_id: "ai_1000", tokens: "700000" } },
    { product: "fundakamental_tokens", plan: "pack_small", label: "FundaKaMental — 200K tokens", notes: { pack_id: "pack_small", tokens: "200000" } },
    { product: "fundakamental_tokens", plan: "pack_medium", label: "FundaKaMental — 500K tokens", notes: { pack_id: "pack_medium", tokens: "500000" } },
];

export const findFreeAccessPlan = (product: string | null, plan: string | null) =>
    FREE_ACCESS_PLANS.find((p) => p.product === product && p.plan === plan) || null;

/** Why this code (new, or as it would be after an edit) can't be saved without limits — or null when it's fine. */
export function missingLimits(c: { kind?: string | null; free_product?: string | null; free_plan?: string | null; max_redemptions?: number | null; expires_at?: string | null }) {
    const plan = c.kind === "free_access" ? findFreeAccessPlan(c.free_product ?? null, c.free_plan ?? null) : null;
    if (!plan?.needsLimits || (c.max_redemptions && c.expires_at)) return null;
    return `Codes for ${plan.label} need a Total uses limit and an end date`;
}
