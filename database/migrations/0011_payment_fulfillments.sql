-- ═══════════════════════════════════════════════════════════════════════
-- PAYMENT_FULFILLMENTS — one row per paid Razorpay order.
--
-- services/api/modules/payments/fulfillment.ts claims a row here BEFORE
-- granting anything for an order. Two paths can grant the same order — the
-- product's /verify endpoint (browser reports success) and the Razorpay
-- webhook (Razorpay reports success, even if the browser never did) — and
-- either can be retried or replayed. The primary key on order_id makes sure
-- exactly one of them grants, once; the rest read `result`.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.payment_fulfillments (
  order_id text primary key,               -- Razorpay order id (order_...)
  payment_id text not null,                -- Razorpay payment id (pay_...)
  product text not null,                   -- the order's notes.product, e.g. 'journal_pro_plan'
  user_id text,                            -- buyer's users.id (or auth id when no users row)
  amount bigint,                           -- smallest currency unit, as charged
  currency text,
  status text not null default 'processing' check (status in ('processing', 'fulfilled')),
  source text not null,                    -- 'verify' | 'webhook' — whichever got there first
  result jsonb,                            -- what the grant returned, replayed to later callers
  claimed_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

create index if not exists payment_fulfillments_payment_id_idx on public.payment_fulfillments (payment_id);
create index if not exists payment_fulfillments_user_id_idx on public.payment_fulfillments (user_id);

alter table public.payment_fulfillments enable row level security;

-- Only the backend (service-role key) ever touches this table; no client
-- read/write path exists, so no policies are defined — service role
-- bypasses RLS entirely, matching every other backend-only table in this
-- schema.
