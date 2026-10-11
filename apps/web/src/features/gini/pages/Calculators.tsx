// Calculators page — port of features-incoming/gini/app.js's `calculators`
// module (~lines 4836-5001) into a React page. Free (no ProGate — the
// original's Pro list is Monte Carlo / Required Return / Family Planning /
// PDF reports only, see ../components/ProGate.tsx's header comment; EMI/
// SIP/Inflation are not on that list). Three independent, self-contained
// calculators in one page — EMI, SIP, Inflation — reproduced as shadcn
// `Tabs` (index.html's `.calc-select-card` buttons, ~1751-1792) instead of
// the original's plain nav-card + `.calc-panel` show/hide toggle.
//
// Formulas ported verbatim from app.js's `utils` module (~2661-2711):
//   - EMI: `calculateEMI(principal, rate, years)` — standard reducing-
//     balance EMI formula, `P * r * (1+r)^n / ((1+r)^n - 1)` where `r` is
//     the monthly rate and `n` the number of months (falls back to simple
//     `principal / months` when `rate === 0`).
//   - SIP: `calculateSIP(monthlyAmount, rate, years, timing)` — the same
//     annuity future-value factor RequiredReturn.tsx/MonteCarlo.tsx use
//     (`sipFVFactor`), with the same `'due'` (start-of-month) vs
//     `'ordinary'` (end-of-month) timing distinction.
//   - Inflation: `calculateFutureValue(pv, rate, years) = pv * (1 +
//     rate/100)^years`; "purchasing power retained" = `amount / futureValue
//     * 100` (app.js `calculators.calculateInflation`, ~4987-5000).
//
// Results are computed only when the user presses "Calculate" (matching the
// original's explicit "Calculate" button + hidden results section, app.js
// ~4899-5001 / index.html's `.calc-results[style="display: none"]`, and the
// other calculators on the site). The sliders edit a draft; Calculate copies
// it into `applied`, and the `useMemo` below reads only `applied`.
//
// SIP timing: same judgement call as RequiredReturn.tsx/MonteCarlo.tsx — no
// Gini settings store exists yet for the original's configurable
// `appState.settings.sipTiming`, so this hardcodes the original's own
// default ('due').
//
// Charts: EMI's "Principal vs Interest" and SIP's "Investment Growth"
// sub-headings (index.html ~1842-1846, ~1899-1904) are reproduced as
// recharts pie charts (matching NetWorth.tsx's established chart style via
// `@/components/ui/chart`) instead of the original's Chart.js pie/doughnut.
// Inflation has no chart in the original — none added here either.
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatFromInr } from "@/lib/region";
import { useMemo, useState } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Banknote, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import GiniLayout from "../components/GiniLayout";

// See header comment — mirrors app.js's own default (line 1675).
const SIP_TIMING: "due" | "ordinary" = "due";

const CHART_PALETTE = ["hsl(var(--chart-1))", "hsl(var(--chart-3))"];

// Amounts are in rupees and shown in the selected currency.
function formatCurrency(value: number) {
  return formatFromInr(value, { maxDecimals: 0 });
}

// calculators.formatSliderValue's currency branch (app.js ~4879-4884) for
// the two large-rupee sliders (loan amount / current amount); SIP's
// "monthly investment" slider uses full currency formatting, matching the
// original's own branch split.
function formatCompact(value: number) {
  return formatFromInr(value, { compact: true });
}

function formatPercent(value: number, decimals = 1) {
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

// utils.calculateEMI (app.js ~2691-2696)
function calculateEMI(principal: number, rate: number, years: number) {
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function SliderField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold text-primary">{displayValue}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

function CalculateButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" className="w-full" onClick={onClick}>
      Calculate
    </Button>
  );
}

function ResultTile({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={className ? `mt-1 text-xl font-bold ${className}` : "mt-1 text-xl font-bold"}>{value}</p>
    </div>
  );
}

