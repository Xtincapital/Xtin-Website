-- ═══════════════════════════════════════════════════════════════════════
-- XTIN JOURNAL PRO PLANS — server-authoritative subscription records
--
-- Run once in the Supabase SQL editor of the JOURNAL project
-- (Dashboard → SQL → New query).
--
-- Security model:
--   • Rows are written ONLY by the FastAPI backend using the service-role
--     key, after Razorpay signature verification succeeds.
--   • Logged-in users can SELECT their own row (RLS) — nothing else.
--   • No client write policies exist, so a forged browser can never grant
--     itself Pro.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.journal_pro_plans (
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
alter table public.journal_pro_plans add column if not exists currency text default 'INR';
alter table public.journal_pro_plans add column if not exists region text;

alter table public.journal_pro_plans enable row level security;

drop policy if exists "Users can view own pro plan" on public.journal_pro_plans;
create policy "Users can view own pro plan"
  on public.journal_pro_plans
  for select
  using (auth.uid() = user_id);
