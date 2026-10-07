import { describe, it, expect, vi } from "vitest";
import { buildGiniCsv, countBySection, parseCsv, parseGiniCsv, type GiniData } from "./giniDataCsv";
import { applyGiniImport } from "./giniDataImport";

const stamp = { user_id: "u1", created_at: "", updated_at: "" };

const data: GiniData = {
  family: [
    { ...stamp, id: "m1", name: "Ravi", relationship: "Self", age: 40, income: 1500000, is_earner: true, is_dependent: false, retirement_age: 60, life_expectancy: 85 },
    { ...stamp, id: "m2", name: "Asha, Jr", relationship: "Child", age: 8, income: null, is_earner: false, is_dependent: true, retirement_age: null, life_expectancy: null },
    { ...stamp, id: "m3", name: "Kamla", relationship: "Parent", age: 70, income: null, is_earner: false, is_dependent: true, retirement_age: null, life_expectancy: 88 },
  ],
  assets: [{ ...stamp, id: "a1", name: 'HDFC "Flexi" Cap', category: "Mutual Funds", value: 250000, return_rate: 12, ownership_type: "Individual", owner: "m1", joint_share: null }],
  liabilities: [{ ...stamp, id: "l1", name: "Home Loan", type: "Home Loan", amount: 3200000, rate: 8.5, emi: 32000, tenure: 180, ownership_type: "Joint", owner: "m1", joint_share: 50 }],
  goals: [
    { ...stamp, id: "g1", name: "Retirement", category: "Retirement", current_cost: 20000000, target_year: 2046, priority: "High", inflation: 6, saved: 500000, return_rate: 10, assigned_to: null, funded_by: null, funding_split: 60 },
  ],
  elderCare: [{ ...stamp, id: "e1", member_id: "m3", monthly_support: 25000, medical_reserve: 500000, life_expectancy: 88, years_remaining: 18 }],
  education: [{ ...stamp, id: "ed1", child_id: "m2", milestone: "College", target_year: 2036, cost: 2500000, saved: 100000, ppf_account: "PPF-123", years_remaining: 10 }],
  tax: { ...stamp, deductions_80c: { ppf: 150000, elss: 0 }, deductions_80d: { selfHealth: 25000 }, deductions_80e: {}, huf_benefits: true },
};

describe("Gini data CSV", () => {
  it("round-trips everything through download → upload", () => {
    const parsed = parseGiniCsv(buildGiniCsv(data));
    expect(parsed.problems).toEqual([]);
    expect(countBySection(parsed)).toEqual({ Family: 3, Asset: 1, Liability: 1, Goal: 1, "Elder Care": 1, Education: 1, Tax: 1 });

    const bySection = Object.fromEntries(parsed.records.map((r) => [r.section, r]));
    expect(parsed.records[0].data).toMatchObject({ name: "Ravi", age: 40, income: 1500000, is_earner: true, is_dependent: false });
    expect(parsed.records[1].data).toMatchObject({ name: "Asha, Jr" }); // comma survives quoting
    expect(bySection.Asset).toMatchObject({ member: "Ravi", data: { name: 'HDFC "Flexi" Cap', value: 250000, return_rate: 12, ownership_type: "Individual" } });
    expect(bySection.Liability).toMatchObject({ data: { amount: 3200000, rate: 8.5, emi: 32000, tenure: 180, ownership_type: "Joint", joint_share: 50 } });
    expect(bySection.Goal).toMatchObject({ member: null, data: { current_cost: 20000000, target_year: 2046, saved: 500000, inflation: 6, funding_split: 60 } });
    expect(bySection["Elder Care"]).toMatchObject({ member: "Kamla", data: { monthly_support: 25000, medical_reserve: 500000 } });
    expect(bySection.Education).toMatchObject({ member: "Asha, Jr", data: { milestone: "College", cost: 2500000, ppf_account: "PPF-123" } });
    expect(parsed.tax).toMatchObject({ deductions_80c: { ppf: 150000 }, deductions_80d: { selfHealth: 25000 }, huf_benefits: true });
  });

  it("writes only the header for an empty account", () => {
    const csv = buildGiniCsv({ family: [], assets: [], liabilities: [], goals: [], elderCare: [], education: [], tax: null });
    expect(csv.trim().split("\n")).toHaveLength(1);
    expect(parseGiniCsv(csv).records).toEqual([]);
  });

  it("accepts a hand-made file with only some columns, ₹ and commas in amounts", () => {
    const parsed = parseGiniCsv("section,name,amount,category\r\nassets,Gold,\"₹1,20,000\",Gold\r\nloan,Car Loan,450000,\n");
    expect(parsed.problems).toEqual([]);
    expect(parsed.records).toMatchObject([
      { section: "Asset", data: { name: "Gold", value: 120000, category: "Gold" } },
      { section: "Liability", data: { name: "Car Loan", amount: 450000, type: null } },
    ]);
  });

  it("reports rows it can't read with their line numbers", () => {
    const parsed = parseGiniCsv(
      ["Section,Name,Amount,Ownership", "Asset,,100,", "Liability,Loan,0,", "Goal,Car,abc,", "Pets,Rex,1,", "Asset,FD,100,Shared", "Asset,OK,5,"].join("\n"),
    );
    expect(parsed.problems.map((p) => p.line)).toEqual([2, 3, 4, 5, 6]);
    expect(parsed.records).toHaveLength(1);
  });

  it("rejects a file that isn't a Gini data file", () => {
    expect(parseGiniCsv("Date,Asset,Qty\n2026-01-01,INFY,1").problems[0].message).toMatch(/Section/);
  });

  it("parses quoted CSV cells with newlines and escaped quotes", () => {
    expect(parseCsv('a,"b ""x""\nc",d\n')).toEqual([["a", 'b "x"\nc', "d"]]);
  });
});

