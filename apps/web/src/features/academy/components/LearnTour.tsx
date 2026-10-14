import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaGraduationCap, FaQuestion, FaTimes } from 'react-icons/fa';

/**
 * Xtin Academy guided tour — a spotlight walkthrough for first-time visitors.
 *
 * Feels premium on purpose: dark scrim with a glowing cut-out around the real
 * UI (not screenshots), one idea per step, and it ends by pointing the learner
 * at their actual first lesson. Auto-starts once (localStorage), relaunchable
 * from the floating "?" button.
 *
 * Targets are [data-learn-tour="<id>"] elements on the Learn page.
 */
const TOUR_KEY = 'xtin_learn_tour_v1';

const STEPS = [
  {
    id: 'welcome',
    center: true,
    eyebrow: 'Welcome to Xtin Academy',
    title: 'Your personal finance school',
    body: "Everything here is built for real people, not finance bros — plain language, short lessons, zero jargon. Let me show you around. Takes 60 seconds.",
    next: 'Show me around',
  },
  {
    id: 'journey',
    target: 'hero-journey',
    eyebrow: 'Step 1 · Your journey',
    title: 'This card is really yours',
    body: 'It tracks your actual progress across every level. Each lesson you finish moves these bars — nothing here is decoration.',
  },
  {
    id: 'difficulty',
    target: 'difficulty-switcher',
    eyebrow: 'Step 2 · Pick your level',
    title: 'Start where you are',
    body: 'New to money? Stay on Beginner — 8 complete courses, free forever. You can switch levels anytime; nothing is ever hidden from view.',
  },
  {
    id: 'modules',
    target: 'module-grid',
    eyebrow: 'Step 3 · Courses',
    title: 'One card = one full course',
    body: 'Tap any card and lesson 1 opens instantly — no signup walls, no previews of previews. Your progress on each course shows right on the card.',
  },
  {
    id: 'premium',
    target: 'premium-section',
    eyebrow: 'Step 4 · Going deeper',
    title: 'Pro completes the library',
    body: 'Intermediate and Advanced courses give you the first lessons free. Academy Pro unlocks all 20 courses and every certificate for less than a cup of chai a day.',
  },
  {
    id: 'finish',
    center: true,
    eyebrow: 'You’re all set',
    title: 'Your first lesson takes 5 minutes',
    body: 'That’s the whole tour. The best time to understand money was ten years ago — the second best is right now.',
    next: 'Start my first lesson',
  },
];

const LearnTour = ({ onFinishNavigate }) => {
  const [stepIndex, setStepIndex] = useState(-1); // -1 = closed
  const [rect, setRect] = useState(null);
  const rafRef = useRef(null);

  const step = stepIndex >= 0 ? STEPS[stepIndex] : null;

  const measure = useCallback(() => {
    if (!step || step.center) { setRect(null); return; }
    const el = document.querySelector(`[data-learn-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // Scroll target into view, then measure (and re-measure on scroll/resize).
  useEffect(() => {
    if (!step) return undefined;
    if (!step.center) {
      const el = document.querySelector(`[data-learn-tour="${step.target}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const tick = () => { measure(); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step, measure]);

  // Auto-start for first-time visitors (after the page settles).
  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return undefined;
    const t = setTimeout(() => setStepIndex(0), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = (finished = false) => {
    localStorage.setItem(TOUR_KEY, 'done');
    setStepIndex(-1);
    if (finished) onFinishNavigate?.();
  };

  const next = () => {
    if (stepIndex >= STEPS.length - 1) close(true);
    else setStepIndex((i) => i + 1);
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  /* Floating relaunch button (always present) */
  const relaunch = (
    <button
      onClick={() => setStepIndex(0)}
      title="Take the 60-second tour"
      aria-label="Take the Academy tour"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
    >
      <FaQuestion />
    </button>
  );

  if (!step) return relaunch;

  const pad = 10;
  const spotlight = rect
    ? {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    }
    : null;

  // Card position: under the spotlight when there's room, above otherwise.
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
        {/* Scrim with glowing cut-out (box-shadow trick) */}
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

        {/* Step card */}
        <div
          className={`absolute bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 w-[92vw] max-w-[380px] ${step.center ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center' : ''
            }`}
          style={step.center ? {} : cardStyle}
        >
          <button
            onClick={() => close(false)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 flex items-center justify-center text-xs"
            aria-label="Skip tour"
          >
            <FaTimes />
          </button>

          {step.center && (
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <FaGraduationCap className="text-white text-xl" />
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
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-green-500/25 hover:shadow-lg transition-all"
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

export default LearnTour;
