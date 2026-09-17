# Document 05 - Backend Schema and Auth Architecture

## App Name

Xtin Journal

## Purpose

This document defines how Xtin Journal stores, secures, and accesses user data. It documents the current v1 Supabase schema and the recommended normalized schema for future migrations.

## Current Storage Model

Xtin Journal currently uses a hybrid storage model:

- Browser local storage for local/guest mode.
- Supabase Auth for signed-in users.
- Supabase PostgreSQL table `journal_user_state` for cloud-synced user state.
- FastAPI in-memory stores for transient subscription/order data, with AI wallet persisted to Supabase when configured.

For v1, the canonical Supabase table is `public.journal_user_state`.

## Auth Provider

Supabase Auth.

Supported v1 methods:

- Email/password sign up.
- Email/password sign in.
- Sign out.
- User metadata update for profile fields such as full name and age.

Auth identity source:

- Supabase user ID: `auth.users.id`.
- Frontend reads the active Supabase session with the Supabase JS client.
- Backend service-role access is used only for server-side wallet persistence.

## Table: `journal_user_state`

Current production table for cloud-synced journal state.

| Column | Type | Required | Description |
|---|---|---|---|
| `user_id` | `uuid` | Yes | FK to `auth.users(id)` |
| `state_key` | `text` | Yes | Name of the saved state slice |
| `payload` | `jsonb` | Yes | State payload for that key |
| `updated_at` | `timestamptz` | Yes | Last update timestamp |

Primary key:

- `(user_id, state_key)`

Foreign key:

- `journal_user_state.user_id -> auth.users.id`
- `on delete cascade`

Index:

- `journal_user_state_updated_idx` on `(user_id, updated_at desc)`

Required state keys:

- `trades`
- `goals`
- `custom_strategies`
- `settings`
- `subscription`
- `invoices`
- `ai_usage`
- `drafts`
- `ai_wallet`

## Current State Payloads

### `trades`

Stores the user's trade journal array.

Expected trade fields:

- `id`
- `date`
- `entryTime`
- `exitTime`
- `type`
- `market`
- `asset`
- `currency`
- `quantity`
- `entryPrice`
- `targetPrice`
- `stopLoss`
- `exitPrice`
- `brokerage`
- `strategy`
- `margin`
- `buySell`
- `pnl`
- `emotion`
- `notes`
- `tags`
- `strikePrice`
- `optionType`
- `underlyingPrice`
- `impliedVolatility`
- `daysToExpiry`
- `greeks`

### `goals`

Stores trading goals.

Expected goal fields:

- `id`
- `title`
- `metric`
- `timeframe`
- `target`
- `createdAt`

### `custom_strategies`

Stores user-defined strategy names.

Expected payload:

- Array of strings.

### `settings`

Stores user preferences.

Expected fields:

- `selectedCurrency`
- `selectedTimeZone`
- `activeTab`
- `hasSeenWelcome`

### `subscription`

Stores local subscription-style state if present.

Expected fields:

- `plan`
- `status`
- `paymentMethod`
- `startedAt`
- `renewalAt`
- `amountInr`

### `invoices`

Stores local invoice-style records if present.

Expected fields:

- `id`
- `issueDate`
- `dueDate`
- `amountInr`
- `plan`
- `paymentMethod`
- `status`

### `ai_usage`

Stores AI usage metadata.

Expected fields:

- `usage`
- `resetDate`
- `paymentMethod`

### `drafts`

Stores unsaved form drafts.

Expected fields:

- `trade`
- `quickTrade`
- `goal`

### `ai_wallet`

Stores AI token wallet.

Expected fields:

- `user_id`
- `token_balance`
- `tokens_purchased`
- `tokens_used`
- `credited_payments`
- `last_recharge`
- `updated_at`

## Row Level Security

RLS must be enabled on `public.journal_user_state`.

Policies:

- Authenticated users can select only rows where `auth.uid() = user_id`.
- Authenticated users can insert only rows where `auth.uid() = user_id`.
- Authenticated users can update only rows where `auth.uid() = user_id`.
- Authenticated users can delete only rows where `auth.uid() = user_id`.

Guests:

- Guests do not read or write Supabase rows.
- Guest/local mode uses browser storage only.

Service role:

