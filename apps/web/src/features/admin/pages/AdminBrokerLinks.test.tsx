import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

// React's act() environment flag for a hand-rolled renderer.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const list = vi.fn();
const check = vi.fn();
const approve = vi.fn();
const reject = vi.fn();
const runs = vi.fn();
const startSync = vi.fn();
const diagnose = vi.fn();
const outboundIp = vi.fn();
const backfill = vi.fn();
const readiness = vi.fn();
const compare = vi.fn();

vi.mock("../lib/brokerLinks", () => ({ adminBrokerLinks: { list, check, approve, reject, runs, startSync, diagnose, outboundIp, backfill, readiness, compare } }));
vi.mock("@/components/SEO", () => ({ default: () => null }));

const { default: AdminBrokerLinks } = await import("./AdminBrokerLinks");

const row = (over: Record<string, unknown> = {}) => ({
  id: "l1",
  client_code: "AB1234",
  status: "pending",
  created_at: "2026-11-03T05:00:00Z",
  consent_at: "2026-11-03T05:00:00Z",
  consent_version: "draft-1",
  verified_at: null,
  verification_method: null,
  review_outcome: null,
  review_note: null,
  reviewed_by: null,
  reviewed_at: null,
  last_synced_at: null,
  last_sync_status: null,
  last_sync_error: null,
  user: { email: "asha@example.com", name: "Asha Verma" },
  ...over,
});

const READY = { ready: true, checks: [{ id: "database", label: "Database is ready", status: "ok", detail: "The tables are there." }], summary: { ok: 1, warn: 0, fail: 0 }, links: { pending: 0, active: 0, revoked: 0, outdatedConsent: 0 } };

let root: Root;
let host: HTMLDivElement;

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const render = async () => {
  await act(async () => root.render(<MemoryRouter><AdminBrokerLinks /></MemoryRouter>));
  await flush();
};
const text = () => document.body.textContent ?? "";
const button = (label: string) => Array.from(document.querySelectorAll<HTMLElement>("button")).find((el) => el.textContent?.trim() === label) as HTMLButtonElement | undefined;
const tab = (label: string) => Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]')).find((el) => el.textContent?.trim() === label);
// A customer's card header (the launch checklist has a toggle of its own).
const cardToggle = () => Array.from(document.querySelectorAll<HTMLElement>('button[aria-expanded="false"]')).find((el) => /[A-Z]{2}\d{4}/.test(el.textContent ?? ""));
const click = (el: HTMLElement | undefined) => act(async () => { el!.click(); });
const typeNote = (value: string) =>
  act(async () => {
    const box = document.querySelector("textarea")!;
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(box, value);
    box.dispatchEvent(new Event("input", { bubbles: true }));
  });

