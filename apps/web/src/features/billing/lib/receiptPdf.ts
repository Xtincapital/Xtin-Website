// Downloadable payment receipt (A4), drawn in the browser from a receipt row —
// same approach as the certificate and trades PDFs. Seller details come from
// constants/company.ts so they always match the site footer and Razorpay KYC.
import { jsPDF } from "jspdf";
import { COMPANY } from "@/constants/company";
import { isFreeGrant, type Receipt } from "./api";
import { formatMoneyPlain, formatReceiptDate } from "./format";

const INK: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [226, 232, 240];
const GREEN: [number, number, number] = [22, 163, 74];

export const receiptFileName = (receipt: Receipt) => `Xtin-Receipt-${receipt.receipt_no.replace(/[^A-Za-z0-9-]+/g, "-")}.pdf`;

export function buildReceiptPdf(receipt: Receipt): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 56;
  const right = W - M;
  let y = 0;

  // Header band
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 96, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 92, W, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("XTIN CAPITAL", M, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("PAYMENT RECEIPT", right, 46, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(receipt.receipt_no, right, 62, { align: "right" });

  // Seller
  y = 136;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(COMPANY.legalName, M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const address = doc.splitTextToSize(COMPANY.registeredAddress || COMPANY.city, 260);
  doc.text(address, M, (y += 15));
  y += address.length * 12;
  doc.text(`GSTIN: ${COMPANY.gstin}`, M, y);
  doc.text(`LLP ID: ${COMPANY.llpId}`, M, (y += 12));
  doc.text(COMPANY.supportEmail, M, (y += 12));

  // Receipt meta (right column)
  const meta: Array<[string, string]> = [
    ["Receipt no.", receipt.receipt_no],
    ["Date", formatReceiptDate(receipt.paid_at, true)],
    [isFreeGrant(receipt) ? "Reference" : "Payment ID", receipt.payment_id],
    ["Order ID", receipt.order_id],
    ["Payment method", isFreeGrant(receipt) ? "Coupon (no payment)" : "Razorpay"],
  ];
  let my = 136;
  for (const [label, value] of meta) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label, right - 170, my);
    doc.setTextColor(...INK);
    doc.text(value, right, my, { align: "right" });
    my += 15;
  }

  // Billed to
  y = Math.max(y, my) + 28;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, y, right, y);
  y += 24;
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("BILLED TO", M, y);
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(receipt.buyer_email || "Xtin Capital member", M, (y += 15));

  // Line item table
  y += 32;
  doc.setFillColor(248, 250, 252);
  doc.rect(M, y - 14, right - M, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("DESCRIPTION", M + 10, y + 2);
  doc.text("AMOUNT", right - 10, y + 2, { align: "right" });

  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  const item = doc.splitTextToSize(receipt.description, right - M - 150);
  doc.text(item, M + 10, y);
  doc.text(formatMoneyPlain(receipt.amount, receipt.currency), right - 10, y, { align: "right" });
  y += item.length * 13 + 12;
  doc.line(M, y, right, y);

  // Total
  y += 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total paid", right - 200, y);
  doc.text(formatMoneyPlain(receipt.amount, receipt.currency), right - 10, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Inclusive of applicable taxes (GST).", right - 10, (y += 15), { align: "right" });

  if (receipt.status === "refunded") {
    doc.setTextColor(220, 38, 38);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(2);
    doc.roundedRect(M, y - 34, 120, 32, 4, 4, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("REFUNDED", M + 60, y - 13, { align: "center" });
    doc.setFont("helvetica", "normal");
  }

  // Footer
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, H - 92, right, H - 92);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Thank you for your purchase.", M, H - 72);
  doc.text("This is a computer-generated receipt and does not require a signature.", M, H - 59);
  doc.text(`Questions? ${COMPANY.supportEmail} · ${COMPANY.phone}`, M, H - 46);

  doc.setProperties({ title: `Receipt ${receipt.receipt_no}`, author: COMPANY.legalName, subject: receipt.description });
  return doc;
}

export function downloadReceiptPdf(receipt: Receipt) {
  buildReceiptPdf(receipt).save(receiptFileName(receipt));
}
