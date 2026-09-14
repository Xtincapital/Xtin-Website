// Single source of truth for frontend environment configuration.

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

// No hardcoded fallback on purpose: this used to default to a real project's
// URL and anon key committed in source (a leaked-secret vector — see
// documents/SUPABASE-AUDIT.md §10). VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// must be set in every environment (see .env.example); an unset value fails
// loudly via Supabase's own client constructor instead of silently pointing
// at a project that may not even exist anymore.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// DEV-ONLY: bypass sign-in locally with a mock user. Never true in a deployed env.
export const AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';
