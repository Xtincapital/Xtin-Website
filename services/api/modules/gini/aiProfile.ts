// Server-side port of features-incoming/gini/gini-ai-engine.js's
// `GiniUserProfile` (~lines 54-445) — builds and evolves a financial-planning
// profile (life stage, risk tolerance, time horizon, a 0-100 health snapshot
// score, a knowledge level that adapts as the user asks more sophisticated
// questions) from the user's actual financial data.
//
// The original persisted this to `localStorage` (`STORAGE_KEY:
// 'gini_user_profile_v2'`) and mirrored it to Supabase best-effort via
// `window.GiniAuth.scheduleSave`. This port persists it server-side instead,
// in the already-provisioned `gini_user_data.ai_profile` jsonb column (see
// database/migrations/0001_gini_journal_fundakamental.sql) — one row per
// user, keyed by `user_id`, read/written via the service-role client.
//
// Ported faithfully: `_createNew`/`_mergeWithDefaults`/`updateFromFinancialData`/
// `_deriveLifeStage`/`_deriveRiskProfile`/`_deriveTimeHorizon`/
// `_calculateHealthSnapshot`/`_estimateAge`/`updateKnowledgeLevel`, including
// the source's own quirks (e.g. `_calculateHealthSnapshot`'s returned
// `emergencyFundMonths` is hardcoded to `0` even though a local
// `emergencyFundMonths` value is computed for the score itself — that's the
// original's own behavior, not a porting bug, and is preserved here).
import supabase from "../../supabase/index.js";

export interface GiniLifeStage {
    stage: "unknown" | "early_career" | "family_building" | "peak_earning" | "pre_retirement" | "retired";
    confidence: number;
    indicators: string[];
}

export interface GiniRiskProfile {
    tolerance: "conservative" | "moderate" | "aggressive";
    derivedFrom: string[];
    equityComfort: number;
    volatilityTolerance: number;
    timeHorizonPreference: "short" | "medium" | "long";
}

export interface GiniKnowledgeLevel {
    level: "beginner" | "intermediate" | "advanced" | "expert";
    indicators: string[];
    preferredDepth: "simple" | "detailed" | "technical";
    financialTermsFamiliarity: string[];
}

export interface GiniHealthSnapshot {
    lastCalculated: string | null;
    overallScore: number | null;
    emergencyFundMonths: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    investmentDiversification: number;
    goalFundingStatus: number;
    hasData: boolean;
}

export interface GiniBehavior {
    questionTypes: string[];
    interactionCount: number;
    lastInteraction: string | null;
    preferredResponseLength: string;
    emotionalTone: string;
}

export interface GiniKeyFacts {
    primaryIncome: number;
    householdIncome: number;
    hasEmergencyFund: boolean;
    hasHealthInsurance: boolean | null;
    hasLifeInsurance: boolean | null;
    hasDependents: boolean;
    dependentCount: number;
    yearsToRetirement: number | null;
    primaryGoals: { name: string; category: string; yearsLeft: number }[];
}

export interface GiniMemory {
    recentTopics: { topic: string; timestamp: string }[];
    pendingFollowUps: unknown[];
    userPreferences: Record<string, unknown>;
    importantDiscussions: unknown[];
}

export interface GiniProfile {
    version: number;
    createdAt: string | null;
    updatedAt: string | null;
    lifeStage: GiniLifeStage;
    riskProfile: GiniRiskProfile;
    knowledgeLevel: GiniKnowledgeLevel;
    healthSnapshot: GiniHealthSnapshot;
    behavior: GiniBehavior;
    keyFacts: GiniKeyFacts;
    memory: GiniMemory;
}

// Port of `GiniUserProfile.defaultProfile`.
function defaultProfile(): GiniProfile {
    return {
        version: 2,
        createdAt: null,
        updatedAt: null,
        lifeStage: { stage: "unknown", confidence: 0, indicators: [] },
        riskProfile: {
            tolerance: "moderate",
            derivedFrom: [],
            equityComfort: 50,
            volatilityTolerance: 50,
            timeHorizonPreference: "medium",
        },
        knowledgeLevel: {
            level: "beginner",
            indicators: [],
            preferredDepth: "simple",
            financialTermsFamiliarity: [],
        },
        healthSnapshot: {
            lastCalculated: null,
            overallScore: null,
            emergencyFundMonths: 0,
            debtToIncomeRatio: 0,
            savingsRate: 0,
            investmentDiversification: 0,
            goalFundingStatus: 0,
            hasData: false,
        },
        behavior: {
            questionTypes: [],
            interactionCount: 0,
            lastInteraction: null,
            preferredResponseLength: "medium",
            emotionalTone: "neutral",
        },
        keyFacts: {
            primaryIncome: 0,
            householdIncome: 0,
            hasEmergencyFund: false,
            hasHealthInsurance: null,
            hasLifeInsurance: null,
            hasDependents: false,
            dependentCount: 0,
            yearsToRetirement: null,
            primaryGoals: [],
        },
        memory: {
            recentTopics: [],
            pendingFollowUps: [],
            userPreferences: {},
            importantDiscussions: [],
        },
    };
}

