// Excel export for the Company numbers page: a Summary sheet plus Yearly and
// Quarterly statements, in the same units the page shows (₹ crore for Indian
// companies, $ million otherwise).
import * as XLSX from "xlsx";
import type { FinancialPeriod } from "./stockDataService.js";

export interface ExcelCompany {
    ticker: string;
    name?: string | null;
    sector?: string | null;
    industry?: string | null;
    currency?: string | null;
    price?: number | string | null;
    market_cap?: number | string | null;
    pe_ratio?: number | string | null;
    pb_ratio?: number | string | null;
    roe?: number | string | null;
    debt_to_equity?: number | string | null;
    dividend_yield?: number | string | null;
}

export const isIndianTicker = (ticker: string, currency?: string | null) => /\.(NS|BO)$/i.test(ticker) || currency === "INR";

// funda_stocks returns some numerics (e.g. market_cap bigint) as strings.
const round = (v: number | string | null | undefined, digits = 2) => {
    const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    return typeof n === "number" && Number.isFinite(n) ? Number(n.toFixed(digits)) : null;
};

const ROWS: Array<{ label: string; money?: keyof FinancialPeriod; plain?: keyof FinancialPeriod; digits?: number }> = [
    { label: "Revenue", money: "revenue" },
    { label: "Revenue growth %", plain: "revenue_growth", digits: 1 },
    { label: "Gross profit", money: "gross_profit" },
    { label: "EBITDA", money: "ebitda" },
    { label: "Operating income", money: "operating_income" },
    { label: "Operating margin %", plain: "operating_margin", digits: 1 },
    { label: "Net profit", money: "net_income" },
    { label: "Profit growth %", plain: "net_income_growth", digits: 1 },
    { label: "Net margin %", plain: "net_margin", digits: 1 },
    { label: "EPS", plain: "eps" },
    { label: "Return on equity %", plain: "roe", digits: 1 },
    { label: "Total assets", money: "total_assets" },
    { label: "Total debt", money: "total_debt" },
    { label: "Shareholders' equity", money: "equity" },
    { label: "Cash", money: "cash" },
    { label: "Debt / equity", plain: "debt_to_equity" },
    { label: "Operating cash flow", money: "operating_cf" },
    { label: "Capital expenditure", money: "capex" },
    { label: "Free cash flow", money: "free_cf" },
];

function statementSheet(periods: FinancialPeriod[], inr: boolean, header: (date: string) => string) {
    const divisor = inr ? 1e7 : 1e6;
    const aoa: Array<Array<string | number | null>> = [["", ...periods.map((p) => header(p.date))]];
    for (const row of ROWS) {
        aoa.push([
            row.label,
            ...periods.map((p) => {
                if (row.money) {
                    const v = p[row.money] as number | null;
                    return typeof v === "number" ? round(v / divisor, 0) : null;
                }
                return round(p[row.plain as keyof FinancialPeriod] as number | null, row.digits ?? 2);
            }),
        ]);
    }
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    sheet["!cols"] = [{ wch: 26 }, ...periods.map(() => ({ wch: 14 }))];
    return sheet;
}

const yearHeader = (date: string) => `FY${String(new Date(date).getUTCFullYear()).slice(2)}`;
const quarterHeader = (date: string) => new Date(date).toISOString().slice(0, 7);

export function buildCompanyWorkbook(company: ExcelCompany, annual: FinancialPeriod[], quarterly: FinancialPeriod[]): Buffer {
    const inr = isIndianTicker(company.ticker, company.currency);
    const unit = inr ? "₹ crore" : "$ million";
    const wb = XLSX.utils.book_new();

    const summary: Array<Array<string | number | null>> = [
        ["Company", company.name || company.ticker],
        ["Ticker", company.ticker],
        ["Sector", company.sector || ""],
        ["Industry", company.industry || ""],
        ["Price", round(company.price)],
        ["Market cap (" + unit + ")", round(Number(company.market_cap) / (inr ? 1e7 : 1e6), 0)],
        ["P/E", round(company.pe_ratio)],
        ["P/B", round(company.pb_ratio)],
        ["ROE %", round(company.roe, 1)],
        ["Debt / equity", round(company.debt_to_equity)],
        ["Dividend yield %", round(company.dividend_yield)],
        [],
        ["Money figures are in " + unit + "; per-share values in the listing currency."],
        ["Source: Yahoo Finance. May differ slightly from the company's filings. Not investment advice."],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summary);
    summarySheet["!cols"] = [{ wch: 28 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    if (annual.length) XLSX.utils.book_append_sheet(wb, statementSheet(annual, inr, yearHeader), "Yearly");
    if (quarterly.length) XLSX.utils.book_append_sheet(wb, statementSheet(quarterly, inr, quarterHeader), "Quarterly");

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
