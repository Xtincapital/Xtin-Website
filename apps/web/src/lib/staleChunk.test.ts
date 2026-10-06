import { beforeEach, describe, expect, it, vi } from "vitest";
import { isStaleChunkError, reloadForNewVersion } from "./staleChunk";

const store = new Map<string, string>();
vi.stubGlobal("sessionStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
});

describe("stale chunk reload", () => {
  beforeEach(() => store.clear());

  it("recognises the errors browsers give for a removed page file", () => {
    expect(isStaleChunkError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/NetWorth-CFrOTdom.js"))).toBe(true);
    expect(isStaleChunkError(new TypeError("Importing a module script failed."))).toBe(true);
    expect(isStaleChunkError(new Error("Cannot read properties of undefined"))).toBe(false);
  });

  it("reloads once, then not again within 30 seconds", () => {
    const reload = vi.fn();
    expect(reloadForNewVersion(1_000_000, reload)).toBe(true);
    expect(reloadForNewVersion(1_010_000, reload)).toBe(false);
    expect(reloadForNewVersion(1_040_001, reload)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