/** Port of `_mergeWithDefaults` — deep-merges a stored (possibly
 * schema-stale) profile onto a fresh default so new fields added later are
 * always present. */
function mergeWithDefaults(stored: Record<string, unknown> | null | undefined): GiniProfile {
    const merged = defaultProfile() as unknown as Record<string, unknown>;

    const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>) => {
        for (const key in source) {
            const value = source[key];
            if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                if (!target[key] || typeof target[key] !== "object") target[key] = {};
                deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>);
            } else if (value !== undefined) {
                target[key] = value;
            }
        }
    };

    if (stored && typeof stored === "object") {
        deepMerge(merged, stored);
    }
    return merged as unknown as GiniProfile;
}

/** Port of `_createNew`. */
function createNew(): GiniProfile {
    const profile = defaultProfile();
    const now = new Date().toISOString();
    profile.createdAt = now;
    profile.updatedAt = now;
    return profile;
}

/**
 * Port of `GiniUserProfile.load`, adapted to read `gini_user_data.ai_profile`
 * (service-role Supabase) instead of `localStorage`.
 */
export async function loadProfile(userId: string): Promise<GiniProfile> {
    const { data, error } = await supabase.from("gini_user_data").select("ai_profile").eq("user_id", userId).maybeSingle();
    if (error) throw error;

    const stored = data?.ai_profile as Record<string, unknown> | null | undefined;
    if (stored && Object.keys(stored).length > 0) {
        return mergeWithDefaults(stored);
    }
    return createNew();
}

/**
 * Port of `GiniUserProfile.save`, adapted to upsert `gini_user_data.ai_profile`
 * instead of writing `localStorage`.
 */
