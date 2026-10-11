// Auth middleware — Phase 12: backend-minted JWT acceptance removed. This
// app is pre-launch (no production users yet), so there was no need for a
// staged/fallback rollout — Supabase session tokens are now the ONLY
// credential this backend accepts. See documents/migration/PLAN.md's
// Phase 12 entry for the full audit this removal was based on.
import { createClient } from "@supabase/supabase-js";
import supabase from "../supabase/index.js";

// Login tokens are checked locally with getClaims(): the project signs them
// with an ES256 key, so supabase-js verifies the signature against the
// cached public keys (JWKS) instead of calling Supabase Auth on every
// request. (getUser() added a ~250 ms round trip to each API call; getClaims
// falls back to it by itself for any older HS256 token.)
let verifier: ReturnType<typeof createClient> | null = null;
function tokenVerifier() {
    if (!verifier) {
        verifier = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
    }
    return verifier;
}

// The legacy profile row barely changes, so keep it for a few minutes
// instead of querying it on every request.
const PROFILE_TTL_MS = 5 * 60 * 1000;
type ProfileRow = { id: string; email: string | null; first_name: string | null; last_name: string | null; phone_number: string | null } | null;
const profileCache = new Map<string, { row: ProfileRow; at: number }>();

/** Forget a cached profile row (after a profile update or account deletion). */
export function forgetCachedProfile(authId: string) {
    profileCache.delete(authId);
}

async function profileFor(authId: string): Promise<ProfileRow> {
    const hit = profileCache.get(authId);
    if (hit && Date.now() - hit.at < PROFILE_TTL_MS) return hit.row;
    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone_number')
        .eq('auth_id', authId)
        .maybeSingle();
    if (error) {
        console.error('Error fetching custom user:', error.message);
        return hit?.row ?? null; // don't cache a failure
    }
    // Only cache a found row: a brand-new account's row is created by the
    // signup sync, and must be picked up as soon as it exists.
    if (data) profileCache.set(authId, { row: data, at: Date.now() });
    if (profileCache.size > 5000) profileCache.delete(profileCache.keys().next().value as string);
    return data;
}

export const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.error('No token provided in Authorization header');
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.error('Supabase environment variables not configured');
            return res.status(500).json({
                error: "Authentication service configuration error"
            });
        }

        const { data, error: authError } = await tokenVerifier().auth.getClaims(token);
        const claims = data?.claims as Record<string, any> | undefined;

        if (authError || !claims?.sub) {
            const message = authError?.message || 'No user in token';
            if (/expired/i.test(message)) {
                return res.status(401).json({
                    error: "Token expired",
                    message: "Please login again",
                    code: 'TOKEN_EXPIRED'
                });
            }
            console.error('Supabase auth error:', message);
            return res.status(401).json({
                error: "Invalid token or user not found.",
                details: message,
                code: 'INVALID_TOKEN'
            });
        }

        const customUser = await profileFor(claims.sub);
        const meta = claims.user_metadata || {};

        req.user = {
            userId: customUser?.id || claims.sub,
            authId: claims.sub,
            email: claims.email,
            first_name: customUser?.first_name || meta.first_name,
            last_name: customUser?.last_name || meta.last_name,
            phone_number: customUser?.phone_number || meta.phone,
        };

        next();
    } catch (err) {
        console.error('Authentication error:', err.message);

        if (err.message?.includes('JWT') || err.message?.includes('jwt')) {
            return res.status(401).json({
                error: "Invalid or malformed token",
                message: "Token signature is invalid or token format is incorrect",
                code: 'MALFORMED_TOKEN'
            });
        }

        res.status(401).json({
            error: "Authentication failed",
            message: err.message,
            code: 'AUTH_ERROR'
        });
    }
};

export const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: `Forbidden. You do not have access. Only ${roles} have access` });
    }
    next();
};

// Admins are identified by email. ADMIN_EMAILS is a comma-separated list set
// on the server; xtincapital@gmail.com is always included, matching the
// frontend's admin pages (AdminCertificates.tsx). Use after `authenticate`.
export const adminEmails = () =>
    ['xtincapital@gmail.com', ...(process.env.ADMIN_EMAILS || '').split(',')]
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

export const requireAdmin = (req, res, next) => {
    const email = req.user?.email?.toLowerCase();
    if (!email || !adminEmails().includes(email)) {
        return res.status(403).json({ error: "Forbidden. Admin access only." });
    }
    next();
};
