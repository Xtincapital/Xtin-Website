// Auth middleware — Phase 12: backend-minted JWT acceptance removed. This
// app is pre-launch (no production users yet), so there was no need for a
// staged/fallback rollout — Supabase session tokens are now the ONLY
// credential this backend accepts. See documents/migration/PLAN.md's
// Phase 12 entry for the full audit this removal was based on.
import supabase, { userClientFromToken } from "../supabase/index.js";

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

        const userSupabase = userClientFromToken(token);

        const { data: { user }, error: authError } = await userSupabase.auth.getUser();

        if (authError || !user) {
            console.error('Supabase auth error:', authError?.message, 'User:', user);

            if (authError?.message?.includes('JWT expired') || authError?.message?.includes('jwt expired')) {
                return res.status(401).json({
                    error: "Token expired",
                    message: "Please login again",
                    code: 'TOKEN_EXPIRED'
                });
            }

            return res.status(401).json({
                error: "Invalid token or user not found.",
                details: authError?.message,
                code: 'INVALID_TOKEN'
            });
        }

        // Fetch additional user details from our custom users table
        const { data: customUser, error: customError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, phone_number')
            .eq('auth_id', user.id)
            .single();

        if (customError && customError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching custom user:', customError.message);
        }

        req.user = {
            userId: customUser?.id || user.id,
            authId: user.id,
            email: user.email,
            first_name: customUser?.first_name || user.user_metadata?.first_name,
            last_name: customUser?.last_name || user.user_metadata?.last_name,
            phone_number: customUser?.phone_number || user.user_metadata?.phone,
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
