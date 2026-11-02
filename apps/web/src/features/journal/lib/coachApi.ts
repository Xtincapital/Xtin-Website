// Journal AI Coach API client (Phase 9f) — talks to the five endpoints
// aiCoach.{routes,controller,validator}.ts expose:
//   POST /journal/analyze            (pure rule-based math, no AI call, free)
//   GET  /journal/behavioral-alerts  (trivial stub — always returns [], see
//                                     that controller's own comment)
//   POST /journal/chat
//   POST /journal/weekly-review
//   POST /journal/pre-trade-check
//
// Not added to ../lib/api.ts's reserved `coach` module slot even though that
// file's own header comment earmarks it for "later sub-phases" — this
// task's explicit boundaries list `lib/api.ts` as read-only, so this is a
// sibling file instead, duplicating that file's `request()` pattern
// (authService.makeAuthenticatedRequest + BACKEND_URL) exactly like
// ../store/useJournalPlanStore.ts (the parallel task) already had to do for
// the same reason — see that store's header comment.
//
// 402 handling: chat/weekly-review/pre-trade-check all gate on the AI
// wallet (aiCoach.controller.ts's `callClaudeCoach` -> `ensureAiTokens`) and
// respond `402 { error, token_balance }` when short. `postCoach` below
// throws `InsufficientTokensError` specifically for that case so callers
// (Coach.tsx) can show a "top up" prompt instead of a generic failure toast.
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';
import { blockGuest } from '../../../lib/guestGate';
import type { Trade } from './api';

const API_PREFIX = '/api/journal';

export class InsufficientTokensError extends Error {
  tokenBalance: number;
  constructor(message: string, tokenBalance: number) {
    super(message);
    this.name = 'InsufficientTokensError';
    this.tokenBalance = tokenBalance;
  }
}

async function readBody(res: Response): Promise<any> {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function postCoach<T = any>(path: string, body: unknown): Promise<T> {
  blockGuest('ai'); // the AI works on an account
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await readBody(res);
  if (!res.ok) {
    if (res.status === 402) {
      throw new InsufficientTokensError(data?.error || 'Insufficient AI tokens', data?.token_balance ?? 0);
    }
    throw new Error(data?.error || data?.message || 'Request failed');
  }
  return data as T;
}

async function getCoach<T = any>(path: string): Promise<T> {
  blockGuest('ai', { prompt: false }); // loaded by the page itself, so no modal
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, { method: 'GET' });
  const data = await readBody(res);
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }
  return data as T;
}

// ─────────────────────────────────────────────────────────────────────────
// Trades passed to these endpoints: `Trade` rows straight from
// api.trades.getTrades() need no transformation — tradeContext.ts's header
// comment confirms the backend reads `asset`/`pnl`/`strategy`/`market`/
// `date` (Phase 9a's column names) directly, with `symbol`/`profit_loss`
// only as a legacy fallback.
// ─────────────────────────────────────────────────────────────────────────

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatGoalInput {
  title?: string;
  target?: number;
  metric?: string;
  timeframe?: string;
}

export interface ChatRequest {
  message: string;
  trades: Trade[];
  display_name?: string;
  history?: ChatHistoryMessage[];
  goals?: ChatGoalInput[];
  client_tier?: 'free' | 'pro';
  currency?: string;
  /** Pro: the saved conversation this message continues. */
  conversation_id?: string | null;
}

export interface ChatResponse {
  reply: string;
  tokens_used: number;
  token_balance: number;
  tier: 'free' | 'pro';
  /** Pro: the saved conversation this exchange went into (null for free users). */
  conversation_id?: string | null;
}

export interface WeeklyReviewRequest {
  trades: Trade[];
  start_date?: string;
  end_date?: string;
}

export interface WeeklyReviewResponse {
  review: string;
  trade_count: number;
  tokens_used?: number;
  token_balance?: number;
  generated_at?: string;
}

export interface PreTradeCheckRequest {
  symbol?: string;
  trade_type?: string;
  market?: string;
  strategy?: string;
  risk_amount?: number;
  potential_profit?: number;
}

export interface PreTradeCheckResponse {
  user_id: string;
  symbol: string;
  reminder: string;
  risk_reward: number;
  tokens_used: number;
  token_balance: number;
  timestamp: string;
}

export interface BehavioralAlert {
  title?: string;
  message?: string;
  severity?: string;
  [key: string]: unknown;
}

export interface BehavioralAlertsResponse {
  user_id: string;
  alert_count: number;
  alerts: BehavioralAlert[];
  last_updated: string;
}

/** analyze's response shape — see aiCoach.controller.ts's `analyzeTrades`. */
export interface AnalyzeInsight {
  title: string;
  metric: string;
  insight: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high';
  learning?: string[] | null;
}

export interface AnalyzeResponse {
  analysis: {
    core_metrics?: {
      total_trades: number;
      win_rate: number;
      profit_factor: number;
      total_profit: number;
      average_win: number;
      average_loss: number;
      wins: number;
      losses: number;
    };
    win_rate: number;
    total_pnl: number;
    profit_factor: number;
    expectancy: number;
  };
  insights: {
    issues: AnalyzeInsight[];
    strengths: AnalyzeInsight[];
  };
}

export const coach = {
  chat: (params: ChatRequest): Promise<ChatResponse> => postCoach('/chat', params),

  weeklyReview: (params: WeeklyReviewRequest): Promise<WeeklyReviewResponse> => postCoach('/weekly-review', params),

  preTradeCheck: (params: PreTradeCheckRequest): Promise<PreTradeCheckResponse> => postCoach('/pre-trade-check', params),

  behavioralAlerts: (): Promise<BehavioralAlertsResponse> => getCoach('/behavioral-alerts'),

  analyze: (trades: Trade[]): Promise<AnalyzeResponse> => postCoach('/analyze', { trades }),
};
