import authService from "@/services/authService";
import { BACKEND_URL } from "@/config/env";
import { importFileType, uploadForParse } from "@/lib/uploadFile";

export type LinkStatus = "pending" | "active" | "revoked";
export type LinkFilter = LinkStatus | "all";
export type NameMatch = "match" | "partial" | "mismatch" | "unknown";

export type AdminBrokerLink = {
  id: string;
  client_code: string;
  status: LinkStatus;
  created_at: string;
  consent_at: string;
  consent_version: string;
  verified_at: string | null;
  verification_method: string | null;
  review_outcome: "approved" | "rejected" | null;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  last_synced_at: string | null;
  last_sync_status: "success" | "failed" | null;
  last_sync_error: string | null;
  user: { email: string | null; name: string | null };
};

/** What the broker has on file for a client code, set against the customer's name on Xtin. */
export type ProfileCheck =
  | { available: false; reason: string }
  | { available: true; broker_name: string | null; account_name: string | null; match: NameMatch };

/** One daily sync run (a row of broker_sync_runs). */
export type BrokerSyncRun = {
  id: string;
  source: string;
  status: "running" | "success" | "failed" | "skipped";
  started_at: string;
  completed_at: string | null;
  // While a run is going this holds its progress (done of total, and when it last reported); afterwards, how it ended.
  result: null | { backfill?: boolean; clientCode?: string; done?: number; total?: number; heartbeat?: string; synced?: number; failed?: number; paused?: number; awaitingConsent?: number; error?: string; reason?: string; failures?: Array<{ clientCode: string; error: string }> };
};

/** What a history file would do (applied: false) or did (applied: true) for one customer. */
export type BackfillReport = {
  applied: boolean;
  file: {
    /** Executions in the file for this customer. */
    executions: number;
    /** Of those, ones not already held. */
    newExecutions: number;
    skippedRows: number;
    otherClientRows: number;
    leftOutDays: string[];
    leftOutDayCount: number;
    from: string | null;
    to: string | null;
  };
  changes: {
    add: number;
    update: number;
    remove: number;
    keptCount: number;
    /** Trades the customer has edited that the history would otherwise change or remove; left as they are. */
    kept: Array<{ externalId: string; asset: string; date: string; why: "changed" | "superseded" }>;
  };
  /** What the customer's history comes to once added. */
  history: { fills: number; trades: number; open: number; unmatched: number };
};

export type CheckStatus = "ok" | "warn" | "fail";

/** Is everything in place to go live: each check says what it found, in words an admin can act on. */
export type Readiness = {
  /** Nothing that would stop it working. Warnings don't count. */
  ready: boolean;
  checks: Array<{ id: string; label: string; status: CheckStatus; detail: string }>;
  summary: { ok: number; warn: number; fail: number };
  links: { pending: number; active: number; revoked: number; outdatedConsent: number };
};

/** A trade as the statement or the journal has it. Profit and loss is before brokerage and taxes. */
export type TradeBrief = {
  date: string;
  exitDate: string | null;
  asset: string;
  contract: string | null;
  side: string;
  quantity: number;
  entryPrice: number | null;
  exitPrice: number | null;
  grossPnl: number | null;
};

/** The customer's own statement set against what their journal holds, trade by trade. */
export type StatementCheck = {
  file: { executions: number; trades: number; skippedRows: number; otherClientRows: number; from: string | null; to: string | null };
  /** The days that could be compared: the statement's, from the first day the sync has data. */
  window: { from: string | null; to: string | null; statementTrades: number; journalTrades: number };
  matched: number;
  differences: Array<{ statement: TradeBrief; journal: TradeBrief; what: string[] }>;
  missingInJournal: TradeBrief[];
  extraInJournal: TradeBrief[];
  counts: { differences: number; missingInJournal: number; extraInJournal: number };
  notCompared: { beforeSync: number; carriedIn: number; continuesAfter: number };
  totals: { statement: number; journal: number; difference: number };
  daysThatDiffer: Array<{ date: string; statement: number; journal: number; difference: number }>;
};

/** The address the broker sees our requests coming from, and whether that is a proxy's. */
export type OutboundIp = { ip: string; via: "direct" | "proxy" };

export type DiagnosisResult = { available: false; reason: string } | { available: true; steps: Array<{ name: string; ok: boolean; detail: string }> };

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/admin/broker${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export const adminBrokerLinks = {
  list: (status: LinkFilter) => call<{ links: AdminBrokerLink[] }>(`/links?status=${status}`).then((r) => r.links),
  check: (id: string) => call<ProfileCheck>(`/links/${id}/check`),
  approve: (id: string, note: string) => call<{ link: AdminBrokerLink }>(`/links/${id}/approve`, { method: "POST", body: JSON.stringify({ note }) }).then((r) => r.link),
  reject: (id: string, note: string) => call<{ link: AdminBrokerLink }>(`/links/${id}/reject`, { method: "POST", body: JSON.stringify({ note }) }).then((r) => r.link),
  runs: () => call<{ runs: BrokerSyncRun[] }>("/runs").then((r) => r.runs),
  /** Runs the daily sync now. `started: false` comes with the reason it didn't. */
  startSync: () => call<{ started: boolean; reason?: string }>("/sync", { method: "POST" }),
  /** A read-only test of the broker connection; the client code is optional. */
  diagnose: (clientCode?: string) => call<DiagnosisResult>("/diagnose", { method: "POST", body: JSON.stringify(clientCode ? { client_code: clientCode } : {}) }),
  outboundIp: () => call<OutboundIp>("/outbound-ip"),
  /** The launch checklist, worked out from the real settings and database. */
  readiness: () => call<Readiness>("/readiness"),
  /** Sets a customer's own statement against their journal. Read-only. */
  compare: (id: string, file: File): Promise<StatementCheck> => {
    const type = importFileType(file);
    if (type !== "csv" && type !== "excel") return Promise.reject(new Error("Choose a CSV or Excel file."));
    return uploadForParse<StatementCheck>(`/api/admin/broker/links/${id}/compare`, file, { file_type: type });
  },
  /** Sends a tradebook file for a customer. Only reports what it would do, unless `apply` is true. */
  backfill: (id: string, file: File, apply: boolean): Promise<BackfillReport> => {
    const type = importFileType(file);
    if (type !== "csv" && type !== "excel") return Promise.reject(new Error("Choose a CSV or Excel file."));
    return uploadForParse<BackfillReport>(`/api/admin/broker/links/${id}/backfill${apply ? "?apply=true" : ""}`, file, { file_type: type });
  },
};
