import { describe, it, expect } from "vitest";
import {
	validateUserSignup,
	validateUserLogin,
	sanitizeName,
	GENERIC_ERROR,
} from "./user.validator.js";

const validSignup = {
	first_name: "Asha",
	last_name: "Rao",
	email: "Asha.Rao@Example.com",
	phone_number: "9876543210",
	password: "Str0ng!pass",
};

describe("sanitizeName", () => {
	it("removes script blocks along with their contents", () => {
		expect(sanitizeName("<script>alert(1)</script>Asha")).toBe("Asha");
	});
	it("removes tags and unclosed tags", () => {
		expect(sanitizeName("<b>Asha</b>")).toBe("Asha");
		expect(sanitizeName("Asha<img src=x onerror=alert(1)")).toBe("Asha");
	});
	it("keeps real-world name punctuation and non-Latin letters", () => {
		expect(sanitizeName("O'Brien")).toBe("O'Brien");
		expect(sanitizeName("Jean-Luc St. Pierre")).toBe("Jean-Luc St. Pierre");
		expect(sanitizeName("आशा")).toBe("आशा");
	});
	it("strips special characters, digits and zero-width chars, collapses spaces", () => {
		expect(sanitizeName("  As$h%a  {R}  ")).toBe("Asha R");
		expect(sanitizeName("As​ha1")).toBe("Asha");
	});
});

describe("validateUserSignup", () => {
	it("accepts a valid payload and normalises email", () => {
		const r = validateUserSignup(validSignup);
		expect(r.ok).toBe(true);
		expect(r.data.email).toBe("asha.rao@example.com");
		expect(r.sanitizedFields).toEqual([]);
	});

	it("accepts a name with HTML in it, cleans it, and reports it as sanitized", () => {
		const r = validateUserSignup({ ...validSignup, first_name: "<i>Asha</i>" });
		expect(r.ok).toBe(true);
		expect(r.data.first_name).toBe("Asha");
		expect(r.sanitizedFields).toEqual(["first_name"]);
	});

	it("rejects a name that is only markup", () => {
		const r = validateUserSignup({ ...validSignup, last_name: "<script>x</script>" });
		expect(r.ok).toBe(false);
	});

	it.each([
		["bad email", { email: "not-an-email" }],
		["html in email", { email: "<b>a</b>@x.com" }],
		["weak password", { password: "password" }],
		["oversized password", { password: "Aa1!" + "x".repeat(80) }],
		["bad phone", { phone_number: "0123456789" }],
		["missing field", { first_name: undefined }],
		["wrong type", { email: 42 }],
	])("rejects %s with the generic message only", (_label, patch) => {
		const r = validateUserSignup({ ...validSignup, ...patch });
		expect(r.ok).toBe(false);
		expect(r.message).toBe(GENERIC_ERROR);
		expect(r.issues.length).toBeGreaterThan(0);
	});

	it("never puts submitted values in the issues it reports", () => {
		const r = validateUserSignup({ ...validSignup, password: "secretvalue" });
		expect(JSON.stringify(r.issues)).not.toContain("secretvalue");
	});

	it("treats blank/null phone as absent and accepts formatted numbers", () => {
		expect(validateUserSignup({ ...validSignup, phone_number: "" }).data.phone_number).toBeUndefined();
		expect(validateUserSignup({ ...validSignup, phone_number: null }).ok).toBe(true);
		expect(validateUserSignup({ ...validSignup, phone_number: "98765 43210" }).data.phone_number).toBe("9876543210");
	});

	it("handles a missing or non-object body", () => {
		expect(validateUserSignup(undefined).ok).toBe(false);
		expect(validateUserSignup("x").ok).toBe(false);
	});

	it("gives the same result when called repeatedly (no stateful regex)", () => {
		const results = [1, 2, 3].map(() => validateUserSignup(validSignup).ok);
		expect(results).toEqual([true, true, true]);
	});
});

describe("validateUserLogin", () => {
	it("accepts any non-empty password (no complexity rule at login)", () => {
		const r = validateUserLogin({ email: "a@b.co", password: "x" });
		expect(r.ok).toBe(true);
	});
	it("rejects empty password and bad email generically", () => {
		for (const body of [{ email: "a@b.co", password: "" }, { email: "nope", password: "x" }]) {
			const r = validateUserLogin(body);
			expect(r.ok).toBe(false);
			expect(r.message).toBe(GENERIC_ERROR);
		}
	});
});
