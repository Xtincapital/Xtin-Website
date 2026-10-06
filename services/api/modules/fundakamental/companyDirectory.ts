// Offline company directory — every NSE-listed equity plus every SEC-registered
// US ticker (~13k names), so search can list "all companies" without depending
// on Yahoo, which rate-limits Render's IP. It identifies companies; it carries
// no live quotes. Regenerate the data with scripts/build-company-directory.py.
import { readFileSync } from "node:fs";

export interface DirectoryEntry {
    ticker: string;
    name: string;
    sector: string;
    market: "IN" | "US";
}

type Row = [ticker: string, name: string, market: "IN" | "US", sector: string, aliases?: string];

interface Indexed {
    entry: DirectoryEntry;
    base: string; // ticker without the .NS suffix, lower-cased
    name: string; // lower-cased
    hay: string; // ticker + name + aliases, lower-cased
}

let index: Indexed[] | null = null;

function load(): Indexed[] {
    if (index) return index;
    try {
        const rows = JSON.parse(readFileSync(new URL("./directory/companies.json", import.meta.url), "utf8")) as Row[];
        index = rows.map(([ticker, name, market, sector, aliases]) => {
            const base = ticker.replace(/\.NS$/i, "").toLowerCase();
            return {
                entry: { ticker, name, sector, market },
                base,
                name: name.toLowerCase(),
                hay: `${base} ${name.toLowerCase()} ${aliases ?? ""}`,
            };
        });
    } catch (err) {
        console.error("[Fundakamental] company directory failed to load:", (err as Error)?.message || err);
        index = [];
    }
    return index;
}

/** Lower is better; null = no match. Every word of the query must appear somewhere. */
function score(c: Indexed, q: string, tokens: string[]): number | null {
    if (!tokens.every((t) => c.hay.includes(t))) return null;
    if (c.base === q) return 0;
    if (c.base.startsWith(q)) return 1;
    if (c.name.startsWith(q)) return 2;
    if (c.hay.includes(` ${q}`)) return 3; // a word (or alias) starts with the query
    return 4;
}

export function searchDirectory(query: string, limit = 50): DirectoryEntry[] {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/);

    // Collect then sort by score; file order (curated names first, then NSE
    // alphabetical, then SEC by size) breaks ties.
    const hits: Array<{ s: number; i: number; e: DirectoryEntry }> = [];
    const all = load();
    for (let i = 0; i < all.length; i++) {
        const s = score(all[i], q, tokens);
        if (s !== null) hits.push({ s, i, e: all[i].entry });
    }
    hits.sort((a, b) => a.s - b.s || a.i - b.i);
    return hits.slice(0, limit).map((h) => h.e);
}

/** Exact ticker lookup ("TCS.NS", "AAPL"; a BSE ".BO" ticker matches its NSE listing). */
export function findDirectoryEntry(ticker: string): DirectoryEntry | null {
    const t = (ticker || "").trim().toUpperCase();
    if (!t) return null;
    const nse = t.replace(/\.BO$/, ".NS");
    return load().find((c) => c.entry.ticker.toUpperCase() === t || c.entry.ticker.toUpperCase() === nse)?.entry ?? null;
}
