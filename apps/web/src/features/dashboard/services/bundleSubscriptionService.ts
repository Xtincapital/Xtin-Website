import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';

/**
 * Service for bundle and overall subscription plan checkout & database persistence.
 */
class BundleSubscriptionService {
  /** Create a server-signed Razorpay order for any plan or bundle */
  /** Resolves to the order — or to { free: true, order_id, record } when a coupon made it free (already activated). */
  async createOrder({ item, billingCycle, customProducts = [], couponCode = null }) {
    let amount = 0;
    let products = [];
    const planId = item.id;
    const planName = item.name;

    if (item.id === 'ultimate-pass' || item.isBundle) {
      amount = billingCycle === 'annual' ? item.annualPrice : item.monthlyPrice;
      products = item.products || ['Algo Trading Pro', 'Gini AI Advisor Pro', 'Fundakamental Pro', 'Trade Journal Pro', 'Learn Hub All-Access', 'Market Newsletter Pro'];
    } else if (item.isCustom) {
      amount = billingCycle === 'annual' ? item.finalAnnual : item.finalMonthly;
      products = item.selectedNames || customProducts;
    } else if (item.products) {
      // Preset combo pack
      amount = billingCycle === 'annual' ? item.annualPrice : item.monthlyPrice;
      products = item.products;
    } else {
      // Individual product plan
      amount = billingCycle === 'annual' ? (item.annualPrice || item.annual) : (item.monthlyPrice || item.monthly);
      products = [item.name];
    }

    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/subscriptions/order`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        plan_name: planName,
        products,
        billing_cycle: billingCycle,
        amount,
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

    return {
      ...data.data,
      amount,
      products,
      planId,
      planName,
    };
  }

  /** Verify Razorpay HMAC signature & store subscription in PostgreSQL */
  async verifyPayment(payload) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/subscriptions/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Payment verification failed');
    }
    return data.data;
  }

  /** Retrieve authoritative user active plans from PostgreSQL database */
  async getUserActivePlans() {
    try {
      const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/subscriptions/user-active-plans`, {
        method: 'GET',
      });
      if (!res.ok) return null;
      const result = await res.json();
      return result?.data || null;
    } catch (e) {
      console.warn("Could not fetch user active plans from database:", e);
      return null;
    }
  }

  /** Dev fallback activation */
  async devActivate(payload) {
    const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/subscriptions/dev-activate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Dev activation failed');
    return data.data;
  }

  /** Load Razorpay script dynamically */
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

  /** Launch Razorpay checkout popup */
  openRazorpayCheckout({ keyId, orderId, amount, currency = 'INR', label, prefill, handler }) {
    const options = {
      key: keyId,
      amount: orderId ? undefined : amount * 100,
      currency: currency || 'INR',
      name: 'Xtin Capital',
      description: label || 'Subscription Pass',
      image: 'https://xtincapital.com/logo192.png',
      order_id: orderId,
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
      },
      theme: {
        color: '#16A34A',
      },
      handler,
      modal: {
        ondismiss: () => {
          console.log('Razorpay checkout modal dismissed');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }
}

export default new BundleSubscriptionService();
