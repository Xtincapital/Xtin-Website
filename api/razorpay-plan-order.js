// Gini Pro subscription plans. Regional charm price points (whole units);
// `amounts` is the source of truth. Must stay in sync with GINI_PRICING in
// gini-premium.js and PRO_PLANS in server.js.
const PRO_PLANS = {
  pro_monthly: { amountINR: 499, label: 'Gini Pro — Monthly', durationDays: 31,
    amounts: { INR: 499, USD: 9, GBP: 7, EUR: 8 } },
  pro_yearly: { amountINR: 3999, label: 'Gini Pro — Yearly', durationDays: 366,
    amounts: { INR: 3999, USD: 79, GBP: 59, EUR: 69 } }
};
const PLAN_CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userEmail, userId, region } = req.body || {};
    const plan = PRO_PLANS[planId];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    let currency = String((req.body || {}).currency || 'INR').toUpperCase();
    if (!PLAN_CURRENCIES.includes(currency)) currency = 'INR';
    const amountWhole = plan.amounts[currency] != null ? plan.amounts[currency] : plan.amountINR;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: 'Payment service not configured',
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
        amount: amountWhole * 100,
        currency,
        receipt: `gini_plan_${planId}_${Date.now()}`,
        notes: {
          product: 'gini_pro_plan',
          planId,
          durationDays: String(plan.durationDays),
          region: String(region || '').toUpperCase().slice(0, 10),
          userEmail: String(userEmail || '').slice(0, 254),
          userId: String(userId || '').slice(0, 64)
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
      plan: { id: planId, ...plan }
    });
  } catch (error) {
    console.error('[Razorpay Plan Order] Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
