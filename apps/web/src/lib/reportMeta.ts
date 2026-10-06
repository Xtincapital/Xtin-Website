// Shared by the Gini and Journal reports.
// Identity of a generated report: a report number and an integrity
// fingerprint, so a printed/PDF copy can be traced back to the figures it was
// built from. The fingerprint is a SHA-256 of the report's data snapshot —
// the same numbers always give the same fingerprint, any edit changes it.

export interface ReportMeta {
  reportNo: string;
  fingerprint: string; // 32 hex chars, grouped for display
  generatedAt: Date;
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

/** FNV-1a fallback for the (rare) context without crypto.subtle. */
function fnv(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0").repeat(4);
}

/** `prefix` tells the products apart in the report number (XC-GN = Gini, XC-JN = Journal). */
export async function buildReportMeta(userKey: string, snapshot: unknown, generatedAt = new Date(), prefix = "XC-GN"): Promise<ReportMeta> {
  const payload = JSON.stringify({ u: userKey, s: snapshot });
  let digest: string;
  try {
    digest = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload)));
  } catch {
    digest = fnv(payload);
  }
  const d = generatedAt;
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const fingerprint = digest.slice(0, 32).toUpperCase().match(/.{4}/g)!.join("-");
  return { reportNo: `${prefix}-${ymd}-${digest.slice(0, 4).toUpperCase()}`, fingerprint, generatedAt };
}
