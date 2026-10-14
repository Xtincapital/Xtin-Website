// Ported from features-incoming/fundakamental/src/pages/StockScanner.tsx.
//
// Adaptations from the original:
//  - `DashboardLayout` now comes from `../components/dashboard/DashboardLayout`
//    (relative, matching Dashboard.tsx/Settings.tsx's own convention) instead
//    of `@/components/dashboard/DashboardLayout`. Not yet ported by the
//    parallel shared-components task at the time of this port — see that
//    task for the real file.
//  - `api`/`downloadBlob` now come from `../lib/api` (this port's API client,
//    already wired to the real backend) instead of `@/lib/api`.
//  - `usePlanStore` now comes from `../store/usePlanStore`.
//  - `useRegion` now comes from the shared `@/hooks/useRegion` (default
//    export, Context-based) instead of FundaKaMental's own module-singleton
//    hook of the same name — see Dashboard.tsx/Settings.tsx for the same
//    substitution.
//  - Dropped the `getRegionConfig` import from `@/lib/region`: that's this
//    app's *shared* region service (built for the newsletter feature) and
//    its `REGIONS` entries have no `market: "india" | "us"` field the way
//    FundaKaMental's own (now-dropped) `lib/region.ts` did — that field only
//    ever existed to drive this page's scanner-universe default. Reproduced
//    locally as `regionToMarket()` below instead of adding a
//    screener-specific field to the shared region service.
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, downloadBlob } from "../lib/api";
import { usePlanStore } from "../store/usePlanStore";
import useRegion from "@/hooks/useRegion";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Plus,
  X,
  Play,
  Save,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Download,
} from "lucide-react";

interface FilterItem {
  id: string;
  field: string;
  operator: string;
  value: string;
}

// Full custom-criteria set. Users aren't limited to a handful — they can
// screen on any of these fundamentals (grouped for readability in the picker).
const filterFieldGroups = [
  {
    group: "Classification",
    fields: [
      { value: "sector", label: "Sector" },
      { value: "market_cap", label: "Market Cap" },
      { value: "price", label: "Price" },
    ],
  },
  {
    group: "Valuation",
    fields: [
      { value: "pe_ratio", label: "P/E Ratio" },
      { value: "peg_ratio", label: "PEG Ratio" },
      { value: "pb_ratio", label: "Price / Book" },
      { value: "eps", label: "EPS" },
      { value: "dividend_yield", label: "Dividend Yield %" },
    ],
  },
  {
    group: "Profitability",
    fields: [
      { value: "profit_margin", label: "Net Margin %" },
      { value: "operating_margin", label: "Operating Margin %" },
      { value: "roe", label: "ROE %" },
      { value: "roa", label: "ROA %" },
    ],
  },
  {
    group: "Growth",
    fields: [
      { value: "revenue_growth", label: "Revenue Growth %" },
      { value: "earnings_growth", label: "Earnings Growth %" },
    ],
  },
  {
    group: "Financial health",
    fields: [
      { value: "debt_to_equity", label: "Debt / Equity" },
      { value: "current_ratio", label: "Current Ratio" },
      { value: "quick_ratio", label: "Quick Ratio" },
    ],
  },
  {
    group: "Risk",
    fields: [{ value: "beta", label: "Beta (volatility)" }],
  },
];

// Flat list for label lookups (PDF export, etc.).
const filterFields = filterFieldGroups.flatMap((g) => g.fields);

const operators = [
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "eq", label: "=" },
];

// One-click "starter screens" — the way beginners actually use a screener.
// Each loads a sensible, named strategy instead of asking a layman to build
// filters from scratch (the Finviz / Screener.in / Simply Wall St pattern).
interface Preset {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  plain: string; // plain-English "what this finds"
  filters: { field: string; operator: string; value: string }[];
}

