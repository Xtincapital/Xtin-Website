-- =====================================================
-- VIDEO CALLS SCHEMA FOR XTIN CAPITAL
-- Integration with Daily.co API
-- =====================================================

-- Video Call Sessions Table
CREATE TABLE IF NOT EXISTS video_call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    
    -- Daily.co Room Details
    room_name VARCHAR(255) NOT NULL UNIQUE, -- Daily.co room name
    room_url TEXT NOT NULL, -- Full Daily.co room URL
    daily_room_id VARCHAR(255), -- Daily.co internal room ID
    
    -- Call Details
    scheduled_at TIMESTAMPTZ, -- When call is scheduled (NULL for instant calls)
    started_at TIMESTAMPTZ, -- When call actually started
    ended_at TIMESTAMPTZ, -- When call ended
    duration_minutes INTEGER DEFAULT 0, -- Call duration in minutes
    
    -- Call Status
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',  -- Call is booked for future
        'in_progress', -- Call is currently active
        'completed',   -- Call ended successfully
        'cancelled',   -- Call was cancelled
        'no_show',     -- User didn't join
        'failed'       -- Technical failure
    )),
    
    -- Call Type & Payment
    call_type VARCHAR(20) DEFAULT 'video' CHECK (call_type IN ('video', 'audio')),
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending',
        'completed',
        'refunded'
    )),
    
    -- Recording (if enabled)
    recording_url TEXT,
    recording_enabled BOOLEAN DEFAULT FALSE,
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Participants (for tracking who joined)
CREATE TABLE IF NOT EXISTS call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES video_call_sessions(id) ON DELETE CASCADE,
    
    -- Participant Details
    participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('user', 'advisor')),
    participant_id UUID NOT NULL, -- user_id or advisor_id
    
    -- Join/Leave Times
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    
    -- Call Quality Metrics
    connection_quality VARCHAR(20) CHECK (connection_quality IN ('excellent', 'good', 'poor')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Events (for detailed tracking)
CREATE TABLE IF NOT EXISTS call_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES video_call_sessions(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL, -- 'participant_joined', 'screenshare_started', 'recording_started', etc.
    event_data JSONB, -- Additional event metadata
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_video_sessions_user ON video_call_sessions(user_id);
CREATE INDEX idx_video_sessions_advisor ON video_call_sessions(advisor_id);
CREATE INDEX idx_video_sessions_status ON video_call_sessions(status);
CREATE INDEX idx_video_sessions_scheduled ON video_call_sessions(scheduled_at);
CREATE INDEX idx_call_participants_session ON call_participants(session_id);
CREATE INDEX idx_call_events_session ON call_events(session_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_video_call_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_call_sessions_timestamp
    BEFORE UPDATE ON video_call_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_video_call_timestamp();

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- Get all scheduled calls for an advisor
-- SELECT * FROM video_call_sessions 
-- WHERE advisor_id = 'advisor-uuid' AND status = 'scheduled' 
-- ORDER BY scheduled_at ASC;

-- Get call history for a user
-- SELECT vcs.*, a.full_name as advisor_name 
-- FROM video_call_sessions vcs 
-- JOIN advisors a ON vcs.advisor_id = a.id 
-- WHERE vcs.user_id = 'user-uuid' AND vcs.status = 'completed' 
-- ORDER BY vcs.ended_at DESC;

-- Get active calls
-- SELECT * FROM video_call_sessions 
-- WHERE status = 'in_progress';
