import { Router } from "express";
import { handleRazorpayWebhook } from "./webhook.controller.js";

const router = Router();

// Unauthenticated by design — Razorpay's servers call it. Authenticity comes
// from the X-Razorpay-Signature HMAC over the raw body (see app.ts, which
// keeps `req.rawBody` for this path).
router.post("/payments/razorpay/webhook", handleRazorpayWebhook);

export default router;
