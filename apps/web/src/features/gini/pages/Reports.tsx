// Gini Reports page — client-side PDF report generator. Free (no ProGate):
// reports are NOT in the original's Pro-module list (features-incoming/gini/
// index.html's `reports-tab`, ~line 2331, and app.js's `reports` module carry
// no plan check), so this page is reachable by every logged-in user.
//
// Rewrite (not a port) of two things the original standalone app split
// across:
//   - index.html's `reports-tab` (~lines 2331-2360) — the report-options
//     gate (`#includeNetWorth`/`#includeGoals`/`#includePortfolio` checkbox
//     ids reused verbatim below) that fed `reports.generateReportWithOptions`.
//   - app.js's `reports.generateReportWithOptions` (~line 5026) — the actual
//     section content (Net Worth Statement, Goals, Portfolio Summary) — and
//     `pdfExport.generateGeneralReportPDF` (~line 6538) — the
//     html2canvas→jsPDF pipeline, whose exact sizing math is ported below
//     unchanged:
//       const canvas = await html2canvas(el, { backgroundColor: '#ffffff' });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pageWidth = 190;                          // A4 width minus 2×10mm margins
//       const pdfHeight = (imgProps.height * pageWidth) / imgProps.width; // preserve aspect ratio
//       pdf.addImage(imgData, 'PNG', 10, 10, pageWidth, pdfHeight);       // 10mm margins
//   `pdf.getImageProperties(imgData)` (jsPDF's own helper) replaces manually
//   reading `canvas.width`/`canvas.height`, same ratio either way.
//
// Data: read-only, via TanStack Query against `api.assets`/`api.liabilities`/
// `api.goals` (same query keys `["gini","assets"|"liabilities"|"goals"]`
// NetWorth.tsx/Dashboard.tsx already use, so this page shares their cache —
// no new fetches on a warm cache). No mutations, nothing written back.
//
// Judgement calls (see this task's final report for the full list):
//   - The task brief asks for Net Worth Statement / Asset Allocation / Cash
//     Flow / Risk Profile / Goals Progress sections, but the original's own
//     `generateReportWithOptions` only ever gated three (Net Worth, Goals,
//     Portfolio) — Asset Allocation and Cash Flow/Risk Profile were never
//     original report sections with a dedicated formula anywhere in app.js.
//     Rather than invent a new analysis engine, Asset Allocation is folded
//     into the Net Worth section (it's the category breakdown NetWorth.tsx
//     already renders), and a lightweight, clearly-labeled "Cash Flow &
//     Risk Profile" section is added under the existing `includePortfolio`
//     flag (household monthly cash flow = earner income − liability EMIs;
//     risk profile = a simple growth-vs-stable asset-mix label) — a faithful
//     summary, not a new engine, and it doesn't introduce a fourth checkbox
//     the original never had.
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";

function futureValue(currentCost: number, inflationPct: number | null, years: number) {
  const rate = (inflationPct ?? 0) / 100;
  const n = Math.max(0, years);
  return currentCost * Math.pow(1 + rate, n);
}

// Category buckets for the "risk profile" heuristic below — matches
// NetWorth.tsx's `ASSET_CATEGORIES` list.
const GROWTH_CATEGORIES = new Set(["Stocks", "Mutual Funds"]);
const STABLE_CATEGORIES = new Set(["Fixed Deposits", "Gold", "Cash", "PPF", "Insurance"]);

