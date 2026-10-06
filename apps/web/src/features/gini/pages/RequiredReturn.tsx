// Required Return page — port of features-incoming/gini/app.js's
// `requiredReturn` module (~lines 4255-4405) into a React page. Computes the
// annual return rate a household needs to hit ALL of its goals' inflated
// future cost, given current savings / monthly contribution / an "expected"
// return, using the same Newton-Raphson root-find the original used (solving
// for the rate `r` that makes `SIP(pmt, r, years) + FV(pv, r, years) == fv`
// — there is no closed form for `r` here, hence the iterative search).
//
// Formulas ported verbatim from app.js's `utils` module (~lines 2661-2711):
//   - `calculateFutureValue(pv, rate, years) = pv * (1 + rate/100) ^ years`
//   - `sipFVFactor(monthlyRate, months, timing)` — the annuity future-value
//     factor, `((1+r)^n - 1) / r`, multiplied by `(1+r)` for annuity-due
//     (contribution at the START of the month) vs annuity-ordinary (end of
//     month).
//   - `calculateSIP(monthlyAmount, rate, years, timing) = monthlyAmount *
//     sipFVFactor(...)`.
//   - `findRequiredReturn` (app.js ~4361-4404): Newton-Raphson starting at
//     rate=12%, tolerance 0.001, max 100 iterations, numerical derivative
//     via a +0.01 rate bump, each step clamped to [0, 50]%.
//
// SIP timing: the original reads `appState.settings.sipTiming`, a
// user-configurable setting (app.js line 1675) defaulting to `'due'`
// (start-of-month contributions) — no settings page/store exists yet in
// this React port (out of this task's scope), so this file hardcodes the
// same default ('due') rather than re-adding a settings concept. If a
// future phase adds a Gini settings store, this should read from it instead.
//
// Data seeding: `api.goals.getGoals()` supplies the actual goal list the
// calculation needs (current_cost/target_year/inflation — this is NOT
// optional seeding, the original's calculation itself is driven entirely by
// `appState.goals`). `api.assets.getAssets()` seeds the "Current Total
// Savings" slider's default from the sum of the user's real asset values
// (a judgement call — the original always defaulted this slider to a fixed
// ₹10L regardless of the user's data; seeding it for a logged-in user with
// real assets is more useful and is explicitly invited by the task brief).
//
// Pro gating: ../store/useGiniPlanStore.ts + ../components/ProGate.tsx,
// per that store/component's own header comments — the static page
// title/subtitle render outside the gate, only the slider inputs +
// calculate button + results render inside it.
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Percent, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "../lib/api";
import GiniLayout from "../components/GiniLayout";
import ProGate from "../components/ProGate";
import { useGiniPlanStore } from "../store/useGiniPlanStore";
import { investableAssets } from "../lib/investable";

// See header comment — no Gini settings store exists yet, so this mirrors
// app.js's own default (line 1675: `sipTiming: 'due'`).
const SIP_TIMING: "due" | "ordinary" = "due";

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
      value
    );
  } catch {
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  }
}

// Verbatim from app.js's `requiredReturn.formatSliderValue` (~4271-4275)
// for the two rupee sliders (percent slider uses `formatPercent` below).
function formatCompact(value: number) {
  return value >= 1e7 ? `₹${(value / 1e7).toFixed(2)} Cr` : `₹${(value / 1e5).toFixed(2)} L`;
}

