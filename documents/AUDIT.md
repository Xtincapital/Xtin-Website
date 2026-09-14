# XTIN Capital — Architecture Audit & Consolidation Proposal

_Read-only audit performed 2026-09-06 → 2026-09-08. No application code was changed
to produce this document. Scope: `Client/` (React SPA), `backend/` (Express API),
`Client/server/` (Python AI service). The three standalone apps were also
inventoried at a high level from `Featues/` (untracked staging copies)._

Status of decisions (agreed with owner, 2026-09-08):

| Topic | Decision |
|---|---|
| Retired features (advisor/advisory, chat, video calls, mutual funds) | **Delete entirely** — code + DB tables (after backup) |
| Secrets in committed-location `.env` files | **Rotate all** — owner rotates, Claude prepares per-platform checklist |
| TypeScript | **Full conversion up front** (Client + API) before feature integration |
| Python AI services (XtinAI bot, Journal, FundaKaMental) | **Fold into the Express API** — single Node backend, no Python service |
| Sub-app integration order | FundaKaMental → Journal → Gini |

---

## A. Current Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18.3 + Vite 7, **JavaScript (JSX), not TypeScript** |
| Routing | `react-router-dom` v6 — single 655-line `App.jsx`, ~450 `<Route>`s, all eager imports |
| Styling | Tailwind 3.4 + three global stylesheets (`App.css`, `index.css`, `styles/globals.css`) |
| UI libs | `lucide-react`, `react-icons` (107 files), `framer-motion` (12), `recharts` (18), `qrcode.react`, `jspdf`, `react-markdown`+`remark-gfm`, `dompurify` |
| Client state | React Context only — `AuthContext`, `ThemeContext`, `CurrencyContext` |
| Backend framework | Node.js + Express 4, ESM (`.mjs`), layered `routes → controllers → repository/services` |
| Secondary backend | Python FastAPI (`Client/server/`) — "XtinAI" chatbot, compliance engine, token optimizer, optional Redis, Groq |
| Database | Supabase (PostgreSQL), project ref `znnhguxndectmnhgadga` — one project shared by Client + backend |
| Auth | Supabase Auth (email/password + Google OAuth) **plus** a custom backend HS256 JWT **plus** a separate advisor JWT |
| AI providers | Anthropic Claude (primary), Groq (fallback), OpenAI (fallback), Gemini (`/api/ai/gemini`) |
| Email | Nodemailer via Gmail SMTP; `@sendgrid/mail` also a dependency (unused) |
| Payments | Razorpay (order + HMAC verify) — Learn Pro, Newsletter Pro, Algo, subscriptions. Stripe keys in env, unused in code |
| Video calls | Daily.co deps + Google Meet fallback — **feature retired in routing, code still present** |
| Jobs | `node-cron` in-process scheduler + external cron-job.org + `keep-alive.mjs` |
| Deployment | Frontend → Vercel (`Client/vercel.json`, `/api/*` rewrite → `xtincapital-backend.onrender.com`); Backend → Render (`render.yaml`, Singapore); backend also has a stale `vercel.json` |
| Lint / tests | ESLint 9 flat config (frontend only). No backend lint, no Prettier, no TS, **no tests**, no CI |

---

## B. Current Architecture

