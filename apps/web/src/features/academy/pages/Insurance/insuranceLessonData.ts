export const insuranceLessons = [
  {
    num: 1,
    title: "Why Insurance Exists",
    subtitle: "Protection vs investment",
    duration: "8 min",
    objectives: ["Understand the purpose of insurance", "Separate protection from investment", "Know which risks deserve cover"],
    sections: [
      {
        heading: "Insurance Is Risk Transfer",
        body: [
          "Insurance protects you from large, unpredictable financial shocks. You pay a smaller known premium so a major emergency does not damage your savings, investments, or family goals.",
          "The goal is not to make returns. The goal is to avoid a financial disaster."
        ],
        bullets: ["Hospital bills", "Loss of an earning member", "Accidents or disability", "Major property or vehicle damage"],
        callout: { type: "principle", title: "Simple Rule", text: "Insure risks that are rare but financially painful. Pay small expenses yourself." }
      },
      {
        heading: "Protection Is Not Investment",
        body: [
          "An investment should grow wealth. Insurance should protect wealth. When a product tries to do both, compare costs, returns, cover, and flexibility carefully.",
          "For most people, simple protection plus separate investing is easier to understand."
        ]
      }
    ],
    quiz: { question: "What is the main purpose of insurance?", options: ["High returns", "Risk protection", "Daily spending"], correct: 1, explanation: "Insurance is primarily for protection against large losses." },
    takeaway: "Insurance protects the financial plan before investments try to grow it."
  },
  {
    num: 2,
    title: "Health Insurance Basics",
    subtitle: "Sum insured, waiting periods, exclusions",
    duration: "10 min",
    objectives: ["Understand health policy terms", "Know what to check before buying", "Avoid relying only on employer cover"],
    sections: [
      {
        heading: "Why Health Cover Comes First",
        body: [
          "Medical costs can arrive suddenly and can be much larger than normal savings. A good health policy helps you focus on treatment instead of arranging money in panic.",
          "Employer cover is useful, but it is linked to your job. Personal cover gives continuity."
        ],
        bullets: ["Sum insured", "Waiting period", "Exclusions", "Network hospitals", "Co-pay", "Room rent limit"],
        callout: { type: "warning", title: "Read the Conditions", text: "A low premium can hide co-pay, room rent caps, long waiting periods, or weak hospital networks." }
      }
    ],
    quiz: { question: "What is a waiting period?", options: ["Time before certain claims are covered", "Hospital billing time", "Premium payment date"], correct: 0, explanation: "Some illnesses or pre-existing conditions are covered only after a waiting period." },
    takeaway: "A health policy is only as strong as its terms."
  },
  {
    num: 3,
    title: "Term Life Insurance",
    subtitle: "Who needs it and how much cover",
    duration: "9 min",
    objectives: ["Know who needs term cover", "Estimate cover amount", "Understand riders and disclosure"],
    sections: [
      {
        heading: "Who Needs Term Insurance?",
        body: [
          "Term insurance is mainly for people whose income supports others. If your family depends on your income, term cover can replace future income if you are no longer around.",
          "If nobody depends on your income, life insurance may not be urgent."
        ],
        bullets: ["Dependents", "Home loan or other large liabilities", "Children's education goals", "Family lifestyle funded by your income"],
        callout: { type: "principle", title: "Cover Estimate", text: "A rough starting point is 10 to 15 times annual income, plus loans, minus existing financial assets." }
      }
    ],
    quiz: { question: "Who usually needs term insurance most?", options: ["Someone with dependents", "A child with no income", "Someone buying only for returns"], correct: 0, explanation: "Term insurance protects dependents from loss of income." },
    takeaway: "Buy term insurance for family protection, not returns."
  },
  {
    num: 4,
    title: "Insurance Mistakes to Avoid",
    subtitle: "Underinsurance, tax traps, hidden disclosures",
    duration: "9 min",
    objectives: ["Avoid common buying mistakes", "Know why disclosure matters", "Spot unsuitable products"],
    sections: [
      {
        heading: "Common Mistakes",
        body: [
          "Many people buy insurance only for tax saving, choose too little cover, or mix protection and investment without understanding costs.",
          "The most dangerous mistake is hiding medical history. It can create claim disputes later."
        ],
        bullets: ["Buying only for tax benefit", "Too little health or life cover", "Ignoring exclusions", "Hiding smoking or illness history", "Buying products you cannot explain"],
        callout: { type: "warning", title: "Be Honest", text: "Never hide medical details to reduce premium. A cheaper policy is useless if the claim is disputed." }
      }
    ],
    quiz: { question: "Why is hiding medical history risky?", options: ["It can cause claim disputes", "It improves coverage", "It removes waiting periods"], correct: 0, explanation: "Incorrect disclosure can create claim rejection or dispute risk." },
    takeaway: "Good insurance is simple, adequate, and honestly disclosed."
  },
  {
    num: 5,
    title: "How to Read a Policy",
    subtitle: "Premium, exclusions, deductibles",
    duration: "10 min",
    objectives: ["Read policy documents confidently", "Understand exclusions", "Know what to verify after purchase"],
    sections: [
      {
        heading: "Start With the Schedule",
        body: [
          "The policy schedule summarizes insured members, cover amount, premium, policy period, nominee, and major benefits.",
          "Then read exclusions, waiting periods, sub-limits, deductibles, restoration benefit, and claim process."
        ],
        bullets: ["Names and ages", "Sum insured", "Nominee", "Waiting periods", "Permanent exclusions", "Claim procedure"],
        callout: { type: "principle", title: "Reading Order", text: "Schedule first, then benefits, exclusions, waiting periods, limits, claim process, and renewal terms." }
      }
    ],
    quiz: { question: "Which section tells what is not covered?", options: ["Exclusions", "Logo", "Payment receipt"], correct: 0, explanation: "Exclusions define what the policy will not cover." },
    takeaway: "The brochure sells the policy. The wording defines the policy."
  },
  {
    num: 6,
    title: "Choosing the Right Cover",
    subtitle: "Individual, family floater, parents, employer cover",
    duration: "10 min",
    objectives: ["Choose cover by family need", "Understand family floaters", "Think through parents' cover"],
    sections: [
      {
        heading: "Match Cover to Family Structure",
        body: [
          "An individual policy gives separate cover to each person. A family floater shares one cover across members.",
          "Parents may need separate cover because age, medical history, and claim probability are different."
        ],
        bullets: ["City and hospital costs", "Family size", "Employer cover", "Parents' health history", "Co-pay and waiting periods"],
        callout: { type: "principle", title: "Decision Lens", text: "Ask how much you can pay without breaking investments or taking debt if a large hospital bill arrives." }
      }
    ],
    quiz: { question: "What is a family floater?", options: ["Shared cover for insured family members", "Only senior citizen cover", "Investment plan"], correct: 0, explanation: "A family floater shares one sum insured among covered members." },
    takeaway: "The right cover depends on your family, city, health history, and emergency capacity."
  },
  {
    num: 7,
    title: "Insurance Checklist",
    subtitle: "A practical buying framework",
    duration: "9 min",
    objectives: ["Use a checklist before buying", "Compare more than premium", "Review cover every year"],
    sections: [
      {
        heading: "Before You Buy",
        body: [
          "Start with the risk you want to protect. Then compare policies using the same cover amount and read terms calmly.",
          "Review your insurance when income, family, loans, dependents, or health situation changes."
        ],
        bullets: ["Need and purpose", "Cover amount", "Exclusions", "Waiting periods", "Claim process", "Nominee", "Annual review"],
        callout: { type: "warning", title: "Do Not Rush", text: "If a product is pushed as urgent or limited-time, slow down and read the terms." }
      }
    ],
    quiz: { question: "What should you compare besides premium?", options: ["Exclusions, limits, network, claim process", "Only ads", "Only tax benefit"], correct: 0, explanation: "Protection quality depends on terms, not only price." },
    takeaway: "A policy should pass your checklist before it gets your money."
  }
];
