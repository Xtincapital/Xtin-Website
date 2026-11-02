// Signed-out visitors to Journal and Gini land in sample mode (demo data), so
// there is something real to look at before they have signed in. Nothing they
// see is sent to or read from the backend (lib/sampleMode.ts), and the first
// attempt to change it asks them to sign in (lib/guestGate.ts).
//
// When they sign in the demo data is put away, so they see their own. The
// "we switched it on" flag lives in sessionStorage so this also works after
// Google sign-in, which reloads the page.
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SampleModeStore } from './sampleMode';

export function useGuestSample<T>(
  store: SampleModeStore<T>,
  flagKey: string,
  start: () => { datasetId: string; data: T },
  /** Runs once when a guest signs in, to drop anything cached for the signed-out view. */
  onSignedIn?: () => void
) {
  const { user, loading } = useAuth();
  const { active } = store.useState();
  const startRef = useRef(start);
  startRef.current = start;
  const onSignedInRef = useRef(onSignedIn);
  onSignedInRef.current = onSignedIn;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      try {
        sessionStorage.setItem(flagKey, '1');
      } catch {
        /* storage blocked — they just keep the demo data after signing in until they exit it */
      }
      if (!active) {
        const { datasetId, data } = startRef.current();
        store.enter(datasetId, data);
      }
      return;
    }
    let wasGuest = false;
    try {
      wasGuest = sessionStorage.getItem(flagKey) === '1';
      sessionStorage.removeItem(flagKey);
    } catch {
      /* ignore */
    }
    if (wasGuest) {
      if (active) store.exit();
      onSignedInRef.current?.();
    }
  }, [loading, user, active, store, flagKey]);

  return {
    /** Signed out (and past the auth check). */
    guest: !loading && !user,
    /** Render a spinner instead of the routes: auth is still loading, or a guest's demo data isn't on yet. */
    waiting: loading || (!user && !active),
  };
}