```
XtinCapital/                        git root (branch: main)
├── .env                            root secrets (Supabase service key, Groq, SMTP) — gitignored, on disk
├── package.json                    near-empty ({ axios }); NOT a workspace root
├── Client/                         React SPA (Vercel)
│   ├── .env  .env.local            MISLABELED "Backend Environment Variables";
│   │                               holds SERVICE_ROLE_KEY, JWT_SECRET, STRIPE_SECRET_KEY, OPENAI/GROQ keys
│   ├── src/
│   │   ├── App.jsx                 655 lines, ~450 routes, all static imports
│   │   ├── supabase/index.js       hardcoded Supabase URL + anon key (no env)
│   │   ├── contexts/               Auth / Theme / Currency  (+ CURRENCY_REFACTOR_GUIDE.md living in src)
│   │   ├── components/             40+ flat, mixed concerns:
│   │   │   ├── calculators/ (21)   a feature
│   │   │   ├── certificates/ (4)   a feature
│   │   │   ├── chat/               AdvisorChatWidget, ConversationsList  (RETIRED)
│   │   │   ├── learn/ learn-page/ learning/ icons/   3 overlapping "learn" folders
│   │   │   ├── newsletter/  video/
│   │   │   └── Navbar Footer Hero CTASection SEO ThemeToggle ProtectedRoute x3 ...
│   │   ├── pages/                  ~330 files
│   │   │   ├── learn/<20 modules with SPACES in folder names>/<~250 lesson files>
│   │   │   ├── Fundakamental/xtin-capital-home.jsx     real in-repo marketing page
│   │   │   ├── MutualFunds/XtinCapitalHome.jsx          RETIRED, still routed-out
│   │   │   ├── GiniLanding JournalLanding BacktestLanding   marketing pages linking to external domains
│   │   │   ├── Newsletter.jsx + Newsletter.jsx.bak      committed backup
│   │   │   └── future_plans/       DEAD: Advisor* + MutualFunds/ (byte-identical dup of pages/MutualFunds)
│   │   ├── services/               12 API modules, each re-declaring its own base URL
│   │   ├── lib/  utils/  hooks/  constants/  assets/
│   ├── server/                     Python FastAPI "XtinAI" bot (separate runtime; README is Windows-only)
│   └── dist/                       build output on disk (gitignored)
├── backend/                        Express API (Render)
│   ├── index.mjs → app.mjs         20 route groups, mostly mounted on "/api"
│   ├── controllers/ (18)  repository/ (8)  services/ (4)  validators/ (11)  middlewares/ (4)
│   ├── supabase/index.mjs          service-role client (the correct one)
│   ├── database/*.sql (10)         ad-hoc migrations, no ordering, no runner
│   ├── constants/config.mjs        HARDCODED JWT_SECRET fallback string
│   ├── utils/                      cron, healthcheck, newsletter generator, token blacklist (in-memory)
│   ├── *.mjs / *.js                test/debug/demo scripts at package root
│   └── data/                       runtime token-blacklist persistence (gitignored)
├── documents/                      PRD.md, TRD.md, APP_FLOW.md  (+ this AUDIT.md, migration/)
├── Featues/  [sic]                 UNTRACKED; the 3 standalone apps, each a nested git repo
│   ├── Xtin-Gini/                  vanilla JS, huge single files (app.js 354 KB), Node http server.js, Supabase, Claude, Razorpay
│   ├── Xtin-Journal/               vanilla JS frontend + Python FastAPI (main.py 71 KB), Supabase, OpenAI
│   └── Fundamental-Anslysis/  [sic]  Vite + React + TypeScript + shadcn/ui + Zustand + React Query; Python FastAPI backend; Supabase
└── ~8 top-level *.md guides
```

Architecture style: decoupled SPA + REST API. The frontend never touches the DB
except Supabase Auth; all data flows through `backend/`. The backend is a
reasonable layered MVC. **The problems are organizational and consistency, not a
broken paradigm — this is consolidation + cleanup, not a rebuild.**

---

## C. Feature Inventory

