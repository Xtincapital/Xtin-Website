// Journal AI Coach API — Node/TS port of five endpoints from
// features-incoming/journal/main.py:
//   - `POST /api/v2/analyze`            -> POST /journal/analyze
//   - `GET  /api/v2/behavioral-alerts`  -> GET  /journal/behavioral-alerts
//   - `POST /api/v2/chat`               -> POST /journal/chat
//   - `POST /api/v2/weekly-review`      -> POST /journal/weekly-review
//   - `POST /api/v2/pre-trade-check`    -> POST /journal/pre-trade-check
//
// `analyze_trades` is pure rule-based math (no AI call at all) — ported
// faithfully as deterministic logic. `get_behavioral_alerts` is a trivial
// stub per its own source docstring ("Real alerts are computed from trades
// in the analyze endpoint"). The other three call Claude through
// `callClaudeCoach` below, a port of the source's shared `call_claude`
// helper.
//
// Auth: every route requires `authenticate` (see aiCoach.routes.ts);
// `req.user.authId` (== `auth.users.id`) is the authoritative user id for
// wallet/plan-tier lookups — unlike the Python source (which trusted a
// client-supplied `user_id` field in the request body, since it had no auth
// middleware of its own), request bodies here never carry a user id.
import { HTTP_STATUS } from "../../constants/constants.js";
import { generateAIWithUsage } from "../ai/providers.js";
import { ensureAiTokens, deductAiTokens, InsufficientAiTokensError, type JournalAiWallet } from "./aiWallet.repository.js";
import { getPlanTier } from "./planTier.js";
import { compactTradeContext, hasPnl, pnlOf, symbolOf, fmt, type JournalTradeLike } from "./tradeContext.js";
import { validateAnalyzeRequest, validatePreTradeCheck, validateWeeklyReview, validateChatRequest } from "./aiCoach.validator.js";
import { saveExchange } from "../ai/chatHistory.js";

// Journal's original design (main.py) always used Claude Haiku — cheap and
// fast, appropriate for these short (100-550 word), high-frequency coaching
// replies — rather than providers.ts's shared CLAUDE_MODEL default (a
// heavier Sonnet model used by FundaKaMental's longer report generations).
// Overridable independently of the shared ANTHROPIC_MODEL env var so ops can
// tune Journal's cost/quality trade-off without touching FundaKaMental's.
const JOURNAL_CLAUDE_MODEL = process.env.JOURNAL_ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

// Port of main.py's fixed `call_claude` system prompt.
const JOURNAL_SYSTEM_PROMPT =
    "You are Xtin Journal AI, a concise trading performance coach. " +
    "Use only the supplied trade context. Be personalized, specific, and under 160 words unless asked otherwise. " +
    "Do not give financial advice or trade signals; focus on journaling, risk, discipline, and review.";

/**
 * Port of main.py's `call_claude` — the shared Claude-calling wrapper used
 * by chat/weekly-review/pre-trade-check. Gates on wallet balance (minimum
 * 800 tokens, same fixed floor the source used for every call regardless of
 * `max_tokens`), builds compact trade context, calls Claude via
 * `ai/providers.ts`'s `generateAIWithUsage` (returning the real
 * `usage.input_tokens + usage.output_tokens` from Anthropic's own response),
 * then deducts that exact amount from the wallet.
 */
async function callClaudeCoach(
    userId: string,
    prompt: string,
    trades: JournalTradeLike[] = [],
    maxTokens = 260
): Promise<{ text: string; tokensUsed: number; wallet: JournalAiWallet }> {
    await ensureAiTokens(userId, 800);

    const context = compactTradeContext(trades);
    const { text, usage } = await generateAIWithUsage({
        system: JOURNAL_SYSTEM_PROMPT,
        messages: [{ role: "user", content: `TRADE CONTEXT:\n${context}\n\nUSER REQUEST:\n${prompt}` }],
        maxTokens,
        temperature: 0.35,
        model: JOURNAL_CLAUDE_MODEL,
    });

    const tokensUsed = usage.inputTokens + usage.outputTokens;
    const wallet = await deductAiTokens(userId, tokensUsed);
    return { text, tokensUsed, wallet };
}

