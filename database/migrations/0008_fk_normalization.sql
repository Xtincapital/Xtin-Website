-- Phase 11b — FK/user_id-type normalization. Run after 0007.
--
-- ═══════════════════════════════════════════════════════════════════════
-- WHY THIS IS NARROWER THAN IT COULD BE — a real ambiguity found while
-- investigating "add a real FK to user_id", not assumed
-- ═══════════════════════════════════════════════════════════════════════
-- `user_subscriptions`/`algorithm_subscriptions`/`user_entitlements`/
-- `user_lesson_progress` all have a `user_id text` column with no FK. The
-- obvious fix looks like: cast to uuid, add `references public.users(id)`.
-- That would be WRONG — read directly against `middlewares/auth.ts`:
--   req.user.userId = customUser?.id || user.id
-- For a session authenticated via a raw Supabase token whose owner has no
-- row in `public.users` yet (the legacy profile table), `userId` falls
-- back to the Supabase AUTH uid itself, not a `public.users.id`. So
-- `user_id` in these four tables is not one ID space — it's *either* a
-- `public.users.id` *or* an `auth.users.id`, depending on signup path and
-- timing, and a hard FK to `public.users(id)` would incorrectly reject
-- future legitimate writes for the second case (silently breaking a
-- payment-verification write, which is worse than the current unconstrained
-- state). Left `user_id` as `text`, unconstrained, on all four tables —
-- documented here and in database/SCHEMA.md instead of forcing a
-- constraint that doesn't match the column's real invariant.
--
-- What IS safe and IS done below: every one of these tables also has (or,
-- for two of them, gets) an `auth_id` column that is unambiguously a raw
-- Supabase `auth.users.id` — checked directly against every write site
-- (`entitlement.repository.ts`, `algorithm.controller.ts`,
-- `subscriptionPlan.controller.ts`: always `String(authId)` or `null`,
-- never anything else). Converting THAT column to `uuid` + a real FK is
-- unambiguously correct, and is what this migration actually does.
-- `user_lesson_progress` has no `auth_id` column at all (never needed one
-- before this) — left alone rather than growing new schema surface as
-- part of a hardening pass; its RLS policy (0007) already correctly scopes
-- through `public.users` by join instead.
--
-- ═══════════════════════════════════════════════════════════════════════
-- FIX (2026-09-19): the first version of this file failed on a live run
-- with `cannot alter type of a column used in a policy definition` —
-- Postgres won't let you ALTER COLUMN TYPE on a column an existing RLS
-- policy's USING clause references, even implicitly via a cast
-- (`auth_id = auth.uid()::text`, created by 0007). Fixed by dropping each
-- affected policy first, doing the type change + FK add, then recreating
-- the policy — now comparing `auth_id` directly against `auth.uid()`
-- (both real uuid, no `::text` cast needed anymore, which is itself a
-- small correctness improvement over 0007's text-comparison version).
-- 0007 itself needs no changes and does not need to be re-run — this file
-- fully supersedes what it created for these 3 policies.
-- ═══════════════════════════════════════════════════════════════════════

begin;

-- user_subscriptions.auth_id: text -> uuid + FK. Safe cast: every write
-- site sets this to either `String(authId)` (a real Supabase uid) or null.
-- Drop the policy that depends on this column's current type first.
drop policy if exists "Users can view own subscriptions" on public.user_subscriptions;
alter table public.user_subscriptions
    alter column auth_id type uuid using auth_id::uuid;
alter table public.user_subscriptions
    add constraint user_subscriptions_auth_id_fkey
    foreign key (auth_id) references auth.users(id) on delete set null;
create policy "Users can view own subscriptions"
    on public.user_subscriptions for select
    using (auth_id = auth.uid());

-- algorithm_subscriptions.auth_id: same.
drop policy if exists "Users can read own algorithm subscriptions" on public.algorithm_subscriptions;
alter table public.algorithm_subscriptions
    alter column auth_id type uuid using auth_id::uuid;
alter table public.algorithm_subscriptions
    add constraint algorithm_subscriptions_auth_id_fkey
    foreign key (auth_id) references auth.users(id) on delete set null;
create policy "Users can read own algorithm subscriptions"
    on public.algorithm_subscriptions for select
    using (auth_id = auth.uid());

-- user_entitlements.auth_id: same.
drop policy if exists "Users can view own entitlements" on public.user_entitlements;
alter table public.user_entitlements
    alter column auth_id type uuid using auth_id::uuid;
alter table public.user_entitlements
    add constraint user_entitlements_auth_id_fkey
    foreign key (auth_id) references auth.users(id) on delete set null;
create policy "Users can view own entitlements"
    on public.user_entitlements for select
    using (auth_id = auth.uid());

-- learn_pro_plans.auth_id / newsletter_pro_plans.auth_id are already
-- `uuid` typed (see 0000_baseline.sql) — just missing the FK constraint.
-- No type change, so no policy-drop needed here.
alter table public.learn_pro_plans
    add constraint learn_pro_plans_auth_id_fkey
    foreign key (auth_id) references auth.users(id) on delete set null;

alter table public.newsletter_pro_plans
    add constraint newsletter_pro_plans_auth_id_fkey
    foreign key (auth_id) references auth.users(id) on delete set null;

commit;
