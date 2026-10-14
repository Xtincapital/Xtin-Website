// Retirement Calculator — corpus-needed / projected-corpus / surplus /
// runway analysis. Port of features-incoming/gini/app.js's `retirement`
// module (`calculate`/`renderChart`, ~lines 4639-4833) into a React/
// TanStack Query page — see ./Dashboard.tsx/./NetWorth.tsx for the
// TanStack Query + shadcn + recharts conventions this follows. Original
// layout/copy reference: features-incoming/gini/index.html's
// `id="retirement-tab"` (~lines 1618-1735).
//
// This page ONLY reads `api.familyMembers.getFamilyMembers()`,
// `api.assets.getAssets()` and `api.liabilities.getLiabilities()` — no
// mutations, no writes.
//
// Reproduced formulas from the original `retirement.calculate()`,
// faithfully:
//   yearsToRetirement = retirementAge - currentAge
//   yearsInRetirement  = lifeExpectancy - retirementAge
//   retirementExpenses = currentMonthlyExpenses * (expensePercent / 100)
//   futureMonthlyExpenses = retirementExpenses * (1 + inflation%)^yearsToRetirement
//   annualExpenses = futureMonthlyExpenses * 12
//   corpusNeeded = PV (at retirement) of a growing annuity paying
//     annualExpenses for yearsInRetirement years, growing at `inflation`
//     and discounted at `postReturn` (`r`/`g` below):
//       r ≈ g  -> annualExpenses * yearsInRetirement / (1 + r)
//       r ≠ g  -> annualExpenses * (1 - ((1+g)/(1+r))^yearsInRetirement) / (r - g)
//       yearsInRetirement <= 0 -> 0
//   projectedCorpus = SIP future value of monthlyContribution over
//     yearsToRetirement at preReturn (annuity-due — see Planner.tsx's same
//     judgement call on `sipTiming`) + future value of existingCorpus
//     compounded over yearsToRetirement at preReturn.
//   surplus = projectedCorpus - corpusNeeded
//   yearsLast: simulate the corpus post-retirement, growing at postReturn
//     and drawn down by annualExpenses (itself inflating every year), until
//     it's exhausted or 100 years pass.
//   Chart (`renderChart`): corpus + annual-expenses curves for
//     min(yearsInRetirement, 50) years post-retirement, same drawdown loop.
//
// Judgement calls:
//   - Current Age / Retirement Age / Life Expectancy default from the
//     household's primary member (`relationship === 'Self'`, the same
//     convention `familySettings` uses in the original app — falls back to
//     the first family member, then the original form's hardcoded
//     35/60/85) instead of the original's static hardcoded defaults, since
//     real family data is now available.
//   - Existing Retirement Corpus defaults to net worth
//     (sum(`api.assets`) - sum(`api.liabilities`), floored at 0) instead of
//     the original's hardcoded ₹10,00,000 — this page's task brief calls
//     for using assets/liabilities in "the retirement corpus calculation",
//     and net worth is the closest faithful stand-in for "what you already
//     have" now that real data exists. Still fully editable, matching the
//     original's own manually-entered field.
//   - Every other input (current monthly expenses, expense % of current,
//     pre/post-retirement return, inflation, monthly contribution) has no
//     live data source in this frontend yet, so they keep the original
//     form's hardcoded defaults verbatim.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartGrid, chartTick, chartTooltip } from "@/components/charts/chartTheme";
import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MoneyInput from "@/components/MoneyInput";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";

/** SIP future-value annuity factor — verbatim port of `utils.sipFVFactor`,
 *  hardcoded to the original's default `'due'` timing (see Planner.tsx's
 *  identical judgement call). */
function sipFVFactor(monthlyRate: number, months: number) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return months;
  const base = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return base * (1 + monthlyRate);
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

interface RetirementResult {
  corpusNeeded: number;
  projectedCorpus: number;
  surplus: number;
  yearsLast: number;
  chartData: { year: number; corpus: number; expenses: number }[];
}

