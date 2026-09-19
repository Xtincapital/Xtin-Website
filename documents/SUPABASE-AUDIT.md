> **⚠️ Historical document — this was the starting point for building the
> new project's schema, written before the Phase 0 DB baseline and before
> Phase 11's RLS hardening/FK normalization/cleanup pass.** Kept as a
> record of the pre-migration audit, not current schema. For the current,
> verified schema, see `database/SCHEMA.md` (which explicitly documents
> its own staleness contract — regenerate it from the migrations, don't
> hand-edit it out of sync).

# XTIN Capital — Supabase Footprint Audit

Read-only audit of everything this repo does with Supabase today. No data was
read, modified, or deleted to produce this — everything below comes from
static analysis of the codebase (`services/api`, `apps/web`) as of the Phase 5
TypeScript conversion, cross-checked against the hand-written reference SQL
in `services/api/database/*.sql` where it exists.

This repo's production Supabase project's credentials leaked (see
`documents/migration/PHASE-0-secret-rotation.md`) and are being replaced —
this document is the starting point for building the new project's schema
and, later, for comparing it against Gini/Journal/FundaKaMental once those
are brought into this repo.

**Confidence levels used below:**
- **Verified (code)** — read directly from a live query/trigger/env-var
  reference in `services/api` or `apps/web`.
- **Reference file** — present in a tracked `.sql` file (`services/api/database/*.sql`)
  that documents intent, but was never confirmed to have actually been run
  against the live project (the Phase 0 DB baseline capture was never done).
- **Unknown / unverifiable** — no code or file evidence either way; would
  need direct access to the live project to confirm.

---

## 1. Supabase clients

One client module: [`services/api/supabase/index.ts`](../services/api/supabase/index.ts).
No other file in the repo calls `createClient` directly — this was
consolidated in Phase 3 (previously 3 separate inline `createClient` calls).

| Client | Key used | Scope | Used for |
|---|---|---|---|
| `supabase` (default export) | `SUPABASE_SERVICE_ROLE_KEY` | Full DB access, **bypasses RLS** | Every table query/insert/update/upsert in every `*.repository.ts` file — this is the only client that ever touches application tables. |
| `userClientFromToken(token)` | `SUPABASE_ANON_KEY` | Scoped to one user's bearer token via `Authorization` header | Only 3 call sites, all Supabase Auth API operations, never table queries: `middlewares/auth.ts` (token verification), `modules/auth/user.controller.ts` (`syncUser`, `logout`'s `auth.signOut()`), `check-auth-config.ts` (diagnostic script). |

The frontend (`apps/web`) has its own client at `apps/web/src/supabase/index.ts`
using `VITE_SUPABASE_ANON_KEY` — used **only** for `supabase.auth.*` calls
(signUp, signInWithPassword, signInWithOAuth, getSession, onAuthStateChange,
refreshSession, signOut). **Zero direct table queries from the browser** —
confirmed by grep, every data read/write goes through the Express API. This
matters for the RLS discussion below: RLS is currently decorative, not
load-bearing, because nothing except the service-role client (which bypasses
it) talks to Postgres.

---

## 2. Database queries — architecture

Every table query lives in a `modules/<domain>/*.repository.ts` file
(Express/repository-layer pattern, completed in Phase 3). Controllers never
call `supabase` directly. No file uses raw SQL (`.rpc()` is the only
exception — see §4) — everything goes through the PostgREST query builder
(`.from().select()/.insert()/.update()/.upsert()/.eq()/...`).

Query patterns worth flagging for the consolidation work:
- **Upserts key on business-unique columns, not the PK**: e.g.
  `algorithm_subscriptions` upserts on `(user_id, algo_name)`,
  `user_lesson_progress` on `(user_id, module_slug, lesson_slug)`. Any
  consolidated schema must keep matching unique constraints or these silently
  break (see §3 note on `user_subscriptions`).
- **Dual identity lookups**: several tables are queried by
  `.or('user_id.eq.X,auth_id.eq.Y')` to handle rows written under either the
  legacy custom `users.id` or the real `auth.users.id` — a sign this schema
  evolved from a pre-Supabase-Auth `users.id` scheme toward `auth_id`. Worth
  deciding, during consolidation, whether to collapse these to one identity
  column now that everything can be Supabase-Auth-first.
