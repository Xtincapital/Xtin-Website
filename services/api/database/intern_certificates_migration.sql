-- =====================================================
-- Migration: Add last_verified_at to intern_certificates
-- =====================================================
-- Run this in Supabase SQL Editor after the base schema
-- has been applied. This is a NON-DESTRUCTIVE migration.
-- =====================================================

-- Add last_verified_at column if it doesn't already exist
ALTER TABLE intern_certificates 
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run the following to confirm the column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'intern_certificates' 
-- AND column_name = 'last_verified_at';

