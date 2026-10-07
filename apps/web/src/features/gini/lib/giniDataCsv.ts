// "All my Gini data" as one CSV: the Download / Upload pair beside "Load
// sample data" (see ../components/GiniDataControls.tsx).
//
// One row per record, with a `Section` column saying what it is. Columns mean
// the same thing in every section (Amount is an asset's value, a loan's
// outstanding amount, a goal's cost today, ...), and family members are
// referred to by name so the file stays readable and editable in a
// spreadsheet. Uploading the downloaded file back gives the same data.
import { csvCell } from "@/lib/uploadFile";
import type { Asset, EducationPlan, ElderCarePlan, FamilyMember, Goal, Liability, TaxOptimization } from "./api";

export const GINI_CSV_COLUMNS = [
  "Section",
  "Name",
  "Member",
  "Category",
  "Amount",
  "Rate %",
  "Saved",
  "Target Year",
  "Ownership",
  "Joint Share %",
  "EMI",
  "Tenure",
  "Priority",
  "Inflation %",
  "Funded By",
  "Funding Split",
  "Relationship",
  "Age",
  "Income",
  "Earner",
  "Dependent",
  "Retirement Age",
  "Life Expectancy",
  "Monthly Support",
  "Medical Reserve",
  "PPF Account",
] as const;

type Column = (typeof GINI_CSV_COLUMNS)[number];
type Row = Partial<Record<Column, unknown>>;

export const SECTIONS = ["Family", "Asset", "Liability", "Goal", "Elder Care", "Education", "Tax"] as const;
export type Section = (typeof SECTIONS)[number];
/** Saved only for Pro members (the server rejects them otherwise). */
export const PRO_SECTIONS: Section[] = ["Elder Care", "Education", "Tax"];

/** Tax rows: one per deduction, Name = label, Amount = value. */
const TAX_FIELDS = [
  { label: "80C PPF", group: "deductions_80c", key: "ppf" },
  { label: "80C ELSS", group: "deductions_80c", key: "elss" },
  { label: "80C NSC", group: "deductions_80c", key: "nsc" },
  { label: "80C Life Insurance Premium", group: "deductions_80c", key: "lifePremium" },
  { label: "80C Tuition Fees", group: "deductions_80c", key: "tuitionFees" },
  { label: "80D Self Health Insurance", group: "deductions_80d", key: "selfHealth" },
  { label: "80D Parents Health Insurance", group: "deductions_80d", key: "parentHealth" },
  { label: "80E Education Loan Interest", group: "deductions_80e", key: "educationLoanInterest" },
] as const;
const HUF_LABEL = "HUF Benefits";

