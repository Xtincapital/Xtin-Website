// Family Planning page — FREE (no Pro-gating), rewrite of
// features-incoming/gini/index.html's `family-planning-tab` div
// (~lines 1961-2328) and its backing `familyPlanning` module in
// features-incoming/gini/app.js (~lines 5123-5497) into a React page.
//
// Every calculator below is ported formula-for-formula from `familyPlanning`
// (see each section's comment for the exact app.js line range) using the
// same `utils.calculateFutureValue` / `utils.calculateSIP` /
// `utils.calculateRequiredSIP` / `utils.sipFVFactor` helpers RequiredReturn.tsx
// already ported (app.js ~2661-2711) — duplicated here rather than imported
// since neither page exports them and this task's scope is these two files
// only.
//
// Real data vs. the original's local-only state:
//   - The original's "Family Profile" section (marital status / planning to
//     have children / expected children) is a form that only ever shows an
//     `alert()` on submit — there is no `gini_*` column backing any of those
//     fields, so persisting them isn't possible here. Reproduced instead as
//     a read-only "Family Snapshot" computed from real
//     `api.familyMembers.getFamilyMembers()` data (marital status inferred
//     from a Spouse/Partner member existing, children from `relationship ===
//     'Child'`) — see header comment on `FamilySnapshotCard` below.
//   - The original's "Comprehensive Education Planning" section used a
//     purely local, never-persisted `familyPlanning.state.children` array
//     (added via "+ Add Child", app.js `addChildEducation`) with made-up
//     ages — this page instead seeds that same per-stage-cost calculator
//     from the user's REAL children (`api.familyMembers.getFamilyMembers()`
//     filtered to `relationship === 'Child'`, using their real `age`), fully
//     satisfying this task's brief to use family members "for dependents/
//     children ages". The per-stage cost inputs themselves (preschool/
//     primary/secondary/higher-secondary/undergraduate/postgraduate ₹) have
//     no backing column either — kept as local, per-child editable state
//     (same non-persisted nature as the original), defaulting to the
//     original's own `addChildEducation` defaults.
//   - `api.goals.getGoals()` is NOT used on this page — confirmed by reading
//     the full `familyPlanning` module (app.js ~5123-5497): it never reads
//     `appState.goals` anywhere (unlike, say, RequiredReturn.tsx's page,
//     which genuinely is goal-driven). The task brief's "and api.goals.
//     getGoals() ... if the original cross-references goals" condition is
//     therefore not met here — a deliberate judgement call, not an
//     oversight (see this task's final report for the confirmation).
//   - The Child Cost / Wedding / Insurance / Emergency Fund calculators are
//     pure "fill in the sliders, click Calculate" tools in the original
//     (no family-member/goal data feeds them at all) — ported as identical
//     standalone forms, with two judgement-call seed defaults: Wedding
//     Planning's "Annual Income" default seeds from the real household's
//     earning members (sum of `income * 12`) when available, and Emergency
//     Fund's earner/dependent counts feed the roadmap section — matching
//     the same "seed sliders from real data when available" precedent
//     RequiredReturn.tsx already established (see that file's header
//     comment) rather than the hardcoded demo numbers app.js shipped with.
//   - "Your Family's Financial Journey" (the roadmap) reads its four inputs
//     from this page's own calculator results in React state instead of
//     scraping already-rendered DOM text nodes the way app.js's
//     `generateRoadmap` did (app.js ~5406-5453) — same numbers, cleaner
//     mechanism. Its "Financial Readiness" score needs a monthly-savings
//     figure the original sourced from `appState.userProfile.monthlySavings`
//     — a settings field with no equivalent store in this React port (see
//     RequiredReturn.tsx's own header comment on the same missing
//     `appState.settings` concept) — defaulted to 0 here exactly like that
//     field's own unset default, rather than fabricating a number.
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Baby,
  GraduationCap,
  HeartHandshake,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";
import type { FamilyMember } from "../lib/api";