function BreakdownPie({ config, data }: { config: ChartConfig; data: { name: string; value: number }[] }) {
  return (
    <ChartContainer config={config} className="h-[220px] w-full">
      <PieChart>
        <ChartTooltip content={(props: any) => <ChartTooltipContent {...props} nameKey="name" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} strokeWidth={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// EMI Calculator (index.html #emiCalculatorPanel, ~1795-1849)
// ─────────────────────────────────────────────────────────────────────────
function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(15);

  const [applied, setApplied] = useState<{ loanAmount: number; rate: number; tenure: number } | null>(null);

  const result = useMemo(() => {
    if (!applied) return null;
    const emi = calculateEMI(applied.loanAmount, applied.rate, applied.tenure);
    const totalAmount = emi * applied.tenure * 12;
    const totalInterest = totalAmount - applied.loanAmount;
    return { emi, totalAmount, totalInterest, loanAmount: applied.loanAmount };
  }, [applied]);

  const chartConfig: ChartConfig = {
    Principal: { label: "Principal", color: CHART_PALETTE[0] },
    Interest: { label: "Interest", color: CHART_PALETTE[1] },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>EMI Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SliderField
            label="Loan Amount"
            value={loanAmount}
            displayValue={formatCompact(loanAmount)}
            min={100000}
            max={50000000}
            step={100000}
            onChange={setLoanAmount}
          />
          <SliderField
            label="Interest Rate (% per annum)"
            value={rate}
            displayValue={formatPercent(rate)}
            min={4}
            max={20}
            step={0.1}
            onChange={setRate}
          />
          <SliderField
            label="Tenure"
            value={tenure}
            displayValue={`${Math.round(tenure)} Yr`}
            min={1}
            max={35}
            step={1}
            onChange={setTenure}
          />
        </div>

        <CalculateButton onClick={() => setApplied({ loanAmount, rate, tenure })} />

        {result ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultTile label="Monthly EMI" value={formatCurrency(result.emi)} className="text-primary" />
              <ResultTile label="Total Interest" value={formatCurrency(result.totalInterest)} />
              <ResultTile label="Total Amount" value={formatCurrency(result.totalAmount)} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Principal vs Interest</h4>
              <BreakdownPie
                config={chartConfig}
                data={[
                  { name: "Principal", value: result.loanAmount },
                  { name: "Interest", value: Math.max(result.totalInterest, 0) },
                ]}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Set your values and press Calculate to see the result.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SIP Calculator (index.html #sipCalculatorPanel, ~1852-1906)
// ─────────────────────────────────────────────────────────────────────────
function SIPCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [returnRate, setReturnRate] = useState(12);
  const [period, setPeriod] = useState(20);

  const [applied, setApplied] = useState<{ monthly: number; returnRate: number; period: number } | null>(null);

  const result = useMemo(() => {
    if (!applied) return null;
    const maturityValue = calculateSIP(applied.monthly, applied.returnRate, applied.period, SIP_TIMING);
    const invested = applied.monthly * 12 * applied.period;
    const returns = maturityValue - invested;
    return { maturityValue, invested, returns };
  }, [applied]);

  const chartConfig: ChartConfig = {
    Invested: { label: "Invested Amount", color: CHART_PALETTE[0] },
    Returns: { label: "Returns", color: CHART_PALETTE[1] },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIP Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SliderField
            label="Monthly Investment"
            value={monthly}
            displayValue={formatCurrency(monthly)}
            min={1000}
            max={200000}
            step={1000}
            onChange={setMonthly}
          />
          <SliderField
            label="Expected Return (% per annum)"
            value={returnRate}
            displayValue={formatPercent(returnRate)}
            min={4}
            max={25}
            step={0.1}
            onChange={setReturnRate}
          />
          <SliderField
            label="Investment Period"
            value={period}
            displayValue={`${Math.round(period)} Yr`}
            min={1}
            max={40}
            step={1}
            onChange={setPeriod}
          />
        </div>

        <CalculateButton onClick={() => setApplied({ monthly, returnRate, period })} />

        {result ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultTile label="Total Invested" value={formatCurrency(result.invested)} />
              <ResultTile label="Expected Returns" value={formatCurrency(result.returns)} className="text-success" />
              <ResultTile label="Maturity Value" value={formatCurrency(result.maturityValue)} className="text-primary" />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Investment Growth</h4>
              <BreakdownPie
                config={chartConfig}
                data={[
                  { name: "Invested", value: result.invested },
                  { name: "Returns", value: Math.max(result.returns, 0) },
                ]}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Set your values and press Calculate to see the result.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Inflation Impact Calculator (index.html #inflationCalculatorPanel,
// ~1909-1957) — no chart in the original, none added here.
// ─────────────────────────────────────────────────────────────────────────
function InflationCalculator() {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(7);

  const [applied, setApplied] = useState<{ amount: number; years: number; rate: number } | null>(null);

  const result = useMemo(() => {
    if (!applied) return null;
    const futureValue = calculateFutureValue(applied.amount, applied.rate, applied.years);
    const loss = futureValue - applied.amount;
    const retained = futureValue !== 0 ? (applied.amount / futureValue) * 100 : 0;
    return { futureValue, loss, retained };
  }, [applied]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inflation Impact Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SliderField
            label="Current Amount"
            value={amount}
            displayValue={formatCompact(amount)}
            min={10000}
            max={10000000}
            step={10000}
            onChange={setAmount}
          />
          <SliderField
            label="Years"
            value={years}
            displayValue={`${Math.round(years)} Yr`}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
          />
          <SliderField
            label="Inflation Rate"
            value={rate}
            displayValue={formatPercent(rate)}
            min={1}
            max={15}
            step={0.1}
            onChange={setRate}
          />
        </div>

        <CalculateButton onClick={() => setApplied({ amount, years, rate })} />

        {result ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ResultTile label="Future Value Needed" value={formatCurrency(result.futureValue)} className="text-primary" />
            <ResultTile label="Purchasing Power Loss" value={formatCurrency(result.loss)} className="text-destructive" />
            <ResultTile label="Purchasing Power Retained" value={formatPercent(result.retained)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Set your values and press Calculate to see the result.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Calculators() {
  // Re-render in the new currency when it changes (the calculators below format with it).
  useCurrency();
  return (
    <GiniLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial Calculators</h1>
          <p className="text-sm text-muted-foreground">Quick calculation tools for EMI, SIP, and inflation</p>
        </div>

        <Tabs defaultValue="emi">
          <TabsList>
            <TabsTrigger value="emi" className="gap-1.5">
              <Banknote className="h-4 w-4" />
              EMI
            </TabsTrigger>
            <TabsTrigger value="sip" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              SIP
            </TabsTrigger>
            <TabsTrigger value="inflation" className="gap-1.5">
              <Percent className="h-4 w-4" />
              Inflation
            </TabsTrigger>
          </TabsList>
          <TabsContent value="emi">
            <EMICalculator />
          </TabsContent>
          <TabsContent value="sip">
            <SIPCalculator />
          </TabsContent>
          <TabsContent value="inflation">
            <InflationCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </GiniLayout>
  );
}