/** Verbatim port of `retirement.calculate()`. */
function calculateRetirement(input: {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentExpenses: number;
  expensePercent: number;
  inflation: number;
  postReturn: number;
  existingCorpus: number;
  monthlyContribution: number;
  preReturn: number;
}): RetirementResult {
  const { currentAge, retirementAge, lifeExpectancy, currentExpenses, expensePercent, inflation, postReturn, existingCorpus, monthlyContribution, preReturn } =
    input;

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  const retirementExpenses = currentExpenses * (expensePercent / 100);
  const futureMonthlyExpenses = retirementExpenses * Math.pow(1 + inflation / 100, yearsToRetirement);
  const annualExpenses = futureMonthlyExpenses * 12;

  const r = postReturn / 100;
  const g = inflation / 100;
  let corpusNeeded: number;
  if (yearsInRetirement <= 0) {
    corpusNeeded = 0;
  } else if (Math.abs(r - g) < 1e-9) {
    corpusNeeded = (annualExpenses * yearsInRetirement) / (1 + r);
  } else {
    corpusNeeded = (annualExpenses * (1 - Math.pow((1 + g) / (1 + r), yearsInRetirement))) / (r - g);
  }

  const sipCorpus = calculateSIP(monthlyContribution, preReturn, yearsToRetirement);
  const existingGrowth = futureValue(existingCorpus, preReturn, yearsToRetirement);
  const projectedCorpus = sipCorpus + existingGrowth;

  const surplus = projectedCorpus - corpusNeeded;

  let yearsLast = 0;
  let remainingCorpus = projectedCorpus;
  while (remainingCorpus > 0 && yearsLast < 100) {
    remainingCorpus = remainingCorpus * (1 + postReturn / 100) - annualExpenses * Math.pow(1 + inflation / 100, yearsLast);
    yearsLast++;
  }

  const chartData: { year: number; corpus: number; expenses: number }[] = [];
  let corpus = projectedCorpus;
  let expenses = annualExpenses;
  const chartYears = Math.min(Math.max(0, yearsInRetirement), 50);
  for (let i = 0; i <= chartYears; i++) {
    chartData.push({ year: i, corpus: Math.max(0, corpus), expenses: Math.max(0, expenses) });
    corpus = corpus * (1 + postReturn / 100) - expenses;
    expenses = expenses * (1 + inflation / 100);
  }

  return { corpusNeeded, projectedCorpus, surplus, yearsLast, chartData };
}

