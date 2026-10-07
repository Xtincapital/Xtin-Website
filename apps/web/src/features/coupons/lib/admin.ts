import authService from "@/services/authService";
import { BACKEND_URL } from "@/config/env";

export type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  kind: "discount" | "free_access";
  percent_off: number | null;
  amount_off_paise: number | null;
  free_product: string | null;
  free_plan: string | null;
  products: string[];
  audience: "everyone" | "new_customers" | "members";
  max_redemptions: number | null;
  per_user_limit: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  redemptions: number;
};

export type CouponCatalog = {
  products: Array<{ key: string; label: string }>;
  free_plans: Array<{ product: string; plan: string; label: string }>;
};

export type Redemption = { order_id: string; buyer_email: string | null; product: string; list_amount: number | null; paid_amount: number | null; currency: string | null; created_at: string };

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/admin/coupons${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export const adminCoupons = {
  list: () => call<{ coupons: AdminCoupon[] }>("").then((r) => r.coupons),
  catalog: () => call<CouponCatalog>("/catalog"),
  create: (body: Record<string, unknown>) => call<{ coupon: AdminCoupon }>("", { method: "POST", body: JSON.stringify(body) }).then((r) => r.coupon),
  update: (id: string, patch: Record<string, unknown>) =>
    call<{ coupon: AdminCoupon }>(`/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((r) => r.coupon),
  remove: (id: string) => call<{ success: boolean }>(`/${id}`, { method: "DELETE" }),
  redemptions: (id: string) => call<{ redemptions: Redemption[] }>(`/${id}/redemptions`).then((r) => r.redemptions),
};
