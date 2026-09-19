import type { Page } from '@playwright/test';

/**
 * Starts collecting `console.error` messages for a page. Call the returned
 * function at the end of a test and assert on its result (usually
 * `expect(getErrors()).toEqual([])`) — this is the "no console errors fired"
 * regression net every smoke test in this suite uses.
 *
 * Page errors (uncaught exceptions) are folded in too, since those are an
 * even stronger signal of real breakage than a logged console.error.
 */
export function collectConsoleErrors(page: Page): () => string[] {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`[uncaught exception] ${err.message}`);
  });

  return () => errors;
}