- Backend may use `SUPABASE_SERVICE_ROLE_KEY` for server-side wallet persistence.
- Service role key must never be exposed to frontend code.

Recommended SQL pattern:

```sql
alter table public.journal_user_state enable row level security;

create policy "Users can read their own journal state"
on public.journal_user_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own journal state"
on public.journal_user_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own journal state"
on public.journal_user_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own journal state"
on public.journal_user_state
for delete
to authenticated
using ((select auth.uid()) = user_id);
```

## User Roles

### Guest

- No Supabase session.
- Can use local journal features.
- Can add, edit, import, export, backup, and restore local trades.
- Cannot sync cloud state.

### User

- Authenticated Supabase user.
- Can read/write only their own `journal_user_state` rows.
- Can sync journal state to cloud.
- Can use AI wallet linked to their user ID.

### Admin

- Not implemented in v1.
- Future admin access must use separate policies or server-side admin tools.
- Admin privileges must not be inferred from frontend state.

## Relationships

Current v1 relationship:

- `auth.users.id` one-to-many `journal_user_state.user_id`
- One user has many state rows, one per `state_key`.

Current payload relationships are embedded in JSON:

- Trades are embedded in `payload` where `state_key = 'trades'`.
- Goals are embedded in `payload` where `state_key = 'goals'`.
- AI wallet is embedded in `payload` where `state_key = 'ai_wallet'`.

## Sensitive Fields

