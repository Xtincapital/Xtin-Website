import { describe, it, expect, vi, beforeEach } from "vitest";

const getQuote = vi.fn();
vi.mock("./stockDataService.js", () => ({ getQuote }));
vi.mock("node-cron", () => ({ default: { schedule: vi.fn() } }));

// Minimal fake of the Supabase calls the checker makes.
let alerts: any[] = [];
const notifications: any[] = [];
const updates: string[] = [];
let alreadyTriggered = new Set<string>();

function table(name: string) {
    const filters: Record<string, unknown> = {};
    let op = "select";
    let payload: any = null;
    const b: any = {
        select: () => b,
        limit: () => b,
        delete: () => ((op = "delete"), b),
        update: (p: any) => ((op = "update"), (payload = p), b),
        insert: (p: any) => {
            if (name === "funda_notifications") notifications.push(p);
            return Promise.resolve({ error: null });
        },
        eq: (c: string, v: unknown) => ((filters[c] = v), b),
        then: (resolve: (v: unknown) => void) => {
            if (name === "funda_price_alerts" && op === "select") {
                return resolve({ data: alerts.filter((a) => !filters.user_id || a.user_id === filters.user_id), error: null });
            }
            if (name === "funda_price_alerts" && op === "update") {
                const id = String(filters.id);
                if (alreadyTriggered.has(id)) return resolve({ data: [], error: null });
                alreadyTriggered.add(id);
                updates.push(`${id}:${payload.triggered_price}`);
                return resolve({ data: [{ id }], error: null });
            }
            return resolve({ data: [], error: null });
        },
    };
    return b;
}
vi.mock("../../supabase/index.js", () => ({ default: { from: (n: string) => table(n) } }));

const { checkPriceAlerts, checkUserAlertsIfDue, resetPriceAlertState, isHit } = await import("./priceAlertChecker.js");

describe("price alert checker", () => {
    beforeEach(() => {
        notifications.length = 0;
        updates.length = 0;
        alreadyTriggered = new Set();
        resetPriceAlertState();
        getQuote.mockReset();
        alerts = [
            { id: "a1", user_id: "u1", ticker: "TCS.NS", condition: "below", target_price: "3500" },
            { id: "a2", user_id: "u1", ticker: "INFY.NS", condition: "above", target_price: "1100" },
            { id: "a3", user_id: "u2", ticker: "AAPL", condition: "above", target_price: "300" },
        ];
        getQuote.mockImplementation(async (t: string) => ({ price: t === "TCS.NS" ? 2099.7 : t === "INFY.NS" ? 1012.5 : 332.89 }));
    });

    it("knows which way each condition fires", () => {
        expect(isHit("below", 99, 100)).toBe(true);
        expect(isHit("below", 101, 100)).toBe(false);
        expect(isHit("above", 100, 100)).toBe(true);
    });

    it("triggers hit alerts once and notifies the right user", async () => {
        const r = await checkPriceAlerts();
        expect(r).toEqual({ checked: 3, triggered: 2 });
        expect(notifications.map((n) => [n.user_id, n.data.ticker])).toEqual([["u1", "TCS.NS"], ["u2", "AAPL"]]);
        expect(notifications[0].message).toContain("₹2,099.70");
        expect(notifications[1].message).toContain("$332.89");
        // A second run finds them already switched off.
        const again = await checkPriceAlerts();
        expect(again.triggered).toBe(0);
        expect(notifications.length).toBe(2);
    });

    it("skips alerts with no price instead of guessing", async () => {
        getQuote.mockResolvedValue(null);
        const r = await checkPriceAlerts();
        expect(r.triggered).toBe(0);
    });

    it("checks one user at most every few minutes", async () => {
        await checkUserAlertsIfDue("u2");
        await checkUserAlertsIfDue("u2");
        expect(getQuote).toHaveBeenCalledTimes(1);
        expect(notifications.map((n) => n.user_id)).toEqual(["u2"]);
    });
});
