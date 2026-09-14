// Backend\middlewares\auth.mjs
import jwt from "jsonwebtoken";
import supabase, { userClientFromToken } from "../supabase/index.js";
import { config } from "../constants/config.js";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

export const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.error('No token provided in Authorization header');
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // 1) Try verifying our own backend JWT first
    try {
        // Explicitly specify the algorithm and validate JWT_SECRET
        if (!config.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }
        
        const payload = jwt.verify(token, config.JWT_SECRET, { 
            algorithms: ['HS256'],
            clockTolerance: 30 // Allow 30 seconds clock drift
        });
        
        // Check if token has been blacklisted (user logged out)
        const tokenId = payload.jti || `${payload.userId}_${payload.iat}`;
        if (isTokenBlacklisted(tokenId)) {
            console.warn('Blacklisted token used by:', payload.email);
            return res.status(401).json({ 
                error: "Token has been invalidated", 
                message: "Please login again",
                code: 'TOKEN_BLACKLISTED'
            });
        }
        
        req.user = {
            userId: payload.userId,
            authId: payload.authId,
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            phone_number: payload.phone_number,
        };
        console.log('Backend JWT verification successful for user:', payload.email);
        return next();
    } catch (jwtErr) {
        console.warn('Backend JWT verify failed, will try Supabase:', jwtErr.message);
        
        // If it's a token expired error, don't try Supabase fallback
        if (jwtErr.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: "Token expired", 
                message: "Please login again",
                code: 'TOKEN_EXPIRED'
            });
        }
    }

    // 2) Fall back to validating a raw Supabase access token (OAuth flows)
    try {
        console.log('Authenticating via Supabase with bearer token...');
        
        // Validate environment variables
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
            
            // Check for specific Supabase JWT errors
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

        console.log('Supabase authentication successful for user:', user.email);
        next();
    } catch (err) {
        console.error('Authentication error (Supabase fallback):', err.message);
        
        // Provide specific error messages
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
