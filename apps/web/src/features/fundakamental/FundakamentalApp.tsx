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
import UpgradeModal from "./components/UpgradeModal";
import BuyTokensModal from "./components/BuyTokensModal";
import ProCelebration from "./components/ProCelebration";
import "./fundakamental.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewAnalysis = lazy(() => import("./pages/NewAnalysis"));
const AnalysisReport = lazy(() => import("./pages/AnalysisReport"));
const StockScanner = lazy(() => import("./pages/StockScanner"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const History = lazy(() => import("./pages/History"));
const Pricing = lazy(() => import("./pages/Pricing"));

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
        {/* The page body's `fundakamental-scope` wrapper (design tokens, see
            apps/web/src/index.css) lives in DashboardLayout, between the
            shared site Navbar and Footer, so it never wraps the site chrome.
            The toasters and the app-wide modals get their own. */}
        <Suspense fallback={null}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analyze" element={<NewAnalysis />} />
            <Route path="report/:id" element={<AnalysisReport />} />
            <Route path="scanner" element={<StockScanner />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="history" element={<History />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <div className="fundakamental-scope">
          <Toaster />
          <Sonner />

          {/* Read usePlanStore's upgradeOpen/buyTokensOpen/celebrating state
              directly (already wired up in store/usePlanStore.ts).
              RegionToast is deliberately NOT re-added here — the host app's
              own region-detection toast already covers this app-wide via the
              shared CurrencyProvider; a second one scoped to this subtree
              would be redundant. */}
          <UpgradeModal />
          <BuyTokensModal />
          <ProCelebration />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default FundakamentalApp;
