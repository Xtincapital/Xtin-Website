// Ported from features-incoming/fundakamental/src/pages/Dashboard.tsx.
//
// Adaptations from the original:
//  - `useAuthStore` (dropped, see store/README notes elsewhere in this port)
//    replaced with the shared `useAuth()` (apps/web/src/contexts/AuthContext.tsx).
//    That user shape has no `.name` — display name is derived from
//    `first_name`/`last_name` below.
//  - `useRegion` now comes from the shared `@/hooks/useRegion` (default
//    export, Context-based) instead of FundaKaMental's own module-singleton
//    hook of the same name — see lib/currency.ts's header comment for why
//    the region service itself was reused rather than re-ported.
//  - `popularTickers` now lives in `../lib/currency` (this port's home for
//    FundaKaMental-specific region extras) instead of `@/lib/region`.
//  - Internal links updated from `/dashboard/...` to `/fundakamental/...`
//    to match this port's nested route scheme (see ../FundakamentalApp.tsx).
//  - `DashboardLayout`, `CompanySearchResults` and the `use-market-data`
//    hook are NOT yet ported — imports below point at where they will live;
//    see this task's report for the full missing-dependency list.
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx
import ProductBrand from "@/components/ProductBrand";
import DashboardLayout from "../components/dashboard/DashboardLayout";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/CompanySearchResults.tsx
import CompanySearchResults from "../components/CompanySearchResults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../lib/api";
import { uploadProblem } from "../lib/validations";
import { toast } from "sonner";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/hooks/use-market-data.ts
// (note for whoever ports it: the WS URL there must be updated to this
// backend's real path, `/api/fundakamental/ws/market-data` — see
// services/api/modules/fundakamental/marketStream.ts's header comment)
import { useMarketData } from "../hooks/use-market-data";
import useRegion from "@/hooks/useRegion";
import { popularTickers } from "../lib/currency";
import ApproxAmount from "@/components/ApproxAmount";
import { scoreTone, scorePill, healthLabel, tickerTile } from "../lib/score";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Search,
  Upload,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  HelpCircle,
  X,
  Loader2,
} from "lucide-react";

const DEFAULT_QUICK_ACCESS = [
  { ticker: "RELIANCE.NS", name: "Reliance Industries" },
  { ticker: "TCS.NS", name: "Tata Consultancy Services" },
  { ticker: "INFY.NS", name: "Infosys" },
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
];

const isIndian = (ticker: string) => /\.(NS|BO)$/i.test(ticker || "");
const hasTicker = (t?: string | null) => !!t && !/^n\/?a$/i.test(t.trim());

