-- ═══════════════════════════════════════════════════════════════════════
-- BROKER LINK REVIEW — a person confirms whose client code it is.
--
-- A customer's link request starts 'pending' (0019) and is never read until an
-- admin approves it, because nothing yet proves the customer owns the client
-- code they typed in. These columns record who decided, when, and why.
--
--   • approved — status becomes 'active' (and verified_at / verification_method are set)
--   • rejected — status becomes 'revoked'. An admin can also reject an active
--                link to cut off access; the note is shown to the customer.
--
-- Written and read only by the backend (service role). Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.broker_links add column if not exists review_outcome text check (review_outcome in ('approved', 'rejected'));
alter table public.broker_links add column if not exists reviewed_by text;     -- the admin's email
alter table public.broker_links add column if not exists reviewed_at timestamptz;
alter table public.broker_links add column if not exists review_note text;     -- shown to the customer when rejected
