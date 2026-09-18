# Database schema

This is a **generated, verified** reference for the single Supabase project backing XTIN Capital, FundaKaMental, Journal, and Gini. It replaces `DATABASE_SCHEMA_README.md` (deleted in Phase 11), which was raw, unedited AI output — it documented tables that never existed (`advisors`, `help_articles`, several views/triggers) and was missing most of the real schema (`funda_*`, `journal_*`, most of `gini_*`). Every table below was confirmed against the actual `database/migrations/*.sql` files, not assumed.

The **source of truth is always `database/migrations/*.sql`**, applied in order. This document is a map of that source, current as of `0009_schema_cleanup.sql`. If they ever disagree, the migrations win — regenerate this file rather than hand-editing it out of sync.

**Every table's real business data is written exclusively through the Supabase **service-role** key** from `services/api`. RLS policies below are a defense-in-depth backstop (the app never uses the anon/authenticated key against Postgres directly), not the primary access-control layer — but they matter the moment any browser-side Supabase client is introduced, which is why Phase 11 closed every gap found.

## Conventions

- `funda_*` / `journal_*` / `gini_*` — per-product tables, one prefix per integrated product.
- `user_id` scoped to `auth.users(id)` directly (uuid, FK, RLS `auth.uid() = user_id`) is the standard, current pattern — used by every `funda_*`/`journal_*`/`gini_*` table with per-user data. FundaKaMental additionally has its own profile table (`funda_users`, PK = `auth.users.id` 1:1); Journal and Gini have none — a real, intentional architectural asymmetry, not an oversight.
- A handful of pre-Phase-6 tables (`user_subscriptions`, `algorithm_subscriptions`, `learn_pro_plans`, `newsletter_pro_plans`, `user_entitlements`, `user_lesson_progress`) predate Supabase-only auth and still carry a legacy `user_id` (→ `public.users.id`, the old profile table) alongside a real `auth_id` (→ `auth.users.id`). See "Legacy dual-ID tables" below — this is why `user_id` on these six tables is deliberately left `text`, unconstrained, rather than given a hard FK.

---

## Core platform (`0000_baseline.sql`)

| Table | RLS | Notes |
|---|---|---|
| `users` | select/update-own | Legacy profile table, `auth_id uuid → auth.users(id)`. Auto-populated on signup via a trigger; still referenced by the six legacy dual-ID tables below. |
| `courses` | public select (published only) | Academy. |
| `slides` | purchase-gated select | Phase 11: was RLS-enabled with zero policies (locked out entirely); now scoped through `purchases` + `users` to the actual course purchaser. |
| `videos` | purchase-gated select | Same fix as `slides`. |
| `purchases` | select-own | `user_id uuid → public.users(id)`, the reference pattern the RLS fix above copies. |
| `user_subscriptions` | select-own (`auth_id`) | Legacy dual-ID table — see below. Phase 11: dropped a policy that granted all Postgres roles full read/write (missing `to service_role`); real select-own now the only policy. |
| `algorithm_subscriptions` | select-own (`auth_id`) | Same legacy shape, same Phase 11 fix. |
| `learn_pro_plans` | select-own (`auth_id`) | Same legacy shape (`user_id text primary key`). Phase 11 added a real FK on `auth_id → auth.users(id)`. |
| `newsletter_pro_plans` | select-own (`auth_id`) | Same as `learn_pro_plans`. |
| `user_lesson_progress` | select-own (join) | Legacy shape but **no `auth_id` column at all** — Phase 11 added its first-ever select-own policy (it previously had none, only the dangerous all-roles one), scoped by joining through `public.users`. |
| `intern_certificates` | public select (non-revoked) + admin/service-role all | |
| `support_tickets` | public insert only | No select policy — read only via service role, intentional. |
| `home_page_metrics` | public select | |
| `newsletter_subscribers` | public insert only | Newsletter email list. Renamed from bare `subscriptions` in Phase 11 — that name collided confusingly with the unrelated billing-subscription concept used everywhere else in this schema. |
| `indian_finance_newsletter` | public select | |
| `newsletters` | public select | No active writer, but **reachable via a live `GET /api/newsletters(/:id)` route** — looked like dead-code, confirmed NOT dead, kept as-is. |

### Legacy dual-ID tables — `user_id` is deliberately unconstrained

`user_subscriptions`, `algorithm_subscriptions`, `learn_pro_plans`, `newsletter_pro_plans`, `user_entitlements`, `user_lesson_progress` predate this migration's Supabase-only auth work (Phase 6) and store `req.user.userId` in their `user_id` column. Per `middlewares/auth.ts`, that value is **either** `public.users.id` (when the session's owner has a legacy profile row) **or** the raw `auth.users.id` (when they don't — `customUser?.id || user.id`), depending on signup path and timing. A hard FK to `public.users(id)` would reject legitimate writes for the second case. Left `text`, unconstrained — the genuinely user-scoped column on all six is `auth_id` (uuid, FK'd to `auth.users(id)` as of Phase 11), and every RLS policy on these tables scopes by `auth_id`, not `user_id`.

## FundaKaMental (`0001_gini_journal_fundakamental.sql`, `0004_fundakamental_rag_chat.sql`)

