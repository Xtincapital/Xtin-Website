// /admin/broker-links — confirm which broker client code belongs to which customer.
//
// A customer who asks to connect their broker lands here as a waiting request.
// Nothing of theirs is read from the broker until it is approved, so this is the
// check that stops someone typing in another person's client code. The names let
// you compare: the customer's name on Xtin beside the name the broker has on file.
// The API (services/api/modules/journal/broker) enforces who may approve; this
// page only drives it.
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Play, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import SEO from "@/components/SEO";
import AdminHeader from "../components/AdminHeader";
import {
  adminBrokerLinks,
  type AdminBrokerLink,
  type BackfillReport,
  type BrokerSyncRun,
  type CheckStatus,
  type DiagnosisResult,
  type LinkFilter,
  type LinkStatus,
  type NameMatch,
  type OutboundIp,
  type ProfileCheck,
  type Readiness,
  type StatementCheck,
  type TradeBrief,
} from "../lib/brokerLinks";

const TABS: Array<{ id: LinkFilter; label: string }> = [
  { id: "pending", label: "Waiting" },
  { id: "active", label: "Active" },
  { id: "revoked", label: "Turned down or removed" },
  { id: "all", label: "All" },
];

const STATUS: Record<LinkStatus, { label: string; badge: string }> = {
  pending: { label: "Waiting", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  active: { label: "Active", badge: "bg-brand-soft text-brand dark:bg-brand-fill/40 dark:text-brand" },
  revoked: { label: "Removed", badge: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
};

const MATCH: Record<NameMatch, { label: string; cls: string }> = {
  match: { label: "Names match", cls: "bg-brand-soft text-brand dark:bg-brand-fill/40 dark:text-brand" },
  partial: { label: "Names partly match", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  mismatch: { label: "Names don't match", cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  unknown: { label: "Can't compare names", cls: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
};

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** What a history file would do, in plain sentences. */
function HistoryPreview({ report }: { report: BackfillReport }) {
  const { file, changes, history } = report;
  return (
    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
      <p>
        Read <strong>{plural(file.executions, "execution")}</strong>
        {file.from && file.to ? <> from {file.from === file.to ? file.from : `${file.from} to ${file.to}`}</> : null} for this customer.
        {file.skippedRows > 0 && <> {plural(file.skippedRows, "row")} couldn't be read and {file.skippedRows === 1 ? "was" : "were"} skipped.</>}
        {file.otherClientRows > 0 && <> {plural(file.otherClientRows, "row")} for other clients {file.otherClientRows === 1 ? "was" : "were"} ignored.</>}
      </p>
      {file.leftOutDayCount > 0 && (
        <p>
          {plural(file.leftOutDayCount, "day")} the live sync already holds {file.leftOutDayCount === 1 ? "was" : "were"} left alone ({file.leftOutDays.slice(0, 5).join(", ")}
          {file.leftOutDayCount > 5 ? ", …" : ""}).
        </p>
      )}
      {file.newExecutions === 0 ? (
        <p className="font-medium">Nothing in this file is new, so there is nothing to add.</p>
      ) : (
        <p>
          {report.applied ? "Added" : "Would add"} <strong>{plural(changes.add, "trade")}</strong>, {report.applied ? "corrected" : "correct"} <strong>{changes.update}</strong> and {report.applied ? "removed" : "remove"} <strong>{changes.remove}</strong> that the earlier history shows were wrong.
        </p>
      )}
      {changes.keptCount > 0 && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p>
            {plural(changes.keptCount, "trade")} the customer has edited would differ from the full history. {changes.keptCount === 1 ? "It is" : "They are"} kept as {changes.keptCount === 1 ? "it is" : "they are"}, for you to look at:
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {changes.kept.map((k) => (
              <li key={k.externalId}>
                {k.asset || "Trade"} on {k.date}: {k.why === "superseded" ? "the history says it shouldn't exist" : "the history gives different numbers"}
              </li>
            ))}
            {changes.keptCount > changes.kept.length && <li>…and {changes.keptCount - changes.kept.length} more</li>}
          </ul>
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Their history {report.applied ? "is now" : "would then be"} {plural(history.trades, "trade")} and {plural(history.open, "open position")}
        {history.unmatched > 0 ? `, with ${plural(history.unmatched, "sale")} that ${history.unmatched === 1 ? "has" : "have"} no purchase on record` : ""}.
      </p>
    </div>
  );
}

const rupees = (n: number | null) => (n === null ? "-" : `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
const brief = (t: TradeBrief) => `${t.asset}${t.contract ? ` ${t.contract}` : ""} ${t.side} ${t.quantity}, ${t.entryPrice ?? "?"} to ${t.exitPrice ?? "?"}, ${rupees(t.grossPnl)}`;

/** How the journal compares with the customer's own statement, in plain sentences. */
function StatementResult({ report }: { report: StatementCheck }) {
  const { file, window: win, counts, notCompared, totals } = report;
  const problems = counts.differences + counts.missingInJournal + counts.extraInJournal;
  const nothing = win.from === null;
  return (
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
      <p>
        Read <strong>{plural(file.executions, "execution")}</strong> ({plural(file.trades, "trade")})
        {file.from && file.to ? <> from {file.from === file.to ? file.from : `${file.from} to ${file.to}`}</> : null}.
        {file.skippedRows > 0 && <> {plural(file.skippedRows, "row")} couldn't be read.</>}
        {file.otherClientRows > 0 && <> {plural(file.otherClientRows, "row")} for other clients {file.otherClientRows === 1 ? "was" : "were"} ignored.</>}
      </p>
      {nothing ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Nothing to compare yet: the sync holds no data for this customer on the days this statement covers.</p>
      ) : problems === 0 ? (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          The journal agrees with the statement: all {plural(report.matched, "trade")} match from {win.from === win.to ? win.from : `${win.from} to ${win.to}`}.
        </p>
      ) : (
        <p role="status" className="rounded-lg bg-red-50 px-3 py-2 font-medium text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {plural(problems, "disagreement")} found. {plural(report.matched, "trade")} matched.
        </p>
      )}
      {!nothing && (
        <p>
          Profit and loss before brokerage: statement <strong>{rupees(totals.statement)}</strong>, journal <strong>{rupees(totals.journal)}</strong>
          {totals.difference !== 0 && <> (the journal is {rupees(Math.abs(totals.difference))} {totals.difference > 0 ? "higher" : "lower"})</>}.
        </p>
      )}
      {(notCompared.beforeSync > 0 || notCompared.carriedIn > 0 || notCompared.continuesAfter > 0) && (
        <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400">
          {notCompared.beforeSync > 0 && <li>{plural(notCompared.beforeSync, "statement trade")} from before the sync had any data {notCompared.beforeSync === 1 ? "was" : "were"} left out. Add that history from a file if you want it in.</li>}
          {notCompared.carriedIn > 0 && <li>{plural(notCompared.carriedIn, "trade")} began before the statement's first day and {notCompared.carriedIn === 1 ? "was" : "were"} left out.</li>}
          {notCompared.continuesAfter > 0 && <li>{plural(notCompared.continuesAfter, "trade")} {notCompared.continuesAfter === 1 ? "is" : "are"} still going after the statement's last day and {notCompared.continuesAfter === 1 ? "was" : "were"} left out.</li>}
        </ul>
      )}
      {report.differences.length > 0 && (
        <div>
          <h5 className="font-semibold">Trades that differ</h5>
          <ul className="mt-1 space-y-2">
            {report.differences.map((d, i) => (
              <li key={`${d.statement.date}-${d.statement.asset}-${i}`} className="rounded-lg bg-slate-100 px-3 py-2 text-xs dark:bg-slate-800">
                <p className="font-medium">
                  {d.statement.date} · {d.statement.asset}: {d.what.join(", ")} {d.what.length === 1 ? "differs" : "differ"}
                </p>
                <p>Statement: {brief(d.statement)}</p>
                <p>Journal: {brief(d.journal)}</p>
              </li>
            ))}
          </ul>
          {counts.differences > report.differences.length && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">…and {counts.differences - report.differences.length} more</p>}
        </div>
      )}
      {report.missingInJournal.length > 0 && (
        <div>
          <h5 className="font-semibold">In the statement, not in the journal</h5>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {report.missingInJournal.map((t, i) => (
              <li key={`${t.date}-${t.asset}-${i}`}>
                {t.date}: {brief(t)}
              </li>
            ))}
          </ul>
          {counts.missingInJournal > report.missingInJournal.length && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">…and {counts.missingInJournal - report.missingInJournal.length} more</p>}
        </div>
      )}
      {report.extraInJournal.length > 0 && (
        <div>
          <h5 className="font-semibold">In the journal, not in the statement</h5>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {report.extraInJournal.map((t, i) => (
              <li key={`${t.date}-${t.asset}-${i}`}>
                {t.date}: {brief(t)}
              </li>
            ))}
          </ul>
          {counts.extraInJournal > report.extraInJournal.length && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">…and {counts.extraInJournal - report.extraInJournal.length} more</p>}
        </div>
      )}
      {report.daysThatDiffer.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Days where profit and loss disagree: {report.daysThatDiffer.slice(0, 6).map((d) => `${d.date} (${rupees(d.difference)})`).join(", ")}
          {report.daysThatDiffer.length > 6 ? ", …" : ""}.
        </p>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function LinkCard({ link, onChanged }: { link: AdminBrokerLink; onChanged: (l: AdminBrokerLink) => void }) {
  const [open, setOpen] = useState(link.status === "pending");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | "check" | null>(null);
  const [check, setCheck] = useState<ProfileCheck | null>(null);
  const [error, setError] = useState("");
  // Adding earlier history from a broker file: choose it, see what it would do, then apply.
  const fileInput = useRef<HTMLInputElement>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [report, setReport] = useState<BackfillReport | null>(null);
  const [historyBusy, setHistoryBusy] = useState<"preview" | "apply" | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [historyDone, setHistoryDone] = useState("");
  // Setting the customer's own statement against their journal: read-only, so it runs as soon as a file is chosen.
  const statementInput = useRef<HTMLInputElement>(null);
  const [statement, setStatement] = useState<StatementCheck | null>(null);
  const [statementBusy, setStatementBusy] = useState(false);
  const [statementError, setStatementError] = useState("");

  const clearStatement = () => {
    setStatement(null);
    setStatementError("");
    if (statementInput.current) statementInput.current.value = "";
  };

  const chooseStatement = async (file: File | undefined) => {
    if (!file) return;
    setStatement(null);
    setStatementError("");
    setStatementBusy(true);
    try {
      setStatement(await adminBrokerLinks.compare(link.id, file));
    } catch (e) {
      setStatementError(e instanceof Error ? e.message : "Could not check that file");
    } finally {
      setStatementBusy(false);
    }
  };

  const clearHistory = () => {
    setHistoryFile(null);
    setReport(null);
    setHistoryError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const chooseHistory = async (file: File | undefined) => {
    if (!file) return;
    setReport(null);
    setHistoryError("");
    setHistoryDone("");
    setHistoryFile(file);
    setHistoryBusy("preview");
    try {
      setReport(await adminBrokerLinks.backfill(link.id, file, false));
    } catch (e) {
      setHistoryFile(null);
      setHistoryError(e instanceof Error ? e.message : "Could not read that file");
    } finally {
      setHistoryBusy(null);
    }
  };

  const applyHistory = async () => {
    if (!historyFile) return;
    setHistoryBusy("apply");
    setHistoryError("");
    try {
      const done = await adminBrokerLinks.backfill(link.id, historyFile, true);
      clearHistory();
      setHistoryDone(`History added: ${plural(done.changes.add, "trade")} added, ${done.changes.update} corrected, ${done.changes.remove} removed.${done.changes.keptCount ? ` ${plural(done.changes.keptCount, "edited trade")} kept for review.` : ""}`);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "Could not add the history");
    } finally {
      setHistoryBusy(null);
    }
  };

  const run = async (kind: "approve" | "reject") => {
    setBusy(kind);
    setError("");
    try {
      onChanged(await (kind === "approve" ? adminBrokerLinks.approve : adminBrokerLinks.reject)(link.id, note.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that");
    } finally {
      setBusy(null);
    }
  };

  const runCheck = async () => {
    setBusy("check");
    setError("");
    try {
      setCheck(await adminBrokerLinks.check(link.id));
    } catch (e) {
      setCheck(null);
      setError(e instanceof Error ? e.message : "Could not check with the broker");
    } finally {
      setBusy(null);
    }
  };

  const who = link.user.name || link.user.email || "A customer";
  const waiting = link.status === "pending";
  const active = link.status === "active";
  const noteRequired = !note.trim();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
            <span className="tabular-nums">{link.client_code}</span> <span className="font-normal text-slate-500 dark:text-slate-400">· {who}</span>
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">Asked {when(link.created_at)}</p>
        </div>
        {active && link.last_sync_status === "failed" && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-300">Sync failing</span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[link.status].badge}`}>{STATUS[link.status].label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 px-5 py-5 dark:border-slate-700">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label="Customer">{link.user.name || "No name on file"}</Fact>
            <Fact label="Email">{link.user.email || "-"}</Fact>
            <Fact label="Client code">
              <span className="tabular-nums">{link.client_code}</span>
            </Fact>
            <Fact label="Consent given">
              {when(link.consent_at)} <span className="text-slate-500 dark:text-slate-400">(wording {link.consent_version})</span>
            </Fact>
            {active && <Fact label="Last synced">{link.last_synced_at ? when(link.last_synced_at) : "Not yet"}</Fact>}
            {link.reviewed_at && (
              <Fact label={link.review_outcome === "approved" ? "Approved" : "Turned down"}>
                {when(link.reviewed_at)} by {link.reviewed_by || "an admin"}
              </Fact>
            )}
          </dl>
          {link.review_note && <Fact label="Note">{link.review_note}</Fact>}
          {active && link.last_sync_status === "failed" && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              The last sync failed{link.last_sync_error ? `: ${link.last_sync_error}` : "."}
            </p>
          )}

          {(waiting || active) && (
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runCheck}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {busy === "check" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                  Check with broker
                </button>
                {check?.available && <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MATCH[check.match].cls}`}>{MATCH[check.match].label}</span>}
              </div>
              {check && check.available === false && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{check.reason}</p>}
              {check?.available && (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Fact label="Broker has this client as">{check.broker_name || "No name returned"}</Fact>
                  <Fact label="Customer's name on Xtin">{check.account_name || "No name on file"}</Fact>
                </dl>
              )}
              {!check && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Asks the broker for the name on this client code, to compare with the customer's. It's a hint, not proof: names are written differently in different places.</p>}
            </div>
          )}

          {active && (
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add history from a file</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The broker's trade book only covers today. Upload this customer's tradebook (CSV or Excel) to add earlier trades and correct any that were worked out without them. You'll see what it would do first. Days the live sync already holds are left alone, and trades the customer has edited are never changed.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,.xlsx,.xls"
                aria-label="Tradebook file"
                disabled={historyBusy !== null}
                onChange={(e) => chooseHistory(e.target.files?.[0])}
                className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm dark:text-slate-200 dark:file:border-slate-600 dark:file:bg-slate-800"
              />
              {historyBusy === "preview" && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Reading the file…
                </p>
              )}
              {report && (
                <div className="mt-4 space-y-3">
                  <HistoryPreview report={report} />
                  <div className="flex flex-wrap gap-2">
                    {report.file.newExecutions > 0 && (
                      <button type="button" disabled={historyBusy !== null} onClick={applyHistory} className="inline-flex items-center gap-2 rounded-lg bg-brand-fill px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50">
                        {historyBusy === "apply" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        Add this history
                      </button>
                    )}
                    <button type="button" disabled={historyBusy !== null} onClick={clearHistory} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                      {report.file.newExecutions > 0 ? "Cancel" : "Close"}
                    </button>
                  </div>
                </div>
              )}
              {historyDone && (
                <p role="status" className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {historyDone}
                </p>
              )}
              {historyError && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {historyError}
                </p>
              )}
            </div>
          )}

          {active && (
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Check against a statement</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Upload this customer's own tradebook (CSV or Excel) for some days to see whether the journal got every trade right. It only looks: nothing is changed or saved.
              </p>
              <input
                ref={statementInput}
                type="file"
                accept=".csv,.xlsx,.xls"
                aria-label="Statement file"
                disabled={statementBusy}
                onChange={(e) => chooseStatement(e.target.files?.[0])}
                className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm dark:text-slate-200 dark:file:border-slate-600 dark:file:bg-slate-800"
              />
              {statementBusy && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Comparing…
                </p>
              )}
              {statement && (
                <div className="mt-4 space-y-3">
                  <StatementResult report={statement} />
                  <button type="button" onClick={clearStatement} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                    Close
                  </button>
                </div>
              )}
              {statementError && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {statementError}
                </p>
              )}
            </div>
          )}

          {(waiting || active) && (
            <>
              <div>
                <label htmlFor={`note-${link.id}`} className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Note {waiting ? "(shown to the customer if you turn this down)" : "(shown to the customer)"}
                </label>
                <textarea
                  id={`note-${link.id}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {waiting && (
                  <button type="button" disabled={busy !== null} onClick={() => run("approve")} className="inline-flex items-center gap-2 rounded-lg bg-brand-fill px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50">
                    {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}Approve
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy !== null || noteRequired}
                  title={noteRequired ? "Add a note so the customer knows why" : undefined}
                  onClick={() => run("reject")}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
                  {waiting ? "Reject" : "Revoke access"}
                </button>
                {noteRequired && <span className="text-xs text-slate-500 dark:text-slate-400">A note is needed to {waiting ? "reject" : "revoke"}, so the customer knows why.</span>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {waiting
                  ? "Approving lets the Journal read this client's trades from the broker. Only approve if you are satisfied the client code belongs to this customer."
                  : "Revoking stops the Journal reading this client from now on. Trades already imported stay in the customer's journal."}
              </p>
            </>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** One line on how a daily run went. */
function runSummary(run: BrokerSyncRun): string {
  const r = run.result;
  if (run.status === "running") return r?.total != null ? `Running now, ${r.done ?? 0} of ${r.total} customers done` : "Running now";
  if (run.status === "skipped") return "Skipped (another sync was already running)";
  if (r?.error) return `Failed: ${r.error}`;
  if (!r) return run.status === "failed" ? "Failed" : "Finished";
  const parts = [`${r.synced ?? 0} synced`];
  if (r.failed) parts.push(`${r.failed} failed`);
  if (r.paused) parts.push(`${r.paused} paused (plan lapsed)`);
  if (r.awaitingConsent) parts.push(`${r.awaitingConsent} waiting for consent`);
  return parts.join(", ");
}

// The daily sync at a glance, a button to run it, and a read-only test of the broker connection.
const CHECK_STYLE: Record<CheckStatus, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  ok: { icon: CheckCircle2, cls: "text-emerald-600 dark:text-emerald-400", label: "OK" },
  warn: { icon: AlertTriangle, cls: "text-amber-600 dark:text-amber-400", label: "Worth a look" },
  fail: { icon: XCircle, cls: "text-red-600 dark:text-red-400", label: "Needs fixing" },
};

/** Is everything in place to go live? Worked out from the real settings and database, not from a document. */
function LaunchChecklist() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminBrokerLinks.readiness();
      setReadiness(r);
      setError("");
      // Open straight away when something is blocking.
      if (!r.ready) setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load the checklist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = readiness
    ? readiness.ready
      ? readiness.summary.warn > 0
        ? `Nothing is blocking a launch. ${plural(readiness.summary.warn, "thing")} worth a look.`
        : "Everything is in place."
      : `${plural(readiness.summary.fail, "thing")} to fix before this will work.`
    : "";

  return (
    <section aria-label="Launch checklist" className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Launch checklist</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {error ? <span className="text-red-600 dark:text-red-400">{error}</span> : readiness ? summary : "Checking…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Check again
          </button>
          {readiness && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {open ? "Hide checks" : "Show checks"}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {readiness && open && (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
          {readiness.checks.map((c) => {
            const { icon: Icon, cls, label } = CHECK_STYLE[c.status];
            return (
              <li key={c.id} className="flex gap-3 py-2.5">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} aria-label={label} role="img" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{c.label}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{c.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function OperationsPanel() {
  const [runs, setRuns] = useState<BrokerSyncRun[] | null>(null);
  const [runsError, setRunsError] = useState("");
  const [starting, setStarting] = useState(false);
  const [startMessage, setStartMessage] = useState("");
  const [code, setCode] = useState("");
  const [testing, setTesting] = useState(false);
  const [report, setReport] = useState<DiagnosisResult | null>(null);
  const [testError, setTestError] = useState("");
  const [address, setAddress] = useState<OutboundIp | null>(null);
  const [addressError, setAddressError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const loadRuns = useCallback(async () => {
    try {
      setRuns(await adminBrokerLinks.runs());
      setRunsError("");
    } catch (e) {
      setRunsError(e instanceof Error ? e.message : "Could not load the sync runs");
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  // While a sync is going, keep its progress current.
  const running = !!runs?.some((r) => r.status === "running");
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(loadRuns, 10_000);
    return () => clearInterval(timer);
  }, [running, loadRuns]);

  const lookUpAddress = async () => {
    setLookingUp(true);
    setAddressError("");
    setAddress(null);
    try {
      setAddress(await adminBrokerLinks.outboundIp());
    } catch (e) {
      setAddressError(e instanceof Error ? e.message : "Could not find our address");
    } finally {
      setLookingUp(false);
    }
  };

  const startSync = async () => {
    setStarting(true);
    setStartMessage("");
    try {
      const res = await adminBrokerLinks.startSync();
      setStartMessage(res.started ? "Started. Refresh in a minute to see how it went." : `Not started: ${res.reason ?? "unknown reason"}.`);
      if (res.started) loadRuns();
    } catch (e) {
      setStartMessage(e instanceof Error ? e.message : "Could not start the sync");
    } finally {
      setStarting(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestError("");
    setReport(null);
    try {
      setReport(await adminBrokerLinks.diagnose(code.trim() || undefined));
    } catch (e) {
      setTestError(e instanceof Error ? e.message : "The test couldn't run");
    } finally {
      setTesting(false);
    }
  };

  // Backfills are listed among the runs too, but the line on top is about the daily sync.
  const last = runs?.find((r) => !r.result?.backfill);
  return (
    <section aria-label="Daily sync" className="mb-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Daily sync</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {runsError ? (
              <span className="text-red-600 dark:text-red-400">{runsError}</span>
            ) : runs === null ? (
              "Loading…"
            ) : last ? (
              <>
                Last run {when(last.started_at)} ({last.source}): {runSummary(last)}.
              </>
            ) : (
              "No runs yet."
            )}
          </p>
          {last?.result?.failures && last.result.failures.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              {last.result.failures.slice(0, 5).map((f) => (
                <li key={f.clientCode}>
                  <span className="tabular-nums">{f.clientCode}</span>: {f.error}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={startSync}
          disabled={starting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          Run sync now
        </button>
      </div>
      {startMessage && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">{startMessage}</p>}

      <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Test the broker connection</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Read-only. Logs in, and with a client code also reads that client's trades for today and checks each thing we assumed about the broker's system. It shows counts and formats, never a customer's trades.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="diagnose-code" className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Client code (optional)
            </label>
            <input
              id="diagnose-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={30}
              autoComplete="off"
              className="mt-1 block w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 brand-on-dark"
          >
            {testing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Test connection
          </button>
        </div>
        {testError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {testError}
          </p>
        )}
        {report && report.available === false && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{report.reason}</p>}
        {report && report.available === true && (
          <ul aria-label="Connection test results" className="mt-3 space-y-2">
            {report.steps.map((s) => (
              <li key={s.name} className="flex gap-2 text-sm">
                {s.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-label="Passed" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-label="Failed" />
                )}
                <span className="min-w-0">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{s.name}</span>
                  <span className="block text-slate-600 dark:text-slate-300">{s.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Our address, as the broker sees it</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">If the broker only accepts calls from addresses it has whitelisted, give them this one. Where the server is hosted, the address can change; a fixed-address proxy (XTS_PROXY_URL) avoids that.</p>
        <button
          type="button"
          onClick={lookUpAddress}
          disabled={lookingUp}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {lookingUp && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Show our address
        </button>
        {address && (
          <p role="status" className="mt-3 text-sm text-slate-700 dark:text-slate-200">
            Requests to the broker leave from <strong className="tabular-nums">{address.ip}</strong> {address.via === "proxy" ? "(through your proxy)" : "(directly from this server)"}.
          </p>
        )}
        {addressError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {addressError}
          </p>
        )}
      </div>
    </section>
  );
}

export default function AdminBrokerLinks() {
  const [filter, setFilter] = useState<LinkFilter>("pending");
  const [links, setLinks] = useState<AdminBrokerLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (which: LinkFilter) => {
    setLoading(true);
    try {
      setLinks(await adminBrokerLinks.list(which));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  // A decision moves a link out of the tab it was in, so drop it from this list unless the tab shows every state.
  const changed = (updated: AdminBrokerLink) =>
    setLinks((cur) => (filter === "all" ? cur.map((l) => (l.id === updated.id ? updated : l)) : cur.filter((l) => l.id !== updated.id)));

  return (
    <>
      <SEO title="Broker links – Admin" description="Confirm which broker client code belongs to which customer." noIndex />
      <AdminHeader />
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="xt-title">Broker links</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Customers ask to connect a broker client code. Nothing is read from the broker until you confirm the code is theirs.</p>
            </div>
            <button
              type="button"
              onClick={() => load(filter)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <LaunchChecklist />
          <OperationsPanel />

          <div className="mb-5 flex flex-wrap gap-2" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${filter === t.id ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"} brand-on-dark`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
          {loading && links.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading… (the server may take a minute to wake up)</p>
          ) : links.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">{filter === "pending" ? "No requests are waiting." : "Nothing here."}</p>
          ) : (
            <div className="space-y-3">
              {links.map((l) => (
                <LinkCard key={l.id} link={l} onChanged={changed} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
