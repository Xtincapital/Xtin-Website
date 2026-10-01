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
};

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
};

export type EngineResult = { trades: Trade[]; equity_curve: EquityPoint[]; metrics: Metrics };
export type BacktestResult = EngineResult & { candles: Candle[] };

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "1d"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
