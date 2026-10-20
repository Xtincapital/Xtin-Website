// /api/v1 routes (mounted in app.ts). Every response gets an X-Request-Id and
// every error is problem+json; POSTs honour Idempotency-Key.
import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.js";
import { clientIp, limitRuns, limitWrites } from "../controller.js";
import { rateLimit } from "../rateLimit.js";
import {
    addStrategyVersionV1,
    compareBacktestsV1,
    createBacktestV1,
    createStrategyV1,
    deleteBacktestV1,
    deleteStrategyV1,
    getBacktestSeriesV1,
    getBacktestTradesV1,
    getBacktestV1,
    getCoverageV1,
    getStrategyV1,
    getStrategyVersionV1,
    getUsageV1,
    listBacktestsV1,
    listStrategiesV1,
    listTemplatesV1,
    searchInstrumentsV1,
    validateStrategyV1,
} from "./controller.js";
import { handle, idempotency, problem, problemShim, requestId } from "./http.js";
import { openApiDocument } from "./openapi.js";

const router = Router();
router.use(requestId, problemShim);

const limitValidate = rateLimit("v1-validate", [{ limit: 60, seconds: 60 }], "validating strategies", clientIp);
const limitReads = rateLimit("v1-reads", [{ limit: 120, seconds: 60 }], "loading backtests", clientIp);

// Public: discovery and validation (no compute, no data fetch).
router.get("/openapi.json", (_req, res) => res.set("Cache-Control", "public, max-age=3600").json(openApiDocument()));
router.get("/instruments", searchInstrumentsV1);
router.get("/instruments/:id/coverage", getCoverageV1);
router.post("/strategies/validate", limitValidate, idempotency, validateStrategyV1);
router.get("/strategies/templates", listTemplatesV1);

// Signed in.
router.get("/strategies", authenticate, limitReads, handle(listStrategiesV1));
router.post("/strategies", authenticate, limitWrites, idempotency, handle(createStrategyV1));
router.get("/strategies/:id", authenticate, limitReads, handle(getStrategyV1));
router.delete("/strategies/:id", authenticate, limitWrites, handle(deleteStrategyV1));
router.post("/strategies/:id/versions", authenticate, limitWrites, idempotency, handle(addStrategyVersionV1));
router.get("/strategies/:id/versions/:version", authenticate, limitReads, handle(getStrategyVersionV1));

router.get("/backtests", authenticate, limitReads, handle(listBacktestsV1));
router.post("/backtests", authenticate, limitRuns, idempotency, handle(createBacktestV1));
router.post("/backtests/compare", authenticate, limitReads, idempotency, handle(compareBacktestsV1));
router.get("/backtests/:id", authenticate, limitReads, handle(getBacktestV1));
router.delete("/backtests/:id", authenticate, limitWrites, handle(deleteBacktestV1));
router.get("/backtests/:id/trades", authenticate, limitReads, handle(getBacktestTradesV1));
router.get("/backtests/:id/series", authenticate, limitReads, handle(getBacktestSeriesV1));

router.get("/usage", authenticate, limitReads, handle(getUsageV1));

router.use((req, res) => problem(req, res, 404, "not_found", "No such endpoint", `${req.method} ${req.originalUrl} isn't part of /api/v1 — see /api/v1/openapi.json.`));

/**
 * Malformed JSON and anything else thrown outside a handler → problem+json.
 * Mounted at app level for /api/v1 too: the global body parser fails before
 * this router runs.
 */
export function v1ErrorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);
    if (!req.requestId) requestId(req, res, () => undefined);
    if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) return problem(req, res, 400, "malformed_json", "Malformed JSON", "The request body isn't valid JSON.");
    if (err?.type === "entity.too.large") return problem(req, res, 413, "too_large", "Request too large", "The request body is too large.");
    console.error(`[Backtest v1] unhandled (${req.requestId}):`, err);
    return problem(req, res, 500, "internal", "Something went wrong", "The error has been logged. Please try again.");
}
router.use(v1ErrorHandler);

export default router;
