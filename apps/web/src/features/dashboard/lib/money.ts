// Money maths behind the account dashboard: household totals, money health,
// the goal plan the Life Road draws, and this week's actions. Pure functions
// over the user's own Gini rows (type-only imports, so none of Gini's code or
// sample data ends up in the dashboard bundle).
//
// Goal maths matches the Gini Goals page (pages/Goals.tsx `projectGoal`):
// target = today's cost grown by the goal's inflation for whole years,
// savings grow yearly at the goal's return, and the monthly SIP closes the
// gap at return/12 a month. Gini's tables don't hold how much the user
// actually invests each month, their expenses or their insurance cover, so
// the dashboard asks for these "money basics" (saved through
// /api/dashboard/money/profile) and shares the monthly amount across goals,
// nearest goal first.

import type { Asset, FamilyMember, Goal, Liability } from "@/features/gini/lib/api";
import type { MoneyProfile, ProfileField } from "../services/moneyService";

export type Tone = "good" | "ok" | "bad" | "none";

export function toneOf(value: number | null): Tone {
  if (value == null) return "none";
  if (value >= 0.8) return "good";
  if (value >= 0.55) return "ok";
  return "bad";
}

// ── Formatting ────────────────────────────────────────────────────────────

export function inr(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
}

/** ₹4.5L / ₹1.25 Cr for big amounts, full rupees below a lakh. */
export function inrShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  return inr(n);
}

// ── Household ─────────────────────────────────────────────────────────────

