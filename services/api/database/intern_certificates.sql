-- =====================================================
-- Intern Certificate Verification System
-- for Xtin Capital Internship Certificates
-- =====================================================
-- Run this in your Supabase SQL Editor to create the
-- certificate tables, indexes, RLS policies, and helpers.

-- =====================================================
-- 1. INTERN CERTIFICATES TABLE
-- =====================================================
-- Stores each issued internship certificate with a unique
-- Certificate ID (e.g., XC-2026-A8F9K) and intern details.
CREATE TABLE IF NOT EXISTS intern_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL UNIQUE,                       -- e.g. XC-2026-A8F9K
    intern_name TEXT NOT NULL CHECK (LENGTH(TRIM(intern_name)) > 0),
    intern_role TEXT NOT NULL CHECK (LENGTH(TRIM(intern_role)) > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,   -- Updated on each successful verification
    metadata JSONB DEFAULT '{}'::jsonb,                       -- Flexible extras (department, mentor, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure end_date is not before start_date
    CONSTRAINT check_dates CHECK (end_date >= start_date),
    -- Ensure certificate_id follows XC-YYYY-XXXXX format
    CONSTRAINT check_certificate_id_format 
        CHECK (certificate_id ~ '^XC-\d{4}-[A-Z0-9]{5}$')
);

-- =====================================================
-- 2. INDEXES
-- =====================================================
-- Primary lookup is by certificate_id (URL-based verification)
CREATE INDEX IF NOT EXISTS idx_intern_certificates_certificate_id 
    ON intern_certificates(certificate_id);

-- Index for listing/filtering (admin use)
CREATE INDEX IF NOT EXISTS idx_intern_certificates_issued_at 
    ON intern_certificates(issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_intern_certificates_not_revoked 
    ON intern_certificates(certificate_id) 
    WHERE is_revoked = FALSE;

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE intern_certificates ENABLE ROW LEVEL SECURITY;

-- Public policy: Anyone can verify a certificate (read-only)
CREATE POLICY "Public certificate verification" ON intern_certificates
    FOR SELECT
    USING (is_revoked = FALSE);

-- Authenticated admin policy: Full access for admin users
-- (Assumes an 'admins' table or a role check in app logic)
CREATE POLICY "Admin full access to certificates" ON intern_certificates
    FOR ALL
    USING (
        auth.role() = 'service_role' 
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Service role can do everything (for admin backend endpoints)
CREATE POLICY "Service role full access" ON intern_certificates
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 4. AUTO-GENERATE CERTIFICATE ID FUNCTION
-- =====================================================
-- Generates a unique certificate ID in the format:
-- XC-{YEAR}-{5_RANDOM_ALPHANUMERIC}
CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    year_part TEXT;
    random_part TEXT;
    new_id TEXT;
    done BOOLEAN;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    done := FALSE;
    
    WHILE NOT done LOOP
        -- Generate 5 random alphanumeric characters (A-Z, 0-9)
        random_part := '';
        FOR i IN 1..5 LOOP
            random_part := random_part || 
                substr(
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                    floor(random() * 36)::int + 1,
                    1
                );
        END LOOP;
        
        new_id := 'XC-' || year_part || '-' || random_part;
        
        -- Check uniqueness
        IF NOT EXISTS (SELECT 1 FROM intern_certificates WHERE certificate_id = new_id) THEN
            done := TRUE;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$;

-- =====================================================
-- 5. TRIGGER: Update updated_at on row modification
-- =====================================================
CREATE OR REPLACE FUNCTION update_intern_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_intern_certificates_updated_at ON intern_certificates;
CREATE TRIGGER trigger_intern_certificates_updated_at
    BEFORE UPDATE ON intern_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_intern_certificates_updated_at();

-- =====================================================
-- 6. SEED DATA (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment to insert test certificate records
/*
INSERT INTO intern_certificates (certificate_id, intern_name, intern_role, start_date, end_date)
VALUES 
    (generate_certificate_id(), 'Rahul Sharma', 'Financial Analysis Intern', '2025-06-01', '2025-08-31'),
    (generate_certificate_id(), 'Priya Patel', 'Software Development Intern', '2025-07-01', '2025-09-30'),
    (generate_certificate_id(), 'Amit Kumar', 'Marketing Intern', '2025-05-15', '2025-08-15');
*/

-- =====================================================
-- 7. USEFUL QUERIES
-- =====================================================
-- Verify a certificate:
-- SELECT * FROM intern_certificates 
-- WHERE certificate_id = 'XC-2026-A8F9K' AND is_revoked = FALSE;

-- Get all valid certificates:
-- SELECT * FROM intern_certificates WHERE is_revoked = FALSE ORDER BY issued_at DESC;

-- Revoke a certificate:
-- UPDATE intern_certificates SET is_revoked = TRUE 
-- WHERE certificate_id = 'XC-2026-A8F9K';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this in Supabase SQL Editor
-- 2. RLS policies allow public read for non-revoked certs
-- 3. Use generate_certificate_id() for auto-ID generation
-- 4. Admin writes should use service_role key from backend

