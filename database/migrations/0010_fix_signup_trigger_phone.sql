-- 0010 — Fix "Database error saving new user" on signup.
--
-- Cause: the signup form's phone field is optional, and the frontend sent
-- a blank phone as '' (empty string) rather than null. handle_new_user()
-- copied that '' straight into public.users.phone_number, which is UNIQUE.
-- The first account created without a phone stored ''; every later signup
-- without a phone then hit a unique violation inside this trigger, which
-- makes Supabase Auth roll back the whole signup and return the generic
-- "Database error saving new user". (NULLs never collide under a unique
-- constraint; empty strings do.)
--
-- Fix, in the trigger (authoritative — covers every client, not just the
-- web app's own signup form):
--   1. Blank/whitespace phone becomes NULL.
--   2. If a real phone number is already on another profile, create the
--      profile without it instead of blocking account creation — phone is
--      optional profile data, never worth failing a signup over.
--
-- `create or replace` keeps the function's identity, so the existing
-- on_auth_user_created trigger picks this up with no trigger changes.
--
-- Deliberately NOT included: rewriting the existing '' row(s) to NULL.
-- That would modify existing user data, and it isn't needed — new rows now
-- get NULL, which never collides with the leftover ''. Optional one-off
-- tidy-up if wanted, run by hand:
--   update public.users set phone_number = null where trim(phone_number) = '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_phone text := nullif(trim(new.raw_user_meta_data ->> 'phone_number'), '');
begin
  begin
    insert into public.users (auth_id, email, first_name, last_name, phone_number)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'last_name',
      v_phone
    )
    on conflict (auth_id) do nothing;
  exception when unique_violation then
    insert into public.users (auth_id, email, first_name, last_name, phone_number)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'last_name',
      null
    )
    on conflict (auth_id) do nothing;
  end;
  return new;
end;
$$;
