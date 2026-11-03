import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";

const repo = vi.hoisted(() => ({
    getSavedFinancials: vi.fn(),
    saveFinancials: vi.fn(),
    getStockByTicker: vi.fn(),
}));
const data = vi.hoisted(() => ({
    getCompanyFinancials: vi.fn(),
    getCompanyOverview: vi.fn(),
}));

vi.mock("./stocks.repository.js", () => ({
    ...repo,
    upsertStock: vi.fn(),
    searchStocksInDb: vi.fn(),
    queryStocksForScreener: vi.fn(),
    countActiveStocks: vi.fn(),
    getSavedScreens: vi.fn(),
    insertSavedScreen: vi.fn(),
    getScreeningCache: vi.fn(),
    upsertScreeningCache: vi.fn(),
    listActiveStocks: vi.fn(),
    updateStockPrice: vi.fn(),
    getNewestStockUpdate: vi.fn(),
}));
vi.mock("./stockDataService.js", async (orig) => ({ ...(await orig<typeof import("./stockDataService.js")>()), ...data, searchCompanies: vi.fn() }));
vi.mock("../../supabase/index.js", () => ({ default: {} }));

import { loadCompanyFinancials, getStockFinancials, downloadStockFinancialsExcel } from "./stocks.controller.js";
import { toPeriods } from "./stockDataService.js";
import { buildCompanyWorkbook } from "./companyExcel.js";

const period = (date: string, revenue: number, netIncome: number) => ({
    date,
    revenue,
    gross_profit: null,
    operating_income: null,
    ebitda: null,
    net_income: netIncome,
    eps: 10,
    total_assets: null,
    total_debt: null,
    equity: null,
    cash: null,
    operating_cf: null,
    capex: null,
    free_cf: null,
    revenue_growth: 5,
    net_income_growth: null,
    gross_margin: null,
    operating_margin: null,
    net_margin: null,
    roe: null,
    debt_to_equity: null,
});

const mockRes = () => {
    const res: any = { statusCode: 200, headers: {} as Record<string, string> };
    res.status = (c: number) => ((res.statusCode = c), res);
    res.json = (b: unknown) => ((res.body = b), res);
    res.send = (b: unknown) => ((res.body = b), res);
    res.setHeader = (k: string, v: string) => ((res.headers[k] = v), res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
    repo.getSavedFinancials.mockResolvedValue({ data: null });
    repo.saveFinancials.mockResolvedValue({ error: null });
    repo.getStockByTicker.mockResolvedValue({ data: null });
    data.getCompanyOverview.mockResolvedValue({ name: "Acme", price: 100, currency: "INR" });
});

describe("toPeriods", () => {
    it("derives margins, growth by date and drops nothing it can't compute", () => {
        const rows = [
            { date: "2024-03-31", totalRevenue: 100, netIncome: 10, stockholdersEquity: 50, totalDebt: 25, operatingIncome: 20, grossProfit: 40 },
            { date: "2025-03-31", totalRevenue: 120, netIncome: 15, stockholdersEquity: 60, totalDebt: 30, operatingIncome: 30, grossProfit: 50 },
        ];
        const [a, b] = toPeriods(rows, true);
        expect(a.revenue_growth).toBeNull();
        expect(b.revenue_growth).toBeCloseTo(20);
        expect(b.net_income_growth).toBeCloseTo(50);
        expect(b.net_margin).toBeCloseTo(12.5);
        expect(b.operating_margin).toBeCloseTo(25);
        expect(b.roe).toBeCloseTo(25);
        expect(b.debt_to_equity).toBeCloseTo(0.5);
    });

    it("computes free cash flow when Yahoo omits it, and skips ROE for quarters", () => {
        const [q] = toPeriods([{ date: "2025-06-30", totalRevenue: 10, netIncome: 1, stockholdersEquity: 5, operatingCashFlow: 9, capitalExpenditure: -4 }], false);
        expect(q.free_cf).toBe(5);
        expect(q.roe).toBeNull();
    });

    it("matches the prior year by date even when a quarter is missing", () => {
        const rows = [
            { date: "2025-06-30", totalRevenue: 100, netIncome: 1 },
            { date: "2025-12-31", totalRevenue: 130, netIncome: 1 },
            { date: "2026-06-30", totalRevenue: 150, netIncome: 1 },
        ];
        const out = toPeriods(rows, false);
        expect(out[1].revenue_growth).toBeNull();
        expect(out[2].revenue_growth).toBeCloseTo(50);
    });
});

