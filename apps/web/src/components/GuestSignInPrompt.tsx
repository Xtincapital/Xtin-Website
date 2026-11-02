import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onSignInRequested, setAuthState, type SignInReason } from '../lib/guestGate';
import SignInModal from './SignInModal';

const COPY: Record<SignInReason, { headline: string; description: string }> = {
  calc: {
    headline: 'Sign in free to keep calculating',
    description: "You've used your free calculations. Sign in or create a free account to keep going — it takes a few seconds.",
  },
  learn: {
    headline: 'Sign in free to keep learning',
    description: 'Sign in or create a free account to open more lessons and keep track of your progress.',
  },
  save: {
    headline: 'Sign in to save your own data',
    description: "You're exploring with demo data. Sign in or create a free account to add and save your own.",
  },
  ai: {
    headline: 'Sign in to use the AI',
    description: 'The AI assistant works on your own account. Sign in or create a free account to start.',
  },
  account: {
    headline: 'Sign in free to continue',
    description: 'This part of Xtin works on your own account. Sign in or create a free account — it takes a few seconds.',
  },
  upgrade: {
    headline: 'Sign in to upgrade',
    description: 'Plans and purchases are tied to your account. Sign in or create a free account, then pick up right where you left off.',
  },
  backtest: {
    headline: 'Sign in free to keep backtesting',
    description: "You've used today's free backtests. Sign in or create a free account for more backtests and to save your strategies.",
  },
};

/**
 * Mounted once, inside the router. Tells the guest gate whether the visitor is
 * signed in, and opens the sign-in modal over the current page whenever the gate
 * asks for it (see lib/guestGate.ts). Closing the modal leaves the visitor where
 * they were; so does signing in.
 */
const GuestSignInPrompt = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [reason, setReason] = useState<SignInReason | null>(null);

  useEffect(() => {
    setAuthState({ loading, signedIn: !!user });
  }, [loading, user]);

  useEffect(() => onSignInRequested(setReason), []);

  useEffect(() => {
    if (user) setReason(null);
  }, [user]);

  if (!reason || user) return null;
  const { headline, description } = COPY[reason];

  // The modal is z-50, the same as the page's own navbar, which comes later in
  // the page and would sit on top of it. This wrapper lifts the modal above.
  return (
    <div className="relative z-[60]">
      <SignInModal
        isOpen
        onClose={() => setReason(null)}
        onSuccess={() => setReason(null)}
        targetToolPath={location.pathname + location.search}
        redirectNote="You'll come straight back to this page after signing in"
        headline={headline}
        description={description}
      />
    </div>
  );
};

export default GuestSignInPrompt;
