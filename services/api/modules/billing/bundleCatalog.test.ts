import { describe, it, expect } from "vitest";
import { priceBundle, normalizeProducts, PRESET_BUNDLES, BUNDLE_PRODUCTS } from "./bundleCatalog.js";

describe("priceBundle", () => {
    it("prices presets and single products from the server catalogue", () => {
        expect(priceBundle("ultimate-pass", "monthly")?.amount).toBe(PRESET_BUNDLES["ultimate-pass"].monthly);
        expect(priceBundle("ultimate-pass", "annual")?.amount).toBe(PRESET_BUNDLES["ultimate-pass"].annual);
        expect(priceBundle("algos", "monthly")).toMatchObject({ amount: 4999, products: ["Algo Trading Pro"] });
    });

    it("applies the Dashboard's custom-bundle discount tiers", () => {
        // gini 499 + journal 299 = 798, 10% off
        expect(priceBundle("custom-bundle", "monthly", ["gini", "journal"])?.amount).toBe(Math.round(798 * 0.9));
        const all = Object.keys(BUNDLE_PRODUCTS);
        const base = all.reduce((sum, id) => sum + BUNDLE_PRODUCTS[id].annual, 0);
        expect(priceBundle("custom-bundle", "annual", all)?.amount).toBe(Math.round(base * 0.7));
    });

    it("ignores duplicate and unknown ids in a custom bundle, and needs at least two real products", () => {
        expect(priceBundle("custom-bundle", "monthly", ["gini", "gini", "bogus"])).toBeNull();
        expect(priceBundle("custom-bundle", "monthly", ["gini", "journal", "journal", "bogus"])?.products).toEqual(["gini", "journal"]);
    });

    it("rejects unknown plans and billing cycles", () => {
        expect(priceBundle("free-everything", "monthly")).toBeNull();
        expect(priceBundle("algos", "weekly")).toBeNull();
        expect(priceBundle("", "monthly")).toBeNull();
    });
});

describe("normalizeProducts", () => {
    it("reads a real list", () => {
        expect(normalizeProducts(["learn", "newsletter"])).toEqual(["learn", "newsletter"]);
    });
    it("reads the JSON-string form older rows were saved in", () => {
        expect(normalizeProducts('["learn","newsletter"]')).toEqual(["learn", "newsletter"]);
    });
    it("never throws on junk", () => {
        expect(normalizeProducts("not json")).toEqual([]);
        expect(normalizeProducts(null)).toEqual([]);
        expect(normalizeProducts({})).toEqual([]);
    });
});
