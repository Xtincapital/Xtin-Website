import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FREE_CALCULATIONS,
  FREE_LESSONS,
  GuestBlockedError,
  _resetGuestGate,
  blockGuest,
  isGuest,
  guestMayOpenLesson,
  onSignInRequested,
  requestSignIn,
  setAuthState,
  tryCalculate,
} from './guestGate';

const asGuest = () => setAuthState({ loading: false, signedIn: false });
const asSignedIn = () => setAuthState({ loading: false, signedIn: true });

beforeEach(() => {
  _resetGuestGate();
  localStorage.clear();
});

describe('who is a guest', () => {
  it('nobody is a guest until the auth state is known', () => {
    expect(isGuest()).toBe(false);
    setAuthState({ loading: true, signedIn: false });
    expect(isGuest()).toBe(false);
    asGuest();
    expect(isGuest()).toBe(true);
    asSignedIn();
    expect(isGuest()).toBe(false);
  });
});

describe('tryCalculate', () => {
  it('allows the free calculations, then blocks and opens the sign-in modal', () => {
    asGuest();
    const asked = vi.fn();
    onSignInRequested(asked);
    for (let i = 0; i < FREE_CALCULATIONS; i++) expect(tryCalculate()).toBe(true);
    expect(asked).not.toHaveBeenCalled();
    expect(tryCalculate()).toBe(false);
    expect(asked).toHaveBeenCalledWith('calc');
  });

  it('keeps blocking on every later attempt', () => {
    asGuest();
    for (let i = 0; i < FREE_CALCULATIONS; i++) tryCalculate();
    expect(tryCalculate()).toBe(false);
    expect(tryCalculate()).toBe(false);
  });

  it('counts across reloads (state is kept in localStorage)', () => {
    asGuest();
    tryCalculate();
    expect(JSON.parse(localStorage.getItem('xtin.guest.v1') as string).calcs).toBe(1);
  });

  it('never counts or blocks a signed-in user', () => {
    asSignedIn();
    for (let i = 0; i < FREE_CALCULATIONS + 5; i++) expect(tryCalculate()).toBe(true);
    expect(localStorage.getItem('xtin.guest.v1')).toBeNull();
  });

  it("does not block someone whose session is still loading", () => {
    asGuest();
    for (let i = 0; i < FREE_CALCULATIONS; i++) tryCalculate();
    setAuthState({ loading: true, signedIn: false });
    expect(tryCalculate()).toBe(true);
  });

  it('lets the visitor continue after signing in', () => {
    asGuest();
    for (let i = 0; i < FREE_CALCULATIONS; i++) tryCalculate();
    expect(tryCalculate()).toBe(false);
    asSignedIn();
    expect(tryCalculate()).toBe(true);
  });

  it('survives corrupt or blocked storage by letting the guest through', () => {
    asGuest();
    localStorage.setItem('xtin.guest.v1', '{not json');
    expect(tryCalculate()).toBe(true);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    for (let i = 0; i < FREE_CALCULATIONS + 3; i++) expect(tryCalculate()).toBe(true);
    setItem.mockRestore();
  });
});

describe('guestMayOpenLesson', () => {
  it(`allows ${FREE_LESSONS} distinct lesson, remembers it, and blocks the next`, () => {
    expect(guestMayOpenLesson('money-mindset/lesson-1')).toBe(true);
    expect(guestMayOpenLesson('money-mindset/lesson-1')).toBe(true); // same lesson again is free
    expect(guestMayOpenLesson('money-mindset/lesson-2')).toBe(false);
    expect(guestMayOpenLesson('money-mindset/lesson-1')).toBe(true); // still allowed
  });

  it('never opens the modal by itself (it is called while rendering)', () => {
    const asked = vi.fn();
    onSignInRequested(asked);
    guestMayOpenLesson('a/lesson-1');
    guestMayOpenLesson('a/lesson-2');
    expect(asked).not.toHaveBeenCalled();
  });

  it('remembers the lesson across reloads (localStorage)', () => {
    guestMayOpenLesson('a/lesson-1');
    expect(JSON.parse(localStorage.getItem('xtin.guest.v1') as string).lessons).toEqual(['a/lesson-1']);
  });
});

describe('requestSignIn', () => {
  it('reaches every listener and stops after unsubscribe', () => {
    const a = vi.fn();
    const off = onSignInRequested(a);
    requestSignIn('save');
    expect(a).toHaveBeenCalledWith('save');
    off();
    requestSignIn('save');
    expect(a).toHaveBeenCalledTimes(1);
  });
});

describe('blockGuest', () => {
  it('opens the modal and throws for a signed-out visitor', () => {
    asGuest();
    const asked = vi.fn();
    onSignInRequested(asked);
    expect(() => blockGuest('upgrade')).toThrow(GuestBlockedError);
    expect(asked).toHaveBeenCalledWith('upgrade');
  });

  it('can throw quietly, for things a page does by itself on load', () => {
    asGuest();
    const asked = vi.fn();
    onSignInRequested(asked);
    expect(() => blockGuest('ai', { prompt: false })).toThrow(GuestBlockedError);
    expect(asked).not.toHaveBeenCalled();
  });

  it('does nothing for a signed-in user, or while the session is loading', () => {
    const asked = vi.fn();
    onSignInRequested(asked);
    asSignedIn();
    expect(() => blockGuest('save')).not.toThrow();
    setAuthState({ loading: true, signedIn: false });
    expect(() => blockGuest('save')).not.toThrow();
    expect(asked).not.toHaveBeenCalled();
  });

  it('words the error for the reason', () => {
    expect(new GuestBlockedError('upgrade').message).toBe('Sign in to upgrade.');
    expect(new GuestBlockedError('ai').message).toBe('Sign in to use the AI.');
    expect(new GuestBlockedError('save').message).toBe('Sign in to save your own data.');
    expect(new GuestBlockedError('backtest').message).toBe('Sign in to keep backtesting.');
  });
});
