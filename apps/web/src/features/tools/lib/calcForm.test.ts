import { describe, expect, it } from "vitest";
import { limitProblem } from "./calcForm";

describe("limitProblem", () => {
  it("accepts realistic inputs", () => {
    expect(limitProblem({ amount: 5000, rate: 0.12, years: 10 })).toBe("");
    expect(limitProblem({ amount: 1e10, rate: 0.5, years: 60 })).toBe("");
  });

  it("rejects values above the caps", () => {
    expect(limitProblem({ amount: 999999999999 })).toMatch(/Amount/);
    expect(limitProblem({ rate: 5 })).toMatch(/50%/);
    expect(limitProblem({ years: 100 })).toMatch(/60 years/);
  });

  it("ignores inputs that are not passed", () => {
    expect(limitProblem({})).toBe("");
  });
});
