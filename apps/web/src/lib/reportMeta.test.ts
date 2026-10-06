import { describe, it, expect } from "vitest";
import { buildReportMeta } from "./reportMeta";

const at = new Date(2026, 9, 6);

describe("buildReportMeta", () => {
  it("is stable for the same data and changes when a figure changes", async () => {
    const a = await buildReportMeta("u1", { v: [1, 2] }, at);
    const b = await buildReportMeta("u1", { v: [1, 2] }, at);
    const c = await buildReportMeta("u1", { v: [1, 3] }, at);
    expect(a.fingerprint).toBe(b.fingerprint);
    expect(a.fingerprint).not.toBe(c.fingerprint);
    expect(a.reportNo).toMatch(/^XC-GN-20261006-[0-9A-F]{8}$/);
    expect(a.fingerprint).toMatch(/^([0-9A-F]{4}-){7}[0-9A-F]{4}$/);
  });
});
