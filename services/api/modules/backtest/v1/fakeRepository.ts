// An in-memory stand-in for repository.ts (Supabase), shared by the v1 and MCP
// HTTP tests:  vi.mock("…/repository.js", async () => (await import("…/fakeRepository.js")).repo)
import { vi } from "vitest";
import { randomUUID } from "node:crypto";

export const db = {
    strategies: new Map<string, any>(),
    versions: new Map<string, any[]>(),
    runs: new Map<string, any>(),
    usage: new Map<string, number>(),
    pro: new Set<string>(),
};

export const repo = (() => {
    const now = () => new Date().toISOString();
    return {
        BacktestTablesMissingError: class extends Error {},
        getCachedCandles: vi.fn(async () => null as unknown),
        saveCachedCandles: vi.fn(async () => undefined),
        getProPlan: vi.fn(async (u: string) => (db.pro.has(u) ? { user_id: u, pass_id: "monthly", valid_until: new Date(Date.now() + 86_400_000).toISOString() } : null)),
        getAccountCreatedAt: vi.fn(async () => "2020-01-01T00:00:00Z"),
        getUsage: vi.fn(async (scope: string, period: string, kind: string) => db.usage.get(`${scope}|${period}|${kind}`) ?? 0),
        consumeUsage: vi.fn(async (scope: string, period: string, kind: string) => {
            const k = `${scope}|${period}|${kind}`;
            db.usage.set(k, (db.usage.get(k) ?? 0) + 1);
            return db.usage.get(k)!;
        }),
        recordMeter: vi.fn(async (_row: Record<string, unknown>) => undefined),
        listStrategies: vi.fn(async (u: string) => [...db.strategies.values()].filter((s) => s.user_id === u)),
        getStrategy: vi.fn(async (u: string, id: string) => (db.strategies.get(id)?.user_id === u ? db.strategies.get(id) : null)),
        insertStrategy: vi.fn(async (row: any) => {
            const s = { ...row, id: randomUUID(), created_at: now(), updated_at: now() };
            db.strategies.set(s.id, s);
            return s;
        }),
        updateStrategy: vi.fn(async (u: string, id: string, patch: any) => {
            const s = db.strategies.get(id);
            if (!s || s.user_id !== u) return null;
            Object.assign(s, patch, { updated_at: now() });
            return s;
        }),
        deleteStrategy: vi.fn(async (u: string, id: string) => db.strategies.get(id)?.user_id === u && db.strategies.delete(id)),
        listStrategyVersions: vi.fn(async (id: string) => [...(db.versions.get(id) ?? [])].sort((a, b) => b.version - a.version)),
        latestVersions: vi.fn(async (ids: string[]) => new Map(ids.filter((id) => db.versions.get(id)?.length).map((id) => [id, Math.max(...db.versions.get(id)!.map((v) => v.version))]))),
        appendStrategyVersion: vi.fn(async (id: string, spec: any, spec_hash: string) => {
            const list = db.versions.get(id) ?? [];
            const version = list.length + 1;
            list.push({ strategy_id: id, version, spec, spec_hash, created_at: now() });
            db.versions.set(id, list);
            return version;
        }),
        insertRun: vi.fn(async (row: any) => {
            const r = { ...row, id: randomUUID(), created_at: now() };
            db.runs.set(r.id, r);
            return r;
        }),
        getRun: vi.fn(async (u: string, id: string) => (db.runs.get(id)?.user_id === u ? db.runs.get(id) : null)),
        getRuns: vi.fn(async (u: string, ids: string[]) => ids.map((id) => db.runs.get(id)).filter((r) => r && r.user_id === u)),
        listRuns: vi.fn(async (u: string, limit: number, offset = 0) =>
            [...db.runs.values()]
                .filter((r) => r.user_id === u)
                .reverse()
                .slice(offset, offset + limit)
                .map(({ result, ...r }) => ({ ...r, metrics: result?.metrics ?? null }))
        ),
        deleteRun: vi.fn(async (u: string, id: string) => db.runs.get(id)?.user_id === u && db.runs.delete(id)),
        findCachedRun: vi.fn(
            async (u: string, h: string, e: string, d: string) =>
                [...db.runs.values()].reverse().find((r) => r.user_id === u && r.spec_hash === h && r.engine_version === e && r.data_version === d && r.status === "completed") ?? null
        ),
    };
})();

/** Empty every table between tests. */
export function resetDb() {
    db.strategies.clear();
    db.versions.clear();
    db.runs.clear();
    db.usage.clear();
    db.pro.clear();
}
