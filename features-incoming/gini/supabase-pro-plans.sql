-- ═══════════════════════════════════════════════════════════════════════
-- GINI PRO PLANS — server-authoritative subscription records
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Security model:
--   • Rows are written ONLY by the backend using the service-role key,
--     after Razorpay signature verification succeeds.
--   • Logged-in users can SELECT their own row (RLS) — nothing else.
--   • No insert/update/delete policies exist for regular users, so a
--     forged client can never grant itself Pro.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.gini_pro_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null,
  billing text,
  currency text default 'INR',
  region text,
  activated_at timestamptz not null default now(),
  valid_until timestamptz not null,
  payment_id text,
  order_id text,
  user_email text,
  updated_at timestamptz not null default now()
);

-- Region-awareness: record the currency + region actually charged (idempotent
-- for existing installs).
alter table public.gini_pro_plans add column if not exists currency text default 'INR';
alter table public.gini_pro_plans add column if not exists region text;

alter table public.gini_pro_plans enable row level security;

-- Users may read their own plan record. Writes are service-role only
-- (service role bypasses RLS), so no write policies are defined.
drop policy if exists "Users can view own pro plan" on public.gini_pro_plans;
create policy "Users can view own pro plan"
  on public.gini_pro_plans
  for select
  using (auth.uid() = user_id);
