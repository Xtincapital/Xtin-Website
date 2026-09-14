// FundaKaMental Razorpay Pro-subscription routes — Node/TS port of
// `api/endpoints/razorpay_payments.py`'s router.
//
// Mount prefix: the Python source mounts these at bare `/razorpay/*`, but
// this codebase already has its OWN Razorpay-backed subscription routes at
// `/api/algorithm/*`, `/api/newsletter/*`, `/api/learn/*` and
// `/api/subscriptions/*` (see algorithm.routes.ts, newsletterPlan.routes.ts,
// learn.routes.ts, billing's routes). A bare `/api/razorpay/*` would be an
// odd one out and risks future collisions, so — matching every other route
// file in this port — these are namespaced under `/fundakamental/razorpay/*`.
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createOrder, verifyPayment, getPlan } from "./razorpay.controller.js";

const router = Router();

router.post("/fundakamental/razorpay/order", authenticate, createOrder);
router.post("/fundakamental/razorpay/verify", authenticate, verifyPayment);
router.get("/fundakamental/razorpay/plan", authenticate, getPlan);

export default router;
