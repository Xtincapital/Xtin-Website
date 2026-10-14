import React, { useEffect, useState } from 'react';
import { FaCheck, FaCrown, FaTimes, FaShieldAlt, FaBolt, FaSun, FaMoon } from 'react-icons/fa';
import useRegion from '../../../hooks/useRegion';
import {
  newsletterPricing,
  formatNewsletterPrice,
  MARKETS,
} from '../lib/newsletterPlan';
import newsletterPlanService from '../services/newsletterPlanService';
import { useAuth } from '../../../contexts/AuthContext';
import { showPurchaseReceipt } from '@/features/billing/lib/purchaseReceipt';
import CouponField from '@/features/coupons/components/CouponField';
import { isFreeOrder } from '@/features/coupons/lib/api';

/**
 * Market Brief Pro upgrade modal.
 *
 * Psychology, deliberately:
 *  • Reciprocity — reminds them the free evening wrap stays free.
 *  • Anchoring — "research subs cost ₹12,000–50,000/yr" before our price.
 *  • Per-day trivialisation — "₹2.7 a day".
 *  • Clarity — Pro is every market, both editions; nothing to configure.
 *  • Loss framing via `reason` — names the exact edition/market they wanted.
 *  • Yearly pre-selected with SAVE badge.
 */
const NewsletterUpgradeModal = ({ open, onClose, onActivated, reason = null }) => {
  const { region } = useRegion();
  const { user } = useAuth();
  const pricing = newsletterPricing();

  const [billing, setBilling] = useState('yearly');
  // Pro covers every market — there is no per-market choice.
  const markets = MARKETS.map((m) => m.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponPrice, setCouponPrice] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const price = billing === 'yearly' ? pricing.yearly : pricing.monthly;
  const effMonthly = pricing.yearly / 12;
  const planId = billing === 'yearly' ? 'newsletter_pro_yearly' : 'newsletter_pro_monthly';
  const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const savePct = Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100);

  const finish = async (record) => {
    try { await newsletterPlanService.updateMarkets(markets); } catch { /* non-blocking */ }
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('xtin_subscription_updated'));
    } catch { /* non-blocking */ }
    onActivated?.(record);
  };

  const startCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      let orderData;
      try {
        orderData = await newsletterPlanService.createOrder(planId, coupon);
      } catch (err) {
        if (isLocalDev && err.code === 'NOT_CONFIGURED') {
          const ok = window.confirm(
            'Dev mode: Razorpay keys are not configured on this machine.\nActivate Market Brief Pro locally to test the full experience?'
          );
          if (ok) {
            const res = await newsletterPlanService.devActivate(planId, markets);
            await finish(res);
          }
          setBusy(false);
          return;
        }
        throw err;
      }

      if (isFreeOrder(orderData)) {
        // The coupon covered it all: already activated, no payment step.
        showPurchaseReceipt(orderData.order_id);
        await finish(orderData.record);
        setBusy(false);
        return;
      }

      const scriptOk = await newsletterPlanService.loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        throw new Error('Could not load the secure checkout. Check your connection.');
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        order_id: orderData.order.id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Xtin Market Brief Pro',
        description: orderData.plan.label,
        theme: { color: '#12805A' },
        prefill: { email: user?.email || '' },
        handler: async (response) => {
          try {
            const record = await newsletterPlanService.verifyPayment({
              plan_id: planId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              currency: pricing.currency,
              region,
              markets: markets.join(','),
            });
            showPurchaseReceipt(response.razorpay_order_id);
            await finish(record);
          } catch {
            setError('Payment succeeded but verification failed. Contact support with your payment ID.');
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Unable to start checkout. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center p-4 overflow-y-auto brand-on-dark"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl relative border border-transparent dark:border-slate-700 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-32 rounded-t-3xl pointer-events-none bg-brand-soft" />

        {/* Pinned to the top of the visible card so it stays reachable while scrolling a tall modal on small screens */}
        <div className="sticky top-0 z-20 h-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 rounded-full shadow-md rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors z-10"
            aria-label="Close"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <div className="relative p-7">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <FaCrown /> Market Brief Pro
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              Every market, twice a day
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              The evening India wrap stays <span className="font-semibold text-brand">free forever</span>.
              Pro adds the morning brief and every market: India, US and Global.
            </p>
          </div>

          {reason && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-800 dark:text-amber-200 text-sm mb-5">
              <FaCrown className="mt-0.5 flex-shrink-0 text-amber-500" />
              <span>{reason}</span>
            </div>
          )}

          {/* Both editions (what Pro adds) */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 text-center">
              <FaSun className="mx-auto text-amber-500 mb-1.5" />
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Pre-Market Brief</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">8 AM · know before the bell</p>
            </div>
            <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 text-center">
              <FaMoon className="mx-auto text-indigo-500 mb-1.5" />
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Post-Market Wrap</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">5 PM · what moved & why</p>
            </div>
          </div>

          {/* Markets included in Pro */}
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-2">
            Included markets
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {MARKETS.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl border text-center border-brand bg-brand-soft dark:bg-brand-soft ring-1 ring-brand"
              >
                <div className="text-xl mb-0.5">{m.flag}</div>
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100">{m.label}</div>
                <FaCheck className="mx-auto text-brand text-xs mt-1" />
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billing === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow'
                  : 'text-gray-500 dark:text-slate-400'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${billing === 'yearly'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow'
                  : 'text-gray-500 dark:text-slate-400'
                  }`}
              >
                Yearly
                <span className="px-1.5 py-0.5 bg-brand-fill text-white text-xs font-extrabold rounded">
                  SAVE {savePct}%
                </span>
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-slate-100">
                {formatNewsletterPrice(price, pricing)}
              </span>
              <span className="text-gray-500 dark:text-slate-400 font-medium">
                /{billing === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              One flat price covers all {MARKETS.length} markets
            </p>
            {billing === 'yearly' ? (
              <p className="text-sm text-brand font-semibold mt-1.5">
                {formatNewsletterPrice(effMonthly, pricing)}/month about {pricing.perDay} a day
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1.5">
                or {formatNewsletterPrice(pricing.yearly, pricing)}/year and save {savePct}%
              </p>
            )}
          </div>

          {/* Value stack */}
          <ul className="space-y-2.5 mb-5">
            {[
              'Both editions morning brief + evening wrap, every trading day',
              'Every market you picked above, in one inbox',
              'The full searchable archive (free readers see the latest 3)',
              'Written to answer "why it matters" never filler',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-brand-soft dark:bg-brand-fill/40 flex items-center justify-center flex-shrink-0 mt-[1px]">
                  <FaCheck className="text-brand text-xs" />
                </span>
                {line}
              </li>
            ))}
          </ul>

          {/* Anchor */}
          <p className="text-center text-xs text-gray-500 dark:text-slate-400 mb-5">
            {pricing.anchor}{' '}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              You pay {formatNewsletterPrice(pricing.yearly, pricing)} a year.
            </span>
          </p>

          <CouponField
            className="mb-4"
            product="xtin_newsletter_pro"
            amount={Math.round(price * 100)}
            currency={pricing.currency}
            value={coupon}
            onChange={setCoupon}
            onPriceChange={setCouponPrice}
            onRedeemed={onClose}
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={startCheckout}
            disabled={busy}
            className="w-full px-6 py-4 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/35 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 bg-brand-fill"
          >
            {busy ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Opening secure checkout…
              </>
            ) : (
              <>
                <FaBolt className="text-sm" />
                Get Pro {formatNewsletterPrice(couponPrice !== null ? couponPrice / 100 : price, pricing)}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <FaShieldAlt className="text-brand" /> Secure via Razorpay
            </span>
            <span>·</span>
            <span>{pricing.upi ? 'UPI, cards & netbanking' : 'Cards & international payments'}</span>
            <span>·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterUpgradeModal;
