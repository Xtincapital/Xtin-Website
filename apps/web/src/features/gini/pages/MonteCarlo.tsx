// Monte Carlo page — port of features-incoming/gini/app.js's `monteCarlo`
// module (~lines 4408-4636) into a React page. Runs a client-side Monte
// Carlo simulation over portfolio returns (same as the original — no
// backend involved, everything below executes in the browser) to estimate
// the probability of a corpus reaching a target amount.
//
// Simulation logic ported verbatim from `monteCarlo.runSimulation`
// (app.js ~4417-4507):
//   - Trial count: user-configurable `Number of Simulations` input, default
//     1000, HARD-CAPPED at 10,000 (`maxSimulations`, app.js ~4428-4432 —
//     "prevent UI freeze") — values above the cap are silently clamped down,
//     exactly like the original.
//   - Two independent toggles (both default ON):
//     - "Use monthly steps" — monthly-step simulation (240 steps for a
//       20-year run) vs. a coarser annual-step fallback.
//     - "Use lognormal returns (GBM)" — geometric Brownian motion
//       (lognormal monthly return draws) vs. simple arithmetic-normal
//       monthly/annual return draws.
//   - Random draws: `utils.normalRandom` (app.js ~2706-2711), a Box-Muller
//     transform (`sqrt(-2 ln u) * cos(2π v)` on two `Math.random()` draws) —
//     ported verbatim below as `normalRandom()`.
//   - Monthly-step path (`useMonthlySteps === true`): annual mean/vol are
//     converted to monthly parameters — `muM = ln(1+muA)/12` (lognormal) or
//     `muA/12` (arithmetic), `sigmaM = sigmaA / sqrt(12)`. Each month draws
//     `z ~ N(0,1)` and applies a growth factor: lognormal uses
//     `exp(muM - 0.5*sigmaM² + sigmaM*z)` (standard GBM log-return factor);
//     arithmetic uses `1 + muM + sigmaM*z`. Contribution timing follows the
//     same `sipTiming` convention as Required Return — `'due'` (contribute
//     at the start of the month, i.e. `corpus = (corpus + monthly) *
//     factor`) vs `'ordinary'` (`corpus = corpus*factor + monthly`).
//   - Annual-step fallback (`useMonthlySteps === false`): one draw per year,
//     `r = meanReturn/100 + (volatility/100)*z`, `corpus = corpus*(1+r) +
//     monthly*12`.
//   - Statistics: results sorted ascending; median = 50th-percentile index,
//     "best case" = 90th percentile, "worst case" = 10th percentile,
//     probability of success = (# trials >= target) / trials * 100.
//
// SIP timing: same judgement call as RequiredReturn.tsx — no Gini settings
// store exists yet for the original's configurable `appState.settings.
// sipTiming`, so this hardcodes the original's own default ('due').
//
// Data seeding: `api.goals.getGoals()` / `api.assets.getAssets()` seed
// sensible defaults — Initial Amount from the sum of real asset values,
// Target Goal Amount and Years to Goal from the same "total needed across
// all future goals" / "max years across goals" calculation Required Return
// uses — rather than the original's fixed placeholders (₹10L initial, ₹1Cr
// target, 20 years), which never reflected the signed-in user's own data.
//
// Pro gating: same ProGate/useGiniPlanStore wiring as RequiredReturn.tsx.
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatFromInr } from "@/lib/region";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { chartGrid, chartTick, chartBarRadius, chartMaxBarSize } from "@/components/charts/chartTheme";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MoneyInput from "@/components/MoneyInput";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { api } from "../lib/api";
import GiniLayout from "../components/GiniLayout";
import PageHeader from "../components/PageHeader";
import { ScoreRing } from "../components/GiniCharts";
import RollingNumber from "@/components/motion/RollingNumber";
import ProGate from "../components/ProGate";
import { useGiniPlanStore } from "../store/useGiniPlanStore";
import { investableAssets } from "../lib/investable";

// See header comment — mirrors app.js's own default (line 1675).
const SIP_TIMING: "due" | "ordinary" = "due";

// Hard cap from app.js's `runSimulation` (~4428).
const MAX_SIMULATIONS = 10000;
const HISTOGRAM_BINS = 20;

