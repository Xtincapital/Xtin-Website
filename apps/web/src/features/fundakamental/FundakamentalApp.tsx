// FundaKaMental routing shell — mounted at `/fundakamental/*` in the main
// site's router (see `<Route path="/fundakamental/*" element={<ProtectedPageRoute><FundakamentalApp /></ProtectedPageRoute>} />`
// in apps/web/src/App.tsx). Ported from
// features-incoming/fundakamental/src/App.tsx's `<AppContent>` + provider
// stack, adapted to nest under the host app's own router/providers instead
// of owning its own top-level ones.
//
// Dropped from the original App.tsx (see the module-level docs in
// lib/api.ts, store/usePlanStore.ts and App.tsx's route-swap comment for the
// full rationale):
//   - `BrowserRouter` — the host app already has exactly one, wrapping this
//     component; nesting a second one is invalid.
//   - Auth: `useAuthStore().initializeAuth()`, `ProtectedRoute`, and the
//     `/login` `/register` `/forgot-password` `/reset-password` `/` (landing)
//     routes — all redundant with the host app's own `AuthContext` +
//     `ProtectedPageRoute` (which already gates this entire subtree) +
//     `/intro/fundakamental` (the public marketing page).
//   - `detectRegion()` / `getRates()` on mount — the host app's root
//     `CurrencyProvider` (apps/web/src/contexts/CurrencyContext.tsx, mounted
//     in apps/web/src/App.tsx around the whole router) already does this
//     exactly once, app-wide. Doing it again here would double the IP
//     lookup + FX fetch every time this subtree mounts.
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./fundakamental.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// A query client scoped to FundaKaMental, separate from any query client the
// host app's other features might use — matches the original App.tsx's own
// `QueryClient` instance (same default options).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const FundakamentalApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Scopes FundaKaMental's shadcn design tokens (fundakamental.css) to
            this subtree only — see that file's header comment. */}
        <div className="fundakamental-scope">
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />

              {/* TODO: mount NewAnalysis page here once ported — source:
                  features-incoming/fundakamental/src/pages/NewAnalysis.tsx
              <Route path="analyze" element={<NewAnalysis />} /> */}

              {/* TODO: mount AnalysisReport page here once ported — source:
                  features-incoming/fundakamental/src/pages/AnalysisReport.tsx
              <Route path="report/:id" element={<AnalysisReport />} /> */}

              {/* TODO: mount StockScanner page here once ported — source:
                  features-incoming/fundakamental/src/pages/StockScanner.tsx
              <Route path="scanner" element={<StockScanner />} /> */}

              {/* TODO: mount Portfolio page here once ported — source:
                  features-incoming/fundakamental/src/pages/Portfolio.tsx
              <Route path="portfolio" element={<Portfolio />} /> */}

              {/* TODO: mount Watchlist page here once ported — source:
                  features-incoming/fundakamental/src/pages/Watchlist.tsx
              <Route path="watchlist" element={<Watchlist />} /> */}

              {/* TODO: mount History page here once ported — source:
                  features-incoming/fundakamental/src/pages/History.tsx
              <Route path="history" element={<History />} /> */}

              {/* TODO: mount Pricing page here once ported — source:
                  features-incoming/fundakamental/src/pages/Pricing.tsx
              <Route path="pricing" element={<Pricing />} /> */}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          {/* TODO: mount these once ported — they read usePlanStore's
              upgradeOpen/buyTokensOpen/celebrating state, which is already
              wired up in store/usePlanStore.ts:
                - UpgradeModal   (features-incoming/fundakamental/src/components/UpgradeModal.tsx)
                - BuyTokensModal (features-incoming/fundakamental/src/components/BuyTokensModal.tsx)
                - ProCelebration (features-incoming/fundakamental/src/components/ProCelebration.tsx)
              RegionToast (features-incoming/fundakamental/src/components/RegionToast.tsx)
              is NOT re-added here — the host app's own region-detection
              toast (if any) already covers this app-wide via the shared
              CurrencyProvider; a second one scoped to this subtree would be
              redundant. */}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default FundakamentalApp;
