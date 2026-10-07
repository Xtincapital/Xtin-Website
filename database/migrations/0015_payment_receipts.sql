-- ═══════════════════════════════════════════════════════════════════════
-- PAYMENT_RECEIPTS — one receipt per paid Razorpay order.
--
-- Issued by services/api/modules/payments/receipts.ts right after an order is
-- fulfilled, and listed / downloaded by the buyer on the Billing page.
-- Everything shown on a receipt is copied here when it is issued (item
-- description, amount, buyer email), so a receipt never changes later even if
-- the catalogue or the user's profile does.
--
-- Receipt numbers run in sequence per Indian financial year (April–March,
-- IST): XTN/2026-27/00001, XTN/2026-27/00002, … They are handed out by
-- issue_payment_receipt() below, which is idempotent per order and never
-- leaves a gap when two callers race for the same order.
--
-- On account deletion the row is kept (tax and dispute records) but user_id /
-- auth_id are cleared, so it no longer links to an account.
--
-- Written and read only by the backend (service role); RLS has no client policies.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text not null unique,         -- XTN/2026-27/00001
  order_id text not null unique,           -- Razorpay order id (order_...)
  payment_id text not null,                -- Razorpay payment id (pay_...)
  product text not null,                   -- the order's notes.product, e.g. 'journal_pro_plan'
  description text not null,               -- what the buyer sees, e.g. 'Xtin Journal Pro — Yearly'
  user_id text,                            -- buyer's users.id (or auth id when no users row); null after account deletion
  auth_id text,                            -- buyer's auth.users id; null after account deletion
  buyer_email text,
  amount bigint not null,                  -- smallest currency unit, as charged (GST inclusive)
  currency text not null,
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  paid_at timestamptz not null,
  source text not null default 'live' check (source in ('live', 'backfill')),
  created_at timestamptz not null default now()
);

create index if not exists payment_receipts_user_idx on public.payment_receipts (user_id, paid_at desc);
create index if not exists payment_receipts_auth_idx on public.payment_receipts (auth_id, paid_at desc);
create index if not exists payment_receipts_payment_idx on public.payment_receipts (payment_id);

alter table public.payment_receipts enable row level security;

-- Last receipt number used in each financial year ('2026-27' -> 41).
create table if not exists public.payment_receipt_counters (
  financial_year text primary key,
  last_no integer not null default 0
);

alter table public.payment_receipt_counters enable row level security;

-- Issues the receipt for one order, or returns the one already issued.
-- The counter bump and the insert share one transaction (and the exception
-- block below is a savepoint), so a losing racer's number is rolled back
-- rather than skipped.
create or replace function public.issue_payment_receipt(
  p_order_id text,
  p_payment_id text,
  p_product text,
  p_description text,
  p_user_id text,
  p_auth_id text,
  p_buyer_email text,
  p_amount bigint,
  p_currency text,
  p_paid_at timestamptz,
  p_source text default 'live'
) returns public.payment_receipts
language plpgsql
set search_path = public
as $$
declare
  existing public.payment_receipts;
  issued public.payment_receipts;
  local_paid timestamp := p_paid_at at time zone 'Asia/Kolkata';
  fy_start integer := extract(year from local_paid)::integer - case when extract(month from local_paid) < 4 then 1 else 0 end;
  fy text := fy_start::text || '-' || lpad(((fy_start + 1) % 100)::text, 2, '0');
  next_no integer;
begin
  select * into existing from public.payment_receipts where order_id = p_order_id;
  if found then
    return existing;
  end if;

  begin
    insert into public.payment_receipt_counters as c (financial_year, last_no)
    values (fy, 1)
    on conflict (financial_year) do update set last_no = c.last_no + 1
    returning c.last_no into next_no;

    insert into public.payment_receipts (
      receipt_no, order_id, payment_id, product, description, user_id, auth_id,
      buyer_email, amount, currency, paid_at, source
    ) values (
      'XTN/' || fy || '/' || lpad(next_no::text, 5, '0'),
      p_order_id, p_payment_id, p_product, p_description, p_user_id, p_auth_id,
      p_buyer_email, p_amount, p_currency, p_paid_at, coalesce(p_source, 'live')
    )
    returning * into issued;
    return issued;
  exception when unique_violation then
    -- Another caller issued this order's receipt between our check and insert.
    select * into existing from public.payment_receipts where order_id = p_order_id;
    return existing;
  end;
end;
$$;

revoke all on function public.issue_payment_receipt(text, text, text, text, text, text, text, bigint, text, timestamptz, text) from public, anon, authenticated;
