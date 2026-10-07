// Saves a parsed Gini data CSV (./giniDataCsv.ts) through the normal create /
// update endpoints, so imported records behave like hand-entered ones.
//
// Merge rules (nothing is ever deleted):
// - A record that matches one you already have is updated, not duplicated:
//   family members, assets, liabilities and goals match by name; elder-care
//   plans by family member; education plans by child + milestone.
// - A blank cell keeps the value you already have.
// - Family rows are saved first, so other rows can refer to a member that is
//   new in the same file.
// - Elder care, education and tax are Pro features: for free accounts they
//   are counted and left out.
import { api } from "./api";
import type { GiniData, ParsedGiniCsv, ParsedRecord, Section } from "./giniDataCsv";
import { PRO_SECTIONS } from "./giniDataCsv";

export interface ImportOutcome {
  created: number;
  updated: number;
  /** Pro-only records not saved on a free account. */
  proSkipped: number;
  failed: { line: number; section: Section; message: string }[];
  /** Saved, but something was left out (e.g. an unknown owner). */
  notes: { line: number; message: string }[];
}

type Api = Pick<typeof api, "familyMembers" | "assets" | "liabilities" | "goals" | "elderCare" | "educationPlans" | "taxOptimization">;

const key = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** Drops null/undefined so a blank cell never clears a saved value. */
function filled<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>;
}

const errorMessage = (err: unknown) => {
  const e = err as { message?: string; errors?: string[] };
  return e?.errors?.join(", ") || e?.message || "Could not be saved";
};

