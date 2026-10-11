import { describe, it, expect, beforeAll } from "vitest";
import { setRegion } from "@/lib/region";
import { answersFromMember, answersToSave, computeGoal, defaultGoalName, detailsSummary, seedAnswers, updateAnswer } from "./goalCategories";

const at = { currentYear: 2026, inflation: 6 };
const run = (category: string, answers: Record<string, string>, inflation = 6) =>
  computeGoal(category, seedAnswers(category, answers), { ...at, inflation });

// Amounts in the text follow the selected currency; these expectations are in rupees.
beforeAll(() => setRegion("IN"));

describe("goal category questions", () => {
  it("Education: yearly cost × course length, year from the child's age", () => {
    const r = run("Education", { level: "Engineering / Medical", current_age: "8", annual_cost: "400000" });
    expect(r.problems).toEqual([]);
    expect(r.cost).toBe(2_000_000); // 4L × 5 years (suggested length for engineering)
    expect(r.targetYear).toBe(2036); // starts at 18, child is 8
  });

  it("Education: picking another course moves suggested start age and length, but not typed ones", () => {
    let a = seedAnswers("Education", {});
    expect(a).toMatchObject({ level: "Undergraduate degree", start_age: "18", duration: "3" });
    a = updateAnswer("Education", a, "duration", "4"); // typed by the user
    a = updateAnswer("Education", a, "level", "Postgraduate / MBA");
    expect(a).toMatchObject({ start_age: "22", duration: "4" });
  });

  it("Education: a course that has already started is planned for next year", () => {
    const r = run("Education", { level: "Undergraduate degree", current_age: "19", annual_cost: "100000" });
    expect(r.targetYear).toBe(2027);
    expect(r.breakdown.join(" ")).toMatch(/next year/);
  });

  it("Home: down payment + charges + interiors, loan shown separately", () => {
    const r = run("Home Purchase", { price: "8000000", interiors: "500000" });
    expect(r.cost).toBe(1_600_000 + 560_000 + 500_000); // 20% + 7% + interiors
    expect(r.targetYear).toBe(2031);
    expect(r.breakdown.join(" ")).toMatch(/loan.*64,00,000/);
  });

  it("Car: full payment vs down payment only", () => {
    expect(run("Car", { price: "1000000" }).cost).toBe(1_000_000);
    expect(run("Car", { price: "1000000", payment: "Down payment + car loan", down_pct: "25" }).cost).toBe(250_000);
  });

  it("Retirement: today's-money corpus that covers inflation-rising expenses", () => {
    const r = run("Retirement", { current_age: "35", monthly_expenses: "50000", post_return: "6" }, 6);
    // Return equals inflation, so the corpus is simply 25 years of today's expenses.
    expect(r.cost).toBe(50_000 * 12 * 25);
    expect(r.targetYear).toBe(2051);
    const higher = run("Retirement", { current_age: "35", monthly_expenses: "50000", post_return: "8" }, 6);
    expect(higher.cost!).toBeLessThan(r.cost!);
  });

  it("Retirement: expenses must run past the retirement age", () => {
    const r = run("Retirement", { current_age: "35", retirement_age: "60", life_expectancy: "55", monthly_expenses: "1", post_return: "8" });
    expect(r.cost).toBeNull();
    expect(r.problems[0]).toMatch(/after retirement/);
  });

  it("Vacation, Emergency Fund and Wedding add up their parts", () => {
    expect(run("Vacation", { travellers: "4", per_person: "150000" })).toMatchObject({ cost: 600_000, targetYear: 2027 });
    expect(run("Emergency Fund", { monthly_expenses: "60000", months: "6" })).toMatchObject({ cost: 360_000, targetYear: 2027 });
    expect(run("Wedding", { current_age: "24", ceremony: "1500000", jewellery: "800000" })).toMatchObject({ cost: 2_300_000, targetYear: 2029 });
  });

  it("lists what's still missing instead of inventing numbers", () => {
    const r = run("Education", { current_age: "8" });
    expect(r.cost).toBeNull();
    expect(r.problems.some((p) => /Yearly cost/.test(p))).toBe(true);
  });

  it("prefills ages from the family member", () => {
    const a = answersFromMember("Retirement", {}, { age: 40, retirement_age: 58, life_expectancy: 90 } as any);
    expect(a).toEqual({ current_age: "40", retirement_age: "58", life_expectancy: "90" });
  });

  it("saves only the questions shown, and names and summarises the goal", () => {
    const a = seedAnswers("Car", { price: "900000" });
    expect(answersToSave("Car", a)).not.toHaveProperty("down_pct"); // only asked when taking a loan
    expect(defaultGoalName("Education", { level: "Undergraduate degree" }, { name: "Aarav Kumar" } as any)).toBe("Aarav's graduation");
    expect(detailsSummary("Car", { mode: "guided", answers: answersToSave("Car", a) })).toBe("On-road ₹9,00,000 · full payment");
    expect(detailsSummary("Car", { mode: "manual" })).toBeNull();
    expect(detailsSummary("Car", null)).toBeNull();
  });
});
