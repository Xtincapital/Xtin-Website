import React, { useEffect, useState } from 'react';
import { FaCheck, FaCrown, FaLock, FaTimes, FaShieldAlt, FaBolt } from 'react-icons/fa';
import useRegion from '../../../hooks/useRegion';
import {
  learnPricing,
  formatLearnPrice,
  learnCatalogueStats,
} from '../../../lib/learnPlan';
import learnPlanService from '../services/learnPlanService';
import { useAuth } from '../../../contexts/AuthContext';
import { showPurchaseReceipt } from '@/features/billing/lib/purchaseReceipt';
import CouponField from '@/features/coupons/components/CouponField';
import { isFreeOrder } from '@/features/coupons/lib/api';

/**
 * Xtin Academy Pro upgrade modal.
 *
 * Psychology, deliberately:
 *  • Reciprocity — leads with what the learner already HAS free.
 *  • Anchoring — "one course elsewhere costs ₹5,000–₹50,000" before our price.
 *  • Per-day trivialisation — "₹1.4 a day" makes yearly feel weightless.
 *  • Loss framing — the `reason` prop names the exact thing they just hit.
 *  • Default to yearly (pre-selected, SAVE badge) — the sensible choice is
 *    the easy choice.
 */
const LearnUpgradeModal = ({ open, onClose, onActivated, reason = null }) => {
  const { region } = useRegion();
  const { user } = useAuth();
  const pricing = learnPricing();
  const stats = learnCatalogueStats();

  const [billing, setBilling] = useState('yearly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponPrice, setCouponPrice] = useState(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  if (!open) return null;

  const price = billing === 'yearly' ? pricing.yearly : pricing.monthly;
  const effMonthly = pricing.yearly / 12;
  const planId = billing === 'yearly' ? 'learn_pro_yearly' : 'learn_pro_monthly';
  const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const startCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      let orderData;
      try {
        orderData = await learnPlanService.createOrder(planId, coupon);
      } catch (err) {
        // Dev convenience: no Razorpay keys locally → simulate through the
        // real backend + Supabase write. Never available in production.
            const finishActivation = (record) => {
              try {
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('xtin_subscription_updated'));
              } catch { /* non-blocking */ }
              onActivated?.(record);
            };

            if (isLocalDev && err.code === 'NOT_CONFIGURED') {
              const ok = window.confirm(
                'Dev mode: Razorpay keys are not configured on this machine.\nActivate Academy Pro locally to test the full experience?'
              );
              if (ok) {
                const res = await learnPlanService.devActivate(planId);
                finishActivation(res);
              }
              setBusy(false);
              return;
            }
            throw err;
          }

          if (isFreeOrder(orderData)) {
            // The coupon covered it all: already activated, no payment step.
            showPurchaseReceipt(orderData.order_id);
            try {
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new Event('xtin_subscription_updated'));
            } catch { /* non-blocking */ }
            onActivated?.(orderData.record);
            setBusy(false);
            return;
          }

          const scriptOk = await learnPlanService.loadRazorpayScript();
          if (!scriptOk || !window.Razorpay) {
            throw new Error('Could not load the secure checkout. Check your connection.');
          }

          const rzp = new window.Razorpay({
            key: orderData.keyId,
            order_id: orderData.order.id,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: 'Xtin Academy Pro',
            description: orderData.plan.label,
            theme: { color: '#12805A' },
            prefill: { email: user?.email || '' },
            handler: async (response) => {
              try {
                const record = await learnPlanService.verifyPayment({
                  plan_id: planId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  currency: pricing.currency,
                  region,
                });
                showPurchaseReceipt(response.razorpay_order_id);
                try {
                  window.dispatchEvent(new Event('storage'));
                  window.dispatchEvent(new Event('xtin_subscription_updated'));
                } catch { /* non-blocking */ }
                onActivated?.(record);
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl relative border border-transparent dark:border-slate-700 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-100/60 dark:from-emerald-900/30 to-transparent rounded-t-3xl pointer-events-none" />

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
              <FaCrown /> Xtin Academy Pro
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-[-0.015em]">
              Unlock the complete library
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              You already have <span className="font-semibold text-green-600">{stats.freeModules} full courses free, forever</span>.
              Pro completes your library — all {stats.totalModules} courses, every lesson, every certificate.
            </p>
          </div>

          {/* The exact thing they hit (loss framing) */}
          {reason && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-800 dark:text-amber-200 text-sm mb-5">
              <FaLock className="mt-0.5 flex-shrink-0 text-amber-500" />
              <span>{reason}</span>
            </div>
          )}

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
                <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-extrabold rounded">
                  SAVE {Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100)}%
                </span>
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-slate-100">
                {formatLearnPrice(price, pricing)}
              </span>
              <span className="text-gray-500 dark:text-slate-400 font-medium">
                /{billing === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {billing === 'yearly' ? (
              <p className="text-sm text-green-600 font-semibold mt-1.5">
                That's {formatLearnPrice(effMonthly, pricing)}/month — about {pricing.perDay} a day
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1.5">
                or {formatLearnPrice(pricing.yearly, pricing)}/year and save{' '}
                {Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100)}%
              </p>
            )}
          </div>

          {/* Value stack */}
          <ul className="space-y-2.5 mb-5">
            {[
              `All ${stats.totalModules} courses ${stats.totalLessons}+ lessons, no locks anywhere`,
              `${stats.proModules} Intermediate & Advanced courses unlocked in full`,
              'Every certificate Beginner to Advanced',
              'All 5 premium courses included at launch (early access)',
              'One price. No add-ons, no upsells inside lessons.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-[1px]">
                  <FaCheck className="text-green-600 text-[10px]" />
                </span>
                {line}
              </li>
            ))}
          </ul>

          {/* Anchor */}
          <p className="text-center text-xs text-gray-500 dark:text-slate-400 mb-5">
            {pricing.anchor}{' '}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              Every Xtin course together: {formatLearnPrice(pricing.yearly, pricing)} a year.
            </span>
          </p>

          <CouponField
            className="mb-4"
            product="xtin_learn_pro"
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

          {/* CTA */}
          <button
            onClick={startCheckout}
            disabled={busy}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Opening secure checkout…
              </>
            ) : (
              <>
                <FaBolt className="text-sm" />
                Unlock everything {formatLearnPrice(couponPrice !== null ? couponPrice / 100 : price, pricing)}
              </>
            )}
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <FaShieldAlt className="text-green-500" /> Secure via Razorpay
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

export default LearnUpgradeModal;
