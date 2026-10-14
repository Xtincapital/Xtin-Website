// Technical indicators for any NSE/US stock (Pro). Reached from the sidebar
// or a Watchlist row (?ticker=).
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Activity, Lock, Search, Sparkles } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import CompanySearchResults from "../components/CompanySearchResults";
import { TechnicalIndicators } from "../components/TechnicalIndicators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRegion from "@/hooks/useRegion";
import { popularTickers } from "../lib/currency";
import { usePlanStore } from "../store/usePlanStore";

export default function Technicals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ticker = (searchParams.get("ticker") || "").toUpperCase();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { region } = useRegion();
  const isPro = usePlanStore((s) => s.plan === "premium" || s.plan === "enterprise");
  const [checking, setChecking] = useState(!isPro);

  // Confirm with the server before showing a paywall (the plan may still be loading).
  useEffect(() => {
    if (isPro) {
      setChecking(false);
      return;
    }
    usePlanStore
      .getState()
      .ensurePro()
      .finally(() => setChecking(false));
  }, [isPro]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (t: string) => {
    setSearchParams({ ticker: t.toUpperCase() });
    setQuery("");
    setShowResults(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="xt-title mb-2">Technical Indicators</h1>
            <span className="text-[10px] font-extrabold px-2 py-1 rounded bg-gradient-to-br from-amber-500 to-amber-600 text-white">PRO</span>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            RSI, MACD, moving averages, Bollinger Bands and more for any NSE or US stock, with an overall technical
            signal and a price chart.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-border p-5">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              aria-label="Search a company or ticker"
              placeholder="Search a company or ticker (e.g. RELIANCE.NS, AAPL)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && /^[A-Z0-9.&-]{1,20}$/i.test(query.trim())) pick(query.trim());
              }}
              className="pl-10 h-11"
            />
            {showResults && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-border z-50 max-h-[360px] overflow-y-auto p-2">
                <CompanySearchResults query={query} onAnalyze={(c: any) => c?.ticker && pick(c.ticker)} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {popularTickers(region as any).map((t) => (
              <button
                key={t}
                onClick={() => pick(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  t === ticker ? "bg-primary text-white" : "bg-accent text-primary hover:bg-primary/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {checking ? null : !isPro ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 pro-gold-text" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Technical indicators are part of Pro</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              See the overall signal, RSI, MACD, moving averages and Bollinger Bands for any stock, with a price chart.
            </p>
            <Button onClick={() => usePlanStore.getState().openUpgrade("technicals")} className="bg-primary text-white hover:bg-primary/90 gap-2">
              <Sparkles className="w-4 h-4" /> Upgrade to Pro
            </Button>
          </div>
        ) : ticker ? (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">{ticker}</h2>
            <TechnicalIndicators ticker={ticker} />
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-border p-10 text-center text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 text-primary/40" />
            Pick a stock above to see its technical indicators.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
