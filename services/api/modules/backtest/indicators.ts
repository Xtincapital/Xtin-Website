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
    return macd(close)[0];
}

/** [MACD line, signal line, histogram] — EMA(fast) − EMA(slow), its EMA, and their difference. */
export function macd(close: Series, fast = 12, slow = 26, signal = 9): [Series, Series, Series] {
    const f = ema(close, fast);
    const sl = ema(close, slow);
    const line = close.map((_, i) => f[i] - sl[i]);
    const sig = ema(line, signal);
    return [line, sig, line.map((v, i) => v - sig[i])];
}

/** Linearly weighted moving average: the newest bar weighs `period`, the oldest 1. */
export function wma(values: Series, period: number): Series {
    const out: Series = new Array(values.length).fill(NaN);
    const denom = (period * (period + 1)) / 2;
    for (let i = period - 1; i < values.length; i++) {
        let sum = 0;
        for (let k = 0; k < period; k++) sum += values[i - k] * (period - k);
        out[i] = sum / denom;
    }
    return out;
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

export function bollinger(close: Series, period: number, mult = BB_STD_MULT): [Series, Series, Series] {
    const mid = sma(close, period);
    const std = rollingStd(close, period);
    return [mid.map((m, i) => m + mult * std[i]), mid.map((m, i) => m - mult * std[i]), mid];
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

const sessionOf = (c: Candle) => c.time.slice(0, 10);

/** Volume-weighted average price, reset at the start of every session (an intraday measure). */
export function vwap(candles: Candle[]): Series {
    let pv = 0;
    let v = 0;
    let session = "";
    return candles.map((c) => {
        if (sessionOf(c) !== session) {
            session = sessionOf(c);
            pv = 0;
            v = 0;
        }
        if (c.volume === 0) return v ? pv / v : NaN;
        pv += ((c.high + c.low + c.close) / 3) * c.volume;
        v += c.volume;
        return pv / v;
    });
}

/** Stochastic %D — the `smooth`-bar SMA of %K. */
export function stochD(candles: Candle[], period: number, smooth = 3): Series {
    const k = stochK(candles, period);
    const out: Series = new Array(k.length).fill(NaN);
    for (let i = 0; i < k.length; i++) {
        if (i < smooth - 1) continue;
        let sum = 0;
        let ok = true;
        for (let j = i - smooth + 1; j <= i; j++) {
            if (Number.isNaN(k[j])) ok = false;
            sum += k[j];
        }
        if (ok) out[i] = sum / smooth;
    }
    return out;
}

/** Average Directional Index (Wilder): trend strength 0–100, direction-agnostic. */
export function adx(candles: Candle[], period: number): Series {
    const n = candles.length;
    const plusDm: Series = new Array(n).fill(NaN);
    const minusDm: Series = new Array(n).fill(NaN);
    const tr: Series = new Array(n).fill(NaN);
    for (let i = 1; i < n; i++) {
        const up = candles[i].high - candles[i - 1].high;
        const down = candles[i - 1].low - candles[i].low;
        plusDm[i] = up > down && up > 0 ? up : 0;
        minusDm[i] = down > up && down > 0 ? down : 0;
        const pc = candles[i - 1].close;
        tr[i] = Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - pc), Math.abs(candles[i].low - pc));
    }
    const a = 1 / period;
    const sTr = ewmAlpha(tr, a);
    const sPlus = ewmAlpha(plusDm, a);
    const sMinus = ewmAlpha(minusDm, a);
    const dx = candles.map((_, i) => {
        if (i < period || !(sTr[i] > 0)) return NaN; // warm-up: at least `period` bars of movement
        const pdi = (100 * sPlus[i]) / sTr[i];
        const mdi = (100 * sMinus[i]) / sTr[i];
        return pdi + mdi === 0 ? 0 : (100 * Math.abs(pdi - mdi)) / (pdi + mdi);
    });
    return ewmAlpha(dx, a);
}

/**
 * Donchian channel over the PREVIOUS `period` bars (the current bar excluded),
 * so "close crosses above the upper band" is a real breakout and can fire.
 */
