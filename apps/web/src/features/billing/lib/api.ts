import authService from "@/services/authService";
import { BACKEND_URL } from "@/config/env";

/** One purchase receipt, as returned by GET /api/billing/receipts (services/api/modules/payments/receipts.ts). */
export type Receipt = {
  receipt_no: string;
  order_id: string;
  payment_id: string;
  description: string;
  buyer_email: string | null;
  /** Smallest currency unit (paise / cents), GST inclusive. */
  amount: number;
  currency: string;
  status: "paid" | "refunded";
  paid_at: string;
};

/** Free grants (coupons) have server-made ids instead of Razorpay's. */
export const isFreeGrant = (receipt: Pick<Receipt, "order_id">) => receipt.order_id.startsWith("coupon_");

const errorFrom = async (res: Response, fallback: string) => {
  const body = await res.json().catch(() => ({}));
  return new Error(body?.error || fallback);
};

export async function fetchReceipts(): Promise<Receipt[]> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/billing/receipts`);
  if (!res.ok) throw await errorFrom(res, "Could not load your receipts");
  const body = await res.json();
  return body.receipts || [];
}

/** The receipt for one order, or null while it hasn't been issued yet. */
export async function fetchReceiptByOrder(orderId: string): Promise<Receipt | null> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/billing/receipts/order/${encodeURIComponent(orderId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw await errorFrom(res, "Could not load the receipt");
  const body = await res.json();
  return body.receipt || null;
}
