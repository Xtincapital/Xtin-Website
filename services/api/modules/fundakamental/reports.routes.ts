import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    getReportsList,
    getReport,
    deleteReport,
    exportReportPdf,
    exportReportPdfByTicker,
    exportAnalysisPdfFromBody,
    exportScreeningPdf,
    exportTechnicalPdf,
    getExportInfo,
    getExportHealth,
} from "./reports.controller.js";

const router = Router();

// Reports CRUD — port of api/endpoints/reports.py.
router.get("/fundakamental/reports", authenticate, getReportsList);
router.get("/fundakamental/reports/:reportId", authenticate, getReport);
router.delete("/fundakamental/reports/:reportId", authenticate, deleteReport);

// PDF export — port of api/endpoints/pdf_export.py. Static-segment routes
// declared before the dynamic `:reportId` ones for clarity (Express doesn't
// actually need the ordering here since path depths differ, but it matches
// the rest of this module's routing convention).
router.get("/fundakamental/reports/export/info", authenticate, getExportInfo);
router.get("/fundakamental/reports/export/health", getExportHealth); // unauthenticated diagnostic, matches the Python source
router.post("/fundakamental/reports/export/analysis", authenticate, exportAnalysisPdfFromBody);
router.post("/fundakamental/reports/export/screening", authenticate, exportScreeningPdf);
router.post("/fundakamental/reports/export/technical", authenticate, exportTechnicalPdf);
router.get("/fundakamental/reports/ticker/:ticker/pdf", authenticate, exportReportPdfByTicker);

router.get("/fundakamental/reports/:reportId/pdf", authenticate, exportReportPdf);

export default router;