Profile: `funda_users` (PK = `auth.users.id`).

**Live, in active use:** `funda_reports`, `funda_source_documents`, `funda_chat_messages`, `funda_document_chunks` (+ `funda_match_document_chunks` RPC, pgvector cosine search for document chat), `funda_watchlists`/`funda_watchlist_items`/`funda_watchlist_snapshots` (v2 schema), `funda_portfolios`/`funda_portfolio_holdings`/`_transactions`/`_snapshots`, `funda_pro_plans` (renamed from `funda_pro_payments` in Phase 11 — same shape as `gini_pro_plans`/`journal_pro_plans`, just inconsistently named before), `funda_ai_wallets`, `funda_token_pack_purchases`.

**Reserved for a not-yet-built feature** (schema exists, zero live code references today, kept deliberately — indicators are currently computed live/on-the-fly rather than persisted): `funda_stocks`, `funda_screening_cache`, `funda_price_history`, `funda_intraday_prices`, `funda_technical_indicators`, `funda_trading_signals`. RLS-hardened (public-select) in Phase 11 even though reserved — "reserved" isn't "should stay wide open."

**Live, per-user, RLS-hardened in Phase 11** (had `user_id` but zero RLS before): `funda_signal_alerts`, `funda_saved_screens`, `funda_price_alerts`, `funda_notifications`.

**Deleted in Phase 11 (confirmed dead — zero live references, an entire unused Stripe-billing subsystem the app never actually wired up):** `funda_watchlist` (legacy v1, superseded by the v2 tables above), `funda_subscriptions`, `funda_subscription_plans`, `funda_payment_history`, `funda_feature_usage`, `funda_stripe_webhook_events`, plus their 3 enum types and 5 dedicated SQL functions.

`funda_portfolio_performance` exists but has zero live references — kept (not deleted), same caution as the reserved cluster above; flagged in `portfolios.repository.ts`'s own header comment.

## Journal (`0005_journal_normalized_schema.sql`)

`journal_user_state`, `journal_pro_plans` (both from `0001`, still UI-only-state/billing respectively) + `journal_trades`, `journal_goals`, `journal_strategies`, `journal_ai_wallets`, `journal_ai_wallet_purchases`. All select-own RLS, proper `auth.users(id)` FKs, no issues found in the Phase 11 audit.

## Gini (`0001_gini_journal_fundakamental.sql`, `0006_gini_normalized_schema.sql`)

`gini_user_data`, `gini_pro_plans` (both from `0001`) + `gini_family_members`, `gini_assets`, `gini_liabilities`, `gini_goals`, `gini_elder_care`, `gini_education_plans`, `gini_tax_optimization`, `gini_ai_wallets`, `gini_ai_wallet_purchases`. All select-own RLS, proper FKs. `gini_assets.owner`/`gini_liabilities.owner`/`gini_goals.assigned_to` are nullable FKs into `gini_family_members(id)` that don't themselves enforce cross-user ownership at the DB/RLS layer — enforced at the application layer instead (`getFamilyMemberOwnership` check in every relevant controller, added during Phase 10a).

## Other (`0002_newsletter_runs.sql`, `0003_user_entitlements.sql`)

- `newsletter_runs` — RLS enabled, intentionally zero policies (no client read/write path exists — service-role only, documented in the migration itself).
- `user_entitlements` — a derived, best-effort index of "what does this user have access to" (`learn`/`newsletter`/`algo`/`bundle`), kept in sync by the 4 payment-verification paths that write the tables above. Same legacy dual-ID shape as the core-platform tables; same Phase 11 fixes applied.

## Migration history

| File | What it did |
|---|---|
| `0000_baseline.sql` | Core platform tables, carried over from before this consolidation. |
| `0001_gini_journal_fundakamental.sql` | The big one — FundaKaMental's full schema (stocks, portfolios, reports, RAG-adjacent tables, billing) plus `gini_user_data`/`gini_pro_plans` and `journal_user_state`/`journal_pro_plans` as placeholders ahead of Journal/Gini's own normalized schemas. |
| `0002_newsletter_runs.sql` | Newsletter generation run tracking. |
| `0003_user_entitlements.sql` | Cross-product entitlement index. |
| `0004_fundakamental_rag_chat.sql` | pgvector document-chat storage/search. |
| `0005_journal_normalized_schema.sql` | Journal's full normalized schema (trades/goals/strategies/AI wallet). |
| `0006_gini_normalized_schema.sql` | Gini's full normalized schema (7 domains + AI wallet). |
| `0007_rls_hardening.sql` | Phase 11a — fixed 4 mis-scoped RLS policies, added RLS to 10 previously-unprotected tables. |
| `0008_fk_normalization.sql` | Phase 11b — added real FK constraints on `auth_id` across the 5 legacy dual-ID tables that had one. |
| `0009_schema_cleanup.sql` | Phase 11c — 2 renames (`funda_pro_payments`→`funda_pro_plans`, `subscriptions`→`newsletter_subscribers`), deleted `funda_watchlist` + the entire dead Stripe-billing subsystem (5 tables, 3 types, 5 functions). |
