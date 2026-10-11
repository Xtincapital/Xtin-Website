import { BACKEND_URL } from '../config/env';

/**
 * Region service — makes the Xtin Capital site region-aware.
 *
 * Resolves the visitor's region (localStorage override → IP → timezone/locale
 * heuristic → US) and exposes currency + symbol, money formatting, financial
 * jargon (so "SIP" becomes "recurring investing" outside India), live FX and
 * region-natural showcase numbers. Changing the region persists and fires
 * `xtin:region-changed` so subscribers re-render.
 */

const STORAGE_KEY = 'xtin_region_v1';
const IP_CACHE_KEY = 'xtin_ip_region';
const FX_CACHE_KEY = 'xtin_fx_rates';
const TOAST_KEY = 'xtin_region_toast_v1';
const FX_CACHE_MS = 6 * 3600 * 1000; // the server refreshes daily; this just avoids refetching on every page load

export const REGIONS = {
  IN: {
    code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹',
    locale: 'en-IN', timezone: 'Asia/Kolkata', numberSystem: 'lakh',
    jargon: { sip: 'SIP Calculator', swp: 'SWP Calculator', stepUp: 'Step-up SIP', dca: 'SIP' },
    defaults: { inflation: 6, equityReturn: 12, retirementAge: 60 },
  },
  US: {
    code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$',
    locale: 'en-US', timezone: 'America/New_York', numberSystem: 'western',
    jargon: { sip: 'Recurring Investment (DCA) Calculator', swp: 'Retirement Drawdown Calculator', stepUp: 'Step-up Investing', dca: 'recurring investing' },
    defaults: { inflation: 2.5, equityReturn: 8, retirementAge: 65 },
  },
  GB: {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£',
    locale: 'en-GB', timezone: 'Europe/London', numberSystem: 'western',
    jargon: { sip: 'Regular Investment Calculator', swp: 'Retirement Drawdown Calculator', stepUp: 'Step-up Investing', dca: 'regular investing' },
    defaults: { inflation: 2.5, equityReturn: 7, retirementAge: 66 },
  },
  EU: {
    code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', symbol: '€',
    locale: 'de-DE', timezone: 'Europe/Berlin', numberSystem: 'western',
    jargon: { sip: 'Savings Plan Calculator', swp: 'Retirement Drawdown Calculator', stepUp: 'Step-up Investing', dca: 'savings plan' },
    defaults: { inflation: 2, equityReturn: 7, retirementAge: 65 },
  },
  AE: {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', symbol: 'AED ',
    locale: 'en-AE', timezone: 'Asia/Dubai', numberSystem: 'western',
    jargon: { sip: 'Recurring Investment Calculator', swp: 'Retirement Drawdown Calculator', stepUp: 'Step-up Investing', dca: 'recurring investing' },
    defaults: { inflation: 2.5, equityReturn: 7, retirementAge: 60 },
  },
  SG: {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$',
    locale: 'en-SG', timezone: 'Asia/Singapore', numberSystem: 'western',
    jargon: { sip: 'Recurring Investment (RSP) Calculator', swp: 'Retirement Drawdown Calculator', stepUp: 'Step-up Investing', dca: 'recurring investing' },
    defaults: { inflation: 2, equityReturn: 7, retirementAge: 63 },
  },
  GLOBAL: {
    code: 'GLOBAL', name: 'Global', flag: '🌍', currency: 'USD', symbol: '$',
    locale: 'en-US', timezone: 'UTC', numberSystem: 'western',
    jargon: { sip: 'Recurring Investment (DCA) Calculator', swp: 'Retirement Drawdown Calculator', stepUp: 'Step-up Investing', dca: 'recurring investing' },
    defaults: { inflation: 3, equityReturn: 8, retirementAge: 65 },
  },
};

export const REGION_ORDER = ['IN', 'US', 'GB', 'EU', 'AE', 'SG', 'GLOBAL'];

// Used only until live rates arrive (and if every source is down). Kept near current values.
const FALLBACK_RATES = { USD: 1, INR: 96.7, EUR: 0.89, GBP: 0.76, AED: 3.6725, SGD: 1.28 };

let _region = 'US';
let _rates = { ...FALLBACK_RATES };
// Where the current rates came from; shown in the navbar's rate popover.
let _ratesMeta: { asOf: string | null; live: boolean } = { asOf: null, live: false };
const subscribers = new Set<(region: string) => void>();

export function countryToRegion(country) {
  const c = (country || '').toUpperCase();
  if (c === 'IN') return 'IN';
  if (c === 'US') return 'US';
  if (c === 'GB' || c === 'UK') return 'GB';
  if (c === 'AE') return 'AE';
  if (c === 'SG') return 'SG';
  const EUROZONE = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'GR', 'SK', 'SI', 'LU', 'LV', 'LT', 'EE', 'CY', 'MT'];
  if (EUROZONE.includes(c)) return 'EU';
  return 'GLOBAL';
}

function readSaved() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && REGIONS[v]) return v;
  } catch { /* ignore */ }
  return null;
}

