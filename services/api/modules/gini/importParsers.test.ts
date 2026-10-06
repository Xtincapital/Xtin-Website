import { describe, it, expect } from "vitest";
import { parseGiniImport } from "./importParsers.js";

const csv = (s: string) => Buffer.from(s);

describe("parseGiniImport", () => {
    it("parses assets, maps categories and strips thousands separators", () => {
        const rows = parseGiniImport(csv('Name,Category,Value,Return Rate\nHDFC Flexi,Mutual Funds,"2,50,000",12\nFlat,Real Estate,6500000,8\nbad,,,\n'), "csv", "assets");
        expect(rows).toEqual([
            { name: "HDFC Flexi", category: "Mutual Funds", value: 250000, return_rate: 12 },
            { name: "Flat", category: "Real Estate", value: 6500000, return_rate: 8 },
        ]);
    });

    it("parses liabilities and does not mistake a credit card for a car loan", () => {
        const rows = parseGiniImport(csv("Loan,Type,Outstanding,Interest Rate,EMI,Tenure\nSBI Home,Home Loan,3200000,8.5,32000,180\nCard,Credit Card,45000,36,,\n"), "csv", "liabilities");
        expect(rows[0]).toMatchObject({ type: "Home Loan", amount: 3200000, emi: 32000, tenure: 180 });
        expect(rows[1]).toMatchObject({ type: "Credit Card", amount: 45000, emi: null, tenure: null });
    });

    it("tolerates a BOM and rejects files without the needed columns", () => {
        expect(parseGiniImport(csv("﻿Name,Value\nA,100\n"), "csv", "assets")).toHaveLength(1);
        expect(() => parseGiniImport(csv("x,y\n1,2"), "csv", "assets")).toThrow(/Name/);
    });
});

import { pdfLineToHolding, pdfLinesToHoldings, parseGiniPdfImport } from "./importParsers.js";

describe("Gini PDF import", () => {
    it("reads a holding line: name, value, % rate and a category guess", () => {
        expect(pdfLineToHolding("HDFC Flexi Cap Fund ₹2,50,000 12%", "assets")).toEqual({
            name: "HDFC Flexi Cap Fund", category: "Mutual Funds", value: 250000, return_rate: 12,
        });
        expect(pdfLineToHolding("Nifty 50 Index Fund 1,20,000.50", "assets")).toMatchObject({ name: "Nifty 50 Index Fund", value: 120000.5, return_rate: null });
    });

    it("reads a loan line: largest amount is the balance, the smaller one the EMI", () => {
        expect(pdfLineToHolding("SBI Home Loan 32,00,000 8.5% 32,000", "liabilities")).toEqual({
            name: "SBI Home Loan", type: "Home Loan", amount: 3200000, rate: 8.5, emi: 32000, tenure: null,
        });
    });

    it("skips headers, totals and prose, and counts lines with amounts it couldn't use", () => {
        const stats = { skipped: 0 };
        const rows = pdfLinesToHoldings(
            ["Portfolio Summary as on 06/10/2026", "Scheme Name Value Return", "Axis Bluechip Fund 75,000 11%", "Total 75,000", "Thank you for investing with us", "12,345 67,890"],
            "assets",
            stats,
        );
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({ name: "Axis Bluechip Fund", value: 75000 });
        expect(stats.skipped).toBe(1);
    });

    it("reads a real PDF end to end", async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        ["My Holdings Statement", "SBI Fixed Deposit 5,00,000 7%", "Gold ETF 80,000", "Total 5,80,000"].forEach((l, i) => doc.text(l, 10, 20 + i * 10));
        const rows = await parseGiniPdfImport(Buffer.from(doc.output("arraybuffer")), "assets");
        expect(rows).toEqual([
            { name: "SBI Fixed Deposit", category: "Fixed Deposits", value: 500000, return_rate: 7 },
            { name: "Gold ETF", category: "Gold", value: 80000, return_rate: null },
        ]);
    });
});

describe("Gini PDF table import", () => {
    it("reads a statement with a header row column by column", async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.setFontSize(10);
        doc.text("Holdings as on 06/10/2026", 10, 15);
        [["Scheme Name", "Category", "Current Value", "Return"], ["Parag Parikh Flexi Cap", "Mutual Funds", "3,00,000", "14"], ["SBI FD", "Fixed Deposits", "1,00,000", "7"]].forEach((cells, r) =>
            cells.forEach((c, i) => doc.text(c, 10 + i * 50, 30 + r * 10)),
        );
        const rows = await parseGiniPdfImport(Buffer.from(doc.output("arraybuffer")), "assets");
        expect(rows).toEqual([
            { name: "Parag Parikh Flexi Cap", category: "Mutual Funds", value: 300000, return_rate: 14 },
            { name: "SBI FD", category: "Fixed Deposits", value: 100000, return_rate: 7 },
        ]);
    });
});
