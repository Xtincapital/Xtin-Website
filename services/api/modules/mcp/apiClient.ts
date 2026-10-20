// How the MCP server reaches Xtin: over the public /api/v1 contract, with the
// caller's own token — exactly like any other client. It never touches the
// database, so quotas, plan gates, caching and metering all apply unchanged.
import { createHash } from "node:crypto";

export type Problem = { status: number; code: string; title: string; detail?: string; errors?: string[]; feature?: string };

export class ApiProblem extends Error {
    problem: Problem;
    constructor(problem: Problem) {
        super(problem.detail || problem.title);
        this.name = "ApiProblem";
        this.problem = problem;
    }
}

export type ApiClient = <T = unknown>(method: "GET" | "POST" | "DELETE", path: string, body?: unknown) => Promise<T>;

/** A client bound to one caller's bearer token. `base` is the /api/v1 root, e.g. http://127.0.0.1:5002/api/v1. */
export function apiClient(base: string, token: string): ApiClient {
    return async <T>(method: "GET" | "POST" | "DELETE", path: string, body?: unknown): Promise<T> => {
        const headers: Record<string, string> = { Authorization: `Bearer ${token}`, "X-Xtin-Channel": "mcp", Accept: "application/json" };
        if (body !== undefined) headers["Content-Type"] = "application/json";
        // Saves carry a key derived from the request itself (the API scopes keys per
        // user), so a retried save within 24 hours returns the first answer instead
        // of a duplicate. Runs don't: an identical run on identical data is already
        // free from the result cache, and a newer data day must run fresh.
        if (method === "POST" && path.startsWith("/strategies") && path !== "/strategies/validate") headers["Idempotency-Key"] = `mcp-${createHash("sha256").update(`${path}\n${JSON.stringify(body ?? null)}`).digest("hex")}`;
        const res = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
        if (res.status === 204) return undefined as T;
        const data = (await res.json().catch(() => null)) as Record<string, any> | null;
        if (!res.ok) {
            throw new ApiProblem({
                status: res.status,
                code: data?.code ?? "error",
                title: data?.title ?? `Request failed (${res.status})`,
                detail: data?.detail,
                errors: Array.isArray(data?.errors) ? data.errors : undefined,
                feature: data?.feature,
            });
        }
        return data as T;
    };
}