// ─────────────────────────────────────────────────────────────────────────
// utils.* ports (app.js ~2661-2711) — see RequiredReturn.tsx's identical
// port for the same reasoning on the 'due' (start-of-month) SIP timing
// default (no Gini settings store exists yet to read `sipTiming` from).
// ─────────────────────────────────────────────────────────────────────────
const SIP_TIMING: "due" | "ordinary" = "due";

function calculateFutureValue(pv: number, rate: number, years: number) {
  return pv * Math.pow(1 + rate / 100, years);
}

function sipFVFactor(monthlyRate: number, months: number, timing: "due" | "ordinary") {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return months;
  const base = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return timing === "due" ? base * (1 + monthlyRate) : base;
}

function calculateSIP(monthlyAmount: number, rate: number, years: number, timing: "due" | "ordinary" = SIP_TIMING) {
  const monthlyRate = rate / 12 / 100;
  const months = Math.max(0, Math.floor(years * 12));
  return monthlyAmount * sipFVFactor(monthlyRate, months, timing);
}

function calculateRequiredSIP(futureValue: number, rate: number, years: number, timing: "due" | "ordinary" = SIP_TIMING) {
  const monthlyRate = rate / 12 / 100;
  const months = Math.max(0, Math.floor(years * 12));
  const factor = sipFVFactor(monthlyRate, months, timing);
  if (factor === 0) return 0;
  return futureValue / factor;
}

function num(value: string, fallback = 0): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

// Matches gini.css's `--chart-1`..`--chart-5` tokens, same as Family.tsx.
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// ─────────────────────────────────────────────────────────────────────────
// Section: Child Cost Projection (app.js `calculateChildCosts`, ~5146-5169)
// ─────────────────────────────────────────────────────────────────────────
interface ChildCostForm {
  yearsToBirth: string;
  birthCosts: string;
  monthlyCare: string;
  inflation: string;
}

interface ChildCostResults {
  futureBirthCosts: number;
  firstYearCosts: number;
  requiredSavings: number;
  fiveYearTotal: number;
}

function calculateChildCosts(form: ChildCostForm): ChildCostResults {
  const yearsToBirth = num(form.yearsToBirth);
  const birthCosts = num(form.birthCosts);
  const monthlyCare = num(form.monthlyCare);
  const inflation = num(form.inflation);

  const futureBirthCosts = calculateFutureValue(birthCosts, inflation, yearsToBirth);
  const futureMonthlyCare = monthlyCare * Math.pow(1 + inflation / 100, yearsToBirth);
  const firstYearCosts = futureBirthCosts + futureMonthlyCare * 12;

  let fiveYearTotal = futureBirthCosts;
  for (let year = 0; year < 5; year++) {
    fiveYearTotal += monthlyCare * Math.pow(1 + inflation / 100, yearsToBirth + year) * 12;
  }

  const requiredSavings = yearsToBirth > 0 ? futureBirthCosts / (yearsToBirth * 12) : 0;

  return { futureBirthCosts, firstYearCosts, requiredSavings, fiveYearTotal };
}

// ─────────────────────────────────────────────────────────────────────────
// Section: Comprehensive Education Planning
// (app.js `addChildEducation`/`calculateEducation`, ~5171-5343)
// ─────────────────────────────────────────────────────────────────────────
interface ChildEduCosts {
  preschoolCost: number;
  primaryCost: number;
  secondaryCost: number;
  higherSecCost: number;
  undergraduateCost: number;
  postgraduateCost: number;
}

const DEFAULT_EDU_COSTS: ChildEduCosts = {
  preschoolCost: 50000,
  primaryCost: 100000,
  secondaryCost: 150000,
  higherSecCost: 200000,
  undergraduateCost: 500000,
  postgraduateCost: 1000000,
};

const EDU_INFLATION = 8; // "Education inflation" — app.js line 5257, fixed constant.

