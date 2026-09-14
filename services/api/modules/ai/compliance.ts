// Post-generation compliance guardrail for XtinAI chat responses.
//
// Prompt instructions (see promptBuilder.ts) ask the model not to make
// guarantees or give personalized buy/sell advice, but an LLM can ignore its
// system prompt. This enforces it after the fact: strips known prohibited
// phrases from the actual output and force-injects SEBI-style risk
// disclaimers, regardless of what the model wrote. Ported from the retired
// Python service's ComplianceEngine (services/ai-legacy/app/compliance_engine.py).

export type RiskLevel = "low" | "medium" | "high" | "critical";

const PROHIBITED_PHRASES = [
  "guaranteed returns",
  "risk-free",
  "sure profit",
  "cannot lose",
  "certain to",
  "will definitely",
  "100% returns",
  "no risk",
  "promised returns",
];

const DISCLAIMER_TRIGGERS: Record<string, string[]> = {
  investment_advice: ["invest", "buy", "sell", "trade", "portfolio", "stock pick"],
  market_prediction: ["will rise", "will fall", "expected to", "forecast", "predict"],
  returns: ["return", "gain", "profit", "growth", "appreciation"],
  risk: ["risk", "volatile", "speculation", "derivative", "leverage"],
};

const CRITICAL_QUERY_PATTERNS = [
  "should i buy",
  "should i sell",
  "my portfolio",
  "what should i invest in",
  "which stock for me",
  "recommend for my",
  "advise me",
  "tell me what to buy",
];

const HIGH_QUERY_PATTERNS = ["should i", "is this good", "price target"];

const MEDIUM_QUERY_PATTERNS = [
  "what is the market",
  "how is sector",
  "market trend",
  "stock performance",
  "fund returns",
];

export function assessQueryRisk(query: string): RiskLevel {
  const q = query.toLowerCase();
  if (CRITICAL_QUERY_PATTERNS.some((p) => q.includes(p))) return "critical";
  if (HIGH_QUERY_PATTERNS.some((p) => q.includes(p))) return "high";
  if (MEDIUM_QUERY_PATTERNS.some((p) => q.includes(p))) return "medium";
  return "low";
}

// Strip the model's own "Disclaimer:"-style paragraphs so we don't end up
// with two disclaimers stacked on top of each other.
function stripModelDisclaimers(text: string): string {
  let cleaned = text.replace(
    /\n\n\*\*(Disclaimer|Important Note|Compliance Note|Notice):\*\*[^\n]*(?:\n[^\n]+)*/gi,
    ""
  );

  const disclaimerKeywords = [
    "personalized",
    "financial advisor",
    "registered",
    "consult",
    "risk tolerance",
    "investment recommendation",
    "guarantee",
    "not provide",
    "educational purposes only",
  ];

  cleaned = cleaned
    .split("\n\n")
    .filter((para) => {
      const lower = para.toLowerCase();
      const keywordCount = disclaimerKeywords.filter((kw) => lower.includes(kw)).length;
      const looksLikeDisclaimer =
        keywordCount >= 3 ||
        (keywordCount >= 2 && /disclaimer|reminder|compliance/i.test(lower));
      return !looksLikeDisclaimer;
    })
    .join("\n\n")
    .trim();

  return cleaned;
}

function injectDisclaimers(response: string, categories: Set<string>, riskLevel: RiskLevel): string {
  const disclaimers: string[] = [];

  if (riskLevel === "medium" || riskLevel === "high" || riskLevel === "critical") {
    disclaimers.push(
      "\n\n---\n⚠️ **Disclaimer**: This information is for educational purposes only and should not be considered as personalized financial advice. "
    );
  }
  if (categories.has("investment_advice") || riskLevel === "high") {
    disclaimers.push(
      "Investments in securities market are subject to market risks. Please read all related documents carefully before investing. "
    );
  }
  if (categories.has("returns") || categories.has("market_prediction")) {
    disclaimers.push("Past performance is not indicative of future results. ");
  }
  if (categories.has("risk")) {
    disclaimers.push("All investments involve varying degrees of risk, including loss of principal. ");
  }
  if (disclaimers.length === 0) return response;

  disclaimers.push("For personalized advice, please consult a qualified financial advisor. ");
  const block = disclaimers.join("");
  const separator = block.startsWith("\n") ? "" : "\n\n";
  return response + separator + block;
}

export interface ComplianceResult {
  response: string;
  riskLevel: RiskLevel;
  violations: string[];
}

// Scans the model's actual reply, redacts prohibited claims, and forces in
// the disclaimers its content requires — independent of what the prompt asked for.
export function enforceCompliance(rawResponse: string, query: string): ComplianceResult {
  const riskLevel = assessQueryRisk(query);
  const violations: string[] = [];

  let response = stripModelDisclaimers(rawResponse);

  const lowerResponse = response.toLowerCase();
  for (const phrase of PROHIBITED_PHRASES) {
    if (lowerResponse.includes(phrase)) {
      violations.push(phrase);
      response = response.replace(new RegExp(phrase, "gi"), "[REMOVED: PROHIBITED CLAIM]");
    }
  }

  const categories = new Set<string>();
  const finalLower = response.toLowerCase();
  for (const [category, triggers] of Object.entries(DISCLAIMER_TRIGGERS)) {
    if (triggers.some((t) => finalLower.includes(t))) categories.add(category);
  }

  response = injectDisclaimers(response, categories, riskLevel);

  if (violations.length > 0) {
    console.warn(`[Compliance] Redacted prohibited phrase(s) in AI response: ${violations.join(", ")}`);
  }

  return { response, riskLevel, violations };
}
