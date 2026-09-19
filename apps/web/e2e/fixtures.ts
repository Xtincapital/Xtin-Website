import { test as base, expect } from '@playwright/test';

// apps/web/src/lib/region.ts's `detectRegion()`/`getRates()` — invoked once
// app-wide by the root CurrencyProvider (contexts/CurrencyContext.tsx),
// mounted around every route — call out to free third-party APIs
// (ipapi.co, ipwho.is for IP geolocation; api.frankfurter.dev for FX rates)
// directly from the browser. Discovered by running this suite for real:
// ipapi.co returned 429 (rate-limited) under this suite's own request
// volume, which Chrome logs as a "Failed to load resource" console error
// regardless of region.ts's own internal try/catch (that only suppresses
// the app *acting* on the failure, not the browser's network-level log).
// That's third-party flakiness, not a regression in this app, so every test
// mocks these endpoints to a fast, deterministic, always-succeeding response
// — keeping the "no console errors" assertion meaningful instead of flaky.
async function mockRegionApis(page: import('@playwright/test').Page) {
  await page.route('https://ipapi.co/json/', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: 'IN' }) })
  );
  await page.route('https://ipwho.is/', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: 'IN' }) })
  );
  await page.route('https://api.frankfurter.dev/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ rates: { INR: 83, EUR: 0.9, GBP: 0.78, AED: 3.67, SGD: 1.34 } }),
    })
  );
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockRegionApis(page);
    await use(page);
  },
});

export { expect };
