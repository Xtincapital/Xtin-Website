// Goal Planner & Projections — wealth growth projection + what-if scenario
// modeling. Port of features-incoming/gini/app.js's `planner` module
// (`calculateProjections`/`renderProjectionChart`/`updateScenario`,
// ~lines 4124-4252) into a React/TanStack Query page — see
// ./Dashboard.tsx/./NetWorth.tsx for the TanStack Query + shadcn + recharts
// conventions this follows. Original layout/copy reference:
// features-incoming/gini/index.html's `id="planner-tab"` (~lines 1298-1412).
//
// This page ONLY reads `api.assets.getAssets()` and `api.goals.getGoals()`
// — no mutations, no writes.
//
// Reproduced formulas from the original `planner` module, faithfully
// (`utils.calculateSIP`/`utils.calculateFutureValue`/`utils.sipFVFactor`,
// app.js ~lines 2672-2689):
//   - years = retirementAge - currentAge
//   - projectedCorpus = SIP future value of monthlySavings over `years` at
//     returnRate (annuity-DUE — deposit at the start of each month, the
//     original's default `appState.settings.sipTiming` — see judgement
//     call below) + future value of currentSavings compounded over `years`
//     at returnRate.
//   - totalInvested = currentSavings + monthlySavings * 12 * years
//   - totalReturns = projectedCorpus - totalInvested
//   - Month-by-month projection chart: same annuity-due compounding,
//     sampled at each year boundary (`renderProjectionChart`).
//   - What-if scenario (`updateScenario`): adjustedSavings =
//     monthlySavings * (1 + savingsAdj%), adjustedReturn = returnRate +
//     returnAdj (percentage points), adjustedYears = years + retirementAdj
//     (years), then re-run the same SIP + future-value formula; change =
//     adjustedCorpus - projectedCorpus.
//
// Judgement calls:
//   - `sipTiming`: the original reads a global `appState.settings.sipTiming`
//     (default `'due'`, i.e. deposit-at-start-of-month) set on a Settings
//     tab this migration hasn't built yet. Hardcoded to `'due'` here (the
//     original's own default) since there's no settings store to read from
//     — see `sipFVFactor` below.
//   - `plannerIncome`/`plannerExpenses`/`plannerInflation` fields exist on
//     the original's planner form (index.html ~lines 1323-1344) but are
//     never actually read by `calculateProjections()` — dead inputs in the
//     original. Dropped here; only the fields the formula actually
//     consumes (age, retirement age, savings, monthly savings, return) are
//     exposed.
//   - "Current Total Savings" is pre-filled from the real sum of
//     `api.assets.getAssets()` (the task brief's "starting wealth base")
//     instead of the original's hardcoded `1000000`, and stays editable —
//     the original had no live asset data to draw from since it was a
//     single hardcoded form field.
//   - Goals: the original `planner` module does NOT read `appState.goals`
//     at all (only `requiredReturn` does). Since the task brief explicitly
//     asks this page to read `api.goals.getGoals()` for "target amounts/
//     timelines", goals are layered on top of the ported projection chart
//     as reference markers (inflation-adjusted target cost at each goal's
//     target year, via the same future-value formula Dashboard.tsx uses)
//     plus a small funded-status list — a faithful extension of the
//     original's intent using data it didn't have wired up, not a ported
//     formula itself.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";
import { investableAssets } from "../lib/investable";

/** SIP future-value annuity factor — verbatim port of `utils.sipFVFactor`.
 *  `timing` is hardcoded to the original's default `'due'` (deposit at the
 *  start of the month) — see header comment. */
function sipFVFactor(monthlyRate: number, months: number) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return months;
  const base = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return base * (1 + monthlyRate); // 'due' timing
}

/** Verbatim port of `utils.calculateSIP`. */
function calculateSIP(monthlyAmount: number, ratePct: number, years: number) {
  const monthlyRate = ratePct / 12 / 100;
  const months = Math.max(0, Math.floor(years * 12));
  return monthlyAmount * sipFVFactor(monthlyRate, months);
}

/** Verbatim port of `utils.calculateFutureValue`. */
function futureValue(pv: number, ratePct: number, years: number) {
  return pv * Math.pow(1 + ratePct / 100, years);
}

interface BaseProjection {
  projectedCorpus: number;
  totalInvested: number;
  totalReturns: number;
  years: number;
  monthlySavings: number;
  currentSavings: number;
  returnRate: number;
  chartData: { year: number; corpus: number }[];
}

