import { describe, it, expect, afterEach, vi } from "vitest";
import { pilotAllows, pilotList } from "./pilot.js";

describe("pilotList", () => {
    it("is none when no trial is set, so sync is open to every Pro customer", () => {
        expect(pilotList({})).toBeNull();
        expect(pilotList({ BROKER_SYNC_PILOT_EMAILS: "" })).toBeNull();
        expect(pilotList({ BROKER_SYNC_PILOT_EMAILS: " , ,  " })).toBeNull();
    });

    it("reads a comma-separated list, tidied and without repeats", () => {
        expect(pilotList({ BROKER_SYNC_PILOT_EMAILS: " Asha@Example.com , ravi@example.com,asha@example.com ,," })).toEqual(["asha@example.com", "ravi@example.com"]);
    });
});

describe("pilotAllows", () => {
    afterEach(() => vi.unstubAllEnvs());
    const trial = { BROKER_SYNC_PILOT_EMAILS: "asha@example.com, Ravi@Example.com" };

    it("lets everyone in when there is no trial", () => {
        expect(pilotAllows("anyone@example.com", {})).toBe(true);
        expect(pilotAllows(null, {})).toBe(true);
        expect(pilotAllows(undefined, {})).toBe(true);
    });

    it("lets in only the people on the list, whatever the case", () => {
        expect(pilotAllows("asha@example.com", trial)).toBe(true);
        expect(pilotAllows("ASHA@EXAMPLE.COM", trial)).toBe(true);
        expect(pilotAllows("  ravi@example.com ", trial)).toBe(true);
        expect(pilotAllows("priya@example.com", trial)).toBe(false);
    });

    it("keeps out an account with no email, and near-misses", () => {
        expect(pilotAllows(null, trial)).toBe(false);
        expect(pilotAllows("", trial)).toBe(false);
        expect(pilotAllows("asha@example.co", trial)).toBe(false);
        expect(pilotAllows("xasha@example.com", trial)).toBe(false);
    });

    it("always lets admins in during a trial, so they can try it", () => {
        expect(pilotAllows("xtincapital@gmail.com", trial)).toBe(true);
        vi.stubEnv("ADMIN_EMAILS", "ops@example.com");
        expect(pilotAllows("OPS@example.com", trial)).toBe(true);
    });
});
