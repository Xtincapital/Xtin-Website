// Indian income-tax maths for the Income Tax calculator (resident individual).
// Kept free of React so it can be unit-tested.

export type AgeGroup = "Below 60" | "Senior (60-80)" | "Super Senior (80+)";
type Slab = [upper: number, rate: number];

// ── New regime (Sec 115BAC), per financial year ──────────────────────────
// Slabs, standard deduction on salary, and the Sec 87A rebate limit (tax is
// nil up to this taxable income, with marginal relief just above it).
export const NEW_REGIME: Record<string, { slabs: Slab[]; standardDeduction: number; rebateLimit: number }> = {
  "2025-2026": {
    slabs: [[400000, 0], [800000, 0.05], [1200000, 0.1], [1600000, 0.15], [2000000, 0.2], [2400000, 0.25], [Infinity, 0.3]],
    standardDeduction: 75000,
    rebateLimit: 1200000,
  },
  "2024-2025": {
    slabs: [[300000, 0], [700000, 0.05], [1000000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]],
    standardDeduction: 75000,
    rebateLimit: 700000,
  },
  "2023-2024": {
    slabs: [[300000, 0], [600000, 0.05], [900000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]],
    standardDeduction: 50000,
    rebateLimit: 700000,
  },
};

// ── Old regime ───────────────────────────────────────────────────────────
// Same slabs every year; only the basic exemption differs by age.
const OLD_REGIME_SLABS: Record<AgeGroup, Slab[]> = {
  "Below 60": [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]],
  "Senior (60-80)": [[300000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]],
  "Super Senior (80+)": [[500000, 0], [1000000, 0.2], [Infinity, 0.3]],
};
export const OLD_REGIME_STANDARD_DEDUCTION = 50000;
const OLD_REGIME_REBATE_LIMIT = 500000; // Sec 87A: nil tax up to ₹5L taxable income

const CAP_80C = 150000;
const CAP_80CCD_1B = 50000;
const CAP_HOME_LOAN_INTEREST = 200000; // Sec 24(b), self-occupied
const CAP_80D = 100000; // max possible: ₹50k self (senior) + ₹50k parents (senior)

// Surcharge tiers on tax: income above `over` → `rate`. The new regime caps at 25%.
const SURCHARGE_TIERS: [over: number, rate: number][] = [
  [50000000, 0.37],
  [20000000, 0.25],
  [10000000, 0.15],
  [5000000, 0.1],
];

const taxOnSlabs = (income: number, slabs: Slab[]) => {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (income <= lower) break;
    tax += (Math.min(income, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
};

/** Tax after surcharge (with marginal relief at each threshold), before cess. */
const withSurcharge = (income: number, baseTax: (i: number) => number, maxRate: number): number => {
  const tier = SURCHARGE_TIERS.find(([over]) => income > over);
  const tax = baseTax(income);
  if (!tier) return tax;
  const [threshold, rawRate] = tier;
  const total = tax * (1 + Math.min(rawRate, maxRate));
  // Marginal relief: extra tax can't exceed the income earned above the threshold.
  const cap = withSurcharge(threshold, baseTax, maxRate) + (income - threshold);
  return Math.min(total, cap);
};

const CESS = 1.04;
const valid = (n: number) => (Number.isFinite(n) ? n : 0);

export interface OldRegimeInput {
  grossSalary: number;
  otherIncome: number;
  homeLoanInterest: number;
  basicDeductions: number; // 80C
  npsContribution: number; // 80CCD(1B)
  medicalInsurance: number; // 80D
  donations: number; // 80G (treated as fully deductible)
  educationLoanInterest: number; // 80E (no cap)
  age: AgeGroup;
}

export function oldRegimeTaxableIncome(i: OldRegimeInput) {
  const salary = valid(i.grossSalary);
  return (
    salary + valid(i.otherIncome)
    - Math.min(salary, OLD_REGIME_STANDARD_DEDUCTION)
    - Math.min(valid(i.homeLoanInterest), CAP_HOME_LOAN_INTEREST)
    - Math.min(valid(i.basicDeductions), CAP_80C)
    - Math.min(valid(i.npsContribution), CAP_80CCD_1B)
    - Math.min(valid(i.medicalInsurance), CAP_80D)
    - valid(i.donations)
    - valid(i.educationLoanInterest)
  );
}

export function oldRegimeTax(i: OldRegimeInput) {
  const income = oldRegimeTaxableIncome(i);
  if (!(income > 0)) return 0;
  const slabs = OLD_REGIME_SLABS[i.age] || OLD_REGIME_SLABS["Below 60"];
  const base = (x: number) => (x <= OLD_REGIME_REBATE_LIMIT ? 0 : taxOnSlabs(x, slabs));
  return withSurcharge(income, base, 0.37) * CESS;
}

export function newRegimeTaxableIncome(grossSalary: number, otherIncome: number, financialYear: string) {
  const rules = NEW_REGIME[financialYear] || NEW_REGIME["2025-2026"];
  const salary = valid(grossSalary);
  return salary + valid(otherIncome) - Math.min(salary, rules.standardDeduction);
}

export function newRegimeTax(grossSalary: number, otherIncome: number, financialYear: string) {
  const rules = NEW_REGIME[financialYear] || NEW_REGIME["2025-2026"];
  const income = newRegimeTaxableIncome(grossSalary, otherIncome, financialYear);
  if (!(income > 0)) return 0;
  const base = (x: number) => {
    const tax = taxOnSlabs(x, rules.slabs);
    if (x <= rules.rebateLimit) return 0;
    // Marginal relief on the 87A rebate: tax can't exceed the income above the limit.
    return Math.min(tax, x - rules.rebateLimit);
  };
  return withSurcharge(income, base, 0.25) * CESS;
}