// Amounts are in rupees and shown in the selected currency.
function formatCurrency(value: number) {
  return formatFromInr(value, { maxDecimals: 0 });
}

// monteCarlo.fmt (app.js ~4413).
function formatCompact(value: number) {
  return formatFromInr(value, { compact: true });
}

// utils.calculateFutureValue (app.js ~2672-2674) — used only for seeding
// defaults from the user's real goals, same as RequiredReturn.tsx.
function calculateFutureValue(pv: number, rate: number, years: number) {
  return pv * Math.pow(1 + rate / 100, years);
}

// utils.normalRandom (app.js ~2706-2711) — Box-Muller transform.
function normalRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

interface MCResults {
  probability: number;
  median: number;
  best: number;
  worst: number;
  target: number;
  histogram: { label: string; count: number; start: number }[];
}

// monteCarlo.runSimulation + renderDistribution's histogram binning
// (app.js ~4417-4538), ported verbatim, with one deliberate fix: the
// original divides by `binSize = (max - min) / bins`, which is 0 (and
// silently corrupts the chart via `histogram[NaN]++`) whenever every trial
// lands on the exact same corpus (e.g. volatility = 0). This port detects
// that and returns a single bin instead of dividing by zero.
function runMonteCarloSimulation(params: {
  initial: number;
  monthly: number;
  years: number;
  meanReturn: number;
  volatility: number;
  target: number;
  simulations: number;
  useMonthlySteps: boolean;
  useLognormal: boolean;
}): MCResults {
  const { initial, monthly, years, meanReturn, volatility, target, useMonthlySteps, useLognormal } = params;
  let simulations = params.simulations;

  if (simulations > MAX_SIMULATIONS) {
    simulations = MAX_SIMULATIONS;
  }

  if (!Number.isFinite(initial) || initial < 0) throw new Error("Invalid initial amount");
  if (!Number.isFinite(monthly) || monthly < 0) throw new Error("Invalid monthly amount");
  if (!Number.isFinite(years) || years <= 0) throw new Error("Invalid years");
  if (!Number.isFinite(meanReturn) || meanReturn < -50 || meanReturn > 100)
    throw new Error("Invalid mean return (should be -50 to 100%)");
  if (!Number.isFinite(volatility) || volatility < 0 || volatility > 100) throw new Error("Invalid volatility");
  if (!Number.isFinite(target) || target < 0) throw new Error("Invalid target");
  if (!Number.isFinite(simulations) || simulations <= 0) throw new Error("Invalid simulation count");

  const results: number[] = [];

  if (useMonthlySteps) {
    const muA = meanReturn / 100;
    const sigmaA = volatility / 100;
    const muM = useLognormal ? Math.log(1 + muA) / 12 : muA / 12;
    const sigmaM = sigmaA / Math.sqrt(12);
    const months = years * 12;

    for (let sim = 0; sim < simulations; sim++) {
      let corpus = initial;
      for (let m = 0; m < months; m++) {
        const z = normalRandom();
        const factor = useLognormal
          ? Math.exp(muM - 0.5 * sigmaM * sigmaM + sigmaM * z)
          : 1 + muM + sigmaM * z;
        if (SIP_TIMING === "due") {
          corpus = (corpus + monthly) * factor;
        } else {
          corpus = corpus * factor + monthly;
        }
      }
      results.push(corpus);
    }
  } else {
    for (let sim = 0; sim < simulations; sim++) {
      let corpus = initial;
      for (let year = 0; year < years; year++) {
        const z = normalRandom();
        const r = meanReturn / 100 + (volatility / 100) * z;
        corpus = corpus * (1 + r) + monthly * 12;
      }
      results.push(corpus);
    }
  }

  results.sort((a, b) => a - b);

  const median = results[Math.floor(results.length / 2)];
  const percentile10 = results[Math.floor(results.length * 0.1)];
  const percentile90 = results[Math.floor(results.length * 0.9)];
  const successCount = results.filter((r) => r >= target).length;
  const probability = (successCount / simulations) * 100;

  const min = results[0];
  const max = results[results.length - 1];
  const binSize = (max - min) / HISTOGRAM_BINS;

  let histogram: { label: string; count: number; start: number }[];
  if (!Number.isFinite(binSize) || binSize === 0) {
    // See header comment — every trial landed on (near) the same value.
    histogram = [{ label: formatCompact(min), count: results.length, start: min }];
  } else {
    const bins = new Array(HISTOGRAM_BINS).fill(0);
    results.forEach((value) => {
      const idx = Math.min(Math.floor((value - min) / binSize), HISTOGRAM_BINS - 1);
      bins[idx]++;
    });
    histogram = bins.map((count, i) => ({ label: formatCompact(min + i * binSize), count, start: min + i * binSize }));
  }

  return { probability, median, best: percentile90, worst: percentile10, target, histogram };
}

