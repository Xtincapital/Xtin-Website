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
import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { journalSampleMode } from "./lib/sampleData";
import JournalLayout from "./components/JournalLayout";
import "./journal.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trades = lazy(() => import("./pages/Trades"));
const Goals = lazy(() => import("./pages/Goals"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Heatmaps = lazy(() => import("./pages/Heatmaps"));
const Psychology = lazy(() => import("./pages/Psychology"));
const Hourly = lazy(() => import("./pages/Hourly"));
const Summary = lazy(() => import("./pages/Summary"));
const Monthly = lazy(() => import("./pages/Monthly"));
const Daily = lazy(() => import("./pages/Daily"));
const Coach = lazy(() => import("./pages/Coach"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));

// A query client scoped to Journal, separate from any query client the host
// app's other features might use — matches FundaKaMental's own
// `FundakamentalApp.tsx` (same default options).
//
// Its query cache tells the user when their journal data couldn't be loaded, instead of the
// pages quietly rendering as if they had no trades. One toast (fixed id) no
// matter how many queries failed, with a Retry that refetches them all.
const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error("Couldn't load your journal data", {
        id: "journal-load-error",
        duration: Infinity, // stays until dismissed or retried
        description: error instanceof Error ? error.message : "Please check your connection and try again.",
        action: { label: "Retry", onClick: () => queryClient.refetchQueries({ type: "active" }) },
      });
    },
  }),
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
journalSampleMode.subscribe(() => queryClient.clear());

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

const JournalApp = () => {
  // Remount every page when sample mode flips so each one refetches.
  const { version } = journalSampleMode.useState();

  // Dialogs/selects portal into <body>, outside JournalLayout's
  // `journal-scope` wrapper — this class gives them Journal's styling too
  // (see journal.css).
  useEffect(() => {
    document.body.classList.add("journal-portals");
    return () => document.body.classList.remove("journal-portals");
  }, []);

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Journal's design tokens (journal.css) are scoped by the
            `journal-scope` wrapper inside JournalLayout, so they apply to the
            page body only and never to the shared site Navbar/Footer that
            JournalLayout renders around it. The toasters get their own. */}
        <div className="journal-scope">
          <Toaster />
          <Sonner />
        </div>
        <Suspense fallback={null}>
          <Routes key={version}>
            <Route index element={<Dashboard />} />
            <Route path="trades" element={<Trades />} />
            <Route path="goals" element={<Goals />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="heatmaps" element={<Heatmaps />} />
            <Route path="psychology" element={<Psychology />} />
            <Route path="hourly" element={<Hourly />} />
            <Route path="summary" element={<Summary />} />
            <Route path="monthly" element={<Monthly />} />
            <Route path="daily" element={<Daily />} />
            <Route path="coach" element={<Coach />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default JournalApp;
