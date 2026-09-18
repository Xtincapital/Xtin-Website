-- Phase 11c — table renames + dead-schema deletion. Run after 0007/0008.
-- Every rename/drop below was individually verified against live code
-- (grepped every `.from("...")` call across services/api/modules) before
-- being included — nothing here is a guess.
--
-- Scope explicitly excludes (kept, not touched):
--   - `newsletters` (0000_baseline.sql) — looked like a delete candidate
--     (no writer) but IS reachable via a live `GET /api/newsletters(/:id)`
--     route; dropping it would 500 that route. Not dead, just quiet.
--   - `funda_stocks`, `funda_screening_cache`, `funda_price_history`,
--     `funda_intraday_prices`, `funda_technical_indicators`,
--     `funda_trading_signals` — reserved for a not-yet-built feature
--     (persisted indicator history / signal alerting), per an explicit
--     product decision, not dead code. RLS-hardened in 0007, otherwise
--     untouched. Documented as reserved in database/SCHEMA.md.
--   - `user_subscriptions`, `algorithm_subscriptions` (unprefixed) — these
--     are genuinely core-platform-level concepts, not per-product ones, so
--     the lack of a `funda_`/`gini_`/`journal_` prefix is correct, not an
--     inconsistency. Not renamed.

begin;

-- ═══════════════════════════════════════════════════════════════════════
-- RENAME 1 — funda_pro_payments -> funda_pro_plans. Same shape/purpose as
-- gini_pro_plans/journal_pro_plans (current Pro-plan state, one row per
-- user: plan_id/billing/currency/activated_at/valid_until/payment_id/
-- order_id) — just named "payments" instead of "plans" for no reason
-- discoverable in the code or its own history. Only 2 live references
-- (razorpay.controller.ts, razorpay.repository.ts in modules/fundakamental)
-- — updated in the same commit as this migration.
-- ═══════════════════════════════════════════════════════════════════════
alter table if exists public.funda_pro_payments rename to funda_pro_plans;
alter index if exists funda_pro_payments_user_id_idx rename to funda_pro_plans_user_id_idx;
drop policy if exists "Users can view own pro payments" on public.funda_pro_plans;
create policy "Users can view own pro plans" on public.funda_pro_plans
    for select using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- RENAME 2 — subscriptions -> newsletter_subscribers. The bare name
-- collided confusingly with the unrelated billing "subscription" concept
-- used everywhere else in this schema (user_subscriptions,
-- algorithm_subscriptions, funda_subscriptions/pro_plans) — this table is
-- actually the newsletter email-subscriber list. Only 2 live references
-- (send-newsletter-smtp.ts, modules/newsletter/subscription.repository.ts)
-- — updated in the same commit as this migration.
-- ═══════════════════════════════════════════════════════════════════════
alter table if exists public.subscriptions rename to newsletter_subscribers;
drop policy if exists "Public can subscribe" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter" on public.newsletter_subscribers
    for insert with check (true);

-- ═══════════════════════════════════════════════════════════════════════
-- DELETE 1 — funda_watchlist (legacy singular v1 schema). Confirmed dead:
-- superseded by funda_watchlists/funda_watchlist_items (v2, migration 008)
-- since Phase 8a, and watchlists.repository.ts's own header comment states
-- outright: "The older singular funda_watchlist table is unrelated and
-- unused here." Zero live `.from("funda_watchlist")` references anywhere.
-- ═══════════════════════════════════════════════════════════════════════
drop table if exists public.funda_watchlist cascade;

-- ═══════════════════════════════════════════════════════════════════════
-- DELETE 2 — the unused Stripe-billing subsystem. PLAN.md's own Phase 8a
-- entry states this was a deliberate decision made THEN: "dropped the
-- Python service's unused Stripe billing path entirely (frontend never
-- called it; every other product in this app uses Razorpay only)" — but
-- the SQL tables were still created in 0001 even though the code path was
-- never ported. Confirmed zero `.from(...)` references to any of these 5
-- tables, and zero `.rpc(...)` calls to any of their 5 dedicated
-- functions, anywhere in services/api. Dropping the functions before the
-- tables (functions don't hard-block a table drop in Postgres, but
-- leaving them behind referencing now-gone tables is just clutter).
-- ═══════════════════════════════════════════════════════════════════════
drop function if exists public.funda_get_user_subscription(uuid);
drop function if exists public.funda_has_feature_access(uuid, text);
drop function if exists public.funda_check_usage_limit(uuid, text);
drop function if exists public.funda_increment_usage(uuid, text);
drop function if exists public.funda_clean_old_usage_data();

drop table if exists public.funda_payment_history cascade;
drop table if exists public.funda_feature_usage cascade;
drop table if exists public.funda_stripe_webhook_events cascade;
drop table if exists public.funda_subscriptions cascade;
drop table if exists public.funda_subscription_plans cascade;

drop type if exists public.funda_subscription_plan_type;
drop type if exists public.funda_subscription_status;
drop type if exists public.funda_payment_status;

commit;
