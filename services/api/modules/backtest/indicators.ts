// Indicator series, computed once over the full candle array. Each returns an
// array aligned to the candles (NaN where undefined), so the engine can look an
// indicator up at any bar in O(1). Numerics follow pandas' semantics (rolling
// mean/std with ddof=1, ewm(adjust=False)) so results match the Python tool.
import type { Candle } from "./types.js";

export const DEFAULT_BB_PERIOD = 20;
const BB_STD_MULT = 2;

type Series = number[];

export function sma(values: Series, period: number): Series {
    const out: Series = new Array(values.length).fill(NaN);
    // Compensated (Kahan) window sums, like pandas, so an exact tie such as
    // close == SMA isn't broken by floating-point rounding.
    for (let i = period - 1; i < values.length; i++) {
        let sum = 0;
        let comp = 0;
        for (let j = i - period + 1; j <= i; j++) {
            const y = values[j] - comp;
            const t = sum + y;
            comp = t - sum - y;
            sum = t;
        }
        out[i] = sum / period;
    }
    return out;
}

/** pandas ewm(alpha, adjust=False); a NaN input stays NaN until the first real value seeds it. */
function ewmAlpha(values: Series, alpha: number): Series {
    const out: Series = new Array(values.length).fill(NaN);
    let prev = NaN;
    for (let i = 0; i < values.length; i++) {
        const x = values[i];
        if (Number.isNaN(x)) {
            out[i] = prev;
            continue;
        }
        prev = Number.isNaN(prev) ? x : alpha * x + (1 - alpha) * prev;
        out[i] = prev;
    }
    return out;
}

export const ema = (values: Series, period: number): Series => ewmAlpha(values, 2 / (period + 1));

export function rsi(close: Series, period: number): Series {
    const gain: Series = new Array(close.length).fill(NaN);
    const loss: Series = new Array(close.length).fill(NaN);
    for (let i = 1; i < close.length; i++) {
        const d = close[i] - close[i - 1];
        gain[i] = Math.max(d, 0);
        loss[i] = Math.max(-d, 0);
    }
    const avgGain = ewmAlpha(gain, 1 / period);
    const avgLoss = ewmAlpha(loss, 1 / period);
    return close.map((_, i) => {
        const g = avgGain[i];
        const l = avgLoss[i];
        if (Number.isNaN(g) || Number.isNaN(l)) return NaN;
        // The Python tool left RSI undefined when there were no losses at all,
        // so "RSI > 70" could never fire on a straight run-up. By definition
        // RSI is 100 there.
        if (l === 0) return g > 0 ? 100 : NaN;
        return 100 - 100 / (1 + g / l);
    });
}

export function macdLine(close: Series): Series {
    const fast = ema(close, 12);
    const slow = ema(close, 26);
    return close.map((_, i) => fast[i] - slow[i]);
}

function rollingStd(values: Series, period: number): Series {
    const out: Series = new Array(values.length).fill(NaN);
    for (let i = period - 1; i < values.length; i++) {
        if (period < 2) continue;
        let mean = 0;
        for (let j = i - period + 1; j <= i; j++) mean += values[j];
        mean /= period;
        let ss = 0;
        for (let j = i - period + 1; j <= i; j++) ss += (values[j] - mean) ** 2;
        out[i] = Math.sqrt(ss / (period - 1));
    }
    return out;
}

export function bollinger(close: Series, period: number): [Series, Series] {
    const mid = sma(close, period);
    const std = rollingStd(close, period);
    return [mid.map((m, i) => m + BB_STD_MULT * std[i]), mid.map((m, i) => m - BB_STD_MULT * std[i])];
}

/** Average True Range with Wilder smoothing. */
export function atr(candles: Candle[], period: number): Series {
    const tr = candles.map((c, i) => {
        if (i === 0) return c.high - c.low;
        const pc = candles[i - 1].close;
        return Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
    });
    return ewmAlpha(tr, 1 / period);
}

/** Stochastic %K — where the close sits inside the period's high/low range (0–100). */
export function stochK(candles: Candle[], period: number): Series {
    return candles.map((c, i) => {
        if (i < period - 1) return NaN;
        let lo = Infinity;
        let hi = -Infinity;
        for (let j = i - period + 1; j <= i; j++) {
            lo = Math.min(lo, candles[j].low);
            hi = Math.max(hi, candles[j].high);
        }
        const range = hi - lo;
        return range === 0 ? NaN : (100 * (c.close - lo)) / range;
    });
}

/** Volume-weighted average price, cumulative over the window. */
export function vwap(candles: Candle[]): Series {
    let pv = 0;
    let v = 0;
    return candles.map((c) => {
        if (c.volume === 0) return NaN;
        pv += ((c.high + c.low + c.close) / 3) * c.volume;
        v += c.volume;
        return pv / v;
    });
}

/** SuperTrend — ATR bands that flip with the trend. */
export function supertrend(candles: Candle[], period: number, mult = 3): Series {
    const a = atr(candles, period);
    const out: Series = new Array(candles.length).fill(NaN);
    let trendUp = true;
    let prev = NaN;
    for (let i = 0; i < candles.length; i++) {
        const hl2 = (candles[i].high + candles[i].low) / 2;
        const upper = hl2 + mult * a[i];
        const lower = hl2 - mult * a[i];
        const c = candles[i].close;
        if (i === 0 || Number.isNaN(prev)) {
            prev = lower;
            out[i] = prev;
            continue;
        }
        if (trendUp) {
            prev = Math.max(lower, prev);
            if (c < prev) {
                trendUp = false;
                prev = upper;
            }
        } else {
            prev = Math.min(upper, prev);
            if (c > prev) {
                trendUp = true;
                prev = lower;
            }
        }
        out[i] = prev;
    }
    return out;
}

export const INDICATOR_NAMES = ["SMA", "EMA", "RSI", "MACD", "BB_UPPER", "BB_LOWER", "ATR", "STOCH_K", "VWAP", "SUPERTREND"] as const;

export function computeIndicator(candles: Candle[], indicator: string, period?: number | null): Series {
    const close = candles.map((c) => c.close);
    const p = period || DEFAULT_BB_PERIOD;
    switch (indicator.toUpperCase()) {
        case "SMA":
            return sma(close, period || 20);
        case "EMA":
            return ema(close, period || 20);
        case "RSI":
            return rsi(close, period || 14);
        case "MACD":
            return macdLine(close);
        case "BB_UPPER":
            return bollinger(close, p)[0];
        case "BB_LOWER":
            return bollinger(close, p)[1];
        case "ATR":
            return atr(candles, period || 14);
        case "STOCH_K":
            return stochK(candles, period || 14);
        case "VWAP":
            return vwap(candles);
        case "SUPERTREND":
            return supertrend(candles, period || 10);
        default:
            throw new Error(`Unknown indicator: ${indicator}`);
    }
}
