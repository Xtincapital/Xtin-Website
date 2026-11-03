import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// React's act() environment flag for a hand-rolled renderer.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const parse = vi.fn();
const createTrade = vi.fn(async (t: unknown) => t);
const downloadTextFile = vi.fn();
const toast = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }));

vi.mock("../lib/api", () => ({ api: { bulkImport: { parse }, trades: { createTrade } } }));
vi.mock("../lib/sampleData", () => ({ journalSampleMode: { isActive: () => false } }));
vi.mock("@/lib/uploadFile", () => ({ importFileType: () => "csv", downloadTextFile }));
vi.mock("sonner", () => ({ toast }));

const { default: ImportTradesDialog } = await import("./ImportTradesDialog");

const trade = (over: Record<string, unknown> = {}) => ({ date: "2026-01-05", asset: "SBIN", buy_sell: "buy", quantity: 10, entry_price: 100, exit_price: 105, pnl: 50, ...over });

let root: Root;
let host: HTMLDivElement;

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const text = () => document.body.textContent ?? "";
const button = (label: string) => Array.from(document.querySelectorAll<HTMLElement>("button")).find((el) => el.textContent?.trim() === label);
const render = async () => {
  await act(async () => root.render(<ImportTradesDialog open onOpenChange={() => undefined} onImported={() => undefined} />));
  await flush();
};
const choose = async (name = "tradebook.csv") => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", { value: [new File(["x"], name, { type: "text/csv" })], configurable: true });
  await act(async () => { input.dispatchEvent(new Event("change", { bubbles: true })); });
  await flush();
};

describe("ImportTradesDialog with a tradebook", () => {
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

  it("tells people a tradebook is welcome", async () => {
    await render();
    expect(text()).toContain("your broker's tradebook");
  });

  it("explains what it made of a tradebook, including what it left out", async () => {
    parse.mockResolvedValue({ trades: [trade(), trade({ asset: "ITC" })], count: 2, skipped: 0, fills: { fills: 7, trades: 2, open: 2, unmatched: 1 }, file_type: "csv" });
    await render();
    await choose();

    const notice = document.querySelector('[role="status"]')!.textContent!;
    expect(notice).toContain("Read 7 executions from your tradebook and paired them into 2 trades.");
    expect(notice).toContain("2 positions are still open");
    expect(notice).toContain("they aren't included");
    expect(notice).toContain("1 sale has no purchase in this file");
    expect(notice).toContain("it's left out");
  });

  it("uses the singular where there is one", async () => {
    parse.mockResolvedValue({ trades: [trade()], count: 1, skipped: 0, fills: { fills: 1, trades: 1, open: 1, unmatched: 0 }, file_type: "csv" });
    await render();
    await choose();
    const notice = document.querySelector('[role="status"]')!.textContent!;
    expect(notice).toContain("Read 1 execution from your tradebook and paired them into 1 trade.");
    expect(notice).toContain("1 position is still open");
    expect(notice).toContain("it isn't included");
    expect(notice).not.toContain("no purchase"); // nothing was left out for that
  });

  it("says so, rather than 'no trades found', when the executions don't make a finished trade", async () => {
    parse.mockResolvedValue({ trades: [], count: 0, skipped: 0, fills: { fills: 3, trades: 0, open: 3, unmatched: 0 }, file_type: "csv" });
    await render();
    await choose();
    expect(toast.error).toHaveBeenCalledWith("We read 3 executions, but none of them make a finished trade yet.");
    expect(document.querySelector('[role="status"]')!.textContent).toContain("3 positions are still open");
  });

  it("shows no tradebook notice for an ordinary file, and keeps the usual message when nothing is found", async () => {
    parse.mockResolvedValue({ trades: [trade()], count: 1, skipped: 0, fills: null, file_type: "csv" });
    await render();
    await choose();
    expect(document.querySelector('[role="status"]')).toBeNull();

    parse.mockResolvedValue({ trades: [], count: 0, skipped: 4, fills: null, file_type: "csv" });
    await choose("empty.csv");
    expect(toast.error).toHaveBeenCalledWith("No trades found. Make sure the file has Date, Asset, Quantity and Entry/Exit price columns.");
  });

  it("clears an earlier file's notice when a new file is chosen", async () => {
    parse.mockResolvedValueOnce({ trades: [trade()], count: 1, skipped: 0, fills: { fills: 2, trades: 1, open: 0, unmatched: 0 }, file_type: "csv" });
    await render();
    await choose();
    expect(document.querySelector('[role="status"]')).not.toBeNull();

    parse.mockResolvedValueOnce({ trades: [trade()], count: 1, skipped: 0, fills: null, file_type: "csv" });
    await choose("other.csv");
    expect(document.querySelector('[role="status"]')).toBeNull();
  });

  it("doesn't leave an earlier file's notice up when the next file can't be read", async () => {
    parse.mockResolvedValueOnce({ trades: [trade()], count: 1, skipped: 0, fills: { fills: 2, trades: 1, open: 0, unmatched: 0 }, file_type: "csv" });
    await render();
    await choose();
    expect(document.querySelector('[role="status"]')).not.toBeNull();

    parse.mockRejectedValueOnce(new Error("Could not parse file"));
    await choose("broken.csv");
    expect(document.querySelector('[role="status"]')).toBeNull();
    expect(toast.error).toHaveBeenCalledWith("Could not parse file");
    expect(button("Nothing new to import") ?? button("Import trades")).toBeUndefined(); // no stale rows left to import
  });

  it("saves the paired trades like any other import, contract and all", async () => {
    parse.mockResolvedValue({ trades: [trade({ asset: "NIFTY", contract: "NIFTY26NOV24500CE" })], count: 1, skipped: 0, fills: { fills: 2, trades: 1, open: 0, unmatched: 0 }, file_type: "csv" });
    await render();
    await choose();
    await act(async () => { button("Import 1 trade")!.click(); });
    await flush();
    expect(createTrade).toHaveBeenCalledWith(expect.objectContaining({ asset: "NIFTY", contract: "NIFTY26NOV24500CE" }));
  });

  it("offers a tradebook template alongside the usual one", async () => {
    await render();
    await act(async () => { button("Tradebook template")!.click(); });
    expect(downloadTextFile).toHaveBeenCalledTimes(1);
    const [name, content] = downloadTextFile.mock.calls[0];
    expect(name).toBe("journal-tradebook-template.csv");
    expect(content.split("\n")[0]).toBe("Date,Time,Symbol,Buy/Sell,Quantity,Price,Product,Brokerage");
    expect(content.split("\n")).toHaveLength(3);
  });
});
