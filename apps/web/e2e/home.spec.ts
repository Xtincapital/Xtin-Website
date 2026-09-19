import { test, expect } from './fixtures';
import { collectConsoleErrors } from './utils';

// `/` — the marketing landing page (features/marketing/pages/LandingPages.tsx).
// Under VITE_AUTH_BYPASS the AuthContext mock user is set synchronously, so
// LandingPages renders <Hero /> (the logged-in variant) rather than
// <GuestHomeHero />. We assert on structure that's true either way: a real
// h1 heading and the main nav landmark, plus the "Hello, Dev!" account menu
// button that only the logged-in Navbar state renders (see
// components/Navbar.tsx's postLoginDesktopLinks) — MOCK_USER's first_name
// is "Dev" (contexts/AuthContext.tsx).
test.describe('/ (landing page)', () => {
  test('loads with real content and no console errors', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/');

    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    // Logged-in nav state (AUTH_BYPASS) — confirms the mock user actually
    // took effect on the very first route rendered.
    await expect(page.getByRole('button', { name: 'Hello, Dev!' })).toBeVisible();

    expect(getErrors()).toEqual([]);
  });
});