describe("loadCompanyFinancials", () => {
    it("serves a saved copy under a day old without calling Yahoo", async () => {
        repo.getSavedFinancials.mockResolvedValue({
            data: { annual: [period("2025-03-31", 100, 10)], quarterly: [], fetched_at: new Date().toISOString() },
        });
        const out = await loadCompanyFinancials("ACME.NS");
        expect(out.annual).toHaveLength(1);
        expect(out.stale).toBe(false);
        expect(data.getCompanyFinancials).not.toHaveBeenCalled();
    });

    it("fetches from Yahoo and saves when nothing is saved", async () => {
        data.getCompanyFinancials.mockResolvedValue({ ticker: "ACME.NS", annual: [period("2025-03-31", 100, 10)], quarterly: [] });
        const out = await loadCompanyFinancials("ACME.NS");
        expect(out.annual).toHaveLength(1);
        expect(repo.saveFinancials).toHaveBeenCalledWith("ACME.NS", expect.any(Array), []);
    });

    it("falls back to an older saved copy, marked stale, when Yahoo is down", async () => {
        repo.getSavedFinancials.mockResolvedValue({
            data: { annual: [period("2025-03-31", 100, 10)], quarterly: [], fetched_at: new Date(Date.now() - 3 * 86400_000).toISOString() },
        });
        data.getCompanyFinancials.mockResolvedValue(null);
        const out = await loadCompanyFinancials("ACME.NS");
        expect(out.annual).toHaveLength(1);
        expect(out.stale).toBe(true);
    });

    it("still works before migration 0021 exists (saved lookup throws)", async () => {
        repo.getSavedFinancials.mockRejectedValue(new Error("relation does not exist"));
        data.getCompanyFinancials.mockResolvedValue({ ticker: "ACME.NS", annual: [period("2025-03-31", 100, 10)], quarterly: [] });
        const out = await loadCompanyFinancials("ACME.NS");
        expect(out.annual).toHaveLength(1);
    });
});

describe("getStockFinancials / excel handlers", () => {
    it("rejects a bad ticker", async () => {
        const res = mockRes();
        await getStockFinancials({ params: { ticker: "bad ticker!" } }, res);
        expect(res.statusCode).toBe(400);
    });

    it("404s when there is no snapshot and no statements", async () => {
        data.getCompanyOverview.mockResolvedValue(null);
        data.getCompanyFinancials.mockResolvedValue(null);
        const res = mockRes();
        await getStockFinancials({ params: { ticker: "NOPE" } }, res);
        expect(res.statusCode).toBe(404);
    });

    it("returns statements_available=false with a snapshot only", async () => {
        data.getCompanyFinancials.mockResolvedValue(null);
        const res = mockRes();
        await getStockFinancials({ params: { ticker: "ACME.NS" } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.statements_available).toBe(false);
    });

    it("sends an xlsx with the right headers", async () => {
        data.getCompanyFinancials.mockResolvedValue({ ticker: "ACME.NS", annual: [period("2025-03-31", 1e10, 1e9)], quarterly: [] });
        const res = mockRes();
        await downloadStockFinancialsExcel({ params: { ticker: "acme.ns" } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.headers["Content-Disposition"]).toContain("ACME.NS-financials.xlsx");
        expect(Buffer.isBuffer(res.body)).toBe(true);
    });
});

describe("buildCompanyWorkbook", () => {
    it("writes crore for Indian tickers and handles string numerics", () => {
        const buf = buildCompanyWorkbook({ ticker: "ACME.NS", name: "Acme", market_cap: "50000000000" as any }, [period("2025-03-31", 1e10, 1e9)], [period("2025-06-30", 2e9, 2e8)]);
        const wb = XLSX.read(buf);
        expect(wb.SheetNames).toEqual(["Summary", "Yearly", "Quarterly"]);
        const yearly = XLSX.utils.sheet_to_json<any[]>(wb.Sheets.Yearly, { header: 1 });
        expect(yearly[0]).toEqual(["", "FY25"]);
        expect(yearly[1]).toEqual(["Revenue", 1000]); // 1e10 rupees = 1000 crore
        const summary = XLSX.utils.sheet_to_json<any[]>(wb.Sheets.Summary, { header: 1 });
        expect(summary.find((r) => String(r[0]).startsWith("Market cap"))?.[1]).toBe(5000);
    });

    it("uses $ million for US tickers and skips empty sheets", () => {
        const buf = buildCompanyWorkbook({ ticker: "AAPL" }, [period("2025-09-30", 4e11, 1e11)], []);
        const wb = XLSX.read(buf);
        expect(wb.SheetNames).toEqual(["Summary", "Yearly"]);
        const yearly = XLSX.utils.sheet_to_json<any[]>(wb.Sheets.Yearly, { header: 1 });
        expect(yearly[1][1]).toBe(400000);
    });
});