const EDU_STAGES: { name: string; label: string; startAge: number; years: number; costKey: keyof ChildEduCosts }[] = [
  { name: "Preschool", label: "Preschool (Annual)", startAge: 3, years: 2, costKey: "preschoolCost" },
  { name: "Primary", label: "Primary School (Annual)", startAge: 5, years: 5, costKey: "primaryCost" },
  { name: "Secondary", label: "Secondary School (Annual)", startAge: 10, years: 3, costKey: "secondaryCost" },
  { name: "Higher Sec", label: "Higher Secondary (Annual)", startAge: 13, years: 2, costKey: "higherSecCost" },
  { name: "Undergrad", label: "Undergraduate (Total)", startAge: 15, years: 1, costKey: "undergraduateCost" },
  { name: "Postgrad", label: "Postgraduate (Total)", startAge: 19, years: 1, costKey: "postgraduateCost" },
];

interface EduTimelinePoint {
  child: string;
  stage: string;
  year: number;
  cost: number;
}

function calculateEducation(children: FamilyMember[], costsByMember: Record<string, ChildEduCosts>) {
  let totalCorpus = 0;
  const timelineData: EduTimelinePoint[] = [];

  children.forEach((child) => {
    const age = child.age ?? 0;
    const costs = costsByMember[child.id] || DEFAULT_EDU_COSTS;
    EDU_STAGES.forEach((stage) => {
      const yearStart = Math.max(0, stage.startAge - age);
      const futureCost = calculateFutureValue(costs[stage.costKey] * stage.years, EDU_INFLATION, yearStart);
      totalCorpus += futureCost;
      timelineData.push({ child: child.name, stage: stage.name, year: yearStart, cost: futureCost });
    });
  });

  const maxYears = timelineData.length ? Math.max(...timelineData.map((t) => t.year), 1) : 1;
  const monthlySIP = children.length ? calculateRequiredSIP(totalCorpus, 12, maxYears) : 0;

  return { totalCorpus, monthlySIP, timelineData };
}

// ─────────────────────────────────────────────────────────────────────────
// Section: Wedding & Marriage Planning (app.js `calculateWedding`, ~5345-5359)
// ─────────────────────────────────────────────────────────────────────────
interface WeddingForm {
  numWeddings: string;
  yearsToWedding: string;
  weddingCost: string;
  inflation: string;
}

interface WeddingResults {
  futureWeddingCost: number;
  totalCost: number;
  monthlySIP: number;
}

function calculateWedding(form: WeddingForm): WeddingResults {
  const numWeddings = num(form.numWeddings);
  const years = num(form.yearsToWedding);
  const currentCost = num(form.weddingCost);
  const inflation = num(form.inflation);

  const futureWeddingCost = calculateFutureValue(currentCost, inflation, years);
  const totalCost = futureWeddingCost * numWeddings;
  const monthlySIP = years > 0 ? calculateRequiredSIP(totalCost, 12, years) : 0;

  return { futureWeddingCost, totalCost, monthlySIP };
}

// ─────────────────────────────────────────────────────────────────────────
// Section: Family Healthcare & Insurance Planning
// (app.js `calculateInsurance`, ~5361-5386)
// ─────────────────────────────────────────────────────────────────────────
interface InsuranceForm {
  healthCurrent: string;
  healthRecommended: string;
  lifeCurrent: string;
  annualIncome: string;
}

interface InsuranceResults {
  healthGap: number;
  recommendedLife: number;
  lifeGap: number;
  status: "critical" | "moderate" | "protected";
  statusLabel: string;
}

function calculateInsurance(form: InsuranceForm): InsuranceResults {
  const healthCurrent = num(form.healthCurrent);
  const healthRecommended = num(form.healthRecommended);
  const lifeCurrent = num(form.lifeCurrent);
  const annualIncome = num(form.annualIncome);

  const healthGap = Math.max(0, healthRecommended - healthCurrent);
  const recommendedLife = annualIncome * 10;
  const lifeGap = Math.max(0, recommendedLife - lifeCurrent);

  let status: InsuranceResults["status"] = "protected";
  let statusLabel = "Well Protected";
  if (healthGap > 0 || lifeGap > annualIncome * 5) {
    status = "critical";
    statusLabel = "Critical - Needs Immediate Attention";
  } else if (lifeGap > 0) {
    status = "moderate";
    statusLabel = "Moderate - Could Improve";
  }

  return { healthGap, recommendedLife, lifeGap, status, statusLabel };
}

