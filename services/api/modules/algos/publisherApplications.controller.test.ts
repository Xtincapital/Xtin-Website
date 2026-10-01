import { describe, it, expect, vi, beforeEach } from "vitest";

const repo = vi.hoisted(() => ({
    insertApplication: vi.fn(),
    getApplicationsByUser: vi.fn(),
    getAllApplications: vi.fn(),
    updateApplicationStatus: vi.fn(),
    updateOwnPendingApplication: vi.fn(),
    getApplicationById: vi.fn(),
}));
vi.mock("./publisherApplications.repository.js", () => repo);

import { updateMyApplication } from "./publisherApplications.controller.js";

const body = {
    applicant_name: "Asha",
    applicant_email: "asha@example.com",
    algo_name: "Gold Breakout",
    strategy_type: "breakout",
    asset_class: "commodities",
    expected_price: 4999,
    backtest_summary: "CAGR 20%, max drawdown 10%",
    description: "Breakout strategy on gold",
    experience: "3-5",
};

const run = async (reqBody: unknown) => {
    const res: any = { statusCode: 0, body: null, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; } };
    await updateMyApplication({ body: reqBody, params: { id: "app-1" }, user: { authId: "user-1" } }, res);
    return res;
};

beforeEach(() => vi.clearAllMocks());

describe("updateMyApplication", () => {
    it("saves edits while the application is still pending", async () => {
        repo.getApplicationById.mockResolvedValue({ data: [{ id: "app-1", status: "pending" }], error: null });
        repo.updateOwnPendingApplication.mockResolvedValue({ data: [{ id: "app-1", ...body }], error: null });
        const res = await run(body);
        expect(res.statusCode).toBe(200);
        expect(repo.updateOwnPendingApplication).toHaveBeenCalledWith("app-1", "user-1", expect.objectContaining({ algo_name: "Gold Breakout" }));
    });

    it("refuses once the application is under review", async () => {
        repo.getApplicationById.mockResolvedValue({ data: [{ id: "app-1", status: "under_review" }], error: null });
        const res = await run(body);
        expect(res.statusCode).toBe(403);
        expect(repo.updateOwnPendingApplication).not.toHaveBeenCalled();
    });

    it("refuses if it was reviewed between the check and the save", async () => {
        repo.getApplicationById.mockResolvedValue({ data: [{ id: "app-1", status: "pending" }], error: null });
        repo.updateOwnPendingApplication.mockResolvedValue({ data: [], error: null });
        expect((await run(body)).statusCode).toBe(403);
    });

    it("404s for someone else's or a missing application", async () => {
        repo.getApplicationById.mockResolvedValue({ data: [], error: null });
        expect((await run(body)).statusCode).toBe(404);
    });

    it("rejects invalid input", async () => {
        const res = await run({ ...body, expected_price: 5 });
        expect(res.statusCode).toBe(400);
        expect(repo.getApplicationById).not.toHaveBeenCalled();
    });
});
