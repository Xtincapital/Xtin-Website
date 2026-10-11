import { describe, it, expect } from "vitest";
import {
  DEFAULT_EDU_COSTS,
  educationChartRows,
  educationMilestones,
  isChild,
  planEducation,
  planEmergency,
  planNewChild,
  planWeddings,
  requiredMonthlySIP,
  simulateRoadmap,
  weddingDefaults,
} from "./familyPlanning";

const kid = (id: string, name: string, age: number | null) => ({ id, name, age, relationship: "Son" }) as any;
const opts = { currentYear: 2026, inflation: 10 };

describe("family members", () => {
  it("counts Son and Daughter as children, not just Child", () => {
    expect(["Child", "Son", "daughter", " Son "].every((r) => isChild({ relationship: r }))).toBe(true);
    expect(["Spouse", "Self", "Parent", "Grandson", null].some((r) => isChild({ relationship: r as any }))).toBe(false);
  });
});

describe("education plan", () => {
  it("leaves out years a child has already finished", () => {
    const plan = planEducation([kid("a", "Aarav", 19)], {}, opts);
    // A 19-year-old has only postgraduate (at 21) left.
    expect(plan.payments.map((p) => [p.stage, p.yearsFromNow])).toEqual([["Postgraduate", 2]]);
    expect(plan.totalCost).toBeCloseTo(1_000_000 * 1.1 ** 2);
  });

  it("charges each school year's fee, inflated to the year it is paid", () => {
    const plan = planEducation([kid("a", "Aarav", 10)], {}, opts);
    const primary = plan.payments.filter((p) => p.stage === "Primary");
    expect(primary).toHaveLength(1); // only Class 5 (age 10) remains
    expect(primary[0]).toMatchObject({ yearsFromNow: 0, calendarYear: 2026, cost: DEFAULT_EDU_COSTS.primaryCost });
    const secondary = plan.payments.filter((p) => p.stage === "Secondary");
    expect(secondary.map((p) => p.yearsFromNow)).toEqual([1, 2, 3, 4, 5]);
    expect(secondary[4].cost).toBeCloseTo(150_000 * 1.1 ** 5);
    expect(plan.payments.find((p) => p.stage === "Undergraduate")?.yearsFromNow).toBe(8);
    expect(plan.dueThisYear).toBe(100_000);
  });

  it("saves separately for each payment rather than assuming everything is due at the end", () => {
    const plan = planEducation([kid("a", "Aarav", 10)], {}, opts);
    const expected = plan.payments.reduce((s, p) => s + requiredMonthlySIP(p.cost, 12, p.yearsFromNow), 0);
    expect(plan.monthlySIP).toBeCloseTo(expected);
    const lastYear = Math.max(...plan.payments.map((p) => p.yearsFromNow));
    expect(plan.monthlySIP).toBeGreaterThan(requiredMonthlySIP(plan.totalCost - plan.dueThisYear, 12, lastYear));
  });

  it("reports children without an age instead of treating them as newborns", () => {
    expect(planEducation([kid("a", "Aarav", null)], {}, opts)).toMatchObject({ payments: [], missingAge: ["Aarav"] });
  });

  it("builds chart rows per calendar year and milestones per stage", () => {
    const plan = planEducation([kid("a", "Aarav Kumar", 16), kid("b", "Ananya", 17)], {}, opts);
    const rows = educationChartRows(plan);
    expect(rows[0]).toMatchObject({ year: "2026", a: 200_000, b: 200_000 });
    // Years without fees stay on the axis (no jump from 2028 to 2030).
    expect(rows.map((r) => Number(r.year))).toEqual(Array.from({ length: rows.length }, (_, i) => 2026 + i));
    expect(rows.some((r) => Object.keys(r).length === 1)).toBe(true);
    expect(educationMilestones(plan).map((m) => m.label)).toContain("Aarav starts Undergraduate");
  });
});

describe("other calculators", () => {
  it("weddings default to one per child at about age 27", () => {
    expect(weddingDefaults([kid("a", "A", 8), kid("b", "B", 5)])).toEqual({ count: 2, yearsAway: 21 });
    expect(weddingDefaults([])).toBeNull();
    const w = planWeddings({ count: 2, yearsAway: 10, costToday: 1_000_000, inflation: 7 });
    expect(w.totalCost).toBeCloseTo(2 * 1_000_000 * 1.07 ** 10);
    expect(w.monthlySIP).toBeCloseTo(requiredMonthlySIP(w.totalCost, 12, 10));
  });

  it("new child: birth costs saved for, five years of care inflated", () => {
    const c = planNewChild({ yearsToBirth: 2, birthCosts: 200_000, monthlyCare: 10_000, inflation: 10 });
    expect(c.futureBirthCosts).toBeCloseTo(242_000);
    expect(c.fiveYearTotal).toBeCloseTo(242_000 + [2, 3, 4, 5, 6].reduce((s, y) => s + 120_000 * 1.1 ** y, 0));
    expect(planNewChild({ yearsToBirth: 0, birthCosts: 1, monthlyCare: 0, inflation: 0 }).monthlySIP).toBe(0);
  });

  it("emergency fund never divides by zero", () => {
    expect(planEmergency({ monthlyExpenses: 50_000, months: 6, currentSavings: 100_000, timeframeMonths: 0 })).toMatchObject({
      targetFund: 300_000,
      gap: 200_000,
      monthlySavings: 200_000,
    });
  });
});

describe("roadmap simulation", () => {
  it("rises while saving, drops when a cost is paid, and ends near zero", () => {
    const r = simulateRoadmap({ currentYear: 2026, costs: [{ label: "Fees", yearsFromNow: 3, amount: 500_000 }] });
    const atThree = r.points.filter((p) => p.t === 3);
    expect(atThree).toHaveLength(2); // before and after paying: a vertical drop
    expect(atThree[0].balance).toBeCloseTo(500_000, -1);
    expect(atThree[1]).toMatchObject({ paid: 500_000, paidFor: "Fees" });
    expect(atThree[1].balance).toBeLessThan(1);
    expect(r.monthlyNow).toBeCloseTo(requiredMonthlySIP(500_000, 12, 3));
  });

  it("is not one smooth curve when there are several costs", () => {
    const r = simulateRoadmap({
      currentYear: 2026,
      costs: [
        { label: "School", yearsFromNow: 2, amount: 200_000 },
        { label: "College", yearsFromNow: 5, amount: 1_000_000 },
      ],
    });
    const drops = r.points.filter((p) => p.paid);
    expect(drops.map((d) => d.t)).toEqual([2, 5]);
    expect(r.points.find((p) => p.t === 2 && p.paid)!.balance).toBeGreaterThan(0); // college money is still there
  });

  it("keeps costs due now out of the SIPs, and keeps an emergency fund", () => {
    const r = simulateRoadmap({
      currentYear: 2026,
      costs: [{ label: "This year's fees", yearsFromNow: 0, amount: 100_000 }],
      emergency: { monthly: 10_000, months: 12 },
    });
    expect(r.dueNow).toBe(100_000);
    expect(r.monthlyNow).toBe(10_000);
    expect(r.points.at(-1)!.balance).toBeGreaterThan(120_000); // built and still held
  });
});
