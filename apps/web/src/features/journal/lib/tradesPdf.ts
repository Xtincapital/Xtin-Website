// "Export PDF" on the Trades page: a branded Trading Journal Report — cover with
// who it was prepared for, a report number and an integrity fingerprint, a
// performance summary, and then the full trade log. Built with jsPDF's own text
// calls (not a screenshot of the page), so the file stays small, the text can be
// selected and searched, and it runs to as many pages as there are trades.
import type { jsPDF as JsPDF } from "jspdf";
import type { Trade } from "./api";
import { marketLabel } from "./journalPatternHelpers";
import type { ReportMeta } from "@/lib/reportMeta";

type PdfTrade = Pick<
  Trade,
  "date" | "asset" | "buy_sell" | "quantity" | "entry_price" | "exit_price" | "brokerage" | "pnl" | "currency" | "strategy" | "market" | "emotion"
>;

export function tradeSummary(trades: PdfTrade[]) {
  const closed = trades.filter((t) => t.pnl != null);
  const wins = closed.filter((t) => (t.pnl as number) > 0).length;
  const losses = closed.filter((t) => (t.pnl as number) < 0).length;
  const totalPnl = closed.reduce((s, t) => s + (t.pnl as number), 0);
  return {
    trades: trades.length,
    closed: closed.length,
    open: trades.length - closed.length,
    wins,
    losses,
    totalPnl,
    winRate: closed.length ? (wins / closed.length) * 100 : 0,
  };
}

// The PDF's built-in fonts have no ₹ sign, so amounts use Indian digit grouping
// and the currency code sits in its own column.
const amount = (v: number | null | undefined, digits = 2) =>
  v == null ? "-" : v.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const COLUMNS: { label: string; width: number; align?: "right"; value: (t: PdfTrade) => string }[] = [
  { label: "Date", width: 22, value: (t) => t.date || "-" },
  { label: "Asset", width: 34, value: (t) => t.asset || "-" },
  { label: "Side", width: 12, value: (t) => (t.buy_sell || "buy").toUpperCase() },
  { label: "Market", width: 28, value: (t) => (t.market ? marketLabel(t.market) : "-") },
  { label: "Qty", width: 16, align: "right", value: (t) => amount(t.quantity, 0) },
  { label: "Entry", width: 24, align: "right", value: (t) => amount(t.entry_price) },
  { label: "Exit", width: 24, align: "right", value: (t) => amount(t.exit_price) },
  { label: "Brokerage", width: 20, align: "right", value: (t) => amount(t.brokerage) },
  { label: "P&L", width: 26, align: "right", value: (t) => amount(t.pnl) },
  { label: "Ccy", width: 11, value: (t) => t.currency || "INR" },
  { label: "Strategy", width: 32, value: (t) => t.strategy || "-" },
  { label: "Emotion", width: 20, value: (t) => t.emotion || "-" },
];

export interface TradesPdfOptions {
  preparedFor?: string;
  email?: string;
  meta?: ReportMeta;
  /** data: URL of the Xtin favicon; the cover just skips it if absent. */
  logo?: string;
}

const NAVY: [number, number, number] = [11, 31, 58];
const GOLD: [number, number, number] = [184, 137, 43];
const MUTE: [number, number, number] = [107, 114, 128];

const groupPnl = (trades: PdfTrade[], key: (t: PdfTrade) => string | null | undefined) => {
  const map = new Map<string, { n: number; wins: number; pnl: number }>();
  for (const t of trades) {
    if (t.pnl == null) continue;
    const k = key(t) || "Unspecified";
    const g = map.get(k) || { n: 0, wins: 0, pnl: 0 };
    g.n++;
    if (t.pnl > 0) g.wins++;
    g.pnl += t.pnl;
    map.set(k, g);
  }
  return [...map.entries()].map(([name, g]) => ({ name, ...g })).sort((a, b) => b.pnl - a.pnl);
};

