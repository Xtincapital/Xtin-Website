// Gini sample dataset — port of the standalone app's "Load Sample Data"
// (features-incoming/gini/app.js `sampleData.load()`): the Kumar household —
// two earners, two children and a dependent parent — with their assets,
// liabilities, goals, elder-care and education plans, and tax deductions,
// mapped onto this app's snake_case row shapes. Preview-only — see
// ../../../lib/sampleMode.ts.
import { createSampleModeStore, sampleCrud, SAMPLE_USER_ID } from '../../../lib/sampleMode';
import type { Asset, EducationPlan, ElderCarePlan, FamilyMember, Goal, Liability, TaxOptimization } from './api';

export interface GiniSampleData {
  familyMembers: FamilyMember[];
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
  elderCare: ElderCarePlan[];
  educationPlans: EducationPlan[];
  taxOptimization: TaxOptimization;
}

export const giniSampleMode = createSampleModeStore<GiniSampleData>('xtin.gini.sampleData');

// Stable ids so rows can reference each other (asset owner, goal assignee…).
const RAJESH = 'sample-member-rajesh';
const PRIYA = 'sample-member-priya';
const AARAV = 'sample-member-aarav';
const ANANYA = 'sample-member-ananya';
const RAMESH = 'sample-member-ramesh';

