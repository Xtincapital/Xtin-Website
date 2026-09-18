# Xtin Gini AI Engine v2.0 - Architecture Documentation

## Overview

The Gini AI Engine v2.0 is a comprehensive upgrade to the financial advisor chatbot, implementing:

- **Deep Data Awareness** - Access to all platform tools (family, goals, networth, portfolio, calculators)
- **Persistent User Intelligence Profile** - Remembers context across sessions
- **Advanced Reasoning** - Scenario analysis, trade-off evaluation
- **Human-Friendly Responses** - Structured, conversational, not robotic
- **Adaptive Communication** - Adjusts to user knowledge level

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION LAYER                             │
│                     (Chat UI, Quick Actions, Voice)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTENT CLASSIFICATION LAYER                           │
│  • Query Analysis  • Context Detection  • Tool Routing  • Emotional Tone    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATA AGGREGATION & INSIGHT LAYER                        │
│  • Cross-tool Data  • Computed Insights  • Anomaly Detection  • Trends      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    USER INTELLIGENCE PROFILE (Persistent)                   │
│  • Life Stage  • Risk Tolerance  • Knowledge Level  • Preferences  • History│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROMPT ORCHESTRATION LAYER                             │
│  • Dynamic System Prompt  • Context Injection  • Response Rules             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LLM API LAYER                                      │
│              (Claude via secure proxy with Retry & Fallback)                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESPONSE FORMATTING LAYER                                │
│  • Structure Detection  • Markdown Cleanup  • UI-Friendly Output            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. GiniUserProfile

**Purpose**: Persistent user intelligence stored in localStorage

**Key Properties**:
```javascript
{
  lifeStage: {
    stage: 'early_career' | 'family_building' | 'peak_earning' | 'pre_retirement' | 'retired',
    confidence: 0-100,
    indicators: []
  },
  riskProfile: {
    tolerance: 'conservative' | 'moderate' | 'aggressive',
    derivedFrom: [], // Behavioral indicators
    equityComfort: 0-100,
    volatilityTolerance: 0-100
  },
  knowledgeLevel: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    preferredDepth: 'simple' | 'detailed' | 'technical',
    financialTermsFamiliarity: [] // Terms user has used
  },
  healthSnapshot: {
    overallScore: 0-100,
    emergencyFundMonths: number,
    debtToIncomeRatio: number,
    savingsRate: number,
    goalFundingStatus: number
  },
  memory: {
    recentTopics: [],
    pendingFollowUps: [],
    importantDiscussions: []
  }
}
```

**Methods**:
- `load()` - Load profile from localStorage
- `save(profile)` - Save profile
- `updateFromFinancialData(profile, data)` - Update profile based on latest financial data
- `updateKnowledgeLevel(profile, query, response)` - Learn from interactions

---

### 2. GiniIntentClassifier

**Purpose**: Understand what the user wants and detect emotional context

**Intent Categories**:
| Intent | Keywords | Priority |
|--------|----------|----------|
| `overview` | overview, summary, how am i doing | 1 |
| `health_check` | am i on track, health, score | 1 |
| `goal_analysis` | goals, targets, save for | 2 |
| `portfolio_review` | portfolio, investments, allocation | 2 |
| `what_to_do` | what should i, recommend, suggest | 1 |
| `scenario` | what if, compare, alternative | 3 |
| `explanation` | what is, explain, how does | 4 |

**Emotional Context Detection**:
- `anxious` - worried, concerned, scared
- `confused` - lost, overwhelmed
- `curious` - interested, wondering
- `frustrated` - annoyed, not working
- `neutral` - default

---

### 3. GiniInsightsEngine

**Purpose**: Generate actionable insights from financial data

**Insight Categories**:

1. **Critical Issues**
   - High debt ratio (>50%)
   - Unrealistic required returns (>18%)
   - Low Monte Carlo probability (<50%)

2. **Warnings**
   - Moderate debt (30-50%)
   - Aggressive goal targets
   - Risk mismatch

3. **Opportunities**
   - Improvable Monte Carlo probability
   - Strong savings rate for optimization

4. **Achievements**
   - Goals achieved
   - High success probability
   - Low debt ratio

5. **Next Actions** (Prioritized)
   - Emergency fund gaps
   - Debt reduction needs
   - Goal definition needs
   - Portfolio optimization

