-- ═══════════════════════════════════════════════════════════════════════
-- Backtest Phase 2 — saved strategies are versioned, never overwritten.
--
-- The current version of a strategy stays in backtest_strategies.definition
-- (a Strategy Spec v1 object for strategies saved through /api/v1; older rows
-- keep their legacy definition). Every save through /api/v1 also appends the
-- full spec here, so earlier versions — and the runs made with them — stay
-- reproducible.
--
-- NOT applied automatically — run in the Supabase SQL editor. Before it is
-- applied the API still saves strategies (current version only) and reports
-- version 1; history starts from the first save after it is applied.
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.backtest_strategy_versions (
  strategy_id uuid not null references public.backtest_strategies(id) on delete cascade,
  version integer not null check (version > 0),
  spec jsonb not null,
  spec_hash text not null,
  created_at timestamptz not null default now(),
  primary key (strategy_id, version)
);

alter table public.backtest_strategy_versions enable row level security;

drop policy if exists "Users can view own backtest strategy versions" on public.backtest_strategy_versions;
create policy "Users can view own backtest strategy versions" on public.backtest_strategy_versions for select
  using (exists (select 1 from public.backtest_strategies s where s.id = strategy_id and s.user_id = auth.uid()));
