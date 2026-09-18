// Server-side replacement for features-incoming/gini/gini-ai-engine.js's
// `GiniAIEngine.gatherFinancialData` (~lines 1193-1209), which just called
// the browser-global `gatherComprehensiveFinancialData()` (app.js, ~lines
// 614-836) — reading `appState.assets`/`appState.liabilities`/`appState.goals`/
// `appState.familyMembers` and the live networth-calculator/DOM.
//
// This adapter queries the SAME data the Phase 10a repositories already
// expose (`gini_assets`, `gini_liabilities`, `gini_goals`,
// `gini_family_members`, all scoped by `userId`) and reshapes it into the
// exact `GiniFinancialSnapshot` shape `_buildLeanSystemPrompt`/
// `GiniInsightsEngine.generateInsights`/`GiniUserProfile.updateFromFinancialData`
// consume — computing the same aggregates app.js computed client-side
// (`networth.calculateTotalAssets`/`calculateTotalLiabilities`/
// `calculateNetWorth`, and `gatherComprehensiveFinancialData`'s own goal/
// portfolio math), verified against those exact formulas in app.js.
//
// Two pieces of the original's `financialData` are NOT reproducible
// server-side and are intentionally left at their "no results" default:
//  - `monteCarlo` / `requiredReturn`: the original read these from live DOM
//    elements (`#mcProbability`, `#rrRequired`, ...) — i.e. whatever the
//    Monte Carlo / Required Return CALCULATOR TABS currently show in the
//    browser. Those are ephemeral, client-only simulation *results*, never
//    persisted to any table (only simulation *settings* live in
//    `gini_user_data.app_state` per 0006's header comment) — there is
//    nothing for the server to query. `hasResults: false` is exactly the
//    original's own fallback when a page load has no calculator state yet.
import { getAssetsByUser } from "./assets.repository.js";
import { getLiabilitiesByUser } from "./liabilities.repository.js";
import { getGoalsByUser } from "./goals.repository.js";
import { getFamilyMembersByUser } from "./familyMembers.repository.js";
import type { GiniFinancialSnapshot, GiniFamilyMemberSnapshot, GiniGoalSnapshot, GiniPortfolioAllocation } from "./aiProfile.js";

// Asset categories app.js's `gatherComprehensiveFinancialData` treats as
// "portfolio" (~line 729) — everything else (Real Estate, Gold, etc.)
// counts toward net worth but not the portfolio/allocation breakdown.
const PORTFOLIO_CATEGORIES = new Set(["Stocks", "Mutual Funds", "Fixed Deposits"]);
const EQUITY_CATEGORIES = new Set(["Stocks", "Mutual Funds"]);

/**
 * Fetches assets/liabilities/goals/family members for `userId` from the
 * Phase 10a tables and aggregates them into the shape the AI-engine port
 * expects — the server-authoritative replacement for the original's
 * client-supplied `gatherComprehensiveFinancialData()`.
 */
