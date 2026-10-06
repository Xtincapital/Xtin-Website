import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { getUserPlan } from "./razorpay.repository.js";
import {
    getTechnicalIndicators,
    getIndicatorChart,
    getTradingSignals,
    getBulkTradingSignals,
    getMacdData,
    getBollingerBandsData,
} from "./technicals.controller.js";

const router = Router();

// Technical indicators are a Pro feature (direct or via a bundle).
const requireFundaPro = async (req, res, next) => {
    try {
        const { data } = await getUserPlan(req.user.authId);
        const pro = data?.plan === "premium" || data?.plan === "enterprise";
        const current = !data?.plan_valid_until || new Date(data.plan_valid_until).getTime() > Date.now();
        if (pro && current) return next();
    } catch (err) {
        console.error("[Fundakamental] plan check failed:", (err as Error)?.message || err);
    }
    return res.status(403).json({ error: "Technical indicators are part of Fundakamental Pro.", code: "PRO_REQUIRED" });
};

router.get("/fundakamental/stocks/:ticker/technicals", authenticate, requireFundaPro, getTechnicalIndicators);
router.get("/fundakamental/stocks/:ticker/indicator/:indicatorName", authenticate, requireFundaPro, getIndicatorChart);
router.get("/fundakamental/stocks/:ticker/signals", authenticate, requireFundaPro, getTradingSignals);
router.post("/fundakamental/stocks/bulk-signals", authenticate, requireFundaPro, getBulkTradingSignals);
router.get("/fundakamental/stocks/:ticker/macd", authenticate, requireFundaPro, getMacdData);
router.get("/fundakamental/stocks/:ticker/bollinger-bands", authenticate, requireFundaPro, getBollingerBandsData);

export default router;
