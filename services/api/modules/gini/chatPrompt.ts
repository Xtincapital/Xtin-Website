// Server-side port of two pieces of features-incoming/gini/gini-ai-engine.js:
//  - `GiniAIEngine._buildLeanSystemPrompt` (~lines 1220-1308) — the prompt
//    builder `processMessage` (~1127-1191) actually calls, NOT the longer
//    `GiniPromptBuilder.buildSystemPrompt` (~822-900, unused by the real
//    request flow) — ported word-for-word where reasonable, including
//    `_formatINR` (~1211-1218).
//  - `GiniResponseFormatter.format`/`addStructure` (~1059-1111) — ported
//    faithfully, verbatim regex/logic.
//
// Region adaptation: the original reads `window.XtinRegion.getRegionConfig()`
// to localize currency symbol/number words/jargon per visitor country, with
// a hardcoded-India fallback when that global isn't present. There is no
// server-side equivalent of that client geo/preference state, and the
// `/gini/chat` request body (`{ message, history }`) carries no region
// field, so this port always takes the original's own fallback branch:
// India / ₹ / lakh-crore / SIP / PPF-ELSS / EPF-NPS / term insurance —
// consistent with the rest of Gini's backend (`gini_pro_plans.currency`
// defaults to 'INR', journal's chat prompt hardcodes ₹ too).
import type { GiniProfile } from "./aiProfile.js";
import type { GiniFinancialSnapshot } from "./aiProfile.js";
import type { GiniInsights } from "./insightsEngine.js";
import type { IntentClassification, EmotionalContext } from "./intentClassifier.js";

