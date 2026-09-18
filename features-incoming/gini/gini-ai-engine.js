/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * XTIN GINI AI ENGINE v2.0
 * Advanced Financial Intelligence System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                          USER INTERACTION LAYER                             │
 * │                     (Chat UI, Quick Actions, Voice)                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *                                      │
 *                                      ▼
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                       INTENT CLASSIFICATION LAYER                           │
 * │  • Query Analysis  • Context Detection  • Tool Routing  • Emotional Tone    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *                                      │
 *                                      ▼
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                     DATA AGGREGATION & INSIGHT LAYER                        │
 * │  • Cross-tool Data  • Computed Insights  • Anomaly Detection  • Trends      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *                                      │
 *                                      ▼
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                    USER INTELLIGENCE PROFILE (Persistent)                   │
 * │  • Life Stage  • Risk Tolerance  • Knowledge Level  • Preferences  • History│
 * └─────────────────────────────────────────────────────────────────────────────┘
 *                                      │
 *                                      ▼
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                      PROMPT ORCHESTRATION LAYER                             │
 * │  • Dynamic System Prompt  • Context Injection  • Response Rules             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *                                      │
 *                                      ▼
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                          LLM API LAYER                                      │
 * │              (Claude via secure proxy with Retry & Fallback)                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *                                      │
 *                                      ▼
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                    RESPONSE FORMATTING LAYER                                │
 * │  • Structure Detection  • Markdown Cleanup  • UI-Friendly Output            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// 1. USER INTELLIGENCE PROFILE - Persistent Financial Identity
// ============================================================================

