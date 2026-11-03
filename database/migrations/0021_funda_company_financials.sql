-- ═══════════════════════════════════════════════════════════════════════
-- FUNDAKAMENTAL COMPANY FINANCIALS — saved yearly/quarterly statements.
--
-- The "Company numbers" page (stocks.controller.ts getStockFinancials) reads
-- these first, so a Yahoo rate-limit on Render never blanks a company that
-- was loaded before. Rows are refreshed from Yahoo when older than a day and
-- kept (served as "last saved") if Yahoo is unavailable.
--
-- Written and read only by the backend (service role); RLS has no client policies.
-- The app works without this table (it just won't remember statements).
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.funda_company_financials (
  ticker text primary key,
  annual jsonb not null default '[]'::jsonb,
  quarterly jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);

alter table public.funda_company_financials enable row level security;