export async function gatherFinancialSnapshot(userId: string): Promise<GiniFinancialSnapshot> {
    const [assetsRes, liabilitiesRes, goalsRes, familyRes] = await Promise.all([
        getAssetsByUser(userId),
        getLiabilitiesByUser(userId),
        getGoalsByUser(userId),
        getFamilyMembersByUser(userId),
    ]);

    if (assetsRes.error) throw assetsRes.error;
    if (liabilitiesRes.error) throw liabilitiesRes.error;
    if (goalsRes.error) throw goalsRes.error;
    if (familyRes.error) throw familyRes.error;

    const assets = assetsRes.data || [];
    const liabilities = liabilitiesRes.data || [];
    const goalsRows = goalsRes.data || [];
    const familyRows = familyRes.data || [];

    // --- Net worth (port of networth.calculateTotalAssets/
    // calculateTotalLiabilities/calculateNetWorth, app.js ~3468/3637/3641,
    // and gatherComprehensiveFinancialData's debtToAssetRatio/savingsRate
    // derivation, app.js ~669-677). ---
    const totalAssets = assets.reduce((sum: number, a: Record<string, unknown>) => sum + (Number(a.value) || 0), 0);
    const totalLiabilities = liabilities.reduce((sum: number, l: Record<string, unknown>) => sum + (Number(l.amount) || 0), 0);
    const total = totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    // Matches the original's own (unusually-named) `savingsRate` formula
    // exactly: (assets - liabilities) / assets * 100, i.e. equity ratio, not
    // an income-based savings rate. Preserved as-is (see app.js ~676).
    const savingsRate = totalAssets > 0 ? ((totalAssets - totalLiabilities) / totalAssets) * 100 : 0;

    // --- Goals (port of gatherComprehensiveFinancialData's goal loop,
    // app.js ~683-724). ---
    const currentYear = new Date().getFullYear();
    const goalItems: GiniGoalSnapshot[] = [];
    let totalMonthlySIPNeeded = 0;
    let criticalCount = 0;
    let completedCount = 0;

    for (const g of goalsRows as Record<string, unknown>[]) {
        const targetYear = g.target_year != null ? Number(g.target_year) : null;
        const years = targetYear != null ? targetYear - currentYear : 0;
        if (targetYear == null || years <= 0) continue;

        const currentCost = Number(g.current_cost) || 0;
        const inflation = Number(g.inflation) || 0;
        const returnRate = Number(g.return_rate) || 0;
        const saved = Number(g.saved) || 0;

        const targetAmount = currentCost * Math.pow(1 + inflation / 100, years);
        const monthsToGoal = years * 12;
        const monthlyReturn = returnRate / 100 / 12;
        const futureValue = saved * Math.pow(1 + returnRate / 100, years);
        const gap = targetAmount - futureValue;

        let requiredMonthlySIP = 0;
        if (gap > 0 && monthsToGoal > 0 && monthlyReturn > 0) {
            requiredMonthlySIP = (gap * monthlyReturn) / (Math.pow(1 + monthlyReturn, monthsToGoal) - 1);
        }

        goalItems.push({
            name: (g.name as string) || "Goal",
            category: (g.category as string) || null,
            targetYear,
            yearsLeft: years,
            currentCost,
            targetAmount,
            saved,
            gap,
            requiredMonthlySIP,
            expectedReturn: returnRate,
            inflation,
            priority: (g.priority as string) || null,
        });

        totalMonthlySIPNeeded += requiredMonthlySIP;
        if (returnRate > 18 || requiredMonthlySIP > saved * 0.1) criticalCount++;
        if (saved >= targetAmount) completedCount++;
    }

    // --- Portfolio (port of gatherComprehensiveFinancialData's portfolio
    // block, app.js ~727-758). ---
    const portfolioAssets = (assets as Record<string, unknown>[]).filter((a) => PORTFOLIO_CATEGORIES.has(a.category as string));
    const portfolioTotalValue = portfolioAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);

    const allocations: GiniPortfolioAllocation[] = [];
    let weightedReturn = 0;
    let riskLevel: "Unknown" | "Conservative" | "Moderate" | "Aggressive" = "Unknown";

    if (portfolioAssets.length > 0 && portfolioTotalValue > 0) {
        for (const a of portfolioAssets) {
            const value = Number(a.value) || 0;
            const allocation = value / portfolioTotalValue;
            const returnRate = a.return_rate != null ? Number(a.return_rate) : 10;
            weightedReturn += allocation * returnRate;
            allocations.push({ type: a.category as string, value, allocation: allocation * 100, returnRate });
        }

        const equityAllocation = (portfolioAssets.filter((a) => EQUITY_CATEGORIES.has(a.category as string)).reduce((sum, a) => sum + (Number(a.value) || 0), 0) / portfolioTotalValue) * 100;

        if (equityAllocation > 70) riskLevel = "Aggressive";
        else if (equityAllocation > 40) riskLevel = "Moderate";
        else riskLevel = "Conservative";
    }

    // --- Family (port of the family mapping, app.js ~810-821) ---
    const members: GiniFamilyMemberSnapshot[] = (familyRows as Record<string, unknown>[]).map((m) => ({
        name: (m.name as string) || "Unknown",
        age: Number(m.age) || 0,
        relationship: (m.relationship as string) || "Unknown",
        income: Number(m.income) || 0,
        isEarner: Boolean(m.is_earner),
        isDependent: Boolean(m.is_dependent),
        retirementAge: Number(m.retirement_age) || 60,
    }));

    return {
        netWorth: { total, totalAssets, totalLiabilities, debtToAssetRatio, savingsRate },
        // `count` mirrors app.js's own `data.goals.count = appState.goals.length`
        // (set from the raw row count BEFORE the per-goal loop below skips
        // already-past-target-year goals from `items`) — count and
        // `items.length` can legitimately differ, exactly as in the source.
        goals: { count: goalsRows.length, items: goalItems, totalMonthlySIPNeeded, criticalCount, completedCount },
        portfolio: { totalValue: portfolioTotalValue, weightedReturn, allocations, riskLevel },
        // Ephemeral client-side calculator output — never persisted, see
        // file header. Always "no results" from the server's point of view.
        monteCarlo: { hasResults: false },
        requiredReturn: { hasResults: false },
        family: { count: members.length, members },
    };
}
