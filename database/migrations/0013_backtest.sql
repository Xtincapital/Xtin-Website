-- ═══════════════════════════════════════════════════════════════════════
-- Backtest — saved strategies, run history, candle cache, free-tier quota
-- counters and Pro passes for the "chat to backtest" product merged in from
-- the standalone Python backtest tool (now ported to services/api/modules/backtest).
--
-- Like Journal/Gini/FundaKaMental, the backend owns all of this data through
-- the service-role client; the frontend never reads these tables directly, so
-- RLS is enabled with owner-read policies only as defence in depth.
--
-- NOT applied automatically. Run in the Supabase SQL editor before deploying
-- the backend that mounts modules/backtest (the routes fail with a clear
-- "run migration 0013" error until then).
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- Saved strategies (JSON condition tree: instrument, entry, exit, risk).
create table if not exists public.backtest_strategies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  definition jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists backtest_strategies_user_idx on public.backtest_strategies (user_id, updated_at desc);

-- One row per run. `result` holds {metrics, trades, equity_curve, candles}.
create table if not exists public.backtest_runs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_id uuid references public.backtest_strategies(id) on delete set null,
  strategy_name text not null,
  definition jsonb,                         -- snapshot of the strategy as it was run
  start_date date not null,
  end_date date not null,
  starting_capital double precision not null default 100000,
  status text not null default 'completed' check (status in ('running', 'completed', 'failed')),
  error text,
  result jsonb,
  created_at timestamptz not null default now()
);
create index if not exists backtest_runs_user_idx on public.backtest_runs (user_id, created_at desc);

-- Historical candles are immutable, so cache the whole payload per request key.
create table if not exists public.backtest_candle_cache (
  key text primary key,                     -- "<exchange>:<symbol>:<timeframe>:<start>:<end>"
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Free-tier quota counters: one row per (scope, period, kind).
create table if not exists public.backtest_usage (
  scope text not null,                      -- "user:<auth id>"
  period text not null,                     -- "YYYY-MM"
  kind text not null,                       -- "chat_backtest"
  count integer not null default 0,
  primary key (scope, period, kind)
);

-- Atomic increment (a read-then-write from the API would let two concurrent
-- requests both slip under the cap).
create or replace function public.backtest_consume_usage(p_scope text, p_period text, p_kind text)
returns integer
language sql
as $$
  insert into public.backtest_usage as u (scope, period, kind, count)
  values (p_scope, p_period, p_kind, 1)
  on conflict (scope, period, kind) do update set count = u.count + 1
  returning u.count;
$$;

-- Pro pass: one row per user (like journal_pro_plans). A repeat purchase
-- stacks onto the remaining days; payment_id makes a retried payment a no-op.
create table if not exists public.backtest_pro_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pass_id text not null,
  valid_until timestamptz not null,
  payment_id text,
  order_id text,
  amount_paise integer,
  currency text default 'INR',
  updated_at timestamptz not null default now()
);

alter table public.backtest_strategies enable row level security;
alter table public.backtest_runs enable row level security;
alter table public.backtest_candle_cache enable row level security;
alter table public.backtest_usage enable row level security;
alter table public.backtest_pro_plans enable row level security;

drop policy if exists "Users can view own backtest strategies" on public.backtest_strategies;
create policy "Users can view own backtest strategies" on public.backtest_strategies for select using (auth.uid() = user_id);

drop policy if exists "Users can view own backtest runs" on public.backtest_runs;
create policy "Users can view own backtest runs" on public.backtest_runs for select using (auth.uid() = user_id);

drop policy if exists "Users can view own backtest plan" on public.backtest_pro_plans;
create policy "Users can view own backtest plan" on public.backtest_pro_plans for select using (auth.uid() = user_id);

-- backtest_candle_cache / backtest_usage: service role only (no policies).