| Feature | Frontend code | Routes | Key components | Backend API | DB tables | Auth | Shared |
|---|---|---|---|---|---|---|---|
| Landing / marketing | `pages/LandingPages`, `Hero`, `GuestHomeHero`, `StatsBanner`, `ToolsSection`, `CTASection`, `About`, `Products`, `*Intro` | `/`, `/about`, `/products`, `/intro/*` | Navbar, Footer, SEO | `GET /api/metrics` | `home_page_metrics` | Public | Navbar/Footer/SEO/region |
| Authentication | `contexts/AuthContext`, `services/authService`, `utils/auth.js`, `utils/googleAuth.js`, `pages/Login/Signup/Forgot/Reset`, `SignInModal` | `/login`, `/signup`, `/forgot-password`, `/reset-password` | `SignInModal`, `ProtectedRoute`, `ProtectedPageRoute`, `ProtectedModuleRoute` | `/api/auth/{login,signup,logout,sync,profile}`, `/test-table`, `/auth/debug-*` | `users` (+ `auth.users`), `handle_new_user()` trigger | — | Supabase client, JWT |
| Dashboard | `pages/Dashboard.jsx` (large) | `/dashboard` | region, charts | `/api/auth/profile`, subscription + progress endpoints | `users`, `user_subscriptions`, `user_lesson_progress`, `purchases` | JWT | region, services |
| Tools / Calculators | `components/calculators/*` (21) | `/tools`, `/tools/:calc` (24) | each calculator; several `App.jsx` `Placeholder` stubs shadow the real ones | none (pure client) | none | `ProtectedPageRoute` | `useRegion`, `CurrencyContext` |
| Academy / Learn | `pages/learn/**` (~250 files, 20 modules), `components/learn`, `learn-page`, `learning`, `lib/learnPlan.js`, `services/learnPlanService`, `progressService` | `/learn`, `/learn/<module>`, `/learn/<lesson>` (~230) | `LearnLockScreen`, `LearnUpgradeModal`, `LearnTour`, `CourseDetail`, `CoursePlayerPage`, `VideoPlayer`, `LessonProgressTracker` | `/api/learn/*`, `/api/progress/*`, `/api/courses/*` | `courses`, `purchases`, `user_lesson_progress`, `learn_pro_plans` | JWT + Pro gate | Razorpay flow, progress, certificates |
| Certificates (intern) | `components/certificates/*` (4), `utils/certificatePdf.js`, `services/certificateService`, `pages/VerifyCertificate`, `pages/AdminCertificates` | `/verify/:id` (public), `/admin/certificates` | `CertificateManager` (mounted globally in App), `CertificateModal`, `QRCodeGenerator` | `/api/certificates/*` | `intern_certificates` | Mixed | jsPDF, QR |
| Newsletter / Market Brief | `pages/Newsletter(.jsx/.bak)`, `NewsletterDisplay`, `NewsletterDetail`, `NewsletterIntro`, `SubstackArticle`, `components/newsletter/*`, `lib/newsletterPlan.js`, `services/newsletterService`, `newsletterPlanService` | `/newsletter`, `/newsletter/:id`, `/newsletter/article/:slug` | Upgrade modal, Tour, Celebration | `/api/newsletters`, `/api/indian-finance-newsletters/*`, `/api/newsletter/*`, `/api/substack/*`, `/api/trigger-newsletter` | `newsletters`, `indian_finance_newsletter`, `newsletter_pro_plans`, `subscriptions` | Mixed | AI generator, mail, cron |
| AI generation + XtinAI chat | `components/ChatWidget.jsx` (global), `components/chat/*` | floating widget | `POST /api/ai/{chat,gemini,analyze,health}` (Express) **and** `Client/server` FastAPI `/api/v1/*` | none directly | — | 3 duplicate provider wrappers |
| Algo trading subscriptions | `pages/AlgosPage`, `AlgorithmsIntro`, `AlgoTerms`, `BacktestLanding`, `services/algorithmService` | `/algos`, `/backtest`, `/algo-terms` | region | `/api/algorithm/{subscriptions,order,verify,dev-activate}` | `algorithm_subscriptions` | JWT | Razorpay flow |
| **Advisor / Advisory (RETIRED → DELETE)** | `future_plans/Advisor*`, `services/advisorAuthService`, `components/chat/AdvisorChatWidget`, `components/video/VideoCall`, `services/videoCallService`, `chatService` | `/advisor/*`, `/advisory*` → all `Navigate` to `/` | — | `/api/advisor/*`, `/api/advisors`, `/api/chat/*`, `/api/video-calls/*`, `/api/forms/join_as_advisory` | `advisors`, `join_as_advisory_forms`, `chat_conversations`, `chat_messages`, `video_call_sessions` | Advisor JWT + user JWT | second auth system |
| **Mutual Funds (RETIRED → DELETE)** | `pages/MutualFunds/`, `future_plans/MutualFunds/` (identical dup) | `/mutualfunds`, `/mutalfunds` [sic] → `Navigate` to `/` | — | none | none | — | — |
| FundaKaMental (embedded stub) | `pages/Fundakamental/xtin-capital-home.jsx` (+ css) | `/fundakamental`, `/intro/fundakamental` | Navbar/Footer | none (marketing only) | none | Public | — |
| Gini (external) | `pages/GiniLanding`, `GiniIntro`, `constants/externalApps.js` | `/gini`, `/intro/gini` | Navbar/Footer, region showcase | none — CTA links to `xtingini.in` | none in Capital | `ProtectedPageRoute` | region |
| Journal (external) | `pages/JournalLanding`, `JournalIntro` | `/journal`, `/intro/journal` | same | none — links to `xtinjournal.website` | none in Capital | `ProtectedPageRoute` | region |
| Help / Support | `pages/HelpCenter`, `Footer` contact form | `/help` | — | `POST /api/contact` | `support_tickets` | Public insert | — |
| Legal | `Terms`, `Privacy`, `AlgoTerms`, `PublisherTerms`, `RevenueShareAgreement` | `/terms`, `/privacy`, … | — | none | — | Public | — |
| Region / currency | `lib/region.js`, `hooks/useRegion.js`, `contexts/CurrencyContext`, `components/RegionSwitcher` | global | — | none (browser calls ipapi.co, ipwho.is, frankfurter.dev) | — | — | used everywhere |
| Subscriptions (bundle) | `services/bundleSubscriptionService` | — | — | `/api/subscriptions/*` | `subscriptions`, `user_subscriptions` | JWT | Razorpay |

---

## D. Problems Found