Never store these in frontend-readable state:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RAZORPAY_KEY_SECRET`
- Raw payment credentials
- Card, UPI, bank, or saved payment instrument data

Sensitive or semi-sensitive user data:

- Trade history
- P&L
- Strategy notes
- Emotional/psychology notes
- AI coach conversations
- Payment IDs
- User email and profile metadata

Payment data rules:

- Store Razorpay order/payment IDs only for reconciliation and duplicate-credit prevention.
- Do not store card details.
- Do not trust frontend payment success alone.
- Credit AI tokens only after backend signature verification.

AI data rules:

- Store AI prompts/responses only if the user explicitly needs history or auditability.
- If stored, AI conversations must be user-owned and protected by RLS.
- Avoid storing full raw prompts when compact summaries are sufficient.
- Do not store Claude API keys, response headers, or provider secrets.

Retention rules:

- Trade records should remain until the user deletes them.
- Import source files should not be retained in v1.
- Payment IDs should be retained for duplicate-credit prevention and reconciliation.
- AI wallet transaction records should be append-only once normalized.

## File Storage

No persistent file storage is required in v1.

Current import behavior:

- CSV/XLS/XLSX/PDF files are parsed during import.
- Parsed trades are stored as journal data.
- Original uploaded files are not stored.

Future storage recommendations:

- Supabase Storage bucket: `journal-imports`
- Path format: `/imports/{user_id}/{import_id}/{filename}`
- Supabase Storage bucket: `trade-screenshots`
- Path format: `/screenshots/{user_id}/{trade_id}/{filename}`
- Users may only read/write files under their own `user_id` prefix.

## Webhooks and Event Triggers

Current v1:

- No database triggers.
- No Razorpay webhook endpoint is required for the current checkout verification flow.

Recommended future:

- Razorpay webhook for payment captured/failed events.
- Trigger or scheduled job for wallet reconciliation.
- Trigger to update `updated_at` on normalized tables.
- Optional audit log event for payment credit, wallet deduction, and trade import.

Recommended trigger for normalized tables:

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

## API Endpoints Touching Data

### Supabase Frontend State

- `loadState(key)`
- `loadAllState()`
- `saveState(key, payload)`
- `saveManyState(entries)`

### FastAPI

- `POST /api/v2/import-trades`
- `GET /api/v2/profile?user_id=...`
- `POST /api/v2/analyze`
- `GET /api/v2/behavioral-alerts?user_id=...`
- `GET /api/v2/ai/plans`
- `GET /api/v2/ai/wallet?user_id=...`
- `POST /api/v2/ai/razorpay/order`
- `POST /api/v2/ai/razorpay/verify`
- `POST /api/v2/pre-trade-check`
- `POST /api/v2/weekly-review`
- `POST /api/v2/chat`
- `GET /api/v2/subscription?user_id=...`
- `POST /api/v2/subscription`
- `PATCH /api/v2/subscription/cancel`
- `GET /api/v2/invoices?user_id=...`

## Recommended Normalized Schema

The current JSONB state table is acceptable for v1. When analytics, reporting, imports, or multi-device conflict resolution become more complex, migrate toward normalized tables.

Recommended shared conventions:

- Primary keys should be `uuid` generated by the database.
- User-owned rows must include `user_id uuid not null references auth.users(id) on delete cascade`.
- Tables with updates should include `created_at timestamptz not null default now()` and `updated_at timestamptz not null default now()`.
- Money and prices should use `numeric`, not floating-point types.
- Token counts should use `bigint`.
- Flexible provider metadata should use `jsonb`.
- Use lowercase snake_case column names.

Recommended extensions:

```sql
create extension if not exists pgcrypto;
```

Common check constraints:

- Currency codes should be 3-letter uppercase ISO-style strings where possible.
- `buy_sell` should be `Buy` or `Sell`.
- `option_type` should be `Call`, `Put`, or null.
- Payment status should be one of `created`, `paid`, `failed`, `credited`, `cancelled`.
- Wallet transaction type should be one of `credit`, `debit`, `adjustment`.

### Table: `profiles`

| Column | Type | Description |
|---|---|---|
| `user_id` | `uuid primary key` | FK to `auth.users(id)` |
| `full_name` | `text` | Display name |
| `age` | `integer` | Optional profile age |
| `default_currency` | `text` | Default currency code |
| `default_time_zone` | `text` | Default timezone |
| `created_at` | `timestamptz` | Creation timestamp |
| `updated_at` | `timestamptz` | Update timestamp |

Relationship:

- `profiles.user_id -> auth.users.id`

Notes:

- Profile data duplicates selected Supabase user metadata only when needed for app queries.
- Do not store authentication secrets or password data here.

### Table: `trades`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Trade ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `date` | `date not null` | Trade date |
| `entry_time` | `time` | Entry time |
| `exit_time` | `time` | Exit time |
| `time_zone` | `text` | Trade timezone |
| `trading_type` | `text` | Intraday, swing, positional, etc. |
| `market` | `text` | Equity, futures, options, crypto, etc. |
| `asset` | `text not null` | Symbol or asset name |
| `currency` | `text not null default 'INR'` | Currency code |
| `quantity` | `numeric not null` | Position size |
| `entry_price` | `numeric not null` | Entry price |
| `target_price` | `numeric` | Target price |
| `stop_loss` | `numeric` | Stop loss |
| `exit_price` | `numeric not null` | Exit price |
| `brokerage` | `numeric default 0` | Fees/charges |
| `strategy` | `text` | Strategy/setup |
| `margin` | `numeric` | Capital/margin used |
| `buy_sell` | `text` | Buy/Sell |
| `pnl` | `numeric not null` | Realized P&L |
| `emotion` | `text` | Psychology label |
| `notes` | `text` | Journal notes |
| `tags` | `text[]` | Tags |
| `created_at` | `timestamptz` | Creation timestamp |
| `updated_at` | `timestamptz` | Update timestamp |

Indexes:

- `(user_id, date desc)`
- `(user_id, strategy)`
- `(user_id, market)`
- `(user_id, pnl)`

Constraints:

- `quantity > 0`
- `buy_sell in ('Buy', 'Sell')`

Notes:

- `pnl` should be stored for fast analytics, even if it can be recalculated.
- If formula rules change, add a recalculation migration rather than silently changing historical P&L.
- `tags` may remain `text[]` for fast filtering; use a normalized tags table only if tag analytics becomes complex.

### Table: `trade_options`

| Column | Type | Description |
|---|---|---|
| `trade_id` | `uuid primary key` | FK to `trades(id)` |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `strike_price` | `numeric` | Option strike |
| `option_type` | `text` | Call/Put |
| `underlying_price` | `numeric` | Underlying price |
| `implied_volatility` | `numeric` | IV percentage |
| `days_to_expiry` | `integer` | DTE |
| `greeks` | `jsonb` | Computed Greeks |

Indexes:

- `(user_id, option_type)`
- `(user_id, days_to_expiry)`

### Table: `goals`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Goal ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `title` | `text not null` | Goal name |
| `metric` | `text not null` | Goal metric |
| `timeframe` | `text not null` | this_month/all_time |
| `target` | `numeric not null` | Target value |
| `created_at` | `timestamptz` | Creation timestamp |
| `updated_at` | `timestamptz` | Update timestamp |

Indexes:

- `(user_id, created_at desc)`

### Table: `custom_strategies`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Strategy ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `name` | `text not null` | Strategy name |
| `created_at` | `timestamptz` | Creation timestamp |

Unique index:

- `(user_id, lower(name))`

### Table: `ai_wallets`

| Column | Type | Description |
|---|---|---|
| `user_id` | `uuid primary key` | FK to `auth.users(id)` |
| `token_balance` | `bigint not null default 0` | Remaining AI tokens |
| `tokens_purchased` | `bigint not null default 0` | Lifetime purchased tokens |
| `tokens_used` | `bigint not null default 0` | Lifetime used tokens |
| `last_recharge` | `jsonb` | Last recharge metadata |
| `updated_at` | `timestamptz` | Update timestamp |

Constraints:

- `token_balance >= 0`
- `tokens_purchased >= 0`
- `tokens_used >= 0`

Wallet write rules:

- Frontend may read wallet balance through API or RLS read policy.
- Frontend must not update wallet rows directly.
- Backend should update wallet balance and insert transaction rows in the same database transaction.
- Debit operations must prevent race conditions and negative balances.

Recommended debit pattern:

```sql
update public.ai_wallets
set
  token_balance = token_balance - :tokens,
  tokens_used = tokens_used + :tokens,
  updated_at = now()