export function buildGiniSample(): GiniSampleData {
  const stamp = new Date().toISOString();
  const thisYear = new Date().getFullYear();
  const meta = { user_id: SAMPLE_USER_ID, created_at: stamp, updated_at: stamp };

  const member = (id: string, name: string, relationship: string, age: number, income: number, lifeExpectancy = 85): FamilyMember => ({
    ...meta, id, name, relationship, age, income,
    is_earner: income > 0, is_dependent: income === 0, retirement_age: 60, life_expectancy: lifeExpectancy,
  });

  const asset = (n: number, name: string, category: string, value: number, return_rate: number, ownership_type: 'Individual' | 'Joint', owner: string): Asset => ({
    ...meta, id: `sample-asset-${n}`, name, category, value, return_rate, ownership_type, owner, joint_share: ownership_type === 'Joint' ? 50 : 100,
  });

  const goal = (n: number, name: string, category: string, current_cost: number, target_year: number, priority: string, inflation: number, saved: number, return_rate: number, assigned_to: string | null, funded_by: string, funding_split: number): Goal => ({
    ...meta, id: `sample-goal-${n}`, name, category, current_cost, target_year, priority, inflation, saved, return_rate, assigned_to, funded_by, funding_split,
  });

  const education = (n: number, child_id: string, milestone: string, target_year: number, cost: number, saved: number, ppf_account: string): EducationPlan => ({
    ...meta, id: `sample-education-${n}`, child_id, milestone, target_year, cost, saved, ppf_account, years_remaining: Math.max(0, target_year - thisYear),
  });

  return {
    familyMembers: [
      member(RAJESH, 'Rajesh Kumar', 'Self', 38, 250000),
      member(PRIYA, 'Priya Kumar', 'Spouse', 35, 180000),
      member(AARAV, 'Aarav Kumar', 'Son', 8, 0),
      member(ANANYA, 'Ananya Kumar', 'Daughter', 5, 0),
      member(RAMESH, 'Ramesh Kumar (Father)', 'Parent', 68, 0, 82),
    ],
    assets: [
      asset(1, 'Primary Residence', 'Real Estate', 25000000, 8, 'Joint', RAJESH),
      asset(2, 'Fixed Deposits', 'Fixed Deposits', 2500000, 7, 'Individual', RAJESH),
      asset(3, 'Equity Mutual Funds (Rajesh)', 'Mutual Funds', 1500000, 12, 'Individual', RAJESH),
      asset(4, 'Equity Mutual Funds (Priya)', 'Mutual Funds', 800000, 12, 'Individual', PRIYA),
      asset(5, 'Gold', 'Gold', 1000000, 8, 'Joint', RAJESH),
      asset(6, 'PPF Account (Rajesh)', 'PPF', 600000, 7.1, 'Individual', RAJESH),
      asset(7, 'PPF Account (Priya)', 'PPF', 400000, 7.1, 'Individual', PRIYA),
      asset(8, 'Emergency Fund', 'Cash', 500000, 4, 'Joint', RAJESH),
    ],
    liabilities: [
      { ...meta, id: 'sample-liability-1', name: 'Home Loan', type: 'Home Loan', amount: 8000000, rate: 8.5, emi: 95000, tenure: 15, ownership_type: 'Joint', owner: RAJESH, joint_share: 50 },
      { ...meta, id: 'sample-liability-2', name: 'Car Loan', type: 'Car Loan', amount: 500000, rate: 9, emi: 15000, tenure: 3, ownership_type: 'Individual', owner: RAJESH, joint_share: 100 },
    ],
    goals: [
      goal(1, "Ananya's Higher Education", 'Education', 2500000, 2033, 'High', 8, 500000, 12, ANANYA, RAJESH, 60),
      goal(2, "Aarav's Engineering Degree", 'Education', 3000000, 2030, 'High', 8, 400000, 12, AARAV, RAJESH, 60),
      goal(3, "Ananya's Wedding", 'Wedding', 2000000, 2038, 'High', 7, 200000, 12, ANANYA, RAJESH, 50),
      goal(4, 'Family Retirement Corpus', 'Retirement', 50000000, 2047, 'High', 6, 5000000, 12, RAJESH, RAJESH, 60),
      goal(5, 'Vacation Home in Goa', 'Home Purchase', 8000000, 2028, 'Medium', 8, 1000000, 12, null, RAJESH, 50),
      goal(6, 'Dream Car Upgrade', 'Other', 1500000, 2027, 'Low', 5, 300000, 10, null, PRIYA, 100),
    ],
    elderCare: [
      { ...meta, id: 'sample-eldercare-1', member_id: RAMESH, monthly_support: 25000, medical_reserve: 800000, life_expectancy: 82, years_remaining: 14 },
    ],
    educationPlans: [
      education(1, AARAV, 'Higher Secondary', 2030, 500000, 150000, 'PPF-AARAV-001'),
      education(2, AARAV, 'Engineering (UG)', 2034, 2000000, 400000, 'PPF-AARAV-001'),
      education(3, ANANYA, 'Primary School', 2028, 300000, 100000, 'PPF-ANANYA-001'),
      education(4, ANANYA, 'Higher Secondary', 2035, 440000, 50000, 'PPF-ANANYA-001'),
      education(5, ANANYA, 'Medical/MBA (UG)', 2038, 3000000, 200000, 'PPF-ANANYA-001'),
    ],
    taxOptimization: {
      user_id: SAMPLE_USER_ID,
      deductions_80c: { ppf: 150000, elss: 0, nsc: 0, lifePremium: 50000, tuitionFees: 0 },
      deductions_80d: { selfHealth: 25000, parentHealth: 50000 },
      deductions_80e: { educationLoanInterest: 0 },
      huf_benefits: false,
      created_at: stamp,
      updated_at: stamp,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// In-memory implementations of ./api.ts's modules, used while sample mode
// is on. Same method names and return shapes as the real ones.
// ─────────────────────────────────────────────────────────────────────────
const members = sampleCrud(giniSampleMode, (d) => d.familyMembers, 'member');
const assetRows = sampleCrud(giniSampleMode, (d) => d.assets, 'asset');
const liabilityRows = sampleCrud(giniSampleMode, (d) => d.liabilities, 'liability');
const goalRows = sampleCrud(giniSampleMode, (d) => d.goals, 'goal');
const elderCareRows = sampleCrud(giniSampleMode, (d) => d.elderCare, 'eldercare');
const educationRows = sampleCrud(giniSampleMode, (d) => d.educationPlans, 'education');

export const sampleFamilyMembers = {
  createFamilyMember: members.create,
  getFamilyMembers: members.list,
  getFamilyMember: members.get,
  updateFamilyMember: members.update,
  deleteFamilyMember: members.remove,
};

export const sampleAssets = {
  createAsset: assetRows.create,
  getAssets: assetRows.list,
  getAsset: assetRows.get,
  updateAsset: assetRows.update,
  deleteAsset: assetRows.remove,
};

export const sampleLiabilities = {
  createLiability: liabilityRows.create,
  getLiabilities: liabilityRows.list,
  getLiability: liabilityRows.get,
  updateLiability: liabilityRows.update,
  deleteLiability: liabilityRows.remove,
};

export const sampleGoals = {
  createGoal: goalRows.create,
  getGoals: goalRows.list,
  getGoal: goalRows.get,
  updateGoal: goalRows.update,
  deleteGoal: goalRows.remove,
};

export const sampleElderCare = {
  createPlan: elderCareRows.create,
  getPlans: elderCareRows.list,
  getPlan: elderCareRows.get,
  updatePlan: elderCareRows.update,
  deletePlan: elderCareRows.remove,
};

export const sampleEducationPlans = {
  createPlan: educationRows.create,
  getPlans: educationRows.list,
  getPlan: educationRows.get,
  updatePlan: educationRows.update,
  deletePlan: educationRows.remove,
};

export const sampleTaxOptimization = {
  get: async () => ({ ...giniSampleMode.data().taxOptimization }),
  update: async (data: Partial<TaxOptimization>) => {
    giniSampleMode.update((d) => {
      d.taxOptimization = { ...d.taxOptimization, ...data, updated_at: new Date().toISOString() };
    });
    return { ...giniSampleMode.data().taxOptimization };
  },
};