export async function saveProfile(userId: string, profile: GiniProfile): Promise<void> {
    profile.updatedAt = new Date().toISOString();
    const { error } = await supabase.from("gini_user_data").upsert(
        { user_id: userId, ai_profile: profile as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
    );
    if (error) throw error;
}

// ---- Shapes `updateFromFinancialData`/the derive* helpers read from the
// server-side financial snapshot (see financialSnapshot.ts). Mirrors the
// original's `gatherComprehensiveFinancialData` output shape exactly. ----
export interface GiniFamilyMemberSnapshot {
    name: string;
    age: number;
    relationship: string;
    income: number;
    isEarner: boolean;
    isDependent: boolean;
    retirementAge: number;
}

export interface GiniGoalSnapshot {
    name: string;
    category: string | null;
    targetYear: number | null;
    yearsLeft: number;
    currentCost: number;
    targetAmount: number;
    saved: number;
    gap: number;
    requiredMonthlySIP: number;
    expectedReturn: number;
    inflation: number;
    priority: string | null;
}

export interface GiniPortfolioAllocation {
    type: string;
    value: number;
    allocation: number;
    returnRate: number;
}

export interface GiniFinancialSnapshot {
    netWorth: {
        total: number;
        totalAssets: number;
        totalLiabilities: number;
        debtToAssetRatio: number;
        savingsRate: number;
    };
    goals: {
        count: number;
        items: GiniGoalSnapshot[];
        totalMonthlySIPNeeded: number;
        criticalCount: number;
        completedCount: number;
    };
    portfolio: {
        totalValue: number;
        weightedReturn: number;
        allocations: GiniPortfolioAllocation[];
        riskLevel: "Unknown" | "Conservative" | "Moderate" | "Aggressive";
    };
    monteCarlo: {
        hasResults: boolean;
        probability?: number;
        median?: number;
        best?: number;
        worst?: number;
        target?: number;
    };
    requiredReturn: {
        hasResults: boolean;
        requiredRate?: number;
        gap?: number;
        verdict?: string;
    };
    family: {
        count: number;
        members: GiniFamilyMemberSnapshot[];
    };
}

/** Port of `_estimateAge`. */
function estimateAge(data: GiniFinancialSnapshot): number | null {
    const members = data.family?.members;
    if (members && members.length > 0) {
        const self = members.find((m) => m.relationship === "Self" || m.relationship === "Primary");
        if (self && self.age) return self.age;
        if (members[0]?.age) return members[0].age;
    }
    return null;
}

/** Port of `_deriveLifeStage`. */
function deriveLifeStage(data: GiniFinancialSnapshot, profile: GiniProfile): GiniLifeStage {
    const indicators: string[] = [];
    let stage: GiniLifeStage["stage"] = "unknown";
    let confidence = 0;

    const age = estimateAge(data);
    const hasDependents = profile.keyFacts.hasDependents;
    const hasRetirementGoal = data.goals?.items?.some((g) => g.category === "Retirement");

    if (age) {
        if (age < 30) {
            stage = "early_career";
            indicators.push("Age under 30");
            confidence = 70;
        } else if (age < 45) {
            stage = hasDependents ? "family_building" : "peak_earning";
            indicators.push(hasDependents ? "Has dependents" : "No dependents, building wealth");
            confidence = 75;
        } else if (age < 55) {
            stage = "peak_earning";
            indicators.push("Peak earning years");
            confidence = 70;
        } else if (age < 65) {
            stage = "pre_retirement";
            indicators.push("Approaching retirement");
            confidence = 80;
        } else {
            stage = "retired";
            indicators.push("Retirement age");
            confidence = 75;
        }
    }

    if (hasRetirementGoal) {
        indicators.push("Has retirement goal defined");
    }

    return { stage, confidence, indicators };
}

/** Port of `_deriveTimeHorizon`. */
function deriveTimeHorizon(data: GiniFinancialSnapshot): GiniRiskProfile["timeHorizonPreference"] {
    if (!data.goals || !data.goals.items || data.goals.items.length === 0) return "medium";

    const avgYears = data.goals.items.reduce((sum, g) => sum + (g.yearsLeft || 5), 0) / data.goals.items.length;
    if (avgYears < 3) return "short";
    if (avgYears > 10) return "long";
    return "medium";
}

/** Port of `_deriveRiskProfile`. */
function deriveRiskProfile(data: GiniFinancialSnapshot): GiniRiskProfile {
    const derivedFrom: string[] = [];
    let equityComfort = 50;
    let tolerance: GiniRiskProfile["tolerance"] = "moderate";

    if (data.portfolio && data.portfolio.allocations) {
        const equityAllocation = data.portfolio.allocations
            .filter((a) => ["Stocks", "Mutual Funds", "Equity"].includes(a.type))
            .reduce((sum, a) => sum + (a.allocation || 0), 0);

        equityComfort = equityAllocation;
        derivedFrom.push(`Portfolio has ${equityAllocation.toFixed(0)}% equity allocation`);

        if (equityAllocation > 70) {
            tolerance = "aggressive";
        } else if (equityAllocation < 30) {
            tolerance = "conservative";
        } else {
            tolerance = "moderate";
        }
    }

    if (data.goals && data.goals.items) {
        const avgExpectedReturn = data.goals.items.reduce((sum, g) => sum + (g.expectedReturn || 10), 0) / Math.max(data.goals.items.length, 1);
        if (avgExpectedReturn > 15) {
            derivedFrom.push(`High expected returns (${avgExpectedReturn.toFixed(0)}%) suggest aggressive stance`);
            if (tolerance === "moderate") tolerance = "aggressive";
        } else if (avgExpectedReturn < 10) {
            derivedFrom.push(`Conservative return expectations (${avgExpectedReturn.toFixed(0)}%)`);
            if (tolerance === "moderate") tolerance = "conservative";
        }
    }

    return {
        tolerance,
        derivedFrom,
        equityComfort,
        volatilityTolerance: equityComfort,
        timeHorizonPreference: deriveTimeHorizon(data),
    };
}

/** Port of `_calculateHealthSnapshot`, including the source's own
 * `emergencyFundMonths: 0` hardcode in the returned object (see file
 * header). */
function calculateHealthSnapshot(data: GiniFinancialSnapshot, profile: GiniProfile): GiniHealthSnapshot {
    const hasNetWorthData = Boolean(data.netWorth && (data.netWorth.totalAssets > 0 || data.netWorth.totalLiabilities > 0));
    const hasGoalsData = Boolean(data.goals && data.goals.count > 0);
    const hasPortfolioData = Boolean(data.portfolio && data.portfolio.totalValue > 0);
    const hasFamilyData = profile.keyFacts.householdIncome > 0;

    if (!hasNetWorthData && !hasGoalsData && !hasPortfolioData && !hasFamilyData) {
        return {
            lastCalculated: new Date().toISOString(),
            overallScore: null,
            emergencyFundMonths: 0,
            debtToIncomeRatio: 0,
            savingsRate: 0,
            investmentDiversification: 0,
            goalFundingStatus: 0,
            hasData: false,
        };
    }

    let overallScore = 0;
    let scoreComponents = 0;

    if (hasFamilyData && hasNetWorthData) {
        const monthlyExpenses = profile.keyFacts.householdIncome * 0.6;
        const liquidAssets = data.netWorth.totalAssets * 0.1;
        const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
        const emergencyScore = Math.min((emergencyFundMonths / 6) * 100, 100);
        overallScore += emergencyScore;
        scoreComponents++;
    }

    if (hasNetWorthData && data.netWorth.totalAssets > 0) {
        const debtToIncomeRatio = data.netWorth.debtToAssetRatio || 0;
        const debtScore = Math.max(100 - debtToIncomeRatio * 2, 0);
        overallScore += debtScore;
        scoreComponents++;
    }

    if (hasNetWorthData) {
        const savingsRate = data.netWorth.savingsRate || 0;
        const savingsScore = Math.min((savingsRate / 20) * 100, 100);
        overallScore += savingsScore;
        scoreComponents++;
    }

    if (hasGoalsData) {
        const goalFundingStatus = (data.goals.items.filter((g) => g.gap <= 0).length / data.goals.items.length) * 100;
        overallScore += goalFundingStatus;
        scoreComponents++;
    }

    if (hasPortfolioData) {
        const diversification = data.portfolio.allocations.length > 2 ? 80 : data.portfolio.allocations.length > 0 ? 50 : 20;
        overallScore += diversification;
        scoreComponents++;
    }

    const finalScore = scoreComponents > 0 ? Math.round(overallScore / scoreComponents) : null;

    return {
        lastCalculated: new Date().toISOString(),
        overallScore: finalScore,
        emergencyFundMonths: 0,
        debtToIncomeRatio: Math.round((data.netWorth?.debtToAssetRatio || 0) * 10) / 10,
        savingsRate: Math.round((data.netWorth?.savingsRate || 0) * 10) / 10,
        investmentDiversification: hasPortfolioData ? (data.portfolio.allocations.length > 2 ? 80 : 50) : 0,
        goalFundingStatus: hasGoalsData ? Math.round((data.goals.items.filter((g) => g.gap <= 0).length / data.goals.items.length) * 100) : 0,
        hasData: true,
    };
}

/** Port of `updateFromFinancialData`. */
export function updateFromFinancialData(profile: GiniProfile, financialData: GiniFinancialSnapshot): GiniProfile {
    const now = new Date().toISOString();

    if (financialData.family) {
        const primaryMember = financialData.family.members.find((m) => m.relationship === "Self") || financialData.family.members[0];
        if (primaryMember) {
            profile.keyFacts.primaryIncome = primaryMember.income || 0;
        }
        profile.keyFacts.householdIncome = financialData.family.members.reduce((sum, m) => sum + (m.income || 0), 0);
        profile.keyFacts.hasDependents = financialData.family.members.some((m) => m.isDependent);
        profile.keyFacts.dependentCount = financialData.family.members.filter((m) => m.isDependent).length;
    }

    profile.lifeStage = deriveLifeStage(financialData, profile);
    profile.riskProfile = deriveRiskProfile(financialData);
    profile.healthSnapshot = calculateHealthSnapshot(financialData, profile);

    if (financialData.goals && financialData.goals.items) {
        profile.keyFacts.primaryGoals = [...financialData.goals.items]
            .sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0))
            .slice(0, 3)
            .map((g) => ({ name: g.name, category: g.category || "", yearsLeft: g.yearsLeft }));
    }

    profile.healthSnapshot.lastCalculated = now;
    return profile;
}