export interface Household {
  /** The "Self" member, else the first earner, else the first member. */
  self: FamilyMember | null;
  age: number | null;
  retirementAge: number;
  /** Sum of every earner's monthly income (Gini stores income per month). */
  monthlyIncome: number;
  monthlyEmi: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export function household(members: FamilyMember[], assets: Asset[], liabilities: Liability[]): Household {
  const self =
    members.find((m) => (m.relationship || "").toLowerCase() === "self") ||
    members.find((m) => m.is_earner) ||
    members[0] ||
    null;
  const totalAssets = assets.reduce((s, a) => s + (a.value || 0), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.amount || 0), 0);
  return {
    self,
    age: self?.age ?? null,
    retirementAge: self?.retirement_age ?? 60,
    monthlyIncome: members.filter((m) => m.is_earner).reduce((s, m) => s + (m.income || 0), 0),
    monthlyEmi: liabilities.reduce((s, l) => s + (l.emi || 0), 0),
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

// ── Where the money sits ──────────────────────────────────────────────────

export interface Slice {
  name: string;
  value: number;
  /** 0–1 of total assets. */
  share: number;
}

export function allocation(assets: Asset[]): Slice[] {
  const byCategory = new Map<string, number>();
  for (const a of assets) {
    if (!a.value || a.value <= 0) continue;
    const key = a.category || "Others";
    byCategory.set(key, (byCategory.get(key) || 0) + a.value);
  }
  const total = [...byCategory.values()].reduce((s, v) => s + v, 0);
  return [...byCategory.entries()]
    .map(([name, value]) => ({ name, value, share: total > 0 ? value / total : 0 }))
    .sort((a, b) => b.value - a.value);
}

/** Typical yearly return for an asset type, used when an asset has none set. */
const TYPICAL_RETURN: Record<string, number> = {
  "Real Estate": 6,
  Stocks: 12,
  "Mutual Funds": 11,
  "Fixed Deposits": 7,
  Gold: 8,
  Cash: 3.5,
  PPF: 7.1,
  Insurance: 5,
  Others: 6,
};

/**
 * Net worth for each year from now (index 0 = today) if nothing changes:
 * every asset grows at its own expected return (or a typical one for its
 * type), and each loan accrues its interest and is paid down by 12 EMIs a year.
 */
export function projectNetWorth(assets: Asset[], liabilities: Liability[], years: number): number[] {
  const assetRows = assets.map((a) => ({
    value: a.value || 0,
    rate: (a.return_rate ?? TYPICAL_RETURN[a.category || "Others"] ?? 6) / 100,
  }));
  const loanRows = liabilities.map((l) => ({ amount: l.amount || 0, rate: (l.rate ?? 0) / 100, emi: l.emi || 0 }));
  const out: number[] = [];
  for (let y = 0; y <= years; y++) {
    const a = assetRows.reduce((s, r) => s + r.value, 0);
    const l = loanRows.reduce((s, r) => s + r.amount, 0);
    out.push(a - l);
    for (const r of assetRows) r.value *= 1 + r.rate;
    for (const r of loanRows) {
      if (r.emi > 0) r.amount = Math.max(0, r.amount * (1 + r.rate) - 12 * r.emi);
    }
  }
  return out;
}

// ── Goal plan (what the Life Road draws) ──────────────────────────────────

export interface PlannedGoal {
  id: string;
  name: string;
  category: string | null;
  year: number | null;
  /** Amount needed in the goal's year (today's cost grown by its inflation). */
  target: number;
  saved: number;
  /** Monthly SIP the goal still needs, after its savings grow. 0 when covered. */
  required: number;
  /** Part of the user's monthly investing this goal gets. */
  allocated: number;
  /** What the goal will have in its year: grown savings plus the allocated SIP. */
  projected: number;
  /** projected / target, as a percent. */
  pct: number;
  ok: boolean;
  overdue: boolean;
  /** Needs a monthly SIP, but the user hasn't said what they invest yet. */
  unknown: boolean;
}

/** What ₹1 a month grows to over `months`, raising the SIP by `stepUp` each year. */
export function sipFactor(monthlyRate: number, months: number, stepUp = 0): number {
  let pot = 0;
  let sip = 1;
  for (let i = 1; i <= months; i++) {
    if (i > 1 && (i - 1) % 12 === 0) sip *= 1 + stepUp;
    pot = pot * (1 + monthlyRate) + sip;
  }
  return pot;
}

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

/**
 * Plans every goal against `monthly` rupees of investing a month (raised by
 * `stepUp` each year). Dated goals are funded nearest-first; whatever is left
 * after the last one is `spare`. Goals come back sorted by year, undated last.
 * `monthly` null means the user hasn't said yet: goals their savings alone
 * cover are still on track, the rest are `unknown` rather than behind.
 */
export function planGoals(
  goals: Goal[],
  monthly: number | null,
  stepUp: number,
  currentYear = new Date().getFullYear(),
): { goals: PlannedGoal[]; spare: number; totalRequired: number } {
  const sorted = [...goals].sort((a, b) => {
    const ya = a.target_year ?? Number.POSITIVE_INFINITY;
    const yb = b.target_year ?? Number.POSITIVE_INFINITY;
    if (ya !== yb) return ya - yb;
    return (PRIORITY_ORDER[a.priority || ""] ?? 3) - (PRIORITY_ORDER[b.priority || ""] ?? 3);
  });

  let left = Math.max(0, monthly ?? 0);
  let totalRequired = 0;
  const planned = sorted.map((g): PlannedGoal => {
    const cost = g.current_cost || 0;
    const saved = g.saved || 0;
    const base = { id: g.id, name: g.name, category: g.category, year: g.target_year, saved };

    if (g.target_year == null || g.target_year - currentYear <= 0) {
      const done = saved >= cost;
      return {
        ...base,
        target: cost,
        required: 0,
        allocated: 0,
        projected: saved,
        pct: cost > 0 ? (saved / cost) * 100 : 100,
        ok: done,
        overdue: g.target_year != null && !done,
        unknown: false,
      };
    }

    const years = g.target_year - currentYear;
    const target = cost * Math.pow(1 + (g.inflation ?? 0) / 100, years);
    const yearly = (g.return_rate ?? 0) / 100;
    const grownSaved = saved * Math.pow(1 + yearly, years);
    const factor = sipFactor(yearly / 12, years * 12, stepUp);
    const gap = target - grownSaved;
    // Round up to the next ₹100 so "covered" never hides a few rupees short.
    const required = gap > 0 && factor > 0 ? Math.ceil(gap / factor / 100) * 100 : 0;
    totalRequired += required;
    const allocated = Math.min(required, left);
    left -= allocated;
    const projected = grownSaved + allocated * factor;
    return {
      ...base,
      target,
      required,
      allocated,
      projected,
      pct: target > 0 ? (projected / target) * 100 : 100,
      ok: required === 0 || (monthly != null && allocated >= required),
      overdue: false,
      unknown: monthly == null && required > 0,
    };
  });

  return { goals: planned, spare: left, totalRequired };
}

// ── Money health ──────────────────────────────────────────────────────────

export type PartKey = "safety" | "debt" | "savings" | "insurance" | "goals";

/** A money basic the user can fill in right where the part is shown. */
export interface PartAsk {
  field: ProfileField;
  label: string;
  value: number | null;
}

export interface HealthPart {
  key: PartKey;
  name: string;
  /** 0–1, or null when we don't have what this part needs yet. */
  value: number | null;
  tone: Tone;
  /** Few characters for the legend, e.g. "62%" or "4.1 / 6 mo". */
  short: string;
  /** One line with the number behind it. */
  detail: string;
  text: string;
  cta: string;
  href: string;
  /** Money basics this part reads, editable in place. */
  asks?: PartAsk[];
}

const isEmergency = (g: Goal) => g.category === "Emergency Fund" || /emergency/i.test(g.name);
const LIQUID = new Set(["Cash", "Fixed Deposits"]);

function answer(g: Goal, id: string): number | null {
  const raw = g.details?.answers?.[id];
  const n = raw == null || raw === "" ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function healthParts(
  h: Household,
  assets: Asset[],
  liabilities: Liability[],
  goals: Goal[],
  plan: PlannedGoal[],
  profile: MoneyProfile | null,
): HealthPart[] {
  const parts: HealthPart[] = [];
  const investing = profile?.monthlyInvesting ?? null;

  // Safety net: the emergency fund goal if there is one, else cash and FDs,
  // in months of essential expenses (from the goal's own answers, or the
  // expenses the user told us).
  const ef = goals.find(isEmergency);
  const goalExpenses = ef ? answer(ef, "monthly_expenses") : null;
  const expenses = goalExpenses ?? profile?.monthlyExpenses ?? null;
  const expensesAsk: PartAsk[] = goalExpenses ? [] : [{ field: "monthlyExpenses", label: "Essential monthly expenses", value: profile?.monthlyExpenses ?? null }];
  if (ef && (ef.current_cost || 0) > 0) {
    const saved = ef.saved || 0;
    const value = Math.min(1, saved / ef.current_cost);
    const months = answer(ef, "months") ?? (expenses ? Math.round(ef.current_cost / expenses) : null);
    const covered = expenses ? saved / expenses : null;
    parts.push({
      key: "safety",
      name: "Safety net",
      value,
      tone: toneOf(value),
      short: covered != null && months ? `${covered.toFixed(1)} / ${months} mo` : `${Math.round(value * 100)}%`,
      detail:
        covered != null && months
          ? `${covered.toFixed(1)} of ${months} months of expenses set aside`
          : `${inrShort(saved)} of ${inrShort(ef.current_cost)} set aside`,
      text:
        value >= 1
          ? "Your emergency fund is full. A job change or a market fall won't force you to sell investments."
          : `${inrShort(ef.current_cost - saved)} more fills it. Keep it somewhere you can withdraw within a day or two, like a liquid fund or sweep FD.`,
      cta: "Update it in Gini",
      href: "/gini/goals",
      asks: expensesAsk,
    });
  } else if (expenses) {
    const liquid = assets.filter((a) => LIQUID.has(a.category || "")).reduce((s, a) => s + (a.value || 0), 0);
    const months = liquid / expenses;
    const value = Math.min(1, months / 6);
    parts.push({
      key: "safety",
      name: "Safety net",
      value,
      tone: toneOf(value),
      short: `${months.toFixed(1)} / 6 mo`,
      detail: `${months.toFixed(1)} months of expenses in cash and FDs`,
      text:
        value >= 1
          ? "Six months of expenses sit in cash and FDs. Add it as an emergency fund goal in Gini to keep it apart from other savings."
          : `${inrShort(6 * expenses - liquid)} more in cash or a liquid fund gets you to 6 months. Making it an emergency fund goal in Gini keeps it apart from other savings.`,
      cta: "Add an emergency fund goal",
      href: "/gini/goals",
      asks: expensesAsk,
    });
  } else {
    parts.push({
      key: "safety",
      name: "Safety net",
      value: null,
      tone: "none",
      short: "Not set",
      detail: "Monthly expenses not added",
      text: "Add your essential monthly expenses (rent or EMIs, groceries, bills, fees) to see how many months your cash and FDs would last.",
      cta: "Or add an emergency fund goal",
      href: "/gini/goals",
      asks: expensesAsk,
    });
  }

  // Debt load: EMIs as a share of monthly income.
  if (h.monthlyIncome > 0) {
    const ratio = h.monthlyEmi / h.monthlyIncome;
    const value = ratio <= 0.2 ? 1 : ratio >= 0.5 ? 0.2 : 1 - ((ratio - 0.2) / 0.3) * 0.8;
    const costliest = [...liabilities].filter((l) => (l.amount || 0) > 0).sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))[0];
    parts.push({
      key: "debt",
      name: "Debt load",
      value,
      tone: toneOf(value),
      short: h.monthlyEmi > 0 ? `${Math.round(ratio * 100)}% of pay` : "No EMIs",
      detail: h.monthlyEmi > 0 ? `EMIs take ${Math.round(ratio * 100)}% of monthly income` : "No loan EMIs",
      text:
        h.monthlyEmi === 0
          ? "No EMIs eating into your income. Every rupee you save can go to goals."
          : ratio <= 0.3
            ? `${inr(h.monthlyEmi)} a month goes to EMIs, under the 30% most lenders treat as comfortable.`
            : `${inr(h.monthlyEmi)} a month goes to EMIs.${costliest ? ` Paying ${costliest.name}${costliest.rate ? ` (${costliest.rate}%)` : ""} off first saves the most interest.` : ""}`,
      cta: "See your loans",
      href: "/gini/networth",
    });
  } else {
    parts.push({
      key: "debt",
      name: "Debt load",
      value: null,
      tone: "none",
      short: "Not set",
      detail: "Monthly income not added",
      text: "Add your monthly income in Gini's Family page to see how much of it goes to EMIs.",
      cta: "Add your income",
      href: "/gini/family",
    });
  }

  // Savings rate: monthly investing against monthly income, 20% being the usual guide.
  const investingAsk: PartAsk[] = [{ field: "monthlyInvesting", label: "Invested each month", value: investing }];
  if (h.monthlyIncome > 0 && investing != null) {
    const rate = investing / h.monthlyIncome;
    const value = Math.min(1, rate / 0.2);
    parts.push({
      key: "savings",
      name: "Savings rate",
      value,
      tone: toneOf(value),
      short: `${Math.round(rate * 100)}%`,
      detail: `${inr(investing)} of ${inr(h.monthlyIncome)} invested each month`,
      text:
        rate >= 0.2
          ? "Above the usual 20% guide. This is the engine behind every goal on your Life Road."
          : `The usual guide is 20% of take-home. ${inr(0.2 * h.monthlyIncome - investing)} more a month gets you there.`,
      cta: "Try it on your Life Road",
      href: "#life-road",
      asks: investingAsk,
    });
  } else {
    parts.push({
      key: "savings",
      name: "Savings rate",
      value: null,
      tone: "none",
      short: "Not set",
      detail: h.monthlyIncome > 0 ? "Monthly investing not added" : "Monthly income not added",
      text:
        h.monthlyIncome > 0
          ? "Tell us what you invest each month (SIPs, PF top-ups, RDs) to compare it with the usual 20% of take-home."
          : "Add your monthly income in Gini's Family page, and what you invest each month, to see your savings rate.",
      cta: h.monthlyIncome > 0 ? "Set it on your Life Road" : "Add your income",
      href: h.monthlyIncome > 0 ? "#life-road" : "/gini/family",
      asks: h.monthlyIncome > 0 ? investingAsk : undefined,
    });
  }

  // Insurance: term cover against 10 times yearly income; health cover noted alongside.
  const coverAsks: PartAsk[] = [
    { field: "termCover", label: "Term (life) cover", value: profile?.termCover ?? null },
    { field: "healthCover", label: "Health cover", value: profile?.healthCover ?? null },
  ];
  const term = profile?.termCover ?? null;
  const health = profile?.healthCover ?? null;
  if (term != null && h.monthlyIncome > 0) {
    const yearly = h.monthlyIncome * 12;
    const value = Math.min(1, term / (10 * yearly));
    const healthNote =
      health == null
        ? " Add your health cover too."
        : health < 500000
          ? ` Health cover of ${inrShort(health)} is on the low side; ₹5–10L for a family is a common floor.`
          : "";
    parts.push({
      key: "insurance",
      name: "Insurance",
      value,
      tone: toneOf(value),
      short: term > 0 ? inrShort(term) : "No cover",
      detail: term > 0 ? `${inrShort(term)} term cover, ${(term / yearly).toFixed(1)} times yearly income` : "No term cover",
      text:
        (value >= 1
          ? "Term cover is at least 10 times your yearly income, the usual guide when a family depends on you."
          : `10 to 15 times yearly income (${inrShort(10 * yearly)} to ${inrShort(15 * yearly)}) is the usual guide when a family depends on you.`) + healthNote,
      cta: "Read: how much cover do I need?",
      href: "/learn/insurance",
      asks: coverAsks,
    });
  } else {
    parts.push({
      key: "insurance",
      name: "Insurance",
      value: null,
      tone: "none",
      short: "Not set",
      detail: h.monthlyIncome > 0 ? "Cover not added" : "Monthly income not added",
      text:
        h.monthlyIncome > 0
          ? "Add your term and health cover to check them against your income. Enter 0 if you don't have any."
          : "Add your monthly income in Gini's Family page, and your cover here, to check it against the usual guide.",
      cta: h.monthlyIncome > 0 ? "Learn how much cover you need" : "Add your income",
      href: h.monthlyIncome > 0 ? "/learn/insurance" : "/gini/family",
      asks: coverAsks,
    });
  }

  // Goals on track, from the plan above. Left out of the score until the user
  // says what they invest each month, unless savings alone cover every goal.
  if (plan.some((g) => g.unknown)) {
    const covered = plan.filter((g) => g.ok).length;
    parts.push({
      key: "goals",
      name: "Goals on track",
      value: null,
      tone: "none",
      short: "Not set",
      detail: covered > 0 ? `${covered} of ${plan.length} covered by savings alone` : "Monthly investing not set",
      text: "Tell us what you invest each month (SIPs, PF top-ups, RDs) and we'll show which goals it covers.",
      cta: "Set it on your Life Road",
      href: "#life-road",
    });
  } else if (plan.length > 0) {
    const onTrack = plan.filter((g) => g.ok).length;
    const value = onTrack / plan.length;
    const behind = plan.filter((g) => !g.ok).map((g) => g.name);
    parts.push({
      key: "goals",
      name: "Goals on track",
      value,
      tone: toneOf(value),
      short: `${onTrack} of ${plan.length}`,
      detail: `${onTrack} of ${plan.length} goals on track`,
      text:
        behind.length === 0
          ? "Every goal is covered by your savings and monthly investing. Review once a year."
          : `${behind.slice(0, 3).join(", ")}${behind.length > 3 ? ` and ${behind.length - 3} more` : ""} ${behind.length === 1 ? "is" : "are"} behind. Try a bigger monthly amount on your Life Road.`,
      cta: "Jump to your Life Road",
      href: "#life-road",
    });
  } else {
    parts.push({
      key: "goals",
      name: "Goals on track",
      value: null,
      tone: "none",
      short: "Not set",
      detail: "No goals yet",
      text: "Add the things you're saving for, like a home, a child's education or retirement, and they appear on your Life Road.",
      cta: "Add a goal",
      href: "/gini/goals",
    });
  }

  return parts;
}

/** Average of the parts we have data for, out of 100. Null until at least two are known. */
export function healthScore(parts: HealthPart[]): number | null {
  const known = parts.filter((p) => p.value != null);
  if (known.length < 2) return null;
  return Math.round((known.reduce((s, p) => s + (p.value as number), 0) / known.length) * 100);
}

// ── This week's actions ───────────────────────────────────────────────────

export interface WeeklyAction {
  key: string;
  tone: Tone;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** Score points this would add once fixed; null when it adds information instead. */
  points: number | null;
  /** Shown instead of points when the action adds information rather than points. */
  unlocks?: string;
}

/** Up to three things to do next: setting the monthly amount if it's missing, then the biggest score gain. */
export function weeklyActions(parts: HealthPart[], plan: PlannedGoal[]): WeeklyAction[] {
  const score = healthScore(parts);
  const gain = (key: PartKey) => {
    const fixed = healthScore(parts.map((p) => (p.key === key ? { ...p, value: 1 } : p)));
    return fixed == null ? null : Math.max(0, fixed - (score ?? 0));
  };
  const out: WeeklyAction[] = [];
  const needsMonthly = plan.some((g) => g.unknown) || parts.some((p) => p.key === "savings" && p.value == null && p.asks);
  const first: WeeklyAction | null = needsMonthly
    ? {
        key: "set-monthly",
        tone: "none",
        title: "Tell us what you invest each month",
        text: "SIPs, PF top-ups and RDs. With that one number your Life Road shows which goals are covered, and your savings rate joins your score.",
        cta: "Set it",
        href: "#life-road",
        points: null,
        unlocks: "Unlocks your goals",
      }
    : null;

  for (const p of parts) {
    if (p.tone === "good") continue;
    if (p.key === "goals") {
      if (needsMonthly) continue;
      // Undated goals can't fall behind; they need a date, which Gini's Goals page asks for.
      const next = plan.find((g) => !g.ok && (g.overdue || g.year != null));
      if (!next) continue;
      out.push({
        key: `goal-${next.id}`,
        tone: next.overdue ? "bad" : "ok",
        title: next.overdue ? `${next.name} is overdue` : `${next.name} is falling behind`,
        text: next.overdue
          ? `Its year has passed with ${inrShort(next.saved)} of ${inrShort(next.target)} saved. Give it a new date in Gini.`
          : `It needs ${inr(next.required - next.allocated)} a month more to reach ${inrShort(next.target)} by ${next.year}.`,
        cta: next.overdue ? "Update the goal" : "See it on the road",
        href: next.overdue ? "/gini/goals" : "#life-road",
        points: gain("goals"),
      });
      continue;
    }
    if (p.key === "savings" && needsMonthly) continue;
    const missing = p.value == null;
    const titles: Record<Exclude<PartKey, "goals">, string> = {
      safety: missing ? "Add your monthly expenses" : "Top up your emergency fund",
      debt: missing ? "Add your monthly income" : "Bring your EMIs down",
      savings: missing ? "Add your monthly income" : "Invest a little more each month",
      insurance: missing ? "Add your insurance cover" : "Raise your term cover",
    };
    out.push({
      key: p.key,
      tone: p.tone,
      title: titles[p.key],
      text: p.text,
      // Missing basics are filled in on the ring itself.
      cta: missing && p.asks?.length ? "Add it" : p.cta,
      href: missing && p.asks?.length ? `#health-${p.key}` : p.href,
      points: missing ? null : gain(p.key),
      unlocks: missing ? "Adds to your score" : undefined,
    });
  }

  const ranked = out.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  return (first ? [first, ...ranked] : ranked).slice(0, 3);
}
