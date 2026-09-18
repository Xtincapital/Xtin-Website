import * as z from "zod/v4";
import { trimStrings } from "../../utils/helper_functions.js";

// `/gini/chat` request body — deliberately minimal (`message` + optional
// `history`). Unlike the original client (which read financial data straight
// out of browser state) and unlike journal/chat's request body (which still
// accepts client-supplied `trades`/`goals`/`client_tier`), this endpoint
// trusts NOTHING else from the client — no `financialData`, no `user_id`, no
// `client_tier`. Everything besides the message/history is derived
// server-side from `req.user.authId` (financialSnapshot.ts, aiProfile.ts,
// planTier.ts). See chat.controller.ts's header for the full rationale.
const historyEntrySchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
});

const chatSchema = z.object({
    message: z.string().min(1, "Message is required").max(4000, "Message must be at most 4000 characters"),
    history: z.array(historyEntrySchema).optional().default([]),
});

export const validateChatRequest = (input: unknown) => {
    const trimmed = trimStrings((input || {}) as Record<string, unknown>);
    const result = chatSchema.safeParse(trimmed);
    if (!result.success) return { errors: result.error.issues.map((i) => i.message), message: "Validation failed" };
    return { data: result.data, message: "Validation successful" };
};
