// Gini Pro plan tier store (Phase 10e) — the minimal piece this task's
// Required Return / Monte Carlo pages need to gate Pro-only content, read
// from the already-live `GET /gini/plan` (services/api/modules/gini/
// proPlan.controller.ts's `getPlan`, built in Phase 10c).
//
// Modeled on
// apps/web/src/features/journal/store/useJournalPlanStore.ts (read as this
// task's template), but deliberately SMALLER: this store only tracks plan
// tier (`isPro`/`plan`/`fetchPlan`), not the full wallet/checkout flow —
// Journal's equivalent store owns both because its Pricing page (with an
// inline Razorpay checkout) already existed when that store was built. For
// Gini, `/gini/pricing` is still a `ComingSoon` placeholder (Phase 10f
// scope, see GiniApp.tsx) — a wallet/checkout store here would be dead code
// until that page exists. When Phase 10f builds Pricing, it should extend
// THIS store with `wallet`/`fetchWallet`/checkout methods (mirroring
// Journal's full store) rather than creating a second, separate plan-tier
// store — components using `isPro()` here should keep working unchanged.
//
// API client boundary: `lib/api.ts` deliberately reserves `proPlan` for
// Phase 10f (see that file's header comment) — this store talks to the
// backend directly via `authService.makeAuthenticatedRequest`, mirroring
// `api.ts`'s own `request()` helper rather than importing it, same as
// Journal's store does for the identical reason.
import { create } from "zustand";
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";

const API_PREFIX = "/api/gini";

async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || body?.detail || fallback;
}

interface GiniPlan {
  plan_id: string;
  billing: string;
  currency: string;
  region: string | null;
  activated_at: string;
  valid_until: string;
  payment_id: string | null;
}

interface GiniPlanState {
  plan: GiniPlan | null;
  isProFlag: boolean;
  loading: boolean;
  fetched: boolean;
  /** True once a live `/gini/plan` read has confirmed Pro — the only
   *  trusted source of truth, matching every other product in this
   *  migration's "server is authoritative" convention (see
   *  services/api/modules/gini/planTier.ts's own header comment). */
  isPro: () => boolean;
  fetchPlan: () => Promise<void>;
}

export const useGiniPlanStore = create<GiniPlanState>((set, get) => ({
  plan: null,
  isProFlag: false,
  loading: false,
  fetched: false,

  isPro: () => get().isProFlag,

  fetchPlan: async () => {
    set({ loading: true });
    try {
      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}/plan`);
      if (!res.ok) throw new Error(await readError(res, "Failed to fetch plan"));
      const data = await res.json();
      set({ plan: data?.plan ?? null, isProFlag: Boolean(data?.is_pro), loading: false, fetched: true });
    } catch (err) {
      console.error("[Gini Plan] fetch failed:", err);
      set({ loading: false, fetched: true });
    }
  },
}));
