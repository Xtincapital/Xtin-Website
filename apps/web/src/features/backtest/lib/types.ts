// Shapes returned by services/api/modules/backtest (see types.ts there).

export type Operator = ">" | "<" | ">=" | "<=" | "==" | "crosses_above" | "crosses_below";

export type Operand =
  | { kind: "indicator"; indicator: string; period: number | null }
  | { kind: "field"; field: string }
  | { kind: "value"; value: number | string };

export interface Condition {
  left: Operand;
  op: Operator;
  right: Operand;
}

export interface ConditionGroup {
  match: "all" | "any";
  conditions: Condition[];
}

export interface StrategyDefinition {
  instrument: { symbol: string; exchange: string; timeframe: string };
  entry: ConditionGroup;
  entry_action: { side: "BUY" | "SELL"; qty: number; order_type: "MARKET" | "LIMIT" };
  exit: ConditionGroup;
  risk: {
    stop_loss_pct: number | null;
    target_pct: number | null;
    trailing_sl_pct: number | null;
    square_off_time: string | null;
  };
}

export interface Strategy {
  id: string;
  name: string;
  definition: StrategyDefinition;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
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
}

export interface BacktestTrade {
  side: string;
  qty: number;
  entry_time: string;
  entry_price: number;
  exit_time: string;
  exit_price: number;
  pnl: number;
  pnl_pct: number;
  reason: string;
}

export interface EquityPoint {
  time: string;
  equity: number;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestResult {
  metrics: Metrics;
  trades: BacktestTrade[];
  equity_curve: EquityPoint[];
  candles: Candle[];
}

export interface BacktestSummary {
  id: string;
  strategy_id: string | null;
  strategy_name: string;
  start_date: string;
  end_date: string;
  starting_capital: number;
  status: string;
  error: string | null;
  metrics: Metrics | null;
  created_at: string;
}

export interface Backtest extends BacktestSummary {
  /** The strategy exactly as it was run (later edits don't change old reports). */
  definition?: StrategyDefinition | null;
  result: BacktestResult | null;
}

export interface ChatUsage {
  tier: "anon" | "free" | "pro";
  remaining: number | null;
  limit: number | null;
  window: "day" | "month" | null;
}

export interface ChatResponse {
  reply: string;
  interpretation: string;
  warnings: string[];
  strategy_name: string;
  definition: unknown;
  start_date: string;
  end_date: string;
  result: BacktestResult | null;
  ok: boolean;
  error: string | null;
  usage?: ChatUsage | null;
  suggestions?: string[];
  paywall?: boolean;
  /** Pro features this request bumped into ("options", "intraday", "full_history"). */
  locked?: string[];
}

export type Feature = "intraday" | "full_history" | "options" | "ai" | "advanced_analytics" | "unlimited_strategies";

export interface PlanStatus {
  tier: "anon" | "free" | "pro";
  /** Which Pro features this account has (all true on Pro). */
  features?: Record<Feature, boolean>;
  /** Timeframes allowed (null = all). */
  timeframes?: string[] | null;
  /** How far back the account may test (null = unlimited). */
  history_days?: number | null;
  saved_strategies_limit?: number | null;
  trial?: boolean;
  pass_id?: string | null;
  expires_at?: string | null;
  backtests_used?: number;
  backtests_limit?: number | null;
  limit_window?: string;
  trial_hours?: number;
}

export interface PassInfo {
  id: string;
  label: string;
  days: number;
  amount_paise: number;
  tag: string | null;
}

export const INDICATORS = ["RSI", "SMA", "EMA", "MACD", "BB_UPPER", "BB_LOWER", "ATR", "STOCH_K", "VWAP", "SUPERTREND"] as const;
export const FIELDS = ["close", "open", "high", "low", "volume"] as const;
export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "1d"] as const;
export const OPERATORS: Operator[] = [">", "<", ">=", "<=", "==", "crosses_above", "crosses_below"];

export function emptyCondition(): Condition {
  return {
    left: { kind: "indicator", indicator: "RSI", period: 14 },
    op: "<",
    right: { kind: "value", value: 30 },
  };
}

export function emptyDefinition(): StrategyDefinition {
  return {
    instrument: { symbol: "RELIANCE", exchange: "NSE", timeframe: "1d" },
    entry: { match: "all", conditions: [emptyCondition()] },
    entry_action: { side: "BUY", qty: 1, order_type: "MARKET" },
    exit: { match: "any", conditions: [{ left: { kind: "indicator", indicator: "RSI", period: 14 }, op: ">", right: { kind: "value", value: 70 } }] },
    risk: { stop_loss_pct: 2, target_pct: 4, trailing_sl_pct: null, square_off_time: null },
  };
}

export const inr = (n: number) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
