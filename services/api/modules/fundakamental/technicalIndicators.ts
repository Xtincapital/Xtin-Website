// Technical Indicators Calculator
//
// Node/TS port of FundaKaMental's `utils/technical_indicators.py`
// (TechnicalIndicators + SignalDetector classes). Pure arithmetic — no
// external deps needed (the Python source only used numpy for np.std, which
// we replace with a manual population-standard-deviation helper below).
//
// Every function is a line-for-line translation of the Python original so
// the math stays verifiable against the source; see that file for the
// canonical formulas (SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic, ATR,
// OBV) and the buy/sell signal-detection heuristic.

export type Num = number | null;

export interface PriceBar {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjusted_close?: number | null;
}

export interface IndicatorSnapshot {
    sma_20: number | null;
    sma_50: number | null;
    sma_200: number | null;
    ema_12: number | null;
    ema_26: number | null;
    rsi: number | null;
    macd: number | null;
    macd_signal: number | null;
    macd_histogram: number | null;
    bb_upper: number | null;
    bb_middle: number | null;
    bb_lower: number | null;
    stoch_k: number | null;
    stoch_d: number | null;
    atr: number | null;
    obv: number | null;
    current_price: number;
    volume: number;
}

export interface SignalsResult {
    overall_signal: string;
    signal_strength: number;
    buy_signals: string[];
    sell_signals: string[];
    details: Record<string, string>;
}

/** Simple Moving Average. */
export function sma(prices: number[], period = 20): Num[] {
    if (prices.length < period) return new Array(prices.length).fill(null);

    const result: Num[] = new Array(period - 1).fill(null);
    for (let i = period - 1; i < prices.length; i++) {
        const window = prices.slice(i - period + 1, i + 1);
        result.push(window.reduce((a, b) => a + b, 0) / period);
    }
    return result;
}

/** Exponential Moving Average (first value seeded with the SMA). */
export function ema(prices: number[], period = 20): Num[] {
    if (prices.length < period) return new Array(prices.length).fill(null);

    const multiplier = 2 / (period + 1);
    const result: Num[] = new Array(period - 1).fill(null);

    const smaFirst = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(smaFirst);

    let emaPrev = smaFirst;
    for (let i = period; i < prices.length; i++) {
        const emaCurrent = (prices[i] - emaPrev) * multiplier + emaPrev;
        result.push(emaCurrent);
        emaPrev = emaCurrent;
    }
    return result;
}

/** Relative Strength Index (0-100), Wilder's smoothing after the first period. */
export function rsi(prices: number[], period = 14): Num[] {
    if (prices.length < period + 1) return new Array(prices.length).fill(null);

    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);

    const result: Num[] = new Array(period).fill(null);
    const gains = changes.map((c) => Math.max(c, 0));
    const losses = changes.map((c) => Math.abs(Math.min(c, 0)));

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    result.push(avgLoss === 0 ? 100.0 : 100 - 100 / (1 + avgGain / avgLoss));

    for (let i = period; i < changes.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        result.push(avgLoss === 0 ? 100.0 : 100 - 100 / (1 + avgGain / avgLoss));
    }

    return result;
}

/** Moving Average Convergence Divergence: [macdLine, signalLine, histogram]. */
export function macd(
    prices: number[],
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9,
): [Num[], Num[], Num[]] {
    if (prices.length < slowPeriod) {
        const noneList: Num[] = new Array(prices.length).fill(null);
        return [noneList, noneList, noneList];
    }

    const emaFast = ema(prices, fastPeriod);
    const emaSlow = ema(prices, slowPeriod);

    const macdLine: Num[] = [];
    for (let i = 0; i < prices.length; i++) {
        macdLine.push(emaFast[i] !== null && emaSlow[i] !== null ? (emaFast[i] as number) - (emaSlow[i] as number) : null);
    }

    const macdValues = macdLine.filter((v): v is number => v !== null);
    if (macdValues.length < signalPeriod) {
        const signalLine: Num[] = new Array(prices.length).fill(null);
        const histogram: Num[] = new Array(prices.length).fill(null);
        return [macdLine, signalLine, histogram];
    }

    const signalLine: Num[] = new Array(prices.length).fill(null);
    const startIdx = macdLine.findIndex((v) => v !== null);
    const signalEma = ema(macdValues, signalPeriod);
    signalEma.forEach((sigVal, i) => {
        if (sigVal !== null) signalLine[startIdx + i] = sigVal;
    });

    const histogram: Num[] = [];
    for (let i = 0; i < prices.length; i++) {
        histogram.push(macdLine[i] !== null && signalLine[i] !== null ? (macdLine[i] as number) - (signalLine[i] as number) : null);
    }

    return [macdLine, signalLine, histogram];
}

