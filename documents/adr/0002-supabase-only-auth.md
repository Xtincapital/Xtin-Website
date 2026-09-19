# ADR 0002 — Supabase-only auth; retire the backend-minted JWT

**Status:** Accepted (staged across Phase 6 and Phase 12, completed
2026-09-19)

## Context

The original core-platform backend minted its own JWT at login (`POST
/api/auth/login`, `jsonwebtoken`, a 7-day HS256 token, an in-memory/disk
token blacklist for logout) and required every subsequent request to carry
that token. Supabase Auth existed alongside it (for OAuth/Google
sign-in), so the backend's `authenticate` middleware had to accept *two*
different credential types on every request: verify-as-backend-JWT first,
fall back to verify-as-raw-Supabase-token second.

FundaKaMental, Journal, and Gini were each pulled into this monorepo
already using Supabase Auth as their only credential — none of them had
ever had a backend-minted JWT concept. Every new module built in Phases
8-10 (`req.user.authId`, ~163 call sites) was written against the Supabase
identity directly. The old dual-branch middleware was a growing mismatch
with where the actual code was heading, and carried a live, if narrow,
identity ambiguity: the backend JWT's `userId` claim was set once at mint
time from `public.users.id`, while the Supabase-fallback branch computed
`userId` freshly per request as `customUser?.id || user.id` — two
branches of the same middleware could, in principle, resolve the "same"
user's `userId` to different values depending on which branch handled the
request.

## Decision

Supabase session tokens are the only credential this app accepts, both
client- and server-side. This was executed as two phases on purpose:

- **Phase 6** (staged half): switched the frontend to call
  `supabase.auth.signInWithPassword()`/`signUp()` directly instead of
  going through the backend's own `/api/auth/login`/`signup`, and to store
  the *Supabase* session token in `localStorage`, not a backend-minted one.
  The backend was deliberately left still *accepting* (though no longer
  frontend-issued) backend JWTs during this phase, as a rollback-safe
  buffer for anything still holding one.
- **Phase 12** (finish half): removed backend JWT minting and acceptance
  entirely — `middlewares/auth.ts` now has exactly one verification path
  (`userClientFromToken(token).auth.getUser()`), `login`/`syncUser` no
  longer call `jwt.sign`, and the `jsonwebtoken` package was removed from
  `services/api` altogether. This was executed as a single-shot removal
  rather than a further staged rollout, specifically because this project
  was confirmed pre-launch (no production users, so no one could be
  holding a stale backend JWT) at the time Phase 12 ran — the two-phase
  split existed to protect a live user base that, as it happened, didn't
  yet exist.

## Consequences

- **One identity space, no more dual-branch ambiguity.** `req.user.authId`
  is now unconditionally the real Supabase `auth.users.id` on every
  request, matching what every Phase 8-10 module already assumed.
- **A real, previously-silent bug got fixed as part of removing the old
  path, not just carried over.** The backend's logout handler called
  `userClientFromToken(token).auth.signOut()`, but that client is built
  with `persistSession: false` and never has `setSession()` called on it —
  Supabase's own `signOut()` resolves an empty internal session and never
  reaches the real revocation endpoint. Traced directly into
  `@supabase/auth-js`'s source to confirm this was a genuine no-op, not a
  false alarm. The only reason any session was ever actually revoked
  server-side was the *frontend's* own separate `supabase.auth.signOut()`
  call, which happens to work because it runs against a real persisted
  browser session. Fixed by having the backend call
  `supabase.auth.admin.signOut(token, 'global')` on the service-role
  client instead — that API takes the raw token directly and needs no
  session object, so it genuinely revokes (and revokes every other open
  session for that user, via `'global'` scope).
- **A few pre-Phase-8 modules still read `req.user.userId`** (billing,
  academy, algos, newsletter — 6 files, 20 call sites; the legacy
  `public.users.id`, not the Supabase uid) rather than `authId`. Removing
  the backend-JWT branch doesn't change their behavior for the common
  case — both the old and new code paths resolve `userId` the same way
  for a user who has a `public.users` row, which every signup path
  creates — but it does mean that value now always flows through the
  `customUser?.id || user.id` fallback rather than a value fixed at
  token-mint time. This pre-existing dual-ID-space nuance (a `user_id`
  column that can hold either a `public.users.id` or a raw
  `auth.users.id`, depending on whether a profile row exists yet) is
  tracked in `database/SCHEMA.md`'s "Legacy dual-ID tables" section rather
  than papered over with an incorrect foreign key — see the Phase 11 audit
  that found and deliberately declined to "fix" this with a same-looking
  but semantically wrong FK constraint.
- **No more dev/debug JWT surface.** Two dev-only debug routes
  (`/auth/debug-token`, `/auth/debug-config`) and their backing
  `authDebug.ts` module — a second, smaller JWT-verification
  implementation that existed purely to power those routes — are gone,
  removing a maintenance liability that had nothing to do with real
  request handling.
