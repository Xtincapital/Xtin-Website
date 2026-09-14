// AI Service for Financial Analysis Report Generation — Node/TS port of
// `utils/ai_analyzer.py`'s `AIAnalyzer` class.
//
// Deviation from the Python source: `ai_analyzer.py` holds its own
// Anthropic/OpenAI client instances and `analysis.py`'s call site loops over
// `provider_order` (["anthropic", "openai"]), instantiating a fresh
// `AIAnalyzer(provider=prov)` per attempt so a transient outage on one
// provider falls back to the other. This repo's `modules/ai/providers.ts`
// (`generateAIText`) already implements that exact same "Claude primary via
// ANTHROPIC_API_KEY, Groq/OpenAI fallback" selection internally — see its
// header comment. So this port makes a single `generateAIText` call instead
// of re-implementing the provider loop; the fallback behavior is preserved,
// just moved one layer down. `getAIProviderInfo()` is used to tag which
// provider produced the report and to short-circuit with a 503-equivalent
// error when nothing is configured.
//
// Deviation: `tokens_used` (Python) fed `utils/token_wallet.py`'s metering,
// a later, separate billing task. `generateAIText` doesn't return a usage
// count, so `tokens_used` here is always `null` — explicitly not estimated,
// per the task brief ("omit real token metering").
//
// Ported faithfully: the full prompt-building logic — investor-style
// guidance, horizon guidance, region/currency resolution (including the
// ticker-suffix fallback), pro-tier vs free-tier JSON schema, and the
// anti-hallucination rules block. `generate_executive_summary` (an unused
// helper — never called from `analysis.py`) is intentionally NOT ported.
import { generateAIText, getAIProviderInfo } from "../ai/providers.js";

export interface AnalyzeFinancialDocumentOptions {
    extractedText: string;
    companyName: string;
    ticker: string;
    investorStyle?: string;
    horizon?: string;
    tier?: string;
    region?: string | null;
}

export interface AnalysisResult {
    success: boolean;
    error?: string;
    company?: string;
    ticker?: string;
    exchange?: string;
    overall_score?: number;
    summary?: string;
    plain_english?: string;
    metrics?: Record<string, unknown>;
    key_ratios?: unknown[];
    strengths?: string[];
    red_flags?: string[];
    investment_assessment?: string;
    personalized_take?: string;
    bull_case?: string[];
    bear_case?: string[];
    what_to_watch?: string[];
    peer_context?: string;
    data_confidence?: { score: number; note: string };
    tokens_used?: number | null;
    provider?: string;
    [key: string]: unknown;
}

/** Returns true if at least one AI provider `generateAIText` can use is configured. */
export function isAiAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
}

// How each investor style shifts the lens of the analysis + the voice.
const STYLE_GUIDANCE: Record<string, string> = {
    beginner:
        "The reader is new to investing. Explain every ratio in one plain-English phrase, avoid jargon, and be encouraging but honest. Emphasise what the numbers mean for a first-time investor.",
    value: "The reader is a value investor. Focus on valuation vs intrinsic worth, margin of safety, balance-sheet strength, free cash flow, and whether the price offers a discount.",
    growth: "The reader is a growth investor. Focus on revenue/earnings growth rates, reinvestment, market expansion, operating leverage, and durability of the growth story.",
    income: "The reader is an income investor. Focus on dividend yield, payout ratio, dividend coverage, cash-flow stability, and the sustainability of distributions.",
    trader: "The reader is a shorter-term, momentum-aware trader. Focus on recent trend, catalysts, earnings surprises, and near-term risks, while still grounding everything in fundamentals.",
    balanced: "The reader is a balanced long-term investor. Give a well-rounded view of quality, valuation and risk.",
};

const HORIZON_GUIDANCE: Record<string, string> = {
    long_term: "Frame the recommendation for a multi-year holding period.",
    medium: "Frame the recommendation for a 6–18 month horizon.",
    short: "Frame the recommendation for a shorter, catalyst-driven horizon.",
};

