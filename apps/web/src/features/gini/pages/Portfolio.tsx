// Portfolio Analyzer — read-only analysis view over the user's assets.
// Port of features-incoming/gini/app.js's `portfolio` module
// (`calculatePortfolio`/`renderDistributionChart`/`calculateRisk`,
// ~lines 3990-4121) into a React/TanStack Query page — see
// apps/web/src/features/gini/pages/Dashboard.tsx and ./NetWorth.tsx for the
// TanStack Query + shadcn + recharts conventions this follows. Original
// layout/copy reference: features-incoming/gini/index.html's
// `id="portfolio-tab"` (~lines 1205-1295).
//
// This page ONLY reads `api.assets.getAssets()` — no mutations, no writes.
//
// Reproduced formulas from the original `portfolio` module, faithfully:
//   - `calculatePortfolio()`: groups assets by `category`, sums value per
//     category, averages each category's `return` (here: `return_rate`)
//     across its assets, then for each category:
//       allocation% = categoryValue / totalPortfolioValue * 100
//       avgReturn%  = mean(category's asset return_rate)
//       contribution to weighted return = (allocation% / 100) * avgReturn%
//     weightedReturn = sum of every category's contribution.
//   - `renderDistributionChart()`: donut of asset value by category —
//     reproduced as a recharts Pie below.
//   - `calculateRisk()`: horizon (years) + risk tolerance ("Conservative"/
//     "Moderate"/"Aggressive") -> recommended equity/debt/others split.
//     Base split by tolerance: Conservative 30/60/10, Moderate 50/40/10,
//     Aggressive 70/20/10. Then horizon > 15 shifts +10 equity / -10 debt;
//     horizon < 5 shifts -10 equity / +10 debt. Both clamped to [0, 100]
//     ("others" is never adjusted or clamped in the original — reproduced
//     verbatim, including that quirk).
//
// Judgement call: the original `portfolio` module operates ONLY on
// `appState.assets` (plus `networth.calculateTotalAssets()`, which is just
// the sum of asset values) — it does not reference `family-advanced`/
// `taxOptimization` data (unlike some other modules in app.js), so there is
// no Phase 10f data gap to call out here; everything the module needs is
// already available from `api.assets.getAssets()`.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { ArrowRight, PieChart as PieChartIcon, ShieldQuestion, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";

// Matches gini.css's `--chart-1`..`--chart-5` tokens (same palette as
// Dashboard.tsx/NetWorth.tsx).
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type RiskTolerance = "Conservative" | "Moderate" | "Aggressive";

/** Verbatim port of `portfolio.calculateRisk()`'s allocation logic. */
function recommendAllocation(horizon: number, tolerance: RiskTolerance) {
  let equity = 50;
  let debt = 40;
  const others = 10;

  if (tolerance === "Conservative") {
    equity = 30;
    debt = 60;
  } else if (tolerance === "Aggressive") {
    equity = 70;
    debt = 20;
  }

  if (horizon > 15) {
    equity += 10;
    debt -= 10;
  } else if (horizon < 5) {
    equity -= 10;
    debt += 10;
  }

  equity = Math.max(0, Math.min(100, equity));
  debt = Math.max(0, Math.min(100, debt));

  return { equity, debt, others };
}

export default function Portfolio() {
  const { formatInr: formatCurrency } = useCurrency();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["gini", "assets"],
    queryFn: api.assets.getAssets,
  });

  const [horizon, setHorizon] = useState("10");
  const [tolerance, setTolerance] = useState<RiskTolerance>("Moderate");
  const [riskResult, setRiskResult] = useState<{ equity: number; debt: number; others: number } | null>(null);

  const { rows, totalValue, weightedReturn, assetClasses, chartData } = useMemo(() => {
    const byCategory = new Map<string, { value: number; returns: number[] }>();
    for (const a of assets) {
      const key = a.category || "Other";
      const entry = byCategory.get(key) || { value: 0, returns: [] };
      entry.value += a.value || 0;
      entry.returns.push(a.return_rate ?? 0);
      byCategory.set(key, entry);
    }

    const total = assets.reduce((sum, a) => sum + (a.value || 0), 0);

    let weighted = 0;
    const tableRows = Array.from(byCategory.entries()).map(([category, data]) => {
      const allocation = total > 0 ? (data.value / total) * 100 : 0;
      const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
      const contribution = (allocation / 100) * avgReturn;
      weighted += contribution;
      return { category, value: data.value, allocation, avgReturn, contribution };
    });

    return {
      rows: tableRows,
      totalValue: total,
      weightedReturn: weighted,
      assetClasses: byCategory.size,
      chartData: tableRows.map((r) => ({ name: r.category, value: r.value })),
    };
  }, [assets]);

  function handleCalculateRisk() {
    const h = parseInt(horizon, 10) || 0;
    setRiskResult(recommendAllocation(h, tolerance));
  }

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Portfolio Analyzer</h1>
          <p className="text-muted-foreground">Analyze your investment portfolio</p>
        </motion.div>

        {/* Current Portfolio Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Current Portfolio Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Weighted Avg Return</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-20 mt-1" />
                  ) : (
                    <p className="mt-1 text-xl font-bold text-foreground">{weightedReturn.toFixed(2)}%</p>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Portfolio Value</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-28 mt-1" />
                  ) : (
                    <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Asset Classes</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-10 mt-1" />
                  ) : (
                    <p className="mt-1 text-xl font-bold text-foreground">{assetClasses}</p>
                  )}
                </div>
              </div>

              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3">
                  <p>No portfolio data available.</p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/gini/networth">
                      Add an asset
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="85%"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          wrapperStyle={{ fontSize: 12 }}
                          formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset Class</TableHead>
                          <TableHead className="text-right">Current Value</TableHead>
                          <TableHead className="text-right">Allocation %</TableHead>
                          <TableHead className="text-right">Expected Return %</TableHead>
                          <TableHead className="text-right">Contribution to Return</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.category}>
                            <TableCell className="font-medium">{row.category}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.value)}</TableCell>
                            <TableCell className="text-right">{row.allocation.toFixed(1)}%</TableCell>
                            <TableCell className="text-right">{row.avgReturn.toFixed(1)}%</TableCell>
                            <TableCell className="text-right font-semibold text-success">
                              {row.contribution.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldQuestion className="h-4 w-4 text-primary" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="risk-horizon">Investment Horizon (Years)</Label>
                  <Input
                    id="risk-horizon"
                    type="number"
                    min={1}
                    value={horizon}
                    onChange={(e) => setHorizon(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Risk Tolerance</Label>
                  <Select value={tolerance} onValueChange={(v) => setTolerance(v as RiskTolerance)}>
                    <SelectTrigger aria-label="Risk Tolerance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conservative">Conservative (Low Risk)</SelectItem>
                      <SelectItem value="Moderate">Moderate (Medium Risk)</SelectItem>
                      <SelectItem value="Aggressive">Aggressive (High Risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCalculateRisk}>
                <Sparkles className="mr-2 h-4 w-4" />
                Calculate Recommendations
              </Button>

              {riskResult && (
                <div className="rounded-lg bg-secondary p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Recommended Allocation</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Equity</p>
                      <p className="text-lg font-bold text-foreground">{riskResult.equity}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Debt</p>
                      <p className="text-lg font-bold text-foreground">{riskResult.debt}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Others</p>
                      <p className="text-lg font-bold text-foreground">{riskResult.others}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </GiniLayout>
  );
}
