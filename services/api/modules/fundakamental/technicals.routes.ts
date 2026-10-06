import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { requireFundaPro } from "./proGate.js";
import {
    getTechnicalIndicators,
    getIndicatorChart,
    getTradingSignals,
    getBulkTradingSignals,
    getMacdData,
    getBollingerBandsData,
} from "./technicals.controller.js";

const router = Router();


router.get("/fundakamental/stocks/:ticker/technicals", authenticate, requireFundaPro, getTechnicalIndicators);
router.get("/fundakamental/stocks/:ticker/indicator/:indicatorName", authenticate, requireFundaPro, getIndicatorChart);
router.get("/fundakamental/stocks/:ticker/signals", authenticate, requireFundaPro, getTradingSignals);
router.post("/fundakamental/stocks/bulk-signals", authenticate, requireFundaPro, getBulkTradingSignals);
router.get("/fundakamental/stocks/:ticker/macd", authenticate, requireFundaPro, getMacdData);
router.get("/fundakamental/stocks/:ticker/bollinger-bands", authenticate, requireFundaPro, getBollingerBandsData);

export default router;
