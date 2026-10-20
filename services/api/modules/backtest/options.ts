// A lightweight options-strategy backtester — port of `engine/options.py`.
//
// Full option-chain replay is a large undertaking; this gives a credible, honest
// approximation for premium-selling structures (straddle / strangle / iron
// condor). Per option cycle (one candle: enter at the open, settle at the close):
//   * collect a credit sized as a fraction of spot (a stand-in for ATM IV),
//   * settlement value is driven by the realised move |close − open|,
//   * a per-cycle stop caps the loss on short structures.
// It returns the same {metrics, trades, equity_curve} shape as the equity engine.
import { BacktestInputError, computeMetrics, ENGINE_VERSION, round2 } from "./engine.js";
import type { Candle, EngineResult, Trade } from "./types.js";

export type OptionsStructure = "straddle" | "strangle" | "iron_condor";

export type OptionsSpec = {
    structure: OptionsStructure;
    side: "SELL" | "BUY"; // SELL = short premium
    symbol: string;
    exchange: string;
    timeframe: string;
    stopMultiple: number; // per-cycle stop = stopMultiple × credit
    lots?: number;
};

const STRUCTURE: Record<OptionsStructure, { credit: number; wing: number; spread?: number }> = {
    straddle: { credit: 0.009, wing: 0 },
    strangle: { credit: 0.006, wing: 0.004 },
    iron_condor: { credit: 0.004, wing: 0.004, spread: 0.012 },
};

const LOT_SIZE: Record<string, number> = { NIFTY: 50, BANKNIFTY: 15, SENSEX: 10 };

// Rough SPAN + exposure margin as a fraction of notional, for sizing only —
// not a real broker margin calculation. Keeps a single index lot from dwarfing
// a small starting capital and producing absurd returns.
const MARGIN_PCT = 0.12;

/** Lots whose margin uses about `allocation` of capital (at least 1 — a single
 *  index lot can need more than a small account has; the backtest then reports
 *  against the margin actually required). */
export function lotsForCapital(symbol: string, spot: number, capital: number, allocation: number): number {
    const marginPerLot = spot * (LOT_SIZE[symbol.toUpperCase()] ?? 1) * MARGIN_PCT;
    return marginPerLot > 0 ? Math.max(1, Math.floor((capital * allocation) / marginPerLot)) : 1;
}

export function runOptionsBacktest(spec: OptionsSpec, candles: Candle[], startingCapital = 100_000): EngineResult {
    if (candles.length < 2) throw new BacktestInputError("Not enough candle data to run a backtest");

    const params = STRUCTURE[spec.structure];
    const direction = spec.side === "SELL" ? -1 : 1; // short profits from decay
    const lotSize = LOT_SIZE[spec.symbol.toUpperCase()] ?? 1;
    const lots = Math.max(1, spec.lots ?? 1);
    const lot = lotSize * lots;

    // Report returns against the capital the position actually requires when the
    // nominal starting capital is smaller than one lot's margin.
    const requiredMargin = candles[0].open * lotSize * MARGIN_PCT * lots;
    const effectiveCapital = Math.max(startingCapital, requiredMargin);

    let capital = effectiveCapital;
    const trades: Trade[] = [];
    const equityCurve: { time: string; equity: number }[] = [];

    for (const c of candles) {
        const spot = c.open;
        const move = Math.abs(c.close - spot);
        const credit = spot * params.credit;
        const wing = spot * params.wing;

        let value = Math.max(0, move - wing);
        if (params.spread !== undefined) value = Math.min(value, spot * params.spread); // condor risk capped by spread

        let raw: number;
        let reason = "expiry";
        if (direction === -1) {
            raw = credit - value;
            const maxLoss = spec.stopMultiple * credit;
            if (raw < -maxLoss) {
                raw = -maxLoss;
                reason = "stop_loss";
            }
        } else {
            raw = value - credit;
        }

        const pnl = round2(raw * lot);
        capital += pnl;
        trades.push({
            side: spec.side,
            qty: lot,
            entry_time: c.time,
            entry_price: round2(credit),
            exit_time: c.time,
            exit_price: round2(value),
            pnl,
            pnl_pct: credit ? round2((raw / credit) * 100) : 0,
            reason,
            gross_pnl: pnl,
            costs: 0,
        });
        equityCurve.push({ time: c.time, equity: round2(capital) });
    }

    if (!Number.isFinite(capital)) throw new Error("Backtest produced a non-finite result");
    return {
        trades,
        equity_curve: equityCurve,
        metrics: computeMetrics(trades, equityCurve, effectiveCapital, spec.timeframe),
        // A premium model, not fills: no cost model yet, so these results are before costs.
        assumptions: {
            engine_version: ENGINE_VERSION,
            fill: "bar_close",
            product: "MIS",
            sizing: `${lots} lot${lots === 1 ? "" : "s"} per cycle`,
            cost_profile: null,
            slippage_bps: 0,
            reentry_cooldown_bars: 0,
        },
        warnings: ["Options results are before costs."],
    };
}