/** Population standard deviation (matches numpy.std's default ddof=0). */
function stddev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
}

/** Bollinger Bands: [upperBand, middleBand/SMA, lowerBand]. */
export function bollingerBands(prices: number[], period = 20, stdDevMultiplier = 2.0): [Num[], Num[], Num[]] {
    if (prices.length < period) {
        const noneList: Num[] = new Array(prices.length).fill(null);
        return [noneList, noneList, noneList];
    }

    const middleBand = sma(prices, period);
    const upperBand: Num[] = new Array(period - 1).fill(null);
    const lowerBand: Num[] = new Array(period - 1).fill(null);

    for (let i = period - 1; i < prices.length; i++) {
        const window = prices.slice(i - period + 1, i + 1);
        const std = stddev(window);
        upperBand.push((middleBand[i] as number) + stdDevMultiplier * std);
        lowerBand.push((middleBand[i] as number) - stdDevMultiplier * std);
    }

    return [upperBand, middleBand, lowerBand];
}

/** Stochastic Oscillator: [%K, %D]. */
export function stochastic(
    highs: number[],
    lows: number[],
    closes: number[],
    period = 14,
    smoothK = 3,
    smoothD = 3,
): [Num[], Num[]] {
    if (closes.length < period) {
        const noneList: Num[] = new Array(closes.length).fill(null);
        return [noneList, noneList];
    }

    const rawK: Num[] = new Array(period - 1).fill(null);
    for (let i = period - 1; i < closes.length; i++) {
        const windowHigh = Math.max(...highs.slice(i - period + 1, i + 1));
        const windowLow = Math.min(...lows.slice(i - period + 1, i + 1));
        rawK.push(windowHigh === windowLow ? 50.0 : ((closes[i] - windowLow) / (windowHigh - windowLow)) * 100);
    }

    const kValues = rawK.filter((v): v is number => v !== null);
    if (kValues.length < smoothK) {
        const noneList: Num[] = new Array(closes.length).fill(null);
        return [noneList, noneList];
    }

    const kLine: Num[] = new Array(rawK.length).fill(null);
    const startIdx = rawK.findIndex((v) => v !== null);
    const smoothedK = sma(kValues, smoothK);
    smoothedK.forEach((kVal, i) => {
        if (kVal !== null) kLine[startIdx + i] = kVal;
    });

    const kValuesClean = kLine.filter((v): v is number => v !== null);
    if (kValuesClean.length < smoothD) {
        return [kLine, new Array(closes.length).fill(null)];
    }

    const dLine: Num[] = new Array(closes.length).fill(null);
    const startIdxD = kLine.findIndex((v) => v !== null);
    const smoothedD = sma(kValuesClean, smoothD);
    smoothedD.forEach((dVal, i) => {
        if (dVal !== null) dLine[startIdxD + i] = dVal;
    });

    return [kLine, dLine];
}

