// Navigation shell for the Backtest product: the shared site Navbar/Footer
// around a "trading desk" header strip with the section tabs and the user's
// plan. Route paths here must match ../BacktestApp.tsx.
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChartCandlestick, Crown, FlaskConical, History, Layers, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { backtestApi } from "../lib/api";

const tabs = [
  { name: "Playground", href: "/backtest/app", end: true, icon: Sparkles },
  { name: "Strategies", href: "/backtest/app/strategies", icon: Layers },
  { name: "History", href: "/backtest/app/history", icon: History },
  { name: "Pro", href: "/backtest/app/upgrade", icon: Crown },
];

function PlanBadge() {
  const { data } = useQuery({ queryKey: ["bt-plan"], queryFn: backtestApi.plan, retry: 0, staleTime: 30_000 });
  if (!data) return null;
  if (data.tier === "pro") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
        <Crown className="h-3.5 w-3.5" />
        {data.trial ? "Pro trial" : "Pro"} · unlimited
      </span>
    );
  }
  const limit = data.backtests_limit ?? 0;
  const used = Math.min(limit, data.backtests_used ?? 0);
  const pct = limit ? (used / limit) * 100 : 0;
  return (
    <NavLink to="/backtest/app/upgrade" className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-400/40">
      <span className="font-semibold text-white tabular-nums">
        {limit - used}/{limit}
      </span>
      <span className="hidden sm:inline">free backtests left {data.limit_window === "day" ? "today" : "this month"}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" style={{ width: `${100 - pct}%` }} />
      </span>
    </NavLink>
  );
}

const BacktestLayout = ({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) => (
  <>
    <Navbar />
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060a13] dark:text-slate-100">
      {/* pt-20 clears the site Navbar, which is fixed and 80px tall */}
      <header className="relative overflow-hidden bg-[#0a1120] pt-20 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "36px 36px" }}
        />
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-64 w-96 rounded-full bg-emerald-500/25 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-10 h-56 w-72 rounded-full bg-teal-400/15 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <NavLink to="/backtest" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
                <ChartCandlestick className="h-5 w-5 text-white" />
              </span>
              <span>
                <span className="block text-lg font-bold leading-tight tracking-tight">
                  Xtin <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Backtest</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FlaskConical className="h-3 w-3" /> Quant lab · test ideas on real market history
                </span>
              </span>
            </NavLink>
            <PlanBadge />
          </div>

          <nav className="mt-5 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Backtest sections">
            {tabs.map(({ name, href, end, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-slate-50 text-slate-900 dark:bg-[#060a13] dark:text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {name}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className={`mx-auto px-4 py-8 sm:px-6 ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
        {children}
      </main>
    </div>
    <Footer />
  </>
);

export default BacktestLayout;
