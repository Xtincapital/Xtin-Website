// FundaKaMental token-wallet routes — Node/TS port of
// `api/endpoints/tokens.py`'s router.
//
// Mount prefix: namespaced under `/fundakamental/tokens/*` rather than the
// Python source's bare `/tokens/*` — same reasoning as razorpay.routes.ts
// (keeps this port consistent with every other fundakamental route file and
// avoids colliding with this app's own top-level route namespaces).
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { getWalletBalance, getPacks, createPackOrder, verifyPackPurchase } from "./tokens.controller.js";

const router = Router();

router.get("/fundakamental/tokens/wallet", authenticate, getWalletBalance);
router.get("/fundakamental/tokens/packs", getPacks);
router.post("/fundakamental/tokens/order", authenticate, createPackOrder);
router.post("/fundakamental/tokens/verify", authenticate, verifyPackPurchase);

export default router;
