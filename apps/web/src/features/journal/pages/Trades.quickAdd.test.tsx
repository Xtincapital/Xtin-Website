import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// React's act() environment flag for a hand-rolled renderer.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const createTrade = vi.fn(async (t: any) => ({ id: "new", ...t }));
const getTrades = vi.fn(async () => ({
  data: [
    {
      id: "t1", date: "2026-10-01", asset: "RELIANCE", market: "Equity", type: "Intraday", buy_sell: "buy",
      quantity: 10, entry_price: 100, exit_price: 110, pnl: 100, strategy: "Breakout", currency: "INR", tags: [],
      is_duplicate: true,
    },
  ],
  pagination: { total: 1, limit: 25, offset: 0 },
}));

const clearTrades = vi.fn(async () => ({ success: true, deleted: 1 }));

class JournalApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

vi.mock("../lib/api", () => ({
  JournalApiError,
  api: {
    trades: { getTrades, createTrade, updateTrade: vi.fn(), deleteTrade: vi.fn(), clearTrades },
    strategies: { getStrategies: vi.fn(async () => []), createStrategy: vi.fn(async () => ({})) },
  },
}));
vi.mock("../components/JournalLayout", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("../components/ImportTradesDialog", () => ({ default: () => null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn() }) }));

const { default: Trades } = await import("./Trades");

let root: Root;
let host: HTMLDivElement;

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const byText = (text: string, selector = "button") =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).find((el) => el.textContent?.trim() === text);
const input = (id: string) => document.getElementById(id) as HTMLInputElement;

function type(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("quick add trade", () => {
  beforeEach(async () => {
    localStorage.clear();
    createTrade.mockClear();
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => root.render(<Trades />));
    await flush();
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it("starts with today's date, shows a live P&L, and can save several trades in a row", async () => {
    await act(async () => byText("Add Trade")!.click());
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expect(input("date").value).toBe(today);

    await act(async () => {
      type(input("asset"), "TCS");
      type(input("quantity"), "5");
      type(input("entry_price"), "200");
      type(input("exit_price"), "210");
    });
    expect(document.body.textContent).toContain("50.00"); // (210-200)×5

    // One tap picks the market (no dropdown).
    await act(async () => byText("Equity")!.click());

    await act(async () => byText("Save & add another")!.click());
    await flush();
    expect(createTrade).toHaveBeenCalledTimes(1);
    expect(createTrade.mock.calls[0][0]).toMatchObject({ asset: "TCS", market: "Equity", quantity: 5, pnl: 50, date: today });

    // Dialog stays open for the next trade: asset cleared, market kept.
    expect(input("asset").value).toBe("");
    expect(byText("Equity")!.getAttribute("aria-checked")).toBe("true");
  });

  it("remembers the last market for the next new trade", async () => {
    localStorage.setItem("journal_trade_defaults_v1", JSON.stringify({ market: "Options", type: "Scalping" }));
    await act(async () => byText("Add Trade")!.click());
    expect(byText("Options")!.getAttribute("aria-checked")).toBe("true");
    // Option-only fields appear only for options.
    expect(input("strike_price")).not.toBeNull();
  });

  it("duplicates a row as a new trade dated today with no exit yet", async () => {
    const dup = document.querySelector<HTMLButtonElement>('button[aria-label="Log another RELIANCE trade"]')!;
    await act(async () => dup.click());
    expect(input("asset").value).toBe("RELIANCE");
    expect(input("exit_price").value).toBe("");
    expect(byText("Breakout")!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("required fields, duplicates and clear all", () => {
  beforeEach(async () => {
    localStorage.clear();
    createTrade.mockClear();
    clearTrades.mockClear();
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => root.render(<Trades />));
    await flush();
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  const saveButton = () => byText("Save trade") as HTMLButtonElement;

  it("keeps Save disabled until asset, market, quantity and entry price are filled", async () => {
    await act(async () => byText("Add Trade")!.click());
    expect(saveButton().disabled).toBe(true);
    expect(document.body.textContent).toContain("Still needed: asset, market, quantity, entry price.");

    await act(async () => {
      type(input("asset"), "TCS");
      type(input("quantity"), "5");
    });
    expect(saveButton().disabled).toBe(true);
    expect(document.body.textContent).toContain("Still needed: market, entry price.");

    await act(async () => {
      type(input("entry_price"), "200");
      byText("Equity")!.click();
    });
    expect(saveButton().disabled).toBe(false);
    expect(document.body.textContent).toContain("Ready to save.");
  });

  it("shows a Duplicate badge on a trade that has an identical twin", () => {
    const badge = Array.from(document.querySelectorAll("span")).find((el) => el.textContent?.trim() === "Duplicate");
    expect(badge).toBeTruthy();
  });

  it("asks before saving a trade the server says is already logged", async () => {
    createTrade.mockRejectedValueOnce(new JournalApiError("This trade is already in your journal.", "DUPLICATE_TRADE"));
    await act(async () => byText("Add Trade")!.click());
    await act(async () => {
      type(input("asset"), "RELIANCE");
      type(input("quantity"), "10");
      type(input("entry_price"), "100");
      byText("Equity")!.click();
    });
    await act(async () => saveButton().click());
    await flush();
    expect(document.body.textContent).toContain("This trade is already in your journal.");

    await act(async () => byText("Save anyway")!.click());
    await flush();
    expect(createTrade).toHaveBeenCalledTimes(2);
    expect(createTrade.mock.calls[1][0]).toMatchObject({ asset: "RELIANCE", allow_duplicate: true });
  });

  it("clears all trades only after typing DELETE", async () => {
    await act(async () => byText("Clear all")!.click());
    const confirm = () => byText("Delete all trades") as HTMLButtonElement;
    expect(confirm().disabled).toBe(true);
    await act(async () => type(document.querySelector<HTMLInputElement>('input[aria-label="Type DELETE to confirm"]')!, "DELETE"));
    expect(confirm().disabled).toBe(false);
    await act(async () => confirm().click());
    await flush();
    expect(clearTrades).toHaveBeenCalledTimes(1);
  });
});