export interface GiniData {
  family: FamilyMember[];
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
  elderCare: ElderCarePlan[];
  education: EducationPlan[];
  tax: TaxOptimization | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Download
// ─────────────────────────────────────────────────────────────────────────

const yesNo = (v: boolean | null | undefined) => (v == null ? "" : v ? "Yes" : "No");

export function buildGiniCsv(data: GiniData): string {
  const memberName = new Map(data.family.map((m) => [m.id, m.name]));
  const nameOf = (id: string | null | undefined) => (id ? memberName.get(id) ?? "" : "");
  const rows: Row[] = [];

  for (const m of data.family) {
    rows.push({
      Section: "Family",
      Name: m.name,
      Relationship: m.relationship,
      Age: m.age,
      Income: m.income,
      Earner: yesNo(m.is_earner),
      Dependent: yesNo(m.is_dependent),
      "Retirement Age": m.retirement_age,
      "Life Expectancy": m.life_expectancy,
    });
  }
  for (const a of data.assets) {
    rows.push({
      Section: "Asset",
      Name: a.name,
      Member: nameOf(a.owner),
      Category: a.category,
      Amount: a.value,
      "Rate %": a.return_rate,
      Ownership: a.ownership_type,
      "Joint Share %": a.joint_share,
    });
  }
  for (const l of data.liabilities) {
    rows.push({
      Section: "Liability",
      Name: l.name,
      Member: nameOf(l.owner),
      Category: l.type,
      Amount: l.amount,
      "Rate %": l.rate,
      EMI: l.emi,
      Tenure: l.tenure,
      Ownership: l.ownership_type,
      "Joint Share %": l.joint_share,
    });
  }
  for (const g of data.goals) {
    rows.push({
      Section: "Goal",
      Name: g.name,
      Member: nameOf(g.assigned_to),
      Category: g.category,
      Amount: g.current_cost,
      "Rate %": g.return_rate,
      Saved: g.saved,
      "Target Year": g.target_year,
      Priority: g.priority,
      "Inflation %": g.inflation,
      "Funded By": g.funded_by,
      "Funding Split": g.funding_split == null ? "" : typeof g.funding_split === "object" ? JSON.stringify(g.funding_split) : g.funding_split,
    });
  }
  for (const p of data.elderCare) {
    rows.push({
      Section: "Elder Care",
      Member: nameOf(p.member_id),
      "Monthly Support": p.monthly_support,
      "Medical Reserve": p.medical_reserve,
      "Life Expectancy": p.life_expectancy,
    });
  }
  for (const p of data.education) {
    rows.push({
      Section: "Education",
      Name: p.milestone,
      Member: nameOf(p.child_id),
      Amount: p.cost,
      Saved: p.saved,
      "Target Year": p.target_year,
      "PPF Account": p.ppf_account,
    });
  }
  if (data.tax) {
    for (const f of TAX_FIELDS) {
      const value = data.tax[f.group]?.[f.key];
      if (value != null && value !== 0) rows.push({ Section: "Tax", Name: f.label, Amount: value });
    }
    if (data.tax.huf_benefits) rows.push({ Section: "Tax", Name: HUF_LABEL, Amount: "Yes" });
  }

  const lines = [GINI_CSV_COLUMNS.join(","), ...rows.map((r) => GINI_CSV_COLUMNS.map((c) => csvCell(r[c])).join(","))];
  return lines.join("\n") + "\n";
}

// ─────────────────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────────────────

/** RFC 4180 CSV → rows of cells (quoted fields, "" escapes, CRLF, BOM). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** A record read from the file. Member names are resolved to ids at save time. */
export type ParsedRecord =
  | { section: "Family"; line: number; data: Omit<FamilyMember, "id" | "user_id" | "created_at" | "updated_at"> }
  | { section: "Asset"; line: number; member: string | null; data: Omit<Asset, "id" | "user_id" | "owner" | "created_at" | "updated_at"> }
  | {
      section: "Liability";
      line: number;
      member: string | null;
      data: Omit<Liability, "id" | "user_id" | "owner" | "created_at" | "updated_at">;
    }
  | { section: "Goal"; line: number; member: string | null; data: Omit<Goal, "id" | "user_id" | "assigned_to" | "created_at" | "updated_at"> }
  | {
      section: "Elder Care";
      line: number;
      member: string;
      data: Pick<ElderCarePlan, "monthly_support" | "medical_reserve" | "life_expectancy">;
    }
  | {
      section: "Education";
      line: number;
      member: string;
      data: Pick<EducationPlan, "milestone" | "target_year" | "cost" | "saved" | "ppf_account">;
    };

export interface ParsedGiniCsv {
  records: ParsedRecord[];
  /** Merged tax deductions, or null when the file has no Tax rows. */
  tax: Pick<TaxOptimization, "deductions_80c" | "deductions_80d" | "deductions_80e" | "huf_benefits"> | null;
  taxLines: number;
  /** Rows that could not be read, with the 1-based file line and why. */
  problems: { line: number; message: string }[];
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

function toNumber(raw: string | undefined): number | null | "bad" {
  const s = (raw ?? "").trim().replace(/[₹,\s]/g, "").replace(/%$/, "");
  if (s === "" || s === "-") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : "bad";
}

function toBool(raw: string | undefined): boolean | null {
  const s = (raw ?? "").trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return true;
  if (["no", "n", "false", "0"].includes(s)) return false;
  return null;
}

const text = (raw: string | undefined) => {
  const s = (raw ?? "").trim();
  return s === "" ? null : s;
};

function sectionOf(raw: string | undefined): Section | null {
  const s = norm(raw ?? "");
  const aliases: Record<string, Section> = {
    family: "Family",
    familymember: "Family",
    member: "Family",
    asset: "Asset",
    assets: "Asset",
    liability: "Liability",
    liabilities: "Liability",
    loan: "Liability",
    goal: "Goal",
    goals: "Goal",
    eldercare: "Elder Care",
    education: "Education",
    educationplan: "Education",
    tax: "Tax",
    taxoptimization: "Tax",
  };
  return aliases[s] ?? null;
}

const OWNERSHIP = ["Individual", "Joint", "Trust"] as const;

export function parseGiniCsv(content: string): ParsedGiniCsv {
  const grid = parseCsv(content);
  const result: ParsedGiniCsv = { records: [], tax: null, taxLines: 0, problems: [] };
  if (!grid.length) return result;

  const header = grid[0].map(norm);
  const index = new Map<Column, number>();
  for (const col of GINI_CSV_COLUMNS) {
    const i = header.indexOf(norm(col));
    if (i >= 0) index.set(col, i);
  }
  if (!index.has("Section")) {
    result.problems.push({ line: 1, message: "This isn't a Gini data file: the first row needs a \"Section\" column. Download your data once to see the format." });
    return result;
  }

  const tax = {
    deductions_80c: {} as Record<string, number>,
    deductions_80d: {} as Record<string, number>,
    deductions_80e: {} as Record<string, number>,
    huf_benefits: null as boolean | null,
  };

  grid.slice(1).forEach((cells, i) => {
    const line = i + 2;
    const get = (c: Column) => {
      const at = index.get(c);
      return at == null ? undefined : cells[at];
    };
    // One message per line: the first (most specific) one.
    const problem = (message: string) => {
      if (result.problems.at(-1)?.line !== line) result.problems.push({ line, message });
    };
    const nums: Partial<Record<Column, number | null>> = {};
    const num = (c: Column) => {
      if (!(c in nums)) {
        const v = toNumber(get(c));
        if (v === "bad") {
          problem(`"${c}" is not a number: ${get(c)}`);
          nums[c] = null;
        } else nums[c] = v;
      }
      return nums[c] ?? null;
    };
    const before = result.problems.length;
    const ok = () => result.problems.length === before;

    const section = sectionOf(get("Section"));
    if (!section) {
      problem(`Unknown section "${get("Section") ?? ""}" (use ${SECTIONS.join(", ")})`);
      return;
    }
    const name = text(get("Name"));
    const member = text(get("Member"));
    const ownershipRaw = text(get("Ownership"));
    const ownership = ownershipRaw ? OWNERSHIP.find((o) => o.toLowerCase() === ownershipRaw.toLowerCase()) ?? null : null;
    if (ownershipRaw && !ownership && section !== "Family") problem(`Ownership must be Individual, Joint or Trust, not "${ownershipRaw}"`);

    switch (section) {
      case "Family": {
        if (!name) return problem("A family member needs a Name");
        const data = {
          name,
          relationship: text(get("Relationship")),
          age: num("Age"),
          income: num("Income"),
          is_earner: toBool(get("Earner")),
          is_dependent: toBool(get("Dependent")),
          retirement_age: num("Retirement Age"),
          life_expectancy: num("Life Expectancy"),
        };
        if (ok()) result.records.push({ section, line, data });
        return;
      }
      case "Asset": {
        const value = num("Amount");
        if (!name) return problem("An asset needs a Name");
        if (value == null || value < 0) return problem("An asset needs an Amount of 0 or more");
        const data = {
          name,
          category: text(get("Category")),
          value,
          return_rate: num("Rate %"),
          ownership_type: ownership,
          joint_share: num("Joint Share %"),
        };
        if (ok()) result.records.push({ section, line, member, data });
        return;
      }
      case "Liability": {
        const amount = num("Amount");
        if (!name) return problem("A liability needs a Name");
        if (amount == null || amount <= 0) return problem("A liability needs an Amount above 0");
        const data = {
          name,
          type: text(get("Category")),
          amount,
          rate: num("Rate %"),
          emi: num("EMI"),
          tenure: num("Tenure"),
          ownership_type: ownership,
          joint_share: num("Joint Share %"),
        };
        if (ok()) result.records.push({ section, line, member, data });
        return;
      }
      case "Goal": {
        const cost = num("Amount");
        if (!name) return problem("A goal needs a Name");
        if (cost == null || cost <= 0) return problem("A goal needs an Amount (cost today) above 0");
        const splitRaw = text(get("Funding Split"));
        let funding_split: unknown = null;
        if (splitRaw) {
          const n = toNumber(splitRaw);
          if (typeof n === "number") funding_split = n;
          else {
            try {
              funding_split = JSON.parse(splitRaw);
            } catch {
              funding_split = splitRaw;
            }
          }
        }
        const data = {
          name,
          category: text(get("Category")),
          current_cost: cost,
          target_year: num("Target Year"),
          priority: text(get("Priority")),
          inflation: num("Inflation %"),
          saved: num("Saved"),
          return_rate: num("Rate %"),
          funded_by: text(get("Funded By")),
          funding_split,
        };
        if (ok()) result.records.push({ section, line, member, data });
        return;
      }
      case "Elder Care": {
        const who = member ?? name;
        if (!who) return problem("An elder-care plan needs the family Member it is for");
        const data = {
          monthly_support: num("Monthly Support"),
          medical_reserve: num("Medical Reserve"),
          life_expectancy: num("Life Expectancy"),
        };
        if (ok()) result.records.push({ section, line, member: who, data });
        return;
      }
      case "Education": {
        if (!member) return problem("An education plan needs the child's name in Member");
        const data = {
          milestone: name,
          target_year: num("Target Year"),
          cost: num("Amount"),
          saved: num("Saved"),
          ppf_account: text(get("PPF Account")),
        };
        if (ok()) result.records.push({ section, line, member, data });
        return;
      }
      case "Tax": {
        if (name && norm(name) === norm(HUF_LABEL)) {
          tax.huf_benefits = toBool(get("Amount")) ?? false;
          result.taxLines++;
          return;
        }
        const field = TAX_FIELDS.find((f) => norm(f.label) === norm(name ?? "") || norm(f.key) === norm(name ?? ""));
        if (!field) return problem(`Unknown tax item "${name ?? ""}" (use ${[...TAX_FIELDS.map((f) => f.label), HUF_LABEL].join(", ")})`);
        const amount = num("Amount");
        if (amount != null && amount < 0) return problem("A tax deduction can't be negative");
        if (ok()) {
          tax[field.group][field.key] = amount ?? 0;
          result.taxLines++;
        }
        return;
      }
    }
  });

  if (result.taxLines) result.tax = tax;
  return result;
}

/** Number of records per section, for the preview. */
export function countBySection(parsed: ParsedGiniCsv): Record<Section, number> {
  const counts = Object.fromEntries(SECTIONS.map((s) => [s, 0])) as Record<Section, number>;
  for (const r of parsed.records) counts[r.section]++;
  counts.Tax = parsed.tax ? 1 : 0;
  return counts;
}