describe("AdminBrokerLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runs.mockResolvedValue([]);
    readiness.mockResolvedValue(READY);
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    document.body.innerHTML = "";
  });

  it("opens on the requests that are waiting, with who asked and for which code", async () => {
    list.mockResolvedValue([row()]);
    await render();
    expect(list).toHaveBeenCalledWith("pending");
    expect(text()).toContain("AB1234");
    expect(text()).toContain("Asha Verma");
    expect(text()).toContain("asha@example.com");
    expect(text()).toContain("draft-1");
  });

  it("says when nothing is waiting", async () => {
    list.mockResolvedValue([]);
    await render();
    expect(text()).toContain("No requests are waiting.");
  });

  it("loads the other states from their tabs", async () => {
    list.mockResolvedValue([]);
    await render();
    await click(tab("Active"));
    expect(list).toHaveBeenLastCalledWith("active");
    await click(tab("Turned down or removed"));
    expect(list).toHaveBeenLastCalledWith("revoked");
    await click(tab("All"));
    expect(list).toHaveBeenLastCalledWith("all");
  });

  it("shows a load failure instead of an empty list", async () => {
    list.mockRejectedValue(new Error("Forbidden. Admin access only."));
    await render();
    expect(document.querySelector('[role="alert"]')?.textContent).toBe("Forbidden. Admin access only.");
  });

  it("checks with the broker and shows both names with how they compare", async () => {
    list.mockResolvedValue([row()]);
    check.mockResolvedValue({ available: true, broker_name: "Asha K Verma", account_name: "Asha Verma", match: "match" });
    await render();
    await click(button("Check with broker"));

    expect(check).toHaveBeenCalledWith("l1");
    expect(text()).toContain("Names match");
    expect(text()).toContain("Asha K Verma");
    expect(text()).toContain("Asha Verma");
  });

  it("warns when the names don't match", async () => {
    list.mockResolvedValue([row()]);
    check.mockResolvedValue({ available: true, broker_name: "Priya Menon", account_name: "Asha Verma", match: "mismatch" });
    await render();
    await click(button("Check with broker"));
    expect(text()).toContain("Names don't match");
  });

  it("explains when there is nothing to check against, and when the broker can't be reached", async () => {
    list.mockResolvedValue([row()]);
    check.mockResolvedValueOnce({ available: false, reason: "No broker connection is set up yet, so there is nothing to check against." });
    await render();
    await click(button("Check with broker"));
    expect(text()).toContain("nothing to check against");

    check.mockRejectedValueOnce(new Error("Couldn't get this client's details from the broker."));
    await click(button("Check with broker"));
    expect(document.querySelector('[role="alert"]')?.textContent).toBe("Couldn't get this client's details from the broker.");
  });

  it("approves with the note, and the request leaves the waiting list", async () => {
    list.mockResolvedValue([row()]);
    approve.mockResolvedValue(row({ status: "active" }));
    await render();
    await typeNote("Name and email match the broker's records");
    await click(button("Approve"));
    await flush();

    expect(approve).toHaveBeenCalledWith("l1", "Name and email match the broker's records");
    expect(text()).toContain("No requests are waiting.");
  });

  it("can approve without a note", async () => {
    list.mockResolvedValue([row()]);
    approve.mockResolvedValue(row({ status: "active" }));
    await render();
    expect(button("Approve")!.disabled).toBe(false);
    await click(button("Approve"));
    expect(approve).toHaveBeenCalledWith("l1", "");
  });

  it("won't reject without a note, so the customer is told why", async () => {
    list.mockResolvedValue([row()]);
    reject.mockResolvedValue(row({ status: "revoked", review_outcome: "rejected" }));
    await render();
    expect(button("Reject")!.disabled).toBe(true);

    await typeNote("The name doesn't match the broker's records");
    expect(button("Reject")!.disabled).toBe(false);
    await click(button("Reject"));
    await flush();
    expect(reject).toHaveBeenCalledWith("l1", "The name doesn't match the broker's records");
    expect(text()).toContain("No requests are waiting.");
  });

  it("keeps the request and shows the reason when the decision can't be saved", async () => {
    list.mockResolvedValue([row()]);
    approve.mockRejectedValue(new Error("Only a request that is waiting can be approved."));
    await render();
    await click(button("Approve"));
    await flush();
    expect(document.querySelector('[role="alert"]')?.textContent).toBe("Only a request that is waiting can be approved.");
    expect(text()).toContain("AB1234");
  });

  it("updates the card in place on the All tab instead of removing it", async () => {
    list.mockResolvedValue([row()]);
    approve.mockResolvedValue(row({ status: "active", review_outcome: "approved", reviewed_at: "2026-11-03T07:00:00Z", reviewed_by: "xtincapital@gmail.com" }));
    await render();
    await click(tab("All"));
    await click(button("Approve"));
    await flush();
    expect(text()).toContain("AB1234");
    expect(text()).toContain("Active");
    expect(button("Approve")).toBeUndefined();
    expect(button("Revoke access")).toBeDefined();
  });

  it("lets an admin revoke an active link, with a note, and shows a failing sync", async () => {
    list.mockResolvedValue([row({ status: "active", verified_at: "2026-11-03T06:00:00Z", last_sync_status: "failed", last_sync_error: "XTS: Invalid token" })]);
    reject.mockResolvedValue(row({ status: "revoked" }));
    await render();
    await click(tab("Active"));

    expect(text()).toContain("Sync failing"); // visible without opening the card
    await click(cardToggle());
    expect(button("Approve")).toBeUndefined();
    expect(text()).toContain("The last sync failed: XTS: Invalid token");
    expect(button("Revoke access")!.disabled).toBe(true);
    await typeNote("Reported by the broker");
    await click(button("Revoke access"));
    expect(reject).toHaveBeenCalledWith("l1", "Reported by the broker");
  });

  it("shows how a finished request was decided", async () => {
    list.mockResolvedValue([row({ status: "revoked", review_outcome: "rejected", review_note: "Name mismatch", reviewed_at: "2026-11-03T07:00:00Z", reviewed_by: "xtincapital@gmail.com" })]);
    await render();
    await click(tab("Turned down or removed"));
    await click(cardToggle());
    expect(text()).toContain("Turned down");
    expect(text()).toContain("xtincapital@gmail.com");
    expect(text()).toContain("Name mismatch");
    expect(button("Approve")).toBeUndefined();
  });

  describe("the daily sync panel", () => {
    const run = (over: Record<string, unknown> = {}) => ({ id: "r1", source: "http-trigger", status: "success", started_at: "2026-11-03T10:15:00Z", completed_at: "2026-11-03T10:20:00Z", result: { total: 14, synced: 12, failed: 2, paused: 3, awaitingConsent: 1, failures: [{ clientCode: "FAIL01", error: "broker said no" }] }, ...over });
    const inputBox = () => document.getElementById("diagnose-code") as HTMLInputElement;
    const typeCode = (value: string) =>
      act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(inputBox(), value);
        inputBox().dispatchEvent(new Event("input", { bubbles: true }));
      });

    it("summarises the last run, including who was skipped and why", async () => {
      list.mockResolvedValue([]);
      runs.mockResolvedValue([run()]);
      await render();
      expect(text()).toContain("Last run");
      expect(text()).toContain("http-trigger");
      expect(text()).toContain("12 synced, 2 failed, 3 paused (plan lapsed), 1 waiting for consent");
      expect(text()).toContain("FAIL01: broker said no");
    });

    it("says when a whole run failed, and when there have been none", async () => {
      list.mockResolvedValue([]);
      runs.mockResolvedValue([run({ status: "failed", result: { error: "database is down" } })]);
      await render();
      expect(text()).toContain("Failed: database is down");

      runs.mockResolvedValue([]);
      await act(async () => { root.unmount(); });
      root = createRoot(host);
      await render();
      expect(text()).toContain("No runs yet.");
    });

    it("shows when the runs can't be loaded, without hiding the requests", async () => {
      list.mockResolvedValue([row()]);
      runs.mockRejectedValue(new Error("Couldn't load the sync runs"));
      await render();
      expect(text()).toContain("Couldn't load the sync runs");
      expect(text()).toContain("AB1234");
    });

    it("runs the sync on demand and says it started", async () => {
      list.mockResolvedValue([]);
      startSync.mockResolvedValue({ started: true });
      await render();
      await click(button("Run sync now"));
      await flush();
      expect(startSync).toHaveBeenCalledTimes(1);
      expect(document.querySelector('[role="status"]')?.textContent).toContain("Started");
    });

    it("says why when it didn't start", async () => {
      list.mockResolvedValue([]);
      startSync.mockResolvedValue({ started: false, reason: "A sync is already running" });
      await render();
      await click(button("Run sync now"));
      await flush();
      expect(document.querySelector('[role="status"]')?.textContent).toContain("A sync is already running");
    });

    it("tests the connection with a client code and shows each step", async () => {
      list.mockResolvedValue([]);
      diagnose.mockResolvedValue({
        available: true,
        steps: [
          { name: "Log in", ok: true, detail: "Logged in as a dealer. 2 client codes mapped to this login." },
          { name: "Trade book is limited to the requested client (?clientID= works)", ok: false, detail: "1 belong to other clients." },
        ],
      });
      await render();
      await typeCode("ab1234");
      await click(button("Test connection"));
      await flush();

      expect(diagnose).toHaveBeenCalledWith("ab1234");
      const results = document.querySelector('[aria-label="Connection test results"]')!;
      expect(results.textContent).toContain("Logged in as a dealer");
      expect(results.querySelectorAll('[aria-label="Passed"]')).toHaveLength(1);
      expect(results.querySelectorAll('[aria-label="Failed"]')).toHaveLength(1);
    });

    it("tests just the login when no code is given", async () => {
      list.mockResolvedValue([]);
      diagnose.mockResolvedValue({ available: true, steps: [{ name: "Log in", ok: true, detail: "ok" }] });
      await render();
      await click(button("Test connection"));
      expect(diagnose).toHaveBeenCalledWith(undefined);
    });

    it("explains when there's nothing to test, and when the test can't run", async () => {
      list.mockResolvedValue([]);
      diagnose.mockResolvedValueOnce({ available: false, reason: "There is no live broker connection to test." });
      await render();
      await click(button("Test connection"));
      expect(text()).toContain("There is no live broker connection to test.");

      diagnose.mockRejectedValueOnce(new Error("The connection test couldn't run."));
      await click(button("Test connection"));
      expect(document.querySelector('[role="alert"]')?.textContent).toBe("The connection test couldn't run.");
    });
  });

  describe("a sync that is running", () => {
    const going = (result: Record<string, unknown> | null) => ({ id: "r9", source: "admin", status: "running", started_at: "2026-11-03T10:15:00Z", completed_at: null, result });

    it("shows how far it has got", async () => {
      list.mockResolvedValue([]);
      runs.mockResolvedValue([going({ heartbeat: "2026-11-03T10:20:00Z", done: 120, total: 400 })]);
      await render();
      expect(text()).toContain("Running now, 120 of 400 customers done");
    });

    it("says only that it's running before its first report", async () => {
      list.mockResolvedValue([]);
      runs.mockResolvedValue([going(null)]);
      await render();
      expect(text()).toContain("Running now");
      expect(text()).not.toContain("customers done");
    });

    it("keeps the progress current by itself, and stops once the sync is over", async () => {
      list.mockResolvedValue([]);
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      try {
        runs.mockResolvedValueOnce([going({ done: 100, total: 400 })]).mockResolvedValueOnce([going({ done: 250, total: 400 })]).mockResolvedValue([{ ...going(null), status: "success", result: { total: 400, synced: 400, failed: 0 } }]);
        await render();
        expect(text()).toContain("100 of 400");

        await act(async () => { vi.advanceTimersByTime(10_000); });
        await flush();
        expect(text()).toContain("250 of 400");

        await act(async () => { vi.advanceTimersByTime(10_000); });
        await flush();
        expect(text()).toContain("400 synced");
        const calls = runs.mock.calls.length;
        await act(async () => { vi.advanceTimersByTime(60_000); });
        expect(runs.mock.calls.length).toBe(calls); // no more asking once it has finished
      } finally {
        vi.useRealTimers();
      }
    });

    it("doesn't poll when nothing is running", async () => {
      list.mockResolvedValue([]);
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      try {
        runs.mockResolvedValue([{ ...going(null), status: "success", result: { total: 5, synced: 5, failed: 0 } }]);
        await render();
        const calls = runs.mock.calls.length;
        await act(async () => { vi.advanceTimersByTime(60_000); });
        expect(runs.mock.calls.length).toBe(calls);
      } finally {
        vi.useRealTimers();
      }
    });

    it("explains a skipped attempt", async () => {
      list.mockResolvedValue([]);
      runs.mockResolvedValue([{ ...going(null), status: "skipped", result: { reason: "Another sync was already running" } }]);
      await render();
      expect(text()).toContain("Skipped (another sync was already running)");
    });
  });

  describe("our address as the broker sees it", () => {
    it("shows the address, and whether it is a proxy's", async () => {
      list.mockResolvedValue([]);
      outboundIp.mockResolvedValueOnce({ ip: "203.0.113.7", via: "direct" }).mockResolvedValueOnce({ ip: "198.51.100.9", via: "proxy" });
      await render();
      await click(button("Show our address"));
      await flush();
      expect(document.body.textContent).toContain("203.0.113.7");
      expect(document.body.textContent).toContain("directly from this server");

      await click(button("Show our address"));
      await flush();
      expect(document.body.textContent).toContain("198.51.100.9");
      expect(document.body.textContent).toContain("through your proxy");
      expect(document.body.textContent).not.toContain("203.0.113.7"); // the old answer is replaced
    });

    it("shows why it couldn't be found", async () => {
      list.mockResolvedValue([]);
      outboundIp.mockRejectedValue(new Error("Couldn't find our outbound address just now."));
      await render();
      await click(button("Show our address"));
      await flush();
      expect(document.querySelector('[role="alert"]')?.textContent).toBe("Couldn't find our outbound address just now.");
    });
  });

  describe("adding history from a file", () => {
    const active = (over: Record<string, unknown> = {}) => row({ status: "active", verified_at: "2026-11-03T06:00:00Z", ...over });
    const report = (over: Record<string, any> = {}) => ({
      applied: false,
      file: { executions: 3, newExecutions: 3, skippedRows: 0, otherClientRows: 0, leftOutDays: [], leftOutDayCount: 0, from: "2026-01-05", to: "2026-01-06", ...over.file },
      changes: { add: 2, update: 1, remove: 1, keptCount: 0, kept: [], ...over.changes },
      history: { fills: 5, trades: 3, open: 1, unmatched: 0, ...over.history },
      ...(over.applied !== undefined ? { applied: over.applied } : {}),
    });
    const open = () => click(cardToggle());
    const fileBox = () => document.querySelector<HTMLInputElement>('input[aria-label="Tradebook file"]')!;
    const choose = async (name = "tradebook.csv") => {
      const file = new File(["x"], name, { type: "text/csv" });
      Object.defineProperty(fileBox(), "files", { value: [file], configurable: true });
      await act(async () => { fileBox().dispatchEvent(new Event("change", { bubbles: true })); });
      await flush();
      return file;
    };

    it("is offered on an active customer's card only", async () => {
      list.mockResolvedValue([active()]);
      await render();
      await open();
      expect(fileBox()).not.toBeNull();

      list.mockResolvedValue([row()]); // waiting
      await act(async () => { root.unmount(); });
      root = createRoot(host);
      await render();
      expect(document.querySelector('input[aria-label="Tradebook file"]')).toBeNull();
    });

    it("reads the file and says what it would do before anything is changed", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValue(report());
      await render();
      await open();
      const file = await choose();

      expect(backfill).toHaveBeenCalledWith("l1", file, false);
      const t = text();
      expect(t).toContain("Read 3 executions from 2026-01-05 to 2026-01-06 for this customer.");
      expect(t).toContain("Would add 2 trades, correct 1 and remove 1 that the earlier history shows were wrong.");
      expect(t).toContain("would then be 3 trades and 1 open position");
      expect(button("Add this history")).toBeDefined();
    });

    it("explains what was skipped, ignored and left alone", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValue(report({ file: { skippedRows: 2, otherClientRows: 5, leftOutDayCount: 7, leftOutDays: ["2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06"], from: "2026-01-07", to: "2026-01-07" }, history: { unmatched: 1 } }));
      await render();
      await open();
      await choose();
      const t = text();
      expect(t).toContain("2 rows couldn't be read and were skipped");
      expect(t).toContain("5 rows for other clients were ignored");
      expect(t).toContain("7 days the live sync already holds were left alone (2026-01-02, 2026-01-03, 2026-01-04, 2026-01-05, 2026-01-06, …)");
      expect(t).toContain("from 2026-01-07 for this customer"); // a single day is not "from a to a"
      expect(t).toContain("1 sale that has no purchase on record");
    });

    it("uses the singular where there is one", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValue(report({ file: { executions: 1, newExecutions: 1, skippedRows: 1, otherClientRows: 1, leftOutDayCount: 1, leftOutDays: ["2026-01-02"], from: "2026-01-05", to: "2026-01-05" }, changes: { add: 1, update: 0, remove: 0 }, history: { trades: 1, open: 0 } }));
      await render();
      await open();
      await choose();
      const t = text();
      expect(t).toContain("Read 1 execution from 2026-01-05 for this customer.");
      expect(t).toContain("1 row couldn't be read and was skipped");
      expect(t).toContain("1 row for other clients was ignored");
      expect(t).toContain("1 day the live sync already holds was left alone");
      expect(t).toContain("Would add 1 trade, correct 0 and remove 0");
      expect(t).toContain("would then be 1 trade and 0 open positions");
    });

    it("lists the customer's edited trades it would leave alone, and why", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValue(
        report({
          changes: {
            keptCount: 22,
            kept: [
              { externalId: "a", asset: "NIFTY", date: "2026-01-06", why: "superseded" },
              { externalId: "b", asset: "INFY", date: "2026-01-07", why: "changed" },
            ],
          },
        }),
      );
      await render();
      await open();
      await choose();
      const t = text();
      expect(t).toContain("22 trades the customer has edited would differ from the full history");
      expect(t).toContain("NIFTY on 2026-01-06: the history says it shouldn't exist");
      expect(t).toContain("INFY on 2026-01-07: the history gives different numbers");
      expect(t).toContain("and 20 more");
    });

    it("adds the history when asked, with the same file, and reports what was done", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValueOnce(report()).mockResolvedValueOnce(report({ applied: true, changes: { keptCount: 1 } }));
      await render();
      await open();
      const file = await choose();
      await click(button("Add this history"));
      await flush();

      expect(backfill).toHaveBeenLastCalledWith("l1", file, true);
      expect(document.querySelector('[role="status"]')?.textContent).toBe("History added: 2 trades added, 1 corrected, 1 removed. 1 edited trade kept for review.");
      expect(button("Add this history")).toBeUndefined(); // done; the preview is gone
      expect(fileBox().value).toBe("");
    });

    it("can be cancelled without changing anything", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValue(report());
      await render();
      await open();
      await choose();
      await click(button("Cancel"));
      expect(backfill).toHaveBeenCalledTimes(1);
      expect(text()).not.toContain("Would add");
    });

    it("offers nothing to add when the file has nothing new", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValue(report({ file: { newExecutions: 0, leftOutDayCount: 1, leftOutDays: ["2026-01-05"] }, changes: { add: 0, update: 0, remove: 0 } }));
      await render();
      await open();
      await choose();
      expect(text()).toContain("Nothing in this file is new, so there is nothing to add.");
      expect(button("Add this history")).toBeUndefined();
      expect(button("Close")).toBeDefined();
    });

    it("shows why a file was refused, and lets another be chosen", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockRejectedValueOnce(new Error("This file has no trades for client AB1234. It covers CD5678. Check it is the right customer's file.")).mockResolvedValueOnce(report());
      await render();
      await open();
      await choose("wrong.csv");
      expect(document.querySelector('[role="alert"]')?.textContent).toContain("no trades for client AB1234");
      expect(button("Add this history")).toBeUndefined();

      await choose("right.csv");
      expect(document.querySelector('[role="alert"]')).toBeNull();
      expect(button("Add this history")).toBeDefined();
    });

    it("keeps the preview, with the reason, if adding fails", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValueOnce(report()).mockRejectedValueOnce(new Error("A sync is running. Try again in a few minutes."));
      await render();
      await open();
      await choose();
      await click(button("Add this history"));
      await flush();
      expect(document.querySelector('[role="alert"]')?.textContent).toBe("A sync is running. Try again in a few minutes.");
      expect(button("Add this history")).toBeDefined(); // can try again
    });

    it("replaces the preview when another file is chosen", async () => {
      list.mockResolvedValue([active()]);
      backfill.mockResolvedValueOnce(report()).mockResolvedValueOnce(report({ file: { executions: 9, newExecutions: 9 } }));
      await render();
      await open();
      await choose("a.csv");
      expect(text()).toContain("Read 3 executions");
      await choose("b.csv");
      expect(text()).toContain("Read 9 executions");
      expect(text()).not.toContain("Read 3 executions");
    });
  });

  describe("history added by an admin, among the runs", () => {
    const sync = { id: "s1", source: "admin", status: "running", started_at: "2026-11-03T10:15:00Z", completed_at: null, result: { done: 5, total: 20 } };
    const history = { id: "b1", source: "backfill: admin@x.test", status: "success", started_at: "2026-11-03T10:30:00Z", completed_at: "2026-11-03T10:30:01Z", result: { backfill: true, clientCode: "AB1234", add: 2 } };

    it("doesn't let it stand in for the latest sync, or stop the progress refreshing", async () => {
      list.mockResolvedValue([]);
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
      try {
        runs.mockResolvedValue([history, sync]); // the history is newest
        await render();
        expect(text()).toContain("Running now, 5 of 20 customers done"); // the line is about the sync
        const calls = runs.mock.calls.length;
        await act(async () => { vi.advanceTimersByTime(10_000); });
        expect(runs.mock.calls.length).toBe(calls + 1); // still refreshing
      } finally {
        vi.useRealTimers();
      }
    });

    it("says no sync has run when only history has been added", async () => {
      list.mockResolvedValue([]);
      runs.mockResolvedValue([history]);
      await render();
      expect(text()).toContain("No runs yet.");
    });
  });

  describe("the launch checklist", () => {
    const report = (over: Record<string, unknown> = {}) => ({
      ...READY,
      ready: true,
      checks: [
        { id: "database", label: "Database is ready", status: "ok", detail: "The tables are there." },
        { id: "consent", label: "Consent wording is final", status: "warn", detail: "Still the draft (draft-1)." },
        { id: "schedule", label: "Something will run the daily sync", status: "fail", detail: "Nothing will start a sync." },
      ],
      summary: { ok: 1, warn: 1, fail: 1 },
      ...over,
    });
    const toggle = () => button("Show checks") ?? button("Hide checks");

    it("says everything is in place, and keeps the list closed", async () => {
      list.mockResolvedValue([]);
      await render();
      expect(text()).toContain("Launch checklist");
      expect(text()).toContain("Everything is in place.");
      expect(text()).not.toContain("The tables are there.");
      await click(toggle());
      expect(text()).toContain("The tables are there.");
      await click(toggle());
      expect(text()).not.toContain("The tables are there.");
    });

    it("says nothing is blocking when there are only things worth a look", async () => {
      list.mockResolvedValue([]);
      readiness.mockResolvedValue(report({ checks: [{ id: "consent", label: "Consent wording is final", status: "warn", detail: "Still the draft." }], summary: { ok: 0, warn: 1, fail: 0 } }));
      await render();
      expect(text()).toContain("Nothing is blocking a launch. 1 thing worth a look.");
      expect(text()).not.toContain("Still the draft."); // not open by itself
    });

    it("opens by itself when something needs fixing, and says what and how", async () => {
      list.mockResolvedValue([]);
      readiness.mockResolvedValue(report({ ready: false }));
      await render();
      expect(text()).toContain("1 thing to fix before this will work.");
      expect(text()).toContain("Something will run the daily sync");
      expect(text()).toContain("Nothing will start a sync.");
      expect(document.querySelector('[aria-label="Needs fixing"]')).not.toBeNull();
      expect(document.querySelector('[aria-label="Worth a look"]')).not.toBeNull();
      expect(document.querySelector('[aria-label="OK"]')).not.toBeNull();
    });

    it("checks again on request", async () => {
      list.mockResolvedValue([]);
      readiness.mockResolvedValueOnce(report({ ready: false })).mockResolvedValueOnce(READY);
      await render();
      expect(text()).toContain("to fix before this will work");
      await click(button("Check again"));
      await flush();
      expect(readiness).toHaveBeenCalledTimes(2);
      expect(text()).toContain("Everything is in place.");
    });

    it("says so when the checklist can't be loaded, and the rest of the page still works", async () => {
      list.mockResolvedValue([row()]);
      readiness.mockRejectedValue(new Error("Forbidden. Admin access only."));
      await render();
      expect(text()).toContain("Forbidden. Admin access only.");
      expect(text()).toContain("AB1234");
    });
  });

  describe("checking a statement", () => {
    const active = (over: Record<string, unknown> = {}) => row({ status: "active", verified_at: "2026-11-03T06:00:00Z", ...over });
    const brief = (over: Record<string, unknown> = {}) => ({ date: "2026-01-06", exitDate: "2026-01-06", asset: "NIFTY", contract: null, side: "buy", quantity: 10, entryPrice: 100, exitPrice: 110, grossPnl: 100, ...over });
    const result = (over: Record<string, any> = {}) => ({
      file: { executions: 4, trades: 2, skippedRows: 0, otherClientRows: 0, from: "2026-01-06", to: "2026-01-06" },
      window: { from: "2026-01-06", to: "2026-01-06", statementTrades: 2, journalTrades: 2 },
      matched: 2,
      differences: [],
      missingInJournal: [],
      extraInJournal: [],
      counts: { differences: 0, missingInJournal: 0, extraInJournal: 0 },
      notCompared: { beforeSync: 0, carriedIn: 0, continuesAfter: 0 },
      totals: { statement: 50, journal: 50, difference: 0 },
      daysThatDiffer: [],
      ...over,
    });
    const box = () => document.querySelector<HTMLInputElement>('input[aria-label="Statement file"]')!;
    const choose = async (name = "statement.csv") => {
      const file = new File(["x"], name, { type: "text/csv" });
      Object.defineProperty(box(), "files", { value: [file], configurable: true });
      await act(async () => { box().dispatchEvent(new Event("change", { bubbles: true })); });
      await flush();
      return file;
    };
    const show = async () => {
      list.mockResolvedValue([active()]);
      await render();
      await click(cardToggle());
    };

    it("is offered on an active customer's card only", async () => {
      await show();
      expect(box()).not.toBeNull();

      list.mockResolvedValue([row()]); // waiting: its card is open already
      await act(async () => { root.unmount(); });
      root = createRoot(host);
      await render();
      expect(text()).toContain("Approve");
      expect(document.querySelector('input[aria-label="Statement file"]')).toBeNull();
    });

    it("compares as soon as a file is chosen, and says when the journal agrees", async () => {
      compare.mockResolvedValue(result());
      await show();
      const file = await choose();
      expect(compare).toHaveBeenCalledWith("l1", file);
      expect(document.querySelector('[role="status"]')?.textContent).toContain("The journal agrees with the statement: all 2 trades match from 2026-01-06.");
      expect(text()).toContain("Profit and loss before brokerage: statement ₹50, journal ₹50");
    });

    it("lists what differs, in words, with both sides", async () => {
      compare.mockResolvedValue(
        result({
          matched: 1,
          differences: [{ statement: brief(), journal: brief({ exitPrice: 108, grossPnl: 80 }), what: ["exit price", "profit and loss"] }],
          missingInJournal: [brief({ asset: "INFY", entryPrice: 1500, exitPrice: 1490, grossPnl: -50 })],
          extraInJournal: [brief({ asset: "ZZTOP" })],
          counts: { differences: 1, missingInJournal: 1, extraInJournal: 1 },
          totals: { statement: 50, journal: 130, difference: 80 },
          daysThatDiffer: [{ date: "2026-01-06", statement: 50, journal: 130, difference: 80 }],
        }),
      );
      await show();
      await choose();
      expect(document.querySelector('[role="status"]')?.textContent).toContain("3 disagreements found. 1 trade matched.");
      expect(text()).toContain("2026-01-06 · NIFTY: exit price, profit and loss differ");
      expect(text()).toContain("Statement: NIFTY buy 10, 100 to 110, ₹100");
      expect(text()).toContain("Journal: NIFTY buy 10, 100 to 108, ₹80");
      expect(text()).toContain("In the statement, not in the journal");
      expect(text()).toContain("INFY buy 10, 1500 to 1490, -₹50");
      expect(text()).toContain("In the journal, not in the statement");
      expect(text()).toContain("ZZTOP");
      expect(text()).toContain("(the journal is ₹80 higher)");
      expect(text()).toContain("Days where profit and loss disagree: 2026-01-06 (₹80)");
    });

    it("says what it left out, and how many more there are than it shows", async () => {
      compare.mockResolvedValue(
        result({
          missingInJournal: [brief()],
          counts: { differences: 0, missingInJournal: 61, extraInJournal: 0 },
          notCompared: { beforeSync: 2, carriedIn: 1, continuesAfter: 1 },
        }),
      );
      await show();
      await choose();
      expect(text()).toContain("2 statement trades from before the sync had any data were left out");
      expect(text()).toContain("1 trade began before the statement's first day and was left out");
      expect(text()).toContain("1 trade is still going after the statement's last day and was left out");
      expect(text()).toContain("…and 60 more");
    });

    it("says there is nothing to compare when the sync holds no data for those days", async () => {
      compare.mockResolvedValue(result({ window: { from: null, to: null, statementTrades: 0, journalTrades: 0 }, matched: 0 }));
      await show();
      await choose();
      expect(text()).toContain("Nothing to compare yet");
      expect(text()).not.toContain("The journal agrees");
    });

    it("shows why a file was refused, and lets another be chosen", async () => {
      compare.mockRejectedValueOnce(new Error("That file has no trades for client AB1234.")).mockResolvedValueOnce(result());
      await show();
      await choose("wrong.csv");
      expect(document.querySelector('[role="alert"]')?.textContent).toBe("That file has no trades for client AB1234.");
      await choose("right.csv");
      expect(document.querySelector('[role="alert"]')).toBeNull();
      expect(text()).toContain("The journal agrees");
    });

    it("closes the result", async () => {
      compare.mockResolvedValue(result());
      await show();
      await choose();
      const closers = Array.from(document.querySelectorAll<HTMLElement>("button")).filter((el) => el.textContent?.trim() === "Close");
      await click(closers[closers.length - 1]);
      expect(text()).not.toContain("The journal agrees");
    });

    it("never changes anything: it doesn't call the history or review endpoints", async () => {
      compare.mockResolvedValue(result());
      await show();
      await choose();
      expect(backfill).not.toHaveBeenCalled();
      expect(approve).not.toHaveBeenCalled();
      expect(reject).not.toHaveBeenCalled();
    });
  });
});
