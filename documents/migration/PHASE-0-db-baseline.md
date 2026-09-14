# Phase 0 — Capture the authoritative live database schema

**Why:** `backend/database/*.sql` is a set of unordered, partial, hand-written
scripts, and `DATABASE_SCHEMA_README.md` is an AI-generated wishlist (it even
contains leaked tool-call XML) describing tables that may not exist. Every later
DB phase needs a **true** starting point. Output of this step:
`database/migrations/0000_baseline.sql` — an exact dump of the current schema.

Pick **one** of the three methods below.

---

## Method A — Supabase CLI (preferred)

Requires the Supabase CLI and the DB password (Dashboard → Project Settings → Database).

```bash
# 1. Install once
brew install supabase/tap/supabase   # or: npm i -g supabase

# 2. From the repo root
mkdir -p database/migrations

# 3. Link (project ref is znnhguxndectmnhgadga)
supabase link --project-ref znnhguxndectmnhgadga

# 4. Dump schema only (no data), roles + RLS + functions + triggers
supabase db dump --schema public --file database/migrations/0000_baseline.sql
supabase db dump --schema auth   --file database/migrations/0000_baseline_auth.sql   # reference only, do not re-run

# 5. Generated TypeScript types (used from Phase 5 on)
supabase gen types typescript --project-id znnhguxndectmnhgadga > database/types.generated.ts
```

---

## Method B — `pg_dump` with the direct connection string

Connection string: Dashboard → Project Settings → Database → Connection string → URI
(use the **session** pooler or the direct connection; needs the DB password).

```bash
mkdir -p database/migrations

pg_dump "postgresql://postgres:[PASSWORD]@db.znnhguxndectmnhgadga.supabase.co:5432/postgres" \
  --schema=public --schema-only --no-owner --no-privileges \
  --file=database/migrations/0000_baseline.sql

# Also capture, separately, for reference:
pg_dump "postgresql://postgres:[PASSWORD]@db.znnhguxndectmnhgadga.supabase.co:5432/postgres" \
  --schema=public --schema-only --no-owner \
  --section=post-data --file=database/0000_baseline_indexes_constraints.sql
```

---

## Method C — SQL introspection (no CLI, run in the Supabase SQL editor)

If you can't run a dump, run these and paste the results back to Claude. This is a
partial picture (no exact DDL) but enough to reconcile the `.sql` files and README.

```sql
-- Tables + row counts
select
  t.table_name,
  (select count(*) from information_schema.columns c
     where c.table_schema = 'public' and c.table_name = t.table_name) as columns,
  (xpath('/row/c/text()',
     query_to_xml(format('select count(*) as c from public.%I', t.table_name), false, true, ''))
  )[1]::text::bigint as approx_rows
from information_schema.tables t
where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
order by 1;

-- Columns
select table_name, ordinal_position, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- Foreign keys
select
  tc.table_name, kcu.column_name,
  ccu.table_name  as foreign_table,
  ccu.column_name as foreign_column,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
order by 1, 2;

-- Functions
select routine_name, data_type as returns
from information_schema.routines
where routine_schema = 'public'
order by 1;

-- Triggers
select event_object_table as table_name, trigger_name, action_timing, event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
order by 1, 2;

-- RLS: which tables have it enabled
select relname as table_name, relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by 1;

-- RLS policies
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Storage buckets
select id, name, public, created_at from storage.buckets order by 1;

-- Enums / custom types
select t.typname, string_agg(e.enumlabel, ', ' order by e.enumsortorder) as values
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
group by 1 order by 1;

-- Auth users count (sanity)
select count(*) as auth_users from auth.users;
```

---

## After capture

- [ ] Commit `database/migrations/0000_baseline.sql` (and `types.generated.ts` if Method A).
- [ ] Diff it against `backend/database/*.sql` and `DATABASE_SCHEMA_README.md`. In `documents/migration/PLAN.md`, note:
  - which README tables **don't exist** (e.g. `slides`, `videos`, `audit_log`, `gini_*`, `journal_*`, help-center tables — confirm),
  - which live tables have **no** matching `.sql` file,
  - which tables have **RLS disabled** (these matter once browser clients from Gini/Journal arrive).
- [ ] Record row counts for the retire-in-Phase-4 tables (`advisors`, `join_as_advisory_forms`, `chat_conversations`, `chat_messages`, `video_call_sessions`) — if any are non-trivially populated, export them to CSV before Phase 4 drops them.
- [ ] From here on, **all** schema changes are new numbered files in `database/migrations/`. `backend/database/*.sql` becomes read-only history, deleted in Phase 11.
