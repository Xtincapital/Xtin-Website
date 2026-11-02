import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { _resetGuestGate, FREE_CALCULATIONS, onSignInRequested, useGuestGate } from '../lib/guestGate';

// React's act() environment flag for a hand-rolled renderer.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ user: null as any, loading: false }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth }));

// The real modal needs the auth provider and Supabase; the tests only care that it is asked for, and with what words.
vi.mock('./SignInModal', () => ({
  default: ({ isOpen, onClose, headline }: any) =>
    isOpen ? (
      <div data-testid="signin-modal">
        <h2>{headline}</h2>
        <button onClick={onClose}>close</button>
      </div>
    ) : null,
}));

import GuestSignInPrompt from './GuestSignInPrompt';
import ProtectedPageRoute from './ProtectedPageRoute';
import RequireAccount from './RequireAccount';

let container: HTMLDivElement;
let root: Root;

const render = (ui: React.ReactNode) =>
  act(() => {
    root.render(<MemoryRouter>{ui}</MemoryRouter>);
  });

const click = (el: Element | null) =>
  act(() => {
    (el as HTMLElement).click();
  });

const modal = () => container.querySelector('[data-testid="signin-modal"]');
const button = (label: string) => Array.from(container.querySelectorAll('button')).find((b) => b.textContent === label) ?? null;

beforeEach(() => {
  _resetGuestGate();
  localStorage.clear();
  sessionStorage.clear();
  auth.user = null;
  auth.loading = false;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('ProtectedPageRoute allowGuest', () => {
  const page = <div>the page</div>;

  it('shows a signed-out visitor the page itself, with no modal', () => {
    render(<ProtectedPageRoute allowGuest>{page}</ProtectedPageRoute>);
    expect(container.textContent).toContain('the page');
    expect(modal()).toBeNull();
  });

  it('shows the page straight away while the session is still loading', () => {
    auth.loading = true;
    render(<ProtectedPageRoute allowGuest>{page}</ProtectedPageRoute>);
    expect(container.textContent).toContain('the page');
  });

  it('is unchanged without allowGuest: signed-out visitors get the modal, not the page', () => {
    render(<ProtectedPageRoute>{page}</ProtectedPageRoute>);
    expect(container.textContent).not.toContain('the page');
    expect(modal()).not.toBeNull();
  });

  it('shows signed-in users the page either way', () => {
    auth.user = { id: 'u1' };
    render(<ProtectedPageRoute>{page}</ProtectedPageRoute>);
    expect(container.textContent).toContain('the page');
    expect(modal()).toBeNull();
  });
});

describe('guest calculations', () => {
  const calculate = vi.fn();
  const Calculator = () => {
    const { gate } = useGuestGate();
    return <button onClick={gate(calculate)}>Calculate</button>;
  };

  beforeEach(() => calculate.mockClear());

  it(`runs ${FREE_CALCULATIONS} times for a guest, then opens sign-in instead of calculating`, () => {
    render(
      <>
        <GuestSignInPrompt />
        <Calculator />
      </>
    );
    for (let i = 0; i < FREE_CALCULATIONS; i++) click(button('Calculate'));
    expect(calculate).toHaveBeenCalledTimes(FREE_CALCULATIONS);
    expect(modal()).toBeNull();

    click(button('Calculate'));
    expect(calculate).toHaveBeenCalledTimes(FREE_CALCULATIONS); // the 4th did not run
    expect(container.querySelector('[data-testid="signin-modal"] h2')?.textContent).toBe('Sign in free to keep calculating');
  });

  it('leaves the visitor on the page when the modal is closed, and keeps asking on the next click', () => {
    render(
      <>
        <GuestSignInPrompt />
        <Calculator />
      </>
    );
    for (let i = 0; i < FREE_CALCULATIONS + 1; i++) click(button('Calculate'));
    expect(modal()).not.toBeNull();
    click(button('close'));
    expect(modal()).toBeNull();
    expect(button('Calculate')).not.toBeNull();
    click(button('Calculate'));
    expect(modal()).not.toBeNull();
    expect(calculate).toHaveBeenCalledTimes(FREE_CALCULATIONS);
  });

  it('never limits a signed-in user', () => {
    auth.user = { id: 'u1' };
    render(
      <>
        <GuestSignInPrompt />
        <Calculator />
      </>
    );
    for (let i = 0; i < FREE_CALCULATIONS + 7; i++) click(button('Calculate'));
    expect(calculate).toHaveBeenCalledTimes(FREE_CALCULATIONS + 7);
    expect(modal()).toBeNull();
    expect(localStorage.getItem('xtin.guest.v1')).toBeNull();
  });

  it('does not limit anyone while their saved session is still loading', () => {
    auth.loading = true;
    render(
      <>
        <GuestSignInPrompt />
        <Calculator />
      </>
    );
    for (let i = 0; i < FREE_CALCULATIONS + 2; i++) click(button('Calculate'));
    expect(calculate).toHaveBeenCalledTimes(FREE_CALCULATIONS + 2);
    expect(modal()).toBeNull();
  });
});

describe('RequireAccount', () => {
  const secret = <div>saved strategies</div>;

  it('shows a signed-out visitor a card instead of the page, and no call can fire behind it', () => {
    render(<RequireAccount feature="Saved strategies">{secret}</RequireAccount>);
    expect(container.textContent).not.toContain('saved strategies');
    expect(container.textContent).toContain('Saved strategies needs an account');
  });

  it('opens the sign-in modal over the page when its button is pressed', () => {
    const asked = vi.fn();
    onSignInRequested(asked);
    render(<RequireAccount feature="Saved strategies" reason="upgrade">{secret}</RequireAccount>);
    click(button('Sign in'));
    expect(asked).toHaveBeenCalledWith('upgrade');
  });

  it("uses the generic 'account' wording unless told otherwise", () => {
    const asked = vi.fn();
    onSignInRequested(asked);
    render(<RequireAccount feature="Alerts">{secret}</RequireAccount>);
    click(button('Sign in'));
    expect(asked).toHaveBeenCalledWith('account');
  });

  it('renders the page for a signed-in user', () => {
    auth.user = { id: 'u1' };
    render(<RequireAccount feature="Saved strategies">{secret}</RequireAccount>);
    expect(container.textContent).toContain('saved strategies');
  });

  it('renders nothing while the session loads, so the page does not call the API early', () => {
    auth.loading = true;
    render(<RequireAccount feature="Saved strategies">{secret}</RequireAccount>);
    expect(container.textContent).toBe('');
  });
});
