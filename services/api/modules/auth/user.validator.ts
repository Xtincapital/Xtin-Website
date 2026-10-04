import * as z from "zod/v4";
import { REGEX } from "../../constants/constants.js";

/**
 * Server-side validation for the auth routes. This runs regardless of any
 * checks the frontend does, so it's the one we rely on.
 *
 * - Names are SANITIZED, then validated: HTML/script content is removed
 *   and only letters, marks, spaces, apostrophes, hyphens and periods are
 *   kept (so "O'Brien" and "Jean-Luc" survive). A name that's empty
 *   after sanitizing fails the length check.
 * - Email and password are VALIDATED STRICTLY but never rewritten.
 *   Stripping characters from either one could quietly turn a bad input
 *   into someone else's email address or a different password, so bad
 *   input is rejected instead.
 * - Failures give the client one generic message (GENERIC_ERROR). The
 *   specific issues are only returned to the caller (the controller) so
 *   they can be logged on the server.
 */

const GENERIC_ERROR = "Invalid request. Please check your details and try again.";

// Supabase Auth hashes passwords with bcrypt, which only uses the first
// 72 bytes, and signups over 72 are rejected.
const PASSWORD_MAX = 72;
const EMAIL_MAX = 254; // RFC 5321 path limit
const NAME_MIN = 2;
const NAME_MAX = 100;

// Control characters, plus zero-width and bidi-override characters that
// can be used to fake what a string looks like on screen.
// eslint-disable-next-line no-control-regex -- stripping control chars is the point
const INVISIBLE_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;
// Separate non-global copy for .test(): a /g regex remembers lastIndex
// between calls and would give alternating results.
// eslint-disable-next-line no-control-regex
const HAS_INVISIBLE_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/;

const stripHtml = (value: string): string =>
	value
		// Drop script/style blocks along with what's inside them.
		.replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
		// Drop any remaining tags, including unclosed ones like "<img src=x onerror=..."
		.replace(/<[^>]*>?/g, "");

const sanitizeName = (value: string): string =>
	stripHtml(value.normalize("NFKC"))
		.replace(INVISIBLE_CHARS, "")
		// Whitelist: Unicode letters/marks, space, apostrophe, hyphen, period.
		.replace(/[^\p{L}\p{M} '.-]/gu, "")
		.replace(/\s+/g, " ")
		.trim();

const nameField = z
	.string()
	.max(1000) // limit on the raw input, so huge payloads aren't sanitized
	.transform(sanitizeName)
	.pipe(z.string().min(NAME_MIN).max(NAME_MAX));

const emailField = z
	.string()
	.trim()
	.max(EMAIL_MAX)
	.pipe(z.email())
	// z.email() still allows a few characters (like ' and +) that the stricter
	// project-wide REGEX.EMAIL doesn't, so require both.
	.refine((val) => REGEX.EMAIL.test(val))
	.transform((val) => val.toLowerCase());

const phoneField = z
	.string()
	.max(32)
	.optional()
	.nullable()
	// Allow common formatting like "98765 43210" or "98765-43210"; anything
	// else that isn't a digit fails the regex below.
	.transform((val) => (val ? val.replace(/[\s()-]/g, "") : undefined))
	.refine((val) => !val || REGEX.PHONE.test(val));

const UserSignupSchema = z.object({
	first_name: nameField,
	last_name: nameField,
	email: emailField,
	phone_number: phoneField,
	password: z
		.string()
		.min(8)
		.max(PASSWORD_MAX)
		.regex(REGEX.PASSWORD)
		.refine((val) => !HAS_INVISIBLE_CHARS.test(val)),
});

// Login only checks shape and bounds, not the signup complexity rule:
// accounts created before that rule existed must still be able to sign in.
const UserLoginSchema = z.object({
	email: emailField,
	password: z.string().min(1).max(PASSWORD_MAX),
});

type ValidationIssue = { path: string; code: string };

// Flat shape rather than a discriminated union: this package compiles
// without strictNullChecks, which stops `if (!result.ok)` from narrowing.
type ValidationResult<T> = {
	ok: boolean;
	data?: T;
	message?: string; // generic, safe to return to the client
	issues: ValidationIssue[]; // for server logs only
	sanitizedFields: string[];
};

// Fields whose value was changed by sanitizing (not just trimmed). A tag
// or script in a name field is worth knowing about for monitoring, even
// when the cleaned-up value is accepted.
const NAME_FIELDS = ["first_name", "last_name"] as const;
const detectSanitized = (raw: unknown, data: Record<string, unknown>): string[] => {
	if (!raw || typeof raw !== "object") return [];
	const input = raw as Record<string, unknown>;
	return NAME_FIELDS.filter(
		(f) => typeof input[f] === "string" && (input[f] as string).trim() !== data[f]
	);
};

const runSchema = <T extends Record<string, unknown>>(
	schema: z.ZodType<T>,
	input: unknown
): ValidationResult<T> => {
	const result = schema.safeParse(input ?? {});
	if (!result.success) {
		return {
			ok: false,
			message: GENERIC_ERROR,
			sanitizedFields: [],
			// Only the field path and error code — never the value — so
			// passwords and emails don't end up in logs.
			issues: result.error.issues.map((issue) => ({
				path: issue.path.join(".") || "(root)",
				code: issue.code,
			})),
		};
	}
	return { ok: true, data: result.data, issues: [], sanitizedFields: detectSanitized(input, result.data) };
};

const validateUserSignup = (input: unknown) => runSchema(UserSignupSchema, input);
const validateUserLogin = (input: unknown) => runSchema(UserLoginSchema, input);

export { validateUserSignup, validateUserLogin, sanitizeName, GENERIC_ERROR };
export type { ValidationIssue };
