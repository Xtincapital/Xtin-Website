import { test, expect } from './fixtures';
import { collectConsoleErrors } from './utils';

// `/login` — App.tsx routes this directly to a dedicated LoginPage
// (features/auth/pages/LoginPage.tsx); it does NOT redirect to `/`. Verified
// by reading apps/web/src/App.tsx's route table directly (a prior-session
// audit had guessed it might redirect — that guess was wrong for this repo).
test.describe('/login', () => {
  test('renders the dedicated sign-in page, not a redirect', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/login');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    // Scoped to the login form specifically — the site footer also has an
    // "Email Address"-labelled newsletter field elsewhere on the page.
    const form = page.locator('form');
    await expect(form.getByLabel('Email Address', { exact: true })).toBeVisible();
    await expect(form.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    expect(getErrors()).toEqual([]);
  });
});
