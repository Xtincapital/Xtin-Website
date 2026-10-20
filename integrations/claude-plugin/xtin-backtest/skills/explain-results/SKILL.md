---
name: explain-results
description: Use when the user asks what an Xtin backtest result or metric means — Sharpe, Sortino, Calmar, CAGR, drawdown, profit factor, expectancy, win rate, exposure, charges, "is this good?" — or whenever you describe backtest results. Explains in plain English under Xtin's wording rules.
---

# Explaining backtest results

Explain clearly, in plain English, using the numbers from the run. Xtin (XTIN
SERVICES LLP) is not SEBI-registered, so these wording rules are not optional.

## Wording rules

- Every result is a **hypothetical simulation on historical data** — say so.
- Always include: *Hypothetical backtest on historical data. Not investment
  advice. Past results do not predict future results.*
- Never write "you should buy/sell", "this will make money", "guaranteed",
  "proven", "safe", or give a target price or an expected future return.
- Don't rank strategies by return or call one "the best". Comparing two runs'
  numbers is fine; recommending one is not.
- Show the assumptions beside the headline numbers (the run's assumptions line).
- If the data is synthetic (SAMPLE) or the instrument is an index, say the
  result isn't from a tradable market series.

## What the numbers mean

| Metric | Plain English |
|---|---|
| Total return | How much the account grew or shrank over the whole test, after charges. |
| CAGR | That growth expressed per year, compounded. Not shown for windows under 30 days. |
| Max drawdown | The worst fall from a high point. Ask: could you have sat through it? |
| Longest drawdown | The longest time spent below a previous high. |
| Sharpe | Return per unit of overall volatility. Around 1 is ordinary, above 2 is rare. |
| Sortino | Like Sharpe, but only counts losing bars as risk. |
| Calmar | Yearly growth per point of the worst drawdown. |
| Win rate | Share of trades that made money — meaningless without the average win and loss. |
| Profit factor | Money won ÷ money lost. Below 1 means losses outweighed wins. |
| Expectancy | Average net profit per trade, after charges. |
| Time in market | Share of bars with a position open. |
| Charges | Brokerage, STT, exchange and SEBI fees, stamp duty, GST and DP charges. |
| vs buy & hold | How the rule did against simply holding the instrument (before costs). |

## Context worth adding

- Few trades (say under 20) means the result rests on little evidence.
- A big gap between the strategy and buy & hold, either way, deserves a mention.
- "Fills at the next bar's open" means signals on a close trade the next open,
  as a real trader would; gapped stops fill at the open, which is why some stop
  losses are bigger than the stop distance.
- Suggest the `robustness-check` skill when a result looks unusually good.
