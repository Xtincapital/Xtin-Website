import { describe, expect, it } from "vitest";
import { titleForPath } from "./SEO";

describe("titleForPath", () => {
  it.each([
    ["/journal", "Trading Journal | Xtin Capital"],
    ["/gini/monte-carlo", "Monte Carlo – Gini AI Planner | Xtin Capital"],
    ["/tools/nps", "NPS Calculator – Financial Calculators | Xtin Capital"],
    ["/intro/tools", "Financial Calculators | Xtin Capital"],
    ["/help", "Help Center | Xtin Capital"],
    ["/learn/emergency-fund-lesson-3", "Emergency Fund Lesson 3 – Xtin Academy | Xtin Capital"],
    ["/fundakamental/report/518a53d6-4338-46fa-a810-8da6c1ec4d2b", "Report – Fundakamental | Xtin Capital"],
  ])("%s → %s", (path, title) => {
    expect(titleForPath(path)).toBe(title);
  });

  it("falls back to the site title for the root", () => {
    expect(titleForPath("/")).toMatch(/^Xtin Capital \|/);
  });
});
