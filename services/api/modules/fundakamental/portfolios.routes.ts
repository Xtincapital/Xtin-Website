import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    createPortfolio,
    getPortfolios,
    getPortfolio,
    updatePortfolio,
    deletePortfolio,
    addTransaction,
    getTransactions,
    deleteTransaction,
    getHoldings,
    addHolding,
    deleteHolding,
    getHolding,
    updateHoldingNotes,
    getPortfolioSummary,
    getPortfolioAnalytics,
    getPortfolioPerformance,
    getRealizedGains,
} from "./portfolios.controller.js";

const router = Router();

// All portfolio routes require authentication.
router.post("/fundakamental/portfolios", authenticate, createPortfolio);
router.get("/fundakamental/portfolios", authenticate, getPortfolios);
router.get("/fundakamental/portfolios/:portfolioId", authenticate, getPortfolio);
router.patch("/fundakamental/portfolios/:portfolioId", authenticate, updatePortfolio);
router.delete("/fundakamental/portfolios/:portfolioId", authenticate, deletePortfolio);

router.post("/fundakamental/portfolios/:portfolioId/transactions", authenticate, addTransaction);
router.get("/fundakamental/portfolios/:portfolioId/transactions", authenticate, getTransactions);
router.delete("/fundakamental/portfolios/:portfolioId/transactions/:transactionId", authenticate, deleteTransaction);

router.get("/fundakamental/portfolios/:portfolioId/holdings", authenticate, getHoldings);
router.post("/fundakamental/portfolios/:portfolioId/holdings", authenticate, addHolding);
router.get("/fundakamental/portfolios/:portfolioId/holdings/:ticker", authenticate, getHolding);
router.patch("/fundakamental/portfolios/:portfolioId/holdings/:ticker", authenticate, updateHoldingNotes);
router.delete("/fundakamental/portfolios/:portfolioId/holdings/:ticker", authenticate, deleteHolding);

router.get("/fundakamental/portfolios/:portfolioId/summary", authenticate, getPortfolioSummary);
router.get("/fundakamental/portfolios/:portfolioId/analytics", authenticate, getPortfolioAnalytics);
router.get("/fundakamental/portfolios/:portfolioId/performance", authenticate, getPortfolioPerformance);
router.get("/fundakamental/portfolios/:portfolioId/realized-gains", authenticate, getRealizedGains);

export default router;
