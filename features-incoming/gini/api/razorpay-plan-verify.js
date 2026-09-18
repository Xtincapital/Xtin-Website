import crypto from 'crypto';

// Must stay in sync with api/razorpay-plan-order.js
const PRO_PLANS = {
  pro_monthly: { amountINR: 499, label: 'Gini Pro — Monthly', durationDays: 31 },
  pro_yearly: { amountINR: 3999, label: 'Gini Pro — Yearly', durationDays: 366 }
};

// After a verified payment, persist the plan server-side (service role
// bypasses RLS; clients can only read their own row). Failure here never
// fails the payment response — the client still activates locally.
async function persistProPlan({ userId, userEmail, planId, plan, paymentId, orderId, currency, region }) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !userId) {
    return { saved: false, reason: !userId ? 'no user id' : 'service role key not configured' };
  }
  try {
    const now = new Date();
    const validUntil = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const response = await fetch(`${supabaseUrl}/rest/v1/gini_pro_plans`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        plan_id: planId,
        billing: plan.durationDays > 32 ? 'yearly' : 'monthly',
        currency: String(currency || 'INR').toUpperCase(),
        region: (String(region || '').toUpperCase() || null),
        activated_at: now.toISOString(),
        valid_until: validUntil.toISOString(),
        payment_id: paymentId,
        order_id: orderId,
        user_email: String(userEmail || '').slice(0, 254),
        updated_at: now.toISOString()
      })
    });
    if (!response.ok) {
      const body = await response.text();
      console.error('[Pro Plan Persist] Supabase error:', response.status, body);
      return { saved: false, reason: `supabase ${response.status}` };
    }
    return { saved: true };
  } catch (error) {
    console.error('[Pro Plan Persist] Error:', error.message);
    return { saved: false, reason: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      planId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      userId,
      userEmail,
      currency,
      region
    } = req.body || {};

    const plan = PRO_PLANS[planId];
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
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

    const persisted = await persistProPlan({ userId, userEmail, planId, plan, paymentId, orderId, currency, region });

    return res.status(200).json({
      success: true,
      plan: { id: planId, ...plan },
      paymentId,
      orderId,
      cloudSaved: persisted.saved
    });
  } catch (error) {
    console.error('[Razorpay Plan Verify] Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