/** Port of `GiniAIEngine._formatINR` (India-only branch — see file header). */
function formatINR(value: number | undefined): string {
    const n = Number(value) || 0;
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Port of `GiniAIEngine._buildLeanSystemPrompt`. */
export function buildLeanSystemPrompt(
    profile: GiniProfile,
    data: GiniFinancialSnapshot,
    insights: GiniInsights,
    intent: IntentClassification,
    emotionalContext: EmotionalContext,
    isPro: boolean
): string {
    const profileLine = [
        `knowledge=${profile.knowledgeLevel.level}`,
        `lifeStage=${profile.lifeStage.stage}`,
        `risk=${profile.riskProfile.tolerance}`,
        `tone=${emotionalContext}`,
        `health=${profile.healthSnapshot.overallScore ?? "unknown"}/100`,
    ].join(", ");

    // Region fallback (see file header): India / ₹ / lakh-crore / SIP /
    // PPF-ELSS / EPF-NPS / term insurance.
    const regionName = "India";
    const contextBits = "₹, lakh/crore, SIP, PPF/ELSS, term insurance";

    const lines: string[] = [
        `You are Gini, a warm, experienced personal financial advisor sitting across the table from a family in ${regionName}. You know their finances intimately from the data below.`,
        "HOW TO SPEAK:",
        `- Talk like a trusted human advisor, not a chatbot: natural sentences, plain language, local context (${contextBits}).`,
        "- Refer to family members BY NAME when relevant (e.g. \"for Kiaan's education\", \"when Asha retires\").",
        "- Ground every answer in their actual numbers from the data below. NEVER invent figures. If something is missing, say exactly what to add in the app and why it matters.",
        "- Acknowledge feelings first when the user sounds worried or excited, then guide with numbers.",
        "- Match explanation depth to their knowledge level; define any jargon in one short phrase for beginners.",
        isPro
            ? "- LENGTH: 2 to 5 short sentences (up to ~120 words). Explain the reasoning briefly, then end with ONE clear next action. Plain text only, no markdown, no lists."
            : "- LENGTH: 1 to 2 short sentences (under ~55 words). Lead with the single most important insight and next action. Plain text only, no markdown, no lists.",
        `User profile: ${profileLine}.`,
        `Intent: ${intent.primary.intent}.`,
        isPro
            ? "Plan: Gini Pro (all modules available: Monte Carlo, Required Return, Family Planning, PDF reports)."
            : "Plan: Free (Monte Carlo, Required Return, Family Planning and PDF reports are Pro modules — if one would clearly answer their question, mention it honestly, never pushily).",
    ];

    const members = data.family?.members || [];
    if (members.length > 0) {
        const memberLine = members
            .slice(0, 8)
            .map((m) => `${m.name} (${m.relationship}, ${m.age}y${m.isEarner ? `, earns ${formatINR(m.income)}/mo` : m.isDependent ? ", dependent" : ""})`)
            .join("; ");
        lines.push(`Family: ${memberLine}.`);
    }

    lines.push(
        `Net worth: total ${formatINR(data.netWorth.total)}, assets ${formatINR(data.netWorth.totalAssets)}, liabilities ${formatINR(data.netWorth.totalLiabilities)}, debt ratio ${(data.netWorth.debtToAssetRatio || 0).toFixed(1)}%.`
    );

    if (data.goals.count > 0) {
        const goals = data.goals.items
            .slice(0, 4)
            .map((g) => `${g.name}: gap ${formatINR(g.gap)}, SIP ${formatINR(g.requiredMonthlySIP)}/mo, ${g.yearsLeft}y`)
            .join("; ");
        lines.push(`Goals: ${data.goals.count} active, total SIP needed ${formatINR(data.goals.totalMonthlySIPNeeded)}/mo. ${goals}.`);
    } else {
        lines.push("Goals: none entered.");
    }

    if (data.portfolio.totalValue > 0) {
        const allocations = data.portfolio.allocations
            .slice(0, 5)
            .map((a) => `${a.type} ${(a.allocation || 0).toFixed(0)}%`)
            .join(", ");
        lines.push(`Portfolio: ${formatINR(data.portfolio.totalValue)}, expected return ${(data.portfolio.weightedReturn || 0).toFixed(1)}%, risk ${data.portfolio.riskLevel}, allocation ${allocations}.`);
    }

    if (data.monteCarlo.hasResults) {
        lines.push(`Monte Carlo: success ${(data.monteCarlo.probability || 0).toFixed(0)}%, target ${formatINR(data.monteCarlo.target)}, median ${formatINR(data.monteCarlo.median)}.`);
    }

    if (data.requiredReturn.hasResults) {
        lines.push(`Required return: ${(data.requiredReturn.requiredRate || 0).toFixed(1)}%, verdict ${data.requiredReturn.verdict || "not set"}.`);
    }

    if (profile.keyFacts.householdIncome > 0) {
        lines.push(`Family: income ${formatINR(profile.keyFacts.householdIncome)}/mo, dependents ${profile.keyFacts.dependentCount}.`);
    }

    const priorities = insights.nextActions?.slice(0, 3).map((a) => a.action).join("; ");
    const warnings = [...(insights.critical || []), ...(insights.warnings || [])].slice(0, 3).map((i) => i.message).join("; ");
    if (warnings) lines.push(`Warnings: ${warnings}.`);
    if (priorities) lines.push(`Priorities: ${priorities}.`);

    return lines.join("\n");
}

/** Port of `GiniResponseFormatter.format`. */
export function formatResponse(rawResponse: string): string {
    let formatted = rawResponse;

    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "$1");
    formatted = formatted.replace(/\*([^*]+)\*/g, "$1");
    formatted = formatted.replace(/`([^`]+)`/g, "$1");
    formatted = formatted.replace(/^#+\s*/gm, "");

    formatted = formatted.replace(/^\d+\)\s*(Direct Answer|Key Insight|Specific Numbers|Next Step|Summary|Conclusion):\s*/gim, "");
    formatted = formatted.replace(/^(Direct Answer|Key Insight|Specific Numbers|Next Step|Summary|Conclusion):\s*/gim, "");

    formatted = formatted.replace(/^[-•]\s*/gm, "→ ");

    formatted = formatted.replace(/^\d+[.)]\s+/gm, "• ");

    formatted = formatted.replace(/\n{3,}/g, "\n\n");

    formatted = formatted
        .split("\n")
        .map((line) => line.trim())
        .join("\n");

    return formatted.trim();
}

/** Port of `GiniResponseFormatter.addStructure`. `intent` is accepted for
 * signature parity with the source (unused there too). */
export function addStructure(response: string): string {
    if (response.includes("1)") || response.includes("•")) {
        return response;
    }

    if (response.length > 300) {
        const sentences = response.split(/(?<=[.!?])\s+/);
        if (sentences.length > 4) {
            const paragraphs: string[] = [];
            for (let i = 0; i < sentences.length; i += 3) {
                paragraphs.push(sentences.slice(i, i + 3).join(" "));
            }
            return paragraphs.join("\n\n");
        }
    }

    return response;
}
