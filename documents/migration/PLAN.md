# XTIN Ecosystem Consolidation — Migration Plan

Living document. Source audit: [`documents/AUDIT.md`](../AUDIT.md).

## Goal

One `xtin-capital` repo containing XTIN Capital + Gini + Journal + FundaKaMental,
sharing one Supabase/PostgreSQL database and one Supabase-Auth identity, with a
`features/` layer so a new product can be added without restructuring.

Objective: **Consolidate + Organize + Make Maintainable + Preserve Functionality.**
Not a rebuild.

## Locked decisions (2026-09-08)

| Topic | Decision |
|---|---|
| Retired features (advisor/advisory, in-app chat, video calls, mutual funds) | Delete entirely — code + DB tables (after backup) |
| Secrets in committed-location `.env` files | Rotate all — owner executes, Claude prepared the checklist |
| TypeScript | Full conversion up front (Client + API) before feature integration |
| Python AI services | Fold into the Express API — one Node backend, no Python |
| Sub-app integration order | FundaKaMental → Journal → Gini |
| Workspace tool | **npm workspaces** (add Turborepo later only if build caching hurts) |
| Chart library | **recharts** only — drop `chart.js` + `react-chartjs-2` in Phase 2 |

No open decisions. Phase 1 is unblocked once the owner completes the Phase 0
homework: secret rotation + DB baseline capture (see the two `PHASE-0-*.md` files).

## Working model

- One branch + PR per phase (sub-phases for the big ones). Each PR builds and is deployable.
- `main` stays releasable throughout. Tag before each destructive phase.
- No behavior change unless a phase's row says "Yes".
- Rollback anchor: git tag `pre-consolidation` (start of `main` before Phase 0).

## Phases

### Phase 0 — Safety net  ·  branch `chore/phase-0-safety-net`  ·  behavior change: no
- [x] Tag `pre-consolidation` on `main`; create Phase 0 branch.
- [x] Fix prod bug: `Footer.jsx` + `HelpCenter.jsx` hardcoded `http://localhost:5002/api/help/contact` → env-based URL.
- [x] Fix `Client/vite.config.js` dev proxy `:5000` → `VITE_BACKEND_URL || :5002`.
- [x] `.gitignore`: root gains `/Featues/`; new `backend/.gitignore`.
- [x] `Client/.env.example` (VITE-only) + root `.env.example`.
- [x] `documents/AUDIT.md`, this plan.
- [x] `documents/migration/PHASE-0-secret-rotation.md` (owner to execute).
- [x] `documents/migration/PHASE-0-db-baseline.md` (owner to execute → `database/migrations/0000_baseline.sql`).
- [ ] **Owner — URGENT, see below:** rotate secrets; confirm all services healthy.
- [ ] **Owner:** capture live DB schema.
- [ ] **Owner:** slim the real `apps/web/.env` to VITE-only; delete root `.env` if no root-run script needs it; set `VITE_AUTH_BYPASS=false` everywhere non-local.

> 🚨 **Escalation found during Phase 1 (2026-09-13):** `DEPLOYMENT_GUIDE.md` had
> real production secrets (Supabase service-role key, JWT secret, Groq/OpenAI
> keys, Gmail app password, cron secret) committed in plaintext since 2026-03-09,
> and the repo has a real GitHub remote. Redacted in the Phase 1 commit, but that
> doesn't undo the exposure — **rotate everything today**, don't wait for the
> rest of Phase 0/1 to wrap up. Full detail and an added history-scrub section:
> `documents/migration/PHASE-0-secret-rotation.md`.

### Phase 1 — Workspace + TS scaffolding  ·  behavior change: no  ·  ✅ done (`chore/phase-1-workspaces`)
- [x] Root `package.json` → npm workspaces (`apps/web`, `services/api`).
- [x] `Client/` → `apps/web/`; `backend/` → `services/api/`; `Client/server/` → `services/ai-legacy/` (marked in its README as scheduled for removal in Phase 7).
- [x] Fixed path refs: `app.mjs` sitemap/robots/gini/journal static-file paths; README.md, DEPLOYMENT_GUIDE.md, deployment.md `cd`/Root-Directory references.
- [x] `tsconfig.base.json` + per-workspace `tsconfig.json` (`allowJs: true`, `checkJs: false`) — `tsc --noEmit` passes on both workspaces.
- [x] `.prettierrc.json` / `.prettierignore` / `.editorconfig` (config only — no repo-wide reformat; 483 files not yet Prettier-clean, tracked as Phase 2/3 work).
- [x] `services/api/eslint.config.js` (backend had no lint before) — fixed the 2 real errors it surfaced (empty catch blocks, useless regex escape), left pre-existing warnings.
- [x] `.github/workflows/ci.yml` — build is a required gate; lint/typecheck/format are advisory (`continue-on-error`) until Phase 2/3 cleanup and Phase 5 land, then flip to required.
- [x] Consolidated to one root `package-lock.json`; dropped the unused root `axios` dependency; renamed packages to `@xtin-capital/web` / `@xtin-capital/api`.
- [x] Verified: clean `npm install`, `npm run build:web` (Vite build succeeds), `node --check` on the API entry files, both linters, both typechecks.
- [ ] **Owner:** Vercel Root Directory `Client`→`apps/web`, Render Root Directory `backend`→`services/api` — dashboards only, can't be done from files. See `documents/migration/PHASE-1-deploy-config.md`.
- [ ] **Owner:** live smoke test after redeploying with the new root directories — auth (email + OAuth), one Razorpay test purchase, newsletter trigger, ~10 key routes.
- [ ] Render worker service for `services/scheduler.mjs` — deferred to Phase 3 (cron still runs in the web process for now, unchanged from before).

### Phase 2a — Client cleanup  ·  behavior change: no  ·  ✅ done (`chore/phase-2-client-cleanup`)
Split from the original Phase 2 scope: everything low-risk and independently
verifiable landed now; the `features/*` reorg and CSS consolidation (higher
risk, touches ~330 files at once) moved to Phase 2b below so they get their
own dedicated, carefully-verified pass instead of being rushed alongside this.

- [x] Deleted dead code (confirmed zero references first): `src/future_plans/`
  (Advisor* pages + advisorService.js + a duplicate MutualFunds page),
  `src/pages/MutualFunds/` (byte-identical dup, also unreferenced),
  `src/pages/Newsletter.jsx.bak`.
- [x] Removed unused deps: `@daily-co/daily-js`, `@daily-co/daily-react`
  (VideoCall uses a Daily.co iframe embed, not the SDK), `@emailjs/browser`,
  `chart.js`, `react-chartjs-2` (recharts is the only chart lib in use).
  Fixed `vite.config.js` manualChunks accordingly.
