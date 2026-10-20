# Xtin Backtest for Claude

Backtest NSE trading ideas from a conversation. Describe a rule in plain English
("buy RELIANCE when RSI(14) drops below 30, sell above 70, 2% stop, last three
years") and Claude writes it as an Xtin Strategy Spec, validates it and runs it
on Xtin's deterministic engine — with next-bar fills, gap-aware stops and Indian
transaction costs (brokerage, STT, exchange and SEBI fees, stamp duty, GST).
The same spec on the same data always gives the same numbers.

## What's inside

- **Connector** — the Xtin MCP server (`https://mcp.xtincapital.com/mcp`): search
  instruments, validate and run strategies, fetch reports, compare runs, and
  save versioned strategies to your Xtin account. It never places orders.
- **Skills** — `backtest-a-strategy`, `robustness-check`, `explain-results`.
- **Commands** — `/xtin-backtest:backtest <idea>` and `/xtin-backtest:compare`.

## Getting started

1. Add the plugin (Customize → Plugins → Add marketplace, then install
   `xtin-backtest`), or in Claude Code: `claude plugin marketplace add <this repo>`.
2. The first tool call asks you to sign in with your Xtin account
   (www.xtincapital.com) and approve access.
3. Ask: *"Backtest a 20/50 EMA crossover on NIFTYBEES over the last three years."*

The free plan includes 25 backtests a month on daily candles; repeat runs of an
identical strategy on identical data are free. Xtin Pro unlocks intraday candles
and full history.

## Important

Results are hypothetical backtests on historical data. They are not investment
advice, and past results do not predict future results. XTIN SERVICES LLP is not
registered with SEBI as an investment adviser.

Support: support@xtincapital.com
