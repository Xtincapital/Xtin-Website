# Strategy Spec v1 — quick reference

The authoritative schema comes from `get_strategy_schema`. This page is a
reminder of the common shapes.

## Skeleton

```json
{
  "spec_version": "1.0",
  "name": "RSI mean reversion",
  "instrument": { "id": "NSE:RELIANCE", "timeframe": "1d" },
  "period": { "from": "2023-10-16", "to": "2026-10-14" },
  "capital": { "initial": 100000, "currency": "INR" },
  "entry": { "side": "long", "when": { "all": [ { "left": { "ind": "RSI", "len": 14 }, "op": "<", "right": 30 } ] } },
  "exit": {
    "when": { "any": [ { "left": { "ind": "RSI", "len": 14 }, "op": ">", "right": 70 } ] },
    "stop_loss": { "type": "pct", "value": 2 },
    "target": null, "trailing_stop": null, "time_exit": null
  },
  "sizing": { "mode": "pct_equity", "value": 50 }
}
```

Leave out anything you'd set to its default — the validator writes the defaults
in (fills, product, costs, slippage, cooldown, data settings).

## Operands

- A number: `30`
- A price field: `{ "field": "close" }` (open, high, low, close, volume)
- An indicator: `{ "ind": "EMA", "len": 50 }`

| Indicator | Parameters (defaults) | Lines |
|---|---|---|
| SMA, EMA, WMA | len (20) | — |
| RSI | len (14) | — |
| MACD | fast 12, slow 26, signal 9 | macd, signal, hist |
| BB (Bollinger) | len 20, mult 2 | upper, middle, lower |
| ATR | len 14 | — |
| SUPERTREND | len 10, mult 3 | — |
| STOCH | len 14, smooth 3 | k, d |
| ADX | len 14 | — |
| DONCHIAN | len 20 (previous bars only) | upper, middle, lower |
| VWAP | — (intraday only, resets daily) | — |
| PDH / PDL | — (prior session's high / low) | — |
| ORH / ORL | minutes 15 (intraday only) | — |

## Operators

`<`, `<=`, `>`, `>=`, `==`, `crosses_above`, `crosses_below` take `left` and `right`.
`between` takes `left`, `low`, `high`. `rising` / `falling` take `left` and `bars`.
Groups: `{ "all": [...] }` or `{ "any": [...] }`, nested one level deep.

## Exits and sizing

- `stop_loss` / `target`: `{ "type": "pct" | "points" | "atr", "value": 2, "len": 14 }` (`len` for ATR only)
- `trailing_stop`: `{ "type": "pct" | "atr", "value": 3 }`
- `time_exit`: `{ "bars": 10 }`
- Intraday square-off: `execution.square_off` (default 15:15 on intraday timeframes)
- `sizing.mode`: `fixed_qty` (shares), `fixed_amount` (₹), `pct_equity` (%), `risk_pct` (% of equity risked ÷ stop distance — needs a stop-loss)

## Worked examples

**Golden cross on the NIFTY ETF**
```json
{ "name": "Golden cross", "instrument": { "id": "NSE:NIFTYBEES" },
  "entry": { "when": { "all": [ { "left": { "ind": "SMA", "len": 50 }, "op": "crosses_above", "right": { "ind": "SMA", "len": 200 } } ] } },
  "exit":  { "when": { "all": [ { "left": { "ind": "SMA", "len": 50 }, "op": "crosses_below", "right": { "ind": "SMA", "len": 200 } } ] } } }
```

**Donchian breakout risking 1% per trade**
```json
{ "name": "Donchian 20/10", "instrument": { "id": "NSE:TCS" },
  "entry": { "when": { "all": [ { "left": { "field": "close" }, "op": ">", "right": { "ind": "DONCHIAN", "len": 20, "line": "upper" } } ] } },
  "exit":  { "when": { "all": [ { "left": { "field": "close" }, "op": "<", "right": { "ind": "DONCHIAN", "len": 10, "line": "lower" } } ] },
             "stop_loss": { "type": "atr", "value": 2 } },
  "sizing": { "mode": "risk_pct", "value": 1 } }
```

**Opening-range breakout, 15-minute (Pro)**
```json
{ "name": "ORB", "instrument": { "id": "NSE:RELIANCE", "timeframe": "15m" },
  "period": { "from": "2026-08-01", "to": "2026-10-14" },
  "entry": { "when": { "all": [ { "left": { "field": "close" }, "op": "crosses_above", "right": { "ind": "ORH", "minutes": 30 } } ] } },
  "exit":  { "stop_loss": { "type": "pct", "value": 1 }, "target": { "type": "pct", "value": 2 } } }
```
