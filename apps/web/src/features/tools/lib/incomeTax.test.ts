import { describe, expect, it } from "vitest";
import { newRegimeTax, oldRegimeTax, type OldRegimeInput } from "./incomeTax";

const base: OldRegimeInput = {
  grossSalary: 0, otherIncome: 0, homeLoanInterest: 0, basicDeductions: 0,
  npsContribution: 0, medicalInsurance: 0, donations: 0, educationLoanInterest: 0,
  age: "Below 60",
};
const old = (o: Partial<OldRegimeInput>) => oldRegimeTax({ ...base, ...o });
const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1);

describe("new regime", () => {
  it("FY25-26: ₹12.75L salary is nil (taxable 12L, 87A)", () => near(newRegimeTax(1275000, 0, "2025-2026"), 0));
  it("FY25-26: ₹15L salary → taxable 14.25L: 20k+40k+0.15*2.25L=93,750 ×1.04", () =>
    near(newRegimeTax(1500000, 0, "2025-2026"), 93750 * 1.04));
  it("FY25-26: marginal relief just above 12L (taxable 12.1L → tax = 10k)", () =>
    near(newRegimeTax(1285000, 0, "2025-2026"), 10000 * 1.04));
  it("FY24-25: ₹7.75L salary is nil", () => near(newRegimeTax(775000, 0, "2024-2025"), 0));
  it("FY24-25: ₹10L salary → taxable 9.25L: 20k+0.1*2.25L=42,500 ×1.04", () =>
    near(newRegimeTax(1000000, 0, "2024-2025"), 42500 * 1.04));
  it("FY23-24: ₹7.5L salary is nil (std ded 50k)", () => near(newRegimeTax(750000, 0, "2023-2024"), 0));
});

describe("old regime", () => {
  it("₹5.5L salary below 60 → taxable 5L → nil (87A)", () => near(old({ grossSalary: 550000 }), 0));
  it("₹10L salary, no deductions → taxable 9.5L: 12.5k+90k=1,02,500 ×1.04", () =>
    near(old({ grossSalary: 1000000 }), 102500 * 1.04));
  it("80C is capped at 1.5L", () =>
    near(old({ grossSalary: 1000000, basicDeductions: 500000 }), old({ grossSalary: 1000000, basicDeductions: 150000 })));
  it("80D is capped", () =>
    near(old({ grossSalary: 1000000, medicalInsurance: 900000 }), old({ grossSalary: 1000000, medicalInsurance: 100000 })));
  it("senior: exemption 3L → taxable 9.5L: 10k+90k=1,00,000 ×1.04", () =>
    near(old({ grossSalary: 1000000, age: "Senior (60-80)" }), 100000 * 1.04));
  it("super senior: exemption 5L → taxable 9.5L: 0.2*4.5L=90,000 ×1.04", () =>
    near(old({ grossSalary: 1000000, age: "Super Senior (80+)" }), 90000 * 1.04));
  it("super senior above 10L: taxable 14.5L: 1,00,000+0.3*4.5L=2,35,000 ×1.04", () =>
    near(old({ grossSalary: 1500000, age: "Super Senior (80+)" }), 235000 * 1.04));
});

describe("surcharge", () => {
  it("new regime ₹60L salary → taxable 59.25L; 10% surcharge applies", () => {
    const taxable = 6000000 - 75000;
    const slab = 20000 + 40000 + 60000 + 80000 + 100000 + (taxable - 2400000) * 0.3;
    expect(newRegimeTax(6000000, 0, "2025-2026")).toBeGreaterThan(slab * 1.04);
    expect(newRegimeTax(6000000, 0, "2025-2026")).toBeLessThanOrEqual(slab * 1.1 * 1.04 + 1);
  });
  it("marginal relief: crossing ₹50L never costs more than the extra income", () => {
    const at = newRegimeTax(5075000, 0, "2025-2026"); // taxable exactly 50L
    const above = newRegimeTax(5075000 + 10000, 0, "2025-2026");
    expect(above - at).toBeLessThanOrEqual(10000 * 1.04 + 1);
  });
  it("new regime surcharge is capped at 25% (₹6Cr vs old regime 37%)", () => {
    const taxable = 60000000 - 75000;
    const slab = 20000 + 40000 + 60000 + 80000 + 100000 + (taxable - 2400000) * 0.3;
    near(newRegimeTax(60000000, 0, "2025-2026"), slab * 1.25 * 1.04);
  });
});