const PRESETS: Preset[] = [
  {
    id: "value",
    name: "Undervalued Gems",
    emoji: "💎",
    tagline: "Cheap vs earnings, still profitable",
    plain: "Solid companies trading at a low price relative to their profits — classic value picks.",
    filters: [
      { field: "pe_ratio", operator: "lt", value: "20" },
      { field: "roe", operator: "gte", value: "15" },
      { field: "debt_to_equity", operator: "lt", value: "1" },
    ],
  },
  {
    id: "growth",
    name: "Fast Growers",
    emoji: "🚀",
    tagline: "Rapid revenue growth",
    plain: "Companies growing sales quickly with healthy margins — where tomorrow's leaders hide.",
    filters: [
      { field: "revenue_growth", operator: "gte", value: "20" },
      { field: "profit_margin", operator: "gte", value: "10" },
    ],
  },
  {
    id: "quality",
    name: "Quality Compounders",
    emoji: "🏆",
    tagline: "High returns, low debt",
    plain: "Highly profitable, well-run businesses with little debt — the kind you can hold for years.",
    filters: [
      { field: "roe", operator: "gte", value: "20" },
      { field: "profit_margin", operator: "gte", value: "15" },
      { field: "debt_to_equity", operator: "lt", value: "0.5" },
    ],
  },
  {
    id: "dividend",
    name: "Income Machines",
    emoji: "💰",
    tagline: "Reliable dividend payers",
    plain: "Companies paying a healthy, well-covered dividend — steady cash in your pocket.",
    filters: [
      { field: "dividend_yield", operator: "gte", value: "3" },
      { field: "current_ratio", operator: "gte", value: "1.2" },
    ],
  },
];

// The backend also matches Yahoo's names for these (Financial Services,
// Consumer Cyclical/Defensive, Basic Materials).
const sectorOptions = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Communication Services",
  "Industrials",
  "Energy",
  "Materials",
  "Utilities",
  "Real Estate",
];

// Results-table column -> screener API field.
const SORT_FIELDS: Record<string, string> = {
  matchScore: "match_score",
  price: "price",
  marketCap: "market_cap",
  peRatio: "pe_ratio",
  revenueGrowth: "revenue_growth",
  profitMargin: "profit_margin",
};

// "₹16.06L Cr" / "$3.1T" back to a number so the column sorts by size.
const marketCapValue = (v: unknown): number => {
  if (typeof v === "number") return v;
  const m = String(v ?? "").replace(/[₹$,\s]/g, "").match(/^([\d.]+)(LCr|Cr|T|B|M)?$/i);
  if (!m) return 0;
  const mult: Record<string, number> = { lcr: 1e12, cr: 1e7, t: 1e12, b: 1e9, m: 1e6 };
  return parseFloat(m[1]) * (m[2] ? mult[m[2].toLowerCase()] : 1);
};

interface SavedScreen {
  id: string;
  name: string;
  filters: { field: string; operator: string; value: string }[];
}

// Illustrative preview rows for free users (live scans are Pro). One set per
// market so an India visitor isn't shown US stocks in dollars.
const SAMPLE_RESULTS = {
  us: [
    { ticker: "MSFT", company: "Microsoft Corporation", sector: "Technology", price: 415.25, marketCap: "$3.1T", peRatio: 28.5, revenueGrowth: 16.2, profitMargin: 35.8, matchScore: 95 },
    { ticker: "AAPL", company: "Apple Inc.", sector: "Technology", price: 225.5, marketCap: "$2.8T", peRatio: 28.5, revenueGrowth: 2.8, profitMargin: 25.5, matchScore: 88 },
    { ticker: "NVDA", company: "NVIDIA Corporation", sector: "Technology", price: 880.25, marketCap: "$2.2T", peRatio: 65.2, revenueGrowth: 126.0, profitMargin: 52.1, matchScore: 85 },
    { ticker: "META", company: "Meta Platforms Inc.", sector: "Technology", price: 520.8, marketCap: "$1.3T", peRatio: 20.1, revenueGrowth: 19.5, profitMargin: 29.0, matchScore: 82 },
    { ticker: "GOOGL", company: "Alphabet Inc.", sector: "Technology", price: 178.9, marketCap: "$2.2T", peRatio: 22.5, revenueGrowth: 11.0, profitMargin: 24.0, matchScore: 78 },
  ],
  india: [
    { ticker: "TCS", company: "Tata Consultancy Services", sector: "Information Technology", price: 2075, marketCap: "₹7.5L Cr", peRatio: 24.0, revenueGrowth: 6.0, profitMargin: 19.0, matchScore: 94 },
    { ticker: "INFY", company: "Infosys Ltd", sector: "Information Technology", price: 1035, marketCap: "₹4.3L Cr", peRatio: 22.0, revenueGrowth: 5.0, profitMargin: 16.0, matchScore: 89 },
    { ticker: "HDFCBANK", company: "HDFC Bank Ltd", sector: "Banking", price: 960, marketCap: "₹14.7L Cr", peRatio: 19.0, revenueGrowth: 11.0, profitMargin: 22.0, matchScore: 86 },
    { ticker: "ITC", company: "ITC Ltd", sector: "FMCG", price: 420, marketCap: "₹5.2L Cr", peRatio: 26.0, revenueGrowth: 8.0, profitMargin: 27.0, matchScore: 83 },
    { ticker: "ASIANPAINT", company: "Asian Paints Ltd", sector: "Consumer", price: 2400, marketCap: "₹2.3L Cr", peRatio: 55.0, revenueGrowth: 4.0, profitMargin: 14.0, matchScore: 76 },
  ],
};

