-- ═══════════════════════════════════════════════════════════════════════
-- BROKER SYNC — pull a customer's executed trades from their broker (XTS)
-- into the Journal instead of making them upload statements.
--
-- Shape (services/api/modules/journal/broker):
--   • broker_links     — which Xtin account owns which broker client code, and
--                        the consent they gave. A link starts 'pending' and is
--                        only read once it is 'active' (ownership verified).
--   • broker_fills     — every execution the broker has reported, kept raw.
--                        Journal trades are worked out from these, so the pairing
--                        can be re-run at any time (late or missing days fix
--                        themselves).
--   • broker_sync_runs — a lock and audit trail for sync runs, like newsletter_runs.
--   • journal_trades.source / external_id — mark synced trades and make a
--                        re-run insert each one only once.
--
-- Written and read only by the backend (service role); the three new tables have
-- RLS on and no client policies. Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.broker_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker text not null default 'xts',
  client_code text not null check (length(trim(client_code)) between 1 and 40),
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  consent_version text not null,           -- which wording the customer accepted
  consent_at timestamptz not null,
  verified_at timestamptz,                 -- set when ownership of the client code is confirmed
  verification_method text,
  -- Positions the customer already held when they linked (from the broker's holdings),
  -- so a later sale can be matched to them. Array of fill-shaped objects.
  opening_positions jsonb not null default '[]'::jsonb,
  last_synced_at timestamptz,
  last_sync_status text check (last_sync_status in ('success', 'failed')),
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One live link per customer, and a client code belongs to one Xtin account at a time.
create unique index if not exists broker_links_user_live_idx
  on public.broker_links (user_id, broker) where status <> 'revoked';
create unique index if not exists broker_links_code_live_idx
  on public.broker_links (broker, client_code) where status <> 'revoked';

alter table public.broker_links enable row level security;

create table if not exists public.broker_fills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker text not null default 'xts',
  client_code text not null,
  execution_id text not null,              -- the broker's id for this execution
  trading_symbol text not null,
  exchange_segment text,
  exchange_instrument_id bigint,
  product_type text,                       -- MIS | NRML | CNC
  side text not null check (side in ('buy', 'sell')),
  quantity numeric not null check (quantity > 0),
  price numeric not null check (price >= 0),
  charges numeric check (charges >= 0),    -- brokerage and taxes for this execution, when known
  traded_at timestamptz not null,
  raw jsonb,                               -- the broker's row as received
  created_at timestamptz not null default now(),
  unique (broker, client_code, execution_id)
);

create index if not exists broker_fills_user_client_time_idx
  on public.broker_fills (user_id, client_code, traded_at);

alter table public.broker_fills enable row level security;

create table if not exists public.broker_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,                    -- e.g. 'http-trigger', 'user'
  status text not null default 'running',  -- running | success | failed
  result jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists broker_sync_runs_started_at_idx
  on public.broker_sync_runs (started_at desc);

alter table public.broker_sync_runs enable row level security;

-- Where a trade came from, and the id that makes a synced trade unique.
-- Users can't set these: the trade API's validators drop unknown fields.
alter table public.journal_trades add column if not exists source text not null default 'manual';
alter table public.journal_trades add column if not exists external_id text;

-- Not a partial index: the sync inserts with ON CONFLICT (user_id, external_id), which
-- needs a plain unique index. Hand-entered trades have a null external_id, and nulls
-- never collide, so they are unaffected.
create unique index if not exists journal_trades_external_id_idx
  on public.journal_trades (user_id, external_id);
