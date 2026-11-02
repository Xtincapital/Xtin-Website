import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _resetGuestGate, GuestBlockedError, onSignInRequested, setAuthState } from './guestGate';
import { createSampleModeStore, withSampleMode } from './sampleMode';

// A signed-out visitor browses demo data. Reads work; the first change asks them to sign in.
const store = createSampleModeStore<{ n: number }>('test.guest.sample');
const real = {
  getThing: vi.fn(async () => 'real'),
  createThing: vi.fn(async () => 'real'),
  updateThing: vi.fn(async () => 'real'),
  deleteThing: vi.fn(async () => 'real'),
  clearThings: vi.fn(async () => 'real'),
};
const sample = {
  getThing: vi.fn(async () => 'sample'),
  createThing: vi.fn(async () => 'sample'),
  updateThing: vi.fn(async () => 'sample'),
  deleteThing: vi.fn(async () => 'sample'),
  clearThings: vi.fn(async () => 'sample'),
};
const api = withSampleMode(store, real, sample);

beforeEach(() => {
  _resetGuestGate();
  store.exit();
  Object.values(real).forEach((f) => f.mockClear());
  Object.values(sample).forEach((f) => f.mockClear());
});

describe('withSampleMode for a signed-out visitor', () => {
  beforeEach(() => {
    setAuthState({ loading: false, signedIn: false });
    store.enter('d', { n: 1 });
  });

  it('serves reads from the demo data', async () => {
    expect(await api.getThing()).toBe('sample');
  });

  it.each(['createThing', 'updateThing', 'deleteThing', 'clearThings'] as const)('blocks %s and opens sign-in', async (method) => {
    const asked = vi.fn();
    onSignInRequested(asked);
    await expect(api[method]()).rejects.toBeInstanceOf(GuestBlockedError);
    expect(asked).toHaveBeenCalledWith('save');
    expect(sample[method]).not.toHaveBeenCalled();
    expect(real[method]).not.toHaveBeenCalled();
  });
});

describe('withSampleMode for a signed-in user', () => {
  beforeEach(() => setAuthState({ loading: false, signedIn: true }));

  it('writes to the demo data while sample mode is on (as before)', async () => {
    store.enter('d', { n: 1 });
    expect(await api.createThing()).toBe('sample');
    expect(real.createThing).not.toHaveBeenCalled();
  });

  it('uses the real API when sample mode is off (as before)', async () => {
    expect(await api.createThing()).toBe('real');
    expect(await api.getThing()).toBe('real');
  });
});