/** Builds the document; the caller saves it. Kept separate from saving so it can be tested. */
export function buildTradesPdf(JsPDFCtor: typeof JsPDF, trades: PdfTrade[], generatedOn = new Date(), opts: TradesPdfOptions = {}): JsPDF {
  const doc = new JsPDFCtor({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const left = 12;
  const rowHeight = 6.5;
  const s = tradeSummary(trades);
  const closed = trades.filter((t) => t.pnl != null);
  const gross = closed.filter((t) => (t.pnl as number) > 0).reduce((a, t) => a + (t.pnl as number), 0);
  const lossAbs = Math.abs(closed.filter((t) => (t.pnl as number) < 0).reduce((a, t) => a + (t.pnl as number), 0));
  const avgWin = s.wins ? gross / s.wins : 0;
  const avgLoss = s.losses ? lossAbs / s.losses : 0;
  const best = closed.reduce<PdfTrade | null>((b, t) => (!b || (t.pnl as number) > (b.pnl as number) ? t : b), null);
  const worst = closed.reduce<PdfTrade | null>((b, t) => (!b || (t.pnl as number) < (b.pnl as number) ? t : b), null);
  const currencies = [...new Set(trades.map((t) => t.currency || "INR"))];
  const dates = trades.map((t) => t.date).filter(Boolean).sort();
  const issued = generatedOn.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const who = opts.preparedFor || "Xtin Journal user";

  // ── Cover band ──
  doc.setFillColor(...NAVY).rect(0, 0, W, 62, "F");
  doc.setFillColor(...GOLD).rect(0, 62, W, 1.6, "F");
  if (opts.logo) {
    doc.setFillColor(255, 255, 255).roundedRect(left, 10, 17, 17, 2, 2, "F");
    try { doc.addImage(opts.logo, "PNG", left + 1, 11, 15, 15); } catch { /* logo is optional */ }
  }
  doc.setTextColor(255, 255, 255).setFont("times", "bold").setFontSize(17).text("XTIN CAPITAL", left + 21, 17);
  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(217, 182, 106).text("XTIN JOURNAL  |  TRADING PERFORMANCE", left + 21, 22.5);
  if (opts.meta) {
    doc.setTextColor(199, 210, 227).setFontSize(7.5).text("Report No.", W - left, 14, { align: "right" });
    doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(10).text(opts.meta.reportNo, W - left, 19.5, { align: "right" });
  }
  doc.setFont("times", "bold").setFontSize(26).setTextColor(255, 255, 255).text("Trading Journal Report", left, 40);
  const facts: [string, string][] = [["PREPARED FOR", who], ["DATE ISSUED", issued], ["PERIOD", dates.length ? `${dates[0]} to ${dates[dates.length - 1]}` : "-"], ["PREPARED BY", "Xtin Journal Engine"]];
  let fx = left;
  for (const [k, v] of facts) {
    doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(217, 182, 106).text(k, fx, 50);
    doc.setFont("times", "normal").setFontSize(11).setTextColor(255, 255, 255).text(v, fx, 56);
    fx += Math.max(48, doc.getTextWidth(v) + 14);
  }

  // ── KPI cards ──
  const sec = (title: string, no: string, y: number) => {
    doc.setFont("times", "bold").setFontSize(9).setTextColor(...GOLD).text(no, left, y);
    doc.setFontSize(13).setTextColor(...NAVY).text(title, left + 8, y);
    doc.setDrawColor(...NAVY).setLineWidth(0.5).line(left, y + 2, W - left, y + 2);
  };
  sec("Performance Summary", "01", 76);
  const single = currencies.length === 1;
  const kpis: [string, string, [number, number, number]][] = [
    ["TOTAL TRADES", `${s.trades}`, NAVY],
    ["WIN RATE", `${s.winRate.toFixed(1)}%`, s.winRate >= 50 ? [21, 128, 61] : [180, 83, 9]],
    ["NET P&L", single ? `${amount(s.totalPnl)} ${currencies[0]}` : "See by currency", s.totalPnl >= 0 ? [21, 128, 61] : [185, 28, 28]],
    ["PROFIT FACTOR", lossAbs ? (gross / lossAbs).toFixed(2) : gross ? "n/a" : "-", NAVY],
    ["AVG WIN / AVG LOSS", single ? `${amount(avgWin, 0)} / ${amount(avgLoss, 0)}` : "-", NAVY],
    ["WINS / LOSSES / OPEN", `${s.wins} / ${s.losses} / ${s.open}`, NAVY],
  ];
  const cw = (W - left * 2 - 5 * 4) / 6;
  kpis.forEach(([label, value, color], i) => {
    const x = left + i * (cw + 4);
    doc.setFillColor(248, 250, 252).setDrawColor(229, 231, 235).setLineWidth(0.2).roundedRect(x, 83, cw, 20, 1.5, 1.5, "FD");
    doc.setFillColor(...color).rect(x, 83, cw, 1.2, "F");
    doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(...MUTE).text(label, x + 3, 90);
    doc.setFont("times", "bold").setFontSize(value.length > 14 ? 10 : 13).setTextColor(...color).text(value, x + 3, 98);
  });
  if (single && best && worst) {
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(55, 65, 81);
    doc.text(`Best trade: ${best.asset} (${amount(best.pnl)})   |   Worst trade: ${worst.asset} (${amount(worst.pnl)})`, left, 111);
  }

  // ── Breakdown tables (market / strategy / emotion) ──
  sec("Where the P&L came from", "02", 122);
  const groups: [string, ReturnType<typeof groupPnl>][] = [
    ["By market", groupPnl(trades, (t) => (t.market ? marketLabel(t.market) : null))],
    ["By strategy", groupPnl(trades, (t) => t.strategy)],
    ["By currency", groupPnl(trades, (t) => t.currency || "INR")],
  ];
  const gw = (W - left * 2 - 8) / 3;
  groups.forEach(([title, rows], gi) => {
    const x = left + gi * (gw + 4);
    doc.setFillColor(...NAVY).rect(x, 127, gw, 6, "F");
    doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(255, 255, 255).text(title.toUpperCase(), x + 2, 131.2);
    doc.text("TRADES", x + gw - 38, 131.2, { align: "right" });
    doc.text("WIN%", x + gw - 24, 131.2, { align: "right" });
    doc.text("P&L", x + gw - 2, 131.2, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(8);
    rows.slice(0, 6).forEach((r, i) => {
      const y = 138 + i * 6;
      let name = r.name;
      while (name.length > 1 && doc.getTextWidth(name) > gw - 50) name = name.slice(0, -2) + "..";
      doc.setTextColor(20, 20, 20).text(name, x + 2, y);
      doc.text(String(r.n), x + gw - 38, y, { align: "right" });
      doc.text(`${((r.wins / r.n) * 100).toFixed(0)}%`, x + gw - 24, y, { align: "right" });
      doc.setTextColor(r.pnl < 0 ? 185 : 21, r.pnl < 0 ? 28 : 128, r.pnl < 0 ? 28 : 61).text(amount(r.pnl, 0), x + gw - 2, y, { align: "right" });
      doc.setDrawColor(229, 231, 235).line(x, y + 2, x + gw, y + 2);
    });
    if (!rows.length) doc.setTextColor(...MUTE).text("No closed trades yet", x + 2, 138);
  });
  doc.setTextColor(...MUTE).setFontSize(7.5).text("Closed trades only. Amounts are in each trade's own currency; they are not converted.", left, 177);

  // ── Authenticity seal ──
  doc.setFillColor(246, 237, 216).setDrawColor(...GOLD).setLineWidth(0.3).roundedRect(left, 182, W - left * 2, 16, 1.5, 1.5, "FD");
  doc.setFont("times", "bold").setFontSize(9).setTextColor(...NAVY).text("Report authenticity", left + 4, 188);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(55, 65, 81);
  doc.text(
    `Issued to ${who} on ${issued} by the Xtin Journal Engine, Xtin Capital.${opts.meta ? ` Report No. ${opts.meta.reportNo}   Fingerprint ${opts.meta.fingerprint}` : ""}`,
    left + 4,
    193,
  );
  doc.text("Personal record generated from the trades you logged. Not investment advice; Xtin Capital is not a SEBI-registered adviser. Figures are only as accurate as the data entered.", left + 4, 196.5);

  // ── Trade log ──
  const drawHeader = (y: number) => {
    doc.setFillColor(...NAVY);
    doc.rect(left, y - 4.5, W - left * 2, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    let x = left + 1.5;
    for (const c of COLUMNS) {
      doc.text(c.label, c.align === "right" ? x + c.width - 2 : x, y, c.align === "right" ? { align: "right" } : undefined);
      x += c.width;
    }
    doc.setFont("helvetica", "normal");
    return y + rowHeight;
  };

  doc.addPage();
  sec("Trade Log", "03", 20);
  let y = drawHeader(32);
  for (const t of trades) {
    if (y > H - 16) {
      doc.addPage();
      y = drawHeader(20);
    }
    let x = left + 1.5;
    for (const c of COLUMNS) {
      let text = c.value(t);
      // Clip text that would run into the next column.
      while (text.length > 1 && doc.getTextWidth(text) > c.width - 3) text = text.slice(0, -3) + "..";
      if (c.label === "P&L" && t.pnl != null) doc.setTextColor(t.pnl < 0 ? 180 : 20, t.pnl < 0 ? 40 : 120, t.pnl < 0 ? 40 : 60);
      else doc.setTextColor(20, 20, 20);
      doc.text(text, c.align === "right" ? x + c.width - 2 : x, y, c.align === "right" ? { align: "right" } : undefined);
      doc.setTextColor(20, 20, 20);
      x += c.width;
    }
    doc.setDrawColor(225, 230, 226);
    doc.line(left, y + 2, W - left, y + 2);
    y += rowHeight;
  }

  // ── Page furniture ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    if (p > 1) {
      doc.setFont("times", "bold").setFontSize(8).setTextColor(...NAVY).text("XTIN CAPITAL  |  TRADING JOURNAL REPORT", left, 9);
      doc.setFont("helvetica", "normal").setTextColor(...MUTE).text(`Prepared for ${who}`, W - left, 9, { align: "right" });
      doc.setDrawColor(...GOLD).setLineWidth(0.4).line(left, 11, W - left, 11);
    }
    doc.setDrawColor(229, 231, 235).setLineWidth(0.2).line(left, H - 10, W - left, H - 10);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTE);
    doc.text(opts.meta ? `Report No. ${opts.meta.reportNo}   |   Fingerprint ${opts.meta.fingerprint.slice(0, 19)}...` : "Xtin Journal", left, H - 6);
    doc.text(`Page ${p} of ${pages}`, W - left, H - 6, { align: "right" });
  }
  doc.setProperties({
    title: `Trading Journal Report - ${who}`,
    subject: opts.meta ? `Report ${opts.meta.reportNo}` : "Trading Journal Report",
    author: "Xtin Capital - Xtin Journal Engine",
    keywords: opts.meta?.fingerprint || "",
    creator: "Xtin Capital",
  });
  doc.setTextColor(0, 0, 0);
  return doc;
}
