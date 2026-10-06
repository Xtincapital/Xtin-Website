import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { requireFundaPro } from "./proGate.js";
import {
    searchCompanies,
    runStockScreener,
    getStockDetails,
    refreshStockData,
    getScreeningPresets,
    saveCustomScreen,
    getSavedScreens,
    getMarketDataStatus,
    triggerStockRefresh,
} from "./stocks.controller.js";

const router = Router();

// All fundakamental stock routes require authentication (the Python
// source's screener endpoint had a `# TODO: Re-enable authentication`
// comment left in — this port applies it consistently instead).
router.get("/fundakamental/stocks/search", authenticate, searchCompanies);
router.post("/fundakamental/stocks/screener", authenticate, requireFundaPro, runStockScreener);
router.get("/fundakamental/stocks/screener/presets", authenticate, getScreeningPresets);
router.post("/fundakamental/stocks/screener/save", authenticate, requireFundaPro, saveCustomScreen);
router.get("/fundakamental/stocks/screener/saved", authenticate, getSavedScreens);
router.get("/fundakamental/stocks/details/:ticker", authenticate, getStockDetails);
router.post("/fundakamental/stocks/refresh", authenticate, refreshStockData);
router.get("/fundakamental/market-data/status", authenticate, getMarketDataStatus);
// Token-protected (CRON_SECRET_TOKEN), not user-authenticated: called by an external scheduler.
router.post("/trigger-stock-refresh", triggerStockRefresh);

export default router;
