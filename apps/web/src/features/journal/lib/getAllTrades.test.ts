// The Journal pages used to read one page of 200 trades, so trade 201 onwards
// was missing from the Dashboard and every chart (reported 2026-10-11).
import { describe, it, expect, vi, afterEach } from "vitest";
import * as api from "./api";

const makeTrades = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, date: "2026-10-01", asset: "INFY" }) as any);

afterEach(() => vi.restoreAllMocks());

describe("getAllTrades", () => {
  it("reads every page until it has all trades", async () => {
    const all = makeTrades(2300);
    const spy = vi.spyOn(api.trades, "getTrades").mockImplementation(async (p) => ({
      data: all.slice(p!.offset!, p!.offset! + p!.limit!),
      pagination: { total: all.length, limit: p!.limit!, offset: p!.offset! },
    }));
    const res = await api.getAllTrades();
    expect(res.data).toHaveLength(2300);
    expect(spy.mock.calls.map((c) => c[0])).toEqual([
      { limit: 1000, offset: 0 },
      { limit: 1000, offset: 1000 },
      { limit: 1000, offset: 2000 },
    ]);
  });

  it("returns 300 trades from a single request", async () => {
    const all = makeTrades(300);
    const spy = vi.spyOn(api.trades, "getTrades").mockResolvedValue({ data: all, pagination: { total: 300, limit: 1000, offset: 0 } });
    expect((await api.getAllTrades()).data).toHaveLength(300);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("falls back to pages of 200 on a server that only allows 200", async () => {
    const all = makeTrades(300);
    vi.spyOn(api.trades, "getTrades").mockImplementation(async (p) => {
      if (p!.limit! > 200) throw new Error("Validation failed");
      return { data: all.slice(p!.offset!, p!.offset! + p!.limit!), pagination: { total: 300, limit: p!.limit!, offset: p!.offset! } };
    });
    expect((await api.getAllTrades()).data).toHaveLength(300);
  });

  it("handles an empty journal", async () => {
    vi.spyOn(api.trades, "getTrades").mockResolvedValue({ data: [], pagination: { total: 0, limit: 1000, offset: 0 } });
    expect(await api.getAllTrades()).toMatchObject({ data: [], pagination: { total: 0 } });
  });
});
