// Journal routing shell — mounted at `/journal/*` in the main site's router
// (a future task adds
// `<Route path="/journal/*" element={<ProtectedPageRoute><JournalApp /></ProtectedPageRoute>} />`
// to apps/web/src/App.tsx — NOT done here, see this task's explicit
// boundaries). Modeled on
// apps/web/src/features/fundakamental/FundakamentalApp.tsx (read as this
// task's template), adapted to nest under the host app's own
// router/providers instead of owning its own top-level ones.
//
// Dropped from the original (features-incoming/journal/app.js +
// supabase-journal.js), same reasoning FundaKaMental's shell used:
//   - Journal's own login flow (supabase-journal.js) and any region
//     detection — the host app's shared `AuthContext` + `ProtectedPageRoute`
//     already gate this entire subtree, and the shared root `CurrencyProvider`
//     (apps/web/src/contexts/CurrencyContext.tsx, mounted once in
//     apps/web/src/App.tsx) already does region/FX detection app-wide.
//   - No `BrowserRouter` here — the host app already has exactly one,
//     wrapping this component.
//
// ─────────────────────────────────────────────────────────────────────────
// ROUTE PATHS — canonical list. The parallel Trades/Goals-page task and
// every later Journal sub-phase (analytics, calendar, heatmaps, psychology,
// hourly, summary, monthly, daily, AI coach, settings, pricing) MUST use
// these exact paths — this list is also mirrored in
// ./components/JournalLayout.tsx's nav (keep both in sync):
//
//   /journal            → Dashboard (index; built in this task)
//   /journal/trades      → Trades            (parallel task)
//   /journal/goals        → Goals             (parallel task)
//   /journal/analytics    → Analytics
//   /journal/calendar     → Calendar
//   /journal/heatmaps     → Heatmaps
//   /journal/psychology   → Psychology
//   /journal/hourly       → Hourly Analysis
//   /journal/summary      → Summary
//   /journal/monthly      → Monthly View
//   /journal/daily        → Daily View
//   /journal/coach        → AI Coach (aiCoach.routes.ts)
//   /journal/settings     → Settings
//   /journal/pricing      → Pricing (was "subscription" in the original)
//
// Only `/journal` (Dashboard) has a real page component so far — every other
// path above falls through to the inline `ComingSoon` placeholder below
// rather than a hard 404, since these routes are reserved/expected to fill
// in over upcoming sub-phases (not literal dead links).
// ─────────────────────────────────────────────────────────────────────────
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import JournalLayout from "./components/JournalLayout";
import "./journal.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trades = lazy(() => import("./pages/Trades"));
const Goals = lazy(() => import("./pages/Goals"));

// A query client scoped to Journal, separate from any query client the host
// app's other features might use — matches FundaKaMental's own
// `FundakamentalApp.tsx` (same default options).
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
  <JournalLayout>
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <h1 className="text-xl font-bold text-foreground mb-2">Coming soon</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        This part of the Journal is still being built. Check back soon.
      </p>
    </div>
  </JournalLayout>
);

const JournalApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Scopes Journal's shadcn design tokens (journal.css) to this
            subtree only — see that file's header comment. */}
        <div className="journal-scope">
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="trades" element={<Trades />} />
              <Route path="goals" element={<Goals />} />
              <Route path="analytics" element={<ComingSoon />} />
              <Route path="calendar" element={<ComingSoon />} />
              <Route path="heatmaps" element={<ComingSoon />} />
              <Route path="psychology" element={<ComingSoon />} />
              <Route path="hourly" element={<ComingSoon />} />
              <Route path="summary" element={<ComingSoon />} />
              <Route path="monthly" element={<ComingSoon />} />
              <Route path="daily" element={<ComingSoon />} />
              <Route path="coach" element={<ComingSoon />} />
              <Route path="settings" element={<ComingSoon />} />
              <Route path="pricing" element={<ComingSoon />} />
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </Suspense>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default JournalApp;
