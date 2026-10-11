// Journal API client — Node/TS rewrite of the standalone app's direct
// Supabase calls (features-incoming/journal/app.js's `saveTrade()`,
// `loadGoalsFromStorage()`, `rememberCustomStrategy()`, etc. all talked to
// Supabase or localStorage directly; there was no REST client to port).
// Follows the exact pattern FundaKaMental's client uses — see
// apps/web/src/features/fundakamental/lib/api.ts — but is written fresh here
// since Journal has its own backend module and its own response shapes.
//
// Auth: uses this app's shared `authService.makeAuthenticatedRequest`
// (Supabase session token, falling back to the localStorage JWT, with 401
// handling) — same as every other feature in this app. No separate Journal
// login flow (the original's `supabase-journal.js`) is reproduced here; the
// host app's `AuthContext` + `ProtectedPageRoute` already gate `/journal`.
//
// Base URL: every request goes to `${BACKEND_URL}/api/journal/...` (see
// services/api/modules/journal/*.routes.ts for the exact live mount).
//
// Scope of THIS file (Phase 9d-i): only `trades`, `goals`, `strategies` are
// implemented/exported below — the three modules this task's Dashboard page
// and the parallel Trades/Goals-page task need. `aiCoach.routes.ts`,
// `import.routes.ts`, `aiWallet.routes.ts` and `proPlan.routes.ts` all exist
// on the backend already (read directly for this file's design) but are
// deliberately NOT stubbed out here — later sub-phases (9e/9f/9g...) will
// add `coach`, `bulkImport`, `aiWallet` and `proPlan` modules to this same
// file, in the reserved section below, once their pages are built.
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';
import { withSampleMode } from '../../../lib/sampleMode';
import { uploadForParse } from '../../../lib/uploadFile';
import { journalSampleMode, sampleGoals, sampleStrategies, sampleTrades } from './sampleData';

const API_PREFIX = '/api/journal';

/** Parse an error body the same way across every helper below. */
async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || body?.detail || fallback;
}