// Currency symbol + market conventions per region bucket. Keeps reports in
// the reader's own currency and market vocabulary.
const REGION_MARKET: Record<string, [symbol: string, code: string, note: string]> = {
    IN: ["₹", "INR", "Indian market conventions (NSE/BSE, crore/lakh, figures in ₹)."],
    US: ["$", "USD", "US market conventions (NYSE/NASDAQ, millions/billions, figures in $)."],
    GB: ["£", "GBP", "UK market conventions (LSE, millions/billions, figures in £)."],
    EU: ["€", "EUR", "Eurozone market conventions (figures in €)."],
    AE: ["AED ", "AED", "UAE market conventions (figures in AED)."],
    SG: ["S$", "SGD", "Singapore market conventions (SGX, figures in S$)."],
    GLOBAL: ["$", "USD", "international market conventions (figures in $)."],
};

// Map a ticker's exchange suffix to a region, as a fallback when the caller
// doesn't pass an explicit region.
const SUFFIX_REGION: Record<string, string> = {
    ".NS": "IN",
    ".BO": "IN",
    ".L": "GB",
    ".PA": "EU",
    ".DE": "EU",
    ".AS": "EU",
    ".MI": "EU",
    ".SI": "SG",
    ".AE": "AE",
    ".DU": "AE",
};

/** Port of `_resolve_market`. Returns [symbol, currencyCode, conventionsNote]. */
function resolveMarket(ticker: string, region?: string | null): [string, string, string] {
    const code = (region || "").toUpperCase();
    if (REGION_MARKET[code]) return REGION_MARKET[code];

    const tk = (ticker || "").toUpperCase();
    for (const [suffix, regionCode] of Object.entries(SUFFIX_REGION)) {
        if (tk.endsWith(suffix)) return REGION_MARKET[regionCode];
    }
    return REGION_MARKET.GLOBAL; // bare/US-style tickers -> USD
}

/** Port of `_create_analysis_prompt`. */
function createAnalysisPrompt(opts: {
    text: string;
    companyName: string;
    ticker: string;
    investorStyle: string;
    horizon: string;
    tier: string;
    region?: string | null;
}): string {
    const { companyName, ticker, investorStyle, horizon, tier, region } = opts;
    let text = opts.text;

    // Truncate text if too long (keep first and last portions).
    const maxLength = 30000;
    if (text.length > maxLength) {
        const midPoint = Math.floor(maxLength / 2);
        text = `${text.slice(0, midPoint)}\n\n[... content truncated ...]\n\n${text.slice(text.length - midPoint)}`;
    }

    const styleNote = STYLE_GUIDANCE[investorStyle] || STYLE_GUIDANCE.balanced;
    const horizonNote = HORIZON_GUIDANCE[horizon] || HORIZON_GUIDANCE.long_term;
    const [curSymbol, curCode, marketNote] = resolveMarket(ticker, region);
    const isPro = tier === "premium" || tier === "enterprise";

    // Premium-only sections: the deeper, scenario-driven analysis that makes
    // a paid report feel like it came from an analyst, not a template.
    let proSchema = "";
    if (isPro) {
        proSchema = `,
  "personalized_take": "2-3 sentences written directly to THIS investor given their style and horizon — what this specific company means for them and why.",
  "bull_case": ["3-4 concrete, document-grounded reasons this investment could work out well"],
  "bear_case": ["3-4 concrete, document-grounded risks that could make this a poor investment"],
  "what_to_watch": ["3-4 specific metrics, events or disclosures to monitor next quarter, drawn from the document"],
  "peer_context": "1-2 sentences on how these fundamentals compare to typical peers in this sector (qualitative if no peer data is in the document).",
  "data_confidence": {"score": 0, "note": "How complete the source document was for this analysis, and what was missing."}`;
    }

    let proRules = "";
    if (isPro) {
        proRules =
            "- Fill personalized_take, bull_case, bear_case, what_to_watch, peer_context and data_confidence.\n" +
            "- data_confidence.score is 0-10 reflecting how much hard financial data the document actually contained.\n";
    }

    return `You are a senior equity research analyst writing a fundamental analysis of ${companyName} (Ticker: ${ticker}) for a specific reader.

WHO YOU ARE WRITING FOR:
${styleNote}
${horizonNote}

MARKET & CURRENCY CONTEXT:
Write all monetary figures using the "${curSymbol}" symbol (${curCode}). Use ${marketNote}
If the source document reports figures in a different currency, keep them as stated but make the reporting currency explicit; do not invent exchange rates.

SOURCE DOCUMENT (this is your ONLY source of facts):
${text}

Return ONLY a valid JSON object with EXACTLY this shape (no markdown, no commentary):

{
  "company": "<official company name from the document>",
  "ticker": "${ticker}",
  "exchange": "<exchange if stated in the document, else 'N/A'>",
  "overall_score": <number 0-10, weighted average of the category scores>,
  "summary": "<2-3 sentence executive summary in plain English>",
  "plain_english": "<ONE sentence a busy person could read and instantly get the verdict>",
  "metrics": {
    "profitability": {"score": <0-10>, "label": "<Excellent|Strong|Good|Fair|Poor>", "details": "<what the document shows about profitability>"},
    "liquidity":     {"score": <0-10>, "label": "<...>", "details": "<...>"},
    "solvency":      {"score": <0-10>, "label": "<...>", "details": "<...>"},
    "efficiency":    {"score": <0-10>, "label": "<...>", "details": "<...>"}
  },
  "key_ratios": [
    {"name": "<ratio name>", "value": "<value computed FROM the document, or 'N/A'>", "benchmark": "<a reasonable reference range, labelled as guidance>", "interpretation": "<one line>"}
  ],
  "strengths": ["<specific strengths grounded in the document>"],
  "red_flags": ["<specific risks grounded in the document>"],
  "investment_assessment": "<3-4 paragraphs: 1) financial health, 2) growth prospects & risks, 3) valuation, 4) a clear Buy/Hold/Sell with rationale for THIS reader's style and horizon>"${proSchema}
}

CRITICAL RULES — CREDIBILITY DEPENDS ON THESE:
- Use ONLY numbers that appear in, or can be directly computed from, the source document.
- If a ratio or figure is NOT available in the document, set its value to "N/A" and say so — NEVER invent or estimate a number.
- Do not carry over any example values; every figure must trace back to this specific document.
- Score each metric 0-10 (labels: 9-10 Excellent, 7-8 Strong, 5-6 Good, 3-4 Fair, 0-2 Poor).
- overall_score = weighted average of the four category scores.
- Speak directly and specifically to the reader described above; tailor emphasis and language to their style.
- Be balanced: a good analyst names the risks as clearly as the strengths.
${proRules}- Return ONLY valid JSON. No prose before or after.
`;
}

