// Technical Analysis API — Node/TS port of `api/endpoints/technicals.py`.
import { HTTP_STATUS } from "../../constants/constants.js";
import { getDailyPrices } from "./historicalDataService.js";
import { sma, ema, rsi, macd, bollingerBands, calculateAll, detectSignals } from "./technicalIndicators.js";
import { validateBulkSignals } from "./stocks.validator.js";

/* GET /api/fundakamental/stocks/:ticker/technicals?period=&include_signals= */
export const getTechnicalIndicators = async (req, res) => {
    try {
        const ticker = String(req.params.ticker).toUpperCase();
        const period = String(req.query.period || "1y");
        const includeSignals = req.query.include_signals !== "false";

        const priceData = await getDailyPrices(ticker, period);
        if (!priceData || priceData.length < 50) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                error: `Insufficient price data for ${ticker}. Need at least 50 days.`,
            });
        }

        const indicators = calculateAll(priceData);
        const signals = includeSignals ? detectSignals(indicators, priceData) : null;

        // Price + moving-average series for the chart on the Technicals page.
        let history: Record<string, unknown> | undefined;
        if (req.query.include_history === "true") {
            const closes = priceData.map((d) => Number(d.close));
            history = { dates: priceData.map((d) => d.date), close: closes, sma_20: sma(closes, 20), sma_50: sma(closes, 50) };
        }

        return res.status(HTTP_STATUS.OK).json({
            ticker,
            timestamp: new Date().toISOString(),
            indicators,
            signals,
            history,
        });
    } catch (err) {
        console.error("[Fundakamental] technicals failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String((err as Error)?.message || err) });
    }
};