export async function applyGiniImport(
  parsed: ParsedGiniCsv,
  existing: GiniData,
  opts: { isPro: boolean; client?: Api; pauseMs?: number; onProgress?: (done: number, total: number) => void },
): Promise<ImportOutcome> {
  const client = opts.client ?? api;
  const pause = opts.pauseMs ?? 120;
  const out: ImportOutcome = { created: 0, updated: 0, proSkipped: 0, failed: [], notes: [] };

  const order: Section[] = ["Family", "Asset", "Liability", "Goal", "Elder Care", "Education"];
  const records = [...parsed.records].sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section) || a.line - b.line);
  const saveTax = parsed.tax !== null;
  const total = records.length + (saveTax ? 1 : 0);
  let done = 0;
  const tick = async () => {
    opts.onProgress?.(++done, total);
    // The API sits behind a rate limiter; don't fire a burst of requests.
    if (pause) await new Promise((r) => setTimeout(r, pause));
  };

  const members = new Map(existing.family.map((m) => [key(m.name), m.id]));
  const byName = <T extends { id: string; name: string }>(list: T[]) => new Map(list.map((x) => [key(x.name), x.id]));
  const assets = byName(existing.assets);
  const liabilities = byName(existing.liabilities);
  const goals = byName(existing.goals);
  const elder = new Map(existing.elderCare.map((p) => [p.member_id, p.id]));
  const education = new Map(existing.education.map((p) => [`${p.child_id}|${key(p.milestone)}`, p.id]));

  const ownerId = (r: ParsedRecord & { member: string | null }) => {
    if (!r.member) return null;
    const id = members.get(key(r.member));
    if (!id) out.notes.push({ line: r.line, message: `No family member called "${r.member}", saved without an owner` });
    return id ?? null;
  };

  for (const r of records) {
    if (PRO_SECTIONS.includes(r.section) && !opts.isPro) {
      out.proSkipped++;
      await tick();
      continue;
    }
    try {
      switch (r.section) {
        case "Family": {
          const id = members.get(key(r.data.name));
          if (id) {
            await client.familyMembers.updateFamilyMember(id, filled(r.data));
            out.updated++;
          } else {
            const saved = await client.familyMembers.createFamilyMember({ ...filled(r.data), name: r.data.name });
            members.set(key(saved.name), saved.id);
            out.created++;
          }
          break;
        }
        case "Asset": {
          const body = { ...filled(r.data), owner: ownerId(r) ?? undefined };
          const id = assets.get(key(r.data.name));
          if (id) {
            await client.assets.updateAsset(id, filled(body));
            out.updated++;
          } else {
            const saved = await client.assets.createAsset({ ownership_type: "Individual", ...filled(body), name: r.data.name, value: r.data.value });
            assets.set(key(saved.name), saved.id);
            out.created++;
          }
          break;
        }
        case "Liability": {
          const body = { ...filled(r.data), owner: ownerId(r) ?? undefined };
          const id = liabilities.get(key(r.data.name));
          if (id) {
            await client.liabilities.updateLiability(id, filled(body));
            out.updated++;
          } else {
            const saved = await client.liabilities.createLiability({
              ownership_type: "Individual",
              ...filled(body),
              name: r.data.name,
              amount: r.data.amount,
            });
            liabilities.set(key(saved.name), saved.id);
            out.created++;
          }
          break;
        }
        case "Goal": {
          const body = { ...filled(r.data), assigned_to: ownerId(r) ?? undefined };
          const id = goals.get(key(r.data.name));
          if (id) {
            await client.goals.updateGoal(id, filled(body));
            out.updated++;
          } else {
            const saved = await client.goals.createGoal({ ...filled(body), name: r.data.name, current_cost: r.data.current_cost });
            goals.set(key(saved.name), saved.id);
            out.created++;
          }
          break;
        }
        case "Elder Care": {
          const memberId = members.get(key(r.member));
          if (!memberId) throw new Error(`No family member called "${r.member}"`);
          const id = elder.get(memberId);
          if (id) {
            await client.elderCare.updatePlan(id, filled(r.data));
            out.updated++;
          } else {
            const saved = await client.elderCare.createPlan({ ...filled(r.data), member_id: memberId });
            elder.set(memberId, saved.id);
            out.created++;
          }
          break;
        }
        case "Education": {
          const childId = members.get(key(r.member));
          if (!childId) throw new Error(`No family member called "${r.member}"`);
          const k = `${childId}|${key(r.data.milestone)}`;
          const id = education.get(k);
          if (id) {
            await client.educationPlans.updatePlan(id, filled(r.data));
            out.updated++;
          } else {
            const saved = await client.educationPlans.createPlan({ ...filled(r.data), child_id: childId });
            education.set(k, saved.id);
            out.created++;
          }
          break;
        }
      }
    } catch (err) {
      out.failed.push({ line: r.line, section: r.section, message: errorMessage(err) });
    }
    await tick();
  }

  if (saveTax && parsed.tax) {
    if (!opts.isPro) out.proSkipped++;
    else {
      const current = existing.tax;
      try {
        await client.taxOptimization.update({
          deductions_80c: { ...(current?.deductions_80c ?? {}), ...parsed.tax.deductions_80c },
          deductions_80d: { ...(current?.deductions_80d ?? {}), ...parsed.tax.deductions_80d },
          deductions_80e: { ...(current?.deductions_80e ?? {}), ...parsed.tax.deductions_80e },
          huf_benefits: parsed.tax.huf_benefits ?? current?.huf_benefits ?? false,
        });
        if (current) out.updated++;
        else out.created++;
      } catch (err) {
        out.failed.push({ line: 0, section: "Tax", message: errorMessage(err) });
      }
    }
    await tick();
  }

  return out;
}

/** Everything the signed-in user has in Gini. Pro-only parts come back empty for free accounts. */
export async function fetchGiniData(isPro: boolean, client: Api = api): Promise<GiniData> {
  const optional = async <T,>(load: () => Promise<T>, fallback: T) => {
    if (!isPro) return fallback;
    try {
      return await load();
    } catch {
      return fallback;
    }
  };
  const [family, assets, liabilities, goals] = await Promise.all([
    client.familyMembers.getFamilyMembers(),
    client.assets.getAssets(),
    client.liabilities.getLiabilities(),
    client.goals.getGoals(),
  ]);
  const elderCare = await optional(() => client.elderCare.getPlans(), []);
  const education = await optional(() => client.educationPlans.getPlans(), []);
  const tax = await optional(() => client.taxOptimization.get(), null);
  return { family, assets, liabilities, goals, elderCare, education, tax };
}