- **Best-effort writes**: a few functions deliberately swallow write errors
  (e.g. `newsletterPlan.repository.ts`'s `updateNewsletterPlanMarkets`) with
  an explicit "never throws" comment — preserve this behavior, don't
  "improve" it into throwing during consolidation.

---

## 3. Database tables referenced — Verified (code)

16 tables, extracted from every `.from('...')` call in `services/api`:

| Table | Domain | Key columns | Notes |
|---|---|---|---|
| `users` | Auth | `id` (uuid, own PK — **not** `auth.users.id`), `auth_id` (uuid, FK to `auth.users.id`), `email`, `phone_number`, `first_name`, `last_name` | The app's own profile table; separate id space from `auth.users`. |
| `courses`, `slides`, `videos`, `purchases` | Academy | `courses.course_id` (unique), `purchases(user_id, course_id)` unique | Live, routed (`/api/courses/*`). `slides`/`videos` only ever referenced via embedded PostgREST relations (`videos (url)`), never `.from()` directly. |
| `user_subscriptions` | Billing | `(user_id, plan_id)` | **Reference file bug found**: `services/api/database/user_subscriptions.sql` has no unique constraint matching its own code's `onConflict: "user_id,plan_id"` — if that file was ever actually run as-is, every upsert would fail at runtime (Postgres requires a real unique/exclusion constraint for `ON CONFLICT`). |
| `algorithm_subscriptions` | Billing | `(user_id, algo_name)` unique | |
| `learn_pro_plans` | Billing | `user_id` (PK) | |
| `newsletter_pro_plans` | Billing | `user_id` (PK), `markets` (csv) | |
| `user_lesson_progress` | Academy | `(user_id, module_slug, lesson_slug)` unique | |
| `intern_certificates` | Certificates | `certificate_id` (format `XC-YYYY-XXXXX`, unique) | Public verification is read-only, no auth required. |
| `support_tickets` | Help | — | Public insert (contact form), no auth required. |
| `home_page_metrics` | Marketing | single-row table | Controller inserts a stray `metric: "home_page_metrics"` field that's never read back — harmless but worth cleaning up. |
| `subscriptions` | Newsletter | `email` (unique) | Newsletter subscriber list — **name collision risk**: FundaKaMental also has a `subscriptions` table (its Stripe billing one) and a naming convention decision is needed before merging schemas. |
| `indian_finance_newsletter` | Newsletter | `id`, `created_at`, `edition`, `market` | 60 columns — fixed 5×5 heading/subheading grid per edition, not normalized. |
| `newsletters` | Newsletter | — | Reachable via `GET /api/newsletters(/:id)` but **no active writer** — `createNewsletter` exists in the repository layer but is never called. Likely populated by an external process or dead. |

**Deliberately not tracked further** (retired in Phase 4, zero remaining code
references): `advisors`, `join_as_advisory_forms`, `chat_conversations`,
`chat_messages`, `video_call_sessions`. These tables were never dropped from
the live project — see §9 on the still-open DB-deletion decision.

---

## 4. Database functions — Verified (code) + Reference file

| Function | Source | Called via |
|---|---|---|
| `generate_certificate_id()` | Reference file (`intern_certificates.sql`) | `.rpc('generate_certificate_id')` in `certificate.repository.ts` — the **only** `.rpc()` call anywhere in `services/api`. |

Everything else observed in the reference `.sql` files
(`update_intern_certificates_updated_at()` etc.) is a trigger function, not
something the application code calls directly — see §5.

---

## 5. Triggers — Reference file only (unverified against live DB)

| Trigger | Table | Purpose | Confidence |
|---|---|---|---|
| `trigger_intern_certificates_updated_at` | `intern_certificates` | Auto-updates `updated_at` on row modification | Reference file |

No other triggers found in any reference `.sql` file for this repo's own
tables. `DATABASE_SCHEMA_README.md` claims a `handle_new_user()` signup
trigger and several others (`handle_user_email_update`,
`prevent_duplicate_subscription`, `audit_trigger_function`, ...) — **treat
these as unverified**: that document is flagged elsewhere in this repo
(`documents/AUDIT.md`) as an AI-generated wishlist that describes tables
that don't exist anywhere in the codebase (Gini/Journal-style financial
tables under XTIN Capital's own project). The app's own signup flow
(`user.controller.ts`) explicitly inserts the `users` row itself in code and
only *mentions* a trigger as a hoped-for backup ("the trigger should have
created the profile") in a catch block — meaning the app does not actually
depend on one existing.

---

## 6. RLS policies — Reference file only (unverified against live DB)

Every reference `.sql` file that defines a payment/plan table also enables
RLS with a single **read-your-own-row** policy (`auth.uid() = auth_id` or
similar) and explicitly defines **no write policies** for regular users —
the intent is that only the service-role backend can ever write, and
row-forging via a browser client is therefore impossible even if someone
extracted the anon key.

| Table | RLS defined in reference file? |
|---|---|
| `learn_pro_plans`, `newsletter_pro_plans` | Yes — select-own-row only |
| `algorithm_subscriptions`, `user_subscriptions` | Yes — select-own-row, plus a permissive `USING (true)` service-role policy |
| `intern_certificates` | Yes — public select where `is_revoked = false`, plus service-role/admin-role full access |

**Whether RLS is actually *enabled* on the live project is unverified** —
these are intentions recorded in tracked files, not confirmed database
state. Given every actual query in this codebase uses the service-role
client (which bypasses RLS unconditionally), RLS being on or off has **no
effect on current application behavior** either way — it only matters if a
browser-side Supabase client is introduced later (which is exactly what
happens once Gini/Journal/FundaKaMental — which *do* read Postgres directly
from the browser — join this project).

No RLS policy of any kind found, in code or reference file, for: `users`,
`courses`/`slides`/`videos`/`purchases`, `support_tickets`,
`home_page_metrics`, `subscriptions`, `indian_finance_newsletter`,
`newsletters`, `user_lesson_progress`.

---

## 7. Authentication tables / identity model

- **Supabase Auth (`auth.users`)** is the identity provider. Sign-in methods
  in use: email/password (`supabase.auth.signUp` / `signInWithPassword`) and
  Google OAuth (`supabase.auth.signInWithOAuth({ provider: 'google' })`, both
  in `apps/web/src/contexts/AuthContext.tsx` and `services/authService.ts`).
- **`public.users`** is a custom profile table layered on top, with its own
  `id` (used as the "user_id" in every payment/progress table) plus
  `auth_id` pointing at `auth.users.id`. This is **not** the same pattern
  Gini/Journal/FundaKaMental use (they anchor directly to `auth.users.id`
  with no separate id) — reconciling these two identity shapes is the core
  decision for the "one XTIN account" work once the other apps are brought
  in.
- **Backend-issued JWTs**: separately from Supabase's own session tokens,
  `services/api` mints its own JWT (`JWT_SECRET`, `jsonwebtoken` package) on
  login/signup, containing `userId`, `authId`, `email`, name, phone. This is
  the token the frontend actually stores and sends as `Authorization: Bearer
  <token>` on every API call — Supabase's own session token is only used
  transiently during the OAuth handshake and for the `userClientFromToken`
  operations in §1. This dual-token setup is exactly what PLAN.md's Phase 6
  ("Shared auth foundation") and Phase 12 ("Auth consolidation finish") were
  scoped to resolve.

---

## 8. Storage buckets

One bucket, referenced only by name, never created via any migration script
in this repo (must exist already on the live project, or never actually been
used):

| Bucket | Public? | Used by |
|---|---|---|
| `uploads` | Assumed public (code calls `.getPublicUrl()` without any signed-URL logic) | `services/api/utils/supabaseStorage.ts` (`uploadBufferToSupabase`, `deleteFromSupabase`, `getPublicUrl`), surfaced via `modules/files/files.routes.ts`. That route is explicitly commented `// deprecated ... kept for backward compatibility`. |

`utils/healthCheck.ts`'s `checkStorageHealth()` confirms the app expects a
bucket literally named `uploads` to exist and treats its absence as an
unhealthy state — so this needs creating on the new project (Dashboard →
Storage → New bucket → Public), there's no SQL equivalent.

---

## 9. API integrations (external, non-Supabase)

| Provider | Purpose | Env var(s) | Status |
|---|---|---|---|
| Razorpay | All payment flows (Learn Pro, Newsletter Pro, Algo subscriptions, bundle passes) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Live, HMAC-verified server-side. |
| Anthropic (Claude) | Primary AI provider (newsletter generation, ChatWidget) | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Live, primary. |
| Groq | Fallback AI provider | `GROQ_API_KEY` | Live, used only when Anthropic is unset/fails. |
| OpenAI | Live — `providers.ts` reuses the OpenAI SDK client as the Groq-compatible fallback (`apiKey: GROQ_API_KEY \|\| OPENAI_API_KEY`, pointed at Groq's OpenAI-compatible endpoint when `GROQ_API_KEY` is set, real OpenAI otherwise). | `OPENAI_API_KEY` | Live, secondary fallback. |
| Gemini | **Dead** — `GEMINI_API_KEY` is never read anywhere. A route literally named `POST /api/ai/gemini` exists, but it's explicitly commented `"Legacy endpoint for Gini bot compatibility"`, routes to Claude/Groq instead (`generateAIText`), and its fallback prompt hardcodes `"You are Gini, an expert financial advisor AI..."` — it never calls Google's real Gemini API. **Unverified but worth checking during consolidation**: this reads like an early "Gini" chatbot experiment that once lived in this backend before the Xtin Gini product was split into its own repo. I could not confirm from Xtin Gini's own code (a quick grep found no reference to this route or backend) whether anything still calls it — worth a direct check before assuming it's fully dead. | `GEMINI_API_KEY` | Dead as an actual AI provider; the route name is legacy compat only. |
| Gmail SMTP | Newsletter delivery, contact-form notifications | `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_PORT`, `EMAIL_FROM` | Live. Uses an app password, not the real Gmail password. |
| SendGrid | **Dead** — code explicitly checks `SENDGRID_API_KEY` only to log `"is set but ignored (SMTP-only mode active)"`. | `SENDGRID_API_KEY` | Dead, safe to delete the var. |
| Daily.co (video) | **Dead** — `DAILY_API_KEY` exists in `.env` with zero code references anywhere in the current codebase; almost certainly a leftover from the video-call feature deleted in Phase 4. | `DAILY_API_KEY` | Dead, safe to delete the var. |
| Substack | Fetches published articles for the Newsletter page (read-only, no API key — scrapes a configurable public publication URL) | `SUBSTACK_URL` | Live. |
| Stripe | **Not used anywhere in this repo's code** — `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY` exist only historically in old `.env.example` entries per the secret-rotation checklist. (Note: FundaKaMental, a different repo, *does* use Stripe for real — don't confuse the two when consolidating.) | — | Dead in this repo. |

---

## 10. Environment variables

Full list from the live `services/api/.env` keys (values never read/logged),
cross-referenced against actual code usage:

| Variable | Actually read by code? | Notes |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Yes | Core. |
| `JWT_SECRET` | Yes | Signs the backend's own tokens (§7). Has a hardcoded fallback in `constants/config.ts` that secret rotation is supposed to remove. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Yes | |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `GROQ_API_KEY` | Yes | |
| `OPENAI_API_KEY` | Yes | Groq-compatible fallback client, see §9. |
| `GEMINI_API_KEY` | Dead | See §9 — the `/gemini` route name is legacy, doesn't call Google's API. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Yes | |
| `SUBSTACK_URL` | Yes | Optional, has a hardcoded default. |
| `CRON_SECRET_TOKEN` | Yes | Guards `POST /api/trigger-newsletter`. |
| `NODE_ENV`, `PORT` | Yes | `PORT` defaults to 5000 in code but the real deployment runs 5002 — the tracked `sample.env` was wrong about this until this pass. |
| `SENDGRID_API_KEY` | Dead | See §9. |
| `DAILY_API_KEY` | Dead | See §9. |
| `ALLOWED_ORIGINS`, `FRONTEND_URL`, `FRONTEND_URL_ALT` | **No** | CORS is hardcoded as a literal array in `app.ts`, not env-driven. These vars in the real `.env` do nothing. |

Frontend (`apps/web`) env vars, from `config/env.ts`:

| Variable | Notes |
|---|---|
| `VITE_BACKEND_URL` | Defaults to `http://localhost:5002`. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | **Has a hardcoded fallback to the leaked project's real URL and real anon key, committed in source** — a second leaked secret beyond the one already documented in the secret-rotation checklist. Needs replacing when the new project exists, not left pointing at an abandoned one. |
| `VITE_AUTH_BYPASS` | Dev-only mock-login switch; code already guards it to `import.meta.env.DEV` so it can't be true in a deployed build even if the var were accidentally set. |

---

## Summary for the consolidation work ahead

The two structural decisions that matter most once Gini/Journal/FundaKaMental
join this repo:

1. **Identity shape mismatch**: XTIN Capital's `public.users` has its own id
   space bridged to `auth.users.id` via `auth_id`; the other three products
   (based on the separate audit already done informally in this
   conversation) anchor directly to `auth.users.id`. Pick one shape for "one
   XTIN account" before writing any consolidated schema.
2. **Table name collisions**: `subscriptions` (this repo's newsletter list)
   collides with billing tables of the same generic name in at least one
   other product. A naming convention (e.g. every non-XTIN product's tables
   prefixed) needs deciding once those schemas are actually compared.

No production data was touched to produce this document.
