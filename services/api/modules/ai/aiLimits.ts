// Caps on the public AI endpoints (/api/ai/*).
//
// The landing-page chat widget calls POST /api/ai/chat with no login, by
// design, so the protection is a rate limit rather than authentication:
//
//   • per visitor — a burst cap per minute plus a sustained cap per hour, keyed
//     on the real client address (behind Render/Cloudflare `req.ip` is the
//     proxy, so every visitor would share one bucket — see clientIp()).
//   • across everyone — a daily ceiling. The per-visitor limit can be dodged by
//     sending a different X-Forwarded-For, so this is what keeps the AI bill
//     from running away.
//   • message length — chat questions are short; a huge one is only ever a
//     way to spend tokens.
import { clientIp, rateLimit } from "../backtest/rateLimit.js";

const int = (name: string, fallback: number) => {
    const v = Number(process.env[name]);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
};

export interface AiLimitConfig {
    chatPerMinute: number;
    chatPerHour: number;
    /** /ai/gemini and /ai/analyze — nothing in this repo calls them, so they get a tighter cap. */
    otherPerMinute: number;
    otherPerHour: number;
    globalPerDay: number;
    maxMessageChars: number;
}

export const readAiLimitConfig = (): AiLimitConfig => ({
    chatPerMinute: int("AI_CHAT_PER_MINUTE", 8),
    chatPerHour: int("AI_CHAT_PER_HOUR", 60),
    otherPerMinute: int("AI_OTHER_PER_MINUTE", 4),
    otherPerHour: int("AI_OTHER_PER_HOUR", 20),
    globalPerDay: int("AI_GLOBAL_PER_DAY", 2000),
    maxMessageChars: int("AI_CHAT_MAX_CHARS", 1000),
});

export function createAiLimits(cfg: AiLimitConfig = readAiLimitConfig()) {
    let day = "";
    let used = 0;

    /** Shared by every AI endpoint: stops the whole site's anonymous AI use at a daily ceiling. */
    const dailyCeiling = (_req, res, next) => {
        const today = new Date().toISOString().slice(0, 10);
        if (day !== today) {
            day = today;
            used = 0;
        }
        if (used >= cfg.globalPerDay) {
            return res.status(429).json({
                error: "The assistant is very busy right now. Please try again a little later.",
                code: "AI_BUSY",
            });
        }
        used += 1;
        next();
    };

    const checkChatInput = (req, res, next) => {
        const text = req.body?.text || req.body?.message;
        if (typeof text === "string" && text.length > cfg.maxMessageChars) {
            return res.status(400).json({
                error: `Message is too long (max ${cfg.maxMessageChars} characters).`,
                code: "MESSAGE_TOO_LONG",
            });
        }
        next();
    };

    return {
        /** POST /ai/chat */
        chat: [
            checkChatInput,
            rateLimit("ai-chat", [{ limit: cfg.chatPerMinute, seconds: 60 }, { limit: cfg.chatPerHour, seconds: 3600 }], "chatting", clientIp),
            dailyCeiling,
        ],
        /** POST /ai/gemini, POST /ai/analyze */
        other: [
            rateLimit("ai-other", [{ limit: cfg.otherPerMinute, seconds: 60 }, { limit: cfg.otherPerHour, seconds: 3600 }], "using the assistant", clientIp),
            dailyCeiling,
        ],
    };
}

export const aiLimits = createAiLimits();
