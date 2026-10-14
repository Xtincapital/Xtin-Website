// The printable Gini report. Pure presentation: Reports.tsx computes the
// numbers, this lays them out as a branded, paginated-looking document.
//
// Everything here uses inline styles with plain hex colours on purpose —
// html2canvas (used to make the PDF) can't parse the modern colour functions
// Tailwind emits, and the PDF must look the same in light and dark mode.
// Each top-level <div data-block> is captured separately and packed onto A4
// pages by Reports.tsx, so sections never get cut mid-row.
import type { CSSProperties, ReactNode } from "react";
import type { ReportMeta } from "@/lib/reportMeta";

export const REPORT_WIDTH = 794; // px — A4 at 96dpi

const C = {
  navy: "#151517", navy2: "#232327", gold: "#9A7634", goldSoft: "#F6ECCE",
  ink: "#151517", mute: "#75757D", line: "#E4E1D9", soft: "#F7F6F2",
  good: "#0E6A4A", warn: "#7C5D2B", bad: "#A52A2F",
};
const serif = '"Instrument Serif", Georgia, "Times New Roman", serif';
const sans = 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export interface ReportData {
  clientName: string;
  clientEmail: string;
  preparedFor: string[]; // household members
  currency: (n: number) => string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assets: { name: string; category: string; value: number; returnRate: number | null; owner: string }[];
  allocation: { category: string; value: number; pct: number }[];
  liabilities: { name: string; type: string; amount: number; rate: number | null; emi: number | null }[];
  goals: { name: string; category: string; targetYear: number | null; priority: string; futureValue: number; saved: number; progressPct: number }[];
  members: { name: string; relationship: string; age: number | null; income: number | null; earner: boolean }[];
  monthlyIncome: number;
  monthlyEmi: number;
  monthlyCashFlow: number;
  growthPct: number;
  riskLabel: string;
  isSample: boolean;
}

const BAR_COLORS = [C.navy, C.gold, "#3E5C8A", "#2A8C9A", "#7A5BA6", "#7A5BA6", "#75757D"];

export function ratioRating(kind: "debt" | "emi" | "growth" | "goals", v: number): { label: string; color: string } {
  const pick = (good: boolean, ok: boolean) => (good ? { label: "Healthy", color: C.good } : ok ? { label: "Watch", color: C.warn } : { label: "Needs attention", color: C.bad });
  if (kind === "debt") return pick(v <= 30, v <= 50);
  if (kind === "emi") return pick(v <= 30, v <= 40);
  if (kind === "goals") return pick(v >= 60, v >= 30);
  return v >= 25 && v <= 70 ? { label: "Balanced", color: C.good } : { label: v > 70 ? "Aggressive" : "Conservative", color: C.warn };
}

function Block({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div data-block style={{ padding: "0 48px", ...style }}>{children}</div>;
}

function Heading({ no, title, sub }: { no: string; title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderBottom: `2px solid ${C.navy}`, paddingBottom: 6, margin: "26px 0 12px" }}>
      <span style={{ fontFamily: serif, fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 1 }}>{no}</span>
      <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.navy }}>{title}</span>
      {sub && <span style={{ marginLeft: "auto", fontSize: 11, color: C.mute }}>{sub}</span>}
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ flex: 1, background: C.soft, border: `1px solid ${C.line}`, borderTop: `3px solid ${tone || C.navy}`, borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, color: C.mute }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: tone || C.navy, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const th: CSSProperties = { textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, color: "#ffffff", background: C.navy, padding: "7px 10px", fontWeight: 600 };
const td: CSSProperties = { padding: "7px 10px", fontSize: 12, color: C.ink, borderBottom: `1px solid ${C.line}` };
const num: CSSProperties = { textAlign: "right", fontVariantNumeric: "tabular-nums" };

function Monogram({ size = 44 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <img src="/favicon.png" alt="Xtin Capital" style={{ width: size - 6, height: size - 6, objectFit: "contain" }} />
    </div>
  );
}

