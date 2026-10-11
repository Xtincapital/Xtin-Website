import { describe, it, expect, vi } from "vitest";

// tradeDuplicates.js reaches the Supabase client, which needs env vars CI doesn't have.
vi.mock("../../supabase/index.js", () => ({ default: {} }));
import { validateTradeListQuery } from "./trades.validator.js";

describe("trade list filters", () => {
    it("accepts a search term and an inclusive date range", () => {
        const r = validateTradeListQuery({ limit: "25", offset: "50", search: "  nifty ", from: "2026-01-01", to: "2026-03-31" });
        expect(r.data).toEqual({ limit: 25, offset: 50, search: "nifty", from: "2026-01-01", to: "2026-03-31", only_duplicates: false, flag_duplicates: false });
    });

    it("rejects malformed dates", () => {
        expect(validateTradeListQuery({ from: "01/02/2026" }).errors).toBeDefined();
    });

    it("rejects a 'from' after 'to'", () => {
        expect(validateTradeListQuery({ from: "2026-05-01", to: "2026-04-01" }).errors).toBeDefined();
    });

    it("still works with no filters", () => {
        expect(validateTradeListQuery({}).data).toEqual({ limit: 50, offset: 0, only_duplicates: false, flag_duplicates: false });
    });
});

describe("duplicate flags", () => {
    it("reads only_duplicates / flag_duplicates", async () => {
        expect(validateTradeListQuery({ only_duplicates: "true", flag_duplicates: "true" }).data).toMatchObject({ only_duplicates: true, flag_duplicates: true });
        const { duplicateIds } = await import("./tradeDuplicates.js");
        const t = { date: "2026-10-05", asset: "INFY", buy_sell: "buy", quantity: 10, entry_price: 1500, exit_price: 1520, entry_time: "09:30" };
        const ids = duplicateIds([
            { ...t, id: "a" },
            { ...t, asset: " infy ", id: "b" }, // same trade, typed differently
            { ...t, entry_time: "11:00", id: "c" }, // separate trade later that day
        ]);
        expect(Array.from(ids).sort()).toEqual(["a", "b"]);
    });
});

