// Backtest routes, mounted under /api (see app.ts).
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
    chatBacktest,
    chatBurstLimit,
    createRun,
    createStrategy,
    deleteMyRun,
    deleteMyStrategy,
    getMyRun,
    getMyStrategy,
    getPlan,
    listMyRuns,
    listMyStrategies,
    updateMyStrategy,
} from "./controller.js";
import { createPassOrder, listPasses, verifyPassPurchase } from "./passes.controller.js";

const router = Router();

/** Attach `req.user` when a token is sent, but let anonymous visitors through. */
const optionalAuthenticate = (req, res, next) => (req.headers.authorization ? authenticate(req, res, next) : next());

// Public / optional-auth: the playground and plan summary.
router.post("/backtest/chat", optionalAuthenticate, chatBurstLimit, chatBacktest);
router.get("/backtest/plan", optionalAuthenticate, getPlan);
router.get("/backtest/passes", listPasses);

// Authenticated: saved strategies, run history, pass purchase.
router.get("/backtest/strategies", authenticate, listMyStrategies);
router.post("/backtest/strategies", authenticate, createStrategy);
router.get("/backtest/strategies/:id", authenticate, getMyStrategy);
router.put("/backtest/strategies/:id", authenticate, updateMyStrategy);
router.delete("/backtest/strategies/:id", authenticate, deleteMyStrategy);

router.post("/backtest/runs", authenticate, createRun);
router.get("/backtest/runs", authenticate, listMyRuns);
router.get("/backtest/runs/:id", authenticate, getMyRun);
router.delete("/backtest/runs/:id", authenticate, deleteMyRun);

router.post("/backtest/razorpay/order", authenticate, createPassOrder);
router.post("/backtest/razorpay/verify", authenticate, verifyPassPurchase);

export default router;
