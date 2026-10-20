-- ═══════════════════════════════════════════════════════════════════════
-- Backtest Phase 1 — reproducible runs and per-run metering.
--
-- backtest_runs gains the Strategy Spec v1 a run used, its fingerprint
-- (SHA-256 of the normalised spec), and the engine and data versions, so any
-- past run can be re-run to the same numbers.
--
-- backtest_run_meter logs the cost drivers of EVERY run (chat runs too, and
-- anonymous ones), so pricing can come from real numbers later: compute time,
-- bars, data lane and channel. No strategy text, no conversation text.
--
-- NOT applied automatically — run in the Supabase SQL editor. The backend
-- works before it is applied: run storage falls back to the old columns and
-- metering is skipped (one log line), so deploy order doesn't matter.
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.backtest_runs add column if not exists spec jsonb;
alter table public.backtest_runs add column if not exists spec_hash text;
alter table public.backtest_runs add column if not exists engine_version text;
alter table public.backtest_runs add column if not exists data_version text;
create index if not exists backtest_runs_spec_hash_idx on public.backtest_runs (spec_hash);

create table if not exists public.backtest_run_meter (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,  -- null for anonymous visitors
  channel text not null,          -- web_chat | web_run (later: api | mcp)
  tier text,                      -- anon | free | pro
  ok boolean not null,
  spec_hash text,
  engine_version text,
  data_lane text,                 -- synthetic | yahoo (later: licensed vendor / broker)
  data_version text,
  timeframe text,
  bars integer,
  trades integer,
  compute_ms integer,             -- engine time only, not data fetch
  fetch_ms integer,               -- market-data fetch (cache hit ≈ 0)
  credits integer not null default 1
);
create index if not exists backtest_run_meter_created_idx on public.backtest_run_meter (created_at desc);
create index if not exists backtest_run_meter_user_idx on public.backtest_run_meter (user_id, created_at desc);

-- Service role only (no policies): the backend writes, admins read via SQL.
alter table public.backtest_run_meter enable row level security;