---

### 4. GiniPromptBuilder

**Purpose**: Build intelligent, context-aware system prompts

**Dynamic Prompt Structure**:
```
CORE IDENTITY & APPROACH
├── Personality traits
├── Communication style based on:
│   ├── Knowledge level
│   ├── Life stage  
│   ├── Risk tolerance
│   └── Emotional context

COMPLETE FINANCIAL PICTURE
├── Net Worth summary
├── Goals with calculations
├── Portfolio analysis
├── Monte Carlo results
├── Required return analysis
└── Family information

CURRENT INSIGHTS & PRIORITIES
├── Critical issues
├── Warnings
├── Achievements
└── Next actions

RESPONSE RULES
├── Structure (Direct Answer → Key Insight → Numbers → Next Step)
├── Formatting (No markdown, natural language)
├── Tone guidelines
└── Length guidance (varies by intent)
```

---

### 5. GiniResponseFormatter

**Purpose**: Clean and structure AI responses for display

**Formatting Rules**:
- Remove markdown (`**`, `*`, `` ` ``, `#`)
- Convert bullets to `• `
- Convert numbered lists to `1) 2) 3)`
- Clean excessive newlines
- Add paragraph structure for long responses

---

### 6. GiniAIEngine (Main Orchestrator)

**Purpose**: Coordinate all components to process user messages

**Flow**:
```
1. Load/update user profile
2. Gather comprehensive financial data
3. Update profile with latest data
4. Classify intent and emotional context
5. Generate insights
6. Build optimized prompt
7. Call AI API
8. Format response
9. Update profile with interaction
10. Save profile
```

---

## Quick Actions

Pre-defined actions for common queries:

| Action | Prompt Generated |
|--------|------------------|
| Health Check | "How am I doing financially? Give me a quick health check." |
| Goal Review | "Review my goals and tell me if I am on track." |
| What's Next | "What should I focus on next? Give me my top 3 priorities." |
| Portfolio | "How does my portfolio look? Any changes needed?" |
| Retirement | "Am I on track for retirement? What is my current projection?" |

---

## Usage

### Initialize the Engine:
```javascript
// Automatically initialized on page load
window.GiniAIEngine.initialize();
```

### Process a Message:
```javascript
const response = await window.GiniAIEngine.processMessage(
  "Am I on track for retirement?",
  chatHistory // array of {role, content}
);
```

### Get Quick Insights:
```javascript
const insights = window.GiniAIEngine.getQuickInsights();
// Returns { critical, warnings, opportunities, achievements, nextActions }
```

### Get Profile Summary:
```javascript
const summary = window.GiniAIEngine.getProfileSummary();
// Returns { lifeStage, riskProfile, knowledgeLevel, healthScore, interactionCount }
```

---

## Response Quality Guidelines

### Structure Every Response As:
1. **Direct Answer** (1-2 sentences) - Immediately address the question
2. **Key Insight** (if relevant) - One important thing to know
3. **Specific Numbers** - Use actual user data
4. **Next Step** - One clear action to take

### Response Length by Intent:
- Overview: 150-200 words
- Health check: 80-120 words
- What to do: 100-150 words
- Scenarios: 150-200 words
- General: 80-120 words

### Tone Adapts By:
- **Anxious users**: Extra reassuring, focus on stability
- **Confused users**: Simple, step-by-step, with examples
- **Frustrated users**: Direct, solution-focused
- **Curious users**: Share insights, encourage exploration

---

## Files Modified

| File | Changes |
|------|---------|
| `gini-ai-engine.js` | **NEW** - Complete AI engine implementation |
| `index.html` | Enhanced chatbot UI with quick actions |
| `style.css` | Premium chatbot styling |
| `app.js` | Integration with new AI engine |
| `ai.routes.mjs` | Enhanced endpoint for complex prompts |

---

## Future Enhancements

1. **Voice Input/Output** - Speech-to-text and text-to-speech
2. **Proactive Notifications** - Alert users to issues without asking
3. **Goal Simulation** - "What if" scenarios with visual charts
4. **Learning from Corrections** - User can correct AI and it remembers
5. **Multi-language Support** - Hindi, regional languages
6. **Export Conversations** - Save advice as PDF