function formatPercent(value: number, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

// utils.calculateFutureValue (app.js ~2672-2674)
function calculateFutureValue(pv: number, rate: number, years: number) {
  return pv * Math.pow(1 + rate / 100, years);
}

// utils.sipFVFactor (app.js ~2677-2682)
function sipFVFactor(monthlyRate: number, months: number, timing: "due" | "ordinary") {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return months;
  const base = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return timing === "due" ? base * (1 + monthlyRate) : base;
}

// utils.calculateSIP (app.js ~2684-2689)
function calculateSIP(monthlyAmount: number, rate: number, years: number, timing: "due" | "ordinary") {
  const monthlyRate = rate / 12 / 100;
  const months = Math.max(0, Math.floor(years * 12));
  return monthlyAmount * sipFVFactor(monthlyRate, months, timing);
}

// requiredReturn.findRequiredReturn (app.js ~4361-4404) — Newton-Raphson
// search for the annual rate that makes SIP(pmt) + FV(pv) hit `fv` in
// `years`, ported verbatim including its iteration/derivative/clamp
// constants.
function findRequiredReturn(pv: number, pmt: number, fv: number, years: number): number {
  let rate = 12;
  const tolerance = 0.001;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    const factor = sipFVFactor(monthlyRate, months, SIP_TIMING);
    const sipValue = pmt * factor;
    const pvValue = pv * Math.pow(1 + rate / 100, years);
    const totalValue = sipValue + pvValue;

    const error = totalValue - fv;
    if (Math.abs(error) < tolerance) return rate;

    const delta = 0.01;
    const monthlyRate2 = (rate + delta) / 12 / 100;
    const factor2 = sipFVFactor(monthlyRate2, months, SIP_TIMING);
    const sipValue2 = pmt * factor2;
    const pvValue2 = pv * Math.pow(1 + (rate + delta) / 100, years);
    const totalValue2 = sipValue2 + pvValue2;

    const derivative = (totalValue2 - totalValue) / delta;
    if (Math.abs(derivative) < 1e-9) {
      rate += delta;
      continue;
    }

    rate = rate - error / derivative;
    rate = Math.max(0, Math.min(50, rate));
  }

  return rate;
}

type Feasibility = "achievable" | "challenging" | "difficult";

interface RRResults {
  totalNeeded: number;
  projectedCorpus: number;
  requiredReturnRate: number;
  gap: number;
  feasibility: Feasibility;
  label: string;
  recommendations: string[];
}

// requiredReturn.calculate's feasibility bucketing + copy (app.js
// ~4327-4351), ported verbatim.
function assessFeasibility(requiredReturnRate: number): { feasibility: Feasibility; label: string; recommendations: string[] } {
  if (requiredReturnRate < 12) {
    return {
      feasibility: "achievable",
      label: "Achievable — Your goals are realistic",
      recommendations: [
        "Your goals are on track with a reasonable return expectation",
        "Consider diversifying across equity mutual funds and index funds",
        "Maintain discipline in your monthly investments",
      ],
    };
  }
  if (requiredReturnRate < 18) {
    return {
      feasibility: "challenging",
      label: "Challenging — Requires aggressive strategy",
      recommendations: [
        "Your goals require an aggressive investment approach",
        "Consider increasing your monthly contributions",
        "Focus on high-growth equity investments",
        "Review and prioritize your goals",
      ],
    };
  }
  return {
    feasibility: "difficult",
    label: "Very Difficult — Goals need adjustment",
    recommendations: [
      "Required return is very high and risky to achieve",
      "Consider extending goal timelines",
      "Significantly increase monthly contributions",
      "Re-evaluate goal priorities and costs",
      "Consider partial funding of lower priority goals",
    ],
  };
}

const FEASIBILITY_STYLES: Record<Feasibility, { icon: typeof CheckCircle2; className: string }> = {
  achievable: { icon: CheckCircle2, className: "text-success" },
  challenging: { icon: AlertTriangle, className: "text-warning" },
  difficult: { icon: XCircle, className: "text-destructive" },
};