/** Authenticated JSON request — the workhorse behind every API module here. */
/** An API failure that keeps the HTTP status and the server's error `code` (e.g. DUPLICATE_TRADE). */
export class JournalApiError extends Error {
  status: number;
  code?: string;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, options);
  if (!res.ok) {
    const body = await res.clone().json().catch(() => null);
    throw new JournalApiError(await readError(res, 'Request failed'), res.status, body);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ─────────────────────────────────────────────────────────────────────────
// Shared types — mirror `journal_trades` / `journal_goals` /
// `journal_strategies` column-for-column (database/migrations/0005), and
// trades.validator.ts / goals.validator.ts / strategies.validator.ts for
// which fields are required vs optional on create.
// ─────────────────────────────────────────────────────────────────────────

/** A trade row exactly as `trades.controller.ts` returns it. */
export interface Trade {
  id: string;
  user_id: string;
  /** Set by the list endpoint when asked: an identical trade is also in the journal. */
  is_duplicate?: boolean;
  date: string;
  exit_date: string | null;
  entry_time: string | null;
  exit_time: string | null;
  time_zone: string | null;
  type: string | null;
  market: string | null;
  asset: string;
  currency: string;
  quantity: number | null;
  entry_price: number | null;
  target_price: number | null;
  stop_loss: number | null;
  exit_price: number | null;
  brokerage: number | null;
  pnl: number | null;
  strategy: string | null;
  margin: number | null;
  buy_sell: 'buy' | 'sell' | null;
  contract: string | null;
  strike_price: number | null;
  option_type: 'call' | 'put' | null;
  notes: string | null;
  tags: string[] | null;
  emotion: string | null;
  underlying_price: number | null;
  implied_volatility: number | null;
  days_to_expiry: number | null;
  greeks: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Body for `POST /journal/trades` — matches `validateTradeCreate`'s schema
 *  (`date` and `asset` are the only required fields; everything else is
 *  optional/nullable). Used for updates too (all-partial, see `TradeUpdateInput`). */
export type TradeCreateInput = Partial<Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>> &
  Pick<Trade, 'date' | 'asset'> & {
    /** Save even if the same trade is already in the journal (otherwise the server answers 409). */
    allow_duplicate?: boolean;
  };
export type TradeUpdateInput = Partial<Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export interface TradeListResponse {
  data: Trade[];
  pagination: { total: number; limit: number; offset: number };
}

/** A goal row exactly as `goals.controller.ts` returns it. There is no
 *  server-side "current value" — like the original app, progress is
 *  computed client-side from the trades list (see Dashboard.tsx). */
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  metric: string; // 'total_pnl' | 'win_rate' | 'trade_count' | 'avg_pnl'
  timeframe: string; // 'this_month' | 'all_time' | ...
  target_value: number;
  created_at: string;
  updated_at: string;
}

export type GoalInput = {
  title: string;
  metric: string;
  timeframe: string;
  target_value: number;
};
export type GoalUpdateInput = Partial<GoalInput>;

/** A strategy row exactly as `strategies.controller.ts` returns it — a
 *  minimal per-user custom-strategy name list (see the migration's comment
 *  on `journal_strategies`). */
export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Trades (trades.routes.ts)
//
// Naming: verbose `getTrades`/`createTrade`/`updateTrade`/`deleteTrade`
// (rather than a shorter `list`/`create`/`update`/`delete`) to match
// pages/Trades.tsx, which was written by the parallel task against a
// predicted shape before this client existed (see that file's header
// comment) — matching its assumption here avoids a second rename on their
// side.
// ─────────────────────────────────────────────────────────────────────────
/** List filters: `search` matches asset or strategy; `from`/`to` are trade dates (YYYY-MM-DD, inclusive). */
export interface TradeListParams {
  limit?: number;
  offset?: number;
  search?: string;
  from?: string;
  to?: string;
  /** Only trades that have an identical twin in the journal. */
  only_duplicates?: boolean;
  /** Add `is_duplicate` to each returned trade. */
  flag_duplicates?: boolean;
}

const realTrades = {
  createTrade: async (data: TradeCreateInput): Promise<Trade> => {
    return await request('/trades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** GET /journal/trades?limit=&offset= — one page (default 50, max 1000
   *  server-side per `validateTradeListQuery`). For the full history use
   *  `getAllTrades()` below. */
  getTrades: async (params?: TradeListParams): Promise<TradeListResponse> => {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.search?.trim()) query.set('search', params.search.trim());
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    if (params?.only_duplicates) query.set('only_duplicates', 'true');
    if (params?.flag_duplicates) query.set('flag_duplicates', 'true');
    const qs = query.toString();
    return await request(`/trades${qs ? `?${qs}` : ''}`);
  },

  getTrade: async (tradeId: string): Promise<Trade> => {
    return await request(`/trades/${tradeId}`);
  },

  updateTrade: async (tradeId: string, data: TradeUpdateInput): Promise<Trade> => {
    return await request(`/trades/${tradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTrade: async (tradeId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/trades/${tradeId}`, { method: 'DELETE' });
  },

  /** DELETE /journal/trades — clears every trade for the user (mirrors the
   *  original's `clearDatabase()`, scoped to trades only). */
  clearTrades: async (): Promise<{ success: boolean; deleted: number }> => {
    return await request('/trades', { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const trades = withSampleMode(journalSampleMode, realTrades, sampleTrades);

/**
 * Every trade the user has, newest first — for pages that total or chart
 * the whole history (Dashboard, Analytics, Calendar, ...). The server sends
 * at most 1000 per request, so this reads page by page. Asking for one page
 * of 200 used to leave every trade after the 200th out of those pages.
 */
export async function getAllTrades(): Promise<TradeListResponse> {
  let pageSize = 1000;
  const all: Trade[] = [];
  let total = 0;
  for (let offset = 0; ; ) {
    let res: TradeListResponse;
    try {
      res = await trades.getTrades({ limit: pageSize, offset });
    } catch (err) {
      // A server from before the 1000 limit refuses limit=1000; use its 200.
      if (pageSize === 1000 && offset === 0) {
        pageSize = 200;
        continue;
      }
      throw err;
    }
    all.push(...res.data);
    total = res.pagination?.total ?? all.length;
    offset += res.data.length;
    if (!res.data.length || all.length >= total) break;
  }
  return { data: all, pagination: { total, limit: all.length, offset: 0 } };
}

// ─────────────────────────────────────────────────────────────────────────
// Goals (goals.routes.ts) — same verbose naming convention as `trades` above,
// for the Goals page the parallel task builds next to match.
// ─────────────────────────────────────────────────────────────────────────
const realGoals = {
  createGoal: async (data: GoalInput): Promise<Goal> => {
    return await request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGoals: async (): Promise<Goal[]> => {
    return await request('/goals');
  },

  getGoal: async (goalId: string): Promise<Goal> => {
    return await request(`/goals/${goalId}`);
  },

  updateGoal: async (goalId: string, data: GoalUpdateInput): Promise<Goal> => {
    return await request(`/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteGoal: async (goalId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/goals/${goalId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const goals = withSampleMode(journalSampleMode, realGoals, sampleGoals);

// ─────────────────────────────────────────────────────────────────────────
// Strategies (strategies.routes.ts) — naming matches pages/Trades.tsx's
// already-written `api.strategies.getStrategies()` / `.createStrategy()`
// calls (see the `trades` block's naming note above).
// ─────────────────────────────────────────────────────────────────────────
const realStrategies = {
  getStrategies: async (): Promise<Strategy[]> => {
    return await request('/strategies');
  },

  /** POST /journal/strategies — get-or-create by name (case-insensitive on
   *  the backend); safe to call unconditionally when a trade is saved with
   *  a custom strategy name, mirroring the original's
   *  `rememberCustomStrategy()`. */
  createStrategy: async (name: string): Promise<Strategy> => {
    return await request('/strategies', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  deleteStrategy: async (strategyId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/strategies/${strategyId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const strategies = withSampleMode(journalSampleMode, realStrategies, sampleStrategies);

// ─────────────────────────────────────────────────────────────────────────
// Reserved for later sub-phases — DO NOT stub these out yet:
//   - `coach`     → aiCoach.routes.ts   (/journal/analyze, /behavioral-alerts,
//                    /chat, /weekly-review, /pre-trade-check)
//   - `bulkImport` → import.routes.ts    (POST /journal/import-trades, multipart)
//   - `aiWallet`   → aiWallet.routes.ts  (/journal/ai/plans, /ai/wallet,
//                    /ai/razorpay/order, /ai/razorpay/verify)
//   - `proPlan`    → proPlan.routes.ts   (/journal/plan/razorpay/order,
//                    /plan/razorpay/verify, /journal/plan)
// Each should follow the same `request()`-based pattern above, and
// `bulkImport.upload` will need the same direct-fetch-with-FormData
// approach FundaKaMental's `analysisApi.uploadFile` uses (see that file's
// header comment) since `request()` sets a JSON Content-Type by default.
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
// Bulk import (import.routes.ts) — Pro-only server-side. Stateless: returns
// parsed rows shaped like `POST /journal/trades` bodies for preview; the
// caller saves the ones it keeps via `trades.createTrade`.
// ─────────────────────────────────────────────────────────────────────────
/** An uploaded row, flagged when it's already in the journal or repeats an earlier row of the file. */
export type ImportedTrade = TradeCreateInput & { duplicate?: 'journal' | 'file' };

export const bulkImport = {
  parse: (
    file: File,
    fileType: 'csv' | 'excel' | 'pdf',
  ): Promise<{ trades: ImportedTrade[]; count: number; skipped?: number; duplicates?: { journal: number; file: number }; file_type: string }> =>
    uploadForParse(`${API_PREFIX}/import-trades`, file, { file_type: fileType }),
};

// Export all implemented APIs
export const api = {
  trades,
  getAllTrades,
  goals,
  strategies,
  bulkImport,
};
