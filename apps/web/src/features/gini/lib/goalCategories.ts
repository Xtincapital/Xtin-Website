// Category-specific questions for the Add / Edit Goal form (../pages/Goals.tsx).
//
// Each category asks what actually decides that goal's cost (a child's age and
// course fees for Education, property price and down payment for a home,
// monthly expenses and retirement age for Retirement, ...) and works out the
// two numbers every goal is stored with: `current_cost` (in today's rupees)
// and `target_year`. The answers are kept in the goal's `details` column so
// the form can be reopened with them. "I already know the amount" (manual
// mode) skips the questions; goals saved before this existed open that way.
import { formatFromInr } from "@/lib/region";
import type { FamilyMember } from "./api";

export const GOAL_CATEGORIES = [
  "Education",
  "Wedding",
  "Home Purchase",
  "Car",
  "Retirement",
  "Vacation",
  "Emergency Fund",
  "Others",
] as const;

export type Answers = Record<string, string>;
export interface GoalDetails {
  mode: "guided" | "manual";
  answers?: Answers;
}

export interface Question {
  id: string;
  label: string;
  kind: "money" | "number" | "percent" | "select";
  options?: string[];
  hint?: string;
  min?: number;
  max?: number;
  /** Suggested value; may depend on earlier answers (e.g. course length by level). */
  suggest?: (a: Answers) => string;
  showIf?: (a: Answers) => boolean;
}

export interface CategoryConfig {
  /** One line under the category picker. */
  intro: string;
  namePlaceholder: string;
  /** Asks which family member the goal is for (stored as `assigned_to`). */
  member?: { label: string; prefer?: (m: FamilyMember) => boolean };
  questions: Question[];
  defaults: { inflation: number; return_rate: number; priority: "High" | "Medium" | "Low" };
  inflationHint: string;
  returnHint: string;
}

export interface Computed {
  cost: number | null;
  targetYear: number | null;
  /** How the numbers were reached, shown under the form. */
  breakdown: string[];
  /** Questions still to answer, or answers that don't add up. */
  problems: string[];
}

// Answers are saved in rupees; amounts in the text follow the selected currency.
const inr = (n: number) => formatFromInr(n, { maxDecimals: 0 });

// The first one is the default. `noun` names the goal: "Aarav's graduation".
const EDUCATION_LEVELS: Record<string, { startAge: number; years: number; noun: string }> = {
  "Undergraduate degree": { startAge: 18, years: 3, noun: "graduation" },
  "Engineering / Medical": { startAge: 18, years: 5, noun: "professional degree" },
  "Postgraduate / MBA": { startAge: 22, years: 2, noun: "postgraduate studies" },
  "Study abroad": { startAge: 18, years: 2, noun: "studies abroad" },
  "School (Class 1 to 12)": { startAge: 6, years: 12, noun: "schooling" },
};

const isChild = (m: FamilyMember) => /child|son|daughter/i.test(m.relationship || "");
const isAdult = (m: FamilyMember) => !isChild(m);

const yearsQuestion = (label: string, suggest: string): Question => ({
  id: "years_away",
  label,
  kind: "number",
  min: 1,
  max: 60,
  suggest: () => suggest,
});

