// Gini Pro plan + AI wallet store (Phase 10e founded this store with just
// plan-tier tracking for Required Return/Monte Carlo's `ProGate`; Phase 10f
// extends it here with the full wallet/checkout flow the new Pricing page
// and the AI chat widget need — exactly the extension path this file's
// original header comment called for, so `isPro()` keeps working unchanged
// for the two Phase 10e pages already using it).
//
// Modeled directly on
// apps/web/src/features/journal/store/useJournalPlanStore.ts (read as this
// task's template) — same shape: Zustand store owning plan/wallet fetch +
// Razorpay checkout, no React Query involved. Written fresh rather than
// ported, since Gini's backend module (services/api/modules/gini/
// proPlan.*, aiWallet.*, Phase 10c) has its own response shapes/values.
//
// API client boundary: `lib/api.ts` reserves `proPlan`/`aiWallet` the same
// way Journal's `lib/api.ts` did — this store talks to the backend directly
// via `authService.makeAuthenticatedRequest`, mirroring `api.ts`'s own
// `request()` helper rather than importing it, same reasoning as Journal's
// store.
//
// Response shapes below were read directly off the live controllers rather
// than assumed:
//   - GET  /gini/plan               → proPlan.controller.ts `getPlan`
//   - GET  /gini/ai/wallet          → aiWallet.controller.ts `getAiWallet`
//   - GET  /gini/ai/plans           → aiWallet.controller.ts `getAiPlans`
//   - POST /gini/plan/razorpay/order  → proPlan.controller.ts `createPlanOrder`
//   - POST /gini/plan/razorpay/verify → proPlan.controller.ts `verifyPlanPurchase`
//   - POST /gini/ai/razorpay/order    → aiWallet.controller.ts `createAiOrder`
//   - POST /gini/ai/razorpay/verify   → aiWallet.controller.ts `verifyAiPurchase`
//
// Global upgrade-modal judgement call (see Journal's own store for the
// identical reasoning): NOT built. Gini's only gated surfaces are
// `ProGate` (Required Return/Monte Carlo, linking to `/gini/pricing`, a
// real routed page) and this store's own Pricing page (checkout is inline
// there) — a global modal would be dead code until some future phase wants
// it, and this store's `wallet`/`isPro`/`fetchPlan`/`fetchWallet` are
// exactly what such a modal would need then.
import { create } from "zustand";
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import { getRegion } from "@/lib/region";
import supabase from "../../../supabase";
import { showPurchaseReceipt } from "@/features/billing/lib/purchaseReceipt";

const API_PREFIX = "/api/gini";

async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || body?.detail || fallback;
}

/** Authenticated JSON request — same pattern as lib/api.ts's own `request()`
 *  helper, duplicated here rather than imported since that file reserves
 *  `proPlan`/`aiWallet` for this task (see header comment). */
