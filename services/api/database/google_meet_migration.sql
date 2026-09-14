-- =====================================================
-- GOOGLE MEET CONSULTATION MIGRATION
-- Replaces the in-app (Daily.co) video calls with
-- advisor-provided Google Meet links + scheduled time.
--
-- Run this once against the Supabase Postgres database.
-- It is idempotent (safe to run multiple times).
-- =====================================================

-- 1) Advisors: default/base Google Meet room link
ALTER TABLE advisors
    ADD COLUMN IF NOT EXISTS google_meet_link TEXT;

-- 2) Advisor applications: capture the link at onboarding time
ALTER TABLE join_as_advisory_forms
    ADD COLUMN IF NOT EXISTS google_meet_link TEXT;

-- 3) Bookings (re-using the existing video_call_sessions table):
--    a) Store the Google Meet link the advisor confirms per booking
ALTER TABLE video_call_sessions
    ADD COLUMN IF NOT EXISTS meeting_link TEXT;

--    b) Daily.co rooms are gone, so these are no longer required
ALTER TABLE video_call_sessions
    ALTER COLUMN room_name DROP NOT NULL;
ALTER TABLE video_call_sessions
    ALTER COLUMN room_url DROP NOT NULL;

--    c) Allow a "pending" state: customer paid, advisor has not yet
--       confirmed the meeting link + time.
ALTER TABLE video_call_sessions
    DROP CONSTRAINT IF EXISTS video_call_sessions_status_check;
ALTER TABLE video_call_sessions
    ADD CONSTRAINT video_call_sessions_status_check CHECK (status IN (
        'pending',     -- paid, awaiting advisor to set Google Meet link + time
        'scheduled',   -- advisor confirmed link + time
        'in_progress', -- (legacy) meeting started
        'completed',   -- meeting finished
        'cancelled',   -- cancelled by either side
        'no_show',     -- client did not join
        'failed'
    ));