### D1. Repository / build
1. Not a monorepo despite being one physically. Root `package.json` has one dependency; 3+ independent npm/bun/pip projects, no workspaces, no shared tooling.
2. `Featues/` typo folder, untracked, contains 3 nested git repos → submodule / dirty-tree hazard.
3. `Client/dist/` present on disk (gitignored, so not in git — still noise).
4. Committed backup/debug files: `Client/src/pages/Newsletter.jsx.bak`, `backend/insert_demo_indian_finance_newsletter.js`, `backend/test-*.mjs`, `backend/debug-cron.mjs`, `backend/check-auth-config.mjs`.
5. `.DS_Store` scattered on disk (not tracked).
6. No TypeScript in Client/backend, but FundaKaMental is TS + shadcn → stack mismatch to resolve (decision: full TS conversion).
7. No tests anywhere; no CI.
8. Dual deploy configs: `backend/vercel.json` + `backend/render.yaml`; `vite.config.js` dev proxy pointed at `:5000` while everything else uses `:5002` (**fixed in Phase 0**).

### D2. Secrets / config
9. `Client/.env` is a backend env file — contains `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`. Non-`VITE_` vars are not bundled, so this is a local-disk / copy-paste exposure, not a shipped leak — still must be rotated and slimmed.
10. Hardcoded Supabase URL + anon key in `Client/src/supabase/index.js` (the one client value that should be env-driven).
11. Hardcoded `JWT_SECRET` fallback string in `backend/constants/config.mjs` — if the env var is ever missing in prod, auth silently runs on a public secret.
12. `VITE_AUTH_BYPASS=true` is set in the committed-location `Client/.env` — the dev auth bypass is currently ON for that file.
13. Config sprawl: `VITE_BACKEND_URL || 'http://localhost:5002'` re-inlined ~40 times; `Footer.jsx` + `HelpCenter.jsx` hardcoded `http://localhost:5002/api/help/contact` with no fallback → contact form broken in production (**fixed in Phase 0**). Two base-URL vars (`VITE_BACKEND_URL`, `VITE_API_BASE_URL`).
14. CORS allow-list, cron times, sub-app URLs, FX endpoints all hardcoded in source.

### D3. Authentication (largest structural risk)
15. Three auth systems: (a) backend HS256 JWT in `localStorage.auth_token`, (b) raw Supabase access token accepted as a fallback in `middlewares/auth.mjs`, (c) separate advisor JWT in `localStorage.advisor_token`.
16. `middlewares/auth.mjs` creates a new Supabase client per request (inline `await import` + `createClient`); duplicated in `user.controller.mjs` logout and `check-auth-config.mjs`.
17. Token blacklist is in-memory (`utils/tokenBlacklist.mjs` + `backend/data/`) → does not work across Render instances / restarts; logout not reliably enforced.
18. Client has two auth-fetch helpers: `utils/auth.js#makeAuthenticatedRequest` and `services/authService#makeAuthenticatedRequest`, different refresh logic.
19. `authService.js` duplicates `AuthContext` — both implement login/signup/Google/logout against Supabase, partly divergently.
20. `utils/googleAuth.js` is a third Google sign-in path (raw GIS token client), unrelated to the Supabase OAuth path.
21. `authorize(roles)` checks `req.user.role`, which the JWT payload never sets → role-based auth is dead code.

### D4. Frontend structure
22. `App.jsx`: 655 lines, ~450 routes, 100% eager imports — every lesson loads on first paint. No `React.lazy`, no route config, no nested routes.
23. `Placeholder` stubs in `App.jsx` shadow real components (`SsyPage`, `StepUpSipPage`, `LumpsumPage`, …) — some routes render the stub instead of the imported calculator.
24. Folder names with spaces: `pages/learn/Estate Planning/`, `Money Mindset/`, `Algorithemic Trading/` [sic].
25. Three overlapping "learn" component folders: `components/learn/`, `learn-page/`, `learning/`.
26. ~250 near-identical lesson files — should be data + one renderer (`learn-page/mockData.js` and per-module `*LessonData.js` suggest a half-built data model).
27. Duplicate pages: `pages/MutualFunds/XtinCapitalHome.jsx` ≡ `future_plans/MutualFunds/XtinCapitalHome.jsx` (byte-identical, 674 lines); `pages/Fundakamental/xtin-capital-home.jsx` is a 3rd variant of the same layout.
28. `future_plans/` = dead code shipped in `src/`.
29. Retired features still fully wired backend-side (advisor, chat, video, MF, advisory forms).
30. `CertificateManager` + `LessonProgressTracker` mounted unconditionally at the router root — hidden global side effects.
31. Three global CSS files + Tailwind; no design-token layer.
32. Planning docs (`CURRENCY_REFACTOR_GUIDE.md`) inside `src/`.
33. `useRegion` has a dual code path (CurrencyContext vs standalone service) with a "legacy path" comment — two sources of truth for region.