export function heuristicRegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = (navigator.language || '').toLowerCase();
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' || locale.endsWith('-in')) return 'IN';
    if (tz === 'Europe/London' || locale.endsWith('-gb')) return 'GB';
    if (tz === 'Asia/Dubai') return 'AE';
    if (tz === 'Asia/Singapore') return 'SG';
    if (tz.startsWith('Europe/')) return 'EU';
    if (tz.startsWith('America/')) return 'US';
  } catch { /* ignore */ }
  return 'US';
}

async function ipRegion() {
  try {
    const cached = JSON.parse(localStorage.getItem(IP_CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.at < 24 * 3600 * 1000 && cached.region) return cached.region;
  } catch { /* ignore */ }

  const endpoints = [
    { url: 'https://ipapi.co/json/', pick: (d) => d.country_code || d.country },
    { url: 'https://ipwho.is/', pick: (d) => d.country_code },
  ];
  for (const ep of endpoints) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(ep.url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const data = await res.json();
      const country = ep.pick(data);
      if (country) {
        const region = countryToRegion(country);
        try { localStorage.setItem(IP_CACHE_KEY, JSON.stringify({ region, at: Date.now() })); } catch { /* ignore */ }
        return region;
      }
    } catch { /* try next */ }
  }
  return null;
}

function notify() {
  subscribers.forEach((cb) => { try { cb(_region); } catch { /* ignore */ } });
  try { window.dispatchEvent(new CustomEvent('xtin:region-changed', { detail: _region })); } catch { /* ignore */ }
}

export async function detectRegion() {
  const saved = readSaved();
  if (saved) { _region = saved; return saved; }
  _region = heuristicRegion();
  const ip = await ipRegion();
  if (ip) _region = ip;
  notify();
  try {
    if (!localStorage.getItem(TOAST_KEY)) {
      window.dispatchEvent(new CustomEvent('xtin:region-detected', { detail: _region }));
    }
  } catch { /* ignore */ }
  return _region;
}

export function ackRegionToast() {
  try { localStorage.setItem(TOAST_KEY, '1'); } catch { /* ignore */ }
}

export function getRegion() { return _region; }
export function getRegionConfig(code?: string) { return REGIONS[code || _region]; }
export function isIndia() { return _region === 'IN'; }

export function setRegion(code) {
  if (!REGIONS[code]) return;
  _region = code;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  notify();
}

export function subscribeRegion(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function currencySymbol(code?: string) { return REGIONS[code || _region].symbol; }

export async function getRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(FX_CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.at < FX_CACHE_MS && cached.rates) {
      _rates = { USD: 1, ...cached.rates };
      _ratesMeta = cached.meta ?? { asOf: null, live: true };
      return _rates;
    }
  } catch { /* ignore */ }

  // Our own server first (one shared daily copy), then the public source directly.
  const sources: Array<() => Promise<{ rates: Record<string, number>; asOf: string | null } | null>> = [
    async () => {
      const data = await fetchJson(`${BACKEND_URL}/api/fx/rates`);
      // The server may be serving its built-in rates (source "fallback") — not worth showing as live.
      if (!data?.data?.rates || data.data.source === 'fallback') return null;
      return { rates: data.data.rates, asOf: data.data.asOf ?? null };
    },
    async () => {
      const data = await fetchJson('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP,SGD');
      return data?.rates ? { rates: data.rates, asOf: data.date ?? null } : null;
    },
  ];
  for (const load of sources) {
    try {
      const result = await load();
      if (result && result.rates.INR > 0) {
        _rates = { ...FALLBACK_RATES, ...result.rates, USD: 1 };
        _ratesMeta = { asOf: result.asOf, live: true };
        try { localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rates: _rates, meta: _ratesMeta, at: Date.now() })); } catch { /* ignore */ }
        return _rates;
      }
    } catch { /* try the next source */ }
  }
  return _rates; // keep the fallback
}

async function fetchJson(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res.ok ? await res.json() : null;
  } finally {
    clearTimeout(t);
  }
}

/** Current rates (units per 1 USD) plus where they came from. Call getRates() first to load them. */
export function getRatesSnapshot() {
  return { rates: { ..._rates }, ..._ratesMeta };
}

export function convert(amount, from, to) {
  const rFrom = _rates[from] ?? FALLBACK_RATES[from] ?? 1;
  const rTo = _rates[to] ?? FALLBACK_RATES[to] ?? 1;
  if (!rFrom) return amount;
  return (amount / rFrom) * rTo;
}

export function formatMoney(amount, opts: { region?: string; compact?: boolean } = {}) {
  const cfg = REGIONS[opts.region || _region];
  const sym = cfg.symbol;
  const n = Number(amount) || 0;
  if (opts.compact) {
    const abs = Math.abs(n);
    if (cfg.numberSystem === 'lakh') {
      if (abs >= 1e7) return `${sym}${(n / 1e7).toFixed(2).replace(/\.00$/, '')}Cr`;
      if (abs >= 1e5) return `${sym}${(n / 1e5).toFixed(2).replace(/\.00$/, '')}L`;
    } else {
      if (abs >= 1e9) return `${sym}${(n / 1e9).toFixed(2).replace(/\.00$/, '')}B`;
      if (abs >= 1e6) return `${sym}${(n / 1e6).toFixed(2).replace(/\.00$/, '')}M`;
      if (abs >= 1e3) return `${sym}${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
    }
  }
  return `${sym}${Math.round(n).toLocaleString(cfg.locale)}`;
}
