-- ═══════════════════════════════════════════════════════════════════════
-- XTIN CAPITAL — Baseline schema for a fresh Supabase project
-- ═══════════════════════════════════════════════════════════════════════
--
-- This is NOT a dump of the old project (its keys leaked and are being
-- abandoned along with its data). It is reverse-engineered from every
-- Supabase query in services/api as of the Phase 5 TypeScript conversion,
-- cross-checked against the hand-written reference scripts already in
-- services/api/database/*.sql (learn_pro_plans.sql, algorithm_subscriptions.sql,
-- newsletter_pro_plans.sql, intern_certificates.sql, user_subscriptions.sql)
-- and the structural hints in DATABASE_SCHEMA_README.md that still matched
-- live code (that doc is otherwise known-unreliable — see documents/AUDIT.md).
--
-- Deliberately excluded: advisors, join_as_advisory_forms, chat_conversations,
-- chat_messages, video_call_sessions, google_meet_* — all retired in Phase 4,
-- no code references them anymore.
--
-- Deliberately excluded: any Gini/Journal/FundaKaMental-specific tables —
-- those products aren't integrated into this repo yet (Phases 8-10).
--
-- One fix applied vs. the reference scripts: user_subscriptions.sql had no
-- UNIQUE constraint matching its own code's `onConflict: "user_id,plan_id"`
-- upsert target — Postgres requires a real unique/exclusion constraint for
-- ON CONFLICT to work at all, so every upsert against that table would have
-- failed at runtime. Added UNIQUE(user_id, plan_id) below.
--
-- Run this once, in order, in the new project's Supabase SQL Editor.
-- Storage: also create a public bucket named `uploads` (Dashboard → Storage
-- → New bucket → Public) — services/api/utils/supabaseStorage.ts defaults
-- to it and there's no SQL equivalent for bucket creation.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. USERS — the app's own profile table, one row per auth.users row.
--    Written explicitly by services/api/modules/auth/user.repository.ts on
--    signup/OAuth-sync; the handle_new_user() trigger below is a backup
--    path only (the app already inserts explicitly and tolerates the
--    insert failing if the trigger beat it to it).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  phone_number text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_auth_id_idx on public.users (auth_id);

alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = auth_id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = auth_id);

-- Backend uses the service-role key for all of this today (bypasses RLS
-- entirely), so the policies above are read-path defense-in-depth for
-- whenever a browser-side Supabase client is introduced (Gini/Journal
-- integration, Phase 8-10) — not required for the app to work now.

-- Auto-create a public.users row when someone signs up via Supabase Auth.
-- Backup path only: services/api explicitly inserts on both the email
-- signup and OAuth-sync flows and only relies on this if that insert fails.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (auth_id, email, first_name, last_name, phone_number)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone_number'
  )
  on conflict (auth_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- 2. ACADEMY COURSES — courses / slides / videos / purchases
--    Live and routed (GET /api/courses/*), matches
--    services/api/modules/academy/course.repository.ts exactly.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  course_id text unique not null,      -- URL-friendly identifier
  title text not null,
  description text,
  price numeric(10,2) not null default 0,
  thumbnail text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  url text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  unique (url),
  unique (course_id, "order")
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  url text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  unique (url),
  unique (course_id, "order")
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  transaction_id text,
  price_paid numeric(10,2),
  payment_method text,
  purchased_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists purchases_user_id_idx on public.purchases (user_id);
create index if not exists purchases_course_id_idx on public.purchases (course_id);

alter table public.courses enable row level security;
alter table public.slides enable row level security;
alter table public.videos enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "Published courses are publicly readable" on public.courses;
create policy "Published courses are publicly readable"
  on public.courses for select
  using (is_published = true);

drop policy if exists "Users can view own purchases" on public.purchases;
create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = (select auth_id from public.users where id = user_id));

-- ─────────────────────────────────────────────────────────────────────────
-- 3. PAYMENT-CRITICAL TABLES — user_subscriptions, algorithm_subscriptions,
--    learn_pro_plans, newsletter_pro_plans
--    All written server-side only, after Razorpay HMAC verification. auth_id
--    is TEXT on the first two and UUID on the last two, matching each
--    table's own pre-existing reference script (services/api/database/*.sql)
--    rather than forcing a consistent type that might behave differently.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.user_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    auth_id text,
    plan_id text not null,
    plan_name text not null,
    products jsonb not null default '[]'::jsonb,
    billing_cycle text not null default 'monthly',
    amount integer not null,
    currency text not null default 'INR',
    activated_at timestamptz not null default now(),
    valid_until timestamptz not null,
    payment_id text not null,
    order_id text not null,
    user_email text,
    phone_number text,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, plan_id)  -- required for ON CONFLICT (user_id,plan_id) upserts; missing in the original reference script
);

create index if not exists idx_user_subs_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subs_auth_id on public.user_subscriptions(auth_id);
create index if not exists idx_user_subs_status on public.user_subscriptions(status);

alter table public.user_subscriptions enable row level security;

drop policy if exists "Users can view own subscriptions" on public.user_subscriptions;
create policy "Users can view own subscriptions"
    on public.user_subscriptions for select
    using (auth_id = auth.uid()::text or user_id = current_setting('app.user_id', true));

drop policy if exists "Service role can manage user subscriptions" on public.user_subscriptions;
create policy "Service role can manage user subscriptions"
    on public.user_subscriptions for all
    using (true) with check (true);

create table if not exists public.algorithm_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    auth_id text,
    algo_name text not null,
    plan_type text not null default 'monthly',
    amount integer not null,
    currency text not null default 'INR',
    activated_at timestamptz not null default now(),
    valid_until timestamptz not null,
    payment_id text not null,
    order_id text not null,
    user_email text,
    tradingview_username text,
    phone_number text,
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(user_id, algo_name)
);

create index if not exists idx_algo_subs_user_id on public.algorithm_subscriptions(user_id);
create index if not exists idx_algo_subs_algo_name on public.algorithm_subscriptions(algo_name);
create index if not exists idx_algo_subs_status on public.algorithm_subscriptions(status);

alter table public.algorithm_subscriptions enable row level security;

drop policy if exists "Users can read own algorithm subscriptions" on public.algorithm_subscriptions;
create policy "Users can read own algorithm subscriptions"
    on public.algorithm_subscriptions for select
    using (auth_id = auth.uid()::text or user_id = current_setting('app.user_id', true));

drop policy if exists "Service role can manage algorithm subscriptions" on public.algorithm_subscriptions;
create policy "Service role can manage algorithm subscriptions"
    on public.algorithm_subscriptions for all
    using (true) with check (true);

create table if not exists public.learn_pro_plans (
  user_id text primary key,
  auth_id uuid,
  plan_id text not null,             -- learn_pro_monthly | learn_pro_yearly
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

create index if not exists learn_pro_plans_auth_id_idx on public.learn_pro_plans (auth_id);

alter table public.learn_pro_plans enable row level security;

drop policy if exists "Users can view own learn plan" on public.learn_pro_plans;
create policy "Users can view own learn plan"
  on public.learn_pro_plans for select
  using (auth.uid() = auth_id);

create table if not exists public.newsletter_pro_plans (
  user_id text primary key,
  auth_id uuid,
  plan_id text not null,             -- newsletter_pro_monthly | newsletter_pro_yearly
  billing text,
  currency text default 'INR',
  region text,
  markets text default 'IN',         -- csv: IN,US,GLOBAL
  activated_at timestamptz not null default now(),
  valid_until timestamptz not null,
  payment_id text,
  order_id text,
  user_email text,
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_pro_plans_auth_id_idx on public.newsletter_pro_plans (auth_id);
create index if not exists newsletter_pro_plans_email_idx on public.newsletter_pro_plans (user_email);

alter table public.newsletter_pro_plans enable row level security;

drop policy if exists "Users can view own newsletter plan" on public.newsletter_pro_plans;
create policy "Users can view own newsletter plan"
  on public.newsletter_pro_plans for select
  using (auth.uid() = auth_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. ACADEMY PROGRESS — user_lesson_progress
--    matches services/api/modules/academy/progress.repository.ts exactly.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  module_slug text not null,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, module_slug, lesson_slug)
);

create index if not exists user_lesson_progress_user_id_idx on public.user_lesson_progress (user_id);

alter table public.user_lesson_progress enable row level security;

drop policy if exists "Service role can manage lesson progress" on public.user_lesson_progress;
create policy "Service role can manage lesson progress"
  on public.user_lesson_progress for all
  using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. INTERN CERTIFICATES — verbatim from the existing, already-correct
--    services/api/database/intern_certificates.sql +
--    intern_certificates_migration.sql, unchanged.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists intern_certificates (
    id uuid primary key default gen_random_uuid(),
    certificate_id text not null unique,                       -- e.g. XC-2026-A8F9K
    intern_name text not null check (length(trim(intern_name)) > 0),
    intern_role text not null check (length(trim(intern_role)) > 0),
    start_date date not null,
    end_date date not null,
    issued_at timestamptz default now(),
    is_revoked boolean not null default false,
    last_verified_at timestamptz default null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    constraint check_dates check (end_date >= start_date),
    constraint check_certificate_id_format
        check (certificate_id ~ '^XC-\d{4}-[A-Z0-9]{5}$')
);

create index if not exists idx_intern_certificates_certificate_id
    on intern_certificates(certificate_id);
create index if not exists idx_intern_certificates_issued_at
    on intern_certificates(issued_at desc);
create index if not exists idx_intern_certificates_not_revoked
    on intern_certificates(certificate_id)
    where is_revoked = false;

alter table intern_certificates enable row level security;

drop policy if exists "Public certificate verification" on intern_certificates;
create policy "Public certificate verification" on intern_certificates
    for select using (is_revoked = false);

drop policy if exists "Admin full access to certificates" on intern_certificates;
create policy "Admin full access to certificates" on intern_certificates
    for all using (
        auth.role() = 'service_role'
        or auth.jwt() ->> 'role' = 'admin'
    );

drop policy if exists "Service role full access" on intern_certificates;
create policy "Service role full access" on intern_certificates
    for all using (auth.role() = 'service_role');

create or replace function generate_certificate_id()
returns text
language plpgsql
as $$
declare
    year_part text;
    random_part text;
    new_id text;
    done boolean;
begin
    year_part := extract(year from now())::text;
    done := false;

    while not done loop
        random_part := '';
        for i in 1..5 loop
            random_part := random_part ||
                substr(
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                    floor(random() * 36)::int + 1,
                    1
                );
        end loop;

        new_id := 'XC-' || year_part || '-' || random_part;

        if not exists (select 1 from intern_certificates where certificate_id = new_id) then
            done := true;
        end if;
    end loop;

    return new_id;
end;
$$;

create or replace function update_intern_certificates_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_intern_certificates_updated_at on intern_certificates;
create trigger trigger_intern_certificates_updated_at
    before update on intern_certificates
    for each row
    execute function update_intern_certificates_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- 6. HELP / SUPPORT — support_tickets
--    matches services/api/modules/help/help.repository.ts +
--    POST /api/help/contact.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) >= 2),
  email text not null,
  phone text,
  subject text not null check (length(trim(subject)) >= 5),
  message text not null check (length(trim(message)) >= 10),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "Public can submit support tickets" on public.support_tickets;
create policy "Public can submit support tickets"
  on public.support_tickets for insert
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. HOME PAGE METRICS — single-row stats table
--    matches services/api/modules/metrics/metric.repository.ts. Note: the
--    controller also writes a stray `metric: "home_page_metrics"` field on
--    create — column included so that insert doesn't fail, though it isn't
--    otherwise read anywhere (worth cleaning up separately, not a schema
--    concern).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.home_page_metrics (
  id uuid primary key default gen_random_uuid(),
  trading_volume numeric not null,
  active_traders integer not null,
  uptime numeric not null,
  avg_latency numeric not null,
  metric text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_page_metrics enable row level security;

drop policy if exists "Metrics are publicly readable" on public.home_page_metrics;
create policy "Metrics are publicly readable"
  on public.home_page_metrics for select
  using (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 8. NEWSLETTER — subscriptions (subscriber list), indian_finance_newsletter
--    (generated editions), newsletters (generic/legacy, no active writer)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  markets text default 'IN',   -- csv: IN,US,GLOBAL
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Public can subscribe" on public.subscriptions;
create policy "Public can subscribe"
  on public.subscriptions for insert
  with check (true);

-- Generated newsletter editions. 60 columns because the generator writes a
-- fixed 5-heading x 5-subheading grid per edition (see
-- services/api/utils/newsletterGeneratorSimple.ts) rather than a normalized
-- content table — matching that as-is, not redesigning it here.
create table if not exists public.indian_finance_newsletter (
  id uuid primary key default gen_random_uuid(),
  title text,
  edition text,     -- pre_market | post_market
  market text,       -- IN | US | GLOBAL
  heading_1 text, heading_1_subheading_1 text, heading_1_subheading_1_content text,
                     heading_1_subheading_2 text, heading_1_subheading_2_content text,
                     heading_1_subheading_3 text, heading_1_subheading_3_content text,
                     heading_1_subheading_4 text, heading_1_subheading_4_content text,
                     heading_1_subheading_5 text, heading_1_subheading_5_content text,
  heading_2 text, heading_2_subheading_1 text, heading_2_subheading_1_content text,
                     heading_2_subheading_2 text, heading_2_subheading_2_content text,
                     heading_2_subheading_3 text, heading_2_subheading_3_content text,
                     heading_2_subheading_4 text, heading_2_subheading_4_content text,
                     heading_2_subheading_5 text, heading_2_subheading_5_content text,
  heading_3 text, heading_3_subheading_1 text, heading_3_subheading_1_content text,
                     heading_3_subheading_2 text, heading_3_subheading_2_content text,
                     heading_3_subheading_3 text, heading_3_subheading_3_content text,
                     heading_3_subheading_4 text, heading_3_subheading_4_content text,
                     heading_3_subheading_5 text, heading_3_subheading_5_content text,
  heading_4 text, heading_4_subheading_1 text, heading_4_subheading_1_content text,
                     heading_4_subheading_2 text, heading_4_subheading_2_content text,
                     heading_4_subheading_3 text, heading_4_subheading_3_content text,
                     heading_4_subheading_4 text, heading_4_subheading_4_content text,
                     heading_4_subheading_5 text, heading_4_subheading_5_content text,
  heading_5 text, heading_5_subheading_1 text, heading_5_subheading_1_content text,
                     heading_5_subheading_2 text, heading_5_subheading_2_content text,
                     heading_5_subheading_3 text, heading_5_subheading_3_content text,
                     heading_5_subheading_4 text, heading_5_subheading_4_content text,
                     heading_5_subheading_5 text, heading_5_subheading_5_content text,
  created_at timestamptz not null default now()
);

create index if not exists indian_finance_newsletter_created_at_idx
  on public.indian_finance_newsletter (created_at desc);

alter table public.indian_finance_newsletter enable row level security;

drop policy if exists "Newsletters are publicly readable" on public.indian_finance_newsletter;
create policy "Newsletters are publicly readable"
  on public.indian_finance_newsletter for select
  using (true);

-- Generic newsletters table: reachable via GET /api/newsletters(/:id) but
-- nothing in the app currently writes to it (createNewsletter exists in
-- the repository layer but is unused/dead). Minimal shape so those GET
-- routes don't error against a missing table; not load-bearing.
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  created_at timestamptz not null default now()
);

alter table public.newsletters enable row level security;

drop policy if exists "Newsletters table is publicly readable" on public.newsletters;
create policy "Newsletters table is publicly readable"
  on public.newsletters for select
  using (true);
