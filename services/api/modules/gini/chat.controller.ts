// Gini AI Chat — `POST /gini/chat`. Node/TS port + REAL server-side
// enforcement of features-incoming/gini/gini-ai-engine.js's
// `GiniAIEngine.processMessage` (~lines 1127-1191) and its Vercel proxy
// `features-incoming/gini/api/chat.js`.
//
// ═══════════════════════════════════════════════════════════════════════
// WHAT WAS BROKEN IN THE ORIGINAL, AND EXACTLY WHAT THIS FIXES
// ═══════════════════════════════════════════════════════════════════════
// `api/chat.js` (128 lines, read in full) is a completely unauthenticated,
// ungated Claude proxy: no auth check of any kind, no user identification,
// no server-side token/wallet accounting whatsoever. It accepts any
// `{ messages, maxOutputTokens }` POST body from anyone and forwards it
// straight to Claude using the server's own API key. ALL "wallet"
// enforcement in the original — `CHAT_LIMITS.trialTokens`, `tokenBalance`,
// `paywallLocked` (app.js ~7-123) — lives entirely in client-side
// `localStorage`, trivially bypassed by calling `/api/chat` directly (or
// editing localStorage) with zero cost consequence to the caller.
//
// This endpoint instead:
//   1. Requires `authenticate` (see chat.routes.ts) — every call is tied to
//      a real `req.user.authId`.
//   2. Checks a REAL server-side balance in `gini_ai_wallets`
//      (aiWallet.repository.ts, backed by
//      database/migrations/0006_gini_normalized_schema.sql) BEFORE calling
//      Claude — `ensureTokens` below, not a client-reported number.
//   3. Deducts the REAL usage Anthropic's own API response reports
//      (`generateAIWithUsage`'s `usage.inputTokens + usage.outputTokens`,
//      services/api/modules/ai/providers.ts) AFTER the call — never a
//      client-supplied or estimated token count.
// A user cannot spend tokens they don't have, cannot report a fake token
// balance, and cannot call this endpoint at all without a valid session —
// none of which was true of the original.
//
// ═══════════════════════════════════════════════════════════════════════
// DATA FLOW
// ═══════════════════════════════════════════════════════════════════════
// The original's `gatherFinancialData()` read live browser state
// (`appState`/DOM). This endpoint instead fetches the SAME data straight
// from the Phase 10a tables via `gatherFinancialSnapshot` (financialSnapshot.ts)
// — the request body carries no `financialData` field at all, so a user
// cannot fabricate their net worth/goals/family to manipulate the advisor's
// answers.
import { generateAIWithUsage } from "../ai/providers.js";
import { validateChatRequest } from "./chat.validator.js";
import { gatherFinancialSnapshot } from "./financialSnapshot.js";
import { loadProfile, saveProfile, updateFromFinancialData, updateKnowledgeLevel } from "./aiProfile.js";
import { classify, detectEmotionalContext } from "./intentClassifier.js";
import { generateInsights } from "./insightsEngine.js";
import { buildLeanSystemPrompt, formatResponse, addStructure } from "./chatPrompt.js";
import { ensureTokens, deductTokens, InsufficientAiTokensError } from "./aiWallet.repository.js";
import { getGiniPlanTier } from "./planTier.js";

// Response budgets by plan tier — port of app.js's `CHAT_LIMITS.freeMaxOutputTokens`
// (180) / `proMaxOutputTokens` (420), which `getChatMaxOutputTokens()` fed
// into `processMessage`'s `callAI` as `maxOutputTokens`.
const FREE_MAX_OUTPUT_TOKENS = 180;
const PRO_MAX_OUTPUT_TOKENS = 420;

// How much conversation history to keep — port of `processMessage`'s
// `historyDepth = isPro ? 10 : 6` (~line 1166).
const FREE_HISTORY_DEPTH = 6;
const PRO_HISTORY_DEPTH = 10;

