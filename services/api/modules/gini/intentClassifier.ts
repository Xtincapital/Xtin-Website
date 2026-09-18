// Server-side port of features-incoming/gini/gini-ai-engine.js's
// `GiniIntentClassifier` (~lines 451-606) — classifies the user's message
// intent and emotional tone from the message text.
//
// `classify` and `detectEmotionalContext` are pure text-analysis functions,
// ported faithfully (same keyword/priority tables, same scoring). `patterns`
// also drives `_getResponseLength` in the original's non-lean
// `buildSystemPrompt` (not used by `processMessage`, see chatPrompt.ts) and
// intent-name display in the lean prompt (`Intent: ${intent.primary.intent}`),
// which this port reproduces in chatPrompt.ts.
//
// `detectToolContext` (~lines 585-605) is intentionally NOT ported — it reads
// `document.querySelector('.tab-content.active')`, i.e. which browser tab is
// currently open client-side. There is no server-side equivalent (the
// request body carries no "current tab" field), and nothing downstream
// (buildSystemPrompt/processMessage) actually uses its return value in the
// lean prompt path this port follows.

interface IntentPattern {
    keywords: string[];
    priority: number;
}

const PATTERNS: Record<string, IntentPattern> = {
    overview: {
        keywords: ["overview", "summary", "how am i doing", "my situation", "status", "dashboard", "snapshot"],
        priority: 1,
    },
    health_check: {
        keywords: ["am i on track", "health", "score", "doing well", "okay", "fine", "good shape"],
        priority: 1,
    },
    goal_analysis: {
        keywords: ["goals", "targets", "objectives", "planning for", "save for", "saving for"],
        priority: 2,
    },
    goal_feasibility: {
        keywords: ["realistic", "achievable", "possible", "can i afford", "afford this", "feasible"],
        priority: 2,
    },
    portfolio_review: {
        keywords: ["portfolio", "investments", "allocation", "diversification", "holdings"],
        priority: 2,
    },
    risk_assessment: {
        keywords: ["risk", "risky", "safe", "conservative", "aggressive", "volatility"],
        priority: 2,
    },
    monte_carlo: {
        keywords: ["monte carlo", "simulation", "probability", "chances", "likelihood"],
        priority: 3,
    },
    required_return: {
        keywords: ["required return", "need return", "return needed", "what return"],
        priority: 3,
    },
    sip_calculation: {
        keywords: ["sip", "monthly investment", "how much to invest", "monthly saving"],
        priority: 3,
    },
    family_planning: {
        keywords: ["family", "dependents", "children", "spouse", "education", "marriage"],
        priority: 2,
    },
    retirement: {
        keywords: ["retirement", "retire", "pension", "corpus", "post-retirement"],
        priority: 2,
    },
    debt_analysis: {
        keywords: ["debt", "loan", "emi", "liability", "repayment", "interest"],
        priority: 2,
    },
    what_to_do: {
        keywords: ["what should i", "recommend", "suggest", "advice", "next step", "priority"],
        priority: 1,
    },
    fix_issues: {
        keywords: ["fix", "improve", "optimize", "problem", "issue", "wrong", "mistake"],
        priority: 1,
    },
    scenario: {
        keywords: ["what if", "scenario", "compare", "alternative", "option"],
        priority: 3,
    },
    explanation: {
        keywords: ["what is", "explain", "how does", "meaning", "define", "tell me about"],
        priority: 4,
    },
};

export interface IntentMatch {
    intent: string;
    confidence: number;
    priority: number;
    matchedKeywords: string[];
}

export interface IntentClassification {
    primary: IntentMatch;
    secondary: IntentMatch[];
    allMatches: IntentMatch[];
}

/** Port of `GiniIntentClassifier.classify`. */
export function classify(query: string): IntentClassification {
    const queryLower = query.toLowerCase();
    const matches: IntentMatch[] = [];

    for (const [intent, config] of Object.entries(PATTERNS)) {
        const matchedKeywords = config.keywords.filter((kw) => queryLower.includes(kw));
        if (matchedKeywords.length > 0) {
            matches.push({
                intent,
                confidence: matchedKeywords.length / config.keywords.length,
                priority: config.priority,
                matchedKeywords,
            });
        }
    }

    matches.sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return a.priority - b.priority;
    });

    return {
        primary: matches[0] || { intent: "general", confidence: 0.5, priority: 5, matchedKeywords: [] },
        secondary: matches.slice(1, 3),
        allMatches: matches,
    };
}

export type EmotionalContext = "anxious" | "confused" | "frustrated" | "curious" | "neutral";

/** Port of `GiniIntentClassifier.detectEmotionalContext`. */
export function detectEmotionalContext(query: string): EmotionalContext {
    const anxiousPatterns = ["worried", "concerned", "scared", "anxious", "nervous", "stress", "panic"];
    const confusedPatterns = ["confused", "don't understand", "lost", "overwhelmed", "complicated"];
    const curiousPatterns = ["curious", "interested", "wondering", "want to know", "tell me"];
    const frustratedPatterns = ["frustrated", "annoyed", "not working", "wrong", "stupid"];

    const queryLower = query.toLowerCase();

    if (anxiousPatterns.some((p) => queryLower.includes(p))) return "anxious";
    if (confusedPatterns.some((p) => queryLower.includes(p))) return "confused";
    if (frustratedPatterns.some((p) => queryLower.includes(p))) return "frustrated";
    if (curiousPatterns.some((p) => queryLower.includes(p))) return "curious";

    return "neutral";
}
