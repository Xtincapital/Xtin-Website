---
name: backtest-a-strategy
description: Use when the user wants to test, backtest or simulate a trading idea or rule on Indian (NSE/BSE) stocks, indices or ETFs — e.g. "backtest RELIANCE buying when RSI is below 30", "how would a golden cross have done on NIFTYBEES", "tighten the stop to 1% and rerun". Turns the idea into an Xtin Strategy Spec, validates it, runs it on the Xtin engine and reports the result with its assumptions.
---

# Backtest a strategy with Xtin

The Xtin engine computes every number. Your job is to turn the user's idea into a
correct **Strategy Spec v1**, show what you understood, run it, and report the
result honestly. Never estimate, extrapolate or invent a result yourself.

## Workflow

1. **Get the essentials — ask at most one question.** A run needs: an instrument,
   an entry rule, and some way out (an exit rule, a stop, a target, a time exit).
   If one is missing, ask for it in a single question. Sensible defaults need no
   question: daily candles, the last three years, ₹1,00,000, 50% of equity per
   trade, Zerodha costs, next-bar-open fills.
2. **Resolve the instrument** with `search_instruments` (e.g. "reliance" →
   `NSE:RELIANCE`). An index (NIFTY, BANKNIFTY) can't be bought: say the result
   will be theoretical and offer the ETF (NIFTYBEES, BANKBEES). Never use
   `NSE:SAMPLE` unless the user asks for demo data — its results are synthetic.
3. **Write the spec.** If you're unsure of a field, call `get_strategy_schema`.
   See `references/indicators.md` for indicators, operators and worked examples.
4. **Validate** with `validate_strategy` (free). Fix every error it lists and
   validate again. Then show the user **"What I understood"**: the validator's
   plain-English summary, in one short paragraph, plus any warnings.
5. **Run** with `run_backtest`. One credit; an identical spec on identical data
   is free and comes back marked as a stored result.
6. **Report** (see "Reporting" below), then offer **one** next step — for
   example a robustness check, a tighter stop, or saving the strategy.

## Follow-up messages

| The user says | Do this |
|---|---|
| A new idea with its own entry rule ("buy TCS when MACD crosses up") | A **new** spec. The old one stays in the conversation history. |
| A change ("tighten the stop to 1%", "make it 15-minute") | Change only that part of the **last** spec, say what changed in one line, validate, rerun, then `compare_backtests` with the previous run. |
| A new instrument ("run it on INFY") | Change only `instrument.id`; sizing is a rule, so it re-sizes itself. Warn if it moves between a stock and an index. |
| Something ambiguous ("try EMA instead") | Ask **one** question ("EMA crossover of which lengths, replacing the RSI entry?") before running. |

## Reporting

Lead with six figures from the result, each next to what it means:
total return, CAGR, max drawdown, Sharpe, win rate and number of trades. Then:

- the **assumptions line** from the result, verbatim (fills, product, sizing,
  costs, data source, engine version);
- every **warning** (synthetic data, theoretical index, capped size, skipped
  entries, account wiped out);
- the **report link**;
- this sentence, always: *Hypothetical backtest on historical data. Not
  investment advice. Past results do not predict future results.*

Follow the wording rules in the `explain-results` skill: never say a strategy
"works", "will make money" or that the user should buy or sell anything; no
rankings of strategies by return; no target prices.

## Saving

Offer `save_strategy` after a run the user seems to like. Saving the same
strategy again with its `strategy_id` creates a new version; old versions are
kept and can be run with `run_backtest` (`strategy_id` + `version`).

## When things fail

Tool errors say how to fix them — follow them. Plan limits (intraday candles,
older history, monthly credits) need Xtin Pro: explain the limit plainly and
offer the free alternative (daily candles, a recent window) without pressure.