/**
 * Minimum wallet balance required before calling Claude. The original had
 * no real per-call floor (client-side `paywallLocked` just checked
 * `tokenBalance <= 0`); this adapts Journal's `ensureAiTokens(userId, 800)`
 * fixed-floor pattern (aiWallet.repository.ts's `ensureTokens`) to Gini's
 * own (smaller) reply budgets — `maxTokens` covers the worst-case OUTPUT
 * cost, plus a fixed allowance for the lean system prompt + history INPUT
 * tokens (typically a few hundred tokens; 500 is a safe upper estimate for
 * this endpoint's compact prompt).
 */
function minimumTokensFor(maxTokens: number): number {
    return maxTokens + 500;
}

/* POST /gini/chat */
export const chatWithGini = async (req, res) => {
    const validation = validateChatRequest(req.body);
    if (validation.errors) {
        return res.status(400).json({ error: validation.message, details: validation.errors });
    }
    const { message, history } = validation.data;
    const userId = req.user.authId;

    try {
        // 1. Plan tier — server-authoritative (gini_pro_plans), never
        // client-reported (see planTier.ts header).
        const tier = await getGiniPlanTier(userId);
        const isPro = tier === "pro";
        const maxOutputTokens = isPro ? PRO_MAX_OUTPUT_TOKENS : FREE_MAX_OUTPUT_TOKENS;
        const historyDepth = isPro ? PRO_HISTORY_DEPTH : FREE_HISTORY_DEPTH;

        // 2. Gate on real wallet balance BEFORE spending anything on Claude.
        await ensureTokens(userId, minimumTokensFor(maxOutputTokens));

        // 3. Load persistent AI profile (gini_user_data.ai_profile) and the
        // server-fetched financial snapshot (Phase 10a tables) — port of
        // processMessage's steps 1-3.
        let profile = await loadProfile(userId);
        const financialData = await gatherFinancialSnapshot(userId);
        profile = updateFromFinancialData(profile, financialData);

        // 4. Classify intent + emotional tone — port of processMessage's step 4.
        const intent = classify(message);
        const emotionalContext = detectEmotionalContext(message);

        // 5. Generate insights — port of processMessage's step 5.
        const insights = generateInsights(financialData, profile);

        // 6-7. Build the lean system prompt — port of processMessage's steps 6-7.
        const systemPrompt = buildLeanSystemPrompt(profile, financialData, insights, intent, emotionalContext, isPro);

        // 8. Build message array with tier-appropriate history depth — port
        // of processMessage's step 8. Unlike the original (which put the
        // system prompt as a `role: 'system'` entry inside the `messages`
        // array for its own proxy's `normalizeClaudeMessages` to peel back
        // out), `generateAIWithUsage` takes a dedicated `system` param
        // matching the real Anthropic Messages API shape directly.
        const trimmedHistory = (history || []).slice(-historyDepth).map((h) => ({ role: h.role, content: h.content }));
        const messages = [...trimmedHistory, { role: "user" as const, content: message }];

        // 9. Call Claude via the shared provider, get REAL usage back.
        const { text, usage } = await generateAIWithUsage({
            system: systemPrompt,
            messages,
            maxTokens: maxOutputTokens,
            temperature: 0.35,
        });
        const tokensUsed = usage.inputTokens + usage.outputTokens;

        // 10. Format response — port of processMessage's step 10.
        const formatted = formatResponse(text || "Sorry, I could not generate a response. Please try again.");
        const structured = addStructure(formatted);

        // 11. Update profile with this interaction and persist it.
        profile = updateKnowledgeLevel(profile, message);
        await saveProfile(userId, profile);

        // Deduct REAL usage from the wallet only after a successful call.
        const wallet = await deductTokens(userId, tokensUsed);

        return res.status(200).json({
            reply: structured,
            tokens_used: tokensUsed,
            token_balance: wallet.token_balance,
        });
    } catch (err) {
        if (err instanceof InsufficientAiTokensError) {
            return res.status(402).json({ error: err.message, token_balance: err.tokenBalance });
        }
        console.error("[Gini] chat failed:", (err as Error)?.message || err);
        return res.status(500).json({ error: `Error generating chat reply: ${(err as Error)?.message || err}` });
    }
};