describe("applying an upload", () => {
  const fakeApi = () => {
    let n = 0;
    const created = (body: any) => Promise.resolve({ ...body, id: `new${++n}` });
    const ok = () => Promise.resolve({});
    return {
      familyMembers: { createFamilyMember: vi.fn(created), updateFamilyMember: vi.fn(ok) },
      assets: { createAsset: vi.fn(created), updateAsset: vi.fn(ok) },
      liabilities: { createLiability: vi.fn(created), updateLiability: vi.fn(ok) },
      goals: { createGoal: vi.fn(created), updateGoal: vi.fn(ok) },
      elderCare: { createPlan: vi.fn(created), updatePlan: vi.fn(ok) },
      educationPlans: { createPlan: vi.fn(created), updatePlan: vi.fn(ok) },
      taxOptimization: { update: vi.fn(ok) },
    } as any;
  };
  const empty: GiniData = { family: [], assets: [], liabilities: [], goals: [], elderCare: [], education: [], tax: null };

  it("re-uploading the downloaded file updates in place instead of duplicating", async () => {
    const client = fakeApi();
    const out = await applyGiniImport(parseGiniCsv(buildGiniCsv(data)), data, { isPro: true, client, pauseMs: 0 });
    expect(out).toMatchObject({ created: 0, updated: 9, failed: [] });
    expect(client.assets.createAsset).not.toHaveBeenCalled();
    expect(client.assets.updateAsset).toHaveBeenCalledWith("a1", expect.objectContaining({ owner: "m1", value: 250000 }));
    expect(client.educationPlans.updatePlan).toHaveBeenCalledWith("ed1", expect.anything());
  });

  it("into an empty account, creates members first and links records to them by name", async () => {
    const client = fakeApi();
    const out = await applyGiniImport(parseGiniCsv(buildGiniCsv(data)), empty, { isPro: true, client, pauseMs: 0 });
    expect(out).toMatchObject({ created: 9, updated: 0, failed: [], notes: [] });
    const ravi = (await client.familyMembers.createFamilyMember.mock.results[0].value).id;
    expect(client.assets.createAsset).toHaveBeenCalledWith(expect.objectContaining({ owner: ravi }));
    expect(client.elderCare.createPlan).toHaveBeenCalledWith(expect.objectContaining({ member_id: expect.stringMatching(/^new/) }));
    expect(client.taxOptimization.update).toHaveBeenCalledWith(expect.objectContaining({ huf_benefits: true }));
  });

  it("skips Pro-only sections on a free account", async () => {
    const client = fakeApi();
    const out = await applyGiniImport(parseGiniCsv(buildGiniCsv(data)), empty, { isPro: false, client, pauseMs: 0 });
    expect(out).toMatchObject({ created: 6, proSkipped: 3 });
    expect(client.elderCare.createPlan).not.toHaveBeenCalled();
    expect(client.taxOptimization.update).not.toHaveBeenCalled();
  });

  it("blank cells don't clear saved values, and an unknown owner is noted", async () => {
    const client = fakeApi();
    const out = await applyGiniImport(parseGiniCsv('Section,Name,Member,Amount,Rate %\nAsset,"HDFC ""Flexi"" Cap",Nobody,300000,\n'), data, {
      isPro: true,
      client,
      pauseMs: 0,
    });
    expect(client.assets.updateAsset).toHaveBeenCalledWith("a1", { name: 'HDFC "Flexi" Cap', value: 300000 });
    expect(out.notes[0].message).toMatch(/Nobody/);
  });

  it("keeps going when one record fails and reports it", async () => {
    const client = fakeApi();
    client.goals.createGoal.mockRejectedValueOnce(new Error("Target year must be after 2026"));
    const out = await applyGiniImport(parseGiniCsv("Section,Name,Amount,Target Year\nGoal,Old,100,2020\nAsset,Gold,5,\n"), empty, {
      isPro: false,
      client,
      pauseMs: 0,
    });
    expect(out.created).toBe(1);
    expect(out.failed).toEqual([{ line: 2, section: "Goal", message: "Target year must be after 2026" }]);
  });
});
