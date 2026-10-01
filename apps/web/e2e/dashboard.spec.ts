import { test, expect } from './fixtures';
import { collectConsoleErrors } from './utils';

// `/dashboard` — gated by <ProtectedRoute> (components/ProtectedRoute.tsx),
// which redirects to /login when `user` is null. Under VITE_AUTH_BYPASS,
// AuthContext seeds `user` with MOCK_USER (id: 'dev-bypass-user', email:
// 'dev@localhost') synchronously, so ProtectedRoute renders the real
// Dashboard (features/dashboard/pages/Dashboard.tsx) instead of redirecting.
test.describe('/dashboard (protected)', () => {
  test('renders the real dashboard for the AUTH_BYPASS mock user', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/dashboard');

    // No redirect back to /login.
    await expect(page).toHaveURL(/\/dashboard$/);
    // "Welcome back, <name>" heading — Dashboard.tsx falls back through
    // first/last name, then email, then "Investor"; MOCK_USER has empty
    // first/last name so it resolves to the email, dev@localhost.
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
    // Header actions (the old "Verified Account" badge no longer exists).
    await expect(page.getByRole('button', { name: /Edit profile/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Log out/ })).toBeVisible();

    expect(getErrors()).toEqual([]);
  });
});