/* POST /journal/analyze — pure rule-based math (win rate, profit factor,
 * strategy breakdown, overtrading/strategy-sprawl heuristics). No AI call,
 * no wallet gating. Port of main.py's `analyze_trades`. */
export const analyzeTrades = async (req, res) => {
    const validation = validateAnalyzeRequest(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const trades = validation.data.trades as JournalTradeLike[];

    if (trades.length === 0) {
        return res.status(HTTP_STATUS.OK).json({
            analysis: { win_rate: 0, total_pnl: 0, profit_factor: 0, expectancy: 0 },
            insights: {
                issues: [
                    {
                        title: "No Trades to Analyze",
                        metric: "0 trades",
                        insight: "You haven't added any trades to your journal yet.",
                        action: "Add some trades to your journal to get AI-powered analysis and insights.",
                        severity: "low",
                        learning: ["Trade logging", "Journal maintenance", "Data collection"],
                    },
                ],
                strengths: [],
            },
        });
    }

    // Open trades (no P&L yet) are not losses, so they stay out of every rate and average here.
    const closedTrades = trades.filter(hasPnl);
    const totalTrades = closedTrades.length;
    const wins = closedTrades.filter((t) => pnlOf(t) > 0).length;
    const losses = totalTrades - wins;
    const winRate = totalTrades > 0 ? wins / totalTrades : 0;

    const totalProfit = closedTrades.reduce((sum, t) => sum + pnlOf(t), 0);
    const winningPnls = closedTrades.filter((t) => pnlOf(t) > 0).map(pnlOf);
    const nonWinningPnls = closedTrades.filter((t) => pnlOf(t) <= 0).map(pnlOf); // includes break-even, matches source
    const avgWin = wins > 0 ? winningPnls.reduce((a, b) => a + b, 0) / wins : 0;
    const avgLoss = losses > 0 ? nonWinningPnls.reduce((a, b) => a + b, 0) / losses : 0;

    const totalWins = winningPnls.reduce((a, b) => a + b, 0);
    const totalLosses = Math.abs(trades.filter((t) => pnlOf(t) < 0).reduce((sum, t) => sum + pnlOf(t), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    const strategies = new Map<string, { wins: number; losses: number; profit: number; count: number }>();
    for (const t of trades) {
        const strategy = (t.strategy as string) || "Unknown";
        const s = strategies.get(strategy) || { wins: 0, losses: 0, profit: 0, count: 0 };
        s.profit += pnlOf(t);
        s.count += 1;
        if (pnlOf(t) > 0) s.wins += 1;
        else s.losses += 1;
        strategies.set(strategy, s);
    }

    const issues: Record<string, unknown>[] = [];
    const strengths: Record<string, unknown>[] = [];

    if (winRate < 0.4) {
        issues.push({
            title: "Low Win Rate",
            metric: `${(winRate * 100).toFixed(1)}%`,
            insight: "Your win rate is below 40%. This indicates your winning trades are not frequent enough.",
            action: "Review your entry signal setup and ensure you're trading high-probability setups. Consider implementing stricter entry criteria.",
            severity: "high",
            learning: ["Entry signal optimization", "Trade setup validation", "Risk-reward filtering"],
        });
    } else if (winRate > 0.6) {
        strengths.push({
            title: "Strong Win Rate",
            metric: `${(winRate * 100).toFixed(1)}%`,
            insight: "Excellent! Your win rate is above 60%. You're consistently picking winning setups.",
            learning: null,
        });
    }

    if (profitFactor < 1.5 && profitFactor > 0) {
        issues.push({
            title: "Low Profit Factor",
            metric: profitFactor.toFixed(2),
            insight: "Your profit factor is below 1.5. This means your losing trades are too large relative to your winning trades.",
            action: "Focus on risk management. Ensure winners are at least 2x your risk per trade. Implement tighter stops or reduce position size on losing trades.",
            severity: "high",
            learning: ["Risk management", "Position sizing", "Stop loss placement"],
        });
    } else if (profitFactor > 2) {
        strengths.push({
            title: "Excellent Profit Factor",
            metric: profitFactor.toFixed(2),
            insight: "Exceptional risk-reward management! Your average winners are significantly larger than your average losers.",
            learning: null,
        });
    }

    // Overtrading check — local calendar date, matching main.py's
    // `datetime.now().strftime("%Y-%m-%d")` (server local time, not UTC).
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const recentTrades = trades.filter((t) => t.date === today).length;
    if (recentTrades > 5) {
        issues.push({
            title: "Overtrading Pattern",
            metric: `${recentTrades} trades today`,
            insight: "You've taken many trades in a single day. Overtrading often leads to emotional decision-making and reduced effectiveness.",
            action: "Set a daily trade limit (3-5 maximum). Wait for the highest probability setups. Quality over quantity always wins.",
            severity: "medium",
            learning: ["Trading discipline", "Patience in trading", "Emotional control"],
        });
    }

    const uniqueStrategies = strategies.size;
    if (uniqueStrategies > 5) {
        issues.push({
            title: "Too Many Strategies",
            metric: `${uniqueStrategies} different strategies`,
            insight: "Trading with too many strategies spreads your focus too thin and prevents mastery of any single approach.",
            action: "Identify your 2-3 best performing strategies. Stop trading the others until you achieve mastery and consistency.",
            severity: "medium",
            learning: ["Strategy mastery", "Trading specialization", "Focus and discipline"],
        });
    }

    const strategyPerformance: Record<string, unknown> = {};
    for (const [name, s] of strategies) {
        strategyPerformance[name] = {
            trades: s.count,
            wins: s.wins,
            losses: s.losses,
            win_rate: s.count > 0 ? (s.wins / s.count) * 100 : 0,
            profit: Math.round(s.profit * 100) / 100,
        };
    }

    // Python's `999` stand-in for an infinite profit factor (all wins, zero losses).
    const safeProfitFactor = Number.isFinite(profitFactor) ? Math.round(profitFactor * 100) / 100 : 999;

    return res.status(HTTP_STATUS.OK).json({
        analysis: {
            core_metrics: {
                total_trades: totalTrades,
                win_rate: winRate,
                profit_factor: safeProfitFactor,
                total_profit: totalProfit,
                average_win: Math.round(avgWin * 100) / 100,
                average_loss: Math.round(avgLoss * 100) / 100,
                wins,
                losses,
            },
            strategy_performance: strategyPerformance,
            win_rate: winRate,
            total_pnl: totalProfit,
            profit_factor: safeProfitFactor,
            expectancy: totalTrades > 0 ? Math.round((totalProfit / totalTrades) * 100) / 100 : 0,
        },
        insights: { issues, strengths },
    });
};

/* GET /journal/behavioral-alerts — trivial stub, always empty. Port of
 * main.py's `get_behavioral_alerts` (its own docstring: "Real alerts are
 * computed from trades in the analyze endpoint"). */
export const getBehavioralAlerts = async (req, res) => {
    return res.status(HTTP_STATUS.OK).json({
        user_id: req.user.authId,
        alert_count: 0,
        alerts: [],
        last_updated: new Date().toISOString(),
    });
};

/* POST /journal/pre-trade-check — quick GO/WAIT/DON'T-TRADE verdict via
 * Claude. Port of main.py's `pre_trade_check`. The ₹ symbol is hardcoded
 * here exactly as it was in the source (PreTradeRequest has no currency
 * field). */
export const preTradeCheck = async (req, res) => {
    const validation = validatePreTradeCheck(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { symbol, trade_type, market, strategy, risk_amount, potential_profit } = validation.data;
    const userId = req.user.authId;
    const riskRewardRatio = risk_amount > 0 ? potential_profit / risk_amount : 0;

    const prompt = `A trader is about to enter a trade. Give them a quick pre-trade assessment.

TRADE DETAILS:
- Symbol: ${symbol}
- Type: ${trade_type}
- Market: ${market}
- Strategy: ${strategy}
- Risk Amount: ₹${fmt(risk_amount)}
- Potential Profit: ₹${fmt(potential_profit)}
- Risk/Reward Ratio: ${riskRewardRatio.toFixed(2)}:1

Provide:
1. Quick verdict: GO / WAIT / DON'T TRADE with one sentence reason
2. Risk/Reward assessment (is ${riskRewardRatio.toFixed(2)}:1 acceptable?)
3. Two quick reminders before entering

Be direct and under 100 words total.`;

    try {
        const { text, tokensUsed, wallet } = await callClaudeCoach(userId, prompt, [], 180);
        return res.status(HTTP_STATUS.OK).json({
            user_id: userId,
            symbol,
            reminder: text,
            risk_reward: Math.round(riskRewardRatio * 100) / 100,
            tokens_used: tokensUsed,
            token_balance: wallet.token_balance,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        if (err instanceof InsufficientAiTokensError) {
            return res.status(402).json({ error: err.message, token_balance: err.tokenBalance });
        }
        console.error("[Journal] pre-trade check failed:", (err as Error)?.message || err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating pre-trade check: ${(err as Error)?.message || err}` });
    }
};

/* POST /journal/weekly-review — computes weekly stats then calls Claude for
 * a structured review. Port of main.py's `weekly_review`. */
export const weeklyReview = async (req, res) => {
    const validation = validateWeeklyReview(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { trades, start_date, end_date } = validation.data;
    const tradesList = trades as JournalTradeLike[];
    const userId = req.user.authId;

    if (tradesList.length === 0) {
        return res.status(HTTP_STATUS.OK).json({
            review: "No trades logged this week. Start adding trades to get your weekly AI review!",
            trade_count: 0,
        });
    }

    // Open trades (no P&L yet) are not losses: counting them made "avg loser" ₹33 when the only loss was ₹100.
    const closedList = tradesList.filter(hasPnl);
    const totalTrades = closedList.length;
    const wins = closedList.filter((t) => pnlOf(t) > 0).length;
    const winningPnls = closedList.filter((t) => pnlOf(t) > 0).map(pnlOf);
    const losingPnls = closedList.filter((t) => pnlOf(t) < 0).map(pnlOf);
    const losses = losingPnls.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const totalProfit = closedList.reduce((sum, t) => sum + pnlOf(t), 0);
    const avgWin = wins > 0 ? winningPnls.reduce((a, b) => a + b, 0) / wins : 0;
    const avgLoss = losses > 0 ? Math.abs(losingPnls.reduce((a, b) => a + b, 0) / losses) : 0;
    const grossWins = winningPnls.reduce((a, b) => a + b, 0);
    const grossLosses = Math.abs(losingPnls.reduce((a, b) => a + b, 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : 0;

    const strategies = new Map<string, { count: number; profit: number; wins: number }>();
    for (const t of tradesList) {
        const s = (t.strategy as string) || "Unknown";
        const entry = strategies.get(s) || { count: 0, profit: 0, wins: 0 };
        entry.count += 1;
        entry.profit += pnlOf(t);
        if (pnlOf(t) > 0) entry.wins += 1;
        strategies.set(s, entry);
    }

    let strategyLines = "";
    for (const [s, d] of strategies) {
        const wr = d.count > 0 ? (d.wins / d.count) * 100 : 0;
        strategyLines += `  - ${s}: ${d.count} trades, ${wr.toFixed(1)}% WR, ₹${fmt(d.profit)} P&L\n`;
    }

    const sortedTrades = [...tradesList].sort((a, b) => pnlOf(b) - pnlOf(a));
    const top3 = sortedTrades
        .slice(0, 3)
        .map((t) => `  +₹${fmt(pnlOf(t))} | ${t.strategy || "?"} | ${symbolOf(t)} | ${t.date || "?"}\n`)
        .join("");
    const worst3 = sortedTrades
        .slice(-3)
        .map((t) => `  ₹${fmt(pnlOf(t))} | ${t.strategy || "?"} | ${symbolOf(t)} | ${t.date || "?"}\n`)
        .join("");

    const periodStart = start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const periodEnd = end_date || new Date().toISOString().slice(0, 10);

    const prompt = `Generate a detailed weekly trading review for this trader.

WEEK: ${periodStart} to ${periodEnd}
TOTAL TRADES: ${totalTrades} (${wins} wins, ${losses} losses)
WIN RATE: ${winRate.toFixed(1)}%
TOTAL P&L: ₹${fmt(totalProfit)}
AVERAGE WINNER: ₹${fmt(avgWin)}
AVERAGE LOSER: ₹${fmt(avgLoss)}
PROFIT FACTOR: ${profitFactor.toFixed(2)}

STRATEGY BREAKDOWN:
${strategyLines}

BEST 3 TRADES:
${top3}
WORST 3 TRADES:
${worst3}

Write a structured review with:
1. Week Summary (2-3 sentences on overall performance)
2. What Worked Well (specific strategies/behaviours with their actual numbers)
3. What Needs Improvement (specific issues with actual numbers)
4. Key Lessons (3 bullet points)
5. Next Week Focus (2-3 concrete actions)

Be specific, reference the actual numbers. Keep total response under 300 words.`;

    try {
        const { text, tokensUsed, wallet } = await callClaudeCoach(userId, prompt, tradesList, 420);
        return res.status(HTTP_STATUS.OK).json({
            review: text,
            trade_count: totalTrades,
            tokens_used: tokensUsed,
            token_balance: wallet.token_balance,
            generated_at: new Date().toISOString(),
        });
    } catch (err) {
        if (err instanceof InsufficientAiTokensError) {
            return res.status(402).json({ error: err.message, token_balance: err.tokenBalance });
        }
        console.error("[Journal] weekly review failed:", (err as Error)?.message || err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating weekly review: ${(err as Error)?.message || err}` });
    }
};

// Currency symbols for coach replies — must cover the same set as the
// source's CURRENCY_SYMBOLS (kept in sync with whatever CURRENCY_CONFIG the
// frontend exposes).
const CURRENCY_SYMBOLS: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "Fr",
    CNY: "¥",
    SGD: "S$",
};

/* POST /journal/chat — the richest endpoint: builds a detailed system
 * prompt from trade stats, strategy breakdown, an emotion->P&L
 * "fingerprint", goals, and conversation history, then calls Claude. Port
 * of main.py's `chat_coach`, prompt-building logic kept word-for-word. */
export const chatCoach = async (req, res) => {
    const validation = validateChatRequest(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { message, trades, display_name, history, goals, client_tier, currency, conversation_id } = validation.data;
    const userId = req.user.authId;
    const cur = (currency || "INR").toUpperCase();
    const sym = CURRENCY_SYMBOLS[cur] || "₹";
    const tradesList = trades as JournalTradeLike[];

    const totalTrades = tradesList.length;
    const totalProfit = tradesList.reduce((sum, t) => sum + pnlOf(t), 0);
    const wins = tradesList.filter((t) => pnlOf(t) > 0).length;
    const losses = totalTrades - wins;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;

    const winsList = tradesList.filter((t) => pnlOf(t) > 0).map(pnlOf);
    const lossesList = tradesList.filter((t) => pnlOf(t) < 0).map((t) => Math.abs(pnlOf(t)));
    const avgWin = winsList.length ? winsList.reduce((a, b) => a + b, 0) / winsList.length : 0;
    const avgLoss = lossesList.length ? lossesList.reduce((a, b) => a + b, 0) / lossesList.length : 0;
    const sumLosses = lossesList.reduce((a, b) => a + b, 0);
    const profitFactor = sumLosses > 0 ? winsList.reduce((a, b) => a + b, 0) / sumLosses : 0;

    const strategiesUsed = new Map<string, { count: number; profit: number; wins: number }>();
    for (const t of tradesList) {
        const s = (t.strategy as string) || "Unknown";
        if (s && s !== "Unknown") {
            const entry = strategiesUsed.get(s) || { count: 0, profit: 0, wins: 0 };
            entry.count += 1;
            entry.profit += pnlOf(t);
            if (pnlOf(t) > 0) entry.wins += 1;
            strategiesUsed.set(s, entry);
        }
    }

    let strategySummary = "";
    for (const [s, d] of strategiesUsed) {
        const wr = d.count > 0 ? (d.wins / d.count) * 100 : 0;
        strategySummary += `  - ${s}: ${d.count} trades, ${wr.toFixed(1)}% WR, ${sym}${fmt(d.profit)} P&L\n`;
    }

    const markets = [...new Set(tradesList.map((t) => (t.market as string) || "Equity"))];

    const sortedTrades = [...tradesList].sort((a, b) => pnlOf(b) - pnlOf(a));
    let topTradesText = "";
    for (const t of sortedTrades.slice(0, 3)) {
        topTradesText += `  +${sym}${fmt(pnlOf(t))} | ${t.strategy || "?"} | ${symbolOf(t)} | ${t.date || "?"}\n`;
    }
    let worstTradesText = "";
    for (const t of sortedTrades.slice(-3)) {
        worstTradesText += `  ${sym}${fmt(pnlOf(t))} | ${t.strategy || "?"} | ${symbolOf(t)} | ${t.date || "?"}\n`;
    }

    // Emotion -> P&L fingerprint (the heart of psychology coaching).
    const emotionsUsed = new Map<string, { count: number; profit: number; wins: number }>();
    for (const t of tradesList) {
        const emo = String(t.emotion || "").trim().toLowerCase();
        if (emo) {
            const entry = emotionsUsed.get(emo) || { count: 0, profit: 0, wins: 0 };
            entry.count += 1;
            entry.profit += pnlOf(t);
            if (pnlOf(t) > 0) entry.wins += 1;
            emotionsUsed.set(emo, entry);
        }
    }
    let emotionSummary = "";
    for (const [emo, d] of [...emotionsUsed.entries()].sort((a, b) => a[1].profit - b[1].profit)) {
        const ewr = d.count ? (d.wins / d.count) * 100 : 0;
        emotionSummary += `  - feeling '${emo}': ${d.count} trades, ${ewr.toFixed(0)}% WR, ${sym}${fmt(d.profit)} P&L\n`;
    }

    // Performance goals the trader has committed to.
    let goalsSummary = "";
    for (const g of (goals || []).slice(0, 5) as Record<string, unknown>[]) {
        goalsSummary += `  - ${g.title || "Goal"}: target ${g.target} (${g.metric || "?"}, ${g.timeframe || "?"})\n`;
    }

    const tier = await getPlanTier(userId, client_tier);
    const traderName = (display_name || "").trim().slice(0, 40);

    const lengthRule =
        tier === "pro"
            ? "- LENGTH: up to ~220 words when the question deserves depth. Explain the reasoning behind your read, then end with ONE concrete action for the next session."
            : "- LENGTH: under ~110 words. Lead with the single most important insight and one concrete action.";

    // Currency-aware localization — avoids India-specific terms for
    // non-INR users, matches the source exactly.
    const localizationRule =
        cur === "INR"
            ? "Indian market context (₹, intraday, F&O, brokerage)."
            : `The trader works in ${cur} — always quote amounts with ${sym}, and use their own market's context (equities/options/futures as relevant); avoid India-specific terms like lakh/crore or F&O unless they use them first.`;

    // Build system prompt with full trade context — kept word-for-word from
    // main.py's `chat_coach` (this text is passed as the Claude `messages`
    // user-turn content by `callClaudeCoach`/`call_claude`, not as the
    // Anthropic `system` field — same structure as the source).
    const systemPrompt = `You are Xtin Coach, a seasoned trading mentor sitting beside ${traderName || "this trader"} reviewing their actual journal. You've seen a thousand traders blow up and a handful make it — and you talk like it: warm, direct, zero fluff.

HOW TO SPEAK:
- Address the trader${traderName ? ` by name (${traderName})` : ""} naturally, like a mentor who knows them.
- Ground EVERY claim in their actual numbers below. Never invent figures. If data is missing, say exactly what to log and why it will pay off.
- When emotions show up in the data (revenge, fear, overconfidence), name the pattern gently but honestly — that's the coaching they can't get from a spreadsheet.
- Acknowledge how they're feeling first if the question sounds frustrated or excited, then go to the data.
- Plain language. ${localizationRule} Plain text only — no markdown, no bullet lists.
${lengthRule}

TRADER'S CURRENT STATS:
- Total Trades: ${totalTrades}
- Win Rate: ${winRate.toFixed(1)}% (${wins} wins, ${losses} losses)
- Total P&L: ${sym}${fmt(totalProfit)}
- Average Trade: ${sym}${fmt(avgTrade)}
- Average Winner: ${sym}${fmt(avgWin)}
- Average Loser: ${sym}${fmt(avgLoss)}
- Profit Factor: ${profitFactor.toFixed(2)}
- Markets Traded: ${markets.length ? markets.join(", ") : "N/A"}

STRATEGY BREAKDOWN:
${strategySummary || "  No strategy data available"}

EMOTION FINGERPRINT (how feelings correlate with P&L):
${emotionSummary || "  No emotion tags logged yet — encourage tagging emotions on trades."}

PERFORMANCE GOALS:
${goalsSummary || "  No goals set — a written target is worth suggesting."}

TOP 3 WINNING TRADES:
${topTradesText || "  No data"}

WORST 3 LOSING TRADES:
${worstTradesText || "  No data"}

PLAN: ${tier === "pro" ? "Pro (all analysis modules available: Psychology, Hourly, Analytics, Heatmaps)" : "Free (Psychology, Hourly, Analytics and Heatmaps are Pro modules — mention one honestly if it would clearly answer their question, never pushily)"}

RULES:
- Always use the trader's ACTUAL data above in your answers
- Be specific - mention actual numbers, actual strategy names, actual P&L figures
- Give actionable, concrete recommendations
- If asked about something unrelated to trading, briefly answer then steer back to trading`;

    // Conversation memory: a coach remembers what was said two questions ago.
    const historyDepth = tier === "pro" ? 10 : 6;
    let historyLines = "";
    for (const h of ((history || []) as Record<string, unknown>[]).slice(-historyDepth)) {
        const role = h.role === "user" ? "TRADER" : "YOU (coach)";
        const content = String(h.content ?? "").slice(0, 400);
        if (content) historyLines += `${role}: ${content}\n`;
    }

    let claudePrompt = `${systemPrompt}\n`;
    if (historyLines) claudePrompt += `\nCONVERSATION SO FAR:\n${historyLines}`;
    claudePrompt += `\nTRADER'S QUESTION:\n${message}`;

    const maxTokens = tier === "pro" ? 550 : 300;

    try {
        const { text, tokensUsed, wallet } = await callClaudeCoach(userId, claudePrompt, tradesList, maxTokens);
        // Pro perk: keep the conversation (never blocks the reply).
        const conversationId = tier === "pro" ? await saveExchange({ app: "journal", userId, conversationId: conversation_id, question: message, reply: text }) : null;
        return res.status(HTTP_STATUS.OK).json({
            reply: text,
            tokens_used: tokensUsed,
            token_balance: wallet.token_balance,
            tier,
            conversation_id: conversationId,
        });
    } catch (err) {
        if (err instanceof InsufficientAiTokensError) {
            return res.status(402).json({ error: err.message, token_balance: err.tokenBalance });
        }
        console.error("[Journal] chat coach failed:", (err as Error)?.message || err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error generating chat reply: ${(err as Error)?.message || err}` });
    }
};
