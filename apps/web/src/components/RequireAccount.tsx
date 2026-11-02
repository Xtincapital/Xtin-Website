import React from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { requestSignIn, type SignInReason } from '../lib/guestGate';

interface RequireAccountProps {
  /** What the visitor was trying to use, e.g. "Saved strategies". */
  feature: string;
  /** One line on why it needs an account. */
  description?: string;
  /** Which sign-in copy the modal uses. */
  reason?: SignInReason;
  children: React.ReactNode;
}

/**
 * Wraps a page that only works with an account. A signed-out visitor sees a
 * short card with a Sign in button (the modal opens over the page, so they
 * stay where they are); a signed-in user sees the page. While the session is
 * still loading it renders nothing, so the page's own calls don't fire early.
 */
const RequireAccount = ({ feature, description, reason = 'account', children }: RequireAccountProps) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <>{children}</>;

  return (
    <div className="mx-auto my-16 max-w-md px-4 text-center">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <LogIn className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">{feature} needs an account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
          {description ?? 'Sign in or create a free account to use this. It takes a few seconds.'}
        </p>
        <button
          type="button"
          onClick={() => requestSignIn(reason)}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-fill px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default RequireAccount;