export const CATEGORY_CONFIG: Record<(typeof GOAL_CATEGORIES)[number], CategoryConfig> = {
  Education: {
    intro: "We work out the total cost of the course from today's yearly fees, and the year it starts from the student's age.",
    namePlaceholder: "e.g. Aarav's engineering degree",
    member: { label: "Whose education is this?", prefer: isChild },
    questions: [
      { id: "level", label: "Course", kind: "select", options: Object.keys(EDUCATION_LEVELS) },
      { id: "current_age", label: "Student's age today", kind: "number", min: 0, max: 60 },
      {
        id: "start_age",
        label: "Age when the course starts",
        kind: "number",
        min: 1,
        max: 70,
        suggest: (a) => String(EDUCATION_LEVELS[a.level]?.startAge ?? 18),
      },
      {
        id: "annual_cost",
        label: "Yearly cost at today's prices",
        kind: "money",
        hint: "Tuition plus hostel, books and living costs. Check the current fees of a college you have in mind.",
      },
      {
        id: "duration",
        label: "Course length (years)",
        kind: "number",
        min: 1,
        max: 15,
        suggest: (a) => String(EDUCATION_LEVELS[a.level]?.years ?? 3),
      },
    ],
    defaults: { inflation: 10, return_rate: 12, priority: "High" },
    inflationHint: "Education costs in India have been rising about 10% a year, faster than general prices.",
    returnHint: "Equity mutual funds suit goals 7+ years away; move to debt funds in the last 2–3 years.",
  },
  Wedding: {
    intro: "Add up the main parts of the wedding at today's prices; the year comes from the age at which the wedding is expected.",
    namePlaceholder: "e.g. Priya's wedding",
    member: { label: "Whose wedding is this?" },
    questions: [
      { id: "current_age", label: "Their age today", kind: "number", min: 0, max: 80 },
      { id: "wedding_age", label: "Expected age at the wedding", kind: "number", min: 18, max: 80, suggest: () => "27" },
      { id: "ceremony", label: "Venue, catering and ceremonies", kind: "money" },
      { id: "jewellery", label: "Jewellery and gold", kind: "money" },
      { id: "other", label: "Clothes, gifts, travel and other costs", kind: "money" },
    ],
    defaults: { inflation: 7, return_rate: 12, priority: "High" },
    inflationHint: "Wedding costs usually rise a little faster than general inflation; gold prices can swing more.",
    returnHint: "Equity funds for 7+ years away, a balanced or debt fund if the wedding is closer.",
  },
  "Home Purchase": {
    intro: "This goal is the money you need on the day you buy: the down payment plus stamp duty and other charges. The rest would be a home loan.",
    namePlaceholder: "e.g. 2BHK in Pune",
    questions: [
      { id: "price", label: "Price of the home today", kind: "money", hint: "What a similar home costs in that area now." },
      {
        id: "down_pct",
        label: "Down payment (%)",
        kind: "percent",
        min: 0,
        max: 100,
        suggest: () => "20",
        hint: "Banks usually lend 75–90% of the value, so plan for at least 10–25%. Enter 100 if you will pay in full.",
      },
      {
        id: "charges_pct",
        label: "Stamp duty, registration and other charges (%)",
        kind: "percent",
        min: 0,
        max: 20,
        suggest: () => "7",
        hint: "Usually 6–8% of the price, depending on the state.",
      },
      { id: "interiors", label: "Interiors and furnishing (optional)", kind: "money" },
      yearsQuestion("In how many years do you plan to buy?", "5"),
    ],
    defaults: { inflation: 6, return_rate: 10, priority: "High" },
    inflationHint: "How fast property prices rise in that area; 5–7% a year is typical.",
    returnHint: "Use a lower return if you plan to buy within 3 years and will keep the money in debt funds.",
  },
  Car: {
    intro: "Use the on-road price (ex-showroom plus registration and insurance). If you'll take a car loan, the goal is only the down payment.",
    namePlaceholder: "e.g. New SUV",
    questions: [
      { id: "price", label: "On-road price today", kind: "money" },
      { id: "payment", label: "How will you pay?", kind: "select", options: ["Full payment", "Down payment + car loan"] },
      {
        id: "down_pct",
        label: "Down payment (%)",
        kind: "percent",
        min: 1,
        max: 100,
        suggest: () => "20",
        showIf: (a) => a.payment === "Down payment + car loan",
        hint: "Car loans usually cover 80–90% of the on-road price.",
      },
      yearsQuestion("In how many years do you plan to buy?", "3"),
    ],
    defaults: { inflation: 5, return_rate: 9, priority: "Medium" },
    inflationHint: "Car prices typically rise 4–6% a year.",
    returnHint: "For a purchase within 3 years, debt funds or an RD (about 7–8%) are safer than equity.",
  },
  Retirement: {
    intro: "We work out the corpus you need at retirement, in today's money, so your monthly expenses are covered until the age you plan for.",
    namePlaceholder: "e.g. Retirement",
    member: { label: "Whose retirement is this?", prefer: isAdult },
    questions: [
      { id: "current_age", label: "Age today", kind: "number", min: 18, max: 90 },
      { id: "retirement_age", label: "Retirement age", kind: "number", min: 30, max: 90, suggest: () => "60" },
      { id: "life_expectancy", label: "Plan for expenses until age", kind: "number", min: 50, max: 110, suggest: () => "85" },
      {
        id: "monthly_expenses",
        label: "Monthly expenses at today's prices",
        kind: "money",
        hint: "Household costs that will continue after you retire. Leave out EMIs that will be paid off, and children's costs.",
      },
      {
        id: "post_return",
        label: "Return on the corpus after retirement (%)",
        kind: "percent",
        min: 0,
        max: 20,
        suggest: () => "8",
        hint: "Usually lower than before retirement, because the money moves to safer debt funds, FDs and annuities.",
      },
    ],
    defaults: { inflation: 6, return_rate: 12, priority: "High" },
    inflationHint: "General price rise in India has averaged around 6% a year.",
    returnHint: "Expected return on your savings until you retire.",
  },
  Vacation: {
    intro: "Work out the trip cost from the number of people travelling and the cost per person at today's prices.",
    namePlaceholder: "e.g. Family trip to Japan",
    questions: [
      { id: "trip", label: "Type of trip", kind: "select", options: ["Within India", "International"] },
      { id: "travellers", label: "Number of travellers", kind: "number", min: 1, max: 50, suggest: () => "2" },
      {
        id: "per_person",
        label: "Cost per person at today's prices",
        kind: "money",
        hint: "Flights, stay, food, visas, local travel and shopping.",
      },
      yearsQuestion("In how many years is the trip?", "1"),
    ],
    defaults: { inflation: 6, return_rate: 7, priority: "Low" },
    inflationHint: "For international trips, add 1–2% for the rupee weakening against other currencies.",
    returnHint: "For a trip within 1–2 years, keep the money in an RD, FD or liquid fund (about 6–7%).",
  },
  "Emergency Fund": {
    intro: "An emergency fund covers several months of essential expenses if income stops or a big expense comes up. Keep it easy to withdraw.",
    namePlaceholder: "e.g. Emergency fund",
    questions: [
      {
        id: "monthly_expenses",
        label: "Essential monthly expenses",
        kind: "money",
        hint: "Rent or EMIs, groceries, bills, insurance premiums and school fees.",
      },
      {
        id: "months",
        label: "Months of expenses to keep aside",
        kind: "select",
        options: ["3", "6", "9", "12"],
        hint: "6 months for a stable salaried job; 9–12 months if self-employed, a single earner, or supporting parents.",
      },
      yearsQuestion("In how many years do you want it fully built?", "1"),
    ],
    defaults: { inflation: 6, return_rate: 6, priority: "High" },
    inflationHint: "Your expenses rise with general inflation, so the fund needs topping up over time.",
    returnHint: "Keep it in a savings account, sweep-in FD or liquid fund (about 4–7%), not in equity.",
  },
  Others: {
    intro: "Enter what this goal would cost at today's prices and the year you need the money.",
    namePlaceholder: "e.g. Start a business",
    questions: [],
    defaults: { inflation: 6, return_rate: 10, priority: "Medium" },
    inflationHint: "6% is a reasonable default for general price rise in India.",
    returnHint: "Use 10–12% for equity goals 7+ years away, 6–8% for anything within 3 years.",
  },
};