export default function RequiredReturn() {
  const { isPro, fetched, fetchPlan } = useGiniPlanStore();
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const goalsQuery = useQuery({ queryKey: ["gini", "goals"], queryFn: api.goals.getGoals });
  const assetsQuery = useQuery({ queryKey: ["gini", "assets"], queryFn: api.assets.getAssets });
  const goals = goalsQuery.data || [];

  const [currentSavings, setCurrentSavings] = useState(1000000);
  const [monthlyContribution, setMonthlyContribution] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [seeded, setSeeded] = useState(false);
  const [results, setResults] = useState<RRResults | null>(null);

  // Seed "Current Total Savings" from the user's real assets once, the
  // first time the assets query resolves — see header comment.
  useEffect(() => {
    if (!seeded && assetsQuery.data) {
      const total = investableAssets(assetsQuery.data);
      if (total > 0) setCurrentSavings(total);
      setSeeded(true);
    }
  }, [assetsQuery.data, seeded]);

  const hasFutureGoals = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return goals.some((g) => (g.target_year ?? currentYear) - currentYear > 0);
  }, [goals]);

  function handleCalculate() {
    // requiredReturn.calculate (app.js ~4286-4358), ported verbatim.
    const currentYear = new Date().getFullYear();

    let totalNeeded = 0;
    goals.forEach((goal) => {
      const yearsRemaining = (goal.target_year ?? currentYear) - currentYear;
      if (yearsRemaining > 0) {
        totalNeeded += calculateFutureValue(goal.current_cost, goal.inflation ?? 7, yearsRemaining);
      }
    });

    if (totalNeeded === 0) {
      toast.error("Add a goal with a future target year first — see the Goals page");
      return;
    }

    const maxYears = Math.max(...goals.map((g) => (g.target_year ?? currentYear) - currentYear));

    const projectedCorpus =
      calculateSIP(monthlyContribution, expectedReturn, maxYears, SIP_TIMING) +
      calculateFutureValue(currentSavings, expectedReturn, maxYears);

    const requiredReturnRate = findRequiredReturn(currentSavings, monthlyContribution, totalNeeded, maxYears);
    const gap = requiredReturnRate - expectedReturn;
    const { feasibility, label, recommendations } = assessFeasibility(requiredReturnRate);

    setResults({ totalNeeded, projectedCorpus, requiredReturnRate, gap, feasibility, label, recommendations });
  }

  const feasibilityStyle = results ? FEASIBILITY_STYLES[results.feasibility] : null;
  const FeasibilityIcon = feasibilityStyle?.icon;

  return (
    <GiniLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Required Return Calculator</h1>
          <p className="text-sm text-muted-foreground">Determine the return needed to achieve all your goals</p>
        </div>

        <ProGate feature="Required Return Analysis" isPro={isPro()} loading={!fetched}>
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Percent className="h-5 w-5 text-primary" />
                <CardTitle>Current Situation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {goalsQuery.isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : !hasFutureGoals ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    You don't have any goals with a future target year yet. Add one on the Goals page, then come
                    back here to calculate your required return.
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Calculated across {goals.length} goal{goals.length === 1 ? "" : "s"} on your Goals page.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Total Savings</span>
                      <span className="text-sm font-semibold text-primary">{formatCompact(currentSavings)}</span>
                    </div>
                    <Slider
                      value={[currentSavings]}
                      min={0}
                      max={50000000}
                      step={100000}
                      onValueChange={(v) => setCurrentSavings(v[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹0</span>
                      <span>₹5 Cr</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Starts from your investable assets (property and insurance not included).</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Contribution</span>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(monthlyContribution)}</span>
                    </div>
                    <Slider
                      value={[monthlyContribution]}
                      min={0}
                      max={1000000}
                      step={5000}
                      onValueChange={(v) => setMonthlyContribution(v[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹0</span>
                      <span>₹10 L</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expected Annual Return</span>
                      <span className="text-sm font-semibold text-primary">{formatPercent(expectedReturn, 1)}</span>
                    </div>
                    <Slider
                      value={[expectedReturn]}
                      min={0}
                      max={30}
                      step={0.5}
                      onValueChange={(v) => setExpectedReturn(v[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>30%</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCalculate} disabled={goalsQuery.isLoading}>
                  Calculate Required Return
                </Button>
              </CardContent>
            </Card>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total Future Corpus Needed
                      </p>
                      <p className="mt-1 text-xl font-bold">{formatCurrency(results.totalNeeded)}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Projected Corpus (at expected return)
                      </p>
                      <p className="mt-1 text-xl font-bold">{formatCurrency(results.projectedCorpus)}</p>
                    </div>
                    <div className="rounded-lg border-2 border-primary/30 bg-accent p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Required Annual Return
                      </p>
                      <p className="mt-1 text-xl font-bold text-primary">{formatPercent(results.requiredReturnRate)}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gap</p>
                      <p className={cn("mt-1 text-xl font-bold", results.gap > 0 ? "text-destructive" : "text-success")}>
                        {results.gap > 0 ? "+" : ""}
                        {formatPercent(results.gap)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-4",
                      results.feasibility === "achievable" && "border-success/30 bg-success/10",
                      results.feasibility === "challenging" && "border-warning/30 bg-warning/10",
                      results.feasibility === "difficult" && "border-destructive/30 bg-destructive/10"
                    )}
                  >
                    {FeasibilityIcon && <FeasibilityIcon className={cn("h-5 w-5 shrink-0", feasibilityStyle!.className)} />}
                    <span className={cn("text-sm font-semibold", feasibilityStyle!.className)}>{results.label}</span>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Recommendations</h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                      {results.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
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
