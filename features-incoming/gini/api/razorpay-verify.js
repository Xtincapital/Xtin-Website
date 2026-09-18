import crypto from 'crypto';

const AI_TOKEN_PACKS = {
  ai_500: { amountINR: 500, tokens: 100000, label: 'Starter AI Pack' },
  ai_1000: { amountINR: 1000, tokens: 300000, label: 'Growth AI Pack' },
  ai_2000: { amountINR: 2000, tokens: 500000, label: 'Power AI Pack' }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      packId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    } = req.body || {};

    const pack = AI_TOKEN_PACKS[packId];
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!pack) {
      return res.status(400).json({ error: 'Invalid AI token pack' });
    }

    if (!keySecret) {
      return res.status(500).json({
        error: 'Razorpay is not configured',
        debug: 'Set RAZORPAY_KEY_SECRET'
      });
    }

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing Razorpay payment fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    return res.status(200).json({
      success: true,
      pack: { id: packId, ...pack },
      paymentId,
      orderId
    });
  } catch (error) {
    console.error('[Razorpay Verify] Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
