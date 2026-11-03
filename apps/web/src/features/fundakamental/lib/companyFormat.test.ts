import { describe, it, expect } from "vitest";
import { makeMoney, pctText, ratioText, toNum, isIndianCompany, yearLabel, quarterLabel } from "./companyFormat";

describe("companyFormat", () => {
  it("shows Indian money in crore and US money in B/M", () => {
    expect(makeMoney(true)(10572190000000)).toBe("₹10,57,219 Cr");
    expect(makeMoney(false)(416161000000)).toBe("$416.2B");
    expect(makeMoney(false)(500_000_000)).toBe("$500M");
    expect(makeMoney(false)(4937503211520)).toBe("$4.94T");
  });
  it("puts the minus sign before the currency symbol", () => {
    expect(makeMoney(true)(-259560000000)).toBe("-₹25,956 Cr");
    expect(makeMoney(false)(-2_500_000_000)).toBe("-$2.5B");
  });
  it("shows a dash for missing values", () => {
    expect(makeMoney(true)(null)).toBe("—");
    expect(pctText(undefined)).toBe("—");
    expect(ratioText(NaN)).toBe("—");
  });
  it("formats percentages and ratios", () => {
    expect(pctText(9.5912)).toBe("9.6%");
    expect(ratioText(0.44025)).toBe("0.44");
  });
  it("coerces string numerics and rejects junk", () => {
    expect(toNum("123")).toBe(123);
    expect(toNum("")).toBeNull();
    expect(toNum(null)).toBeNull();
    expect(toNum("abc")).toBeNull();
  });
  it("detects Indian companies by suffix or currency", () => {
    expect(isIndianCompany("TCS.NS")).toBe(true);
    expect(isIndianCompany("AAPL", "INR")).toBe(true);
    expect(isIndianCompany("AAPL", "USD")).toBe(false);
  });
  it("labels fiscal years by their end year, quarters by month", () => {
    expect(yearLabel("2026-03-31")).toBe("FY26");
    expect(yearLabel("2025-09-30")).toBe("FY25");
    expect(quarterLabel("2026-06-30")).toBe("Jun 26");
  });
});
