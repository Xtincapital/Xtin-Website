/* ═══════════════════════════════════════════════════════════════════════
   GINI PREMIUM UX LAYER
   1. GiniUX   — premium confirm dialogs + toast passthrough
   2. GiniTour — interactive spotlight product tour
   3. GiniPlan — Free/Pro tiers, feature gating, Razorpay checkout

   Loaded after app.js. All state persists in localStorage and rides along
   with the existing cloud sync (plan state is separate from appState).
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const esc = (v) => (window.escapeHtml ? window.escapeHtml(v) : String(v ?? ''));
  const toast = (msg, type = 'success') => window.showAuthNotification?.(msg, type);

  /* ─────────────────────────────────────────────
     1. GiniUX — confirm dialog
     ───────────────────────────────────────────── */
  const GiniUX = {
    toast,

    confirm(options = {}) {
      return new Promise((resolve) => {
        const { title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;

        const backdrop = document.createElement('div');
        backdrop.className = 'gini-confirm-backdrop';
        backdrop.innerHTML = `
          <div class="gini-confirm-card ${danger ? 'gini-confirm-card--danger' : ''}" role="alertdialog" aria-modal="true">
            <div class="gini-confirm-icon">
              ${danger
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'}
            </div>
            <h4 class="gini-confirm-title">${esc(title)}</h4>
            <p class="gini-confirm-message">${esc(message)}</p>
            <div class="gini-confirm-actions">
              <button class="gini-confirm-btn gini-confirm-btn--cancel" type="button">${esc(cancelText)}</button>
              <button class="gini-confirm-btn gini-confirm-btn--ok" type="button">${esc(confirmText)}</button>
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

        backdrop.querySelector('.gini-confirm-btn--ok').addEventListener('click', () => close(true));
        backdrop.querySelector('.gini-confirm-btn--cancel').addEventListener('click', () => close(false));
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false); });
        document.addEventListener('keydown', onKey);
        setTimeout(() => backdrop.querySelector('.gini-confirm-btn--ok').focus(), 120);
      });
    }
  };

  window.GiniUX = GiniUX;

  /* ─────────────────────────────────────────────
     2. GiniTour — spotlight product tour
     ───────────────────────────────────────────── */
  const TOUR_DONE_KEY = 'gini_tour_v1_done';

  function enterDashboardView() {
    document.body.classList.remove('landing-active');
    history.replaceState(null, '', '#dashboard-entry');
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById('dashboard-entry')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function enterLandingView() {
    document.body.classList.add('landing-active');
    history.replaceState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const TOUR_STEPS = [
    {
      id: 'welcome', center: true, view: 'landing',
      eyebrow: 'Welcome to Xtin Gini',
      badge: '✦',
      title: "Your family's private financial studio",
      desc: 'In the next 60 seconds you\'ll see exactly how Gini turns your family, goals and investments into a living financial blueprint. No jargon — promise.',
      next: 'Show me around'
    },
    {
      id: 'family', target: '#landing-family-section', view: 'landing',
      eyebrow: 'Step 1 · Your household',
      title: 'Start with the people you\'re planning for',
      desc: 'Add yourself, then your family. Pick a relationship and Gini pre-fills smart defaults — income, retirement age, dependent status. Every projection is built on this.'
    },
    {
      id: 'goals', target: '#landing-goals-section', view: 'landing',
      eyebrow: 'Step 2 · Life goals',
      title: 'Turn dreams into funded milestones',
      desc: 'A home, a wedding, an education. Gini auto-adjusts each goal for inflation and tells you the exact monthly amount you need to invest to reach it on time.'
    },
    {
      id: 'report', target: '#landing-report-section', view: 'landing',
      eyebrow: 'Step 3 · Instant intelligence',
      title: 'Your AI financial report, on demand',
      desc: 'One click generates a personalised report card for your household — health score, gaps, and what to fix first.'
    },
    {
      id: 'enter', center: true, view: 'landing',
      eyebrow: 'The full experience',
      badge: '◈',
      title: 'Ready for the complete dashboard?',
      desc: '13 professional-grade tools — net worth tracking, Monte Carlo simulations, retirement planning and more — all tuned for families like yours.',
      next: 'Enter Dashboard',
      onNext: enterDashboardView
    },
    {
      id: 'sidebar', target: '#mainSidebar', view: 'dashboard', placement: 'right',
      eyebrow: 'Your command centre',
      title: 'Every tool, one sidebar',
      desc: 'Move between Dashboard, Net Worth, Goals, Retirement and advanced analysis anytime. Gold PRO badges mark the premium modules.'
    },
    {
      id: 'onboardingCard', target: '#dashboardOnboarding', view: 'dashboard',
      eyebrow: 'Guided setup',
      title: 'Your setup checklist lives here',
      desc: 'Gini tracks what you\'ve completed and suggests the next best step, so you\'re never staring at an empty screen.'
    },
    {
      id: 'ai', target: '#chatbotToggle', view: 'dashboard', placement: 'top',
      eyebrow: 'Gini AI Advisor',
      title: 'Ask anything, anytime',
      desc: '"Can we afford a bigger home in 2028?" — the AI advisor reads your actual numbers and answers like a private wealth manager.'
    },
    {
      id: 'finish', center: true, view: 'dashboard',
      eyebrow: 'You\'re all set',
      badge: '✦',
      title: 'This is your financial blueprint. Own it.',
      desc: 'You\'re on the Free plan — 3 family members, 3 goals and all core tools, free forever. Unlock unlimited members, Monte Carlo, Family Planning and PDF reports with Pro.',
      next: 'Start Planning'
    }
  ];

  const GiniTour = (() => {
    let overlay = null, spotlight = null, card = null;
    let steps = [], index = 0, active = false;
    let repositionRaf = null;

    function isDone() { return localStorage.getItem(TOUR_DONE_KEY) === 'true'; }

    function buildDom() {
      overlay = document.createElement('div');
      overlay.className = 'gini-tour-overlay';
      overlay.style.pointerEvents = 'auto'; // block the page while touring
      spotlight = document.createElement('div');
      spotlight.className = 'gini-tour-spotlight';
      card = document.createElement('div');
      card.className = 'gini-tour-card';
      overlay.appendChild(spotlight);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    function renderCard(step) {
      const total = steps.length;
      const pct = Math.round(((index + 1) / total) * 100);
      card.innerHTML = `
        ${step.badge ? `<div class="gini-tour-badge">${step.badge}</div>` : ''}
        <div class="gini-tour-eyebrow">${esc(step.eyebrow || 'Xtin Gini')}</div>
        <h3 class="gini-tour-title">${esc(step.title)}</h3>
        <p class="gini-tour-desc">${esc(step.desc)}</p>
        <div class="gini-tour-progress">
          <div class="gini-tour-progress-track"><div class="gini-tour-progress-fill" style="width:${pct}%"></div></div>
          <span class="gini-tour-progress-label">${index + 1} of ${total}</span>
        </div>
        <div class="gini-tour-actions">
          <button class="gini-tour-skip" type="button">Skip tour</button>
          ${index > 0 ? '<button class="gini-tour-btn gini-tour-btn--back" type="button">Back</button>' : ''}
          <button class="gini-tour-btn gini-tour-btn--next" type="button">${esc(step.next || (index === steps.length - 1 ? 'Finish' : 'Next'))}</button>
        </div>`;

      card.querySelector('.gini-tour-skip').addEventListener('click', () => finish(true));
      card.querySelector('.gini-tour-btn--back')?.addEventListener('click', () => show(index - 1));
      card.querySelector('.gini-tour-btn--next').addEventListener('click', () => {
        const step = steps[index];
        if (typeof step.onNext === 'function') step.onNext();
        if (index >= steps.length - 1) finish(false);
        else {
          // Give view transitions (landing → dashboard) a beat to settle
          const delay = step.onNext ? 450 : 0;
          setTimeout(() => show(index + 1), delay);
        }
      });
      setTimeout(() => card.querySelector('.gini-tour-btn--next')?.focus(), 80);
    }

    function positionForTarget(step) {
      const target = step.target ? document.querySelector(step.target) : null;

      if (!target || step.center) {
        spotlight.classList.add('gini-tour-spotlight--none');
        card.classList.add('gini-tour-card--center');
        card.style.top = '';
        card.style.left = '';
        return;
      }

      spotlight.classList.remove('gini-tour-spotlight--none');
      card.classList.remove('gini-tour-card--center');

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

      // Card placement: prefer explicit, else below → above → right → centered
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
        card.classList.add('gini-tour-card--center');
        return;
      }

      card.style.top = `${Math.max(8, cTop)}px`;
      card.style.left = `${Math.max(8, cLeft)}px`;
    }

    function show(i) {
      index = Math.max(0, Math.min(i, steps.length - 1));
      const step = steps[index];

      // Make sure we're in the right view for this step
      const inLanding = document.body.classList.contains('landing-active');
      if (step.view === 'dashboard' && inLanding) enterDashboardView();
      if (step.view === 'landing' && !inLanding) enterLandingView();

      renderCard(step);

      const target = step.target ? document.querySelector(step.target) : null;
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
      else if (e.key === 'ArrowRight') { e.preventDefault(); card.querySelector('.gini-tour-btn--next')?.click(); }
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
      if (!skipped) {
        toast('Tour complete — your blueprint awaits. Happy planning! ✦', 'success');
      }
    }

    function start(mode = 'full') {
      if (active) return;
      steps = mode === 'dashboard'
        ? TOUR_STEPS.filter(s => s.view === 'dashboard')
        : TOUR_STEPS.slice();
      if (!steps.length) return;
      active = true;
      buildDom();
      window.addEventListener('resize', reposition);
      window.addEventListener('scroll', reposition, true);
      document.addEventListener('keydown', onKey);
      show(0);
    }

    return { start, isDone };
  })();

  window.GiniTour = GiniTour;

  /* ─────────────────────────────────────────────
     3. GiniPlan — Free/Pro tiers + Razorpay
     ───────────────────────────────────────────── */
  const PLAN_KEY = 'gini_plan_v1';
  const PRO_TABS = ['required-return', 'monte-carlo', 'family-planning', 'reports'];
  const PRO_TAB_LABELS = {
    'required-return': 'Required Return',
    'monte-carlo': 'Monte Carlo Simulations',
    'family-planning': 'Family Planning Suite',
    'reports': 'PDF Reports'
  };
  const FREE_LIMITS = { familyMembers: 3, goals: 3 };
  const PLANS = {
    pro_monthly: { id: 'pro_monthly', amountINR: 499,  label: 'Pro Monthly', billing: 'monthly', durationDays: 31 },
    pro_yearly:  { id: 'pro_yearly',  amountINR: 3999, label: 'Pro Yearly',  billing: 'yearly',  durationDays: 366 }
  };

  // Regional charm price points — the local price IS the price (not FX-converted).
  // Advisor anchor is the loss-framed "a human advisor costs X/yr" comparison.
  const GINI_PRICING = {
    IN:     { currency: 'INR', symbol: '₹', monthly: 499, yearly: 3999, upi: true,  advisor: 'a human financial advisor typically charges ₹10,000–25,000 a year' },
    US:     { currency: 'USD', symbol: '$', monthly: 9,   yearly: 79,   advisor: 'a human financial advisor typically charges $1,500–3,000 a year' },
    GB:     { currency: 'GBP', symbol: '£', monthly: 7,   yearly: 59,   advisor: 'a financial adviser typically charges £1,000–2,000 a year' },
    EU:     { currency: 'EUR', symbol: '€', monthly: 8,   yearly: 69,   advisor: 'a financial advisor typically charges €1,200–2,500 a year' },
    AE:     { currency: 'USD', symbol: '$', monthly: 9,   yearly: 79,   advisor: 'a financial advisor typically charges $1,500–3,000 a year' },
    SG:     { currency: 'USD', symbol: '$', monthly: 9,   yearly: 79,   advisor: 'a financial advisor typically charges $1,500–3,000 a year' },
    GLOBAL: { currency: 'USD', symbol: '$', monthly: 9,   yearly: 79,   advisor: 'a financial advisor typically charges $1,500–3,000 a year' }
  };
  function giniPricing() {
    const code = (window.XtinRegion && XtinRegion.getRegion()) || 'IN';
    return GINI_PRICING[code] || GINI_PRICING.GLOBAL;
  }

  const GiniPlan = (() => {
    let billingChoice = 'yearly';

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

    function canAddFamilyMember(currentCount) {
      if (isPro()) return true;
      const allowed = currentCount < FREE_LIMITS.familyMembers;
      // Gentle heads-up the moment the last free slot gets used — no
      // surprise wall on the next attempt.
      if (allowed && currentCount + 1 === FREE_LIMITS.familyMembers) {
        setTimeout(() => toast(`That fills all ${FREE_LIMITS.familyMembers} free member slots. Pro removes every limit. ✦`, 'success'), 1600);
      }
      return allowed;
    }

    function canAddGoal(currentCount) {
      if (isPro()) return true;
      const allowed = currentCount < FREE_LIMITS.goals;
      if (allowed && currentCount + 1 === FREE_LIMITS.goals) {
        setTimeout(() => toast(`That's your ${FREE_LIMITS.goals}rd free goal — nice momentum! Pro unlocks unlimited goals. ✦`, 'success'), 1600);
      }
      return allowed;
    }

    function activatePro({ planId, paymentId }) {
      const plan = PLANS[planId] || PLANS.pro_monthly;
      const record = {
        tier: 'pro',
        planId: plan.id,
        billing: plan.billing,
        activatedAt: Date.now(),
        validUntil: Date.now() + plan.durationDays * 24 * 60 * 60 * 1000,
        paymentId: paymentId || null
      };
      localStorage.setItem(PLAN_KEY, JSON.stringify(record));
      refreshUi();
      closePricing();
      celebratePro();
      grantProAITokens(record.paymentId);
      // Push the plan to the user's cloud profile immediately so the
      // purchase is never lost with browser data.
      window.saveAppStateToStorage?.({ immediateCloudSync: true });
    }

    // Pro includes a large AI token grant — credited once per payment
    // (guarded by paymentId so refresh/re-sync can't double-credit).
    function grantProAITokens(paymentId) {
      try {
        if (typeof window.addAITokensToWallet !== 'function') return;
        const included = window.CHAT_LIMITS?.proIncludedTokens || 100000;
        const walletRaw = localStorage.getItem('gini_ai_token_wallet_v1');
        const wallet = walletRaw ? JSON.parse(walletRaw) : null;
        const alreadyGranted = wallet?.purchases?.some(p =>
          p.packId === 'pro_included' && p.paymentId === (paymentId || 'pro'));
        if (alreadyGranted) return;
        window.addAITokensToWallet(
          { id: 'pro_included', tokens: included, amountINR: 0, label: 'Included with Gini Pro' },
          { paymentId: paymentId || 'pro' }
        );
        toast(`${(included / 1000).toFixed(0)}K AI advisor tokens credited with your Pro plan.`, 'success');
      } catch (e) {
        console.warn('[GiniPlan] Could not grant Pro AI tokens:', e);
      }
    }

    // A brief full-screen "welcome" moment: buying should feel like an
    // arrival, not a transaction that ends with a toast.
    function celebratePro() {
      const el = document.createElement('div');
      el.className = 'gini-pro-celebration';
      el.innerHTML = `
        <div class="gini-pro-celebration__inner">
          <div class="gini-pro-celebration__badge">✦</div>
          <h3>Welcome to Gini Pro</h3>
          <p>Every module is unlocked. Your family's complete blueprint starts now.</p>
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
      const sidebar = document.getElementById('mainSidebar');
      if (!sidebar || document.getElementById('giniPlanChip')) return;
      const nav = sidebar.querySelector('.sidebar-nav');
      if (!nav) return;

      const chip = document.createElement('div');
      chip.id = 'giniPlanChip';
      sidebar.insertBefore(chip, nav);
      renderPlanChip();
    }

    function renderPlanChip() {
      const chip = document.getElementById('giniPlanChip');
      if (!chip) return;
      if (isPro()) {
        chip.className = 'gini-plan-chip gini-plan-chip--pro';
        chip.innerHTML = `<span class="gini-plan-chip__label">✦ GINI PRO</span>
          <button class="gini-plan-chip__upgrade" type="button" data-action="manage">Manage</button>`;
      } else {
        chip.className = 'gini-plan-chip';
        chip.innerHTML = `<span class="gini-plan-chip__label">FREE PLAN</span>
          <button class="gini-plan-chip__upgrade" type="button" data-action="upgrade">Upgrade ✦</button>`;
      }
      chip.querySelector('button').addEventListener('click', () => showPricing());
    }

    function injectNavBadges() {
      PRO_TABS.forEach(tab => {
        const item = document.querySelector(`.nav-item[data-tab="${tab}"]`);
        if (!item) return;
        let badge = item.querySelector('.nav-pro-badge');
        if (isPro()) {
          badge?.remove();
          item.classList.remove('nav-item--locked');
        } else if (!badge) {
          badge = document.createElement('span');
          badge.className = 'nav-pro-badge';
          badge.textContent = 'PRO';
          item.appendChild(badge);
          item.classList.add('nav-item--locked');
        }
      });
    }

    function injectTourLauncher() {
      const footer = document.querySelector('#mainSidebar .sidebar-footer');
      if (!footer || document.getElementById('giniTourLauncher')) return;
      const btn = document.createElement('button');
      btn.id = 'giniTourLauncher';
      btn.className = 'btn btn--secondary btn--sm gini-tour-launcher';
      btn.type = 'button';
      btn.innerHTML = '✦ Take the Tour';
      btn.addEventListener('click', () => GiniTour.start('full'));
      footer.insertBefore(btn, footer.firstChild);
    }

    function refreshUi() {
      renderPlanChip();
      injectNavBadges();
    }

    /* ---------- Gating ---------- */
    function interceptProTabs() {
      document.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item[data-tab]');
        if (!item) return;
        const tab = item.dataset.tab;
        if (!PRO_TABS.includes(tab) || isPro()) return;
        e.preventDefault();
        e.stopPropagation();
        item.classList.add('nav-item--nudge');
        setTimeout(() => item.classList.remove('nav-item--nudge'), 400);
        showUpgradeModal(tab);
      }, true); // capture: runs before app.js's own tab switch
    }

    /* ---------- Pricing modal ---------- */
    let pricingBackdrop = null;

    // Benefit-led copy: each reason answers "what do I lose by staying
    // Free?" rather than naming a locked feature.
    const UPGRADE_REASONS = {
      family: `Your household has more people than the ${FREE_LIMITS.familyMembers} free slots. Everyone's income and dreams belong in the plan — Pro gives your whole family a seat.`,
      goals: `You're planning more than ${FREE_LIMITS.goals} milestones — that's exactly who Pro is built for. Unlimited goals, each with its own inflation-adjusted SIP.`,
      'required-return': 'Most families pick funds first and hope. Required Return works backwards — it tells you the exact return your goals demand, before you invest a rupee.',
      'monte-carlo': 'Will your plan survive a 2008-style crash? Monte Carlo stress-tests your retirement against 1,000 market scenarios — including the bad ones.',
      'family-planning': 'School fees, weddings, insurance gaps — the Family Planning suite prices your family\'s biggest moments years before they arrive.',
      'reports': 'Your full blueprint as a beautifully formatted PDF — share it with your spouse, keep it with your documents, or hand it to your CA.'
    };

    function planPriceHtml(billing) {
      // Per-day reframing: a yearly price feels big, "a day" feels trivial.
      const p = giniPricing();
      const sym = p.symbol;
      const money = (n) => sym + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2));
      const day = (v) => sym + (v >= 1 ? v.toFixed(1).replace(/\.0$/, '') : v.toFixed(2));
      const effMonthly = Math.round(p.yearly / 12);
      if (billing === 'yearly') {
        return `${money(effMonthly)}<small>/mo</small><span class="gini-plan-card__strike">${money(p.monthly)}</span>
          <div class="gini-plan-card__perday">${money(p.yearly)} billed yearly — about <strong>${day(p.yearly / 365)} a day</strong></div>`;
      }
      return `${money(p.monthly)}<small>/mo</small>
        <div class="gini-plan-card__perday">About <strong>${day(p.monthly / 30)} a day</strong> — cancel anytime</div>`;
    }

    function showPricing(reasonKey = null) {
      closePricing();
      const pro = isPro();
      const reason = reasonKey ? UPGRADE_REASONS[reasonKey] : null;

      pricingBackdrop = document.createElement('div');
      pricingBackdrop.className = 'gini-pricing-backdrop';
      pricingBackdrop.innerHTML = `
        <div class="gini-pricing-modal" role="dialog" aria-modal="true">
          <button class="gini-pricing-close" type="button" aria-label="Close">✕</button>
          <div class="gini-pricing-head">
            <span class="gini-pricing-eyebrow">Xtin Gini Plans</span>
            <h3 class="gini-pricing-title">${pro ? 'You\'re on Gini Pro' : 'Plan your family\'s future, properly'}</h3>
            <p class="gini-pricing-sub">${pro ? 'Every module unlocked. Manage your plan below.' : 'Start free. Upgrade when your ambitions outgrow the basics.'}</p>
            ${reason ? `<div class="gini-pricing-reason">${esc(reason)}</div>` : ''}
          </div>
          ${pro ? `<div class="gini-pro-active-note">✦ Pro active until ${new Date(readPlan().validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>` : `
          <div class="gini-billing-toggle">
            <button type="button" data-billing="monthly" class="${billingChoice === 'monthly' ? 'is-active' : ''}">Monthly</button>
            <button type="button" data-billing="yearly" class="${billingChoice === 'yearly' ? 'is-active' : ''}">Yearly<span class="gini-billing-save">SAVE 33%</span></button>
          </div>`}
          <div class="gini-plans-grid">
            <div class="gini-plan-card">
              <h4 class="gini-plan-card__name">Free</h4>
              <p class="gini-plan-card__tag">Serious planning tools, free forever. No card required.</p>
              <div class="gini-plan-card__price">${giniPricing().symbol}0<small>/forever</small></div>
              <ul class="gini-plan-card__features">
                <li>Up to ${FREE_LIMITS.familyMembers} family members</li>
                <li>Up to ${FREE_LIMITS.goals} financial goals</li>
                <li>Dashboard, Net Worth &amp; Portfolio</li>
                <li>Goal Planner &amp; Retirement basics</li>
                <li>Core calculators</li>
                <li>Gini AI advisor (starter tokens)</li>
                <li class="is-muted">Monte Carlo simulations</li>
                <li class="is-muted">Family Planning suite</li>
                <li class="is-muted">PDF report exports</li>
              </ul>
              <button class="gini-plan-card__cta gini-plan-card__cta--current" type="button" disabled>${pro ? 'Included in Pro' : 'Current Plan'}</button>
            </div>
            <div class="gini-plan-card gini-plan-card--pro">
              <span class="gini-plan-card__ribbon">Most Popular</span>
              <h4 class="gini-plan-card__name">Pro ✦</h4>
              <p class="gini-plan-card__tag">The complete family wealth suite</p>
              <div class="gini-plan-card__price" id="giniProPrice">${planPriceHtml(billingChoice)}</div>
              <ul class="gini-plan-card__features">
                <li><strong>Unlimited</strong> family members</li>
                <li><strong>Unlimited</strong> financial goals</li>
                <li>Everything in Free, plus:</li>
                <li>Monte Carlo simulations</li>
                <li>Required Return analysis</li>
                <li>Family Planning suite</li>
                <li>Beautiful PDF report exports</li>
                <li><strong>100,000 AI advisor tokens</strong> included</li>
                <li>Full-depth AI answers with longer memory</li>
              </ul>
              <button class="gini-plan-card__cta ${pro ? 'gini-plan-card__cta--current' : 'gini-plan-card__cta--upgrade'}" id="giniUpgradeBtn" type="button" ${pro ? 'disabled' : ''}>
                ${pro ? '✦ Active' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
          <p class="gini-pricing-anchor">For perspective: ${giniPricing().advisor}. Gini Pro costs less than one consultation — and works for your family around the clock.</p>
          <p class="gini-pricing-foot">Secure payments via Razorpay · ${giniPricing().upi ? 'UPI, cards &amp; netbanking' : 'cards &amp; international payments'} · Cancel anytime · Your data stays yours</p>
        </div>`;

      document.body.appendChild(pricingBackdrop);
      requestAnimationFrame(() => pricingBackdrop.classList.add('is-open'));

      pricingBackdrop.querySelector('.gini-pricing-close').addEventListener('click', closePricing);
      pricingBackdrop.addEventListener('click', (e) => { if (e.target === pricingBackdrop) closePricing(); });

      pricingBackdrop.querySelectorAll('.gini-billing-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
          billingChoice = btn.dataset.billing;
          pricingBackdrop.querySelectorAll('.gini-billing-toggle button').forEach(b =>
            b.classList.toggle('is-active', b === btn));
          const priceEl = pricingBackdrop.querySelector('#giniProPrice');
          if (priceEl) priceEl.innerHTML = planPriceHtml(billingChoice);
        });
      });

      if (!pro) {
        pricingBackdrop.querySelector('#giniUpgradeBtn').addEventListener('click', () => {
          startCheckout(billingChoice === 'yearly' ? 'pro_yearly' : 'pro_monthly');
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

    async function startCheckout(planId) {
      const plan = PLANS[planId];
      const btn = document.getElementById('giniUpgradeBtn');

      const restoreBtn = () => {
        if (btn) { btn.disabled = false; btn.textContent = 'Upgrade to Pro'; }
      };

      // A Pro purchase must be tied to an account: without login the plan
      // would only exist in this browser and be lost with cleared data.
      if (!window.GiniAuth?.isLoggedIn?.()) {
        const goLogin = await GiniUX.confirm({
          title: 'Create your free account first',
          message: 'Your Pro plan is linked to your Xtin account, so it works on every device and can never be lost. Login or sign up takes under a minute — then upgrade.',
          confirmText: 'Login / Sign up',
          cancelText: 'Not now'
        });
        if (goLogin) {
          closePricing();
          document.getElementById('giniLoginBtn')?.click();
        }
        restoreBtn();
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Opening secure checkout…'; }

      const user = window.GiniAuth?.getUser?.() || {};
      const pricing = giniPricing();
      const region = (window.XtinRegion && XtinRegion.getRegion()) || 'IN';

      try {
        const res = await fetch('/api/razorpay-plan-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, userEmail: user.email || '', userId: user.id || '', currency: pricing.currency, region })
        });
        const data = await res.json();

        if (!res.ok) {
          // Dev convenience: simulate activation locally when Razorpay
          // keys aren't configured. Never triggers on the live domain.
          if (isLocalDev && /not configured/i.test(data.error || '')) {
            const ok = await GiniUX.confirm({
              title: 'Dev mode: simulate payment?',
              message: 'Razorpay keys are not configured on this machine. Activate Pro locally to test the full experience?',
              confirmText: 'Activate Pro (dev)'
            });
            if (ok) activatePro({ planId, paymentId: 'dev_simulated' });
            restoreBtn();
            return;
          }
          throw new Error(data.error || 'Unable to start checkout');
        }

        if (!window.Razorpay) throw new Error('Razorpay checkout script failed to load. Check your connection.');

        const checkout = new window.Razorpay({
          key: data.keyId,
          order_id: data.order.id,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Xtin Gini Pro',
          description: `${plan.label} — Family wealth suite`,
          theme: { color: '#16A34A' },
          handler: async (response) => {
            try {
              const verifyRes = await fetch('/api/razorpay-plan-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  planId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user.id || '',
                  userEmail: user.email || '',
                  currency: pricing.currency,
                  region
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
              activatePro({ planId, paymentId: verifyData.paymentId });
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

    /* ---------- Server-side plan sync (Supabase RLS) ---------- */
    // The server writes gini_pro_plans on verified payment; users can only
    // SELECT their own row. When a server record exists it is authoritative
    // over localStorage — a forged local record dies on the next sync.
    let serverPlanSynced = false;

    async function syncPlanFromServer() {
      try {
        const client = window.GiniAuth?.getClient?.();
        const user = window.GiniAuth?.getUser?.();
        if (!client || !user) return false;
        serverPlanSynced = true;

        const { data, error } = await client
          .from('gini_pro_plans')
          .select('plan_id, billing, activated_at, valid_until, payment_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) return false; // table missing / offline — keep local behaviour

        if (data) {
          const serverPlan = {
            tier: 'pro',
            planId: data.plan_id,
            billing: data.billing,
            activatedAt: new Date(data.activated_at).getTime(),
            validUntil: new Date(data.valid_until).getTime(),
            paymentId: data.payment_id,
            source: 'server'
          };
          if (serverPlan.validUntil > Date.now()) {
            localStorage.setItem(PLAN_KEY, JSON.stringify(serverPlan));
          } else {
            localStorage.removeItem(PLAN_KEY); // expired on server
          }
          refreshUi();
        } else {
          // Logged in, no server record: clear any server-sourced local
          // copy (e.g. plan expired and row was removed). Locally
          // activated dev/simulated plans are left alone.
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
      injectNavBadges();
      injectTourLauncher();
      interceptProTabs();
      isPro(); // triggers expiry check on load

      // Auth session restore is async — retry the server sync a few times
      // after boot, then stop once it has run against a live session.
      [1500, 4000, 9000].forEach(delay => {
        setTimeout(() => { if (!serverPlanSynced) syncPlanFromServer(); }, delay);
      });
    }

    return { getTier, isPro, canAddFamilyMember, canAddGoal, showPricing, showUpgradeModal, activatePro, refreshUi, syncPlanFromServer, init, FREE_LIMITS };
  })();

  window.GiniPlan = GiniPlan;

  /* ─────────────────────────────────────────────
     Bootstrap
     ───────────────────────────────────────────── */
  function boot() {
    GiniPlan.init();

    // Auto-start the dashboard tour the first time a user enters the
    // dashboard from the landing page — the "layman's guide" moment.
    document.addEventListener('click', (e) => {
      const launch = e.target.closest('a[href="#dashboard-entry"]');
      if (!launch || GiniTour.isDone()) return;
      setTimeout(() => {
        if (!document.body.classList.contains('landing-active')) {
          GiniTour.start('dashboard');
        }
      }, 700);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
