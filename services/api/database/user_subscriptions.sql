-- ═══════════════════════════════════════════════════════════════════════
-- USER BUNDLES & SUBSCRIPTIONS TABLE
-- Stores user subscriptions to Xtin Capital bundle passes & individual products
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    auth_id TEXT,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    payment_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    user_email TEXT,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subs_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_auth_id ON public.user_subscriptions(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON public.user_subscriptions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON public.user_subscriptions
    FOR SELECT
    USING (auth_id = auth.uid()::text OR user_id = current_setting('app.user_id', true));

-- RLS: Writes are handled by service role (backend)
DROP POLICY IF EXISTS "Service role can manage user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage user subscriptions"
    ON public.user_subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);