/* GET /api/fundakamental/stocks/:ticker/indicator/:indicatorName?period=&indicator_period= */
export const getIndicatorChart = async (req, res) => {
    try {
        const ticker = String(req.params.ticker).toUpperCase();
        const indicatorName = String(req.params.indicatorName);
        const period = String(req.query.period || "1y");
        const indicatorPeriod = req.query.indicator_period ? Number(req.query.indicator_period) : undefined;

        const priceData = await getDailyPrices(ticker, period);
        if (!priceData || priceData.length < 20) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: `Insufficient price data for ${ticker}` });
        }

        const dates = priceData.map((d) => d.date);
        const closes = priceData.map((d) => Number(d.close));

        let indicatorValues: Array<number | null> = [];
        let indicatorDisplayName = indicatorName.toUpperCase();

        switch (indicatorName) {
            case "sma": {
                const p = indicatorPeriod || 20;
                indicatorValues = sma(closes, p);
                indicatorDisplayName = `SMA${p}`;
                break;
            }
            case "ema": {
                const p = indicatorPeriod || 20;
                indicatorValues = ema(closes, p);
                indicatorDisplayName = `EMA${p}`;
                break;
            }
            case "rsi": {
                const p = indicatorPeriod || 14;
                indicatorValues = rsi(closes, p);
                indicatorDisplayName = `RSI${p}`;
                break;
            }
            case "macd": {
                const [macdLine] = macd(closes);
                indicatorValues = macdLine;
                indicatorDisplayName = "MACD";
                break;
            }
            case "bb_upper": {
                const p = indicatorPeriod || 20;
                const [upper] = bollingerBands(closes, p);
                indicatorValues = upper;
                indicatorDisplayName = `BB Upper (${p})`;
                break;
            }
            case "bb_middle": {
                const p = indicatorPeriod || 20;
                const [, middle] = bollingerBands(closes, p);
                indicatorValues = middle;
                indicatorDisplayName = `BB Middle (${p})`;
                break;
            }
            case "bb_lower": {
                const p = indicatorPeriod || 20;
                const [, , lower] = bollingerBands(closes, p);
                indicatorValues = lower;
                indicatorDisplayName = `BB Lower (${p})`;
                break;
            }
            default:
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Unsupported indicator: ${indicatorName}` });
        }

        return res.status(HTTP_STATUS.OK).json({
            dates,
            prices: closes,
            indicator_values: indicatorValues,
            indicator_name: indicatorDisplayName,
        });
    } catch (err) {
        console.error("[Fundakamental] indicator chart failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String((err as Error)?.message || err) });
    }
};

/* GET /api/fundakamental/stocks/:ticker/signals */
export const getTradingSignals = async (req, res) => {
    try {
        const ticker = String(req.params.ticker).toUpperCase();
        const priceData = await getDailyPrices(ticker, "1y");
        if (!priceData || priceData.length < 50) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: `Insufficient price data for ${ticker}` });
        }
        const indicators = calculateAll(priceData);
        const signals = detectSignals(indicators, priceData);
        return res.status(HTTP_STATUS.OK).json({ ticker, timestamp: new Date().toISOString(), ...signals });
    } catch (err) {
        console.error("[Fundakamental] trading signals failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String((err as Error)?.message || err) });
    }
};

/* POST /api/fundakamental/stocks/bulk-signals */
export const getBulkTradingSignals = async (req, res) => {
    const validation = validateBulkSignals(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { tickers } = validation.data;

    const results: Array<Record<string, unknown>> = [];
    for (const rawTicker of tickers) {
        const ticker = rawTicker.toUpperCase();
        try {
            const priceData = await getDailyPrices(ticker, "6mo");
            if (priceData && priceData.length >= 50) {
                const indicators = calculateAll(priceData);
                const signals = detectSignals(indicators, priceData);
                results.push({
                    ticker,
                    overall_signal: signals.overall_signal,
                    signal_strength: signals.signal_strength,
                    rsi: indicators.rsi ?? null,
                    current_price: indicators.current_price ?? null,
                });
            } else {
                results.push({ ticker, overall_signal: "NO DATA", signal_strength: null, error: "Insufficient data" });
            }
        } catch (err) {
            results.push({ ticker, overall_signal: "ERROR", signal_strength: null, error: String((err as Error)?.message || err) });
        }
    }

    return res.status(HTTP_STATUS.OK).json({
        count: results.length,
        results,
        timestamp: new Date().toISOString(),
    });
};

/* GET /api/fundakamental/stocks/:ticker/macd?period= */
export const getMacdData = async (req, res) => {
    try {
        const ticker = String(req.params.ticker).toUpperCase();
        const period = String(req.query.period || "1y");
        const priceData = await getDailyPrices(ticker, period);
        if (!priceData || priceData.length < 50) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: `Insufficient price data for ${ticker}` });
        }
        const closes = priceData.map((d) => Number(d.close));
        const dates = priceData.map((d) => d.date);
        const [macdLine, signalLine, histogram] = macd(closes);
        return res.status(HTTP_STATUS.OK).json({
            ticker,
            dates,
            prices: closes,
            macd_line: macdLine,
            signal_line: signalLine,
            histogram,
        });
    } catch (err) {
        console.error("[Fundakamental] macd failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String((err as Error)?.message || err) });
    }
};

/* GET /api/fundakamental/stocks/:ticker/bollinger-bands?period=&bb_period=&std_dev= */
export const getBollingerBandsData = async (req, res) => {
    try {
        const ticker = String(req.params.ticker).toUpperCase();
        const period = String(req.query.period || "1y");
        const bbPeriod = req.query.bb_period ? Number(req.query.bb_period) : 20;
        const stdDev = req.query.std_dev ? Number(req.query.std_dev) : 2.0;

        const priceData = await getDailyPrices(ticker, period);
        if (!priceData || priceData.length < bbPeriod) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: `Insufficient price data for ${ticker}` });
        }
        const closes = priceData.map((d) => Number(d.close));
        const dates = priceData.map((d) => d.date);
        const [upper, middle, lower] = bollingerBands(closes, bbPeriod, stdDev);
        return res.status(HTTP_STATUS.OK).json({
            ticker,
            dates,
            prices: closes,
            upper_band: upper,
            middle_band: middle,
            lower_band: lower,
            period: bbPeriod,
            std_dev: stdDev,
        });
    } catch (err) {
        console.error("[Fundakamental] bollinger bands failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String((err as Error)?.message || err) });
    }
};