const chartConfig: ChartConfig = {
  count: { label: "Simulations", color: "hsl(var(--chart-1))" },
};

export default function MonteCarlo() {
  // Re-render in the new currency when it changes.
  const { symbol } = useCurrency();
  const sym = symbol.trim();
  const { isPro, fetched, fetchPlan } = useGiniPlanStore();
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const goalsQuery = useQuery({ queryKey: ["gini", "goals"], queryFn: api.goals.getGoals });
  const assetsQuery = useQuery({ queryKey: ["gini", "assets"], queryFn: api.assets.getAssets });

  const [initial, setInitial] = useState(1000000);
  const [monthly, setMonthly] = useState(50000);
  const [years, setYears] = useState(20);
  const [meanReturn, setMeanReturn] = useState(12);
  const [volatility, setVolatility] = useState(15);
  const [target, setTarget] = useState(10000000);
  const [simulations, setSimulations] = useState(1000);
  const [useMonthlySteps, setUseMonthlySteps] = useState(true);
  const [useLognormal, setUseLognormal] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<MCResults | null>(null);

  // Seed Initial Amount / Target / Years from the user's real assets and
  // goals once, the first time both queries resolve — see header comment.
  useEffect(() => {
    if (seeded || !assetsQuery.data || !goalsQuery.data) return;

    const totalAssets = investableAssets(assetsQuery.data);
    if (totalAssets > 0) setInitial(totalAssets);

    const currentYear = new Date().getFullYear();
    let totalNeeded = 0;
    let maxYears = 0;
    goalsQuery.data.forEach((g) => {
      const yearsRemaining = (g.target_year ?? currentYear) - currentYear;
      if (yearsRemaining > 0) {
        totalNeeded += calculateFutureValue(g.current_cost, g.inflation ?? 7, yearsRemaining);
        maxYears = Math.max(maxYears, yearsRemaining);
      }
    });
    if (totalNeeded > 0) setTarget(totalNeeded);
    if (maxYears > 0) setYears(maxYears);

    setSeeded(true);
  }, [assetsQuery.data, goalsQuery.data, seeded]);

  const loadingSeed = goalsQuery.isLoading || assetsQuery.isLoading;

  function handleRun() {
    setRunning(true);
    // Defer to the next tick so the "Running..." state paints before the
    // (synchronous, potentially several-hundred-ms) simulation loop runs —
    // the original blocked the UI thread outright for the same computation.
    setTimeout(() => {
      try {
        const result = runMonteCarloSimulation({
          initial,
          monthly,
          years,
          meanReturn,
          volatility,
          target,
          simulations,
          useMonthlySteps,
          useLognormal,
        });
        setResults(result);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error running simulation");
      } finally {
        setRunning(false);
      }
    }, 0);
  }

  const cappedSimulations = simulations > MAX_SIMULATIONS;

  return (
    <GiniLayout>
      <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader title="Monte Carlo Simulation" subtitle="Analyze probability of achieving your goals" pro />

        <ProGate feature="Monte Carlo Simulations" isPro={isPro()} loading={!fetched}>
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Dices className="h-5 w-5 text-brand" />
                <CardTitle>Simulation Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSeed ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Initial amount, target and years start from your investable assets (property and insurance not included) and goals. Change them freely.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-initial">Initial Amount ({sym})</Label>
                    <MoneyInput
                      id="mc-initial"
                      type="number"
                      min={0}
                      value={initial}
                      onChange={(e) => setInitial(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-monthly">Monthly Contribution ({sym})</Label>
                    <MoneyInput
                      id="mc-monthly"
                      type="number"
                      min={0}
                      value={monthly}
                      onChange={(e) => setMonthly(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-years">Years to Goal</Label>
                    <Input
                      id="mc-years"
                      type="number"
                      min={1}
                      value={years}
                      onChange={(e) => setYears(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-mean">Expected Return - Mean (%)</Label>
                    <Input
                      id="mc-mean"
                      type="number"
                      step="0.1"
                      value={meanReturn}
                      onChange={(e) => setMeanReturn(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-vol">Return Volatility - Std Dev (%)</Label>
                    <Input
                      id="mc-vol"
                      type="number"
                      step="0.1"
                      min={0}
                      value={volatility}
                      onChange={(e) => setVolatility(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-target">Target Goal Amount ({sym})</Label>
                    <MoneyInput
                      id="mc-target"
                      type="number"
                      min={0}
                      value={target}
                      onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mc-sims">Number of Simulations</Label>
                    <Input
                      id="mc-sims"
                      type="number"
                      min={100}
                      max={MAX_SIMULATIONS}
                      value={simulations}
                      onChange={(e) => setSimulations(parseInt(e.target.value, 10) || 0)}
                    />
                    {cappedSimulations && (
                      <p className="text-xs text-muted-foreground">Capped at {MAX_SIMULATIONS.toLocaleString()} to keep the browser responsive.</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                  <div className="flex items-center gap-2">
                    <Switch id="mc-monthly-steps" checked={useMonthlySteps} onCheckedChange={setUseMonthlySteps} />
                    <Label htmlFor="mc-monthly-steps" className="cursor-pointer font-normal">
                      Use monthly steps (more accurate)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="mc-lognormal" checked={useLognormal} onCheckedChange={setUseLognormal} />
                    <Label htmlFor="mc-lognormal" className="cursor-pointer font-normal">
                      Use lognormal returns (GBM)
                    </Label>
                  </div>
                </div>

                <Button onClick={handleRun} disabled={running}>
                  {running ? "Running simulation..." : "Run Simulation"}
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-line bg-brand-soft p-4">
                      <div>
                        <p className="xt-label">Probability of Success</p>
                        <p className="mt-1 xt-metric text-brand">
                          <RollingNumber value={`${results.probability.toFixed(1)}%`} />
                        </p>
                      </div>
                      <ScoreRing value={results.probability} size={48} />
                    </div>
                    <div className="rounded-2xl border bg-secondary/40 p-4">
                      <p className="xt-label">Median Outcome</p>
                      <p className="mt-1 xt-metric">{formatCompact(results.median)}</p>
                    </div>
                    <div className="rounded-2xl border bg-secondary/40 p-4">
                      <p className="xt-label">
                        Best Case (90th %ile)
                      </p>
                      <p className="mt-1 xt-metric text-brand">{formatCompact(results.best)}</p>
                    </div>
                    <div className="rounded-2xl border bg-secondary/40 p-4">
                      <p className="xt-label">
                        Worst Case (10th %ile)
                      </p>
                      <p className="mt-1 xt-metric text-destructive">{formatCompact(results.worst)}</p>
                    </div>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Target: <b className="font-semibold text-foreground tabular-nums">{formatCurrency(results.target)}</b></span>
                    <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-brand-fill" />Reaches target</span>
                    <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-[var(--pro-gold)]" />Falls short</span>
                  </p>

                  <div>
                    <h4 className="mb-2 text-base font-semibold text-muted-foreground">Outcome Distribution</h4>
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                      <BarChart data={results.histogram}>
                        <CartesianGrid {...chartGrid} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                          tick={chartTick}
                        />
                        <YAxis tickLine={false} axisLine={false} width={40} />
                        <ChartTooltip content={(props: any) => <ChartTooltipContent {...props} hideLabel />} />
                        <Bar dataKey="count" radius={chartBarRadius} maxBarSize={chartMaxBarSize}>
                          {results.histogram.map((bin) => (
                            <Cell key={bin.label} fill={bin.start >= results.target ? "hsl(var(--chart-1))" : "var(--pro-gold)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ProGate>
      </div>
    </GiniLayout>
  );
}