### D5. Backend structure
34. `routes/ai.routes.mjs` ~650 lines with a giant inline `XTIN_KNOWLEDGE` object + provider selection + 4 endpoints.
35. AI provider abstraction duplicated in Express (`ai.routes.mjs`, `utils/newsletterGeneratorSimple.mjs`) and again in Python.
36. Inconsistent route mounting: some groups on `/api` with the path inside the file, others on `/api/help`, `/api/ai`, `/api/chat`, `/api/learn`, etc. `certificateRoutes` and `courseRoutes` both mount at bare `/api`.
37. Repository layer covers only 8 of 18 controllers; the rest query Supabase directly from the controller.
38. `/api/test-table` inserts+deletes a real `users` row on every call; `/api/auth/debug-token` and `/auth/debug-config` are live in production.
39. `services/scheduler.mjs` runs cron inside the web process; dedupe relies on a 15-min in-memory guard.
40. Two Python services with overlapping "financial AI + compliance" scope (decision: fold into Express, drop Python).
41. `author: "Dev Bachani"` in `backend/package.json`; MIT/ISC license mix across sub-projects.

### D6. Database
42. 10 hand-written `.sql` files in `backend/database/`, no numbering, no runner, no down-migrations. `DATABASE_SCHEMA_README.md` is AI-generated (contains leaked tool-call XML) and describes tables (`gini_*`, `journal_*`, `slides`, `videos`, `audit_log`, help-center tables) that may or may not exist live — aspirational, not authoritative.
43. No schema-as-code / no Supabase migrations. Real schema lives only in the hosted project.
44. Table naming inconsistent: `newsletters` vs `indian_finance_newsletter`; `subscriptions` vs `user_subscriptions` vs `algorithm_subscriptions`.
45. RLS unclear: frontend uses the anon key only for Auth and never queries tables; backend uses the service-role key (bypasses RLS). RLS policies are effectively unused/untested — a risk when Gini/Journal (which query Supabase from the browser) merge in.

### D7. Dependencies
46. Likely unused in Client: `@daily-co/daily-js`, `@daily-co/daily-react`, `@emailjs/browser`, `chart.js` + `react-chartjs-2` (0 import sites found — verify). `recharts` is the actual chart lib.
47. `axios` in root + Client + backend `package.json` but Client uses `fetch` almost everywhere (1 file).
48. `@sendgrid/mail` in backend deps but mail goes through Nodemailer/Gmail.

### D8. Coupling / "will hurt future dev"
49. No API client module → every new endpoint re-implements auth headers, base URL, 401 handling.
50. No feature boundaries → `components/` and `pages/` are dumping grounds; a "learn" change touches 3 component folders + `App.jsx` + 2 services + `lib/`.
51. Retired code not removed → new contributors cannot tell what is live.
52. Sub-apps use 3 frontend paradigms and 3 backends → integration needs a per-feature target-stack decision (resolved: React+TS front, Express back).

---

## E. Database Architecture (current)

- **One Supabase project** (`znnhguxndectmnhgadga.supabase.co`) referenced identically by root `.env`, `backend/.env`, `Client/.env`, and hardcoded in `Client/src/supabase/index.js`. "One database" is already true for XTIN Capital.
- **Clients:**
  - `backend/supabase/index.mjs` — `service_role` key, `autoRefreshToken:false`, `persistSession:false`. Intended server client.
  - `middlewares/auth.mjs`, `user.controller.mjs`, `check-auth-config.mjs` — ad-hoc `anon`-key clients created inline per request to validate user bearer tokens.
  - `Client/src/supabase/index.js` — `anon` key, browser, **Auth only** (`signInWithPassword`, `signUp`, `signInWithOAuth`, `getSession`, `refreshSession`, `onAuthStateChange`, `resetPasswordForEmail`, `updateUser`). No table reads from the browser.
- **Tables referenced in code:** `users`, `courses`, `purchases`, `user_lesson_progress`, `learn_pro_plans`, `newsletter_pro_plans`, `newsletters`, `indian_finance_newsletter`, `subscriptions`, `user_subscriptions`, `algorithm_subscriptions`, `home_page_metrics`, `intern_certificates`, `advisors`, `join_as_advisory_forms`, `chat_conversations`, `chat_messages`, `video_call_sessions`, `support_tickets`.
- **Functions/triggers (from SQL files + README, not verified live):** `handle_new_user()`, `update_updated_at_column()`, `prevent_duplicate_subscription()`, `validate_sebi_number()`, plus README-claimed business functions. Existence unconfirmed — see `documents/migration/PHASE-0-db-baseline.md`.
- **RLS:** enabled per SQL for `support_tickets` (public insert), claimed for most tables in the README, not exercised by the app.
- **Storage:** README claims a public `uploads` bucket; `utils/supabaseStorage.mjs` + `GET /api/files/:filePath` proxy files. `multer` handles advisor-form and certificate uploads.
- **Auth tables:** Supabase-managed `auth.users`, mirrored to public `users` via trigger + explicit `saveUser()`.
- **External data APIs (no DB):** ipapi.co, ipwho.is, frankfurter.dev (FX) from the browser; Substack RSS from backend.

