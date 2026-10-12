// Calculations behind Gini's Family Planning page (../pages/FamilyPlanning.tsx).
//
// Every cost is in rupees of the year it is paid ("future rupees"), and every
// monthly saving figure assumes the money is invested from now until that
// payment at the stated return, paid at the start of each month.
//
// The roadmap is a month-by-month simulation, not a formula: each upcoming
// cost gets its own monthly saving that runs until the cost is due, the pot
// grows at the return rate, and the cost is taken out when it is due. So the
// chart rises while you save and drops whenever fees, a wedding or a birth
// are paid.
import type { FamilyMember } from "./api";

export const PLAN_RETURN = 12; // % a year, used for every "monthly SIP needed" figure on the page

// ─────────────────────────────────────────────────────────────────────────
// Money helpers
// ─────────────────────────────────────────────────────────────────────────

export const futureValue = (pv: number, ratePct: number, years: number) => pv * Math.pow(1 + ratePct / 100, years);

/** Monthly amount, paid at the start of each month for `years`, that grows to `target`. */
export function requiredMonthlySIP(target: number, ratePct: number, years: number): number {
  const months = Math.round(years * 12);
  if (target <= 0 || months <= 0) return 0;
  const r = ratePct / 12 / 100;
  if (r === 0) return target / months;
  return target / (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
}

// ─────────────────────────────────────────────────────────────────────────
// Family members
// ─────────────────────────────────────────────────────────────────────────

/** "Child" from the Family page, plus Son / Daughter used by imports and sample data. */
export const isChild = (m: Pick<FamilyMember, "relationship">) => /^(child|son|daughter)$/i.test((m.relationship || "").trim());

// ─────────────────────────────────────────────────────────────────────────
// Education (Indian school system)
// ─────────────────────────────────────────────────────────────────────────

export interface ChildEduCosts {
  preschoolCost: number;
  primaryCost: number;
  secondaryCost: number;
  higherSecCost: number;
  undergraduateCost: number;
  postgraduateCost: number;
}

export const DEFAULT_EDU_COSTS: ChildEduCosts = {
  preschoolCost: 50000,
  primaryCost: 100000,
  secondaryCost: 150000,
  higherSecCost: 200000,
  undergraduateCost: 500000,
  postgraduateCost: 1000000,
};

export interface EduStage {
  name: string;
  label: string;
  /** Age in the first year of the stage. */
  startAge: number;
  /** Years of the stage. A `perYear` cost is paid every year; otherwise once, at the start. */
  years: number;
  perYear: boolean;
  costKey: keyof ChildEduCosts;
}

export const EDU_STAGES: EduStage[] = [
  { name: "Preschool", label: "Preschool, ages 3–5 (per year)", startAge: 3, years: 3, perYear: true, costKey: "preschoolCost" },
  { name: "Primary", label: "Class 1–5 (per year)", startAge: 6, years: 5, perYear: true, costKey: "primaryCost" },
  { name: "Secondary", label: "Class 6–10 (per year)", startAge: 11, years: 5, perYear: true, costKey: "secondaryCost" },
  { name: "Higher Secondary", label: "Class 11–12 (per year)", startAge: 16, years: 2, perYear: true, costKey: "higherSecCost" },
  { name: "Undergraduate", label: "Undergraduate, from 18 (total)", startAge: 18, years: 1, perYear: false, costKey: "undergraduateCost" },
  { name: "Postgraduate", label: "Postgraduate, from 21 (total)", startAge: 21, years: 1, perYear: false, costKey: "postgraduateCost" },
];

export interface EduPayment {
  childId: string;
  child: string;
  stage: string;
  /** 0 = this year. */
  yearsFromNow: number;
  calendarYear: number;
  cost: number;
}

export interface EducationPlan {
  payments: EduPayment[];
  /** Sum of every remaining payment, in the rupees of the year it is paid. */
  totalCost: number;
  /** Payments due this year: these come from current savings, not a SIP. */
  dueThisYear: number;
  /** Sum of a separate SIP for each future payment, each running until that payment. */
  monthlySIP: number;
  /** Children without an age, who can't be planned. */
  missingAge: string[];
}

/**
 * Remaining education payments for each child. Years the child has already
 * passed are left out; each year's fee is inflated to the year it is paid.
 */
export function planEducation(
  children: FamilyMember[],
  costsByMember: Record<string, ChildEduCosts>,
  opts: { currentYear: number; inflation: number; returnRate?: number },
): EducationPlan {
  const payments: EduPayment[] = [];
  const missingAge: string[] = [];
  for (const child of children) {
    if (child.age == null) {
      missingAge.push(child.name);
      continue;
    }
    const costs = costsByMember[child.id] || DEFAULT_EDU_COSTS;
    for (const stage of EDU_STAGES) {
      for (let i = 0; i < stage.years; i++) {
        const age = stage.startAge + i;
        if (age < child.age) continue; // already paid
        const today = costs[stage.costKey];
        if (!today) continue;
        const yearsFromNow = age - child.age;
        payments.push({
          childId: child.id,
          child: child.name,
          stage: stage.name,
          yearsFromNow,
          calendarYear: opts.currentYear + yearsFromNow,
          cost: futureValue(today, opts.inflation, yearsFromNow),
        });
      }
    }
  }
  const rate = opts.returnRate ?? PLAN_RETURN;
  return {
    payments,
    totalCost: payments.reduce((s, p) => s + p.cost, 0),
    dueThisYear: payments.filter((p) => p.yearsFromNow === 0).reduce((s, p) => s + p.cost, 0),
    monthlySIP: payments.reduce((s, p) => s + requiredMonthlySIP(p.cost, rate, p.yearsFromNow), 0),
    missingAge,
  };
}

/** Yearly education totals per child, for a stacked bar chart. */
export function educationChartRows(plan: EducationPlan): Array<Record<string, number | string>> {
  const byYear = new Map<number, Record<string, number | string>>();
  for (const p of plan.payments) {
    const row = byYear.get(p.calendarYear) ?? { year: String(p.calendarYear) };
    row[p.childId] = ((row[p.childId] as number) || 0) + p.cost;
    byYear.set(p.calendarYear, row);
  }
  if (!byYear.size) return [];
  // Every year from first to last, so a gap with no fees shows as a gap.
  const years = [...byYear.keys()];
  const rows: Array<Record<string, number | string>> = [];
  for (let y = Math.min(...years); y <= Math.max(...years); y++) rows.push(byYear.get(y) ?? { year: String(y) });
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────
// New child, wedding, insurance, emergency fund
// ─────────────────────────────────────────────────────────────────────────

export function planNewChild(input: { yearsToBirth: number; birthCosts: number; monthlyCare: number; inflation: number; returnRate?: number }) {
  const { yearsToBirth, birthCosts, monthlyCare, inflation } = input;
  const futureBirthCosts = futureValue(birthCosts, inflation, yearsToBirth);
  const yearlyCare = (year: number) => monthlyCare * 12 * Math.pow(1 + inflation / 100, yearsToBirth + year);
  const firstYearCosts = futureBirthCosts + yearlyCare(0);
  let fiveYearTotal = futureBirthCosts;
  for (let y = 0; y < 5; y++) fiveYearTotal += yearlyCare(y);
  return {
    futureBirthCosts,
    firstYearCosts,
    fiveYearTotal,
    /** To have the birth costs ready by the birth. Childcare is a running cost paid from income. */
    monthlySIP: requiredMonthlySIP(futureBirthCosts, input.returnRate ?? PLAN_RETURN, yearsToBirth),
  };
}

export function planWeddings(input: { count: number; yearsAway: number; costToday: number; inflation: number; returnRate?: number }) {
  const count = Math.max(0, Math.floor(input.count));
  const futureWeddingCost = futureValue(input.costToday, input.inflation, input.yearsAway);
  const totalCost = futureWeddingCost * count;
  return { count, futureWeddingCost, totalCost, monthlySIP: requiredMonthlySIP(totalCost, input.returnRate ?? PLAN_RETURN, input.yearsAway) };
}

/** Wedding defaults from the children on the Family page: one wedding each, at about 27. */
export function weddingDefaults(children: FamilyMember[], weddingAge = 27) {
  const ages = children.map((c) => c.age).filter((a): a is number => a != null);
  if (!ages.length) return null;
  const avgYears = ages.reduce((s, a) => s + Math.max(1, weddingAge - a), 0) / ages.length;
  return { count: children.length, yearsAway: Math.round(avgYears) };
}

export type ProtectionStatus = "critical" | "moderate" | "protected";

export function planInsurance(input: { healthCurrent: number; healthRecommended: number; lifeCurrent: number; annualIncome: number }) {
  const healthGap = Math.max(0, input.healthRecommended - input.healthCurrent);
  const recommendedLife = input.annualIncome * 10;
  const lifeGap = Math.max(0, recommendedLife - input.lifeCurrent);
  let status: ProtectionStatus = "protected";
  let statusLabel = "Well protected";
  if (healthGap > 0 || lifeGap > input.annualIncome * 5) {
    status = "critical";
    statusLabel = "Needs attention now";
  } else if (lifeGap > 0) {
    status = "moderate";
    statusLabel = "Could improve";
  }
  return { healthGap, recommendedLife, lifeGap, status, statusLabel };
}

export function planEmergency(input: { monthlyExpenses: number; months: number; currentSavings: number; timeframeMonths: number }) {
  const targetFund = input.monthlyExpenses * input.months;
  const gap = Math.max(0, targetFund - input.currentSavings);
  const timeframe = Math.max(1, Math.round(input.timeframeMonths));
  return {
    targetFund,
    gap,
    timeframeMonths: timeframe,
    monthlySavings: gap / timeframe,
    progress: targetFund > 0 ? Math.max(0, Math.min(100, (input.currentSavings / targetFund) * 100)) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Roadmap
// ─────────────────────────────────────────────────────────────────────────

export interface RoadmapCost {
  label: string;
  yearsFromNow: number;
  amount: number;
}

export interface RoadmapPoint {
  /** Years from now (a number, so a drop is drawn as a straight vertical line). */
  t: number;
  year: number;
  balance: number;
  /** What was paid at this point, for the tooltip. */
  paid?: number;
  paidFor?: string;
  /** Everything put in so far (monthly savings added up). */
  saved: number;
  /** Growth earned so far (what the savings made at the assumed return). */
  growth: number;
  /** Everything paid out so far, including at this point. */
  paidTotal: number;
  /** Monthly saving going in at this point. */
  monthly: number;
  /** The next cost still to be paid after this point. */
  next?: { label: string; year: number; amount: number };
}

export interface Roadmap {
  points: RoadmapPoint[];
  /** Monthly saving needed right now across every plan. */
  monthlyNow: number;
  /** Everything to be paid, in the rupees of the year it is paid. */
  totalCost: number;
  /** Costs due this year, which come from current savings. */
  dueNow: number;
  years: number;
}

/**
 * Month-by-month: each future cost has its own SIP until it is due, the pot
 * grows at `returnRate`, and costs are paid out when due. An emergency fund
 * is built over its months and then kept (never paid out).
 */
export function simulateRoadmap(input: {
  currentYear: number;
  costs: RoadmapCost[];
  emergency?: { monthly: number; months: number } | null;
  returnRate?: number;
}): Roadmap {
  const rate = (input.returnRate ?? PLAN_RETURN) / 12 / 100;
  const future = input.costs.filter((c) => c.amount > 0 && c.yearsFromNow >= 1);
  const dueNow = input.costs.filter((c) => c.amount > 0 && c.yearsFromNow < 1).reduce((s, c) => s + c.amount, 0);
  const plans = future.map((c) => ({ ...c, months: Math.round(c.yearsFromNow * 12), sip: requiredMonthlySIP(c.amount, input.returnRate ?? PLAN_RETURN, c.yearsFromNow) }));
  const emergency = input.emergency && input.emergency.monthly > 0 ? input.emergency : null;
  const lastMonth = Math.max(12, ...plans.map((p) => p.months), emergency ? Math.ceil(emergency.months / 12) * 12 : 0);

  const depositAt = (m: number) => plans.reduce((s, p) => s + (m < p.months ? p.sip : 0), 0) + (emergency && m < emergency.months ? emergency.monthly : 0);
  const nextAfter = (month: number) => {
    const upcoming = plans.filter((p) => p.months > month).sort((a, b) => a.months - b.months);
    if (!upcoming.length) return undefined;
    const at = upcoming[0].months;
    const group = upcoming.filter((p) => p.months === at);
    return { label: group.map((g) => g.label).join(", "), year: input.currentYear + at / 12, amount: group.reduce((s, g) => s + g.amount, 0) };
  };

  const points: RoadmapPoint[] = [{ t: 0, year: input.currentYear, balance: 0, saved: 0, growth: 0, paidTotal: 0, monthly: depositAt(0), next: nextAfter(0) }];
  let balance = 0;
  let saved = 0;
  let paidTotal = 0;
  for (let m = 0; m < lastMonth; m++) {
    const deposit = depositAt(m);
    saved += deposit;
    balance = (balance + deposit) * (1 + rate);

    const month = m + 1;
    if (month % 12 === 0) {
      const t = month / 12;
      const due = plans.filter((p) => p.months === month);
      const year = input.currentYear + t;
      const base = { t, year, saved, monthly: depositAt(month), next: nextAfter(month) };
      points.push({ ...base, balance: Math.max(0, balance), growth: Math.max(0, balance + paidTotal - saved), paidTotal });
      if (due.length) {
        const paid = due.reduce((s, p) => s + p.amount, 0);
        balance = Math.max(0, balance - paid);
        paidTotal += paid;
        points.push({ ...base, balance, growth: Math.max(0, balance + paidTotal - saved), paidTotal, paid, paidFor: due.map((d) => d.label).join(", ") });
      }
    }
  }

  return {
    points,
    monthlyNow: plans.reduce((s, p) => s + p.sip, 0) + (emergency ? emergency.monthly : 0),
    totalCost: input.costs.reduce((s, c) => s + Math.max(0, c.amount), 0),
    dueNow,
    years: lastMonth / 12,
  };
}

/**
 * Education payments grouped into one roadmap cost per child per stage year.
 * Each school year's fee is its own cost, so the roadmap pays them year by year.
 */
export function educationRoadmapCosts(plan: EducationPlan): RoadmapCost[] {
  return plan.payments.map((p) => ({ label: `${p.child.split(" ")[0]}: ${p.stage}`, yearsFromNow: p.yearsFromNow, amount: p.cost }));
}

/** Milestones for the timeline: when each child starts each stage, with that stage's total. */
export function educationMilestones(plan: EducationPlan): RoadmapCost[] {
  const byStage = new Map<string, RoadmapCost>();
  for (const p of plan.payments) {
    const key = `${p.childId}|${p.stage}`;
    const m = byStage.get(key);
    if (m) m.amount += p.cost;
    else byStage.set(key, { label: `${p.child.split(" ")[0]} ${p.yearsFromNow === 0 ? "is in" : "starts"} ${p.stage}`, yearsFromNow: p.yearsFromNow, amount: p.cost });
  }
  return [...byStage.values()];
}

/** Timeline entries in calendar years, soonest first. */
export function toMilestones(currentYear: number, costs: RoadmapCost[]) {
  return costs
    .filter((c) => c.amount > 0)
    .sort((a, b) => a.yearsFromNow - b.yearsFromNow)
    .map((c) => ({ year: currentYear + Math.max(0, Math.round(c.yearsFromNow)), label: c.label, amount: c.amount }));
}
