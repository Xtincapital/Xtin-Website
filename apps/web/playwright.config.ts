import { defineConfig, devices } from '@playwright/test';

// Phase 13 — Playwright smoke suite for apps/web.
//
// This is a smoke suite, not exhaustive E2E: it boots the app's own Vite dev
// server (via `webServer` below) and checks that the key routes render their
// real content rather than erroring out or silently falling back to a
// marketing stub. It relies on the app's built-in dev auth-bypass
// (VITE_AUTH_BYPASS, read by apps/web/src/config/env.ts /
// contexts/AuthContext.tsx) to reach protected routes without a live
// Supabase project or real credentials — neither is available in this
// environment. VITE_AUTH_BYPASS is set ONLY on the `webServer` process env
// below (not in any .env file), so it applies solely to this test run's own
// dev server instance.
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Smoke suite: one worker locally keeps dev-server-backed runs predictable;
  // CI can still parallelize across shards at the job level.
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port ' + PORT + ' --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      // DEV-ONLY bypass, scoped to this webServer process alone — see
      // apps/web/src/config/env.ts's AUTH_BYPASS. Never set elsewhere.
      VITE_AUTH_BYPASS: 'true',
    },
  },
});
