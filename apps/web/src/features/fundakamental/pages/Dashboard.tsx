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
import {
  Search,
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Plus,
  HelpCircle,
  X,
  Loader2,
} from "lucide-react";

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
  const navigate = useNavigate();

  const [quickAccessList, setQuickAccessList] = useState<any[]>(() => {
    const cached = localStorage.getItem(userKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const hasIndian = parsed.some((item: any) => item.ticker.toUpperCase().endsWith(".NS") || item.ticker.toUpperCase().endsWith(".BO"));
        if (hasIndian) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse cached quick access list:", e);
      }
    }
    const defaultList = [
      { ticker: "RELIANCE.NS", name: "Reliance Industries", price: 2450.00, change: 1.25 },
      { ticker: "TCS.NS", name: "Tata Consultancy Services", price: 3820.00, change: -0.45 },
      { ticker: "INFY.NS", name: "Infosys", price: 1480.00, change: 2.10 },
      { ticker: "AAPL", name: "Apple", price: 225.50, change: 2.35 },
      { ticker: "MSFT", name: "Microsoft", price: 415.25, change: 1.82 },
    ];
    localStorage.setItem(userKey, JSON.stringify(defaultList));
    return defaultList;
  });

  useEffect(() => {
    const cached = localStorage.getItem(userKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const hasIndian = parsed.some((item: any) => item.ticker.toUpperCase().endsWith(".NS") || item.ticker.toUpperCase().endsWith(".BO"));
        if (hasIndian) {
          setQuickAccessList(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached quick access list:", e);
      }
    }
    const defaultList = [
      { ticker: "RELIANCE.NS", name: "Reliance Industries", price: 2450.00, change: 1.25 },
      { ticker: "TCS.NS", name: "Tata Consultancy Services", price: 3820.00, change: -0.45 },
      { ticker: "INFY.NS", name: "Infosys", price: 1480.00, change: 2.10 },
      { ticker: "AAPL", name: "Apple", price: 225.50, change: 2.35 },
      { ticker: "MSFT", name: "Microsoft", price: 415.25, change: 1.82 },
    ];
    localStorage.setItem(userKey, JSON.stringify(defaultList));
    setQuickAccessList(defaultList);
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
      subscribe(tickers);
    }
  }, [quickAccessList, subscribe]);

  // Fetch initial prices from DB cache on mount
  useEffect(() => {
    const fetchInitialPrices = async () => {
      if (quickAccessList.length === 0) return;
      try {
        const updatedList = await Promise.all(
          quickAccessList.map(async (stock) => {
            try {
              const data = await api.stocks.getStockData(stock.ticker);
              if (data) {
                return {
                  ...stock,
                  name: data.name || stock.name,
                  price: data.price !== undefined && data.price !== null ? data.price : stock.price,
                  change: data.change_percent !== undefined && data.change_percent !== null ? data.change_percent : stock.change,
                };
              }
            } catch (err) {
              console.warn(`Failed to fetch cached price for ${stock.ticker}:`, err);
            }
            return stock;
          })
        );

        // Check if anything actually changed to avoid unnecessary re-renders
        let hasChanges = false;
        for (let i = 0; i < updatedList.length; i++) {
          if (
            updatedList[i].price !== quickAccessList[i].price ||
            updatedList[i].change !== quickAccessList[i].change ||
            updatedList[i].name !== quickAccessList[i].name
          ) {
            hasChanges = true;
            break;
          }
        }

        if (hasChanges) {
          setQuickAccessList(updatedList);
          localStorage.setItem(userKey, JSON.stringify(updatedList));
        }
      } catch (error) {
        console.error("Failed to fetch initial quick access prices:", error);
      }
    };

    fetchInitialPrices();
  }, []);

  const handleRemoveCompany = (ticker: string) => {
    const updated = quickAccessList.filter(
      (item) => item.ticker.toUpperCase() !== ticker.toUpperCase()
    );
    setQuickAccessList(updated);
    localStorage.setItem(userKey, JSON.stringify(updated));
  };

  // Close search results when clicking outside
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
            date: new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
            score: r.overall_score,
            summary: r.summary || "Fundamental analysis report.",
            trend: r.overall_score >= 7.5 ? "up" : "down"
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
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Ready to analyze some financials?
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
          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm" data-tour="search-company">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Search Company
            </h2>
            <div className="relative" ref={searchRef}>
              {analyzingTicker ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
              <Input
                type="text"
                placeholder="Company name or ticker..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-10 h-11 bg-secondary/50 border-border rounded-xl focus-visible:ring-primary/20"
                disabled={!!analyzingTicker}
              />

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-border z-50 max-h-[400px] overflow-y-auto">
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
              {popularTickers(region as any).map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => {
                    setSearchQuery(ticker);
                    setIsSearchFocused(true);
                  }}
                  className="px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-sm" data-tour="upload-report">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              Upload Financial Statements
            </h2>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer bg-accent/30 ${
                  dragActive ? "border-primary bg-accent/50" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Drag & drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Supports PDF, Excel, CSV (max 25MB)
                </p>
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
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <button
                        onClick={() => setSelectedFile(null)}
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
                      className="bg-primary text-white hover:bg-primary/90 gap-1.5 text-xs h-8"
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
                <Clock className="w-4 h-4 text-primary" />
                Recent Reports
              </h2>
              <Link to="/fundakamental/history">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-sm font-medium gap-1">
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {loadingReports ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-border">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto text-primary"></div>
                  <p className="mt-4 text-xs text-muted-foreground">Loading recent reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-border">
                  <p className="text-muted-foreground text-sm mb-4">No reports generated yet.</p>
                  <Link to="/fundakamental/analyze">
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Create Your First Analysis</Button>
                  </Link>
                </div>
              ) : (
                reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                  >
                    <Link
                      to={`/fundakamental/report/${report.id}`}
                      className="block p-5 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground text-sm">
                              {report.company}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground font-medium">
                              {report.ticker}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.date}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            report.trend === "up"
                              ? "bg-primary/10 text-primary"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {report.trend === "up" ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {report.score}/10
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.summary}
                      </p>
                    </Link>
                  </motion.div>
                ))
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
                <FileText className="w-4 h-4 text-primary" />
                Quick Access
              </h2>
              <Button
                onClick={() => {
                  setIsAddingCompany(!isAddingCompany);
                  setCompanySearchQuery("");
                }}
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 h-8 w-8 p-0 rounded-full"
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
                    className="h-9 bg-white"
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
                  <div className="mt-2 bg-white rounded-xl border border-border shadow-md max-h-[220px] overflow-y-auto p-1.5 z-50">
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
                          const isINR = company.ticker.endsWith(".NS") || company.ticker.endsWith(".BO");
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
                                  const updated = [...quickAccessList, newStock];
                                  setQuickAccessList(updated);
                                  localStorage.setItem(userKey, JSON.stringify(updated));
                                }
                                setIsAddingCompany(false);
                                setCompanySearchQuery("");
                              }}
                              className="flex items-center justify-between p-2 hover:bg-accent/40 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold shrink-0">
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

            <div className="rounded-2xl bg-white border border-border overflow-x-auto shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Stock
                    </th>
                    <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Price
                    </th>
                    <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">
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
                      const isINR = stock.ticker.endsWith(".NS") || stock.ticker.endsWith(".BO");
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
                                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                ) : live ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live" />
                                ) : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {stock.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-medium text-foreground">
                            {currency}{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td
                            className={`py-3 px-4 text-right text-sm font-semibold ${
                              currentChange >= 0 ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {currentChange >= 0 ? "+" : ""}
                            {currentChange.toFixed(2)}%
                          </td>
                          <td className="py-3 pr-4 pl-1 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCompany(stock.ticker);
                              }}
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