const GiniUserProfile = {
  STORAGE_KEY: 'gini_user_profile_v2',
  
  // Default profile structure
  defaultProfile: {
    version: 2,
    createdAt: null,
    updatedAt: null,
    
    // Derived Life Stage
    lifeStage: {
      stage: 'unknown', // 'early_career', 'family_building', 'peak_earning', 'pre_retirement', 'retired'
      confidence: 0,
      indicators: []
    },
    
    // Risk Profile (derived from behavior, not just asked)
    riskProfile: {
      tolerance: 'moderate', // 'conservative', 'moderate', 'aggressive'
      derivedFrom: [],
      equityComfort: 50, // 0-100
      volatilityTolerance: 50, // 0-100
      timeHorizonPreference: 'medium' // 'short', 'medium', 'long'
    },
    
    // Knowledge & Communication
    knowledgeLevel: {
      level: 'beginner', // 'beginner', 'intermediate', 'advanced', 'expert'
      indicators: [],
      preferredDepth: 'simple', // 'simple', 'detailed', 'technical'
      financialTermsFamiliarity: []
    },
    
    // Financial Health Snapshot
    healthSnapshot: {
      lastCalculated: null,
      overallScore: null, // null means no data yet
      emergencyFundMonths: 0,
      debtToIncomeRatio: 0,
      savingsRate: 0,
      investmentDiversification: 0,
      goalFundingStatus: 0,
      hasData: false
    },
    
    // Behavioral Patterns
    behavior: {
      questionTypes: [], // Track what user asks about
      interactionCount: 0,
      lastInteraction: null,
      preferredResponseLength: 'medium',
      emotionalTone: 'neutral' // 'anxious', 'curious', 'confident', 'confused', 'neutral'
    },
    
    // Key Financial Facts (extracted from data)
    keyFacts: {
      primaryIncome: 0,
      householdIncome: 0,
      hasEmergencyFund: false,
      hasHealthInsurance: null,
      hasLifeInsurance: null,
      hasDependents: false,
      dependentCount: 0,
      yearsToRetirement: null,
      primaryGoals: []
    },
    
    // Conversation Memory
    memory: {
      recentTopics: [],
      pendingFollowUps: [],
      userPreferences: {},
      importantDiscussions: []
    }
  },
  
  // Load profile from storage
  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle schema updates
        return this._mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('[GiniProfile] Failed to load profile:', e);
    }
    return this._createNew();
  },
  
  // Save profile to storage
  save(profile) {
    try {
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      if (window.GiniAuth?.isLoggedIn?.() && typeof window.getCloudPersistencePayload === 'function') {
        window.GiniAuth.scheduleSave(window.getCloudPersistencePayload);
      }
    } catch (e) {
      console.warn('[GiniProfile] Failed to save profile:', e);
    }
  },
  
  // Create new profile
  _createNew() {
    const profile = JSON.parse(JSON.stringify(this.defaultProfile));
    profile.createdAt = new Date().toISOString();
    profile.updatedAt = profile.createdAt;
    this.save(profile);
    return profile;
  },
  
  // Merge stored profile with defaults (handles schema changes)
  _mergeWithDefaults(stored) {
    const merged = JSON.parse(JSON.stringify(this.defaultProfile));
    
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    };
    
    deepMerge(merged, stored);
    return merged;
  },
  
  // Update profile based on financial data
  updateFromFinancialData(profile, financialData) {
    const now = new Date().toISOString();
    
    // Extract key facts
    if (financialData.family) {
      const primaryMember = financialData.family.members.find(m => m.relation === 'Self') || financialData.family.members[0];
      if (primaryMember) {
        profile.keyFacts.primaryIncome = primaryMember.income || 0;
      }
      profile.keyFacts.householdIncome = financialData.family.members.reduce((sum, m) => sum + (m.income || 0), 0);
      profile.keyFacts.hasDependents = financialData.family.members.some(m => m.isDependent);
      profile.keyFacts.dependentCount = financialData.family.members.filter(m => m.isDependent).length;
    }
    
    // Calculate life stage
    profile.lifeStage = this._deriveLifeStage(financialData, profile);
    
    // Calculate risk profile from actual behavior
    profile.riskProfile = this._deriveRiskProfile(financialData, profile);
    
    // Calculate health snapshot
    profile.healthSnapshot = this._calculateHealthSnapshot(financialData, profile);
    
    // Extract primary goals
    if (financialData.goals && financialData.goals.items) {
      profile.keyFacts.primaryGoals = financialData.goals.items
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 3)
        .map(g => ({ name: g.name, category: g.category, yearsLeft: g.yearsLeft }));
    }
    
    profile.healthSnapshot.lastCalculated = now;
    return profile;
  },
  
  // Derive life stage from data
  _deriveLifeStage(data, profile) {
    const indicators = [];
    let stage = 'unknown';
    let confidence = 0;
    
    const age = this._estimateAge(data, profile);
    const hasDependents = profile.keyFacts.hasDependents;
    const hasRetirementGoal = data.goals?.items?.some(g => g.category === 'Retirement');
    
    if (age) {
      if (age < 30) {
        stage = 'early_career';
        indicators.push('Age under 30');
        confidence = 70;
      } else if (age < 45) {
        stage = hasDependents ? 'family_building' : 'peak_earning';
        indicators.push(hasDependents ? 'Has dependents' : 'No dependents, building wealth');
        confidence = 75;
      } else if (age < 55) {
        stage = 'peak_earning';
        indicators.push('Peak earning years');
        confidence = 70;
      } else if (age < 65) {
        stage = 'pre_retirement';
        indicators.push('Approaching retirement');
        confidence = 80;
      } else {
        stage = 'retired';
        indicators.push('Retirement age');
        confidence = 75;
      }
    }
    
    if (hasRetirementGoal) {
      indicators.push('Has retirement goal defined');
    }
    
    return { stage, confidence, indicators };
  },
  
  // Derive risk profile from portfolio behavior
  _deriveRiskProfile(data, profile) {
    const derivedFrom = [];
    let equityComfort = 50;
    let tolerance = 'moderate';
    
    // Check actual portfolio allocation
    if (data.portfolio && data.portfolio.allocations) {
      const equityAllocation = data.portfolio.allocations
        .filter(a => ['Stocks', 'Mutual Funds', 'Equity'].includes(a.type))
        .reduce((sum, a) => sum + (a.allocation || 0), 0);
      
      equityComfort = equityAllocation;
      derivedFrom.push(`Portfolio has ${equityAllocation.toFixed(0)}% equity allocation`);
      
      if (equityAllocation > 70) {
        tolerance = 'aggressive';
      } else if (equityAllocation < 30) {
        tolerance = 'conservative';
      } else {
        tolerance = 'moderate';
      }
    }
    
    // Check expected returns in goals
    if (data.goals && data.goals.items) {
      const avgExpectedReturn = data.goals.items.reduce((sum, g) => sum + (g.expectedReturn || 10), 0) / Math.max(data.goals.items.length, 1);
      if (avgExpectedReturn > 15) {
        derivedFrom.push(`High expected returns (${avgExpectedReturn.toFixed(0)}%) suggest aggressive stance`);
        if (tolerance === 'moderate') tolerance = 'aggressive';
      } else if (avgExpectedReturn < 10) {
        derivedFrom.push(`Conservative return expectations (${avgExpectedReturn.toFixed(0)}%)`);
        if (tolerance === 'moderate') tolerance = 'conservative';
      }
    }
    
    return {
      tolerance,
      derivedFrom,
      equityComfort,
      volatilityTolerance: equityComfort,
      timeHorizonPreference: this._deriveTimeHorizon(data)
    };
  },
  
  // Derive time horizon preference
  _deriveTimeHorizon(data) {
    if (!data.goals || !data.goals.items || data.goals.items.length === 0) return 'medium';
    
    const avgYears = data.goals.items.reduce((sum, g) => sum + (g.yearsLeft || 5), 0) / data.goals.items.length;
    if (avgYears < 3) return 'short';
    if (avgYears > 10) return 'long';
    return 'medium';
  },
  
  // Calculate comprehensive health snapshot
  _calculateHealthSnapshot(data, profile) {
    // Check if there's any meaningful data to calculate from
    const hasNetWorthData = data.netWorth && (data.netWorth.totalAssets > 0 || data.netWorth.totalLiabilities > 0);
    const hasGoalsData = data.goals && data.goals.count > 0;
    const hasPortfolioData = data.portfolio && data.portfolio.totalValue > 0;
    const hasFamilyData = profile.keyFacts.householdIncome > 0;
    
    // If no meaningful data, return null/empty snapshot
    if (!hasNetWorthData && !hasGoalsData && !hasPortfolioData && !hasFamilyData) {
      return {
        lastCalculated: new Date().toISOString(),
        overallScore: null, // null means "no data"
        emergencyFundMonths: 0,
        debtToIncomeRatio: 0,
        savingsRate: 0,
        investmentDiversification: 0,
        goalFundingStatus: 0,
        hasData: false
      };
    }
    
    let overallScore = 0;
    let scoreComponents = 0;
    
    // Only calculate components where we have real data
    
    // Emergency fund check (target: 6 months) - only if we have income data
    if (hasFamilyData && hasNetWorthData) {
      const monthlyExpenses = profile.keyFacts.householdIncome * 0.6;
      const liquidAssets = data.netWorth.totalAssets * 0.1;
      const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
      const emergencyScore = Math.min(emergencyFundMonths / 6 * 100, 100);
      overallScore += emergencyScore;
      scoreComponents++;
    }
    
    // Debt ratio (target: < 30%) - only if we have net worth data
    if (hasNetWorthData && data.netWorth.totalAssets > 0) {
      const debtToIncomeRatio = data.netWorth.debtToAssetRatio || 0;
      const debtScore = Math.max(100 - (debtToIncomeRatio * 2), 0);
      overallScore += debtScore;
      scoreComponents++;
    }
    
    // Savings rate (target: 20%+) - only if we have net worth data
    if (hasNetWorthData) {
      const savingsRate = data.netWorth.savingsRate || 0;
      const savingsScore = Math.min(savingsRate / 20 * 100, 100);
      overallScore += savingsScore;
      scoreComponents++;
    }
    
    // Goal funding status - only if we have goals
    if (hasGoalsData) {
      const goalFundingStatus = data.goals.items.filter(g => g.gap <= 0).length / data.goals.items.length * 100;
      overallScore += goalFundingStatus;
      scoreComponents++;
    }
    
    // Portfolio diversification - only if we have portfolio data
    if (hasPortfolioData) {
      const diversification = data.portfolio.allocations.length > 2 ? 80 : data.portfolio.allocations.length > 0 ? 50 : 20;
      overallScore += diversification;
      scoreComponents++;
    }
    
    // Calculate final score only if we have at least one component
    const finalScore = scoreComponents > 0 ? Math.round(overallScore / scoreComponents) : null;
    
    return {
      lastCalculated: new Date().toISOString(),
      overallScore: finalScore,
      emergencyFundMonths: 0,
      debtToIncomeRatio: Math.round((data.netWorth?.debtToAssetRatio || 0) * 10) / 10,
      savingsRate: Math.round((data.netWorth?.savingsRate || 0) * 10) / 10,
      investmentDiversification: hasPortfolioData ? (data.portfolio.allocations.length > 2 ? 80 : 50) : 0,
      goalFundingStatus: hasGoalsData ? Math.round(data.goals.items.filter(g => g.gap <= 0).length / data.goals.items.length * 100) : 0,
      hasData: true
    };
  },
  
  // Estimate user age from data
  _estimateAge(data, profile) {
    if (data.family && data.family.members) {
      const self = data.family.members.find(m => m.relation === 'Self' || m.relation === 'Primary');
      if (self && self.age) return self.age;
      if (data.family.members[0]?.age) return data.family.members[0].age;
    }
    return null;
  },
  
  // Update knowledge level based on interaction
  updateKnowledgeLevel(profile, query, response) {
    const technicalTerms = [
      'CAGR', 'SIP', 'XIRR', 'NAV', 'P/E ratio', 'beta', 'alpha', 'sharpe',
      'monte carlo', 'standard deviation', 'correlation', 'diversification',
      'asset allocation', 'rebalancing', 'tax harvesting', 'LTCG', 'STCG'
    ];
    
    const queryLower = query.toLowerCase();
    const usedTerms = technicalTerms.filter(term => queryLower.includes(term.toLowerCase()));
    
    if (usedTerms.length > 0) {
      profile.knowledgeLevel.financialTermsFamiliarity = [
        ...new Set([...profile.knowledgeLevel.financialTermsFamiliarity, ...usedTerms])
      ].slice(-20);
      
      const familiarity = profile.knowledgeLevel.financialTermsFamiliarity.length;
      if (familiarity > 10) {
        profile.knowledgeLevel.level = 'expert';
        profile.knowledgeLevel.preferredDepth = 'technical';
      } else if (familiarity > 5) {
        profile.knowledgeLevel.level = 'advanced';
        profile.knowledgeLevel.preferredDepth = 'detailed';
      } else if (familiarity > 2) {
        profile.knowledgeLevel.level = 'intermediate';
        profile.knowledgeLevel.preferredDepth = 'detailed';
      }
    }
    
    // Track interaction
    profile.behavior.interactionCount++;
    profile.behavior.lastInteraction = new Date().toISOString();
    
    return profile;
  }
};

