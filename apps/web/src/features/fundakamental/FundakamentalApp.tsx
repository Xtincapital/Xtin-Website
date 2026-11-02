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
import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageSpinner from "@/components/PageSpinner";
import RequireAccount from "@/components/RequireAccount";
import { useAuth } from "@/contexts/AuthContext";
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
const Technicals = lazy(() => import("./pages/Technicals"));
const Alerts = lazy(() => import("./pages/Alerts"));

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

const FundakamentalApp = () => {
  const { user, loading } = useAuth();
  const guest = !loading && !user;
  // A signed-out visitor gets the stock scanner (its sample results need no
  // account) and the pricing page; everything else is account data, so it asks
  // them to sign in instead of calling an API that would refuse them.
  const account = (feature: string, page: React.ReactNode) => (
    <RequireAccount feature={feature} description={`Sign in or create a free account to use ${feature.toLowerCase()}. The scanner and pricing stay open to everyone.`}>
      {page}
    </RequireAccount>
  );

  // Dialogs/selects portal into <body>, outside DashboardLayout's
  // `fundakamental-scope` wrapper — this class gives them FundaKaMental's
  // design tokens too (see index.css).
  useEffect(() => {
    document.body.classList.add("fundakamental-portals");
    return () => document.body.classList.remove("fundakamental-portals");
  }, []);

  if (loading) return <PageSpinner />;

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* The page body's `fundakamental-scope` wrapper (design tokens, see
            apps/web/src/index.css) lives in DashboardLayout, between the
            shared site Navbar and Footer, so it never wraps the site chrome.
            The toasters and the app-wide modals get their own. */}
        <Suspense fallback={null}>
          <Routes>
            <Route index element={guest ? <Navigate to="scanner" replace /> : <Dashboard />} />
            <Route path="settings" element={account("Settings", <Settings />)} />
            <Route path="analyze" element={account("AI analysis", <NewAnalysis />)} />
            <Route path="report/:id" element={account("Analysis reports", <AnalysisReport />)} />
            <Route path="scanner" element={<StockScanner />} />
            <Route path="portfolio" element={account("Portfolios", <Portfolio />)} />
            <Route path="watchlist" element={account("Watchlists", <Watchlist />)} />
            <Route path="history" element={account("Analysis history", <History />)} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="technicals" element={account("Technical analysis", <Technicals />)} />
            <Route path="alerts" element={account("Price alerts", <Alerts />)} />
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
};

export default FundakamentalApp;
