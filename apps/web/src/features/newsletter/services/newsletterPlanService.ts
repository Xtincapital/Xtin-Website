import authService from '../../../services/authService';
import { setNewsletterPlanFromServer, newsletterPricing } from '../lib/newsletterPlan';
import { getRegion } from '../../../lib/region';
import { BACKEND_URL } from '../../../config/env';

/**
 * Newsletter Pro plan service — talks to the Express backend, which is the ONLY
 * thing allowed to grant Pro (after Razorpay signature verification, written
 * with the Supabase service role). The client never grants itself a plan.
 */
class NewsletterPlanService {
  async syncPlan() {
    try {
      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/newsletter/plan`, {
        method: 'GET',
      });
      if (!res.ok) return null;
      const result = await res.json();
      setNewsletterPlanFromServer(result?.data || null);
      return result?.data || null;
    } catch {
      return null; // not signed in / offline — keep local cache
    }
  }

  async createOrder(planId) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/newsletter/order`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        currency: newsletterPricing().currency,
        region: getRegion() || 'IN',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || data.error || 'Unable to start checkout');
      (err as any).code = data.code;
      throw err;
    }
    return data.data;
  }

  async verifyPayment(payload) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/newsletter/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.data?.plan_id) {
      throw new Error(data.message || data.error || 'Payment verification failed');
    }
    setNewsletterPlanFromServer(data.data);
    return data.data;
  }

  /** Update which markets the subscriber receives (Pro-entitled at send time). */
  async updateMarkets(markets) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/newsletter/markets`, {
      method: 'PUT',
      body: JSON.stringify({ markets: (markets || []).join(',') }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to update markets');
    return data.data;
  }

  /** Local development only — activates via the dev endpoint (refuses in prod). */
  async devActivate(planId, markets) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/newsletter/dev-activate`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        currency: newsletterPricing().currency,
        region: getRegion() || 'IN',
        markets: (markets || ['IN']).join(','),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Dev activation failed');
    setNewsletterPlanFromServer(data.data);
    return data.data;
  }

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

export default new NewsletterPlanService();
