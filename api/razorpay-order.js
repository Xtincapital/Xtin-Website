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
    const { packId } = req.body || {};
    const pack = AI_TOKEN_PACKS[packId];

    if (!pack) {
      return res.status(400).json({ error: 'Invalid AI token pack' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: 'Razorpay is not configured',
        debug: 'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET'
      });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: pack.amountINR * 100,
        currency: 'INR',
        receipt: `gini_${packId}_${Date.now()}`,
        notes: {
          product: 'gini_ai_tokens',
          packId,
          tokens: String(pack.tokens)
        }
      })
    });

    const order = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      return res.status(razorpayResponse.status).json({
        error: order.error?.description || 'Unable to create Razorpay order'
      });
    }

    return res.status(200).json({
      success: true,
      keyId,
      order,
      pack: { id: packId, ...pack }
    });
  } catch (error) {
    console.error('[Razorpay Order] Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
