// POST /api/payments/razorpay/webhook — Razorpay calls this itself when an
// order is paid, so the buyer gets their product even if their browser never
// made it back to the verify endpoint. Configure in Razorpay Dashboard →
// Accounts & Settings → Webhooks with the `order.paid` event and the same
// secret as RAZORPAY_WEBHOOK_SECRET. Also subscribe `refund.processed` so a
// fully refunded payment's receipt shows as refunded on the Billing page.
//
// Response codes matter here: any non-2xx makes Razorpay redeliver (with
// backoff, for up to 24h), which is what we want for transient failures — a
// cold-starting server, a Supabase hiccup — but not for orders that can never
// be fulfilled (wrong amount, unknown product), which are logged and 200'd.
import { verifyRazorpayWebhookSignature } from "../../utils/razorpay.js";
import { fulfillRazorpayOrder, FulfillmentError } from "./fulfillment.js";
import { markReceiptRefunded } from "./receipts.js";

export const handleRazorpayWebhook = async (req, res) => {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.error("[Payments Webhook] RAZORPAY_WEBHOOK_SECRET is not set — rejecting delivery");
        return res.status(503).json({ error: "Webhook not configured" });
    }
    if (!verifyRazorpayWebhookSignature(req.rawBody, req.get("x-razorpay-signature"))) {
        return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body?.event;
    if (event === "refund.processed") {
        const refunded = req.body?.payload?.payment?.entity;
        if (refunded?.id && Number(refunded.amount_refunded) >= Number(refunded.amount)) {
            try {
                await markReceiptRefunded(refunded.id);
            } catch (err) {
                console.error(`[Payments Webhook] marking receipt refunded for ${refunded.id} failed, Razorpay will retry:`, (err as Error)?.message || err);
                return res.status(500).json({ error: "Temporary failure" });
            }
        }
        return res.status(200).json({ ok: true });
    }
    if (event !== "order.paid") {
        return res.status(200).json({ ignored: event || "unknown" });
    }

    const order = req.body?.payload?.order?.entity;
    const payment = req.body?.payload?.payment?.entity;
    if (!order?.id || !payment?.id) {
        console.error("[Payments Webhook] order.paid without order/payment entities");
        return res.status(200).json({ ignored: "malformed" });
    }

    try {
        const { alreadyFulfilled, product } = await fulfillRazorpayOrder({
            orderId: order.id,
            paymentId: payment.id,
            order,
            payment,
            source: "webhook",
        });
        return res.status(200).json({ ok: true, product, alreadyFulfilled });
    } catch (err) {
        if (err instanceof FulfillmentError && !err.retryable) {
            // Needs a human: the money was taken but the order can't be granted automatically.
            console.error(`[Payments Webhook] NEEDS REVIEW order ${order.id} payment ${payment.id} (${err.code}): ${err.message}`);
            return res.status(200).json({ ok: false, code: err.code });
        }
        console.error(`[Payments Webhook] order ${order.id} failed, Razorpay will retry:`, (err as Error)?.message || err);
        return res.status(500).json({ error: "Temporary failure" });
    }
};
