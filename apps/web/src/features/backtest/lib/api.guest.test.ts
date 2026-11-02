import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _resetGuestGate, GuestBlockedError, onSignInRequested, setAuthState } from '@/lib/guestGate';

const authService = vi.hoisted(() => ({
  makeOptionalAuthRequest: vi.fn(),
  makeAuthenticatedRequest: vi.fn(),
}));
vi.mock('../../../services/authService', () => ({ default: authService }));

import { backtestApi } from './api';

const ok = (body: unknown) => ({ status: 200, ok: true, json: async () => body });

beforeEach(() => {
  _resetGuestGate();
  authService.makeOptionalAuthRequest.mockReset().mockResolvedValue(ok({}));
  authService.makeAuthenticatedRequest.mockReset().mockResolvedValue(ok({}));
});

describe('Backtest API for a signed-out visitor', () => {
  beforeEach(() => setAuthState({ loading: false, signedIn: false }));

  it.each([
    ['chat', () => backtestApi.chat({ message: 'buy when rsi < 30' })],
    ['plan', () => backtestApi.plan()],
    ['passes', () => backtestApi.passes()],
  ])('lets %s through without a login', async (_name, call) => {
    await call();
    expect(authService.makeOptionalAuthRequest).toHaveBeenCalledTimes(1);
    expect(authService.makeAuthenticatedRequest).not.toHaveBeenCalled();
  });

  it.each([
    ['listStrategies', () => backtestApi.listStrategies(), 'save'],
    ['createStrategy', () => backtestApi.createStrategy({ name: 'x', definition: {} }), 'save'],
    ['run', () => backtestApi.run({ strategy_id: 'a', start_date: '2024-01-01', end_date: '2024-02-01', starting_capital: 1 }), 'save'],
    ['listRuns', () => backtestApi.listRuns(), 'save'],
    ['createPassOrder', () => backtestApi.createPassOrder('pass'), 'upgrade'],
  ])('blocks %s and opens sign-in (%s)', async (_name, call, reason) => {
    const asked = vi.fn();
    onSignInRequested(asked);
    await expect(call()).rejects.toBeInstanceOf(GuestBlockedError);
    expect(asked).toHaveBeenCalledWith(reason);
    expect(authService.makeAuthenticatedRequest).not.toHaveBeenCalled();
    expect(authService.makeOptionalAuthRequest).not.toHaveBeenCalled();
  });
});

describe('Backtest API for a signed-in user', () => {
  beforeEach(() => setAuthState({ loading: false, signedIn: true }));

  it('uses the authenticated request for saved strategies, as before', async () => {
    await backtestApi.listStrategies();
    expect(authService.makeAuthenticatedRequest).toHaveBeenCalledTimes(1);
  });

  it('still sends the playground chat with their token (optional auth attaches it)', async () => {
    await backtestApi.chat({ message: 'x' });
    expect(authService.makeOptionalAuthRequest).toHaveBeenCalledTimes(1);
  });
});
