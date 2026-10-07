import authService from "@/services/authService";
import { BACKEND_URL } from "@/config/env";

/** Product keys a coupon can target — the same `notes.product` values the API uses. */
export type CouponProduct =
  | "xtin_bundle"
  | "journal_pro_plan"
  | "journal_ai_tokens"
  | "gini_pro_plan"
  | "gini_ai_tokens"
  | "fundakamental_pro"
  | "fundakamental_tokens"
  | "xtin_learn_pro"
  | "xtin_newsletter_pro"
  | "xtin_algo_subscription"
  | "backtest_pro_pass";

export type CouponPreview =
  | { code: string; kind: "discount"; label: string; list_amount: number; amount: number; discount: number; currency: string }
  | { code: string; kind: "free_access"; label: string; product: string | null };

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api${path}`, { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Something went wrong — please try again");
  return data as T;
}

/**
 * What a code does to this checkout. `amount` is the list price in the
 * smallest unit (paise / cents) and only drives the preview — the server
 * re-prices the real order itself.
 */
export const previewCoupon = (code: string, product: CouponProduct, amount = 0, currency = "INR") =>
  post<{ coupon: CouponPreview }>("/coupons/preview", { code, product, amount, currency }).then((r) => r.coupon);

/** Redeems a free-access code; returns the grant's order id (for the receipt) and what it unlocked. */
export const redeemCoupon = (code: string) => post<{ order_id: string; label: string; product: string }>("/coupons/redeem", { code });

/** Order endpoints answer `{ free: true, order_id }` when a coupon made the purchase free — no Razorpay step. */
export type FreeOrder = { free: true; order_id: string; /** What the product's grant returned, for callers that show it. */ record?: any };
export const isFreeOrder = (res: unknown): res is FreeOrder => !!res && typeof res === "object" && (res as { free?: unknown }).free === true;