**Sub-app DBs (from their `.env.example`):** Gini, Journal, FundaKaMental each expect their own Supabase project. FundaKaMental's `supabase.ts` defines its own `users`, `reports`, `source_documents`, `chat_messages`, `watchlist` — **`users` and `chat_messages` collide with Capital's schema**; consolidation must namespace or reconcile.

---

## F. Authentication Architecture (current)

**Sign-up:** Client → `POST /api/auth/signup` → backend `supabase.auth.signUp()` → `saveUser()` inserts `users`. `services/authService.signup()` also calls `supabase.auth.signUp()` again client-side (redundant).

**Email/password login:** `AuthContext.login()` → `POST /api/auth/login` → backend `supabase.auth.signInWithPassword()` → backend mints its own HS256 JWT (`jti`, `userId`, `authId`, `email`, name; 7d; issuer `xtin-capital-backend`, audience `xtin-capital-client`) → stored in `localStorage.auth_token`.

**Google OAuth:** `supabase.auth.signInWithOAuth({provider:'google'})` → redirect → `onAuthStateChange('SIGNED_IN')` → `syncUser(session.access_token)` → `POST /api/auth/sync` → backend validates the Supabase token, upserts `users`, mints a backend JWT → stored as `auth_token`.

**Request auth (`middlewares/auth.mjs`):** try backend JWT → check in-memory blacklist → set `req.user`. On failure (not expiry), fall back to an inline `anon` Supabase client with the caller's bearer + `auth.getUser()` + `users` lookup by `auth_id`. API accepts **either** token type.

**Advisor auth (retired UI, live API):** `POST /api/advisor/login` → advisor JWT (audience `xtin-capital-advisor`, `role:'advisor'`) → `localStorage.advisor_token` → `middlewares/advisorAuth.mjs`. `videoCall.routes` has an `authenticateBoth` shim.

**Refresh/logout:** refresh via `supabase.auth.refreshSession()` in both `AuthContext.refreshToken` and `utils/auth.js` — but the refreshed value (a Supabase token) is written over `auth_token` (normally a backend JWT), so the type of `auth_token` is code-path-dependent. Logout: clear `localStorage`, `POST /api/auth/logout` → `blacklistToken(jti)` (in-memory) + best-effort `supabase.auth.signOut()`.

**Dev bypass:** `AuthContext` injects `MOCK_USER` when `import.meta.env.DEV && VITE_AUTH_BYPASS === 'true'` (currently `true` in `Client/.env`).

**To reach "one XTIN account":**
- One identity provider = Supabase Auth, one project, one `users` table keyed by `auth.users.id`.
- Drop the backend-minted JWT; API verifies the Supabase JWT (`supabase.auth.getUser()` or JWKS / `SUPABASE_JWT_SECRET`). One `requireAuth`, one shared server client.
- Product access = entitlements/roles on the user (`user_entitlements` rows or a JWT `app_metadata.roles` claim), not separate logins. Advisor = `role='advisor'`.
- One client session store (Supabase `persistSession`), one `apiClient` attaching `getSession().access_token`. Remove `auth_token`, `advisor_token`, `utils/googleAuth.js`.
- Replace in-memory blacklist with Supabase session revocation (or short-lived tokens + refresh).
- Point Gini/Journal/FundaKaMental at the same Supabase project + same `users` row; migrate their users in by email.

---

## G. Proposed XTIN Architecture

Keep React (Vite) SPA + Express API + Supabase. Add npm workspaces, a client `features/`
layer, an API `modules/` layer, schema-as-migrations, and TypeScript (full conversion).

