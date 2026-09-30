import React, { useEffect, useState } from 'react';
import { FaCheck, FaCrown, FaTimes, FaShieldAlt, FaBolt, FaSun, FaMoon } from 'react-icons/fa';
import useRegion from '../../../hooks/useRegion';
import {
  newsletterPricing,
  formatNewsletterPrice,
  MARKETS,
  getMarketPref,
} from '../lib/newsletterPlan';
import newsletterPlanService from '../services/newsletterPlanService';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Market Brief Pro upgrade modal.
 *
 * Psychology, deliberately:
 *  • Reciprocity — reminds them the free evening wrap stays free.
 *  • Anchoring — "research subs cost ₹12,000–50,000/yr" before our price.
 *  • Per-day trivialisation — "₹2.7 a day".
 *  • Endowment + choice — they pick their markets IN THE MODAL, so by the time
 *    they pay they've already assembled "their" product.
 *  • Loss framing via `reason` — names the exact edition/market they wanted.
 *  • Yearly pre-selected with SAVE badge.
 */
const NewsletterUpgradeModal = ({ open, onClose, onActivated, reason = null }) => {
  const { region } = useRegion();
  const { user } = useAuth();
  const pricing = newsletterPricing();

  const [billing, setBilling] = useState('yearly');
  const [markets, setMarkets] = useState(() => getMarketPref());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setMarkets(getMarketPref());
    }
  }, [open]);

  if (!open) return null;

  const price = billing === 'yearly' ? pricing.yearly : pricing.monthly;
  const effMonthly = pricing.yearly / 12;
  const planId = billing === 'yearly' ? 'newsletter_pro_yearly' : 'newsletter_pro_monthly';
  const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const savePct = Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100);

  const toggleMarket = (id) => {
    setMarkets((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((m) => m !== id);
        return next.length ? next : prev; // keep at least one
      }
      return [...prev, id];
    });
  };

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
        orderData = await newsletterPlanService.createOrder(planId);
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
        theme: { color: '#16A34A' },
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl relative border border-transparent dark:border-slate-700 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-100/60 dark:from-emerald-900/30 to-transparent rounded-t-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes className="text-sm" />
        </button>

        <div className="relative p-7">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <FaCrown /> Market Brief Pro
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mb-2">
              Build your own market brief
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              The evening India wrap stays <span className="font-semibold text-green-600">free forever</span>.
              Pro adds the morning brief and lets you choose exactly which markets you follow.
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
              <p className="text-[11px] text-gray-500 dark:text-slate-400">8 AM · know before the bell</p>
            </div>
            <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 text-center">
              <FaMoon className="mx-auto text-indigo-500 mb-1.5" />
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Post-Market Wrap</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">5 PM · what moved & why</p>
            </div>
          </div>

          {/* Market picker — the endowment moment */}
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-2">
            Your markets
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {MARKETS.map((m) => {
              const active = markets.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMarket(m.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${active
                    ? 'border-green-500 bg-green-50 dark:bg-emerald-900/30 ring-1 ring-green-500'
                    : 'border-gray-200 dark:border-slate-700 hover:border-green-300'
                    }`}
                >
                  <div className="text-xl mb-0.5">{m.flag}</div>
                  <div className="text-xs font-bold text-gray-900 dark:text-slate-100">{m.label}</div>
                  {active && <FaCheck className="mx-auto text-green-600 text-[10px] mt-1" />}
                </button>
              );
            })}
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
                <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-extrabold rounded">
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
            {billing === 'yearly' ? (
              <p className="text-sm text-green-600 font-semibold mt-1.5">
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
              You pay {formatNewsletterPrice(pricing.yearly, pricing)} a year.
            </span>
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={startCheckout}
            disabled={busy}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Opening secure checkout…
              </>
            ) : (
              <>
                <FaBolt className="text-sm" />
                Get Pro {formatNewsletterPrice(price, pricing)}
              </>
            )}
          </button>

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

export default NewsletterUpgradeModal;
