import { describe, expect, it } from "vitest";
import { addCycle, addDays, stackValidUntil } from "./planExpiry.js";

const now = new Date("2026-10-01T00:00:00Z");

describe("stackValidUntil", () => {
    it("starts from now when there is no plan", () => {
        expect(stackValidUntil({ paymentId: "p2", extend: addDays(31), now }).toISOString()).toBe("2026-11-01T00:00:00.000Z");
    });
    it("starts from now when the old plan has expired", () => {
        const r = stackValidUntil({ existingValidUntil: "2026-09-01T00:00:00Z", existingPaymentId: "p1", paymentId: "p2", extend: addDays(31), now });
        expect(r.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    });
    it("adds on top of the days left", () => {
        const r = stackValidUntil({ existingValidUntil: "2026-10-11T00:00:00Z", existingPaymentId: "p1", paymentId: "p2", extend: addDays(31), now });
        expect(r.toISOString()).toBe("2026-11-11T00:00:00.000Z");
    });
    it("does not add twice for a retry of the same payment", () => {
        const r = stackValidUntil({ existingValidUntil: "2026-11-11T00:00:00Z", existingPaymentId: "p2", paymentId: "p2", extend: addDays(31), now });
        expect(r.toISOString()).toBe("2026-11-11T00:00:00.000Z");
    });
    it("stacks calendar cycles", () => {
        const r = stackValidUntil({ existingValidUntil: "2026-10-11T00:00:00Z", paymentId: "p2", extend: addCycle("annual"), now });
        expect(r.toISOString()).toBe("2027-10-11T00:00:00.000Z");
    });
});
