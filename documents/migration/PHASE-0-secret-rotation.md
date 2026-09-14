# Phase 0 — Secret Rotation Checklist

> ## 🚨 UPDATE (found during Phase 1, 2026-09-13) — this is now a live incident, not homework
>
> While moving files for Phase 1, `DEPLOYMENT_GUIDE.md` (a **tracked, committed**
> file) turned out to contain **real production secrets in plaintext**: the
> Supabase `SUPABASE_ANON_KEY` and **`SUPABASE_SERVICE_ROLE_KEY`**, the backend
> **`JWT_SECRET`**, `GROQ_API_KEY`, `OPENAI_API_KEY`, the Gmail **`EMAIL_PASS`**
> app password, and `CRON_SECRET_TOKEN`. These have been in every commit that
> touched this file since 2026-03-09 (~30+ commits) — and one further file,
> `backend/env.example`, carried the same values in earlier history before it
> was replaced by the placeholder `sample.env`.
>
> This repo has a real GitHub remote configured: `github.com/SpaceWalkerr/XtinCapital`.
> An unauthenticated check of that URL returned 404, which is **not proof the repo
> is private** — GitHub returns 404 for private repos too. **Check the repo's
> visibility yourself** (GitHub → repo → Settings, or just look at the URL in a
> logged-in browser). If it has ever been public, or if anyone outside the
> immediate team has had read access, treat every one of those values as
> compromised right now.
>
> The plaintext values have been redacted from `DEPLOYMENT_GUIDE.md` on the
> `chore/phase-1-workspaces` branch, but **redacting the file does not remove
> the secrets from git history** — they're still readable in every prior commit
> until history is rewritten (a separate, destructive operation that needs your
> explicit go-ahead — see "History scrub" at the bottom of this file). The only
> thing that actually neutralizes the exposure is **rotating every one of these
> values today**, not on the original "before Phase 1" timeline below.
>
> **Do sections 1 (Supabase), 2 (JWT secret), 4 (AI keys), and 5 (Gmail) below
> now, today, regardless of where Phase 1/2 work stands.**

**Why (original Phase 0 framing, now superseded by the incident above):**
`Client/.env`, `backend/.env`, and the repo-root `.env` currently hold live
secrets, including a Supabase **service-role** key, the backend **JWT secret**, and a
**Stripe secret key**, in a folder labelled as frontend config. Those `.env` files
themselves are gitignored and were not found in git history — the exposure above,
in a committed `.md` file, is the actual incident.

Do this **before** Phase 1 was the original plan; given the finding above, do the
critical sections immediately instead. After each rotation, verify the affected surface still works.

> Claude cannot perform rotations (they require dashboard logins / new key generation).
> Each step below is an owner action. Tick as you go.

---

## 0. Prep

- [ ] Confirm who has access to: Supabase project `znnhguxndectmnhgadga`, Vercel project, Render account, Razorpay dashboard, Google Cloud console, the Gmail account `xtinservice@gmail.com` / `xtinservice`.
- [ ] Have `documents/migration/PHASE-0-db-baseline.md` done first is NOT required, but take a Supabase backup now anyway (Dashboard → Database → Backups).
- [ ] Make a scratch note of every place each secret is currently set: local `.env` files + Vercel env + Render env + `render.yaml` comments.

---

## 1. Supabase

### 1a. Service-role key  (backend only — full DB access, bypasses RLS)
- [ ] Supabase Dashboard → Project Settings → API → **Reset service_role secret** (JWT secret rotation) — note: resetting the JWT secret invalidates **all** existing Supabase access/refresh tokens and both anon + service keys. Plan for all users being logged out once.
  - Alternative if you don't want to log everyone out yet: skip the JWT-secret reset, and instead treat the service key as "rotate at Phase 12" — but then it stays valid. Recommended: do the full reset now, during a low-traffic window.
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` in: Render (backend service env), Render worker (when created), local `services/api/.env`, local root `.env` (or delete root `.env`).
- [ ] Redeploy backend. Verify: `GET /` returns `"Xtin Capital API is Live"`; log in; load `/dashboard` (calls `/api/auth/profile`).

### 1b. Anon key  (browser — safe to expose, but rotates with the JWT secret reset above)
- [ ] Copy the new `anon` key.
- [ ] Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel env and local `apps/web/.env`.
- [ ] `apps/web/src/supabase/index.ts` already reads these from env (fixed in Phase 2) — no code change needed, just redeploy.
- [ ] Redeploy frontend. Verify: sign-in, Google OAuth, password reset email.

---

## 2. Backend JWT secret  (`JWT_SECRET`)

- [ ] Generate a new 48+ char random secret: `openssl rand -base64 48`
- [ ] Set `JWT_SECRET` in: Render backend, Render worker, local `services/api/.env`. **Remove** the hardcoded fallback string in `services/api/constants/config.ts` (make the app throw if it's unset instead of using a default).
- [ ] Redeploy. Note: this invalidates every currently-issued backend `auth_token`; users on email/password login will be logged out once. OAuth users re-sync automatically.
- [ ] Verify: fresh email/password login → call an authed endpoint (e.g. `/api/progress/user`).

---

## 3. Razorpay  (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)

- [ ] Razorpay Dashboard → Settings → API Keys → **Regenerate**. (Old key stops working immediately — do during low traffic.)
- [ ] Update `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in Render backend + local `services/api/.env`.
- [ ] Update the publishable key ID anywhere the frontend uses it (`VITE_RAZORPAY_ADVISORY_BUTTON_ID` if that button is still live).
- [ ] Redeploy. Verify in **test mode**: create an order for Learn Pro, complete a test payment, confirm the plan is granted (HMAC verify path).

