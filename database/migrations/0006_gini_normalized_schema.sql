-- ═══════════════════════════════════════════════════════════════════════
-- Gini (Phase 10) — normalized financial-planning data + a real AI wallet.
-- ═══════════════════════════════════════════════════════════════════════
--
-- Same situation as Journal (Phase 9, see 0005's header comment for the full
-- reasoning): the original app (features-incoming/gini) stores everything —
-- assets, liabilities, goals, family members, elder care plans, education
-- plans, tax optimization settings — as one JSON blob synced directly from
-- the browser to Supabase (`gini_user_data.app_state`, already migrated
-- verbatim in 0001, before this normalization decision was made). The
-- backend (Vercel serverless functions in `features-incoming/gini/api/`)
-- never touches this data at all.
--
-- Per the same explicit decision made for Journal — normalize to match
-- FundaKaMental/Journal's "backend owns all business data" architecture —
-- this migration adds real relational tables for the 7 domains the
-- migration plan already named (`documents/migration/PLAN.md`'s Phase 10
-- entry: gini_family_members, gini_assets, gini_liabilities, gini_goals,
-- gini_elder_care, gini_education_plans, gini_tax_optimization), plus a
-- proper AI token wallet (mirroring `funda_ai_wallets`/`journal_ai_wallets`).
-- `gini_user_data`/`gini_pro_plans` (already live from 0001) are NOT
-- dropped — `gini_user_data` stays in use for genuinely UI-only state
-- (simulation settings like SIP timing/Monte Carlo toggles, the derived/
-- cached `userProfile` snapshot) not worth normalizing; `gini_pro_plans`
-- is the existing, correct Pro-plan billing table.
--
-- Column shapes were reverse-engineered directly from what the live app
-- actually constructs — see `features-incoming/gini/app.js`'s asset/
-- liability/goal/family-member "add" handlers (~lines 3384, 3548, 3846,
-- 3109) and its elder-care/education-plan `save()` handlers (~lines 5658,
-- 5764) for the entity shapes, and `gini-ai-engine.js`/`app.js`'s
-- `tokenBalance`/`paywallLocked` chat-quota logic for the wallet shape.
--
-- `estatePlan` (beneficiaries/trusts/wills) and the `userProfile`/`settings`
-- objects are deliberately NOT normalized here — `userProfile` is a derived
-- cache recomputed from family members on save (see app.js's own comment:
-- "Money fields start at 0 — they are derived from real family members"),
-- not primary data; `settings` is lightweight simulation preferences, same
-- treatment as Journal's default-currency/timezone prefs; `estatePlan`
-- wasn't in the original migration plan's table list and is a smaller,
-- secondary feature — can be normalized later if it turns out to matter.
--
-- Run AFTER 0000-0005.

create table if not exists public.gini_assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  value numeric not null default 0,
  return_rate numeric,                -- app.js's `return` field (expected annual return %)
  ownership_type text,                -- 'Individual' | 'Joint' | 'Trust'
  owner uuid,                          -- references gini_family_members(id); nullable, set below after that table exists
  joint_share numeric,                 -- % for joint ownership
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gini_assets_user_idx on public.gini_assets (user_id);
alter table public.gini_assets enable row level security;
drop policy if exists "Users can view own assets" on public.gini_assets;
create policy "Users can view own assets" on public.gini_assets
  for select using (auth.uid() = user_id);

create table if not exists public.gini_liabilities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text,
  amount numeric not null default 0,
  rate numeric,                        -- interest rate %
  emi numeric,
  tenure numeric,                      -- months or years, matches the original's own unit (see api layer)
  ownership_type text,
  owner uuid,
  joint_share numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gini_liabilities_user_idx on public.gini_liabilities (user_id);
alter table public.gini_liabilities enable row level security;
drop policy if exists "Users can view own liabilities" on public.gini_liabilities;
create policy "Users can view own liabilities" on public.gini_liabilities
  for select using (auth.uid() = user_id);

create table if not exists public.gini_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  current_cost numeric not null default 0,
  target_year integer,
  priority text,
  inflation numeric,
  saved numeric default 0,
  return_rate numeric,
  assigned_to uuid,                    -- references gini_family_members(id)
  funded_by text,
  funding_split jsonb,                 -- e.g. per-member contribution split, kept flexible
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gini_goals_user_idx on public.gini_goals (user_id);
alter table public.gini_goals enable row level security;
drop policy if exists "Users can view own goals" on public.gini_goals;
create policy "Users can view own goals" on public.gini_goals
  for select using (auth.uid() = user_id);

