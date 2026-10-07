-- ═══════════════════════════════════════════════════════════════════════
-- COUPONS — admin-made codes, applied at checkout or redeemed for free access.
--
-- Two kinds of code:
--   • discount     — percent_off (1–100) or amount_off_paise (INR orders only),
--                    applied by the server when it creates the Razorpay order
--                    (services/api/modules/coupons/coupons.service.ts). The
--                    browser never decides a price.
--   • free_access  — grants one plan (free_product + free_plan) with no
--                    payment at all, e.g. a month of Market Brief Pro.
--
-- coupon_redemptions has one row per order that used a code (paid orders when
-- they are fulfilled, free-access grants when redeemed). Usage limits count it.
--
-- Written and read only by the backend (service role); RLS has no client policies.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,32}$'),
  description text,
  kind text not null check (kind in ('discount', 'free_access')),
  percent_off integer check (percent_off between 1 and 100),
  amount_off_paise bigint check (amount_off_paise > 0),
  free_product text,                       -- free_access: notes.product of the plan granted
  free_plan text,                          -- free_access: that product's plan / pack / pass id
  products text[] not null default '{}',   -- discount: products it applies to; empty = all
  audience text not null default 'everyone' check (audience in ('everyone', 'new_customers', 'members')),
  max_redemptions integer check (max_redemptions > 0),   -- null = unlimited
  per_user_limit integer not null default 1 check (per_user_limit > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_kind_shape check (
    (kind = 'discount' and free_product is null and free_plan is null
       and ((percent_off is not null) <> (amount_off_paise is not null)))
    or
    (kind = 'free_access' and free_product is not null and free_plan is not null
       and percent_off is null and amount_off_paise is null)
  )
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  code text not null,
  order_id text not null unique,           -- Razorpay order id, or coupon_… for free-access grants
  user_id text,
  auth_id text,
  buyer_email text,                        -- shown to admins on the coupon's usage list
  product text not null,
  list_amount bigint,                      -- smallest unit, before the coupon
  paid_amount bigint,                      -- smallest unit, after the coupon (0 for free access)
  currency text,
  created_at timestamptz not null default now()
);

create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id, created_at desc);
create index if not exists coupon_redemptions_user_idx on public.coupon_redemptions (coupon_id, user_id);
create index if not exists coupon_redemptions_auth_idx on public.coupon_redemptions (coupon_id, auth_id);

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
