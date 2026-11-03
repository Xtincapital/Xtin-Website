import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

// React's act() environment flag for a hand-rolled renderer.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
// Radix's checkbox measures itself; jsdom has no ResizeObserver.
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const getStatus = vi.fn();
const link = vi.fn(async () => ({}));
const unlink = vi.fn(async () => ({ success: true, deleted_data: true }));
const reconsent = vi.fn(async () => ({}));
const syncNow = vi.fn(async () => ({ fetched: 5, newFills: 5, closedTrades: 2, insertedTrades: 2, alreadyInJournal: 0, openPositions: 1, unmatched: 0 }));

vi.mock("../lib/api", () => ({ broker: { getStatus, link, unlink, syncNow, reconsent } }));
const toast = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const { default: BrokerConnect } = await import("./BrokerConnect");

const CONSENT = { version: "draft-1", text: "I allow Xtin Capital to read my trades." };
const status = (over: Record<string, unknown> = {}) => ({ enabled: true, available: true, consent: CONSENT, link: null, synced_trades: 0, ...over });
const activeLink = (over: Record<string, unknown> = {}) => ({
  id: "l1",
  client_code: "AB1234",
  status: "active",
  consent_at: "2026-11-03T05:00:00Z",
  verified_at: "2026-11-03T05:00:00Z",
  last_synced_at: null,
  last_sync_status: null,
  consent_outdated: false,
  ...over,
});

let root: Root;
let host: HTMLDivElement;

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const render = async (isPro = true) => {
  await act(async () => root.render(<MemoryRouter><BrokerConnect isPro={isPro} /></MemoryRouter>));
  await flush();
};
const text = () => document.body.textContent ?? "";
const button = (label: string, within: ParentNode = document) =>
  Array.from(within.querySelectorAll<HTMLElement>("button")).find((el) => el.textContent?.trim() === label);
const click = (el: HTMLElement | undefined) => act(async () => { el!.click(); });
const input = (id: string) => document.getElementById(id) as HTMLInputElement;

