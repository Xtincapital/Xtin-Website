import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createTrade, listTrades, getTrade, updateTrade, deleteTrade, clearTrades } from "./trades.controller.js";

const router = Router();

// All trade routes require authentication.
router.post("/journal/trades", authenticate, createTrade);
router.get("/journal/trades", authenticate, listTrades);
router.delete("/journal/trades", authenticate, clearTrades);
router.get("/journal/trades/:tradeId", authenticate, getTrade);
router.patch("/journal/trades/:tradeId", authenticate, updateTrade);
router.delete("/journal/trades/:tradeId", authenticate, deleteTrade);

export default router;