create table if not exists public.gini_family_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text,
  age integer,
  income numeric default 0,
  is_earner boolean default false,
  is_dependent boolean default false,
  retirement_age integer default 60,
  life_expectancy integer default 85,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gini_family_members_user_idx on public.gini_family_members (user_id);
alter table public.gini_family_members enable row level security;
drop policy if exists "Users can view own family members" on public.gini_family_members;
create policy "Users can view own family members" on public.gini_family_members
  for select using (auth.uid() = user_id);

-- Now that gini_family_members exists, wire the FKs gini_assets.owner and
-- gini_goals.assigned_to were left unconstrained for above.
alter table public.gini_assets
  add constraint gini_assets_owner_fkey
  foreign key (owner) references public.gini_family_members(id) on delete set null;

alter table public.gini_liabilities
  add constraint gini_liabilities_owner_fkey
  foreign key (owner) references public.gini_family_members(id) on delete set null;

alter table public.gini_goals
  add constraint gini_goals_assigned_to_fkey
  foreign key (assigned_to) references public.gini_family_members(id) on delete set null;

create table if not exists public.gini_elder_care (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid not null references public.gini_family_members(id) on delete cascade,
  monthly_support numeric default 0,
  medical_reserve numeric default 0,
  life_expectancy integer default 85,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gini_elder_care_user_idx on public.gini_elder_care (user_id);
alter table public.gini_elder_care enable row level security;
drop policy if exists "Users can view own elder care plans" on public.gini_elder_care;
create policy "Users can view own elder care plans" on public.gini_elder_care
  for select using (auth.uid() = user_id);

create table if not exists public.gini_education_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references public.gini_family_members(id) on delete cascade,
  milestone text,
  target_year integer,
  cost numeric default 0,
  saved numeric default 0,
  ppf_account text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gini_education_plans_user_idx on public.gini_education_plans (user_id);
alter table public.gini_education_plans enable row level security;
drop policy if exists "Users can view own education plans" on public.gini_education_plans;
create policy "Users can view own education plans" on public.gini_education_plans
  for select using (auth.uid() = user_id);

-- One row per user (not a repeating collection, unlike the domains above) —
-- matches appState.taxOptimization's shape in the original: a settings-like
-- object, not a list.
create table if not exists public.gini_tax_optimization (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deductions_80c jsonb not null default '{}'::jsonb,
  deductions_80d jsonb not null default '{}'::jsonb,
  deductions_80e jsonb not null default '{}'::jsonb,
  huf_benefits boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.gini_tax_optimization enable row level security;
drop policy if exists "Users can view own tax optimization" on public.gini_tax_optimization;
create policy "Users can view own tax optimization" on public.gini_tax_optimization
  for select using (auth.uid() = user_id);

-- AI token wallet — mirrors journal_ai_wallets' shape from Phase 9, adapted
-- to Gini's simpler model (a trial grant + top-up purchases + a
-- paywall-locked flag, see app.js's `tokenBalance`/`paywallLocked` chat
-- quota logic — no monthly-allowance-reset concept here either).
create table if not exists public.gini_ai_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token_balance bigint not null default 0,
  tokens_purchased bigint not null default 0,
  tokens_used bigint not null default 0,
  free_tokens_granted bigint not null default 0,
  free_tokens_granted_at timestamptz,
  last_recharge jsonb,
  updated_at timestamptz not null default now()
);

alter table public.gini_ai_wallets enable row level security;
drop policy if exists "Users can view own AI wallet" on public.gini_ai_wallets;
create policy "Users can view own AI wallet" on public.gini_ai_wallets
  for select using (auth.uid() = user_id);

-- Audit trail for AI credit-pack purchases + idempotency guard, mirrors
-- journal_ai_wallet_purchases (Phase 9c's fix for the original's fragile
-- in-memory replay-guard — apply the same pattern here from day one).
create table if not exists public.gini_ai_wallet_purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null,
  tokens bigint not null,
  amount_inr numeric not null default 0,
  payment_id text,
  order_id text,
  created_at timestamptz not null default now()
);

create index if not exists gini_ai_wallet_purchases_user_idx
  on public.gini_ai_wallet_purchases (user_id);

alter table public.gini_ai_wallet_purchases enable row level security;
drop policy if exists "Users can view own AI purchases" on public.gini_ai_wallet_purchases;
create policy "Users can view own AI purchases" on public.gini_ai_wallet_purchases
  for select using (auth.uid() = user_id);
