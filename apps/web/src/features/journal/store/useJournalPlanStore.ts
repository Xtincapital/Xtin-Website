// Journal Pro plan + AI wallet store (Phase 9f) — the shared piece of state
// both this task's Pricing/Settings pages and the parallel AI-coach task's
// Coach page need (Coach gates on `isPro()`/`wallet` and links out to
// `/journal/pricing` rather than owning any purchase logic itself).
//
// Modeled directly on
// apps/web/src/features/fundakamental/store/usePlanStore.ts (read as this
// task's template) — same shape: Zustand store owning plan/wallet fetch +
// Razorpay checkout, no React Query involved. Written fresh rather than
// ported, since Journal's backend module (services/api/modules/journal/
// proPlan.*, aiWallet.*) has its own response shapes and its own two
// purchase flows (a Pro subscription AND a separate AI token-pack wallet),
// where FundaKaMental's store only had one flow per concern split slightly
// differently.
//
// API client boundary: this task's brief explicitly puts `lib/api.ts` out of
// bounds (owned by the Trades/Goals task; its own header comment reserves
// `proPlan`/`aiWallet` for "a later sub-phase" — this one — but the task
// boundary still says not to touch it). So this store talks to the backend
// directly via `authService.makeAuthenticatedRequest`, mirroring api.ts's
// own `request()` helper rather than importing it.
//
// Response shapes below were read directly off the live controllers rather
// than assumed:
//   - GET  /journal/plan               → proPlan.controller.ts `getPlan`
//   - GET  /journal/ai/wallet          → aiWallet.controller.ts `getAiWallet`
//   - GET  /journal/ai/plans           → aiWallet.controller.ts `getAiPlans`
//   - POST /journal/plan/razorpay/order  → proPlan.controller.ts `createPlanOrder`
//   - POST /journal/plan/razorpay/verify → proPlan.controller.ts `verifyPlanPurchase`
//   - POST /journal/ai/razorpay/order    → aiWallet.controller.ts `createAiOrder`
//   - POST /journal/ai/razorpay/verify   → aiWallet.controller.ts `verifyAiPurchase`
//
// Global upgrade-modal judgement call (see this task's brief): NOT built.
// FundaKaMental mounts `UpgradeModal`/`BuyTokensModal` globally in its app
// shell because upgrade prompts are triggered from many scattered call
// sites (report quota hits, screener gates, etc.) deep in that feature's
// component tree. Journal's only gated surfaces so far are this store's own
// Pricing page (checkout is already inline there) and the Coach page, whose
// natural upgrade prompt is a plain link to `/journal/pricing` (a real,
// already-routed page — see JournalApp.tsx) rather than a modal replicating
// that page's content. Since this task cannot mount anything in
// JournalApp.tsx anyway (out of bounds), a global modal here would be dead
// code until a later phase wires it up. If a future phase wants the
// FundaKaMental-style global-modal pattern instead, this store's `wallet`/
// `isPro`/`fetchPlan`/`fetchWallet` are exactly what such a modal would need
// — only the modal component + its mount in JournalApp.tsx would be new.
import { create } from "zustand";
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import { getRegion } from "@/lib/region";
import supabase from "../../../supabase";
import { showPurchaseReceipt } from "@/features/billing/lib/purchaseReceipt";

const API_PREFIX = "/api/journal";

async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || body?.detail || fallback;
}

/** Authenticated JSON request — same pattern as lib/api.ts's own `request()`
 *  helper, duplicated here rather than imported since that file is out of
 *  bounds for this task (see header comment). */
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

export type JournalCurrency = "INR" | "USD" | "GBP" | "EUR";
export type ProPlanId = "journal_pro_monthly" | "journal_pro_yearly";
export type AiPackageId = "ai_500" | "ai_1000" | "ai_2000";

/** Client-side display catalogue for the two Pro tiers — must match
 *  proPlan.controller.ts's `PRO_PLANS` amounts exactly (checked directly
 *  against that file, not assumed). The backend is still the source of
 *  truth for the actual charge: `startProCheckout` only sends `plan_id` +
 *  `currency`, and `POST /journal/plan/razorpay/order` looks the amount up
 *  server-side. */
export interface ProPlanDisplay {
  id: ProPlanId;
  label: string;
  billing: "monthly" | "yearly";
  durationDays: number;
  amounts: Record<JournalCurrency, number>;
}

