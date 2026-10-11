import { describe, it, expect } from "vitest";
import { validateTradeListQuery } from "./trades.validator.js";

describe("trade list filters", () => {
    it("accepts a search term and an inclusive date range", () => {
        const r = validateTradeListQuery({ limit: "25", offset: "50", search: "  nifty ", from: "2026-01-01", to: "2026-03-31" });
        expect(r.data).toEqual({ limit: 25, offset: 50, search: "nifty", from: "2026-01-01", to: "2026-03-31" });
    });

    it("rejects malformed dates", () => {
        expect(validateTradeListQuery({ from: "01/02/2026" }).errors).toBeDefined();
    });

    it("rejects a 'from' after 'to'", () => {
        expect(validateTradeListQuery({ from: "2026-05-01", to: "2026-04-01" }).errors).toBeDefined();
    });

    it("still works with no filters", () => {
        expect(validateTradeListQuery({}).data).toEqual({ limit: 50, offset: 0 });
    });
});
