// Compares the name a customer has on Xtin with the name their broker has on
// file for the client code. It is only a hint for the admin reviewing a link
// request, never a decision: names are written differently in different places
// (initials, order, middle names), so it says how much they overlap.

export type NameMatch = "match" | "partial" | "mismatch" | "unknown";

const tokens = (name: string): Set<string> =>
    new Set(
        name
            .normalize("NFKD")
            .replace(/[̀-ͯ]/g, "") // drop the accent marks, so "é" is "e" rather than a break in the word
            .toLowerCase()
            .replace(/[^a-z\s]/g, " ")
            .split(/\s+/)
            // Single letters are initials; they can't tell two people apart.
            .filter((t) => t.length > 1),
    );

/**
 * "match": every word of the shorter name is in the longer one (so order and a
 * missing middle name don't matter). "partial": some words are shared.
 * "mismatch": none are. "unknown": one side has no usable name.
 */
export function compareNames(a: string | null | undefined, b: string | null | undefined): NameMatch {
    const [x, y] = [tokens(a ?? ""), tokens(b ?? "")];
    if (!x.size || !y.size) return "unknown";
    const shared = [...x].filter((t) => y.has(t)).length;
    if (shared === 0) return "mismatch";
    return shared === Math.min(x.size, y.size) ? "match" : "partial";
}
