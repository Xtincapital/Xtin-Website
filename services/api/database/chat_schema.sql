-- =====================================================
-- Chat System Database Schema for Xtin Capital
-- =====================================================
-- This schema creates tables for the advisor-user chat system
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CHAT CONVERSATIONS TABLE
-- =====================================================
-- Stores conversation threads between users and advisors
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one conversation per user-advisor pair
    CONSTRAINT unique_user_advisor_conversation UNIQUE (user_id, advisor_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_advisor_id ON chat_conversations(advisor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON chat_conversations(last_message_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view their own conversations" ON chat_conversations
    FOR SELECT
    USING (auth.uid() IN (
        SELECT auth_id FROM users WHERE id = user_id
    ));

-- Policy: Users can create conversations
CREATE POLICY "Users can create conversations" ON chat_conversations
    FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM users WHERE id = user_id
    ));

-- Policy: Allow updates to last_message_at
CREATE POLICY "Allow conversation updates" ON chat_conversations
    FOR UPDATE
    USING (true);

-- =====================================================
-- 2. CHAT MESSAGES TABLE
-- =====================================================
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- Can be user_id or advisor_id
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'advisor')),
    message TEXT NOT NULL CHECK (LENGTH(TRIM(message)) > 0 AND LENGTH(message) <= 5000),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON chat_messages(is_read) WHERE is_read = FALSE;

-- Add RLS (Row Level Security) policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in their conversations
CREATE POLICY "Users can view their conversation messages" ON chat_messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE auth.uid() IN (
                SELECT auth_id FROM users WHERE id = user_id
            )
        )
    );

-- Policy: Users can send messages to their conversations
CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE auth.uid() IN (
                SELECT auth_id FROM users WHERE id = user_id
            )
        )
        AND sender_type = 'user'
    );

-- Policy: Allow marking messages as read
CREATE POLICY "Allow message updates" ON chat_messages
    FOR UPDATE
    USING (true);

-- =====================================================
-- 3. FUNCTIONS AND TRIGGERS
-- =====================================================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_conversations
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_messages
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment below to insert sample data for testing
/*
-- Insert sample conversation (replace with real user/advisor IDs)
INSERT INTO chat_conversations (user_id, advisor_id, last_message_at)
VALUES (
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM advisors LIMIT 1),
    NOW()
);

-- Insert sample messages
INSERT INTO chat_messages (conversation_id, sender_id, sender_type, message, is_read)
VALUES 
    (
        (SELECT id FROM chat_conversations LIMIT 1),
        (SELECT user_id FROM chat_conversations LIMIT 1),
        'user',
        'Hello, I would like to discuss my investment portfolio.',
        false
    ),
    (
        (SELECT id FROM chat_conversations LIMIT 1),
        (SELECT advisor_id FROM chat_conversations LIMIT 1),
        'advisor',
        'Hello! I''d be happy to help you with your portfolio. What specific areas would you like to focus on?',
        true
    );
*/

-- =====================================================
-- 5. USEFUL QUERIES FOR MONITORING
-- =====================================================
-- Get total conversations count
-- SELECT COUNT(*) FROM chat_conversations;

-- Get total messages count
-- SELECT COUNT(*) FROM chat_messages;

-- Get unread messages count for a user
-- SELECT COUNT(*) FROM chat_messages 
-- WHERE conversation_id IN (SELECT id FROM chat_conversations WHERE user_id = 'USER_ID_HERE')
-- AND sender_type = 'advisor' 
-- AND is_read = false;

-- Get recent conversations with message counts
-- SELECT 
--     c.*,
--     COUNT(m.id) as message_count
-- FROM chat_conversations c
-- LEFT JOIN chat_messages m ON c.id = m.conversation_id
-- GROUP BY c.id
-- ORDER BY c.last_message_at DESC
-- LIMIT 20;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this script in your Supabase SQL Editor
-- 2. Ensure users and advisors tables exist before running
-- 3. RLS policies are enabled for security
-- 4. Indexes are created for optimal query performance
-- 5. Update DATABASE_SCHEMA_README.md after running this