// ============================================================================
// 2. INTENT CLASSIFICATION - Understand What User Wants
// ============================================================================

const GiniIntentClassifier = {
  // Intent patterns with priorities
  patterns: {
    // Status & Overview
    overview: {
      keywords: ['overview', 'summary', 'how am i doing', 'my situation', 'status', 'dashboard', 'snapshot'],
      priority: 1
    },
    health_check: {
      keywords: ['am i on track', 'health', 'score', 'doing well', 'okay', 'fine', 'good shape'],
      priority: 1
    },
    
    // Goals Related
    goal_analysis: {
      keywords: ['goals', 'targets', 'objectives', 'planning for', 'save for', 'saving for'],
      priority: 2
    },
    goal_feasibility: {
      keywords: ['realistic', 'achievable', 'possible', 'can i afford', 'afford this', 'feasible'],
      priority: 2
    },
    
    // Portfolio & Investments
    portfolio_review: {
      keywords: ['portfolio', 'investments', 'allocation', 'diversification', 'holdings'],
      priority: 2
    },
    risk_assessment: {
      keywords: ['risk', 'risky', 'safe', 'conservative', 'aggressive', 'volatility'],
      priority: 2
    },
    
    // Calculations & Analysis
    monte_carlo: {
      keywords: ['monte carlo', 'simulation', 'probability', 'chances', 'likelihood'],
      priority: 3
    },
    required_return: {
      keywords: ['required return', 'need return', 'return needed', 'what return'],
      priority: 3
    },
    sip_calculation: {
      keywords: ['sip', 'monthly investment', 'how much to invest', 'monthly saving'],
      priority: 3
    },
    
    // Family & Planning
    family_planning: {
      keywords: ['family', 'dependents', 'children', 'spouse', 'education', 'marriage'],
      priority: 2
    },
    retirement: {
      keywords: ['retirement', 'retire', 'pension', 'corpus', 'post-retirement'],
      priority: 2
    },
    
    // Debt & Liabilities
    debt_analysis: {
      keywords: ['debt', 'loan', 'emi', 'liability', 'repayment', 'interest'],
      priority: 2
    },
    
    // Recommendations & Actions
    what_to_do: {
      keywords: ['what should i', 'recommend', 'suggest', 'advice', 'next step', 'priority'],
      priority: 1
    },
    fix_issues: {
      keywords: ['fix', 'improve', 'optimize', 'problem', 'issue', 'wrong', 'mistake'],
      priority: 1
    },
    
    // Comparisons & Scenarios
    scenario: {
      keywords: ['what if', 'scenario', 'compare', 'alternative', 'option'],
      priority: 3
    },
    
    // General Questions
    explanation: {
      keywords: ['what is', 'explain', 'how does', 'meaning', 'define', 'tell me about'],
      priority: 4
    }
  },
  
  // Classify user intent
  classify(query) {
    const queryLower = query.toLowerCase();
    const matches = [];
    
    for (const [intent, config] of Object.entries(this.patterns)) {
      const matchedKeywords = config.keywords.filter(kw => queryLower.includes(kw));
      if (matchedKeywords.length > 0) {
        matches.push({
          intent,
          confidence: matchedKeywords.length / config.keywords.length,
          priority: config.priority,
          matchedKeywords
        });
      }
    }
    
    // Sort by confidence then priority
    matches.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return a.priority - b.priority;
    });
    
    return {
      primary: matches[0] || { intent: 'general', confidence: 0.5, priority: 5 },
      secondary: matches.slice(1, 3),
      allMatches: matches
    };
  },
  
  // Detect emotional context
  detectEmotionalContext(query) {
    const anxiousPatterns = ['worried', 'concerned', 'scared', 'anxious', 'nervous', 'stress', 'panic'];
    const confusedPatterns = ['confused', 'don\'t understand', 'lost', 'overwhelmed', 'complicated'];
    const curiousPatterns = ['curious', 'interested', 'wondering', 'want to know', 'tell me'];
    const frustratedPatterns = ['frustrated', 'annoyed', 'not working', 'wrong', 'stupid'];
    
    const queryLower = query.toLowerCase();
    
    if (anxiousPatterns.some(p => queryLower.includes(p))) return 'anxious';
    if (confusedPatterns.some(p => queryLower.includes(p))) return 'confused';
    if (frustratedPatterns.some(p => queryLower.includes(p))) return 'frustrated';
    if (curiousPatterns.some(p => queryLower.includes(p))) return 'curious';
    
    return 'neutral';
  },
  
  // Detect current tool/section context
  detectToolContext() {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      const tabId = activeTab.id;
      const toolMap = {
        'dashboard-tab': 'dashboard',
        'family-settings-tab': 'family',
        'networth-tab': 'networth',
        'goals-tab': 'goals',
        'portfolio-tab': 'portfolio',
        'planner-tab': 'planner',
        'required-return-tab': 'required_return',
        'monte-carlo-tab': 'monte_carlo',
        'retirement-tab': 'retirement',
        'calculators-tab': 'calculators',
        'family-planning-tab': 'family_planning'
      };
      return toolMap[tabId] || 'general';
    }
    return 'general';
  }
};

