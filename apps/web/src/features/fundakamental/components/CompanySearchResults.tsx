import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { api } from "../lib/api";

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
  market_cap: string;
}

interface CompanySearchResultsProps {
  query: string;
  isLoading?: boolean;
  onAnalyze: (company: Company) => void;
}

const fmt = (v: number | null | undefined, suffix: string) =>
  v === null || v === undefined || Number.isNaN(Number(v)) ? "—" : `${Number(v).toFixed(1)}${suffix}`;

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <p className="text-sm text-muted-foreground">
        Found {filteredCompanies.length} results
      </p>

      {filteredCompanies.map((company) => (
        <motion.div
          key={company.ticker}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -2 }}
          className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 cursor-pointer transition-colors"
          onClick={() => setSelectedCompany(company)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground">{company.name}</h3>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                  {company.ticker}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{company.sector}</p>
            </div>
            <div className="text-right">
              {company.price > 0 && (
                <>
                  <div className="text-lg font-bold text-foreground">
                    {company.price.toFixed(2)}
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-xs font-medium ${
                      company.change_percent >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {company.change_percent >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(company.change_percent).toFixed(2)}%
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="p-2 bg-background/50 rounded">
              <p className="text-xs text-muted-foreground">P/E</p>
              <p className="text-sm font-semibold text-foreground">
                {fmt(company.pe_ratio, "x")}
              </p>
            </div>
            <div className="p-2 bg-background/50 rounded">
              <p className="text-xs text-muted-foreground">Rev Growth</p>
              <p className="text-sm font-semibold text-foreground">
                {fmt(company.revenue_growth, "%")}
              </p>
            </div>
            <div className="p-2 bg-background/50 rounded">
              <p className="text-xs text-muted-foreground">Margin</p>
              <p className="text-sm font-semibold text-foreground">
                {fmt(company.profit_margin, "%")}
              </p>
            </div>
            <div className="p-2 bg-background/50 rounded">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-sm font-semibold text-foreground">
                {company.market_cap || "—"}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(company);
            }}
            className="w-full bg-primary text-white hover:bg-primary/90 text-xs h-8"
          >
            Analyze This Company
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CompanySearchResults;