export default function Planner() {
  const { formatCurrency } = useCurrency();

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["gini", "assets"],
    queryFn: api.assets.getAssets,
  });
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["gini", "goals"],
    queryFn: api.goals.getGoals,
  });

  const isLoading = assetsLoading || goalsLoading;
  // Excludes your home and insurance (see ../lib/investable.ts).
  const totalAssets = useMemo(() => investableAssets(assets), [assets]);

  // Planning inputs — defaults match the original form's hardcoded values
  // (index.html ~lines 1316-1340), except `currentSavings`, which defaults
  // to the real asset total once loaded (see header comment) until the
  // user overrides it.
  const [currentAge, setCurrentAge] = useState("35");
  const [retirementAge, setRetirementAge] = useState("60");
  const [currentSavingsInput, setCurrentSavingsInput] = useState<string | null>(null);
  const [monthlySavings, setMonthlySavings] = useState("50000");
  const [returnRate, setReturnRate] = useState("12");

  const currentSavings = currentSavingsInput !== null ? parseFloat(currentSavingsInput) || 0 : totalAssets;

  const [base, setBase] = useState<BaseProjection | null>(null);

  // What-if scenario sliders — ranges match the original exactly
  // (index.html ~lines 1380-1398).
  const [savingsAdj, setSavingsAdj] = useState(0);
  const [returnAdj, setReturnAdj] = useState(0);
  const [retirementAdj, setRetirementAdj] = useState(0);

  function handleCalculate() {
    const age = parseInt(currentAge, 10) || 0;
    const retAge = parseInt(retirementAge, 10) || 0;
    const savings = currentSavings;
    const monthly = parseFloat(monthlySavings) || 0;
    const rate = parseFloat(returnRate) || 0;
    const years = Math.max(0, retAge - age);

    const projectedCorpus = calculateSIP(monthly, rate, years) + futureValue(savings, rate, years);
    const totalInvested = savings + monthly * 12 * years;
    const totalReturns = projectedCorpus - totalInvested;

    // Month-by-month annuity-due compounding, sampled yearly — mirrors
    // `renderProjectionChart`.
    const months = years * 12;
    const monthlyRate = rate / 12 / 100;
    const chartData: { year: number; corpus: number }[] = [{ year: 0, corpus: savings }];
    let corpus = savings;
    for (let m = 1; m <= months; m++) {
      corpus = (corpus + monthly) * (1 + monthlyRate);
      if (m % 12 === 0) chartData.push({ year: m / 12, corpus });
    }

    setBase({ projectedCorpus, totalInvested, totalReturns, years, monthlySavings: monthly, currentSavings: savings, returnRate: rate, chartData });
    setSavingsAdj(0);
    setReturnAdj(0);
    setRetirementAdj(0);
  }

  const scenario = useMemo(() => {
    if (!base) return null;
    const adjustedSavings = base.monthlySavings * (1 + savingsAdj / 100);
    const adjustedReturn = base.returnRate + returnAdj;
    const adjustedYears = Math.max(0, base.years + retirementAdj);

    const adjustedCorpus =
      calculateSIP(adjustedSavings, adjustedReturn, adjustedYears) +
      futureValue(base.currentSavings, adjustedReturn, adjustedYears);

    const change = adjustedCorpus - base.projectedCorpus;
    const changePercent = base.projectedCorpus !== 0 ? (change / base.projectedCorpus) * 100 : 0;

    return { adjustedCorpus, change, changePercent };
  }, [base, savingsAdj, returnAdj, retirementAdj]);

  // Goal markers overlaid on the projection chart — see header comment.
  const currentYear = new Date().getFullYear();
  const goalMarkers = useMemo(() => {
    if (!base) return [];
    return goals
      .map((g) => {
        const yearsFromNow = (g.target_year ?? currentYear) - currentYear;
        const rate = (g.inflation ?? 0) / 100;
        const target = g.current_cost * Math.pow(1 + rate, Math.max(0, yearsFromNow));
        return { name: g.name, year: yearsFromNow, target };
      })
      .filter((g) => g.year >= 0 && g.year <= base.years);
  }, [goals, base, currentYear]);

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Goal Planner &amp; Projections</h1>
          <p className="text-muted-foreground">Project your wealth and test scenarios</p>
        </motion.div>

        {/* Planning inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Planning Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="planner-current-age">Current Age</Label>
                  <Input id="planner-current-age" type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="planner-retirement-age">Retirement Age</Label>
                  <Input
                    id="planner-retirement-age"
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="planner-savings">Current Total Savings (₹)</Label>
                  {isLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Input
                      id="planner-savings"
                      type="number"
                      value={currentSavingsInput ?? String(totalAssets)}
                      onChange={(e) => setCurrentSavingsInput(e.target.value)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">Defaults to your investable assets from Net Worth (property and insurance not included)</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="planner-monthly-savings">Monthly Savings Amount (₹)</Label>
                  <Input
                    id="planner-monthly-savings"
                    type="number"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="planner-return">Expected Annual Return (%)</Label>
                  <Input
                    id="planner-return"
                    type="number"
                    step="0.1"
                    value={returnRate}
                    onChange={(e) => setReturnRate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCalculate}>Calculate Projections</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wealth projection */}
        {base && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Wealth Projection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Projected Corpus at Retirement
                    </p>
                    <p className="mt-1 text-xl font-bold text-success">{formatCurrency(base.projectedCorpus)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Amount Invested</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(base.totalInvested)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Returns Generated</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{formatCurrency(base.totalReturns)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Wealth Growth Over Time</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={base.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="plannerCorpusFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                          dataKey="year"
                          tickFormatter={(v) => `Yr ${v}`}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={64}
                          tickFormatter={(v) => formatCurrency(v, { compact: true })}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Year ${label}`}
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="corpus"
                          name="Projected Wealth"
                          stroke="hsl(var(--chart-1))"
                          fill="url(#plannerCorpusFill)"
                          strokeWidth={2}
                        />
                        {goalMarkers.map((g, i) => (
                          <ReferenceDot
                            key={g.name}
                            x={g.year}
                            y={g.target}
                            r={5}
                            fill="hsl(var(--chart-positive))"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            // Name each dot; alternate above/below so neighbouring goals don't overlap.
                            label={{
                              value: g.name,
                              position: i % 2 === 0 ? "top" : "bottom",
                              fontSize: 11,
                              fontWeight: 600,
                              fill: "hsl(var(--foreground))",
                            }}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {goalMarkers.length > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-positive))]" />
                      Each dot marks a goal's target amount in its target year.
                    </p>
                  )}
                </div>

                {goalMarkers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Goals within this horizon
                    </h4>
                    <div className="space-y-1.5">
                      {goalMarkers.map((g) => {
                        // Interpolate the projected corpus at the goal's year from
                        // the yearly chart data (nearest sampled year).
                        const point = base.chartData.find((d) => d.year === g.year) ?? base.chartData[base.chartData.length - 1];
                        const funded = point.corpus >= g.target;
                        return (
                          <div key={g.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                            <span className="text-foreground">
                              {g.name} <span className="text-muted-foreground">(Year {g.year})</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-muted-foreground">{formatCurrency(g.target)}</span>
                              <Badge variant={funded ? "default" : "destructive"} className={cn(funded && "bg-success text-success-foreground")}>
                                {funded ? "On track" : "Shortfall"}
                              </Badge>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!base && !isLoading && goals.length === 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <span>No goals set yet — add some to see them plotted against your projection.</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/gini/goals">
                Set a goal
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* What-if scenarios */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What-If Scenarios</CardTitle>
              <p className="text-sm text-muted-foreground">Adjust the sliders to see how changes impact your projections</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Monthly Savings Adjustment: {savingsAdj > 0 ? "+" : ""}{savingsAdj}%</Label>
                  <Slider
                    value={[savingsAdj]}
                    onValueChange={([v]) => setSavingsAdj(v)}
                    min={-50}
                    max={50}
                    step={5}
                    disabled={!base}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Return Rate Adjustment: {returnAdj > 0 ? "+" : ""}{returnAdj}%</Label>
                  <Slider
                    value={[returnAdj]}
                    onValueChange={([v]) => setReturnAdj(v)}
                    min={-5}
                    max={5}
                    step={0.5}
                    disabled={!base}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-5%</span>
                    <span>0%</span>
                    <span>+5%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Retirement Age Adjustment: {retirementAdj > 0 ? "+" : ""}
                    {retirementAdj} years
                  </Label>
                  <Slider
                    value={[retirementAdj]}
                    onValueChange={([v]) => setRetirementAdj(v)}
                    min={-10}
                    max={10}
                    step={1}
                    disabled={!base}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-10 years</span>
                    <span>0</span>
                    <span>+10 years</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-5 text-center">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Adjusted Projection</h4>
                {!base ? (
                  <p className="text-sm text-muted-foreground">Calculate a projection above to explore scenarios.</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(scenario!.adjustedCorpus)}</div>
                    <div className={cn("text-sm font-medium mt-1", scenario!.change >= 0 ? "text-success" : "text-destructive")}>
                      {scenario!.change >= 0 ? "↑ " : "↓ "}
                      {formatCurrency(Math.abs(scenario!.change))} ({scenario!.change >= 0 ? "+" : ""}
                      {scenario!.changePercent.toFixed(1)}%)
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </GiniLayout>
  );
}
