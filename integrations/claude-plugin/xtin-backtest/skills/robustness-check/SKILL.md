---
name: robustness-check
description: Use when the user asks whether a backtest result holds up, is robust, overfitted, or just luck — e.g. "is this real?", "does it survive costs?", "stress test it". Reruns the strategy out of sample, with heavier costs and with nearby parameters on the Xtin engine, and summarises how stable the result is.
---

# Robustness check

A single good backtest proves little. Rerun the user's **last spec** a few ways
on the Xtin engine and report how much the result moves. Every number must come
from a run — never guess how a variation would do.

## The runs (keep it to about six)

1. **Out of sample.** Split the period: the first 70% and the last 30%. Run each
   half (`run_backtest` with `period`). A rule that only works in the first half
   was probably fitted to it.
2. **Heavier costs.** Rerun with `costs.slippage_bps` raised from 5 to 20. The
   spec has no "double the charges" switch, so present this as a cost-stress
   approximation, not exactly 2× costs.
3. **Nearby parameters.** Change the main numbers by about ±20% — indicator
   lengths, thresholds, stop and target distances — one family at a time
   (e.g. RSI 14 → 11 and 17). Validate each variant first.

Use `compare_backtests` (2–5 runs at a time) for the side-by-side table, and
mention any assumptions it says differ.

## The summary

- A small table: variant, total return, max drawdown, trades.
- One plain sentence on stability: did the sign of the return hold, did drawdown
  blow up, did trade counts collapse (too few trades means little evidence)?
- Name the weakest variant honestly.
- Credits: each new run uses one credit on the free plan — say how many the
  check will use before starting, and ask if the user is on the free plan.
- Close with: *Hypothetical backtests on historical data. Not investment advice.
  Past results do not predict future results.*

Never call a strategy "robust", "proven" or "safe". Say what the runs showed.
