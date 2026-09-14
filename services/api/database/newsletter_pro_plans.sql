-- ═══════════════════════════════════════════════════════════════════════
-- XTIN MARKET BRIEF (NEWSLETTER) PRO — server-authoritative subscription
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Security model:
--   • Rows in newsletter_pro_plans are written ONLY by the Express backend
--     using the service-role key, after Razorpay HMAC verification succeeds
--     (controllers/newsletterPlan.controller.mjs).
--   • Logged-in users can SELECT their own row via RLS (auth.uid() = auth_id).
--     No client write policies exist, so a forged browser can never grant
--     itself Pro.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.newsletter_pro_plans (
  user_id text primary key,          -- public.users.id (backend user id)
  auth_id uuid,                      -- auth.users.id, for RLS self-reads
  plan_id text not null,             -- newsletter_pro_monthly | newsletter_pro_yearly
  billing text,
  currency text default 'INR',
  region text,
  markets text default 'IN',         -- csv: IN,US,GLOBAL
  activated_at timestamptz not null default now(),
  valid_until timestamptz not null,
  payment_id text,
  order_id text,
  user_email text,
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_pro_plans_auth_id_idx on public.newsletter_pro_plans (auth_id);
create index if not exists newsletter_pro_plans_email_idx on public.newsletter_pro_plans (user_email);

alter table public.newsletter_pro_plans enable row level security;

drop policy if exists "Users can view own newsletter plan" on public.newsletter_pro_plans;
create policy "Users can view own newsletter plan"
  on public.newsletter_pro_plans
  for select
  using (auth.uid() = auth_id);

-- ─── Market preference on the subscriber list (Pro chooses IN/US/GLOBAL) ───
alter table public.subscriptions
  add column if not exists markets text default 'IN';

-- ─── Edition + market tagging on generated newsletters (archive filtering) ──
alter table public.indian_finance_newsletter
  add column if not exists edition text;    -- pre_market | post_market
alter table public.indian_finance_newsletter
  add column if not exists market text;     -- IN | US | GLOBAL
