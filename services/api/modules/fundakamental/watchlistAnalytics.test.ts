import { describe, it, expect } from "vitest";
import { calculateSummary } from "./watchlistAnalytics.js";

describe("calculateSummary", () => {
    it("counts value and targets for items added without an entry price", () => {
        const items: any[] = [{ ticker: "TCS.NS", added_price: null, target_price: 3500, target_price_type: "BUY" }];
        const s = calculateSummary(items, { "TCS.NS": { price: 2075 } as any });
        expect(s.tracked_value).toBe(2075);
        expect(s.targets_hit).toBe(1);
        expect(s.avg_change_pct).toBe(0);
        expect(s.best_performer).toBeNull();
    });

    it("averages % change only over items that have an entry price", () => {
        const items: any[] = [
            { ticker: "A", added_price: 100 },
            { ticker: "B", added_price: null },
        ];
        const s = calculateSummary(items, { A: { price: 110 } as any, B: { price: 50 } as any });
        expect(s.avg_change_pct).toBe(10);
        expect(s.tracked_value).toBe(160);
    });
});