/** Port of `_parse_analysis_response`. */
function parseAnalysisResponse(response: string): Record<string, unknown> {
    const requiredFields = [
        "company",
        "ticker",
        "overall_score",
        "summary",
        "metrics",
        "key_ratios",
        "strengths",
        "red_flags",
        "investment_assessment",
    ];

    let data: Record<string, unknown>;
    try {
        data = JSON.parse(response);
    } catch {
        // If not valid JSON, try to extract JSON from markdown code blocks.
        const match = response.match(/```json\n([\s\S]*?)\n```/);
        if (!match) {
            throw new Error("Failed to parse AI response as JSON");
        }
        data = JSON.parse(match[1]);
    }

    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    return data;
}

/** Port of `AIAnalyzer.analyze_financial_document`. */
export async function analyzeFinancialDocument(opts: AnalyzeFinancialDocumentOptions): Promise<AnalysisResult> {
    if (!isAiAvailable()) {
        return {
            success: false,
            error: "AI service not configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY",
        };
    }

    const investorStyle = opts.investorStyle || "balanced";
    const horizon = opts.horizon || "long_term";
    const tier = opts.tier || "free";

    const prompt = createAnalysisPrompt({
        text: opts.extractedText,
        companyName: opts.companyName,
        ticker: opts.ticker,
        investorStyle,
        horizon,
        tier,
        region: opts.region,
    });

    try {
        const responseText = await generateAIText({
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert financial analyst specializing in fundamental analysis. Provide detailed, data-driven insights in JSON format.",
                },
                { role: "user", content: prompt },
            ],
            maxTokens: 4000,
            temperature: 0.3,
        });

        const analysis = parseAnalysisResponse(responseText) as AnalysisResult;
        analysis.success = true;
        // Real token cost isn't available from generateAIText — token-wallet
        // metering is a later billing task, so this is left unestimated.
        analysis.tokens_used = null;
        analysis.provider = getAIProviderInfo().provider;

        return analysis;
    } catch (err) {
        return {
            success: false,
            error: `AI analysis failed: ${(err as Error)?.message || err}`,
        };
    }
}
