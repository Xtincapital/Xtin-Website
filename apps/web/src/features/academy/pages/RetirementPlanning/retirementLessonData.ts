export const retirementLessons = [
  {
    num: 1,
    title: "Why Retirement Planning Matters",
    subtitle: "Freedom, inflation, and longer life",
    duration: "9 min",
    objectives: ["Understand retirement as financial independence", "Know why inflation matters", "See why starting early helps"],
    sections: [
      {
        heading: "Retirement Is Future Income Planning",
        body: [
          "Retirement planning is about building enough assets so your lifestyle does not depend only on active salary.",
          "For some people it means stopping work at 60. For others it means having the freedom to change careers, work less, or support family calmly."
        ],
        bullets: ["Inflation raises future expenses", "Healthcare costs can rise sharply", "Longer life means money must last longer"],
        callout: { type: "principle", title: "Core Idea", text: "You are replacing salary with investment income, pension income, or planned withdrawals." }
      }
    ],
    quiz: { question: "What is retirement planning mainly replacing?", options: ["Active income", "All taxes", "Health insurance"], correct: 0, explanation: "Retirement planning builds income sources for when salary reduces or stops." },
    takeaway: "Retirement planning is freedom planning, and it works best when started early."
  },
  {
    num: 2,
    title: "How Much Money Will You Need?",
    subtitle: "Future expenses and inflation",
    duration: "10 min",
    objectives: ["Estimate retirement expenses", "Adjust for inflation", "Avoid corpus guesswork"],
    sections: [
      {
        heading: "Start With Expenses",
        body: [
          "Begin with today's monthly household expenses, then adjust for costs that may end and costs that may rise.",
          "At 6 percent inflation, expenses roughly double every 12 years, so today's budget cannot be used directly for retirement."
        ],
        bullets: ["Needs", "Lifestyle spending", "Healthcare", "Housing", "Dependents", "Travel"],
        callout: { type: "warning", title: "Common Mistake", text: "Planning with today's expenses without inflation can create a large future shortfall." }
      }
    ],
    quiz: { question: "Why adjust expenses for inflation?", options: ["Future costs are likely higher", "Age reduces costs automatically", "Taxes disappear"], correct: 0, explanation: "Inflation raises the cost of goods and services over time." },
    takeaway: "Your retirement target begins with expenses, not random corpus numbers."
  },
  {
    num: 3,
    title: "EPF, PPF, NPS and Pension Basics",
    subtitle: "India-focused retirement instruments",
    duration: "11 min",
    objectives: ["Understand EPF, PPF, and NPS", "Know pension and annuity basics", "Use each product correctly"],
    sections: [
      {
        heading: "Retirement Tools in India",
        body: [
          "EPF is a salary-linked retirement saving mechanism. PPF is a long-term government-backed savings product. NPS is a market-linked retirement product with withdrawal and annuity rules.",
          "Each has a different role, tax treatment, liquidity profile, and risk level."
        ],
        bullets: ["EPF for salaried retirement savings", "PPF for conservative long-term savings", "NPS for disciplined retirement investing", "Annuities for regular income"],
        callout: { type: "principle", title: "Choose by Fit", text: "Do not choose instruments only for tax benefits. Choose them by time horizon, risk, and liquidity needs." }
      }
    ],
    quiz: { question: "Which statement about NPS is most accurate?", options: ["It is market-linked", "It is only a bank account", "It has no rules"], correct: 0, explanation: "NPS is a market-linked retirement product with specific exit and annuity rules." },
    takeaway: "EPF, PPF, NPS, and pensions are tools. The right mix depends on your situation."
  },
  {
    num: 4,
    title: "Retirement Corpus Calculation",
    subtitle: "Goal amount and monthly investing",
    duration: "10 min",
    objectives: ["Understand corpus logic", "Work backward to monthly investing", "Review assumptions"],
    sections: [
      {
        heading: "Estimate the Corpus",
        body: [
          "First estimate annual retirement expenses. Then decide a reasonable withdrawal rate and investment return assumption.",
          "A simple starting method is the withdrawal-rate approach."
        ],
        bullets: ["Annual retirement expense", "Inflation assumption", "Expected return", "Years in retirement", "Existing assets"],
        callout: { type: "principle", title: "Simple Example", text: "If annual retirement expense is Rs. 12 lakh and withdrawal rate is 4 percent, rough corpus is Rs. 3 crore." }
      }
    ],
    quiz: { question: "What happens if you start late?", options: ["Monthly investment usually rises", "Corpus need becomes zero", "Inflation stops"], correct: 0, explanation: "Less time means less compounding, so monthly investment required is usually higher." },
    takeaway: "A retirement corpus is an estimate that guides action and needs regular review."
  },
  {
    num: 5,
    title: "Asset Allocation for Retirement",
    subtitle: "Equity, debt, gold, and risk by age",
    duration: "10 min",
    objectives: ["Understand growth and stability", "Adjust risk by age", "Avoid extreme allocation"],
    sections: [
      {
        heading: "Growth and Stability",
        body: [
          "Retirement investing needs growth assets to fight inflation and stable assets to reduce volatility.",
          "The balance changes as you move from accumulation to withdrawal."
        ],
        bullets: ["Equity for long-term growth", "Debt for stability", "Gold as limited diversification", "Emergency fund outside retirement portfolio"],
        callout: { type: "warning", title: "Avoid Extremes", text: "All equity near retirement can be risky. All fixed income too early can fail against inflation." }
      }
    ],
    quiz: { question: "Why include growth assets?", options: ["To fight inflation over long periods", "To remove all risk", "To avoid saving"], correct: 0, explanation: "Growth assets can help the portfolio keep pace with inflation over long horizons." },
    takeaway: "Retirement allocation should evolve from growth-focused to withdrawal-ready."
  },
  {
    num: 6,
    title: "Withdrawal Strategy",
    subtitle: "SWP, buckets, taxes, and depletion risk",
    duration: "10 min",
    objectives: ["Understand withdrawals", "Learn bucket strategy", "Reduce depletion risk"],
    sections: [
      {
        heading: "Withdrawal Needs Discipline",
        body: [
          "Accumulation is when you build the corpus. Withdrawal is when the corpus funds lifestyle.",
          "Market falls hurt more during withdrawal because you may be selling assets while prices are down."
        ],
        bullets: ["Keep near-term expenses safe", "Use medium-term conservative buckets", "Keep long-term assets growing", "Review withdrawals annually"],
        callout: { type: "principle", title: "Bucket Strategy", text: "Separate money by time horizon so you do not have to sell volatile assets during a downturn." }
      }
    ],
    quiz: { question: "Why keep near-term expenses in safer assets?", options: ["To avoid forced selling during market falls", "To guarantee high returns", "To remove taxes"], correct: 0, explanation: "Safer buckets reduce the need to sell volatile assets at bad times." },
    takeaway: "Retirement success is not only about building corpus. It is also about withdrawing wisely."
  },
  {
    num: 7,
    title: "Retirement Checklist",
    subtitle: "A practical plan by age",
    duration: "10 min",
    objectives: ["Create an age-wise plan", "Review annually", "Use retirement tools"],
    sections: [
      {
        heading: "Checklist by Life Stage",
        body: [
          "In your 20s and 30s, focus on habit, emergency fund, insurance, and growth. In your 40s and 50s, sharpen numbers, reduce debt, and prepare safer buckets.",
          "Before retirement, map income sources, expenses, insurance, emergency fund, nominees, taxes, and withdrawals."
        ],
        bullets: ["Start early", "Increase investments with income", "Review corpus annually", "Close high-interest debt", "Plan healthcare", "Keep nominees updated"],
        callout: { type: "principle", title: "Annual Review", text: "Review your retirement plan once a year and after major life changes." }
      }
    ],
    quiz: { question: "Which habit is useful at every age?", options: ["Annual review", "Ignoring inflation", "Keeping nominees outdated"], correct: 0, explanation: "Annual reviews keep the plan aligned with life changes and inflation." },
    takeaway: "A retirement plan is a living system. Build it early and update it often."
  }
];