```
xtin-capital/                         npm workspaces root
├── package.json                      workspaces: ["apps/*", "packages/*", "services/*"]
├── tsconfig.base.json  .eslintrc  .prettierrc  .editorconfig  .github/workflows/
│
├── apps/
│   └── web/                          the single React SPA (today's Client/)
│       ├── src/
│       │   ├── main.tsx
│       │   ├── app/
│       │   │   ├── App.tsx           providers only
│       │   │   ├── routes.tsx        route TABLE, React.lazy, nested by feature
│       │   │   └── providers/        Auth, Theme, Currency, QueryClient
│       │   ├── features/
│       │   │   ├── auth/  dashboard/  academy/  tools/  newsletter/  certificates/  algos/
│       │   │   ├── gini/  journal/  fundakamental/          migrated from Featues/
│       │   │   └── marketing/        landing, about, products, intros, legal
│       │   ├── components/
│       │   │   ├── ui/               Button, Card, Modal, Input, Table, Tabs … (design system)
│       │   │   ├── layout/           Navbar, Sidebar, Footer, PageShell
│       │   │   └── feedback/         Loading, ErrorBoundary, Toast, EmptyState
│       │   ├── lib/
│       │   │   ├── supabase.ts       ONE browser client, env-driven
│       │   │   ├── api-client.ts     ONE fetch wrapper (base URL, auth header, 401→refresh)
│       │   │   ├── region/           region.ts + useRegion (single source)
│       │   │   └── utils/
│       │   ├── config/               env.ts (typed, validated), feature-flags.ts, external-apps.ts
│       │   ├── types/
│       │   └── styles/               tokens.css + globals.css (one)
│       ├── public/  vite.config.ts  index.html  vercel.json
│
├── services/
│   └── api/                          today's backend/ (Express) — the ONLY backend
│       └── src/
│           ├── index.ts  app.ts
│           ├── config/               env.ts (validated), cors.ts, constants.ts
│           ├── lib/supabase.ts       ONE server client factory (service + per-request user client)
│           ├── middleware/           requireAuth, requireRole, errorHandler, upload
│           ├── modules/              one folder per domain:
│           │   ├── auth/  users/  academy/  courses/  progress/
│           │   ├── newsletter/  certificates/  algos/  subscriptions/
│           │   ├── ai/               provider wrappers + knowledge + compliance (ex-Python)
│           │   ├── gini/  journal/  fundakamental/
│           │   └── support/  metrics/
│           │       └── <module>.{routes,controller,service,repository,validator}.ts
│           └── jobs/                 newsletter cron etc. — run as a separate Render worker
│
├── packages/
│   ├── types/                        DB row types (generated from Supabase) + API DTOs
│   └── config/                       shared eslint/tsconfig/tailwind preset
│
├── database/
│   ├── migrations/                   numbered SQL — source of truth
│   ├── functions/  policies/  seed/
│   └── SCHEMA.md                     regenerated, authoritative
│
└── documents/                        PRD, TRD, APP_FLOW, AUDIT, ADRs, runbooks, migration/
```

Routing: `routes.tsx` composes per-feature route arrays; each feature owns
`features/<x>/routes.tsx`; lessons become `/academy/:module/:lesson` driven by data.
Public URLs preserved: `/`, `/gini`, `/journal`, `/fundakamental`, `/newsletter`,
`/tools/*`, `/dashboard`; `/learn` → 301 → `/academy`.

Adding a new product later = add `features/<product>/` + register one route array +
(optional) `modules/<product>/` in the API. No monolith file to edit.

---

## H. Migration Plan

See `documents/migration/PLAN.md` for the living, detailed version. Summary:

| Phase | Goal | Behavior change? |
|---|---|---|
| 0 | Safety net: branch + tag, gitignore, fix 2 prod bugs, `.env.example`s, secret-rotation checklist, DB baseline capture | No (bug fixes only) |
| 1 | npm workspaces + move `Client/`→`apps/web`, `backend/`→`services/api`; TypeScript scaffolding (`allowJs`), Prettier/ESLint/CI | No |
| 2 | Client cleanup: `api-client`, `config/env`, split `App.jsx` + `React.lazy`, `features/*` folders, delete dead code, rename spaced folders, one region source, one stylesheet | No |
| 3 | API cleanup: one Supabase client factory, `modules/<domain>/`, extract AI knowledge, remove `/test-table` + debug routes, cron → worker | No |
| 4 | **Delete retired stack** (advisor/advisory, chat, video, mutual funds): routes + controllers + repos + validators + Client services/components + DB tables (after backup) | Yes — removes dead endpoints/tables |
| 5 | Full TypeScript conversion (Client + API), generate `packages/types` from live schema | No (types only) |
| 6 | Shared auth foundation: `requireAuth` accepts both tokens; add entitlements/roles; client switches to Supabase-session-only; fold advisor login → `role` | Staged |
| 7 | Fold Python AI (`Client/server`) into `services/api/modules/ai`; retire FastAPI | Yes — AI endpoint parity required |
| 8 | Integrate **FundaKaMental** → `features/fundakamental` + `modules/fundakamental`; migrate its tables (prefixed) onto shared `users`; `/fundakamental` → real feature | Yes — new feature live |
| 9 | Integrate **Journal** → `features/journal`; rebuild UI from its logic; migrate `journal_*` tables; `/journal` → real feature; retire external site | Yes |
| 10 | Integrate **Gini** → `features/gini`; port `gini-ai-engine` into `modules/ai`; migrate `gini_*` tables; `/gini` → real feature; retire external site | Yes |
| 11 | DB consolidation & hardening: normalize table names, FK/`user_id` consistency, enable + test RLS, regenerate types, delete ad-hoc `.sql` | Yes — DB only, tested |
| 12 | Auth consolidation finish: remove backend JWT path, `advisor_token`, dup helpers, `googleAuth.js`; Supabase revocation; one `apiClient` / `useAuth` / guard | Yes — staged with fallback release |
| 13 | Testing, docs, deploy: targeted tests (auth middleware, Razorpay verify, newsletter gen, entitlements, region math) + Playwright smoke; CI gates; ADRs; retire old deploy targets | No |

