// Server-side port of features-incoming/gini/gini-ai-engine.js's
// `GiniInsightsEngine` (~lines 612-813) — generates financial
// insights/warnings/next-actions from the user's financial data, and
// (unused by the chat endpoint itself, but ported for completeness/future
// reuse, same treatment as journal's `addAiTokens`) hypothetical scenario
// comparisons.
import type { GiniFinancialSnapshot, GiniProfile } from "./aiProfile.js";

export interface GiniInsight {
    type: string;
    message: string;
    action?: string;
    impact?: string;
}

export interface GiniNextAction {
    priority: number;
    action: string;
    reason: string;
}

export interface GiniInsights {
    critical: GiniInsight[];
    warnings: GiniInsight[];
    opportunities: GiniInsight[];
    achievements: GiniInsight[];
    nextActions: GiniNextAction[];
}

/** Port of `GiniInsightsEngine.generateInsights`. */
export function generateInsights(financialData: GiniFinancialSnapshot, profile: GiniProfile): GiniInsights {
    const insights: GiniInsights = {
        critical: [],
        warnings: [],
        opportunities: [],
        achievements: [],
        nextActions: [],
    };

    // === CRITICAL ISSUES ===

    if (financialData.netWorth.debtToAssetRatio > 50) {
        insights.critical.push({
            type: "high_debt",
            message: `Debt-to-asset ratio of ${financialData.netWorth.debtToAssetRatio.toFixed(0)}% is concerning`,
            action: "Prioritize debt reduction before aggressive investing",
            impact: "high",
        });
    }

    if (financialData.requiredReturn.hasResults && (financialData.requiredReturn.requiredRate || 0) > 18) {
        insights.critical.push({
            type: "unrealistic_return",
            message: `Required return of ${(financialData.requiredReturn.requiredRate || 0).toFixed(1)}% is very difficult to achieve`,
            action: "Increase contributions, extend timeline, or reduce goals",
            impact: "high",
        });
    }

    if (financialData.monteCarlo.hasResults && (financialData.monteCarlo.probability || 0) < 50) {
        insights.critical.push({
            type: "low_success_probability",
            message: `Only ${(financialData.monteCarlo.probability || 0).toFixed(0)}% chance of reaching your target`,
            action: "Review and adjust your financial plan",
            impact: "high",
        });
    }

    // === WARNINGS ===

    if (financialData.netWorth.debtToAssetRatio > 30 && financialData.netWorth.debtToAssetRatio <= 50) {
        insights.warnings.push({
            type: "moderate_debt",
            message: `Debt ratio of ${financialData.netWorth.debtToAssetRatio.toFixed(0)}% needs attention`,
            action: "Create a debt payoff plan alongside investing",
        });
    }

    if (financialData.goals.criticalCount > 0) {
        insights.warnings.push({
            type: "aggressive_goals",
            message: `${financialData.goals.criticalCount} goal(s) require aggressive returns or high SIPs`,
            action: "Consider extending timelines or reducing target amounts",
        });
    }

    if (profile.riskProfile.tolerance === "conservative" && profile.riskProfile.equityComfort > 60) {
        insights.warnings.push({
            type: "risk_mismatch",
            message: "Portfolio may be too aggressive for your risk profile",
            action: "Consider rebalancing to a more conservative allocation",
        });
    }

    // === OPPORTUNITIES ===

    if (financialData.monteCarlo.hasResults && (financialData.monteCarlo.probability || 0) >= 50 && (financialData.monteCarlo.probability || 0) < 80) {
        insights.opportunities.push({
            type: "improve_probability",
            message: "Small increase in SIP could boost success probability above 80%",
            action: "Run scenarios with 10-20% higher contributions",
        });
    }

    if (financialData.netWorth.savingsRate > 20) {
        insights.opportunities.push({
            type: "good_savings",
            message: `Strong savings rate of ${financialData.netWorth.savingsRate.toFixed(0)}%`,
            action: "Consider optimizing tax efficiency of investments",
        });
    }

    // === ACHIEVEMENTS ===

    if (financialData.goals.completedCount > 0) {
        insights.achievements.push({
            type: "goals_achieved",
            message: `${financialData.goals.completedCount} goal(s) already fully funded!`,
        });
    }

    if (financialData.monteCarlo.hasResults && (financialData.monteCarlo.probability || 0) >= 90) {
        insights.achievements.push({
            type: "high_success_rate",
            message: `Excellent! ${(financialData.monteCarlo.probability || 0).toFixed(0)}% probability of success`,
        });
    }

    if (financialData.netWorth.debtToAssetRatio < 20 && financialData.netWorth.totalAssets > 0) {
        insights.achievements.push({
            type: "low_debt",
            message: "Healthy debt-to-asset ratio",
        });
    }

    // === NEXT ACTIONS (prioritized) ===

    if (profile.healthSnapshot.emergencyFundMonths < 3) {
        insights.nextActions.push({
            priority: 1,
            action: "Build emergency fund to 3-6 months of expenses",
            reason: "Financial security foundation",
        });
    }

    if (financialData.netWorth.debtToAssetRatio > 40) {
        insights.nextActions.push({
            priority: 2,
            action: "Focus on reducing high-interest debt",
            reason: "Debt reduction provides guaranteed return",
        });
    }

    if (financialData.goals.count === 0) {
        insights.nextActions.push({
            priority: 3,
            action: "Define your financial goals",
            reason: "Clear goals drive better financial decisions",
        });
    }

    if (financialData.portfolio.allocations.length === 0 && financialData.netWorth.totalAssets > 0) {
        insights.nextActions.push({
            priority: 4,
            action: "Review and optimize your investment portfolio",
            reason: "Asset allocation is key to returns",
        });
    }

    insights.nextActions.sort((a, b) => a.priority - b.priority);

    return insights;
}

export interface GiniScenario {
    name: string;
    description: string;
    changes: {
        expectedReturn: number;
        monthlyContribution: number;
        riskLevel: string;
    };
    projectedOutcome: string;
}

/** Port of `GiniInsightsEngine.generateScenarios` — NOT called by the
 * `/gini/chat` endpoint (the lean prompt path `processMessage` used in the
 * original never calls it either); exported for a later phase that wants
 * scenario-comparison output, same treatment as journal's unused-but-exported
 * `addAiTokens`. */
export function generateScenarios(financialData: GiniFinancialSnapshot, profile: GiniProfile): GiniScenario[] {
    const scenarios: GiniScenario[] = [];
    const currentSIP = financialData.goals.totalMonthlySIPNeeded;
    void profile; // kept for signature parity with the source (unused there too, beyond monthlyIncome fallback)

    scenarios.push({
        name: "Conservative Path",
        description: "Lower risk, steadier growth",
        changes: { expectedReturn: 10, monthlyContribution: currentSIP * 1.2, riskLevel: "Conservative" },
        projectedOutcome: "Higher certainty, may need 15-20% more time",
    });

    scenarios.push({
        name: "Aggressive Growth",
        description: "Higher risk, potentially faster results",
        changes: { expectedReturn: 15, monthlyContribution: currentSIP, riskLevel: "Aggressive" },
        projectedOutcome: "Could reach goals faster, but higher volatility",
    });

    scenarios.push({
        name: "Optimized Balance",
        description: "Best risk-adjusted approach",
        changes: { expectedReturn: 12, monthlyContribution: currentSIP * 1.1, riskLevel: "Moderate" },
        projectedOutcome: "Good balance of growth and stability",
    });

    return scenarios;
}