function type(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("BrokerConnect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    document.body.innerHTML = "";
  });

  it("only explains what is coming while sync is not live", async () => {
    getStatus.mockResolvedValue(status({ enabled: false, available: false }));
    await render();
    expect(text()).toContain("Automatic trade sync is coming soon");
    expect(input("broker-client-code")).toBeNull();
  });

  it("says it is being tried with a small group when sync is live but not open to this account", async () => {
    getStatus.mockResolvedValue(status({ available: false, pilot_only: true }));
    await render();
    expect(text()).toContain("being tried with a small group first");
    expect(text()).toContain("isn't open to your account yet");
    expect(text()).not.toContain("coming soon");
    expect(input("broker-client-code")).toBeNull();
    expect(button("Connect broker")).toBeUndefined();
  });

  it("asks for Pro before letting a free user connect", async () => {
    getStatus.mockResolvedValue(status());
    await render(false);
    expect(text()).toContain("Journal Pro feature");
    expect(input("broker-client-code")).toBeNull();
    expect(document.querySelector("a")?.getAttribute("href")).toBe("/journal/pricing");
  });

  it("keeps Connect disabled until there is a client code and consent, then links", async () => {
    getStatus.mockResolvedValueOnce(status()).mockResolvedValueOnce(status({ link: activeLink({ status: "pending", verified_at: null }) }));
    await render();

    const connect = () => button("Connect broker") as HTMLButtonElement;
    expect(connect().disabled).toBe(true);

    await act(async () => type(input("broker-client-code"), "ab1234"));
    expect(connect().disabled).toBe(true); // still no consent

    await click(document.getElementById("broker-consent") as HTMLElement);
    expect(connect().disabled).toBe(false);

    await click(connect());
    await flush();

    expect(link).toHaveBeenCalledWith({ client_code: "ab1234", consent_version: "draft-1" });
    expect(text()).toContain("Waiting for confirmation");
    expect(button("Sync now")).toBeUndefined(); // a pending link is never read
  });

  it("shows the server's message when linking is refused", async () => {
    getStatus.mockResolvedValue(status());
    link.mockRejectedValueOnce(new Error("This client code can't be linked to your account."));
    await render();
    await act(async () => type(input("broker-client-code"), "AB1234"));
    await click(document.getElementById("broker-consent") as HTMLElement);
    await click(button("Connect broker"));
    await flush();
    expect(toast.error).toHaveBeenCalledWith("This client code can't be linked to your account.");
  });

  it("shows an active connection and syncs on request", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink({ last_synced_at: "2026-11-03T10:30:00Z", last_sync_status: "success" }), synced_trades: 7 }));
    await render();
    expect(text()).toContain("AB1234");
    expect(text()).toContain("Active");
    expect(text()).toContain("7 trades synced");

    await click(button("Sync now"));
    await flush();
    expect(syncNow).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Added 2 new trades");
  });

  it("hides Sync now when sync has been switched off, but still lets the customer disconnect", async () => {
    getStatus.mockResolvedValue(status({ available: false, link: activeLink() }));
    await render();
    expect(button("Sync now")).toBeUndefined();
    expect(button("Disconnect")).toBeDefined();
  });

  it("says when the last sync failed", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink({ last_sync_status: "failed" }) }));
    await render();
    expect(text()).toContain("The last sync didn't go through");
  });

  it("disconnects and can delete the synced trades too", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink(), synced_trades: 4 }));
    await render();

    await click(button("Disconnect"));
    const dialog = document.querySelector<HTMLElement>('[role="alertdialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain("Also delete the 4 trades");

    await click(document.getElementById("delete-synced") as HTMLElement);
    await click(button("Disconnect", dialog));
    await flush();
    expect(unlink).toHaveBeenCalledWith(true);
  });

  it("keeps the synced trades by default when disconnecting", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink(), synced_trades: 4 }));
    await render();
    await click(button("Disconnect"));
    const dialog = document.querySelector<HTMLElement>('[role="alertdialog"]')!;
    await click(button("Disconnect", dialog));
    await flush();
    expect(unlink).toHaveBeenCalledWith(false);
  });

  it("tells the customer when their last request wasn't confirmed, and why", async () => {
    getStatus.mockResolvedValue(status({ rejection: { client_code: "AB1234", note: "The name doesn't match the broker's records", at: "2026-11-03T07:00:00Z" } }));
    await render();
    const notice = document.querySelector('[role="status"]')!;
    expect(notice.textContent).toContain("Your request to connect AB1234 wasn't confirmed.");
    expect(notice.textContent).toContain("The name doesn't match the broker's records");
    expect(input("broker-client-code")).not.toBeNull(); // and they can try again
  });

  it("copes with a turned-down request that has no reason given", async () => {
    getStatus.mockResolvedValue(status({ rejection: { client_code: "AB1234", note: null, at: null } }));
    await render();
    expect(document.querySelector('[role="status"]')?.textContent).toContain("AB1234 wasn't confirmed");
  });

  it("shows no notice once there is a current link, or when nothing was turned down", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink(), rejection: null }));
    await render();
    expect(document.querySelector('[role="status"]')).toBeNull();
  });

  it("explains a waiting request", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink({ status: "pending", verified_at: null }) }));
    await render();
    expect(text()).toContain("Waiting for confirmation");
    expect(text()).toContain("confirming this client code is yours");
  });

  describe("when the consent wording has changed", () => {
    const outdated = () => status({ link: activeLink({ consent_outdated: true, last_synced_at: "2026-11-03T10:30:00Z" }), synced_trades: 3 });

    it("pauses the link and asks them to confirm the new wording", async () => {
      getStatus.mockResolvedValue(outdated());
      await render();
      const banner = document.querySelector('[role="alert"]')!;
      expect(banner.textContent).toContain("We've updated the consent wording");
      expect(banner.textContent).toContain(CONSENT.text);
      expect(text()).toContain("Paused until you confirm the updated consent wording.");
      expect(button("Sync now")).toBeUndefined(); // nothing to do until they confirm
    });

    it("needs the box ticked, then saves the confirmation for the current version", async () => {
      getStatus.mockResolvedValueOnce(outdated()).mockResolvedValueOnce(status({ link: activeLink(), synced_trades: 3 }));
      await render();
      const confirm = () => button("Confirm") as HTMLButtonElement;
      expect(confirm().disabled).toBe(true);

      await click(document.getElementById("broker-reconsent") as HTMLElement);
      expect(confirm().disabled).toBe(false);
      await click(confirm());
      await flush();

      expect(reconsent).toHaveBeenCalledWith("draft-1");
      expect(document.querySelector('[role="alert"]')).toBeNull();
      expect(button("Sync now")).toBeDefined();
    });

    it("shows the server's message if it can't be saved", async () => {
      getStatus.mockResolvedValue(outdated());
      reconsent.mockRejectedValueOnce(new Error("The consent wording has changed. Please read it again and confirm."));
      await render();
      await click(document.getElementById("broker-reconsent") as HTMLElement);
      await click(button("Confirm"));
      await flush();
      expect(toast.error).toHaveBeenCalledWith("The consent wording has changed. Please read it again and confirm.");
    });

    it("shows nothing of the kind when the wording is current", async () => {
      getStatus.mockResolvedValue(status({ link: activeLink() }));
      await render();
      expect(document.querySelector('[role="alert"]')).toBeNull();
      expect(document.getElementById("broker-reconsent")).toBeNull();
    });
  });

  it("is upfront that synced trades don't include charges yet", async () => {
    getStatus.mockResolvedValue(status({ link: activeLink(), synced_trades: 7 }));
    await render();
    expect(text()).toContain("Brokerage and taxes aren't included yet");

    getStatus.mockResolvedValue(status({ link: activeLink(), synced_trades: 0 }));
    await act(async () => { root.unmount(); });
    root = createRoot(host);
    await render();
    expect(text()).not.toContain("Brokerage and taxes");
  });

  it("offers a retry when the connection can't be loaded", async () => {
    getStatus.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(status({ available: false }));
    await render();
    expect(text()).toContain("couldn't load your broker connection");
    await click(button("Try again"));
    await flush();
    expect(text()).toContain("Automatic trade sync is coming soon");
  });
});