Ordering note vs the original proposal: the retired-stack deletion (Phase 4) and full
TS conversion (Phase 5) were pulled earlier because the owner chose "delete entirely"
and "full conversion up front" — doing both before feature integration means Gini/
Journal/FundaKaMental land in an already-clean, already-typed codebase.

---

## I. Risks & Mitigations

| Risk | Where | Mitigation |
|---|---|---|
| Secret exposure / rotation breakage | `Client/.env` holds service-role key, JWT secret, Stripe secret | Rotate in Phase 0 before refactor. Deploy env-only. Verify each service post-rotation. Treat old keys as compromised. |
| Auth regression locks users out | 3 token types; refresh overwrites token type; in-memory blacklist | Phase 6 keeps dual-acceptance; change client last; flag it; keep a rollback release. Test OAuth + email + advisor + refresh + logout on staging. |
| Losing production data during DB merge | Gini/Journal/Funda table merges; `users`/`chat_messages` name collisions | Full backup before every migration. Prefix incoming tables. Merge users by email; keep `legacy_id`. Never `DROP` in the same PR that migrates — deprecate, verify, drop later. |
| Route/URL breakage → SEO + bookmarks | ~450 routes, `vercel.json` rewrites, `X-Robots-Tag`, API-served sitemap | Snapshot the route list now; keep a redirect map; preserve public URLs; diff sitemap before/after. |
| Payments break | Razorpay order+verify across 4 modules | Don't touch verify logic during moves; test each plan in Razorpay test mode after Phases 1, 3, 8–10; keep `dev-activate` dev-only. |
| Newsletter double-send / silent stop | in-process cron + external cron + keep-alive, 15-min in-memory dedupe | Move cron to one worker (Phase 3). Add a `newsletter_runs` table for real dedupe. Keep external cron as backup with retry off. |
| "Retired" code is actually used | advisor/chat/video/MF redirect in UI but full backend + tables exist | Before Phase 4 deletion: check prod logs / table row counts / analytics for last use. One reversible PR + DB backup. Restore path = `pre-consolidation` tag. |
| Full TS conversion stalls product | ~330 client files, ~90 backend files | Phase 1 scaffolds TS with `allowJs` so JS keeps working; Phase 5 converts module-by-module behind CI; each PR compiles + builds. `main` stays releasable. |
| RLS turned on breaks reads | RLS currently unexercised (service-role backend) | Enable table-by-table on staging; keep API as primary path; add policies + tests before flipping prod. |
| Workspace move breaks paths / deploy | `app.mjs` reads `../Client/public/*`; Vercel/Render root dirs | Phase 1 mechanical + CI-verified; fix path refs; update deploy root dirs in the same PR; smoke test. |
| Nested `Featues/*/.git` repos | submodule confusion, lost history | Per app: `git subtree add` to keep history, or copy + archive originals. Deliberate in Phases 8–10, not by dragging folders. |

---

## J. Recommended Next Step

Phase 0 is in progress on branch `chore/phase-0-safety-net` (tag `pre-consolidation`
marks the starting point of `main`). Phase 0 delivers:

- Fixes for the two production bugs (hardcoded `localhost:5002` contact form; wrong Vite dev-proxy port).
- `.gitignore` hardening (root + new `backend/.gitignore`); `Featues/` explicitly ignored as staging.
- `Client/.env.example` (VITE-only) and root `.env.example`.
- `documents/AUDIT.md` (this file), `documents/migration/PLAN.md`.
- `documents/migration/PHASE-0-secret-rotation.md` — per-platform (Vercel / Render / Supabase / Razorpay / Google / Gmail) rotation checklist for the owner to execute.
- `documents/migration/PHASE-0-db-baseline.md` — SQL + steps to capture the authoritative live schema into `database/migrations/0000_baseline.sql`.

**Owner actions required before Phase 1:**
1. Run the secret-rotation checklist and confirm every service still works.
2. Run the DB baseline capture (or grant a read-only Postgres connection string / provide a `pg_dump --schema-only`) so migrations start from reality, not the AI-written README.
3. Confirm workspace tooling: **npm workspaces** (recommended) vs pnpm/turbo.
4. Confirm `recharts` as the single chart library (drop `chart.js` / `react-chartjs-2`).
