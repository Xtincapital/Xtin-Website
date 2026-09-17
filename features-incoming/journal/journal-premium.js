/* ═══════════════════════════════════════════════════════════════════════
   XTIN JOURNAL PREMIUM LAYER
   1. JournalUX   — premium confirm dialogs
   2. JournalTour — interactive spotlight product tour
   3. JournalPlan — Free/Pro tiers, feature gating, Razorpay checkout

   Loaded after app.js + ai-coach.js. Uses the app's global helpers
   (showToast, switchTab, getBackendURL, openJournalAuthModal) and the
   FastAPI plan endpoints in main.py.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') showToast(msg, type);
  };

  /* ─────────────────────────────────────────────
     1. JournalUX — confirm dialog
     ───────────────────────────────────────────── */
  const JournalUX = {
    confirm(options = {}) {
      return new Promise((resolve) => {
        const { title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;

        const backdrop = document.createElement('div');
        backdrop.className = 'jr-confirm-backdrop';
        backdrop.innerHTML = `
          <div class="jr-confirm-card ${danger ? 'jr-confirm-card--danger' : ''}" role="alertdialog" aria-modal="true">
            <div class="jr-confirm-icon">
              ${danger
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'}
            </div>
            <h4 class="jr-confirm-title">${esc(title)}</h4>
            <p class="jr-confirm-message">${esc(message)}</p>
            <div class="jr-confirm-actions">
              <button class="jr-confirm-btn jr-confirm-btn--cancel" type="button">${esc(cancelText)}</button>
              <button class="jr-confirm-btn jr-confirm-btn--ok" type="button">${esc(confirmText)}</button>
            </div>
          </div>`;

        document.body.appendChild(backdrop);
        requestAnimationFrame(() => backdrop.classList.add('is-open'));

        const close = (result) => {
          backdrop.classList.remove('is-open');
          setTimeout(() => backdrop.remove(), 240);
          document.removeEventListener('keydown', onKey);
          resolve(result);
        };
        const onKey = (e) => {
          if (e.key === 'Escape') close(false);
          if (e.key === 'Enter') close(true);
        };

        backdrop.querySelector('.jr-confirm-btn--ok').addEventListener('click', () => close(true));
        backdrop.querySelector('.jr-confirm-btn--cancel').addEventListener('click', () => close(false));
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false); });
        document.addEventListener('keydown', onKey);
        setTimeout(() => backdrop.querySelector('.jr-confirm-btn--ok').focus(), 120);
      });
    }
  };

  window.JournalUX = JournalUX;

  /* ─────────────────────────────────────────────
     2. JournalTour — spotlight product tour
     ───────────────────────────────────────────── */
  const TOUR_DONE_KEY = 'journal_tour_v1_done';

  const TOUR_STEPS = [
    {
      id: 'welcome', center: true, badge: '✦',
      eyebrow: 'Welcome to Xtin Journal',
      title: 'Where serious traders find their edge',
      desc: 'The market rewards discipline, not luck. In the next minute you\'ll see how this journal turns every trade you log into insight about YOUR patterns — what works, what bleeds, and why.',
      next: 'Show me around'
    },
    {
      id: 'addTrade', target: '#dashboard-tab .btn.btn-primary',
      eyebrow: 'The habit that changes everything',
      title: 'Log a trade in under 30 seconds',
      desc: 'Entry, exit, strategy, and how you felt. That last one matters more than you think — emotion tags power the Psychology analysis later.'
    },
    {
      id: 'tabs', target: '.tabs-container',
      eyebrow: 'Eleven lenses on your trading',
      title: 'Every angle of your performance',
      desc: 'Dashboard for today, Calendar for the month, Metrics for the truth. The gold PRO tabs — Psychology, Hourly, Analytics, Heatmaps — reveal the patterns most traders never see.'
    },
    {
      id: 'goals', target: '#goalCardsContainer', fallbackTarget: '#goalEmptyState',
      eyebrow: 'Goal tracker',
      title: 'Set targets that keep you honest',
      desc: 'A monthly P&L goal or a win-rate target — progress updates automatically as you log trades. Traders with written goals quit revenge-trading faster.'
    },
    {
      id: 'coach', target: '.ai-coach-fab', placement: 'top',
      eyebrow: 'Your AI trading coach',
      title: 'Ask about your own trades',
      desc: '"Why do I lose money on Fridays?" — the coach reads your actual trade history and answers with your real numbers, not generic advice.'
    },
    {
      id: 'finish', center: true, badge: '✦',
      eyebrow: 'You\'re ready',
      title: 'Your edge is in the data. Start logging.',
      desc: 'You\'re on the Free plan — unlimited manual trades, dashboard, calendar, metrics and goals, free forever. Pro unlocks the deep-pattern tools when you\'re ready to go further.',
      next: 'Start Trading Smarter'
    }
  ];

  const JournalTour = (() => {
    let overlay = null, spotlight = null, card = null;
    let steps = [], index = 0, active = false;
    let repositionRaf = null;

    function isDone() { return localStorage.getItem(TOUR_DONE_KEY) === 'true'; }

    function buildDom() {
      overlay = document.createElement('div');
      overlay.className = 'jr-tour-overlay';
      overlay.style.pointerEvents = 'auto';
      spotlight = document.createElement('div');
      spotlight.className = 'jr-tour-spotlight';
      card = document.createElement('div');
      card.className = 'jr-tour-card';
      overlay.appendChild(spotlight);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    function resolveTarget(step) {
      if (!step.target) return null;
      let el = document.querySelector(step.target);
      if ((!el || el.offsetParent === null) && step.fallbackTarget) {
        el = document.querySelector(step.fallbackTarget);
      }
      return (el && el.offsetParent !== null) ? el : null;
    }

    function renderCard(step) {
      const total = steps.length;
      const pct = Math.round(((index + 1) / total) * 100);
      card.innerHTML = `
        ${step.badge ? `<div class="jr-tour-badge">${step.badge}</div>` : ''}
        <div class="jr-tour-eyebrow">${esc(step.eyebrow || 'Xtin Journal')}</div>
        <h3 class="jr-tour-title">${esc(step.title)}</h3>
        <p class="jr-tour-desc">${esc(step.desc)}</p>
        <div class="jr-tour-progress">
          <div class="jr-tour-progress-track"><div class="jr-tour-progress-fill" style="width:${pct}%"></div></div>
          <span class="jr-tour-progress-label">${index + 1} of ${total}</span>
        </div>
        <div class="jr-tour-actions">
          <button class="jr-tour-skip" type="button">Skip tour</button>
          ${index > 0 ? '<button class="jr-tour-btn jr-tour-btn--back" type="button">Back</button>' : ''}
          <button class="jr-tour-btn jr-tour-btn--next" type="button">${esc(step.next || (index === steps.length - 1 ? 'Finish' : 'Next'))}</button>
        </div>`;

      card.querySelector('.jr-tour-skip').addEventListener('click', () => finish(true));
      card.querySelector('.jr-tour-btn--back')?.addEventListener('click', () => show(index - 1));
      card.querySelector('.jr-tour-btn--next').addEventListener('click', () => {
        if (index >= steps.length - 1) finish(false);
        else show(index + 1);
      });
      setTimeout(() => card.querySelector('.jr-tour-btn--next')?.focus(), 80);
    }

    function positionForTarget(step) {
      const target = resolveTarget(step);

      if (!target || step.center) {
        spotlight.classList.add('jr-tour-spotlight--none');
        card.classList.add('jr-tour-card--center');
        card.style.top = '';
        card.style.left = '';
        return;
      }

      spotlight.classList.remove('jr-tour-spotlight--none');
      card.classList.remove('jr-tour-card--center');

      const pad = 10;
      const r = target.getBoundingClientRect();
      const top = Math.max(8, r.top - pad);
      const left = Math.max(8, r.left - pad);
      const width = Math.min(window.innerWidth - left - 8, r.width + pad * 2);
      const height = Math.min(window.innerHeight - top - 8, r.height + pad * 2);

      spotlight.style.top = `${top}px`;
      spotlight.style.left = `${left}px`;
      spotlight.style.width = `${width}px`;
      spotlight.style.height = `${height}px`;

      const cw = Math.min(400, window.innerWidth - 32);
      const ch = card.offsetHeight || 260;
      const gap = 16;
      let cTop, cLeft;

      const fitsBelow = top + height + gap + ch < window.innerHeight - 8;
      const fitsAbove = top - gap - ch > 8;
      const fitsRight = left + width + gap + cw < window.innerWidth - 8;

      const placement = step.placement ||
        (fitsBelow ? 'bottom' : fitsAbove ? 'top' : fitsRight ? 'right' : 'center');

      if (placement === 'bottom' && fitsBelow) {
        cTop = top + height + gap;
        cLeft = Math.min(Math.max(8, left), window.innerWidth - cw - 8);
      } else if (placement === 'top' && fitsAbove) {
        cTop = top - gap - ch;
        cLeft = Math.min(Math.max(8, left), window.innerWidth - cw - 8);
      } else if (placement === 'right' && fitsRight) {
        cTop = Math.min(Math.max(8, top), window.innerHeight - ch - 8);
        cLeft = left + width + gap;
      } else {
        card.classList.add('jr-tour-card--center');
        return;
      }

      card.style.top = `${Math.max(8, cTop)}px`;
      card.style.left = `${Math.max(8, cLeft)}px`;
    }

    function show(i) {
      index = Math.max(0, Math.min(i, steps.length - 1));
      const step = steps[index];
      renderCard(step);

      const target = resolveTarget(step);
      if (target && !step.center) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => positionForTarget(step), 420);
      } else {
        positionForTarget(step);
      }
    }

    function reposition() {
      if (!active) return;
      if (repositionRaf) cancelAnimationFrame(repositionRaf);
      repositionRaf = requestAnimationFrame(() => positionForTarget(steps[index]));
    }

    function onKey(e) {
      if (!active) return;
      if (e.key === 'Escape') finish(true);
      else if (e.key === 'ArrowRight') { e.preventDefault(); card.querySelector('.jr-tour-btn--next')?.click(); }
      else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); show(index - 1); }
    }

    function finish(skipped) {
      active = false;
      localStorage.setItem(TOUR_DONE_KEY, 'true');
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('keydown', onKey);
      overlay?.remove();
      overlay = spotlight = card = null;
      if (!skipped) toast('Tour complete — your edge starts with the next trade you log. ✦', 'success');
    }

    function start() {
      if (active) return;
      steps = TOUR_STEPS.slice();
      active = true;
      buildDom();
      window.addEventListener('resize', reposition);
      window.addEventListener('scroll', reposition, true);
      document.addEventListener('keydown', onKey);
      show(0);
    }

    return { start, isDone };
  })();

  window.JournalTour = JournalTour;

  /* ─────────────────────────────────────────────
     3. JournalPlan — Free/Pro tiers + Razorpay
     ───────────────────────────────────────────── */
  const PLAN_KEY = 'journal_plan_v1';
  const PRO_TABS = ['psychology', 'hourly', 'analytics', 'heatmaps'];
  const FREE_LIMITS = { goals: 2 };
  const PLANS = {
    journal_pro_monthly: { id: 'journal_pro_monthly', amountINR: 299, label: 'Pro Monthly', billing: 'monthly', durationDays: 31 },
    journal_pro_yearly: { id: 'journal_pro_yearly', amountINR: 2399, label: 'Pro Yearly', billing: 'yearly', durationDays: 366 }
  };

  // Regional charm price points — the local price IS the price (not FX-converted).
  const JOURNAL_PRICING = {
    IN:     { currency: 'INR', symbol: '₹', monthly: 299, yearly: 2399, upi: true },
    US:     { currency: 'USD', symbol: '$', monthly: 5,   yearly: 39 },
    GB:     { currency: 'GBP', symbol: '£', monthly: 4,   yearly: 29 },
    EU:     { currency: 'EUR', symbol: '€', monthly: 5,   yearly: 39 },
    AE:     { currency: 'USD', symbol: '$', monthly: 5,   yearly: 39 },
    SG:     { currency: 'USD', symbol: '$', monthly: 5,   yearly: 39 },
    GLOBAL: { currency: 'USD', symbol: '$', monthly: 5,   yearly: 39 }
  };
  function journalPricing() {
    const code = (window.XtinRegion && XtinRegion.getRegion()) || 'IN';
    return JOURNAL_PRICING[code] || JOURNAL_PRICING.GLOBAL;
  }

  const JournalPlan = (() => {
    let billingChoice = 'yearly';
    let serverPlanSynced = false;

    function readPlan() {
      try { return JSON.parse(localStorage.getItem(PLAN_KEY) || 'null'); }
      catch { return null; }
    }

    function isPro() {
      const p = readPlan();
      if (!p || p.tier !== 'pro') return false;
      if (p.validUntil && Date.now() > p.validUntil) {
        localStorage.removeItem(PLAN_KEY);
        toast('Your Pro plan has expired. You\'re back on the Free plan.', 'error');
        refreshUi();
        return false;
      }
      return true;
    }

    function getTier() { return isPro() ? 'pro' : 'free'; }

    function canAddGoal(currentCount) {
      if (isPro()) return true;
      const allowed = currentCount < FREE_LIMITS.goals;
      if (allowed && currentCount + 1 === FREE_LIMITS.goals) {
        setTimeout(() => toast(`That fills both free goal slots. Pro removes every limit. ✦`, 'success'), 1600);
      }
      return allowed;
    }

    function activatePro({ planId, paymentId, validUntil }) {
      const plan = PLANS[planId] || PLANS.journal_pro_monthly;
      const record = {
        tier: 'pro',
        planId: plan.id,
        billing: plan.billing,
        activatedAt: Date.now(),
        validUntil: validUntil || (Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
        paymentId: paymentId || null
      };
      localStorage.setItem(PLAN_KEY, JSON.stringify(record));
      refreshUi();
      closePricing();
      celebratePro();
    }

    function celebratePro() {
      const el = document.createElement('div');
      el.className = 'jr-pro-celebration';
      el.innerHTML = `
        <div class="jr-pro-celebration__inner">
          <div class="jr-pro-celebration__badge">✦</div>
          <h3>Welcome to Journal Pro</h3>
          <p>Psychology, Hourly, Analytics, Heatmaps — every pattern in your trading, unlocked.</p>
        </div>`;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('is-open'));
      setTimeout(() => {
        el.classList.remove('is-open');
        setTimeout(() => el.remove(), 500);
      }, 2400);
    }

    /* ---------- UI injection ---------- */
    function injectPlanChip() {
      const tabsBar = document.querySelector('.tabs-container');
      if (!tabsBar || document.getElementById('jrPlanChip')) return;

      const tourBtn = document.createElement('button');
      tourBtn.id = 'jrTourBtn';
      tourBtn.type = 'button';
      tourBtn.className = 'jr-plan-chip';
      tourBtn.style.cursor = 'pointer';
      tourBtn.innerHTML = '<span class="jr-plan-chip__label">✦ Tour</span>';
      tourBtn.title = 'Replay the product tour';
      tourBtn.addEventListener('click', () => window.JournalTour?.start());
      tabsBar.appendChild(tourBtn);

      const chip = document.createElement('div');
      chip.id = 'jrPlanChip';
      tabsBar.appendChild(chip);
      renderPlanChip();
    }

    function renderPlanChip() {
      const chip = document.getElementById('jrPlanChip');
      if (!chip) return;
      if (isPro()) {
        chip.className = 'jr-plan-chip jr-plan-chip--pro';
        chip.innerHTML = `<span class="jr-plan-chip__label">✦ PRO</span>
          <button class="jr-plan-chip__upgrade" type="button">Manage</button>`;
      } else {
        chip.className = 'jr-plan-chip';
        chip.innerHTML = `<span class="jr-plan-chip__label">FREE</span>
          <button class="jr-plan-chip__upgrade" type="button">Upgrade ✦</button>`;
      }
      chip.querySelector('button').addEventListener('click', () => showPricing());
    }

    function injectTabBadges() {
      PRO_TABS.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        if (!btn) return;
        let badge = btn.querySelector('.jr-tab-pro-badge');
        if (isPro()) {
          badge?.remove();
        } else if (!badge) {
          badge = document.createElement('span');
          badge.className = 'jr-tab-pro-badge';
          badge.textContent = 'PRO';
          btn.appendChild(badge);
        }
      });
    }

    function refreshUi() {
      renderPlanChip();
      injectTabBadges();
    }

    /* ---------- Gating ---------- */
    function wrapGates() {
      // Tab gating: wrap the global switchTab so both nav clicks and
      // programmatic calls pass through the same gate.
      if (typeof window.switchTab === 'function' && !window.switchTab.__jrWrapped) {
        const origSwitchTab = window.switchTab;
        const wrapped = function (tabName, ...rest) {
          if (PRO_TABS.includes(tabName) && !isPro()) {
            const btn = document.getElementById(`tab-${tabName}`);
            if (btn) {
              btn.classList.add('jr-tab-nudge');
              setTimeout(() => btn.classList.remove('jr-tab-nudge'), 400);
            }
            showUpgradeModal(tabName);
            return;
          }
          return origSwitchTab.call(this, tabName, ...rest);
        };
        wrapped.__jrWrapped = true;
        window.switchTab = wrapped;
      }

      // Import/Export are Pro: automation is the upgrade, manual logging
      // stays free forever.
      if (typeof window.triggerImport === 'function' && !window.triggerImport.__jrWrapped) {
        const origImport = window.triggerImport;
        const wrappedImport = function (...args) {
          if (!isPro()) { showUpgradeModal('import'); return; }
          return origImport.apply(this, args);
        };
        wrappedImport.__jrWrapped = true;
        window.triggerImport = wrappedImport;
      }

      if (typeof window.exportTrades === 'function' && !window.exportTrades.__jrWrapped) {
        const origExport = window.exportTrades;
        const wrappedExport = function (...args) {
          if (!isPro()) { showUpgradeModal('export'); return; }
          return origExport.apply(this, args);
        };
        wrappedExport.__jrWrapped = true;
        window.exportTrades = wrappedExport;
      }
    }

    /* ---------- Pricing modal ---------- */
    let pricingBackdrop = null;

    const UPGRADE_REASONS = {
      goals: `You're tracking more than ${FREE_LIMITS.goals} goals — that's exactly the discipline Pro rewards. Unlimited goals, every metric.`,
      psychology: 'Fear, greed, revenge — your emotions leave fingerprints on every trade. Psychology analysis shows you exactly which feelings cost you money.',
      hourly: 'Most traders bleed money in specific hours and never notice. Hourly Analysis finds your golden hours — and the ones to sit out.',
      analytics: 'Win rate by strategy, R-multiples, drawdown curves — Analytics turns your trade log into a professional performance review.',
      heatmaps: 'One glance at your Heatmaps shows which days, hours and setups print money — and which quietly drain your account.',
      import: 'Broker CSV, Excel, even PDF contract notes — Pro imports your whole history in seconds instead of typing every trade.',
      export: 'Your data, portable. Pro exports your full journal to CSV for taxes, backtesting, or your own analysis.'
    };

    function planPriceHtml(billing) {
      const p = journalPricing();
      const sym = p.symbol;
      const money = (n) => sym + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2));
      const day = (v) => sym + (v >= 1 ? v.toFixed(1).replace(/\.0$/, '') : v.toFixed(2));
      const effMonthly = Math.round(p.yearly / 12);
      if (billing === 'yearly') {
        return `${money(effMonthly)}<small>/mo</small><span class="jr-plan-card__strike">${money(p.monthly)}</span>
          <div class="jr-plan-card__perday">${money(p.yearly)} billed yearly — about <strong>${day(p.yearly / 365)} a day</strong></div>`;
      }
      return `${money(p.monthly)}<small>/mo</small>
        <div class="jr-plan-card__perday">About <strong>${day(p.monthly / 30)} a day</strong> — cancel anytime</div>`;
    }

    function showPricing(reasonKey = null) {
      closePricing();
      const pro = isPro();
      const reason = reasonKey ? UPGRADE_REASONS[reasonKey] : null;

      pricingBackdrop = document.createElement('div');
      pricingBackdrop.className = 'jr-pricing-backdrop';
      pricingBackdrop.innerHTML = `
        <div class="jr-pricing-modal" role="dialog" aria-modal="true">
          <button class="jr-pricing-close" type="button" aria-label="Close">✕</button>
          <div class="jr-pricing-head">
            <span class="jr-pricing-eyebrow">Xtin Journal Plans</span>
            <h3 class="jr-pricing-title">${pro ? 'You\'re on Journal Pro' : 'Trade with an edge, not a hunch'}</h3>
            <p class="jr-pricing-sub">${pro ? 'Every analysis tool unlocked. Manage your plan below.' : 'Journal free forever. Upgrade when you\'re ready to see your patterns.'}</p>
            ${reason ? `<div class="jr-pricing-reason">${esc(reason)}</div>` : ''}
          </div>
          ${pro ? `<div class="jr-pro-active-note">✦ Pro active until ${new Date(readPlan().validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>` : `
          <div class="jr-billing-toggle">
            <button type="button" data-billing="monthly" class="${billingChoice === 'monthly' ? 'is-active' : ''}">Monthly</button>
            <button type="button" data-billing="yearly" class="${billingChoice === 'yearly' ? 'is-active' : ''}">Yearly<span class="jr-billing-save">SAVE 33%</span></button>
          </div>`}
          <div class="jr-plans-grid">
            <div class="jr-plan-card">
              <h4 class="jr-plan-card__name">Free</h4>
              <p class="jr-plan-card__tag">A serious journal, free forever. No card required.</p>
              <div class="jr-plan-card__price">${journalPricing().symbol}0<small>/forever</small></div>
              <ul class="jr-plan-card__features">
                <li><strong>Unlimited</strong> manual trade logging</li>
                <li>Dashboard, Calendar &amp; Daily views</li>
                <li>Metrics &amp; Monthly summaries</li>
                <li>Up to ${FREE_LIMITS.goals} performance goals</li>
                <li>AI trading coach (starter tokens)</li>
                <li class="is-muted">Psychology analysis</li>
                <li class="is-muted">Hourly Analysis &amp; Heatmaps</li>
                <li class="is-muted">Advanced Analytics</li>
                <li class="is-muted">CSV/Excel/PDF import &amp; export</li>
              </ul>
              <button class="jr-plan-card__cta jr-plan-card__cta--current" type="button" disabled>${pro ? 'Included in Pro' : 'Current Plan'}</button>
            </div>
            <div class="jr-plan-card jr-plan-card--pro">
              <span class="jr-plan-card__ribbon">Most Popular</span>
              <h4 class="jr-plan-card__name">Pro ✦</h4>
              <p class="jr-plan-card__tag">The full pattern-detection suite</p>
              <div class="jr-plan-card__price" id="jrProPrice">${planPriceHtml(billingChoice)}</div>
              <ul class="jr-plan-card__features">
                <li>Everything in Free, plus:</li>
                <li><strong>Psychology</strong> — emotion-to-P&amp;L analysis</li>
                <li><strong>Hourly Analysis</strong> — find your golden hours</li>
                <li><strong>Analytics</strong> — pro-grade performance review</li>
                <li><strong>Heatmaps</strong> — see patterns at a glance</li>
                <li>CSV/Excel/PDF import &amp; CSV export</li>
                <li><strong>Unlimited</strong> performance goals</li>
                <li>Priority AI coach access</li>
              </ul>
              <button class="jr-plan-card__cta ${pro ? 'jr-plan-card__cta--current' : 'jr-plan-card__cta--upgrade'}" id="jrUpgradeBtn" type="button" ${pro ? 'disabled' : ''}>
                ${pro ? '✦ Active' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
          <p class="jr-pricing-anchor">One impulsive revenge-trade often costs more than a whole year of Pro. This is the tool that helps you catch it before it happens.</p>
          <p class="jr-pricing-foot">Secure payments via Razorpay · ${journalPricing().upi ? 'UPI, cards &amp; netbanking' : 'cards &amp; international payments'} · Cancel anytime · Your data stays yours</p>
        </div>`;

      document.body.appendChild(pricingBackdrop);
      requestAnimationFrame(() => pricingBackdrop.classList.add('is-open'));

      pricingBackdrop.querySelector('.jr-pricing-close').addEventListener('click', closePricing);
      pricingBackdrop.addEventListener('click', (e) => { if (e.target === pricingBackdrop) closePricing(); });

      pricingBackdrop.querySelectorAll('.jr-billing-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
          billingChoice = btn.dataset.billing;
          pricingBackdrop.querySelectorAll('.jr-billing-toggle button').forEach(b =>
            b.classList.toggle('is-active', b === btn));
          const priceEl = pricingBackdrop.querySelector('#jrProPrice');
          if (priceEl) priceEl.innerHTML = planPriceHtml(billingChoice);
        });
      });

      if (!pro) {
        pricingBackdrop.querySelector('#jrUpgradeBtn').addEventListener('click', (e) => {
          if (e) e.preventDefault();
          startCheckout(billingChoice === 'yearly' ? 'journal_pro_yearly' : 'journal_pro_monthly');
        });
      }
    }

    function closePricing() {
      if (!pricingBackdrop) return;
      const el = pricingBackdrop;
      pricingBackdrop = null;
      el.classList.remove('is-open');
      setTimeout(() => el.remove(), 250);
    }

    function showUpgradeModal(reasonKey) {
      showPricing(reasonKey);
    }

    /* ---------- Razorpay checkout ---------- */
    const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    function backendUrl(path) {
      const base = (typeof getBackendURL === 'function') ? getBackendURL() : '';
      return `${base}${path}`;
    }

    async function startCheckout(planId) {
      const plan = PLANS[planId];
      const btn = document.getElementById('jrUpgradeBtn');

      const restoreBtn = () => {
        if (btn) { btn.disabled = false; btn.textContent = 'Upgrade to Pro'; }
      };

      let user = window.journalSupabase?.getUser?.();
      if (!user) {
        // If Supabase auth is enabled, prompt user to sign in first.
        if (window.journalSupabase?.isConfigured?.()) {
          const goLogin = await JournalUX.confirm({
            title: 'Create your free account first',
            message: 'Your Pro plan is linked to your Xtin account, so it works on every device and can never be lost. Sign in or sign up takes under a minute — then upgrade.',
            confirmText: 'Sign in / Sign up',
            cancelText: 'Not now'
          });
          if (goLogin) {
            closePricing();
            if (typeof openJournalAuthModal === 'function') openJournalAuthModal();
          }
          restoreBtn();
          return;
        } else {
          // Local fallback ID
          const localId = localStorage.getItem('XtinJournalUserId') || ('local_user_' + Date.now());
          localStorage.setItem('XtinJournalUserId', localId);
          user = { id: localId, email: '' };
        }
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Opening secure checkout…'; }

      try {
        const _pricing = journalPricing();
        const _region = (window.XtinRegion && XtinRegion.getRegion()) || 'IN';
        const res = await fetch(backendUrl('/api/v2/plan/razorpay/order'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, plan_id: planId, user_email: user.email || '', currency: _pricing.currency, region: _region })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const detail = data.detail || data.error || '';
          // Dev convenience: simulate activation locally when Razorpay keys
          // aren't configured or the gateway is unreachable (offline dev).
          // Never triggers on the live domain.
          if (isLocalDev && /not configured|unreachable/i.test(detail)) {
            const ok = await JournalUX.confirm({
              title: 'Dev mode: simulate payment?',
              message: 'Razorpay keys are not configured on this machine. Activate Pro locally to test the full experience?',
              confirmText: 'Activate Pro (dev)'
            });
            if (ok) activatePro({ planId, paymentId: 'dev_simulated' });
            restoreBtn();
            return;
          }
          throw new Error(detail || 'Unable to start checkout');
        }

        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Razorpay checkout script failed to load. Check your connection.'));
            document.body.appendChild(script);
          });
        }

        const checkout = new window.Razorpay({
          key: data.key_id,
          order_id: data.order.id,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Xtin Journal Pro',
          description: `${plan.label} — Trading intelligence suite`,
          theme: { color: '#16A34A' },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(backendUrl('/api/v2/plan/razorpay/verify'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  plan_id: planId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  user_email: user.email || '',
                  currency: _pricing.currency,
                  region: _region
                })
              });
              const verifyData = await verifyRes.json().catch(() => ({}));
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.detail || verifyData.error || 'Payment verification failed');
              }
              activatePro({
                planId,
                paymentId: verifyData.payment_id,
                validUntil: verifyData.valid_until ? new Date(verifyData.valid_until).getTime() : null
              });
            } catch (err) {
              toast(err.message || 'Payment verification failed. Contact support with your payment ID.', 'error');
              restoreBtn();
            }
          },
          modal: { ondismiss: restoreBtn }
        });
        checkout.open();
      } catch (err) {
        toast(err.message || 'Unable to start checkout. Please try again.', 'error');
        restoreBtn();
      }
    }

    /* ---------- Server-side plan sync ---------- */
    // The backend writes journal_pro_plans on verified payment (service
    // role only). The server record is authoritative over localStorage.
    async function syncPlanFromServer() {
      try {
        const user = window.journalSupabase?.getUser?.();
        if (!user) return false;
        serverPlanSynced = true;

        const res = await fetch(backendUrl(`/api/v2/plan?user_id=${encodeURIComponent(user.id)}`));
        if (!res.ok) return false;
        const data = await res.json();

        if (data.plan) {
          const serverPlan = {
            tier: 'pro',
            planId: data.plan.plan_id,
            billing: data.plan.billing,
            activatedAt: new Date(data.plan.activated_at).getTime(),
            validUntil: new Date(data.plan.valid_until).getTime(),
            paymentId: data.plan.payment_id,
            source: 'server'
          };
          if (serverPlan.validUntil > Date.now()) {
            localStorage.setItem(PLAN_KEY, JSON.stringify(serverPlan));
          } else {
            localStorage.removeItem(PLAN_KEY);
          }
          refreshUi();
        } else if (data.source === 'supabase') {
          const local = readPlan();
          if (local?.source === 'server') {
            localStorage.removeItem(PLAN_KEY);
            refreshUi();
          }
        }
        return true;
      } catch {
        return false;
      }
    }

    /* ---------- Init ---------- */
    function init() {
      injectPlanChip();
      injectTabBadges();
      wrapGates();
      isPro(); // expiry check on load

      // Auth session restore is async — retry a few times, stop once a
      // sync ran against a live session.
      [1500, 4000, 9000].forEach(delay => {
        setTimeout(() => { if (!serverPlanSynced) syncPlanFromServer(); }, delay);
      });
    }

    return { getTier, isPro, canAddGoal, showPricing, showUpgradeModal, activatePro, refreshUi, syncPlanFromServer, init, FREE_LIMITS };
  })();

  window.JournalPlan = JournalPlan;

  /* ─────────────────────────────────────────────
     Bootstrap
     ───────────────────────────────────────────── */
  function boot() {
    JournalPlan.init();

    // Auto-start the tour for first-time users, once the app has painted.
    if (!JournalTour.isDone()) {
      setTimeout(() => JournalTour.start(), 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