export function donchian(candles: Candle[], period: number): [Series, Series, Series] {
    const n = candles.length;
    const upper: Series = new Array(n).fill(NaN);
    const lower: Series = new Array(n).fill(NaN);
    for (let i = period; i < n; i++) {
        let hi = -Infinity;
        let lo = Infinity;
        for (let j = i - period; j < i; j++) {
            hi = Math.max(hi, candles[j].high);
            lo = Math.min(lo, candles[j].low);
        }
        upper[i] = hi;
        lower[i] = lo;
    }
    return [upper, lower, upper.map((u, i) => (u + lower[i]) / 2)];
}

/** The previous session's high and low, known from the first bar of each session. */
export function priorDay(candles: Candle[]): [Series, Series] {
    const hi: Series = new Array(candles.length).fill(NaN);
    const lo: Series = new Array(candles.length).fill(NaN);
    let session = "";
    let curHi = -Infinity;
    let curLo = Infinity;
    let prevHi = NaN;
    let prevLo = NaN;
    candles.forEach((c, i) => {
        if (sessionOf(c) !== session) {
            if (session) {
                prevHi = curHi;
                prevLo = curLo;
            }
            session = sessionOf(c);
            curHi = -Infinity;
            curLo = Infinity;
        }
        curHi = Math.max(curHi, c.high);
        curLo = Math.min(curLo, c.low);
        hi[i] = prevHi;
        lo[i] = prevLo;
    });
    return [hi, lo];
}

