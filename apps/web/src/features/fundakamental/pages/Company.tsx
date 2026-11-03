// Company numbers for any NSE/US stock — type a name, see the figures, no
// upload needed. Reached from the Home search or by URL (?ticker=).
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building2, Download, FileText, Search } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import CompanySearchResults from "../components/CompanySearchResults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRegion from "@/hooks/useRegion";
import { popularTickers } from "../lib/currency";
import { api } from "../lib/api";
import { downloadBlob } from "../lib/api";
import { isIndianCompany, isNum, makeMoney, pctText, quarterLabel, ratioText, toNum, yearLabel } from "../lib/companyFormat";

interface Period {
  date: string;
  revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  ebitda: number | null;
  net_income: number | null;
  eps: number | null;
  total_assets: number | null;
  total_debt: number | null;
  equity: number | null;
  cash: number | null;
  operating_cf: number | null;
  capex: number | null;
  free_cf: number | null;
  revenue_growth: number | null;
  net_income_growth: number | null;
  gross_margin: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  roe: number | null;
  debt_to_equity: number | null;
}

interface FinancialsResponse {
  ticker: string;
  company: Record<string, any> | null;
  annual: Period[];
  quarterly: Period[];
  statements_available: boolean;
  stale?: boolean;
}

const dash = "—";

