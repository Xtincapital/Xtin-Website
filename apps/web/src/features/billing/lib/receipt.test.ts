import { describe, expect, it } from "vitest";
import { COMPANY } from "@/constants/company";
import type { Receipt } from "./api";
import { formatMoney, formatMoneyPlain, formatReceiptDate } from "./format";
import { buildReceiptPdf, receiptFileName } from "./receiptPdf";

const receipt: Receipt = {
  receipt_no: "XTN/2026-27/00042",
  order_id: "order_Abc123XyZ",
  payment_id: "pay_Qwe456RtY",
  description: "Gini Pro — Yearly",
  buyer_email: "member@example.com",
  amount: 399900,
  currency: "INR",
  status: "paid",
  paid_at: "2026-10-07T18:45:00.000Z",
};

describe("receipt formatting", () => {
  it("formats smallest-unit amounts in the charged currency", () => {
    expect(formatMoney(399900, "INR")).toBe("₹3,999.00");
    expect(formatMoney(900, "USD")).toBe("$9.00");
    expect(formatMoneyPlain(399900, "INR")).toBe("INR 3,999.00");
  });

  it("shows dates in IST, whatever the viewer's timezone", () => {
    // 18:45 UTC is already the next day in India.
    expect(formatReceiptDate(receipt.paid_at)).toBe("08 Oct 2026");
  });
});

describe("receipt PDF", () => {
  it("carries the seller's legal details and the full payment record", () => {
    const raw = buildReceiptPdf(receipt).output();
    for (const text of [COMPANY.legalName, `GSTIN: ${COMPANY.gstin}`, "XTN/2026-27/00042", "pay_Qwe456RtY", "order_Abc123XyZ", "member@example.com", "INR 3,999.00", "Inclusive of applicable taxes"]) {
      expect(raw).toContain(text);
    }
    expect(raw).not.toContain("REFUNDED");
  });

  it("stamps refunded receipts", () => {
    expect(buildReceiptPdf({ ...receipt, status: "refunded" }).output()).toContain("REFUNDED");
  });

  it("uses a filesystem-safe file name", () => {
    expect(receiptFileName(receipt)).toBe("Xtin-Receipt-XTN-2026-27-00042.pdf");
  });
});