export const PRO_PLANS: Record<ProPlanId, ProPlanDisplay> = {
  journal_pro_monthly: {
    id: "journal_pro_monthly",
    label: "Journal Pro — Monthly",
    billing: "monthly",
    durationDays: 31,
    amounts: { INR: 299, USD: 5, GBP: 4, EUR: 5 },
  },
  journal_pro_yearly: {
    id: "journal_pro_yearly",
    label: "Journal Pro — Yearly",
    billing: "yearly",
    durationDays: 366,
    amounts: { INR: 2399, USD: 39, GBP: 29, EUR: 39 },
  },
};

/** GET /journal/ai/plans / GET /journal/ai/wallet's `plans` array — exact
 *  shape of aiWallet.controller.ts's `AI_PACKAGES` values. */
export interface AiPackage {
  id: AiPackageId;
  amount_inr: number;
  tokens: number;
  label: string;
}

/** Fallback catalogue shown before the first successful fetch (matches
 *  aiWallet.controller.ts's `AI_PACKAGES` — used only so the Pricing page
 *  isn't blank while `GET /journal/ai/plans` is in flight, never trusted for
 *  the actual charge). */
export const AI_PACKAGES_FALLBACK: AiPackage[] = [
  { id: "ai_500", amount_inr: 500, tokens: 300_000, label: "Starter AI Pack" },
  { id: "ai_1000", amount_inr: 1000, tokens: 700_000, label: "Growth AI Pack" },
  { id: "ai_2000", amount_inr: 2000, tokens: 1_600_000, label: "Power AI Pack" },
];

/** GET /journal/plan's `plan` field — exact shape of
 *  proPlan.controller.ts's `getPlan` (null when the user has never
 *  purchased Pro). */
export interface JournalPlanRecord {
  plan_id: string;
  billing: string;
  currency: string;
  region: string | null;
  activated_at: string;
  valid_until: string | null;
  payment_id: string;
}

/** GET /journal/ai/wallet's `wallet` field — exact shape of
 *  aiWallet.repository.ts's `JournalAiWallet` / the `journal_ai_wallets`
 *  row. */
export interface JournalWallet {
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
 *  localStorage JWT — same helper usePlanStore.ts uses. */
async function getCurrentAuthUser(): Promise<{ email: string } | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) return { email: data.user.email || "" };
  } catch {
    // ignore, fall back to the stored token
  }
  return localStorage.getItem("auth_token") ? { email: "" } : null;
}

/** Currency to charge in, from the visitor's detected region — mirrors
 *  usePlanStore.ts's own `billingFor(getRegion())` pattern, narrowed to the
 *  4 currencies Journal's Pro plan + Razorpay actually support (checked
 *  against proPlan.controller.ts's `SUPPORTED_CURRENCIES`). */
export function currencyForRegion(region?: string): JournalCurrency {
  const code = (region || getRegion() || "IN").toUpperCase();
  if (code === "GB") return "GBP";
  if (code === "EU") return "EUR";
  if (code === "IN") return "INR";
  return "USD";
}

// ─────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────

interface JournalPlanState {
  // Pro plan
  planId: string | null;
  validUntil: string | null;
  planLoading: boolean;
  /** True once the first plan lookup has settled (success or failure). */
  fetched: boolean;
  isPro: () => boolean;
  fetchPlan: () => Promise<void>;

  // AI wallet
  wallet: JournalWallet | null;
  walletLoading: boolean;
  fetchWallet: () => Promise<void>;

  // AI pack catalogue
  aiPackages: AiPackage[];
  aiPackagesLoading: boolean;
  fetchAiPackages: () => Promise<void>;

  // Checkout
  checkoutBusy: boolean;
  celebrating: boolean;
  startProCheckout: (planId: ProPlanId, currency: JournalCurrency) => Promise<void>;
  startAiPackCheckout: (packageId: AiPackageId) => Promise<void>;

  // Convenience: refresh everything this store owns (used after a purchase
  // and by pages that mount fresh, e.g. Pricing/Settings).
  refreshAll: () => Promise<void>;
}

export const useJournalPlanStore = create<JournalPlanState>((set, get) => ({
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
    } catch {
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
    } catch {
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
        name: "Xtin Journal Pro",
        description: orderRes.plan?.label || "Journal Pro subscription",
        theme: { color: "#16A34A" },
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
        name: "Xtin Journal — AI tokens",
        description: orderRes.package?.label || "AI token pack",
        theme: { color: "#16A34A" },
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
