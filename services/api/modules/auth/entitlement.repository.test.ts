// Coverage for upsertEntitlement — the derived cross-product access index
// written by every payment-verification path (learn/newsletter/algo/
// subscriptionPlan). Its whole contract is "never throw, never block a
// payment response" — these tests exist mainly to pin that contract down
// so a future edit can't accidentally make it start throwing.
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn();
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));
const mockSupabase = { from: mockFrom };

vi.mock("../../supabase/index.js", () => ({ default: mockSupabase }));

const { upsertEntitlement } = await import("./entitlement.repository.js");

describe("upsertEntitlement", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("upserts with the expected shape and onConflict target", async () => {
        mockUpsert.mockResolvedValue({ data: null, error: null });

        await upsertEntitlement({
            userId: "user-1",
            authId: "auth-1",
            product: "learn",
            validUntil: "2027-01-01T00:00:00.000Z",
            sourceTable: "learn_pro_plans",
        });

        expect(mockFrom).toHaveBeenCalledWith("user_entitlements");
        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: "user-1",
                auth_id: "auth-1",
                product: "learn",
                active: true,
                valid_until: "2027-01-01T00:00:00.000Z",
                source_table: "learn_pro_plans",
            }),
            { onConflict: "user_id,product" }
        );
    });

    it("coerces userId/authId to strings (defensive against a numeric or object id upstream)", async () => {
        mockUpsert.mockResolvedValue({ data: null, error: null });

        await upsertEntitlement({
            userId: 12345 as any,
            authId: null,
            product: "algo",
            validUntil: "2027-01-01T00:00:00.000Z",
            sourceTable: "algorithm_subscriptions",
        });

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ user_id: "12345", auth_id: null }),
            expect.anything()
        );
    });

    it("never throws when the Supabase call rejects — payment responses must never fail over this", async () => {
        mockUpsert.mockRejectedValue(new Error("connection reset"));

        await expect(
            upsertEntitlement({
                userId: "user-1",
                authId: "auth-1",
                product: "newsletter",
                validUntil: "2027-01-01T00:00:00.000Z",
                sourceTable: "newsletter_pro_plans",
            })
        ).resolves.toBeUndefined();
    });
});