// ============================================================================
// 3. FINANCIAL INSIGHTS ENGINE - Deep Analysis & Recommendations
// ============================================================================

const GiniInsightsEngine = {
  // Generate comprehensive insights from data
  generateInsights(financialData, profile) {
    const insights = {
      critical: [],
      warnings: [],
      opportunities: [],
      achievements: [],
      nextActions: []
    };
    
    // === CRITICAL ISSUES ===
    
    // High debt ratio
    if (financialData.netWorth.debtToAssetRatio > 50) {
      insights.critical.push({
        type: 'high_debt',
        message: `Debt-to-asset ratio of ${financialData.netWorth.debtToAssetRatio.toFixed(0)}% is concerning`,
        action: 'Prioritize debt reduction before aggressive investing',
        impact: 'high'
      });
    }
    
    // Unrealistic required returns
    if (financialData.requiredReturn.hasResults && financialData.requiredReturn.requiredRate > 18) {
      insights.critical.push({
        type: 'unrealistic_return',
        message: `Required return of ${financialData.requiredReturn.requiredRate.toFixed(1)}% is very difficult to achieve`,
        action: 'Increase contributions, extend timeline, or reduce goals',
        impact: 'high'
      });
    }
    
    // Low Monte Carlo probability
    if (financialData.monteCarlo.hasResults && financialData.monteCarlo.probability < 50) {
      insights.critical.push({
        type: 'low_success_probability',
        message: `Only ${financialData.monteCarlo.probability.toFixed(0)}% chance of reaching your target`,
        action: 'Review and adjust your financial plan',
        impact: 'high'
      });
    }
    
    // === WARNINGS ===
    
    // Moderate debt
    if (financialData.netWorth.debtToAssetRatio > 30 && financialData.netWorth.debtToAssetRatio <= 50) {
      insights.warnings.push({
        type: 'moderate_debt',
        message: `Debt ratio of ${financialData.netWorth.debtToAssetRatio.toFixed(0)}% needs attention`,
        action: 'Create a debt payoff plan alongside investing'
      });
    }
    
    // Aggressive goals
    if (financialData.goals.criticalCount > 0) {
      insights.warnings.push({
        type: 'aggressive_goals',
        message: `${financialData.goals.criticalCount} goal(s) require aggressive returns or high SIPs`,
        action: 'Consider extending timelines or reducing target amounts'
      });
    }
    
    // High equity in conservative profile
    if (profile.riskProfile.tolerance === 'conservative' && profile.riskProfile.equityComfort > 60) {
      insights.warnings.push({
        type: 'risk_mismatch',
        message: 'Portfolio may be too aggressive for your risk profile',
        action: 'Consider rebalancing to a more conservative allocation'
      });
    }
    
    // === OPPORTUNITIES ===
    
    // Low Monte Carlo but fixable
    if (financialData.monteCarlo.hasResults && 
        financialData.monteCarlo.probability >= 50 && 
        financialData.monteCarlo.probability < 80) {
      insights.opportunities.push({
        type: 'improve_probability',
        message: `Small increase in SIP could boost success probability above 80%`,
        action: 'Run scenarios with 10-20% higher contributions'
      });
    }
    
    // Good savings rate
    if (financialData.netWorth.savingsRate > 20) {
      insights.opportunities.push({
        type: 'good_savings',
        message: `Strong savings rate of ${financialData.netWorth.savingsRate.toFixed(0)}%`,
        action: 'Consider optimizing tax efficiency of investments'
      });
    }
    
    // === ACHIEVEMENTS ===
    
    if (financialData.goals.completedCount > 0) {
      insights.achievements.push({
        type: 'goals_achieved',
        message: `${financialData.goals.completedCount} goal(s) already fully funded!`
      });
    }
    
    if (financialData.monteCarlo.hasResults && financialData.monteCarlo.probability >= 90) {
      insights.achievements.push({
        type: 'high_success_rate',
        message: `Excellent! ${financialData.monteCarlo.probability.toFixed(0)}% probability of success`
      });
    }
    
    if (financialData.netWorth.debtToAssetRatio < 20 && financialData.netWorth.totalAssets > 0) {
      insights.achievements.push({
        type: 'low_debt',
        message: 'Healthy debt-to-asset ratio'
      });
    }
    
    // === NEXT ACTIONS (prioritized) ===
    
    // Action priorities based on life stage and situation
    if (profile.healthSnapshot.emergencyFundMonths < 3) {
      insights.nextActions.push({
        priority: 1,
        action: 'Build emergency fund to 3-6 months of expenses',
        reason: 'Financial security foundation'
      });
    }
    
    if (financialData.netWorth.debtToAssetRatio > 40) {
      insights.nextActions.push({
        priority: 2,
        action: 'Focus on reducing high-interest debt',
        reason: 'Debt reduction provides guaranteed return'
      });
    }
    
    if (financialData.goals.count === 0) {
      insights.nextActions.push({
        priority: 3,
        action: 'Define your financial goals',
        reason: 'Clear goals drive better financial decisions'
      });
    }
    
    if (financialData.portfolio.allocations.length === 0 && financialData.netWorth.totalAssets > 0) {
      insights.nextActions.push({
        priority: 4,
        action: 'Review and optimize your investment portfolio',
        reason: 'Asset allocation is key to returns'
      });
    }
    
    // Sort next actions by priority
    insights.nextActions.sort((a, b) => a.priority - b.priority);
    
    return insights;
  },
  
  // Generate scenario comparisons
  generateScenarios(financialData, profile) {
    const scenarios = [];
    const monthlyIncome = profile.keyFacts.householdIncome || 100000;
    const currentSIP = financialData.goals.totalMonthlySIPNeeded;
    
    // Conservative scenario
    scenarios.push({
      name: 'Conservative Path',
      description: 'Lower risk, steadier growth',
      changes: {
        expectedReturn: 10,
        monthlyContribution: currentSIP * 1.2,
        riskLevel: 'Conservative'
      },
      projectedOutcome: 'Higher certainty, may need 15-20% more time'
    });
    
    // Aggressive scenario
    scenarios.push({
      name: 'Aggressive Growth',
      description: 'Higher risk, potentially faster results',
      changes: {
        expectedReturn: 15,
        monthlyContribution: currentSIP,
        riskLevel: 'Aggressive'
      },
      projectedOutcome: 'Could reach goals faster, but higher volatility'
    });
    
    // Balanced optimization
    scenarios.push({
      name: 'Optimized Balance',
      description: 'Best risk-adjusted approach',
      changes: {
        expectedReturn: 12,
        monthlyContribution: currentSIP * 1.1,
        riskLevel: 'Moderate'
      },
      projectedOutcome: 'Good balance of growth and stability'
    });
    
    return scenarios;
  }
};

