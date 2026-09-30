// Gini routing shell — mounted at `/gini/*` in the main site's router (a
// future task swaps the current `/gini` marketing-stub route in
// apps/web/src/App.tsx for
// `<Route path="/gini/*" element={<ProtectedPageRoute><GiniApp /></ProtectedPageRoute>} />`
// — NOT done here, see this task's explicit boundaries; the existing
// `GiniLanding`/`GiniIntro` marketing pages stay live at their current paths
// until that swap). Modeled on
// apps/web/src/features/journal/JournalApp.tsx (read as this task's
// template), adapted to nest under the host app's own router/providers
// instead of owning its own top-level ones.
//
// Dropped from the original (features-incoming/gini/app.js + index.html),
// same reasoning Journal/FundaKaMental's shells used:
//   - Gini's own auth/session bootstrap and region detection — the host
//     app's shared `AuthContext` + `ProtectedPageRoute` already gate this
//     entire subtree, and the shared root `CurrencyProvider`
//     (apps/web/src/contexts/CurrencyContext.tsx, mounted once in
//     apps/web/src/App.tsx) already does region/FX detection app-wide (the
//     original's own region-aware pricing/jargon, still reproduced
//     server-side in services/api/modules/gini/chatPrompt.ts, stays there).
//   - No `BrowserRouter` here — the host app already has exactly one,
//     wrapping this component.
//   - `gini-premium.js`'s onboarding tour (`GiniTour`) — a nice-to-have,
//     not core functionality; can be added in a later sub-phase without
//     touching this file's route table.
//
// ─────────────────────────────────────────────────────────────────────────
// ROUTE PATHS — canonical list. Every later Gini sub-phase (portfolio,
// planner, required-return, monte-carlo, retirement, calculators, family
// planning, advanced planning, reports, pricing) MUST use these exact
// paths — this list is also mirrored in ./components/GiniLayout.tsx's nav
// (keep both in sync):
//
//   /gini                    → Dashboard         (index; built in this task)
//   /gini/family              → Family            (built in this task)
//   /gini/networth             → Net Worth         (built in this task)
//   /gini/goals                 → Goals             (built in this task)
//   /gini/portfolio              → Portfolio
//   /gini/planner                 → Goal Planner & Projections
//   /gini/required-return           → Required Return (Pro)
//   /gini/monte-carlo                → Monte Carlo (Pro)
//   /gini/retirement                  → Retirement
//   /gini/calculators                  → EMI / SIP / Inflation calculators
//   /gini/family-planning                → Family Planning
//   /gini/family-advanced                 → Advanced Family Planning (Pro)
//   /gini/reports                          → Reports (client-side PDF export)
//   /gini/pricing                           → Pricing (Pro plan + AI wallet)
//
// Every route above now has a real page component: `/gini`, `/gini/family`,
// `/gini/networth`, `/gini/goals` (Phase 10d); `/gini/portfolio`,
// `/gini/planner`, `/gini/required-return`, `/gini/monte-carlo`,
// `/gini/retirement`, `/gini/calculators` (Phase 10e); `/gini/family-planning`,
// `/gini/family-advanced`, `/gini/reports`, `/gini/pricing` (Phase 10f). The
// `ComingSoon` placeholder below now only covers unknown/typo'd paths (the
// `path="*"` fallback). The original's floating AI chat widget
// (`#chatbotToggle`/`#chatbotWindow`) is deliberately NOT one of these
// routes — it's mounted directly in GiniLayout.tsx instead (Phase 10f),
// matching the original's actual floating-widget UX rather than turning it
// into a page.
// ─────────────────────────────────────────────────────────────────────────
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { giniSampleMode } from "./lib/sampleData";
import GiniLayout from "./components/GiniLayout";
import "./gini.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Family = lazy(() => import("./pages/Family"));
const NetWorth = lazy(() => import("./pages/NetWorth"));
const Goals = lazy(() => import("./pages/Goals"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Planner = lazy(() => import("./pages/Planner"));
const RequiredReturn = lazy(() => import("./pages/RequiredReturn"));
const MonteCarlo = lazy(() => import("./pages/MonteCarlo"));
const Retirement = lazy(() => import("./pages/Retirement"));
const Calculators = lazy(() => import("./pages/Calculators"));
const FamilyPlanning = lazy(() => import("./pages/FamilyPlanning"));
const FamilyAdvanced = lazy(() => import("./pages/FamilyAdvanced"));
const Reports = lazy(() => import("./pages/Reports"));
const Pricing = lazy(() => import("./pages/Pricing"));

// A query client scoped to Gini, separate from any query client the host
// app's other features might use — matches Journal/FundaKaMental's own app
// shells (same default options).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Entering/exiting sample mode swaps where every API call reads from, so drop
// all cached queries. Subscribed here at module load — ahead of any
// component's subscription — so the cache is empty before the routes
// re-render (see the `key` on <Routes> below).
giniSampleMode.subscribe(() => queryClient.clear());

/** Placeholder for a reserved route (see the path list above) whose page
 *  hasn't been built yet. Keeps the nav fully wired now without importing
 *  components that don't exist. */
const ComingSoon = () => (
  <GiniLayout>
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <h1 className="text-xl font-bold text-foreground mb-2">Coming soon</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        This part of Gini is still being built. Check back soon.
      </p>
    </div>
  </GiniLayout>
);

const GiniApp = () => {
  // Remount every page when sample mode flips so each one refetches.
  const { version } = giniSampleMode.useState();

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* The page body's `gini-scope` wrapper (design tokens, see
            apps/web/src/index.css) lives in GiniLayout, between the shared
            site Navbar and Footer, so it never wraps the site chrome. The
            toasters get their own. */}
        <div className="gini-scope">
          <Toaster />
          <Sonner />
        </div>
        <Suspense fallback={null}>
          <Routes key={version}>
            <Route index element={<Dashboard />} />
            <Route path="family" element={<Family />} />
            <Route path="networth" element={<NetWorth />} />
            <Route path="goals" element={<Goals />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="planner" element={<Planner />} />
            <Route path="required-return" element={<RequiredReturn />} />
            <Route path="monte-carlo" element={<MonteCarlo />} />
            <Route path="retirement" element={<Retirement />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="family-planning" element={<FamilyPlanning />} />
            <Route path="family-advanced" element={<FamilyAdvanced />} />
            <Route path="reports" element={<Reports />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default GiniApp;