where user_id = :user_id
  and token_balance >= :tokens;
```

The backend should confirm exactly one row was updated before treating the debit as successful.

### Table: `ai_wallet_transactions`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Transaction ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `type` | `text not null` | credit/debit/adjustment |
| `tokens` | `bigint not null` | Token amount |
| `source` | `text` | claude_usage, razorpay, admin_adjustment |
| `payment_id` | `text` | Razorpay payment ID if credit |
| `order_id` | `text` | Razorpay order ID if credit |
| `metadata` | `jsonb` | Extra details |
| `created_at` | `timestamptz` | Creation timestamp |

Indexes:

- `(user_id, created_at desc)`
- Unique partial index on `payment_id` where `payment_id is not null`

### Table: `payment_orders`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Internal order ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `package_id` | `text not null` | AI package ID |
| `razorpay_order_id` | `text unique not null` | Razorpay order ID |
| `razorpay_payment_id` | `text` | Razorpay payment ID |
| `amount_inr` | `integer not null` | Amount in INR |
| `tokens` | `bigint not null` | Tokens to credit |
| `status` | `text not null` | created/paid/failed/credited |
| `created_at` | `timestamptz` | Creation timestamp |
| `updated_at` | `timestamptz` | Update timestamp |

Indexes:

- `(user_id, created_at desc)`
- `(razorpay_order_id)`
- `(razorpay_payment_id)`

Payment rules:

- `razorpay_order_id` must be unique.
- `razorpay_payment_id` should be unique when present.
- Payment order status should move forward only: `created -> paid -> credited` or `created -> failed/cancelled`.
- Token credit should be idempotent.
- A verified payment must create exactly one wallet credit transaction.

### Table: `ai_conversations`

Optional future table if chat history becomes persistent.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Conversation ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `title` | `text` | Optional generated title |
| `created_at` | `timestamptz` | Creation timestamp |
| `updated_at` | `timestamptz` | Update timestamp |

Indexes:

- `(user_id, updated_at desc)`

### Table: `ai_messages`

Optional future table if chat history becomes persistent.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Message ID |
| `conversation_id` | `uuid not null` | FK to `ai_conversations(id)` |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `role` | `text not null` | user/assistant/system |
| `content` | `text not null` | Message content |
| `tokens_used` | `integer` | Tokens used for this response |
| `metadata` | `jsonb` | Model and request metadata without secrets |
| `created_at` | `timestamptz` | Creation timestamp |

Indexes:

- `(user_id, created_at desc)`
- `(conversation_id, created_at)`

### Table: `audit_events`

Optional future table for sensitive operational events.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Event ID |
| `user_id` | `uuid` | Related user, if any |
| `event_type` | `text not null` | payment_verified, wallet_debited, import_confirmed, etc. |
| `entity_type` | `text` | wallet, payment_order, import, trade |
| `entity_id` | `text` | Related ID |
| `metadata` | `jsonb` | Non-secret event metadata |
| `created_at` | `timestamptz` | Creation timestamp |

Indexes:

- `(user_id, created_at desc)`
- `(event_type, created_at desc)`

### Table: `imports`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid primary key` | Import batch ID |
| `user_id` | `uuid not null` | FK to `auth.users(id)` |
| `file_name` | `text` | Original filename |
| `file_type` | `text` | csv/xlsx/xls/pdf |
| `row_count` | `integer` | Parsed trade count |
| `status` | `text` | parsed/confirmed/failed |
| `error_message` | `text` | Failure reason |
| `created_at` | `timestamptz` | Creation timestamp |