// ============================================================================
// 4. PROMPT ORCHESTRATION - Build Intelligent Prompts
// ============================================================================

const GiniPromptBuilder = {
  // Build comprehensive system prompt
  buildSystemPrompt(profile, financialData, insights, intent, emotionalContext) {
    const knowledgeLevel = profile.knowledgeLevel.level;
    const lifeStage = profile.lifeStage.stage;
    const riskTolerance = profile.riskProfile.tolerance;
    
    return `You are Gini, a trusted personal financial advisor for an Indian investor. You have complete access to their financial data and history.

═══════════════════════════════════════════════════════════════════════════════
CORE IDENTITY & APPROACH
═══════════════════════════════════════════════════════════════════════════════

Your personality:
• Calm, confident, and reassuring - like a wise friend who happens to be a financial expert
• Never judgmental about past decisions
• Proactive - you spot issues before they ask
• Clear and direct - you give actual answers, not vague guidance

Communication style for this user:
• Knowledge level: ${knowledgeLevel.toUpperCase()} - ${this._getKnowledgeGuidance(knowledgeLevel)}
• Life stage: ${lifeStage.replace('_', ' ')} - ${this._getLifeStageGuidance(lifeStage)}
• Risk tolerance: ${riskTolerance} - respect their comfort level
• Emotional context: ${emotionalContext} - ${this._getEmotionalGuidance(emotionalContext)}

═══════════════════════════════════════════════════════════════════════════════
USER'S COMPLETE FINANCIAL PICTURE
═══════════════════════════════════════════════════════════════════════════════

${this._buildFinancialSummary(financialData, profile)}

═══════════════════════════════════════════════════════════════════════════════
CURRENT INSIGHTS & PRIORITIES
═══════════════════════════════════════════════════════════════════════════════

${this._buildInsightsSummary(insights)}

═══════════════════════════════════════════════════════════════════════════════
RESPONSE RULES (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

STRUCTURE every response naturally:
- Start with a warm, direct answer to their question
- Share the most important insight in simple terms
- Mention specific numbers from their data
- End with one clear suggestion

FORMATTING (CRITICAL):
• Write in natural flowing paragraphs, NOT numbered lists
• NEVER use "1) Direct Answer" or "2) Key Insight" labels
• Keep sentences short and easy to scan
• Add a blank line between different thoughts
• Use simple language, like talking to a friend

TONE:
• Speak naturally, like a helpful advisor over coffee
• Be confident in your analysis - you have all the data
• If something is concerning, say so directly but kindly
• Celebrate wins - they're working hard

WHAT TO AVOID:
• Generic advice like "consult a financial advisor"
• Markdown formatting (**, *, -, #)
• Numbered response formats like "1) Direct Answer: 2) Key Insight:"
• Labels like "Direct Answer:" or "Next Step:" - just say it naturally
• Repeating the same information twice
• Long walls of text - use short paragraphs
• Robotic or templated-sounding language

EXAMPLE GOOD RESPONSE:
"Your finances are in decent shape with a health score of 65. The main thing to watch is your debt - at 26% of assets, it's eating into your growth potential.

Your retirement goal is on track, but the house down payment might need an extra ₹5,000/month to hit the timeline.

I'd suggest tackling that credit card balance first - clearing it would free up ₹8,000/month for investments."

LENGTH: ${this._getResponseLength(intent.primary.intent)} (aim for conversational, easy-to-read responses)`;
  },
  
  // Build financial data summary for prompt
  _buildFinancialSummary(data, profile) {
    const formatCurrency = (n) => window.XtinRegion
      ? XtinRegion.formatMoney(n || 0)
      : `₹${(n || 0).toLocaleString('en-IN')}`;
    const formatLakhs = (n) => window.XtinRegion
      ? XtinRegion.formatMoney(n || 0, { compact: true })
      : `₹${((n || 0) / 100000).toFixed(1)}L`;
    
    let summary = `FINANCIAL HEALTH SCORE: ${profile.healthSnapshot.overallScore}/100

NET WORTH:
• Total: ${formatLakhs(data.netWorth.total)}
• Assets: ${formatLakhs(data.netWorth.totalAssets)}
• Liabilities: ${formatLakhs(data.netWorth.totalLiabilities)}
• Debt Ratio: ${data.netWorth.debtToAssetRatio.toFixed(1)}%
`;

    if (data.goals.count > 0) {
      summary += `
GOALS (${data.goals.count} active):
`;
      data.goals.items.slice(0, 5).forEach(g => {
        summary += `• ${g.name}: Need ${formatLakhs(g.targetAmount)} in ${g.yearsLeft}y, Monthly SIP: ${formatCurrency(g.requiredMonthlySIP)}
`;
      });
      summary += `Total Monthly SIP Needed: ${formatCurrency(data.goals.totalMonthlySIPNeeded)}
`;
    }

    if (data.portfolio.totalValue > 0) {
      summary += `
PORTFOLIO:
• Value: ${formatLakhs(data.portfolio.totalValue)}
• Risk Level: ${data.portfolio.riskLevel}
• Expected Return: ${data.portfolio.weightedReturn.toFixed(1)}%
`;
    }

    if (data.monteCarlo.hasResults) {
      summary += `
MONTE CARLO SIMULATION:
• Success Probability: ${data.monteCarlo.probability.toFixed(0)}%
• Target: ${formatLakhs(data.monteCarlo.target)}
• Median Outcome: ${formatLakhs(data.monteCarlo.median)}
`;
    }

    if (data.requiredReturn.hasResults) {
      summary += `
REQUIRED RETURN ANALYSIS:
• Required: ${data.requiredReturn.requiredRate.toFixed(1)}%
• Verdict: ${data.requiredReturn.verdict}
`;
    }

    if (profile.keyFacts.householdIncome > 0) {
      summary += `
FAMILY:
• Household Income: ${formatCurrency(profile.keyFacts.householdIncome)}/month
• Dependents: ${profile.keyFacts.dependentCount}
`;
    }

    return summary;
  },
  
  // Build insights summary for prompt
  _buildInsightsSummary(insights) {
    let summary = '';
    
    if (insights.critical.length > 0) {
      summary += 'CRITICAL ISSUES:\n';
      insights.critical.forEach(i => {
        summary += `⚠️ ${i.message}\n`;
      });
      summary += '\n';
    }
    
    if (insights.warnings.length > 0) {
      summary += 'ATTENTION NEEDED:\n';
      insights.warnings.forEach(i => {
        summary += `• ${i.message}\n`;
      });
      summary += '\n';
    }
    
    if (insights.achievements.length > 0) {
      summary += 'ACHIEVEMENTS:\n';
      insights.achievements.forEach(i => {
        summary += `✓ ${i.message}\n`;
      });
      summary += '\n';
    }
    
    if (insights.nextActions.length > 0) {
      summary += 'TOP PRIORITIES:\n';
      insights.nextActions.slice(0, 3).forEach((a, idx) => {
        summary += `${idx + 1}. ${a.action}\n`;
      });
    }
    
    return summary || 'No specific issues detected. Financial plan looks healthy.';
  },
  
  // Knowledge level guidance
  _getKnowledgeGuidance(level) {
    const guidance = {
      beginner: 'Use simple terms, explain concepts, avoid jargon',
      intermediate: 'Can use common financial terms, brief explanations OK',
      advanced: 'Comfortable with technical terms, provide detailed analysis',
      expert: 'Use technical language freely, focus on nuanced insights'
    };
    return guidance[level] || guidance.intermediate;
  },
  
  // Life stage guidance
  _getLifeStageGuidance(stage) {
    const guidance = {
      early_career: 'Focus on building habits, growth potential, long-term compounding',
      family_building: 'Balance family needs, insurance coverage, education planning',
      peak_earning: 'Maximize savings rate, tax optimization, diversification',
      pre_retirement: 'Risk reduction, corpus protection, income generation',
      retired: 'Capital preservation, regular income, inflation protection',
      unknown: 'General wealth-building principles'
    };
    return guidance[stage] || guidance.unknown;
  },
  
  // Emotional context guidance
  _getEmotionalGuidance(context) {
    const guidance = {
      anxious: 'Be extra reassuring, focus on stability and control, avoid alarming language',
      confused: 'Be very clear and simple, use examples, break things down step by step',
      frustrated: 'Be direct and solution-focused, acknowledge the difficulty',
      curious: 'Share interesting insights, encourage exploration',
      neutral: 'Standard balanced approach'
    };
    return guidance[context] || guidance.neutral;
  },
  
  // Response length guidance
  _getResponseLength(intent) {
    const lengthMap = {
      overview: '150-200 words - comprehensive but scannable',
      health_check: '80-120 words - quick status with key number',
      goal_analysis: '150-200 words - cover each goal briefly',
      what_to_do: '100-150 words - clear action items',
      explanation: '100-150 words - clear explanation',
      scenario: '150-200 words - compare options clearly',
      general: '80-120 words - focused response'
    };
    return lengthMap[intent] || lengthMap.general;
  }
};