- [x] New `src/config/env.js` (`BACKEND_URL`, `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `AUTH_BYPASS`) — every value defaults to what was
  previously hardcoded/inlined, so no behavior change. `src/supabase/index.js`
  now reads from it instead of a hardcoded URL + anon key.
- [x] Codemodded all 16 files that inlined
  `import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002'` to import
  `BACKEND_URL` — including fixing 4 files where the naive find-replace would
  have produced a `const BACKEND_URL = BACKEND_URL` TDZ bug (caught and fixed
  before it shipped).
- [x] `App.jsx`: converted 271 default imports to `React.lazy()` + wrapped
  `<Routes>` in `<Suspense>`. Main JS chunk **11.5 MB → 954 KB**. Deleted 18
  orphaned `*Page` Placeholder consts never referenced by any `<Route>` (only
  `ToolsIndex`/`SsyPage` are real, both left exactly as-is). Route count
  verified identical (285) before/after; live browser smoke test (landing,
  a calculator, a deep lesson route, the still-stubbed `/tools/ssy`) — clean
  console, no visual regressions.
- [x] `useRegion.js` simplified to one source (`CurrencyContext`, which wraps
  the whole app) — removed the dead "standalone fallback" branch, which also
  quietly violated rules-of-hooks.
- [x] Renamed the 16 space-containing `pages/learn/*` folders (e.g.
  `"Estate Planning"` → `EstatePlanning`) and updated App.jsx's import paths.
  Left the pre-existing "Algorithemic" typo alone — unrelated to this fix.
- Net lint effect on `apps/web`: 129 → 94 problems (from the deletions), zero
  new issues introduced.
- Deferred `lib/api-client.ts` (a real fetch-wrapper adopted everywhere): the
  ~40 call sites have subtly different auth/retry conventions per file;
  forcing them onto one wrapper now risked silently changing auth behavior.
  `config/env.js` captured the safe, mechanical part (the base URL). Revisit
  when Phase 2b touches these files anyway.

### Phase 2b — Feature folders + design consolidation  ·  behavior change: no  ·  ✅ feature-folder migration done (`chore/phase-2b-feature-folders`)
Being done one feature domain at a time rather than all ~330 files in one
pass — each domain gets the same build+lint+route-count+browser-smoke
verification as Phase 2a before moving to the next.

- [x] **Academy domain done.** Merged `components/learn|learn-page|learning`
  (8 surviving files) + `pages/learn/` (245 files, 20 lesson modules) into
  `features/academy/{components,pages}/`. Relative imports recomputed:
  pages/learn/** got a scripted uniform "+1 `../`" (verified safe — every
  escaping import already named its target folder explicitly); the
  components/learn* files needed 5 hand-fixed imports instead (some relied
  on being one level inside `src/components/`, which doesn't shift
  uniformly). Fixed the one external call site (`ProtectedModuleRoute.jsx`).
  Found and deleted 3 files that were never imported by anything and would
  have broken the build the moment they were wired up (`CoursePlayerPage`,
  `VideoPlayer` — depends on the undeclared `@vidstack/react` package —
  and `CourseSidebar`), plus their orphaned asset. Also closed a Phase 2a
  gap: `CourseDetail`/`PurchasePage` used double-quoted imports that the
  earlier lazy-conversion regex (single-quote only) missed — converted
  now. Verified: build, lint (94→92), route count (285 unchanged), live
  browser smoke test of `/learn`, a lesson deep link, and `/courses/:id`.
- [x] **CSS "consolidation"** turned out to be dead-file deletion: `App.css`
  (unused Vite-scaffold leftover, never imported) and `styles/globals.css`
  (empty, never imported) were both dead — deleted both. `index.css` was
  already the single real stylesheet and already has a token layer
  (`--theme-*` custom properties); nothing left to consolidate.
- [x] **Tools domain done.** Moved `components/calculators/` (20 files) →
  `features/tools/components/`, `pages/{tools.jsx,ToolsIntro.jsx}` →
  `features/tools/pages/`. Two different depth shifts in the same pass
  (calculators +1 for explicit-path imports / full rewrite for bare-sibling
  imports; the two page files +2, since they moved from depth 1 to depth 3)
  — computed and applied correctly, verified by build, lint (92, unchanged),
  route count (285, unchanged), and a live smoke test of `/tools`,
  `/tools/sip`, `/tools/real-estate-investment`.
- [x] **Certificates domain done.** Moved `components/certificates/` (4
  files), `pages/{VerifyCertificate,AdminCertificates}.jsx`,
  `services/certificateService.js`, and `utils/certificatePdf.js` into
  `features/certificates/{components,pages,services,utils}/` — first domain
  where the service/util layer moved too (confirmed both were
  certificate-only first). Imports fixed per actual relationship (some
  collapsed a path segment once sibling files moved together, not just a
  uniform depth bump). Verified: build, lint (92, unchanged), route count
  (285, unchanged), live smoke test of `/verify/:id` and
  `/admin/certificates` (both rendered correct non-happy-path states with
  the dev server backend-less; only expected network/auth console errors,
  stack traces pointing at the new paths).
- [x] **Newsletter domain done.** Moved `components/newsletter/` (3 files),
  `pages/{Newsletter,NewsletterDisplay,NewsletterIntro,SubstackArticle}.jsx`,
  `services/newsletterPlanService.js`, and `lib/newsletterPlan.js` into
  `features/newsletter/{components,pages,services,lib}/`. First domain
  where "move the service too" did NOT apply uniformly:
  `newsletterService.js` is used by the shared `Footer.jsx` (footer
  subscribe form), so it stayed at the top level — only
  `newsletterPlanService.js` (confirmed newsletter-only) moved. Deleted
  `pages/NewsletterDetail.jsx` (dead, never imported — same pattern as
  prior passes). Caught and fixed a cross-reference in `pages/Dashboard.jsx`
  (not yet migrated) that imported from the old `lib/newsletterPlan`
  location — missing it would have broken the build outright, not just
  silently regressed at runtime. Verified: build, lint (92, unchanged),
  route count (285, unchanged), live smoke test of `/newsletter`,
  `/intro/newsletter`, `/dashboard`.
- [x] **Algos domain done.** Moved
  `pages/{AlgosPage,AlgorithmsIntro,AlgoTerms,BacktestLanding}.jsx` and
  `services/algorithmService.js` into `features/algos/{pages,services}/`.
  Same cross-reference pattern as newsletter: `algorithmService.js` is used
  by `pages/Dashboard.jsx` (not yet migrated) too — moved the service with
  algos anyway (nothing else in the app depends on it, unlike
  `newsletterService.js`) and fixed Dashboard's import path. Checking for
  cross-references before moving is now a standard step. Verified: build,
  lint (92, unchanged), route count (285, unchanged), live smoke test of
  `/algos`, `/backtest`, `/dashboard`.
- [x] **Auth domain done — pages only, by design.** Moved
  `pages/{LoginPage,SignupPage,ForgotPasswordPage,ResetPasswordPage}.jsx`
  into `features/auth/pages/`. `AuthContext.jsx` (19 consumers),
  `authService.js` (9 consumers), and `SignInModal.jsx` (6 consumers across
  algos/academy/marketing/route-guards) all stay shared at the top level —
  clearly cross-cutting infrastructure, not auth-page-exclusive.
  `utils/auth.js`'s only consumer is `pages/Dashboard.jsx` (saved for last
  per owner request), not any of the 4 auth pages — left in place rather
  than colocating it with a domain that doesn't use it; revisit when
  Dashboard moves. Also deleted `utils/googleAuth.js` — a second, unused
  Google sign-in path flagged as suspicious in the original audit, confirmed
  zero imports. Verified: build, lint (92, unchanged), route count (285,
  unchanged), live smoke test of `/login` and `/forgot-password`.
- [x] **Marketing + gini/journal/fundakamental domains done.** Moved
  `LandingPages/AboutPage/ProductsPage/HelpCenter/NotFound/Privacy/
  PublisherTerms/RevenueShareAgreement/Terms` + `Hero/GuestHomeHero/
  ToolsSection` into `features/marketing/`. Gini/Journal/FundaKaMental
  landing+intro pages got their **own** feature folders
  (`features/{gini,journal,fundakamental}/pages/`) rather than folding into
  marketing, since Phases 8-10 will drop the real implementations into
  these exact slots later. Also fixed a gap left by the academy pass —
  `components/icons/LearningIcons.jsx` was academy-exclusive (27 consumers,
  confirmed) but got left behind at the shared level; moved it into
  `features/academy/components/` and fixed all 27 imports. Deleted 4
  confirmed-dead components (`CTASection`, `StatsBanner`, `ReturnCard`,
  `ToolCard` — zero importers) and one orphaned CSS file. **Found but did
  not delete:** `PublisherTerms.jsx` and `RevenueShareAgreement.jsx` are
  also unrouted (same dead-code signature) — moved them rather than
  removing them, since legal/contract content deserves a human call on
  whether the route is missing or the content is genuinely retired. Ask the
  owner. Verified: build, lint (92, unchanged), route count (285,
  unchanged), live smoke test of `/`, `/learn/estate-planning` (exercises
  the LearningIcons fix), `/gini`, `/fundakamental`, `/terms`.
- [x] **Dashboard domain done — Phase 2b feature-folder work complete.**
  Moved `pages/{Dashboard,DashboardIntro}.jsx`, `utils/auth.js`, and
  `services/bundleSubscriptionService.js` into `features/dashboard/`
  (the latter two confirmed Dashboard-exclusive, resolving the deferred
  question from the auth pass). A build failure caught a real bug:
  `utils/auth.js` has a dynamic `await import('../supabase')` that the
  static `grep "^import"` check used throughout this migration doesn't
  match — fixed before it shipped. Final sweep of the shared top level
  turned up two more academy gaps (`pages/LearnIntro.jsx`,
  `services/learnPlanService.js` — both academy-exclusive, unlike
  `lib/learnPlan.js`/`utils/lessonProgress.js` which stay shared because
  `ProtectedModuleRoute.jsx` also depends on them) and one more dead file
  (`services/metricService.js`, zero references). **`src/pages/` no longer
  exists** — every page in the app now lives under `features/*/pages/`.
  Verified: build (after the dynamic-import fix), lint (92, unchanged),
  route count (285, unchanged), live smoke test of `/dashboard` (1614
  lines, the messiest file in the whole migration), `/intro/dashboard`,
  `/intro/learn`, `/learn`.
- [ ] Split `App.jsx`'s route table into `app/routes.jsx` (+
  `app/providers.jsx`), now that every domain has its own `features/*/pages/`
  to draw a route array from — no longer premature, ready whenever this is
  picked up next. `App.jsx` itself hasn't been touched structurally beyond
  import-path fixes throughout Phase 2b; it's still one 600+ line file.
- [ ] Adopt `lib/api-client.ts` across the ~40 deferred call sites — every
  domain's services got touched for their move without this happening
  organically (moves were pure path fixes, not behavior changes), so this
  is still a distinct, not-yet-started task.

### Phase 3 — API cleanup  ·  behavior change: no  ·  core reorg done, 3 sub-items left (`chore/phase-3-api-cleanup`)
- [x] Removed `GET /api/test-table` entirely — it inserted+deleted a real row
  in the live `users` table on every unauthenticated call. Gated
  `/api/auth/debug-token` and `/api/auth/debug-config` to 404 outside
  development (debug-token echoes full JWT payload contents — email, name,
  phone — with no auth check). Verified against a live server in both dev
  and `NODE_ENV=production` modes.
- [x] One shared Supabase client factory: `supabase/index.mjs` (the
  existing, already-widely-used service-role client — kept its location
  rather than introducing a new `lib/supabase.mjs` and rewriting 23 import
  sites for no benefit) now also exports `userClientFromToken(token)`,
  replacing 3 duplicated inline `createClient` calls in
  `middlewares/auth.mjs`, `controllers/user.controller.mjs` (logout), and
  `check-auth-config.mjs`. Verified end-to-end against the real Supabase
  API with a live server.
- [x] Extracted `routes/ai.routes.mjs` (723 lines, everything mixed
  together) into `modules/ai/{knowledge,providers,promptBuilder,
  tradeAnalysis,ai.routes}.mjs`, split by concern, bodies byte-identical.
  Verified against a live server — full call chain executes correctly
  through to the external AI provider call, which fails on an unrelated,
  pre-existing invalid API key (not a regression).
- [x] **Reorganized `routes/controllers/repository/validators` →
  `modules/<domain>/`.** Owner chose to do this now, including the retired
  advisor/chat/video-call/forms stack (rather than waiting for Phase 4) —
  Phase 4 now deletes whole module directories instead of scattered files.
  12 domains: `auth`, `academy` (course+learn+progress), `certificates`,
  `algos`, `billing` (subscriptionPlan), `metrics`, `help`, `files`,
  `newsletter` (newsletter+newsletterPlan+substack+subscription+the cron
  runner/scheduler), `advisor` (advisor+advisorAuth+forms+its mail
  service), `chat`, `video-call`. `routes/`, `controllers/`, `repository/`,
  `validators/` no longer exist. `services/mail.service.mjs` stayed shared
  (used by both newsletter and advisor). Every import fixed based on where
  its target actually landed — sibling-collapsed within a module, kept
  cross-module where genuinely needed (`advisorAuth.routes.mjs` still calls
  `chat.controller.mjs`), +1 depth for everything shared. A full-repo sweep
  for stale references (not just inside `modules/`) caught 3 more real,
  unrelated bugs: `utils/newsletterGeneratorSimple.mjs` and
  `test-advisor-application-email.mjs` pointed at old file locations, and
  `insert_demo_indian_finance_newsletter.js` had a `./backend/supabase/...`
  typo predating this repo's Phase 1 rename entirely. Verified
  exhaustively: `node --check` on every `.mjs`/`.js` file (all pass), lint
  clean, and a full server boot with a live endpoint hit per domain module
  (13 endpoints across all 12 domains, including one specifically targeting
  the advisor→chat cross-module import) — every module reachable, every
  auth guard still enforced, zero import errors.
- [x] Add missing repository layers where controllers still query Supabase
  directly (per `documents/AUDIT.md` D5.37). Done for all 8 controllers
  that actually had direct queries: help, learnPlan, algorithm,
  newsletterPlan, progress, subscriptionPlan, certificate, and auth/user
  (auth.signUp/signInWithPassword/getUser plus the `users` table
  read/update, not just table queries). `videoCall` was deleted wholesale
  in Phase 4 (retired) so needs nothing; `substack` was checked and has no
  direct Supabase usage at all. Each extraction moved the exact Supabase
  query chain into a named repository function with no change to shape,
  error handling, or business logic — kept `{data, error}` destructuring
  identical, preserved intentional error-swallowing (e.g. "payment already
  succeeded, never fail the response over storage"), and reused existing
  domain repositories for the billing aggregation reads
  (`getActiveAlgorithmSubscriptionsForUser`, `getLearnPlansForUser`,
  `getNewsletterPlansForUser`) instead of duplicating query logic in a
  billing-specific one. Along the way, fixed a real regression the
  mutual-funds deletion had introduced: `CERTIFICATE_MODULES` in
  `progress.controller.mjs` still listed a 7-lesson `mutual-funds` entry
  whose content no longer exists, which would have made that certificate
  permanently unearnable. Verified: `node --check` on every `.mjs` file
  (all pass), `npm run lint:api` clean (0 errors, only pre-existing
  warnings), full server boot, and live curl tests against auth
  (login/signup/profile), billing (user-active-plans), and certificate
  (verify/list) endpoints — every auth guard and validation path still
  fires correctly.
- [x] Normalize inconsistent route mount paths. Re-examined once actually
  looked at closely: the "inconsistency" was purely about *which file*
  declared each domain's URL prefix (some in `app.ts`'s mount call, some
  inside the router itself) — the final external URLs were already
  consistent (`/api/progress/user`, `/api/learn/plan`, etc.) either way, so
  the originally-feared "client-visible URL change" risk didn't actually
  apply. Normalized 5 routers (progress, learn, newsletterPlan, help, ai)
  to declare their own prefix internally, matching the majority pattern;
  every mount in `app.ts` is now uniformly `app.use("/api", ...)`.
  Verified: `tsc --noEmit` clean, live server + curl confirming all 5
  domains respond identically at their unchanged URLs.
- [x] `newsletter_runs` DB-backed dedupe table + `newsletterRunner.ts`
  refactored to use it instead of in-memory state — the actual blocker
  (needing the Phase 0 baseline before touching an unknown live schema) is
  moot now that the whole database was rebuilt from scratch on the new
  Supabase project (see the repo/DB migration note below); there's no more
  "unknown schema" to be careful around. Added a `worker.ts` standalone
  entry point (no HTTP server, just the scheduler) and a commented-out
  Render Background Worker block in `render.yaml`, ready to enable.
  **Still owner-blocked**: running `database/migrations/0002_newsletter_runs.sql`
  against the live project (SQL Editor), and actually creating the Render
  worker service on the dashboard whenever ready — the code and schema no
  longer block on anything.

### Phase 4 — Delete retired stack  ·  behavior change: YES  ·  code deleted, DB deletion still pending (`chore/phase-4-delete-retired-stack`)
- [x] Deleted `services/api/modules/{advisor,chat,video-call}/` wholesale (17
  files: advisor+advisorAuth+forms/join-as-advisory+its mail service, chat,
  video-call), `middlewares/{advisorAuth,upload}.mjs` (both exclusively used
  by the deleted modules), and the orphaned root-level
  `test-advisor-application-email.mjs`. Removed the 5 corresponding
  imports + `app.use()` mounts from `app.mjs`.
- [x] Deleted Client `services/{advisorAuthService,videoCallService,
  chatService}.js` and `components/{chat,video}/` — confirmed zero
  remaining importers first. Kept the 5 existing `Navigate`-to-`/`
  redirects in `App.jsx` for now, per this plan's own caution about
  external links.
- [x] Verified: every `services/api` file syntax-checks, lint clean on
  both sides (down from before — deleted files carried their own
  pre-existing issues, zero new ones), `apps/web` build unchanged, live
  server + curl confirming all 5 removed backend route groups now 404 and
  everything else untouched, live browser confirming the `/advisor/login`
  redirect still works.
- [x] **DB deletion — resolved by the repo/DB migration, not by running SQL.**
  The old Supabase project (leaked keys, see the secret-rotation incident)
  was abandoned entirely rather than patched in place. The fresh schema on
  the new project (`database/migrations/0000_baseline.sql`) was built from
  scratch from what the live code actually queries — `advisors`,
  `join_as_advisory_forms`, `chat_conversations`, `chat_messages`, and
  `video_call_sessions` were simply never created there, since nothing
  references them anymore. No destructive SQL was ever run; there was
  nothing to drop on the table that matters going forward. (The old
  project, if anyone still has access to it, still physically has these
  tables — but it's no longer the project this app points at.)
- [x] `database/quick-advisor-setup.mjs` itself deleted in Phase 4. **But
  the risk it created is not resolved by deleting the file:** it used a
  hardcoded default password (`XtinCapital2026!`) to create real Supabase
  Auth accounts for advisors — if any of those accounts still exist and
  still have that password, deleting the script doesn't change that.
  **Owner:** check the Supabase Auth users table for advisor accounts
  created with this script and rotate/reset their passwords; do this
  alongside Phase 0's secret rotation, not the eventual table drop.
- [x] `features/academy/pages/mutualfunds/` — owner confirmed retired;
  deleted in the Phase 3/4 close-out pass (2026-09-13).

### Phase 5 — Full TypeScript conversion  ·  behavior change: no (types only)
- [x] Convert `apps/web` (`.jsx`→`.tsx`, 345 files) and `services/api`
  (`.mjs`→`.ts`, 76 files, `tsx` runtime — no build step). `tsc --noEmit`
  clean on both, CI now requires it. See progress log for detail,
  including the real bugs the conversion caught.
- [ ] **Owner-blocked:** generate `packages/types` from the live schema
  (`supabase gen types typescript`) — needs a Supabase access token or a
  direct Postgres connection string; neither exists in this environment.
- [ ] Flip `tsconfig.base.json` to `strict: true`. Tested and reverted:
  ~2,000 errors (1,474 web + 545 api), overwhelmingly null-safety and
  implicit-`any` issues spread across the whole codebase — a distinct,
  much larger follow-on project. Worth its own decision on priority, not
  a default next step.

### Phase 6 — Shared auth foundation  ·  behavior change: staged  ·  ✅ done
- [x] `requireAuth` already accepted both token types before this phase —
  confirmed unchanged (`middlewares/auth.ts` tries the backend JWT first,
  falls back to a raw Supabase token).
- [x] `user_entitlements` table (`database/migrations/0003_user_entitlements.sql`):
  a single-table, normalized view of "what does this user have access to"
  (`learn` | `newsletter` | `algo` | `bundle`), kept in sync by the same 4
  payment-verification code paths that already write to
  `learn_pro_plans`/`newsletter_pro_plans`/`algorithm_subscriptions`/
  `user_subscriptions` — `entitlement.repository.ts`'s `upsertEntitlement()`
  is called right after each existing write, best-effort (never fails the
  payment response over this derived index). No backfill needed — fresh
  project, nothing to backfill from.
- [x] Client switches to Supabase-session token: `login()`/`signup()` in
  `AuthContext.tsx` now call `supabase.auth.signInWithPassword()` /
  `supabase.auth.signUp()` directly (the same pattern `signInWithGoogle`
  already used), instead of going through the backend's
  `/api/auth/login`/`/api/auth/signup`, which minted its own JWT. `sync`
  (`/api/auth/sync`) was left as-is (still returns a token) for backward
  compatibility — the client just no longer relies on that field, which
  **is** the staging: the backend's old JWT-minting path still exists and
  still works for any other caller, only the web client's own behavior
  changed. Verified live in a real browser: signup → (admin-confirmed
  email) → login → dashboard renders with real profile data → logout,
  zero console errors, and confirmed via a decoded-JWT inspection that
  `auth_token` now holds a genuine Supabase-issued token
  (`iss: .../auth/v1`, no backend `jti`/`userId` claims) rather than a
  backend-minted one.
- [ ] Phase 12 still removes backend-JWT *acceptance* and minting entirely
  — deliberately not done here, that's the "one release later" half of
  the staged plan.
- Advisor role folding: moot, feature retired in Phase 4 and the fresh
  project has zero advisor accounts.
- **Owner-blocked**: run `database/migrations/0003_user_entitlements.sql`
  against the live project — tested the write path directly and confirmed
  it fails gracefully (caught, logged, doesn't block payments) without the
  table, but no entitlement rows will actually be written until it exists.
- Advisor role folds into Supabase auth as `role='advisor'` (only if any advisor accounts survive Phase 4; otherwise skip).

### Phase 7 — Fold Python AI into Express  ·  behavior change: YES (endpoint parity required)  ·  DONE (2026-09-14)
- [x] Port `Client/server/app/*` (compliance engine, user profiler, prompt builder, token optimizer, knowledge base) → `services/api/src/modules/ai/`.
- [x] `ChatWidget` points at `/api/ai/*`. Remove `VITE_API_BASE_URL`. Delete `services/ai-legacy/`.
- [x] Parity tests on chat / analyze / health before switch.
- Note: `prompt_builder`, `user_profiler` (query-intent classification), and the `compliance_engine`'s prompt-time rules were already re-implemented natively in `modules/ai/promptBuilder.ts` earlier in the migration. What was missing on re-verification was the compliance engine's *post-generation* enforcement (it doesn't just instruct the model — it scans the actual reply, redacts prohibited phrases like "guaranteed returns"/"risk-free", and force-injects SEBI-style disclaimers regardless of what the model wrote). Ported that specifically as `modules/ai/compliance.ts`, wired into both `/api/ai/chat` and `/api/ai/gemini`. `TokenOptimizer`'s spam/rate-limit detection and `KnowledgeBaseManager`'s Pinecone RAG were not ported — the former has no current equivalent (flagged as a follow-up, not a blocker), the latter was dormant/unconfigured even in the retired Python service.

### Phase 8 — Integrate FundaKaMental  ·  behavior change: YES  ·  DONE (2026-09-15)
- [x] `git subtree add` FundaKaMental (keeps history) into `features-incoming/fundakamental`.
- [x] UI (sub-phase 8e) → `apps/web/src/features/fundakamental`, complete. Foundation: `apps/web` had no shadcn/ui library before this — added a `@` → `src` path alias (`vite.config.js`/`tsconfig.json`), merged FundaKaMental's shadcn design tokens into `tailwind.config.js` (purely additive, zero collision with existing utilities), installed every new dependency it needs (all `@radix-ui/react-*`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `sonner`, etc.). Ported all 55 shadcn/ui primitives to `apps/web/src/components/ui/` — caught and fixed 3 real version-mismatch bugs along the way (`apps/web` already had newer majors of `react-day-picker`/`react-resizable-panels`/`recharts` than FundaKaMental's own source targeted; adapted the component code to the installed APIs rather than downgrading). Built a scoped `fundakamental.css`: the original's `index.css` had global base-layer rules (`* { border-border }`, `body { bg-background }`, `h1-h6 { font }`, scrollbar styling) that would have silently restyled every other page on the site if imported as-is — rescoped everything under a `.fundakamental-scope` wrapper class instead. Rewrote the API client (`features/fundakamental/lib/api.ts`) onto this app's existing `authService.makeAuthenticatedRequest`/`BACKEND_URL` pattern — verified every one of its ~60 endpoint calls against the real route files in `services/api/modules/fundakamental/*.routes.ts` (100% match; several real bugs fixed along the way, e.g. doubled `/portfolios/portfolios` path segments, a `pdf_export.py` PDF-context dict that matched none of `funda_reports`'s real columns). Dropped FundaKaMental's entire own auth stack (`useAuthStore`, `Login`/`Register`/`ForgotPassword`/`ResetPassword`/`LandingPage` pages, its own `ProtectedRoute`) as redundant with this app's shared `AuthContext`; `/fundakamental` uses the same `ProtectedPageRoute` gate (sign-in modal over the URL) that `/algos` and `/tools` already use — `/intro/fundakamental` untouched. Reused the app's existing `lib/region.ts`/`useRegion` and `CurrencyProvider` instead of porting FundaKaMental's near-duplicate region/FX logic. All 7 remaining pages ported (`NewAnalysis`, `AnalysisReport` + chat UI + PDF download, `StockScanner`, `Portfolio`, `Watchlist`, `History`, `Pricing`) plus every supporting component (`DashboardLayout`, `UpgradeModal`/`BuyTokensModal`/`ProCelebration`, `LivePrice` + the live-price WebSocket hook re-pointed at `/api/fundakamental/ws/market-data`, `TechnicalIndicators`, `CompanySearchResults`, `ChatMessage`, `FileProcessingStatus`, brand components), built via 5 fully parallel sub-tasks (disjoint files, zero collisions) then wired into `FundakamentalApp.tsx`'s routes by hand. Two more real bugs caught during the page port: Portfolio.tsx referenced a `.market` field on the region config that the shared `lib/region.ts` doesn't have (`undefined.market` — would have crashed the Add Investment dialog on open, fixed to a direct region-code check) and `pdf_export.py`'s screener endpoint had auth disabled behind a leftover TODO (already caught earlier in 8a, applied consistently). Verified: `tsc --noEmit` clean across the entire `apps/web` project with zero errors, then a full live-browser walkthrough (Dashboard, Watchlist, Portfolio, Pricing) confirmed the shell, sidebar nav, onboarding tour, region/currency-aware pricing display, graceful error-toast handling on failed fetches, and the live-price WebSocket (verified with a direct in-page connection test — the one console error during the walkthrough was a benign React StrictMode dev-only double-invoke artifact, not a real bug) all work correctly. Not independently re-verified with a real logged-in session (only Supabase auth-bypass dev mode) — data-fetching code paths are exercised and fail gracefully without a token, but real end-to-end data flow (upload → analyze → chat → PDF, watchlist/portfolio CRUD) awaits a real user test pass.
- [x] `/fundakamental` route → real feature (replaced the marketing stub). `/intro/fundakamental` kept as-is.
- [x] Backend (sub-phase 8a, core read features) → `services/api/modules/fundakamental`: stock search/screener, technical indicators (SMA/EMA/RSI/MACD/Bollinger/Stochastic/ATR/OBV), live-price WebSocket streaming (`/api/fundakamental/ws/market-data`, 15s polling fan-out via `yahoo-finance2`), watchlists (v2 schema), portfolios, price alerts + notifications. Mounted in `app.ts`/`index.ts`, boot-tested, auth verified (401 without a token on every new route group).
- [x] Backend (sub-phase 8b, AI reports + PDF export) → document upload (Storage bucket `funda-documents`, `pdf-parse`/`xlsx` extraction), AI-generated financial analysis reports (region/investor-style/horizon-aware prompt, reused `modules/ai/providers.ts`'s `generateAIText` — Claude primary, OpenAI fallback — instead of a new client), plan-gated report limits (`funda_users.reports_used`/`reports_limit`), and PDF export (`nunjucks` templates + `puppeteer`, replacing the Python source's WeasyPrint). Two real bugs fixed along the way: (1) the long-known `analysis_reports` → `funda_reports` table-name bug in `pdf_export.py`, and (2) a second, previously-undiagnosed bug in the same file — its PDF context was built from an ad hoc dict (`current_price`, `recommendation`, `weaknesses`, ...) that matched none of `funda_reports`'s actual columns; the port builds PDF context from the real `AnalysisReportResponse` shape instead. Verified live: server boots clean, auth enforced on every new route (401 without a token), the unauthenticated `/export/health` diagnostic returns 200 and confirms Puppeteer is actually generating real PDFs at runtime (not just typechecking) — self-reported a 155 KB test PDF.
- [x] Backend (sub-phase 8c, document chat) → real Q&A over an uploaded document's content, grounded via genuine semantic retrieval. **Not a mechanical port**: the Python source's RAG chat was never actually functional in production (ChromaDB + sentence-transformers were commented out of `requirements.txt` — "sentence-transformers pulls a ~2GB torch download", chroma-hnswlib needed a C++ compiler not present even in the original dev setup — every call to its chat endpoint would have hit an `ImportError`). Built a genuinely working replacement instead, on infrastructure already proven to work in this environment: **pgvector** in the same Supabase project (`database/migrations/0004_fundakamental_rag_chat.sql` — `funda_document_chunks` table + `funda_match_document_chunks` cosine-similarity RPC, no separate vector DB service) for storage/search, and **`@huggingface/transformers`** running `Xenova/all-MiniLM-L6-v2` locally via ONNX (the JS-runnable equivalent of the Python source's own embedding model choice, same 384 dimensions) for embeddings — both smoke-tested working before/during the port. Chat generation reuses `generateAIText` (Claude primary, OpenAI fallback), same as 8b. Chunking/embedding is wired into the existing document-upload flow (`analysis.controller.ts`, best-effort — a chunking failure doesn't fail the upload). Token-wallet gating from the Python source is intentionally not replicated (no wallet exists yet — that's 8d). Verified live: server boots clean, both new routes (`POST /fundakamental/chat/message`, `GET /fundakamental/chat/history/:reportId`) return 401 without a token; full live end-to-end (upload → chunk → embed → ask → retrieve) still pending the migration actually being run against the live DB.
- [x] Backend (sub-phase 8d, Razorpay + token wallet) → Pro-subscription checkout (`/fundakamental/razorpay/order|verify|plan`, HMAC-verified, server-side-only grant, matching this codebase's existing Razorpay pattern from `algorithm.controller.ts`/`newsletterPlan.controller.ts`) and the AI token wallet (`/fundakamental/tokens/wallet|packs|order|verify`, monthly allowance by plan tier + never-expiring top-up packs, `funda_ai_wallets`/`funda_pro_payments`/`funda_token_pack_purchases`). This is also the phase that replaced the temporary gating stand-ins from 8b/8c with the Python source's actual design: `analysis.controller.ts`'s report generation now gates on a real wallet-balance check (`MIN_TOKENS_FOR_REPORT = 20_000`, matching the Python source exactly) instead of the `reports_used`/`reports_limit` counter stand-in, and `chat.controller.ts` (previously ungated) now gates on a 500-token minimum, both deducting real usage afterward. Neither `generateAIText` nor `ragChat.ts` returns a real token-usage count, so both fall back to a length-based estimate — chat's matches the Python source's own fallback formula exactly (`max(500, (len(question)+len(answer))//4)`); analysis's uses the same style with a 20K floor instead of a flat default. Verified live: server boots clean, auth enforced on every new route (401 without a token), the intentionally-public `/tokens/packs` catalogue returns 200 with the real pricing.
- [x] Backend porting (8a-8d) is now complete. Remaining: frontend port (8e).
- [x] DB: migrated its tables prefixed (`funda_reports`, `funda_source_documents`, `funda_watchlists`/`funda_watchlist_items` v2 — not the legacy singular `funda_watchlist`, `funda_chat_messages`, plus ~25 more — see `database/migrations/0001_gini_journal_fundakamental.sql`). Its profile table is `funda_users` (`id` = `auth.users.id` 1:1, not a separate id space — no email-merge needed).
- Decisions made during 8a: dropped the Python service's unused Stripe billing path entirely (frontend never called it; every other product in this app uses Razorpay only — the parallel Razorpay-based `funda_pro_payments`/`funda_ai_wallets` tables are what's live). Deferred nothing on the WebSocket — ported it now rather than falling back to polling from the client, since Render's web service supports long-lived WS connections without any extra config.
- Incidental fix during 8b: `constants/config.ts`'s `PORT` was typed `string | number` (`process.env.PORT || 5000`); a transitive `@types/node` patch bump (pulled in by 8b's new dependencies) tightened `http.Server.listen`'s overload resolution and turned this into a real type error. Fixed to `Number(process.env.PORT) || 5000` — pre-existing latent bug, unrelated to FundaKaMental itself, just surfaced by it.

### Phase 9 — Integrate Journal  ·  behavior change: YES  ·  DONE (2026-09-18)
- [x] `git subtree add` Journal into `features-incoming/journal`.
- [x] Rebuild UI as `features/journal` React components from its logic (`app.js`, `ai-coach.js`) — do not paste the 240 KB files. Sub-phase 9d done: routing shell + core pages, built as two parallel tasks. Reused Phase 8's shadcn/ui library (`apps/web/src/components/ui/*`) and `recharts` wholesale instead of porting the original's ~1,500 lines of hand-written CSS — a `.journal-scope`-wrapped `journal.css` (mirroring `fundakamental.css`'s scoping pattern exactly) carries a similar green-accented theme without pixel-matching the original. `JournalApp.tsx` (nested `/journal/*` routes, all reserved paths documented and pre-wired to a `ComingSoon` placeholder where a page doesn't exist yet) + `JournalLayout.tsx` (sidebar nav) + `lib/api.ts` (API client against the now-complete `/api/journal/*` backend, mirroring FundaKaMental's client pattern) + `Dashboard.tsx` (metric cards, monthly P&L trend + win-rate gauge via recharts, recent trades, goal progress). `Trades.tsx` (paginated table, full add/edit form covering every trade field, strategy autocomplete wired to `journal_strategies`'s get-or-create) and `Goals.tsx` (cards with live progress computed from trades, add/delete) built in parallel — the two tasks' independently-written API-client expectations converged on the same method names without intervention needed. `/journal` now routes to the real app via the same `ProtectedPageRoute` gate `/algos`/`/tools`/`/fundakamental` already use; `/intro/journal` untouched; the old `JournalLanding.tsx` marketing stub left in place, unrouted (same precedent as `xtin-capital-home.tsx` in Phase 8e). Verified live in a browser: Dashboard/Trades/Goals all render correctly (sidebar nav, charts, tables, the full Add Trade dialog), zero console errors, graceful error-toast handling on failed fetches (dev auth-bypass has no real token, same limitation noted in Phase 8e). Sub-phase 9e done: all 8 remaining data-view tabs, built as three parallel tasks grouped by content similarity. **Calendar/Monthly/Daily** (`Calendar.tsx`, `Monthly.tsx`, `Daily.tsx`): a month-grid calendar with per-day color-coded P&L and a day-detail dialog, plus single-month/single-day metric+distribution views — reading the actual source corrected a wrong assumption in the task brief (Monthly was guessed to be a multi-month table; the real `updateMonthlyView()` is a single-month picker, reproduced faithfully instead of the guess). **Analytics/Summary/Psychology** (`Analytics.tsx`, `Summary.tsx`, `Psychology.tsx`): strategy-level analytics (risk:reward, ROI, best/most-consistent strategy, a full per-strategy stats table), a fuller metrics page with real risk metrics Dashboard doesn't show (Sharpe, Sortino, max drawdown, Kelly %, Calmar ratio), and emotion-tagged trade analysis (P&L-by-emotion, top tags, a journal-entries feed) — also correctly identified and skipped two dead-code helper functions in the original (`getBestStrategy`/`getMostTradedMarket`, never actually called by anything) rather than guessing at intended UI for them. **Heatmaps/Hourly** (`Heatmaps.tsx`, `Hourly.tsx`, `lib/journalPatternHelpers.ts`): three colored-grid heatmaps (monthly, day-of-week × session, hour × market) with year/date-range filters and ported color-interpolation logic, plus an hour-of-day performance breakdown (4 recharts visualizations + a breakdown table) — implemented as CSS-grid colored cells rather than forcing heatmaps into `recharts`, which doesn't have a real heatmap primitive. All three tasks independently landed on the same pragmatic data-fetching tradeoff Dashboard.tsx already established (a large single-page trade fetch, no dedicated aggregate backend endpoint yet, documented in each file). Verified live in a browser: Heatmaps, Analytics, and Calendar all render correctly (grids, charts, filters, month navigation), zero console errors. Sub-phase 9f done: AI Coach page + a shared plan/wallet store + Pricing + Settings, built as two parallel tasks. **Store + Pricing + Settings** (`store/useJournalPlanStore.ts`, `Pricing.tsx`, `Settings.tsx`): a Zustand store (mirroring FundaKaMental's `usePlanStore.ts`) handling plan/wallet state and Razorpay checkout for both the Pro plan and AI token packs; Pricing combines what the original split across a marketing page (`pricing.html`, AI packs only) and an in-app upgrade modal (`journal-premium.js`'s `JournalPlan`, the real Pro-plan flow) into one page with a Monthly/Yearly toggle, feature lists, and both checkouts wired to the real endpoints; Settings reuses the shared `PUT /api/auth/profile` (same as FundaKaMental's Settings.tsx) plus lightweight `localStorage`-backed preferences (default currency/timezone, matching how minor these were in the original) and a Plan tab. Checkout kept inline on the Pricing page rather than building global upgrade modals — reasoned in the store's own header comment that Journal's upsell surfaces are narrow enough (this page, plus a link from Coach) not to need FundaKaMental's pattern. **AI Coach page** (`Coach.tsx`, `lib/coachApi.ts`): 5 tabs — Chat (full send/receive UI, session-only history since the backend has no chat-history endpoint for Journal, confirmed by reading the routes directly rather than assuming), Weekly Review, Pre-Trade Check (all three real AI calls), Insights (deliberately narrow — read the already-built Analytics/Psychology pages first and found their charts already cover what the original's profile/analysis view would have shown, so this only surfaces the genuinely new content: `/analyze`'s rule-based issues/strengths list, with links out rather than a third copy of the same charts), and Alerts (a clean empty state for the backend's intentionally-always-empty stub). A shared `InsufficientTokensError`/402 handler surfaces a "top up" prompt linking to Pricing on every AI-gated action. Both tasks independently duplicated `lib/api.ts`'s tiny authenticated-fetch helper rather than editing that file (an explicit boundary set to prevent the two parallel tasks colliding) — reviewed afterward and left as-is: the duplication is ~4 lines, and `coachApi.ts`'s wrapper has genuinely different behavior (typed 402 handling) from a pure copy, so forcing a merge wasn't worth the risk for the marginal DRY gain. Verified live in a browser: Coach's full 5-tab layout, wallet badge, and a real end-to-end chat send (message appears, backend call fires, graceful inline+toast error on the expected dev-bypass auth failure — confirming the request/response/error cycle works); Pricing's plan/AI-pack sections and FAQ; Settings' profile/preferences/plan tabs. Zero console errors throughout.
- [x] `/journal` → real feature (replaced the marketing stub, same `ProtectedPageRoute` gate `/algos`/`/tools`/`/fundakamental` use). `/intro/journal` untouched. Retiring `xtinjournal.website` (external DNS/redirect) is an owner action, not a code change — not done here.
- [x] Backend → `modules/journal` (+ AI into `modules/ai`), sub-phase 9a done: full CRUD for trades/goals/strategies. Explicit architecture decision (owner confirmed): normalize into real relational tables rather than preserving the original app's client-direct-to-Supabase JSON-blob pattern (`journal_user_state`), matching FundaKaMental's "backend owns all business data" architecture. `journal_trades` (paginated list/get/create/patch/delete + bulk clear), `journal_goals`, `journal_strategies` (get-or-create-by-name, matching `app.js`'s `rememberCustomStrategy` auto-add-on-save behavior) all live at `/api/journal/{trades,goals,strategies}`, `req.user.authId` throughout (no separate Journal profile table — `journal_*.user_id` references `auth.users(id)` directly, same as the original's own design). Verified live: server boots clean, all three route groups return 401 without a token. Two of the original's endpoints deliberately NOT ported: `main.py`'s own code comments call `/api/v2/subscription`/`/api/v2/invoices` "legacy mock" — backed by in-process Python dicts that reset on every restart and accept a fake "subscription" with zero payment verification; the real payment paths (`/plan/razorpay/*`, `/ai/razorpay/*`) are a later sub-phase.
- [x] Backend, sub-phase 9b done: AI-coach endpoints + bulk trade import, built as two parallel tasks. **AI-coach** (`aiCoach.controller.ts`): `POST /journal/analyze` (pure rule-based math — win rate/profit factor/strategy breakdown/overtrading heuristics, no AI call), `GET /journal/behavioral-alerts` (trivial stub, matches the original's own "always empty" design), `POST /journal/chat` (the richest endpoint — full system-prompt build with trade stats, strategy breakdown, an emotion→P&L "fingerprint", goals, plan-tier-aware response length/history depth, currency-aware localization; ported faithfully, spot-checked against the source), `POST /journal/weekly-review`, `POST /journal/pre-trade-check`. Extended `modules/ai/providers.ts` with a new `generateAIWithUsage()` (purely additive, `generateAIText` untouched) that returns Claude's REAL token usage from its own API response, instead of FundaKaMental's length-based estimate — Journal's original design already did real metering (`call_claude`) and this preserves that accuracy for `journal_ai_wallets` deduction. Journal's Claude calls default to `claude-haiku-4-5-20251001` (a separate `JOURNAL_ANTHROPIC_MODEL` env var, independent of the shared `ANTHROPIC_MODEL`) matching the original's own model choice for short/frequent coaching replies. AI wallet gating (`aiWallet.repository.ts`) is internal-only at this stage — get-or-create with a free-token grant on first use, balance check before a Claude call (402 if insufficient), real deduction after — the user-facing wallet/purchase endpoints are 9c. **Bulk import** (`import.controller.ts`/`importParsers.ts`): `POST /journal/import-trades`, ported the full header-alias fuzzy-matching + multi-format date parsing + PnL back-calculation logic faithfully from the Python source, outputs snake_case matching `journal_trades`'s real columns (not the original's camelCase) so parsed rows POST straight to the Phase 9a trades endpoint with zero transformation; tested end-to-end with real CSV, Excel (via `xlsx`, covering both `.xls`/`.xlsx` in one path unlike the original's two-library split), and PDF (via `pdf-parse`) files, including the missing-exit-price back-calculation edge case. Verified live: server boots clean, all four new route groups (`analyze`, `chat`, `behavioral-alerts`, `import-trades`) return 401 without a token.
- [x] Backend, sub-phase 9c done: Razorpay Pro plan + AI wallet purchase endpoints. **AI token packs** (`aiWallet.controller.ts`): `GET /journal/ai/plans` (static catalogue), `GET /journal/ai/wallet`, `POST /journal/ai/razorpay/order`, `POST /journal/ai/razorpay/verify`. **Pro plan** (`proPlan.controller.ts`): `POST /journal/plan/razorpay/order` (buyer's currency, INR/USD/GBP/EUR), `POST /journal/plan/razorpay/verify` (persists to `journal_pro_plans`, grants a 100,000-token Pro-included AI bonus, invalidates 9b's plan-tier cache so the upgrade takes effect immediately — all three match the Python source exactly), `GET /journal/plan`. Real bug caught during this sub-phase: the task brief assumed 9b's `addAiTokens` was already idempotent on `payment_id` (matching the Python source's `credited_payments` list) — it wasn't, so a Razorpay webhook retry or a duplicate verify call would have double-credited tokens. Fixed by adding an idempotency guard at the call site (`findPurchaseByPaymentId` against the new `journal_ai_wallet_purchases` audit repository, checked before crediting) in both the AI-pack and Pro-plan verify handlers, without modifying `aiWallet.repository.ts` itself — this also gives the persistent audit table real purpose, correctly replacing the Python source's fragile in-memory `AI_ORDER_STORE` replay guard. Verified live: server boots clean, all four new route groups return 401 without a token.
- [x] Journal backend porting (9a-9c) is now complete. Remaining: frontend rewrite (9d-9f, the vanilla-JS-to-React work).
- [x] DB: `database/migrations/0005_journal_normalized_schema.sql` — `journal_trades`, `journal_goals`, `journal_strategies`, plus `journal_ai_wallets`/`journal_ai_wallet_purchases` (mirroring `funda_ai_wallets`/`funda_token_pack_purchases` from Phase 8d) for the not-yet-built AI-wallet sub-phase. `journal_user_state`/`journal_pro_plans` (already live from 0001) are untouched — still used for genuinely UI-only state (tab selection, drafts, settings) and the existing Pro-plan billing table respectively.

### Phase 10 — Integrate Gini  ·  behavior change: YES
- `git subtree add` Gini into `features-incoming/gini`.
- Rebuild UI as `features/gini` React (from `app.js` 354 KB + `gini-premium.js`); port `gini-ai-engine.js` → `modules/ai`; Razorpay → existing `modules/subscriptions`.
- DB: migrate `gini_family_members`, `gini_assets`, `gini_liabilities`, `gini_goals`, `gini_elder_care`, `gini_education_plans`, `gini_tax_optimization` onto shared `users`.
- `/gini` → real feature; retire `xtingini.in` (redirect).

### Phase 11 — DB consolidation & hardening  ·  behavior change: YES (DB, tested)
- Normalize table names; enforce FK/`user_id` consistency; enable + test RLS table-by-table on staging.
- Everything as `database/migrations/*`. Regenerate `packages/types`. Delete `backend/database/*.sql` ad-hoc scripts and the AI-written `DATABASE_SCHEMA_README.md` (replace with generated `database/SCHEMA.md`).

### Phase 12 — Auth consolidation finish  ·  behavior change: YES (staged, fallback release)
- Remove backend-minted JWT path, `advisor_token`, `utils/auth.js` vs `authService` duplication, `utils/googleAuth.js`.
- One `apiClient`, one `useAuth`, one route guard. Supabase session revocation replaces in-memory blacklist; delete `backend/data/`.

### Phase 13 — Testing, docs, deploy  ·  behavior change: no
- Tests: auth middleware, Razorpay verify, newsletter generation, entitlement checks, region math. Playwright smoke: `/`, `/login`, `/dashboard`, `/gini`, `/journal`, `/fundakamental`, one purchase, one lesson.
- CI gates on. ADRs: single Supabase project; Supabase-only auth; workspace layout; `features/` pattern; Python→Node AI. Retire old deploy targets + stale `.md` guides.

## Progress log

- 2026-09-08 — Audit delivered. Decisions locked (retired=delete, secrets=rotate,
  TS=full, AI=fold into Express, order=Funda→Journal→Gini, workspaces=npm,
  charts=recharts). Phase 0 committed on `chore/phase-0-safety-net`
  (2 prod bug fixes + gitignore + `.env.example`s + audit/plan docs).
  Awaiting owner: secret rotation + DB baseline capture before Phase 1.
- 2026-09-13 — Phase 1 done on `chore/phase-1-workspaces` (branched from Phase 0):
  npm workspaces, `Client`→`apps/web`, `backend`→`services/api`,
  `Client/server`→`services/ai-legacy`, TS/Prettier/ESLint/CI scaffolding,
  single root lockfile. Verified with install + build + lint + typecheck.
  **Found a live secret leak** in `DEPLOYMENT_GUIDE.md` (real Supabase
  service-role key, JWT secret, AI keys, Gmail app password, cron secret,
  committed since 2026-03-09) — redacted on this branch; escalated in
  `PHASE-0-secret-rotation.md` as an urgent, do-today item, independent of
  phase sequencing. Owner still owes: rotate those secrets, the two dashboard
  Root Directory changes (`PHASE-1-deploy-config.md`), a live smoke test, and
  the DB baseline capture.
- 2026-09-13 — Owner deferred secret rotation, asked to proceed. Phase 2a done
  on `chore/phase-2-client-cleanup` (branched from Phase 1): dead-code +
  unused-dep removal, `config/env.js` + BACKEND_URL codemod (caught and fixed
  a self-reference bug the codemod would've otherwise introduced in 4 files),
  `App.jsx` React.lazy conversion (main chunk 11.5 MB → 954 KB, route count
  verified unchanged, live browser smoke test clean), `useRegion.js` single-
  source simplification, 16 space-containing lesson folders renamed. Split
  the rest of the original Phase 2 scope (features/* reorg, CSS
  consolidation) into Phase 2b — deliberately deferred as its own pass since
  it's the highest-risk step so far (touches ~330 files' import paths).
  Secret rotation, DB baseline capture, and the two Phase 1 dashboard changes
  are all still outstanding.
- 2026-09-13 — Phase 2b started on `chore/phase-2b-feature-folders` (branched
  from Phase 2a). Academy domain migrated (245+8 files into
  `features/academy/`) and the CSS "consolidation" turned out to be deleting
  2 dead files. Found and removed 3 more dead files with a latent missing-
  dependency bug along the way. Tools domain migrated next (20 calculators +
  2 pages into `features/tools/`), then certificates (4 components + 2 pages
  + a service + a util into `features/certificates/`), then newsletter (3
  components + 4 pages + 1 service + 1 lib file — first domain where a
  service, newsletterService.js, stayed shared instead of moving, since
  Footer.jsx also depends on it), then algos (4 pages + 1 service, with a
  Dashboard.jsx cross-reference fix same as newsletter's), then auth (4
  pages only — AuthContext/authService/SignInModal confirmed too widely
  shared to move; deleted the dead utils/googleAuth.js along the way), then
  marketing + gini/journal/fundakamental (9 marketing pages + 3 marketing-
  only components, plus dedicated feature folders for the 3 sub-app landing
  pages ahead of Phases 8-10; fixed a gap from the academy pass
  — LearningIcons.jsx — and deleted 5 more confirmed-dead files, flagging 2
  more unrouted legal pages for the owner instead of guessing), then
  dashboard last as requested (1614-line Dashboard.jsx, cross-references to
  algos/newsletter/academy, utils/auth.js + bundleSubscriptionService.js
  moved with it as confirmed Dashboard-exclusive). A build failure caught a
  dynamic `await import()` in utils/auth.js that the static-import-only
  grep check used all migration missed — fixed before it shipped. Final
  sweep found 2 more academy gaps (LearnIntro.jsx, learnPlanService.js) and
  1 more dead file (metricService.js). **Phase 2b's feature-folder
  migration is now complete — `src/pages/` no longer exists, every page
  lives under `features/*/pages/`.** Remaining Phase 2b items (splitting
  App.jsx's route table, adopting lib/api-client.ts) are now unblocked but
  not started.
- 2026-09-13 — Phase 3 started on `chore/phase-3-api-cleanup` (branched from
  Phase 2b). Three slices done, each verified against a live running
  server with real credentials: removed the test-table data-mutation
  endpoint and gated the debug routes to non-prod; replaced 3 duplicated
  inline Supabase `createClient` calls with one shared factory
  (`userClientFromToken`) on the existing `supabase/index.mjs`; extracted
  the 723-line `ai.routes.mjs` into 5 focused files under `modules/ai/`.
  Recommended (not yet actioned) doing Phase 4's retired-stack deletion
  before the big `routes/controllers/repository` → `modules/<domain>/`
  reorg, so that reorg effort isn't spent on code Phase 4 is about to
  delete anyway. Cron-to-worker move is partially owner-blocked (needs a
  Render dashboard action and the Phase 0 DB baseline).
- 2026-09-13 — Owner chose to do the full `modules/<domain>/` reorg now,
  including the retired advisor/chat/video-call/forms stack, rather than
  waiting for Phase 4. Executed: 12 domain modules, ~60 files moved,
  every import re-resolved based on actual new location (not a blind
  depth rule), one genuine cross-module reference kept explicit
  (advisorAuth → chat). `routes/`, `controllers/`, `repository/`,
  `validators/` no longer exist. A full-repo sweep for stale references
  caught 3 more real bugs unrelated to the reorg itself, including a
  `./backend/supabase/...` typo that predates this repo's Phase 1 rename.
  Verified exhaustively — every file syntax-checked, lint clean, full
  server boot with a live endpoint hit per domain (13 endpoints, 12
  domains). Updated Phase 4's description to match: the retired stack is
  now 3 clean module directories instead of scattered files, so that
  phase is easier than originally scoped. Three Phase 3 sub-items remain,
  each flagged as its own decision rather than a default next step: adding
  missing repository layers, normalizing route mount paths (client-visible,
  cuts against "no behavior change"), and the cron-to-worker move
  (owner-blocked on a Render action + the Phase 0 DB baseline).
- 2026-09-13 — Phase 4 started on `chore/phase-4-delete-retired-stack`
  (branched from the renamed Phase 3 branch, `Redesign`). Deleted the code
  side of the retired advisor/chat/video-call stack on both sides
  (backend: 3 module directories + 2 middlewares + an orphaned test
  script; frontend: 3 services + 2 component directories), verified with
  syntax checks, lint, a build, and live server + browser testing. Did
  NOT touch the database — dropping the 5 retired tables needs a real
  backup and the still-outstanding Phase 0 baseline first, and destructive
  SQL against production isn't run on a standing "delete entirely"
  decision without a specific go-ahead at the time. Also surfaced two
  things found along the way rather than acting on them unilaterally: a
  hardcoded default password in a leftover advisor DB-setup script, and
  an unrouted academy mutual-funds lesson folder with unclear intent.
- 2026-09-13 — Closed out the remaining Phase 3/4 items owner explicitly
  authorized: deleted the unrouted mutual-funds academy content (owner
  confirmed retired), and added the missing repository layer to all 8
  controllers that still queried Supabase directly (help, learnPlan,
  algorithm, newsletterPlan, progress, subscriptionPlan, certificate,
  auth/user) — each extraction kept the exact query shape and error
  handling, no logic changes. Found and fixed a real regression along the
  way: `progress.controller.mjs`'s `CERTIFICATE_MODULES` list still
  required the deleted mutual-funds lesson content, which would have made
  that certificate permanently unearnable. Explicitly declined to drop
  the 5 retired DB tables without a fresh confirmation (destructive,
  production, still no DB baseline) — remains the one open Phase 4 item.
- 2026-09-13 — Phase 5 (full TypeScript conversion) done on
  `chore/phase-5-typescript-conversion`. Backend: renamed all 76 `.mjs`
  files to `.ts` (git mv, history preserved), switched every relative
  import from `.mjs` to `.js` per NodeNext convention, and moved the
  runtime from `node index.mjs` to `tsx index.ts` — no build step, closest
  match to the existing dev experience (`package.json` scripts,
  `render.yaml`, and the stray `vercel.json` all updated; `nodemon`
  removed as redundant). Frontend: renamed all 345 `.jsx`/`.js` files
  under `apps/web/src` to `.tsx`/`.ts`, added a `vite-env.d.ts` (Vite
  client types + a `window.Razorpay` ambient declaration), and added
  `typescript-eslint` to both workspaces' ESLint configs (the old
  plain-JS config couldn't parse type syntax at all). `no-explicit-any`
  is off in both — several fetch/`Response.json()` call sites and a few
  pragmatic casts needed it, and being dogmatic about zero `any` mid-
  migration isn't this phase's goal.
  Fixing the ~330 real compile errors this surfaced (311 on the frontend,
  ~20 on the backend) was almost entirely mechanical — untyped
  destructured params defaulting to `{}` instead of the intended shape,
  `useState(...)` calls whose later `setX(string)` call didn't match the
  inferred type, `Object.entries`/`new Set()` losing their generic,
  fetch's `Response.json()` returning `unknown` under Node's types
  instead of DOM's `any` — but it also caught several genuine
  pre-existing bugs no amount of manual review had surfaced:
  - Two dynamic `import('../utils/newsletterGeneratorSimple.js')` calls
    in `modules/newsletter/{newsletter.controller,newsletterRunner}.ts`
    were missing a `../` since the Phase 3 reorg — silently pointing at a
    path that doesn't exist, meaning the newsletter generation fallback
    has been broken since that reorg landed.
  - `JournalLanding.tsx` passed `onSignInSuccess` to `<SignInModal>`,
    which actually reads `onSuccess` — the real prop was silently
    dropped, and `SignInModal` calls `onSuccess()` unconditionally on
    login, so a real sign-in from the Journal landing page's modal would
    have thrown after every successful login.
  - Three lesson pages (`PCLesson6/8/9.tsx`) referenced icon-object keys
    (`Icons.BarChart`, `Icons.Target`, `Icons.Activity`) that were never
    declared, which crashes React outright ("element type is invalid")
    the moment that section scrolls into view.
  - `NotFound.tsx` passed `noindex` to `<SEO>`, which reads `noIndex` —
    the 404 page's noindex meta tag has never actually been applied.
  - `user.validator.mjs` had a dead `validateMongoObjectID` export
    referencing a `REGEX.MONGO_ID_2` constant that doesn't exist in a
    Postgres/Supabase app with no MongoDB anywhere — deleted (zero
    consumers, confirmed).
  - `course.validator.ts`'s zod schema used the v3 `errorMap` option
    under a `zod/v4` import; v4 silently ignores it, so a custom
    validation message was never actually shown. Fixed to v4's `error`.
  Also fixed a stale `index.html` (`/src/main.jsx`, no longer exists —
  Vite was silently resolving it in dev) and a stale `services/api/
  vercel.json` (`index.mjs`, an alternate/unused deploy config next to
  the real Render one).
  **Explicitly not done, and why:** flipping `strict: true` in
  `tsconfig.base.json` was tested and reverted — it surfaces ~2,000
  further errors (1,474 web + 545 api), overwhelmingly null-safety and
  implicit-`any` issues spread across the whole codebase. That is a
  distinct, much larger follow-on project, not a default extension of
  this pass, and forcing it through here would trade real diligence for
  volume. `packages/types` generation (`supabase gen types typescript`)
  needs either a Supabase access token or a direct Postgres connection
  string, neither of which exists in this environment — owner-blocked,
  same as the Phase 0 DB baseline capture.
  Verified: `tsc --noEmit` clean on both workspaces (0 errors), `eslint`
  clean on the API (0 errors) and net-improved on the frontend (80 errors
  vs. 88 pre-conversion, all pre-existing unused-var/prefer-const style
  issues — same class the CI comment already calls out as "Phase 2/3
  cleanup" scope, not this phase's), a full production `vite build`
  (main chunk still 903 KB, unchanged from Phase 2b), a live `tsx`-hosted
  server boot with curl tests across auth/billing/certificate/cron
  endpoints, and a live browser session across the landing, learn,
  tools/EPF calculator (ran an actual calculation), login, dashboard, and
  journal-landing pages — zero console errors. CI's `typecheck:web` and
  `typecheck:api` are now required (no longer `continue-on-error`);
  `lint:web` stays advisory until the pre-existing ~80 errors are
  cleaned up separately.
- 2026-09-14 — Re-verified Phase 7 before starting Phase 8, per owner
  request. Found it was NOT actually complete despite `modules/ai/`
  existing: `services/ai-legacy/` was never deleted, `ChatWidget.tsx`
  still referenced the retired `VITE_API_BASE_URL` fallback, and —
  the substantive gap — the Python `ComplianceEngine`'s post-generation
  enforcement (scanning the model's actual output for prohibited phrases
  and force-injecting risk disclaimers) had no Node equivalent; the new
  `/api/ai/*` routes relied on prompt instructions alone, with nothing
  catching a model that ignored them. Flagged this to the owner as a real
  compliance-risk gap for a financial-advice-adjacent chatbot; owner chose
  to port it now rather than defer. Added `modules/ai/compliance.ts`
  (`enforceCompliance`: prohibited-phrase redaction + risk-based
  disclaimer injection, ported from `compliance_engine.py`), wired into
  `/api/ai/chat` and `/api/ai/gemini`. Deleted `services/ai-legacy/`
  (verified nothing else referenced it outside docs). Removed the
  `VITE_API_BASE_URL` fallback from `ChatWidget.tsx`. Phase 7 now
  genuinely done; proceeding to Phase 8.