export const configFor = (category: string): CategoryConfig =>
  CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.Others;

/** Whether the category has its own questions (Others doesn't). */
export const hasQuestions = (category: string) => configFor(category).questions.length > 0;

/** The visible questions, with suggested values used where the user left a blank. */
export function visibleQuestions(category: string, answers: Answers): Question[] {
  return configFor(category).questions.filter((q) => !q.showIf || q.showIf(answers));
}

/** Answer value, falling back to the question's suggestion. */
export function valueOf(q: Question, answers: Answers): string {
  const v = answers[q.id];
  if (v != null && v !== "") return v;
  if (q.suggest) return q.suggest(answers);
  if (q.kind === "select" && q.options?.length) return q.options[0];
  return "";
}

/**
 * Today's cost and target year from a category's answers. `inflation` is the
 * form's rate (Retirement needs it to value the expenses it has to cover).
 */
export function computeGoal(category: string, answers: Answers, opts: { currentYear: number; inflation: number }): Computed {
  const qs = visibleQuestions(category, answers);
  const problems: string[] = [];
  const breakdown: string[] = [];
  const n = (id: string): number | null => {
    const q = qs.find((x) => x.id === id);
    if (!q) return null;
    const raw = valueOf(q, answers).replace(/[₹,\s]/g, "");
    if (raw === "") return null;
    const v = Number(raw);
    if (!Number.isFinite(v)) {
      problems.push(`${q.label}: enter a number`);
      return null;
    }
    if ((q.min != null && v < q.min) || (q.max != null && v > q.max)) {
      problems.push(`${q.label}: must be between ${q.min ?? 0} and ${q.max}`);
      return null;
    }
    return v;
  };
  const need = (id: string): number | null => {
    const v = n(id);
    const q = qs.find((x) => x.id === id);
    if (v == null && q && !problems.some((p) => p.startsWith(q.label))) problems.push(`Answer "${q.label}"`);
    return v;
  };
  const s = (id: string) => {
    const q = qs.find((x) => x.id === id);
    return q ? valueOf(q, answers) : "";
  };
  const yearIn = (years: number) => opts.currentYear + years;
  let cost: number | null = null;
  let targetYear: number | null = null;

  const fromAges = (now: number | null, then: number | null, what: string) => {
    if (now == null || then == null) return null;
    const years = then - now;
    if (years < 1) {
      breakdown.push(`${what} is due now or has passed, so this plans for next year.`);
      return yearIn(1);
    }
    return yearIn(years);
  };

  switch (category) {
    case "Education": {
      const now = need("current_age");
      const start = need("start_age");
      const annual = need("annual_cost");
      const years = need("duration");
      targetYear = fromAges(now, start, "The course");
      if (annual != null && years != null) {
        cost = annual * years;
        breakdown.push(`${s("level")}: ${inr(annual)} a year × ${years} year${years === 1 ? "" : "s"} = ${inr(cost)} at today's prices.`);
      }
      if (targetYear) breakdown.push(`Starts in ${targetYear}. The money is needed over the course; this plans to have it all by the start.`);
      break;
    }
    case "Wedding": {
      targetYear = fromAges(need("current_age"), need("wedding_age"), "The wedding");
      const parts = [n("ceremony"), n("jewellery"), n("other")];
      const total = parts.reduce<number>((t, v) => t + (v ?? 0), 0);
      if (total > 0) {
        cost = total;
        breakdown.push(`Ceremonies ${inr(parts[0] ?? 0)} + jewellery ${inr(parts[1] ?? 0)} + other ${inr(parts[2] ?? 0)} = ${inr(total)}.`);
      } else problems.push("Enter at least one wedding cost");
      if (targetYear) breakdown.push(`Planned for ${targetYear}.`);
      break;
    }
    case "Home Purchase": {
      const price = need("price");
      const down = need("down_pct");
      const charges = need("charges_pct");
      const interiors = n("interiors") ?? 0;
      const years = need("years_away");
      if (years != null) targetYear = yearIn(years);
      if (price != null && down != null && charges != null) {
        const downAmt = (price * down) / 100;
        const chargesAmt = (price * charges) / 100;
        cost = downAmt + chargesAmt + interiors;
        breakdown.push(
          `Down payment ${inr(downAmt)} + charges ${inr(chargesAmt)}${interiors ? ` + interiors ${inr(interiors)}` : ""} = ${inr(cost)} at today's prices.`,
        );
        if (down < 100) breakdown.push(`Home loan for the rest: about ${inr(price - downAmt)} at today's prices.`);
      }
      break;
    }
    case "Car": {
      const price = need("price");
      const years = need("years_away");
      if (years != null) targetYear = yearIn(years);
      const loan = s("payment") === "Down payment + car loan";
      const down = loan ? need("down_pct") : 100;
      if (price != null && down != null) {
        cost = (price * down) / 100;
        breakdown.push(loan ? `${down}% down payment on ${inr(price)} = ${inr(cost)}; a car loan covers ${inr(price - cost)}.` : `Full on-road price: ${inr(price)}.`);
      }
      break;
    }
    case "Retirement": {
      const now = need("current_age");
      const retire = need("retirement_age");
      const until = need("life_expectancy");
      const monthly = need("monthly_expenses");
      const post = need("post_return");
      targetYear = fromAges(now, retire, "Retirement");
      if (retire != null && until != null && until <= retire) problems.push("Plan for expenses until an age after retirement");
      if (retire != null && until != null && until > retire && monthly != null && post != null) {
        const years = until - retire;
        const annual = monthly * 12;
        // Corpus that pays a yearly amount rising with inflation for `years`
        // years (withdrawn at the start of each year), valued in today's money.
        const real = (1 + post / 100) / (1 + opts.inflation / 100) - 1;
        const factor = Math.abs(real) < 1e-9 ? years : ((1 - Math.pow(1 + real, -years)) / real) * (1 + real);
        cost = annual * factor;
        breakdown.push(
          `${inr(monthly)} a month for ${years} years after retiring at ${retire}, earning ${post}% while prices rise ${opts.inflation}%: about ${inr(cost)} in today's money.`,
        );
        breakdown.push("The Target Amount on the goal card is the same corpus in rupees of the retirement year.");
      }
      break;
    }
    case "Vacation": {
      const people = need("travellers");
      const each = need("per_person");
      const years = need("years_away");
      if (years != null) targetYear = yearIn(years);
      if (people != null && each != null) {
        cost = people * each;
        breakdown.push(`${people} × ${inr(each)} = ${inr(cost)} at today's prices.`);
      }
      break;
    }
    case "Emergency Fund": {
      const monthly = need("monthly_expenses");
      const months = need("months");
      const years = need("years_away");
      if (years != null) targetYear = yearIn(years);
      if (monthly != null && months != null) {
        cost = monthly * months;
        breakdown.push(`${months} months × ${inr(monthly)} = ${inr(cost)}.`);
      }
      break;
    }
  }

  if (cost != null && cost <= 0) {
    problems.push("The cost works out to zero; check the amounts");
    cost = null;
  }
  return { cost: cost == null ? null : Math.round(cost), targetYear, breakdown, problems };
}

