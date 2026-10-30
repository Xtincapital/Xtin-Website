// Reads what the account dashboard shows, and saves the money basics.
//
// One authenticated request (GET /api/dashboard/money, services/api
// modules/dashboard) returns Gini's household, assets, loans and goals; the
// money basics; monthly net-worth history; this month's trades; Learn
// progress; and AI token balances. The latest newsletter is a second, public
// request. If the dashboard endpoint isn't there (an older API), the page
// falls back to reading Gini, Journal and Learn one by one.
//
// The fallback calls Gini and Journal directly rather than through
// features/{gini,journal}/lib/api: those wrap "Load sample" mode, which would
// put sample numbers on the account page.

import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import type { Asset, FamilyMember, Goal, Liability } from "@/features/gini/lib/api";
import type { CourseProgress } from "../lib/learnCourses";

export interface GiniData {
  members: FamilyMember[];
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
}

export interface MoneyProfile {
  /** Null until the user answers; 0 means "I don't invest yet". */
  monthlyInvesting: number | null;
  stepUp: number;
  monthlyExpenses: number | null;
  termCover: number | null;
  healthCover: number | null;
  updatedAt: string | null;
}

export type ProfileField = "monthlyInvesting" | "monthlyExpenses" | "termCover" | "healthCover";
export type ProfilePatch = Partial<Pick<MoneyProfile, ProfileField | "stepUp">>;

export interface NetWorthPoint {
  /** YYYY-MM */
  month: string;
  assets: number;
  liabilities: number;
}

export interface TradePnl {
  id: string;
  date: string;
  pnl: number | null;
}

export interface Article {
  slug: string | null;
  title: string;
  subtitle: string;
  postDate: string | null;
}

export interface MoneySummary {
  gini: GiniData | null;
  profile: MoneyProfile | null;
  netWorthHistory: NetWorthPoint[];
  trades: TradePnl[] | null;
  learn: CourseProgress[] | null;
  tokens: { gini: number | null; journal: number | null };
  /** False when read the old way: nothing can be saved and there is no history. */
  live: boolean;
}

async function getJson<T>(path: string, authed = true): Promise<{ status: number; body: T | null }> {
  try {
    const url = `${BACKEND_URL}${path}`;
    const res = authed ? await authService.makeAuthenticatedRequest(url) : await fetch(url);
    if (!res.ok) return { status: res.status, body: null };
    return { status: res.status, body: (await res.json()) as T };
  } catch {
    return { status: 0, body: null };
  }
}

const list = <T>(x: T[] | null | undefined): T[] => (Array.isArray(x) ? x : []);

/** Everything but the newsletter. Null only when nothing at all could be read. */
export async function getMoneySummary(): Promise<MoneySummary | null> {
  const res = await getJson<Omit<MoneySummary, "live">>("/api/dashboard/money");
  if (res.body) {
    const b = res.body;
    return {
      gini: b.gini
        ? { members: list(b.gini.members), assets: list(b.gini.assets), liabilities: list(b.gini.liabilities), goals: list(b.gini.goals) }
        : null,
      profile: b.profile ?? null,
      netWorthHistory: list(b.netWorthHistory),
      trades: b.trades ?? null,
      learn: b.learn ?? null,
      tokens: { gini: b.tokens?.gini ?? null, journal: b.tokens?.journal ?? null },
      live: true,
    };
  }
  // Only an API without this endpoint gets the old way; other failures are real failures.
  if (res.status !== 404) return null;
  return getMoneySummaryOldWay();
}

async function getMoneySummaryOldWay(): Promise<MoneySummary | null> {
  const [members, assets, liabilities, goals] = await Promise.all([
    getJson<FamilyMember[]>("/api/gini/family-members"),
    getJson<Asset[]>("/api/gini/assets"),
    getJson<Liability[]>("/api/gini/liabilities"),
    getJson<Goal[]>("/api/gini/goals"),
  ]);
  const gini =
    members.body || assets.body || liabilities.body || goals.body
      ? { members: list(members.body), assets: list(assets.body), liabilities: list(liabilities.body), goals: list(goals.body) }
      : null;

  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const [trades, learn] = await Promise.all([
    getJson<{ data: TradePnl[] }>(`/api/journal/trades?limit=500&from=${from}&sort=date&dir=desc`),
    getJson<{ data: { modules: { module_slug: string; completed_lessons_count: number; last_completed_at: string | null }[] } }>(
      "/api/progress/learn-summary",
    ),
  ]);
  if (!gini && !trades.body && !learn.body) return null;
  return {
    gini,
    profile: null,
    netWorthHistory: [],
    trades: trades.body ? list(trades.body.data) : null,
    learn: learn.body
      ? list(learn.body.data?.modules).map((m) => ({ module_slug: m.module_slug, completed: m.completed_lessons_count, last_completed_at: m.last_completed_at }))
      : null,
    tokens: { gini: null, journal: null },
    live: false,
  };
}

/** Saves part of the money basics; returns the whole saved profile. */
export async function saveMoneyProfile(patch: ProfilePatch): Promise<MoneyProfile> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/dashboard/money/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Could not save");
  const body = await res.json();
  return body.profile as MoneyProfile;
}

export async function getLatestArticle(): Promise<Article | null> {
  const res = await getJson<{ data: Article[] }>("/api/substack/articles", false);
  const articles = list(res.body?.data);
  return [...articles].sort((a, b) => new Date(b.postDate || 0).getTime() - new Date(a.postDate || 0).getTime())[0] ?? null;
}
