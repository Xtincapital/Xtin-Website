/**
 * XtinRegion — shared region-awareness for Xtin Gini (family financial planner).
 *
 * Resolves the visitor's region (localStorage override → IP → timezone/locale
 * heuristic → US), exposes currency + symbol, financial jargon (SIP/PPF vs
 * 401k/IRA), planning defaults (inflation, equity return, retirement age),
 * live FX (frankfurter, base USD) and money formatting. Changing the region
 * persists and fires `xtin:region-changed` so open views re-render.
 *
 * Loaded before app.js so `window.XtinRegion` is ready at boot.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'xtin_region_v1';
  var IP_CACHE_KEY = 'xtin_ip_region';
  var FX_CACHE_KEY = 'xtin_fx_rates';
  var TOAST_KEY = 'xtin_region_toast_v1';

  var REGIONS = {
    IN: { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹',
      locale: 'en-IN', timezone: 'Asia/Kolkata', numberSystem: 'lakh',
      jargon: { sip: 'SIP', taxWrapper: 'PPF/ELSS', retirement: 'EPF/NPS', insurance: 'term insurance' },
      defaults: { inflation: 6, equityReturn: 12, retirementAge: 60 } },
    US: { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$',
      locale: 'en-US', timezone: 'America/New_York', numberSystem: 'western',
      jargon: { sip: 'recurring investing (DCA)', taxWrapper: 'Roth IRA/401(k)', retirement: '401(k)/IRA', insurance: 'term life insurance' },
      defaults: { inflation: 2.5, equityReturn: 8, retirementAge: 65 } },
    GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£',
      locale: 'en-GB', timezone: 'Europe/London', numberSystem: 'western',
      jargon: { sip: 'regular investing', taxWrapper: 'ISA', retirement: 'SIPP/pension', insurance: 'life cover' },
      defaults: { inflation: 2.5, equityReturn: 7, retirementAge: 66 } },
    EU: { code: 'EU', name: 'Europe', flag: '🇪🇺', currency: 'EUR', symbol: '€',
      locale: 'de-DE', timezone: 'Europe/Berlin', numberSystem: 'western',
      jargon: { sip: 'savings plan (Sparplan)', taxWrapper: 'tax-advantaged account', retirement: 'pension', insurance: 'life insurance' },
      defaults: { inflation: 2, equityReturn: 7, retirementAge: 65 } },
    AE: { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', symbol: 'AED ',
      locale: 'en-AE', timezone: 'Asia/Dubai', numberSystem: 'western',
      jargon: { sip: 'recurring investing', taxWrapper: 'savings plan', retirement: 'pension / end-of-service', insurance: 'term life insurance' },
      defaults: { inflation: 2.5, equityReturn: 7, retirementAge: 60 } },
    SG: { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$',
      locale: 'en-SG', timezone: 'Asia/Singapore', numberSystem: 'western',
      jargon: { sip: 'recurring investing (RSP)', taxWrapper: 'SRS', retirement: 'CPF', insurance: 'term life insurance' },
      defaults: { inflation: 2, equityReturn: 7, retirementAge: 63 } },
    GLOBAL: { code: 'GLOBAL', name: 'Global', flag: '🌍', currency: 'USD', symbol: '$',
      locale: 'en-US', timezone: 'UTC', numberSystem: 'western',
      jargon: { sip: 'recurring investing', taxWrapper: 'tax-advantaged account', retirement: 'retirement account', insurance: 'term life insurance' },
      defaults: { inflation: 3, equityReturn: 8, retirementAge: 65 } }
  };

  var FALLBACK_RATES = { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79, AED: 3.67, SGD: 1.35 };

  var _region = 'US';
  var _rates = {};
  for (var k in FALLBACK_RATES) _rates[k] = FALLBACK_RATES[k];
  var subscribers = [];

  function countryToRegion(country) {
    var c = (country || '').toUpperCase();
    if (c === 'IN') return 'IN';
    if (c === 'US') return 'US';
    if (c === 'GB' || c === 'UK') return 'GB';
    if (c === 'AE') return 'AE';
    if (c === 'SG') return 'SG';
    var EUROZONE = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'GR', 'SK', 'SI', 'LU', 'LV', 'LT', 'EE', 'CY', 'MT'];
    if (EUROZONE.indexOf(c) !== -1) return 'EU';
    return 'GLOBAL';
  }

  function readSaved() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v && REGIONS[v]) return v;
    } catch (e) {}
    return null;
  }

  function heuristicRegion() {
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || '';
      var locale = (navigator.language || '').toLowerCase();
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' || locale.slice(-3) === '-in') return 'IN';
      if (tz === 'Europe/London' || locale.slice(-3) === '-gb') return 'GB';
      if (tz === 'Asia/Dubai') return 'AE';
      if (tz === 'Asia/Singapore') return 'SG';
      if (tz.indexOf('Europe/') === 0) return 'EU';
      if (tz.indexOf('America/') === 0) return 'US';
    } catch (e) {}
    return 'US';
  }

  function ipRegion() {
    try {
      var cached = JSON.parse(localStorage.getItem(IP_CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.at < 24 * 3600 * 1000) && cached.region) {
        return Promise.resolve(cached.region);
      }
    } catch (e) {}

    var endpoints = [
      { url: 'https://ipapi.co/json/', pick: function (d) { return d.country_code || d.country; } },
      { url: 'https://ipwho.is/', pick: function (d) { return d.country_code; } }
    ];

    function tryEndpoint(i) {
      if (i >= endpoints.length) return Promise.resolve(null);
      var ep = endpoints[i];
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 2000);
      return fetch(ep.url, { signal: ctrl.signal })
        .then(function (res) { clearTimeout(timer); return res.ok ? res.json() : null; })
        .then(function (data) {
          if (!data) return tryEndpoint(i + 1);
          var country = ep.pick(data);
          if (!country) return tryEndpoint(i + 1);
          var region = countryToRegion(country);
          try { localStorage.setItem(IP_CACHE_KEY, JSON.stringify({ region: region, at: Date.now() })); } catch (e) {}
          return region;
        })
        .catch(function () { clearTimeout(timer); return tryEndpoint(i + 1); });
    }
    return tryEndpoint(0);
  }

  function notify() {
    for (var i = 0; i < subscribers.length; i++) {
      try { subscribers[i](_region); } catch (e) {}
    }
    try { window.dispatchEvent(new CustomEvent('xtin:region-changed', { detail: _region })); } catch (e) {}
  }

  function detectRegion() {
    var saved = readSaved();
    if (saved) { _region = saved; return Promise.resolve(saved); }
    _region = heuristicRegion();
    return ipRegion().then(function (ip) {
      if (ip) _region = ip;
      notify();
      try {
        if (!localStorage.getItem(TOAST_KEY)) {
          window.dispatchEvent(new CustomEvent('xtin:region-detected', { detail: _region }));
        }
      } catch (e) {}
      return _region;
    });
  }

  function getRegion() { return _region; }
  function getRegionConfig(code) { return REGIONS[code || _region]; }

  function setRegion(code) {
    if (!REGIONS[code]) return;
    _region = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    notify();
  }

  function ackRegionToast() {
    try { localStorage.setItem(TOAST_KEY, '1'); } catch (e) {}
  }

  function subscribe(cb) {
    subscribers.push(cb);
    return function () {
      var idx = subscribers.indexOf(cb);
      if (idx !== -1) subscribers.splice(idx, 1);
    };
  }

  function currencySymbol(code) { return REGIONS[code || _region].symbol; }

  function getRates() {
    try {
      var cached = JSON.parse(localStorage.getItem(FX_CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.at < 12 * 3600 * 1000) && cached.rates) {
        _rates = Object.assign({ USD: 1 }, cached.rates);
        return Promise.resolve(_rates);
      }
    } catch (e) {}
    return fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP,AED,SGD')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.rates) {
          _rates = Object.assign({ USD: 1 }, data.rates);
          try { localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rates: data.rates, at: Date.now() })); } catch (e) {}
        }
        return _rates;
      })
      .catch(function () { return _rates; });
  }

  function rate(cur) {
    return _rates[cur] != null ? _rates[cur] : (FALLBACK_RATES[cur] != null ? FALLBACK_RATES[cur] : 1);
  }

  function convert(amount, from, to) {
    var rFrom = rate(from), rTo = rate(to);
    if (!rFrom) return amount;
    return (amount / rFrom) * rTo;
  }

  function formatMoney(amount, opts) {
    opts = opts || {};
    var cfg = REGIONS[opts.region || _region];
    var sym = cfg.symbol;
    var n = Number(amount) || 0;
    if (opts.compact) {
      var abs = Math.abs(n);
      if (cfg.numberSystem === 'lakh') {
        if (abs >= 1e7) return sym + (n / 1e7).toFixed(2).replace(/\.00$/, '') + 'Cr';
        if (abs >= 1e5) return sym + (n / 1e5).toFixed(2).replace(/\.00$/, '') + 'L';
      } else {
        if (abs >= 1e9) return sym + (n / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
        if (abs >= 1e6) return sym + (n / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
        if (abs >= 1e3) return sym + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
      }
    }
    return sym + Math.round(n).toLocaleString(cfg.locale);
  }

  window.XtinRegion = {
    REGIONS: REGIONS,
    ORDER: ['IN', 'US', 'GB', 'EU', 'AE', 'SG', 'GLOBAL'],
    detectRegion: detectRegion,
    getRegion: getRegion,
    getRegionConfig: getRegionConfig,
    setRegion: setRegion,
    subscribe: subscribe,
    ackRegionToast: ackRegionToast,
    currencySymbol: currencySymbol,
    getRates: getRates,
    convert: convert,
    rate: rate,
    formatMoney: formatMoney
  };
})();
