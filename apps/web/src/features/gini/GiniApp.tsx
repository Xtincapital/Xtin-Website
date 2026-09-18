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
// Only `/gini`, `/gini/family`, `/gini/networth`, `/gini/goals` have real
// page components so far — every other path above falls through to the
// inline `ComingSoon` placeholder below rather than a hard 404, since these
// routes are reserved/expected to fill in over upcoming sub-phases (not
// literal dead links). The original's floating AI chat widget
// (`#chatbotToggle`/`#chatbotWindow`) is deliberately NOT one of these
// routes — see GiniLayout.tsx's header comment.
// ─────────────────────────────────────────────────────────────────────────
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import GiniLayout from "./components/GiniLayout";
import "./gini.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Family = lazy(() => import("./pages/Family"));
const NetWorth = lazy(() => import("./pages/NetWorth"));
const Goals = lazy(() => import("./pages/Goals"));

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

const GiniApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Scopes Gini's shadcn design tokens (gini.css) to this subtree
            only — see that file's header comment. */}
        <div className="gini-scope">
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="family" element={<Family />} />
              <Route path="networth" element={<NetWorth />} />
              <Route path="goals" element={<Goals />} />
              <Route path="portfolio" element={<ComingSoon />} />
              <Route path="planner" element={<ComingSoon />} />
              <Route path="required-return" element={<ComingSoon />} />
              <Route path="monte-carlo" element={<ComingSoon />} />
              <Route path="retirement" element={<ComingSoon />} />
              <Route path="calculators" element={<ComingSoon />} />
              <Route path="family-planning" element={<ComingSoon />} />
              <Route path="family-advanced" element={<ComingSoon />} />
              <Route path="reports" element={<ComingSoon />} />
              <Route path="pricing" element={<ComingSoon />} />
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </Suspense>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default GiniApp;
