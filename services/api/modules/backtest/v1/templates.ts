// Template strategies for the web builder (GET /api/v1/strategies/templates).
// Starting points to edit, not recommendations: each is a well-known rule
// shape, described neutrally, with no claim about how it performs.
import type { SpecInput } from "../spec.js";

export type Template = { id: string; name: string; category: string; description: string; spec: SpecInput };

const on = (id = "NSE:RELIANCE", timeframe: "1d" | "15m" = "1d") => ({ id, timeframe });

export const TEMPLATES: Template[] = [
    {
        id: "rsi-reversion",
        name: "RSI mean reversion",
        category: "Mean reversion",
        description: "Buy when RSI(14) falls below 30, sell when it rises above 70, with a 2% stop-loss.",
        spec: {
            name: "RSI mean reversion",
            instrument: on(),
            entry: { side: "long", when: { all: [{ left: { ind: "RSI", len: 14 }, op: "<", right: 30 }] } },
            exit: { when: { any: [{ left: { ind: "RSI", len: 14 }, op: ">", right: 70 }] }, stop_loss: { type: "pct", value: 2 } },
        },
    },
    {
        id: "ema-crossover",
        name: "EMA crossover",
        category: "Trend",
        description: "Buy when the 20-day EMA crosses above the 50-day EMA; exit when it crosses back below.",
        spec: {
            name: "EMA 20/50 crossover",
            instrument: on(),
            entry: { side: "long", when: { all: [{ left: { ind: "EMA", len: 20 }, op: "crosses_above", right: { ind: "EMA", len: 50 } }] } },
            exit: { when: { all: [{ left: { ind: "EMA", len: 20 }, op: "crosses_below", right: { ind: "EMA", len: 50 } }] } },
        },
    },
    {
        id: "golden-cross",
        name: "Golden cross",
        category: "Trend",
        description: "Buy when the 50-day SMA crosses above the 200-day SMA; exit on the death cross.",
        spec: {
            name: "Golden cross",
            instrument: on("NSE:NIFTYBEES"),
            entry: { side: "long", when: { all: [{ left: { ind: "SMA", len: 50 }, op: "crosses_above", right: { ind: "SMA", len: 200 } }] } },
            exit: { when: { all: [{ left: { ind: "SMA", len: 50 }, op: "crosses_below", right: { ind: "SMA", len: 200 } }] } },
        },
    },
    {
        id: "bollinger-reversion",
        name: "Bollinger band reversion",
        category: "Mean reversion",
        description: "Buy a close below the lower Bollinger band (20, 2); exit at the middle band or a 3% stop.",
        spec: {
            name: "Bollinger reversion",
            instrument: on(),
            entry: { side: "long", when: { all: [{ left: { field: "close" }, op: "<", right: { ind: "BB", len: 20, mult: 2, line: "lower" } }] } },
            exit: { when: { all: [{ left: { field: "close" }, op: ">", right: { ind: "BB", len: 20, mult: 2, line: "middle" } }] }, stop_loss: { type: "pct", value: 3 } },
        },
    },
    {
        id: "donchian-breakout",
        name: "Donchian breakout",
        category: "Breakout",
        description: "Buy a close above the highest high of the previous 20 days; exit below the lowest low of the previous 10, with a 2× ATR stop.",
        spec: {
            name: "Donchian 20/10 breakout",
            instrument: on(),
            entry: { side: "long", when: { all: [{ left: { field: "close" }, op: ">", right: { ind: "DONCHIAN", len: 20, line: "upper" } }] } },
            exit: { when: { all: [{ left: { field: "close" }, op: "<", right: { ind: "DONCHIAN", len: 10, line: "lower" } }] }, stop_loss: { type: "atr", value: 2, len: 14 } },
            sizing: { mode: "risk_pct", value: 1 },
        },
    },
    {
        id: "macd-momentum",
        name: "MACD signal cross",
        category: "Momentum",
        description: "Buy when MACD(12,26,9) crosses above its signal line while above zero; exit on the cross back, or after 20 bars.",
        spec: {
            name: "MACD signal cross",
            instrument: on(),
            entry: {
                side: "long",
                when: { all: [{ left: { ind: "MACD" }, op: "crosses_above", right: { ind: "MACD", line: "signal" } }, { left: { ind: "MACD" }, op: ">", right: 0 }] },
            },
            exit: { when: { all: [{ left: { ind: "MACD" }, op: "crosses_below", right: { ind: "MACD", line: "signal" } }] }, time_exit: { bars: 20 } },
        },
    },
    {
        id: "supertrend",
        name: "Supertrend follow",
        category: "Trend",
        description: "Buy when the close crosses above Supertrend(10, 3); exit when it crosses below.",
        spec: {
            name: "Supertrend follow",
            instrument: on(),
            entry: { side: "long", when: { all: [{ left: { field: "close" }, op: "crosses_above", right: { ind: "SUPERTREND", len: 10, mult: 3 } }] } },
            exit: { when: { all: [{ left: { field: "close" }, op: "crosses_below", right: { ind: "SUPERTREND", len: 10, mult: 3 } }] } },
        },
    },
    {
        id: "opening-range-breakout",
        name: "Opening range breakout",
        category: "Intraday",
        description: "On 15-minute candles, buy a close above the first 30 minutes' high; 1% stop, 2% target, squared off at 15:15.",
        spec: {
            name: "Opening range breakout",
            instrument: on("NSE:RELIANCE", "15m"),
            entry: { side: "long", when: { all: [{ left: { field: "close" }, op: "crosses_above", right: { ind: "ORH", minutes: 30 } }] } },
            exit: { stop_loss: { type: "pct", value: 1 }, target: { type: "pct", value: 2 } },
            execution: { square_off: "15:15" },
        },
    },
];
