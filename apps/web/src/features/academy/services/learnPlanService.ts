import authService from '../../../services/authService';
import { setLearnPlanFromServer, learnPricing } from '../../../lib/learnPlan';
import { getRegion } from '../../../lib/region';
import { BACKEND_URL } from '../../../config/env';

/**
 * Learn Pro plan service — talks to the Express backend, which is the ONLY
 * thing allowed to grant Pro (after Razorpay signature verification, written
 * with the Supabase service role). The client never grants itself a plan.
 */
class LearnPlanService {
  /** Authoritative plan from the server; caches locally. Fail-quiet. */
  async syncPlan() {
    try {
      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/learn/plan`, {
        method: 'GET',
      });
      if (!res.ok) return null;
      const result = await res.json();
      setLearnPlanFromServer(result?.data || null);
      return result?.data || null;
    } catch {
      // Not signed in / offline — keep whatever the local cache says.
      return null;
    }
  }

  /** Resolves to the order, or to { free: true, order_id, record } when a coupon made it free (already activated). */
  async createOrder(planId, couponCode = null) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/learn/order`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        currency: learnPricing().currency,
        region: getRegion() || 'IN',
        coupon_code: couponCode || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || data.error || 'Unable to start checkout');
      (err as any).code = data.code;
      throw err;
    }
    if (data.free) return { free: true, order_id: data.order_id, record: data.data };
    return data.data;
  }

  async verifyPayment(payload) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/learn/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.data?.plan_id) {
      throw new Error(data.message || data.error || 'Payment verification failed');
    }
    setLearnPlanFromServer(data.data);
    return data.data;
  }

  /**
   * Local development only — activates via the backend's dev endpoint (which
   * refuses in production / when Razorpay is configured). Keeps the full
   * server → Supabase → client loop testable without payment keys.
   */
  async devActivate(planId) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/learn/dev-activate`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        currency: learnPricing().currency,
        region: getRegion() || 'IN',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Dev activation failed');
    setLearnPlanFromServer(data.data);
    return data.data;
  }

  /** Load the Razorpay checkout script once. */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
}

export default new LearnPlanService();