// Which scanner universe fits a region best (India → NSE, everyone else →
// US). Mirrors the `market` field FundaKaMental's own (dropped) region
// service used to carry per-region — see header comment.
const regionToMarket = (region?: string): "india" | "us" => (region === "IN" ? "india" : "us");

const StockScanner = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = usePlanStore((s) => s.plan === "premium" || s.plan === "enterprise");
  const { region } = useRegion();
  const [filters, setFilters] = useState<FilterItem[]>([
    { id: "1", field: "sector", operator: "eq", value: "Technology" },
    { id: "2", field: "market_cap", operator: "gte", value: "10000000000" },
  ]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [, setHasRun] = useState(false);
  // Default the scanning universe to the visitor's region (India users → NSE,
  // everyone else → US); they can still switch markets manually.
  const [market, setMarket] = useState<"india" | "us">(regionToMarket(region));
  const [marketTouched, setMarketTouched] = useState(false);

  // Follow the region default until the user explicitly picks a market.
  useEffect(() => {
    if (!marketTouched) setMarket(regionToMarket(region));
  }, [region, marketTouched]);
  const [results, setResults] = useState<any[]>(SAMPLE_RESULTS[market]);
  const [sortField, setSortField] = useState("matchScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isExporting, setIsExporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSampleUniverse, setIsSampleUniverse] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savingScreen, setSavingScreen] = useState(false);
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>([]);

  // Sort the rows on screen; clicking a column used to change nothing.
  const sortedResults = useMemo(() => {
    const key = sortField;
    const val = (r: any) => (key === "marketCap" ? marketCapValue(r.marketCap) : Number(r[key]) || 0);
    return [...results].sort((a, b) => (sortOrder === "asc" ? val(a) - val(b) : val(b) - val(a)));
  }, [results, sortField, sortOrder]);

  useEffect(() => {
    if (!isPro) return;
    api.stocks
      .getSavedScreens()
      .then((res: any) => setSavedScreens(res?.saved_screens || []))
      .catch(() => {});
  }, [isPro]);

  const openSaveDialog = async () => {
    if (!(await usePlanStore.getState().ensurePro())) {
      usePlanStore.getState().openUpgrade("screener");
      return;
    }
    if (!filters.some((f) => f.value !== "")) {
      toast({ title: "Nothing to save", description: "Add at least one filter with a value first.", variant: "destructive" });
      return;
    }
    setSaveName(PRESETS.find((p) => p.id === activePreset)?.name || "");
    setSaveOpen(true);
  };

  const handleSaveScreen = async () => {
    const name = saveName.trim();
    if (!name) {
      toast({ title: "Name required", description: "Give this screen a name.", variant: "destructive" });
      return;
    }
    setSavingScreen(true);
    try {
      const screenFilters = filters.filter((f) => f.value !== "").map(({ field, operator, value }) => ({ field, operator, value }));
      await api.stocks.saveCustomScreen({ name, filters: screenFilters, description: `${market === "india" ? "India" : "US"} market` });
      const res: any = await api.stocks.getSavedScreens();
      setSavedScreens(res?.saved_screens || []);
      setSaveOpen(false);
      toast({ title: "Screen saved", description: `"${name}" is in your saved screens.` });
    } catch (error: any) {
      toast({ title: "Couldn't save", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setSavingScreen(false);
    }
  };

  const loadSavedScreen = (screen: SavedScreen) => {
    setActivePreset(null);
    setFilters((screen.filters || []).map((f, i) => ({ id: `${screen.id}-${i}`, field: f.field, operator: f.operator, value: String(f.value) })));
  };

  // Free users: keep the preview rows in step with the chosen market.
  useEffect(() => {
    if (!isPro) setResults(SAMPLE_RESULTS[market]);
  }, [isPro, market]);

  const priceSymbol = market === "india" ? "₹" : "$";

  // Pro users see live data on entry (and when the market changes); free users
  // see the curated sample preview until they upgrade.
  useEffect(() => {
    if (isPro) loadAllStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, market]);

  const loadAllStocks = async () => {
    setIsScanning(true);
    try {
      // Load all stocks with no filters
      const response = await api.stocks.screenStocks({
        filters: [],
        sort_by: "market_cap",
        sort_order: "desc",
        limit: 100,
        market,
      });

      // Transform response to frontend format
      const transformedResults = response.map((stock: any) => ({
        ticker: stock.ticker,
        company: stock.company,
        sector: stock.sector,
        price: stock.price,
        marketCap: stock.market_cap,
        peRatio: stock.pe_ratio,
        revenueGrowth: stock.revenue_growth || 0,
        profitMargin: stock.profit_margin || 0,
        matchScore: stock.match_score || 85,
      }));

      setResults(transformedResults);
      setIsSampleUniverse(Boolean((response as any).sampleData));
    } catch (error: any) {
      console.error("Failed to load stocks:", error);
      // Keep mock results if API fails
    } finally {
      setIsScanning(false);
    }
  };

  const addFilter = () => {
    const newFilter: FilterItem = {
      id: Date.now().toString(),
      field: "pe_ratio",
      operator: "lt",
      value: "",
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (
    id: string,
    field: keyof FilterItem,
    value: string
  ) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Load a starter screen's filters. Free users can build/preview freely —
  // the Pro gate only bites when they RUN it for live results.
  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setFilters(
      preset.filters.map((f, i) => ({ id: `${preset.id}-${i}`, ...f }))
    );
    setHasRun(false);
  };

  const runScan = async () => {
    // Enter-free / run-Pro: anyone can build a screen and see the sample
    // preview, but running it against live data is the paid moment.
    if (!(await usePlanStore.getState().ensurePro())) {
      usePlanStore.getState().openUpgrade("screener");
      return;
    }
    setHasRun(true);
    setIsScanning(true);
    try {
      // Transform filters to backend format (remove id field)
      const backendFilters = filters
        .filter((f) => f.value !== "") // Only include filters with values
        .map(({ field, operator, value }) => ({
          field,
          operator,
          value,
        }));

      // Call the real API
      const response = await api.stocks.screenStocks({
        filters: backendFilters,
        sort_by: SORT_FIELDS[sortField] || "match_score",
        sort_order: sortOrder,
        limit: 100,
        market,
      });

      // Transform response to frontend format (snake_case to camelCase)
      const transformedResults = response.map((stock: any) => ({
        ticker: stock.ticker,
        company: stock.company,
        sector: stock.sector,
        price: stock.price,
        marketCap: stock.market_cap,
        peRatio: stock.pe_ratio,
        revenueGrowth: stock.revenue_growth || 0,
        profitMargin: stock.profit_margin || 0,
        matchScore: stock.match_score || 85,
      }));

      setResults(transformedResults);
      setIsSampleUniverse(Boolean((response as any).sampleData));

      toast({
        title: "Scan Complete",
        description: `Found ${transformedResults.length} matching stocks`,
      });
    } catch (error: any) {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to screen stocks. Please try again.",
        variant: "destructive",
      });
      console.error("Screening error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleExportPDF = async () => {
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "Run a scan first to get results to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Calculate average score
      const avgScore = results.reduce((sum, stock) => sum + stock.matchScore, 0) / results.length;

      // Get unique sectors and counts
      const sectorCounts: Record<string, number> = {};
      results.forEach((stock) => {
        sectorCounts[stock.sector] = (sectorCounts[stock.sector] || 0) + 1;
      });
      const topSectors = Object.entries(sectorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Prepare screening data
      const screeningData = {
        description: `Custom stock screening with ${filters.length} filter(s) applied`,
        total_matches: results.length,
        stocks: results.map((stock) => ({
          ticker: stock.ticker,
          name: stock.company,
          price: stock.price,
          market_cap: stock.marketCap,
          pe_ratio: stock.peRatio,
          score: stock.matchScore,
        })),
        filters: filters.map((f) => ({
          field: filterFields.find((ff) => ff.value === f.field)?.label || f.field,
          operator: operators.find((op) => op.value === f.operator)?.label || f.operator,
          value: f.value,
        })),
        average_score: avgScore,
        top_sectors: topSectors,
      };

      // Export PDF
      const blob = await api.pdf.exportScreening("Stock Screening Results", screeningData);
      downloadBlob(blob, `screening_results.pdf`);

      toast({
        title: "PDF Exported",
        description: "Your screening results have been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <h1 className="xt-title mb-2">
              Stock Scanner
            </h1>
            <span className="px-2 py-1 rounded bg-warning/10 text-amber-700 text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Premium
            </span>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            A stock screener sifts through thousands of companies and surfaces only the ones
            that match what <em>you</em> care about — cheap, fast-growing, high-quality, or
            high-dividend. Pick a ready-made screen below, or build your own.
          </p>
        </motion.div>

        {/* Market selector — pick the universe first */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.03 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="xt-label">Market</span>
            <div className="inline-flex rounded-xl border border-border overflow-hidden">
              {([
                { id: "india", label: "🇮🇳 India (NSE)" },
                { id: "us", label: "🇺🇸 United States" },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMarket(m.id); setMarketTouched(true); setActivePreset(null); }}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    market === m.id ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Screens run against {market === "india" ? "Indian" : "US"} listed companies.</span>
          </div>
        </motion.div>

        {/* Starter screens — one click, no jargon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="xt-label">
              Start with a proven screen
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  activePreset === preset.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-white hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <div className="text-2xl mb-2">{preset.emoji}</div>
                <div className="font-bold text-foreground text-sm">{preset.name}</div>
                <div className="text-xs text-primary font-medium mb-1.5">{preset.tagline}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{preset.plain}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filter Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl bg-white border border-border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter Criteria
            </h2>
            <Button variant="outline" size="sm" onClick={addFilter} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Filter
            </Button>
          </div>

          <div className="space-y-3">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-lg bg-secondary/50"
              >
                <Select
                  value={filter.field}
                  onValueChange={(v) => updateFilter(filter.id, "field", v)}
                >
                  <SelectTrigger className="w-52 bg-background">
                    <SelectValue placeholder="Select criteria" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {filterFieldGroups.map((grp) => (
                      <SelectGroup key={grp.group}>
                        <SelectLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {grp.group}
                        </SelectLabel>
                        {grp.fields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                {filter.field === "sector" ? (
                  <>
                    <span className="text-muted-foreground">=</span>
                    <Select
                      value={filter.value}
                      onValueChange={(v) => updateFilter(filter.id, "value", v)}
                    >
                      <SelectTrigger className="w-48 bg-background">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectorOptions.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Select
                      value={filter.operator}
                      onValueChange={(v) => updateFilter(filter.id, "operator", v)}
                    >
                      <SelectTrigger className="w-20 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="text"
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) =>
                        updateFilter(filter.id, "value", e.target.value)
                      }
                      className="w-32 flex-1 min-w-[8rem] sm:flex-none bg-background"
                    />
                  </>
                )}

                <button
                  onClick={() => removeFilter(filter.id)}
                  aria-label="Remove filter"
                  className="ml-auto p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <Button onClick={runScan} className="bg-primary text-white hover:bg-primary/90 gap-2" disabled={isScanning}>
              {isPro ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4 pro-gold-text" />}
              {isScanning ? "Scanning..." : isPro ? "Run Scan" : "Run Scan on Live Data"}
            </Button>
            {!isPro && (
              <span className="text-[10px] font-extrabold px-2 py-1 rounded bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                PRO
              </span>
            )}
            <Button variant="outline" className="gap-2" onClick={openSaveDialog}>
              <Save className="w-4 h-4" />
              Save Screener
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setFilters([]); setActivePreset(null); }}
              className="text-muted-foreground"
            >
              Clear All
            </Button>
          </div>
          {isPro && savedScreens.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-semibold text-muted-foreground">Your saved screens:</span>
              {savedScreens.map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => loadSavedScreen(screen)}
                  className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-foreground hover:bg-primary/10"
                >
                  {screen.name}
                </button>
              ))}
            </div>
          )}
          {!isPro && (
            <p className="text-xs text-muted-foreground mt-3">
              Build and preview any screen for free. <span className="font-semibold text-foreground">Pro</span> runs it live against the full market and shows every match.
            </p>
          )}
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-white border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">
                {isPro ? `Results (${results.length} matches)` : "Sample results"}
              </h2>
              {!isPro && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  Preview — live results are Pro
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={async () => ((await usePlanStore.getState().ensurePro()) ? handleExportPDF() : usePlanStore.getState().openUpgrade("export"))}
              disabled={isExporting || results.length === 0}
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>

          {/* Free-tier value banner: they see a real taste, then the unlock */}
          {!isPro && (
            <div
              className="px-4 py-3 bg-primary/5 border-b border-primary/15 flex items-center gap-3 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => usePlanStore.getState().openUpgrade("screener")}
            >
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground flex-1">
                This is a sample of what a screen returns. <span className="font-semibold text-foreground">Go Pro</span> to
                run this against the entire market, see every match ranked, and export the list.
              </p>
              <span className="text-sm font-bold text-primary whitespace-nowrap">Unlock →</span>
            </div>
          )}

          {isPro && isSampleUniverse && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-800">
              Showing a limited set of companies while our live market data refreshes. Results will cover the full
              market shortly.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Company
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Sector
                  </th>
                  <th
                    className="text-right text-xs font-medium text-muted-foreground py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("price")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Price
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right text-xs font-medium text-muted-foreground py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("marketCap")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Mkt Cap
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right text-xs font-medium text-muted-foreground py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("peRatio")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      P/E
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right text-xs font-medium text-muted-foreground py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("revenueGrowth")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Rev Growth
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right text-xs font-medium text-muted-foreground py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("profitMargin")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Margin
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right text-xs font-medium text-muted-foreground py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("matchScore")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Match
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      {isScanning ? "Scanning…" : "No companies match these filters. Loosen a filter and run the scan again."}
                    </td>
                  </tr>
                )}
                {sortedResults.map((stock) => (
                  <tr
                    key={stock.ticker}
                    onClick={() => navigate(`/fundakamental/analyze?ticker=${encodeURIComponent(stock.ticker)}&name=${encodeURIComponent(stock.company || stock.ticker)}`)}
                    title={`Analyse ${stock.company || stock.ticker}`}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {stock.ticker}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stock.company}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-full bg-accent/30 text-xs text-primary font-medium">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-foreground">
                      {Number(stock.price) > 0 ? `${priceSymbol}${Number(stock.price).toFixed(2)}` : "—"}
                    </td>
                    <td className="py-4 px-4 text-right text-foreground">
                      {stock.marketCap}
                    </td>
                    <td className="py-4 px-4 text-right text-foreground">
                      {stock.peRatio ? `${Number(stock.peRatio).toFixed(1)}x` : "—"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          stock.revenueGrowth >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {stock.revenueGrowth >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Number(stock.revenueGrowth).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-foreground">
                      {Number(stock.profitMargin).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-20 space-y-1">
                          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stock.matchScore}%` }}
                              transition={{ delay: 0.1, duration: 0.8 }}
                              className={`h-full rounded-full ${
                                stock.matchScore >= 90
                                  ? "bg-primary"
                                  : stock.matchScore >= 75
                                  ? "bg-primary/70"
                                  : "bg-warning"
                              }`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {stock.matchScore >= 90
                              ? "Excellent"
                              : stock.matchScore >= 75
                              ? "Good"
                              : "Fair"}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          stock.matchScore >= 90
                            ? "text-success"
                            : stock.matchScore >= 75
                            ? "text-primary"
                            : "text-warning"
                        }`}>
                          {stock.matchScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save this screen</DialogTitle>
            <DialogDescription>Saved screens appear above the results so you can re-run them in one click.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="screen-name">Name</Label>
            <Input
              id="screen-name"
              value={saveName}
              maxLength={80}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveScreen()}
              placeholder="Cheap quality banks"
            />
          </div>
          <Button onClick={handleSaveScreen} disabled={savingScreen} className="w-full bg-primary text-white hover:bg-primary/90">
            {savingScreen ? "Saving…" : "Save screen"}
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StockScanner;
