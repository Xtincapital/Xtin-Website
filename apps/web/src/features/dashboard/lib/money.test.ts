import { describe, expect, it } from "vitest";
import type { Asset, FamilyMember, Goal, Liability } from "@/features/gini/lib/api";
import type { MoneyProfile } from "../services/moneyService";
import {
  allocation,
  healthParts,
  healthScore,
  household,
  inrShort,
  planGoals,
  projectNetWorth,
  sipFactor,
  weeklyActions,
} from "./money";

const stamp = { user_id: "u", created_at: "", updated_at: "" };

const member = (over: Partial<FamilyMember>): FamilyMember => ({
  id: "m1",
  name: "Rohan",
  relationship: "Self",
  age: 32,
  income: 160000,
  is_earner: true,
  is_dependent: false,
  retirement_age: 60,
  life_expectancy: 85,
  ...stamp,
  ...over,
});

const asset = (over: Partial<Asset>): Asset => ({
  id: "a",
  name: "Asset",
  category: "Mutual Funds",
  value: 100000,
  return_rate: null,
  ownership_type: "Individual",
  owner: null,
  joint_share: null,
  ...stamp,
  ...over,
});

const loan = (over: Partial<Liability>): Liability => ({
  id: "l",
  name: "Loan",
  type: "Personal Loan",
  amount: 420000,
  rate: 12,
  emi: 18000,
  tenure: 24,
  ownership_type: "Individual",
  owner: null,
  joint_share: null,
  ...stamp,
  ...over,
});

const goal = (over: Partial<Goal>): Goal => ({
  id: "g",
  name: "Goal",
  category: "Others",
  current_cost: 1000000,
  target_year: 2030,
  priority: "Medium",
  inflation: 6,
  saved: 0,
  return_rate: 12,
  assigned_to: null,
  funded_by: null,
  funding_split: null,
  ...stamp,
  ...over,
});

describe("formatting", () => {
  it("shortens lakhs and crores", () => {
    expect(inrShort(45620)).toBe("₹45,620");
    expect(inrShort(450000)).toBe("₹4.5L");
    expect(inrShort(800000)).toBe("₹8L");
    expect(inrShort(65000000)).toBe("₹6.5 Cr");
  });
});

describe("household", () => {
  it("adds up earners, EMIs and net worth", () => {
    const h = household(
      [member({}), member({ id: "m2", relationship: "Spouse", income: 40000 }), member({ id: "m3", relationship: "Child", is_earner: false, income: 0, age: 4 })],
      [asset({ value: 3000000 }), asset({ value: 2000000, category: "Stocks" })],
      [loan({})],
    );
    expect(h.age).toBe(32);
    expect(h.monthlyIncome).toBe(200000);
    expect(h.monthlyEmi).toBe(18000);
    expect(h.netWorth).toBe(5000000 - 420000);
  });
});

describe("allocation", () => {
  it("groups by category, biggest first, skipping empty assets", () => {
    const slices = allocation([
      asset({ value: 100, category: "Gold" }),
      asset({ value: 300, category: "Stocks" }),
      asset({ value: 100, category: null }),
      asset({ value: 0, category: "Cash" }),
    ]);
    expect(slices.map((s) => s.name)).toEqual(["Stocks", "Gold", "Others"]);
    expect(slices[0].share).toBeCloseTo(0.6);
  });
});

describe("projectNetWorth", () => {
  it("grows assets and pays loans down", () => {
    const series = projectNetWorth([asset({ value: 100000, return_rate: 10 })], [loan({ amount: 100000, rate: 0, emi: 5000 })], 2);
    expect(series[0]).toBe(0);
    expect(series[1]).toBeCloseTo(110000 - 40000);
    expect(series[2]).toBeCloseTo(121000 - 0);
  });
});

describe("planGoals", () => {
  it("matches the Gini Goals page SIP when there is no step-up", () => {
    // Gini: target = cost * 1.06^4, SIP = gap * r / ((1+r)^48 - 1) with r = 1%.
    const { goals } = planGoals([goal({ saved: 200000 })], 0, 0, 2026);
    const target = 1000000 * Math.pow(1.06, 4);
    const gap = target - 200000 * Math.pow(1.12, 4);
    const giniSip = (gap * 0.01) / (Math.pow(1.01, 48) - 1);
    expect(goals[0].target).toBeCloseTo(target);
    expect(goals[0].required).toBe(Math.ceil(giniSip / 100) * 100);
    expect(goals[0].ok).toBe(false);
  });

  it("funds the nearest goal first and reports what is left", () => {
    const near = goal({ id: "near", name: "Car", target_year: 2028, current_cost: 600000 });
    const far = goal({ id: "far", name: "Home", target_year: 2035, current_cost: 3000000 });
    const needs = planGoals([far, near], 0, 0, 2026).goals;
    expect(needs.map((g) => g.id)).toEqual(["near", "far"]);
    const nearNeed = needs[0].required;

    const partly = planGoals([far, near], nearNeed, 0, 2026);
    expect(partly.goals[0].ok).toBe(true);
    expect(partly.goals[1].ok).toBe(false);

    const all = planGoals([far, near], nearNeed + needs[1].required + 5000, 0, 2026);
    expect(all.goals.every((g) => g.ok)).toBe(true);
    expect(all.spare).toBe(5000);
  });

  it("needs less each month with a yearly step-up", () => {
    const flat = planGoals([goal({ target_year: 2040 })], 0, 0, 2026).goals[0].required;
    const stepped = planGoals([goal({ target_year: 2040 })], 0, 0.1, 2026).goals[0].required;
    expect(stepped).toBeLessThan(flat);
  });

  it("treats goals already covered by savings as on track", () => {
    const { goals, totalRequired } = planGoals([goal({ saved: 2000000 })], 0, 0, 2026);
    expect(goals[0].required).toBe(0);
    expect(goals[0].ok).toBe(true);
    expect(totalRequired).toBe(0);
  });

  it("flags past-due goals that aren't funded", () => {
    const { goals } = planGoals([goal({ target_year: 2024, saved: 10 })], 50000, 0, 2026);
    expect(goals[0].overdue).toBe(true);
    expect(goals[0].ok).toBe(false);
  });

  it("marks goals unknown, not behind, until the monthly amount is set", () => {
    const covered = goal({ id: "covered", saved: 2000000 });
    const needs = goal({ id: "needs", target_year: 2035 });
    const unset = planGoals([covered, needs], null, 0, 2026).goals;
    expect(unset.find((g) => g.id === "covered")).toMatchObject({ ok: true, unknown: false });
    expect(unset.find((g) => g.id === "needs")).toMatchObject({ ok: false, unknown: true });

    const zero = planGoals([covered, needs], 0, 0, 2026).goals;
    expect(zero.find((g) => g.id === "needs")).toMatchObject({ ok: false, unknown: false });
  });

  it("sipFactor equals the annuity formula without step-up", () => {
    expect(sipFactor(0.01, 12)).toBeCloseTo((Math.pow(1.01, 12) - 1) / 0.01);
    expect(sipFactor(0, 24)).toBe(24);
  });
});

