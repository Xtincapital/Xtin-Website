-- ═══════════════════════════════════════════════════════════════════════
-- XTIN ACADEMY (LEARN) PRO PLANS — server-authoritative subscription records
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Security model:
--   • Rows are written ONLY by the Express backend using the service-role
--     key, after Razorpay HMAC signature verification succeeds
--     (controllers/learnPlan.controller.mjs).
--   • Logged-in users can SELECT their own row via RLS (auth.uid() = auth_id)
--     — nothing else. No client write policies exist, so a forged browser
--     can never grant itself Pro.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.learn_pro_plans (
  user_id text primary key,          -- public.users.id (backend user id)
  auth_id uuid,                      -- auth.users.id, for RLS self-reads
  plan_id text not null,             -- learn_pro_monthly | learn_pro_yearly
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

create index if not exists learn_pro_plans_auth_id_idx on public.learn_pro_plans (auth_id);

alter table public.learn_pro_plans enable row level security;

-- Users may read their own plan record. Writes are service-role only
-- (service role bypasses RLS), so no insert/update/delete policies exist.
drop policy if exists "Users can view own learn plan" on public.learn_pro_plans;
create policy "Users can view own learn plan"
  on public.learn_pro_plans
  for select
  using (auth.uid() = auth_id);
