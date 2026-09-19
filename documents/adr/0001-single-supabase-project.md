# ADR 0001 — One Supabase project for all four products

**Status:** Accepted (Phase 0-1, 2026-09-08 onward)

## Context

XTIN Capital started as four separate codebases with four separate backing
stores: the core platform (Postgres via a hand-rolled `users`/`purchases`
schema plus Supabase Auth), FundaKaMental (its own Postgres schema, its own
`funda_users` profile table), Journal (a client-direct-to-Supabase app
against a *different* Supabase project, storing everything as a single
`journal_user_state` JSON blob per user), and Gini (same client-direct
pattern against yet another Supabase project, `gini_user_data.app_state`).

Consolidating these into one Express backend (`services/api`) and one React
frontend (`apps/web`) raised the obvious follow-on question: how many
databases does the consolidated app talk to?

## Decision

One Supabase project. Every product's tables live in the same Postgres
database, under the same `public` schema, distinguished by a per-product
table prefix (`funda_*`, `journal_*`, `gini_*` — core-platform tables stay
unprefixed, e.g. `users`, `purchases`, `user_subscriptions`). All migrations
are numbered sequentially in one `database/migrations/` directory
(`0000_baseline.sql` through the present), applied in order, by the project
owner, against the one live project.

## Consequences

- **One service-role key, one connection, one place to reason about RLS.**
  `services/api/supabase/index.ts` exports a single service-role client used
  by every module — no per-product credential juggling, no cross-project
  API calls for a feature that touches two products at once (e.g. the
  cross-product `user_entitlements` index, or a future "show my Gini net
  worth on the main dashboard" feature).
- **Real naming collisions had to be resolved, not avoided.** The
  unprefixed core-platform `subscriptions` table (a newsletter
  email-subscriber list) collided in *name* — not in the database, just in
  a human reading the two side by side — with the unrelated
  billing-subscription concept (`user_subscriptions`,
  `algorithm_subscriptions`, `funda_subscriptions`/`funda_pro_plans`,
  `journal_pro_plans`, `gini_pro_plans`). Resolved in Phase 11 by renaming
  it to `newsletter_subscribers`. A second, real bug this same
  one-database-many-callers shape surfaces early rather than late is
  demonstrated by Phase 11's audit finding 4 tables with a Postgres RLS
  policy that was meant to say "service role only" but, due to a missing
  `to service_role` clause, actually granted every Postgres role
  unrestricted access — harmless only because every caller so far has used
  the service-role key. One project means one place these gaps *have* to
  get closed, rather than four places to separately forget about.
- **Normalize-vs-preserve became a real, recurring decision per product.**
  Journal and Gini's original client-direct JSON-blob pattern doesn't
  survive a move into one relational database cleanly — a blob keyed by
  `user_id` in one JSON column doesn't get you real FKs, RLS, or
  cross-table joins. The owner was asked explicitly, once per product
  (Phase 9 for Journal, Phase 10 for Gini), and both times chose to
  normalize into real tables matching FundaKaMental's "backend owns all
  business data" architecture, at real added migration cost, rather than
  preserve the original weaker pattern as-is.
- **Migration ordering is now a single, shared bottleneck.** Every schema
  change for every product goes through the same sequential
  `database/migrations/000N_*.sql` numbering and the same
  owner-runs-it-manually workflow (this project has no CI-driven migration
  runner) — a deliberate, conservative choice (see ADR 0002 for the related
  decision not to auto-run destructive schema changes), but it does mean
  four products' schema evolution is now coupled to one migration queue
  instead of four independent ones.
