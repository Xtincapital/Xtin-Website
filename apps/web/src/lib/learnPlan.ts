/**
 * Learn Pro plan — client-side plan state + gating rules for Xtin Academy.
 *
 * Free tier (generous by design): every Beginner module in full, plus the
 * first FREE_PREVIEW_LESSONS of every Intermediate/Advanced module — the
 * learner always gets a real taste before any lock appears.
 *
 * Pro unlocks all 20 modules (~200 lessons), all certificates, and the
 * premium courses at launch.
 *
 * The SERVER record (learn_pro_plans, written only after Razorpay signature
 * verification) is authoritative; localStorage is just a fast cache so the
 * UI doesn't flash between reloads. Pricing uses regional charm price
 * points — the local price IS the price, never an FX conversion.
 */
import { MODULES_CONFIG, DIFFICULTY_LEVELS } from '../constants/learningModules';
import { getRegion } from './region';

const PLAN_KEY = 'xtin_learn_plan_v1';

export const FREE_PREVIEW_LESSONS = 2;

// Regional charm price points (whole units). Kept in sync with the
// server-side catalogue in backend/controllers/learnPlan.controller.mjs.
export const LEARN_PRICING = {
  IN:     { currency: 'INR', symbol: '₹', monthly: 99,   yearly: 499,   upi: true,
            perDay: '₹1.4', anchor: 'A single finance course elsewhere costs ₹5,000–₹50,000.' },
  US:     { currency: 'USD', symbol: '$', monthly: 2.99, yearly: 14.99,
            perDay: '4¢', anchor: 'A single finance course elsewhere costs $200–$2,000.' },
  GB:     { currency: 'GBP', symbol: '£', monthly: 2.49, yearly: 11.99,
            perDay: '3p', anchor: 'A single finance course elsewhere costs £150–£1,500.' },
  EU:     { currency: 'EUR', symbol: '€', monthly: 2.99, yearly: 13.99,
            perDay: '4c', anchor: 'A single finance course elsewhere costs €180–€1,800.' },
  AE:     { currency: 'USD', symbol: '$', monthly: 2.99, yearly: 14.99,
            perDay: '4¢', anchor: 'A single finance course elsewhere costs $200–$2,000.' },
  SG:     { currency: 'USD', symbol: '$', monthly: 2.99, yearly: 14.99,
            perDay: '4¢', anchor: 'A single finance course elsewhere costs $200–$2,000.' },
  GLOBAL: { currency: 'USD', symbol: '$', monthly: 2.99, yearly: 14.99,
            perDay: '4¢', anchor: 'A single finance course elsewhere costs $200–$2,000.' },
};

export function learnPricing() {
  const code = getRegion() || 'IN';
  return LEARN_PRICING[code] || LEARN_PRICING.GLOBAL;
}

/**
 * Format a price using Intl.NumberFormat for canonical locale-aware output.
 * Falls back to simple symbol+number if the formatter throws.
 */
export function formatLearnPrice(amount, pricing = learnPricing()) {
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
  try { window.dispatchEvent(new CustomEvent('xtin:learn-plan-changed')); } catch { /* ignore */ }
}

export function subscribeLearnPlan(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function getLearnPlan() {
  return readPlan();
}

export function isLearnPro() {
  try {
    const storedSubs = JSON.parse(localStorage.getItem('xtin_user_subscriptions') || '{}');
    if (storedSubs.learn || storedSubs.bundle || localStorage.getItem('learn_pro') === 'true' || localStorage.getItem('ultimate_bundle_active') === 'true') {
      return true;
    }
  } catch { /* ignore */ }
  const p = readPlan();
  if (!p || p.tier !== 'pro') return false;
  if (p.validUntil && Date.now() > new Date(p.validUntil).getTime()) {
    writePlan(null); // expired — quietly back to free
    return false;
  }
  return true;
}

/** Cache a server-verified plan locally (server stays authoritative). */
export function setLearnPlanFromServer(record) {
  if (!record || !record.plan_id) { writePlan(null); return; }
  writePlan({
    tier: 'pro',
    planId: record.plan_id,
    billing: record.billing,
    validUntil: record.valid_until,
    activatedAt: record.activated_at,
  });
}

/* ---------- gating rules ---------- */

const moduleById = Object.fromEntries(MODULES_CONFIG.map((m) => [m.id, m]));

export function getModuleConfig(moduleSlug) {
  return moduleById[moduleSlug] || null;
}

/** Beginner modules are free in full; everything else gets a free preview. */
export function isModuleFree(moduleSlug) {
  const mod = moduleById[moduleSlug];
  if (!mod) return true; // unknown module — never lock what we can't identify
  return mod.difficulty === DIFFICULTY_LEVELS.BEGINNER;
}

/**
 * Is this specific lesson behind the Pro plan for the current user?
 * lessonSlug is "lesson-N".
 */
export function isLessonLocked(moduleSlug, lessonSlug) {
  if (isLearnPro()) return false;
  if (isModuleFree(moduleSlug)) return false;
  const n = parseInt(String(lessonSlug).replace('lesson-', ''), 10);
  if (!Number.isFinite(n)) return false;
  return n > FREE_PREVIEW_LESSONS;
}

/** Totals used by value-stack copy ("8 full modules, 90+ lessons free"). */
export function learnCatalogueStats() {
  const free = MODULES_CONFIG.filter((m) => m.difficulty === DIFFICULTY_LEVELS.BEGINNER);
  const locked = MODULES_CONFIG.filter((m) => m.difficulty !== DIFFICULTY_LEVELS.BEGINNER);
  return {
    totalModules: MODULES_CONFIG.length,
    totalLessons: MODULES_CONFIG.reduce((s, m) => s + (m.lessons || 0), 0),
    freeModules: free.length,
    freeLessons: free.reduce((s, m) => s + (m.lessons || 0), 0)
      + locked.length * FREE_PREVIEW_LESSONS,
    proModules: locked.length,
    proLessons: locked.reduce((s, m) => s + (m.lessons || 0), 0)
      - locked.length * FREE_PREVIEW_LESSONS,
  };
}
