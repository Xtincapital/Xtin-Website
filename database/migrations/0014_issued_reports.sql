-- ═══════════════════════════════════════════════════════════════════════
-- ISSUED_REPORTS — registry behind the public "Verify a report" page.
--
-- Every Gini / Journal / Fundakamental report is stamped with a report number
-- and a fingerprint (a SHA-256 of its data). When one is generated it is
-- recorded here, so anyone holding a copy can check at /verify that it was
-- really issued, to whom (first name + last initial only) and when.
-- Written and read only by the backend (service role); RLS has no client policies.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.issued_reports (
  report_no text primary key,
  kind text not null check (kind in ('gini', 'journal', 'fundakamental')),
  fingerprint text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  holder_name text not null,            -- "Suraj N." — never the full name or email
  issued_at timestamptz not null default now()
);

create index if not exists issued_reports_user_idx on public.issued_reports (user_id, issued_at desc);

alter table public.issued_reports enable row level security;
