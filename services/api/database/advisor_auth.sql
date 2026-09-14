-- Add authentication fields to advisors table
ALTER TABLE advisors 
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index on auth_id
CREATE INDEX IF NOT EXISTS advisors_auth_id_idx ON advisors(auth_id);

-- Create advisor accounts in Supabase Auth and link them
-- You'll need to create these accounts via Supabase dashboard or auth API
-- For each advisor, create auth account then run:
-- UPDATE advisors SET auth_id = 'AUTH_ID_FROM_SUPABASE' WHERE email = 'advisor@email.com';
