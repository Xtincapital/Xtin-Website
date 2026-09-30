// startAnalysis replies "processing" before the slow AI step and finishes in
// the background (Cloudflare cuts requests at 100 s in front of Render). These
// tests pin that contract: quick checks still fail synchronously, success and
// failure after the reply are recorded on the report, and the response is
// never sent twice.
import { describe, it, expect, vi, beforeEach } from "vitest";

const repo = {
    getSourceDocumentById: vi.fn(),
    downloadDocumentFromStorage: vi.fn(),
    insertReport: vi.fn(),
    updateReportStatus: vi.fn(),
    updateReport: vi.fn(),
    getReportById: vi.fn(),
    getUserProfile: vi.fn(),
    setReportsUsed: vi.fn(),
};
vi.mock("./analysis.repository.js", () => repo);

const ai = { analyzeFinancialDocument: vi.fn(), isAiAvailable: vi.fn(() => true) };
vi.mock("./aiAnalyzer.js", () => ai);

const wallet = { hasTokens: vi.fn(async () => true), deduct: vi.fn(async () => ({ balance: 20_000 })) };
vi.mock("./tokenWallet.js", () => wallet);

vi.mock("./fileProcessor.js", () => ({
    validateFile: vi.fn(),
    uploadToStorage: vi.fn(),
    saveDocumentRecord: vi.fn(),
    processFile: vi.fn(async () => ({ success: true, extracted_text: "Revenue | 100 | 120" })),
}));
vi.mock("./chunking.js", () => ({ chunkText: vi.fn() }));
vi.mock("./embeddings.js", () => ({ embedTexts: vi.fn(), toPgVector: vi.fn() }));
vi.mock("./chat.repository.js", () => ({ insertDocumentChunks: vi.fn() }));

const { startAnalysis } = await import("./analysis.controller.js");

function makeRes() {
    const res: any = { sent: [] as { status: number; body: any }[] };
    res.status = vi.fn((code: number) => {
        res._code = code;
        return res;
    });
    res.json = vi.fn((body: any) => {
        res.sent.push({ status: res._code ?? 200, body });
        return res;
    });
    return res;
}

const req = (body: Record<string, unknown>) => ({ body, user: { authId: "user-1" } }) as any;
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("startAnalysis", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        repo.getSourceDocumentById.mockResolvedValue({ data: { storage_path: "p", file_name: "f.xlsx" }, error: null });
        repo.downloadDocumentFromStorage.mockResolvedValue({ data: new Blob(["x"]), error: null });
        repo.insertReport.mockResolvedValue({ error: null });
        repo.updateReportStatus.mockResolvedValue({ error: null });
        repo.updateReport.mockResolvedValue({ error: null });
        repo.getUserProfile.mockResolvedValue({ data: { plan: "free", reports_used: 0 }, error: null });
        repo.setReportsUsed.mockResolvedValue({ error: null });
        ai.isAiAvailable.mockReturnValue(true);
        wallet.hasTokens.mockResolvedValue(true);
    });

    it("accepts a blank company_ticker (uploads without a picked company)", async () => {
        ai.analyzeFinancialDocument.mockResolvedValue({ success: true, company: "Demo", overall_score: 7 });
        const res = makeRes();
        await startAnalysis(req({ file_id: "doc-1", company_name: "Demo", company_ticker: "" }), res);
        expect(res.sent[0].status).toBe(202);
    });

    it("replies 202 before the AI step, then saves the completed report", async () => {
        let finishAi!: (v: unknown) => void;
        ai.analyzeFinancialDocument.mockReturnValue(new Promise((r) => (finishAi = r)));
        const res = makeRes();
        const run = startAnalysis(req({ file_id: "doc-1", company_name: "Demo" }), res);
        await flush();
        await flush();

        expect(res.sent).toHaveLength(1);
        expect(res.sent[0]).toMatchObject({ status: 202, body: { status: "processing" } });
        expect(repo.updateReport).not.toHaveBeenCalled();

        finishAi({ success: true, company: "Demo", overall_score: 7 });
        await run;
        expect(repo.updateReport).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: "completed" }));
        expect(res.sent).toHaveLength(1); // never replies twice
    });

    it("records an AI failure on the report without sending a second response", async () => {
        ai.analyzeFinancialDocument.mockResolvedValue({ success: false, error: "model overloaded" });
        const res = makeRes();
        await startAnalysis(req({ file_id: "doc-1", company_name: "Demo" }), res);

        expect(res.sent).toHaveLength(1);
        expect(res.sent[0].status).toBe(202);
        expect(repo.updateReportStatus).toHaveBeenCalledWith(expect.any(String), "failed", { error: "model overloaded" });
    });

    it("still rejects synchronously when the user is out of AI tokens", async () => {
        wallet.hasTokens.mockResolvedValue(false);
        const res = makeRes();
        await startAnalysis(req({ file_id: "doc-1", company_name: "Demo" }), res);

        expect(res.sent).toEqual([{ status: 402, body: { error: expect.stringMatching(/out of AI tokens/) } }]);
        expect(ai.analyzeFinancialDocument).not.toHaveBeenCalled();
    });
});