/** Average True Range (volatility), Wilder's smoothing after the first period. */
export function atr(highs: number[], lows: number[], closes: number[], period = 14): Num[] {
    if (closes.length < period + 1) return new Array(closes.length).fill(null);

    const trueRanges: Num[] = [null];
    for (let i = 1; i < closes.length; i++) {
        const highLow = highs[i] - lows[i];
        const highClose = Math.abs(highs[i] - closes[i - 1]);
        const lowClose = Math.abs(lows[i] - closes[i - 1]);
        trueRanges.push(Math.max(highLow, highClose, lowClose));
    }

    const result: Num[] = new Array(period).fill(null);
    const trValues = trueRanges.filter((v): v is number => v !== null);
    let atrVal = trValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(atrVal);

    for (let i = period + 1; i < closes.length; i++) {
        atrVal = (atrVal * (period - 1) + (trueRanges[i] as number)) / period;
        result.push(atrVal);
    }

    return result;
}

/** On-Balance Volume. */
export function obv(closes: number[], volumes: number[]): number[] {
    if (closes.length !== volumes.length || closes.length < 2) {
        return new Array(closes.length).fill(0);
    }

    const obvVals: number[] = [0];
    for (let i = 1; i < closes.length; i++) {
        if (closes[i] > closes[i - 1]) obvVals.push(obvVals[obvVals.length - 1] + volumes[i]);
        else if (closes[i] < closes[i - 1]) obvVals.push(obvVals[obvVals.length - 1] - volumes[i]);
        else obvVals.push(obvVals[obvVals.length - 1]);
    }
    return obvVals;
}

function last<T>(arr: T[]): T | undefined {
    return arr.length ? arr[arr.length - 1] : undefined;
}

/** Calculate all indicators and return only the latest (most recent) values. */
export function calculateAll(priceData: PriceBar[]): Partial<IndicatorSnapshot> {
    if (!priceData || priceData.length < 50) return {};

    const closes = priceData.map((d) => Number(d.close));
    const highs = priceData.map((d) => Number(d.high));
    const lows = priceData.map((d) => Number(d.low));
    const volumes = priceData.map((d) => Number(d.volume));

    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const sma200 = sma(closes, 200);
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const rsiVals = rsi(closes, 14);
    const [macdLine, signalLine, histogram] = macd(closes);
    const [bbUpper, bbMiddle, bbLower] = bollingerBands(closes);
    const [stochK, stochD] = stochastic(highs, lows, closes);
    const atrVals = atr(highs, lows, closes);
    const obvVals = obv(closes, volumes);

    return {
        sma_20: last(sma20) ?? null,
        sma_50: last(sma50) ?? null,
        sma_200: last(sma200) ?? null,
        ema_12: last(ema12) ?? null,
        ema_26: last(ema26) ?? null,
        rsi: last(rsiVals) ?? null,
        macd: last(macdLine) ?? null,
        macd_signal: last(signalLine) ?? null,
        macd_histogram: last(histogram) ?? null,
        bb_upper: last(bbUpper) ?? null,
        bb_middle: last(bbMiddle) ?? null,
        bb_lower: last(bbLower) ?? null,
        stoch_k: last(stochK) ?? null,
        stoch_d: last(stochD) ?? null,
        atr: last(atrVals) ?? null,
        obv: last(obvVals) ?? null,
        current_price: closes[closes.length - 1],
        volume: volumes[volumes.length - 1],
    };
}

