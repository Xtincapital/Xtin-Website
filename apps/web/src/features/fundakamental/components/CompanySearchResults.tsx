import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { api } from "../lib/api";
import ApproxAmount from "@/components/ApproxAmount";

// Shape returned by GET /api/fundakamental/stocks/search. Metrics are null
// (and price 0) for companies that only came from Yahoo's name search.
interface Company {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change_percent: number;
  pe_ratio: number | null;
  revenue_growth: number | null;
  profit_margin: number | null;
  market_cap: string | number;
}

interface CompanySearchResultsProps {
  query: string;
  isLoading?: boolean;
  onAnalyze: (company: Company) => void;
}

const fmt = (v: number | null | undefined, suffix: string) =>
  v === null || v === undefined || Number.isNaN(Number(v)) ? "—" : `${Number(v).toFixed(1)}${suffix}`;

// Indian listings (.NS / .BO) price in rupees; everything else we list is USD.
const currencySymbol = (ticker: string) => (/\.(NS|BO)$/i.test(ticker) ? "₹" : "$");

// funda_stocks stores market cap as a raw number string; show it compactly.
function formatMarketCap(value: string | number | null | undefined, symbol: string): string {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (n <= 0) return "";
  if (symbol === "₹") {
    if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}L Cr`;
    if (n >= 1e7) return `₹${Math.round(n / 1e7).toLocaleString("en-IN")} Cr`;
    return `₹${n.toLocaleString("en-IN")}`;
  }
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString("en-US")}`;
}

const CompanySearchResults = ({
  query,
  isLoading = false,
  onAnalyze,
}: CompanySearchResultsProps) => {
  const [, setSelectedCompany] = useState<Company | null>(null);
  const [results, setResults] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);

  // Debounced lookup against the backend; `cancelled` drops stale responses
  // so a slow earlier query can't overwrite a newer one.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await api.analysis.searchCompany(q);
        if (!cancelled) setResults(found || []);
      } catch (err) {
        console.error("Company search failed:", err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const filteredCompanies = results;
  const showLoading = isLoading || searching;

  if (showLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Searching companies...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">Start typing to search companies</p>
      </div>
    );
  }

  if (filteredCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No companies found for "{query}"</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5"
    >
      <p className="text-xs text-muted-foreground px-1">
        {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"} found
      </p>

      {filteredCompanies.map((company) => {
        const symbol = currencySymbol(company.ticker);
        const marketCap = formatMarketCap(company.market_cap, symbol);
        const metrics = [
          company.pe_ratio != null ? `P/E ${fmt(company.pe_ratio, "x")}` : "",
          company.revenue_growth != null ? `Rev ${fmt(company.revenue_growth, "%")}` : "",
          company.profit_margin != null ? `Margin ${fmt(company.profit_margin, "%")}` : "",
          marketCap ? `Mkt cap ${marketCap}` : "",
        ].filter(Boolean);

        return (
          <motion.div
            key={company.ticker}
            whileHover={{ y: -1 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 cursor-pointer transition-colors"
            onClick={() => {
              setSelectedCompany(company);
              onAnalyze(company);
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-brand text-xs font-semibold shrink-0">
                  {company.ticker}
                </span>
                <h3 className="font-medium text-base text-foreground truncate">{company.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {[company.sector, ...metrics].filter(Boolean).join(" · ") || "Click to analyze"}
              </p>
            </div>

            {company.price > 0 && (
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-foreground">
                  {symbol}
                  {company.price.toFixed(2)}
                </div>
                <ApproxAmount amount={company.price} from={symbol === "₹" ? "INR" : "USD"} />
                <div
                  className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
                    company.change_percent >= 0 ? "text-brand" : "text-destructive"
                  }`}
                >
                  {company.change_percent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(company.change_percent).toFixed(2)}%
                </div>
              </div>
            )}

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(company);
              }}
              className="bg-primary text-white hover:bg-primary/90 text-xs h-8 px-3 shrink-0"
            >
              Analyze
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default CompanySearchResults;
