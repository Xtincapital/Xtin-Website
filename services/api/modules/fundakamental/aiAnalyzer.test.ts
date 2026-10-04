import { describe, it, expect } from "vitest";
import { extractJsonObject, parseAnalysisResponse } from "./aiAnalyzer.js";

const full = {
    company: "Acme", ticker: "ACME", overall_score: 7.5, summary: "ok",
    metrics: { profitability: { score: 8, label: "Strong", details: "good" } },
    key_ratios: [{ name: "ROE", value: "20%" }], strengths: ["a"], red_flags: ["b"],
    investment_assessment: "Hold.",
};

describe("extractJsonObject", () => {
    it("parses plain JSON", () => {
        expect(extractJsonObject(JSON.stringify(full)).company).toBe("Acme");
    });

    it("accepts fenced JSON with or without the json tag, and no trailing newline", () => {
        expect(extractJsonObject("```json\n" + JSON.stringify(full) + "\n```").ticker).toBe("ACME");
        expect(extractJsonObject("```\n" + JSON.stringify(full) + "```").ticker).toBe("ACME");
    });

    it("ignores prose before and after the object", () => {
        const text = `Here is the analysis:\n${JSON.stringify(full)}\nLet me know if you need more.`;
        expect(extractJsonObject(text).overall_score).toBe(7.5);
    });

    it("repairs output that was cut off mid-string", () => {
        const cut = JSON.stringify(full).slice(0, -25); // truncated inside investment_assessment
        const out = extractJsonObject(cut);
        expect(out.company).toBe("Acme");
        expect(Array.isArray(out.strengths)).toBe(true);
    });

    it("repairs output cut off after a key", () => {
        const out = extractJsonObject('{"company":"Acme","ticker":"ACME","summary":');
        expect(out.company).toBe("Acme");
    });

    it("throws when there is no JSON at all", () => {
        expect(() => extractJsonObject("Sorry, I cannot help with that.")).toThrow("Failed to parse AI response as JSON");
    });
});

describe("parseAnalysisResponse", () => {
    it("reports a missing required field", () => {
        const { investment_assessment, ...rest } = full;
        expect(() => parseAnalysisResponse(JSON.stringify(rest))).toThrow("Missing required field: investment_assessment");
    });
});