// Port of `updateKnowledgeLevel`'s technical-term list.
const TECHNICAL_TERMS = [
    "CAGR",
    "SIP",
    "XIRR",
    "NAV",
    "P/E ratio",
    "beta",
    "alpha",
    "sharpe",
    "monte carlo",
    "standard deviation",
    "correlation",
    "diversification",
    "asset allocation",
    "rebalancing",
    "tax harvesting",
    "LTCG",
    "STCG",
];

/** Port of `updateKnowledgeLevel`. */
export function updateKnowledgeLevel(profile: GiniProfile, query: string): GiniProfile {
    const queryLower = query.toLowerCase();
    const usedTerms = TECHNICAL_TERMS.filter((term) => queryLower.includes(term.toLowerCase()));

    if (usedTerms.length > 0) {
        profile.knowledgeLevel.financialTermsFamiliarity = [...new Set([...profile.knowledgeLevel.financialTermsFamiliarity, ...usedTerms])].slice(-20);

        const familiarity = profile.knowledgeLevel.financialTermsFamiliarity.length;
        if (familiarity > 10) {
            profile.knowledgeLevel.level = "expert";
            profile.knowledgeLevel.preferredDepth = "technical";
        } else if (familiarity > 5) {
            profile.knowledgeLevel.level = "advanced";
            profile.knowledgeLevel.preferredDepth = "detailed";
        } else if (familiarity > 2) {
            profile.knowledgeLevel.level = "intermediate";
            profile.knowledgeLevel.preferredDepth = "detailed";
        }
    }

    profile.behavior.interactionCount++;
    profile.behavior.lastInteraction = new Date().toISOString();

    return profile;
}
