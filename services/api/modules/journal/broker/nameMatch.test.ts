import { describe, it, expect } from "vitest";
import { compareNames } from "./nameMatch.js";

describe("compareNames", () => {
    it("matches the same name whatever the order, case or punctuation", () => {
        expect(compareNames("Suraj Nandan", "SURAJ NANDAN")).toBe("match");
        expect(compareNames("Suraj Nandan", "Nandan, Suraj")).toBe("match");
        expect(compareNames("Mr. Suraj  Nandan", "suraj nandan")).toBe("match");
    });

    it("matches when one side has a middle or extra name", () => {
        expect(compareNames("Suraj Nandan", "Suraj Kumar Nandan")).toBe("match");
        expect(compareNames("Suraj Kumar Nandan", "Suraj Nandan")).toBe("match");
    });

    it("says partial when only some words are shared", () => {
        expect(compareNames("Suraj Nandan", "Suraj Kumar")).toBe("partial");
        expect(compareNames("Asha Verma", "Asha Rao Verma Singh")).toBe("match");
        expect(compareNames("Asha Verma Rao", "Asha Singh Iyer")).toBe("partial");
    });

    it("says mismatch when nothing is shared", () => {
        expect(compareNames("Suraj Nandan", "Priya Menon")).toBe("mismatch");
    });

    it("ignores single-letter initials, which can't tell people apart", () => {
        expect(compareNames("S Nandan", "R Nandan")).toBe("match"); // only "nandan" counts
        expect(compareNames("S K", "S K")).toBe("unknown"); // nothing but initials
    });

    it("handles accents", () => {
        expect(compareNames("José García", "jose garcia")).toBe("match");
    });

    it("is unknown when either side has no name", () => {
        expect(compareNames("Suraj Nandan", null)).toBe("unknown");
        expect(compareNames(undefined, "Suraj Nandan")).toBe("unknown");
        expect(compareNames("", " ")).toBe("unknown");
        expect(compareNames("1234", "Suraj")).toBe("unknown");
    });
});
