import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaNewspaper, FaQuestion, FaTimes } from 'react-icons/fa';

/**
 * Xtin Market Brief guided tour — a spotlight walkthrough for first-time
 * visitors. Glowing cut-outs around the REAL page (not screenshots), one idea
 * per step, ending at the subscribe box. Auto-starts once (localStorage),
 * relaunchable from the floating "?" button.
 *
 * Targets are [data-nl-tour="<id>"] elements on the Newsletter page.
 */
const TOUR_KEY = 'xtin_newsletter_tour_v1';

const STEPS = [
  {
    id: 'welcome',
    center: true,
    eyebrow: 'Welcome to the Xtin Market Brief',
    title: 'Markets, explained like a friend would',
    body: "Two short reads a day that tell you what actually moved and why it matters for your money — no jargon, no noise. Here's the 45-second tour.",
    next: 'Show me',
  },
  {
    id: 'editions',
    target: 'editions',
    eyebrow: 'Step 1 · Two editions',
    title: 'Morning brief, evening wrap',
    body: 'The Pre-Market Brief lands at 8 AM so you know what to expect before the bell. The Post-Market Wrap arrives at 5 PM with what happened and why.',
  },
  {
    id: 'markets',
    target: 'markets',
    eyebrow: 'Step 2 · Your markets',
    title: 'India, US, or the whole world',
    body: 'Only care about Indian markets? Trading US tech? Want the global macro picture? Pick the markets you actually follow — we send only those.',
  },
  {
    id: 'archive',
    target: 'archive',
    eyebrow: 'Step 3 · The archive',
    title: 'Every past edition, searchable',
    body: 'Missed a day? The archive has it. Free readers get the latest three editions; Pro unlocks the full history.',
  },
  {
    id: 'subscribe',
    target: 'subscribe',
    eyebrow: "You're set",
    title: 'Start with the free evening wrap',
    body: "Drop your email and you'll get tonight's India wrap — free, forever. Upgrade to Pro anytime for both editions and every market.",
    next: 'Got it',
  },
];

const NewsletterTour = () => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [rect, setRect] = useState(null);
  const rafRef = useRef(null);

  const step = stepIndex >= 0 ? STEPS[stepIndex] : null;

  const measure = useCallback(() => {
    if (!step || step.center) { setRect(null); return; }
    const el = document.querySelector(`[data-nl-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!step) return undefined;
    if (!step.center) {
      const el = document.querySelector(`[data-nl-tour="${step.target}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const tick = () => { measure(); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step, measure]);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return undefined;
    const t = setTimeout(() => setStepIndex(0), 1100);
    return () => clearTimeout(t);
  }, []);

  const close = () => { localStorage.setItem(TOUR_KEY, 'done'); setStepIndex(-1); };
  const next = () => (stepIndex >= STEPS.length - 1 ? close() : setStepIndex((i) => i + 1));
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const relaunch = (
    <button
      onClick={() => setStepIndex(0)}
      title="Take the 45-second tour"
      aria-label="Take the Market Brief tour"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
    >
      <FaQuestion />
    </button>
  );

  if (!step) return relaunch;

  const pad = 10;
  const spotlight = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  let cardStyle = {};
  if (spotlight) {
    const below = spotlight.top + spotlight.height + 24;
    const cardH = 230;
    if (below + cardH < window.innerHeight) {
      cardStyle = { top: below, left: Math.min(Math.max(16, spotlight.left), window.innerWidth - 396) };
    } else {
      cardStyle = { top: Math.max(16, spotlight.top - cardH - 16), left: Math.min(Math.max(16, spotlight.left), window.innerWidth - 396) };
    }
  }

  return (
    <>
      {relaunch}
      <div className="fixed inset-0 z-[90]">
        {spotlight ? (
          <div
            className="absolute rounded-2xl transition-all duration-300 pointer-events-none"
            style={{
              ...spotlight,
              boxShadow: '0 0 0 9999px rgba(10, 10, 11, 0.72), 0 0 0 3px rgba(31, 169, 120, 0.9), 0 0 32px 6px rgba(31, 169, 120, 0.45)',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-950/75" />
        )}

        <div
          className={`absolute bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 w-[92vw] max-w-[380px] ${
            step.center ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center' : ''
          }`}
          style={step.center ? {} : cardStyle}
        >
          <button
            onClick={close}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 flex items-center justify-center text-xs"
            aria-label="Skip tour"
          >
            <FaTimes />
          </button>

          {step.center && (
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <FaNewspaper className="text-white text-xl" />
            </div>
          )}

          <p className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-1.5">{step.eyebrow}</p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{step.title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-5">{step.body}</p>

          <div className={`flex items-center gap-3 ${step.center ? 'justify-center' : 'justify-between'}`}>
            {!step.center && stepIndex > 0 ? (
              <button onClick={back} className="text-sm font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                Back
              </button>
            ) : <span />}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                {stepIndex + 1} / {STEPS.length}
              </span>
              <button
                onClick={next}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl text-sm font-bold shadow-md shadow-green-500/25 hover:shadow-lg transition-all"
              >
                {step.next || (stepIndex === STEPS.length - 1 ? 'Finish' : 'Next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterTour;
