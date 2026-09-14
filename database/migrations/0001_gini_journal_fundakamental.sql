-- ═══════════════════════════════════════════════════════════════════════
-- Unify Gini, Journal, and FundaKaMental onto the same Supabase project
-- (same auth.users identity) as XTIN Capital. Run AFTER 0000_baseline.sql.
-- ═══════════════════════════════════════════════════════════════════════
--
-- Design: every product's tables key off auth.users(id) directly (Gini and
-- Journal already do this in their live code — verbatim below). XTIN
-- Capital's own public.users is a profile cache on top of that same
-- auth.users(id); nothing here needs to touch it.
--
-- FundaKaMental is the one product with its OWN profile table
-- (public.users, id = auth.users.id 1:1 — not a separate id space, so no
-- data remapping is needed). To avoid colliding with XTIN Capital's own
-- `users`, `subscriptions`, `subscription_plans` table names in the same
-- schema, every FundaKaMental table below is renamed with a funda_ prefix.
-- Its Python backend (Featues/Fundamental-Anslysis/backend/app/) is
-- updated in the same change to match — this file alone does not make the
-- app work, the code change is required too.
--
-- Reverse-engineered from:
--   Featues/Xtin-Gini/{gini-auth.js, SETUP.md, supabase-pro-plans.sql, server.js, gini-premium.js, api/razorpay-plan-verify.js}
--   Featues/Xtin-Journal/{supabase-schema.sql, journal-pro-plans.sql}
--   Featues/Fundamental-Anslysis/backend/migrations/001-011_*.sql,
--     fundamental_pro_plans.sql, fundamental_ai_wallets.sql, and the live
--     app/api/endpoints/*.py + app/db/database.py + app/core/security.py
--     (to see which of the 11 migrations' tables are still actually used).
--
-- One real bug fixed along the way: app/api/endpoints/pdf_export.py
-- queries a table called "analysis_reports", which has never existed in
-- any FundaKaMental migration — the real table (same columns: ticker,
-- user_id, created_at) is "reports". That PDF-export-by-ticker endpoint
-- has been throwing a 42P01 "relation does not exist" error on every call.
-- Fixed in the Python change to point at funda_reports.
--
-- Also found, not touched here: FundaKaMental runs TWO parallel billing
-- systems simultaneously — a full Stripe subscription system (migration
-- 006: subscription_plans/subscriptions/payment_history/feature_usage)
-- and a separate, simpler Razorpay-based one bolted on later
-- (fundamental_pro_plans.sql + fundamental_ai_wallets.sql: profiles.plan +
-- pro_payments + ai_wallets). Both routers are mounted live in main.py.
-- Preserved as-is below (funda_-prefixed, both intact) since picking one
-- is a product decision, not part of unifying identity.

-- ─────────────────────────────────────────────────────────────────────────
-- GINI — verbatim from Featues/Xtin-Gini/SETUP.md + supabase-pro-plans.sql.
-- Both already key directly off auth.users(id); no renaming needed, table
-- names don't collide with anything else in this schema.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.gini_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  ai_wallet jsonb not null default '{}'::jsonb,
  report_quota jsonb not null default '{}'::jsonb,
  ai_profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.gini_user_data enable row level security;

drop policy if exists "Users can read own Gini data" on public.gini_user_data;
create policy "Users can read own Gini data"
  on public.gini_user_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own Gini data" on public.gini_user_data;
create policy "Users can insert own Gini data"
  on public.gini_user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own Gini data" on public.gini_user_data;
create policy "Users can update own Gini data"
  on public.gini_user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

alter table public.gini_pro_plans enable row level security;

drop policy if exists "Users can view own pro plan" on public.gini_pro_plans;
create policy "Users can view own pro plan"
  on public.gini_pro_plans for select
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- JOURNAL — verbatim from Featues/Xtin-Journal/{supabase-schema,journal-pro-plans}.sql.
-- Same story: already keyed off auth.users(id) directly.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.journal_user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, state_key)
);

alter table public.journal_user_state enable row level security;

drop policy if exists "Users can read their own journal state" on public.journal_user_state;
create policy "Users can read their own journal state"
  on public.journal_user_state for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own journal state" on public.journal_user_state;
create policy "Users can insert their own journal state"
  on public.journal_user_state for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own journal state" on public.journal_user_state;
create policy "Users can update their own journal state"
  on public.journal_user_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own journal state" on public.journal_user_state;
create policy "Users can delete their own journal state"
  on public.journal_user_state for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists journal_user_state_updated_idx
  on public.journal_user_state (user_id, updated_at desc);

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

alter table public.journal_pro_plans enable row level security;

drop policy if exists "Users can view own pro plan" on public.journal_pro_plans;
create policy "Users can view own pro plan"
  on public.journal_pro_plans for select
  using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- FUNDAKAMENTAL — every table funda_-prefixed. id = auth.users.id 1:1 on
-- funda_users (not a separate id space), so this is a rename, not a data
-- remap.
-- ═══════════════════════════════════════════════════════════════════════

-- Profile (migration 001 users + fundamental_pro_plans.sql's plan_valid_until
-- ALTER). The live code's `.table("profiles")` calls (razorpay_payments.py)
-- and `.table("users")` calls (security.py, database.py) both become
-- funda_users — see the matching Python change.
create table if not exists public.funda_users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'premium', 'enterprise')),
  reports_used integer not null default 0,
  reports_limit integer not null default 5,
  plan_valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.funda_users enable row level security;

drop policy if exists "Users can view own profile" on public.funda_users;
create policy "Users can view own profile" on public.funda_users
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.funda_users;
create policy "Users can update own profile" on public.funda_users
  for update using (auth.uid() = id);

create or replace function public.handle_new_funda_user()
returns trigger as $$
begin
  insert into public.funda_users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_funda on auth.users;
create trigger on_auth_user_created_funda
  after insert on auth.users
  for each row execute function public.handle_new_funda_user();

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.funda_users;
create trigger set_updated_at
  before update on public.funda_users
  for each row execute function public.handle_updated_at();

-- Reports, source documents, chat, legacy watchlist (migration 001 + 002).
create table if not exists public.funda_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  company text,
  ticker text,
  exchange text,
  overall_score numeric(3, 1),
  summary text,
  metrics jsonb,
  key_ratios jsonb,
  strengths text[],
  red_flags text[],
  investment_assessment text,
  status text default 'pending',       -- pending | processing | completed | failed
  source_document_id uuid,             -- FK added below, after funda_source_documents exists
  analysis_result jsonb,
  error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funda_source_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  report_id uuid references public.funda_reports(id) on delete cascade,
  file_name text not null,
  file_size integer not null,
  file_type text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.funda_reports
  add constraint funda_reports_source_document_id_fkey
  foreign key (source_document_id) references public.funda_source_documents(id) on delete set null;

create table if not exists public.funda_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references public.funda_reports(id) on delete cascade not null,
  user_id uuid references public.funda_users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Legacy simple watchlist from migration 001 — superseded by
-- funda_watchlists/funda_watchlist_items below, but the live code still
-- references it (account-deletion cleanup in auth.py), so kept.
create table if not exists public.funda_watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  ticker text not null,
  company_name text not null,
  added_at timestamptz not null default now(),
  unique(user_id, ticker)
);

create index if not exists idx_funda_reports_user_id on public.funda_reports(user_id);
create index if not exists idx_funda_reports_ticker on public.funda_reports(ticker);
create index if not exists idx_funda_reports_created_at on public.funda_reports(created_at desc);
create index if not exists idx_funda_reports_status on public.funda_reports(status);
create index if not exists idx_funda_reports_source_document on public.funda_reports(source_document_id);
create index if not exists idx_funda_source_documents_user_id on public.funda_source_documents(user_id);
create index if not exists idx_funda_source_documents_report_id on public.funda_source_documents(report_id);
create index if not exists idx_funda_chat_messages_report_id on public.funda_chat_messages(report_id);
create index if not exists idx_funda_chat_messages_created_at on public.funda_chat_messages(created_at);
create index if not exists idx_funda_watchlist_user_id on public.funda_watchlist(user_id);

alter table public.funda_reports enable row level security;
alter table public.funda_source_documents enable row level security;
alter table public.funda_chat_messages enable row level security;
alter table public.funda_watchlist enable row level security;

drop policy if exists "Users can view own reports" on public.funda_reports;
create policy "Users can view own reports" on public.funda_reports for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own reports" on public.funda_reports;
create policy "Users can insert own reports" on public.funda_reports for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own reports" on public.funda_reports;
create policy "Users can update own reports" on public.funda_reports for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own reports" on public.funda_reports;
create policy "Users can delete own reports" on public.funda_reports for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own documents" on public.funda_source_documents;
create policy "Users can view own documents" on public.funda_source_documents for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own documents" on public.funda_source_documents;
create policy "Users can insert own documents" on public.funda_source_documents for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view own chat messages" on public.funda_chat_messages;
create policy "Users can view own chat messages" on public.funda_chat_messages for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own chat messages" on public.funda_chat_messages;
create policy "Users can insert own chat messages" on public.funda_chat_messages for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view own watchlist" on public.funda_watchlist;
create policy "Users can view own watchlist" on public.funda_watchlist for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own watchlist" on public.funda_watchlist;
create policy "Users can insert own watchlist" on public.funda_watchlist for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own watchlist" on public.funda_watchlist;
create policy "Users can delete own watchlist" on public.funda_watchlist for delete using (auth.uid() = user_id);

create trigger set_updated_at before update on public.funda_reports
  for each row execute function public.handle_updated_at();

-- Storage bucket for FundaKaMental document uploads (private).
insert into storage.buckets (id, name, public)
values ('funda-documents', 'funda-documents', false)
on conflict (id) do nothing;

drop policy if exists "Funda users can upload own documents" on storage.objects;
create policy "Funda users can upload own documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'funda-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Funda users can view own documents" on storage.objects;
create policy "Funda users can view own documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'funda-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Funda users can delete own documents" on storage.objects;
create policy "Funda users can delete own documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'funda-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Stocks + screening (migration 003, 009's market column folded in).
create table if not exists public.funda_stocks (
  id uuid primary key default uuid_generate_v4(),
  ticker text unique not null,
  name text not null,
  description text,
  sector text,
  industry text,
  exchange text,
  currency text default 'USD',
  country text,
  market text,                          -- india | us (migration 009)
  price numeric(12, 2),
  change numeric(12, 2),
  change_percent numeric(8, 4),
  volume bigint,
  market_cap bigint,
  pe_ratio numeric(10, 2),
  peg_ratio numeric(10, 2),
  pb_ratio numeric(10, 2),
  dividend_yield numeric(8, 4),
  eps numeric(10, 2),
  profit_margin numeric(8, 4),
  operating_margin numeric(8, 4),
  roe numeric(8, 4),
  roa numeric(8, 4),
  revenue_growth numeric(8, 4),
  earnings_growth numeric(8, 4),
  current_ratio numeric(10, 2),
  quick_ratio numeric(10, 2),
  debt_to_equity numeric(10, 2),
  beta numeric(10, 4),
  week_52_high numeric(12, 2),
  week_52_low numeric(12, 2),
  avg_volume bigint,
  shares_outstanding bigint,
  last_updated timestamptz not null default now(),
  data_source text default 'alpha_vantage',
  is_active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.funda_saved_screens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  name text not null,
  description text,
  filters jsonb not null,
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funda_screening_cache (
  id uuid primary key default uuid_generate_v4(),
  filter_hash text unique not null,
  results jsonb not null,
  result_count int not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_funda_stocks_ticker on public.funda_stocks(ticker);
create index if not exists idx_funda_stocks_sector on public.funda_stocks(sector);
create index if not exists idx_funda_stocks_market_cap on public.funda_stocks(market_cap desc);
create index if not exists idx_funda_stocks_pe_ratio on public.funda_stocks(pe_ratio);
create index if not exists idx_funda_stocks_updated on public.funda_stocks(last_updated desc);
create index if not exists idx_funda_stocks_active on public.funda_stocks(is_active) where is_active = true;
create index if not exists idx_funda_stocks_market on public.funda_stocks(market);
create index if not exists idx_funda_saved_screens_user on public.funda_saved_screens(user_id);

create or replace function funda_update_stocks_timestamp()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_funda_stocks_timestamp on public.funda_stocks;
create trigger trigger_update_funda_stocks_timestamp
  before update on public.funda_stocks
  for each row execute function funda_update_stocks_timestamp();

create or replace function funda_clean_expired_screening_cache()
returns void as $$
begin
  delete from public.funda_screening_cache where expires_at < now();
end;
$$ language plpgsql;

-- Price alerts, notifications, historical/intraday prices (migration 004).
create table if not exists public.funda_price_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  ticker text not null,
  condition text not null check (condition in ('above', 'below')),
  target_price numeric(12, 2) not null,
  is_active boolean default true,
  triggered_at timestamptz,
  triggered_price numeric(12, 2),
  created_at timestamptz not null default now(),
  unique(user_id, ticker, condition, target_price, is_active)
);

create table if not exists public.funda_notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.funda_price_history (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  date date not null,
  open numeric(12, 2),
  high numeric(12, 2),
  low numeric(12, 2),
  close numeric(12, 2) not null,
  volume bigint,
  adjusted_close numeric(12, 2),
  created_at timestamptz not null default now(),
  unique(ticker, date)
);

create table if not exists public.funda_intraday_prices (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  timestamp timestamptz not null,
  price numeric(12, 2) not null,
  volume bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_funda_price_alerts_user on public.funda_price_alerts(user_id);
create index if not exists idx_funda_price_alerts_ticker on public.funda_price_alerts(ticker);
create index if not exists idx_funda_price_alerts_active on public.funda_price_alerts(is_active) where is_active = true;
create index if not exists idx_funda_notifications_user on public.funda_notifications(user_id);
create index if not exists idx_funda_notifications_unread on public.funda_notifications(user_id, is_read) where is_read = false;
create index if not exists idx_funda_notifications_created on public.funda_notifications(created_at desc);
create index if not exists idx_funda_price_history_ticker on public.funda_price_history(ticker);
create index if not exists idx_funda_price_history_date on public.funda_price_history(ticker, date desc);
create index if not exists idx_funda_intraday_ticker on public.funda_intraday_prices(ticker);
create index if not exists idx_funda_intraday_timestamp on public.funda_intraday_prices(ticker, timestamp desc);

create or replace function funda_clean_old_intraday_prices()
returns void as $$
begin
  delete from public.funda_intraday_prices where created_at < now() - interval '7 days';
end;
$$ language plpgsql;

create or replace function funda_get_price_change(p_ticker text, p_days int default 1)
returns table(ticker text, current_price numeric, previous_price numeric, change numeric, change_percent numeric) as $$
begin
  return query
  select
    p_ticker,
    s.price,
    ph.close as previous_price,
    (s.price - ph.close) as change,
    case when ph.close > 0 then ((s.price - ph.close) / ph.close * 100) else 0 end as change_percent
  from public.funda_stocks s
  left join lateral (
    select close from public.funda_price_history
    where ticker = p_ticker and date <= current_date - p_days
    order by date desc limit 1
  ) ph on true
  where s.ticker = p_ticker;
end;
$$ language plpgsql;

-- Technical indicators + trading signals (migration 005).
create table if not exists public.funda_technical_indicators (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  date date not null,
  sma_20 numeric(12, 2), sma_50 numeric(12, 2), sma_200 numeric(12, 2),
  ema_12 numeric(12, 2), ema_26 numeric(12, 2),
  rsi numeric(5, 2), macd numeric(12, 4), macd_signal numeric(12, 4), macd_histogram numeric(12, 4),
  bb_upper numeric(12, 2), bb_middle numeric(12, 2), bb_lower numeric(12, 2), atr numeric(12, 4),
  stoch_k numeric(5, 2), stoch_d numeric(5, 2),
  obv bigint,
  close_price numeric(12, 2) not null,
  volume bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(ticker, date)
);

create table if not exists public.funda_trading_signals (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  signal_type text not null check (signal_type in ('BUY', 'SELL', 'STRONG BUY', 'STRONG SELL', 'NEUTRAL')),
  signal_strength numeric(5, 2) not null,
  buy_signals jsonb,
  sell_signals jsonb,
  details jsonb,
  generated_at timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.funda_signal_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.funda_users(id) on delete cascade not null,
  ticker text not null,
  alert_on text[] not null default array['STRONG BUY', 'STRONG SELL'],
  is_active boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, ticker)
);

create index if not exists idx_funda_technical_indicators_ticker on public.funda_technical_indicators(ticker);
create index if not exists idx_funda_technical_indicators_date on public.funda_technical_indicators(ticker, date desc);
create index if not exists idx_funda_trading_signals_ticker on public.funda_trading_signals(ticker);
create index if not exists idx_funda_trading_signals_type on public.funda_trading_signals(signal_type);
create index if not exists idx_funda_trading_signals_strength on public.funda_trading_signals(signal_strength desc);
create index if not exists idx_funda_trading_signals_generated on public.funda_trading_signals(generated_at desc);
create index if not exists idx_funda_signal_alerts_user on public.funda_signal_alerts(user_id);
create index if not exists idx_funda_signal_alerts_ticker on public.funda_signal_alerts(ticker);
create index if not exists idx_funda_signal_alerts_active on public.funda_signal_alerts(is_active) where is_active = true;

create or replace function funda_update_technical_indicators_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_funda_technical_indicators_timestamp
  before update on public.funda_technical_indicators
  for each row execute function funda_update_technical_indicators_timestamp();

create or replace function funda_get_latest_indicators(p_ticker text)
returns table(ticker text, date date, sma_20 numeric, sma_50 numeric, sma_200 numeric, rsi numeric, macd numeric, signal_type text, signal_strength numeric) as $$
begin
  return query
  select ti.ticker, ti.date, ti.sma_20, ti.sma_50, ti.sma_200, ti.rsi, ti.macd, ts.signal_type, ts.signal_strength
  from public.funda_technical_indicators ti
  left join lateral (
    select signal_type, signal_strength from public.funda_trading_signals
    where ticker = p_ticker order by generated_at desc limit 1
  ) ts on true
  where ti.ticker = p_ticker
  order by ti.date desc limit 1;
end;
$$ language plpgsql;

create or replace function funda_clean_old_technical_indicators()
returns void as $$
begin
  delete from public.funda_technical_indicators where date < current_date - interval '2 years';
  delete from public.funda_trading_signals where generated_at < now() - interval '30 days';
end;
$$ language plpgsql;

-- Stripe billing system (migration 006) — parallel to the Razorpay one
-- below; both are live, see the note at the top of this file.
create type funda_subscription_plan_type as enum ('free', 'premium');
create type funda_subscription_status as enum (
  'active', 'past_due', 'canceled', 'expired', 'trialing', 'incomplete', 'incomplete_expired'
);
create type funda_payment_status as enum ('succeeded', 'pending', 'failed', 'refunded', 'canceled');

create table if not exists public.funda_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  plan_type funda_subscription_plan_type not null,
  display_name text not null,
  description text,
  price_monthly decimal(10, 2) not null default 0.00,
  price_yearly decimal(10, 2) default null,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  stripe_product_id text,
  features jsonb not null default '{}'::jsonb,
  max_watchlist_stocks integer default -1,
  max_alerts integer default -1,
  max_screening_runs_per_day integer default -1,
  max_analysis_runs_per_day integer default -1,
  max_chat_messages_per_day integer default -1,
  enable_technical_indicators boolean default false,
  enable_realtime_data boolean default false,
  enable_advanced_screening boolean default false,
  enable_pdf_export boolean default false,
  enable_email_alerts boolean default false,
  enable_priority_support boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_funda_subscription_plans_type on public.funda_subscription_plans(plan_type);

create table if not exists public.funda_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.funda_subscription_plans(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text,
  status funda_subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  amount decimal(10, 2),
  currency text default 'usd',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create index if not exists idx_funda_subscriptions_user_id on public.funda_subscriptions(user_id);
create index if not exists idx_funda_subscriptions_stripe_customer on public.funda_subscriptions(stripe_customer_id);
create index if not exists idx_funda_subscriptions_stripe_subscription on public.funda_subscriptions(stripe_subscription_id);
create index if not exists idx_funda_subscriptions_status on public.funda_subscriptions(status);
create index if not exists idx_funda_subscriptions_period_end on public.funda_subscriptions(current_period_end);

create table if not exists public.funda_payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.funda_subscriptions(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  stripe_invoice_id text,
  amount decimal(10, 2) not null,
  currency text default 'usd',
  status funda_payment_status not null,
  payment_method text,
  failure_code text,
  failure_message text,
  refunded_amount decimal(10, 2) default 0.00,
  refunded_at timestamptz,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_funda_payment_history_user_id on public.funda_payment_history(user_id);
create index if not exists idx_funda_payment_history_subscription on public.funda_payment_history(subscription_id);
create index if not exists idx_funda_payment_history_stripe_payment on public.funda_payment_history(stripe_payment_intent_id);
create index if not exists idx_funda_payment_history_status on public.funda_payment_history(status);
create index if not exists idx_funda_payment_history_created on public.funda_payment_history(created_at desc);

create table if not exists public.funda_feature_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  screening_runs integer default 0,
  analysis_runs integer default 0,
  chat_messages integer default 0,
  alerts_created integer default 0,
  pdf_exports integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, usage_date)
);

create index if not exists idx_funda_feature_usage_user_date on public.funda_feature_usage(user_id, usage_date);
create index if not exists idx_funda_feature_usage_date on public.funda_feature_usage(usage_date);

create table if not exists public.funda_stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean default false,
  processing_error text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

create index if not exists idx_funda_webhook_events_type on public.funda_stripe_webhook_events(event_type);
create index if not exists idx_funda_webhook_events_processed on public.funda_stripe_webhook_events(processed);
create index if not exists idx_funda_webhook_events_created on public.funda_stripe_webhook_events(created_at desc);

create or replace function funda_get_user_subscription(p_user_id uuid)
returns table(
  subscription_id uuid, plan_name text, plan_type funda_subscription_plan_type, status funda_subscription_status,
  current_period_end timestamptz, cancel_at_period_end boolean, features jsonb, limits jsonb
) as $$
begin
  return query
  select s.id, sp.name, sp.plan_type, s.status, s.current_period_end, s.cancel_at_period_end, sp.features,
    jsonb_build_object(
      'max_watchlist_stocks', sp.max_watchlist_stocks, 'max_alerts', sp.max_alerts,
      'max_screening_runs_per_day', sp.max_screening_runs_per_day, 'max_analysis_runs_per_day', sp.max_analysis_runs_per_day,
      'max_chat_messages_per_day', sp.max_chat_messages_per_day,
      'enable_technical_indicators', sp.enable_technical_indicators, 'enable_realtime_data', sp.enable_realtime_data,
      'enable_advanced_screening', sp.enable_advanced_screening, 'enable_pdf_export', sp.enable_pdf_export,
      'enable_email_alerts', sp.enable_email_alerts, 'enable_priority_support', sp.enable_priority_support
    ) as limits
  from public.funda_subscriptions s
  join public.funda_subscription_plans sp on s.plan_id = sp.id
  where s.user_id = p_user_id and s.status in ('active', 'trialing', 'past_due')
  order by s.created_at desc limit 1;
end;
$$ language plpgsql;

create or replace function funda_has_feature_access(p_user_id uuid, p_feature_name text)
returns boolean as $$
declare v_has_access boolean;
begin
  select case p_feature_name
      when 'technical_indicators' then sp.enable_technical_indicators
      when 'realtime_data' then sp.enable_realtime_data
      when 'advanced_screening' then sp.enable_advanced_screening
      when 'pdf_export' then sp.enable_pdf_export
      when 'email_alerts' then sp.enable_email_alerts
      when 'priority_support' then sp.enable_priority_support
      else false
    end into v_has_access
  from public.funda_subscriptions s
  join public.funda_subscription_plans sp on s.plan_id = sp.id
  where s.user_id = p_user_id and s.status in ('active', 'trialing', 'past_due');
  return coalesce(v_has_access, false);
end;
$$ language plpgsql;

create or replace function funda_check_usage_limit(p_user_id uuid, p_limit_type text)
returns jsonb as $$
declare v_limit integer; v_usage integer; v_allowed boolean;
begin
  select case p_limit_type
      when 'screening_runs' then sp.max_screening_runs_per_day
      when 'analysis_runs' then sp.max_analysis_runs_per_day
      when 'chat_messages' then sp.max_chat_messages_per_day
      when 'alerts' then sp.max_alerts
      else -1
    end into v_limit
  from public.funda_subscriptions s
  join public.funda_subscription_plans sp on s.plan_id = sp.id
  where s.user_id = p_user_id and s.status in ('active', 'trialing', 'past_due');

  v_limit := coalesce(v_limit, 10);

  select case p_limit_type
      when 'screening_runs' then coalesce(screening_runs, 0)
      when 'analysis_runs' then coalesce(analysis_runs, 0)
      when 'chat_messages' then coalesce(chat_messages, 0)
      else 0
    end into v_usage
  from public.funda_feature_usage
  where user_id = p_user_id and usage_date = current_date;

  v_usage := coalesce(v_usage, 0);
  v_allowed := (v_limit = -1 or v_usage < v_limit);

  return jsonb_build_object(
    'allowed', v_allowed, 'limit', v_limit, 'used', v_usage,
    'remaining', case when v_limit = -1 then -1 else greatest(0, v_limit - v_usage) end
  );
end;
$$ language plpgsql;

create or replace function funda_increment_usage(p_user_id uuid, p_usage_type text)
returns void as $$
begin
  insert into public.funda_feature_usage (user_id, usage_date, screening_runs, analysis_runs, chat_messages, alerts_created, pdf_exports)
  values (
    p_user_id, current_date,
    case when p_usage_type = 'screening_runs' then 1 else 0 end,
    case when p_usage_type = 'analysis_runs' then 1 else 0 end,
    case when p_usage_type = 'chat_messages' then 1 else 0 end,
    case when p_usage_type = 'alerts_created' then 1 else 0 end,
    case when p_usage_type = 'pdf_exports' then 1 else 0 end
  )
  on conflict (user_id, usage_date) do update set
    screening_runs = case when p_usage_type = 'screening_runs' then funda_feature_usage.screening_runs + 1 else funda_feature_usage.screening_runs end,
    analysis_runs = case when p_usage_type = 'analysis_runs' then funda_feature_usage.analysis_runs + 1 else funda_feature_usage.analysis_runs end,
    chat_messages = case when p_usage_type = 'chat_messages' then funda_feature_usage.chat_messages + 1 else funda_feature_usage.chat_messages end,
    alerts_created = case when p_usage_type = 'alerts_created' then funda_feature_usage.alerts_created + 1 else funda_feature_usage.alerts_created end,
    pdf_exports = case when p_usage_type = 'pdf_exports' then funda_feature_usage.pdf_exports + 1 else funda_feature_usage.pdf_exports end,
    updated_at = now();
end;
$$ language plpgsql;

create or replace function funda_clean_old_usage_data()
returns integer as $$
declare v_deleted integer;
begin
  delete from public.funda_feature_usage where usage_date < current_date - interval '90 days';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$ language plpgsql;

create trigger update_funda_subscription_plans_updated_at before update on public.funda_subscription_plans
  for each row execute function public.handle_updated_at();
create trigger update_funda_subscriptions_updated_at before update on public.funda_subscriptions
  for each row execute function public.handle_updated_at();
create trigger update_funda_payment_history_updated_at before update on public.funda_payment_history
  for each row execute function public.handle_updated_at();
create trigger update_funda_feature_usage_updated_at before update on public.funda_feature_usage
  for each row execute function public.handle_updated_at();

insert into public.funda_subscription_plans (
  name, plan_type, display_name, description, price_monthly, features,
  max_watchlist_stocks, max_alerts, max_screening_runs_per_day, max_analysis_runs_per_day, max_chat_messages_per_day,
  enable_technical_indicators, enable_realtime_data, enable_advanced_screening, enable_pdf_export, enable_email_alerts, enable_priority_support
) values (
  'free', 'free', 'Free Plan', 'Perfect for getting started with fundamental analysis', 0.00,
  jsonb_build_array('Basic stock analysis', 'Up to 10 stocks in watchlist', '5 screening runs per day', '10 analysis runs per day', 'Community support'),
  10, 5, 5, 10, 20, false, false, false, false, false, false
) on conflict (name) do nothing;

insert into public.funda_subscription_plans (
  name, plan_type, display_name, description, price_monthly, price_yearly, features,
  max_watchlist_stocks, max_alerts, max_screening_runs_per_day, max_analysis_runs_per_day, max_chat_messages_per_day,
  enable_technical_indicators, enable_realtime_data, enable_advanced_screening, enable_pdf_export, enable_email_alerts, enable_priority_support
) values (
  'premium', 'premium', 'Premium Plan', 'Unlock all features and unlimited access', 29.00, 290.00,
  jsonb_build_array('Everything in Free', 'Unlimited stocks & watchlists', 'Technical indicators (RSI, MACD, etc.)', 'Real-time market data & alerts',
    'Advanced screening filters', 'Unlimited analysis & screening', 'PDF export of reports', 'Email notifications', 'Priority support'),
  -1, -1, -1, -1, -1, true, true, true, true, true, true
) on conflict (name) do nothing;

alter table public.funda_subscription_plans enable row level security;
alter table public.funda_subscriptions enable row level security;
alter table public.funda_payment_history enable row level security;
alter table public.funda_feature_usage enable row level security;

drop policy if exists "Anyone can view subscription plans" on public.funda_subscription_plans;
create policy "Anyone can view subscription plans" on public.funda_subscription_plans for select using (true);
drop policy if exists "Users can view their own subscription" on public.funda_subscriptions;
create policy "Users can view their own subscription" on public.funda_subscriptions for select using (auth.uid() = user_id);
drop policy if exists "Users can update their own subscription" on public.funda_subscriptions;
create policy "Users can update their own subscription" on public.funda_subscriptions for update using (auth.uid() = user_id);
drop policy if exists "Users can view their own payment history" on public.funda_payment_history;
create policy "Users can view their own payment history" on public.funda_payment_history for select using (auth.uid() = user_id);
drop policy if exists "Users can view their own feature usage" on public.funda_feature_usage;
create policy "Users can view their own feature usage" on public.funda_feature_usage for select using (auth.uid() = user_id);

-- Razorpay-based billing (fundamental_pro_plans.sql + fundamental_ai_wallets.sql)
-- — the second, simpler billing path, live alongside the Stripe one above.
create table if not exists public.funda_pro_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  billing text,
  currency text not null default 'INR',
  amount numeric not null default 0,
  payment_id text,
  order_id text,
  region varchar(10),                  -- migration 011
  activated_at timestamptz not null default now(),
  valid_until timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists funda_pro_payments_user_id_idx on public.funda_pro_payments (user_id);
alter table public.funda_pro_payments enable row level security;
drop policy if exists "Users can view own pro payments" on public.funda_pro_payments;
create policy "Users can view own pro payments" on public.funda_pro_payments
  for select using (auth.uid() = user_id);

create table if not exists public.funda_ai_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tier text not null default 'free',
  period text not null,
  monthly_balance bigint not null default 0,
  monthly_grant bigint not null default 0,
  topup_balance bigint not null default 0,
  tokens_used_total bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.funda_ai_wallets enable row level security;
drop policy if exists "Users can view own wallet" on public.funda_ai_wallets;
create policy "Users can view own wallet" on public.funda_ai_wallets
  for select using (auth.uid() = user_id);

create table if not exists public.funda_token_pack_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pack_id text not null,
  tokens bigint not null,
  currency text not null default 'INR',
  amount numeric not null default 0,
  payment_id text,
  order_id text,
  region varchar(10),                  -- migration 011
  created_at timestamptz not null default now()
);

create index if not exists funda_token_pack_purchases_user_idx on public.funda_token_pack_purchases (user_id);
alter table public.funda_token_pack_purchases enable row level security;
drop policy if exists "Users can view own token purchases" on public.funda_token_pack_purchases;
create policy "Users can view own token purchases" on public.funda_token_pack_purchases
  for select using (auth.uid() = user_id);

-- Portfolio tracking (migration 007, 010's multi-asset columns folded in).
create table if not exists public.funda_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(200) not null,
  description text,
  currency varchar(3) default 'USD',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_funda_portfolio_name_per_user unique (user_id, name)
);

create index if not exists idx_funda_portfolios_user_id on public.funda_portfolios(user_id);
create index if not exists idx_funda_portfolios_default on public.funda_portfolios(user_id, is_default) where is_default = true;

create table if not exists public.funda_portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.funda_portfolios(id) on delete cascade,
  ticker varchar(20) not null,
  company_name varchar(500),
  quantity decimal(20, 8) not null check (quantity >= 0),
  avg_cost_basis decimal(20, 4) not null check (avg_cost_basis >= 0),
  total_cost decimal(20, 4) generated always as (quantity * avg_cost_basis) stored,
  asset_type varchar(20) not null default 'stock',  -- stock | gold | cash | other (migration 010)
  manual_price decimal(20, 4),
  live_ticker varchar(30),
  currency varchar(8) default 'INR',
  first_purchase_date timestamptz,
  last_transaction_date timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_funda_holding_per_portfolio unique (portfolio_id, ticker)
);

create index if not exists idx_funda_holdings_portfolio_id on public.funda_portfolio_holdings(portfolio_id);
create index if not exists idx_funda_holdings_ticker on public.funda_portfolio_holdings(ticker);
create index if not exists idx_funda_holdings_asset_type on public.funda_portfolio_holdings(asset_type);

create table if not exists public.funda_portfolio_transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.funda_portfolios(id) on delete cascade,
  ticker varchar(20) not null,
  company_name varchar(500),
  transaction_type varchar(10) not null check (transaction_type in ('BUY', 'SELL', 'DIVIDEND', 'SPLIT')),
  quantity decimal(20, 8) not null,
  price_per_share decimal(20, 4) not null check (price_per_share >= 0),
  total_amount decimal(20, 4) generated always as (quantity * price_per_share) stored,
  fees decimal(20, 4) default 0 check (fees >= 0),
  transaction_date timestamptz not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_funda_transactions_portfolio_id on public.funda_portfolio_transactions(portfolio_id);
create index if not exists idx_funda_transactions_ticker on public.funda_portfolio_transactions(ticker);
create index if not exists idx_funda_transactions_date on public.funda_portfolio_transactions(transaction_date desc);
create index if not exists idx_funda_transactions_type on public.funda_portfolio_transactions(transaction_type);

create table if not exists public.funda_portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.funda_portfolios(id) on delete cascade,
  snapshot_date date not null,
  total_value decimal(20, 4) not null,
  total_cost decimal(20, 4) not null,
  total_gain_loss decimal(20, 4) not null,
  gain_loss_pct decimal(10, 4) not null,
  num_holdings integer not null,
  snapshot_data jsonb,
  created_at timestamptz default now(),
  constraint unique_funda_snapshot_per_day unique (portfolio_id, snapshot_date)
);

create index if not exists idx_funda_snapshots_portfolio_id on public.funda_portfolio_snapshots(portfolio_id);
create index if not exists idx_funda_snapshots_date on public.funda_portfolio_snapshots(snapshot_date desc);

create table if not exists public.funda_portfolio_performance (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.funda_portfolios(id) on delete cascade,
  period varchar(20) not null,
  total_return decimal(10, 4) not null,
  total_return_pct decimal(10, 4) not null,
  annualized_return_pct decimal(10, 4),
  best_performing_stock varchar(20),
  worst_performing_stock varchar(20),
  total_dividends decimal(20, 4) default 0,
  calculated_at timestamptz default now(),
  constraint unique_funda_performance_per_period unique (portfolio_id, period)
);

create index if not exists idx_funda_performance_portfolio_id on public.funda_portfolio_performance(portfolio_id);

alter table public.funda_portfolios enable row level security;
alter table public.funda_portfolio_holdings enable row level security;
alter table public.funda_portfolio_transactions enable row level security;
alter table public.funda_portfolio_snapshots enable row level security;
alter table public.funda_portfolio_performance enable row level security;

drop policy if exists "Users can view their own portfolios" on public.funda_portfolios;
create policy "Users can view their own portfolios" on public.funda_portfolios for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own portfolios" on public.funda_portfolios;
create policy "Users can create their own portfolios" on public.funda_portfolios for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own portfolios" on public.funda_portfolios;
create policy "Users can update their own portfolios" on public.funda_portfolios for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own portfolios" on public.funda_portfolios;
create policy "Users can delete their own portfolios" on public.funda_portfolios for delete using (auth.uid() = user_id);

drop policy if exists "Users can view holdings in their portfolios" on public.funda_portfolio_holdings;
create policy "Users can view holdings in their portfolios" on public.funda_portfolio_holdings for select
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can create holdings in their portfolios" on public.funda_portfolio_holdings;
create policy "Users can create holdings in their portfolios" on public.funda_portfolio_holdings for insert
  with check (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can update holdings in their portfolios" on public.funda_portfolio_holdings;
create policy "Users can update holdings in their portfolios" on public.funda_portfolio_holdings for update
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can delete holdings in their portfolios" on public.funda_portfolio_holdings;
create policy "Users can delete holdings in their portfolios" on public.funda_portfolio_holdings for delete
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));

drop policy if exists "Users can view transactions in their portfolios" on public.funda_portfolio_transactions;
create policy "Users can view transactions in their portfolios" on public.funda_portfolio_transactions for select
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can create transactions in their portfolios" on public.funda_portfolio_transactions;
create policy "Users can create transactions in their portfolios" on public.funda_portfolio_transactions for insert
  with check (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can update transactions in their portfolios" on public.funda_portfolio_transactions;
create policy "Users can update transactions in their portfolios" on public.funda_portfolio_transactions for update
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can delete transactions in their portfolios" on public.funda_portfolio_transactions;
create policy "Users can delete transactions in their portfolios" on public.funda_portfolio_transactions for delete
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));

drop policy if exists "Users can view snapshots of their portfolios" on public.funda_portfolio_snapshots;
create policy "Users can view snapshots of their portfolios" on public.funda_portfolio_snapshots for select
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can create snapshots of their portfolios" on public.funda_portfolio_snapshots;
create policy "Users can create snapshots of their portfolios" on public.funda_portfolio_snapshots for insert
  with check (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));

drop policy if exists "Users can view performance of their portfolios" on public.funda_portfolio_performance;
create policy "Users can view performance of their portfolios" on public.funda_portfolio_performance for select
  using (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));
drop policy if exists "Users can create performance records for their portfolios" on public.funda_portfolio_performance;
create policy "Users can create performance records for their portfolios" on public.funda_portfolio_performance for insert
  with check (portfolio_id in (select id from public.funda_portfolios where user_id = auth.uid()));

create trigger update_funda_portfolios_timestamp before update on public.funda_portfolios
  for each row execute function public.handle_updated_at();
create trigger update_funda_holdings_timestamp before update on public.funda_portfolio_holdings
  for each row execute function public.handle_updated_at();
create trigger update_funda_transactions_timestamp before update on public.funda_portfolio_transactions
  for each row execute function public.handle_updated_at();

create or replace function funda_ensure_single_default_portfolio()
returns trigger as $$
begin
  if new.is_default = true then
    update public.funda_portfolios set is_default = false
    where user_id = new.user_id and id != new.id and is_default = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_single_default_funda_portfolio
  before insert or update on public.funda_portfolios
  for each row when (new.is_default = true)
  execute function funda_ensure_single_default_portfolio();

create or replace function funda_update_holding_from_transaction()
returns trigger as $$
declare
  existing_holding public.funda_portfolio_holdings%rowtype;
  new_quantity decimal(20, 8);
  new_avg_cost decimal(20, 4);
  new_total_cost decimal(20, 4);
begin
  select * into existing_holding from public.funda_portfolio_holdings
  where portfolio_id = new.portfolio_id and ticker = new.ticker;

  if new.transaction_type = 'BUY' then
    if existing_holding.id is not null then
      new_quantity := existing_holding.quantity + new.quantity;
      new_total_cost := (existing_holding.quantity * existing_holding.avg_cost_basis) + (new.quantity * new.price_per_share) + new.fees;
      new_avg_cost := new_total_cost / new_quantity;
      update public.funda_portfolio_holdings
      set quantity = new_quantity, avg_cost_basis = new_avg_cost, last_transaction_date = new.transaction_date, updated_at = now()
      where id = existing_holding.id;
    else
      insert into public.funda_portfolio_holdings (portfolio_id, ticker, company_name, quantity, avg_cost_basis, first_purchase_date, last_transaction_date)
      values (new.portfolio_id, new.ticker, new.company_name, new.quantity, new.price_per_share + (new.fees / new.quantity), new.transaction_date, new.transaction_date);
    end if;
  elsif new.transaction_type = 'SELL' then
    if existing_holding.id is not null then
      new_quantity := existing_holding.quantity - new.quantity;
      if new_quantity <= 0.00000001 then
        delete from public.funda_portfolio_holdings where id = existing_holding.id;
      else
        update public.funda_portfolio_holdings
        set quantity = new_quantity, last_transaction_date = new.transaction_date, updated_at = now()
        where id = existing_holding.id;
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger update_funda_holding_on_transaction
  after insert on public.funda_portfolio_transactions
  for each row when (new.transaction_type in ('BUY', 'SELL'))
  execute function funda_update_holding_from_transaction();

-- Watchlist manager, v2 (migration 008 — supersedes the funda_watchlist
-- table above, kept alongside it since the live code still uses both).
create table if not exists public.funda_watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(200) not null,
  description text,
  is_default boolean default false,
  color varchar(20),
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_funda_watchlist_name_per_user unique (user_id, name)
);

create index if not exists idx_funda_watchlists_user_id on public.funda_watchlists(user_id);
create index if not exists idx_funda_watchlists_default on public.funda_watchlists(user_id, is_default) where is_default = true;
create index if not exists idx_funda_watchlists_sort on public.funda_watchlists(user_id, sort_order);

create table if not exists public.funda_watchlist_items (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references public.funda_watchlists(id) on delete cascade,
  ticker varchar(20) not null,
  company_name varchar(500),
  added_price decimal(20, 4),
  target_price decimal(20, 4),
  target_price_type varchar(10) check (target_price_type in ('BUY', 'SELL', 'ALERT')),
  notes text,
  tags varchar(50)[],
  added_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_funda_item_per_watchlist unique (watchlist_id, ticker)
);

create index if not exists idx_funda_watchlist_items_watchlist_id on public.funda_watchlist_items(watchlist_id);
create index if not exists idx_funda_watchlist_items_ticker on public.funda_watchlist_items(ticker);
create index if not exists idx_funda_watchlist_items_tags on public.funda_watchlist_items using gin(tags);

create table if not exists public.funda_watchlist_snapshots (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references public.funda_watchlists(id) on delete cascade,
  snapshot_date date not null,
  total_value decimal(20, 4) not null,
  avg_change_pct decimal(10, 4),
  num_items integer not null,
  snapshot_data jsonb,
  created_at timestamptz default now(),
  constraint unique_funda_watchlist_snapshot_per_day unique (watchlist_id, snapshot_date)
);

create index if not exists idx_funda_watchlist_snapshots_watchlist_id on public.funda_watchlist_snapshots(watchlist_id);
create index if not exists idx_funda_watchlist_snapshots_date on public.funda_watchlist_snapshots(snapshot_date desc);

alter table public.funda_watchlists enable row level security;
alter table public.funda_watchlist_items enable row level security;
alter table public.funda_watchlist_snapshots enable row level security;

drop policy if exists "Users can view their own watchlists" on public.funda_watchlists;
create policy "Users can view their own watchlists" on public.funda_watchlists for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own watchlists" on public.funda_watchlists;
create policy "Users can create their own watchlists" on public.funda_watchlists for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own watchlists" on public.funda_watchlists;
create policy "Users can update their own watchlists" on public.funda_watchlists for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own watchlists" on public.funda_watchlists;
create policy "Users can delete their own watchlists" on public.funda_watchlists for delete using (auth.uid() = user_id);

drop policy if exists "Users can view items in their watchlists" on public.funda_watchlist_items;
create policy "Users can view items in their watchlists" on public.funda_watchlist_items for select
  using (watchlist_id in (select id from public.funda_watchlists where user_id = auth.uid()));
drop policy if exists "Users can create items in their watchlists" on public.funda_watchlist_items;
create policy "Users can create items in their watchlists" on public.funda_watchlist_items for insert
  with check (watchlist_id in (select id from public.funda_watchlists where user_id = auth.uid()));
drop policy if exists "Users can update items in their watchlists" on public.funda_watchlist_items;
create policy "Users can update items in their watchlists" on public.funda_watchlist_items for update
  using (watchlist_id in (select id from public.funda_watchlists where user_id = auth.uid()));
drop policy if exists "Users can delete items in their watchlists" on public.funda_watchlist_items;
create policy "Users can delete items in their watchlists" on public.funda_watchlist_items for delete
  using (watchlist_id in (select id from public.funda_watchlists where user_id = auth.uid()));

drop policy if exists "Users can view snapshots of their watchlists" on public.funda_watchlist_snapshots;
create policy "Users can view snapshots of their watchlists" on public.funda_watchlist_snapshots for select
  using (watchlist_id in (select id from public.funda_watchlists where user_id = auth.uid()));
drop policy if exists "Users can create snapshots of their watchlists" on public.funda_watchlist_snapshots;
create policy "Users can create snapshots of their watchlists" on public.funda_watchlist_snapshots for insert
  with check (watchlist_id in (select id from public.funda_watchlists where user_id = auth.uid()));

create trigger update_funda_watchlists_timestamp before update on public.funda_watchlists
  for each row execute function public.handle_updated_at();
create trigger update_funda_watchlist_items_timestamp before update on public.funda_watchlist_items
  for each row execute function public.handle_updated_at();

create or replace function funda_ensure_single_default_watchlist()
returns trigger as $$
begin
  if new.is_default = true then
    update public.funda_watchlists set is_default = false
    where user_id = new.user_id and id != new.id and is_default = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_single_default_funda_watchlist
  before insert or update on public.funda_watchlists
  for each row when (new.is_default = true)
  execute function funda_ensure_single_default_watchlist();

-- Auto-create a default watchlist for every new user (fires alongside
-- on_auth_user_created_funda above — Postgres allows multiple triggers on
-- the same event).
create or replace function funda_create_default_watchlist()
returns trigger as $$
begin
  insert into public.funda_watchlists (user_id, name, description, is_default, color)
  values (new.id, 'My Watchlist', 'Default watchlist for tracking stocks', true, '#3b82f6');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists create_default_watchlist_on_funda_user_creation on auth.users;
create trigger create_default_watchlist_on_funda_user_creation
  after insert on auth.users
  for each row execute function funda_create_default_watchlist();

create or replace function funda_update_watchlist_item_count()
returns trigger as $$
begin
  update public.funda_watchlists set updated_at = now()
  where id = coalesce(new.watchlist_id, old.watchlist_id);
  return null;
end;
$$ language plpgsql;

create trigger update_funda_watchlist_on_item_change
  after insert or update or delete on public.funda_watchlist_items
  for each row execute function funda_update_watchlist_item_count();

create or replace view public.funda_watchlist_summary as
select w.id, w.user_id, w.name, w.description, w.is_default, w.color, w.sort_order, w.created_at, w.updated_at,
  count(wi.id) as item_count
from public.funda_watchlists w
left join public.funda_watchlist_items wi on w.id = wi.watchlist_id
group by w.id;