// ============================================================================
// 5. RESPONSE FORMATTER - Clean, User-Friendly Output
// ============================================================================

const GiniResponseFormatter = {
  // Format AI response for display
  format(rawResponse) {
    let formatted = rawResponse;
    
    // Remove markdown formatting
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1');
    formatted = formatted.replace(/\*([^*]+)\*/g, '$1');
    formatted = formatted.replace(/`([^`]+)`/g, '$1');
    formatted = formatted.replace(/^#+\s*/gm, '');
    
    // Remove templated labels that look robotic
    formatted = formatted.replace(/^\d+\)\s*(Direct Answer|Key Insight|Specific Numbers|Next Step|Summary|Conclusion):\s*/gim, '');
    formatted = formatted.replace(/^(Direct Answer|Key Insight|Specific Numbers|Next Step|Summary|Conclusion):\s*/gim, '');
    
    // Convert bullet points to cleaner format
    formatted = formatted.replace(/^[-•]\s*/gm, '→ ');
    
    // Clean up numbered lists - make them inline friendly
    formatted = formatted.replace(/^\d+[\.\)]\s+/gm, '• ');
    
    // Clean up excessive newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Trim each line
    formatted = formatted.split('\n').map(line => line.trim()).join('\n');
    
    return formatted.trim();
  },
  
  // Add visual structure to response
  addStructure(response, intent) {
    // Already well-structured responses don't need modification
    if (response.includes('1)') || response.includes('•')) {
      return response;
    }
    
    // For longer responses, add paragraph breaks
    if (response.length > 300) {
      const sentences = response.split(/(?<=[.!?])\s+/);
      if (sentences.length > 4) {
        // Group into paragraphs of 2-3 sentences
        const paragraphs = [];
        for (let i = 0; i < sentences.length; i += 3) {
          paragraphs.push(sentences.slice(i, i + 3).join(' '));
        }
        return paragraphs.join('\n\n');
      }
    }
    
    return response;
  }
};

// ============================================================================
// 6. MAIN GINI AI ENGINE - Orchestrates Everything
// ============================================================================

const GiniAIEngine = {
  profile: null,
  
  // Initialize the engine
  async initialize() {
    this.profile = GiniUserProfile.load();
    console.log('[GiniAI] Engine initialized with profile:', this.profile.lifeStage.stage);
  },
  
  // Process user message and generate response
  async processMessage(userMessage, chatHistory = []) {
    // 1. Load/update profile
    if (!this.profile) {
      this.profile = GiniUserProfile.load();
    }
    
    // 2. Gather comprehensive financial data
    const financialData = this.gatherFinancialData();
    
    // 3. Update profile with latest data
    this.profile = GiniUserProfile.updateFromFinancialData(this.profile, financialData);
    
    // 4. Classify intent and emotional context
    const intent = GiniIntentClassifier.classify(userMessage);
    const emotionalContext = GiniIntentClassifier.detectEmotionalContext(userMessage);
    const toolContext = GiniIntentClassifier.detectToolContext();
    
    // 5. Generate insights
    const insights = GiniInsightsEngine.generateInsights(financialData, this.profile);
    
    // 6. Build token-efficient prompt
    const systemPrompt = this._buildLeanSystemPrompt(
      this.profile, 
      financialData, 
      insights, 
      intent, 
      emotionalContext
    );
    
    // 7. Build context message
    const contextMessage = {
      role: 'system',
      content: systemPrompt
    };
    
    // 8. Build full message array. Pro keeps more conversation memory —
    // remembering what was said two questions ago is what makes it feel
    // like one continuous conversation with an advisor.
    const isPro = Boolean(window.GiniPlan?.isPro?.());
    const historyDepth = isPro ? 10 : 6;
    const messages = [
      contextMessage,
      ...chatHistory.slice(-historyDepth),
      { role: 'user', content: userMessage }
    ];

    // 9. Call AI API with tier-appropriate response budget
    const maxOutputTokens = (typeof window.getChatMaxOutputTokens === 'function')
      ? window.getChatMaxOutputTokens()
      : (isPro ? 420 : 180);
    const rawResponse = await this.callAI(messages, maxOutputTokens);
    
    // 10. Format response
    const formattedResponse = GiniResponseFormatter.format(rawResponse);
    const structuredResponse = GiniResponseFormatter.addStructure(formattedResponse, intent);
    
    // 11. Update profile with interaction
    this.profile = GiniUserProfile.updateKnowledgeLevel(this.profile, userMessage, structuredResponse);
    GiniUserProfile.save(this.profile);
    
    // 12. Track topic in memory
    this._updateMemory(userMessage, intent);
    
    return structuredResponse;
  },
  
  // Gather all financial data (reuse existing function)
  gatherFinancialData() {
    // Use existing comprehensive data gathering
    if (typeof gatherComprehensiveFinancialData === 'function') {
      return gatherComprehensiveFinancialData();
    }
    
    // Fallback minimal structure
    return {
      netWorth: { total: 0, totalAssets: 0, totalLiabilities: 0, debtToAssetRatio: 0, savingsRate: 0 },
      goals: { count: 0, items: [], totalMonthlySIPNeeded: 0, criticalCount: 0, completedCount: 0 },
      portfolio: { totalValue: 0, weightedReturn: 0, allocations: [], riskLevel: 'Unknown' },
      monteCarlo: { hasResults: false },
      requiredReturn: { hasResults: false },
      family: { count: 0, members: [] }
    };
  },

  _formatINR(value) {
    // Region-aware compact money (₹Cr/₹L for India, $K/$M/$B elsewhere).
    if (window.XtinRegion) return XtinRegion.formatMoney(value, { compact: true });
    const n = Number(value) || 0;
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  },

  _buildLeanSystemPrompt(profile, data, insights, intent, emotionalContext) {
    const isPro = Boolean(window.GiniPlan?.isPro?.());

    const profileLine = [
      `knowledge=${profile.knowledgeLevel.level}`,
      `lifeStage=${profile.lifeStage.stage}`,
      `risk=${profile.riskProfile.tolerance}`,
      `tone=${emotionalContext}`,
      `health=${profile.healthSnapshot.overallScore ?? 'unknown'}/100`
    ].join(', ');

    // Region-aware persona: currency symbol + jargon adapt to the visitor's
    // country so a US family hears "$, 401(k)/IRA, term life" not "₹, PPF".
    const _rcfg = window.XtinRegion ? XtinRegion.getRegionConfig() : null;
    const _regionName = _rcfg ? _rcfg.name : 'India';
    const _sym = _rcfg ? _rcfg.symbol.trim() : '₹';
    const _j = _rcfg ? _rcfg.jargon : { sip: 'SIP', taxWrapper: 'PPF/ELSS', retirement: 'EPF/NPS', insurance: 'term insurance' };
    const _numWords = (_rcfg && _rcfg.numberSystem === 'lakh') ? 'lakh/crore' : 'thousands/millions';
    const _contextBits = `${_sym}, ${_numWords}, ${_j.sip}, ${_j.taxWrapper}, ${_j.insurance}`;

    // Human-advisor persona. Depth scales with plan tier, warmth doesn't.
    const lines = [
      `You are Gini, a warm, experienced personal financial advisor sitting across the table from a family in ${_regionName}. You know their finances intimately from the data below.`,
      'HOW TO SPEAK:',
      `- Talk like a trusted human advisor, not a chatbot: natural sentences, plain language, local context (${_contextBits}).`,
      '- Refer to family members BY NAME when relevant (e.g. "for Kiaan\'s education", "when Asha retires").',
      '- Ground every answer in their actual numbers from the data below. NEVER invent figures. If something is missing, say exactly what to add in the app and why it matters.',
      '- Acknowledge feelings first when the user sounds worried or excited, then guide with numbers.',
      '- Match explanation depth to their knowledge level; define any jargon in one short phrase for beginners.',
      isPro
        ? '- LENGTH: 2 to 5 short sentences (up to ~120 words). Explain the reasoning briefly, then end with ONE clear next action. Plain text only, no markdown, no lists.'
        : '- LENGTH: 1 to 2 short sentences (under ~55 words). Lead with the single most important insight and next action. Plain text only, no markdown, no lists.',
      `User profile: ${profileLine}.`,
      `Intent: ${intent.primary.intent}.`,
      isPro
        ? 'Plan: Gini Pro (all modules available: Monte Carlo, Required Return, Family Planning, PDF reports).'
        : 'Plan: Free (Monte Carlo, Required Return, Family Planning and PDF reports are Pro modules — if one would clearly answer their question, mention it honestly, never pushily).'
    ];

    // Family members by name — an advisor who forgets your children's
    // names is not an advisor.
    const members = data.family?.members || [];
    if (members.length > 0) {
      const memberLine = members
        .slice(0, 8)
        .map(m => `${m.name} (${m.relationship}, ${m.age}y${m.isEarner ? `, earns ${this._formatINR(m.income)}/mo` : m.isDependent ? ', dependent' : ''})`)
        .join('; ');
      lines.push(`Family: ${memberLine}.`);
    }

    lines.push(`Net worth: total ${this._formatINR(data.netWorth.total)}, assets ${this._formatINR(data.netWorth.totalAssets)}, liabilities ${this._formatINR(data.netWorth.totalLiabilities)}, debt ratio ${(data.netWorth.debtToAssetRatio || 0).toFixed(1)}%.`);

    if (data.goals.count > 0) {
      const goals = data.goals.items
        .slice(0, 4)
        .map(g => `${g.name}: gap ${this._formatINR(g.gap)}, SIP ${this._formatINR(g.requiredMonthlySIP)}/mo, ${g.yearsLeft}y`)
        .join('; ');
      lines.push(`Goals: ${data.goals.count} active, total SIP needed ${this._formatINR(data.goals.totalMonthlySIPNeeded)}/mo. ${goals}.`);
    } else {
      lines.push('Goals: none entered.');
    }

    if (data.portfolio.totalValue > 0) {
      const allocations = data.portfolio.allocations
        .slice(0, 5)
        .map(a => `${a.type} ${(a.allocation || 0).toFixed(0)}%`)
        .join(', ');
      lines.push(`Portfolio: ${this._formatINR(data.portfolio.totalValue)}, expected return ${(data.portfolio.weightedReturn || 0).toFixed(1)}%, risk ${data.portfolio.riskLevel}, allocation ${allocations}.`);
    }

    if (data.monteCarlo.hasResults) {
      lines.push(`Monte Carlo: success ${(data.monteCarlo.probability || 0).toFixed(0)}%, target ${this._formatINR(data.monteCarlo.target)}, median ${this._formatINR(data.monteCarlo.median)}.`);
    }

    if (data.requiredReturn.hasResults) {
      lines.push(`Required return: ${(data.requiredReturn.requiredRate || 0).toFixed(1)}%, verdict ${data.requiredReturn.verdict || 'not set'}.`);
    }

    if (profile.keyFacts.householdIncome > 0) {
      lines.push(`Family: income ${this._formatINR(profile.keyFacts.householdIncome)}/mo, dependents ${profile.keyFacts.dependentCount}.`);
    }

    const priorities = insights.nextActions?.slice(0, 3).map(a => a.action).join('; ');
    const warnings = [...(insights.critical || []), ...(insights.warnings || [])].slice(0, 3).map(i => i.message).join('; ');
    if (warnings) lines.push(`Warnings: ${warnings}.`);
    if (priorities) lines.push(`Priorities: ${priorities}.`);

    return lines.join('\n');
  },
  
  // Call AI API (via secure proxy)
  async callAI(messages, maxOutputTokens = 180) {
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, maxOutputTokens })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        this.lastUsage = data.usage || null;
        window.__giniLastAIUsage = data.usage || null;
        return data.reply || 'Sorry, I could not generate a response. Please try again.';
      } catch (error) {
        const isNetworkError = error instanceof TypeError && error.message.toLowerCase().includes('fetch');
        console.error(`[GiniAI] API Error (attempt ${attempt + 1}):`, error.message);

        if (isNetworkError) {
          return 'Server not reachable. Open a terminal in the project folder and run: npm run dev — then refresh this page.';
        }

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }

        return `AI error: ${error.message}. If this persists, restart the server with: npm run dev`;
      }
    }
  },
  
  // Update conversation memory
  _updateMemory(message, intent) {
    if (!this.profile.memory.recentTopics) {
      this.profile.memory.recentTopics = [];
    }
    
    this.profile.memory.recentTopics.unshift({
      topic: intent.primary.intent,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 topics
    this.profile.memory.recentTopics = this.profile.memory.recentTopics.slice(0, 20);
  },
  
  // Get quick insights for dashboard
  getQuickInsights() {
    const data = this.gatherFinancialData();
    if (!this.profile) {
      this.profile = GiniUserProfile.load();
    }
    this.profile = GiniUserProfile.updateFromFinancialData(this.profile, data);
    return GiniInsightsEngine.generateInsights(data, this.profile);
  },
  
  // Get user profile summary
  getProfileSummary() {
    if (!this.profile) {
      this.profile = GiniUserProfile.load();
    }
    return {
      lifeStage: this.profile.lifeStage.stage,
      riskProfile: this.profile.riskProfile.tolerance,
      knowledgeLevel: this.profile.knowledgeLevel.level,
      healthScore: this.profile.healthSnapshot.overallScore,
      interactionCount: this.profile.behavior.interactionCount
    };
  }
};

// ============================================================================
// 7. QUICK ACTION HANDLERS
// ============================================================================

const GiniQuickActions = {
  async healthCheck() {
    return await GiniAIEngine.processMessage('How am I doing financially? Give me a quick health check.');
  },
  
  async goalReview() {
    return await GiniAIEngine.processMessage('Review my goals and tell me if I am on track.');
  },
  
  async whatNext() {
    return await GiniAIEngine.processMessage('What should I focus on next? Give me my top 3 priorities.');
  },
  
  async portfolioReview() {
    return await GiniAIEngine.processMessage('How does my portfolio look? Any changes needed?');
  },
  
  async retirementCheck() {
    return await GiniAIEngine.processMessage('Am I on track for retirement? What is my current projection?');
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  GiniAIEngine.initialize();
});

// Export for use in main app
window.GiniAIEngine = GiniAIEngine;
window.GiniQuickActions = GiniQuickActions;
window.GiniUserProfile = GiniUserProfile;