/** Rows of a long table, chunked so each chunk is its own capturable block. */
function chunk<T>(rows: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

export default function ReportDocument({ d, meta, qr }: { d: ReportData; meta: ReportMeta; qr?: string }) {
  const m = d.currency;
  const dt = meta.generatedAt;
  const dateStr = dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const debtRatio = d.totalAssets > 0 ? (d.totalLiabilities / d.totalAssets) * 100 : 0;
  const emiRatio = d.monthlyIncome > 0 ? (d.monthlyEmi / d.monthlyIncome) * 100 : 0;
  const goalsFunded = d.goals.length ? d.goals.reduce((s, g) => s + g.progressPct, 0) / d.goals.length : 0;
  const health = [
    { name: "Debt-to-asset ratio", value: `${debtRatio.toFixed(0)}%`, bench: "Healthy: under 30%", r: ratioRating("debt", debtRatio), show: d.totalAssets > 0 },
    { name: "EMI-to-income ratio", value: `${emiRatio.toFixed(0)}%`, bench: "Healthy: under 30%", r: ratioRating("emi", emiRatio), show: d.monthlyIncome > 0 },
    { name: "Growth-asset share", value: `${d.growthPct.toFixed(0)}%`, bench: "Balanced: 25–70%", r: ratioRating("growth", d.growthPct), show: d.totalAssets > 0 },
    { name: "Average goal funding", value: `${goalsFunded.toFixed(0)}%`, bench: "On track: 60%+", r: ratioRating("goals", goalsFunded), show: d.goals.length > 0 },
  ].filter((h) => h.show);

  return (
    <div id="report-doc" style={{ width: REPORT_WIDTH, background: "#ffffff", color: C.ink, fontFamily: sans, position: "relative" }}>
      {/* Cover band */}
      <div data-block style={{ background: C.navy, color: "#ffffff", padding: "34px 48px 30px", borderBottom: `5px solid ${C.gold}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Monogram size={56} />
          <div>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>XTIN CAPITAL</div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#CDAA5F", marginTop: 2 }}>GINI · FAMILY FINANCIAL PLANNING</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 10, lineHeight: 1.6, color: "#CFCBC1" }}>
            <div>Report No.</div>
            <div style={{ fontSize: 13, color: "#ffffff", fontWeight: 700, letterSpacing: 1 }}>{meta.reportNo}</div>
          </div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, marginTop: 34, lineHeight: 1.15 }}>Financial Planning Report</div>
        <div style={{ fontSize: 13, color: "#CFCBC1", marginTop: 6 }}>A consolidated view of net worth, cash flow and goals</div>
        <div style={{ display: "flex", gap: 36, marginTop: 26, fontSize: 11 }}>
          <div><div style={{ color: "#CDAA5F", letterSpacing: 1.2, fontSize: 9 }}>PREPARED FOR</div><div style={{ fontSize: 16, fontFamily: serif, marginTop: 3 }}>{d.clientName}</div><div style={{ color: "#CFCBC1", marginTop: 2 }}>{d.clientEmail}</div></div>
          <div><div style={{ color: "#CDAA5F", letterSpacing: 1.2, fontSize: 9 }}>DATE ISSUED</div><div style={{ fontSize: 16, fontFamily: serif, marginTop: 3 }}>{dateStr}</div><div style={{ color: "#CFCBC1", marginTop: 2 }}>{timeStr}</div></div>
          <div><div style={{ color: "#CDAA5F", letterSpacing: 1.2, fontSize: 9 }}>PREPARED BY</div><div style={{ fontSize: 16, fontFamily: serif, marginTop: 3 }}>Gini Planning Engine</div><div style={{ color: "#CFCBC1", marginTop: 2 }}>Xtin Capital Research</div></div>
        </div>
      </div>

      {d.isSample && (
        <Block style={{ marginTop: 14 }}>
          <div style={{ background: "#F6ECCE", border: "1px solid #B8923F", color: "#654B26", borderRadius: 6, padding: "8px 12px", fontSize: 11 }}>
            <strong>Illustrative data.</strong> This copy was generated from sample figures, not your own records.
          </div>
        </Block>
      )}

      {/* 01 Executive summary */}
      <Block>
        <Heading no="01" title="Executive Summary" sub={`As of ${dateStr}`} />
        <div style={{ display: "flex", gap: 10 }}>
          <Kpi label="Total assets" value={m(d.totalAssets)} />
          <Kpi label="Total liabilities" value={m(d.totalLiabilities)} tone={C.bad} />
          <Kpi label="Net worth" value={m(d.netWorth)} tone={d.netWorth >= 0 ? C.good : C.bad} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Kpi label="Monthly income" value={m(d.monthlyIncome)} />
          <Kpi label="Monthly EMIs" value={m(d.monthlyEmi)} tone={C.warn} />
          <Kpi label="Net monthly cash flow" value={m(d.monthlyCashFlow)} tone={d.monthlyCashFlow >= 0 ? C.good : C.bad} />
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.65, color: "#404047", marginTop: 14 }}>
          {d.preparedFor.length > 1 ? `This report covers the ${d.clientName} household (${d.preparedFor.join(", ")}). ` : `This report covers ${d.clientName}'s finances. `}
          Net worth stands at <strong>{m(d.netWorth)}</strong>, with {m(d.totalAssets)} in assets against {m(d.totalLiabilities)} in liabilities.
          {d.monthlyIncome > 0 && <> After EMIs, the household keeps <strong>{m(d.monthlyCashFlow)}</strong> a month of recorded income. </>}
          {d.goals.length > 0 && <>{d.goals.length} goal{d.goals.length > 1 ? "s are" : " is"} tracked, funded {goalsFunded.toFixed(0)}% on average.</>}
        </p>
      </Block>

      {/* 02 Health snapshot */}
      {health.length > 0 && (
        <Block>
          <Heading no="02" title="Financial Health Snapshot" sub="Rule-of-thumb benchmarks" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Indicator</th><th style={{ ...th, ...num }}>Your value</th><th style={th}>Benchmark</th><th style={th}>Status</th></tr></thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.name}>
                  <td style={td}>{h.name}</td>
                  <td style={{ ...td, ...num, fontWeight: 700 }}>{h.value}</td>
                  <td style={{ ...td, color: C.mute }}>{h.bench}</td>
                  <td style={{ ...td, color: h.r.color, fontWeight: 700 }}>● {h.r.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: C.mute, marginTop: 8 }}>Overall risk profile (growth vs. stable asset mix): <strong style={{ color: C.navy }}>{d.riskLabel}</strong>. Benchmarks are general planning guidelines, not personalised advice.</p>
        </Block>
      )}

      {/* 03 Net worth & allocation */}
      <Block>
        <Heading no="03" title="Net Worth & Asset Allocation" />
        {d.allocation.length === 0 ? (
          <p style={{ fontSize: 12, color: C.mute }}>No assets recorded yet.</p>
        ) : (
          <>
            <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
              {d.allocation.map((a, i) => <div key={a.category} style={{ width: `${a.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />)}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {d.allocation.map((a, i) => (
                  <tr key={a.category}>
                    <td style={td}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: BAR_COLORS[i % BAR_COLORS.length], marginRight: 8 }} />{a.category}</td>
                    <td style={{ ...td, ...num }}>{m(a.value)}</td>
                    <td style={{ ...td, ...num, width: 60, fontWeight: 700 }}>{a.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Block>

      {/* Holdings + liabilities tables */}
      {d.assets.length > 0 && chunk(d.assets, 14).map((rows, i) => (
        <Block key={`a${i}`} style={{ marginTop: 14 }}>
          {i === 0 && <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Holdings Register</div>}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Asset</th><th style={th}>Category</th><th style={th}>Owner</th><th style={{ ...th, ...num }}>Exp. return</th><th style={{ ...th, ...num }}>Value</th></tr></thead>
            <tbody>
              {rows.map((a, k) => (
                <tr key={k}><td style={td}>{a.name}</td><td style={{ ...td, color: C.mute }}>{a.category}</td><td style={{ ...td, color: C.mute }}>{a.owner}</td><td style={{ ...td, ...num }}>{a.returnRate != null ? `${a.returnRate}%` : "—"}</td><td style={{ ...td, ...num, fontWeight: 700 }}>{m(a.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </Block>
      ))}
      {d.liabilities.length > 0 && chunk(d.liabilities, 12).map((rows, i) => (
        <Block key={`l${i}`} style={{ marginTop: 14 }}>
          {i === 0 && <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Liabilities Register</div>}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Liability</th><th style={th}>Type</th><th style={{ ...th, ...num }}>Rate</th><th style={{ ...th, ...num }}>EMI</th><th style={{ ...th, ...num }}>Outstanding</th></tr></thead>
            <tbody>
              {rows.map((l, k) => (
                <tr key={k}><td style={td}>{l.name}</td><td style={{ ...td, color: C.mute }}>{l.type}</td><td style={{ ...td, ...num }}>{l.rate != null ? `${l.rate}%` : "—"}</td><td style={{ ...td, ...num }}>{l.emi != null ? m(l.emi) : "—"}</td><td style={{ ...td, ...num, fontWeight: 700 }}>{m(l.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </Block>
      ))}

      {/* 04 Goals */}
      <Block><Heading no="04" title="Goals Analysis" sub="Future value uses each goal's inflation rate" /></Block>
      {d.goals.length === 0 ? (
        <Block><p style={{ fontSize: 12, color: C.mute }}>No goals recorded yet.</p></Block>
      ) : d.goals.map((g, i) => {
        const color = g.progressPct >= 60 ? C.good : g.progressPct >= 30 ? C.warn : C.bad;
        return (
          <Block key={i} style={{ marginBottom: 10 }}>
            <div style={{ border: `1px solid ${C.line}`, borderLeft: `4px solid ${color}`, borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontFamily: serif, fontSize: 14, fontWeight: 700, color: C.navy }}>{g.name}</span>
                <span style={{ marginLeft: 8, fontSize: 10, color: C.mute }}>{g.category} · {g.priority} priority</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color }}>{g.progressPct.toFixed(0)}% funded</span>
              </div>
              <div style={{ height: 7, background: C.line, borderRadius: 4, margin: "8px 0" }}><div style={{ width: `${Math.min(100, g.progressPct)}%`, height: 7, background: color, borderRadius: 4 }} /></div>
              <div style={{ display: "flex", fontSize: 11, color: "#404047", gap: 24 }}>
                <span>Target year: <strong>{g.targetYear ?? "—"}</strong></span>
                <span>Inflation-adjusted cost: <strong>{m(g.futureValue)}</strong></span>
                <span>Saved so far: <strong>{m(g.saved)}</strong></span>
              </div>
            </div>
          </Block>
        );
      })}

      {/* 05 Household */}
      {d.members.length > 0 && (
        <Block>
          <Heading no="05" title="Household & Cash Flow" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Member</th><th style={th}>Relationship</th><th style={{ ...th, ...num }}>Age</th><th style={th}>Role</th><th style={{ ...th, ...num }}>Monthly income</th></tr></thead>
            <tbody>
              {d.members.map((p, i) => (
                <tr key={i}><td style={{ ...td, fontWeight: 700 }}>{p.name}</td><td style={{ ...td, color: C.mute }}>{p.relationship}</td><td style={{ ...td, ...num }}>{p.age ?? "—"}</td><td style={td}>{p.earner ? "Earner" : "Dependent"}</td><td style={{ ...td, ...num }}>{p.income ? m(p.income) : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </Block>
      )}

      {/* Authenticity + disclaimer */}
      <Block style={{ marginTop: 30, paddingBottom: 30 }}>
        <div style={{ display: "flex", gap: 18, border: `1px solid ${C.gold}`, background: C.goldSoft, borderRadius: 8, padding: "14px 16px" }}>
          <Monogram size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 700, color: C.navy }}>Report authenticity</div>
            <div style={{ fontSize: 11, color: "#404047", lineHeight: 1.6, marginTop: 4 }}>
              Issued to <strong>{d.clientName}</strong> on {dateStr} at {timeStr} by the Gini Planning Engine, Xtin Capital.
              The fingerprint below is computed from the figures in this report; if any number is changed, the fingerprint no longer matches the original.
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 8, fontSize: 10, color: C.mute }}>
              <span>Report No. <strong style={{ color: C.navy, letterSpacing: 0.5 }}>{meta.reportNo}</strong></span>
              <span>Integrity fingerprint <strong style={{ color: C.navy, fontFamily: "Menlo, Consolas, monospace", letterSpacing: 0.5 }}>{meta.fingerprint}</strong></span>
            </div>
            <div style={{ fontSize: 10, color: C.mute, marginTop: 5 }}>Verify this copy: scan the code, or visit <strong style={{ color: C.navy }}>{window.location.host}/verify</strong> and enter the report number.</div>
          </div>
          {qr && <img src={qr} alt="Verification QR code" style={{ width: 78, height: 78, background: "#ffffff", padding: 3, borderRadius: 6, flexShrink: 0 }} />}
        </div>
        <p style={{ fontSize: 9.5, color: C.mute, lineHeight: 1.6, marginTop: 14 }}>
          <strong>Important notice.</strong> This report is generated from the information you entered in Gini and is for personal planning and education only. It is not investment, tax or legal advice,
          and Xtin Capital is not a SEBI-registered investment adviser. Figures are only as accurate as the data supplied; projected values rest on assumed inflation and return rates and are not guarantees.
          Please consult a qualified professional before acting on it.
        </p>
      </Block>
    </div>
  );
}
