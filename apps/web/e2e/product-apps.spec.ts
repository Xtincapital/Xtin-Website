import { test, expect } from './fixtures';
import { collectConsoleErrors } from './utils';

// `/gini`, `/journal`, `/fundakamental` are each mounted at `<path>/*` behind
// <ProtectedPageRoute> (components/ProtectedPageRoute.tsx), which shows a
// SignInModal instead of the real app when there's no user. Under
// VITE_AUTH_BYPASS the mock user is present immediately, so each of these
// should render its real app shell (GiniLayout/JournalLayout/
// DashboardLayout sidebar nav) rather than the modal — and, per each
// feature's own App.tsx-adjacent routing shell (GiniApp.tsx/JournalApp.tsx/
// FundakamentalApp.tsx), NOT the old marketing-stub pages
// (GiniLanding/JournalLanding/xtin-capital-home) those shells replaced.
//
// Each product's dashboard page fetches live data on mount (react-query /
// its own Pro-plan store) against the backend on :5002, which is not
// running in this environment (no live backend, matching the no-live-
// Supabase constraint this whole suite works around). Those requests fail
// and are caught by the app's own error handling — this is a genuine
// environment gap, not a code regression the suite should hide, so each
// test still asserts on the real UI while accepting console errors that are
// solely & explicitly the app's own graceful "backend unreachable" logging.
// FundaKaMental's dashboard additionally logs "No authentication session
// found" (it calls the backend with a real Supabase session token, which
// AUTH_BYPASS never creates — MOCK_USER is a client-side-only stand-in, see
// contexts/AuthContext.tsx) and "WebSocket error" (its live-price socket
// has nothing to connect to without a running backend) — both discovered by
// running this suite for real, both the same class of "no backend in this
// environment" gap rather than a UI regression.
const BACKEND_UNREACHABLE =
  /fetch failed|Failed to fetch|NetworkError|ERR_CONNECTION|ERR_EMPTY_RESPONSE|No authentication session found|WebSocket error/i;

function unexpectedErrors(errors: string[]): string[] {
  return errors.filter((e) => !BACKEND_UNREACHABLE.test(e));
}

test.describe('/gini (protected product app)', () => {
  test('renders the real Gini app shell, not the marketing stub', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/gini');

    await expect(page).toHaveURL(/\/gini$/);
    // Sidebar nav items unique to the real GiniLayout shell. "Family" is
    // exact-matched — GiniLayout also has a "Family Planning" nav item whose
    // accessible name contains "Family".
    await expect(page.getByRole('link', { name: 'Family', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Monte Carlo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    expect(unexpectedErrors(getErrors())).toEqual([]);
  });
});

test.describe('/journal (protected product app)', () => {
  test('renders the real Journal app shell, not the marketing stub', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/journal');

    await expect(page).toHaveURL(/\/journal$/);
    // Sidebar nav items unique to the real JournalLayout shell.
    await expect(page.getByRole('link', { name: 'Trades' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Psychology' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Coach' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    expect(unexpectedErrors(getErrors())).toEqual([]);
  });
});

test.describe('/fundakamental (protected product app)', () => {
  test('renders the real FundaKaMental app shell, not the marketing stub', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/fundakamental');

    await expect(page).toHaveURL(/\/fundakamental$/);
    // Sidebar nav items unique to the real DashboardLayout shell.
    await expect(page.getByRole('link', { name: 'New Analysis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Stock Scanner' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Watchlist' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

    expect(unexpectedErrors(getErrors())).toEqual([]);
  });
});