/** Name to use when the user leaves Goal Name blank. */
export function defaultGoalName(category: string, answers: Answers, member?: FamilyMember | null): string {
  const first = member?.name?.trim().split(/\s+/)[0];
  const who = first ? `${first}'s ` : "";
  switch (category) {
    case "Education":
      return `${who}${EDUCATION_LEVELS[answers.level]?.noun ?? "education"}`.replace(/^./, (c) => c.toUpperCase());
    case "Wedding":
      return `${who}wedding`.replace(/^./, (c) => c.toUpperCase());
    case "Retirement":
      return `${who}retirement`.replace(/^./, (c) => c.toUpperCase());
    case "Home Purchase":
      return "Buy a home";
    case "Car":
      return "Buy a car";
    case "Vacation":
      return answers.trip === "International" ? "International trip" : "Family trip";
    case "Emergency Fund":
      return "Emergency fund";
    default:
      return "";
  }
}

/** One short line for the goal card, from saved details. */
export function detailsSummary(category: string | null, details: unknown): string | null {
  const d = details as GoalDetails | null;
  if (!d || d.mode !== "guided" || !d.answers || !category) return null;
  const a = d.answers;
  const money = (v?: string) => (v && Number(v) ? inr(Number(v)) : null);
  switch (category) {
    case "Education":
      return [a.level, a.duration && `${a.duration} yrs`, money(a.annual_cost) && `${money(a.annual_cost)}/yr`].filter(Boolean).join(" · ") || null;
    case "Home Purchase":
      return [money(a.price) && `Home ${money(a.price)}`, a.down_pct && `${a.down_pct}% down`].filter(Boolean).join(" · ") || null;
    case "Car":
      return [money(a.price) && `On-road ${money(a.price)}`, a.payment === "Down payment + car loan" ? `${a.down_pct || 20}% down` : "full payment"]
        .filter(Boolean)
        .join(" · ");
    case "Retirement":
      return [a.retirement_age && `Retire at ${a.retirement_age}`, money(a.monthly_expenses) && `${money(a.monthly_expenses)}/month`].filter(Boolean).join(" · ") || null;
    case "Vacation":
      return [a.trip, a.travellers && `${a.travellers} travellers`].filter(Boolean).join(" · ") || null;
    case "Emergency Fund":
      return [a.months && `${a.months} months`, money(a.monthly_expenses) && `of ${money(a.monthly_expenses)}`].filter(Boolean).join(" ") || null;
    case "Wedding":
      return a.wedding_age ? `At age ${a.wedding_age}` : null;
    default:
      return null;
  }
}

