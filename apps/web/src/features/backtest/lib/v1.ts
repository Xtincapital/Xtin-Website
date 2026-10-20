// Client for /api/v1/* (services/api/modules/backtest/v1, contract in
// GET /api/v1/openapi.json). Errors arrive as problem+json and are thrown as
// ApiError with the problem's code, feature and errors.
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import { ApiError } from "./api";
import type { BacktestResult, Metrics } from "./types";
import type { Spec } from "./spec";

const V1 = "/api/v1";

type Options = { method?: string; body?: unknown; auth?: boolean; idempotent?: boolean };

async function call<T>(path: string, { method = "GET", body, auth = true, idempotent = false }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", "X-Xtin-Channel": "web" };
  // A retried POST (double click, flaky network) must not run or save twice.
  if (idempotent) headers["Idempotency-Key"] = crypto.randomUUID();
  const init: RequestInit = { method, headers, body: body === undefined ? undefined : JSON.stringify(body) };
  const url = `${BACKEND_URL}${V1}${path}`;
  const res = auth ? await authService.makeAuthenticatedRequest(url, init) : await fetch(url, init);
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.detail || data?.title || data?.error || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data?.code, data?.feature, Array.isArray(data?.errors) ? data.errors : undefined);
  }
  return data as T;
}

export interface Instrument {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  segment: "EQ" | "INDEX" | "ETF" | "SYNTHETIC";
}

export interface Validation {
  valid: boolean;
  spec?: Spec;
  spec_hash?: string;
  summary?: string;
  warnings?: string[];
  errors: string[];
  estimate?: { credits: number; bars: number };
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  spec: Spec;
}

export interface SavedStrategy {
  id: string;
  name: string;
  version: number;
  legacy: boolean;
  spec: Spec | null;
  spec_hash: string | null;
  summary: string | null;
  errors?: string[];
  warnings?: string[];
  created_at: string;
  updated_at: string;
  versions?: { version: number; spec_hash: string; created_at: string }[];
}

export interface Headline {
  total_return_pct: number;
  cagr_pct: number | null;
  max_drawdown_pct: number;
  sharpe: number;
  win_rate: number;
  num_trades: number;
  profit_factor: number;
  total_costs: number;
}

export interface RunSummary {
  run_id: string;
  cached: boolean;
  status: string;
  name: string;
  strategy_id: string | null;
  created_at: string;
  period: { from: string; to: string };
  capital: number;
  spec_hash: string | null;
  summary: string | null;
  headline: Headline | null;
  assumptions_line: string | null;
  warnings: string[];
  disclaimer: string;
}

export interface RunDetail extends RunSummary {
  metrics: Metrics | null;
  spec: Spec | null;
  legacy_definition?: unknown;
  result?: BacktestResult;
}

export interface RunListItem {
  run_id: string;
  name: string;
  strategy_id: string | null;
  status: string;
  error: string | null;
  period: { from: string; to: string };
  capital: number;
  metrics: Metrics | null;
  created_at: string;
}

/** A spec for saving: rules only — the run page picks the window. */
export const rulesOnly = (spec: Spec): Spec => {
  const { period: _period, ...rest } = spec;
  return rest as Spec;
};

export const v1 = {
  instruments: (q: string) => call<{ data: Instrument[] }>(`/instruments?q=${encodeURIComponent(q)}&limit=8`, { auth: false }),
  validate: (spec: Spec) => call<Validation>("/strategies/validate", { method: "POST", body: { spec }, auth: false }),
  templates: () => call<{ data: Template[] }>("/strategies/templates", { auth: false }),

  listStrategies: () => call<{ data: SavedStrategy[] }>("/strategies"),
  getStrategy: (id: string) => call<SavedStrategy>(`/strategies/${id}`),
  createStrategy: (body: { name?: string; spec?: Spec; definition?: unknown }) => call<SavedStrategy>("/strategies", { method: "POST", body, idempotent: true }),
  addVersion: (id: string, body: { name?: string; spec: Spec }) => call<SavedStrategy>(`/strategies/${id}/versions`, { method: "POST", body, idempotent: true }),
  deleteStrategy: (id: string) => call<void>(`/strategies/${id}`, { method: "DELETE" }),

  run: (body: { strategy_id?: string; spec?: Spec; period?: { from: string; to: string }; capital?: number }) => call<RunSummary>("/backtests", { method: "POST", body, idempotent: true }),
  listBacktests: (page = 1, pageSize = 100) => call<{ data: RunListItem[]; page: number; has_more: boolean }>(`/backtests?page=${page}&page_size=${pageSize}`),
  getBacktest: (id: string) => call<RunDetail>(`/backtests/${id}?include=result`),
  deleteBacktest: (id: string) => call<void>(`/backtests/${id}`, { method: "DELETE" }),
};