Indexes:

- `(user_id, created_at desc)`

## Normalized RLS Rules

For every user-owned normalized table:

- Select: `auth.uid() = user_id`
- Insert: `auth.uid() = user_id`
- Update: `auth.uid() = user_id`
- Delete: `auth.uid() = user_id`

Special cases:

- `ai_wallets`, `ai_wallet_transactions`, and `payment_orders` should generally be written by backend service role only.
- Users may read their own wallet and transaction rows.
- Users should not directly update wallet balances from the frontend.

Example normalized table policy:

```sql
alter table public.trades enable row level security;

create policy "Users can manage their own trades"
on public.trades
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

Example wallet read-only policy:

```sql
alter table public.ai_wallets enable row level security;

create policy "Users can read their own AI wallet"
on public.ai_wallets
for select
to authenticated
using ((select auth.uid()) = user_id);
```

Do not create frontend update policies for wallet balances.

## Data Validation Rules

Backend and database validation should agree on these invariants:

- Trade `quantity`, `entry_price`, and `exit_price` must be positive.
- Trade `date` must be present.
- Trade `asset` must be present.
- `brokerage` should default to `0`.
- `pnl` should include brokerage.
- Goal `target` must be non-negative.
- AI wallet balances must never be negative.
- Razorpay signatures must be verified with `RAZORPAY_KEY_SECRET`.
- Payment package ID must match the package used when the order was created.
- Imported trades must be previewed before being committed.

## Backup, Export, and Delete Policy

Export:

- Users should be able to export trades as CSV.
- Users should be able to create JSON backups of local journal state.
- Future cloud export should include trades, goals, strategies, settings, invoices, and wallet summary.

Delete:

- Deleting a trade should remove only that user's trade.
- Clearing local data should not delete cloud data unless explicitly confirmed.
- Deleting a Supabase user should cascade user-owned rows.
- Payment/audit records may need retention for reconciliation; do not hard-delete without a policy decision.

Recovery:

- Keep `journal_user_state` during normalized migration as a fallback.
- Backup files should include schema/version metadata.
- Restore should validate backup shape before replacing current data.

## Migration Strategy

1. Keep `journal_user_state` as the source of truth until normalized tables are ready.
2. Add normalized tables alongside current JSONB table.
3. Backfill normalized tables from `journal_user_state.payload`.
4. Run frontend/backend in dual-write mode for a short migration period.
5. Validate normalized analytics against JSON payload analytics.
6. Switch reads to normalized tables.
7. Keep `journal_user_state` as backup/export state until confidence is high.

Migration acceptance criteria:

- Counts match between JSON trades and normalized `trades`.
- Total P&L matches before and after migration.
- Strategy-level analytics match before and after migration.
- Wallet balance and credited payments are preserved.
- RLS prevents one user from reading another user's migrated rows.
- Rollback path is documented before switching reads.

## Open Schema Questions

- Should AI conversations be stored permanently or remain session/local only?
- Should recurring subscriptions remain in scope, or should billing stay prepaid-token-only?
- Should imported source files ever be stored for auditability?
- Should trade screenshots be added in v1 or deferred?
- Should admin support exist, and if so, should it use a separate admin app?
- What retention policy should apply to payment and audit events?

## Backend Schema Rules for AI Agents

- Do not remove `journal_user_state` without a migration plan.
- Do not expose service role keys to frontend code.
- Do not let frontend directly credit AI tokens.
- Do not store raw payment instruments.
- Do not make data public by disabling RLS.
- Add indexes whenever a feature filters by user/date/strategy/market/payment ID.
- Update this document and `supabase-schema.sql` whenever schema changes.