const clockMinutes = (time: string) => {
    const m = /T(\d{2}):(\d{2})/.exec(time);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/**
 * Opening range: the high/low of each session's first `minutes`, defined from
 * the first bar after the range closes (NaN while it is still forming).
 * Intraday candles only.
 */
export function openingRange(candles: Candle[], minutes: number): [Series, Series] {
    const hi: Series = new Array(candles.length).fill(NaN);
    const lo: Series = new Array(candles.length).fill(NaN);
    let session = "";
    let start = 0;
    let rHi = -Infinity;
    let rLo = Infinity;
    candles.forEach((c, i) => {
        const clock = clockMinutes(c.time);
        if (clock === null) return;
        if (sessionOf(c) !== session) {
            session = sessionOf(c);
            start = clock;
            rHi = -Infinity;
            rLo = Infinity;
        }
        if (clock < start + minutes) {
            rHi = Math.max(rHi, c.high);
            rLo = Math.min(rLo, c.low);
        } else {
            hi[i] = rHi;
            lo[i] = rLo;
        }
    });
    return [hi, lo];
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

/** Spec v1 indicator names. Multi-line indicators pick a `line`. */
export const SPEC_INDICATORS = ["SMA", "EMA", "WMA", "RSI", "MACD", "BB", "ATR", "SUPERTREND", "VWAP", "STOCH", "ADX", "DONCHIAN", "PDH", "PDL", "ORH", "ORL"] as const;
export type SpecIndicator = (typeof SPEC_INDICATORS)[number];

/** One indicator reference in a Strategy Spec, e.g. {ind:"BB", len:20, mult:2, line:"upper"}. */
export type IndicatorRef = {
    ind: SpecIndicator;
    len?: number;
    mult?: number;
    fast?: number;
    slow?: number;
    signal?: number;
    smooth?: number;
    minutes?: number;
    line?: "upper" | "middle" | "lower" | "macd" | "signal" | "hist" | "k" | "d";
};

/** Defaults each indicator applies — the normaliser writes them into the spec. */
export const INDICATOR_DEFAULTS: Record<SpecIndicator, Partial<IndicatorRef>> = {
    SMA: { len: 20 },
    EMA: { len: 20 },
    WMA: { len: 20 },
    RSI: { len: 14 },
    MACD: { fast: 12, slow: 26, signal: 9, line: "macd" },
    BB: { len: 20, mult: 2, line: "middle" },
    ATR: { len: 14 },
    SUPERTREND: { len: 10, mult: 3 },
    VWAP: {},
    STOCH: { len: 14, smooth: 3, line: "k" },
    ADX: { len: 14 },
    DONCHIAN: { len: 20, line: "upper" },
    PDH: {},
    PDL: {},
    ORH: { minutes: 15 },
    ORL: { minutes: 15 },
};

/** Parameters each indicator accepts; anything else is rejected by the spec validator. */
export const INDICATOR_PARAMS: Record<SpecIndicator, (keyof IndicatorRef)[]> = {
    SMA: ["len"],
    EMA: ["len"],
    WMA: ["len"],
    RSI: ["len"],
    MACD: ["fast", "slow", "signal", "line"],
    BB: ["len", "mult", "line"],
    ATR: ["len"],
    SUPERTREND: ["len", "mult"],
    VWAP: [],
    STOCH: ["len", "smooth", "line"],
    ADX: ["len"],
    DONCHIAN: ["len", "line"],
    PDH: [],
    PDL: [],
    ORH: ["minutes"],
    ORL: ["minutes"],
};

export const INDICATOR_LINES: Partial<Record<SpecIndicator, IndicatorRef["line"][]>> = {
    MACD: ["macd", "signal", "hist"],
    BB: ["upper", "middle", "lower"],
    STOCH: ["k", "d"],
    DONCHIAN: ["upper", "middle", "lower"],
};

/** Indicators that only make sense on intraday candles. */
export const INTRADAY_ONLY: SpecIndicator[] = ["VWAP", "ORH", "ORL"];

const lineIndex = (line: string | undefined, order: string[]) => Math.max(0, order.indexOf(line ?? order[0]));

/** Compute a spec indicator (defaults already applied by the normaliser, or filled here). */
export function computeRef(candles: Candle[], raw: IndicatorRef): Series {
    const ref = { ...INDICATOR_DEFAULTS[raw.ind], ...raw };
    const close = candles.map((c) => c.close);
    const len = ref.len ?? 14;
    switch (ref.ind) {
        case "SMA":
            return sma(close, len);
        case "EMA":
            return ema(close, len);
        case "WMA":
            return wma(close, len);
        case "RSI":
            return rsi(close, len);
        case "MACD":
            return macd(close, ref.fast, ref.slow, ref.signal)[lineIndex(ref.line, ["macd", "signal", "hist"])];
        case "BB":
            return bollinger(close, len, ref.mult)[lineIndex(ref.line, ["upper", "lower", "middle"])];
        case "ATR":
            return atr(candles, len);
        case "SUPERTREND":
            return supertrend(candles, len, ref.mult);
        case "VWAP":
            return vwap(candles);
        case "STOCH":
            return ref.line === "d" ? stochD(candles, len, ref.smooth) : stochK(candles, len);
        case "ADX":
            return adx(candles, len);
        case "DONCHIAN":
            return donchian(candles, len)[lineIndex(ref.line, ["upper", "lower", "middle"])];
        case "PDH":
            return priorDay(candles)[0];
        case "PDL":
            return priorDay(candles)[1];
        case "ORH":
            return openingRange(candles, ref.minutes ?? 15)[0];
        case "ORL":
            return openingRange(candles, ref.minutes ?? 15)[1];
        default:
            throw new Error(`Unknown indicator: ${(ref as IndicatorRef).ind}`);
    }
}

/** A legacy (pre-spec) indicator name + period as a spec reference. */
export function legacyRef(indicator: string, period?: number | null): IndicatorRef {
    const p = period || undefined;
    switch (indicator.toUpperCase()) {
        case "SMA":
        case "EMA":
            return { ind: indicator.toUpperCase() as "SMA", len: p ?? 20 };
        case "RSI":
            return { ind: "RSI", len: p ?? 14 };
        case "MACD":
            return { ind: "MACD", fast: 12, slow: 26, signal: 9, line: "macd" };
        case "BB_UPPER":
            return { ind: "BB", len: p ?? DEFAULT_BB_PERIOD, mult: BB_STD_MULT, line: "upper" };
        case "BB_LOWER":
            return { ind: "BB", len: p ?? DEFAULT_BB_PERIOD, mult: BB_STD_MULT, line: "lower" };
        case "ATR":
            return { ind: "ATR", len: p ?? 14 };
        case "STOCH_K":
            return { ind: "STOCH", len: p ?? 14, smooth: 3, line: "k" };
        case "VWAP":
            return { ind: "VWAP" };
        case "SUPERTREND":
            return { ind: "SUPERTREND", len: p ?? 10, mult: 3 };
        default:
            throw new Error(`Unknown indicator: ${indicator}`);
    }
}

export function computeIndicator(candles: Candle[], indicator: string, period?: number | null): Series {
    return computeRef(candles, legacyRef(indicator, period));
}
