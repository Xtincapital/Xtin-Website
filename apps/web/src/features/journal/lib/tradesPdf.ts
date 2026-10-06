// "Export PDF" on the Trades page: a printable table of every trade with a
// summary line. Built with jsPDF's own text calls (not a screenshot of the page),
// so the file stays small, the text can be selected and searched, and it runs
// to as many pages as there are trades.
import type { jsPDF as JsPDF } from "jspdf";
import type { Trade } from "./api";
import { marketLabel } from "./journalPatternHelpers";

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

/** Builds the document; the caller saves it. Kept separate from saving so it can be tested. */
export function buildTradesPdf(JsPDFCtor: typeof JsPDF, trades: PdfTrade[], generatedOn = new Date()): JsPDF {
  const doc = new JsPDFCtor({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 12;
  const rowHeight = 6.5;
  const s = tradeSummary(trades);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Xtin Journal - Trades", left, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated ${generatedOn.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`, pageWidth - left, 16, { align: "right" });
  doc.setFontSize(10);
  doc.text(
    `${s.trades} trades (${s.closed} closed, ${s.open} open)   Wins ${s.wins} / Losses ${s.losses}   Win rate ${s.winRate.toFixed(1)}%   Total P&L ${amount(s.totalPnl)}`,
    left,
    23,
  );

  const drawHeader = (y: number) => {
    doc.setFillColor(238, 242, 239);
    doc.rect(left, y - 4.5, pageWidth - left * 2, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    let x = left + 1.5;
    for (const c of COLUMNS) {
      doc.text(c.label, c.align === "right" ? x + c.width - 2 : x, y, c.align === "right" ? { align: "right" } : undefined);
      x += c.width;
    }
    doc.setFont("helvetica", "normal");
    return y + rowHeight;
  };

  let y = drawHeader(32);
  for (const t of trades) {
    if (y > pageHeight - 14) {
      doc.addPage();
      y = drawHeader(16);
    }
    let x = left + 1.5;
    for (const c of COLUMNS) {
      let text = c.value(t);
      // Clip text that would run into the next column.
      while (text.length > 1 && doc.getTextWidth(text) > c.width - 3) text = text.slice(0, -3) + "..";
      if (c.label === "P&L" && t.pnl != null) doc.setTextColor(t.pnl < 0 ? 180 : 20, t.pnl < 0 ? 40 : 120, t.pnl < 0 ? 40 : 60);
      doc.text(text, c.align === "right" ? x + c.width - 2 : x, y, c.align === "right" ? { align: "right" } : undefined);
      doc.setTextColor(20, 20, 20);
      x += c.width;
    }
    doc.setDrawColor(225, 230, 226);
    doc.line(left, y + 2, pageWidth - left, y + 2);
    y += rowHeight;
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${p} of ${pages}`, pageWidth - left, pageHeight - 6, { align: "right" });
    doc.setTextColor(20, 20, 20);
  }
  return doc;
}