async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, options);
  if (!res.ok) {
    throw new Error(await readError(res, "Request failed"));
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export type GiniCurrency = "INR" | "USD" | "GBP" | "EUR";
export type ProPlanId = "pro_monthly" | "pro_yearly";
export type AiPackageId = "ai_500" | "ai_1000" | "ai_2000";

/** Client-side display catalogue for the two Pro tiers — must match
 *  proPlan.controller.ts's `PRO_PLANS` amounts exactly (checked directly
 *  against that file, not assumed). The backend is still the source of
 *  truth for the actual charge: `startProCheckout` only sends `plan_id` +
 *  `currency`, and `POST /gini/plan/razorpay/order` looks the amount up
 *  server-side. */
export interface ProPlanDisplay {
  id: ProPlanId;
  label: string;
  billing: "monthly" | "yearly";
  durationDays: number;
  amounts: Record<GiniCurrency, number>;
}

export const PRO_PLANS: Record<ProPlanId, ProPlanDisplay> = {
  pro_monthly: {
    id: "pro_monthly",
    label: "Gini Pro — Monthly",
    billing: "monthly",
    durationDays: 31,
    amounts: { INR: 499, USD: 9, GBP: 7, EUR: 8 },
  },
  pro_yearly: {
    id: "pro_yearly",
    label: "Gini Pro — Yearly",
    billing: "yearly",
    durationDays: 366,
    amounts: { INR: 3999, USD: 79, GBP: 59, EUR: 69 },
  },
};

/** GET /gini/ai/plans / GET /gini/ai/wallet's `plans` array — exact shape
 *  of aiWallet.controller.ts's `AI_PACKAGES` values. */
export interface AiPackage {
  id: AiPackageId;
  amount_inr: number;
  tokens: number;
  label: string;
}

/** Fallback catalogue shown before the first successful fetch (matches
 *  aiWallet.controller.ts's `AI_PACKAGES` — used only so the Pricing page
 *  isn't blank while `GET /gini/ai/plans` is in flight, never trusted for
 *  the actual charge). */
export const AI_PACKAGES_FALLBACK: AiPackage[] = [
  { id: "ai_500", amount_inr: 500, tokens: 300_000, label: "Starter AI Pack" },
  { id: "ai_1000", amount_inr: 1000, tokens: 700_000, label: "Growth AI Pack" },
  { id: "ai_2000", amount_inr: 2000, tokens: 1_600_000, label: "Power AI Pack" },
];

/** GET /gini/plan's `plan` field — exact shape of proPlan.controller.ts's
 *  `getPlan` (null when the user has never purchased Pro). */
export interface GiniPlanRecord {
  plan_id: string;
  billing: string;
  currency: string;
  region: string | null;
  activated_at: string;
  valid_until: string | null;
  payment_id: string;
}

/** GET /gini/ai/wallet's `wallet` field — exact shape of
 *  aiWallet.repository.ts's `GiniAiWallet` / the `gini_ai_wallets` row. */
export interface GiniWallet {
  user_id: string;
  token_balance: number;
  tokens_purchased: number;
  tokens_used: number;
  free_tokens_granted: number;
  free_tokens_granted_at: string | null;
  last_recharge: Record<string, unknown> | null;
  updated_at: string;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(Math.max(0, Math.round(n)));
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Best-effort "who's logged in" check for use outside React (this store
 *  isn't a component). Mirrors `authService.makeAuthenticatedRequest`'s own
 *  token lookup: live Supabase session first, falling back to the
 *  localStorage JWT. */
async function getCurrentAuthUser(): Promise<{ email: string } | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) return { email: data.user.email || "" };
  } catch {
    // ignore, fall back to the stored token
  }
  return localStorage.getItem("auth_token") ? { email: "" } : null;
}

/** Currency to charge in, from the visitor's detected region — narrowed to
 *  the 4 currencies Gini's Pro plan + Razorpay actually support (checked
 *  against proPlan.controller.ts's `SUPPORTED_CURRENCIES`). */
export function currencyForRegion(region?: string): GiniCurrency {
  const code = (region || getRegion() || "IN").toUpperCase();
  if (code === "GB") return "GBP";
  if (code === "EU") return "EUR";
  if (code === "IN") return "INR";
  return "USD";
}

// ─────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────

interface GiniPlanState {
  // Pro plan
  planId: string | null;
  validUntil: string | null;
  planLoading: boolean;
  fetched: boolean;
  isPro: () => boolean;
  fetchPlan: () => Promise<void>;

  // AI wallet
  wallet: GiniWallet | null;
  walletLoading: boolean;
  fetchWallet: () => Promise<void>;

  // AI pack catalogue
  aiPackages: AiPackage[];
  aiPackagesLoading: boolean;
  fetchAiPackages: () => Promise<void>;

  // Checkout
  checkoutBusy: boolean;
  celebrating: boolean;
  startProCheckout: (planId: ProPlanId, currency: GiniCurrency) => Promise<void>;
  startAiPackCheckout: (packageId: AiPackageId) => Promise<void>;

  // Convenience: refresh everything this store owns (used after a purchase
  // and by pages that mount fresh, e.g. Pricing, and the AI chat widget).
  refreshAll: () => Promise<void>;
}