const profile = (over: Partial<MoneyProfile> = {}): MoneyProfile => ({
  monthlyInvesting: null,
  stepUp: 0,
  monthlyExpenses: null,
  termCover: null,
  healthCover: null,
  updatedAt: null,
  ...over,
});

describe("money health", () => {
  it("has no score until two parts are known", () => {
    const h = household([], [], []);
    const parts = healthParts(h, [], [], [], [], null);
    expect(parts.map((p) => p.key)).toEqual(["safety", "debt", "savings", "insurance", "goals"]);
    expect(parts.every((p) => p.value == null)).toBe(true);
    expect(healthScore(parts)).toBeNull();
  });

  it("reads savings rate, insurance and safety net from the money basics", () => {
    const h = household([member({ income: 160000 })], [asset({ value: 480000, category: "Fixed Deposits" })], []);
    const parts = healthParts(h, [asset({ value: 480000, category: "Fixed Deposits" })], [], [], [], profile({ monthlyInvesting: 16000, monthlyExpenses: 60000, termCover: 19200000, healthCover: 300000 }));
    const by = Object.fromEntries(parts.map((p) => [p.key, p]));
    expect(by.savings).toMatchObject({ short: "10%", value: 0.5 });
    expect(by.insurance.value).toBeCloseTo(1);
    expect(by.insurance.text).toMatch(/on the low side/);
    expect(by.safety).toMatchObject({ short: "8.0 / 6 mo", value: 1 });
    expect(by.safety.asks?.[0].field).toBe("monthlyExpenses");

    const none = healthParts(h, [], [], [], [], null);
    expect(none.find((p) => p.key === "insurance")!.asks?.map((a) => a.field)).toEqual(["termCover", "healthCover"]);
  });

  it("scores a full household and suggests the weakest fixes first", () => {
    const members = [member({})];
    const assets = [asset({ value: 3000000, category: "Real Estate" }), asset({ value: 500000, category: "Mutual Funds" })];
    const loans = [loan({})];
    const goals = [
      goal({ id: "ef", name: "Emergency fund", category: "Emergency Fund", current_cost: 360000, saved: 150000, target_year: 2027, details: { mode: "guided", answers: { monthly_expenses: "60000", months: "6" } } }),
      goal({ id: "car", name: "Car", target_year: 2029, current_cost: 800000, saved: 240000 }),
    ];
    const h = household(members, assets, loans);
    const basics = profile({ monthlyInvesting: 0, termCover: 10000000 });
    const plan = planGoals(goals, 0, 0, 2026).goals;
    const parts = healthParts(h, assets, loans, goals, plan, basics);

    const safety = parts.find((p) => p.key === "safety")!;
    expect(safety.short).toBe("2.5 / 6 mo");
    expect(safety.tone).toBe("bad");
    expect(safety.asks).toEqual([]);

    const score = healthScore(parts);
    expect(score).not.toBeNull();

    // Monthly amount not set: goals are left out of the score and setting it comes first.
    const unsetPlan = planGoals(goals, null, 0, 2026).goals;
    const unsetParts = healthParts(h, assets, loans, goals, unsetPlan, profile({ termCover: 10000000 }));
    expect(unsetParts.find((p) => p.key === "goals")!.value).toBeNull();
    const unsetActions = weeklyActions(unsetParts, unsetPlan);
    expect(unsetActions[0].key).toBe("set-monthly");
    expect(unsetActions.some((a) => a.key.startsWith("goal-") || a.key === "savings")).toBe(false);

    const actions = weeklyActions(parts, plan);
    expect(actions.length).toBeLessThanOrEqual(3);
    expect(actions[0].points).toBeGreaterThan(0);
    for (let i = 1; i < actions.length; i++) expect(actions[i - 1].points ?? 0).toBeGreaterThanOrEqual(actions[i].points ?? 0);
  });

  it("asks for missing basics on the ring itself", () => {
    const h = household([member({})], [asset({})], []);
    const parts = healthParts(h, [asset({})], [], [], [], profile({ monthlyInvesting: 40000 }));
    const insurance = weeklyActions(parts, []).find((a) => a.key === "insurance")!;
    expect(insurance).toMatchObject({ href: "#health-insurance", points: null, unlocks: "Adds to your score" });
  });
});
