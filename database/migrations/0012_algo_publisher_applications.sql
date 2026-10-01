-- ═══════════════════════════════════════════════════════════════════════
-- ALGO_PUBLISHER_APPLICATIONS — "Apply to Publish Your Algorithm" (AlgoMarket).
--
-- Each submission is stored here so the applicant can come back and see
-- whether it is pending, under review, approved or rejected. Written and
-- read only by the backend (service-role key), scoped to the signed-in user;
-- status changes are made by an admin through the API (or directly here).
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.algo_publisher_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  algo_name text not null,
  strategy_type text not null,
  asset_class text not null,
  expected_price numeric not null check (expected_price >= 0),
  backtest_summary text not null,
  description text not null,
  experience text not null,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected')),
  review_note text,                         -- shown to the applicant (e.g. why it was rejected)
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists algo_publisher_applications_user_idx
  on public.algo_publisher_applications (user_id, created_at desc);
create index if not exists algo_publisher_applications_status_idx
  on public.algo_publisher_applications (status);

alter table public.algo_publisher_applications enable row level security;
-- No client policies: only the backend (service role bypasses RLS) touches this table.
