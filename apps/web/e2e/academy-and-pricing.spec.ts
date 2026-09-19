import { test, expect } from './fixtures';
import { collectConsoleErrors } from './utils';

// Scoped-down "one lesson" / "one purchase" smoke coverage.
//
// The original test scope asked for a full lesson flow and a full purchase
// flow. Neither is reachable end-to-end here: a real purchase needs live
// Razorpay test-mode keys (clicking through would hit a real payment
// gateway with no real keys and hang/fail unpredictably), and lesson
// progress/course data comes from the backend, which isn't running in this
// environment. So:
//   - "one lesson" → load a real Academy lesson route and confirm it
//     renders its real content (ProtectedModuleRoute lets it through under
//     AUTH_BYPASS — see components/ProtectedModuleRoute.tsx).
//   - "one purchase" → load a real product Pricing page and confirm the
//     plan card and its upgrade/subscribe button render, WITHOUT clicking
//     it (that button starts a Razorpay checkout — out of scope here).

test.describe('Academy — one lesson', () => {
  test('/learn/personal-finance-lesson-1 renders real lesson content', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/learn/personal-finance-lesson-1');

    await expect(page).toHaveURL(/\/learn\/personal-finance-lesson-1$/);
    await expect(page.getByRole('heading', { level: 2, name: 'So, What is Personal Finance?' })).toBeVisible();

    expect(getErrors()).toEqual([]);
  });
});

test.describe('Pricing — one purchase (scoped to page render, no checkout click)', () => {
  test('/gini/pricing renders the Pro plan card and an upgrade button', async ({ page }) => {
    const getErrors = collectConsoleErrors(page);

    await page.goto('/gini/pricing');

    await expect(page).toHaveURL(/\/gini\/pricing$/);
    await expect(page.getByText('Xtin Gini Plans')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gini Pro' })).toBeVisible();
    // Confirm the upgrade CTA renders — deliberately not clicked, since that
    // would start a real Razorpay checkout with no test-mode keys available.
    await expect(page.getByRole('button', { name: /Upgrade (yearly|monthly)/ })).toBeVisible();

    // The plan-fetch store (useGiniPlanStore.fetchPlan/fetchWallet) logs
    // "[Gini Plan] fetch failed" / "[Gini Wallet] fetch failed" when the
    // backend on :5002 isn't reachable — expected in this environment (no
    // live backend), not a page-render regression. See product-apps.spec.ts
    // for the same reasoning applied to the app-shell routes.
    const unexpected = getErrors().filter(
      (e) => !/fetch failed|Failed to fetch|NetworkError|ERR_CONNECTION|ERR_EMPTY_RESPONSE/i.test(e)
    );
    expect(unexpected).toEqual([]);
  });
});
