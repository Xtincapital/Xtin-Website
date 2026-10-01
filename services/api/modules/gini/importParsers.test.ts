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
