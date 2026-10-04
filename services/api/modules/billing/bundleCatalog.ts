// Server-side price list for the Dashboard's plans & bundles checkout.
//
// Keep in sync with apps/web/src/features/dashboard/pages/Dashboard.tsx
// (ULTIMATE_BUNDLE, COMPACT_BUNDLES, BUNDLE_PRODUCTS and the custom-bundle
// discount tiers). The browser shows these prices, but only this file decides
// what an order costs — createSubscriptionOrder used to charge whatever
// `amount` the browser sent, so any plan could be bought for ₹1.

export type BillingCycle = "monthly" | "annual";

/** Single products, by the id the Dashboard uses. Prices in whole rupees. */
export const BUNDLE_PRODUCTS: Record<string, { name: string; monthly: number; annual: number }> = {
    algos: { name: "Algo Trading Pro", monthly: 4999, annual: 47999 },
    gini: { name: "Gini AI Advisor Pro", monthly: 499, annual: 3999 },
    fundakamental: { name: "Fundakamental Pro", monthly: 499, annual: 3999 },
    journal: { name: "Trade Journal Pro", monthly: 299, annual: 2399 },
    learn: { name: "Learn Hub All-Access", monthly: 99, annual: 499 },
    newsletter: { name: "Market Newsletter Pro", monthly: 149, annual: 999 },
};

/** Preset bundles. `products` are the names stored on user_subscriptions, which entitlement checks match on. */
export const PRESET_BUNDLES: Record<string, { name: string; products: string[]; monthly: number; annual: number }> = {
    "ultimate-pass": {
        name: "Xtin Ultimate All-Access Pass",
        products: ["Algo Trading Pro", "Gini AI Advisor Pro", "Fundakamental Pro", "Trade Journal Pro", "Learn Hub All-Access", "Market Newsletter Pro"],
        monthly: 1, // TEMP ₹1 for owner test purchase — restore 4580
        annual: 1, // TEMP ₹1 — restore 41925
    },
    "quant-pack": {
        name: "Quant Trader Pack",
        products: ["Algo Trading Pro", "Trade Journal Pro"],
        monthly: 4238,
        annual: 40318,
    },
    "ai-investor": {
        name: "AI Investor Suite",
        products: ["Gini AI Advisor", "Fundakamental Research"],
        monthly: 748,
        annual: 5998,
    },
    "alpha-learn": {
        name: "Alpha Learning Bundle",
        products: ["Learn Hub", "Market Newsletter", "Trade Journal"],
        monthly: 437,
        annual: 3117,
    },
};

export const CUSTOM_BUNDLE_ID = "custom-bundle";

/** Same tiers as the Dashboard's custom bundle builder. */
export const customBundleDiscount = (count: number) => {
    if (count >= 5) return 0.3;
    if (count === 4) return 0.2;
    if (count === 3) return 0.15;
    if (count === 2) return 0.1;
    return 0;
};

export type PricedPlan = {
    planId: string;
    planName: string;
    billingCycle: BillingCycle;
    /** Whole rupees. */
    amount: number;
    products: string[];
    /** Product ids chosen in the custom builder (empty for presets and singles). */
    customProductIds: string[];
};

/** Returns null for anything that isn't a real plan — callers must reject it. */
export function priceBundle(planId: string, billingCycle: string, customProductIds: string[] = []): PricedPlan | null {
    if (billingCycle !== "monthly" && billingCycle !== "annual") return null;
    const cycle = billingCycle as BillingCycle;

    const preset = PRESET_BUNDLES[planId];
    if (preset) {
        return { planId, planName: preset.name, billingCycle: cycle, amount: preset[cycle], products: preset.products, customProductIds: [] };
    }

    const single = BUNDLE_PRODUCTS[planId];
    if (single) {
        return { planId, planName: single.name, billingCycle: cycle, amount: single[cycle], products: [single.name], customProductIds: [] };
    }

    if (planId === CUSTOM_BUNDLE_ID) {
        const ids = Array.from(new Set(customProductIds.map(String))).filter((id) => BUNDLE_PRODUCTS[id]).sort();
        if (ids.length < 2) return null;
        const base = ids.reduce((sum, id) => sum + BUNDLE_PRODUCTS[id][cycle], 0);
        return {
            planId,
            planName: `Custom Bundle (${ids.length} Products)`,
            billingCycle: cycle,
            amount: Math.round(base * (1 - customBundleDiscount(ids.length))),
            // Ids, as the Dashboard has always stored for custom bundles; entitlement checks substring-match them.
            products: ids,
            customProductIds: ids,
        };
    }

    return null;
}

/**
 * `user_subscriptions.products` is a jsonb list, but older rows were saved as
 * a JSON *string* (the list passed through JSON.stringify), so it reads back
 * as text. Accept both so existing customers' bundles keep working.
 */
export function normalizeProducts(value: unknown): string[] {
    let list: unknown = value;
    if (typeof list === "string") {
        try {
            list = JSON.parse(list);
        } catch {
            return [];
        }
    }
    return Array.isArray(list) ? list.map(String) : [];
}