export default function Reports() {
  const { formatCurrency } = useCurrency();

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["gini", "assets"],
    queryFn: api.assets.getAssets,
  });
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ["gini", "liabilities"],
    queryFn: api.liabilities.getLiabilities,
  });
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["gini", "goals"],
    queryFn: api.goals.getGoals,
  });
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });

  const isLoading = assetsLoading || liabilitiesLoading || goalsLoading || membersLoading;

  // Report options — ids/semantics match the original's
  // #includeNetWorth/#includeGoals/#includePortfolio checkboxes exactly.
  const [includeNetWorth, setIncludeNetWorth] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includePortfolio, setIncludePortfolio] = useState(true);

  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const byCategory = new Map<string, number>();
    assets.forEach((a) => {
      const key = a.category || "Uncategorized";
      byCategory.set(key, (byCategory.get(key) || 0) + (a.value || 0));
    });
    const allocation = Array.from(byCategory.entries())
      .map(([category, value]) => ({
        category,
        value,
        pct: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const monthlyIncome = members.filter((m) => m.is_earner).reduce((s, m) => s + (m.income || 0), 0);
    const monthlyEmi = liabilities.reduce((s, l) => s + (l.emi || 0), 0);
    const monthlyCashFlow = monthlyIncome - monthlyEmi;

    let growth = 0;
    let stable = 0;
    let other = 0;
    assets.forEach((a) => {
      const v = a.value || 0;
      if (GROWTH_CATEGORIES.has(a.category || "")) growth += v;
      else if (STABLE_CATEGORIES.has(a.category || "")) stable += v;
      else other += v;
    });
    const growthPct = totalAssets > 0 ? (growth / totalAssets) * 100 : 0;
    const riskLabel = totalAssets === 0 ? "Not enough data" : growthPct >= 55 ? "Aggressive" : growthPct >= 25 ? "Moderate" : "Conservative";

    const goalRows = goals.map((g) => {
      const yearsRemaining = (g.target_year || new Date().getFullYear()) - new Date().getFullYear();
      const fv = futureValue(g.current_cost, g.inflation, yearsRemaining);
      const saved = g.saved || 0;
      const progressPct = fv > 0 ? Math.min(100, (saved / fv) * 100) : 0;
      return { ...g, futureValue: fv, progressPct };
    });

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      allocation,
      monthlyIncome,
      monthlyEmi,
      monthlyCashFlow,
      growthPct,
      riskLabel,
      goalRows,
    };
  }, [assets, liabilities, goals, members]);

  async function handleDownloadPdf() {
    const el = previewRef.current;
    if (!el) return;
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      // Sizing math ported verbatim from the original's
      // pdfExport.generateGeneralReportPDF (see header comment).
      const canvas = await html2canvas(el, { backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 190; // A4 width minus margins
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 10, 10, pageWidth, pdfHeight);
      pdf.save(`Xtin-Gini-General-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <GiniLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate a printable financial report and download it as a PDF</p>
          </div>
        </div>

        {/* Report options */}
        <Card>
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Checkbox id="includeNetWorth" checked={includeNetWorth} onCheckedChange={(v) => setIncludeNetWorth(v === true)} />
                <Label htmlFor="includeNetWorth" className="cursor-pointer">
                  Net Worth Statement
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="includeGoals" checked={includeGoals} onCheckedChange={(v) => setIncludeGoals(v === true)} />
                <Label htmlFor="includeGoals" className="cursor-pointer">
                  Goals Analysis
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="includePortfolio" checked={includePortfolio} onCheckedChange={(v) => setIncludePortfolio(v === true)} />
                <Label htmlFor="includePortfolio" className="cursor-pointer">
                  Portfolio Summary
                </Label>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleDownloadPdf} disabled={isLoading || generating} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {generating ? "Generating PDF…" : "Download PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div ref={previewRef} className="rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-4 sm:p-8 text-[#0E1B2E]">
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-xl font-bold">Financial Planning Report</h2>
                  <p className="text-sm text-[#6b7280]">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {includeNetWorth && (
                  <section className="mb-8">
                    <h3 className="mb-3 text-lg font-semibold">Net Worth Statement</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[#6b7280]">Total Assets</p>
                        <p className="text-base font-bold">{formatCurrency(summary.totalAssets)}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Total Liabilities</p>
                        <p className="text-base font-bold">{formatCurrency(summary.totalLiabilities)}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Net Worth</p>
                        <p className="text-base font-bold">{formatCurrency(summary.netWorth)}</p>
                      </div>
                    </div>

                    <h4 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">Asset Allocation</h4>
                    {summary.allocation.length === 0 ? (
                      <p className="text-sm text-[#6b7280]">No assets recorded yet.</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {summary.allocation.map((row) => (
                          <li key={row.category} className="flex justify-between border-b border-dashed py-1">
                            <span>{row.category}</span>
                            <span>
                              {formatCurrency(row.value)} ({row.pct.toFixed(0)}%)
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {includeGoals && (
                  <section className="mb-8">
                    <h3 className="mb-3 text-lg font-semibold">Goals Progress</h3>
                    {summary.goalRows.length === 0 ? (
                      <p className="text-sm text-[#6b7280]">No goals recorded yet.</p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {summary.goalRows.map((goal) => (
                          <li key={goal.id} className="border-b border-dashed pb-2">
                            <div className="flex justify-between font-medium">
                              <span>
                                {goal.name} ({goal.category || "General"})
                              </span>
                              <span>{goal.progressPct.toFixed(0)}% funded</span>
                            </div>
                            <p className="text-[#6b7280]">
                              Target Year: {goal.target_year ?? "-"} · Future Value: {formatCurrency(goal.futureValue)} · Priority:{" "}
                              {goal.priority || "-"} · Already Saved: {formatCurrency(goal.saved || 0)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {includePortfolio && (
                  <section className="mb-2">
                    <h3 className="mb-3 text-lg font-semibold">Portfolio Summary</h3>
                    <p className="mb-4 text-sm">
                      <strong>Total Portfolio Value:</strong> {formatCurrency(summary.totalAssets)}
                    </p>

                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">Cash Flow &amp; Risk Profile</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[#6b7280]">Household Monthly Income</p>
                        <p className="font-bold">{formatCurrency(summary.monthlyIncome)}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Monthly EMI Outflow</p>
                        <p className="font-bold">{formatCurrency(summary.monthlyEmi)}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Net Monthly Cash Flow</p>
                        <p className="font-bold">{formatCurrency(summary.monthlyCashFlow)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-[#6b7280]">
                      Risk profile (approximate, based on growth vs. stable asset mix): <strong>{summary.riskLabel}</strong> (
                      {summary.growthPct.toFixed(0)}% growth-oriented assets)
                    </p>
                  </section>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GiniLayout>
  );
}
