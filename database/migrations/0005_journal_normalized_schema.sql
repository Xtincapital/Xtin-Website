-- ═══════════════════════════════════════════════════════════════════════
-- Journal (Phase 9) — normalized trades/goals/strategies + a real AI wallet.
-- ═══════════════════════════════════════════════════════════════════════
--
-- The original Journal app (features-incoming/journal) stores trades, goals,
-- and custom strategies as a client-synced JSON blob in `journal_user_state`
-- (state_key in 'trades'|'goals'|'custom_strategies'|...), written directly
-- from the browser via the Supabase anon key + RLS — the Python backend
-- never touches this data at all. `journal_user_state` and `journal_pro_plans`
-- were already migrated verbatim in 0001 (this was a straight copy of the
-- live schema, before this normalization decision was made).
--
-- Per an explicit decision to match FundaKaMental's architecture (backend
-- owns all real business data via the service-role client; the frontend
-- never talks to Supabase directly for anything but auth), this migration
-- adds real relational tables for trades/goals/strategies and a proper AI
-- token wallet, mirroring `funda_ai_wallets`/`funda_token_pack_purchases`
-- from 0001/Phase 8. `journal_user_state` is NOT dropped — it stays in use
-- for genuinely UI-only state (tab selection, drafts, settings) that was
-- never business data worth normalizing; only 'trades', 'goals',
-- 'custom_strategies', and 'ai_wallet' move to real tables below.
--
-- Column shapes were reverse-engineered directly from what the live app
-- actually constructs — see `features-incoming/journal/app.js`'s
-- `saveTrade()` (trade shape) and goal-creation handler (goal shape), and
-- `main.py`'s `get_ai_wallet`/`add_ai_tokens` (wallet shape).
--
-- One thing intentionally NOT ported: `main.py`'s `/api/v2/subscription`,
-- `/api/v2/subscription/cancel`, and `/api/v2/invoices` endpoints. Their own
-- source comment calls them out directly: "Unlike the legacy mock
-- /api/v2/subscription, these [journal_pro_plans-backed] endpoints require a
-- verified Razorpay payment" — i.e. the mock ones are dead/placeholder code,
-- backed by in-process Python dicts (SUBSCRIPTION_STORE/INVOICE_STORE) that
-- reset on every server restart and accept a "subscription" with zero
-- payment verification. The real, secure payment paths are
-- `/api/v2/plan/razorpay/*` (Pro plan, already covered by `journal_pro_plans`)
-- and `/api/v2/ai/razorpay/*` (AI credits, covered by `journal_ai_wallets`
-- below) — nothing needs to be built for the mock endpoints.
--
-- Run AFTER 0000-0004.

create table if not exists public.journal_trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  exit_date date,
  entry_time text,
  exit_time text,
  time_zone text,
  type text,                         -- trading type, e.g. 'intraday' | 'swing' | 'positional'
  market text,
  asset text not null,
  currency text not null default 'INR',
  quantity numeric,
  entry_price numeric,
  target_price numeric,
  stop_loss numeric,
  exit_price numeric,
  brokerage numeric default 0,
  pnl numeric default 0,
  strategy text,
  margin numeric,
  buy_sell text,                     -- 'buy' | 'sell'
  contract text,
  strike_price numeric,
  option_type text,                  -- 'call' | 'put' | null for non-options
  notes text default '',
  tags text[] not null default '{}',
  emotion text default 'neutral',
  underlying_price numeric,
  implied_volatility numeric,
  days_to_expiry numeric,
  greeks jsonb,                      -- computed options Greeks, kept as-is (not worth a column each)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_trades_user_date_idx
  on public.journal_trades (user_id, date desc);

alter table public.journal_trades enable row level security;

drop policy if exists "Users can view own trades" on public.journal_trades;
create policy "Users can view own trades" on public.journal_trades
  for select using (auth.uid() = user_id);

create table if not exists public.journal_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  metric text not null,              -- e.g. 'total_pnl' | 'win_rate' | 'trade_count'
  timeframe text not null,           -- e.g. 'this_month' | 'this_week' | 'this_year'
  target_value numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_goals enable row level security;

drop policy if exists "Users can view own goals" on public.journal_goals;
create policy "Users can view own goals" on public.journal_goals
  for select using (auth.uid() = user_id);

-- Custom strategies are just user-defined names (see app.js's
-- `customStrategies` — a plain string array, not objects), so this table is
-- deliberately minimal.
create table if not exists public.journal_strategies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.journal_strategies enable row level security;

drop policy if exists "Users can view own strategies" on public.journal_strategies;
create policy "Users can view own strategies" on public.journal_strategies
  for select using (auth.uid() = user_id);

-- AI token wallet — mirrors funda_ai_wallets' shape from Phase 8, adapted to
-- Journal's actual model (a one-time free grant + top-up purchases, no
-- FundaKaMental-style monthly allowance reset — the original app never had
-- a monthly grant concept, see main.py's get_ai_wallet/add_ai_tokens).
create table if not exists public.journal_ai_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token_balance bigint not null default 0,
  tokens_purchased bigint not null default 0,
  tokens_used bigint not null default 0,
  free_tokens_granted bigint not null default 0,
  free_tokens_granted_at timestamptz,
  last_recharge jsonb,
  updated_at timestamptz not null default now()
);

alter table public.journal_ai_wallets enable row level security;

drop policy if exists "Users can view own AI wallet" on public.journal_ai_wallets;
create policy "Users can view own AI wallet" on public.journal_ai_wallets
  for select using (auth.uid() = user_id);

-- Audit trail for AI credit-pack purchases, mirrors funda_token_pack_purchases.
create table if not exists public.journal_ai_wallet_purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null,
  tokens bigint not null,
  amount_inr numeric not null default 0,
  payment_id text,
  order_id text,
  created_at timestamptz not null default now()
);

create index if not exists journal_ai_wallet_purchases_user_idx
  on public.journal_ai_wallet_purchases (user_id);

alter table public.journal_ai_wallet_purchases enable row level security;

drop policy if exists "Users can view own AI purchases" on public.journal_ai_wallet_purchases;
create policy "Users can view own AI purchases" on public.journal_ai_wallet_purchases
  for select using (auth.uid() = user_id);