/** Detect buy/sell signals from calculated indicators (0-100 strength score). */
export function detectSignals(indicators: Partial<IndicatorSnapshot>, priceData: PriceBar[]): SignalsResult {
    const signals: SignalsResult = {
        overall_signal: "NEUTRAL",
        signal_strength: 50,
        buy_signals: [],
        sell_signals: [],
        details: {},
    };

    if (!indicators || Object.keys(indicators).length === 0 || !priceData || priceData.length === 0) {
        return signals;
    }

    let buyCount = 0;
    let sellCount = 0;

    // RSI signals
    const rsiVal = indicators.rsi;
    if (rsiVal) {
        if (rsiVal < 30) {
            signals.buy_signals.push("RSI Oversold (<30)");
            buyCount += 2;
        } else if (rsiVal < 40) {
            signals.buy_signals.push("RSI Low (<40)");
            buyCount += 1;
        } else if (rsiVal > 70) {
            signals.sell_signals.push("RSI Overbought (>70)");
            sellCount += 2;
        } else if (rsiVal > 60) {
            signals.sell_signals.push("RSI High (>60)");
            sellCount += 1;
        }
        signals.details.rsi_signal = rsiVal < 30 ? "oversold" : rsiVal > 70 ? "overbought" : "neutral";
    }

    // MACD signals
    const macdVal = indicators.macd;
    const macdSignalVal = indicators.macd_signal;
    const macdHist = indicators.macd_histogram;
    if (macdVal && macdSignalVal && macdHist) {
        if (macdVal > macdSignalVal && macdHist > 0) {
            signals.buy_signals.push("MACD Bullish Crossover");
            buyCount += 2;
        } else if (macdVal < macdSignalVal && macdHist < 0) {
            signals.sell_signals.push("MACD Bearish Crossover");
            sellCount += 2;
        }
        signals.details.macd_signal = macdVal > macdSignalVal ? "bullish" : "bearish";
    }

    // Moving average signals
    const currentPrice = indicators.current_price;
    const sma20 = indicators.sma_20;
    const sma50 = indicators.sma_50;
    const sma200 = indicators.sma_200;

    if (currentPrice && sma20 && sma50) {
        if (currentPrice > sma20 && sma20 > sma50) {
            signals.buy_signals.push("Price Above MA20 & MA50");
            buyCount += 1;
        } else if (currentPrice < sma20 && sma20 < sma50) {
            signals.sell_signals.push("Price Below MA20 & MA50");
            sellCount += 1;
        }

        if (sma50 && sma200) {
            if (sma50 > sma200) {
                signals.buy_signals.push("Golden Cross (MA50 > MA200)");
                buyCount += 2;
            } else if (sma50 < sma200) {
                signals.sell_signals.push("Death Cross (MA50 < MA200)");
                sellCount += 2;
            }
        }
    }

    // Bollinger Bands signals
    const bbUpper = indicators.bb_upper;
    const bbLower = indicators.bb_lower;
    if (currentPrice && bbUpper && bbLower) {
        if (currentPrice <= bbLower) {
            signals.buy_signals.push("Price At Lower Bollinger Band");
            buyCount += 1;
        } else if (currentPrice >= bbUpper) {
            signals.sell_signals.push("Price At Upper Bollinger Band");
            sellCount += 1;
        }
    }

    // Stochastic signals
    const stochK = indicators.stoch_k;
    const stochD = indicators.stoch_d;
    if (stochK && stochD) {
        if (stochK < 20 && stochD < 20) {
            signals.buy_signals.push("Stochastic Oversold (<20)");
            buyCount += 1;
        } else if (stochK > 80 && stochD > 80) {
            signals.sell_signals.push("Stochastic Overbought (>80)");
            sellCount += 1;
        }
        signals.details.stochastic_signal = stochK > stochD ? "bullish" : "bearish";
    }

    // Overall signal
    const totalSignals = buyCount + sellCount;
    if (totalSignals > 0) {
        const buyPercentage = (buyCount / totalSignals) * 100;

        if (buyPercentage >= 70) {
            signals.overall_signal = "STRONG BUY";
            signals.signal_strength = 80 + (buyPercentage - 70) * 0.67;
        } else if (buyPercentage >= 55) {
            signals.overall_signal = "BUY";
            signals.signal_strength = 60 + (buyPercentage - 55) * 1.33;
        } else if (buyPercentage >= 45) {
            signals.overall_signal = "NEUTRAL";
            signals.signal_strength = 45 + (buyPercentage - 45);
        } else if (buyPercentage >= 30) {
            signals.overall_signal = "SELL";
            signals.signal_strength = 30 + (buyPercentage - 30);
        } else {
            signals.overall_signal = "STRONG SELL";
            signals.signal_strength = Math.max(10, buyPercentage);
        }
    }

    signals.signal_strength = Math.round(signals.signal_strength * 10) / 10;

    return signals;
}
