// Gini API client — Node/TS rewrite of the standalone app's direct Supabase
// calls (features-incoming/gini/app.js's `familySettings.saveMember()`,
// `networth.saveAsset()`/`saveLiability()`, goal-form `save()`, etc. all
// talked to Supabase directly; there was no REST client to port). Follows
// the exact pattern Journal's client uses — see
// apps/web/src/features/journal/lib/api.ts — but written fresh here since
// Gini has its own backend module and its own response shapes.
//
// Auth: uses this app's shared `authService.makeAuthenticatedRequest`
// (Supabase session token, falling back to the localStorage JWT, with 401
// handling) — same as every other feature in this app. No separate Gini
// login flow is reproduced here; the host app's `AuthContext` +
// `ProtectedPageRoute` already gate `/gini`.
//
// Base URL: every request goes to `${BACKEND_URL}/api/gini/...` (see
// services/api/modules/gini/*.routes.ts for the exact live mount).
//
// Scope of THIS file (Phase 10d): `familyMembers`, `assets`, `liabilities`,
// `goals` — the four CRUD modules this task's Dashboard/Family/NetWorth/
// Goals pages need. `elderCare.routes.ts`, `educationPlans.routes.ts`,
// `taxOptimization.routes.ts`, `chat.routes.ts`, `aiWallet.routes.ts` and
// `proPlan.routes.ts` all exist on the backend already (read directly for
// this file's design) but are deliberately NOT stubbed out here — later
// sub-phases (10f) will add `elderCare`, `educationPlans`, `taxOptimization`,
// `chat`, `aiWallet` and `proPlan` modules to this same file, in the
// reserved section below, once their pages are built.
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';
import { withSampleMode } from '../../../lib/sampleMode';
import {
  giniSampleMode,
  sampleAssets,
  sampleEducationPlans,
  sampleElderCare,
  sampleFamilyMembers,
  sampleGoals,
  sampleLiabilities,
  sampleTaxOptimization,
} from './sampleData';

const API_PREFIX = '/api/gini';

/** Parse an error body the same way across every helper below. */
async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || body?.detail || fallback;
}

/** Authenticated JSON request — the workhorse behind every API module here. */
async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, options);
  if (!res.ok) {
    throw new Error(await readError(res, 'Request failed'));
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ─────────────────────────────────────────────────────────────────────────
// Shared types — mirror `gini_family_members` / `gini_assets` /
// `gini_liabilities` / `gini_goals` column-for-column
// (database/migrations/0006), and each domain's `*.validator.ts` for which
// fields are required vs optional on create.
// ─────────────────────────────────────────────────────────────────────────

/** A family member row exactly as `familyMembers.controller.ts` returns it. */
export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: string | null;
  age: number | null;
  income: number | null;
  is_earner: boolean | null;
  is_dependent: boolean | null;
  retirement_age: number | null;
  life_expectancy: number | null;
  created_at: string;
  updated_at: string;
}

export type FamilyMemberInput = Partial<Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>> &
  Pick<FamilyMember, 'name'>;
export type FamilyMemberUpdateInput = Partial<Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/** An asset row exactly as `assets.controller.ts` returns it. `return_rate`
 *  is the original's `return` field, renamed to avoid the reserved word
 *  (see assets.validator.ts's header comment). */
export type AssetOwnershipType = 'Individual' | 'Joint' | 'Trust';

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  value: number;
  return_rate: number | null;
  ownership_type: AssetOwnershipType | null;
  owner: string | null;
  joint_share: number | null;
  created_at: string;
  updated_at: string;
}

export type AssetInput = Partial<Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & Pick<Asset, 'name' | 'value'>;
export type AssetUpdateInput = Partial<Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/** A liability row exactly as `liabilities.controller.ts` returns it. */
export interface Liability {
  id: string;
  user_id: string;
  name: string;
  type: string | null;
  amount: number;
  rate: number | null;
  emi: number | null;
  tenure: number | null;
  ownership_type: AssetOwnershipType | null;
  owner: string | null;
  joint_share: number | null;
  created_at: string;
  updated_at: string;
}

export type LiabilityInput = Partial<Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>> &
  Pick<Liability, 'name' | 'amount'>;
export type LiabilityUpdateInput = Partial<Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/** A goal row exactly as `goals.controller.ts` returns it. `assigned_to` is
 *  a nullable FK to `gini_family_members.id`, ownership-validated
 *  server-side (see goals.controller.ts's header comment). */
export interface Goal {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  current_cost: number;
  target_year: number | null;
  priority: string | null;
  inflation: number | null;
  saved: number | null;
  return_rate: number | null;
  assigned_to: string | null;
  funded_by: string | null;
  funding_split: unknown;
  created_at: string;
  updated_at: string;
}

export type GoalInput = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>> &
  Pick<Goal, 'name' | 'current_cost'>;
