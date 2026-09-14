-- ═══════════════════════════════════════════════════════════════════════
-- NEWSLETTER_RUNS — shared dedupe/lock table for newsletter generation.
--
-- Replaces the in-memory `cronExecutionStore` in
-- services/api/modules/newsletter/newsletterRunner.ts. In-memory state only
-- works when there is exactly one process; once the newsletter cron moves
-- out of the web process into a separate Render worker (Phase 3's
-- remaining item), the web service (external HTTP trigger from
-- cron-job.org) and the worker (in-process schedule) are two different
-- processes with two different memory spaces — an in-memory lock can't see
-- across them, so the same newsletter could be generated and sent twice.
-- This table is the shared lock both processes check against.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.newsletter_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,                    -- e.g. 'in-process-cron:morning', 'http-trigger'
  status text not null default 'running',  -- running | success | failed
  result jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists newsletter_runs_started_at_idx on public.newsletter_runs (started_at desc);

alter table public.newsletter_runs enable row level security;

-- Only the backend (service-role key) ever touches this table; no client
-- read/write path exists, so no policies are defined — service role
-- bypasses RLS entirely, matching every other backend-only table in this
-- schema.