export const useGiniPlanStore = create<GiniPlanState>((set, get) => ({
  planId: null,
  validUntil: null,
  planLoading: false,
  fetched: false,

  wallet: null,
  walletLoading: false,

  aiPackages: AI_PACKAGES_FALLBACK,
  aiPackagesLoading: false,

  checkoutBusy: false,
  celebrating: false,

  isPro: () => {
    const validUntil = get().validUntil;
    if (!validUntil) return false;
    return new Date(validUntil).getTime() > Date.now();
  },

  fetchPlan: async () => {
    set({ planLoading: true });
    try {
      const res: any = await request("/plan");
      set({
        planId: res?.plan?.plan_id ?? null,
        validUntil: res?.plan?.valid_until ?? null,
      });
    } catch (err) {
      console.error("[Gini Plan] fetch failed:", err);
      /* offline / not logged in — keep current */
    } finally {
      set({ planLoading: false, fetched: true });
    }
  },

  fetchWallet: async () => {
    set({ walletLoading: true });
    try {
      const res: any = await request("/ai/wallet");
      set({
        wallet: res?.wallet ?? null,
        ...(Array.isArray(res?.plans) && res.plans.length ? { aiPackages: res.plans } : {}),
      });
    } catch (err) {
      console.error("[Gini Wallet] fetch failed:", err);
      /* not logged in / backend down — leave wallet as-is */
    } finally {
      set({ walletLoading: false });
    }
  },

  fetchAiPackages: async () => {
    set({ aiPackagesLoading: true });
    try {
      const res: any = await request("/ai/plans");
      if (Array.isArray(res?.plans) && res.plans.length) {
        set({ aiPackages: res.plans });
      }
    } catch {
      /* keep the fallback catalogue */
    } finally {
      set({ aiPackagesLoading: false });
    }
  },

  refreshAll: async () => {
    await Promise.all([get().fetchPlan(), get().fetchWallet()]);
  },

  startProCheckout: async (planId, currency) => {
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
      window.location.href = "/login";
      return;
    }

    set({ checkoutBusy: true });
    try {
      const orderRes: any = await request("/plan/razorpay/order", {
        method: "POST",
        body: JSON.stringify({ plan_id: planId, currency }),
      });
      const ok = await loadRazorpayScript();
      if (!ok || !(window as any).Razorpay) {
        throw new Error("Could not load the secure checkout. Check your connection.");
      }

      const rzp = new (window as any).Razorpay({
        key: orderRes.key_id,
        order_id: orderRes.order.id,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: "Xtin Gini Pro",
        description: orderRes.plan?.label || "Gini Pro subscription",
        theme: { color: "#16a34a" },
        prefill: { email: authUser.email || "" },
        handler: async (response: any) => {
          try {
            const verify: any = await request("/plan/razorpay/verify", {
              method: "POST",
              body: JSON.stringify({
                plan_id: planId,
                currency,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (!verify?.success) throw new Error("Verification failed");
            showPurchaseReceipt(response.razorpay_order_id);
            set({ celebrating: true });
            setTimeout(() => set({ celebrating: false }), 2600);
            // A Pro purchase also grants a 100,000 AI-token bonus
            // server-side (proPlan.controller.ts's `verifyPlanPurchase`) —
            // refresh the wallet too, not just the plan.
            await get().refreshAll();
          } catch {
            alert("Payment succeeded but we couldn't confirm it. Contact support with your payment ID.");
          } finally {
            set({ checkoutBusy: false });
          }
        },
        modal: { ondismiss: () => set({ checkoutBusy: false }) },
      });
      rzp.open();
    } catch (e: any) {
      set({ checkoutBusy: false });
      alert(e?.message || "Unable to start checkout. Please try again.");
    }
  },

  startAiPackCheckout: async (packageId) => {
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
      window.location.href = "/login";
      return;
    }

    set({ checkoutBusy: true });
    try {
      const orderRes: any = await request("/ai/razorpay/order", {
        method: "POST",
        body: JSON.stringify({ package_id: packageId }),
      });
      const ok = await loadRazorpayScript();
      if (!ok || !(window as any).Razorpay) {
        throw new Error("Could not load the secure checkout. Check your connection.");
      }

      const rzp = new (window as any).Razorpay({
        key: orderRes.key_id,
        order_id: orderRes.order.id,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: "Xtin Gini — AI tokens",
        description: orderRes.package?.label || "AI token pack",
        theme: { color: "#16a34a" },
        prefill: { email: authUser.email || "" },
        handler: async (response: any) => {
          try {
            const verify: any = await request("/ai/razorpay/verify", {
              method: "POST",
              body: JSON.stringify({
                package_id: packageId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (!verify?.success) throw new Error("Verification failed");
            showPurchaseReceipt(response.razorpay_order_id);
            await get().fetchWallet();
          } catch {
            alert("Payment succeeded but we couldn't confirm it. Contact support with your payment ID.");
          } finally {
            set({ checkoutBusy: false });
          }
        },
        modal: { ondismiss: () => set({ checkoutBusy: false }) },
      });
      rzp.open();
    } catch (e: any) {
      set({ checkoutBusy: false });
      alert(e?.message || "Unable to start checkout. Please try again.");
    }
  },
}));
