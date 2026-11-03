import * as z from "zod/v4";
import { trimStrings } from "../../../utils/helper_functions.js";

const linkSchema = z.object({
    // Broker client codes are short alphanumeric ids; stored upper-case so the same code can't be linked twice by changing its case.
    client_code: z
        .string("Client code is required")
        .min(3, "Client code is too short")
        .max(30, "Client code is too long")
        .regex(/^[A-Za-z0-9_-]+$/, "Client code can only contain letters, numbers, - and _")
        .transform((s) => s.toUpperCase()),
    consent: z.literal(true, "Please confirm your consent to link your account"),
    consent_version: z.string("Consent version is required"),
});

const consentSchema = z.object({
    consent: z.literal(true, "Please confirm your consent"),
    consent_version: z.string("Consent version is required"),
});

export const validateConsent = (input: unknown) => {
    const result = consentSchema.safeParse(trimStrings((input || {}) as Record<string, unknown>));
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};

export const validateLink = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = linkSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
