# Certificate Verification Fix

## Problem
Certificate verification does not properly distinguish between:
- Valid certificate (should show verified ✅)
- Revoked certificate (should show REVOKED explicitly)
- Non-existent certificate (should show not found)

Currently both revoked and non-existent certs return "Certificate Not Found / Invalid"

## Fix Steps

- [x] **Step 1: Fix Vite proxy target** — Changed port 5002 → 5000 in `vite.config.js` for local dev

- [x] **Step 2: Fix backend `verifyCertificate` controller** — 
  - Query cert in two steps: first find by ID using `maybeSingle()`, then check `is_revoked`
  - Return 410 (Gone) with `code: 'CERT_REVOKED'` for revoked certs
  - Return 404 with `code: 'CERT_NOT_FOUND'` for non-existent certs
  - Return 200 with full intern details for valid certs
  - Added `last_verified_at` timestamp update on successful verification
  - Added `HTTP_STATUS.GONE` constant to constants

- [x] **Step 3: Add DB migration** — Added `last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL` column to `intern_certificates` table schema

- [x] **Step 4: Update `certificateService.js`** — Added support for distinct statuses:
  - `'verified'` — certificate is valid
  - `'revoked'` — certificate exists but revoked (code: CERT_REVOKED)
  - `'not_found'` — certificate ID doesn't exist (code: CERT_NOT_FOUND or 404)
  - `'error'` — network/server error fallback

- [x] **Step 5: Update `VerifyCertificate.jsx`** — Added four distinct UI states:
  - ✅ Verified (emerald/green) — shows full intern details
  - 🚫 Revoked (amber/orange) — shows revoked badge with explanation
  - ❌ Not Found (red) — shows not-found error
  - ⚠️ Error (red) — shows generic verification error

- [x] **Step 6: Create migration SQL file** — Created `backend/database/intern_certificates_migration.sql` with non-destructive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statement

- [ ] **Step 7: Deploy** — Apply backend changes to Render, frontend to Vercel
    - Run `backend/database/intern_certificates_migration.sql` in Supabase SQL Editor


