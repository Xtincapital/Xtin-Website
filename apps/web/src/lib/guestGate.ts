// "Try it, then sign in": the free allowance a signed-out visitor gets before
// the site asks them to sign in.
//
//   • Calculators — FREE_CALCULATIONS calculations in total, across every tool.
//   • Learn       — FREE_LESSONS lessons (re-opening one doesn't use a second).
//   • Journal / Gini — demo data only; the first attempt to save, import or use
//     AI asks to sign in (withSampleMode in lib/sampleMode.ts, and blockGuest()
//     at the AI and import entry points).
//   • Purchases   — always need an account: a guest who presses Upgrade or Pay
//     gets the sign-in modal ('upgrade') instead of a checkout that would fail.
//   • Backtest    — the anonymous playground allowance is enforced by the server;
//     when it runs out the modal opens ('backtest').
//
// Signed-in users are never counted or blocked. The count lives in this
// browser's localStorage, so it resets in a private window or after clearing
// site data — fine for things that cost nothing to run (client-side maths,
// free lessons). Anything that costs money must be limited on the server.
import { useCallback } from 'react';

/** Calculations a guest gets across all tools before sign-in is asked. */
export const FREE_CALCULATIONS = 3;
/** Distinct lessons a guest can open before sign-in is asked. */
export const FREE_LESSONS = 1;

const STORAGE_KEY = 'xtin.guest.v1';

export type SignInReason = 'calc' | 'learn' | 'save' | 'ai' | 'upgrade' | 'backtest' | 'account';

interface GuestUsage {
  calcs: number;
  lessons: string[];
}

function readUsage(): GuestUsage {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return {
      calcs: Number.isFinite(parsed?.calcs) && parsed.calcs > 0 ? Math.floor(parsed.calcs) : 0,
      lessons: Array.isArray(parsed?.lessons) ? parsed.lessons.filter((l: unknown) => typeof l === 'string') : [],
    };
  } catch {
    return { calcs: 0, lessons: [] };
  }
}

function writeUsage(usage: GuestUsage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    /* storage blocked — the guest just isn't counted (fails open) */
  }
}

// ── Who is a guest ───────────────────────────────────────────

// Set by <GuestSignInPrompt> from the auth context. Until it has reported
// (and while the saved session is still being restored) nobody is a guest, so
// a signed-in user is never blocked in the moment before their session loads.
let auth = { ready: false, loading: true, signedIn: false };

export function setAuthState(next: { loading: boolean; signedIn: boolean }) {
  auth = { ready: true, ...next };
}

export const isGuest = () => auth.ready && !auth.loading && !auth.signedIn;

// ── Asking the visitor to sign in ────────────────────────────

type Listener = (reason: SignInReason) => void;
const listeners = new Set<Listener>();

/** <GuestSignInPrompt> listens here to open the sign-in modal. */
export function onSignInRequested(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Open the sign-in modal over the current page. Safe to call from non-React code. */
export function requestSignIn(reason: SignInReason) {
  listeners.forEach((listener) => listener(reason));
}

const BLOCKED_MESSAGE: Partial<Record<SignInReason, string>> = {
  ai: 'Sign in to use the AI.',
  upgrade: 'Sign in to upgrade.',
  backtest: 'Sign in to keep backtesting.',
};

/** Thrown instead of the real action when a guest tries something that needs an account. */
export class GuestBlockedError extends Error {
  constructor(reason: SignInReason = 'save') {
    super(BLOCKED_MESSAGE[reason] ?? 'Sign in to save your own data.');
    this.name = 'GuestBlockedError';
  }
}

/**
 * Put at the top of anything a signed-out visitor must not do (saving, importing,
 * AI). Throws a GuestBlockedError and, unless `prompt` is false, opens the
 * sign-in modal first. Pass `prompt: false` for things the page does by itself
 * on load, so merely opening a page never pops the modal. Does nothing for a
 * signed-in user.
 */
export function blockGuest(reason: SignInReason = 'save', { prompt = true }: { prompt?: boolean } = {}) {
  if (!isGuest()) return;
  if (prompt) requestSignIn(reason);
  throw new GuestBlockedError(reason);
}

// ── Calculators ──────────────────────────────────────────────

/**
 * Call when a visitor presses Calculate. Returns whether to go ahead; when it
 * returns false the sign-in modal has already been opened.
 */
export function tryCalculate(): boolean {
  if (!isGuest()) return true;
  const usage = readUsage();
  if (usage.calcs >= FREE_CALCULATIONS) {
    requestSignIn('calc');
    return false;
  }
  writeUsage({ ...usage, calcs: usage.calcs + 1 });
  return true;
}

/**
 * Wrap a calculator's Calculate handler. Use it for what the visitor triggers
 * (the button, Enter) — NOT for re-runs the page does by itself (reopening with
 * a saved result, switching currency), which must not use up a try.
 */
export function useGuestGate() {
  const gate = useCallback(
    <A extends unknown[]>(run: (...args: A) => void) =>
      (...args: A) => {
        if (tryCalculate()) run(...args);
      },
    []
  );
  return { gate };
}

// ── Learn ────────────────────────────────────────────────────

/**
 * Whether a signed-out visitor may open this lesson. The first FREE_LESSONS
 * distinct lessons are allowed and remembered; opening the same one again is
 * always allowed. Never opens the modal itself, so it is safe to call while
 * rendering.
 *
 * Call it only for a visitor the caller has already found to be signed out. It
 * does not check, because during render the shared auth state above can lag
 * behind the component's own `useAuth()` (it is updated in an effect).
 */
export function guestMayOpenLesson(lessonId: string): boolean {
  const usage = readUsage();
  if (usage.lessons.includes(lessonId)) return true;
  if (usage.lessons.length >= FREE_LESSONS) return false;
  writeUsage({ ...usage, lessons: [...usage.lessons, lessonId] });
  return true;
}

/** Test hook. */
export function _resetGuestGate() {
  auth = { ready: false, loading: true, signedIn: false };
  listeners.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