// ─────────────────────────────────────────────────────────────────────────
// Section: Family Emergency Fund (app.js `calculateEmergency`, ~5388-5404)
// ─────────────────────────────────────────────────────────────────────────
interface EmergencyForm {
  monthlyExpenses: string;
  months: string;
  currentSavings: string;
  timeframe: string;
}

interface EmergencyResults {
  targetFund: number;
  gap: number;
  monthlySavings: number;
  progress: number;
}

function calculateEmergency(form: EmergencyForm): EmergencyResults {
  const monthlyExpenses = num(form.monthlyExpenses);
  const months = num(form.months);
  const currentSavings = num(form.currentSavings);
  const timeframe = num(form.timeframe);

  const targetFund = monthlyExpenses * months;
  const gap = Math.max(0, targetFund - currentSavings);
  const monthlySavings = timeframe > 0 ? gap / timeframe : 0;
  const progress = targetFund > 0 ? Math.max(0, Math.min(100, (currentSavings / targetFund) * 100)) : 0;

  return { targetFund, gap, monthlySavings, progress };
}

// ─────────────────────────────────────────────────────────────────────────
// Section header helper — matches this page's section-by-section layout.
// ─────────────────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Baby;
  title: string;
  subtitle: string;
}) {
  return (
    <CardHeader className="flex flex-row items-start gap-3 space-y-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </CardHeader>
  );
}

function ResultGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border bg-accent/40 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-base font-bold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

const EDU_CHART_CONFIG: ChartConfig = {
  cost: { label: "Projected Cost", color: CHART_COLORS[0] },
};

const ROADMAP_CHART_CONFIG: ChartConfig = {
  wealth: { label: "Accumulated Wealth", color: CHART_COLORS[1] },
};

