// Shared shapes for the Backtest module — Node/TS port of the standalone
// Python tool's `schemas/strategy.py` + `schemas/backtest.py`. A strategy is a
// JSON condition tree the engine walks bar by bar; the engine returns the
// same {metrics, trades, equity_curve} shape the report UI renders.

export type IndicatorOperand = { kind: "indicator"; indicator: string; period?: number | null };
export type FieldOperand = { kind: "field"; field: string };
export type ValueOperand = { kind: "value"; value: number | string };
export type Operand = IndicatorOperand | FieldOperand | ValueOperand;

export type Operator = ">" | "<" | ">=" | "<=" | "==" | "crosses_above" | "crosses_below";

export type Condition = { left: Operand; op: Operator; right: Operand };
export type ConditionGroup = { match?: "all" | "any"; conditions?: Condition[] };

export type StrategyDefinition = {
    instrument?: { symbol?: string; exchange?: string; timeframe?: string };
    entry?: ConditionGroup;
    entry_action?: { side?: "BUY" | "SELL"; qty?: number; order_type?: "MARKET" | "LIMIT" };
    exit?: ConditionGroup;
    risk?: {
        stop_loss_pct?: number | null;
        target_pct?: number | null;
        trailing_sl_pct?: number | null;
        square_off_time?: string | null;
    };
    /** How big each trade is, recomputed at every fill price. Absent on legacy definitions → `entry_action.qty` as a fixed quantity. */
    sizing?: Sizing;
    execution?: Execution;
    costs?: CostSettings;
};

export type SizingMode = "fixed_qty" | "fixed_amount" | "pct_equity";
/** `value` is shares for fixed_qty, rupees for fixed_amount, percent for pct_equity. */
export type Sizing = { mode: SizingMode; value: number };

export type Execution = {
    /** "next_bar_open" (default): a signal on bar t's close fills at bar t+1's open. */
    fill?: "next_bar_open" | "bar_close";
    /** CNC = delivery (cash only); MIS = intraday (broker leverage). Default: MIS when square_off_time is set, else CNC. */
    product?: "CNC" | "MIS";
    /** Bars after an exit during which entry signals are ignored. Default 1 (no same-bar re-entry). */
    reentry_cooldown_bars?: number;
};

/** `profile: null` runs before costs. Slippage is charged per side on market fills. */
export type CostSettings = { profile?: string | null; slippage_bps?: number };

/** A candle's `time` is a naive local-clock ISO string ("2024-01-02T09:15:00"). */
export type Candle = { time: string; open: number; high: number; low: number; close: number; volume: number };

export type Trade = {
    side: string;
    qty: number;
    entry_time: string;
    entry_price: number;
    exit_time: string;
    exit_price: number;
    pnl: number;
    pnl_pct: number;
    reason: string;
    /** P&L before charges; `pnl` is net of them. */
    gross_pnl: number;
    /** Charges on both fills (brokerage, STT, fees, stamp duty, GST, DP). */
    costs: number;
};

export type EquityPoint = { time: string; equity: number };

export type Metrics = {
    starting_capital: number;
    final_equity: number;
    total_pnl: number;
    total_return_pct: number;
    num_trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    profit_factor: number;
    max_drawdown_pct: number;
    sharpe: number;
    total_costs: number;
    /** Equity reached zero: the position was liquidated and the run stopped there. */
    wiped_out: boolean;
    /** Engine 2.1+. Null where a figure can't be stated honestly (e.g. CAGR over under 30 days). */
    cagr_pct?: number | null;
    sortino?: number | null;
    calmar?: number | null;
    /** Average net P&L per trade, in rupees. */
    expectancy?: number;
    max_drawdown_duration_bars?: number;
    max_drawdown_duration_days?: number | null;
    /** Share of bars with a position open at the close. */
    exposure_pct?: number | null;
    risk_free_pct?: number;
    /** Buying at the first open and holding to the last close, before costs. */
    benchmark?: { kind: "buy_hold"; total_return_pct: number; cagr_pct: number | null; max_drawdown_pct: number } | null;
};

/** Everything a reader needs to interpret the numbers — shown beside every result. */
export type Assumptions = {
    engine_version: string;
    spec_version?: string;
    /** SHA-256 of the normalised spec — the strategy's fingerprint. */
    spec_hash?: string;
    fill: "next_bar_open" | "bar_close";
    product: "CNC" | "MIS";
    sizing: string;
    cost_profile: string | null;
    slippage_bps: number;
    reentry_cooldown_bars: number;
    risk_free_pct?: number;
    data_adjust?: string;
    data_lag_days?: number;
    /** Filled in by the controller once it knows where the candles came from. */
    data_source?: "synthetic" | "yahoo";
    /** Content hash of the candles the run used: same data version → same candles. */
    data_version?: string;
    synthetic?: boolean;
    theoretical_index?: boolean;
};

export type EngineResult = { trades: Trade[]; equity_curve: EquityPoint[]; metrics: Metrics; assumptions: Assumptions; warnings: string[] };
export type BacktestResult = EngineResult & { candles: Candle[] };

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "1d"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
