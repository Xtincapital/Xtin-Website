// Backtest API client. Calls are authenticated with the site's shared session
// (`authService.makeAuthenticatedRequest`), like the other products — except
// the playground chat, plan summary and pass list, which the server also
// serves to signed-out visitors (see PUBLIC_PATHS).
import authService from "../../../services/authService";
import { blockGuest } from "../../../lib/guestGate";
import { BACKEND_URL } from "../../../config/env";
import type { Backtest, BacktestSummary, ChatResponse, PassInfo, PlanStatus, Strategy, StrategyDefinition } from "./types";

const API_PREFIX = "/api/backtest";

export class ApiError extends Error {
  status: number;
  code?: string;
  /** For `PRO_REQUIRED`: which Pro feature was needed. */
  feature?: string;
  constructor(status: number, message: string, code?: string, feature?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.feature = feature;
  }
}

export const isProRequired = (err: unknown): err is ApiError => err instanceof ApiError && err.code === "PRO_REQUIRED";

/** Endpoints the server answers without a login (routes.ts: optionalAuthenticate). A guest gets the anonymous allowance. */
const PUBLIC_PATHS = new Set(["/chat", "/plan", "/passes"]);

export async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_URL}${API_PREFIX}${path}`;
  const isPublic = PUBLIC_PATHS.has(path);
  // Everything else belongs to an account (strategies, runs, pass purchase).
  if (!isPublic) blockGuest(path.startsWith("/razorpay") ? "upgrade" : "save");
  const res = isPublic ? await authService.makeOptionalAuthRequest(url, options) : await authService.makeAuthenticatedRequest(url, options);
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // Validation errors carry field-level details ("symbol: Symbol can only contain…"); show those, not "Validation failed".
    const details = Array.isArray(body?.details) ? body.details.map((d: unknown) => String(d).replace(/^[\w.]+: /, "")).join(" · ") : "";
    const message = (body?.error === "Validation failed" && details) || body?.error || body?.message || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body?.code, body?.feature);
  }
  return body as T;
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

export const backtestApi = {
  chat: (payload: Record<string, unknown>) => request<ChatResponse>("/chat", { method: "POST", ...json(payload) }),
  plan: () => request<PlanStatus>("/plan"),
  passes: () => request<{ currency: string; passes: PassInfo[] }>("/passes"),

  listStrategies: () => request<Strategy[]>("/strategies"),
  getStrategy: (id: string) => request<Strategy>(`/strategies/${id}`),
  createStrategy: (body: { name: string; definition: StrategyDefinition | unknown; is_public?: boolean }) =>
    request<Strategy>("/strategies", { method: "POST", ...json(body) }),
  updateStrategy: (id: string, body: { name?: string; definition?: StrategyDefinition; is_public?: boolean }) =>
    request<Strategy>(`/strategies/${id}`, { method: "PUT", ...json(body) }),
  deleteStrategy: (id: string) => request<void>(`/strategies/${id}`, { method: "DELETE" }),

  run: (body: { strategy_id: string; start_date: string; end_date: string; starting_capital: number }) =>
    request<Backtest>("/runs", { method: "POST", ...json(body) }),
  listRuns: () => request<BacktestSummary[]>("/runs"),
  getRun: (id: string) => request<Backtest>(`/runs/${id}`),
  deleteRun: (id: string) => request<void>(`/runs/${id}`, { method: "DELETE" }),

  /** A coupon that covers the whole price answers { free: true, order_id } — the pass is already active. */
  createPassOrder: (passId: string, couponCode?: string | null) =>
    request<{ free?: boolean; order_id?: string; key_id: string; order: { id: string; amount: number; currency: string }; pass: { id: string; label: string; days: number } }>("/razorpay/order", {
      method: "POST",
      ...json({ pass_id: passId, coupon_code: couponCode || undefined }),
    }),
  verifyPass: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<{ success: boolean; valid_until: string }>("/razorpay/verify", { method: "POST", ...json(payload) }),
};
