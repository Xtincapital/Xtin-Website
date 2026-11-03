import { describe, it, expect, afterEach } from "vitest";
import { validateLink } from "./broker.validator.js";
import { istParts, toJournalTrade } from "./tradeMapper.js";
import { brokerSyncAvailable, brokerSyncEnabled, getBrokerAdapter } from "./adapter.js";
import { CONSENT_VERSION } from "./consent.js";

describe("validateLink", () => {
    const ok = { client_code: "ab1234", consent: true, consent_version: CONSENT_VERSION };

    it("accepts a client code and upper-cases it", () => {
        expect(validateLink(ok)).toEqual({ data: { client_code: "AB1234", consent: true, consent_version: CONSENT_VERSION }, message: "Validation successful" });
        expect(validateLink({ ...ok, client_code: "  ab1234  " }).data?.client_code).toBe("AB1234");
    });

    it("requires consent to be given", () => {
        expect(validateLink({ ...ok, consent: false }).errors).toBeDefined();
        expect(validateLink({ client_code: "AB1234", consent_version: CONSENT_VERSION }).errors).toBeDefined();
        expect(validateLink({ ...ok, consent: "true" }).errors).toBeDefined();
    });

    it("rejects client codes that are missing, too short, too long or contain odd characters", () => {
        expect(validateLink({ ...ok, client_code: undefined }).errors).toBeDefined();
        expect(validateLink({ ...ok, client_code: "A1" }).errors).toBeDefined();
        expect(validateLink({ ...ok, client_code: "A".repeat(31) }).errors).toBeDefined();
        expect(validateLink({ ...ok, client_code: "AB 12" }).errors).toBeDefined();
        expect(validateLink({ ...ok, client_code: "AB1;DROP" }).errors).toBeDefined();
    });

    it("requires the consent version", () => {
        expect(validateLink({ client_code: "AB1234", consent: true }).errors).toBeDefined();
    });
});

describe("istParts", () => {
    it("reads the date and time on the Indian clock", () => {
        expect(istParts("2026-11-03T09:16:04+05:30")).toEqual({ date: "2026-11-03", time: "09:16" });
        // 20:00 UTC on the 3rd is 01:30 on the 4th in India.
        expect(istParts("2026-11-03T20:00:00Z")).toEqual({ date: "2026-11-04", time: "01:30" });
    });
});

describe("toJournalTrade", () => {
    const trip = {
        externalId: "AB1234:NSEFO:NIFTY26NOV24500CE:NRML:77",
        clientCode: "AB1234",
        symbol: "NIFTY26NOV24500CE",
        segment: "NSEFO",
        product: "NRML",
        side: "sell" as const,
        quantity: 75,
        entryPrice: 150,
        exitPrice: 100,
        openedAt: "2026-11-03T15:00:00+05:30",
        closedAt: "2026-11-04T10:00:00+05:30",
        charges: 40,
        grossPnl: 3750,
        netPnl: 3710,
        fillCount: 2,
    };

    it("fills the trade columns and marks the row as synced", () => {
        expect(toJournalTrade(trip, "user-9")).toEqual({
            user_id: "user-9",
            date: "2026-11-03",
            exit_date: "2026-11-04",
            entry_time: "15:00",
            exit_time: "10:00",
            time_zone: "Asia/Kolkata",
            type: null,
            market: "Options",
            asset: "NIFTY",
            currency: "INR",
            quantity: 75,
            entry_price: 150,
            exit_price: 100,
            brokerage: 40,
            pnl: 3710,
            buy_sell: "sell",
            contract: "NIFTY26NOV24500CE",
            strike_price: 24500,
            option_type: "call",
            days_to_expiry: null, // a monthly contract's symbol doesn't carry the day
            tags: [],
            notes: "",
            source: "xts",
            external_id: "AB1234:NSEFO:NIFTY26NOV24500CE:NRML:77",
        });
    });

    it("never sets a field the customer fills in themselves", () => {
        const row = toJournalTrade(trip, "user-9");
        for (const field of ["strategy", "emotion", "target_price", "stop_loss", "margin"]) expect(row).not.toHaveProperty(field);
    });
});

describe("adapter selection", () => {
    const saved = { sync: process.env.XTS_SYNC_ENABLED, adapter: process.env.XTS_ADAPTER, env: process.env.NODE_ENV };
    afterEach(() => {
        for (const [key, value] of [
            ["XTS_SYNC_ENABLED", saved.sync],
            ["XTS_ADAPTER", saved.adapter],
            ["NODE_ENV", saved.env],
        ] as const) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    });

    it("is off by default", () => {
        delete process.env.XTS_SYNC_ENABLED;
        delete process.env.XTS_ADAPTER;
        expect(brokerSyncEnabled()).toBe(false);
        expect(getBrokerAdapter()).toBeNull();
        expect(brokerSyncAvailable()).toBe(false);
    });

    it("needs both the switch and an adapter", () => {
        process.env.XTS_SYNC_ENABLED = "true";
        delete process.env.XTS_ADAPTER;
        expect(brokerSyncAvailable()).toBe(false); // no real adapter yet

        process.env.XTS_ADAPTER = "mock";
        expect(getBrokerAdapter()?.name).toBe("mock");
        expect(brokerSyncAvailable()).toBe(true);
    });

    it("never offers the sample-data adapter in production", () => {
        process.env.XTS_SYNC_ENABLED = "true";
        process.env.XTS_ADAPTER = "mock";
        process.env.NODE_ENV = "production";
        expect(getBrokerAdapter()).toBeNull();
        expect(brokerSyncAvailable()).toBe(false);
    });
});
