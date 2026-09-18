-- Phase 11a — RLS hardening. Safe/additive: fixes real gaps found during a
-- full read-only audit of every table across 0000-0006. Nothing here
-- changes application behavior for the live backend, because the backend
-- exclusively uses the Supabase SERVICE ROLE key (which bypasses RLS
-- entirely) — every fix below only matters if an anon/authenticated
-- Supabase client is ever pointed at these tables directly (a browser
-- client, a future feature, a mistake). Run this before 0008/0009.
--
-- ═══════════════════════════════════════════════════════════════════════
-- PART 1 — fix policies that were meant to say "service role only" but,
-- because they omitted `to service_role`, actually grant unrestricted
-- read/write/delete to EVERY Postgres role (anon, authenticated, public)
-- under Postgres's default policy-target semantics. The service role
-- already bypasses RLS entirely, so these policies added zero legitimate
-- value and only added risk — dropped outright rather than tightened.
-- `user_lesson_progress` is the worst case: this was its ONLY policy, so
-- it had no legitimate self-scoped fallback at all — added one below.
-- ═══════════════════════════════════════════════════════════════════════

drop policy if exists "Service role can manage user subscriptions" on public.user_subscriptions;
drop policy if exists "Service role can manage algorithm subscriptions" on public.algorithm_subscriptions;
drop policy if exists "Service role can manage entitlements" on public.user_entitlements;
drop policy if exists "Service role can manage lesson progress" on public.user_lesson_progress;

-- Also tighten the three surviving select-own policies: the
-- `or user_id = current_setting('app.user_id', true)` branch is dead code
-- — grepped the entire services/api tree, nothing ever sets that session
-- GUC — dropped for clarity, leaving the real `auth_id = auth.uid()::text`
-- check as the sole (correct) condition.
drop policy if exists "Users can view own subscriptions" on public.user_subscriptions;
create policy "Users can view own subscriptions"
    on public.user_subscriptions for select
    using (auth_id = auth.uid()::text);

drop policy if exists "Users can read own algorithm subscriptions" on public.algorithm_subscriptions;
create policy "Users can read own algorithm subscriptions"
    on public.algorithm_subscriptions for select
    using (auth_id = auth.uid()::text);

drop policy if exists "Users can view own entitlements" on public.user_entitlements;
create policy "Users can view own entitlements"
    on public.user_entitlements for select
    using (auth_id = auth.uid()::text);

-- user_lesson_progress has no auth_id column at all — its user_id column
-- holds `req.user.userId` (see middlewares/auth.ts), which is
-- public.users.id, NOT auth.users.id. Scope the same way public.purchases
-- already does: join through public.users to find the row owned by the
-- current auth session.
drop policy if exists "Users can view own lesson progress" on public.user_lesson_progress;
create policy "Users can view own lesson progress"
    on public.user_lesson_progress for select
    using (user_id = (select id::text from public.users where auth_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════
-- PART 2 — slides/videos had RLS enabled with ZERO policies (locked out
-- entirely for any non-service-role caller). Harmless today (only ever
-- read via service role, or nested under courses' embedded select) but
-- undocumented as intentional, unlike newsletter_runs's identical
-- zero-policy shape (which has an explicit comment explaining why). Add a
-- real policy instead of leaving it silent: gate by actual purchase of the
-- parent course, matching this app's real paid-content model rather than
-- a blanket public-read that would leak paid lesson content.
-- ═══════════════════════════════════════════════════════════════════════

drop policy if exists "Purchasers can view course slides" on public.slides;
create policy "Purchasers can view course slides"
    on public.slides for select
    using (
        exists (
            select 1 from public.purchases p
            join public.users u on u.id = p.user_id
            where p.course_id = slides.course_id and u.auth_id = auth.uid()
        )
    );

drop policy if exists "Purchasers can view course videos" on public.videos;
create policy "Purchasers can view course videos"
    on public.videos for select
    using (
        exists (
            select 1 from public.purchases p
            join public.users u on u.id = p.user_id
            where p.course_id = videos.course_id and u.auth_id = auth.uid()
        )
    );

-- ═══════════════════════════════════════════════════════════════════════
-- PART 3 — 4 funda_* tables hold real per-user data (`user_id uuid
-- references auth.users(id)` directly, unlike the legacy text/dual-space
-- columns in Part 1) but had NO `enable row level security` statement at
-- all in 0001 — fully open to Supabase's default anon/authenticated
-- grants on public-schema tables. Straightforward select-own fix.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.funda_signal_alerts enable row level security;
drop policy if exists "Users can view own signal alerts" on public.funda_signal_alerts;
create policy "Users can view own signal alerts"
    on public.funda_signal_alerts for select
    using (auth.uid() = user_id);

alter table public.funda_saved_screens enable row level security;
drop policy if exists "Users can view own saved screens" on public.funda_saved_screens;
create policy "Users can view own saved screens"
    on public.funda_saved_screens for select
    using (auth.uid() = user_id);

alter table public.funda_price_alerts enable row level security;
drop policy if exists "Users can view own price alerts" on public.funda_price_alerts;
create policy "Users can view own price alerts"
    on public.funda_price_alerts for select
    using (auth.uid() = user_id);

alter table public.funda_notifications enable row level security;
drop policy if exists "Users can view own notifications" on public.funda_notifications;
create policy "Users can view own notifications"
    on public.funda_notifications for select
    using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- PART 4 — market-data / reference tables with no user_id column, also
-- missing RLS entirely. These are kept as reserved schema for a
-- not-yet-built feature (persisted technical-indicator history / signal
-- alerting — see database/SCHEMA.md), not dead code, but "reserved"
-- doesn't mean "should stay wide open": enable RLS with a public-select
-- policy (matches courses' own public-read pattern) — no write policy
-- needed since only the service role ever writes to these.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.funda_stocks enable row level security;
drop policy if exists "Public can read stocks" on public.funda_stocks;
create policy "Public can read stocks" on public.funda_stocks for select using (true);

alter table public.funda_screening_cache enable row level security;
drop policy if exists "Public can read screening cache" on public.funda_screening_cache;
create policy "Public can read screening cache" on public.funda_screening_cache for select using (true);

alter table public.funda_price_history enable row level security;
drop policy if exists "Public can read price history" on public.funda_price_history;
create policy "Public can read price history" on public.funda_price_history for select using (true);

alter table public.funda_intraday_prices enable row level security;
drop policy if exists "Public can read intraday prices" on public.funda_intraday_prices;
create policy "Public can read intraday prices" on public.funda_intraday_prices for select using (true);

alter table public.funda_technical_indicators enable row level security;
drop policy if exists "Public can read technical indicators" on public.funda_technical_indicators;
create policy "Public can read technical indicators" on public.funda_technical_indicators for select using (true);

alter table public.funda_trading_signals enable row level security;
drop policy if exists "Public can read trading signals" on public.funda_trading_signals;
create policy "Public can read trading signals" on public.funda_trading_signals for select using (true);
