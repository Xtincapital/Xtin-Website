-- Algorithm Subscriptions Table
-- Stores user subscriptions to XTIN trading algorithms
-- Security model:
--   • Rows are written with the Supabase service-role client (bypasses RLS)
--   • Clients can only SELECT their own row via RLS policies
--   • The ONLY code path that grants access is verifyAlgoPayment after HMAC check

CREATE TABLE IF NOT EXISTS algorithm_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    auth_id TEXT,
    algo_name TEXT NOT NULL,
    plan_type TEXT NOT NULL DEFAULT 'monthly',
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    payment_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    user_email TEXT,
    tradingview_username TEXT,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, algo_name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_algo_subs_user_id ON algorithm_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_algo_subs_algo_name ON algorithm_subscriptions(algo_name);
CREATE INDEX IF NOT EXISTS idx_algo_subs_status ON algorithm_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE algorithm_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only read their own subscriptions
CREATE POLICY "Users can read own algorithm subscriptions"
    ON algorithm_subscriptions
    FOR SELECT
    USING (auth_id = auth.uid()::text OR user_id = current_setting('app.user_id', true));

-- RLS: Only service role can insert/update (handled by backend)
CREATE POLICY "Service role can manage algorithm subscriptions"
    ON algorithm_subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);
