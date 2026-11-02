// Backtest routing shell — mounted at `/backtest/app/*` (see App.tsx). The
// marketing page stays at `/backtest`. Paths here must match
// components/BacktestLayout.tsx's tabs.
import type React from "react";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProRequiredDialog from "./components/ProRequiredDialog";
import RequireAccount from "@/components/RequireAccount";

const Playground = lazy(() => import("./pages/Playground"));
const StrategyList = lazy(() => import("./pages/StrategyList"));
const StrategyBuilder = lazy(() => import("./pages/StrategyBuilder"));
const RunBacktest = lazy(() => import("./pages/RunBacktest"));
const Backtests = lazy(() => import("./pages/Backtests"));
const BacktestResult = lazy(() => import("./pages/BacktestResult"));
const Upgrade = lazy(() => import("./pages/Upgrade"));

// Scoped to Backtest so its cache never mixes with another product's.
const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

// Saved strategies and run history belong to an account (every call behind them
// is authenticated), so a signed-out visitor gets a sign-in card there. The
// playground and the upgrade page work without one.
const strategiesOnly = (page: React.ReactNode) => (
  <RequireAccount feature="Saved strategies" description="Sign in or create a free account to save strategies and run them again whenever you like.">
    {page}
  </RequireAccount>
);
const historyOnly = (page: React.ReactNode) => (
  <RequireAccount feature="Backtest history" description="Sign in or create a free account to keep every backtest you run and open it again later.">
    {page}
  </RequireAccount>
);

const BacktestApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading…</div>}>
        <Routes>
          <Route index element={<Playground />} />
          <Route path="strategies" element={strategiesOnly(<StrategyList />)} />
          <Route path="strategies/new" element={strategiesOnly(<StrategyBuilder />)} />
          <Route path="strategies/:id" element={strategiesOnly(<StrategyBuilder />)} />
          <Route path="strategies/:id/run" element={strategiesOnly(<RunBacktest />)} />
          <Route path="history" element={historyOnly(<Backtests />)} />
          <Route path="history/:id" element={historyOnly(<BacktestResult />)} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="*" element={<Navigate to="/backtest/app" replace />} />
        </Routes>
      </Suspense>
      <Sonner />
      <ProRequiredDialog />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default BacktestApp;