export type GoalUpdateInput = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// ─────────────────────────────────────────────────────────────────────────
// Family members (familyMembers.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
const realFamilyMembers = {
  createFamilyMember: async (data: FamilyMemberInput): Promise<FamilyMember> => {
    return await request('/family-members', { method: 'POST', body: JSON.stringify(data) });
  },
  getFamilyMembers: async (): Promise<FamilyMember[]> => {
    return await request('/family-members');
  },
  getFamilyMember: async (memberId: string): Promise<FamilyMember> => {
    return await request(`/family-members/${memberId}`);
  },
  updateFamilyMember: async (memberId: string, data: FamilyMemberUpdateInput): Promise<FamilyMember> => {
    return await request(`/family-members/${memberId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteFamilyMember: async (memberId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/family-members/${memberId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const familyMembers = withSampleMode(giniSampleMode, realFamilyMembers, sampleFamilyMembers);

// ─────────────────────────────────────────────────────────────────────────
// Assets (assets.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
const realAssets = {
  createAsset: async (data: AssetInput): Promise<Asset> => {
    return await request('/assets', { method: 'POST', body: JSON.stringify(data) });
  },
  getAssets: async (): Promise<Asset[]> => {
    return await request('/assets');
  },
  getAsset: async (assetId: string): Promise<Asset> => {
    return await request(`/assets/${assetId}`);
  },
  updateAsset: async (assetId: string, data: AssetUpdateInput): Promise<Asset> => {
    return await request(`/assets/${assetId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteAsset: async (assetId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/assets/${assetId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const assets = withSampleMode(giniSampleMode, realAssets, sampleAssets);

// ─────────────────────────────────────────────────────────────────────────
// Liabilities (liabilities.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
const realLiabilities = {
  createLiability: async (data: LiabilityInput): Promise<Liability> => {
    return await request('/liabilities', { method: 'POST', body: JSON.stringify(data) });
  },
  getLiabilities: async (): Promise<Liability[]> => {
    return await request('/liabilities');
  },
  getLiability: async (liabilityId: string): Promise<Liability> => {
    return await request(`/liabilities/${liabilityId}`);
  },
  updateLiability: async (liabilityId: string, data: LiabilityUpdateInput): Promise<Liability> => {
    return await request(`/liabilities/${liabilityId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteLiability: async (liabilityId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/liabilities/${liabilityId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const liabilities = withSampleMode(giniSampleMode, realLiabilities, sampleLiabilities);

// ─────────────────────────────────────────────────────────────────────────
// Goals (goals.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
const realGoals = {
  createGoal: async (data: GoalInput): Promise<Goal> => {
    return await request('/goals', { method: 'POST', body: JSON.stringify(data) });
  },
  getGoals: async (): Promise<Goal[]> => {
    return await request('/goals');
  },
  getGoal: async (goalId: string): Promise<Goal> => {
    return await request(`/goals/${goalId}`);
  },
  updateGoal: async (goalId: string, data: GoalUpdateInput): Promise<Goal> => {
    return await request(`/goals/${goalId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteGoal: async (goalId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/goals/${goalId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const goals = withSampleMode(giniSampleMode, realGoals, sampleGoals);

// ─────────────────────────────────────────────────────────────────────────
// Elder care plans (elderCare.routes.ts). `member_id` is a required FK to
// `gini_family_members.id`, ownership-validated server-side. `years_remaining`
// is a computed, non-persisted field the backend adds on every read/write
// (see elderCare.controller.ts's `shapeElderCarePlan` — never sent by the
// client, always present in responses).
// ─────────────────────────────────────────────────────────────────────────
export interface ElderCarePlan {
  id: string;
  user_id: string;
  member_id: string;
  monthly_support: number | null;
  medical_reserve: number | null;
  life_expectancy: number | null;
  years_remaining: number | null;
  created_at: string;
  updated_at: string;
}

export type ElderCarePlanInput = Partial<Omit<ElderCarePlan, 'id' | 'user_id' | 'years_remaining' | 'created_at' | 'updated_at'>> &
  Pick<ElderCarePlan, 'member_id'>;
export type ElderCarePlanUpdateInput = Partial<Omit<ElderCarePlan, 'id' | 'user_id' | 'years_remaining' | 'created_at' | 'updated_at'>>;

const realElderCare = {
  createPlan: async (data: ElderCarePlanInput): Promise<ElderCarePlan> => {
    return await request('/elder-care', { method: 'POST', body: JSON.stringify(data) });
  },
  getPlans: async (): Promise<ElderCarePlan[]> => {
    return await request('/elder-care');
  },
  getPlan: async (planId: string): Promise<ElderCarePlan> => {
    return await request(`/elder-care/${planId}`);
  },
  updatePlan: async (planId: string, data: ElderCarePlanUpdateInput): Promise<ElderCarePlan> => {
    return await request(`/elder-care/${planId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deletePlan: async (planId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/elder-care/${planId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const elderCare = withSampleMode(giniSampleMode, realElderCare, sampleElderCare);

// ─────────────────────────────────────────────────────────────────────────
// Education plans (educationPlans.routes.ts). `child_id` is a required FK to
// `gini_family_members.id`, ownership-validated server-side. `years_remaining`
// is computed server-side from `target_year` (see educationPlans.controller.ts's
// `shapeEducationPlan`).
// ─────────────────────────────────────────────────────────────────────────
export interface EducationPlan {
  id: string;
  user_id: string;
  child_id: string;
  milestone: string | null;
  target_year: number | null;
  cost: number | null;
  saved: number | null;
  ppf_account: string | null;
  years_remaining: number | null;
  created_at: string;
  updated_at: string;
}

export type EducationPlanInput = Partial<Omit<EducationPlan, 'id' | 'user_id' | 'years_remaining' | 'created_at' | 'updated_at'>> &
  Pick<EducationPlan, 'child_id'>;
export type EducationPlanUpdateInput = Partial<Omit<EducationPlan, 'id' | 'user_id' | 'years_remaining' | 'created_at' | 'updated_at'>>;

const realEducationPlans = {
  createPlan: async (data: EducationPlanInput): Promise<EducationPlan> => {
    return await request('/education-plans', { method: 'POST', body: JSON.stringify(data) });
  },
  getPlans: async (): Promise<EducationPlan[]> => {
    return await request('/education-plans');
  },
  getPlan: async (planId: string): Promise<EducationPlan> => {
    return await request(`/education-plans/${planId}`);
  },
  updatePlan: async (planId: string, data: EducationPlanUpdateInput): Promise<EducationPlan> => {
    return await request(`/education-plans/${planId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deletePlan: async (planId: string): Promise<{ success: boolean; message: string }> => {
    return await request(`/education-plans/${planId}`, { method: 'DELETE' });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const educationPlans = withSampleMode(giniSampleMode, realEducationPlans, sampleEducationPlans);

// ─────────────────────────────────────────────────────────────────────────
// Tax optimization (taxOptimization.routes.ts) — get-or-create GET/PUT pair,
// exactly one row per user (`user_id` is the primary key), not list CRUD.
// The three deduction fields are jsonb with a flexible shape server-side
// (see taxOptimization.validator.ts's header comment) — typed loosely here
// to match.
// ─────────────────────────────────────────────────────────────────────────
export interface TaxOptimization {
  user_id: string;
  deductions_80c: Record<string, number> | null;
  deductions_80d: Record<string, number> | null;
  deductions_80e: Record<string, number> | null;
  huf_benefits: boolean | null;
  created_at: string;
  updated_at: string;
}

export type TaxOptimizationInput = Partial<Omit<TaxOptimization, 'user_id' | 'created_at' | 'updated_at'>>;

const realTaxOptimization = {
  get: async (): Promise<TaxOptimization> => {
    return await request('/tax-optimization');
  },
  update: async (data: TaxOptimizationInput): Promise<TaxOptimization> => {
    return await request('/tax-optimization', { method: 'PUT', body: JSON.stringify(data) });
  },
};
// While sample mode is on (see ./sampleData.ts), served from memory instead.
export const taxOptimization = withSampleMode(giniSampleMode, realTaxOptimization, sampleTaxOptimization);

// ─────────────────────────────────────────────────────────────────────────
// AI chat (chat.routes.ts) — POST /gini/chat only. Real server-side auth +
// wallet gating (see services/api/modules/gini/chat.controller.ts's header
// comment); the request body carries only `message`/`history` — no
// financial data, no client-reported token balance. A 402 response means
// insufficient wallet balance; callers should catch that status and point
// the user at `/gini/pricing` (see ../store/useGiniPlanStore.ts for the
// wallet/Pro-plan purchase flow that page uses).
// ─────────────────────────────────────────────────────────────────────────
export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  tokens_used: number;
  token_balance: number;
}

export const chat = {
  send: async (message: string, history: ChatHistoryEntry[] = []): Promise<ChatResponse> => {
    return await request('/chat', { method: 'POST', body: JSON.stringify({ message, history }) });
  },
};

// ─────────────────────────────────────────────────────────────────────────
// `aiWallet`/`proPlan` (aiWallet.routes.ts / proPlan.routes.ts) are
// deliberately NOT re-exposed here — ../store/useGiniPlanStore.ts already
// owns the full wallet-fetch + Razorpay-checkout flow against those exact
// routes (built directly against the live controllers, not through this
// client), matching Journal's own `lib/api.ts`/`useJournalPlanStore.ts`
// split. Import that store for plan tier, wallet balance, and checkout.
// ─────────────────────────────────────────────────────────────────────────

// Export all implemented APIs
export const api = {
  familyMembers,
  assets,
  liabilities,
  goals,
  elderCare,
  educationPlans,
  taxOptimization,
  chat,
};
