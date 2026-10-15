import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';

/**
 * Algorithm subscription service — talks to the Express backend, which is the
 * ONLY thing allowed to grant access (after Razorpay signature verification,
 * written with the Supabase service role).
 */
class AlgorithmService {
  /** Get all active subscriptions for the current user */
  async getSubscriptions() {
    try {
      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algorithm/subscriptions`, {
        method: 'GET',
      });
      if (!res.ok) return [];
      const result = await res.json();
      return result?.data || [];
    } catch {
      return [];
    }
  }

  /** Create a Razorpay order for an algorithm subscription */
  /** Resolves to the order — or to { free: true, order_id, record } when a coupon made it free (already activated). */
  async createOrder(algoName, tradingviewUsername, phoneNumber, couponCode = null) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algorithm/order`, {
      method: 'POST',
      body: JSON.stringify({
        algo_name: algoName,
        plan_type: 'monthly',
        tradingview_username: tradingviewUsername,
        phone_number: phoneNumber,
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

  /** Verify payment and activate subscription */
  async verifyPayment(payload) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algorithm/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.data?.payment_id) {
      throw new Error(data.message || data.error || 'Payment verification failed');
    }
    return data.data;
  }

  /** Local development only — activates via the backend's dev endpoint */
  async devActivate(algoName) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algorithm/dev-activate`, {
      method: 'POST',
      body: JSON.stringify({
        algo_name: algoName,
        plan_type: 'monthly',
        tradingview_username: 'dev_user',
        phone_number: '9999999999',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Dev activation failed');
    return data.data;
  }

  /** Load the Razorpay checkout script once */
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

  /** Open Razorpay checkout modal */
  openRazorpayCheckout({ keyId, orderId, amount, currency, label, prefill, handler }) {
    const options = {
      key: keyId,
      amount: orderId ? undefined : amount,
      currency: currency || 'INR',
      name: 'Xtin Capital',
      description: label || 'Algorithm Subscription',
      image: 'https://xtincapital.com/logo192.png',
      order_id: orderId,
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
        ...prefill,
      },
      theme: {
        color: '#16A34A',
      },
      handler,
      modal: {
        ondismiss: () => {
          console.log('Razorpay modal dismissed');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }
}

export default new AlgorithmService();
