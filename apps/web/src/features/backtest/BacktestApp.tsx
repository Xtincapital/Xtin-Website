// Backtest routing shell — mounted at `/backtest/app/*` (see App.tsx). The
// marketing page stays at `/backtest`. Paths here must match
// components/BacktestLayout.tsx's tabs.
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Toaster as Sonner } from "@/components/ui/sonner";

const Playground = lazy(() => import("./pages/Playground"));
const StrategyList = lazy(() => import("./pages/StrategyList"));
const StrategyBuilder = lazy(() => import("./pages/StrategyBuilder"));
const RunBacktest = lazy(() => import("./pages/RunBacktest"));
const Backtests = lazy(() => import("./pages/Backtests"));
const BacktestResult = lazy(() => import("./pages/BacktestResult"));
const Upgrade = lazy(() => import("./pages/Upgrade"));

// Scoped to Backtest so its cache never mixes with another product's.
const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

const BacktestApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading…</div>}>
        <Routes>
          <Route index element={<Playground />} />
          <Route path="strategies" element={<StrategyList />} />
          <Route path="strategies/new" element={<StrategyBuilder />} />
          <Route path="strategies/:id" element={<StrategyBuilder />} />
          <Route path="strategies/:id/run" element={<RunBacktest />} />
          <Route path="history" element={<Backtests />} />
          <Route path="history/:id" element={<BacktestResult />} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="*" element={<Navigate to="/backtest/app" replace />} />
        </Routes>
      </Suspense>
      <Sonner />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default BacktestApp;
