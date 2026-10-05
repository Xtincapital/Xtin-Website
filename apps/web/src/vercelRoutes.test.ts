import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// vercel.json only serves the app for known top-level sections; any other path
// gets 404.html with a real 404 status. A new section missing from that list
// would still render, but search engines would see it as a 404.

const webRoot = join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|jsx?)$/.test(name) && !name.includes(".test.") ? [full] : [];
  });
}

describe("vercel.json rewrites", () => {
  it("cover every top-level route section", () => {
    const vercel = JSON.parse(readFileSync(join(webRoot, "vercel.json"), "utf8"));
    const sources: string[] = vercel.rewrites.map((r: { source: string }) => r.source);
    const allowed = new Set(
      sources.flatMap((s) => s.match(/^\/:section\(([^)]+)\)/)?.[1].split("|") ?? []),
    );

    const sections = new Set<string>();
    for (const file of sourceFiles(join(webRoot, "src"))) {
      for (const m of readFileSync(file, "utf8").matchAll(/path="\/([^"/:*]+)/g)) {
        sections.add(m[1]);
      }
    }

    expect(sections.size).toBeGreaterThan(10);
    expect([...sections].filter((s) => !allowed.has(s))).toEqual([]);
  });
});