/** Latest saved price for one stock (null when the server has none). */
async function fetchQuickPrice(stock: any) {
  try {
    const data = await api.stocks.getStockData(stock.ticker);
    if (data) {
      return {
        ...stock,
        name: data.name || stock.name,
        price: data.price ?? stock.price ?? null,
        change: data.change_percent ?? stock.change ?? null,
      };
    }
  } catch (err) {
    console.warn(`Failed to fetch cached price for ${stock.ticker}:`, err);
  }
  return stock;
}

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || "User";
  const { region } = useRegion();
  const userKey = user ? `quick_access_watchlist_${user.id}` : "quick_access_watchlist";
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Seeded once per user; after that the list is exactly what they kept,
  // even if it ends up empty or US-only (it used to reset to the defaults
  // whenever no Indian stock was left in it). Prices start empty and are
  // filled from the server, never shown as made-up numbers.
  const loadQuickAccess = (key: string) => {
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse cached quick access list:", e);
      }
    }
    const defaultList = DEFAULT_QUICK_ACCESS.map((s) => ({ ...s, price: null, change: null }));
    localStorage.setItem(key, JSON.stringify(defaultList));
    return defaultList;
  };

  const [quickAccessList, setQuickAccessList] = useState<any[]>(() => loadQuickAccess(userKey));

  useEffect(() => {
    setQuickAccessList(loadQuickAccess(userKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const problem = uploadProblem(file);
      if (problem) {
        toast.error(problem);
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const problem = uploadProblem(file);
      if (problem) {
        toast.error(problem);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadRedirect = () => {
    if (selectedFile) {
      navigate("/fundakamental/analyze", { state: { file: selectedFile, autoStart: true } });
    }
  };
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [quickAccessSearchResults, setQuickAccessSearchResults] = useState<any[]>([]);
  const [loadingQuickAccessSearch, setLoadingQuickAccessSearch] = useState(false);

  useEffect(() => {
    if (!companySearchQuery) {
      setQuickAccessSearchResults([]);
      return;
    }

    const search = async () => {
      setLoadingQuickAccessSearch(true);
      try {
        const results = await api.analysis.searchCompany(companySearchQuery);
        setQuickAccessSearchResults(results || []);
      } catch (err) {
        console.error("Failed to search company for quick access:", err);
      } finally {
        setLoadingQuickAccessSearch(false);
      }
    };

    const delay = setTimeout(search, 300);
    return () => clearTimeout(delay);
  }, [companySearchQuery]);

  const { prices, subscribe } = useMarketData();

  useEffect(() => {
    if (quickAccessList.length > 0) {
      const tickers = quickAccessList.map((item) => item.ticker);
      subscribe([...tickers, ...popularTickers(region as any)]);
    }
  }, [quickAccessList, subscribe, region]);

  // Fetch initial prices from DB cache on mount
  useEffect(() => {
    const fetchInitialPrices = async () => {
      if (quickAccessList.length === 0) return;
      try {
        const updatedList = [];
        // One at a time: a burst of parallel calls trips the API's rate limit.
        for (const stock of quickAccessList) updatedList.push(await fetchQuickPrice(stock));
        setQuickAccessList(updatedList);
        localStorage.setItem(userKey, JSON.stringify(updatedList));
      } catch (error) {
        console.error("Failed to fetch initial quick access prices:", error);
      }
    };

    fetchInitialPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveCompany = (ticker: string) => {
    const updated = quickAccessList.filter(
      (item) => item.ticker.toUpperCase() !== ticker.toUpperCase()
    );
    setQuickAccessList(updated);
    localStorage.setItem(userKey, JSON.stringify(updated));
  };

  // Close search results when clicking outside
  // ⌘K / Ctrl+K jumps to company search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch reports list on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.analysis.getReportsList(5, 0);
        if (response && response.reports) {
          const formatted = response.reports.map((r: any) => ({
            id: r.id,
            company: r.company,
            ticker: r.ticker,
            status: r.status,
            date: new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
            score: Number(r.overall_score) || 0,
            summary: r.summary || "Fundamental analysis report.",
            // Same bands as History: 7+ is good, under 5 is weak.
            trend: r.overall_score >= 7 ? "up" : r.overall_score >= 5 ? "flat" : "down"
          }));
          setReports(formatted);
        }
      } catch (err) {
        console.error("Failed to load dashboard reports:", err);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  const [analyzingTicker, setAnalyzingTicker] = useState<string | null>(null);

  const handleAnalyzeStock = async (ticker: string, name: string) => {
    if (analyzingTicker) return;
    setAnalyzingTicker(ticker);
    try {
      // Analysis runs on uploaded financial documents, so route to the upload
      // flow with the chosen company/ticker prefilled.
      navigate(`/fundakamental/analyze?ticker=${ticker}&name=${encodeURIComponent(name)}`);
    } finally {
      setAnalyzingTicker(null);
    }
  };

  const handleAnalyze = (company: any) => {
    handleAnalyzeStock(company.ticker, company.name);
    setIsSearchFocused(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="fk-hello mb-8 pt-2"
        >
          <ProductBrand to="/fundakamental" name="FundaKaMental" className="mb-3" />
          <h1 className="xt-title mb-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Ready to analyse some financials? Search a listed company or drop in a statement.
          </p>
        </motion.div>

        {/* Search & Upload — clean white cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Search Company */}
          <div className="p-6 rounded-2xl bg-card border border-border" data-tour="search-company">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-brand" />
              Search Company
            </h2>
            <div className="relative" ref={searchRef}>
              {analyzingTicker ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Company name or ticker..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-10 pr-16 h-12 text-base bg-secondary/50 border-border rounded-xl focus-visible:ring-brand/20 focus-visible:border-brand"
                disabled={!!analyzingTicker}
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                ⌘K
              </kbd>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-md shadow-lg border border-border z-50 max-h-[400px] overflow-y-auto">
                  <div className="p-2">
                    <CompanySearchResults
                      query={searchQuery}
                      onAnalyze={handleAnalyze}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {popularTickers(region as any).map((ticker) => {
                const change = prices.get(ticker.toUpperCase())?.change_percent;
                return (
                  <button
                    key={ticker}
                    onClick={() => {
                      setSearchQuery(ticker);
                      setIsSearchFocused(true);
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:border-brand-line hover:bg-brand-soft"
                  >
                    {ticker.replace(/\.(NS|BO)$/i, "")}
                    {change != null && (
                      // Re-keyed on every tick so the soft flash replays when the price moves
                      <motion.span
                        key={change}
                        initial={{ backgroundColor: "var(--brand-soft)" }}
                        animate={{ backgroundColor: "rgba(0,0,0,0)" }}
                        transition={{ duration: 0.9 }}
                        className={`rounded px-1 tabular-nums ${change >= 0 ? "text-brand" : "text-destructive"}`}
                      >
                        {change >= 0 ? "+" : "−"}{Math.abs(change).toFixed(2)}%
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload */}
          <div className="p-6 rounded-2xl bg-card border border-border" data-tour="upload-report">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand" />
              Upload Financial Statements
            </h2>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-4 border-[1.5px] border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
                  dragActive ? "border-brand bg-brand-soft" : "border-border bg-secondary/50 hover:border-brand hover:bg-brand-soft"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    <b>Drag & drop files here</b> or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Annual reports, quarterly results, balance sheets · max 25 MB
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {["PDF", "XLSX", "CSV"].map((f) => (
                      <span key={f} className="rounded border border-border px-1.5 py-px font-mono text-[10px] text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <button
                        onClick={() => setSelectedFile(null)}
                        aria-label="Remove selected file"
                        className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      onClick={handleUploadRedirect}
                      size="sm"
                      className="bg-brand-fill text-white hover:bg-brand-hover gap-1.5 text-xs h-8"
                    >
                      Upload & Analyze
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand" />
                Recent Reports
              </h2>
              <Link to="/fundakamental/history">
                <Button variant="ghost" size="sm" className="text-brand hover:text-brand/80 text-sm font-medium gap-1">
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl bg-card border border-border p-2">
              {loadingReports ? (
                <div className="space-y-1 p-1" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="h-11 w-11 rounded-xl bg-secondary animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-40 rounded bg-secondary animate-pulse" />
                        <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm mb-4">No reports generated yet.</p>
                  <Link to="/fundakamental/analyze">
                    <Button size="sm" className="bg-brand-fill text-white hover:bg-brand-hover">Create Your First Analysis</Button>
                  </Link>
                </div>
              ) : (
                reports.map((report, index) => {
                  const done = report.status === "completed";
                  const failed = report.status === "failed";
                  const tone = scoreTone(report.score);
                  const pill = scorePill(report.score);
                  const label = healthLabel(report.score);
                  const short = tickerTile(report.ticker, report.company);
                  const row = (
                    <Link
                      to={done ? `/fundakamental/report/${report.id}` : "/fundakamental/history"}
                      className={`grid grid-cols-[44px_minmax(0,1fr)_auto] sm:grid-cols-[44px_minmax(0,1fr)_auto_auto] items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-secondary ${
                        index > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-secondary text-[11px] font-extrabold tracking-tight text-foreground">
                        {short}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{report.company}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {hasTicker(report.ticker) ? `${report.ticker} · ` : ""}{report.date}
                        </p>
                      </div>
                      {done ? (
                        <>
                          <span className="hidden sm:block text-right text-lg font-bold tabular-nums text-foreground">
                            {report.score.toFixed(1)}<span className="text-xs font-medium text-muted-foreground">/10</span>
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${pill}`}>{label}</span>
                        </>
                      ) : (
                        <span
                          className={`col-span-1 sm:col-span-2 justify-self-end rounded-full px-2.5 py-1 text-xs font-semibold ${
                            failed ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning animate-pulse"
                          }`}
                        >
                          {failed ? "Failed" : "Processing…"}
                        </span>
                      )}
                    </Link>
                  );
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      {done ? (
                        <HoverCard openDelay={250} closeDelay={80}>
                          <HoverCardTrigger asChild>{row}</HoverCardTrigger>
                          <HoverCardContent side="right" align="start" className="w-72 rounded-2xl p-4">
                            <div className="mb-3 flex items-center gap-3">
                              <div
                                className={`grid h-12 w-12 flex-none place-items-center rounded-full ${tone}`}
                                style={{ background: `conic-gradient(currentColor ${report.score * 10}%, hsl(var(--border)) 0)` }}
                              >
                                <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-popover text-sm font-bold tabular-nums text-foreground">
                                  {report.score.toFixed(1)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-foreground">{report.company}</p>
                                <p className="text-xs text-muted-foreground">Analysed {report.date}</p>
                              </div>
                            </div>
                            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                            <p className="mt-3 text-xs font-semibold text-brand">Open report →</p>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        row
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand" />
                Quick Access
              </h2>
              <Button
                onClick={() => {
                  setIsAddingCompany(!isAddingCompany);
                  setCompanySearchQuery("");
                }}
                variant="ghost"
                size="sm"
                aria-label="Add a stock to Quick Access"
                className="text-brand hover:text-brand/80 h-8 w-8 p-0 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {isAddingCompany && (
              <div className="mb-4 p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Search company or ticker..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="h-9 bg-card"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      setIsAddingCompany(false);
                      setCompanySearchQuery("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {companySearchQuery && (
                  <div className="mt-2 bg-card rounded-xl border border-border shadow-md max-h-[220px] overflow-y-auto p-1.5 z-50">
                    {loadingQuickAccessSearch ? (
                      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Searching...
                      </div>
                    ) : quickAccessSearchResults.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No companies found.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {quickAccessSearchResults.map((company) => {
                          const isINR = isIndian(company.ticker);
                          const currency = isINR ? "₹" : "$";
                          const price = company.price || 0;

                          return (
                            <div
                              key={company.ticker}
                              onClick={() => {
                                const newStock = {
                                  ticker: company.ticker,
                                  name: company.name || company.ticker,
                                  price: price,
                                  change: company.change_percent || 0
                                };

                                // Prevent duplicates
                                if (!quickAccessList.some(item => item.ticker.toUpperCase() === company.ticker.toUpperCase())) {
                                  const updated = [...quickAccessList, { ...newStock, price: price > 0 ? price : null }];
                                  setQuickAccessList(updated);
                                  localStorage.setItem(userKey, JSON.stringify(updated));
                                  // Search results often carry no price; look it up.
                                  if (!(price > 0)) {
                                    fetchQuickPrice(newStock).then((priced) => {
                                      setQuickAccessList((prev) => {
                                        const next = prev.map((s) => (s.ticker === priced.ticker ? { ...priced, price: priced.price > 0 ? priced.price : null } : s));
                                        localStorage.setItem(userKey, JSON.stringify(next));
                                        return next;
                                      });
                                    });
                                  }
                                } else {
                                  toast.info(`${company.ticker} is already in Quick Access`);
                                }
                                setIsAddingCompany(false);
                                setCompanySearchQuery("");
                              }}
                              className="flex items-center justify-between p-2 hover:bg-accent/40 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="px-2 py-0.5 rounded bg-brand-soft text-brand text-xs font-semibold shrink-0">
                                  {company.ticker}
                                </span>
                                <span className="text-xs font-medium text-foreground truncate">
                                  {company.name || company.ticker}
                                </span>
                              </div>
                              {price > 0 && (
                                <span className="text-xs text-muted-foreground shrink-0 pl-2">
                                  {currency}{price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                      Stock
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">
                      Price
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">
                      Change
                    </th>
                    <th className="w-10 py-3 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {quickAccessList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                        No companies added yet. Click the + icon above.
                      </td>
                    </tr>
                  ) : (
                    quickAccessList.map((stock) => {
                      const live = prices.get(stock.ticker.toUpperCase());
                      const currentPrice = live ? live.price : stock.price;
                      const currentChange = live ? live.change_percent : stock.change;
                      const isINR = isIndian(stock.ticker);
                      const currency = isINR ? "₹" : "$";

                      const isRowAnalyzing = analyzingTicker === stock.ticker;

                      return (
                        <tr
                          key={stock.ticker}
                          onClick={() => handleAnalyzeStock(stock.ticker, stock.name)}
                          className={`border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors cursor-pointer ${
                            isRowAnalyzing ? "opacity-60 pointer-events-none bg-accent/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-foreground text-sm">
                                  {stock.ticker}
                                </p>
                                {isRowAnalyzing ? (
                                  <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
                                ) : live ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-fill animate-pulse" title="Live" />
                                ) : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {stock.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-medium text-foreground">
                            {currentPrice != null && Number(currentPrice) > 0
                              ? `${currency}${Number(currentPrice).toLocaleString(isINR ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : "—"}
                            {Number(currentPrice) > 0 && <ApproxAmount amount={Number(currentPrice)} from={isINR ? "INR" : "USD"} />}
                          </td>
                          <td
                            className={`py-3 px-4 text-right text-sm font-semibold ${
                              Number(currentChange) >= 0 ? "text-brand" : "text-destructive"
                            }`}
                          >
                            {currentChange == null || !(Number(currentPrice) > 0)
                              ? "—"
                              : `${Number(currentChange) >= 0 ? "+" : ""}${Number(currentChange).toFixed(2)}%`}
                          </td>
                          <td className="py-3 pr-4 pl-1 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCompany(stock.ticker);
                              }}
                              aria-label={`Remove ${stock.ticker} from Quick Access`}
                              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
