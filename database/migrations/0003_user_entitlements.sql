-- ═══════════════════════════════════════════════════════════════════════
-- USER_ENTITLEMENTS — single-table view of "what does this user have access
-- to", Phase 6 of the migration plan.
--
-- Today, answering "does this user have Learn Pro / Newsletter Pro / an
-- algo subscription / a bundle" means querying 4 separate tables and
-- computing flags in application code (see
-- services/api/modules/billing/subscriptionPlan.controller.ts's
-- getUserSubscriptionPlans). This table is a normalized, single-query
-- alternative, kept in sync by the same payment-verification code paths
-- that already write to those 4 tables — it doesn't replace them (they
-- remain the source of truth for plan details/billing), it's a derived
-- index over them.
--
-- No backfill needed: this is a fresh project with zero existing
-- subscriptions to backfill from.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  auth_id text,
  product text not null,          -- 'learn' | 'newsletter' | 'algo' | 'bundle'
  active boolean not null default true,
  valid_until timestamptz,
  source_table text,              -- which table granted this, for traceability
  updated_at timestamptz not null default now(),
  unique (user_id, product)
);

create index if not exists user_entitlements_user_id_idx on public.user_entitlements (user_id);
create index if not exists user_entitlements_auth_id_idx on public.user_entitlements (auth_id);

alter table public.user_entitlements enable row level security;

drop policy if exists "Users can view own entitlements" on public.user_entitlements;
create policy "Users can view own entitlements"
  on public.user_entitlements for select
  using (auth_id = auth.uid()::text or user_id = current_setting('app.user_id', true));

drop policy if exists "Service role can manage entitlements" on public.user_entitlements;
create policy "Service role can manage entitlements"
  on public.user_entitlements for all
  using (true) with check (true);
