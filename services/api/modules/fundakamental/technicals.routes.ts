import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    getTechnicalIndicators,
    getIndicatorChart,
    getTradingSignals,
    getBulkTradingSignals,
    getMacdData,
    getBollingerBandsData,
} from "./technicals.controller.js";

const router = Router();

router.get("/fundakamental/stocks/:ticker/technicals", authenticate, getTechnicalIndicators);
router.get("/fundakamental/stocks/:ticker/indicator/:indicatorName", authenticate, getIndicatorChart);
router.get("/fundakamental/stocks/:ticker/signals", authenticate, getTradingSignals);
router.post("/fundakamental/stocks/bulk-signals", authenticate, getBulkTradingSignals);
router.get("/fundakamental/stocks/:ticker/macd", authenticate, getMacdData);
router.get("/fundakamental/stocks/:ticker/bollinger-bands", authenticate, getBollingerBandsData);

export default router;
