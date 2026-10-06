/**
 * Newsletter Pro plan — client-side plan state, region-aware pricing, and the
 * market/edition model for the Xtin Market Brief.
 *
 * FREE tier (generous by design):
 *   • The India Post-Market Wrap, every evening — a real, useful daily read.
 *   • The 3 most recent editions in the on-site archive.
 *
 * PRO:
 *   • BOTH editions — Pre-Market Brief (8 AM) + Post-Market Wrap (5 PM).
 *   • Every market — India, US and Global (no per-market choice).
 *   • The full searchable archive.
 *
 * The SERVER record (newsletter_pro_plans, written only after Razorpay
 * verification) is authoritative; localStorage is a fast cache. Pricing uses
 * regional charm price points — the local price IS the price.
 */
import { getRegion } from '../../../lib/region';

const PLAN_KEY = 'xtin_newsletter_plan_v1';
const MARKETS_KEY = 'xtin_newsletter_markets_v1';

export const FREE_ARCHIVE_LIMIT = 3;

export const MARKETS = [
  { id: 'IN', label: 'India', flag: '🇮🇳', blurb: 'Sensex, Nifty, RBI, earnings' },
  { id: 'US', label: 'United States', flag: '🇺🇸', blurb: 'S&P 500, Nasdaq, the Fed, big tech' },
  { id: 'GLOBAL', label: 'Global', flag: '🌍', blurb: 'World indices, oil, gold, macro' },
];

export const EDITIONS = [
  { id: 'pre_market', label: 'Pre-Market Brief', time: '8:00 AM', tagline: 'Know before the bell' },
  { id: 'post_market', label: 'Post-Market Wrap', time: '5:00 PM', tagline: 'What moved & why' },
];

// Regional charm price points (whole units). In sync with the server catalogue
// in backend/controllers/newsletterPlan.controller.mjs.
export const NEWSLETTER_PRICING = {
  IN:     { currency: 'INR', symbol: '₹', monthly: 149,  yearly: 999,   upi: true,
            perDay: '₹2.7', anchor: 'A single market-research subscription in India runs ₹12,000–₹50,000 a year.' },
  US:     { currency: 'USD', symbol: '$', monthly: 3.99, yearly: 29.99,
            perDay: '8¢', anchor: 'Most market newsletters charge $150–$500 a year for one market.' },
  GB:     { currency: 'GBP', symbol: '£', monthly: 3.49, yearly: 24.99,
            perDay: '7p', anchor: 'Most market newsletters charge £120–£400 a year for one market.' },
  EU:     { currency: 'EUR', symbol: '€', monthly: 3.99, yearly: 29.99,
            perDay: '8c', anchor: 'Most market newsletters charge €140–€450 a year for one market.' },
  AE:     { currency: 'USD', symbol: '$', monthly: 3.99, yearly: 29.99,
            perDay: '8¢', anchor: 'Most market newsletters charge $150–$500 a year for one market.' },
  SG:     { currency: 'USD', symbol: '$', monthly: 3.99, yearly: 29.99,
            perDay: '8¢', anchor: 'Most market newsletters charge $150–$500 a year for one market.' },
  GLOBAL: { currency: 'USD', symbol: '$', monthly: 3.99, yearly: 29.99,
            perDay: '8¢', anchor: 'Most market newsletters charge $150–$500 a year for one market.' },
};

export function newsletterPricing() {
  const code = getRegion() || 'IN';
  return NEWSLETTER_PRICING[code] || NEWSLETTER_PRICING.GLOBAL;
}

/**
 * Format a price using Intl.NumberFormat for canonical locale-aware output.
 * Falls back to simple symbol+number if the formatter throws.
 */
export function formatNewsletterPrice(amount, pricing = newsletterPricing()) {
  const n = Number(amount) || 0;
  try {
    const cfg = CURRENCY_LOCALE_MAP[pricing.currency] || { locale: 'en-US', currency: pricing.currency };
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.currency,
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    // Fallback: simple sym + number
    const str = Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2);
    return `${pricing.symbol}${str}`;
  }
}

/** Currency code → Intl locale mapping for proper formatting */
const CURRENCY_LOCALE_MAP = {
  INR: { locale: 'en-IN', currency: 'INR' },
  USD: { locale: 'en-US', currency: 'USD' },
  GBP: { locale: 'en-GB', currency: 'GBP' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
  AED: { locale: 'en-AE', currency: 'AED' },
  SGD: { locale: 'en-SG', currency: 'SGD' },
};

/* ---------- plan state ---------- */

const subscribers = new Set<() => void>();

function readPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY) || 'null'); }
  catch { return null; }
}

function writePlan(plan) {
  try {
    if (plan) localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    else localStorage.removeItem(PLAN_KEY);
  } catch { /* ignore */ }
  notify();
}

function notify() {
  subscribers.forEach((cb) => { try { cb(); } catch { /* ignore */ } });
  try { window.dispatchEvent(new CustomEvent('xtin:newsletter-plan-changed')); } catch { /* ignore */ }
}

export function subscribeNewsletterPlan(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function getNewsletterPlan() {
  return readPlan();
}

export function isNewsletterPro() {
  // Only the server-verified plan counts (bundles write it too) — never
  // hand-settable localStorage flags.
  const p = readPlan();
  if (!p || p.tier !== 'pro') return false;
  if (p.validUntil && Date.now() > new Date(p.validUntil).getTime()) {
    writePlan(null);
    return false;
  }
  return true;
}

/** Cache a server-verified plan locally (server stays authoritative). */
export function setNewsletterPlanFromServer(record) {
  if (!record || !record.plan_id) { writePlan(null); return; }
  writePlan({
    tier: 'pro',
    planId: record.plan_id,
    billing: record.billing,
    validUntil: record.valid_until,
    activatedAt: record.activated_at,
    markets: record.markets || 'IN',
  });
  if (record.markets) saveMarketPref(record.markets.split(',').map((m) => m.trim()).filter(Boolean));
}

/* ---------- market preference (local mirror of the server value) ---------- */

export function getMarketPref() {
  try {
    const raw = localStorage.getItem(MARKETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const plan = readPlan();
  if (plan?.markets) return plan.markets.split(',').map((m) => m.trim()).filter(Boolean);
  return ['IN'];
}

export function saveMarketPref(list) {
  const valid = (list || []).filter((m) => MARKETS.some((x) => x.id === m));
  const final = valid.length ? Array.from(new Set(valid)) : ['IN'];
  try { localStorage.setItem(MARKETS_KEY, JSON.stringify(final)); } catch { /* ignore */ }
  notify();
  return final;
}

/* ---------- archive gating ---------- */

/** Free users see the newest FREE_ARCHIVE_LIMIT editions; Pro sees all. */
export function visibleArchiveCount(total) {
  if (isNewsletterPro()) return total;
  return Math.min(total, FREE_ARCHIVE_LIMIT);
}