function StatementTable({
  title,
  periods,
  label,
  rows,
}: {
  title: string;
  periods: Period[];
  label: (date: string) => string;
  rows: Array<{ name: string; get: (p: Period) => string; strong?: boolean }>;
}) {
  if (periods.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden">
      <h2 className="text-lg font-bold text-foreground px-5 pt-5 pb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border bg-accent/30 text-muted-foreground">
              <th className="text-left font-medium py-2.5 px-5 sticky left-0 bg-accent/30">&nbsp;</th>
              {periods.map((p) => (
                <th key={p.date} className="text-right font-medium py-2.5 px-4 whitespace-nowrap">
                  {label(p.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-border/50 last:border-0">
                <td className={`py-2.5 px-5 whitespace-nowrap sticky left-0 bg-white ${r.strong ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {r.name}
                </td>
                {periods.map((p) => (
                  <td key={p.date} className={`py-2.5 px-4 text-right whitespace-nowrap ${r.strong ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {r.get(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Company() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ticker = (searchParams.get("ticker") || "").toUpperCase();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { region } = useRegion();
  const [data, setData] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!ticker) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.stocks
      .getFinancials(ticker)
      .then((res: FinancialsResponse) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(null);
        const msg = err instanceof Error ? err.message : "";
        setError(/not found|no data/i.test(msg) ? `We couldn't find numbers for ${ticker}.` : "Couldn't load this company right now. Please try again in a minute.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const downloadExcel = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await api.stocks.downloadFinancialsExcel(ticker);
      downloadBlob(blob, `${ticker}-financials.xlsx`);
    } catch {
      setExportError("Couldn't build the Excel file right now. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const pick = (t: string) => {
    setSearchParams({ ticker: t.toUpperCase() });
    setQuery("");
    setShowResults(false);
  };

  const c = data?.company || null;
  const inr = isIndianCompany(ticker, c?.currency);
  const money = makeMoney(inr);
  const price = (v: unknown) => (isNum(toNum(v)) && Number(v) > 0 ? `${inr ? "₹" : "$"}${Number(v).toLocaleString(inr ? "en-IN" : "en-US", { maximumFractionDigits: 2 })}` : dash);
  const name = (c?.name as string) || ticker;

  const annual = data?.annual ?? [];
  const quarterly = data?.quarterly ?? [];
  const chartData = annual.map((p) => ({
    year: yearLabel(p.date),
    Revenue: isNum(p.revenue) ? (inr ? p.revenue / 1e7 : p.revenue / 1e6) : null,
    "Net profit": isNum(p.net_income) ? (inr ? p.net_income / 1e7 : p.net_income / 1e6) : null,
  }));

  const snapshot: Array<[string, string]> = c
    ? [
        ["Price", price(c.price)],
        ["Market cap", money(toNum(c.market_cap))],
        ["P/E", ratioText(toNum(c.pe_ratio))],
        ["P/B", ratioText(toNum(c.pb_ratio))],
        ["ROE", pctText(toNum(c.roe))],
        ["Debt / equity", ratioText(toNum(c.debt_to_equity))],
        ["Dividend yield", pctText(toNum(c.dividend_yield))],
        ["52-week range", c.week_52_low != null && c.week_52_high != null ? `${price(c.week_52_low)} – ${price(c.week_52_high)}` : dash],
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="xt-title mb-2">Company numbers</h1>
          <p className="text-muted-foreground max-w-2xl">
            Search any NSE or US company to see its key ratios, yearly and quarterly results. No document needed.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-border p-5">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              aria-label="Search a company or ticker"
              placeholder="Search a company or ticker (e.g. Reliance, TCS.NS, AAPL)"
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
                <CompanySearchResults query={query} onAnalyze={(co: any) => co?.ticker && pick(co.ticker)} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {popularTickers(region as any).map((t) => (
              <button
                key={t}
                onClick={() => pick(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  t === ticker ? "bg-primary text-white" : "bg-accent text-brand hover:bg-primary/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {!ticker ? (
          <div className="rounded-2xl bg-white border border-border p-10 text-center text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-brand/40" />
            Pick a company above to see its numbers.
          </div>
        ) : loading ? (
          <div className="rounded-2xl bg-white border border-border p-10 text-center text-muted-foreground">Loading {ticker}…</div>
        ) : error ? (
          <div className="rounded-2xl bg-white border border-border p-10 text-center text-muted-foreground">{error}</div>
        ) : data ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground">
                  {ticker}
                  {c?.sector ? ` · ${c.sector}` : ""}
                  {c?.industry ? ` · ${c.industry}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.statements_available && (
                  <Button variant="outline" onClick={downloadExcel} disabled={exporting} className="gap-2">
                    <Download className="w-4 h-4" /> {exporting ? "Preparing…" : "Download Excel"}
                  </Button>
                )}
                <Button asChild className="bg-primary text-white hover:bg-primary/90 gap-2">
                  <Link to={`/fundakamental/analyze?ticker=${encodeURIComponent(ticker)}&name=${encodeURIComponent(name)}`}>
                    <FileText className="w-4 h-4" /> Analyze a filing
                  </Link>
                </Button>
              </div>
            </div>
            {exportError && <p className="text-sm text-destructive">{exportError}</p>}
            {data.stale && (
              <p className="text-sm text-muted-foreground rounded-xl bg-accent/40 border border-border px-4 py-3">
                Showing the last saved results. The data source is busy right now, so these may be a few days old.
              </p>
            )}

            {snapshot.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {snapshot.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-lg font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {c?.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{c.description}</p>
            )}

            {!data.statements_available && (
              <div className="rounded-2xl bg-white border border-border p-6 text-sm text-muted-foreground">
                Yearly and quarterly results aren't available for this company right now. Try again in a minute, or analyze its filing.
              </div>
            )}

            {chartData.length > 1 && (
              <div className="rounded-2xl bg-white border border-border p-5">
                <h2 className="text-lg font-bold text-foreground mb-3">Revenue and net profit ({inr ? "₹ crore" : "$ million"})</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={70} tickFormatter={(v) => Number(v).toLocaleString(inr ? "en-IN" : "en-US")} />
                      <Tooltip formatter={(v: any) => Number(v).toLocaleString(inr ? "en-IN" : "en-US", { maximumFractionDigits: 0 })} />
                      <Legend />
                      <Bar dataKey="Revenue" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Net profit" fill="#86EFAC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <StatementTable
              title="Yearly results"
              periods={annual}
              label={yearLabel}
              rows={[
                { name: "Revenue", get: (p) => money(p.revenue), strong: true },
                { name: "Revenue growth", get: (p) => pctText(p.revenue_growth) },
                { name: "EBITDA", get: (p) => money(p.ebitda) },
                { name: "Operating margin", get: (p) => pctText(p.operating_margin) },
                { name: "Net profit", get: (p) => money(p.net_income), strong: true },
                { name: "Profit growth", get: (p) => pctText(p.net_income_growth) },
                { name: "Net margin", get: (p) => pctText(p.net_margin) },
                { name: "EPS", get: (p) => (isNum(p.eps) ? p.eps.toFixed(2) : dash) },
                { name: "Return on equity", get: (p) => pctText(p.roe) },
                { name: "Total debt", get: (p) => money(p.total_debt) },
                { name: "Debt / equity", get: (p) => ratioText(p.debt_to_equity) },
                { name: "Operating cash flow", get: (p) => money(p.operating_cf) },
                { name: "Free cash flow", get: (p) => money(p.free_cf) },
              ]}
            />

            <StatementTable
              title="Quarterly results"
              periods={quarterly}
              label={quarterLabel}
              rows={[
                { name: "Revenue", get: (p) => money(p.revenue), strong: true },
                { name: "Revenue growth (YoY)", get: (p) => pctText(p.revenue_growth) },
                { name: "EBITDA", get: (p) => money(p.ebitda) },
                { name: "Operating margin", get: (p) => pctText(p.operating_margin) },
                { name: "Net profit", get: (p) => money(p.net_income), strong: true },
                { name: "Profit growth (YoY)", get: (p) => pctText(p.net_income_growth) },
                { name: "EPS", get: (p) => (isNum(p.eps) ? p.eps.toFixed(2) : dash) },
              ]}
            />

            <p className="text-xs text-muted-foreground">
              Figures come from Yahoo Finance and may differ slightly from the company's own filings. Not investment advice.
            </p>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