---

## 4. AI provider keys

- [ ] **Anthropic** (`ANTHROPIC_API_KEY`): console.anthropic.com → API Keys → create new, delete old. Update Render backend + worker.
- [ ] **Groq** (`GROQ_API_KEY`): console.groq.com → API Keys → rotate. Update Render backend + worker env (the AI provider code was folded into the Express API in Phase 3 — there is no separate Python service anymore).
- [ ] **OpenAI** (`OPENAI_API_KEY`): check whether `services/api/modules/ai/providers.ts` still uses it. If unused, **delete the var** rather than rotate. Otherwise rotate at platform.openai.com and update `services/api/.env` + Render.
- [ ] **Gemini** (`GEMINI_API_KEY`): check whether `services/api/modules/ai/` still has a Gemini code path. If that's still wanted, rotate in Google AI Studio and set it on Render backend env; else delete the var.
- [ ] Verify: trigger a newsletter generation (`npm run generate-newsletter` in `services/api/`) and the ChatWidget.

---

## 5. Gmail SMTP  (`EMAIL_USER`, `EMAIL_PASS`)

- [ ] Google Account (`xtinservice@gmail.com`) → Security → App passwords → **revoke** the current one, create a new 16-char app password.
- [ ] Update `EMAIL_PASS` in Render backend + worker + local `services/api/.env` + local root `.env`.
- [ ] Verify: `npx tsx services/api/test-smtp-connection.ts`, and submit the `/help` contact form end to end.

---

## 6. Stripe  (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)

- [ ] Grep confirms Stripe is **not used** in code (payments are Razorpay). Action: **delete** both vars from every `.env`. Only rotate at dashboard.stripe.com if these keys were ever deployed anywhere; otherwise deleting is enough.

---

## 7. Clean up the `.env` files

> Paths below assume Phase 1 has landed (`Client/` → `apps/web/`, `backend/` →
> `services/api/`). If you're doing this before Phase 1 merges, use the old paths.

- [ ] Replace the real `apps/web/.env` with a copy of `apps/web/.env.example`, filling in only `VITE_*` values. Delete every non-`VITE_` line (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `STRIPE_*`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `NODE_ENV`, `PORT`, `FRONTEND_URL*`, `ALLOWED_ORIGINS`).
- [ ] Set `VITE_AUTH_BYPASS=false` in `apps/web/.env` (and never set it in any deployed env).
- [ ] Decide the repo-root `.env`: if you always run the newsletter scripts from inside `services/api/`, **delete the root `.env`**. If not, keep it but with only the vars those scripts need (Supabase URL + service key + Groq + EMAIL_*).
- [ ] `services/api/.env` stays, now covered by `services/api/.gitignore` (moved from `backend/.gitignore`).
- [ ] Confirm `git status` shows no `.env` file as tracked or staged.

---

## 8. History scrub (separate decision — do not do this without explicit sign-off)

Redacting `DEPLOYMENT_GUIDE.md` on the current branch stops the leak from
propagating further, but the real values are still sitting in every historical
commit that touched that file (and `backend/env.example`, before it was
removed). Rotating the keys (sections 1–6) is what actually neutralizes them —
old values become useless garbage strings even though still visible in history.

Scrubbing them out of history entirely (with `git filter-repo` or BFG Repo-Cleaner)
is a **separate, destructive operation**: it rewrites every commit hash after the
earliest touched commit, requires a coordinated force-push, and breaks any other
clone, fork, or open PR against this repo. Only do it if:
- the repo has been public at any point, or you can't rule that out, **and**
- you specifically want the strings gone from history (e.g. for compliance reasons),
  understanding rotation already made them harmless.

If you want this done, say so explicitly and coordinate a time — it needs everyone
with a local clone to re-clone afterward.

---

## 9. Sign-off

- [ ] All of: email login, Google login, password reset, `/dashboard`, a Razorpay test purchase, newsletter generation, `/help` contact form, ChatWidget — verified working after rotation.
- [ ] Old keys confirmed revoked (not just replaced) wherever the provider allows it.
- [ ] Update `documents/migration/PLAN.md` Phase 0 checklist.
