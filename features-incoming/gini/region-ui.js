/**
 * Region UI layer for Xtin Gini — mounts the region/currency switcher, runs a
 * one-time DOM localization sweep (labels, input prefixes, slider endpoints and
 * the hero showcase), shows the first-visit toast, and re-renders currency
 * views when the region changes. Loads after app.js + gini-premium.js.
 */
(function () {
  'use strict';
  if (!window.XtinRegion) return;

  // ---- styles ----
  var style = document.createElement('style');
  style.textContent = [
    '.gini-region-switcher{margin-top:10px}',
    '.gini-region-switcher select{width:100%;font:inherit;font-size:.8rem;font-weight:600;',
    '  padding:6px 8px;border-radius:8px;border:1px solid rgba(148,163,184,.35);',
    '  background:rgba(255,255,255,.06);color:inherit;cursor:pointer}',
    '.gini-region-switcher--landing{margin-top:0}',
    '.gini-region-switcher--landing select{background:rgba(255,255,255,.9);color:#0f172a;',
    '  border-color:rgba(148,163,184,.4)}',
    '.hero-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.hero-topbar .gini-region-switcher{min-width:150px}'
  ].join('\n');
  document.head.appendChild(style);

  // ---- switcher ----
  function mountSwitcher(container) {
    if (!container) return;
    container.innerHTML = '';
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', 'Region and currency');
    XtinRegion.ORDER.forEach(function (code) {
      var cfg = XtinRegion.REGIONS[code];
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = cfg.flag + '  ' + cfg.name + ' (' + cfg.currency + ')';
      sel.appendChild(opt);
    });
    sel.value = XtinRegion.getRegion();
    sel.addEventListener('change', function () { XtinRegion.setRegion(this.value); });
    container.appendChild(sel);
  }

  function syncSwitchers() {
    document.querySelectorAll('#giniRegionSwitcher select, #giniRegionSwitcherLanding select')
      .forEach(function (sel) { sel.value = XtinRegion.getRegion(); });
  }

  // ---- currency DOM localization (static text only) ----
  // Region-natural showcase numbers for the hero card (NOT FX-converted).
  var SHOWCASE = {
    IN:     { amount: '₹48,32,500', delta: '↑ ₹7,20,000 from last year', assets: '₹62.1L', liab: '₹13.8L', invested: '₹31.5L' },
    US:     { amount: '$584,000',   delta: '↑ $87,000 from last year',   assets: '$750K',  liab: '$166K',  invested: '$380K' },
    GB:     { amount: '£438,000',   delta: '↑ £61,000 from last year',   assets: '£560K',  liab: '£122K',  invested: '£290K' },
    EU:     { amount: '€512,000',   delta: '↑ €74,000 from last year',   assets: '€640K',  liab: '€128K',  invested: '€330K' },
    AE:     { amount: 'AED 2,140,000', delta: '↑ AED 320,000 from last year', assets: 'AED 2.7M', liab: 'AED 560K', invested: 'AED 1.4M' },
    SG:     { amount: 'S$780,000',  delta: '↑ S$110,000 from last year', assets: 'S$1.0M', liab: 'S$220K', invested: 'S$520K' },
    GLOBAL: { amount: '$584,000',   delta: '↑ $87,000 from last year',   assets: '$750K',  liab: '$166K',  invested: '$380K' }
  };

  // Parse an Indian-notation money string ("₹5 Cr", "₹10.00 L", "₹48,32,500")
  // into an absolute number so it can be re-formatted for any region.
  function parseMoney(str) {
    var s = String(str).replace(/[₹$€£]|AED|S\$/g, '').trim();
    var mult = 1;
    if (/cr|crore/i.test(s)) { mult = 1e7; s = s.replace(/crore|cr/i, ''); }
    else if (/\bl\b|lakh/i.test(s)) { mult = 1e5; s = s.replace(/lakh|l/i, ''); }
    else if (/\bk\b/i.test(s)) { mult = 1e3; s = s.replace(/k/i, ''); }
    else if (/\bm\b|mn/i.test(s)) { mult = 1e6; s = s.replace(/mn|m/i, ''); }
    var num = parseFloat(s.replace(/,/g, '')) || 0;
    return num * mult;
  }

  function localizeText(orig) {
    var sym = XtinRegion.currencySymbol().trim();
    return orig
      .replace(/\(₹\)/g, '(' + sym + ')')
      .replace(/₹\s*[\d.,]+\s*(?:Cr|Crore|L|Lakh)?/gi, function (m) {
        var compact = /(Cr|Crore|L|Lakh)/i.test(m);
        return XtinRegion.formatMoney(parseMoney(m), { compact: compact });
      })
      .replace(/₹/g, sym);
  }

  function localizeCurrencyDOM() {
    var region = XtinRegion.getRegion();

    // Hero showcase (explicit region-natural numbers).
    var sc = SHOWCASE[region] || SHOWCASE.GLOBAL;
    var amt = document.querySelector('.hdc-amount');
    var delta = document.querySelector('.hdc-delta');
    if (amt) amt.textContent = sc.amount;
    if (delta) delta.textContent = sc.delta;
    var items = document.querySelectorAll('.hdc-item-val');
    if (items[0]) items[0].textContent = sc.assets;
    if (items[1]) items[1].textContent = sc.liab;
    if (items[2]) items[2].textContent = sc.invested;

    // Static currency text: labels, table headers, input prefixes and slider
    // endpoint scales. Skip elements with an id (those are JS-managed dynamic
    // values that already format through the region-aware formatCurrency).
    var nodes = document.querySelectorAll('label, th, .mc-input-prefix, .ret-input-prefix, .rr-range-scale span, .calc-slider-scale span');
    nodes.forEach(function (el) {
      if (el.id || el.children.length) return;
      if (el.closest('.hero-dashboard-card')) return; // handled above
      var orig = el.getAttribute('data-cur-orig');
      if (orig === null) {
        if (el.textContent.indexOf('₹') === -1) return;
        orig = el.textContent;
        el.setAttribute('data-cur-orig', orig);
      }
      el.textContent = localizeText(orig);
    });
  }

  // ---- re-render currency-heavy views on region change ----
  function refreshCurrencyViews() {
    localizeCurrencyDOM();
    try { window.dashboard && dashboard.refresh && dashboard.refresh(); } catch (e) {}
    try { window.networth && networth.renderAssets && networth.renderAssets(); } catch (e) {}
    try { window.networth && networth.renderLiabilities && networth.renderLiabilities(); } catch (e) {}
    try { window.networth && networth.updateSummary && networth.updateSummary(); } catch (e) {}
    try { window.portfolio && portfolio.refresh && portfolio.refresh(); } catch (e) {}
    try { window.goals && goals.renderGoals && goals.renderGoals(); } catch (e) {}
    try { window.landingPageRefresh && window.landingPageRefresh(); } catch (e) {}
    // Re-render every slider's value label through its own (now region-aware)
    // input handler — reads the numeric slider value, so never shows a stale
    // currency glyph.
    document.querySelectorAll('input[type=range]').forEach(function (r) {
      try { r.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    });
  }

  // ---- boot ----
  function boot() {
    mountSwitcher(document.getElementById('giniRegionSwitcher'));
    mountSwitcher(document.getElementById('giniRegionSwitcherLanding'));

    // First-visit toast.
    window.addEventListener('xtin:region-detected', function (e) {
      var cfg = XtinRegion.getRegionConfig(e.detail);
      XtinRegion.ackRegionToast();
      if (window.GiniUX && GiniUX.toast) {
        GiniUX.toast(cfg.flag + ' Currency & examples set for ' + cfg.name + ' — change anytime from the switcher');
      }
    });

    XtinRegion.subscribe(function () { syncSwitchers(); refreshCurrencyViews(); });

    XtinRegion.getRates().then(function () { refreshCurrencyViews(); });
    XtinRegion.detectRegion().then(function () {
      syncSwitchers();
      refreshCurrencyViews();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
