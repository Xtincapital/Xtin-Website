-- Xtin Journal Supabase schema
-- Run this in the SQL editor of the NEW Xtin Journal Supabase project.

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
on public.journal_user_state
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own journal state" on public.journal_user_state;
create policy "Users can insert their own journal state"
on public.journal_user_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own journal state" on public.journal_user_state;
create policy "Users can update their own journal state"
on public.journal_user_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own journal state" on public.journal_user_state;
create policy "Users can delete their own journal state"
on public.journal_user_state
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists journal_user_state_updated_idx
on public.journal_user_state (user_id, updated_at desc);