/** Fills blank answers with each question's suggestion (or first option). */
export function seedAnswers(category: string, answers: Answers): Answers {
  const out = { ...answers };
  for (const q of configFor(category).questions) {
    if (out[q.id] == null || out[q.id] === "") {
      const v = valueOf(q, out);
      if (v !== "") out[q.id] = v;
    }
  }
  return out;
}

/**
 * Sets one answer. Answers the user hasn't changed from their suggestion
 * follow the new suggestion (e.g. picking "Postgraduate / MBA" moves the
 * start age from 18 to 22 unless it was typed in).
 */
export function updateAnswer(category: string, answers: Answers, id: string, value: string): Answers {
  const next = { ...answers, [id]: value };
  for (const q of configFor(category).questions) {
    if (q.id === id || !q.suggest) continue;
    if (answers[q.id] === q.suggest(answers)) next[q.id] = q.suggest(next);
  }
  return seedAnswers(category, next);
}

/** Answers prefilled from a family member's profile when they are picked. */
export function answersFromMember(category: string, answers: Answers, member: FamilyMember | null | undefined): Answers {
  if (!member) return answers;
  const next = { ...answers };
  const ids = new Set(configFor(category).questions.map((q) => q.id));
  if (ids.has("current_age") && member.age != null) next.current_age = String(member.age);
  if (category === "Retirement") {
    if (member.retirement_age) next.retirement_age = String(member.retirement_age);
    if (member.life_expectancy) next.life_expectancy = String(member.life_expectancy);
  }
  return next;
}

/** Only the answers to questions currently shown, for saving. */
export function answersToSave(category: string, answers: Answers): Answers {
  const out: Answers = {};
  for (const q of visibleQuestions(category, answers)) {
    const v = valueOf(q, answers);
    if (v !== "") out[q.id] = v;
  }
  return out;
}