export default function FamilyPlanning() {
  const { formatCurrency } = useCurrency();

  const familyMembersQuery = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });
  const members = familyMembersQuery.data || [];
  const isLoading = familyMembersQuery.isLoading;

  const children = useMemo(() => members.filter((m) => m.relationship === "Child"), [members]);
  const earners = useMemo(() => members.filter((m) => m.is_earner), [members]);
  const householdAnnualIncome = useMemo(
    () => earners.reduce((sum, m) => sum + (m.income || 0) * 12, 0),
    [earners]
  );
  const hasSpouse = members.some((m) => m.relationship === "Spouse");

  // ── Child Cost Projection ────────────────────────────────────────────
  const [childCostForm, setChildCostForm] = useState<ChildCostForm>({
    yearsToBirth: "2",
    birthCosts: "200000",
    monthlyCare: "15000",
    inflation: "8",
  });
  const [childCostResults, setChildCostResults] = useState<ChildCostResults | null>(null);

  // ── Comprehensive Education Planning ─────────────────────────────────
  const [eduCostOverrides, setEduCostOverrides] = useState<Record<string, ChildEduCosts>>({});
  const eduCosts = (memberId: string) => eduCostOverrides[memberId] || DEFAULT_EDU_COSTS;
  const setEduCost = (memberId: string, key: keyof ChildEduCosts, value: string) => {
    setEduCostOverrides((prev) => ({
      ...prev,
      [memberId]: { ...(prev[memberId] || DEFAULT_EDU_COSTS), [key]: num(value) },
    }));
  };
  const education = useMemo(() => calculateEducation(children, eduCostOverrides), [children, eduCostOverrides]);
  const eduChartData = useMemo(() => {
    const years = [...new Set(education.timelineData.map((t) => t.year))].sort((a, b) => a - b);
    return years.map((year) => ({
      year: `Year ${year}`,
      cost: education.timelineData.filter((t) => t.year === year).reduce((sum, t) => sum + t.cost, 0),
    }));
  }, [education.timelineData]);

  // ── Wedding Planning ─────────────────────────────────────────────────
  const [weddingForm, setWeddingForm] = useState<WeddingForm>({
    numWeddings: "0",
    yearsToWedding: "20",
    weddingCost: "3000000",
    inflation: "7",
  });
  const [weddingResults, setWeddingResults] = useState<WeddingResults | null>(null);

  // ── Insurance ─────────────────────────────────────────────────────────
  const [insuranceForm, setInsuranceForm] = useState<InsuranceForm>({
    healthCurrent: "500000",
    healthRecommended: "1000000",
    lifeCurrent: "5000000",
    annualIncome: "2400000",
  });
  const [insuranceSeeded, setInsuranceSeeded] = useState(false);
  const [insuranceResults, setInsuranceResults] = useState<InsuranceResults | null>(null);

  // Seed "Annual Income" from real earner income once, the first time the
  // family members query resolves — same precedent as RequiredReturn.tsx's
  // "Current Total Savings" slider (see that file's header comment).
  useEffect(() => {
    if (!isLoading && !insuranceSeeded) {
      if (householdAnnualIncome > 0) {
        setInsuranceForm((p) => ({ ...p, annualIncome: String(householdAnnualIncome) }));
      }
      setInsuranceSeeded(true);
    }
  }, [isLoading, insuranceSeeded, householdAnnualIncome]);

  // ── Emergency Fund ────────────────────────────────────────────────────
  const [emergencyForm, setEmergencyForm] = useState<EmergencyForm>({
    monthlyExpenses: "120000",
    months: "6",
    currentSavings: "0",
    timeframe: "12",
  });
  const [emergencyResults, setEmergencyResults] = useState<EmergencyResults | null>(null);

  // ── Roadmap ───────────────────────────────────────────────────────────
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);

  const roadmap = useMemo(() => {
    // app.js `generateRoadmap` (~5406-5453), reading this page's own
    // React state instead of scraping rendered DOM text — see header
    // comment.
    const childCost = children.length * 5000000; // "Simplified" — app.js line 5408, ported verbatim.
    const educationCorpus = education.totalCorpus;
    const weddingCost = weddingResults?.totalCost ?? 0;
    const emergencyFund = emergencyResults?.targetFund ?? 0;
    const totalCapital = childCost + educationCorpus + weddingCost + emergencyFund;

    const educationSIP = education.monthlySIP;
    const weddingSIP = weddingResults?.monthlySIP ?? 0;
    const emergencySIP = emergencyResults?.monthlySavings ?? 0;
    const totalMonthly = educationSIP + weddingSIP + emergencySIP;

    const planningYears = 25;
    // No settings store carries `userProfile.monthlySavings` in this React
    // port — defaults to 0, same as that field's own unset default (see
    // header comment).
    const currentMonthlySavings = 0;
    const readiness = totalMonthly > 0 ? Math.min((currentMonthlySavings / totalMonthly) * 100, 100) : 100;

    const milestones =
      children.length > 0
        ? [
            { year: 2, event: "First child starts preschool", cost: 100000 },
            { year: 5, event: "Child starts primary school", cost: 500000 },
            { year: 15, event: "Child starts undergraduate", cost: 2000000 },
            { year: 20, event: "First wedding planning", cost: 5000000 },
          ]
        : [];

    const accumulationChart = Array.from({ length: 26 }, (_, y) => ({
      year: `Year ${y}`,
      wealth: calculateSIP(totalMonthly, 12, y),
    }));

    return { totalCapital, totalMonthly, planningYears, readiness, milestones, accumulationChart };
  }, [children.length, education, weddingResults, emergencyResults]);

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Family milestones</span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Family Planning Mode</h1>
          <p className="text-muted-foreground">Comprehensive planning for life's major family milestones</p>
        </div>

        {/* Quick access to Advanced Planning — app.js cta-banner, index.html ~1975-1983 */}
        <Card className="border-primary/20 bg-gradient-primary text-primary-foreground">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold">Advanced Family Planning</h3>
              <p className="text-sm text-primary-foreground/80">
                Access dual retirement, elder care, education timeline, tax optimization &amp; more
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link to="/gini/family-advanced">
                Open Advanced Tools
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Family Snapshot — replaces the original's un-persisted "Family
            Profile" edit form with real data (see header comment). */}
        <Card>
          <SectionHeader
            icon={Users}
            title="Family Snapshot"
            subtitle="Computed from your Family page — add or edit members there"
          />
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <ResultGrid
                items={[
                  { label: "Marital Status", value: hasSpouse ? "Married / Partnered" : "Single" },
                  { label: "Children", value: String(children.length) },
                  { label: "Dependents", value: String(members.filter((m) => m.is_dependent).length) },
                  {
                    label: "Household Income (Annual)",
                    value: formatCurrency(householdAnnualIncome),
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Child Planning Calculator — app.js `calculateChildCosts` */}
        <Card>
          <SectionHeader icon={Baby} title="Child Planning Calculator" subtitle="Estimate costs and plan for expanding your family" />
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Years Until Birth</Label>
                <Input aria-label="Years Until Birth"
                  type="number"
                  min={0}
                  max={15}
                  value={childCostForm.yearsToBirth}
                  onChange={(e) => setChildCostForm((p) => ({ ...p, yearsToBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>One-time Birth Costs</Label>
                <Input aria-label="One-time Birth Costs"
                  type="number"
                  step={10000}
                  value={childCostForm.birthCosts}
                  onChange={(e) => setChildCostForm((p) => ({ ...p, birthCosts: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Childcare Costs</Label>
                <Input aria-label="Monthly Childcare Costs"
                  type="number"
                  step={1000}
                  value={childCostForm.monthlyCare}
                  onChange={(e) => setChildCostForm((p) => ({ ...p, monthlyCare: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Inflation Rate (%)</Label>
                <Input aria-label="Inflation Rate (%)"
                  type="number"
                  step={0.5}
                  value={childCostForm.inflation}
                  onChange={(e) => setChildCostForm((p) => ({ ...p, inflation: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={() => setChildCostResults(calculateChildCosts(childCostForm))}>
              Calculate Child Costs
            </Button>
            {childCostResults && (
              <ResultGrid
                items={[
                  { label: "Future Birth Costs", value: formatCurrency(childCostResults.futureBirthCosts) },
                  { label: "Total First Year Costs", value: formatCurrency(childCostResults.firstYearCosts) },
                  { label: "Required Monthly Savings", value: formatCurrency(childCostResults.requiredSavings) },
                  { label: "5-Year Total Costs", value: formatCurrency(childCostResults.fiveYearTotal) },
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Comprehensive Education Planning — app.js `calculateEducation` */}
        <Card>
          <SectionHeader
            icon={GraduationCap}
            title="Comprehensive Education Planning"
            subtitle="Plan for the complete education journey from preschool to higher education"
          />
          <CardContent className="space-y-5">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : children.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No children on your Family page yet. Add a child (relationship "Child") on the Family page to plan
                their education costs here.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {children.map((child) => {
                    const costs = eduCosts(child.id);
                    return (
                      <div key={child.id} className="rounded-xl border bg-accent/30 p-4">
                        <p className="mb-3 text-sm font-semibold text-foreground">
                          {child.name} <span className="font-normal text-muted-foreground">— Age {child.age ?? "—"}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                          {EDU_STAGES.map((stage) => (
                            <div key={stage.costKey} className="space-y-1">
                              <Label className="text-xs">{stage.label}</Label>
                              <Input aria-label={stage.label}
                                type="number"
                                step={10000}
                                value={costs[stage.costKey]}
                                onChange={(e) => setEduCost(child.id, stage.costKey, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ResultGrid
                  items={[
                    { label: "Total Education Corpus", value: formatCurrency(education.totalCorpus) },
                    { label: "Monthly SIP Required", value: formatCurrency(education.monthlySIP) },
                    { label: "Expected Return Rate", value: "12%" },
                  ]}
                />

                {eduChartData.length > 0 && (
                  <ChartContainer config={EDU_CHART_CONFIG} className="h-72 w-full">
                    <BarChart data={eduChartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                      <ChartTooltip
                        content={(props: any) => (
                          <ChartTooltipContent {...props} formatter={(v: any) => formatCurrency(Number(v))} />
                        )}
                      />
                      <Bar dataKey="cost" fill="var(--color-cost)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Wedding & Marriage Planning — app.js `calculateWedding` */}
        <Card>
          <SectionHeader icon={HeartHandshake} title="Wedding & Marriage Planning" subtitle="Plan for weddings, celebrations, and related expenses" />
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Number of Weddings to Plan</Label>
                <Input aria-label="Number of Weddings to Plan"
                  type="number"
                  min={0}
                  max={10}
                  value={weddingForm.numWeddings}
                  onChange={(e) => setWeddingForm((p) => ({ ...p, numWeddings: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Average Years Until Wedding</Label>
                <Input aria-label="Average Years Until Wedding"
                  type="number"
                  min={0}
                  max={40}
                  value={weddingForm.yearsToWedding}
                  onChange={(e) => setWeddingForm((p) => ({ ...p, yearsToWedding: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Wedding Cost</Label>
                <Input aria-label="Current Wedding Cost"
                  type="number"
                  step={100000}
                  value={weddingForm.weddingCost}
                  onChange={(e) => setWeddingForm((p) => ({ ...p, weddingCost: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Inflation Rate (%)</Label>
                <Input aria-label="Inflation Rate (%)"
                  type="number"
                  step={0.5}
                  value={weddingForm.inflation}
                  onChange={(e) => setWeddingForm((p) => ({ ...p, inflation: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={() => setWeddingResults(calculateWedding(weddingForm))}>Calculate Wedding Costs</Button>
            {weddingResults && (
              <ResultGrid
                items={[
                  { label: "Future Wedding Cost", value: formatCurrency(weddingResults.futureWeddingCost) },
                  { label: "Total for All Weddings", value: formatCurrency(weddingResults.totalCost) },
                  { label: "Monthly SIP Needed (12% return)", value: formatCurrency(weddingResults.monthlySIP) },
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Healthcare & Insurance — app.js `calculateInsurance` */}
        <Card>
          <SectionHeader icon={ShieldCheck} title="Family Healthcare & Insurance Planning" subtitle="Ensure adequate protection for your family" />
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Current Health Insurance Coverage</Label>
                <Input aria-label="Current Health Insurance Coverage"
                  type="number"
                  step={100000}
                  value={insuranceForm.healthCurrent}
                  onChange={(e) => setInsuranceForm((p) => ({ ...p, healthCurrent: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Recommended Coverage</Label>
                <Input aria-label="Recommended Coverage"
                  type="number"
                  step={100000}
                  value={insuranceForm.healthRecommended}
                  onChange={(e) => setInsuranceForm((p) => ({ ...p, healthRecommended: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Life Insurance</Label>
                <Input aria-label="Current Life Insurance"
                  type="number"
                  step={500000}
                  value={insuranceForm.lifeCurrent}
                  onChange={(e) => setInsuranceForm((p) => ({ ...p, lifeCurrent: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Annual Income</Label>
                <Input aria-label="Annual Income"
                  type="number"
                  step={100000}
                  value={insuranceForm.annualIncome}
                  onChange={(e) => setInsuranceForm((p) => ({ ...p, annualIncome: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={() => setInsuranceResults(calculateInsurance(insuranceForm))}>Calculate Insurance Needs</Button>
            {insuranceResults && (
              <>
                <ResultGrid
                  items={[
                    { label: "Health Insurance Gap", value: formatCurrency(insuranceResults.healthGap) },
                    { label: "Recommended Life Cover (10x income)", value: formatCurrency(insuranceResults.recommendedLife) },
                    { label: "Life Insurance Gap", value: formatCurrency(insuranceResults.lifeGap) },
                    { label: "Protection Status", value: insuranceResults.statusLabel },
                  ]}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Family Emergency Fund — app.js `calculateEmergency` */}
        <Card>
          <SectionHeader icon={PiggyBank} title="Family Emergency Fund" subtitle="Build a safety net for unexpected family expenses" />
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Monthly Family Expenses</Label>
                <Input aria-label="Monthly Family Expenses"
                  type="number"
                  step={5000}
                  value={emergencyForm.monthlyExpenses}
                  onChange={(e) => setEmergencyForm((p) => ({ ...p, monthlyExpenses: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Emergency Fund Months</Label>
                <Select
                  value={emergencyForm.months}
                  onValueChange={(v) => setEmergencyForm((p) => ({ ...p, months: v }))}
                >
                  <SelectTrigger aria-label="Emergency Fund Months">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["3", "6", "9", "12"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m} Months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Current Emergency Savings</Label>
                <Input aria-label="Current Emergency Savings"
                  type="number"
                  step={10000}
                  value={emergencyForm.currentSavings}
                  onChange={(e) => setEmergencyForm((p) => ({ ...p, currentSavings: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Time to Build Fund (months)</Label>
                <Input aria-label="Time to Build Fund (months)"
                  type="number"
                  min={1}
                  max={60}
                  value={emergencyForm.timeframe}
                  onChange={(e) => setEmergencyForm((p) => ({ ...p, timeframe: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={() => setEmergencyResults(calculateEmergency(emergencyForm))}>Calculate Emergency Fund</Button>
            {emergencyResults && (
              <ResultGrid
                items={[
                  { label: "Target Emergency Fund", value: formatCurrency(emergencyResults.targetFund) },
                  { label: "Amount Needed", value: formatCurrency(emergencyResults.gap) },
                  { label: "Monthly Savings Required", value: formatCurrency(emergencyResults.monthlySavings) },
                  { label: "Progress", value: `${emergencyResults.progress.toFixed(1)}%` },
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Complete Family Financial Roadmap — app.js `generateRoadmap` */}
        <Card>
          <SectionHeader
            icon={Sparkles}
            title="Complete Family Financial Roadmap"
            subtitle="Your family's financial journey, combining every calculator above"
          />
          <CardContent className="space-y-5">
            <Button onClick={() => setRoadmapGenerated(true)}>Generate Complete Roadmap</Button>
            {roadmapGenerated && (
              <>
                <ResultGrid
                  items={[
                    { label: "Total Capital Needed", value: formatCurrency(roadmap.totalCapital) },
                    { label: "Total Monthly Commitments", value: formatCurrency(roadmap.totalMonthly) },
                    { label: "Years of Planning", value: `${roadmap.planningYears} years` },
                    { label: "Financial Readiness", value: `${roadmap.readiness.toFixed(0)}%` },
                  ]}
                />

                <ChartContainer config={ROADMAP_CHART_CONFIG} className="h-80 w-full">
                  <LineChart data={roadmap.accumulationChart}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} interval={4} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <ChartTooltip
                      content={(props: any) => (
                        <ChartTooltipContent {...props} formatter={(v: any) => formatCurrency(Number(v))} />
                      )}
                    />
                    <Line type="monotone" dataKey="wealth" stroke="var(--color-wealth)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>

                <div>
                  <h4 className="mb-2 text-sm font-bold text-foreground">Key Milestones Timeline</h4>
                  {roadmap.milestones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No children yet — add one on the Family page to see milestones.</p>
                  ) : (
                    <div className="space-y-2">
                      {roadmap.milestones.map((m) => (
                        <div
                          key={m.event}
                          className="flex items-center justify-between rounded-lg border-l-4 border-primary bg-accent/30 p-3"
                        >
                          <div>
                            <span className="text-sm font-bold text-primary">Year {m.year}</span>
                            <p className="text-sm text-foreground">{m.event}</p>
                          </div>
                          <div className="text-sm font-semibold text-foreground">{formatCurrency(m.cost)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </GiniLayout>
  );
}