export default function Retirement() {
  const { formatInr: formatCurrency, symbol } = useCurrency();
  const sym = symbol.trim();

  const { data: familyMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["gini", "assets"],
    queryFn: api.assets.getAssets,
  });
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ["gini", "liabilities"],
    queryFn: api.liabilities.getLiabilities,
  });

  const isLoading = membersLoading || assetsLoading || liabilitiesLoading;

  const primaryMember = useMemo(
    () => familyMembers.find((m) => m.relationship === "Self") ?? familyMembers[0] ?? null,
    [familyMembers]
  );
  const netWorth = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
    return Math.max(0, totalAssets - totalLiabilities);
  }, [assets, liabilities]);

  // Inputs — the first four default from real household data once loaded
  // (see header comment); everything else keeps the original form's
  // hardcoded defaults (index.html ~lines 1637-1701).
  const [currentAgeInput, setCurrentAgeInput] = useState<string | null>(null);
  const [retirementAgeInput, setRetirementAgeInput] = useState<string | null>(null);
  const [lifeExpectancyInput, setLifeExpectancyInput] = useState<string | null>(null);
  const [existingCorpusInput, setExistingCorpusInput] = useState<string | null>(null);

  const [currentExpenses, setCurrentExpenses] = useState("100000");
  const [expensePercent, setExpensePercent] = useState("80");
  const [inflation, setInflation] = useState("7");
  const [postReturn, setPostReturn] = useState("8");
  const [monthlyContribution, setMonthlyContribution] = useState("50000");
  const [preReturn, setPreReturn] = useState("12");

  const currentAgeDefault = primaryMember?.age ?? 35;
  const retirementAgeDefault = primaryMember?.retirement_age ?? 60;
  const lifeExpectancyDefault = primaryMember?.life_expectancy ?? 85;

  const currentAgeValue = currentAgeInput ?? String(currentAgeDefault);
  const retirementAgeValue = retirementAgeInput ?? String(retirementAgeDefault);
  const lifeExpectancyValue = lifeExpectancyInput ?? String(lifeExpectancyDefault);
  const existingCorpusValue = existingCorpusInput ?? String(netWorth);

  const [result, setResult] = useState<RetirementResult | null>(null);

  function handleCalculate() {
    const parsed = {
      currentAge: parseInt(currentAgeValue, 10) || 0,
      retirementAge: parseInt(retirementAgeValue, 10) || 0,
      lifeExpectancy: parseInt(lifeExpectancyValue, 10) || 0,
      currentExpenses: parseFloat(currentExpenses) || 0,
      expensePercent: parseFloat(expensePercent) || 0,
      inflation: parseFloat(inflation) || 0,
      postReturn: parseFloat(postReturn) || 0,
      existingCorpus: parseFloat(existingCorpusValue) || 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      preReturn: parseFloat(preReturn) || 0,
    };
    setResult(calculateRetirement(parsed));
  }

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="xt-title mb-2">Retirement Calculator</h1>
          <p className="text-muted-foreground">Plan for a comfortable retirement</p>
        </motion.div>

        {/* Planning inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Landmark className="h-4 w-4 text-brand" />
                Retirement Planning Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-current-age">Current Age</Label>
                    <Input
                      id="ret-current-age"
                      type="number"
                      value={currentAgeValue}
                      onChange={(e) => setCurrentAgeInput(e.target.value)}
                    />
                    {primaryMember && !currentAgeInput && (
                      <p className="text-xs text-muted-foreground">From {primaryMember.name}'s profile</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-retirement-age">Retirement Age</Label>
                    <Input
                      id="ret-retirement-age"
                      type="number"
                      value={retirementAgeValue}
                      onChange={(e) => setRetirementAgeInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-life-expectancy">Life Expectancy</Label>
                    <Input
                      id="ret-life-expectancy"
                      type="number"
                      value={lifeExpectancyValue}
                      onChange={(e) => setLifeExpectancyInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-current-expenses">Current Monthly Expenses ({sym})</Label>
                    <MoneyInput
                      id="ret-current-expenses"
                      type="number"
                      value={currentExpenses}
                      onChange={(e) => setCurrentExpenses(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-expense-percent">Retirement Expenses (% of current)</Label>
                    <Input
                      id="ret-expense-percent"
                      type="number"
                      value={expensePercent}
                      onChange={(e) => setExpensePercent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-inflation">Pre-Retirement Inflation (%)</Label>
                    <Input id="ret-inflation" type="number" step="0.1" value={inflation} onChange={(e) => setInflation(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-post-return">Post-Retirement Return (%)</Label>
                    <Input
                      id="ret-post-return"
                      type="number"
                      step="0.1"
                      value={postReturn}
                      onChange={(e) => setPostReturn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-existing-corpus">Existing Retirement Corpus ({sym})</Label>
                    <MoneyInput
                      id="ret-existing-corpus"
                      type="number"
                      value={existingCorpusValue}
                      onChange={(e) => setExistingCorpusInput(e.target.value)}
                    />
                    {!existingCorpusInput && <p className="text-xs text-muted-foreground">Defaults to your net worth</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-monthly-contribution">Monthly Contribution ({sym})</Label>
                    <MoneyInput
                      id="ret-monthly-contribution"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ret-pre-return">Pre-Retirement Return (%)</Label>
                    <Input id="ret-pre-return" type="number" step="0.1" value={preReturn} onChange={(e) => setPreReturn(e.target.value)} />
                  </div>
                </div>
              )}
              <Button onClick={handleCalculate} disabled={isLoading}>
                Calculate Retirement Plan
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Retirement analysis */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retirement Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="xt-label">Corpus Needed at Retirement</p>
                    <p className="mt-1 xt-metric text-foreground">{formatCurrency(result.corpusNeeded)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="xt-label">Projected Corpus at Retirement</p>
                    <p className="mt-1 xt-metric text-foreground">{formatCurrency(result.projectedCorpus)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="xt-label">Surplus / Shortfall</p>
                    <p className={cn("mt-1 text-xl font-bold", result.surplus >= 0 ? "text-brand" : "text-destructive")}>
                      {formatCurrency(result.surplus)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="xt-label">Years Corpus Will Last</p>
                    <p className="mt-1 xt-metric text-foreground">{result.yearsLast} years</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-muted-foreground mb-2">Corpus Depletion Curve</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="retirementCorpusFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-positive))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-positive))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...chartGrid} />
                        <XAxis
                          dataKey="year"
                          tickFormatter={(v) => `Yr ${v}`}
                          tick={chartTick}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={chartTick}
                          axisLine={false}
                          tickLine={false}
                          width={64}
                          tickFormatter={(v) => formatCurrency(v, { compact: true })}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Year ${label}`}
                          {...chartTooltip}
                        />
                        <Area
                          type="monotone"
                          dataKey="corpus"
                          name="Retirement corpus"
                          stroke="hsl(var(--chart-positive))"
                          fill="url(#retirementCorpusFill)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          name="Annual expenses"
                          stroke="hsl(var(--chart-negative))"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GiniLayout>
  );
}
